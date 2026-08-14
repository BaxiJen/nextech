import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

/**
 * Notificação de contato pelo formulário, publicada no tópico
 * `baxijen-prod-new-leads`.
 *
 * O aviso de lead nasceu no Lambda `lead-notifier`, que lê o stream do
 * DynamoDB. Aquele caminho tem dois limites que não dá para contornar de
 * dentro dele: só enxerga `INSERT`, então quem já está na base e volta a
 * escrever passa em silêncio; e a imagem do stream não carrega contexto da
 * requisição. Publicar daqui resolve os dois — a rota sabe se o lead é novo ou
 * recorrente e tem em mãos o texto que a pessoa escreveu.
 *
 * O Lambda continua responsável pelas capturas do chat e ignora `source`
 * `form`, para não duplicar aviso.
 */

const MAX_MESSAGE_CHARS = 1_500
const MAX_SUBJECT_CHARS = 100

// O ambiente é lido a cada chamada, não na avaliação do módulo. No runtime SSR
// do Amplify o import pode acontecer antes de o .env.production estar aplicado,
// e uma constante de topo congelaria o valor ausente para sempre.
const topicArn = () => process.env.LEAD_NOTIFICATION_TOPIC_ARN || ''
const adminUrl = () => process.env.ADMIN_LEADS_URL || 'https://www.baxijen.com.br/admin/leads'
const snsRegion = () => process.env.SNS_REGION || process.env.DYNAMODB_REGION || 'sa-east-1'

let client: SNSClient | undefined

/** Cliente criado na primeira publicação e reaproveitado entre invocações. */
function sns(): SNSClient {
  client ??= new SNSClient({ region: snsRegion() })
  return client
}

export interface ContactNotification {
  leadId: string
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  company?: string
  role?: string
  returning: boolean
}

/** Achata quebras de linha para caber em uma linha do corpo do email. */
function oneLine(value: string | undefined): string {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
}

/**
 * O SNS aceita em `Subject` apenas ASCII imprimível, sem quebra de linha, com
 * no máximo 100 caracteres. Um nome como "João" reprovaria a chamada inteira,
 * então o assunto é reduzido a ASCII e o nome completo segue no corpo.
 */
function snsSubject(name: string, returning: boolean): string {
  const prefix = returning ? 'Novo contato (retorno)' : 'Novo contato'
  const ascii = oneLine(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '')
    .trim()

  return `${prefix}: ${ascii || 'sem identificacao'}`.slice(0, MAX_SUBJECT_CHARS)
}

function body(input: ContactNotification): string {
  const linhas = [
    input.returning
      ? 'Um contato conhecido enviou uma nova mensagem pelo formulário do site.'
      : 'Um novo contato chegou pelo formulário do site.',
    '',
    `Nome: ${oneLine(input.name) || '-'}`,
    `Email: ${oneLine(input.email) || '-'}`,
    `Telefone: ${oneLine(input.phone) || '-'}`,
    `Empresa: ${oneLine(input.company) || '-'}`,
    `Cargo: ${oneLine(input.role) || '-'}`,
    `Assunto: ${oneLine(input.subject) || '-'}`,
    '',
    'Mensagem:',
    input.message.trim().slice(0, MAX_MESSAGE_CHARS) || '-',
    '',
    `Lead ID: ${input.leadId}`,
    `Painel: ${adminUrl()}`,
  ]

  return linhas.join('\n')
}

export function isLeadNotificationConfigured(): boolean {
  return topicArn().length > 0
}

/**
 * Publica o aviso e devolve o `MessageId`.
 *
 * Não lança: o lead já está persistido quando esta função roda, e perder o
 * aviso não justifica devolver erro a quem preencheu o formulário. Quem chama
 * registra a falha para que ela apareça no CloudWatch.
 */
export async function publishContactNotification(
  input: ContactNotification
): Promise<string | undefined> {
  if (!isLeadNotificationConfigured()) {
    console.warn('[lead-notification] LEAD_NOTIFICATION_TOPIC_ARN não configurado')
    return undefined
  }

  const response = await sns().send(
    new PublishCommand({
      TopicArn: topicArn(),
      Subject: snsSubject(input.name, input.returning),
      Message: body(input),
    })
  )

  return response.MessageId
}
