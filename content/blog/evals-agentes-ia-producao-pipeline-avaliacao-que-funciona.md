---
title: "Evals de Agentes IA em Produção: Como Construir um Pipeline de Avaliação Que Realmente Protege o Deploy"
description: "O benchmark APEX-Agents mostrou que os melhores agentes completam menos de 25% das tarefas reais na primeira tentativa. 60 a 72% dos pilotos nunca chegam à produção. O problema não é o modelo: é a ausência de engenharia de avaliação sistemática. Este artigo decompõe como construir um pipeline de evals com golden datasets, LLM-as-judge calibrado, gates de CI/CD e feedback loop de produção, com dados da Anthropic, Mercor, Eugene Yan e práticas de times que shipam agentes confiáveis em 2026."
date: "2026-07-16"
author: "Marcus Ramalho"
authorRole: "CTO e Co-fundador na BaXiJen"
tags: ["avaliação", "evals", "agentes IA", "LLM-as-judge", "CI/CD", "golden dataset", "produção", "confiabilidade", "pass^k", "IA brasileira", "BaXiJen"]
featured: true
image: "/blog/evals-agentes-ia-producao-pipeline-cover.svg"
imageAlt: "Diagrama do pipeline de avaliação de agentes IA: golden dataset na base, code-based graders e model-based graders no meio, gates de CI/CD no topo, feedback loop de produção traces voltando para o dataset. Mostra pass^k vs pass@k com a diferença de 63 pontos percentuais para um agente de 70% de sucesso por tentativa."
---

# Evals de Agentes IA em Produção: Como Construir um Pipeline de Avaliação Que Realmente Protege o Deploy

Em janeiro de 2026, a Mercor publicou o benchmark APEX-Agents: 480 tarefas reais de investment banking, management consulting e corporate law, executadas por oito dos modelos mais capazes do mercado. O resultado foi um choque coletivo. **Gemini 3 Flash, o melhor agente testado, completou 24,0% das tarefas na primeira tentativa.** GPT-5.2 conseguiu 23%. Claude Opus 4.5 ficou em terceiro (Vidgen et al., 2026). Não eram tarefas impossíveis: eram rotinas de escritório que um analista júnior executaria. Mesmo após oito tentativas, as taxas de sucesso não passaram de 40%.

Não foi um resultado isolado. Pesquisas publicadas em 2026 pela BCG, McKinsey e IDC mostram que **60 a 72% dos pilotos de agentes IA travam antes de chegar à produção**. Dos agentes que efetivamente atingem produção, **35 a 45% são deprecados em 12 meses**, o dobro da taxa de churn de chatbots tradicionais. O problema não é que os modelos não são inteligentes. É que a engenharia de confiabilidade necessária para operá-los no mundo real ainda não é prática padrão.

Este artigo decompõe como construir um pipeline de avaliação que realmente protege o deploy de agentes IA. Não é sobre escolher uma ferramenta de dashboard. É sobre a engenharia de medição que separa agentes que shipam de agentes que viram estatística.

## O problema fundacional: pass@k vs pass^k

Antes de qualquer ferramenta, há um framing shift que reordena tudo. Existem duas formas de resumir um agente que você roda múltiplas vezes na mesma tarefa. **pass@k** é a probabilidade de que pelo menos uma de k tentativas tenha sucesso: uma visão de melhor caso. **pass^k** é a probabilidade de que todas as k tentativas tenham sucesso: uma visão de consistência. Elas respondem a perguntas diferentes, e para confiabilidade em produção apenas a segunda é honesta.

Considere um agente com 70% de taxa de sucesso por tentativa, rodado três vezes. Seu pass@3 é aproximadamente 97,3%. Lido isoladamente, parece pronto para produção. Seu pass^3, a chance de todas as três runs acertarem, é aproximadamente 34,3%. Esse é o mesmo agente descrito de duas formas, e a diferença de 63 pontos percentuais é inteiramente um artefato de qual métrica você escolheu reportar. Como Philipp Schmid, do Google DeepMind, colocou: "O maior desafio para agentes IA em produção não é performance de pico, mas confiabilidade."

