---
title: "Quantização de LLMs em Produção: Como Rodar Modelos 4x Menores Sem Perder Qualidade"
description: "Um modelo de 70 bilhões de parâmetros precisa de 140GB de VRAM em FP16. Em INT4, cabe em uma única RTX 4090 de 24GB. A quantização reduz o tamanho de um LLM em até 4x com perda de qualidade abaixo de 1% na maioria dos benchmarks. Este guia decompõe AWQ, GPTQ, GGUF e FP8, compara qualidade e throughput com dados reais de produção, e mostra por que quantização deixou de ser hobby para virar o caminho padrão de deploy em 2026."
date: "2026-08-20"
author: "Marcus Ramalho"
authorRole: "CTO e Co-fundador na BaXiJen"
tags: ["quantização", "LLM", "INT4", "INT8", "AWQ", "GPTQ", "GGUF", "FP8", "produção", "infraestrutura", "GPU", "on-premise", "IA brasileira", "BaXiJen"]
featured: true
image: "/blog/quantizacao-llms-cover.svg"
imageAlt: "Diagrama de barras comparando uso de VRAM por nível de quantização: FP16 (140GB, barra vermelha), INT8 (70GB, barra amarela), INT4 (35GB, barra verde) para um modelo de 70B parâmetros. Ao lado, tabela compacta mostrando retenção de qualidade: FP16 100%, INT8 97-98%, AWQ INT4 94-96%. Paleta azul-ciano da BaXiJen sobre fundo escuro."
---

# Quantização de LLMs em Produção: Como Rodar Modelos 4x Menores Sem Perder Qualidade

Um modelo de linguagem com 70 bilhões de parâmetros consome aproximadamente 140GB de memória de vídeo (VRAM) quando carregado em precisão FP16 (16 bits por peso). Essa é a precisão em que a maioria dos modelos open-weight é treinada e distribuída. Para rodar esse modelo em FP16, são necessárias duas GPUs NVIDIA A100 de 80GB cada, um investimento de mais de US$ 200.000 em hardware dedicado ou um custo de aluguel cloud que ultrapassa US$ 8 por hora por GPU. Quando o mesmo modelo é quantizado para INT4 (4 bits por peso), o consumo de VRAM cai para aproximadamente 35GB. Uma única RTX 4090 de 24GB consegue rodar versões otimizadas desse modelo com qualidade equivalente a 94-96% do original (VRLatech, 2026; Spheron, 2026).

Essa redução não é marginal. É a diferença entre precisar de um datacenter e precisar de uma placa de vídeo que cabe em um desktop. No contexto brasileiro, onde o custo de importação de GPUs datacenter é proibitivo e a infraestrutura cloud nacional ainda é limitada, quantização é a tecnologia que torna viável rodar LLMs localmente, com soberania de dados, em hardware acessível. Este artigo decompõe como cada técnica de quantização funciona, quais trade-offs apresentam em produção, quais frameworks suportam cada formato, e como decidir qual usar para cada workload.

## O problema fundamental: por que LLMs são grandes

Um modelo de linguagem é, em essência, uma coleção enorme de números. Cada parâmetro (peso) do modelo é um número de ponto flutuante que, na precisão padrão FP16 ou BF16, ocupa 16 bits (2 bytes) de memória. Um modelo com 70 bilhões de parâmetros precisa de 70 bilhões vezes 2 bytes, ou seja, aproximadamente 140GB de VRAM apenas para carregar os pesos em memória. Esse cálculo não inclui o KV cache, que cresce com o comprimento do contexto e pode adicionar dezenas de gigabytes adicionais durante a inferência (Yuan et al., 2024; arXiv:2402.16363).

A arquitetura Transformer é dominada por operações de multiplicação de matrizes nas camadas lineares (atenção e feed-forward). Essas operações são computacionalmente intensivas e, em precisão FP16, exigem hardware capaz de mover grandes volumes de dados entre memória e processador. O gargalo na inferência de LLMs, especialmente em batch size 1 (servindo um usuário por vez), não é a computação em si, mas a largura de banda de memória. Os pesos precisam ser transferidos da VRAM para os núcleos de processamento a cada token gerado. Quanto menor o peso, menos dados precisam ser movidos, e mais rápido o token é gerado. A quantização ataca diretamente esse gargalo (Lin et al., 2025; DOI: 10.1145/3714983.3714987).

