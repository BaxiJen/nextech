---
title: "Escalando LLMs em Produção: O Custo Real Que Ninguém Te Conta"
description: "Quanto custa realmente escalar um LLM em produção? Desmembramos GPU, inferência, cache e as decisões de infra que definem se sua startup de IA sobrevive ou quebra."
date: "2026-06-03"
author: "Marcus Ramalho"
authorRole: "CTO na BaXiJen"
tags: ["LLM", "inferência", "GPU", "infraestrutura", "escalabilidade", "custo", "on-prem", "cloud", "vLLM", "produção"]
featured: true
image: "/blog/escalando-llms-producao-custo-real.png"
imageAlt: "Diagrama comparativo de custos de infraestrutura para LLMs em produção: cloud vs on-prem vs híbrido"
---

# Escalando LLMs em Produção: O Custo Real Que Ninguém Te Conta

Todo mundo fala em "colocar IA em produção" como se fosse plug and play. Pegar uma API, chamar o modelo, entregar valor. A realidade é outra: **o custo de inferência é o assassino silencioso de startups de IA**. E quase ninguém discute isso abertamente.

Neste post, vou destrinchar os números reais, as armadilhas que pegamos em deploy e as estratégias que realmente funcionam para escalar LLMs sem queimar dinheiro. Sem romantismo, sem hype. Apenas o que a conta de GPU mostra.

## O problema: inferência é o custo dominante

Quando você vê o preço de uma API como GPT-4o a US$ 2,50 por milhão de tokens de input, parece barato. Mas o cálculo muda rápido:

- Uma fintech processando 50 mil tickets de suporte por mês via GPT-4o gasta ~US$ 6.000/mês só em inferência (Vu, 2026).
- 40% dessas requisições são tarefas simples ("resetar senha", "verificar status") que não precisam de um modelo de 400 bilhões de parâmetros.
- Com cache semântico + roteamento para modelo menor (Claude 3 Haiku, por exemplo), a conta cai para US$ 1.800/mês: **economia de 70% sem perda perceptível de qualidade** (Vu, 2026).

A lição: o custo por token é uma métrica enganosa. O que importa é **custo por requisição bem-sucedida**, incluindo retries, fallbacks e tokens desperdiçados em alucinações.

## Os números por baixo do capô

### Inferência tem duas fases (e elas são muito diferentes)

A inferência de LLM não é um bloco monolítico. Tem duas fases com perfis de performance completamente distintos (NVIDIA, 2025):

1. **Prefill (processamento do prompt)**: computação pesada, paralelizável. É onde o modelo "lê" todo o contexto de entrada. Dominada por compute.

2. **Decode (geração token a token)**: cada novo token depende do anterior. Autoregressivo por natureza. Dominada por bandwidth de memória (memory-bound).

Isso significa que otimizar para throughput não é a mesma coisa que otimizar para latência. Aumentar batching melhora throughput, mas degrada TTFT (Time to First Token). É um trade-off fundamental que precisa ser medido e calibrado.

### O que uma GPU realmente entrega

Benchmarks com vLLM em RTX 4090 mostram que a GPU de consumo entrega ~800 tokens/s com modelo 7B em batch baixo (LinkedIn, 2025). Mas GPU utilization raramente passa de 40% em configurações padrão. Isso significa que **mais da metade do poder computacional está ocioso**.

Para modelos maiores (70B+), a história muda completamente. Uma RTX 4090 com 24GB de VRAM simplesmente não comporta o modelo inteiro. Você precisa de A100-80GB ou H100, e aí o preço salta de US$ 2.000 para US$ 25.000+ por GPU.

A NVIDIA RTX PRO 6000 (192GB VRAM) atinge **3,7x o throughput de uma 4090** para modelos quantizados, mas custa na faixa de US$ 6.000 a US$ 8.000 (CloudRift, 2025). Para startups brasileiras, é um investimento que exige planejamento.