Uma framework de reliability science publicada no arXiv em 2026 reporta gaps de até 25 pontos percentuais entre pass@k e pass^k across agentic benchmarks, evidência de que uma parcela significativa do sucesso medido vem de exploração estocástica entre tentativas, não de capacidade determinística. A takeaway prática: se seu eval reporta apenas pass@1 ou pass@k, você ainda não sabe quão confiável seu agente é.

## Vocabulário compartilhado: cinco termos antes de qualquer ferramenta

Antes de tooling, um time precisa de definições compartilhadas. A engenharia da Anthropic define cinco termos centrais que tornam o resto do pipeline legível. Adotá-los literalmente paga dividendos na primeira vez que uma divergência de grader se revela uma divergência de vocabulário.

**Transcript** é o registro completo dos passos do agente. **Outcome** é o estado final do ambiente: se uma reserva existe no banco de dados, não apenas se o agente disse que reservou. **Grader** é o componente que decide passou ou falhou. **Eval** é o conjunto de tarefas mais os graders aplicados. **Golden dataset** é o conjunto curado de inputs e outputs esperados que serve de baseline.

A distinção que times pulam e depois lamentam é verificar o mundo, não as palavras. Grading apenas no transcript ("o agente afirmou que terminou?") é como shipar um agente que reporta sucesso confiante enquanto o banco de dados permanece vazio. Outcome verification, checar o estado real do mundo ao final, é o que separa um eval que protege usuários de um que protege egos.

## Golden dataset: comece com falhas reais, não com uma wishlist

O motivo mais comum de projetos de eval travarem é esperar pelo dataset perfeito. Você não precisa de um. A Anthropic recomenda começar com 20 a 50 tarefas extraídas de falhas reais, não centenas de exemplos curados. Agentes em estágio inicial têm effect sizes grandes por mudança: um conjunto pequeno e bem escolhido dá signal suficiente para iterar.

O critério para uma boa tarefa é concreto: dois especialistas de domínio devem chegar independentemente ao mesmo veredito de passou/falhou. Se eles divergiriam, a tarefa é ambígua, e uma tarefa ambígua produz um grader não confiável.

Conforme o pipeline amadurece, dois tipos de dataset servem a dois estágios distintos, e confundi-los é um erro frequente. **Datasets de CI** são purpose-built, eventualmente 100+ exemplos cobrindo features centrais e regressões conhecidas, e rodam em cada commit. **Evaluation de produção** é diferente: amostra traces live de forma assíncrona e depende de avaliadores reference-free, porque para a maior parte do tráfego real não há ground-truth para comparar.

Sobre construção de datasets: geração pura por LLM falha consistentemente em contextos de domínio específico, idiomas de baixo recurso, aplicações de alto risco e grupos sub-representados. A abordagem durável é híbrida: criar manualmente aproximadamente 20 tuplas de combinação de dimensões para ancorar a distribuição, então escalar através de tuplas geradas por LLM convertidas para linguagem natural. Humanos definem a forma; o modelo preenche o volume.

## Graders: code-based e model-based, usados deliberadamente

Duas classes de grader dominam pipelines de produção, e a disciplina de engenharia é saber qual job cada uma resolve.

**Graders code-based** (string matching, regex, testes binários, static analysis, outcome verification) são rápidos, baratos e determinísticos. Use-os primeiro para qualquer coisa verificável em código. **Graders model-based** (rubric scoring, natural-language assertions, pairwise comparison, multi-judge consensus) são flexíveis o suficiente para qualidade subjetiva, mas custam mais por chamada e requerem calibração antes de serem confiáveis.

Há também uma escolha sobre o que grading avalia. **Trajectory evaluation** pergunta "o agente tomou o caminho certo?" e responde a perguntas de engenharia. **Outcome evaluation** pergunta "o agente completou a tarefa?" e responde a perguntas de negócio. A Anthropic alerta explicitamente contra over-grading de sequências de passos, porque agentes regularmente encontram abordagens válidas que seus designers nunca anteciparam. Graders podem ser gamificados quando recompensam o path em vez do resultado.

