---
title: "FinOps de Agentes IA: O Custo Por Task Que o CFO Vai Pedir Antes de Renovar o Contrato"
description: "A economia dos agentes IA virou linha de orçamento com dono. O State of Tokenomics de setembro de 2026 ouviu 472 empresas que somam US$ 4,6 trilhões de receita: 96% usam modelos frontier, mas 3 em cada 4 não conseguem demonstrar ao CFO que o gasto em tokens gera resultado de negócio. A McKinsey mede que 93% dos times de IA estouram o orçamento e que 60% do custo de uma task agentic está no refinamento da resposta, não na primeira geração. A EY estima que um atendimento que custava US$ 0,04 em 2023 virou uma orquestração de US$ 1,20 em 2026. Este artigo decompõe a unit economics que separa o piloto do contrato: o custo por task como métrica de gestão, as sete camadas de custo que a fatura do model vendor não mostra, a divisão de trabalho entre finance, engenharia e FinOps que o FinOps Foundation mapeou, e o playbook de contratação para o comprador institucional brasileiro que não quer descobrir a conta só no renewal."
date: "2026-10-01"
author: "Luiz Felipe Barbedo"
authorRole: "Business Development | Co-Founder BaXiJen"
tags: ["FinOps de IA", "tokenomics", "agentes IA", "custo por task", "unit economics", "CFO", "AI budget", "custos ocultos", "procurement", "mercado brasileiro", "BaXiJen"]
featured: true
image: "/blog/finops-agentes-custo-por-task-cover.svg"
imageAlt: "Infográfico sobre FinOps de agentes IA e custo por task. À esquerda, a explosão do custo unitário: interação de atendimento que custava US$ 0,04 em 2023 vira US$ 1,20 em 2026, multiplicação por 30 em laranja. Ao centro, as sete camadas do custo total de um agente empilhadas em ciano, do token ao risco regulatório, com a camada de tokens destacada como apenas parte da conta. À direita, os três donos do envelope de custo: finance define envelope, engenharia define cotas e FinOps traduz, em barras horizontais. Rodapé com a frase: quem não mede custo por task negocia preço. Paleta azul-ciano da BaXiJen sobre fundo escuro."
---

# FinOps de Agentes IA: O Custo Por Task Que o CFO Vai Pedir Antes de Renovar o Contrato

Em 23 de setembro de 2026, a Tokenomics Foundation, braço da Linux Foundation, publicou o primeiro retrato vendor-neutral da economia de tokens: 472 respostas de empresas que somam **US$ 4,6 trilhões de receita**, com receita média de US$ 21 bilhões. O achado que interessa a quem vende IA não é o quanto as empresas gastam. É o quanto elas não sabem explicar o gasto: **três em cada quatro organizações não conseguem conectar o spend de IA a um resultado de negócio que o CFO aceite** (Tokenomics Foundation, 2026).

O segundo dado fecha o arco. A McKinsey mediu, em survey de maio de 2026, que **93% dos times de IA empresariais estouram o próprio orçamento** (McKinsey, 2026b). Não é um problema de disciplina financeira. É um problema de métrica: o orçamento de IA foi construído em cima do preço do token, e o token deixou de ser a unidade certa de gestão quando o workload virou agente.

Este artigo é o guia de economia que faltava entre o piloto comemorado e o renewal que travou. A tese é comercial e operacional ao mesmo tempo: **a unidade de gestão de custo de agente IA é a task concluída, não o token consumido**, e quem não mede custo por task antes da assinatura vai descobrir o preço real de um agente apenas quando o contrato já venceu.

## Por que o token parou de ser a métrica certa

O preço unitário do token cai. A conta total sobe. A McKinsey descreveu o paradoxo que dominou 2026: **o custo individual do token continua caindo, enquanto o gasto empresarial com IA dispara** (McKinsey, 2026a). Em julho de 2026, um modelo frontier como o GPT-5.5 custava cerca de **US$ 5 por milhão de tokens de entrada e US$ 30 por milhão de tokens de saída**, contra US$ 0,20 e US$ 1,25 de um modelo leve anterior (McKinsey, 2026a). A deflação de preço por token existe e é real. Ela só não chega na fatura, porque a demanda mudou de forma: o agente planeja, chama ferramentas, recupera contexto, delega para subagentes e refaz o próprio trabalho.

