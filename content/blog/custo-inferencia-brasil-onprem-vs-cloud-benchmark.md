---
title: "Custo de Inferência no Brasil: O Benchmark Que Faltava Entre o Aluguel de GPU em Dólar e o Servidor Local Em Fábrica"
description: "O preço da mesma inteligência caiu cerca de 13 vezes por ano desde 2023, mas só para quem paga em dólar e sem imposto brasileiro. Este artigo constrói, com números verificáveis, o benchmark que o comprador institucional brasileiro não tinha: o custo por milhão de tokens nas três rotas disponíveis no país. Na rota API, o token de entrada caiu de US$ 60 por milhão no GPT-3 para US$ 0,10 no GPT-6 Luna, e a Epoch AI mede queda de 47% por trimestre no preço de um dado nível de desempenho. Na rota cloud GPU, o H100 sai entre US$ 6,88 e US$ 12,29 por hora nas hyperscalers e entre US$ 3,50 e US$ 7,00 no Brasil, onde não existe B200 nem H200 para alugar. Na rota local, a llm-d 1.0 serviu GLM-5.2 de 744 bilhões de parâmetros por cerca de US$ 0,11 por milhão de tokens em produção na IBM Research, e o ex-tarifário da Gecex zera o imposto de importação de GPU quando o bem não tem similar nacional. O artigo monta o custo total de posse de um nó de inferência em reais, com tarifa de energia do Grupo A, depreciação de 5 anos, engenharia e ocupação, e compara com o aluguel em dólar ao câmbio de R$ 5,03. A conclusão é operacional: abaixo de cerca de 40% de ocupação o hardware local é um passivo, entre 40% e 70% a decisão depende do workload, e acima de 70% a rota local fica de 2 a 4 vezes mais barata por GPU-hora usada. Com as perguntas que o comprador precisa fazer antes de assinar qualquer contrato de IA no Brasil."
date: "2026-10-29"
author: "Leonardo Camilo"
authorRole: "CEO e Co-fundador na BaXiJen"
tags: ["custo de inferência", "LLM", "TCO", "on-prem", "cloud GPU", "GPU Brasil", "ex-tarifário", "Gecex", "H100", "llm-d", "Epoch AI", "FinOps", "custo por task", "IA local", "soberania", "IA brasileira", "BaXiJen"]
featured: true
image: "/blog/custo-inferencia-brasil-onprem-cloud-cover.svg"
imageAlt: "Infográfico sobre o custo de inferência de LLMs no Brasil. À esquerda, a curva de queda do preço do token: US$ 60 por milhão no GPT-3 em 2020 caindo em degraus até US$ 0,10 no GPT-6 Luna, em ciano. Ao centro, dois servidores comparados: o aluguel de GPU em dólar com câmbio, IOF e retenções na fonte versus o servidor local com ex-tarifário, depreciação e tarifa de energia em reais, com as faixas de decisão por ocupação. À direita, a régua de decisão em três faixas: abaixo de 40% de ocupação o hardware local é passivo, de 40% a 70% a decisão depende do workload, acima de 70% a rota local ganha por 2 a 4 vezes por GPU-hora usada. Rodapé com a frase: quem mede custo em dólar sem olhar o real assina contrato mais caro. Paleta azul-ciano da BaXiJen sobre fundo escuro."
---

# Custo de Inferência no Brasil: O Benchmark Que Faltava Entre o Aluguel de GPU em Dólar e o Servidor Local Em Fábrica

Em 2020, a OpenAI cobrava **US$ 60 por milhão de tokens de entrada** no GPT-3. Em outubro de 2026, o GPT-6 Luna sai por **US$ 0,10 por milhão na entrada e US$ 0,50 na saída** (SecondStack, 2026). No mesmo intervalo, o dólar comercial fechou a **R$ 5,03 na cotação de 21 de outubro de 2026** (Ipeadata, 2026), e a alíquota do imposto de importação de componentes de informática subiu para até 12,6%, com o detalhe que muda tudo para quem compra em escala institucional: o ex-tarifário da Gecex zera esse imposto quando o bem não tem produção nacional equivalente (Resolução Gecex 767/2025; NetCPA, 2026).

