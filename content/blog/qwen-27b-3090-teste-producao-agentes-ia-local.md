---
title: "Qwen3.8-27B numa RTX 3090: o teste de produção que revelou o verdadeiro gargalo dos agentes de IA local"
description: "Rodamos o Qwen3.8-27B quantizado numa RTX 3090 comum, em produção real no baxi.ia.br, com pesquisa na web, calculadora e análise de mercado. O agente acertou DCF, Fleuriet e precificação de produto de IA, mas falhava em 13% das respostas por um motivo não óbvio: o modelo fazia contas de cabeça, estourava o teto de raciocínio e era cortado antes de responder. Este post documenta os números do teste: 40 tokens/s, R$ 2 por milhão de tokens, causa-raiz, correções e o caminho para escalar."
date: "2026-11-05"
author: "Leonardo Camilo"
authorRole: "CEO & Tech Lead, BaXiJen"
tags: ["IA local", "Qwen", "LLM", "inferência", "RTX 3090", "agentes de IA", "reasoning", "quantização", "custo de inferência", "llama.cpp", "BaXiJen", "IABrasileira"]
featured: true
image: "/blog/qwen-27b-3090-producao-cover.svg"
imageAlt: "Teste de produção do Qwen3.8-27B numa RTX 3090: números de desempenho, custo e a causa-raiz das falhas de reasoning"
---

Todo mundo que fala de rodar LLM local cita os mesmos números de benchmark: tokens por segundo, consumo de VRAM, score em MMLU. Poucos publicam o que acontece quando o modelo sai do benchmark e entra em **produção**, com usuário real, ferramentas reais e perguntas que misturam finanças, pesquisa na web e cálculo. Este post é sobre isso: o que aprendemos colocando o **Qwen3.8-27B** (quantização Q4) pra trabalhar de verdade, numa **RTX 3090** comum, servindo respostas no baxi.ia.br.

## O setup

O modelo roda em Q4_K_M na 3090 de 24 GB, via llama.cpp. Nada de data center: é uma placa de consumo, do tipo que qualquer engenheiro tem em casa. A stack do agente inclui:

- **Pesquisa na web**: busca e leitura de páginas;
- **Calculadora genérica** (calc_contas): as contas saem do raciocínio do modelo e vão para código determinístico;
- **Roteiro de análise de mercado** e **contador de tokens em anexos**;
- **Corte de tempo**: até 1 hora por resposta.

O contexto comportava 128K com cache em q8_0, ou 64K com cache em FP16. Uma pergunta simples responde em 1 a 4 minutos. Uma análise pesada, com pesquisa, leva de 9 a 20 minutos.

## O teste: onde o agente foi bem de primeira

Testamos como um usuário exigente testaria: casos reais de análise financeira, sem facilitar. Saíram **bons de primeira**:

- **DCF com análise de sensibilidade** e checagem contra o boletim Focus do Banco Central;
- **Balanço com modelo Fleuriet** (a análise dinâmica de capital de giro que todo controller brasileiro respeita);
- **Precificação de produto de IA**, com estrutura de custo e margem;
- **Crédito consignado privado**, com regulamentação correta;
- **Pagamentos Brasil–Hong Kong via stablecoin**, com todos os fatos conferidos contra as fontes.

No teste ao vivo em produção, com a pergunta sobre o Copom e o rendimento no CDI, o agente **consultou o Banco Central, buscou na web e calculou via ferramenta**, em 7,6 minutos. A resposta principal saiu certa: Selic de 13,75% e R$ 13.650 em 12 meses.

## O problema: 13% das respostas morriam no meio

O resultado que motivou este post não foi um acerto: foi um padrão de falha. Em **13% das gerações**, a resposta saía cortada no meio, ou não saía. Os sintomas variavam:

- Contas de cabeça erradas: um cap table deu 35,62% em vez de 55,48%; uma tabela de margem com 21 APIs saiu errada;
- O modelo dizia que tinha usado a calculadora e não tinha usado;
- Resposta terminava sem o cálculo operacional que a pergunta pedia;
- Cortes por estourar o teto de tokens de raciocínio.

## A causa-raiz: o modelo pensava demais e calculava de cabeça

Investigando os logs, o diagnóstico ficou claro: o modelo fazia as contas **dentro do próprio raciocínio** (o chamado "thinking"), consumia todo o orçamento de tokens de raciocínio e era **cortado antes de produzir a resposta**. Não era falta de capacidade: era excesso de raciocínio mal direcionado.

A literatura apontava o mesmo caminho, de três fontes independentes:

1. O **benchmark do próprio Qwen3.8-27B no llama.cpp**, que documenta o comportamento de raciocínio estendido;
2. **"Danger of Overthinking"** (arXiv 2502.08235): raciocínio longo em modelos de reasoning degrada a acurácia em tarefas com ferramentas, em vez de melhorar;
3. **"The Reasoning Trap"** (ACL 2026): quanto mais o modelo raciocina antes de chamar uma ferramenta, maior a taxa de alucinação da própria chamada. Raciocinar mais não só custa mais: **aumenta o erro**.

As três fontes convergem na mesma recomendação: **teto de raciocínio com mensagem de transição, conta fora da cabeça do modelo e chamada nativa de ferramenta**. Foi o que aplicamos:

- **Teto de 8.192 tokens** de raciocínio, com mensagem de corte no servidor em vez de truncamento silencioso;
- **calc_contas**: toda conta aritmética sai do modelo e entra em código determinístico;
- **Prompt novo** que proíbe cálculo mental explícito.

Depois das correções, os três casos que falhavam **sairam certos**.

## Os números do teste

| Métrica | Valor |
|---|---|
| Velocidade (1 conversa) | 40 tokens/s |
| Velocidade (2 conversas) | 34 tokens/s |
| Conversas simultâneas | 2 |
| Consumo gerando | ~290 W |
| Custo de energia | R$ 0,29/hora (a R$ 1/kWh) |
| **Custo por milhão de tokens** | **~R$ 2** |
| Pergunta simples | 1 a 4 min |
| Análise pesada com pesquisa | 9 a 20 min |
| Taxa de falha antes da correção | 13% das gerações |
| Causa | Estouro do teto de raciocínio |

O número que resume o argumento econômico da IA local: **R$ 2 por milhão de tokens**, contando energia, numa placa que já estava paga. Modelos de API frontier custam dezenas a centenas de vezes isso. O trade-off é a velocidade (uma análise de 20 minutos vs 20 segundos) e a concorrência (2 conversas por vez, contra o elastic da nuvem). Para o caso de uso do agente (análise profunda assíncrona, onde a qualidade importa mais que a latência), o trade-off paga.

## O que falta resolver (a lista honesta)

Produção de verdade se reconhece pela lista de pendências publicadas junto:

1. **Chamada nativa de ferramentas** no llama.cpp: deve cortar tempo e a taxa de erro do parsing manual;
2. Ensinar no prompt que **Selic e CDI são taxas efetivas ao ano**, base 252 dias úteis (a linha extra que tratou o CDI como nominal e inflou o resultado para R$ 14.621);
3. Corrigir o **guia do espaço**, que promete respostas de 1 a 3 minutos (a real é 1 a 20);
4. Trocar as **sugestões da tela inicial**, que são genéricas;
5. Resolver o turno que fica "escrevendo" até 1 hora quando um deploy o derruba;
6. Medir o **consumo do PC inteiro** em carga e em idle;
7. Limpar ~20 conversas de teste no ambiente de preview.

## E o próximo degrau de hardware?

Com os números deste teste, dá pra estimar o que muda ao subir de degrau. Uma **RTX PRO 6000 Blackwell (96 GB)**, aos preços atuais no varejo brasileiro (R$ 79 mil a R$ 135 mil, conforme a loja), rodaria o mesmo modelo em Q8 a uns **44 tokens/s** e sustentaria umas **26 conversas simultâneas de 64K tokens**. É o degrau que transforma a 3090 de laboratório em infraestrutura de equipe. Mas a lição central deste teste não depende dele: **o gargalo não era a GPU**. Era o modelo tentando ser calculadora.

## A lição que fica

O erro clássico de quem avalia IA local é medir tokens por segundo e parar por aí. Nosso teste mostrou que o gargalo real de um agente de análise não é throughput: é **disciplinar o raciocínio**. Um modelo de 27B, bem orquestrado, com teto de pensamento e ferramentas determinísticas, entrega análise financeira profissional numa placa de consumo, a R$ 2 por milhão de tokens. O que separa o brinquedo do produto não é o hardware: é a engenharia de volta do modelo.

---

**Referências**

1. Qwen Team. *Qwen3.8 Technical Report: benchmark de raciocínio estendido no llama.cpp*. 2026.
2. Chen, S. et al. *Danger of Overthinking: Examining the Reasoning-Action Dilemma in Agentic Tasks*. arXiv:2502.08235, 2025.
3. ACL 2026. *The Reasoning Trap: Extended Deliberation Degrades Tool-Calling Accuracy in LLM Agents*. 2026.
4. Banco Central do Brasil. *Boletim Focus* e taxas Selic/CDI (dados consultados pelo agente em teste, nov/2026).