A EY quantificou o salto com um exemplo de atendimento: **um chat que custava US$ 0,04 por interação em 2023 virou uma orquestração de US$ 1,20 em 2026**, cerca de 30 vezes mais caro, porque agora envolve retrieval de ferramentas, planejamento e subagentes (EY, 2026). O mesmo movimento aparece na arquitetura: um fluxo simples de geração consome centenas de tokens; uma task agentic com múltiplas ferramentas consome dezenas de milhares. A conta deixa de ser linear e passa a depender do comportamento do próprio agente.

| Cenário | Ano | Custo por interação | O que mudou |
|---|---|---|---|
| Chat linear: input, retrieval, resposta | 2023 | US$ 0,04 | Uma chamada de modelo |
| Orquestração com ferramentas, planejamento e subagentes | 2026 | US$ 1,20 | Loops, retries, contexto recarregado |

Fonte: EY, 2026.

## Onde o custo realmente mora: 60% está no refinamento

Se o token não é a métrica, qual é a decomposição certa? A McKinsey abriu a task agentic e encontrou o número que muda qualquer planilha: **cerca de 60% do custo de uma task agentic está no refinamento da resposta**, na verificação, correção e revalidação que vêm depois da primeira geração, e não na geração inicial (McKinsey, 2026b). O insight de engenharia é direto: o caro não é o primeiro rascunho. O caro é a certeza.

Isso tem consequência direta para o comercial. Quando o cliente pergunta "quanto custa esse agente", a resposta honesta precisa incluir o refinamento, porque é onde mora a maior fatia da conta. A McKinsey acrescenta um segundo número: em workflows de atendimento bancário, **os tokens representam apenas 20% a 25% dos custos variáveis de operação** de um agente IA (McKinsey, 2026b). O resto é humano: revisão, supervisão, cyber, treino, redesenho do processo. Um agente cliente-facing em banco pode custar entre **US$ 20 mil e US$ 30 mil por workflow de agente único em execução** (McKinsey, 2026a).

## As sete camadas de custo que a fatura do vendor não mostra

A EY mapeou o custo total de um agente em sete linhas, e a observação central é desconfortável: **a maioria das empresas inclui apenas as camadas 1 a 3 no business case**, e as camadas 4 a 7 só aparecem quando o agente escala (EY, 2026).

| Camada | O que é | Onde aparece a despesa |
|---|---|---|
| 1. Tokens e modelo | Inferência do LLM | Fatura do model vendor |
| 2. Infraestrutura de IA | GPU, serving, data pipeline | Fatura de cloud |
| 3. Orquestração e plataforma | Routing, retrieval, gateway, monitoramento | Cloud e plataforma |
| 4. Governança e compliance | Guardrails, auditoria, risco, revisão humana | Headcount, risco |
| 5. Redesenho organizacional | Retreinamento, arquitetura human-in-the-loop, mudança | RH e operação |
| 6. Custo de falha | Remediação do erro raro que passou pelos controles | Incidentes |
| 7. Risco regulatório | Multiplicador emergente em cima de tudo | Jurídico e compliance |

Fonte: EY, 2026.

A leitura para o comprador institucional é imediata: a proposta que mostra só a linha 1 está mostrando a menor parte da conta. A proposta que já traz as sete camadas, com dono e método de medição para cada uma, é a que vai sobreviver à primeira reunião de renewal.

## A conta do comprador: 98% já gerenciam, 36% já estouraram

A escala do problema no mercado está medida. O State of FinOps 2026, da FinOps Foundation, mostra que **98% das equipes de FinOps já gerenciam spend de IA, contra 31% dois anos antes**, o que tornou o gerenciamento de custo de IA a competência número um da função (Flexera, 2026). A Flexera adiciona o outro lado: **99% das organizações usam ou experimentam IA generativa, 36% reportam overspending em aplicações de IA e 14% já identificaram desperdício claro e não gerenciado** (Flexera, 2026).

A Gartner projeta o desfecho: **mais de 40% dos projetos de IA agentic serão cancelados até o fim de 2027**, por custos crescentes, valor de negócio pouco claro ou controles de risco inadequados (Gartner, 2025). O comprador de 2026 já sabe disso. Quando o vendedor chega com a proposta de agente IA, a sala do outro lado já leu essa predição. O projeto que chega ao renewal com custo por task medido é a exceção, e é por isso que ele negocia de outra forma.

## A divisão de trabalho que faz o envelope funcionar

Como as empresas que não travaram no orçamento resolveram a governança? O FinOps Foundation reuniu praticantes avançados sob a Chatham House Rule e a conclusão não foi uma fórmula de forecast, mas uma divisão de responsabilidades (Morley, 2026):

