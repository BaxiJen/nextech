---
title: "Speculative Decoding em Produção: Como Acelerar Inferência de LLMs em 2-3x Sem Trocar de Modelo"
description: "Um modelo de 70 bilhões de parâmetros gera texto um token por vez, e cada token exige uma passada completa pelos pesos do modelo. A GPU fica subutilizada. Speculative decoding usa um modelo rascunho pequeno para propor múltiplos tokens que o modelo grande verifica em paralelo, entregando 2-3x de speedup com qualidade matematicamente idêntica. Este guia decompõe o algoritmo original de Leviathan et al. (2023), compara EAGLE-3, Medusa e n-gram, mostra benchmarks reais de produção no vLLM e TensorRT-LLM, e explica por que essa técnica deixou de ser otimização experimental para virar padrão de deploy em 2026."
date: "2026-08-27"
author: "Leonardo Camilo"
authorRole: "CEO e Co-fundador na BaXiJen"
tags: ["speculative decoding", "LLM", "inferência", "EAGLE", "Medusa", "vLLM", "TensorRT-LLM", "throughput", "latência", "produção", "GPU", "on-premise", "IA brasileira", "BaXiJen"]
featured: true
image: "/blog/speculative-decoding-cover.svg"
imageAlt: "Diagrama do pipeline de speculative decoding: à esquerda, o modelo rascunho (small, verde) propõe 5 tokens em sequência; ao centro, o modelo alvo (large, azul) verifica todos os 5 em uma única passada paralela; à direita, 4 tokens aceitos (checkmark verde) e 1 rejeitado (X vermelho). Abaixo, tabela comparando speedup: vanilla 1x, draft model 2,3x, EAGLE-3 2,9x, FP8+EAGLE 3,6x. Paleta azul-ciano da BaXiJen sobre fundo escuro."
---

# Speculative Decoding em Produção: Como Acelerar Inferência de LLMs em 2-3x Sem Trocar de Modelo

Um modelo de linguagem com 70 bilhões de parâmetros gera texto serialmente: um token por vez, e cada token exige uma passada completa (forward pass) por todos os 70 bilhões de pesos. Na geração de 500 tokens, são 500 passadas sequenciais. Em cada uma, a GPU carrega os pesos da memória para os núcleos de processamento, executa a multiplicação de matrizes, produz os logits do próximo token e recomeça. O gargalo não é computação: é largura de banda de memória. Durante a fase de decode (geração token a token), a GPU opera tipicamente abaixo de 30% de utilização computacional, porque passa mais tempo esperando dados chegarem da memória do que efetivamente computando (Leviathan et al., 2023; arXiv:2211.17192).

Speculative decoding explota exatamente esse desperdício. Um modelo pequeno e rápido (o "modelo rascunho", ou draft model) propõe múltiplos tokens de uma vez. O modelo grande (o "modelo alvo", ou target model) verifica todos os tokens propostos em uma única passada paralela, que custa aproximadamente o mesmo que gerar um token sozinho. Se o modelo rascunho acertou, você ganha múltiplos tokens pelo preço de um. Se errou, descarta a partir do ponto de divergência e continua. A qualidade do output é matematicamente idêntica à geração sem speculation: o algoritmo de rejection sampling garante que a distribuição de probabilidades não muda (Leviathan et al., 2023).

Em produção, os números são concretos. No vLLM, Llama 3.1-70B com um modelo rascunho de 1B alcança 2,31x de speedup (Introl, 2025). Com EAGLE-3, o speedup chega a 2,89x com taxa de aceitação de 81% (agentnative.dev, 2026). No TensorRT-LLM em H200, combinado com quantização FP8, o ganho chega a 3,6x (NVIDIA, 2025). Para uma operação que serve 10 bilhões de tokens por mês em H200, isso reduz o custo por milhão de tokens de US$ 0,19 para US$ 0,09, uma economia de 53% (ClusterBid, 2026).

## O problema fundamental: inferência autoregressiva é memory-bound

