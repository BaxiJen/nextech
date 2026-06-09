---
title: "Red Teaming na Prática: Como Testar Adversarialmente Seu Agente Antes do Deploy"
description: "Red teaming não é pentest tradicional. É simular ataques reais em sistemas de IA: prompt injection, jailbreak, exfiltração de dados, escalonamento de permissão. Com o OWASP Top 10 para LLMs 2025, ferramentas como Promptfoo, PyRIT e Garak maturando, e a EU AI Act exigindo testes adversariais para sistemas de alto risco a partir de agosto de 2026, não dá mais pra shipar agente sem red team. Guia prático com metodologia, ferramentas comparadas e o playbook que usamos na BaXiJen."
date: "2026-06-09"
author: "Marcus Ramalho"
authorRole: "CTO na BaXiJen"
tags: ["red teaming", "segurança", "agentes IA", "OWASP", "prompt injection", "PyRIT", "Garak", "Promptfoo", "adversarial testing", "LGPD", "produção"]
featured: true
image: "/blog/red-teaming-adversarial-agentes-ia-cover.svg"
imageAlt: "Pipeline de red teaming para agentes IA: da modelagem de ameaças às camadas de cobertura, com ferramentas open-source e mapeamento OWASP"
---

Você fez code review. Você escreveu testes unitários. Você configurou CI/CD. Você deployou seu agente IA. Três dias depois, um usuário descobre que consegue fazer o bot executar uma função administrativa injetando instruções no campo de busca. Outro extrai o system prompt inteiro. Um terceiro consegue que o agente envie emails usando uma API que deveria estar restrita.

Seu pipeline de CI passou. Seus testes passaram. Mas ninguém tentou quebrar o sistema de propósito.

É aí que entra o red teaming.

## 1. O que é red teaming de IA (e o que não é)

Red teaming de IA é a prática de simular ataques adversariais contra sistemas de LLM e agentes antes (e depois) do deploy. O nome vem do cybersecurity tradicional, onde um "time vermelho" simula o adversário enquanto o "time azul" defende. Mas há diferenças fundamentais:

**Red teaming de IA não é pentest.** Pentest busca vulnerabilidades conhecidas em infraestrutura (portas abertas, misconfiguration, SQL injection). Red teaming de IA busca falhas de comportamento: o modelo faz algo que não deveria quando provocado de forma criativa. Os vetores são diferentes, os payloads são diferentes, os critérios de sucesso são diferentes.

**Red teaming de IA não é benchmark de segurança.** Benchmarks como TruthfulQA ou ToxiGen testam o modelo base em condições controladas. Red teaming testa o sistema inteiro: modelo, pipeline de RAG, chamadas de ferramentas, guardrails, logging. O que importa é o comportamento em produção, não o score em dataset estático.

**Red teaming de IA não é opcional.** A EU AI Act exige testes adversariais documentados para sistemas de IA de alto risco a partir de agosto de 2026 (Artigo 9 e 15). O NIST AI RMF (Govern 1.7) recomenda explicitamente "avaliação de riscos por terceiros independentes". O Marco Legal da IA no Brasil (Lei 21.389/2024) segue a mesma direção. Se você vai deployar IA no Brasil, red teaming é compliance.

O OWASP Top 10 para Aplicações LLM 2025 cataloga as 10 categorias de risco mais críticas. Dessas 10, red teaming cobre diretamente pelo menos 7:

| Risco OWASP 2025 | O que o red teaming testa |
|---|---|
| LLM01: Prompt Injection | Injeção direta e indireta via input, RAG, tool output |
| LLM02: Sensitive Information Disclosure | Extração de system prompt, PII, dados de treino |
| LLM04: Data and Model Poisoning | Injeção de dados maliciosos no pipeline de RAG |
| LLM06: Excessive Agency | Escalonamento de permissão via tool calls |
| LLM08: Vector and Embedding Weaknesses | Retrieval manipulation, embedding poisoning |
| LLM09: Misinformation | Alucinação induzida, factoid generation |
| LLM10: Unbounded Consumption | Token flooding, cost amplification |

Os 3 restantes (LLM03: Supply Chain, LLM05: Security Misconfiguration, LLM07: System Prompt Leakage) são parcialmente cobertos por testes de infraestrutura tradicionais, mas cruzam com red teaming de IA quando o ataque é mediado pelo modelo.

## 2. As 5 camadas de ataque: mapeando a superfície

Antes de escolher ferramenta, você precisa mapear o que está testando. Um sistema de IA em produção tem 5 camadas de superfície de ataque, e a maioria das ferramentas cobre apenas parte delas.