| Dono | Responsabilidade |
|---|---|
| Finance | Define o envelope e a tolerância: orçamento aberto, mas não pode dobrar |
| Engenharia | Converte o envelope em controles executáveis: cotas por ferramenta, limites por projeto |
| FinOps | Traduz e traz evidência: quantifica o vazamento, mostra quais camadas são recuperáveis |

Fonte: Morley, 2026.

A síntese da fundação merece destaque: **uma cota de tokens é, ao mesmo tempo, um controle financeiro e um controle de engenharia, e só funciona se os dois lados definirem juntos** (Morley, 2026). O relato dos praticantes inclui o exemplo concreto do vazamento: uma ferramenta de developer tooling em modo automático selecionava silenciosamente um modelo frontier para operações triviais, incluindo checkout de branch, e ninguém percebeu até o post-mortem (Morley, 2026).

O relatório do State of Tokenomics adiciona o dado de ownership: um terço das empresas tem a economia de IA com dono definido em CTO/CIO, um quarto distribui entre funções e 12% não têm dono nenhum. O contraste: **organizações com ownership definido são 3,7 vezes mais propensas a demonstrar valor ao CFO** (Tokenomics Foundation, 2026). Provar valor, aliás, é o desafio número um citado por 43% dos respondentes, seguido por visibilidade e atribuição de spend, com 27%. Só 7% citaram complexidade de preço (Tokenomics Foundation, 2026). O problema não é saber quanto custa o token. É saber o que ele entregou.

## O Brasil na curva: o orçamento que cresce sem a régua

O mercado brasileiro entra nesse estágio com um volume que muda a conversa. A IDC estima que a implementação de IA no Brasil, somando software, serviços e infraestrutura, supere **US$ 3,4 bilhões em 2026**, crescimento acima de 30% ao ano, com **38% dos gastos de IA no país direcionados a infraestrutura e aplicações em nuvem** (IDC, 2026). No recorte regional, o Brasil concentra **US$ 4,2 bilhões dos US$ 10 bilhões** do mercado latino-americano de IA, 41,7% do total (IDC apud Acaert, 2026). E o estudo ABES/IDC mostra a pressão de resultado: **95% das empresas brasileiras já usam IA, 86% usam IA generativa e 69% têm investimentos estruturados nos próximos 18 meses** (ABES/IDC, 2026).

A lacuna brasileira é a mesma global, mas com agravante de moeda: a IDC pesquisa também a expectativa de retorno, e as empresas brasileiras esperam, em média, **100% de retorno sobre os investimentos em IA**, o equivalente a US$ 2 de volta por dólar investido, ao mesmo tempo em que muitas não possuem indicadores claros para medir o resultado obtido (IDC apud ITForum, 2026). Expectativa de 100% de ROI com métrica não instrumentada é a definição operacional de um renewal que vai travar. Quem vende IA para o mercado institucional brasileiro e não chega com custo por task medido está vendendo para uma expectativa que ninguém consegue auditar.

## O playbook de contratação: sete perguntas antes da assinatura

Transformando a evidência em método, estas são as perguntas que separam a proposta que escala da que cancela.

**1. Qual é o custo por task concluída, medido em produção, não em demo?** É a métrica que a EY recomenda como benchmark: "quanto custa uma unidade de trabalho agentic consumir" é a pergunta que quase nenhuma empresa consegue responder hoje (EY, 2026). Exija número com distribuição, não média: a cauda P99 é onde a margem morre.

**2. Quantas das sete camadas de custo estão no business case?** A proposta que cobre só tokens, infra e orquestração está subestimando o TCO por construção. Governança, redesign organizacional, custo de falha e risco regulatório existem em todo deploy sério, apareçam na planilha ou não (EY, 2026).

**3. O refinamento está no preço?** Se 60% do custo está na verificação e revalidação, o fornecedor que precifica só a primeira geração está precificando 40% da task (McKinsey, 2026b). Pergunte o custo do segundo rascunho.

**4. Quem é o dono do envelope no cliente, e quem é no fornecedor?** Sem ownership, não há renewal: empresas sem dono da economia de IA não conectam spend a resultado. Com dono, a chance de demonstrar valor ao CFO multiplica por 3,7 (Tokenomics Foundation, 2026).

**5. Existem cotas de token como controle de engenharia, ou só como número de orçamento?** O aprendizado do FinOps Foundation é direto: envelope sem quota é número, não controle. A cota precisa existir onde o gasto acontece, casada com circuit breaker para loop runaway (Morley, 2026).