## O que é quantização

Quantização é o processo de reduzir a precisão numérica dos pesos de um modelo. Em vez de representar cada peso com 16 bits (FP16), usa-se 8 bits (INT8) ou 4 bits (INT4). A redução é direta: INT8 corta o tamanho pela metade. INT4 corta por quatro. O desafio é fazer isso sem destruir a qualidade do modelo.

A intuição é simples. A maioria dos pesos em uma rede neural tem distribuição aproximadamente gaussiana: a grande maioria dos valores está concentrada perto de zero, com poucos outliers. Em FP16, cada peso tem 65.536 valores possíveis. Em INT4, apenas 16. A pergunta é: consegue mapear cada peso FP16 para um dos 16 valores INT4 mais próximos sem quebrar o comportamento do modelo? A resposta, validada empiricamente, é sim, na maioria dos casos, com perda de qualidade abaixo de 5% (Wang et al., 2024; arXiv:2409.11650).

### Quantização pós-treino (PTQ) vs. quantização aware-training (QAT)

Existem duas famílias de quantização. A primeira, **Post-Training Quantization (PTQ)**, pega um modelo já treinado em FP16 e converte os pesos para menor precisão sem retreinar. É rápida (minutos a horas), não requer dados de treinamento extensivos, e é o caminho usado em produção para a esmagadora maioria dos casos. AWQ, GPTQ e GGUF são técnicas de PTQ.

A segunda, **Quantization-Aware Training (QAT)**, incorpora a quantização no processo de treinamento. O modelo aprende a ser robusto à redução de precisão. Produz modelos de maior qualidade, mas requer retreinar (ou fine-tunar) o modelo, o que é computacionalmente caro. QLoRA combina QAT com adaptação de baixo rank, permitindo fine-tunar modelos de 65B em uma única GPU de 48GB com qualidade próxima ao full fine-tuning (Dettmers et al., 2023; arXiv:2305.14314).

Em produção, PTQ domina. O resto deste artigo foca em PTQ.

## As quatro técnicas que importam em 2026

### 1. GPTQ: o pioneiro que estabeleceu o padrão

GPTQ (Generative Pre-trained Transformer Quantization) foi proposto por Frantar et al. (2022; arXiv:2210.17323) e introduziu a ideia de quantizar pesos camada por camada, usando informação da inversa da matriz Hessiana para compensar o erro introduzido em cada coluna quantizada. Funciona assim: ao quantizar a primeira coluna de pesos, o GPTQ calcula como o erro dessa quantização afeta as colunas restantes e ajusta essas colunas para compensar. O processo segue coluna por coluna, da esquerda para a direita, propagando a correção (Meta-Intelligence, 2026).

O resultado é um modelo INT4 com qualidade de 93-95% comparado ao FP16 original (VRLatech, 2026). GPTQ tornou-se o padrão de comparação para todas as técnicas subsequentes. Tem excelente suporte de tooling: vLLM, Hugging Face Transformers e text-generation-webui suportam GPTQ nativamente, e existe uma grande biblioteca de modelos pré-quantizados em GPTQ disponíveis no Hugging Face (Sesame Disk, 2026).

A principal limitação do GPTQ é que ele quantiza apenas os pesos, mantendo as ativações em FP16. Isso significa que a inferência ainda requer alguma operação em precisão mista, o que limita o ganho de throughput em hardware que suporta operações INT4 nativas.

### 2. AWQ: o padrão de fato em 2026

AWQ (Activation-aware Weight Quantization) foi proposto por Lin et al. (2024; MLSys 2024 Best Paper, posteriormente publicado em GetMobile, DOI: 10.1145/3714983.3714987) com uma intuição diferente e poderosa: nem todos os pesos são iguais. AWQ analisa a distribuição das ativações (os valores que passam pela rede durante a inferência) para identificar quais pesos são "salientes", ou seja, mais importantes para preservar a fidelidade da saída. A descoberta central do paper é que proteger apenas 1% dos pesos mais críticos permite quantização INT4 quase sem perda de qualidade (Lin et al., 2025).