Essas três linhas descrevem o problema que este artigo resolve. O custo da inteligência por token despencou no mundo, mas o preço que a instituição brasileira paga tem três camadas que o benchmark americano não mostra: **câmbio, tributação e a ausência de oferta local de GPU de última geração**. Quem copia a planilha de TCO de um paper americano e troca o cifrão pelo real assina contrato sem saber o que está comprando.

A tese é direta: **a decisão entre aluguel de GPU e servidor local deixou de ser ideológica e virou matemática de taxa de ocupação**, e a matemática muda de resultado quando os insumos são brasileiros.

## A queda do preço do token que o marketing cita e o detalhe que ele omite

O dado mais citado do ano veio da Epoch AI: o preço para atingir um dado nível de desempenho cai **cerca de 47% por trimestre desde 2023, ou 13 vezes por ano**. No caso emblemático, o o3 resolvia GPQA Diamond por cerca de US$ 0,30 por questão no início de 2025; o GPT-5.6 Luna entrega o mesmo nível por **US$ 0,0004, uma queda de 725 vezes em menos de 18 meses** (Epoch AI, 2026).

A economia formal confirma e refina o quadro. O estudo que montou a primeira análise sistemática de preços de inferência, com dados do OpenRouter e da própria Epoch, documenta **queda de aproximadamente 600 vezes no preço do token entre 2020 e 2026** e identifica maio de 2024 como o ponto de inflexão estatístico: depois da guerra de preços do DeepSeek e do lançamento do GPT-4o-mini, a queda deixa de ser puxada por tecnologia e passa a ser puxada por competição (Tiered Super-Moore, 2026). O trabalho mais completo até agora, de Gundlach et al., mede **5 a 10 vezes de queda por ano** no preço de um nível de desempenho de fronteira e isola a causa: o progresso algorítmico contribui cerca de 3 vezes por ano, enquanto o custo de rodar o modelo de fronteira sobe entre 3 e 18 vezes por ano, porque os modelos ficam maiores e raciocinam mais (Gundlach et al., 2025).

| Métrica | Valor | Fonte |
|---|---|---|
| Preço de entrada do GPT-3 (2020) | US$ 60 por milhão de tokens | Tiered Super-Moore, 2026 |
| Preço de entrada do GPT-6 Luna (2026) | US$ 0,10 por milhão de tokens | SecondStack, 2026 |
| Queda do preço por nível de desempenho | 47% por trimestre (13x por ano) | Epoch AI, 2026 |
| Queda documentada 2020-2026 | Aproximadamente 600x | Tiered Super-Moore, 2026 |
| Contribuição algorítmica isolada | Cerca de 3x por ano | Gundlach et al., 2025 |
| Custo de rodar fronteira | Sobe 3x a 18x por ano | Gundlach et al., 2025 |

Fonte: elaboração própria a partir das referências.

O detalhe que o marketing omite está na última linha da tabela. A queda de preço do token acontece no **segmento econômico**: a meia-vida do preço é de 1,1 ano no tier econômico e 1,55 no intermediário, mas os modelos de fronteira resistem à decaída exponencial porque cobram um **prêmio de raciocínio médio de 31,5 vezes** o preço de um modelo não raciocinador (Tiered Super-Moore, 2026). Traduzindo para a mesa do comprador: a inteligência barata despenca de preço todo trimestre, mas o acesso ao estado da arte continua caro e subindo, porque cada resposta de raciocínio queima muito mais token do que uma resposta direta.

Para o comprador brasileiro há um filtro adicional: essa curva de preço é desenhada em dólar. A mesma fatura em real carrega câmbio e, no regime de contratos formais com remessa ao exterior, um IRRF de 15% sobre o valor (IFET Brasil, 2026). O benchmark local precisa começar por aí.

## As três rotas de inferência disponíveis no Brasil hoje

### Rota 1: API de modelo em dólar

É a rota de menor atrito e maior exposição. O comprador paga por token, em dólar, e o custo unitário segue a curva de queda da seção anterior. O problema é o envelope total: a Tokenomics Foundation mediu que **96% das empresas usam modelos de fronteira e três em cada quatro não conseguem conectar o gasto de IA a um resultado que o CFO aceite** (Tokenomics Foundation, 2026). A fatura de API acompanha o uso, e uso de agente cresce de forma que nenhuma planilha anual prevê.

