---
title: "Modelos open-source brasileiros: o cenário atual em 2026"
description: "O Brasil deixou de ser apenas consumidor de IA. Com a família Sabiá alcançando 94% do GPT-4o em português, o Tucano 2 treinando do zero com dados abertos e o PBIA injetando R$ 23 bilhões, o ecossistema de modelos open-source em português brasileiro vive um momento de inflexão. Este post mapeia quem são os protagonistas, o que funciona, o que falta e por que isso importa para qualquer empresa que processa dados no Brasil."
date: "2026-05-27"
author: "Leonardo Camilo"
authorRole: "CEO & Tech Lead, BaXiJen"
tags: ["modelos open-source", "IA brasileira", "Sabiá", "Maritaca", "Tucano", "LLM português", "soberania de dados", "PBIA", "LGPD", "SLM"]
featured: true
image: "/blog/modelos-open-source-br-cover.png"
imageAlt: "Mapa do Brasil estilizado com nós de IA conectados entre estados, representando o ecossistema de modelos open-source em português brasileiro: Sabiá, Tucano, Drummond, AMALIA e corpus Carolina"
---

# Modelos open-source brasileiros: o cenário atual em 2026

**Até 2024, dependíamos exclusivamente de modelos estrangeiros para processar português brasileiro.** Hoje, modelos nacionais como o Sabiá-4 alcançam 87% de acerto na 1ª fase da OAB, 88% no ENEM e 91% no CPNU, números que colocam a família Sabiá na faixa de 94% da performance do GPT-4o em tarefas de compreensão em português. Mais do que um marco técnico, é um passo decisivo para a soberania digital do país.

O ecossistema amadureceu rápido. Não estamos mais falando de promessas: estamos falando de modelos com technical reports publicados no arXiv, APIs em produção, benchmarks reproduzíveis e código aberto no Hugging Face. Este post mapeia os protagonistas, o estado da arte e os gargalos que ainda precisam ser superados.

## O mapa dos modelos brasileiros

### Sabiá (Maritaca AI): o mais maduro do país

A Maritaca AI, fundada pelo doutor em Ciência da Computação pela Unicamp Rodrigo Nogueira, é a referência mais consolidada. A família Sabiá evoluiu em quatro gerações:

| Modelo | Parâmetros | Contexto | Destaques |
|---|---|---|---|
| Sabiá-7B | 7B | 2K | Primeiro modelo, fine-tuning do LLaMA-1 sobre corpus em português |
| Sabiá-2 | variado | 4K | Salto qualitativo em compreensão jurídica e administrativa |
| Sabiá-3 / 3.1 | variado | 8K | 94% da performance do GPT-4o em português, API compatível com OpenAI |
| Sabiá-4 | variado | 128K | Treinamento em 4 estágios, foco em direito, agentes e contexto longo |

O **Sabiá-4**, lançado em março de 2026 com relatório técnico publicado no arXiv (Laitz et al., 2026), representa o estado da arte. Seu pipeline de treinamento tem quatro estágios: pre-training continuado em corpus jurídico e geral em português, extensão de contexto para 128K tokens, supervised fine-tuning com dados de chat, código, tarefas jurídicas e function calling, e alignment por preferências. Os resultados em benchmarks brasileiros são expressivos: 87% na 1ª fase da OAB, 7,5 na 2ª fase, 88% no ENEM e 91% no CPNU.

O **Sabiazinho-4**, versão compacta focada em custo e latência, também foi lançado em janeiro de 2026. Ele atinge performance competitiva em tarefas jurídicas e de compreensão com fração do custo de inferência, posicionando-se como opção para deploy on-premise e edge computing.

A MariTalk, interface chatbot da Maritaca, é o produto voltado ao usuário final e já é usada por empresas jurídicas e administrativas no Brasil.

### Tucano 2: transparência radical

Enquanto a Maritaca priorizou performance e produto, o projeto Tucano, liderado por Nicholas Kluge Corrêa na Universidade de Bonn, escolheu um caminho diferente: **abertura total**.

O Tucano 2, lançado em março de 2026 com blog post detalhado no Hugging Face, é uma família de modelos de 0,5B a 3,7B parâmetros construída do zero para português. A lista do que é aberto impressiona:

