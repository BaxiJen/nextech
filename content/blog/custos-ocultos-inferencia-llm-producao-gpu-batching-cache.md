---
title: "Custos Ocultos de Inferência de LLMs em Produção: Como Otimizar GPU, Batching e Cache"
description: "O custo de inferência de LLMs despencou 1.000x em três anos, mas empresas brasileiras ainda perdem até 80% do budget de IA em ineficiência. Este artigo mapeia as cinco alavancas técnicas que reduzem o custo real de inferência em produção: quantização, KV cache, continuous batching, speculative decoding e smart routing. Com benchmarks reais de vLLM, dados de pricing de GPU no Brasil e referências acadêmicas, mostramos como passar de US$ 20 para US$ 0,40 por milhão de tokens sem sacrificar qualidade."
date: "2026-06-23"
author: "Marcus Ramalho"
authorRole: "CTO e Co-fundador na BaXiJen"
tags: ["LLM", "inferência", "otimização", "GPU", "quantização", "KV cache", "batching", "speculative decoding", "vLLM", "custo", "produção", "IA brasileira", "BaXiJen"]
featured: true
image: "/blog/custos-ocultos-inferencia-llm-cover.svg"
imageAlt: "Diagrama das cinco alavancas de otimização de inferência LLM em camadas sobrepostas: quantização (INT4/INT8/FP8), KV cache (PagedAttention), continuous batching, speculative decoding e smart routing. Ao centro, indicador de custo decrescente de US$ 20 para US$ 0,40 por milhão de tokens."
---

Em dezembro de 2022, rodar um modelo equivalente ao GPT-4 custava aproximadamente **US$ 20 por milhão de tokens**. Em março de 2026, o mesmo nível de performance custava **US$ 0,40 por milhão de tokens**. Uma queda de 1.000 vezes em pouco mais de três anos, uma das colapsos de custo mais rápidos da história da computação (GPUNex, 2026). Mas esse número esconde uma verdade incômoda: a maioria das empresas brasileiras que roda LLMs em produção está pagando de 3 a 5 vezes mais do que deveria, não porque os modelos são caros, mas porque a infraestrutura de inferência é mal configurada.

O problema não é o preço do modelo. É o **custo oculto de ineficiência**: GPUs rodando a 30% de utilização, caches desligados, batching configurado com parâmetros padrão, modelos em FP16 quando INT8 seria indistinguível para o usuário final. Uma análise da Mavik Labs publicada em 2026 mostra que equipes que empilham três camadas de otimização (caching, batching e smart routing) reduzem o gasto de inferência em **47% a 80%** sem degradar a experiência do usuário (Mavik Labs, 2026). Uma pesquisa da ACL 2025 demonstra que técnicas adequadas de otimização reduzem o consumo de energia em até **73%** comparado a serving nativo, o que se traduz em 2 a 3 vezes menos custo de cloud (Redwerk, 2025).

Este artigo mapeia as cinco alavancas técnicas que determinam o custo real de inferência em produção: quantização, KV cache, continuous batching, speculative decoding e smart routing. Para cada uma, apresento dados de benchmark, armadilhas de produção e recomendações de deploy aplicáveis ao mercado brasileiro, onde cada real de infraestrutura precisa ser justificado e a soberania de dados não é negociável.

## 1. Quantização: a maior alavanca, o menor entendimento

Quantização é a técnica de reduzir a precisão numérica dos pesos e ativações de um modelo, passando de 16 bits (FP16/BF16) para 8 bits (INT8/FP8) ou 4 bits (INT4). É a maior alavanca individual de redução de custo porque corta o uso de memória e compute simultaneamente, sem exigir troca de hardware.

O estudo mais abrangente sobre o tema, publicado por Kurtić e colegas da Red Hat AI e IST Austria em 2025, realizou mais de **500 mil avaliações** em toda a família Llama-3.1 e chegou a três conclusões que mudam o jogo (Kurtić et al., 2025, arXiv:2411.02355):