Um ponto contraintuitivo: uma escala de qualidade 1 a 5 parece mais informativa, mas na prática permite que annotators clusterizem em um não comprometedor 3 e requer samples muito maiores para significância estatística. Uma chamada forçada de passou/falhou expõe divergências reais, que é exatamente o signal que você quer cedo.

## LLM-as-judge: os cinco vieses que todo judge carrega

LLM-as-judge é o componente mais abusado no stack moderno de evals: deployado rápido, calibrado nunca, silenciosamente produzindo números que ninguém checou contra humanos. Construir um judge confiável é um processo de cinco passos: identificar modos de falha persistentes através de error analysis, ter especialistas criando 100+ exemplos rotulados, refinar iterativamente o prompt do judge, medir true-positive e true-negative rates contra um held-out test set, e deployar apenas quando o alinhamento humano for demonstrável.

A razão pela qual calibração é não-opcional é que judges carregam vieses sistemáticos e nomeados. Eugene Yan, ML engineer, cataloga cinco vieses persistentes na literatura de pesquisa:

1. **Position bias**: um modelo favoreceu a primeira resposta em aproximadamente 70% das comparações. Mitigação: randomizar ordem ou fazer média sobre posições trocadas.
2. **Verbosity bias**: judges preferiram respostas mais longas em mais de 90% das vezes mesmo em qualidade igual. Mitigação: controlar por comprimento no rubric.
3. **Self-preference**: judges da mesma família do modelo gerador inflacionam win rate em 10 a 25%. Mitigação estrutural: use um judge de família diferente do gerador.
4. **Format bias**: judges recompensam outputs que match um formato preferido independentemente da substância.
5. **Calibration drift**: um judge que concordava com humanos no trimestre passado silenciosamente diverge conforme prompts, modelos ou distribuições de dados mudam.

Os números são baseline de pesquisa de 2024 em modelos da era GPT-3.5, então devem ser lidos como referência histórica, não como comportamento de frontier models de 2026. O que persiste é a necessidade de verificação estruturada: o baseline aceito para calibração de judge é Cohen's kappa de pelo menos 0.6 contra revisores humanos. Abaixo de 0.41, você está em território de "não ainda concordância moderada" e não deveria estar gating nesse judge.

Em um caso documentado, um time usou um modelo da mesma família para julgar seus próprios outputs e viu um dashboard mostrando métricas essencialmente perfeitas por três meses, enquanto a concordância real do judge com revisão de especialistas ficava em Cohen's kappa 0.31. Dashboard verde não é evidência de judge calibrado.

Calibração não é setup one-time. Recalibre em cadência regular (mensal é um default sensato) e dispare recalibração out-of-cycle sempre que mudar o rubric, upgrade de modelo ou shift na distribuição de dados.

## Gates de CI/CD: cinco evaluation gates que não existem em pipelines tradicionais

Agent CI/CD em 2026 requer cinco gates de avaliação que não existem em pipelines tradicionais:

1. **Golden dataset offline eval**: rodar o agente contra o dataset de CI em cada pull request. Se a taxa de sucesso cai abaixo do threshold, o PR não merge.
2. **Regression blocks**: casos de teste específicos para bugs já conhecidos e corrigidos. Se um regresssion test falha, o bug voltou.
3. **Cost gates**: medir custo de inferência por tarefa. Se um prompt change aumenta o custo por task em mais de X%, bloquear. Agentes podem ficar funcionalmente corretos e financeiramente inviáveis.
4. **Shadow evaluation against production traces**: rodar a nova versão do agente em paralelo contra traces de produção reais (sem servir ao usuário) e comparar outputs.
5. **Canary rollout with auto-rollback**: deployar para 5% do tráfego, medir evals em tempo real, e reverter automaticamente se métricas degradarem além de threshold.

Dados de pesquisa de produção indicam que 89% dos times de agentes em produção rodam observability, mas apenas 52% rodaram evaluation estruturada antes do deploy. Esse gap é onde regressões entram.

## Feedback loop de produção: traces viram test cases

