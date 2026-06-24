---
title: "Tool Use e Function Calling em Produção: Como Ensinar Agentes a Usar Ferramentas de Verdade"
description: "Agentes de IA que chamam ferramentas são o estado da arte em 2026, mas 15 a 25% das chamadas falham silenciosamente em produção. Este guia mapeia as quatro camadas que determinam confiabilidade de tool use: design de schema, validação de argumentos, tratamento de erros e prevenção de loops. Com dados do Berkeley Function Calling Leaderboard v4, papers de arXiv sobre consistência de agentes e arquitetura de referência para deploy no Brasil."
date: "2026-06-24"
author: "Leonardo Camilo"
authorRole: "CEO e Co-fundador na BaXiJen"
tags: ["tool use", "function calling", "agentes IA", "produção", "schema design", "BFCL", "validação", "LLM", "IA brasileira", "BaXiJen", "open-source"]
featured: true
image: "/blog/tool-use-function-calling-cover.svg"
imageAlt: "Diagrama de quatro camadas de tool use em produção: schema registry com JSON Schema validado, tool call router com Promise.allSettled para execução paralela, error handling com structured error results e loop prevention com max tool calls guard. Setas indicam o fluxo cíclico entre LLM, tools e resultados."
---

Em janeiro de 2026, a Berkeley publicou a quarta versão do Function Calling Leaderboard (BFCL v4), o benchmark de referência para avaliar se modelos de linguagem conseguem chamar funções corretamente. O resultado mais revelante não foi qual modelo liderou, mas sim a distância entre o topo e a base: o melhor modelo atingiu 75% de acurácia geral, enquanto modelos mais antigos ficaram abaixo de 30% (Patil et al., 2025, ICML). Isso significa que mesmo o melhor modelo de 2026 erra uma em cada quatro chamadas de ferramenta em cenários agentic. Em produção, essa taxa se traduz em falhas silenciosas, alucinações de argumentos e loops infinitos que custam dinheiro real.

O problema é estrutural. Pesquisa publicada por Rabanser e colegas na Princeton University em fevereiro de 2026 demonstra que ganhos recentes de acurácia em benchmarks tradicionais produziram apenas melhorias marginais em confiabilidade operacional. O estudo, intitulado "Towards a Science of AI Agent Reliability", propõe doze métricas que decompõem a confiabilidade em quatro dimensões: consistência, robustez, previsibilidade e segurança. A conclusão é que comprimir o comportamento do agente em uma única métrica de sucesso esconde falhas operacionais críticas (Rabanser et al., 2026, arXiv:2602.16666).

Este artigo mapeia as quatro camadas técnicas que determinam se seu agente de IA vai usar ferramentas de forma confiável em produção: design de schema, validação de argumentos, tratamento de erros e prevenção de loops. Para cada camada, apresento dados de pesquisa, armadilhas observadas em deploy real e recomendações aplicáveis ao mercado brasileiro, onde soberania de dados e custo de inferência são restrições que moldam toda decisão de arquitetura.

## 1. Design de Schema: a fundação que ninguém ensina

A maioria dos tutoriais de function calling trata o schema da ferramenta como um detalhe de implementação. Na prática, é a decisão de arquitetura que maior impacto tem na confiabilidade do agente. Um schema mal desenhado faz o modelo alucinar argumentos, escolher ferramentas erradas ou ignorar parâmetros obrigatórios.

A documentação oficial da Anthropic para tool use em Claude recomenda três princípios para design de schema que valem para qualquer provedor (Anthropic, 2026):

**Primeiro, descrições devem ser suficientemente específicas para disambiguar ferramentas similares.** Se você tem duas ferramentas de busca, uma para documentos internos e outra para a web, a descrição não pode ser apenas "busca informações". Deve explicitar o escopo, o tipo de retorno e quando usar cada uma. Modelos usam a descrição como sinal primário para seleção de ferramenta.

**Segundo, parâmetros opcionais devem ser explicitamente marcados.** Um estudo da CallSphere publicado em 2026 mostra que schemas com campos ambíguos (nem obrigatório nem opcional claramente) produzem alucinação de argumentos em 8 a 12% das chamadas (CallSphere, 2026). O JSON Schema oferece `required` para campos obrigatórios e permite omitir campos opcionais. Use essa distinção de forma agressiva.

