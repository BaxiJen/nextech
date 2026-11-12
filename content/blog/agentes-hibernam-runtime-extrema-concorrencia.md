---
title: "Agentes que hibernam: o runtime que cabe 75 mil agentes em 8 GB e o que muda para o desenho de um agente institucional"
description: "A AWS abriu o código do Infinity, um runtime de agentes que suspende o agente a cada chamada de ferramenta e guarda só o histórico da conversa. O resultado: um agente ocioso custa cerca de 100 KB, 75 mil cabem em 8 GB, e o mesmo código roda num processo local ou numa Lambda. Este post destrincha a arquitetura (slices, filas, tool calls sintéticas), compara com o modelo de sessão do Bedrock AgentCore Runtime, mostra por que o custo de espera é o vilão silencioso da conta de agentes longos e o que isso muda para agentes que precisam rodar dias no Brasil."
date: "2026-11-12"
author: "Marcus Ramalho"
authorRole: "CTO, BaXiJen"
tags: ["agentes de IA", "runtime", "AWS Infinity", "serverless", "concorrência", "arquitetura", "infraestrutura", "Lambda", "fila de mensagens", "custo de espera", "Bedrock AgentCore", "BaXiJen", "IABrasileira"]
featured: true
image: "/blog/agentes-hibernam-runtime-infinity-cover.svg"
imageAlt: "Diagrama do runtime de agentes com hibernação: slice carrega histórico, chama o modelo, despacha no máximo uma ferramenta e termina; 75 mil agentes ociosos em 8 GB"
---

Todo agente passa a maior parte do tempo esperando. Um agente de código dispara um build que roda vinte minutos. Um agente de triagem espera horas pelo próximo pull request do repositório. Um assistente interno espera até a manhã seguinte por uma aprovação. O loop clássico dos frameworks de agente é bloqueante: chama o modelo, invoca a ferramenta, espera o resultado, repete. Enquanto espera, o agente segura um processo inteiro e sua memória, e não consegue reagir a nada que chegue no intervalo.

Em 23 de outubro de 2026, a AWS publicou no Open Source Blog o **Infinity**, um runtime de pesquisa que ataca exatamente esse ponto. A tese é simples: um agente esperando não deveria custar nada. O post é da lavra de Shadaj Laddad, research lead do time Hydro, uma colaboração entre a AWS e o UC Berkeley Sky Computing Lab, e o código está no GitHub (`hydro-project/infinity`) sob licença Apache 2.0. A AWS é explícita: é um release de pesquisa inicial, compartilhado para colher feedback, não um serviço gerenciado.

Este post destrincha como o Infinity funciona, o que os números do benchmark significam de verdade, como o modelo se compara com o de sessões do Bedrock AgentCore Runtime, e por que a hibernação muda o desenho de um agente institucional que precisa rodar por dias, não por minutos.

## A ideia central: agente como corrotina stackless

A sacada do Infinity vem de linguagens de programação, não de machine learning. Rust, JavaScript e Python suspendem funções assíncronas com `async` e `await`: quando a função espera uma operação externa, ela é suspensa, a thread segue com outro trabalho, e o runtime retoma a função do ponto de suspensão quando a operação completa.

Existem duas formas de guardar o estado de uma função suspensa. Threads do sistema operacional e corrotinas stackful mantêm a pilha de chamadas inteira na memória enquanto esperam. Corrotinas **stackless**, o mecanismo por trás do `async fn` de Rust, transformam cada função numa máquina de estados que guarda apenas os valores relevantes em cada ponto de espera. A pegada de memória é muito menor, e é por isso que um executor roda milhões de tarefas assim.

O argumento da AWS é que um agente de LLM pode ser suspenso do mesmo jeito. No momento em que o agente chama uma ferramenta, seu **histórico de conversa já contém tudo** o que é preciso para continuá-lo quando o resultado chegar. Se o runtime persiste esse histórico, pode descartar todo o estado em memória, e qualquer processo com acesso ao armazenamento retoma o agente depois. Entre turnos, um agente não é um processo: é dados.

## Como funciona na prática: slices, filas e ferramentas que não bloqueiam

O Infinity executa cada agente como uma sequência de **slices** delimitados. Um slice faz quatro coisas e termina:

1. Carrega o histórico do agente a partir de um armazenamento plugável (o *ConversationStore*);
2. Roda **uma** completion do modelo;
3. Persiste a saída;
4. Despacha **no máximo uma** chamada de ferramenta.

O slice nunca bloqueia esperando ferramenta, timer ou qualquer operação externa. A chamada de ferramenta faz o papel do `await`. Quando o resultado chega, ele entra na fila de entrada do agente e dispara um novo slice.