### Rota 2: GPU alocada em cloud, dentro ou fora do Brasil

A oferta local é estreita. O H100 é alugável em São Paulo na AWS, mas não existe B200 nem H200 para alugar em região brasileira em nenhuma hyperscaler (Spheron, 2026). O mercado latino-americano como um todo opera **de 8.000 a 12.000 GPUs equivalentes a H100**, dos quais cerca de 5.000 a 7.000 em São Paulo, com preço reservado de H100 entre US$ 3,50 e US$ 5,00 por hora, cerca de 20 a 30% acima do preço americano (ClusterBid, 2026).

| Rota de aluguel | Preço por GPU-hora | Observação |
|---|---|---|
| AWS us-east-1, p5.48xlarge on-demand | US$ 6,88 | 8x H100, preço de lista (Tanod, 2026) |
| Azure eastus, ND H100 v5 on-demand | US$ 12,29 | 8x H100 (Economize, 2026) |
| Google us-central1, a3-highgpu-8g | US$ 11,06 | 8x H100 (Economize, 2026) |
| Neoclouds (Lambda, RunPod, Nebius) | US$ 2,40 a US$ 3,99 | Sem região no Brasil (Economize, 2026) |
| AWS sa-east-1 (São Paulo) | US$ 5,50 a US$ 7,00 | Único H100 hyperscaler em solo brasileiro (ClusterBid, 2026) |
| Azure Brazil South | US$ 4,50 a US$ 6,00 | Reservado, sujeito a cota (ClusterBid, 2026) |
| Data centers locais (Ascenty, ODATA, Scala) | US$ 3,50 a US$ 5,00 | Reservado, com commitment de 3 a 12 meses (ClusterBid, 2026) |

Fonte: elaboração própria a partir das referências. Preços de lista on-demand, sem desconto por compromisso.

O leitor atento nota que o aluguel de GPU no Brasil carrega um **prêmio regional de 20 a 30%** sobre o mesmo silício alugado nos EUA. A razão é o custo Brasil embutido: hardware que entra com imposto mais alto, energia mais cara e um mercado de escala menor. O aluguel local é a síntese do custo Brasil empacada em preço de hora.

### Rota 3: servidor em fábrica, com ex-tarifário

A rota local é a que a BaXiJen opera e a que tem a economia mais contraintuitiva. O ponto central é o ex-tarifário: a Resolução Gecex 767, de 25 de julho de 2025, incluiu na lista de exceção a NCM 8471.50.90 com o Ex 025, que descreve unidades de processamento com memória de GPU de no mínimo 6 GB, GDDR6 ou superior, PCIe 4.0 ou NVLink, **sem saída de vídeo**, concebidas para uso em máquinas automáticas de processamento de dados (Resolução Gecex 767/2025). Para o bem enquadrado, o imposto de importação cai para **zero**, desde que não exista produção nacional equivalente.

O contraponto é a Resolução Gecex 852, de 2026, que elevou a alíquota de importação de componentes de hardware para até 12,6% no varejo de informática (NetCPA, 2026). No varejo nacional, a RTX 5090 sai entre **R$ 33.990 e R$ 49.999 nas prateleiras** (KaBuM!, 2026). As duas resoluções dividem o mercado: o **consumidor final paga mais caro, a instituição que importa o bem de capital correto com enquadramento de ex-tarifário paga menos imposto que antes**. A fronteira entre os dois mundos é a classificação fiscal do bem, e é por isso que a especificação de compra de um nó de inferência começa na NCM, não no datasheet.

## O que o servidor local entrega que a fatura de token não mostra

O benchmark que muda a cabeça do comprador veio da IBM Research com a versão 1.0 da llm-d, o framework de inferência distribuída de código aberto. Servindo o **GLM-5.2, um modelo de 744 bilhões de parâmetros com 39 bilhões ativos**, em frota comum de GPUs NVIDIA, a IBM mediu **custo blendado de cerca de US$ 0,11 por milhão de tokens, cerca de 11,5 vezes mais barato que a pilha proprietária equivalente**, com pico acima de 6,6 milhões de tokens de saída por minuto servindo 3.000 agentes de código sem preempção (llm-d, 2026).

