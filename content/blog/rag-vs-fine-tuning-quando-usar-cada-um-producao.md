---
title: "RAG vs Fine-tuning: Quando Usar Cada Um em Produção"
description: "Guia prático com dados reais para escolher entre RAG e fine-tuning em sistemas de IA. Benchmarks, custos, latência e a abordagem híbrida RAFT explicados com números verificáveis."
date: "2026-06-04"
author: "Leonardo Camilo"
authorRole: "CEO / Tech Lead"
tags: ["RAG", "fine-tuning", "LLM", "produção", "RAFT", "SLM", "IA brasileira"]
featured: false
image: "/blog/rag-vs-fine-tuning.png"
imageAlt: "Comparativo visual entre RAG e Fine-tuning: pipeline de retrieval vs atualização de pesos do modelo"
---

# RAG vs Fine-tuning: Quando Usar Cada Um em Produção

Todo time que sobe um LLM em produção esbarra na mesma pergunta: "Colocamos RAG ou fazemos fine-tuning?" A resposta correta depende de uma distinção que parece simples, mas que a maioria erra: **RAG muda o que o modelo sabe; fine-tuning muda como o modelo se comporta.** Confundir os dois é o erro mais caro que você pode cometer na arquitetura do seu sistema.

Este post traz números reais de benchmarks, custos e latência para que você decida com dados, não com intuição.

## O problema que os dois resolvem (e por que não são intercambiáveis)

Um modelo de linguagem pré-treinado como Llama 3.3, Qwen 2.5 ou GPT-4o é genérico por projeto. Ele não conhece seus documentos internos, seus processos, sua terminologia. Existem duas formas de injetar conhecimento de domínio:

1. **RAG (Retrieval-Augmented Generation):** no momento da consulta, busca trechos relevantes em uma base de conhecimento externa e os injeta no contexto do modelo antes da geração. Os pesos permanecem intactos.

2. **Fine-tuning:** treina o modelo em um dataset curado de pares entrada-saída, atualizando os pesos para que ele gere respostas mais alinhadas ao domínio. O conhecimento fica congelado no momento do treino.

A diferença fundamental: RAG atualiza o conhecimento em tempo real (basta ingerir um novo documento). Fine-tuning exige re-treino a cada mudança de dados. Se sua base de conhecimento muda semanalmente, fine-tuning vira um custo recorrente. RAG não.

## Dados de adoção: por que RAG dominou o mercado enterprise

O relatório **Menlo Ventures 2024 State of Generative AI in the Enterprise**, baseado em pesquisa com 600 decisores de TI nos EUA, revela que **51% das implantações enterprise de IA generativa usam RAG**, contra uma fração muito menor que usa fine-tuning como estratégia primária (Menlo Ventures, 2024). O gasto total com IA generativa enterprise saltou de US$ 2,3 bilhões para US$ 13,8 bilhões entre 2023 e 2024, um aumento de 6x, e RAG é a arquitetura dominante nesse crescimento.

A razão é prática: equipes que começam com fine-tuning frequentemente migram para RAG ao se deparar com o custo de re-treino a cada atualização de dados. O benchmark da **Galileo AI (2025)** reporta que **78% dos times que inicialmente escolheram fine-tuning migraram para RAG dentro de 9 meses** após столкнуться com problemas de desatualização do conhecimento (Galileo AI, 2025).

## Comparativo lado a lado: RAG vs Fine-tuning

| Dimensão | RAG | Fine-tuning |
|---|---|---|
| **O que muda** | O que o modelo sabe no momento da consulta | Como o modelo se comporta |
| **Ciclo de atualização** | Tempo real (ingerir novo doc = pronto) | Re-treino (horas a dias) |
| **Custo por mudança** | Custo de embedding apenas | US$ 500 a US$ 5.000 por run de treino |
| **Freshness dos dados** | Ao vivo | Congelado no momento do treino |
| **Risco de alucinação** | Menor (quando retrieval é bom) | Igual ao modelo base |
| **Explicabilidade** | Alta (pode mostrar fontes) | Baixa (pesos são opacos) |
| **Latência adicional** | 50 a 300 ms para retrieval | Nenhuma na inferência |
| **Complexidade de setup** | Média (chunking, embeddings, vector store) | Alta (preparo de dados, infra de treino, evals) |
| **Melhor para** | Docs proprietários, fatos atualizados | Tom, formato, skills específicas, edge deployment |
| **Vendor lock-in** | Baixo (troca de LLM livre) | Alto (presa à versão do modelo base) |

