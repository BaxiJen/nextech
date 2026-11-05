---
title: "Licitações de IA Depois do Muse: O Que a Troca de Geração Aberta da Meta Muda no Edital Público"
description: "Em 15 de outubro de 2026 a Meta publicou os pesos do Muse Spark Open, 816 bilhões de parâmetros, e aposentou de fato a marca Llama. Para o mercado, foi o retorno da empresa ao jogo dos pesos abertos. Para quem escreve edital no Brasil, foi uma troca de referência sem aviso: a linha Llama, que sustenta boa parte do que o setor público brasileiro chama de IA open source, parou de evoluir em 2025 com o Llama 4, e a nova linha chegou em duas licenças opostas, o Muse Glimmer 30B em Apache 2.0 e o Muse Spark Open sob a Muse Model License, com atribuição obrigatória, política de uso aceitável e gatilho de US$ 20 milhões de receita agregada em 12 meses para quem revende inferência, cerca de R$ 109 milhões ao câmbio atual. Este artigo destrincha o que mudou, por que a licença é requisito de contratação e não detalhe jurídico (Lei 14.129/2021, IN SGD/ME 94/2022), o que os editais brasileiros de 2026 estão pedindo de verdade, de licenças nominais de ChatGPT em dispensa a registro de preços de IA generativa corporativa, e entrega o checklist de sete itens que separa o termo de referência que ancora o objeto em marca do que exige licença nomeada, continuidade garantida e direito de usar as saídas do modelo. Com os casos reais do PNCP, o quadro do Marco Legal em outubro de 2026 e a régua de decisão para o comprador público."
date: "2026-11-05"
author: "Luiz Felipe Barbedo"
authorRole: "BD e Co-fundador na BaXiJen"
tags: ["licitações", "setor público", "IA", "Muse Spark Open", "Meta", "Llama", "licenças de software", "open source", "Apache 2.0", "Lei 14.129", "IN SGD/ME 94", "Lei 14.133", "PBIA", "B2G", "compras públicas", "soberania", "BaXiJen"]
featured: true
image: "/blog/licitacoes-ia-pos-muse-cover.svg"
imageAlt: "Infográfico sobre o que a troca da linha Llama pela linha Muse da Meta muda nas licitações de IA do setor público brasileiro. À esquerda, a linha do tempo: Llama 4 de 2025 com licença comunitária e trava de 700 milhões de usuários, Muse Glimmer 30B de agosto de 2026 em Apache 2.0 e Muse Spark Open de 15 de outubro de 2026 com 816 bilhões de parâmetros sob licença customizada. Ao centro, as quatro cláusulas da Muse Model License: aviso Built with Muse obrigatório, gatilho de US$ 20 milhões de receita agregada em 12 meses para revenda de inferência, política de uso aceitável e extensão das restrições a saídas e derivados. À direita, o recorte do edital público brasileiro: preferência legal por tecnologias abertas e livres da Lei 14.129, checklist do termo de referência e a régua de decisão entre licença que o jurídico aprova em uma leitura e licença que exige parecer. Rodapé com a frase: quem escreve open source no edital sem nomear a licença compra risco sem preço. Paleta azul-ciano da BaXiJen sobre fundo escuro."
---

# Licitações de IA Depois do Muse: O Que a Troca de Geração Aberta da Meta Muda no Edital Público

Em fevereiro de 2026, o Instituto Federal de São Paulo, campus São José dos Campos, formalizou a contratação de **uma licença do ChatGPT por 24 meses** para apoiar a própria Coordenadoria de Licitações e Contratos, ao valor estimado de **R$ 3.577,76** (IFSP, 2026). Em outubro do mesmo ano, a Prefeitura de Pancas, no Espírito Santo, homologou **sete licenças nominais do ChatGPT Business** a R$ 1.897,90 cada, para uso nas secretarias estratégicas do município (GuiaLicite, 2026). Enquanto isso, o Plano Brasileiro de Inteligência Artificial destina **R$ 23,03 bilhões** ao quadrênio 2024-2028 e o governo federal prepara a compra de um **supercomputador de IA de cerca de R$ 1 bilhão por edital competitivo** (MCTI, 2026; Planalto, 2026).