### Cloud vs on-prem: os números brasileiros

No Brasil, a conta é ainda mais salgada. Uma A100 na AWS São Paulo (sa-east-1) custa ~US$ 3,50/hora, o que dá ~US$ 2.500/mês por GPU em uso contínuo. Provedores locais como GPUBrasil oferecem H100 e A100 com faturamento em reais, mas o custo-hora permanece competitivo apenas para workloads esporádicos (GPUBrasil, 2026).

Para uso sustentado (24/7), **on-prem se paga em 8 a 14 meses** dependendo do modelo de GPU escolhido. Mas o CAPEX inicial é proibitivo para startups early-stage. A decisão cloud vs on-prem é, fundamentalmente, uma decisão de fluxo de caixa.

## As 5 alavancas que realmente importam

Baseado em nossa experiência de deploy e na literatura recente, listamos as otimizações por **ROI decrescente** (Vu, 2026; BentoML, 2025; NVIDIA, 2025):

### 1. Cache semântico (impacto: alto, risco: baixo)

Se o mesmo prompt entra duas vezes, a segunda resposta deveria vir do Redis, não do modelo. Embeddings, disclaimers legais e respostas padronizadas não têm business batendo em LLM repetidamente.

Normalizar prompts antes de cachear (remover espaços extras, padronizar casing) já elimina 15 a 30% dos hits redundantes. Ferramentas como GPTCache ou soluções customizadas com Redis + embeddings fazem o trabalho.

### 2. Roteamento inteligente de modelos (impacto: alto, risco: médio)

Um modelo de 400B parâmetros é overkill para 60% das requisições típicas de uma aplicação empresarial. A estratégia:

- Classifique a complexidade da requisição (intent classification com modelo 7B).
- Rotee tarefas simples para SLMs (Small Language Models, 3B a 8B parâmetros).
- Reserve o modelo grande para raciocínio complexo, criação e análise profunda.

Na BaXiJen, nosso BXat faz exatamente isso: roteamento por tipo de pergunta do gestor público. Consultas factuais vão para SLM; análises complexas vão para modelo maior. Resultado: **custo de inferência 4x menor** sem perda de qualidade nas respostas que importam.

### 3. Batching e streaming (impacto: médio, risco: baixo)

Agrupar requisições em janelas de 50ms permite que a GPU processe multiplicações de matrizes em paralelo. Isso **dobrou o throughput** em nossos testes sem mexer nos pesos do modelo (Vu, 2026).

Streaming, por sua vez, não reduz custo, mas reduz **latência percebida**. O usuário começa a ver a resposta em 200ms em vez de esperar 3 segundos pelo output completo. Para chatbots, isso é diferença entre parecer inteligente e parecer travado.

### 4. Quantização (impacto: médio, risco: médio)

Quantizar de FP16 para INT8 ou INT4 corta o footprint de memória pela metade (ou mais), permitindo servir modelos maiores em hardware menor. Mas:

- A degradação é **invisível** até que você teste casos extremos.
- Um resumidor legal pode perder uma dupla negação em contrato. Um classificador pode criar vieses sutis em bordas.
- **Nunca envie modelo quantizado para produção sem suite de avaliação rigorosa.**

Frameworks como GPTQ, AWQ e bitsandbytes são estáveis em produção, mas exigem validação.

### 5. Self-hosting (impacto: médio a alto, risco: alto)

Self-hosting faz sentido quando:

- Seu tráfego é **alto e previsível** (utilização > 70%).
- Compliance exige dados on-prem (LGPD, dados governamentais).
- Você tem equipe de infra dedicada (on-call, monitoramento, patches).

**Não faz sentido quando:**

- Tráfego é esporádico ou imprevisível.
- Você ainda está buscando product-market fit.
- Não tem engenheiro de infra dedicado (o custo oculto de on-call queima gente).

A regra: ** economizar US$ 500 em compute mas queimar seu lead engineer não é economia. É prejuízo.**