### Camada 1: Input/Output

A clássica. O que entra no modelo e o que sai. Inclui prompt injection direto, jailbreaks, geração de toxicidade, exfiltração de PII e extração de system prompt. É a camada que toda ferramenta de red teaming cobre.

**Testes típicos:** tentar fazer o modelo gerar conteúdo proibido, extrair instruções do system prompt, vazar informações sensíveis, produzir outputs tóxicos ou enviesados.

### Camada 2: Retrieval (RAG)

Se seu agente usa RAG, o pipeline de retrieval é uma superfície de ataque distinta. Documentos envenenados, chunks manipulados e prompts adversários embutidos em conteúdo recuperado são vetores que passam despercebidos por testes que só olham input/output.

**Testes típicos:** injeção de prompt indireta via documentos indexados, manipulação de similaridade para priorizar chunks maliciosos, exploração de embeddings para recuperar conteúdo irrelevante ou nocivo.

### Camada 3: Agência (tool calls)

Agentes que invocam ferramentas, APIs e outros agentes têm uma superfície de ataque que não existe em chatbots simples. Sequestro de tool calls, escalonamento de permissão, manipulação de memória persistente e violação de fronteiras de confiança entre agentes são ataques exclusivos de sistemas agênticos.

**Testes típicos:** fazer o agente chamar uma função que não deveria, manipular argumentos de tool calls, explorar memória compartilhada entre sessões, escalar privilégios via cadeia de tool calls.

### Camada 4: Modelo (artifact)

Ataques ao artefato do modelo em si: extração de modelo, backdoors em fine-tuning, manipulação de embedding space e exploits de desserialização em formatos serializados. É o território do Garak e do HiddenLayer.

**Testes típicos:** tentar extrair pesos ou comportamentos do modelo, injetar backdoors via dados de fine-tuning, explorar vulnerabilidades em formatos como safetensors ou pickle.

### Camada 5: Infraestrutura

Token flooding, amplificação de custo via max-token exploitation, sprawl de API keys e riscos de supply chain no pipeline de serving. Quase nenhuma ferramenta de red teaming cobre esta camada. Requer review de infraestrutura separada.

**Testes típicos:** enviar requisições que maximizam tokens gerados para inflar custos, explorar vazamento de credenciais em logs, verificar dependências com vulnerabilidades conhecidas.

Nenhuma ferramenta cobre todas as 5 camadas. A resposta para a maioria dos times é uma combinação, não uma substituição.

## 3. Ferramentas open-source: qual usar quando

O ecossistema de ferramentas de red teaming amadureceu significativamente em 2025/2026. As quatro ferramentas open-source mais relevantes são Promptfoo, PyRIT, Garak e DeepTeam. Cada uma tem ponto forte e gap.

### Promptfoo

A ferramenta mais acessível para times de engenharia. Roda a partir de um YAML config, integra nativamente com GitHub Actions, GitLab CI e Jenkins, e combina red teaming com avaliação de LLM num fluxo CLI único. Com 18.000+ stars no GitHub e licença MIT, tem a maior comunidade das quatro.

Em março de 2026, a OpenAI adquiriu o Promptfoo por aproximadamente US$ 86 milhões, sinalizando que testes de segurança em LLM viraram infraestrutura. A licença MIT foi mantida e o projeto continua aceitando contribuições comunitárias.

O diferencial é o mapeamento de descobertas para OWASP Top 10 para LLMs, NIST AI RMF, MITRE ATLAS e EU AI Act, gerando relatórios que stakeholders não-técnicos e auditores conseguem ler. Essa conformidade de compliance é rara em ferramenta open-source.

**Melhor para:** times de engenharia que querem segurança integrada ao CI/CD com baixo overhead de configuração e relatórios mapeados ao OWASP.

**Gap:** cobertura limitada de ataques agênticos. Teste de pipeline multi-agente requer configuração de plug-in customizada. Mais fraco em ataques de modelo e infraestrutura.

### PyRIT (Microsoft)

O PyRIT (Python Risk Identification Tool) é o framework de red teaming da Microsoft, licenciado MIT e testado em mais de 100 produtos internos, incluindo o Copilot. Tem 3.800+ stars, 129 contribuidores e artigo acadêmico publicado.

A distinção crítica: PyRIT é um framework de orquestração, não um scanner. Você escreve scripts Python que definem campanhas de ataque usando três primitivas compostáveis: orchestrators (direcionam o fluxo), converters (transformam prompts) e scorers (avaliam respostas). Isso dá controle preciso sobre a lógica de ataque, ao custo de overhead de engenharia maior que ferramentas YAML.

