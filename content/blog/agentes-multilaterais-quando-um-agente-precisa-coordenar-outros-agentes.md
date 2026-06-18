---
title: "Agentes Multilaterais: Quando um Agente Precisa Coordenar Outros Agentes"
description: "Sistemas multiagente deixaram de ser pesquisa e viraram produção. Segundo levantamento da Zylos Research, 72% dos projetos de IA empresarial já envolvem múltiplos agentes. Mas coordenar quem faz o quê, quando e como é o problema central. Este artigo mapeia os padrões de orquestração, os frameworks disponíveis, os desafios reais de produção e o que a pesquisa de ponta diz sobre quando delegar e quando centralizar."
date: "2026-06-10"
author: "Leonardo Camilo"
authorRole: "CEO e Tech Lead na BaXiJen"
tags: ["agentes multiagente", "orquestração", "LLM", "produção", "LangGraph", "CrewAI", "AutoGen", "multi-agent", "IA brasileira", "BaXiJen"]
featured: true
image: "/blog/agentes-multilaterais-coordenacao-multiagente-cover.png"
imageAlt: "Diagrama de orquestração multiagente: padrões supervisor, hierárquico e peer-to-peer com agentes especializados coordenados por um orchestrator central"
---

Um agente de IA que faz tudo sozinho funciona bem para tarefas simples. Mas quando o escopo cresce: consultar uma base de conhecimento, validar a resposta com um modelo de guardrail, checar compliance com a LGPD, formatar a saída para o canal certo, você percebe que um agente só não dá conta. A solução natural é dividir responsabilidades entre agentes especializados. O problema é que aí surge uma pergunta que ninguém responde direito na documentação: **quem coordena quem?**

Segundo pesquisa da Zylos Research publicada em janeiro de 2026, **72% dos projetos de IA empresarial já envolvem sistemas multiagente**, ante apenas 23% em 2024. O salto é enorme. Mas o mesmo relatório aponta que **observabilidade é a barreira número 1 para adoção em produção**. Tradução: as empresas estão montando times de agentes, mas não conseguem ver o que está acontecendo dentro deles.

Este artigo é sobre esse problema de coordenação. Vamos mapear os padrões de orquestração, comparar os frameworks disponíveis, mostrar o que a pesquisa acadêmica diz e discutir o que funciona de verdade quando você precisa colocar isso em produção.

## 1. Por que um agente não basta

Imagine um chatbot de atendimento ao cidadão em uma prefeitura. O cidadão pergunta sobre o IPTU do seu imóvel. Um único agente precisaria:

1. Identificar a intenção do usuário
2. Buscar dados do imóvel em um sistema legado
3. Consultar a legislação municipal vigente
4. Calcular descontos e penalidades
5. Verificar se a resposta está em conformidade com a LGPD
6. Formatar a saída em linguagem acessível

Cada uma dessas etapas tem complexidade própria. Misturar tudo em um prompt gigante gera alucinação, inconsistência e custo elevado (token duplication é real: o estudo da Zylos mostra que MetaGPT duplica 72% dos tokens, CAMEL 86%, AgentVerse 53%).

A abordagem multiagente resolve isso por decomposição: cada agente faz uma coisa bem, e um mecanismo de coordenação garante que o resultado faz sentido junto. Mas a coordenação é o calcanhar de Aquiles.

## 2. Padrões de orquestração: supervisor, hierárquico e peer-to-peer

A pesquisa consolidou três padrões principais de coordenação entre agentes, cada um com trade-offs claros.

### 2.1 Padrão Supervisor (centralizado)

Um agente central, o supervisor, recebe a tarefa, decide qual agente especializado chamar, monitora a execução e compila o resultado. É o padrão mais usado em produção hoje.

```
[Usuário] → [Supervisor] → [Agente A] → resultado parcial
                       → [Agente B] → resultado parcial
                       ← compila e retorna
```

**Vantagens:** controle total, fácil de auditar, fallback centralizado. **Desvantagens:** ponto único de falha, gargalo quando o volume de decisões cresce, o supervisor vira um LLM caro fazendo roteamento o tempo todo.

O paper de referência para orquestração enterprise, "The Orchestration of Multi-Agent Systems" (Adimulam et al., arXiv:2601.13671, janeiro 2026), formaliza esse padrão como a camada de orquestração que integra planejamento, enforcement de políticas, gerenciamento de estado e operações de qualidade em uma camada coerente.

### 2.2 Padrão Hierárquico