| Componente | Papel no runtime |
|---|---|
| ConversationStore | Guarda o histórico: é a única "continuação" do agente suspenso |
| StateStore | Registra quais mensagens cada thread já processou (deduplicação) |
| Fila de entrada | Recebe tudo que pode acordar o agente: texto do usuário, resultados de ferramentas, eventos |
| Slice | Uma completion + despacho de no máximo uma ferramenta; nunca espera |
| Thread | Uma conversa com fila própria; threads não compartilham estado mutável |

Isso muda a forma de escrever ferramentas. No Infinity, o método `execute` de uma ferramenta **inicia** o trabalho e retorna imediatamente. Quando o trabalho termina, a ferramenta manda o resultado para a fila de entrada do agente. Se a busca de status demora cem milissegundos, o próximo slice começa quase em seguida. Se demora três dias, o agente ocupa só o histórico salvo no intervalo. O código da ferramenta é o mesmo nos dois casos.

A organização lembra um **sistema de atores**: cada thread tem sua fila, threads não compartilham estado mutável, mensagens da mesma thread são processadas em ordem (um slice por vez, para não sobrescrever o histórico), e threads diferentes rodam em paralelo. Quando uma thread não tem nada na fila, sua tarefa simplesmente sai; o runtime cria outra quando a próxima mensagem chega.

## O número que viralizou: 75 mil agentes em 8 GB

O benchmark da AWS mediu o custo de manter agentes residentes. Com um modelo simulado (não um LLM real), cada agente rodou vinte turnos, cada turno com uma completion de ~1,2 KB que chama uma ferramenta, recebe o resultado pela fila e fecha com uma segunda completion. Foram **80 mil agentes e 3,2 milhões de completions numa única thread** de um AMD EPYC 9R14, com armazenamento em memória.

A memória residente cresceu de forma linear, a cerca de **100 KB por agente ocioso** (a documentação cita ~103 KB após vinte turnos com ferramentas). Nessa taxa, ~75 mil agentes cabem em 8 GB, a memória de um Raspberry Pi 5. Quase toda essa memória é histórico de conversa: um agente ocioso não tem tarefa, pilha ou conexão aberta associada a ele.

Três ressalvas que a própria AWS faz e que precisam acompanhar o número:

- O benchmark usou **modelo simulado e armazenamento em memória**, não um LLM real nem o Aurora DSQL da implantação de referência;
- A comparação com o Raspberry Pi é **extrapolação** de um benchmark de servidor, não um teste rodado num Pi;
- Agentes reais com históricos longos, saídas de ferramentas grandes ou imagens consomem mais memória cada um. E o custo dominante de rodar agentes continua sendo a **inferência do modelo**, não a memória.

O número importa como ordem de grandeza: o custo de manter um agente esperando caiu de "um processo inteiro" para "o tamanho do histórico dele".

## O que isso habilita: serverless de verdade para agentes

Como um slice não espera por nada e carrega todo o estado do armazenamento, o runtime roda em plataformas serverless onde a função é invocada por unidade de trabalho e pode sair quando termina. O Infinity chama isso de **step mode**: a plataforma chama `step` a cada lote de mensagens entregues, e nada fica retido entre chamadas. As mesmas ferramentas, provedores de modelo e testes rodam no modo local (processo residente) e no modo step sem mudanças; a diferença é o `InputSender`, que no step mode escreve numa fila durável e a mensagem volta como entrega futura.

A implantação de referência da AWS usa componentes padrão:

- **SQS FIFO** como fila de entrada, com um `MessageGroupId` por thread (a FIFO serializa os slices de cada thread na fila, dispensando locks distribuídos);
- **Lambda** invocada por entrega: roda um step e sai;
- **Aurora DSQL** para os históricos e **DynamoDB** para os registros de deduplicação;
- **EventBridge Scheduler** e delays do SQS para os timers (ferramentas de `sleep`).

Rodar nessa plataforma impõe exigências que o runtime trata explicitamente: tempo de execução delimitado por slice, nenhuma afinidade a processo (qualquer invocação processa a próxima mensagem de qualquer thread), entrega **at-least-once** (cada input tem ID estável e o StateStore pula o que já foi processado, tornando o slice idempotente), turnos duráveis (a saída do modelo é bufferada e commitada só quando o turno completa; a chamada de ferramenta é persistida antes de despachada, para que o resultado nunca chegue antes do registro) e serialização sem locks via grupos FIFO.

A consequência econômica é a mais interessante: um agente esperando um pipeline de CI de três dias **não consome computação nenhuma** até o pipeline reportar o resultado.