O diferencial são os ataques multi-turn. A técnica Crescendo guia o modelo gradualmente para conteúdo nocivo através de passos aparentemente inofensivos, usando um LLM atacante para gerenciar a escalação. Pesquisadores da Microsoft demonstraram que essa técnica bypassa o alinhamento de segurança do GPT-4 e do Gemini Pro. A técnica TAP (Tree of Attacks with Pruning) explora múltiplos ramos em paralelo, podando becos sem saída. O paper original do TAP reporta mais de 80% de sucesso contra GPT-4 Turbo e GPT-4o.

O PyRIT também traz 70+ conversores de prompt: Base64, ROT13, Leetspeak, confusáveis Unicode, rephrasing via LLM, tradução e injeção multimodal. Conversores empilham: você pode traduzir, codificar em Base64 e embutir em imagem na mesma cadeia.

**Melhor para:** researchers de segurança e profissionais de red team que precisam controle programático total sobre a lógica de ataque, especialmente para cenários multi-turn e ataques agênticos customizados.

**Gap:** sem dashboard ou relatório de compliance nativo. Requer proficiência em Python. Não é CI/CD-native sem wrapping customizado.

### Garak (NVIDIA)

Scanner de vulnerabilidades de modelo da NVIDIA, projetado para testar fraquezas no nível do modelo, não no nível da aplicação. Arquitetura modular com probes (geram inputs de teste), detectors (analisam outputs), evaluators (compilam resultados) e buffs (modificam comportamento dos probes).

Com 120+ módulos de probe cobrindo prompt injection, jailbreaks DAN, bypasses de encoding, data leakage, alucinação de pacotes, geração de malware, toxicidade e XSS, o Garak oferece a cobertura automatizada mais ampla de vulnerabilidades de modelo base entre as ferramentas open-source. Suporta os principais providers: OpenAI, Hugging Face, AWS Bedrock, Azure OpenAI, NVIDIA NIM, Cohere, Groq e qualquer endpoint REST.

O gap é a camada de aplicação. Ele testa endpoints de modelo, não stacks completas. Cobertura de RAG é limitada a um subset de probes de injeção indireta. Cobertura agêntica existe, mas é inicial.

**Melhor para:** scanning de segurança de modelo base antes do deploy, comparação de modelos durante avaliação e testes de regressão noturnos quando foundation models são atualizados.

**Gap:** não foi projetado para testar stacks completas, pipelines RAG complexos ou workflows multi-agente. Output de relatório limitado, CLI-first.

### DeepTeam (Confident AI)

A mais nova e com menor atrito de entrada. Instala via pip, aponta pro endpoint, roda scans cobrindo 40+ tipos de vulnerabilidade mapeados diretamente ao OWASP Top 10 para LLMs e ao OWASP Top 10 para Aplicações Agênticas.

O alinhamento explícito ao OWASP é a proposta de valor principal. Cada tipo de vulnerabilidade mapeia a um código OWASP específico, e o DeepTeam suporta alinhamento ao NIST AI RMF. Para times produzindo evidência de compliance, ter descobertas que referenciam categorias OWASP diretamente economiza o passo de mapeamento manual que Garak e PyRIT exigem.

Roda scans de forma assíncrona, o que melhora throughput contra endpoints com alta latência. Suporta 10+ métodos de ataque adversarial incluindo ataques multi-turn, simulação de persona e injeção de jailbreak.

**Melhor para:** times que precisam de cobertura baseline mapeada ao OWASP em menos de 1 hora de setup, particularmente para casos de uso orientados a compliance.

**Gap:** biblioteca de probes menor que Garak. Orquestração multi-turn mais simples que PyRIT. Integração CI/CD menos madura que Promptfoo.

## 4. Comparativo prático: o que cada ferramenta cobre

| Critério | Promptfoo | PyRIT | Garak | DeepTeam |
|---|---|---|---|---|
| Camada principal | Input/Output + RAG | Input/Output + Agência | Modelo (artifact) | Input/Output |
| Cobertura OWASP | Completa (10/10) | Parcial (7/10) | Parcial (6/10) | Completa (10/10) |
| Ataques multi-turn | Limitados | Fortes (Crescendo, TAP) | Não | Básicos |
| Ataques agênticos | Com plug-in | Fortes | Iniciais | Limitados |
| Configuração | YAML (baixo atrito) | Python (alto atrito) | CLI (médio) | pip + CLI (baixo) |
| Relatório compliance | OWASP, NIST, EU AI Act | Não nativo | Limitado | OWASP, NIST |
| CI/CD nativo | Sim | Não | Não | Parcial |
| Comunidade | 18k+ stars | 3.8k+ stars | 120+ probes | 1.2k+ stars |
| Licença | MIT | MIT | Apache 2.0 | Apache 2.0 |