**Terceiro, enums são seu melhor amigo.** Quando um parâmetro aceita um conjunto finito de valores, use `enum` em vez de `string` livre. Isso reduz a variância de argumentos em até 40%, segundo dados empíricos da LLMversus publicados em abril de 2026 (LLMversus, 2026).

A tabela abaixo resume os anti-padrões mais comuns em design de schema e seus impactos observados:

| Anti-padrão | Impacto observado | Frequência em produção |
|---|---|---|
| Descrição genérica ("busca dados") | Seleção incorreta de ferramenta | 35-45% dos casos |
| Campos sem `required` explícito | Alucinação de argumentos opcionais | 8-12% das chamadas |
| `string` livre onde `enum` seria possível | Variância de argumentos | 30-40% de degradação |
| Schema não versionado | Quebra silenciosa após update | 15-20% dos deploys |
| Todos os tools no contexto | Confusão de seleção | 25% de erro com >10 tools |

A recomendação prática é injetar apenas o subconjunto de ferramentas relevante para a tarefa atual no contexto do modelo, nunca o catálogo completo. Incluir todas as ferramentas aumenta o erro de seleção em 25% quando se ultrapassa dez ferramentas no contexto (LLMversus, 2026).

### Versionamento de schema como disciplina de engenharia

Um ponto que quase nenhum tutorial cobre é o versionamento de schemas de ferramentas. Quando você muda a assinatura de uma função, o modelo treinado na versão anterior pode passar a gerar argumentos incompatíveis. A abordagem recomendada pela COMPEL Framework é tratar o registry de ferramentas como uma API versionada: cada ferramenta tem semver, owner e data de depreciação (COMPEL Framework, 2026). Isso permite rolar mudanças sem quebrar agentes em produção e rastrear qual versão de schema cada agente está usando quando algo dá errado.

## 2. Validação de Argumentos: o firewall entre o modelo e seus sistemas

O modelo gera argumentos. Sua responsabilidade é validar esses argumentos antes de executar qualquer coisa. Esta camada é o firewall que impede injeções, erros de tipo e argumentos malformados de chegarem aos seus sistemas.