Na prática, AWQ consistentemente supera GPTQ nos mesmos benchmarks. No LLaMA-7B, AWQ INT4 apresenta perplexidade 0,51 a 0,60 menor que GPTQ INT4 no mesmo bit-width. Em benchmarks de tarefa como MMLU e HumanEval, AWQ score 1-3% acima de GPTQ (Spheron, 2026). A razão é que AWQ usa informação de ativação para guiar a quantização, enquanto GPTQ usa apenas informação dos pesos.

Em 2026, AWQ é o formato INT4 padrão para inferência em produção. Modelos das famílias Llama, Mistral, Qwen e DeepSeek já são distribuídos com checkpoints AWQ pré-quantizados no Hugging Face. vLLM, SGLang e TensorRT-LLM incluem kernels AWQ otimizados para GPUs NVIDIA (H100, A100, L40S e RTX 4090) (Spheron, 2026).

### 3. GGUF: o formato do ecossistema local

GGUF (GPT-Generated Unified Format) é o formato nativo do llama.cpp, o motor de inferência mais popular para rodar LLMs em hardware sem GPU dedicada ou em configurações mistas CPU+GPU. Diferente de AWQ e GPTQ, que são técnicas de quantização, GGUF é um formato de arquivo que suporta múltiplos níveis de quantização, definidos por sufixos como Q4_K_M, Q5_K_M, Q8_0 (Sesame Disk, 2026).

A vantagem do GGUF é a compatibilidade. Roda em CPU (x86 e ARM), GPU (CUDA, Metal, Vulkan), e em configurações híbridas onde parte do modelo fica na GPU e o resto na RAM do sistema. Isso é crucial para o cenário brasileiro: uma instituição pública que não tem orçamento para uma A100 pode rodar um modelo de 8B parâmetros quantizado em Q4_K_M em um servidor comum de escritório, obtendo aproximadamente 28 tokens por segundo em um AMD Ryzen 9 5950X com 32 threads (Premai, 2026).

A tabela abaixo resume os níveis de quantização GGUF mais usados e seu trade-off de qualidade:

| Formato | Bits por peso | Redução de tamanho | Qualidade aproximada |
|---------|---------------|--------------------|-----------------------|
| FP16/BF16 | 16 | Base (100%) | Original |
| Q8_0 | 8 | ~50% | ~99% |
| Q6_K | 6 | ~37,5% | ~97% |
| Q5_K_M | 5 | ~31% | ~96% |
| Q4_K_M | 4 | ~25% | ~95% |
| Q3_K_M | 3 | ~19% | ~90% |

Dados compilados de Sesame Disk (2026), Premai (2026) e Latitude.so (2026).

Q4_K_M é o ponto de equilíbrio recomendado pela comunidade para a maioria dos workloads de produção. Reduz o modelo para 25% do tamanho original com perda de qualidade abaixo de 5%. Pushing para Q3 ou abaixo introduz degradação significativa, especialmente em tarefas de raciocínio, código e matemática (Latitude.so, 2026).

### 4. FP8: o nativo de Blackwell e Hopper

FP8 (8-bit floating point) é o formato de quantização mais recente a ganhar adoção em produção, impulsionado pelo suporte nativo em hardware NVIDIA das arquiteturas Hopper (H100) e Blackwell (B200). Diferente de INT4/INT8, que usam representação inteira, FP8 mantém a estrutura de ponto flutuante (exponente + mantissa), o que preserva melhor a faixa dinâmica dos valores (VRLatech, 2026; Friendli.ai, 2026).

