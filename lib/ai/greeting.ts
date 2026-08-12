/**
 * Primeira mensagem da conversa, renderizada pelo front antes de qualquer
 * chamada à API.
 *
 * Vive em módulo próprio (e não junto do prompt do agente) porque é importada
 * por um componente cliente: se estivesse em agentPrompt.ts, o prompt do
 * sistema iria para o bundle do browser.
 *
 * O prompt do agente importa esta constante para saber exatamente o que já foi
 * dito ao visitante — sem isso o modelo se reapresenta e repete a pergunta de
 * abertura.
 */
export const GREETING_MESSAGE = `Olá! 👋 Seja bem-vindo à **BaXiJen**.

Sou o assistente virtual da empresa e estou aqui para te ajudar a tirar sua ideia do papel.

Qual o objetivo do seu projeto hoje? Pode me contar em uma frase — por exemplo: atendimento automatizado no WhatsApp, monitoramento de riscos e crises, IA para educação, ou outra necessidade.`