- **GigaVerbo-v2**: corpus de ~320 bilhões de tokens limpos com anotações educacionais e de toxicidade
- **GigaVerbo-v2 Synth**: 9,3 bilhões de tokens sintéticos para preencher lacunas
- **Classificadores** de qualidade educacional e toxicidade treinados e liberados
- **Dados de SFT** com 4 milhões de exemplos em 12 tipos de tarefa
- **Dados de preferência** com 28 mil pares para alinhamento
- **Pipeline de avaliação** completa com benchmarks adaptados para português

O Tucano 2 adotou duas estratégias complementares: treinamento do zero para o modelo menor (670M parâmetros) e continual pretraining a partir do Qwen3 para os modelos maiores, trocando o vocabulário de 151K tokens do Qwen3 por um tokenizer customizado de 49K tokens otimizado para português. Resultado: **1,51 sub-palavras por palavra** contra 2,1+ de tokenizers multilíngues, o que se traduz em aproximadamente **30% de economia de compute**.

O modelo Tucano2-qwen-3.7-Instruct alcançou o melhor score de Knowledge & Reasoning entre modelos de 3 a 4B parâmetros, superando Qwen3-4B e SmolLM3-3B. E tudo com ~20.856 kWh de energia total consumida no treinamento, número rastreado com CodeCarbon.

### Drummond: raciocínio em português

O **Drummond-1b1-Instruct**, projeto da Corre Social, se apresenta como "o primeiro LLM com raciocínio 100% aberto BR". Com 1,1 bilhão de parâmetros, é um modelo de reasoning que gera cadeias de pensamento (chain-of-thought) inteiramente em português, algo que modelos como o Qwen3 não fazem bem. É um experimento audacioso: demonstrar que raciocínio explícito em PT-BR é viável em modelo pequeno.

### AMALIA: português europeu entra no jogo

O **AMALIA**, apresentado no PROPOR 2026 (Simplício et al., 2026), é o primeiro LLM fully open-source para **português europeu**. Embora não seja focado em PT-BR, sua existência é relevante: cria um ecossistema lusófono mais amplo e demonstra que a comunidade acadêmica portuguesa também está investindo em soberania linguística. O AMALIA foi publicado como technical report no arXiv (arXiv:2603.26511) e seu código está disponível no GitHub.

### Corpus Carolina: a base de dados que alimenta tudo

Nenhum modelo brasileiro existiria sem dados de qualidade em português. O **Corpus Carolina**, desenvolvido na USP pelo grupo LaViHD e C4AI (Finger et al., 2023), é o corpus aberto mais importante para o PT-BR contemporâneo. Com versões regularmente atualizadas (a versão Ada 1.2 contém milhões de documentos tipologicamente anotados), o Carolina serve como base de pre-training e avaliação para modelos como Tucano, Sabiá e diversos outros.

## O contexto político: PBIA e os R$ 23 bilhões

O **Plano Brasileiro de Inteligência Artificial (PBIA)**, publicado em versão final em junho de 2025 pelo MCTI, prevê investimentos de até **R$ 23 bilhões até 2028** para desenvolver infraestrutura de IA no país. O plano inclui:

- Desenvolvimento de modelos avançados de linguagem em português com dados nacionais
- Criação de datacenters soberanos para processamento de dados governamentais
- Financiamento via Finep e BNDES para startups intensivas em IA
- Redução da dependência de big techs estrangeiras para processamento de dados públicos

Em setembro de 2025, o MCTI apresentou o primeiro balanço do PBIA, destacando avanços em capacidade de processamento e pesquisa. A Finep e o BNDES já lançaram editais para seleção de gestor do Fundo de IA. Esse contexto institucional é essencial: os modelos open-source brasileiros não cresceram no vácuo. Eles são produto de um ecossistema que combina pesquisa acadêmica (Unicamp, USP, UFRJ), startups ambiciosas (Maritaca) e política pública explícita de soberania.

## O que funciona, o que falta

### O que funciona

**Compreensão de português brasileiro.** Modelos como Sabiá-4 e Tucano 2 demonstram performance comparável ou superior a modelos globais em tarefas específicas de PT-BR, especialmente em domínio jurídico e administrativo. O Sabiá-4 alcança 91% no CPNU (Concurso Público Nacional Unificado) e 87% na OAB, números concretos que mostram que entender "jeitinho", burocracia e gírias importa.