A vantagem do FP8 é que ele preserva aproximadamente 99% da qualidade do FP16 enquanto dobra o throughput e reduz a latência pela metade, graças aos Tensor Cores de 8 bits das GPUs modernas. Em comparação direta, SmoothQuant (W8A8 INT8) consegue speedup de 1,56x com 2x redução de memória (Xiao et al., 2022; arXiv:2211.10438), enquanto FP8 entrega 2x speedup com a mesma redução de memória, mas com melhor preservação de qualidade (Friendli.ai, 2026).

A limitação é que FP8 requer hardware específico. Não funciona em GPUs anteriores à Hopper (RTX 3090, RTX 4090, A100). Para quem tem o hardware, FP8 é a melhor opção de 8-bit. Para quem não tem, INT8 via SmoothQuant ou AWQ INT4 continuam sendo o caminho.

## Dados de produção: o que os benchmarks mostram

### Qualidade por formato

A tabela a seguir compila resultados de benchmarks públicos comparando a retenção de qualidade de cada formato relativo ao modelo original em FP16/BF16. Os dados são de VRLatech (2026), Spheron (2026), Sesame Disk (2026), Latitude.so (2026) e AWS SageMaker AI (2026):

| Formato | Bits | Qualidade vs FP16 | Melhor uso |
|---------|------|-------------------|------------|
| FP8 | 8 | ~99% | Inferência em H100/B200 |
| INT8 (SmoothQuant) | 8 | ~97-98% | Inferência em produção |
| AWQ INT4 | 4 | ~94-96% | Inferência VRAM-constrained |
| GPTQ INT4 | 4 | ~93-95% | Modelos pré-quantizados |
| GGUF Q4_K_M | 4 | ~95% | CPU ou CPU+GPU híbrido |
| GGUF Q2_K | 2 | ~92% | Não recomendado para produção |

Os números são médias de MMLU, HumanEval, GSM8K e perplexidade em WikiText-2. A variação depende da arquitetura do modelo (LLaMA, Mistral, Qwen) e do tamanho. Modelos menores (7B-8B) são mais sensíveis à quantização agressiva que modelos maiores (70B+).

### Throughput por formato

Dados de Premai (2026) e Sesame Disk (2026) mostram throughput real (tokens por segundo) em hardware acessível:

**CPU (AMD Ryzen 9 5950X, 32 threads):**

| Modelo | Quantização | Tokens/s | Memória |
|-------|-------------|----------|---------|
| Llama 3.1 8B | Q4_K_M | 28 | 5,2GB |
| Llama 3.1 8B | Q8_0 | 18 | 8,8GB |
| Llama 3.1 70B | Q4_K_M | 3,2 | 38GB |

**GPU (RTX 4090, full offload via vLLM):**

| Modelo | Quantização | Tokens/s | Memória |
|-------|-------------|----------|---------|
| Llama 3.1 8B | AWQ INT4 | ~180 | 4,8GB |
| Llama 3.1 70B | AWQ INT4 | ~65 | 35GB |
| Llama 3.1 70B | FP16 | ~40 | 140GB (2x A100) |

**GPU (A100 80GB, vLLM):**

| Modelo | Quantização | Tokens/s | Custo/1M tokens |
|-------|-------------|----------|-----------------|
| Llama 70B | AWQ INT4 (1x A100) | ~1800 | ~US$ 0,25 |
| Llama 70B | FP16 (2x A100) | ~1400 | ~US$ 0,76 |

Os números de throughput são estimativas baseadas em benchmarks da comunidade (vLLM, Hugging Face) e variam conforme versão do framework, batch size e comprimento de sequência. O ponto principal: AWQ INT4 em uma A100 entrega 3x mais tokens por dólar que FP16 em duas A100, com 94-96% da qualidade (Spheron, 2026).

### Onde a qualidade despenca

A quantização não é uniforme. Diferentes tipos de tarefa sofrem impactos diferentes (Latitude.so, 2026; Towards AI, 2026):

