---
title: "De SaaS para Service-as-Software: Como Agentes IA Estão Reescrevendo o Modelo de Negócio de Software"
description: "O SaaSpocalypse de fevereiro de 2026 apagou US$ 285 bilhões em valor de mercado de empresas de SaaS em um único dia. Não foi pânico: foi o mercado precificando que o modelo per-seat está morto. Agentes IA verticais estão substituindo software horizontal por outcomes, e a oportunidade é de US$ 4,6 trilhões. Este artigo mapeia a transição de SaaS para Service-as-Software com dados de Gartner, McKinsey, IDC, Foundation Capital e Crunchbase, e analisa o que isso significa para empresas brasileiras de IA."
date: "2026-06-25"
author: "Luiz Felipe Barbedo"
authorRole: "BD e Co-fundador na BaXiJen"
tags: ["SaaS", "service-as-software", "agentes IA", "vertical AI", "modelo de negócio", "pricing", "B2B", "SaaSpocalypse", "IA brasileira", "BaXiJen", "outcomes"]
featured: true
image: "/blog/service-as-software-cover.svg"
imageAlt: "Diagrama comparando o modelo SaaS tradicional (caixas horizontais genéricas com pricing per-seat) com o modelo Service-as-Software (agentes verticais especializados com pricing por outcome). Setas indicam a transição: de licenças de software para entrega de resultados. Marcadores mostram US$ 200B (mercado SaaS) vs US$ 4,6T (oportunidade services-as-software)."
---

Em 30 de janeiro de 2026, a Anthropic publicou um repositório no GitHub que quase ninguém percebeu no fim de semana. Na segunda-feira seguinte, o mercado de ações de software perdeu **US$ 285 bilhões em valor de mercado em uma única sessão**. O episódio ganhou o apelido de "SaaSpocalypse": investidores liquidaram posições em Salesforce, Workday, Snowflake e dezenas de outras empresas de SaaS porque os plugins do Claude demonstraram que agentes de IA podem executar workflows inteiros que antes pertenciam a essas plataformas (SaaSCity, 2026). Não foi pânico irracional. Foi o mercado precificando uma transição que já estava em curso.

O SaaSpocalypse não foi um evento isolado. Foi o sintoma mais visível de uma mudança estrutural que está reescrevendo como software é vendido, precificado e entregue. O modelo SaaS tradicional, construido sobre licenças per-seat e plataformas horizontais, está sendo substituído por algo que investidores e praticantes estão chamando de **Service-as-Software**: empresas que não vendem acesso a uma ferramenta, mas entregam o resultado de um trabalho. A diferença parece sutil na frase, mas é brutal no balanço.

Este artigo mapeia essa transição com dados de Gartner, McKinsey, IDC, Foundation Capital e Crunchbase. Para cada elemento da mudança, analiso o que significa para empresas brasileiras que estão construindo produtos de IA e para aquelas que ainda estão decidindo se compram SaaS tradicional ou apostam em agentes autônomos.

## 1. O fim do pricing per-seat: dados que confirmam o óbvio

O modelo de precificação do SaaS sempre foi simples: cobrar por assento. Uma empresa com 100 usuários de CRM paga 100 licenças. Esse modelo funciona quando humanos são os usuários. Quando agentes de IA passam a executar os workflows, a métrica perde o sentido.

A análise da Lateral Investment Management, publicada em junho de 2026 na Crunchbase, é direta sobre isso (de Silva, 2026): uma empresa que precisava de 100 licenças de CRM para sua equipe de vendas pode precisar de apenas 50 quando agentes de IA passam a gerar a maior parte do uso. O pricing per-seat evapora no momento em que agentes se tornam os usuários principais. Em vez de licenças, o novo modelo cobra por uso (quantas transações o agente executou) ou por outcome (qual resultado foi entregue).

A Foundation Capital, em relatório publicado em junho de 2026, nomeou essa categoria de **Services-as-Software** e estimou o tamanho da oportunidade em **US$ 4,6 trilhões** (Foundation Capital, 2026). O argumento é que essas empresas não estão competindo pelo budget de TI, que historicamente era o endereço do SaaS. Estão competindo pelo budget de mão de obra, que é ordens de magnitude maior. Uma plataforma de IA legal que cobra por contrato redigido não está competindo com o software jurídico que o cliente usava antes. Está competindo com o advogado que faria aquele trabalho.