## Custos reais em produção: os números

### RAG (por 1.000 queries, modelo classe GPT-4)

| Componente | Custo típico |
|---|---|
| Embedding da query | US$ 0,001 a US$ 0,005 |
| Busca vetorial (ex: Qdrant) | US$ 0 a US$ 0,05 (self-hosted vs cloud) |
| Geração LLM com 2K tokens retrieved | US$ 0,10 a US$ 1,50 |
| **Total** | **US$ 0,10 a US$ 1,55 por 1K queries** |

### Fine-tuning (por run de treino, pricing OpenAI 2025)

| Componente | Custo típico |
|---|---|
| Preparação de dados (1K a 10K exemplos) | 10 a 40 horas de engenharia |
| gpt-4.1-mini fine-tuning (10M tokens) | US$ 250 a US$ 900 |
| gpt-4.1 fine-tuning (10M tokens) | US$ 2.500 a US$ 5.000 |
| LoRA em 70B open-source (8x H100, 4h) | US$ 200 a US$ 600 em GPU |
| Infra de avaliação e rollback | 20 a 60 horas de engenharia |

Se sua base de conhecimento atualiza semanalmente, o fine-tuning exige essa run de treino toda semana. RAG custa o mesmo por query independente da idade dos dados.

## Quando fine-tuning é a escolha certa

Fine-tuning não é obsoleto. Ele resolve problemas que RAG não alcança:

1. **Mudança de comportamento, não de conhecimento.** Se você precisa que o modelo responda em um formato específico (JSON estruturado, linguagem jurídica, tom de marca), fine-tuning ensina o "como", não o "quê".

2. **Edge deployment e inferência offline.** Quando não há conectividade para retrieval (dispositivos IoT, ambientes air-gapped), o conhecimento precisa estar nos pesos.

3. **Redução de latência crítica.** Em aplicações de alta frequência (trading, detecção de fraude em tempo real), os 50 a 300 ms do retrieval podem ser inaceitáveis. Fine-tuning elimina essa latência.

4. **Compressão de instruções complexas.** System prompts longos (>2K tokens) são caros por query. Fine-tuning bakes essas instruções nos pesos, economizando tokens em cada chamada.

## A abordagem híbrida: RAFT

E se você precisa de ambos? Conhecimento atualizado E comportamento controlado?

É aí que entra o **RAFT (Retrieval-Augmented Fine-Tuning)**, proposto por Zhang et al. (2024) na UC Berkeley. O RAFT treina o modelo em um cenário "open-book": durante o fine-tuning, o modelo recebe tanto documentos relevantes (oracle) quanto documentos de distração (distractor), aprendendo a filtrar informações úteis dentro de um contexto ruidoso.

O resultado: um modelo que sabe como se comportar (fine-tuning) e que também sabe usar retrieval de forma eficaz (RAG). Em benchmarks de question-answering em domínio, RAFT superou tanto RAG puro quanto fine-tuning puro.

A ressalva: RAFT só compensa em **domínios regulados ou de altíssimo volume de queries**, onde tanto a ancoragem em fontes verificáveis quanto o comportamento estrito do modelo são requisitos não negociáveis. Para a maioria dos casos, RAG puro é suficiente e significativamente mais simples de manter.

## Árvore de decisão prática

Para times em produção, esta heurística resolve 90% dos casos:

1. **Seu dado muda com frequência (diário/semanal)?** Use RAG. Fine-tuning vai te custar re-treinos constantes.