1. **FP8 (W8A8-FP) é essencialmente lossless** em todas as escalas de modelo testadas, de 8B a 405B parâmetros. A degradação de qualidade é estatisticamente insignificante.
2. **INT8 bem calibrado (W8A8-INT) causa apenas 1-3% de degradação** de acurácia em benchmarks acadêmicos e tarefas realistas.
3. **INT4 weight-only (W4A16-INT) é mais competitivo do que se esperava**, rivalizando com quantização de 8 bits em várias tarefas, especialmente em setups síncronos.

A implicação prática é direta: se você está rodando um modelo de 70B em FP16 numa GPU H100, está desperdiçando metade da memória. Passar para INT4 reduz o footprint de VRAM em aproximadamente **75%**, permitindo rodar um modelo de 70 bilhões de parâmetros em uma GPU de consumo (Awesome Agents, 2026). Se está em H100 ou H200, FP8 é a escolha óbvia: qualidade idêntica ao BF16 com metade do uso de memória.

| Formato | Bits | Redução de VRAM | Degradação de qualidade | Hardware mínimo |
|---|---|---|---|---|
| FP16/BF16 | 16 | 0% | 0% (referência) | A100 80GB+ para 70B |
| FP8 (W8A8-FP) | 8 | ~50% | ~0% (lossless) | H100, H200, B200 |
| INT8 (W8A8-INT) | 8 | ~50% | 1-3% | A100, RTX 4090 |
| INT4 (W4A16-INT) | 4 | ~75% | 3-8% (varia por tarefa) | Qualquer GPU com 24GB+ |

A escolha do formato de quantização depende do hardware disponível e do tipo de workload. Para serving assíncrono com continuous batching, **W8A8 domina** em custo-eficiência. Para setups síncronos (uma requisição por vez), **W4A16 é mais eficiente** porque o gargalo muda de compute para memória de pesos (Kurtić et al., 2025). Para workloads mistos, a decisão depende do caso específico.

No ecossistema open-source, três formatos dominam: **GPTQ** (pós-treino, calibrado, excelente para serving com vLLM), **AWQ** (ativação-aware, geralmente superior em qualidade em 4 bits) e **GGUF** (formato da llama.cpp, ideal para edge e CPU). Uma comparação publicada em 2026 pelo The AI Engineer mostra que GGUF pode ser até 10 vezes mais lento que GPTQ/AWQ no mesmo nível de quantização em GPU, mas é o único formato viável para CPU-only (The AI Engineer, 2026).

**Armadilha de produção:** a degradação de qualidade da quantização não é uniforme. Modelos menores (7B-13B) são mais sensíveis à quantização agressiva que modelos maiores (70B+). Um Llama-3.1-8B em INT4 pode perder 8-12% de qualidade em tarefas de raciocínio, enquanto o Llama-3.1-70B no mesmo formato perde apenas 2-4%. Se está quantizando um modelo pequeno, avalie com cuidado. Se está quantizando 70B ou maior, INT4 é quase sempre seguro.

## 2. KV Cache: o gargalo invisível que dobra o custo de memória

O KV cache é a otimização mais fundamental na inferência de Transformers: armazena as representações computadas de tokens passados para evitar recálculo a cada novo token gerado. Sem ele, a geração de 1.000 tokens requereria O(n²) computações. Com ele, passa a O(n). Mas o preço dessa otimização é memória: o KV cache cresce linearmente com o comprimento do contexto e com o tamanho do batch, consumindo rapidamente toda a VRAM disponível, mesmo em GPUs H100 e H200 (Singh et al., 2026, arXiv:2603.20397).

O paper de revisão de Singh e colegas, publicado em março de 2026 no arXiv, sistematizou as estratégias de otimização de KV cache em cinco direções: eviction (remoção de entradas antigas), compression (redução de precisão das entradas), hybrid memory (spillover para CPU/SSD), novel attention mechanisms (MQA, GQA, MLA) e combination strategies (pipeline adaptativo) (Singh et al., 2026). A conclusão central é que **nenhuma técnica isolada domina em todos os cenários**. A estratégia ótima depende do comprimento do contexto, restrições de hardware e características do workload.

Na prática, três técnicas têm impacto imediato em produção:

**PagedAttention (vLLM):** a inovação que tornou o vLLM o servidor de inferência mais popular do ecossistema open-source. PagedAttention gerencia o KV cache como um sistema operacional gerencia memória virtual: aloca blocos não contíguos de páginas de tamanho fixo, eliminando a fragmentação que consome 60-80% do KV cache em implementações nativas. O resultado é que o vLLM consegue servir **2 a 4 vezes mais requisições concorrentes** na mesma GPU comparado a uma implementação sem PagedAttention (vLLM, 2025).

**Prefix caching:** armazena o KV cache de prefixos de prompt repetidos (system prompts, few-shot examples, instruções fixas) para reutilizar entre requisições. Em pipelines de RAG com chunks reutilizados ou agentes com instruções estáveis, o prefix caching pode reduzir o custo de prefill em **50% a 90%** nos tokens cacheados (GMI Cloud, 2026). Na API da Anthropic, tokens cacheados custam aproximadamente um décimo do preço de tokens normais. No vLLM, o prefix caching é nativo e gratuito.

**GQA/MQA (Grouped/Multi-Query Attention):** arquiteturas modernas como Llama-3, Qwen-2.5 e Gemma já usam GQA, que reduz o número de heads de KV cache por um fator de 4 a 8, cortando o consumo de memória do cache na mesma proporção. Se está escolhendo um modelo para servir em produção, priorize um que use GQA. A diferença em custo de memória é estrutural, não configurável depois.

**Armadilha de produção:** o KV cache é o primeiro bottleneck que aparece quando você escala. Um modelo de 70B servindo contexto de 128 mil tokens com batch de 8 requisições concorrentes pode consumir **120GB+ só de KV cache**, excedindo a VRAM de uma H100 80GB. A solução não é comprar mais GPU, é configurar eviction policy, limitar max_num_seqs e considerar quantização do próprio KV cache (KV cache em FP8 ao invés de FP16 reduz pela metade o consumo de memória do cache).

## 3. Continuous Batching: a diferença entre 30% e 80% de utilização de GPU

Batching é a técnica de processar múltiplas requisições simultaneamente em um único forward pass da GPU. Sem batching, a GPU fica ociosa esperando uma requisição terminar para começar a próxima. Com batching, a GPU processa 8, 16, 32 requisições ao mesmo tempo, mantendo os tensores ocupados.

O problema do batching tradicional (estático) é que ele espera completar o batch inteiro antes de devolver resultados. Como a geração de tokens é autoregressiva e cada requisição tem comprimento diferente, a requisição mais curta fica esperando a mais longa terminar, desperdiçando GPU.

**Continuous batching** resolve isso: ao invés de esperar o batch terminar, o servidor insere e remove requisições dinamicamente a cada step. Assim que uma requisição termina, seu slot é preenchido por outra da fila. O resultado é que a GPU nunca fica ociosa esperando batch completar. O vLLM implementou continuous batching com PagedAttention e se tornou o padrão de mercado. O TensorRT-LLM da NVIDIA oferece implementação equivalente otimizada para GPUs Hopper e Blackwell.

| Configuração | Throughput (tokens/s) | Latência p99 | Utilização GPU |
|---|---|---|---|
| Sem batching (1 req por vez) | ~500 | Baixa | 20-30% |
| Batching estático (batch=16) | ~3.000 | Média-alta | 40-50% |
| Continuous batching (vLLM) | ~8.000 | Média | 70-80% |
| Continuous batching + PagedAttention | ~10.000 | Média | 75-85% |

Os números acima são aproximados e variam por modelo, GPU e distribuição de prompt, mas a relação é consistente: continuous batching entrega **2 a 3 vezes mais throughput** que batching estático na maioria dos workloads de decoder (GMI Cloud, 2026).

**Armadilha de produção:** batching troca latência por throughput. Batches maiores aumentam tokens por segundo, mas empurram a latência p99 para cima. Se você roda um agente de voz em tempo real com requisito de sub-100ms, batching agressivo quebra a experiência. Para workloads interativos de chat, o sweet spot fica em max_num_seqs entre 16 e 64, com max_num_batched_tokens entre 4.096 e 8.192. Para jobs assíncronos (sumarização, processamento em batch), pode ir a 128+ sem remorso. Meça com distribuição realista de prompts, não com benchmark sintético de comprimento fixo.