A compra pública de IA no Brasil virou rotina administrativa: pregão, dispensa, registro de preços. E é exatamente por isso que um evento de 15 de outubro de 2026 merece a atenção de quem escreve termo de referência: nessa data, a Meta publicou os pesos do **Muse Spark Open**, modelo de **816 bilhões de parâmetros totais e 42 bilhões ativos por token**, descrito pela própria empresa como o modelo de pesos abertos mais capaz já lançado nos Estados Unidos (Meta AI Research, 2026). Com ele, a Meta **aposentou de fato a marca Llama** no mercado de pesos abertos: a última geração que carrega o nome é o Llama 4, de 2025, e a nova linha chegou sob licenças que o edital brasileiro não está preparado para distinguir.

A tese deste artigo é direta: **a expressão "IA open source", usada em edital sem nomear a licença, acabou de mudar de significado sem alterar uma vírgula**. Quem contrata solução de IA para o poder público precisa parar de comprar rótulo e passar a comprar licença, e a virada da Meta é o caso de uso perfeito para entender por quê.

## O que aconteceu com a marca aberta da Meta

A linha Llama foi, por três anos, a referência default do que o mercado chama de IA aberta. Llama 2 (2023), Llama 3 (2024) e Llama 4 (2025) sustentaram uma indústria inteira de fine-tunes, servidores de inferência e produtos locais. Mas a Llama Community License nunca foi código aberto de verdade: carregava **trava de 700 milhões de usuários mensais**, regra de nomenclatura que obrigava derivados a carregar "Llama" à frente do nome, exigência de exibir "Built with Llama" no produto e a política de uso aceitável da Meta (Business Model Analyst, 2026). O efeito prático foi documentado pelo próprio ecossistema: times corporativos com jurídico atento migravam para Qwen e DeepSeek, licenciados em Apache 2.0 e MIT sem condições (SourceFeed, 2026).

A resposta da Meta veio em duas ondas, sob uma marca nova. Em **agosto de 2026**, a empresa lançou o **Muse Glimmer 30B**, modelo denso multimodal de 30 bilhões de parâmetros pensado para rodar agentes localmente, publicado na conta `meta-models` (não mais na `meta-llama`) e sob **Apache 2.0**, licença aprovada pela Open Source Initiative, sem trava de usuários, sem regra de nomenclatura, sem política de uso imposta (OnDeviceLLM, 2026; Business Model Analyst, 2026). Foi o primeiro modelo da Meta em anos que um departamento jurídico aprova em uma leitura.

Em **15 de outubro de 2026**, a segunda onda: o **Muse Spark Open**, MoE multimodal de **816 bilhões de parâmetros totais, 42 bilhões ativos por token, 256 especialistas por camada com 8 selecionados por token e janela de contexto de 1 milhão de tokens**, treinado para código e agentes, com pesos em BF16 e NVFP4 e suporte de day 0 em vLLM, SGLang, TensorRT-LLM e llama.cpp (Meta AI Research, 2026; Hugging Face, 2026; vLLM Project, 2026). O modelo de onde o Muse Glimmer foi destilado, o mais capaz já aberto por uma empresa americana (vLLM Project, 2026). Nathan Lambert, do boletim Interconnects, resume o peso do lançamento: o modelo encolhe pela metade o abismo entre os melhores pesos abertos americanos e chineses (Interconnects, 2026).

Só que o Muse Spark Open **não veio em Apache 2.0**. Veio sob a **Muse Model License**, customizada, e é aí que o edital público entra na história.