A arquitetura Transformer gera texto de forma autoregressiva. Dado um contexto de N tokens, o modelo computa a distribuição de probabilidades do token N+1, amostra um token, adiciona ao contexto, e repete. Cada passo requer carregar todos os pesos do modelo da VRAM para os núcleos de processamento. Para um modelo de 70B em FP16 (140GB de pesos), cada token gerado exige mover 140GB de dados através da memória (Lyceum Technology, 2026).

O custo de uma passada forward na fase de decode é dominado pelo tempo de ler os pesos, não pelo tempo de computar as multiplicações de matrizes. Em batch size 1 (servindo um usuário por vez), a GPU faz aproximadamente duas operações de ponto flutuante por byte de peso lido. A relação arithmetic intensity (FLOPs por byte) é de aproximadamente 2, enquanto GPUs modernas como a H100 atingem pico de eficiência com arithmetic intensity acima de 50. A GPU está estruturalmente subutilizada na fase de decode (arXiv:2607.13068, 2026).

Speculative decoding muda a estrutura. Em vez de gerar um token por forward pass, o sistema propõe K tokens (tipicamente 4 a 8) e verifica todos em uma única passada. A verificação de K tokens custa aproximadamente o mesmo que gerar um, porque o custo dominante (carregar os pesos) é amortizado sobre os K tokens. Quando o modelo rascunho acerta, o sistema avança K tokens no tempo que levaria para avançar um. Quando erra, avança até o ponto de divergência mais um token, e recomeça (localaimaster.com, 2026).

## O algoritmo original: Leviathan et al. (2023)

Speculative decoding foi formalizado por Leviathan et al. (Google Research) no paper "Fast Inference from Transformers via Speculative Decoding", aceito como Oral no ICML 2023 (arXiv:2211.17192). O paper introduz dois elementos-chave:

**1. Speculative execution com modelo rascunho.** Um modelo menor e mais rápido (10 a 100 vezes menor que o alvo) gera K tokens candidatas de forma autoregressiva. Como o modelo rascunho é pequeno, gerar K tokens leva uma fração do tempo que o modelo alvo leva para gerar um.

**2. Rejection sampling para garantir qualidade idêntica.** O modelo alvo processa os K tokens propostos em uma única passada paralela, computando a distribuição de probabilidades em cada posição. Para cada token proposto d[i], o algoritmo compara a probabilidade sob o modelo alvo (p) e sob o modelo rascunho (q):

- Se p(d[i]) maior ou igual a q(d[i]): o alvo concorda com o rascunho. Aceita.
- Se p(d[i]) menor que q(d[i]): aceita com probabilidade p(d[i])/q(d[i)]. Se rejeita, amostra um novo token da distribuição residual: max(0, p(y) - q(y)) normalizada.

Para greedy decoding (temperatura 0), a verificação é direta: o token proposto é aceito se e somente se for o argmax do modelo alvo naquela posição. Para sampling (temperatura maior que 0), o rejection sampling garante que a distribuição de output é matematicamente idêntica à geração sem speculation. Zero perda de qualidade. Provado formalmente (Leviathan et al., 2023; Chen et al., 2023; arXiv:2302.01318).

O paper demonstrou 2x a 3x de aceleração no T5-XXL com outputs idênticos. A técnica não requer retreinar o modelo alvo nem modificar sua arquitetura: é um wrapper no pipeline de inferência.

## As três famílias de speculative decoding em 2026

### 1. Draft model (modelo rascunho separado)

A abordagem original. Um modelo pequeno e separado gera os tokens candidatos. O modelo rascunho é tipicamente da mesma família do modelo alvo (Llama 3.2-1B rascunhando para Llama 3.1-70B, por exemplo), porque modelos da mesma família compartilham tokenizador e distribuição de treinamento, resultando em maior taxa de aceitação (BentoML, 2025).