## 4. Speculative Decoding: 2x de speedup sem perder qualidade

Speculative decoding é a técnica mais elegante de aceleração de inferência lançada nos últimos anos. A ideia é simples: um modelo rascunho (draft model) pequeno e rápido propõe múltiplos tokens por vez, e o modelo grande (target model) verifica esses tokens em um único forward pass paralelo. Se o rascunho acertou, você ganhou 4, 8 ou 16 tokens de graça. Se errou, descarta e continua normally. O ponto-chave é que a verificação é matematicamente **lossless**: a distribuição de saída é idêntica à do modelo sem speculative decoding (EAGLE, 2024).

O EAGLE, método de speculative decoding certificado por avaliação de terceiros como o mais rápido disponível, alcança **2x speedup** no gpt-fast, **3x mais rápido** que decoding vanilla em modelos de 13B e **1.6x mais rápido** que Medusa (EAGLE/GitHub, 2024). Um benchmark independente publicado em 2025 testou Qwen3-32B com e sem speculative decoding e obteve **1.82x speedup** em throughput de geração de tokens, mantendo qualidade de saída idêntica (Ovidiu Dan, 2025).

O paper de Cai e colegas, apresentado no ICLR 2026, realizou o primeiro benchmark sistemático de speculative decoding em inferência de produção com vLLM (Cai et al., 2026, arXiv:2509.04474). Os achados principais:

1. A verificação pelo modelo grande continua sendo o custo dominante. O modelo de rascunho é barato, mas o modelo alvo precisa processar todos os tokens propostos.
2. A taxa de aceitação (quantos tokens do rascunho são aceitos) é o fator que determina o speedup real. Em workloads com alta repetição (sumarização, formatação), a aceitação pode chegar a 80%. Em reasoning criativo, cai para 30-40%.
3. Em batch sizes altos (32+ requisições concorrentes), o speedup do speculative decoding diminui porque a GPU já está ocupada. O ganho maior aparece em batch sizes baixos e médios (1-16).

| Cenário | Speedup típico | Taxa de aceitação | Quando usar |
|---|---|---|---|
| Chat interativo (batch 1-4) | 2-3x | 60-80% | Sempre que possível |
| Serving com batch médio (8-32) | 1.5-2x | 50-70% | Recomendado |
| Alto throughput (batch 64+) | 1.1-1.3x | 40-60% | Ganho marginal |
| Reasoning complexo (chain-of-thought) | 1.3-1.8x | 30-50% | Avaliar caso a caso |

**Armadilha de produção:** speculative decoding exige um modelo de rascunho compatível com o modelo alvo. Se o rascunho diverge do alvo na distribuição de tokens, a taxa de aceitação despenca e o overhead de compute supera o ganho. A regra prática é usar um rascunho da mesma família (ex: Llama-3.1-1B como rascunho para Llama-3.1-70B). Modelos de rascunho cross-family raramente funcionam. Além disso, speculative decoding aumenta o uso de VRAM (precisa carregar dois modelos), o que pode reduzir o espaço para KV cache. É uma troca: mais compute por token, menos tokens gerados. Meça antes de adotar.

## 5. Smart Routing: pague preço de frontier só quando precisa

A quinta alavanca não otimiza a inferência em si, otimiza **qual modelo** faz a inferência. Smart routing envia cada requisição para o modelo mais barato que ainda atende ao requisito de qualidade. Se 70% das queries de um chatbot de suporte são perguntas repetitivas que um modelo de 8B resolve, não há razão para mandar para GPT-5 ou Claude Opus.

A análise da Mavik Labs mostra que em tráfego misto (perguntas fáceis e difíceis), smart routing reduz custo blended em **40% a 70%** (Mavik Labs, 2026). A implementação tem três caminhos:

1. **Router por regras:** classificação simples por regex, keyword ou intenção. Se a query menciona "fatura", manda para o modelo especialista em financeiro. Rápido, determinístico, fácil de manter.
2. **Router por classificador:** um modelo pequeno (1-3B) classifica a dificuldade da query e roteia. Mais flexível, mas adiciona latência e um ponto de falha.
3. **Router por confiança:** manda tudo para o modelo pequeno. Se a confiança da resposta está abaixo de um threshold, escala para o modelo maior. Elegant, mas exige um bom calibration set.

