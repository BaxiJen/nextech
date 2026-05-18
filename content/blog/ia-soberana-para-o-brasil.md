---
title: "IA Soberana: O Que o PBIA, a ANPD e a França Nos Ensinam Sobre o Risco de Depender de Modelos Estrangeiros"
description: "Análise do PBIA (R$ 23 bi), da Resolução ANPD 19/2024 sobre transferência internacional de dados, e do caso francês (€ 109 bi) para argumentar por que dependência de infraestrutura estrangeira de IA é risco operacional e regulatório real para organizações brasileiras."
date: "2026-05-18"
author: "Leonardo Camilo"
authorRole: "Co-fundador & Tech Lead, BaXiJen"
tags: ["IA soberana", "PBIA", "LGPD", "ANPD", "BXat", "gestão pública"]
featured: true
image: "/blog/ia-soberana-cover.svg"
imageAlt: "IA Soberana para o Brasil"
---

Em fevereiro de 2026, a França anunciou € 109 bilhões em investimentos para IA — o equivalente francês ao Stargate americano de US$ 500 bi ([Le Monde, 10/02/2026](https://www.lemonde.fr/en/economy/article/2025/02/10/ai-with-the-announcement-of-a-109-billion-investment-macron-intends-to-take-on-the-us_6737985_19.html)). Desses, o programa France 2030 destina € 2,5 bilhões exclusivamente à infraestrutura soberana de IA, incluindo clusters de computação para treinar modelos em francês ([france2030.ai, 2026](https://france2030.ai/news/2026/mistral-ai-global-expansion/)). A Índia lançou o India AI Mission com US$ 1,25 bilhão para IA em 10 idiomas locais. A China já opera mais de 200 LLMs nacionais.

O Brasil? Tem o **PBIA (Plano Brasileiro de Inteligência Artificial) 2024-2028**, com orçamento total de R$ 23 bilhões — dos quais R$ 1,76 bi vão para melhoria de serviços públicos via IA e apenas R$ 25 milhões para a Plataforma de IA do Governo ([gov.br, 30/07/2024](https://www.gov.br/governodigital/pt-br/noticias/novo-plano-brasileiro-de-inteligencia-artificial-preve-o-investimento-de-r-1-76-bi-para-melhoria-de-servicos-publicos)). Em paridade de poder de compra, o investimento brasileiro é 40x menor que o francês.

A lacuna não é apenas numérica. É estrutural: enquanto França e Índia investem em **capacidade de treinar e hospedar modelos localmente**, o PBIA ainda prioriza **uso** de IA sobre **produção** de IA. A diferença entre consumir tecnologia e produzi-la é a diferença entre importar automóveis e ter indústria automotiva.

## O que a ANPD já está fazendo: Resolução CD/ANPD nº 19/2024

Em agosto de 2024, a Autoridade Nacional de Proteção de Dados publicou a Resolução CD/ANPD nº 19/2024, regulamentando as transferências internacionais de dados pessoais sob a LGPD ([IAPP, 23/08/2024](https://iapp.org/news/a/brazil-s-new-regulation-on-international-data-transfers)). A regulamentação estabelece mecanismos específicos: decisões de adequação, cláusulas contratuais padrão (SCCs), regras corporativas vinculantes (BCRs) e autorização caso a caso.

O ponto relevante para IA: **a ANPD vinculou explicitamente a regulamentação de transferências ao debate sobre "nuvem soberana"** no contexto do PBIA. Ou seja, a própria autoridade reguladora reconhece que processar dados pessoais em infraestrutura estrangeira é uma questão de soberania, não apenas de compliance.

Na prática, isso significa que qualquer organização que use modelos de IA hospedados fora do Brasil para processar dados pessoais precisa:

1. **Identificar a base legal** para a transferência (Art. 33 LGPD + Resolução 19)
2. **Demonstrar garantias adequadas** — SCCs com o provider estrangeiro, BCRs, ou aguardar decisão de adequação da ANPD (nenhuma foi emitida até maio de 2026)
3. **Manter registro** das transferências e realizar Relatório de Impacto à Proteção de Dados (RIPD) quando solicitado

Para organizações públicas, o risco é maior. A CLOUD Act americana permite que tribunais dos EUA requisitem dados armazenados por provedores americanos, mesmo que os dados estejam em servidores no Brasil — desde que o provedor tenha sede nos EUA. Quando um chatbot público roda em API de provider americano, dados de cidadãos brasileiros ficam teoricamente sujeitos a essa jurisdição.

## O risco operacional é mensurável, não hipotético

O OpenAI Status Page registrou 294 incidentes entre janeiro de 2025 e maio de 2026 ([StatusGator](https://statusgator.com/services/openai/outage-history)). Em março de 2025, uma outage de 8 horas derrubou API e ChatGPT simultaneamente. Em dezembro de 2025, API + ChatGPT + Sora ficaram instáveis por horas ([status.openai.com](https://status.openai.com/incidents/ctrsv3lwd797)).

Empresas brasileiras que dependiam exclusivamente dessas APIs ficaram sem atendimento. Não é risco teórico — é evento recorrente. E a probabilidade cresce conforme a dependência aumenta.

Além de disponibilidade, há o risco de **comportamento imprevisto**. Em 2025, a Anthropic alterou o comportamento do Claude sem aviso prévio, gerando respostas mais verbosas e alterando sistemas de atendimento ao cliente configurados. A mudança não foi anunciada; foi descoberta por usuários em produção. Quando o modelo que atende seu cliente muda de comportamento sem você saber, a consequência não é um bug — é uma desconexão entre o que você testou e o que está em produção.

O terceiro risco é **custo cambial**. APIs de LLM são precificadas em USD. Entre 2022 e 2026, o câmbio USD/BRL variou de R$ 4,70 a R$ 6,20 (+32%). O custo real de inferência para uma empresa brasileira pode subir 30% sem que ela mude nada na sua operação.

## O PBIA prevê nuvem soberana — mas o diabo está nos detalhes

O PBIA menciona explicitamente a criação de "um ecossistema robusto de dados públicos em nuvem soberana para assegurar a autonomia tecnológica nacional" ([gov.br, 2024](https://www.gov.br/governodigital/pt-br/noticias/novo-plano-brasileiro-de-inteligencia-artificial-preve-o-investimento-de-r-1-76-bi-para-melhoria-de-servicos-publicos)). O MGI coordenará o Núcleo de IA do Governo, com meta de estruturar 25 projetos de alto impacto até 2026 e capacitar 115 mil servidores.

Mas os números revelam a distância entre intenção e capacidade: R$ 25 milhões para a Plataforma de IA do Governo (orçamento total, não anual). Para contexto, o treinamento de um modelo como o Llama 3 70B custa estimados US$ 5-10 milhões em compute ([Epoch AI, 2024](https://epochai.org/)). R$ 25 milhões (≈ US$ 4,5 milhões) mal cobre o fine-tuning de um modelo existente, quanto mais o treino de um foundational model nacional.

A meta de capacitar 115 mil servidores é louvável, mas capacitar para *uso* (prompt engineering, avaliação de outputs) é diferente de capacitar para *desenvolvimento* (fine-tuning, RAG, deploy de infraestrutura). O PBIA prioriza o primeiro; a soberania exige o segundo.

## O caso BXat: demonstrando viabilidade com recursos limitados

Na BaXiJen, construímos o BXat como prova de que IA soberana é viável mesmo com orçamentos muito menores que os do PBIA. O BXat é um agente de IA conversacional para gestores públicos que opera sobre modelos open-source fine-tunados para legislação brasileira, hospedados em infraestrutura nacional.

Quando um gestor municipal pergunta "qual a base legal para licitação eletrônica de obras?", a resposta do BXat:

- Cita o Decreto 10.024/2019 e a Lei 14.133/2021 (precisão normativa)
- Diferencia licitação eletrônica de pregão eletrônico (nuance jurídica real)
- Recupera de base legislativa curada, não de web search genérico (confiabilidade)
- Responde em português com jargão do serviço público (localização real)

Esse nível de precisão não vem de prompt engineering. Vem de fine-tuning com dados de domínio + RAG em base curada. Doshi-Velez & Kim (2017) argumentam que em domínios de alto risco, a avaliação deve ser específica ao contexto, não genérica. No BXat, medimos precisão na citação de normativos, não BLEU score.

O custo? Inferência com Qwen2.5-14B fine-tuned em GPU nacional custa fração do que custa a API do GPT-4, sem variação cambial, sem risco de outage transatlântica, sem exposição à CLOUD Act. Não é nacionalismo — é engenharia de custo e risco.

## O que falta para o Brasil ter soberania de IA real

Com base na comparação com França, Índia e no que o PBIA propõe mas não executa:

1. **Infraestrutura de inferência nacional escalável** — não apenas para governo, mas como serviço. Provedores de nuvem brasileiros precisam oferecer GPU-as-a-service a preços competitivos. A Serpro e Dataprev têm capacidade, mas não oferecem esse serviço hoje.
2. **Dados de treino curados e abertos** — bases legislativas, jurisprudência, normativos municipais/estaduais/federais limpos e estruturados. A Lei de Acesso à Informação garante acesso, mas não garante que os dados estejam em formato utilizável.
3. **Fine-tuning como política pública** — o PBIA menciona "modelos de IA para o governo", mas trata como projeto pontual (R$ 25 mi). Precisa ser programa contínuo, com orçamento recorrente e métricas de qualidade por domínio.
4. **Regulação que protege sem engessar** — a Resolução 19/2024 é um avanço, mas a ANPD precisa emitir decisões de adequação para que organizações saibam quais providers são conformes. Sem isso, a incerteza regulatória desincentiva adoção.

A BaXiJen está no primeiro passo: provando que é possível, que funciona e que a diferença de qualidade é mensurável. O BXat não é apenas um produto — é evidência de que soberania de IA no Brasil é viável com os recursos que temos hoje. O que falta é escala, e escala vem de política pública consistente.

---

**Referências**

- Doshi-Velez, F., & Kim, B. (2017). Towards A Rigorous Science of Interpretable Machine Learning. *arXiv:1702.08608*.
- Governo do Brasil (2024). Novo Plano Brasileiro de Inteligência Artificial prevê o investimento de R$ 1,76 bi para melhoria de serviços públicos. [gov.br](https://www.gov.br/governodigital/pt-br/noticias/novo-plano-brasileiro-de-inteligencia-artificial-preve-o-investimento-de-r-1-76-bi-para-melhoria-de-servicos-publicos)
- IAPP (2024). Brazil's new regulation on international data transfers. [iapp.org](https://iapp.org/news/a/brazil-s-new-regulation-on-international-data-transfers)
- ITIF (2025). Brazil's Cross-Border Data Transfer Regulation. [itif.org](https://itif.org/publications/2025/05/16/brazil-cross-border-data-transfer-regulation/)
- Le Monde (2026). AI: With the announcement of investments worth €109 billion, Macron intends to take on the US. [lemonde.fr](https://www.lemonde.fr/en/economy/article/2025/02/10/ai-with-the-announcement-of-a-109-billion-investment-macron-intends-to-take-on-the-us_6737985_19.html)
- France 2030 AI (2026). Mistral AI Continues Global Expansion from Paris Base. [france2030.ai](https://france2030.ai/news/2026/mistral-ai-global-expansion/)
- Resolução CD/ANPD nº 19/2024 — Regulamenta a transferência internacional de dados pessoais.
- Lei 13.709/2018 (LGPD), Art. 33 — Transferência internacional de dados.
- Epoch AI (2024). Training cost estimates for large language models. [epochai.org](https://epochai.org/)