Em benchmarks independentes, um draft model vanilla atinge 1,95x de speedup com taxa de aceitação de 62% (youngju.dev, 2026, citado por agentnative.dev). É efetivo, mas tem dois custos: memória (o modelo rascunho ocupa VRAM adicional, tipicamente 1 a 8GB) e alinhamento (o rascunho precisa ser compatível com o alvo em tokenização e domínio).

A configuração no vLLM é uma linha:

```bash
vllm serve meta-llama/Llama-3.1-70B-Instruct \
    --speculative-model meta-llama/Llama-3.2-1B-Instruct \
    --num-speculative-tokens 5 \
    --speculative-draft-tensor-parallel-size 1
```

### 2. Medusa: cabeças de predição no próprio modelo

Medusa (Cai et al., 2024; arXiv:2401.10774) elimina o modelo rascunho separado. Em vez disso, adiciona K cabeças de predição (cada uma um MLP de 2 camadas com conexão residual) em cima do modelo alvo. Cada cabeça prediz o token em uma posição futura diferente: a cabeça 1 prediz o próximo token, a cabeça 2 prediz o token depois, e assim por diante. Todas as cabeças predizem simultaneamente em uma única passada, sem necessidade de um modelo rascunho separado (tildalice.io, 2026).

Medusa atinge 2,21x de speedup com 68% de aceitação (agentnative.dev, 2026). A vantagem é simplicidade: sem segundo modelo para manter alinhado. A desvantagem é que as cabeças precisam ser treinadas para o domínio de uso. Cabeças treinadas em dados de chat degradam para 45% de aceitação em código (tildalice.io, 2026). Em 2026, Medusa perdeu a guerra de ecossistema: não está mais listado entre os métodos suportados na documentação atual do vLLM (docs.vllm.ai, 2026; agentnative.dev, 2026).

### 3. EAGLE: o estado da arte em 2026

EAGLE (Li et al., 2024; arXiv:2401.15077) e sua versão mais recente EAGLE-3 (Li et al., 2025; arXiv:2503.01840, aceito no NeurIPS 2025) representam o estado da arte. A diferença fundamental: EAGLE prediz tokens a partir das hidden states (estados ocultos) do modelo alvo, não a partir de tokens brutos. O modelo rascunho do EAGLE usa a representação interna do modelo alvo na camada N-1 para predizer a distribuição da camada N, compartilhando efetivamente computação entre rascunho e verificação (agentnative.dev, 2026).