| Modelo | Data | Licença | Condições relevantes |
|---|---|---|---|
| Llama 4 Scout e Maverick | Abril de 2025 | Llama 4 Community License | Trava de 700 milhões de MAU, "Built with Llama", política de uso, regra de nomenclatura |
| Muse Glimmer 30B | Agosto de 2026 | Apache 2.0 | Nenhuma: sem trava de usuários, sem branding, sem política imposta |
| Muse Spark Open 816B | 15 de outubro de 2026 | Muse Model License | Branding obrigatório, gatilho de receita, política de uso, restrições estendem a saídas e derivados |

Fonte: elaboração própria a partir das referências. MAU: usuários ativos mensais.

## A licença em quatro cláusulas que o jurídico precisa ler antes do TI

A Muse Model License concentra, segundo a leitura de Lambert, "praticamente todo comportamento restritivo de licença que já vimos e criticamos nos últimos anos" (Interconnects, 2026). Quatro cláusulas importam para quem compra em nome de um ente público.

**Cláusula 1, atribuição obrigatória.** Produto construído sobre o modelo precisa exibir "Built with Muse" de forma visível (Interconnects, 2026). Num serviço público, onde a identidade visual do órgão é regulada e a cartilha de marca do governo é norma, exibir branding de fornecedor privado estrangeiro na tela de atendimento ao cidadão não é detalhe: é questão de identidade institucional e, potencialmente, de publicidade irregular.

**Cláusula 2, o gatilho de receita.** A seção 3 da licença exige acordo escrito separado com a Meta quando o licenciado, ou qualquer afiliada, oferece o modelo a terceiros como serviço, via API ou interface similar, e a **receita bruta agregada do grupo excede US$ 20 milhões em qualquer período de 12 meses consecutivos** (ImportStatic, 2026; Plain AI, 2026). Ao câmbio de R$ 5,45, fechamento de 4 de novembro de 2026 (InfoMoney, 2026), são cerca de **R$ 109 milhões**. Há exclusões expressas: uso interno, pesquisa e o uso do modelo como componente de produto próprio não licenciado como Modelo como Serviço (ImportStatic, 2026). Um órgão público usando o modelo internamente não cruza o gatilho. O problema é o **fornecedor brasileiro que revende inferência**: a ele a cláusula se aplica na íntegra, e "afiliadas" sequer é definida na licença (ImportStatic, 2026).

**Cláusula 3, política de uso aceitável.** Usar o modelo implica aceitar restrições de uso da Meta. Para o mundo do código aberto tradicional, isso já retira o modelo da categoria (Interconnects, 2026). Para o setor público, a questão é outra: **um contrato de um ente brasileiro pode vincular o objeto a política unilateral editada por empresa estrangeira, alterável sem consulta, sem versão em português e sem controle da administração?** É pergunta para a assessoria jurídica, e ela precisa ser feita antes da homologação, não depois.

**Cláusula 4, extensão a saídas e derivados.** As restrições alcançam o que o modelo gera e modelos treinados a partir dele, criando ambiguidade jurídica sobre o uso das saídas como dado sintético (Interconnects, 2026). Tradução para o comprador público: se a solução contratada gera resumos, pareceres auxiliares ou bases estruturadas a partir de documentos do órgão, **sobre o que exatamente o órgão detém direitos de uso irrestrito?** O licenciamento da saída de um sistema que o Estado pagou para produzir não pode ficar em zona cinzenta.

Lambert arremata o diagnóstico sobre a licença e, no mesmo movimento, sobre o comportamento do mercado: licenças até hoje não foram o fator determinante da adoção de IA, e muitos vão simplesmente ignorar esta, com a Meta perseguindo apenas violações flagrantes (Interconnects, 2026). Para uma startup de aplicativo, ignorar pode ser aposta racional. Para um **agente de compra pública**, cujo contrato vai a auditoria, a aposta racional é outra: ler antes.

## Por que a licença é requisito de contratação, e não detalhe