- **Classificação e sumarização**: perda de qualidade abaixo de 1% mesmo em INT4. Tarefas que dependem de compreensão geral de texto são robustas à quantização.
- **Geração de código**: perda de 4-8% em INT4. Modelos quantizados podem cometer mais erros de sintaxe ou lógica em código complexo. INT8 é recomendado para workloads de código.
- **Raciocínio matemático**: perda de 5-10% em INT4. Aritmética e raciocínio multi-passo são sensíveis à redução de precisão. Para aplicações críticas de matemática, INT8 ou FP8 são mais seguros.
- **Português (específico)**: modelos treinados predominantemente em inglês podem degradar mais em português quando quantizados, porque os pesos que codificam conhecimento multilíngue estão entre os mais sensíveis à quantização. Não existe benchmark sistemático para este efeito, mas equipes que servem modelos em português reportam degradação perceptível em INT4 em tarefas de geração longa (Latitude.so, 2026).

A recomendação prática: para agentes que fazem classificação, extração, sumarização ou resposta a perguntas frequentes, INT4 é seguro. Para agentes que geram código, fazem cálculos ou produzem textos longos em português, INT8 ou FP8 são mais conservadores.

## Frameworks de inferência: qual usar

### vLLM

vLLM é o servidor de inferência mais usado em produção para GPUs NVIDIA. Suporta AWQ, GPTQ, FP8 e quantização on-the-fly. Seus recursos principais incluem continuous batching (que aumenta throughput em até 24x sob concorrência), prefix caching (que reutiliza computação entre requisições com prefixo comum) e PagedAttention (que gerencia o KV cache de forma eficiente). Para servir múltiplos usuários simultaneamente em uma GPU, vLLM é a escolha padrão (Sesame Disk, 2026).

### llama.cpp / Ollama

Para deploy sem GPU dedicada, ou em hardware misto (CPU+GPU), llama.cpp é o motor de inferência mais flexível. Suporta o formato GGUF com todos os níveis de quantização. Ollama empacota llama.cpp em uma experiência de uso simplificada, ideal para desenvolvimento local e deploys de pequena escala. A limitação é throughput: llama.cpp não implementa continuous batching nativo, o que o torna menos adequado para servir múltiplos usuários concorrentes (Sesame Disk, 2026).

### SGLang

SGLang otimiza para workloads de agentes (múltiplas chamadas encadeadas de LLM com prompts estruturados). Implementa RadixAttention, que cacheia prefixos de prompt em uma estrutura de árvore radix, acelerando chamadas repetidas. Para aplicações de agentes que fazem tool use, function calling e raciocínio multi-passo, SGLang pode ser 2-3x mais rápido que vLLM (Sesame Disk, 2026).

### TensorRT-LLM

A solução da NVIDIA para inferência otimizada. Suporta SmoothQuant, FP8 e AWQ com kernels altamente otimizados para GPUs Hopper e Blackwell. É a opção de maior performance absoluta em hardware NVIDIA recente, mas tem curva de aprendizado mais íngreme e menos flexibilidade que vLLM.

## Conexão com Brasil e BaXiJen

A quantização tem uma relevância especial no contexto brasileiro. Três fatores convergem para torná-la crítica:

Primeiro, **custo de hardware**. GPUs datacenter (A100, H100) custam no Brasil entre 2x e 3x o preço internacional devido a impostos de importação, logística e câmbio. Uma RTX 4090, que custa US$ 1.600-2.000 nos EUA, chega a R$ 15.000-20.000 no Brasil. Quantização INT4 permite rodar modelos de 70B em hardware de custo 10x menor que o equivalente em FP16.

Segundo, **soberania de dados**. Instituições públicas brasileiras que precisam de IA com garantia de privacidade (LGPD, dados sensíveis) não podem enviar dados para APIs estrangeiras. Precisam rodar localmente. Quantização torna viável rodar modelos competentes em servidores on-premise com hardware modesto, mantendo todos os dados dentro da instituição. É o que a BaXiJen faz com o BXat: modelos open-source quantizados rodando localmente em hardware acessível para gestão pública.

Terceiro, **infraestrutura cloud nacional limitada**. As opções de GPU cloud no Brasil são escassas e caras. AWS São Paulo tem instâncias GPU limitadas, e os preços são maiores que nas regiões US. Quantização reduz o requisito de VRAM, permitindo usar instâncias menores e mais baratas, ou evitar cloud inteiramente com deploy on-premise.