Quando o número de agentes passa de 20, um único supervisor não escala. O padrão hierárquico introduz sub-supervisores, cada um responsável por um grupo de agentes. Pense em uma organização com diretores e gerentes.

```
[Supervisor Geral]
  ├── [Sub-supervisor Financeiro] → [Agente Fiscal] [Agente Tributário]
  └── [Sub-supervisor Jurídico] → [Agente LGPD] [Agente Contratos]
```

**Vantagens:** escala para dezenas de agentes, cada sub-supervisor tem contexto limitado e focado. **Desvantagens:** overhead de coordenação entre níveis, latência adicional, mais complexidade de debug.

### 2.3 Padrão Peer-to-Peer (descentralizado)

Agentes se comunicam diretamente, sem um coordenador central. Cada agente decide para quem delegar ou de quem pedir informação. É o padrão proposto pelo AgentNet (Yang et al., NeurIPS 2025), que introduz coordenação evolucionária descentralizada.

**Vantagens:** sem ponto único de falha, tolerância a falhas natural, adaptação dinâmica. **Desvantagens:** consenso mais lento, imprevisibilidade emergente, difícil de auditar e reproduzir.

O ORCH (Zhou & Chan, Frontiers in AI, 2026) propõe uma alternativa determinística: em vez de roteamento estocástico, usa roteamento guiado por EMA (Exponential Moving Average) para garantir reprodutibilidade e melhor relação custo-benefício. É uma resposta direta ao problema de que sistemas multiagente com roteamento aleatório são difíceis de debugar.

## 3. Frameworks: o que funciona em produção

A comparação de frameworks para orquestração multiagente em 2026 tem dados concretos. Segundo análise da Presenc AI (Q1 2026), a distribuição de deployments em produção é:

| Framework | Participação em produção | Padrão principal | Maturidade |
|---|---|---|---|
| LangGraph | 38% | Grafo de estado + supervisor | Alta |
| Custom (Python/TS) | 28% | Bespoke | Variável |
| CrewAI | 12% | Crews baseadas em papéis | Média |
| AutoGen | 9% | Agentes conversacionais | Média |
| Claude Skills | 5% | Skills composicionais | Média |
| Google ADK | 4% | Agentes modulares | Média |
| OpenAI Swarm | 2% | Handoff pattern | Baixa |

A mesma análise conclui que **três fatores importam mais que a escolha de framework:**

1. **Seleção do modelo base:** um modelo frontier em um framework básico supera um modelo fraco em um framework sofisticado
2. **Infraestrutura de avaliação:** testes de regressão, replay de traces, sampling em produção
3. **Design de checkpoints humanos:** onde o humano aprova e onde o agente é autônomo

O framework é quarto fator. Importa, mas raramente é o fator determinante de sucesso.

### 3.1 LangGraph: o padrão de facto

LangGraph usa um modelo de máquina de estados baseada em grafos. Cada nó é um agente ou função, cada aresta é uma transição condicional. O estado é compartilhado e explícito, o que torna observabilidade e debug mais simples.

**Quando escolher:** produção enterprise, workflows complexos com caminhos condicionais, necessidade de observabilidade via LangSmith.

**Cuidado:** a curva de aprendizado é real. O modelo de grafos é poderoso mas exige engenharia. E a dependência do ecossistema LangChain arrasta complexidade.

### 3.2 CrewAI: rápido do protótipo ao piloto

CrewAI abstrai a orquestração em "crews": grupos de agentes com papéis definidos (researcher, writer, validator). O desenvolvedor define papéis, objetivos e ferramentas, e o framework orquestra a execução.

**Quando escolher:** prototipagem rápida, validação de conceito, equipes sem engenharia de IA dedicada.

**Cuidado:** observabilidade em produção é mais fraca que LangGraph. Padrões de error recovery são menos maduros. As abstrações podem lutar contra necessidades não triviais de produção.

### 3.3 AutoGen: pesquisa e experimentação

O Microsoft AutoGen brilha em padrões de debate e verificação multiagente. Vários agentes discutem, desafiam e refinam respostas, o que melhora qualidade em tarefas de raciocínio.

**Quando escolher:** pesquisa acadêmica, padrões de debate/verificação, integração com ecossistema Microsoft.

**Cuidado:** footprint de produção menor. Configuração mais pesada. Não é a primeira escolha para deploy em escala.

### 3.4 OpenAI Swarm: experimental, leve, limitado

Swarm é uma biblioteca opinativa de handoffs: um agente transfere a conversa para outro. Minimalista por design. Mas é explicitamente experimental e a própria OpenAI não recomenda para produção.

### 3.5 Custom: quando nada serve