O ordenamento brasileiro já dá ao comprador público a base para exigir clareza. Não é preciso lei nova.

A **Lei 14.129/2021**, que estrutura o Governo Digital, fixa como princípio a **"adoção preferencial, no uso da internet e de suas aplicações, de tecnologias, de padrões e de formatos abertos e livres"** (Brasil, 2021, art. 3º, inciso XXV), e define formato aberto como aquele "cuja especificação esteja documentada publicamente e seja de livre conhecimento e implementação, livre de patentes ou de qualquer outra restrição legal quanto à sua utilização" (Brasil, 2021, art. 4º, inciso VI). Uma licença com branding obrigatório e política de uso imposta convive mal com essa definição.

A **IN SGD/ME 94/2022**, que disciplina as contratações de TIC no Executivo Federal, transforma princípio em procedimento. O **Estudo Técnico Preliminar** exige análise comparativa de soluções que considere "a existência de softwares disponíveis" nos termos da política de software público (IN SGD/ME 94/2022, art. 11, inciso II, alínea c) e **análise de custos totais de propriedade**, o TCO, cobrindo o ciclo de vida dos bens e serviços (art. 11, inciso III, alínea a). Um ETP que escreve "a solução deve ser open source" e não nomeia a licença não cumpre nem a alínea c, porque não permite comparar soluções de fato, nem a memória de cálculo exigida do preço.

Há ainda a **Lei 14.063/2021**, art. 16: sistemas desenvolvidos exclusivamente pela administração pública são regidos por licença de código aberto, com uso, cópia, alteração e distribuição sem restrições por todos os órgãos (Governo Digital, 2026). O Estado brasileiro já entende que o que o dinheiro público produz deve circular livre entre entes. A mesma lógica aplicada à compra: o que o dinheiro público licencia deve circular sem surpresa.

E o marco setorial? Em outubro de 2026, **o Brasil ainda não tem lei específica de IA**. O PL 2338/2023, aprovado no Senado em dezembro de 2024, aguarda parecer do relator na comissão especial da Câmara; o PL 2688/2025, aprovado na Comissão de Comunicação em março de 2026, teve o objeto restringido pelo substitutivo ao combate à exploração sexual digital e segue na Comissão de Ciência, Tecnologia e Inovação (Instituto Brasileiro de IA, 2026; Câmara dos Deputados, 2026). Quem espera a lei para decidir como licitar IA vai decidir tarde: as compras já estão acontecendo, e a régua aplicável hoje é a que existe, LGPD, Lei 14.129, IN 94 e Lei 14.133.

## O que os editais brasileiros de 2026 estão pedindo de verdade

Os documentos públicos disponíveis no PNCP mostram um mercado em estágio anterior à pergunta da licença. O padrão dominante é a **compra por licença nominal de produto fechado**: o IFSP contratou "a solução de inteligência artificial ChatGPT" por subscrição, com requisitos que descrevem capacidade genérica de geração e revisão de texto (IFSP, 2026); Pancas homologou "ChatGPT Business, licença nominal corporativa" (GuiaLicite, 2026). O Sesc DF abriu pregão de registro de preços para "solução anual de inteligência artificial generativa corporativa" (Sesc DF, 2026). E a SEDUC de Rondônia publicou pregão para plataforma com "recursos de inteligência artificial pedagógica" para rastreio precoce de sinais de TEA, com **11.454 licenças SaaS** como item central (Compras.gov.br, 2026).

| Edital de 2026 | Objeto | Como o modelo aparece |
|---|---|---|
| IFSP São José dos Campos, ETP 21/2026 | Apoio à Coordenadoria de Licitações | "Contratação da solução ChatGPT", 1 licença, 24 meses, R$ 3.577,76 |
| Prefeitura de Pancas (ES), dispensa 15/2026 | Uso institucional em secretarias | 7 licenças ChatGPT Business, R$ 1.897,90 por licença |
| SEDUC Rondônia, PE 90005/2026 | Rastreio de sinais de TEA na rede estadual | "Plataforma digital inteligente com recursos de IA", 11.454 licenças SaaS |
| Sesc DF, PE 38/2026 | IA generativa corporativa | "Solução anual de IA generativa corporativa", registro de preços |