O mecanismo é engenharia, não mágica: o roteador da llm-d lê o estado do cache KV de cada réplica e envia cada requisição para a réplica que já tem o prefixo em memória de GPU, com taxa de acerto de **98%**, substituindo o prefill, a fase mais cara da inferência, por leitura de cache (llm-d, 2026). Para workload agêntico, em que múltiplos agentes compartilham o mesmo prompt de sistema e histórico longo, o ganho é de uma ordem de grandeza no custo por token.

Esse número de produção é o que separa o discurso do benchmark real. A inferência local bem operada não compete no preço de lista da API de fronteira, que inclui o prêmio de raciocínio: ela compete no **custo por task concluída de um workload institucional real**, onde o prompt é longo, o cache bate e a ocupação é alta.

## A conta em reais: custo total de posse de um nó de inferência

Toda a literatura global de TCO converge nos mesmos componentes: capex do servidor, energia, ocupação, custo de capital e engenharia (SemiAnalysis, 2026). O que falta é a versão brasileira da conta. Os parâmetros abaixo usam tarifas e câmbio verificáveis desta semana; capex e custos de operação são estimativas de faixa para dimensionamento, não cotações, e o leitor deve substituir pelos seus números reais.

**Parâmetros do nó (estimativa de referência):** servidor com 8 GPUs de classe H100, consumo total de 10 kW, capex de referência de US$ 250 mil pelo nó completo desembaraçado com ex-tarifário aprovado.

O parâmetro de energia é o que mais surpreende o comprador que nunca fechou contrato de alta tensão. A tarifa residencial média nacional em 2026 está em **R$ 998 por MWh antes de tributos** (Canal Solar, 2026), mas o consumidor de alta tensão do Grupo A paga bem menos: a tarifa de aplicação homologada para o subgrupo A2 da Equatorial CEEE, por exemplo, soma **R$ 414 por MWh fora de ponta e R$ 601 por MWh na ponta** (ANEEL, 2025). A regra prática para o dimensionamento: **R$ 0,50 por kWh é um número defensável para o custo de energia de um consumidor atendido em alta tensão**; usar tarifa residencial na conta de TCO de um nó de inferência é erro de categoria, e infla a energia em mais de 100%.

| Componente de custo anual | Valor (US$) | Base de cálculo |
|---|---|---|
| Depreciação do nó (5 anos, ex-tarifário) | 50.000 | Capex de US$ 250 mil por 5 anos |
| Energia (10 kW, 24x7) | 8.708 | 87.600 kWh por ano a R$ 0,50/kWh, câmbio R$ 5,03 |
| Engenharia de operação (24x7) | 40.000 | Fração de time dedicado, estimativa |
| Ocupação, rede e resfriamento | 12.000 | Colocação própria ou colo, estimativa |
| Custo de capital (8% a.a. sobre o capex) | 20.000 | 8% de US$ 250 mil |
| **Custo total anual do nó** | **130.708** | Soma dos componentes |

Fonte: elaboração própria a partir das referências.

O nó custa, com todos os componentes, **US$ 130.708 por ano, ou US$ 10.892 por mês**. Como o nó tem 8 GPUs ligadas 24x7, o custo de calendário é de **US$ 1,87 por GPU-hora**, e o custo por hora **usada** depende da taxa de ocupação: a 40% de ocupação, US$ 4,66; a 70%, US$ 2,66.

Aqui está o ponto que vira a decisão. O aluguel de H100 no Brasil custa **US$ 3,50 a US$ 7,00 por hora** e o mesmo hardware nos EUA, **US$ 6,88 a US$ 12,29 on-demand ou US$ 2,40 a US$ 3,99 nas neoclouds**. Ou seja: **acima de cerca de 40% de ocupação, o nó próprio em fábrica já custa por hora usada menos que qualquer aluguel brasileiro e menos que o on-demand americano**. Abaixo disso, a depreciação domina o custo e o capex vira passivo parado em rack.

| Ocupação do hardware | Custo por GPU-hora usada | Leitura |
|---|---|---|
| 40% | US$ 4,66 | Empata com o teto do aluguel local (US$ 5,00-7,00) |
| 55% | US$ 3,40 | Abaixo de todo aluguel local e do on-demand dos EUA |
| 70% | US$ 2,66 | Compete com o spot das neoclouds, sem interrupção |
| 100% | US$ 1,87 | Nenhuma rota de aluguel alcança |