A tabela abaixo sintetiza a diferença entre os dois modelos:

| Dimensão | SaaS tradicional | Service-as-Software |
|---|---|---|
| Unidade de venda | Licença por assento | Resultado entregue (outcome) |
| Usuário | Humano | Agente de IA |
| Budget alvo | TI / Operações | Mão de obra / Compliance |
| Modelo de pricing | Subscription (mensal fixo) | Usage-based ou success fee |
| Diferenciação | Features e UX | Domain expertise e dados proprietários |
| Switching cost | Exportar dados | Reconstruir lógica de negócio |
| Mercado endereçável | ~US$ 200B (SaaS global) | ~US$ 4,6T (serviços white-collar) |

A implicação para empresas brasileiras é imediata. Quem está construindo produtos de IA e ainda cobra por assento está competindo no mercado que está encolhendo. Quem cobra por resultado está competindo no mercado que está se expandindo.

## 2. Horizontal é passivo: a vantagem do vertical

O artigo da Crunchbase é incisivo sobre um ponto: **SaaS horizontal genérico é a categoria mais vulnerável a essa transição** (de Silva, 2026). Se um produto inteiro é uma camada sobre um workflow que um agente de IA pode executar autonomamente, a proposta de valor desaparece. Construtores de formulários, plataformas de gestão de projetos genéricas, CRMs de pequeno porte, agendadores de redes sociais: essas categorias estão comprimindo rápido e podem não se recuperar.

As posições defensáveis agora pertencem a especialistas verticais. A análise identifica três elementos que criam moats reais (de Silva, 2026):

1. **Distribuição**: base de clientes recorrente e estabelecida, com relacionamento de longo prazo.
2. **Domain expertise**: especialização para operar em indústrias reguladas ou complexas, com conhecimento de compliance, terminologia e processos específicos.
3. **Dados proprietários**: informação que drive tomada de decisão e é mantida pelos clientes, inacessível a modelos de fronteira.

Quando um produto é construido em torno dos workflows, terminologia e requisitos de compliance de uma indústria específica, terminar a relação com o fornecedor não é migrar dados. É reconstruir uma teia complexa de experiências, corner cases e conhecimento histórico. O cliente permanece não porque está preso, mas porque o custo de retreinar, reconfigurar e encontrar um fornecedor que entenda seu mundo é alto demais.

Para a BaXiJen, essa análise reforça o posicionamento que já adotamos. Construir IA para o setor público brasileiro, com modelos open-source rodando on-premise, é por definição uma estratégia vertical. O domain expertise não é opcional: é a barreira de entrada que impede que players globais replicuem o produto com um wrapper de prompt.

## 3. Dados de adoção: o que 2026 revelou

Quatro datasets independentes convergem no mesmo formato de distribuição para outcomes de agentes de IA em produção (Agent Mode AI, 2026):

- **IDC com Lenovo** (março de 2025): 88% dos proofs-of-concept de IA nunca chegam a deploy em escala. Para cada 33 POCs lançados, aproximadamente 4 se graduam para produção (CIO.com, 2025).
- **Gartner Q1 2026**: 28% dos projetos de IA pagam totalmente o investimento. 57% dos líderes que experimentaram falhas citam "expectativa de demais, cedo demais" como causa (Gartner, abril de 2026).
- **McKinsey State of AI 2025**: 23% das empresas estão escalando IA agentic. 39% ainda experimentam. Um segmento de 6%, classificado como AI high-performers, atribui mais de 5% do EBIT à IA generativa (McKinsey, novembro de 2025).
- **Carnegie Mellon TheAgentCompany 2026**: modelos de fronteira completam 30,3% das tarefas enterprise de agentes. O teto de capacidade é real e não é específico de fornecedor (CMU, 2026).

O relatório State of AI Agents 2026, publicado pela equipe do Claude em dezembro de 2025 com base em dados de organizações que deployaram agentes em produção, complementa esse quadro com cinco achados (Arcade.dev, 2025):