Fonte: elaboração própria a partir dos documentos citados. Transcrição resumida do objeto.

Nada disso é ilegal. Mas o padrão revela que **o modelo de IA está sendo comprado como marca, não como componente licenciado**, e isso muda o preço e o risco de tudo. Quando o objeto é "ChatGPT", a disputa é inexigível, porque só um fornecedor atende, ou vira disputa de revenda, em que todos oferecem o mesmo produto com margens diferentes. Quando o objeto descreve **capacidade** ("compreensão e geração de texto em português, análise de documentos, disponibilidade de pesos abertos para execução em infraestrutura própria ou contratada, sob licença permissiva nomeada"), a disputa abre para quem serve GLM, Qwen, Gemma, Mistral, Muse Glimmer ou o que melhor atender, e o preço cai porque a competição existe.

Aqui mora a ironia do momento: a Meta **retornou aos pesos abertos justamente porque perdeu o status de default para alternativas de licença limpa** (SourceFeed, 2026), e o comprador público brasileiro segue especificando marca fechada em dispensa de licitação. O mercado internacional já aprendeu que licença é critério de seleção. O edital brasileiro ainda trata como detalhe.

## Os três riscos novos sobre a mesa do comprador público

**Risco 1, a continuidade do fornecedor.** A cláusula do gatilho de US$ 20 milhões atinge o fornecedor brasileiro que opera plataforma de IA como serviço. Um fornecedor de plataforma que cruza o teto precisa de acordo escrito com a Meta para seguir servindo o modelo, e a licença não define "afiliadas", o que empurra a interpretação para o terreno do caso concreto (ImportStatic, 2026). O órgão que contrata solução baseada nesse modelo, sem cláusula de continuidade e sem exigência de licença permissiva do motor, herdou um risco de interrupção que não aparece no edital. A Lei 14.133 e a IN 94 exigem análise de riscos na contratação (IN SGD/ME 94/2022, art. 8º, § 1º): esse risco é documentável e precisa ser previsto.

**Risco 2, a governança do conteúdo público.** As cláusulas de política de uso e de extensão a saídas criam zona cinzenta sobre o que o órgão pode fazer com o que o sistema gerou: reutilizar, estruturar, treinar classificador interno, disponibilizar ao cidadão. Em serviços públicos que tratam dado pessoal de cidadania, sob LGPD e art. 20, o comprador não pode terceirizar a interpretação desses limites para a política unilateral de um fornecedor estrangeiro (Instituto Brasileiro de IA, 2026).

**Risco 3, o rótulo que parou de significar algo.** Entre agosto e outubro de 2026, "modelo aberto da Meta" passou a designar duas realidades opostas: uma licença OSI de uso irrestrito e uma licença customizada com branding e gatilho comercial. Todo termo de referência escrito antes dessa janela que contenha "open source" como requisito, sem nomear licença, **adquiriu ambiguidade sem nenhuma alteração formal**. O mesmo vale para "Llama" como requisito técnico: a marca não recebeu nova geração e segue na licença antiga, com trava de 700 milhões de usuários (OnDeviceLLM, 2026). Especificar "Llama" hoje é especificar tecnologia congelada em 2025.

## O checklist: o que escrever no termo de referência a partir de agora

Transformando o diagnóstico em instrumento de trabalho, sete itens para o próximo ETP e TR de IA:

1. **Nomeie a licença, não o rótulo.** Exija "licença Apache 2.0, MIT ou equivalente aprovada pela Open Source Initiative" quando o valor da abertura for requisito. "Open source" sem licença nomeada é cláusula não verificável.
2. **Separe pesos abertos de código aberto.** Pesos abertos permitem auto-hospedar e auditar; não dão direito de reler e alterar o código de treinamento. Descreva qual dos dois o objeto precisa.
3. **Exija continuidade demonstrável.** O fornecedor declara o motor usado, a licença dele e o plano de substituição sem dependência de acordo com terceiro estrangeiro.
4. **Trate política de uso como cláusula contratual.** Se a política de uso do fabricante alcança o objeto, ela vai ao contrato, em português, com versão datada. Política de terceiro fora do contrato não obriga a administração, e não protege nada.
5. **Garanta os direitos sobre as saídas.** Cláusula expressa: o órgão detém uso, armazenamento, reutilização e combinação irrestritos do que o sistema gerar no âmbito do contrato.
6. **Proíba branding estrangeiro na interface pública.** Identidade visual do serviço ao cidadão é do órgão. Atribuição de componente, se houver, fica em créditos técnicos, não na tela do usuário.
7. **Descreva capacidade, não marca.** "Compreensão e geração em português, análise de documentos, execução em nuvem nacional ou infraestrutura própria, licença permissiva nomeada, métricas de avaliação aceitas". Assim o pregão compara preço de fato e a margem de preferência e o tratamento diferenciado a MPE (Lei 14.133) têm sobre o que disputar.

A régua de decisão que adotamos na BaXiJen é simples e vem da prática de comprar e vender para instituição pública: **quando o objeto é serviço público, a licença tem que ser a que um jurídico aprova em uma leitura**. Apache 2.0 passa. Licença customizada com branding, política de uso e gatilho de receita precisa de parecer, e parecer custa tempo do processo, que é o recurso mais caro de uma licitação.

## O recorte brasileiro: por que o edital é o novo campo de jogo da IA soberana

O Brasil decidiu investir na própria infraestrutura de IA: o PBIA prevê R$ 23,03 bilhões entre 2024 e 2028 (MCTI, 2026), com **R$ 103,25 milhões, ou 0,4% do total, destinados a regulação e governança** (Instituto Brasileiro de IA, 2026). O supercomputador nacional de IA, estimado em cerca de R$ 1 bilhão e capacidade de 7.200 petaflops, será adquirido **por edital competitivo** (Planalto, 2026). E a ANPD já demonstrou, ao suspender em 2024 o uso de dados de brasileiros para treinar IA da Meta, que a regulação brasileira alcança o fornecedor global no dado do cidadão (Instituto Brasileiro de IA, 2026).

Cada um desses instrumentos passa por contratação pública. O edital é onde a decisão de soberania se materializa em objeto, preço e critério de aceitação. Por isso a licença do modelo não pode ser o último item do anexo técnico: ela é a decisão de arquitetura da qual dependem continuidade, auditabilidade, preço de saída e o próprio direito de o Estado usar o que pagou para produzir. A Meta acabou de provar, num só trimestre, que marca de IA não é ativo durável: **Glimmer em Apache 2.0 e Spark Open em licença restritiva, da mesma casa, no mesmo ano**. Quem compra marca compra o passado da empresa. Quem compra licença nomeada compra os direitos.

A pergunta que fica para o gestor que abre o próximo processo de IA não é "qual modelo escolher". É: **"o meu edital especifica a licença pelo nome, ou eu estou comprando um rótulo que pode trocar de dono, de termos e de preço sem que ninguém altere uma vírgula do meu contrato?"**

---

**Por Luiz Felipe Barbedo, BD e Co-fundador na BaXiJen**

## Referências