## O problema que a hibernação resolve: o custo de esperar

Para dimensionar por que isso importa, vale olhar como a alternativa gerenciada cobra a espera. O Amazon Bedrock AgentCore Runtime, o serviço de execução de agentes da AWS, provisiona um microVM dedicado por sessão de runtime e cobra **US$ 0,0895 por vCPU-hora** e **US$ 0,00945 por GB-hora**. A CPU não é cobrada durante espera de I/O, mas a **memória permanece faturável enquanto a sessão roda**, e a sessão só termina quando o timer de inatividade dispara: o padrão do `idleRuntimeSessionTimeout` é de **15 minutos** após a última requisição, com `maxLifetime` padrão de 8 horas (2,88 milhões de segundos).

Uma análise da Akal Cloud sobre esses números ilustra o efeito: numa sessão hipotética de chat em que o usuário manda quatro mensagens, o agente consome 40 segundos de CPU e mantém 1,5 GB steady, com a sessão encerrando pelo timeout padrão de 900 segundos, a cauda ociosa responde por cerca de **67,5% do custo de Runtime** da sessão. Reduzir o timeout para 60 segundos corta o custo total em ~63% nessa modelagem, ao preço de cold starts mais frequentes. São números de um cenário hipotético, não de medição real, mas expõem a estrutura do problema: no modelo de sessão residente, **esperar é o componente dominante da conta**, e o timer de inatividade vira um parâmetro de engenharia crítica.

O Infinity ataca a mesma conta pela raiz: em vez de cobrir a espera com um timer que encerra a sessão, elimina a noção de sessão esperando. Entre turnos, não há nada rodando para cobrar.

## Tool calls sintéticas: como o modelo fica sabendo dos eventos

Agentes que esperam também precisam **ficar sabendo** do que acontece enquanto esperam. Um comando longo produz saída ao longo do tempo; uma assinatura de repositório gera um evento a cada pull request aberto. As APIs de modelo não têm forma nativa de representar evento assíncrono: cada chamada de ferramenta exige exatamente um resultado.

O Infinity resolve com **tool calls sintéticas**. Quando um evento chega, o runtime adiciona à conversa uma chamada de ferramenta que o modelo não fez de fato, seguida do resultado contendo o evento:

```
▶ Synthetic:  receive_event__injected({
               original_tool_name: "subscribe_github_events",
               original_tool_call_id: "call_abc123",
               original_args: { owner: "acme", repo: "api" }
             })
■ Result:     {"event_type": "pull_request", "action": "opened", "number": 42}
```

A AWS avaliou três caminhos e descartou dois: acrescentar um segundo resultado à chamada original viola a regra um-resultado-por-chamada (modelos rejeitam a conversa); entregar o evento como mensagem do usuário o atribui ao usuário, e o modelo deixa de distinguir o que o usuário disse do que a ferramenta reportou. A tool call sintética preserva as capacidades que os modelos adquirem no pós-treinamento para interpretar resultados de ferramentas, e o sufixo `__injected` marca que a chamada veio do runtime: o nome nunca é oferecido ao modelo, e o runtime rejeita se o modelo tentar invocá-lo.

O mesmo mecanismo carrega a **comunicação entre agentes**. Cada agente tem a ferramenta `spawn_thread`, que cria uma thread filha com fila própria e retorna ao pai imediatamente; os relatórios do filho (`report_to_parent`, `close_thread`) chegam ao pai como eventos daquela spawn. Quando uma assinatura entrega muitos eventos, cada um pode ser processado numa thread filha temporária que herda o contexto e reporta só a conclusão, poupando a janela de contexto do pai.

## O que a própria AWS reconhece que falta

Release de pesquisa honesto vem com a lista de perguntas abertas, e a do Infinity é reveladora do que ainda está maduro ou não:

- **Raciocínio sobre eventos intercalados**: as tool calls sintéticas mantêm a conversa bem-formada, mas os modelos são treinados majoritariamente em traces com chamadas síncronas. Como a quantidade e a ordenação de eventos, e a escolha entre processamento em threads filhas ou associativo, afetam as decisões do agente ainda é terreno aberto;
- **Políticas de agendamento**: o runtime processa threads na ordem de chegada das mensagens; não há prioridade entre thread voltada ao usuário e handler de evento de fundo;
- **Compaction em árvores de agentes**: o runtime compacta o histórico em ~75% da janela de contexto, mas compaction de árvores grandes de conversa longas ainda não foi estudada a fundo;
- **Autenticidade de eventos**: cada evento é ancorado à requisição de origem, mas agentes expostos à internet podem receber payloads inautênticos. Como estabelecer proveniência de eventos mantendo a arquitetura stateless é questão em aberto.