Fonte: elaboração própria a partir do TCO da seção anterior.

E a comparação por hora de GPU é só metade da conta. A outra metade é o que cada hora produz. Usando o benchmark da llm-d como referência de produção (US$ 0,11 por milhão de tokens em hardware de classe similar, IBM Research), um nó rodando a 70% de ocupação produz da ordem de bilhões de tokens por mês. O custo por milhão de tokens na rota local, com todos os custos brasileiros embutidos, fica na casa de **centavos de dólar**, contra o dólar cheio da API de fronteira com prêmio de raciocínio.

## A régua de decisão: taxa de ocupação e custo por task, não preço de hora

Com as três rotas precificadas, a decisão vira uma régua que o comprador institucional pode auditar:

| Ocupação projetada | Decisão | Razão |
|---|---|---|
| Abaixo de 40% | Não compre. Alugue ou use API | A depreciação domina o custo e o capex vira passivo em rack |
| Entre 40% e 70% | Decida por workload e soberania | Onde entram LGPD, latência e os requisitos que não têm preço de hora |
| Acima de 70% | A rota local vence por 2 a 4 vezes | O custo fixo se dilui e o token produzido despenca de preço |

Fonte: elaboração própria a partir do TCO e das tarifas de aluguel coletadas neste artigo.

O detalhe que fecha a conta é o mesmo do FinOps: a unidade de gestão é a **task concluída**, não o token nem a hora de GPU. Um nó com 70% de ocupação que resolve o workflow real com cache de prefixo e roteamento de modelo entrega custo por task que nenhuma API de lista alcança, porque a API de fronteira embute o prêmio de raciocínio de 31,5 vezes na ponta (Tiered Super-Moore, 2026).

## As perguntas que o comprador brasileiro precisa fazer antes de assinar

1. **Qual é a taxa de ocupação projetada do hardware nos primeiros 12 meses?** Sem esse número, qualquer comparação de preço é retórica. Ele define sozinho a faixa da régua de decisão.
2. **O contrato especifica a NCM e o enquadramento de ex-tarifário do equipamento?** GPU de uso em processamento de dados sem saída de vídeo tem caminho para imposto zero; placa de varejo paga até 12,6%. A diferença é de dígitos no capex.
3. **O TCO usa tarifa de energia de alta tensão ou residencial?** Usar R$ 0,99 por kWh na conta de um data center infla a energia em mais de 100% e distorce a decisão para o aluguel.
4. **Qual é o custo por task do workload real, medido, incluindo câmbio e retenções?** A fatura de API em dólar não é o custo: falta IOF, IRRF de 15% no regime contratual e a variação cambial do período.
5. **Qual é a estratégia de depreciação?** GPU perde valor de mercado mais rápido do que deprecia contabilmente. O ciclo útil econômico de um nó de inferência em 2026 está mais perto de 4 a 5 anos que dos 10 anos clássicos de servidor.
6. **Existe requisito que não tem preço de hora: dados em solo, latência, auditabilidade?** Se sim, a comparação econômica pura é insuficiente por definição, e o valor da rota local tem componente soberano.

## O que isso significa para quem constrói IA no Brasil

O movimento de mercado dos últimos dois anos reorganizou a economia da inferência em três camadas: o token de fronteira ficou barato e volátil; o prêmio de raciocínio manteve a fronteira cara e ascendente; e a engenharia de serving local derrubou o custo do workload institucional em uma ordem de grandeza. O Brasil entra nessa equação com três particularidades: câmbio que amplifica qualquer preço em dólar, ex-tarifário que zera o imposto do bem de capital correto, e oferta de aluguel local estreita e com prêmio regional.

Para a BaXiJen, a conclusão operacional é a mesma que sustenta o produto: **IA local no Brasil não é tese ideológica, é TCO com NCM certa, tarifa A e cache de prefixo**. O cliente institucional que mede custo por task, dimensiona ocupação antes de capex e enquadra o hardware no ex-tarifário paga centavos por milhão de tokens de workload próprio, em reais, com o recibo dentro de casa. O que a queda de 600 vezes do preço do token não derrubou foi a estrutura de custo brasileira das rotas em dólar; o que a derrubou foi a rota que processa a inteligência dentro da fábrica.