| Padrão de tráfego | Redução de custo | Complexidade de implementação |
|---|---|---|
| Suporte ao cliente (mix fácil + difícil) | 40-70% | Média |
| Code completion (small + frontier fallback) | 30-50% | Média-alta |
| Tráfego uniforme (todas as queries iguais) | < 10% | Baixa (não vale a pena) |
| Sumarização em batch | 50-60% | Baixa |

**Armadilha de produção:** smart routing sem evals é uma bomba relógio. Um router que manda queries difíceis para um modelo fraco degrada silenciosamente a qualidade. Ninguém percebe até os usuários reclamarem. A solução é manter um hold-out set de 200-500 queries representativas com rótulos de qualidade, e re-rodar o eval sempre que mudar modelo, threshold ou router. Sem isso, routing vira uma forma cara de piorar o produto.

## 6. O custo real no Brasil: um cálculo que poucos fazem

Com as cinco alavancas mapeadas, é hora de juntar tudo e calcular o custo real de inferência no contexto brasileiro. Considere dois cenários:

**Cenário A: startup ingênua** roda Llama-3.1-70B em FP16 numa GPU H100 alugada na AWS (US$ 4,10/hora em São Paulo, região sa-east-1), sem quantização, sem prefix caching, batching estático em batch=4, sem speculative decoding, sem routing. Utilização de GPU: ~30%. Throughput efetivo: ~600 tokens/s. Custo por milhão de tokens: **US$ 1,90**.

**Cenário B: equipe otimizada** roda o mesmo Llama-3.1-70B em INT4 (W4A16) numa RTX 4090 local (comprada, não alugada), com PagedAttention, continuous batching (max_num_seqs=32), prefix caching ativado, speculative decoding com Llama-3.1-1B como rascunho, e smart routing mandando 60% do tráfego para Llama-3.1-8B. Utilização de GPU: ~75%. Throughput efetivo: ~4.500 tokens/s. Custo por milhão de tokens: **US$ 0,15**.

A diferença é **12,6 vezes**. No cenário A, processar 100 milhões de tokens por mês (um produto SaaS com 10 mil usuários) custa US$ 190/mês só de GPU. No cenário B, custa US$ 15/mês. Em escala, a diferença paga a GPU em semanas.

A tabela abaixo resume o impacto cumulativo de cada técnica, com números baseados em benchmarks publicados:

| Técnica | Redução de custo (cumulativa) | Esforço de implementação |
|---|---|---|
| Sem otimização (baseline) | 0% | Nenhum |
| + Quantização INT4 | ~50% | Baixa |
| + PagedAttention + prefix caching | ~65% | Baixa (nativo no vLLM) |
| + Continuous batching | ~75% | Baixa (nativo no vLLM) |
| + Speculative decoding | ~82% | Média |
| + Smart routing | ~87% | Média-alta |

Esses números são aproximados e os ganhos se sobrepõem de forma não-aditiva. Mas a direção é clara: cada camada de otimização compõe com as anteriores, e o efeito cumulativo é o que separa um deploy caro de um deploy sustentável.

## 7. Recomendações de deploy para o mercado brasileiro

Para empresas e órgãos públicos brasileiros que querem rodar IA generativa com custo controlado, as recomendações práticas são:

**Comece com quantização.** É a alavanca de maior impacto com menor esforço. Se a GPU é H100 ou superior, use FP8. Se é A100 ou RTX 4090, use INT8 com calibração. Se é uma GPU de consumo com 24GB de VRAM (RTX 3090/4090), use INT4 (GPTQ ou AWQ). Avalie qualidade com um benchmark relevante ao seu domínio antes de confatar.

**Use vLLM com configuração padrão.** O vLLM já vem com PagedAttention, continuous batching e prefix caching nativos. A configuração padrão é excelente para 90% dos casos. Os parâmetros que valem ajustar são max_num_seqs (comece com 32), max_num_batched_tokens (4.096 a 8.192) e gpu_memory_utilization (0,90 é seguro na maioria das GPUs).