Há ainda um detalhe de maturidade do projeto: o repositório mostra contribuição concentrada (o autor principal responde pela esmagadora maioria das ~500 contribuições), o que é esperado num release de pesquisa de outubro, mas reforça que não se trata de comunidade estabelecida.

## Por que isso importa para um agente institucional no Brasil

O caso de uso que mais sente esse problema é o agente corporativo ou público de **longa duração**: o agente que monitora um processo, espera aprovação de um fiscal, aguarda o retorno de um órgão, correlaciona eventos ao longo de dias. No desenho residente clássico, cada instância dessas segura um processo; com centenas de instâncias, a infraestrutura vira um estacionamento de carros com motor ligado.

A hibernação muda três decisões de desenho:

**Primeira: espera deixa de ser infraestrutura.** Um agente que espera a resposta de um processo externo de três dias não ocupa nem processo, nem GPU, nem microVM. A espera migra para a fila e para o armazenamento de histórico, que custam centavos. O dimensionamento deixa de ser "quantos agentes simultâneos meu cluster segura" e passa a ser "quantos **ativos por segundo** eu processo", que é o número que de fato escala com uso.

**Segunda: o runtime vira peça estratégica, não commodity.** O infinity.hydro.run traz ainda o Reactive Agent Protocol (RAP), um protocolo aberto para servir ferramentas pela rede sem segurar conexão aberta, com camada de compatibilidade para servidores MCP existentes rodarem sem mudanças. Quando o padrão de facto do mercado é sincrono (o MCP original assume request/response em conexão viva), o runtime que define como eventos chegam ao modelo vira parte do moat da plataforma. Quem controla o loop de suspensão, a fila e o formato dos eventos controla a economia da operação.

**Terceira: o recorte de soberania fica mais barato de executar.** Um agente institucional brasileiro que roda em infraestrutura local (on-premise ou nuvem privada) com histórico persistido em banco nacional não precisa da Lambda americana para adotar o padrão: o Infinity é Apache 2.0, roda em processo local com armazenamento em memória, e a fila de entrada é uma abstração que qualquer broker do mercado implementa. O desenho de slices, idempotência e deduplicação é o aprendizado que se transporta, com ou sem o código.

Para quem desenhamos agentes institucionais no BaXiJen, a leitura prática é esta: o gargalo de concorrência de agentes deixou de ser hardware. É a decisão de arquitetura entre **sessão residente** e **hibernação orientada a eventos**. A primeira é mais simples de escrever e mais cara de escalar; a segunda exige disciplina de idempotência e mensageria, mas faz o custo crescer com o trabalho real, não com a espera. Para um agente que passa dias esperando pessoas e processos, a escolha se paga logo no primeiro dimensionamento.

## Referências

1. Laddad, S. *Introducing Infinity: a runtime for extreme agent concurrency*. AWS Open Source Blog, 23 out. 2026. Disponível em: https://aws.amazon.com/blogs/opensource/introducing-infinity-a-runtime-for-extreme-agent-concurrency/
2. Hydro Project (AWS + UC Berkeley). *Infinity: an agent runtime and tool protocol for principled agent concurrency*. Repositório GitHub, licença Apache 2.0. Disponível em: https://github.com/hydro-project/infinity
3. Amazon Web Services. *Amazon Bedrock AgentCore Runtime lifecycle settings* (`idleRuntimeSessionTimeout`, `maxLifetime`). Documentação oficial, consultado em nov. 2026. Disponível em: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-lifecycle-settings.html
4. Amazon Web Services. *Amazon Bedrock AgentCore Pricing*. Tarifas de Runtime (US$ 0,0895/vCPU-hr; US$ 0,00945/GB-hr), consultado em nov. 2026.
5. Akal Cloud. *Amazon Bedrock AgentCore pricing (2026)*: modelagem do custo da cauda ociosa de sessão. Disponível em: https://akalcloud.ai/blog/bedrock-agentcore-pricing/
6. AWS Well-Architected Team. *Agentic AI Lens: checkpointing e idempotência para workflows longos*. Amazon Bedrock AgentCore Well-Architected Guidance, 2026. Disponível em: https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentrel03-bp03.html
7. Amazon Web Services. *Session management APIs: checkpoint e retomada de workflows multi-etapa no Bedrock*. Documentação oficial, consultado em nov. 2026. Disponível em: https://docs.aws.amazon.com/bedrock/latest/userguide/sessions.html