---

*Por Leonardo Camilo, CEO e Co-fundador na BaXiJen. IA local, soberania de dados e o custo real da inteligência em território nacional.*

## Referências

ANEEL. (2025). *Resolução Homologatória nº 3.547, de 18 de novembro de 2025 (tarifas de aplicação do Grupo A, Equatorial CEEE)*. Recuperado de https://www2.aneel.gov.br/cedoc/reh20253547ti.pdf

Canal Solar. (2026). *ANEEL eleva para 9,4% projeção de alta das tarifas de energia em 2026; tarifa residencial B1 alcança R$ 998/MWh antes de tributos*. Recuperado de https://canalsolar.com.br/aneel-eleva-94-alta-tarifas-energia

ClusterBid. (2026). *Latin America GPU Market: Brazil, Chile, and Mexico Cloud Infrastructure*. Recuperado de https://clusterbid.com/blog/latin-america-gpu-market-brazil-chile-mexico-cloud-infrastructure

Economize. (2026). *Cloud GPU Pricing 2026: Compare Hourly Rates by Provider*. Recuperado de https://www.economize.cloud/resources/gpu/pricing/

Epoch AI. (2026). *The plunging price of thought*. Recuperado de https://epoch.ai/publications/the-plunging-price-of-thought

Gundlach, J. et al. (2025). *The Price of Progress: Price Performance and the Future of AI*. Recuperado de https://arxiv.org/abs/2511.23455

IFET Brasil. (2026). *Nota fiscal Claude: emite NF no Brasil? Impostos conforme a forma de pagamento (IOF, IRRF, CIDE, ISS)*. Recuperado de https://ifetbrasil.org/orientacoes-e-perguntas-frequentes/nota-fiscal-claude-anthropic-a-plataforma-emite-nota-fiscal-no-brasil-ou-apenas-invoice/

Ipeadata. (2026). *Taxa de câmbio dólar comercial, série diária (cotação de 21/10/2026: R$ 5,0270)*. Recuperado de https://www.ipeadata.gov.br/ExibeSerie.aspx?serid=38590

KaBuM!. (2026). *Busca por placas de vídeo RTX 5090 (preços de varejo nacionais)*. Recuperado de https://www.kabum.com.br/busca/rtx-5090

llm-d. (2026). *llm-d v1.0: State-of-the-art inference, ready for day 2*. Recuperado de https://llm-d.ai/blog/llm-d-v1.0-state-of-the-art-inference-ready-for-day-2

NetCPA. (2026). *Imposto de importação: veja o quanto o Governo elevou as taxas para CPU, RAM, placa de vídeo e placa-mãe (Resolução GECEX 852/2026)*. Recuperado de https://netcpa.com.br/colunas/imposto-de-importacao-veja-o-quanto-o-governo-elevou-as-taxas-para-cpu-ram-placa-de-video-e-placa-mae/27467

Receita Federal. (2025). *Lista de Exceção de Bens de Informática e Telecomunicações (LEBIT/BIT) e regime de Ex-tarifário*. Recuperado de https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/despacho-de-importacao/ex-tarifario-letec-e-lebit/lebit

SemiAnalysis. (2026). *AI Cloud TCO Model: GPU Rental Economics & Cost of Ownership*. Recuperado de https://semianalysis.com/ai-cloud-tco-model/

SecondStack. (2026). *LLM API Pricing Comparison 2026*. Recuperado de https://secondstack.ai/llm-pricing/

Spheron. (2026). *GPU Cloud Providers in Latin America 2026: H100, H200, B200 in Brazil and Mexico*. Recuperado de https://spheron.network/blog/gpu-cloud-brazil-mexico-latin-america-2026

Tanod. (2026). *H100 price per hour: cheapest cloud and Akash rates today*. Recuperado de https://tanod.dev/learn/h100-price-per-hour.html

Tiered Super-Moore. (2026). *Tiered Super-Moore's Law: Price Evolution, Production Frontiers, and Market Competition in Large Language Model Inference Services*. Recuperado de https://arxiv.org/pdf/2603.28576v1

Tokenomics Foundation. (2026). *State of Tokenomics, setembro de 2026*. Linux Foundation. Recuperado de https://www.tokenomics.foundation/