- **80%** das organizações reportam impacto econômico mensurável de agentes de IA hoje.
- **57%** já deployam workflows multi-step de agentes.
- **46%** citam integração com sistemas existentes como a principal barreira.
- **47%** adotam abordagem híbrida (compram e constroem).
- **88%** esperam que o ROI continue ou cresça em 2026.

A leitura combinada desses dados revela uma assimetria: há uma coorte pequena que converte IA agentic em outcomes mensuráveis e uma coorte grande que não consegue. A variável que distingue as duas não é tecnológica. É operacional. A disciplina de deploy, a qualidade da integração e o conhecimento de domínio determinam quem captura valor e quem estagna.

## 4. O novo go-to-market: venda direta volta com ACVs maiores

Um dado contra-intuitivo do relatório da Crunchbase sobre vertical AI é que **ACVs (Annual Contract Values) maiores estão trazendo venda direta de volta** (Crunchbase, 2026). Durante a era SaaS horizontal, a venda direta foi progressivamente substituída por product-led growth e self-service porque os tickets eram baixos e o volume era a estratégia. No modelo Service-as-Software, os contratos são maiores porque o valor entregue é maior: o software está fazendo o trabalho de uma pessoa, não apenas acelerando o trabalho de uma pessoa.

A consequência prática para startups brasileiras de IA é que o go-to-market não precisa ser self-service para funcionar. Uma plataforma de IA que substitui trabalho de nível profissional e cobra uma fração do custo da mão de obra pode ter um ACV de R$ 100 mil a R$ 500 mil anuais. Nessa faixa de preço, venda direta com ciclo de 60 a 90 dias é viável e necessária. O produto precisa de implementação customizada, o que significa que o forward-deployed engineer se torna o vendedor técnico.

A Foundation Capital identificou esse padrão claramente: em empresas de Services-as-Software com tração real, a linha entre pre-sales e post-sales deixou de existir (Foundation Capital, 2026). O engenheiro que implementa o produto no cliente é a mesma pessoa que demonstra valor durante a venda. A integração não é uma atividade pós-venda. É a superfície do produto.

## 5. Gartner: o fim do AI assistive para workflow de outcome

Em abril de 2026, a Gartner publicou um press release que formaliza a direção da transição. A previsão é que **a maioria das empresas abandonará AI assistiva em favor de workflows focados em outcome até 2028** (Gartner, abril de 2026). O relatório afirma que a primeira onda de disrupção vai atingir funções de atendimento ao cliente e processamento de documentos, com ondas subsequentes em análise financeira, compliance e operações de supply chain.

A Gartner também publicou uma previsão mais cauteliva em junho de 2025: **mais de 40% dos projetos de IA agentic serão cancelados até o final de 2027** (Gartner, junho de 2025). A aparente contradição entre as duas previsões é na verdade complementar. O mercado está se bifurcando: projetos que entregam outcomes mensuráveis vão se expandir, e projetos que ficam em modo assistivo sem ROI claro vão ser cortados. A mesma consultoria que prevê a adoção massiva também prevê o cleanup dos projetos que não justificam o investimento.

Para empresas brasileiras, a mensagem é: o assistente de IA que apenas sugere respostas para um humano decidir está com os dias contados. O agente que executa o workflow inteiro e entrega o resultado é o que vai capturar budget.

## 6. O que isso significa para o mercado brasileiro

A transição de SaaS para Service-as-Software tem três implicações específicas para o ecossistema brasileiro de IA:

**1. O budget de mão de obra é maior que o budget de TI.** Em empresas médias e grandes brasileiras, o budget anual de TI é tipicamente 1 a 3% do faturamento. O budget de mão de obra é 20 a 40%. Um produto de IA que cobra por resultado e substitui trabalho de nível profissional tem um teto de pricing 10 a 20 vezes maior que um produto SaaS equivalente. Isso muda a economia unitária do go-to-market: CAC mais alto é sustentável quando o LTV é proporcionalmente maior.

**2. Soberania de dados vira moat, não custo.** No modelo SaaS horizontal, dados no Brasil eram um requisito de compliance (LGPD). No modelo Service-as-Software, dados proprietários são a barreira de entrada. Agentes que aprendem com uso, treinados em dados específicos do contexto brasileiro, acumulam valor que modelos genéricos não conseguem replicar. Cada cliente que deploya um agente on-premine gera dados que tornam o produto melhor para o próximo cliente. É o data flywheel aplicado a serviços.