- BRASIL. Lei nº 14.129, de 29 de março de 2021. Dispõe sobre princípios, regras e instrumentos para o Governo Digital. Brasília, DF: Planalto, 2021. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14129.htm
- BRASIL. Instrução Normativa SGD/ME nº 94, de 23 de dezembro de 2022. Dispõe sobre o processo de contratação de soluções de TIC pelos órgãos integrantes do SISP. Brasília, DF: Diário Oficial da União, 2022. Disponível em: https://www.in.gov.br/en/web/dou/-/instrucao-normativa-sgd/me-n-94-de-23-de-dezembro-de-2022-454510332
- CAMERA DOS DEPUTADOS. Ficha de tramitação do PL 2688/2025. Brasília, DF, 2026. Disponível em: https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2520003
- CAMARA DOS DEPUTADOS. Comissão aprova multa e suspensão de rede social que abrigar pornografia falsa gerada por IA. Agência Câmara, 23 mar. 2026. Disponível em: https://www.camara.leg.br/noticias/1256583
- COMPRAS.GOV.BR. Pregão Eletrônico nº 90005/2026, SEDUC Rondônia. Porto Velho, RO, 2026.
- GOVERNO DIGITAL. Software Público Brasileiro: legislação. Ministério da Gestão e da Inovação, 2026. Disponível em: https://www.gov.br/governodigital/pt-br/plataformas-e-servicos-digitais/software-publico
- GUIALICITE. Compra 000030/2026, Município de Pancas (ES): licenças ChatGPT Business. 2026. Disponível em: https://guialicite.com.br
- IFSP. Estudo Técnico Preliminar 21/2026: contratação de ferramenta de IA generativa, Campus São José dos Campos. 2026. Disponível em: https://pncp.gov.br
- INFOMONEY. Dólar hoje: abertura e fechamento, 4 de novembro de 2026. São Paulo, 2026. Disponível em: https://www.infomoney.com.br/mercados
- INSTITUTO BRASILEIRO DE IA. Panorama da Inteligência Artificial no Brasil 2026: regulação e políticas públicas, edição de outubro. São Paulo, 2026. Disponível em: https://institutobrasileiro.ia.br
- INTERCONNECTS (LAMBERT, N.). Meta shakes up the frontiers, open and closed. 17 out. 2026. Disponível em: https://www.interconnects.ai
- IMPORTSTATIC. Muse Spark Open licence: what you can ship commercially. 2026. Disponível em: https://importstatic.com/ai/muse-spark-open-license
- META AI RESEARCH. Introducing Muse Spark Open, the most capable US open-weight model to date. 15 out. 2026. Disponível em: https://research.meta.ai/blog/muse-spark-open
- HUGGING FACE. Welcome Muse Spark Open: open-weight frontier multimodal MoE model from Meta. 15 out. 2026. Disponível em: https://huggingface.co/blog/meta-muse-spark-open
- MCTI. Plano Brasileiro de Inteligência Artificial. Ministério da Ciência, Tecnologia e Inovação, 2026. Disponível em: https://www.gov.br/mcti
- ONDEVICELLM. Is there a Llama 5? Where Meta's Llama line stands in 2026. 2026. Disponível em: https://ondevicellm.app/models/llama-line-status
- PLANALTO. Brasil avança em infraestrutura própria para IA com supercomputação e nuvem brasileira. 20 ago. 2026. Disponível em: https://www.gov.br/planalto
- PLAIN AI. Meta and StepFun shipped open weights the same day. 2026. Disponível em: https://plainai.tech/articles/twenty-million-gate
- SESC DF. Pregão Eletrônico SRP nº 38/2026: solução anual de IA generativa corporativa. Brasília, 2026.
- SOURCEFEED. Muse Glimmer is Meta's apology for the Llama license. 2026. Disponível em: https://sourcefeed.dev
- VLLM PROJECT. Day 0 support for Muse Spark Open on vLLM. 15 out. 2026. Disponível em: https://vllm-project.github.io/2026/10/15/muse-spark-open.html
- BUSINESS MODEL ANALYST. Meta is back in open source. Read the license, not the manifesto. 2026. Disponível em: https://businessmodelanalyst.com