A recomendação pragmática para a maioria dos times:

1. **Promptfoo** no CI/CD para segurança contínua da aplicação
2. **Garak** para scanning de modelo base antes de trocar de foundation model
3. **PyRIT** para exercícios de red team periódicos com campanhas de ataque multi-turn
4. **DeepTeam** como entry point rápido quando compliance exige evidência OWASP mapeada

Nenhuma ferramenta sozinha é suficiente. A combinação é o que cobre as 5 camadas.

## 5. Metodologia: como conduzir um exercício de red teaming

Ferramenta sem metodologia é scanner sem critério. Um exercício de red teaming bem conduzido segue 6 fases.

### Fase 1: Modelagem de ameaças

Antes de executar qualquer ferramenta, defina o que está protegendo e contra quem. Identifique:

- **Assets**: quais dados o agente acessa (PII, dados financeiros, documentos internos)
- **Superfície de ataque**: quais vetores são relevantes para o seu caso (input direto, RAG, tool calls, memória persistente)
- **Perfil do adversário**: insider malicioso, usuário externo, atacante automatizado, estado-nação
- **Impacto**: o que acontece se cada ataque tiver sucesso (vazamento de dados, perda financeira, dano reputacional, não-conformidade LGPD)

Sem essa fase, você vai rodar 200 probes genéricos e ter 200 findings sem priorização.

### Fase 2: Definição de escopo e regras de engagement

Documente o que está e não está no escopo:

- Quais endpoints e APIs podem ser testados
- Limites de volume (quantos requests, qual taxa)
- Horários permitidos (evitar horário de pico em produção)
- Dados reais vs. sandbox
- Regras de parada (quando parar o teste)

Se o sistema está em produção, red team em ambiente de staging. Se não tem staging, crie um. Nunca red teame em produção sem isolamento.

### Fase 3: Execução automatizada

Rode as ferramentas conforme o mapeamento de camadas:

- **Camada 1 (Input/Output):** Promptfoo ou DeepTeam com probes OWASP completos
- **Camada 2 (RAG):** Promptfoo com probes de injeção indireta + testes manuais com documentos envenenados
- **Camada 3 (Agência):** PyRIT com campanhas Crescendo e TAP contra tool calls
- **Camada 4 (Modelo):** Garak com scan completo dos 120+ probes
- **Camada 5 (Infraestrutura):** review manual + ferramentas de security tradicional (SAST, DAST, container scanning)

Para cada camada, documente: ferramenta usada, configuração, número de ataques executados, taxa de sucesso e exemplos de payloads que funcionaram.

### Fase 4: Testes manuais e criativos

Ferramentas automatizadas encontram o conhecido. Red teaming manual encontra o desconhecido. Reserve tempo para:

- **Testes de stress social engineering:** manipular o agente usando técnicas de engenharia social (urgência, autoridade, empatia)
- **Ataques composicionais:** combinar múltiplos vetores que individualmente são benignos mas juntos produzem comportamento inesperado
- **Testes de contexto:** explorar contexto específico do domínio (regulatório brasileiro, termos jurídicos, jargão do setor público)
- **Testes de língua:** tentar jailbreaks em português, que podem bypassar filtros treinados primariamente em inglês

Esta fase é onde red teaming humano supera ferramentas automatizadas. Um pesquisador criativo com 4 horas vai encontrar falhas que 200 probes genéricos não encontram.

### Fase 5: Análise e priorização

Classifique cada finding por:

- **Severidade:** impacto potencial (crítico, alto, médio, baixo)
- **Explorabilidade:** quão fácil é reproduzir (trivial, moderada, difícil)
- **OWASP mapping:** qual risco do Top 10 está associado
- **Camada afetada:** input/output, RAG, agência, modelo ou infraestrutura

Priorize remediação pela combinação de severidade e explorabilidade. Um finding crítico mas difícil de explorar pode ter prioridade menor que um finding médio trivialmente explorável.

### Fase 6: Remediação e re-teste

Para cada finding:

1. **Implemente a correção** (guardrails, sanitização, restrição de tool calls, etc.)
2. **Documente a correção** (o que mudou, por que resolve, qual camada foi reforçada)
3. **Re-execute o ataque** que encontrou a falha para confirmar que foi resolvida
4. **Re-execute o scan completo** para verificar que a correção não introduziu regressões