Na BaXiJen, usamos quantização em todos os deploys de produção. O BXat roda modelos de 7-13B parâmetros em AWQ INT4 ou GGUF Q4_K_M, dependendo do hardware disponível no cliente. Em servidores com GPU (RTX 4090 ou A4000), AWQ via vLLM entrega o melhor throughput. Em servidores sem GPU dedicada, GGUF via llama.cpp mantém o modelo funcional com throughput reduzido mas aceitável para o volume de uso típico de um órgão público de médio porte.

## Checklist de decisão: qual quantização usar

A decisão depende de três fatores: hardware disponível, tipo de tarefa e requisito de qualidade. A matriz abaixo sintetiza a recomendação:

| Cenário | Formato recomendado | Framework | Razão |
|---------|---------------------|-----------|-------|
| GPU H100/B200 disponível | FP8 | vLLM ou TensorRT-LLM | Melhor qualidade (~99%) e throughput (2x) |
| GPU A100/RTX 4090, VRAM suficiente | AWQ INT4 | vLLM | Melhor INT4 em qualidade e throughput |
| GPU A100/RTX 4090, qualidade crítica | INT8 (SmoothQuant) | vLLM ou TensorRT-LLM | ~97-98% de qualidade, 2x redução |
| Sem GPU, CPU apenas | GGUF Q4_K_M | llama.cpp ou Ollama | Único formato que roda bem em CPU |
| Sem GPU, CPU+GPU parcial | GGUF Q4_K_M | llama.cpp | Split CPU+GPU, flexível |
| Agente com tool use intensivo | AWQ INT4 | SGLang | RadixAttention acelera chamadas encadeadas |
| Tarefas de código ou matemática | INT8 ou FP8 | vLLM | INT4 degrada 5-10% nestes domínios |
| Deploy on-premise em órgão público | GGUF Q4_K_M ou AWQ INT4 | llama.cpp ou vLLM | Hardware limitado, soberania de dados |

## Armadilhas comuns em produção

**1. Testar apenas perplexidade.** Perplexidade em WikiText-2 é o benchmark mais comum em papers de quantização, mas não correlaciona bem com qualidade em tarefas reais. Um modelo pode ter perplexidade quase idêntica ao original e ainda assim falhar em tarefas de código ou raciocínio. Avalie com benchmarks de tarefa (MMLU, HumanEval, GSM8K) e, idealmente, com um conjunto de testes representativo do seu workload real.

**2. Ignorar o KV cache.** Quantizar os pesos reduz o tamanho do modelo, mas o KV cache continua em FP16 na maioria das implementações padrão. Em contextos longos (8K+ tokens), o KV cache pode consumir mais VRAM que os próprios pesos. Quantizar o KV cache para INT8 ou FP8 reduz esse consumo em 2-4x, mas requer configuração explícita no framework e pode introduzir degradação em sequências longas. No vLLM, `--kv-cache-dtype fp8` ativa quantização do KV cache em hardware Hopper (Meta-Intelligence, 2026).

**3. Assumir que pre-quantizado é sempre bom.** Modelos pré-quantizados no Hugging Face variam em qualidade. A calibração usada para criar o modelo quantizado afeta diretamente a qualidade final. AWQ com calibração em dados da mesma distribuição do uso pretendido performa melhor que AWQ com calibração genérica (Microsoft, 2026). Quando possível, quantize o modelo você mesmo com dados de calibração representativos do seu domínio.

**4. Esquecer do overhead de desquantização.** Em inferência com batch size 1, a desquantização on-the-fly dos pesos INT4 para FP16 antes de cada operação adiciona overhead. Frameworks otimizados (vLLM, SGLang) implementam kernels que fazem desquantização durante a própria multiplicação de matrizes, minimizando esse custo. Em frameworks menos otimizados, o overhead pode anular parte do ganho de throughput. Use sempre um framework com kernels de quantização otimizados.