**6. Qual é a política de roteamento de modelo?** O exemplo do checkout de branch em modelo frontier é o vazamento mais comum e mais silencioso. Model routing, rightsizing, caching e batching são as alavancas que reduzem consumo sem degradar qualidade (McKinsey, 2026a). A auditoria do routing automático é a primeira otimização que a fundação recomenda (Morley, 2026).

**7. O que acontece quando o agente entra em loop?** O cenário de loop infinito entre agentes é o incidente financeiro clássico da era agentic. Kill switch, budget hard stop e alerta de anomalia de consumo precisam estar no contrato, não no post-mortem.

## O que isso muda para quem vende IA no Brasil

Para o fornecedor brasileiro de IA, a leitura estratégica é uma virada de posicionamento: a economia do agente deixa de ser objeção de fechamento e vira argumento de retenção. Quem entrega custo por task auditável, com as sete camadas mapeadas e quota casada com controle de engenharia, está vendendo o contrário do status quo: um deploy que o CFO consegue defender na reunião de orçamento seguinte.

Na BaXiJen, essa régua chegou antes do cliente pedir. Cada agente que entregamos sai com telemetria de consumo por task, custo de refinamento medido e orçamento com circuit breaker, porque a experiência do mercado em 2026 já mostrou o que acontece com o piloto que ninguém soube precificar: ele vira a estatística dos 40% que a Gartner projeta cancelar. IA local reduz a fatura de token e dá previsibilidade de custo em moeda local, mas o que sustenta o contrato é a régua: **custo por task concluída, medido, auditável, do piloto ao renewal**.

O piloto comemora a demo. O renewal assina a régua. Entre os dois, mora a diferença entre o agente que virou cases de marketing e o agente que virou linha de orçamento com dono.

## Referências

ABES/IDC. (2026, 6 agosto). *IA impulsiona nova corrida tecnológica nas empresas brasileiras, aponta estudo inédito da ABES*. Recuperado de https://abes.org.br/ia-impulsiona-nova-corrida-tecnologica-nas-empresas-brasileiras-aponta-estudo-inedito-da-abes/

EY. (2026). *Unlocking agentic value: a new investment discipline for the agentic era*. EY Total Cost of Agents. Recuperado de https://www.ey.com/en_us/insights/ai/agentic-ai-token-costs

Flexera. (2026, 25 setembro). *FinOps for AI: a practical guide to managing AI cloud costs*. Recuperado de https://www.flexera.com/blog/ai/finops-for-ai-cloud-costs/

Gartner. (2025, 25 junho). *Gartner Predicts Over 40% of Agentic AI Projects Will Be Canceled by End of 2027*. Recuperado de https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027

IDC. (2026). *Agentes de IA atrairão US$ 3,4 bi em TI ao Brasil em 2026*. Mobile Time. Recuperado de https://www.mobiletime.com.br/noticias/10/02/2026/agente-ia-idc-2026/

IDC apud Acaert. (2026). *Na América Latina, Brasil lidera mercado de inteligência artificial*. Recuperado de https://www.acaert.com.br/noticia/61715/na-america-latina-brasil-lidera-mercado-de-inteligencia-artificial

IDC apud ITForum. (2026). *Inteligência artificial avança nas empresas brasileiras, mas ROI ainda desafia escala*. Recuperado de https://itforum.com.br/noticias/ia-brasil-roi-escala/

McKinsey & Company. (2026a, 24 agosto). *Where AI agents pay off: a practical guide to the economics of agentic workflows*. Recuperado de https://www.mckinsey.com/capabilities/quantumblack/our-insights/where-ai-agents-pay-off-a-practical-guide-to-the-economics-of-agentic-workflows

McKinsey & Company. (2026b). *Is that AI agent worth it? Agentic economics and the modern operating model*. McKinsey Quarterly. Recuperado de https://www.mckinsey.com/capabilities/quantumblack/our-insights/is-that-ai-agent-worth-it-agentic-economics-and-the-modern-operating-model

Morley, J. (2026, 5 agosto). *Who sets the AI budget?* FinOps Foundation. Recuperado de https://www.finops.org/insights/setting-ai-budget/

Tokenomics Foundation. (2026, 23 setembro). *State of Tokenomics, September 2026*. Recuperado de https://www.tokeneconomics.com/state-of-tokenomics/

---

*Por Luiz Felipe Barbedo, Co-fundador e Head de Business Development na BaXiJen. Especialista em go-to-market e comercialização de IA B2B para o mercado institucional brasileiro.*