28% dos deployments em produção usam orquestração customizada em Python ou TypeScript. É a escolha quando os requisitos são muito específicos, o controle sobre estado e erros é crítico, ou a equipe tem maturidade suficiente para não reinventar roda onde um framework serviria.

**Trade-off:** time-to-production mais longo, mas controle total sobre cada aspecto do sistema.

## 4. Desafios reais de produção

Frameworks são a parte fácil. O difícil é o que acontece depois do deploy.

### 4.1 Token duplication: o custo invisível

Quando múltiplos agentes processam o mesmo contexto, os tokens se acumulam. MetaGPT duplica 72% dos tokens, CAMEL 86%. Em produção, isso significa que para cada 1 dólar que você acha que vai gastar, pode estar gastando 1,72 ou 1,86.

**Mitigações:** caching de prompts repetidos (até 90% de desconto em inputs cacheados, segundo a Zylos), ativação seletiva de agentes (só chama quem é necessário), compressão de contexto entre etapas.

### 4.2 Observabilidade: a barreira número 1

Se você não consegue ver o que cada agente está fazendo, não consegue debugar, otimizar ou garantir compliance. Trace por trace, decisão por decisão. É o requisito número 1 para qualquer sistema multiagente em produção.

Sem observabilidade, você tem um sistema que funciona na demo e falha silenciosamente em produção. E o pior: você nem sabe que está falhando.

### 4.3 Resolução de conflitos

Quando dois agentes produzem resultados contraditórios, quem decide? Pesquisa da Zylos mostra que conflitos não resolvidos causam **30% de degradação de performance**. Mecanismos de resolução:

- **Votação/consenso:** reduz 70% dos conflitos, mas adiciona latência
- **Negociação baseada em RL:** resolve 70-80% automaticamente, mas requer treinamento
- **Escalonamento humano:** para decisões de alto risco

O paper "Multi-Agent Collaboration Mechanisms" (Nguyen et al., arXiv:2501.06322, janeiro 2025) mapeia sistematicamente esses mecanismos: cooperação, competição, coopetição, cada um com protocolos de coordenação específicos.

### 4.4 Quando NÃO usar multiagente

Nem todo problema precisa de múltiplos agentes. Os casos em que um agente só é melhor:

- A tarefa é simples e bem definida
- Latência sub-segundo é requisito
- Volume de tarefas é baixo
- Requisitos são pouco claros (mais agentes = mais incerteza)
- Recursos de engenharia são limitados

## 5. O que a pesquisa de ponta está descobrindo

### 5.1 ORCH: determinismo em vez de estocasticidade

O ORCH (Zhou & Chan, Frontiers in AI, 2026) propõe orquestração determinística com roteamento guiado por EMA. Em vez de deixar o agente escolher probabilisticamente para quem delegar, o ORCH usa métricas de performance acumuladas para rotear de forma estável e reproduzível. Resultado: maior acurácia e melhor relação custo-benefício que abordagens não determinísticas.

A implicação prática é direta: em produção, você quer previsibilidade. Sistemas que tomam decisões diferentes para o mesmo input são um pesadelo de debug e compliance.

### 5.2 AgentNet: coordenação descentralizada evolucionária

O AgentNet (Yang et al., NeurIPS 2025) propõe que sistemas multiagente não precisam de um coordenador central. Em vez disso, agentes evoluem suas estratégias de cooperação ao longo do tempo usando mecanismos evolucionários e RAG para memória. A vantagem é a eliminação do ponto único de falha do supervisor. A desvantagem é a imprevisibilidade: resultados emergentes que podem ou não ser desejáveis.

Em ambientes regulados (como o setor público brasileiro), previsibilidade é requisito, não preferência. AgentNet é promissor para cenários onde a adaptação dinâmica é mais valiosa que a reprodutibilidade.

### 5.3 AdaptOrch: orquestração adaptativa por tarefa

O AdaptOrch (Yu, arXiv:2602.16873, fevereiro 2026) reconhece que à medida que os modelos convergem em performance (GPT-4, Claude, Gemini, Llama têm diferenças cada vez menores em benchmarks), o diferencial competitivo muda do modelo para a orquestração. O AdaptOrch adapta a estratégia de coordenação ao tipo de tarefa, escolhendo dinamicamente entre padrões centralizados e descentralizados.

### 5.4 A2A e MCP: protocolos de comunicação

A mesma pesquisa de Adimulam et al. (2026) formaliza dois protocolos complementares:

- **MCP (Model Context Protocol):** padroniza como agentes acessam ferramentas e dados contextuais externos
- **A2A (Agent-to-Agent):** governa coordenação peer-to-peer, negociação e delegação entre agentes

Juntos, criam um substrato de comunicação interoperável. Para o ecossistema brasileiro, onde agentes precisam se integrar com APIs governamentais, sistemas legados e dados sensíveis, protocolos padronizados são a infraestrutura que permite que agentes de diferentes fornecedores colaborem sem acoplamento.

## 6. Conexão com o Brasil: onde a coordenação multiagente importa

No contexto brasileiro, sistemas multiagente têm aplicação direta em três frentes:

**Gestão pública:** um agente de atendimento ao cidadão que consulta legislação, valida procedimentos e checa compliance com a LGPD precisa de coordenação entre agentes especializados. O BXat, nosso assistente para gestores públicos, usa orquestração para separar a camada de conversação da camada de consulta a dados e da camada de validação jurídica.

**Saúde:** triagem que coordena agentes de anamnese, agentes de validação de protocolos clínicos e agentes de formatação de prontuário. Cada um com escopo limitado e auditável.

**Financeiro:** análise de crédito que coordena agentes de verificação cadastral, agentes de análise de risco e agentes de compliance regulatório. Em um mercado com 180+ instituições supervisionadas pelo Banco Central, orquestração com rastreabilidade é requisito, não luxo.

Em todos esses casos, a escolha do padrão de orquestração não é acadêmica. É uma decisão de arquitetura que impacta diretamente custos (token duplication), latência (número de hops entre agentes), observabilidade (capacidade de auditar cada decisão) e compliance (rastreabilidade exigida pela LGPD e pelo Marco Legal da IA).

## 7. Checklist prático: como escolher o padrão de orquestração

Antes de implementar, responda:

1. **Quantos agentes você precisa?** Menos de 5: supervisor simples. Entre 5 e 20: supervisor com especialização. Mais de 20: hierárquico.
2. **Qual o custo de uma resposta errada?** Alto (saúde, financeiro, jurídico): supervisor com checkpoints humanos. Baixo (classificação de conteúdo, sumarização): peer-to-peer pode funcionar.
3. **Qual a latência tolerável?** Sub-segundo: minimize o número de agentes, use caching. Segundos: permite padrões mais complexos.
4. **Precisa de reprodutibilidade?** Sim (ambientes regulados): padrões determinísticos como ORCH. Não: padrões emergentes como AgentNet são uma opção.
5. **Qual a maturidade da equipe?** Alta: LangGraph ou custom. Média: CrewAI. Baixa: comece com um agente só e evolua.

## 8. Próximos passos

A pesquisa está avançando rápido em três direções:

- **Protocolos de comunicação** (A2A, MCP) criando interoperabilidade entre agentes de diferentes fornecedores
- **Orquestração adaptativa** (AdaptOrch) que escolhe o padrão de coordenação dinamicamente por tarefa
- **Determinismo em produção** (ORCH) garantindo que sistemas multiagente sejam auditáveis e reproduzíveis

Para times de IA no Brasil, o caminho é claro: comece com supervisor simples, instrumente observabilidade desde o dia 1, e evolua para padrões mais complexos conforme a necessidade aparece. Não comece com AgentNet em produção. Comece com um supervisor que você entende e pode debugar.

---

**Referências**

Adimulam, A., Gupta, R., & Kumar, S. (2026). The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption. arXiv:2601.13671.

Nguyen, H. D. et al. (2025). Multi-Agent Collaboration Mechanisms: A Survey of LLMs. arXiv:2501.06322.

Yang, Y. et al. (2025). AgentNet: Decentralized Evolutionary Coordination for LLM-based Multi-Agent Systems. NeurIPS 2025.

Zhou, H., & Chan, H. Y. (2026). ORCH: Many Analyses, One Merge: A Deterministic Multi-Agent Orchestrator for Discrete-Choice Reasoning with EMA-Guided Routing. Frontiers in Artificial Intelligence, 9:1748735.

Yu, G. (2026). AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence. arXiv:2602.16873.

Zylos Research (2026). Multi-Agent Orchestration Patterns 2025. Zylos.ai.

Presenc AI (2026). Multi-Agent Orchestration Frameworks 2026: LangGraph, CrewAI, AutoGen, Swarm. Presenc.ai.

Du, H. et al. (2025). MultiAgentBench: Evaluating the Collaboration and Competition of LLM Agents. ACL 2025.

Zhang, C. (2026). Reinforcement Learning for LLM-based Multi-Agent Systems through Orchestration Traces. arXiv:2605.02801.