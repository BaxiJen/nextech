---
title: "RAG em Produção: Pipeline de Retrieval que Funciona de Verdade"
description: "A maioria dos pipelines de RAG falha na hora de recuperar informação, não na geração. Analisamos por que naive RAG quebra em produção e apresentamos as arquiteturas que realmente funcionam: chunking hierárquico, busca híbrida BM25+vetorial, reranking com cross-encoder e avaliação com RAGAS, com números e benchmarks reais."
date: "2026-05-19"
author: "Marcus Ramalho"
authorRole: "CTO & Co-fundador, BaXiJen"
tags: ["RAG", "retrieval", "produção", "chunking", "reranking", "busca híbrida", "RAGAS", "SLM", "BXat"]
featured: true
image: "/blog/rag-producao-cover.png"
imageAlt: "Pipeline de RAG em produção: do chunking ao reranking"
---

Todo tutorial de RAG segue o mesmo roteiro: embede seus documentos, guarde num vector database, recupere os top-k, passe pro LLM. Funciona lindamente na demo. Depois, quando você coloca em produção com 50 mil documentos e queries reais de usuários, o sistema começa a alucinar com confiança. Não porque o modelo gerador é ruim, mas porque **a recuperação falhou primeiro**.

Análises de sistemas RAG em produção em 2025 e 2026 apontam consistentemente que, quando o sistema entrega uma resposta ruim, o ponto de falha é o retrieval em 73% dos casos, não a geração ([DigitalOcean, 2026](https://www.digitalocean.com/community/tutorials/why-rag-systems-fail-in-production); [Lushbinary, 2026](https://lushbinary.com/blog/rag-retrieval-augmented-generation-production-guide/)). O LLM não tem como gerar uma boa resposta se o contexto que recebeu é irrelevante ou incompleto.

Neste post, vamos dissecar os cinco pontos onde RAG quebra em produção e mostrar, com benchmarks e dados, o que realmente funciona para construir um pipeline de retrieval robusto. É o que construímos na BaXiJen para o BXat e é o que todo CTO deveria exigir antes de assinar "RAG" no roadmap.

## 1. Chunking: onde a maioria dos pipelines falha silenciosamente

Chunking parece simples: cortar texto em pedaços. Na prática, é a decisão de arquitetura com maior impacto na qualidade final do RAG, e a maioria dos times trata como afterthought.

Um estudo da Vectara apresentado no NAACL 2025 demonstrou que a estratégia de chunking tem impacto igual ou superior à escolha do modelo de embedding na qualidade final do retrieval ([Bhat et al., NAACL 2025](https://www.arxiv.org/pdf/2505.21700)). Em termos concretos: times que passam semanas escolhendo entre embedding models poderiam obter ganhos maiores simplesmente mudando a forma como cortam os documentos.

O benchmark interno da NVIDIA com 15 conjuntos de apresentações universitárias encontrou um resultado revelador: chunking hierárquico melhora a precisão das respostas de 61% para 89% em comparação com chunks de tamanho fixo ([NVIDIA Technical Blog, 2025](https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/)). A diferença não é incremental: é um salto de 28 pontos percentuais só mudando como você particiona o texto.

### Por que tamanho fixo falha

Chunking de tamanho fixo (por exemplo, 512 tokens com 50 de overlap) tem três problemas estruturais:

1. **Corte semântico**: uma frase pode ser cortada ao meio, uma tabela separada entre dois chunks, um parágrafo de conclusão isolado do argumento que sustenta. O chunk recuperado é tecnicamente relevante, mas praticamente inútil porque perdeu o contexto necessário para responder à pergunta.

2. **Poluição de contexto**: se o chunk é grande demais, ele dilui o sinal. O modelo recebe 10 chunks quando só 2 são relevantes, e gera uma resposta mediana porque faz a média de tudo.

3. **Perda de metadados**: chunking cego perde a estrutura hierárquica do documento (seção, subseção, tabela, nota de rodapé). Quando o usuário pergunta algo sobre "Seção 4.2.1", o sistema não sabe que aquele pedaço de texto pertence àquela seção.

### O que funciona: chunking hierárquico e semântico

**Chunking hierárquico** (parent-child) resolve a tensão entre precisão e contexto. A ideia é simples: indexe chunks pequenos e precisos (child), mas mantenha o contexto completo (parent) associado. Quando o sistema recupera um child relevante, ele pode opcionalmente incluir o parent para dar contexto ao gerador.

**Chunking semântico** detecta fronteiras de tópico usando similaridade de embedding entre sentenças consecutivas. Quando a similaridade cosseno cai abaixo de um limiar, um novo chunk começa. Isso garante que cada chunk seja semanticamente coeso.

**Tamanhos recomendados por tipo de documento** (baseado em benchmarks de 2025/2026):

| Tipo de documento | Tamanho do chunk | Overlap | Estratégia |
|---|---|---|---|
| Documentação/knowledge base | 512-1024 tokens | 128 tokens | Semântico + hierárquico |
| Código | Nível de função ou classe | N/A | AST parsing (nunca por caracteres) |
| Contratos/legais | Nível de cláusula | Parágrafo completo | Hierárquico (cláusula → seção) |
| Dados conversacionais | Nível de turno | 2 turnos de overlap | Semântico |
| Relatórios governamentais | 768 tokens | 256 tokens | Hierárquico com metadados de seção |

Sempre inclua metadados em cada chunk: documento de origem, título da seção, número da página e ID do chunk pai. Isso permite citação, filtragem e recuperação hierárquica.

## 2. Busca híbrida: BM25 + vetorial é o upgrade de maior ROI

Busca puramente vetorial (dense retrieval) é boa em similaridade semântica, mas perde correspondências exatas. Um usuário procurando por "Artigo 5º da Lei 13.709" ou "Processo SEI nº 12345" não vai encontrar nada com embedding: precisa de busca lexical. Busca puramente lexical (BM25), por outro lado, não entende que "remuneração" e "salário" podem ser a mesma coisa.

**Busca híbrida** combina as duas e é, consistentemente, o maior upgrade de qualidade que você pode fazer num pipeline RAG ingênuo.

O mecanismo padrão é executar BM25 e busca vetorial em paralelo, depois fundir os resultados com Reciprocal Rank Fusion (RRF). A fórmula do RRF é:

```
score(doc) = Σ 1 / (k + rank_i(doc))
```

Onde `k=60` é o padrão mais usado. Quanto menor o rank do documento em cada busca, maior o score. Isso penaliza documentos que aparecem só em uma das buscas e favorece os que são relevantes tanto lexical quanto semanticamente.

Weaviate e Elasticsearch oferecem busca híbrida nativa. Para Pinecone ou Qdrant, você precisa de um índice BM25 separado (OpenSearch, Typesense) e mesclar os resultados na camada de aplicação.

### Resultados práticos de busca híbrida

Estudos de produção mostram ganhos de 15-25% em métricas de recall@k e MRR (Mean Reciprocal Rank) quando se adiciona BM25 a um pipeline puramente vetorial, sem nenhuma mudança no modelo de embedding ou no gerador ([Fram, 2026](https://wearefram.com/blog/rag-pipeline/); [Redis, 2026](https://redis.io/blog/rag-at-scale/)). O custo adicional é mínimo: BM25 é computacionalmente barato e a fusão por RRF é O(n).

Para o BXat, que processa documentos governamentais com referências legais e identificadores numéricos (SEI, CPF, CNPJ, número de processo), busca híbrida não é opcional: é requisito. Um gestor público perguntando "qual o status do processo SEI 2024/00001-2" precisa de busca exata, não de similaridade semântica.

## 3. Reranking: o multiplicador de qualidade 10x

Depois que a busca híbrida recupera os top-50 documentos candidatos, um cross-encoder (reranker) reavalia cada par (query, documento) com atenção total, capturando nuances de relevância que nem embeddings nem BM25 conseguem sozinhos.

O padrão de produção em 2026 é: **recuperar top-50 com busca híbrida, rerankear para top-5, passar ao LLM**. Isso melhora consistentemente a qualidade das respostas em 15-30% nas métricas do RAGAS ([Es et al., EACL 2024](http://arxiv.org/abs/2309.15217v1); [Lushbinary, 2026](https://lushbinary.com/blog/rag-retrieval-augmented-generation-production-guide/)).

### Rerankers em produção (2026)

| Reranker | Custo | Latência | Melhor para |
|---|---|---|---|---|
| Cohere Rerank v3.5 | US$ 2/1K buscas | ~200ms | Accuracy/custo geral |
| Jina Reranker v2 | Self-hosted | ~400ms | Privacidade de dados, on-prem |
| Voyage Rerank | ~US$ 0.05/1K | ~300ms | Docs técnicos e código |
| ColBERT v2 | Self-hosted | ~100ms* | Grandes conjuntos de candidatos |

*Latência por query com índice pré-computado.

Para o caso brasileiro e de gestão pública, o **Jina Reranker v2** se destaca: é open-weight, roda on-premise, e processa documentos em português. Quando seus dados não podem sair da infraestrutura (LGPD, dados governamentais sensíveis), self-hosted não é luxo: é requisito.

### Como o reranking resolve a lacuna semântica

Um estudo da AI21 mostrou que queries diferentes precisam de tamanhos de chunk diferentes, mas RAG systems tipicamente escolhem um tamanho fixo ([AI21 Labs, 2025](https://www.ai21.com/blog/query-dependent-chunking/)). O reranker ameniza esse problema porque avalia a relevância do chunk completo contra a query, independente do tamanho do chunk. Um chunk grande com a resposta perfeita no terceiro parágrafo será corretamente rankeado acima de um chunk pequeno que só tem uma frase relacionada.

## 4. RAG agentic: quando o pipeline precisa pensar

RAG agentic adiciona um loop de raciocínio ao redor do retrieval. Em vez de uma única passada retrieve-then-generate, o agente decide: "Tenho informação suficiente? É relevante? Devo reformular a query e buscar de novo?"

Frameworks de RAG agentic em 2026:

- **LangGraph**: abordagem state machine, melhor para fluxos complexos de múltiplos passos
- **LlamaIndex Workflows**: event-driven, bom para pipelines pesados em documentos
- **CrewAI**: multi-agente, cada agente especializado em estratégias de retrieval diferentes

O custo por query é significativamente maior (US$ 0,02-0,10 vs US$ 0,001 do naive RAG), e a latência sobe para 2-8 segundos. Mas para perguntas complexas multi-hop (como "qual o impacto orçamentário da Portaria X combinada com a Lei Y?"), RAG agentic é a diferença entre uma resposta útil e "não encontrei informações relevantes".

| Padrão de RAG | Custo/query | Latência | Qualidade |
|---|---|---|---|
| Naive RAG | US$ 0,001 | 200ms | Baixa-Média |
| Híbrido + Rerank | US$ 0,005 | 400ms | Alta |
| RAG Agentic | US$ 0,02-0,10 | 2-8s | Muito Alta |
| Graph RAG | US$ 0,01-0,05 | 0,5-2s | Alta (relacional) |

Para a maioria dos casos de uso em produção, **Híbrido + Rerank** oferece o melhor ratio qualidade/custo. RAG agentic vale o custo extra para perguntas complexas multi-hop ou quando a acurácia é não-negociável (legal, médico, financeiro).

## 5. Avaliação: sem métricas, você está voando cego

Você não melhora o que não mede. O framework **RAGAS** (Retrieval Augmented Generation Assessment) é o padrão da indústria para avaliação de RAG, proposto por Es, James, Espinosa-Anke e Schockaert ([Es et al., 2023; EACL 2024](http://arxiv.org/abs/2309.15217v1)). As métricas principais:

| Métrica | O que mede | Faixa |
|---|---|---|
| Faithfulness | A resposta é fiel ao contexto recuperado? | 0-1 |
| Answer Relevancy | A resposta é relevante à pergunta? | 0-1 |
| Context Precision | Dos documentos recuperados, quantos são relevantes? | 0-1 |
| Context Recall | Dos documentos relevantes, quantos foram recuperados? | 0-1 |

O benchmark MIRAGE (Metric-Intensive Benchmark for RAG Evaluation), apresentado no NAACL 2025, adicionou métricas como densidade de informação e robustez a queries ambíguas ([Park et al., NAACL 2025](https://aclanthology.org/2025.findings-naacl.157.pdf)). O framework EncouRAGe (novembro 2025) trouxe avaliação local e rápida sem dependência de APIs externas ([EncouRAGe, arXiv 2025](https://arxiv.org/html/2511.04696v1)).

### Erros comuns de avaliação

1. **Medir só a resposta final**: sem métricas separadas de retrieval (precision@k, recall@k, MRR, nDCG), você não sabe se o problema é busca ou geração
2. **Usar queries de teste sintéticas**: queries reais de usuários são ambíguas, mal formuladas e usam vocabulário diferente do documento. Seu test set tem que refletir isso
3. **Não monitorar em produção**: métricas de retrieval driftam com o tempo (embedding drift, mudança no vocabulário dos usuários, expansão do corpus). Sem monitoramento contínuo, você não percebe a degradação até os usuários reclamarem
4. **Não implementar abstenção**: o sistema deve saber quando não sabe. Se o retrieval retorna contexto irrelevante, o LLM deve dizer "não tenho informações suficientes" em vez de alucinar com confiança

## O que isso significa para o Brasil e para a gestão pública

No setor público brasileiro, RAG não é luxo: é necessidade. Gestores precisam consultar leis, portarias, pareceres e processos em linguagem natural. Mas os desafios são específicos:

- **Referências legais exatas** (artigos, incisos, alíneas) exigem busca lexical precisa, não só semântica
- **Dados sensíveis** (LGPD, informações governamentais) exigem reranking e inferência on-premise
- **Linguagem jurídico-administrativa** tem vocabulário altamente especializado que embeddings gerais capturam mal
- **Documentos longos e estruturados** (Diário Oficial, portarias, contratos) exigem chunking hierárquico, não por tamanho fixo

É exatamente por isso que o BXat foi desenhado com busca híbrida + reranking from day one. Quando um gestor público pergunta "qual o prazo para resposta a um recurso administrativo segundo a Lei 9.784/99?", ele precisa da resposta exata, com o artigo citado, não de um resumo vagamente relacionado.

A MGI publicou em abril de 2026 a Portaria nº 3.485/2026 instituindo Política de Governança de Inteligência Artificial no âmbito do ministério ([gov.br, 2026](https://www.gov.br/gestao/pt-br/assuntos/noticias/2026/abril/mgi-institui-politica-de-governanca-de-inteligencia-artificial-no-ambito-do-ministerio)). A cartilha da SGD/Serpro sobre IA generativa no serviço público destaca a necessidade de respostas rastreáveis e verificáveis ([gov.br, 2025](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/cartilha-ia-generativa)). RAG com avaliação e citação não é optional para esse contexto: é requisito regulatório.

## Checklist de produção: do POC ao deploy

Antes de colocar RAG em produção, verifique cada ponto:

1. **Chunking**: hierárquico ou semântico, com metadados por chunk (fonte, seção, página, parent ID)
2. **Busca**: híbrida (BM25 + vetorial) com fusão RRF. Não publicar sem
3. **Reranking**: cross-encoder nos top-50, passar top-5 ao LLM
4. **Avaliação**: dataset de teste com queries reais, métricas RAGAS rodando em CI/CD
5. **Monitoramento**: precision@k e recall@k em produção, alertas de drift
6. **Abstenção**: o sistema deve saber quando não sabe e dizer isso explicitamente
7. **Citação**: toda resposta deve referenciar o chunk e o documento de origem
8. **Privacidade**: se os dados são sensíveis (LGPD, governamentais), reranking e inferência on-prem

## Conclusão

RAG é a arquitetura dominante para grounding de LLMs com conhecimento externo em 2026, mas RAG ingênuo falha 40% das vezes. O gargalo não é geração: é retrieval. Pipelines de produção que funcionam combinam chunking hierárquico, busca híbrida, reranking com cross-encoder e avaliação sistemática com RAGAS.

Para o Brasil, onde IA no setor público precisa lidar com linguagem jurídica, dados sensíveis e referências legais exatas, esses fundamentos não são best practices: são pré-requisitos. É o que construímos no BXat e é o que qualquer pipeline de RAG sério precisa ter antes de ir pra produção.

---

### Referências

- Bhat, S. R., Rudat, M., Spiekermann, J. et al. "Rethinking Chunk Size for Long-Document Retrieval: A Multi-Dataset Analysis." arXiv:2505.21700, 2025.
- Es, S., James, J., Espinosa-Anke, L., Schockaert, S. "RAGAS: Automated Evaluation of Retrieval Augmented Generation." EACL 2024. arXiv:2309.15217.
- NVIDIA. "Finding the Best Chunking Strategy for Accurate AI Responses." NVIDIA Technical Blog, 2025.
- Park, C., Moon, H., Park, C., Lim, H. "MIRAGE: A Metric-Intensive Benchmark for Retrieval-Augmented Generation Evaluation." NAACL 2025 Findings.
- Rengo, M., Beadini, S., Alfano, D., Abbruzzese, R. "A System for Comprehensive Assessment of RAG Frameworks." arXiv:2504.07803, 2025.
- Papadimitriou, I., Gialampoukidis, I., Vrochidis, S., Kompatsiaris, I. "RAG Playground: A Framework for Systematic Evaluation of Retrieval Strategies and Prompt Engineering in RAG Systems." arXiv:2412.12322, 2024.
- EncouRAGe. "EncouRAGe: Evaluating RAG Local, Fast, and Reliable." arXiv:2511.04696, 2025.
- AI21 Labs. "Query-Dependent RAG Chunking." 2025.
- DigitalOcean. "Why RAG Systems Fail in Production." 2026.
- Lushbinary. "RAG in 2026: The Complete Production Guide to Retrieval-Augmented Generation." 2026.
- Brasil. MGI. Portaria nº 3.485/2026: Política de Governança de IA. 2026.
- Brasil. SGD/Serpro. "Cartilha IA Generativa no Serviço Público." 2025.