**3. O papel do forward-deployed engineer é estratégico.** A Foundation Capital mostra que em companies de Services-as-Software com tração real, o FDE é o ativo mais estratégico (Foundation Capital, 2026). Ele mapeia workflows, codifica regras de negócio não-documentadas, configura parâmetros runtime e cria scaffolding reutilizável. No Brasil, onde processos de negócio são altamente idiossincráticos e a documentação formal frequentemente diverge da prática real, esse papel é ainda mais central. Quem investir em FDEs hoje está construindo o moat de amanhã.

## 7. O mapa da transição

A transição de SaaS para Service-as-Software não vai acontecer de uma vez. Vai acontecer vertical por vertical, começando pelas indústrias onde o workflow é mais estruturado e o custo de erro é tolerável. Atendimento ao cliente, processamento de documentos, análise de dados, revisão de contratos: essas são as primeiras ondas. Depois vêm compliance, underwriting, diagnóstico técnico e, por fim, funções que exigem julgamento humano em cenários de alto risco.

O relatório da Gartner deixa claro que 2028 é o horizonte para a virada significativa (Gartner, abril de 2026). Mas os dados do State of AI Agents 2026 mostram que 80% das organizações que já deployaram agentes vêem ROI mensurável hoje (Arcade.dev, 2025). A assimetria entre o presente (early adopters capturando valor) e o futuro (massa abandonando AI assistiva) é onde a oportunidade está.

Para a BaXiJen, a estratégia é clara: continuar construindo agentes verticais para o setor público brasileiro, com pricing por outcome e dados proprietários como moat. O mercado de SaaS horizontal para o setor público é pequeno e congestionado. O mercado de serviços de IA para o setor público é grande e subatendido. Estamos no lado certo da transição.

---

## Referências

Arcade.dev (2025). *5 Takeaways from the 2026 State of AI Agents Report*. Recuperado de: https://www.arcade.dev/blog/5-takeaways-2026-state-of-ai-agents-claude/

Carnegie Mellon University (2026). *TheAgentCompany: Benchmarking AI Agents on Real Enterprise Tasks*. Recuperado de: https://the-agent-company.com/

CIO.com (2025). *88% of AI Pilots Fail to Reach Production*. IDC Research com Lenovo. Recuperado de: https://www.cio.com/article/3850763/88-of-ai-pilots-fail-to-reach-production-but-thats-not-all-on-it.html

Crunchbase (2026). Agarwal, M. *How Bigger ACVs Are Bringing Direct Sales Back To Vertical AI*. Recuperado de: https://news.crunchbase.com/ai/bigger-acvs-bring-direct-sales-vertical-ai-agarwal-defy/

de Silva, R. (2026). *SaaS Isn't Coming Back. Something Much Bigger Is Replacing It*. Crunchbase / Lateral Investment Management. Recuperado de: https://news.crunchbase.com/saas/growing-agentic-ai-market-desilva-lateral/

Foundation Capital (2026). *The $4.6T Services-as-Software Opportunity: Lessons from the First Year*. Recuperado de: https://foundationcapital.com/ideas/the-4-6t-services-as-software-opportunity-lessons-from-the-first-year

Gartner (2025). *Gartner Predicts Over 40% of Agentic AI Projects Will Be Canceled by End of 2027*. Recuperado de: https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027

Gartner (2026). *Gartner Expects Most Enterprises to Abandon Assistive AI for Outcome-Focused Workflow by 2028*. Recuperado de: https://www.gartner.com/en/newsroom/press-releases/2026-04-02-gartner-expects-most-enterprises-to-abandon-assistive-ai-for-outcome-focused-workflow-by-2028

McKinsey & Company (2025). *The State of AI in 2025*. Recuperado de: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai

SaaSCity (2026). *The SaaSpocalypse: How Claude's Plugins Just Torched $285 Billion in SaaS Market Cap*. Recuperado de: https://saascity.io/blog/the-saaspocalypse-how-claude-plugins-torched-285-b-saas-market-cap

*Por Luiz Felipe Barbedo, BD e Co-fundador na BaXiJen*