Dados da LLMversus mostram que modelos alucinam tipos de argumento inválidos em 5 a 10% das chamadas, mesmo com schemas bem definidos (LLMversus, 2026). O paper "How Consistent Are LLM Agents?", publicado por Yagubyan em abril de 2026, quantifica isso com precisão: agentes selecionam as ferramentas corretas na ordem correta em 87% dos casos (Tool Selection Score médio de 0.87), mas variam substancialmente nos argumentos que fornecem (Argument Consistency média de 0.69). A diferença é grande e estatisticamente significativa (Cohen's d = 0.75, p < 0.0001) (Yagubyan, 2026, arXiv:2605.28840).

A implicaçāo prática é direta: você não pode confiar nos argumentos que o modelo gera, mesmo quando a ferramenta certa foi selecionada. A validaçāo precisa acontecer em duas camadas:

**Camada 1: validaçāo estrutural.** Antes de executar a ferramenta, valide os argumentos contra o JSON Schema usando uma biblioteca como AJV (Another JSON Validator) em JavaScript ou Pydantic em Python. Isso captura erros de tipo, campos faltantes e formatos inválidos. O custo computacional é negligenciável: menos de 0.1ms por validaçāo (LLMversus, 2026).

**Camada 2: validaçāo semântica.** Mesmo que os argumentos passem a validaçāo estrutural, podem ser semanticamente inválidos. Um exemplo: o modelo gera `{ "invoiceId": "123 OR 1=1" }` para uma ferramenta de consulta de fatura. Estruturalmente é uma string válida, semanticamente é uma tentativa de injeçāo SQL. A validaçāo semântica inclui sanitizaçāo de input, verificaçāo de ranges plausíveis e checagem de permissões.

O paper "Tool Schema Design Is Your Blast Radius", publicado por Tian Pan em maio de 2026, argumenta que o schema da ferramenta é efetivamente o limite de segurança do seu agente: se o schema permite valores arbitrários, o blast radius de um erro é ilimitado (Pan, 2026). A recomendaçāo é tratar cada definiçāo de ferramenta como um documento de segurança, não apenas como documentaçāo de API.

### Padrão de implementaçāo

Em TypeScript, o padrão recomendado é definir schemas com Zod e compilar para JSON Schema em build time:

```typescript
const searchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).default(10),
  domain: z.enum(["internal", "web"]).default("web")
});
```

Isso oferece três benefícios simultâneos: type safety no código da ferramenta, JSON Schema auto-gerado para a API do LLM e validaçāo em runtime que captura drift. Nunca escreva JSON Schema à mão: um typo silencioso torna o schema inválido e o modelo cai em fallback de argumentos alucinados.

## 3. Tratamento de Erros: o que fazer quando a ferramenta falha

A pesquisa "ReliabilityBench", publicada por Gupta em janeiro de 2026, introduz um framework de chaos engineering para agentes de IA. O estudo testa dois modelos (Gemini 2.0 Flash e GPT-4o) e duas arquiteturas (ReAct e Reflexion) em quatro domínios: agendamento, viagens, suporte ao cliente e e-commerce, totalizando 1.280 episódios (Gupta, 2026, arXiv:2601.06112).

Os resultados são instrutivos para qualquer equipe fazendo deploy de agentes em produção:

**Perturbações semânticas reduzem o sucesso de 96.9% para 88.1%.** Quando a mesma tarefa é reformulada com sinônimos ou ordem diferente de instruções, a taxa de sucesso cai 8.8 pontos percentuais. Isso significa que testes com inputs perfeitamente formatados superestimam a robustez do agente.

**Rate limiting é o tipo de falha mais danoso.** Entre os tipos de falha de ferramenta testados (timeout, rate limit, resposta parcial, schema drift), rate limit causa a maior degradaçāo no sucesso do agente. Isso é particularmente relevante no Brasil, onde APIs públicas e serviços de terceiros frequentemente impõem limites agressivos.

**ReAct é mais robusto que Reflexion sob estresse combinado.** Quando perturbaçāo e falha de ferramenta atuam simultaneamente, a arquitetura ReAct mantém melhor performance que Reflexion. A diferença é significativa para equipes escolhendo arquitetura de agente para ambientes hostis.

A regra mais importante de tratamento de erros é simples: **nunca omita o resultado da ferramenta**. A API da Anthropic exige um `tool_result` para cada `tool_use` block. Se você omitir, recebe um erro 400. Se a ferramenta falhou, retorne um erro estruturado:

```json
{
  "type": "tool_result",
  "tool_use_id": "...",
  "is_error": true,
  "content": "Error: API returned 404"
}
```

O modelo então tentará uma abordagem diferente ou explicará ao usuário o que deu errado, o que é infinitamente melhor que uma falha silenciosa ou uma alucinação. Dados da LLMversus indicam que equipes que implementam error handling estruturado reduzem falhas silenciosas de 15-25% para abaixo de 3% (LLMversus, 2026).

### Recuperaçāo de falhas: o paper FISSION-GRPO

Uma linha de pesquisa promissora é treinar modelos para recuperar de erros de execuçāo de ferramentas. O paper "Robust Tool Use via FISSION-GRPO", publicado na ACL 2026 por Zhang e colegas, demonstra que modelos treinados com reinforcement learning para detectar e recuperar de erros de execuçāo melhoram a taxa de sucesso em 22% comparado a modelos sem esse treinamento (Zhang et al., 2026, ACL 2026). O método usa uma variaçāo de GRPO (Group Relative Policy Optimization) que penaliza o modelo por desistir após uma falha de ferramenta e recompensa tentativas de recuperaçāo estruturadas.

Para equipes usando modelos open-source no Brasil, isso abre uma perspectiva interessante: fine-tuning para robustez de tool use pode ser mais eficaz que trocar para um modelo maior e mais caro.

## 4. Prevenção de Loops: o custo invisível que ninguém monitora

Sem um guard de limite de chamadas, um modelo preso em loop de tool calling (buscar, nāo encontrar, buscar de novo, nāo encontrar) pode acumular US$ 5 a US$ 50 em uma única sessāo de usuário (LLMversus, 2026). O problema é particularmente agudo em modelos menores e mais baratos, que tendem a entrar em loops mais frequentemente que modelos maiores.

A implementaçāo é trivial, mas frequentemente esquecida: um contador por sessāo que aborta o loop quando o modelo excede um limite de chamadas de ferramenta. O padrāo recomendado é **10 chamadas por requisiçāo do usuário**, cobrindo 99% dos casos legítimos. Ao atingir o limite, retorne o resultado parcial com uma nota explicativa.

### Consistência comportamental como proxy de confiabilidade

O paper de Yagubyan (2026) introduz uma métrica chamada Tool Selection Score (TSS) que mede se o agente seleciona as mesmas ferramentas na mesma ordem em execuções repetidas da mesma tarefa. A descoberta mais útil para produção é que TSS alto prevê sucesso da tarefa: condições de alto TSS atingem 90.2% de corretude contra 61.2% para baixo TSS (d = 0.81, p < 0.001). Isso faz do TSS um proxy leve para confiabilidade que não requer ground-truth labels.

A implicaçāo prática para equipes de produção é que você pode monitorar o TSS do seu agente em tempo real como indicador de saúde. Se o TSS cai abaixo de 0.80 em um domínio específico, algo mudou no ambiente que está confundindo o agente. É um alerta precoce antes que a taxa de erro chegue ao usuário.

## 5. Tool Use com Modelos Open-Source no Brasil

O BFCL v4 mostra que modelos open-source fecharam a distância com modelos proprietários em function calling. Qwen3.7 Max lidera com 75% de acurácia geral, mas modelos como Llama 3.3 70B e Qwen3 72B estão na faixa de 60-70%, suficiente para produção com as camadas de validação descritas acima (Patil et al., 2025).

Para deploy no Brasil, três fatores favorecem modelos open-source com tool use:

**Soberania de dados.** Tool use frequentemente envolve acessar sistemas internos: CRM, ERP, bases de dados governamentais. Rodar localmente com modelos open-source elimina o risco de vazar dados sensíveis para APIs externas. O BXat, produto da BaXiJen para gestão pública, roda inteiramente on-premise com modelos open-source fazendo tool use para consultar bases internas.

**Custo de inferência.** Models open-source rodados localmente custam uma fração do preço de APIs proprietárias quando o volume justifica. Um modelo de 70B rodando em INT4 numa RTX 4090 custa aproximadamente US$ 0.02 por milhāo de tokens, contra US$ 2.50 do GPT-4o (LLMversus, 2026).

**Customizaçāo.** Modelos open-source podem ser fine-tuned para dominios específicos. O paper FISSION-GRPO mostra que fine-tuning para robustez de tool use é viável e eficaz. Para setores específicos do mercado brasileiro (jurídico, tributário, saúde pública), fine-tuning para schemas de ferramentas locais pode produzir ganhos que nenhum modelo proprietário oferece.

### O que o τ-bench nos ensina sobre avaliaçāo

O τ-bench (tau-bench), desenvolvido pela Sierra Research, é um framework de benchmark para avaliar agentes em cenários realistas de interaçāo com usuários e ferramentas. A versāo mais recente, τ³-bench, inclui domínios de banking, airline, retail e telecom, com políticas complexas que o agente deve seguir, ferramentas com efeitos colaterais e simulaçāo de usuário realista (Sierra Research, 2026).

A liçāo mais importante do τ-bench para equipes brasileiras é que acurácia em single-turn nāo prediz performance em multi-turn. Um modelo que acerta 90% das chamadas isoladas pode cair para 60% em conversas de 15 turnos com múltiplas ferramentas. Teste seu agente no cenário real, nāo no cenário isolado.

## 6. Arquitetura de Referência para Produção

Baseado nas pesquisas e benchmarks citados, proponho uma arquitetura de referência para tool use em produção com modelos open-source no Brasil:

1. **Schema Registry versionado**: cada ferramenta tem versāo, owner e descriçāo precisa. Injete apenas o subconjunto relevante por tarefa.
2. **Validaçāo dupla**: estrutural (JSON Schema + AJV/Pydantic) e semântica (sanitizaçāo, range check, permission check).
3. **Tool Call Router**: recebe os `tool_use` blocks do modelo, valida argumentos, executa em paralelo com `Promise.allSettled()` para isolamento de falhas.
4. **Error handling estruturado**: toda falha retorna `tool_result` com `is_error: true` e mensagem descritiva. Nunca omita o resultado.
5. **Loop guard**: contador por sessāo com limite de 10 chamadas. Ao atingir, retorne resultado parcial.
6. **Monitoramento de TSS**: rastreie Tool Selection Score como indicador de saúde do agente em produção.
7. **Fallback de modelo**: se o modelo primário falhar consistentemente em tool use, tenha um modelo de backup (maior, mais caro) para casos críticos.

Esta arquitetura custa mais para implementar que um simples loop de chamada de API, mas é o que separa um demo de um produto. A diferença entre 75% e 95% de confiabilidade em tool use não vem de trocar de modelo. Vem de construir as camadas de engenharia ao redor do modelo que capturam seus erros antes que virem problemas.

## Referências

Anthropic. (2026). *Define tools: Specify tool schemas, write effective descriptions, and control when Claude calls your tools.* Claude API Documentation. Disponível em: https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools

CallSphere. (2026). *Tool-Calling Schemas That Don't Break: Robust Function Definitions.* CallSphere Blog. Disponível em: https://callsphere.ai/blog/tool-calling-schemas-robust-function-definitions-2026

COMPEL Framework. (2026). *Tool Use: Schemas, Registries, and Design Discipline.* COMPEL Framework Articles. Disponível em: https://www.compelframework.org/articles/tool-use-schemas-registries-and-design-discipline

Gupta, A. (2026). *ReliabilityBench: Evaluating LLM Agent Reliability Under Production-Like Stress Conditions.* arXiv:2601.06112. Disponível em: https://arxiv.org/abs/2601.06112

LLMversus. (2026). *LLM Function Calling & Tool Use: Production Architecture.* Reference Architecture. Disponível em: https://llmversus.com/architecture/function-calling-tool-use

Pan, T. (2026). *Tool Schema Design Is Your Blast Radius: When Function Definitions Become Security Boundaries.* Tian Pan Blog. Disponível em: https://tianpan.co/blog/2026-05-02-tool-schema-design-blast-radius-security-boundary

Patil, S. G., Mao, H., Cheng-Jie Ji, C., Yan, F., Suresh, V., Stoica, I., & Gonzalez, J. E. (2025). *The Berkeley Function Calling Leaderboard (BFCL): From Tool Use to Agentic Evaluation of Large Language Models.* Forty-second International Conference on Machine Learning (ICML 2025). Disponível em: https://gorilla.cs.berkeley.edu/leaderboard

Rabanser, S., Kapoor, S., Kirgis, P., Liu, K., Utpala, S., & Narayanan, A. (2026). *Towards a Science of AI Agent Reliability.* arXiv:2602.16666. Princeton University. Disponível em: https://arxiv.org/abs/2602.16666

Sierra Research. (2026). *τ-Bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains.* GitHub Repository. Disponível em: https://github.com/sierra-research/tau2-bench

Sigdel, A. & Baral, R. (2026). *ToolMisuseBench: An Offline Deterministic Benchmark for Tool Misuse and Recovery in Agentic Systems.* arXiv:2604.01508. Disponível em: https://arxiv.org/abs/2604.01508

Yagubyan, A. (2026). *How Consistent Are LLM Agents? Measuring Behavioral Reproducibility in Multi-Step Tool-Calling Pipelines.* arXiv:2605.28840. Disponível em: https://arxiv.org/abs/2605.28840

Zhang, Z., Zhao, F., et al. (2026). *Robust Tool Use via FISSION-GRPO: Learning to Recover from Execution Errors.* Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL 2026), pages 40477-40491. Disponível em: https://aclanthology.org/2026.acl-long.1880.pdf