EAGLE-3 vai além: funde hidden states de três camadas do modelo alvo (camadas 2, N//2 e N-3, onde N é o número total de camadas) em uma única camada decoder rascunho, usando um vocabulário reduzido de 32.000 tokens (em vez do vocabulário completo de 128.256 do Llama 3.1). Essa arquitetura atinge 5 a 10 por cento mais aceitação que Medusa-2 para o mesmo orçamento de parâmetros (ClusterBid, 2026).

Os números de EAGLE-3 em benchmarks independentes:

| Método | Speedup | Taxa de aceitação | Fonte |
|--------|---------|-------------------|-------|
| Draft model vanilla | 1,95x | 0,62 | youngju.dev, 2026 |
| Medusa-2 | 2,21x | 0,68 | youngju.dev, 2026 |
| EAGLE-1 | 2,52x | 0,73 | youngju.dev, 2026 |
| EAGLE-3 | 2,89x | 0,81 | youngju.dev, 2026 |

O paper oficial do EAGLE-3 reporta 3,0x a 6,5x de speedup, com os maiores ganhos em código (comprimento de aceitação até 7,5 tokens no HumanEval) (Li et al., 2025; arXiv:2503.01840). A diferença entre os números do paper e os benchmarks independentes reflete variação por hardware, versão do framework e distribuição de prompt, o que reforça a importância de medir no seu próprio workload antes de confamar em números publicados.

### Bônus: n-gram speculation (sem modelo neural)

Para outputs estruturados ou repetitivos (código, JSON, respostas templateadas), o n-gram matching oferece speculation sem nenhum modelo neural. O sistema busca padrões repetidos no prompt ou no histórico de geração e propõe tokens com base em sequências observadas (Introl, 2025):

```bash
vllm serve meta-llama/Llama-3.1-70B-Instruct \
    --speculative-model "[ngram]" \
    --ngram-prompt-lookup-max 4 \
    --num-speculative-tokens 4
```

No JarvisLabs benchmark, Suffix Decoding (uma variante de n-gram) superou EAGLE em modelos de 8B para tarefas de código estruturado, porque o overhead do modelo rascunho neural supera o benefício quando os padrões são previsíveis (jarvislabs.ai, 2026). Para modelos pequenos em tarefas rígidas, n-gram é o caminho.

## Dados de produção: o que os benchmarks reais mostram

### Speedup por configuração

A tabela abaixo compila benchmarks de produção de múltiplas fontes independentes:

| Configuração | Hardware | Speedup | Fonte |
|--------------|----------|---------|-------|
| Llama 3.1-70B + draft 1B | vLLM | 2,31x | Introl, 2025 |
| Llama 3.1-8B + draft | A100 single | 1,8x | Introl, 2025 |
| Llama 3.1-405B + FP8 + spec | H200 TensorRT-LLM | 3,6x | NVIDIA, 2025 |
| Llama 3.1-8B + EAGLE-3 | B=1 | 1,70x throughput | Hugging Face, 2026 |
| Llama 3.1-8B + EAGLE-3 | B=32 | 1,25x throughput | Hugging Face, 2026 |
| gpt-oss + speculative | vLLM, SWE-bench | 1,24x output throughput | Red Hat, 2026 |
| Llama 3.3-70B + EAGLE-3 | B=1 | 1,60x | JarvisLabs, 2026 |
| Llama 4 Maverick + SpecForge | SGLang | 2,18x | LMSYS, 2025 |

Dois padrões emergem dos dados. Primeiro, o speedup é máximo em batch size 1 (baixa concorrência), onde a GPU está mais subutilizada e o ganho de speculation é maior. Segundo, o ganho comprime em batch sizes altos: em B=32, o speedup cai de 2,89x para 1,25x, porque em alta concorrência a GPU já está saturada e speculation não tem capacidade ociosa para explorar (Traversaal.ai, 2026).

### Custo por token

Em H200 a US$ 3,10/GPU-hora, servindo Llama-4 405B:

| Configuração | Tokens/s | Custo/M tokens | vs Standard |
|--------------|----------|----------------|-------------|
| Standard (B=1) | 38 | US$ 0,19 | baseline |
| + 7B EAGLE-3 (B=1) | 91 | US$ 0,09 | -53% |
| Standard (B=32) | 420 | US$ 0,08 | baseline |
| + 7B EAGLE-3 (B=32) | 672 | US$ 0,05 | -38% |

Dados de ClusterBid (2026). O break-even para o esforço de engenharia de implementar EAGLE-3 é de aproximadamente 10 bilhões de tokens servidos por mês. Acima desse threshold, a economia em GPU supera o custo de engenharia em 4 a 6 semanas.

### O efeito batch size: quando speculation deixa de valer a pena

O fator que mais determina se speculative decoding ajuda não é o algoritmo, nem o modelo, nem o hardware. É a concorrência (batch size) do seu workload (Traversaal.ai, 2026).

A relação é direta. Em batch size 1, a GPU tem capacidade ociosa abundante: speculation preenche essa capacidade com verificação paralela, e o speedup é máximo. Em batch size 32, a GPU já está bem utilizada: speculation compete por recursos que estavam sendo usados, e o ganho comprime. Em batch size 64 ou acima, a GPU está saturada: o overhead do modelo rascunho pode superar o benefício, e o speedup vira slowdown (arXiv:2406.14066, 2024).

A literatura de serving converge em um break-even: abaixo de 50% de taxa de aceitação, speculation é net-negative (Introl, 2025; agentnative.dev, 2026). Entre 60% e 80%, é saudável. Acima de 80%, o ganho acelera rapidamente. O ponto de atenção é que a taxa de aceitação não é fixa: ela varia por domínio (código tem mais padrões repetidos que prosa criativa), por comprimento de resposta (respostas curtas têm menos oportunidade de speculation) e por batch size (maior concorrência reduz a aceitação porque o scheduler tem menos recursos para dedicar ao rascunho).

## O problema que ninguém discute: memória

A maioria dos artigos sobre speculative decoding foca em FLOPs e throughput. Na prática, o gargalo real é memória (manishklachar.github.io, 2026).

Speculative decoding adiciona três pressões de memória que não existem na decode padrão:

**1. KV cache duplicado.** O modelo rascunho mantém seu próprio KV cache, paralelo ao KV cache do modelo alvo. Em produção com múltiplas sessões concorrentes, isso aproximadamente dobra a pressão de HBM por sessão ativa com speculation habilitada.

**2. Páginas KV especulativas.** Durante a fase de rascunho, as páginas de KV cache para os tokens especulativos não podem ser liberadas: a decisão de aceitar ou rejeitar ainda não foi tomada. Essas páginas ficam em limbo, consumindo memória sem contribuir para output até a verificação completar.

**3. Rollbacks frequentes.** Cada rejeição exige truncar o KV cache do modelo alvo e do rascunho até o último token aceito, recarregar position embeddings e re-ler o estado de atenção do último token aceito. Isso queima largura de banda de memória. Quando a taxa de aceitação cai abaixo de 70%, a largura de banda gasta em rollbacks pode exceder a largura de banda economizada por evitar passadas autoregressivas completas (manishklachar.github.io, 2026).

A implicação prática é que speculative decoding exige um scheduler que entenda speculation. Um scheduler que trata sessões especulativas e não-especulativas identicamente vai super-alocar concorrência, triggering KV evictions que destroem a taxa de aceitação, e terminar com throughput pior que decode padrão. O scheduler deve monitorar a taxa de aceitação por sessão e ajustar dinamicamente: aumentar a janela de speculation (gamma) quando aceitação está acima de 85%, manter estável entre 70% e 85%, e suspender speculation quando cai abaixo de 70% (manishklachar.github.io, 2026).

## Configuração prática nos principais frameworks

### vLLM

vLLM suporta três métodos de speculative decoding nativamente: draft model, n-gram e EAGLE. A configuração do EAGLE-3, recomendada para máxima aceitação:

```bash
vllm serve meta-llama/Llama-3.1-70B-Instruct \
    --speculative-model yuhuili/EAGLE-LLaMA3.1-Instruct-70B \
    --speculative-method eagle \
    --num-speculative-tokens 8
```

O framework trata automaticamente a verificação de tokens e o rejection sampling, mantendo equivalência de output com geração não-especulativa (Introl, 2025). O Red Hat demonstrou que a integração do EAGLE-3 no vLLM entrega speedups significativos em produção, com a ressalva de que os modelos especulativos atualmente disponíveis vêm com limite de contexto de 2048 tokens e performance que varia por tarefa (Red Hat, 2025).

### TensorRT-LLM

A solução da NVIDIA oferece otimização mais profunda para hardware NVIDIA, com kernels customizados para ambas as fases (rascunho e verificação):

```bash
trtllm-build \
    --speculative_decoding_mode draft_tokens_external \
    --max_draft_len 8 \
    --checkpoint_dir $TARGET_CHECKPOINT \
    --output_dir $ENGINE_DIR
```

TensorRT-LLM em H200 combinando speculative decoding com FP8 quantization entrega 3,6x de throughput improvement, o maior ganho reportado em produção (NVIDIA, 2025).

### SGLang

SGLang suporta speculative decoding via EAGLE e Multi-Token Prediction (MTP). Para modelos DeepSeek, SGLang implementa EAGLE com 1,8x de decode speedup em batch size 1 e 1,5x em batch size 32 em H200 (particula.tech, 2026). O ecossistema SpecForge, mantido pela LMSYS, oferece modelos rascunho pré-treinados para variantes Llama 4 (LMSYS, 2025).

## Seleção de modelo rascunho: a variável que decide tudo

A qualidade do modelo rascunho é o fator que mais impacta o speedup. Um modelo rascunho ruim desperdiça compute em propostas que o modelo alvo rejeita. Três critérios guiam a seleção:

**Alinhamento de arquitetura.** Modelos rascunho da mesma família do alvo alcançam maior aceitação. Llama 3.2-1B rascunhando para Llama 3.1-70B supera modelos genéricos pequenos porque compartilham tokenizador e distribuição de treinamento (BentoML, 2025).

**Razão de tamanho.** Modelos rascunho tipicamente variam de 1/10 a 1/50 do tamanho do alvo. Rascunhos menores geram mais rápido mas têm menor aceitação. O benchmark do ClusterBid (2026) mostra o trade-off em Llama-4 405B: um rascunho de 1,5B atinge 0,54 de aceitação e 1,8x de speedup; um de 7B atinge 0,71 e 2,4x; um de 34B atinge 0,78 mas apenas 2,2x, porque o tempo de geração do rascunho maior anula o ganho de aceitação. O ponto ótimo em H200 é o rascunho de 7B.

**Fine-tuning de domínio.** Modelos rascunho out-of-box frequentemente underperform em tarefas de domínio específico. Fine-tuning do rascunho na distribuição de output do alvo melhora a aceitação em 20% a 40% (Introl, 2025). Para workloads de alto volume, o investimento em fine-tuning do rascunho se paga em semanas.

## Quando speculative decoding ajuda (e quando não ajuda)

Speculative decoding não é universalmente benéfico. A literatura e os benchmarks de produção convergem em um framework de decisão:

**Cenários favoráveis:**
- Aplicações de chat interativo com prioridade em latência
- Inferência com baixa concorrência (batch size 1 a 8) onde a GPU está subutilizada
- Geração de textos longos (mais de 100 tokens de output)
- Workloads com padrões de token previsíveis (código, estruturado, repetitivo)
- Modelos grandes (acima de 70B) onde o custo de carregar pesos domina

**Cenários desfavoráveis:**
- Batch processing de alto throughput com GPU já saturada (acima de 80% de utilização)
- Respostas muito curtas (poucos tokens para especular)
- Geração altamente criativa/aleatória com baixa aceitação
- Deployments com memória constrained onde o modelo rascunho não cabe
- Modelos pequenos (abaixo de 13B) onde o modelo alvo já é rápido o suficiente e o overhead do rascunho é net-negative

A regra prática (Introl, 2025):

```
SE (utilização de GPU < 50% durante geração)
   E (resposta média > 100 tokens)
   E (modelo rascunho cabe na memória)
   → Habilite speculative decoding

SE (utilização de GPU > 80%)
   OU (pressão de memória alta)
   → Foque em otimizações de batching
```

## Conexão com quantização e Brasil

Speculative decoding é complementar, não concorrente, com quantização. As duas técnicas atacam gargalos diferentes: quantização reduz o tamanho dos pesos (menos dados para mover), speculative decoding amortiza o custo de movê-los sobre múltiplos tokens. Combinadas, o efeito compõe.

No TensorRT-LLM em H200, a combinação de quantização FP8 com speculative decoding entrega 3,6x de throughput improvement (NVIDIA, 2025). Em hardware mais acessível, a combinação de AWQ INT4 (que reduz os pesos do modelo alvo a 25% do tamanho original) com speculative decoding via EAGLE pode entregar speedups compostos de 4x a 5x sobre o baseline FP16 sem speculation.

Para o contexto brasileiro, essa combinação é particularmente poderosa. Um órgão público que roda um modelo de 70B em AWQ INT4 em uma RTX 4090 já tem o modelo funcionando em hardware acessível. Adicionar speculative decoding via n-gram ou EAGLE reduz a latência de resposta de 2x a 3x, melhorando a experiência do usuário sem adicionar custo de hardware. Em interações de chat com cidadãos, onde a latência de resposta importa para a percepção de qualidade, essa redução é o que diferencia uma IA que parece lenta de uma que parece fluida.

Na BaXiJen, speculative decoding está no roadmap do BXat para o próximo ciclo de otimização. A arquitetura híbrida do BXat, com SLMs on-premise como primeira camada, beneficia diretamente: em batch size 1 (um cidadão por vez interagindo com o chat), a GPU está subutilizada, exatamente o cenário onde speculation entrega o máximo de ganho.

## Armadilhas comuns em produção

**1. Assumir que o speedup do benchmark se reproduz no seu workload.** Speedups publicados são medidos em distribuições específicas (SpecBench, MT-Bench, HumanEval). Seu workload tem distribuição diferente. Meça a taxa de aceitação real com seus prompts antes e depois de habilitar speculation. O Red Hat demonstrou que em SWE-bench (código), o ganho geométrico é de 9,5% de throughput output, muito menor que os 2x a 3x reportados em benchmarks de chat (Red Hat, 2026).

**2. Ignorar o overhead de memória.** O modelo rascunho consome VRAM que compete diretamente com a alocação de KV cache. Em alta concorrência, essa competência pode degradar a aceitação e eliminar o benefício de throughput inteiramente (Traversaal.ai, 2026). Monitore o headroom de memória e ajuste o batch size máximo se necessário.

**3. Habilitar speculation em batch size alto.** Em batch size 32 ou acima, a GPU já está bem utilizada e speculation pode ser net-negative. Se seu workload é predominantemente alto-throughput batch processing, speculation não é a otimização certa. Foque em continuous batching e prefix caching.

**4. Não monitorar a taxa de aceitação por sessão.** A taxa de aceitação varia por sessão, por domínio e por comprimento de contexto. Um scheduler que não monitora aceitação por sessão não consegue decidir quando suspender speculation para sessões de baixa aceitação, desperdiçando recursos (manishklachar.github.io, 2026).

**5. Esquecer de validar equivalência de output.** A garantia matemática de output idêntico vale apenas para implementações corretas. Rode os mesmos prompts com a mesma seed em modo standard e speculative. Outputs estatisticamente indistinguíveis confirmam a implementação. Outputs diferentes indicam bug na configuração de rejection sampling (Traversaal.ai, 2026).

## O futuro: para onde speculative decoding vai

**Self-speculative decoding (SWIFT).** Elimina o modelo rascunho separado pulando adaptivamente camadas intermediárias do próprio modelo alvo. Camadas são puladas quando a confiança do token é alta; o modelo usa profundidade completa para raciocínio complexo. 1,3x a 1,6x de speedup sem modelo auxiliar nem treinamento adicional (ICLR 2025; OpenReview, EKJhH5D5wA).

**Speculative Speculative Decoding (SSD).** Proposto em 2026, aninha speculation em dois níveis: um meta-rascunho propõe rascunhos para o modelo rascunho, que por sua vez propõe para o alvo. Reporta até 2x sobre speculative decoding otimizado e 5x sobre decode autoregressivo (vLLM GitHub, 2026).

**Hardware nativo.** A próxima geração de GPUs (NVIDIA Blackwell B300 com HBM3e a 8 TB/s) reduz a latência de verificação em 40% comparado a H200, deslocando o ponto ótimo de rascunho de 7B para 12-15B e elevando o speedup máximo de 2,2x para 2,8x (ClusterBid, 2026).

**Padrão da indústria.** Em 2026, speculative decoding transitou de otimização experimental para prática padrão. vLLM, TensorRT-LLM e SGLang incluem suporte nativo. Red Hat e IBM Research publicam guias de produção. O Red Hat Speculators Project padroniza o formato de modelos rascunho no Hugging Face, simplificando descoberta e deploy (Red Hat, 2025).

## Referências

- agentnative.dev (2026). EAGLE vs Medusa vs Draft Models for Speculative Decoding. Disponível em: https://agentnative.dev/compare/eagle-vs-medusa-vs-draft-models-for-speculative-decoding
- BentoML (2025). Get 3x Faster LLM Inference with Speculative Decoding Using the Right Draft Model. Disponível em: https://www.bentoml.com/blog/3x-faster-llm-inference-with-speculative-decoding
- Cai, T., Li, Y., Geng, Z., Peng, H., Lee, J. D., & Chen, D. (2024). Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads. arXiv:2401.10774.
- Chen, C., Borgeaud, S., Irving, G., Lespiau, J.-B., Press, O., & Hoffman, L. (2023). Accelerating Large Language Model Decoding with Speculative Sampling. arXiv:2302.01318.
- ClusterBid (2026). LLM Inference Speculative Decoding: Acceptance Rate Benchmarks Across Draft Models and GPU Architectures. Disponível em: https://clusterbid.com/blog/llm-inference-speculative-decoding-acceptance-rate-benchmarks
- Introl (2025). Speculative Decoding: Achieving 2-3x LLM Inference Speedup. Disponível em: https://introl.com/blog/speculative-decoding-llm-inference-speedup-guide-2025
- JarvisLabs (2026). Speculative Decoding in vLLM: Complete Guide to Faster LLM Inference. Disponível em: https://jarvislabs.ai/blog/speculative-decoding-vllm-faster-llm-inference
- Leviathan, Y., Kalman, M., & Matias, Y. (2023). Fast Inference from Transformers via Speculative Decoding. ICML 2023 Oral. arXiv:2211.17192.
- Li, Y., Wei, F., Zhang, J., & Zhang, H. (2024). EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty. arXiv:2401.15077.
- Li, Y., et al. (2025). EAGLE-3: Scaling up Inference Acceleration of Large Language Models via Training-Free Token-Level Blending. NeurIPS 2025. arXiv:2503.01840.
- LMSYS (2025). SpecForge: Accelerating Speculative Decoding Training for SGLang. Disponível em: https://lmsys.org/blog/2025-07-25-spec-forge/
- Lyceum Technology (2026). Inference Cost Per Token vs Dedicated GPU in 2026. Disponível em: https://lyceum.technology/magazine/inference-cost-per-token-gpu-2026/
- Manish AI (2026). Speculative Decoding Is a Memory Problem. Disponível em: https://manishklachar.github.io/writings/speculative-decoding-is-a-memory-problem.html
- NVIDIA (2025). TensorRT-LLM Speculative Decoding Boosts Inference Throughput by up to 3.6x. Disponível em: https://developer.nvidia.com/blog/tensorrt-llm-speculative-decoding-boosts-inference-throughput-by-up-to-3-6x/
- NVIDIA (2025). An Introduction to Speculative Decoding for Reducing Latency in AI Inference. Disponível em: https://developer.nvidia.com/blog/an-introduction-to-speculative-decoding-for-reducing-latency-in-ai-inference/
- particula.tech (2026). SGLang vs vLLM in 2026: Benchmarks and When to Use Each. Disponível em: https://particula.tech/blog/sglang-vs-vllm-inference-engine-comparison
- Red Hat Developer (2025). Fly Eagle(3) fly: Faster inference with vLLM & speculative decoding. Disponível em: https://developers.redhat.com/articles/2025/07/01/fly-eagle3-fly-faster-inference-vllm-speculative-decoding
- Red Hat Developer (2026). Performance improvements with speculative decoding in vLLM for gpt-oss. Disponível em: https://developers.redhat.com/articles/2026/04/16/performance-improvements-speculative-decoding-vllm-gpt-oss
- Spheron (2026). vLLM vs TensorRT-LLM vs SGLang: Which Is Fastest? (H100 Benchmarks, 2026). Disponível em: https://www.spheron.network/blog/vllm-vs-tensorrt-llm-vs-sglang-benchmarks
- Traversaal.ai (2026). Speculative Decoding LLM Inference Cost: What Production Benchmarks Actually Show in 2026. Disponível em: https://traversaal.ai/blog/speculative-decoding-llm-inference-cost-production-benchmarks-2026