**Custo-benefício para deploy local.** Modelos como Sabiazinho-4 e Tucano2-0.6 permitem deploy on-premise com hardware acessível. Para empresas que precisam processar dados sensíveis sem enviar para fora do país, isso não é luxo: é compliance com a LGPD.

**Transparência crescente.** O Tucano 2 estabeleceu um novo padrão de abertura: dados, código, avaliação e consumo energético são públicos. A Maritaca, embora menos aberta com os pesos do Sabiá-4 (ainda não disponíveis no Hugging Face para download), publica technical reports detalhados e benchmarks reproduzíveis.

**API em reais.** A Maritaca cobra em BRL, eliminando a volatilidade cambial que afeta quem usa APIs dolarizadas. Para empresas brasileiras, isso é previsibilidade financeira real.

### O que ainda falta

**Escala para reasoning avançado.** Nenhum modelo brasileiro alcança ainda a capacidade de raciocínio multi-passo dos modelos frontier como GPT-4o ou Claude 3.5 em tarefas complexas de programação, matemática ou ciência. O Drummond-1b1 é um passo promissor, mas com 1,1B parâmetros seu escopo é limitado.

**Pesos abertos para modelos grandes.** Sabiá-4 não liberou pesos para download. A API é acessível, mas para uso verdadeiramente on-premise sem dependência de servidor terceiro, as opções são limitadas ao Sabiá-7B (primeira geração, 2023) e aos modelos do Tucano.

**Benchmarks padronizados para PT-BR.** Embora o Maritaca tenha publicado a benchmark MARCA (MARitaca Checklist evaluation) e o Tucano traga sua suite de avaliação, ainda não existe um consenso comunitário forte equivalente ao MMLU para português brasileiro. A fragmentação de benchmarks dificulta comparações diretas.

**Ecosistema de fine-tuning.** A comunidade brasileira ainda carece de datasets de instrução abertos e de alta qualidade na escala necessária para fine-tuning robusto em domínios específicos como saúde, educação e finanças.

## Por que isso importa para sua empresa

Se sua empresa processa dados de cidadãos brasileiros, três números deveriam estar no seu radar:

1. **R$ 23 bilhões** do PBIA criando infraestrutura e incentivo fiscal para IA nacional
2. **94%** da performance do GPT-4o em PT-BR, alcançado por modelos brasileiros com custo menor
3. **LGPD**: processar dados pessoais fora do país exige bases legais específicas, e modelos locais simplificam compliance

O ecossistema de modelos open-source em português brasileiro não é mais um experimento acadêmico. É um ativo produtivo com benchmarks, APIs, documentação e comunidade. A questão não é se sua empresa vai usar um modelo em português, mas quando e como.

**Para equipes técnicas**, o caminho prático é: teste o Sabiá-4 via API para tarefas de compreensão e geração em PT-BR. Para deploy on-premise com controle total, avalie os modelos Tucano 2. Para raciocínio explícito em português, acompanhe o Drummond. E para dados de treinamento, comece pelo Corpus Carolina.

**Para gestores**, a mensagem é direta: o custo de processar português com modelos brasileiros caiu significativamente, a qualidade subiu, e o risco regulatório diminuiu. O ROI de migrar workloads de texto em PT-BR para modelos nacionais é mensurável e positivo.

## Referências

- Laitz, T. et al. (2026). Sabiá-4 Technical Report. arXiv:2603.10213.
- Kluge Corrêa, N. et al. (2026). Building Tucano 2: Open-Source Language Models That Actually Think in Portuguese. Hugging Face Blog.
- Kluge Corrêa, N. et al. (2024). Tucano: Advancing Neural Text Generation for Portuguese. arXiv:2411.07854.
- Simplício, A. et al. (2026). AMALIA Technical Report: A Fully Open Source Large Language Model for European Portuguese. arXiv:2603.26511.
- Finger, M. et al. (2023). Carolina: a General Corpus of Contemporary Brazilian Portuguese with Provenance, Typology and Versioning Information. arXiv:2303.16098.
- Almeida, T. S. et al. (2026). MARCA: A Checklist-Based Benchmark for Multilingual Web Search. arXiv:2604.14448.
- Brasil. MCTI (2025). Plano Brasileiro de Inteligência Artificial (PBIA): IA para o Bem de Todos.
- Cloudian (2026). Enterprise AI Infrastructure Survey.