**Avalie speculative decoding se latência importa.** Se o produto é chat interativo com baixo batch, o speedup de 2x é diretamente perceptível. Se é processamento em batch assíncrono, o ganho é marginal e pode não valer a complexidade.

**Implemente smart routing só com evals.** Sem um conjunto de avaliação com pelo menos 200 queries representativas e rótulos de qualidade, routing é uma aposta cega. Com evals, é a alavanca que mais reduz custo blended em tráfego misto.

**Considere on-premise para escala.** Para volumes acima de 50 milhões de tokens/mês, comprar GPUs (RTX 4090 a US$ 1.500 ou H100 a US$ 30.000) é mais barato que alugar. Uma RTX 4090 roda Llama-3.1-70B em INT4 a 1.500-2.000 tokens/s com qualidade próxima ao FP16. O break-even com cloud chega em 3-6 meses dependendo do volume.

**Monitore custo por tenant.** Quando você empilha caching, batching e routing, o custo por requisição varia por uma ordem de magnitude. Sem atribuição por tenant, não dá saber se um cliente está consumindo mais recursos do que paga. Implemente logging de cache hit, batch size e modelo usado em cada requisição.

## 8. Conclusão: otimização é estratégia, não detalhe técnico

O colapso de 1.000x no custo de inferência de LLMs não chegou automaticamente às empresas brasileiras. Ele chegou para quem configura a infraestrutura corretamente. A diferença entre pagar US$ 1,90 e US$ 0,15 por milhão de tokens não é o modelo, é o deploy. As cinco alavancas mapeadas aqui (quantização, KV cache, continuous batching, speculative decoding e smart routing) são todas open-source, documentadas e disponíveis hoje. Nenhuma exige pesquisa de ponta nem hardware proprietário.

A questão estratégica é simples: em um mercado onde a IA generativa está se tornando commodity, a vantagem competitiva não está em ter o maior modelo, está em ter a maior eficiência por token. Empresas que dominam a otimização de inferência ganham margem para oferecer preços mais baixos, servir mais usuários e investir em diferenciação de produto. Empresas que não dominam ficam reféns de pricing de API externo e margens comprimidas.

Na BaXiJen, apostamos em IA local, modelos open-source quantizados e otimização de inferência desde o primeiro deploy. Não porque é ideológico, porque é matemática. Cada real poupado em inferência é um real investido em produto. E no mercado brasileiro, onde cada real importa, isso é o que separa quem escala de quem fecha.

---

## Referências

- Awesome Agents (2026). *LLM Quantization Impact Leaderboard 2026: INT4 vs FP16*. awesomeagents.ai
- Cai, Z. et al. (2026). *Scaling Up, Speeding Up: A Benchmark of Speculative Decoding for LLM Test-Time Scaling*. ICLR 2026. arXiv:2509.04474
- EAGLE (2024). *Official Implementation of EAGLE-1*. GitHub: SafeAILab/EAGLE. ICML 2024.
- GMI Cloud (2026). *Cutting LLM Inference Costs in 2026: Where Caching, Batching, and Smart Routing Actually Pay Off*. gmicloud.ai
- GPUNex (2026). *AI Inference Economics: The 1,000× Cost Collapse Reshaping GPUs*. gpunex.com
- Kurtić, E. et al. (2025). *"Give Me BF16 or Give Me Death"? Accuracy-Performance Trade-Offs in LLM Quantization*. arXiv:2411.02355. Red Hat AI & IST Austria.
- Mavik Labs (2026). *LLM Cost Optimization in 2026: Routing, Caching, and Batching*. maviklabs.com
- Ovidiu Dan (2025). *Speeding up local LLM inference 2x with Speculative Decoding*. ovidiudan.com
- Redwerk (2025). *LLM Inference Optimization Techniques*. redwerk.com
- Singh, T. et al. (2026). *KV Cache Optimization Strategies for Scalable and Efficient LLM Inference*. arXiv:2603.20397.
- The AI Engineer (2026). *Quantization in Practice: GPTQ vs AWQ vs GGUF*. theaiengineer.substack.com
- vLLM (2025). *Optimization and Tuning Documentation*. docs.vllm.ai