2. **Você precisa mudar o tom ou formato da resposta, não o conteúdo?** Use fine-tuning. RAG não ensina estilo.

3. **Você precisa de ambos (dado fresco + comportamento controlado)?** Considere RAFT, mas só se o volume justificar a complexidade.

4. **Seu deployment é offline/edge?** Fine-tuning é a única opção viável.

5. **Você precisa mostrar fontes ao usuário?** RAG. Fine-tuning não rastreia proveniência.

## Conexão Brasil: por que isso importa para IA soberana

No Brasil, a escolha entre RAG e fine-tuning tem implicações estratégicas. Instituições públicas que usam IA (como é o caso do BXat da BaXiJen) lidam com:

- **Dados que mudam constantemente:** Diário Oficial, portarias, legislação. Fine-tuning congelado é inviável.
- **Obrigação de rastreabilidade:** O gestor público precisa saber de qual fonte a resposta veio. RAG permite citar o documento exato.
- **Soberania de dados:** Com RAG, o conhecimento fica em uma base vetorial que você controla, on-premise. Com fine-tuning em APIs externas, seus dados treinam modelos de terceiros.

Na prática, para o setor público brasileiro, **RAG é a arquitetura padrão** por questões de transparência, atualização e soberania. Fine-tuning entra como complemento para ajuste de tom e formatação de respostas, não como fonte de conhecimento.

## Lições da produção

Na BaXiJen, aprendemos estas lições operando SLMs para gestão pública:

- **Comece por RAG.** Sempre. É mais simples de iterar, mais barato de manter, e mais transparente para o usuário final.
- **Adicione fine-tuning só quando RAG não resolve.** Normalmente para ajuste de formato de saída ou redução de latência em queries de altíssima frequência.
- **Não subestime o custo de manutenção do fine-tuning.** O custo de infra de treino é só a ponta do iceberg. O custo real está na curadoria de dados, na avaliação de qualidade e no rollback quando algo sai errado.
- **Medida é tudo.** Sem métricas de retrieval (precision@k, recall, MRR) e de geração (faithfulness, relevance), você está operando no escuro. Invista em evals antes de investir em mais infra.

## Próximos passos

Se você está decidindo entre RAG e fine-tuning, comece aqui:

1. Mapeie com que frequência seu conhecimento muda. Se for mais que mensal, RAG é a escolha.
2. Liste o que você realmente precisa: conhecimento atualizado ou comportamento específico? São problemas diferentes com soluções diferentes.
3. Se precisar de ambos, avalie RAFT, mas comece com RAG e adicione fine-tuning iterativamente.
4. Investir em evals e métricas de qualidade antes de expandir a arquitetura.

## Referências

1. Menlo Ventures. *2024: The State of Generative AI in the Enterprise*. Menlo Ventures, 2024. Disponível em: https://menlovc.com/2024-the-state-of-generative-ai-in-the-enterprise/

2. Zhang, T. et al. *RAFT: Adapting Language Model to Domain Specific RAG*. arXiv:2403.10131, 2024. Disponível em: https://arxiv.org/abs/2403.10131

3. Gao, Y. et al. *Retrieval-Augmented Generation for Large Language Models: A Survey*. arXiv:2312.10997, 2023. Disponível em: https://arxiv.org/abs/2312.10997

4. Fan, W. et al. *A Survey on RAG Meeting LLMs: Towards Retrieval-Augmented Large Language Models*. Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining, 2024. DOI: 10.1145/3637528.3671470

5. Wang, X. et al. *Searching for Best Practices in Retrieval-Augmented Generation*. Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing (EMNLP), 2024. DOI: 10.18653/v1/2024.emnlp-main.981

6. Galileo AI. *2025 LLM Benchmark Report: Enterprise RAG vs Fine-tuning Adoption*. Galileo AI, 2025.

7. Kresevic, S. et al. *Optimization of hepatological clinical guidelines interpretation by large language models: a retrieval augmented generation-based framework*. npj Digital Medicine, 2024. DOI: 10.1038/s41746-024-01091-y