**5. Não versionar o modelo quantizado.** Um modelo quantizado é um artefato diferente do modelo original. Deve ter seu próprio hash, versão e pipeline de avaliação. Se o modelo base for atualizado, o modelo quantizado precisa ser regerado e reavaliado. Trate o modelo quantizado como um release separado no seu pipeline de MLOps.

## O futuro: para onde a quantização vai

A quantização continua evoluindo em três frentes:

**FP4 e sub-4-bit.** NVIDIA Blackwell introduziu suporte nativo a FP4, e early benchmarks mostram qualidade superior a INT4 no mesmo bit-width. Modelos em FP4 podem chegar a 99% da qualidade FP16 em alguns benchmarks, graças à faixa dinâmica do ponto flutuante. Espera-se que FP4 substitua INT4 como padrão de quantização agressiva quando o hardware Blackwell for mais acessível (VRLatech, 2026).

**Quantização do KV cache.** A maior fronteira aberta. KV cache em INT4 já é experimental em alguns kernels, e pode dobrar o contexto efetivo na mesma VRAM. Para aplicações que usam contextos longos (RAG com documentos extensos, agentes com histórico de conversação longo), quantização do KV cache será o maior ganho de eficiência dos próximos 12 meses (Meta-Intelligence, 2026).

**Quantização adaptativa por camada.** Nem todas as camadas de um Transformer são igualmente sensíveis à quantização. Técnicas de quantização adaptativa analisam a sensibilidade de cada camada e aplicam precisão diferente por camada: INT4 nas camadas robustas, INT8 ou FP16 nas camadas críticas. Isso permite reduzir o tamanho total do modelo mantendo qualidade onde importa. Métodos como EXL2 já implementam essa ideia com bits-per-weight configurável (Premai, 2026).

## Referências

- Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient Finetuning of Quantized LLMs. arXiv:2305.14314.
- Frantar, E., et al. (2022). GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers. arXiv:2210.17323.
- Friendli.ai. (2026). Improve Latency and Throughput with Weight-Activation Quantization in FP8. https://friendli.ai/blog/weight-activation-quantization-fp8
- Latitude.so. (2026). We Tested Quantized LLMs: Cost and Performance Results. https://latitude.so/blog/quantized-llms-cost-performance-results
- Lin, J., Tang, J., Tang, H., Yang, S., Xiao, G., & Han, S. (2025). AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration. GetMobile: Mobile Computing and Communications. DOI: 10.1145/3714983.3714987.
- Meta-Intelligence. (2026). Run 70B LLMs in 4 Bits: INT8, GPTQ, AWQ & GGUF. https://www.meta-intelligence.tech/en/insight-quantization
- Microsoft. (2026). A Practical Guide to INT4 Quantization for SLMs: GPTQ vs AWQ, Olive and Real-World Results. https://medium.com/data-science-at-microsoft/a-practical-guide-to-int4-quantization-for-slms-gptq-vs-awq-olive-and-real-world-results-2f63d6963d1d
- Premai. (2026). 10 Best vLLM Alternatives for LLM Inference in Production. https://www.premai.io/blog/10-best-vllm-alternatives-for-llm-inference-in-production-2026
- Sesame Disk. (2026). Quantization Techniques for AI Inference in 2026: GGUF, AWQ, GPTQ, and FP8. https://sesamedisk.com/quantization-techniques-ai-inference-2026
- Spheron. (2026). AWQ Quantization Guide: Deploy LLMs at Half the GPU Cost. https://www.spheron.network/blog/awq-quantization-guide-llm-deployment
- VRLatech. (2026). LLM Quantization Explained: INT4, INT8, FP8, AWQ, and GPTQ in 2026. https://vrlatech.com/llm-quantization-explained-int4-int8-fp8-awq-and-gptq-in-2026
- Wang, Y., Yang, T., et al. (2024). Art and Science of Quantizing Large-Scale Models: A Comprehensive Overview. arXiv:2409.11650.
- Xiao, G., et al. (2022). SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models. arXiv:2211.10438.
- Yuan, Z., Shang, Y., et al. (2024). LLM Inference Unveiled: Survey and Roofline Model Insights. arXiv:2402.16363.