O disconnection mais comum é entre evaluation pre-deployment e monitoring de produção. Você pode pontuar 95% no seu test set e não saber se isso se traduz em performance em produção.

A solução é fechar o loop: rodar os mesmos evaluators em tráfego de produção, comparar scores pre-launch com realidade post-launch, detectar quality drift antes que usuários reclamem, e alimentar edge cases de produção de volta para o test dataset.

Este é o ciclo que transforma eval de um checkpoint em um sistema contínuo: traces de produção alimentam o golden dataset, o golden dataset alimenta CI, CI bloqueia regressões antes do deploy, e o deploy gera novas traces que reiniciam o ciclo.

## O que isso significa para empresas brasileiras

A maioria das empresas brasileiras que avaliam adoção de agentes IA em 2026 está no estágio de piloto ou proof-of-concept. O dado da BCG de que 60 a 72% dos pilotos nunca chegam à produção não é um aviso abstrato: é o resultado de times que não investiram em engenharia de avaliação antes de tentar shipar.

Para empresas brasileiras, três implications são imediatas:

**Primeiro, comece pequeno com golden datasets.** 20 a 50 tarefas extraídas de falhas reais do seu próprio piloto são mais valiosas que 500 exemplos genéricos. O custo de construir isso é baixo e o signal é alto.

**Segundo, invista em outcome verification antes de LLM-as-judge.** Verificar se a ação foi realmente executada no banco de dados, no sistema de tickets ou no CRM é barato, determinístico e captura o modo de falha mais comum: agentes que reportam sucesso sem ter completado a tarefa.

**Terceiro, gate deploys em pass^k, não pass@1.** Se seu agente tem 70% de sucesso por tentativa, você precisa saber que a consistência em três runs é 34%, não 97%. O número que parece bom e o número que significa algo são diferentes, e escolher o errado é como shipar sem testes.

## Conclusão

O gargalo que limita deploy confiável de agentes IA em 2026 não é capability do modelo. É methodology de avaliação. Times que shipam agentes confiáveis não compram um dashboard e chamam de done. Eles constroem um loop de medição: golden dataset de falhas reais, graders que verificam o mundo e não apenas as palavras, LLM-as-judge calibrado contra humanos, gates de CI/CD que bloqueiam regressões, e feedback loop de produção que transforma traces em test cases.

A pergunta não é se você pode deployar um agente. É se você pode deployar o mesmo agente amanhã, depois de mudar o prompt, e saber matematicamente que ele não piorou. Sem esse conhecimento, você está shipando cego.

## Referências

Anthropic (2026). *The 2026 State of AI Agents Report*. Anthropic, em parceria com Material. Disponível em: resources.anthropic.com

Anthropic (2026). *Engineering Guidance for Agent Evaluation*. Documentação técnica interna. Referenciado em: digitalapplied.com

Vidgen, B. et al. (2026). *APEX-Agents: Benchmarking AI Agents on Real-World Professional Tasks*. Mercor. Disponível em: mercor.com

BCG (2026). *AI Agent Production Survey Q1 2026*. Boston Consulting Group.

Presenc AI (2026). *State of AI Agents in Production 2026*. Presenc AI Research.

Schmid, P. (2026). "The biggest challenge for AI agents in production isn't their peak performance, but their reliability." Google DeepMind. Citado em: digitalapplied.com

Yan, E. (2024). *Evaluating LLM-as-Judge: Biases and Mitigation Strategies*. eugeneyan.com. Baseline de pesquisa em modelos da era GPT-3.5.

Husain, H. (2026). *LLM Evals FAQ*. hamel.dev.

Digital Applied Team (2026). *Building an AI Agent Evaluation Pipeline: 2026 Methodology*. digitalapplied.com

Adaline (2026). *The Complete Guide to LLM & AI Agent Evaluation in 2026*. adaline.ai

MLflow (2026). *Integrating Evaluation into AI Workflows: 2026 Guide*. mlflow.org

Gartner (2026). *Forecast: 40% of Enterprise Applications Will Integrate Task-Specific AI Agents by End of 2026*. Gartner Research.