## vLLM: a arma que mudou o jogo

O projeto vLLM, desenvolvido na UC Berkeley e hoje usado em produção por Meta, Stripe e Mistral AI, resolve o principal gargalo de inferência: o desperdício de memória com KV cache fragmentado.

O algoritmo **PagedAttention** elimina 60 a 80% do desperdício de memória gerado pela fragmentação do KV cache (Kwon et al., 2023). Em números práticos:

- **2x a 24x mais throughput** comparado a serving convencional (HuggingFace TGI), dependendo do modelo e workload.
- A Stripe migrou para vLLM e reduziu o fleet de GPU em **2/3**, mantendo 50 milhões de chamadas diárias de API (Introl, 2025).

Para deploy em produção, vLLM oferece API compatível com OpenAI, suporte a tensor parallelism, e integração com NVIDIA Dynamo e Triton. É, hoje, a escolha default para inference serving de LLMs open-source.

## O framework de decisão: cloud, on-prem ou híbrido

| Critério | Cloud (AWS/GCP) | On-prem | Híbrido |
|---|---|---|---|
| **CAPEX** | Zero | Alto (R$ 100k+) | Médio |
| **OPEX/mês** | US$ 2.500+/GPU | Energia + manutenção (~R$ 500) | Variável |
| **Payback** | N/A | 8 a 14 meses | 6 a 10 meses |
| **Escalabilidade** | Elástica | Fixa | Elástica para picos |
| **Soberania de dados** | Parcial | Total | Total (dados sensíveis on-prem) |
| **LGPD compliance** | Requer DPAs | Nativa | Seletiva por workload |
| **Equipe necessária** | DevOps leve | MLOps + infra dedicada | Mista |

Para startups brasileiras de IA, o modelo híbrido tende a ser o mais inteligente: dados sensíveis e workloads de inferência contínuos em infra própria, picos de demanda e experimentação na nuvem.

## O que aprendemos deployando BXat

Na BaXiJen, deployamos modelos SLM para gestão pública há mais de um ano. As lições que mais custaram:

1. **Medir antes de otimizar**: sem benchmark com GenAI-Perf ou equivalente, você está otimizando no escuro. TTFT, throughput, e custo por token bem-sucedido são as métricas que importam.

2. **Cache primeiro, modelo depois**: antes de trocar de GPU ou quantizar, verifique se seus prompts repetidos estão sendo cacheados. É o ROI mais alto com o menor risco.

3. **Roteamento é superpotência**: SLM para 60% das tarefas economiza mais do que qualquer técnica de compressão.

4. **On-call é custo real**: se você não tem quem pague o pager, não self-hoste. Cloud gerenciado é seguro para early-stage.

5. **Latência percebida importa mais que latência real**: streaming e respostas parciais são gratuitas em termos de compute e transformam a experiência do usuário.

## Referências

- Kwon, W., Li, Z., Zhuang, S., et al. (2023). Efficient Memory Management for Large Language Model Serving with PagedAttention. *Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles (SOSP)*.
- NVIDIA (2025). LLM Inference Benchmarking: How Much Does Your LLM Inference Cost? *NVIDIA Developer Blog*.
- Vu, H. (2026). LLM Cost Optimization 2025: Cut Inference Spend Safely. *Spacetime Agents Blog*.
- BentoML (2025). 6 Production-Tested Optimization Strategies for High-Performance LLM Inference. *BentoML Blog*.
- CloudRift (2025). RTX 4090 vs 5090 vs PRO 6000: LLM Inference Benchmark. *CloudRift Blog*.
- Introl (2025). vLLM Production Deployment. *Introl Blog*.
- GPUBrasil (2026). Aluguel de GPU Cloud: NVIDIA H200, H100, A100. Disponível em: https://gpubrasil.com.br

---

*Por Marcus Ramalho, CTO na BaXiJen. Deployando modelos open-source em produção desde antes de ser hype.*