Red teaming sem re-teste é exercício de documentação, não de segurança.

## 6. O contexto brasileiro: LGPD e compliance

No Brasil, red teaming de IA não é apenas boa prática: é requisito regulatório emergente. O Marco Legal da IA (Lei 21.389/2024) exige avaliação de riscos para sistemas de IA de alto risco, e a LGPD (Lei 13.709/2018) impõe responsabilidades sobre tratamento de dados pessoais que se aplicam diretamente a agentes de IA que processam PII.

Para startups brasileiras deployando agentes de IA, isso significa:

- **Testes adversariais documentados** são evidência de compliance com o princípio da responsabilidade (art. 6, VII, LGPD)
- **Mapeamento OWASP** fornece framework reconhecido para classificar e priorizar riscos
- **Red teaming periódico** demonstra diligência contínua, não apenas ponto no tempo
- **Relatórios de teste** são ativos em auditorias e processos de due diligence

A EU AI Act (Regulamento 2024/1689) exige testes adversariais documentados para sistemas de alto risco a partir de agosto de 2026. Startups brasileiras que operam na Europa ou servem clientes europeus precisam estar em conformidade. O NIST AI RMF (Govern 1.7) recomenda avaliação de riscos por terceiros independentes, o que reforça a importância de red teaming externo.

## 7. O playbook da BaXiJen

No BXat, nosso agente de IA para gestão pública, red teaming é parte do pipeline de deploy. O processo que usamos:

1. **Garak scan noturno** contra o modelo base toda vez que trocamos de foundation model. Roda os 120+ probes e gera baseline de vulnerabilidades conhecidas.

2. **Promptfoo no CI/CD** para segurança contínua da aplicação. Cada PR que mexe em prompt, RAG ou tool calls dispara um scan com probes mapeados ao OWASP Top 10.

3. **PyRIT para exercícios trimestrais** de red team com campanhas multi-turn. Especificamente, testamos:
   - Escalonamento de permissão via tool calls (o agente consegue acessar funções administrativas?)
   - Exfiltração de dados via injeção de prompt indireta no RAG (chunks de documentos públicos contendo instruções adversárias)
   - Manipulação de contexto em português (jailbreaks em PT-BR que bypassam filtros treinados em EN)

4. **Red team manual mensal** com 4 horas de testes criativos focados no domínio de gestão pública brasileira. Tentamos engenharia social contra o agente, exploração de jargão jurídico e regulatório, e ataques composicionais que combinam múltiplos vetores.

5. **Re-teste obrigatório** após cada correção. Nenhuma correção entra em produção sem confirmação de que o ataque original foi mitigado e sem regressão nos scans automatizados.

O custo é aproximadamente 2 dias de engenharia por mês. O custo de um vazamento de dados público em gestão municipal é imensurável.

## 8. Referências

- OWASP Foundation. *OWASP Top 10 for LLM Applications 2025*. Disponível em: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- Perez, F. et al. *Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned*. arXiv:2309.00720, 2023.
- Microsoft Security. *PyRIT: Python Risk Identification Tool*. Disponível em: https://github.com/microsoft/PyRIT
- NVIDIA. *Garak: LLM Vulnerability Scanner*. Disponível em: https://github.com/NVIDIA/garak
- Promptfoo. *LLM Red Teaming Guide*. Disponível em: https://www.promptfoo.dev/docs/red-team/
- Cloud Security Alliance. *Agentic AI Red Teaming Guide*. CSA, 2025. Disponível em: https://cloudsecurityalliance.org/artifacts/agentic-ai-red-teaming-guide
- NIST. *AI Risk Management Framework (AI RMF 1.0)*. NIST AI 100-1, janeiro 2023. Disponível em: https://doi.org/10.6028/NIST.AI.100-1
- Parlamento Europeu. *Regulamento (UE) 2024/1689 (AI Act)*. Artigos 9 e 15: testes adversariais para sistemas de alto risco.
- Brasil. *Lei 21.389/2024 (Marco Legal da IA)*. Seção de avaliação de riscos para sistemas de alto impacto.
- OpenAI. *OpenAI's Approach to External Red Teaming for AI Models and Systems*. 2024. Disponível em: https://cdn.openai.com/papers/openais-approach-to-external-red-teaming.pdf
- BeyondScale. *AI Red Teaming Tools: PyRIT vs Garak vs Promptfoo (2026)*. Disponível em: https://beyondscale.tech/blog/ai-red-teaming-tools-comparison-2026