import { randomUUID } from 'node:crypto'
import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'
import type { ChatHistory, Lead } from '@/lib/types'

const CHAT_RETENTION_DAYS = Math.max(
  1,
  Number.parseInt(process.env.CHAT_RETENTION_DAYS || '180', 10) || 180
)

const LEAD_MUTABLE_FIELDS = [
  'name',
  'objective',
  'source',
  'score',
  'status',
  'phone',
  'company',
  'notes',
] as const satisfies ReadonlyArray<keyof Lead>

type LeadMutation = Partial<Pick<Lead, (typeof LEAD_MUTABLE_FIELDS)[number]>>
type DynamoItem = Record<string, unknown>

export class LeadNotFoundError extends Error {
  constructor(id: string) {
    super(`Lead não encontrado: ${id}`)
    this.name = 'LeadNotFoundError'
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function withoutInternalFields<T>(item: DynamoItem, internalFields: string[]): T {
  const copy = { ...item }
  for (const field of internalFields) delete copy[field]
  return copy as T
}

function toLead(item: DynamoItem): Lead {
  return withoutInternalFields<Lead>(item, ['entity'])
}

function toChatHistory(item: DynamoItem): ChatHistory {
  return withoutInternalFields<ChatHistory>(item, ['message_key', 'expires_at'])
}

async function queryAll(input: QueryCommandInput): Promise<DynamoItem[]> {
  const items: DynamoItem[] = []
  let exclusiveStartKey: QueryCommandInput['ExclusiveStartKey']

  do {
    const page: QueryCommandOutput = await dynamodb.send(
      new QueryCommand({ ...input, ExclusiveStartKey: exclusiveStartKey })
    )
    if (page.Items) items.push(...(page.Items as DynamoItem[]))
    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return items
}

/** Salva uma mensagem. O TTL remove transcrições antigas automaticamente. */
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  leadId?: string
): Promise<ChatHistory | null> {
  try {
    const createdAt = new Date().toISOString()
    const id = randomUUID()
    const item: DynamoItem = {
      session_id: sessionId,
      message_key: `${createdAt}#${id}`,
      id,
      lead_id: leadId,
      role,
      content,
      created_at: createdAt,
      expires_at: Math.floor(Date.now() / 1000) + CHAT_RETENTION_DAYS * 86_400,
    }

    await dynamodb.send(new PutCommand({ TableName: tables.chatHistory, Item: item }))
    return toChatHistory(item)
  } catch (error) {
    console.error('Erro ao salvar mensagem no DynamoDB:', error)
    return null
  }
}

/**
 * Cria ou atualiza um lead usando o email normalizado como chave primária.
 * UpdateItem + if_not_exists torna o ID e created_at atômicos mesmo se duas
 * capturas do mesmo email ocorrerem simultaneamente.
 *
 * `data` sobrescreve sempre. `initialOnly` grava apenas quando o campo ainda
 * não existe, via if_not_exists — é o que impede uma nova captura de rebaixar
 * um lead já trabalhado. Um visitante que conversou no chat até `qualified`
 * com score 75 e depois preenche o formulário de contato precisa continuar
 * `qualified`, e não voltar para `new` com score 0.
 *
 * Um campo presente nos dois objetos é tratado como sobrescrita: `data` vence.
 */
export async function upsertLead(
  email: string,
  data: LeadMutation,
  initialOnly: LeadMutation = {}
): Promise<Lead | null> {
  try {
    const normalizedEmail = normalizeEmail(email)
    const now = new Date().toISOString()
    const names: Record<string, string> = {
      '#id': 'id',
      '#entity': 'entity',
      '#created_at': 'created_at',
      '#updated_at': 'updated_at',
    }
    const values: Record<string, unknown> = {
      ':id': randomUUID(),
      ':entity': 'LEAD',
      ':created_at': now,
      ':updated_at': now,
    }
    const setters = [
      '#id = if_not_exists(#id, :id)',
      '#entity = :entity',
      '#created_at = if_not_exists(#created_at, :created_at)',
      '#updated_at = :updated_at',
    ]

    for (const field of LEAD_MUTABLE_FIELDS) {
      const value = data[field]
      if (value === undefined) continue
      names[`#${field}`] = field
      values[`:${field}`] = value
      setters.push(`#${field} = :${field}`)
    }

    for (const field of LEAD_MUTABLE_FIELDS) {
      if (data[field] !== undefined) continue
      const value = initialOnly[field]
      if (value === undefined) continue
      names[`#${field}`] = field
      values[`:${field}`] = value
      setters.push(`#${field} = if_not_exists(#${field}, :${field})`)
    }

    const result = await dynamodb.send(
      new UpdateCommand({
        TableName: tables.leads,
        Key: { email: normalizedEmail },
        UpdateExpression: `SET ${setters.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      })
    )

    return result.Attributes ? toLead(result.Attributes as DynamoItem) : null
  } catch (error) {
    console.error('Erro ao fazer upsert de lead no DynamoDB:', error)
    return null
  }
}

/**
 * Promove um lead de `new` para `qualified`.
 *
 * A condição existe para proteger decisão humana: `contacted`, `converted` e
 * `lost` são definidos a mão no painel e não podem ser revertidos porque o
 * visitante voltou a conversar. Condição reprovada não é erro — significa que
 * o lead já está num estado mais avançado, e o retorno `false` diz isso.
 */
export async function promoteLeadToQualified(email: string): Promise<boolean> {
  try {
    await dynamodb.send(
      new UpdateCommand({
        TableName: tables.leads,
        Key: { email: normalizeEmail(email) },
        UpdateExpression: 'SET #status = :qualified, #updated_at = :now',
        ConditionExpression: '#status = :new',
        ExpressionAttributeNames: { '#status': 'status', '#updated_at': 'updated_at' },
        ExpressionAttributeValues: {
          ':qualified': 'qualified',
          ':new': 'new',
          ':now': new Date().toISOString(),
        },
      })
    )
    return true
  } catch (error) {
    if ((error as { name?: string })?.name === 'ConditionalCheckFailedException') return false
    console.error('Erro ao promover lead no DynamoDB:', error)
    return false
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.leads,
      IndexName: 'id-index',
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: { '#id': 'id' },
      ExpressionAttributeValues: { ':id': id },
      Limit: 1,
    })
  )

  const item = result.Items?.[0] as DynamoItem | undefined
  return item ? toLead(item) : null
}

export async function listLeads(): Promise<Lead[]> {
  const items = await queryAll({
    TableName: tables.leads,
    IndexName: 'created-at-index',
    KeyConditionExpression: '#entity = :entity',
    ExpressionAttributeNames: { '#entity': 'entity' },
    ExpressionAttributeValues: { ':entity': 'LEAD' },
    ScanIndexForward: false,
  })

  return items.map(toLead)
}

export async function updateLeadById(id: string, data: LeadMutation): Promise<Lead> {
  const existing = await getLeadById(id)
  if (!existing) throw new LeadNotFoundError(id)

  const names: Record<string, string> = { '#updated_at': 'updated_at' }
  const values: Record<string, unknown> = { ':updated_at': new Date().toISOString() }
  const setters = ['#updated_at = :updated_at']

  for (const field of LEAD_MUTABLE_FIELDS) {
    const value = data[field]
    if (value === undefined) continue
    names[`#${field}`] = field
    values[`:${field}`] = value
    setters.push(`#${field} = :${field}`)
  }

  const result = await dynamodb.send(
    new UpdateCommand({
      TableName: tables.leads,
      Key: { email: existing.email },
      UpdateExpression: `SET ${setters.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(email)',
      ReturnValues: 'ALL_NEW',
    })
  )

  if (!result.Attributes) throw new LeadNotFoundError(id)
  return toLead(result.Attributes as DynamoItem)
}

async function batchDelete(requests: Array<{ table: string; key: DynamoItem }>): Promise<void> {
  for (let offset = 0; offset < requests.length; offset += 25) {
    const chunk = requests.slice(offset, offset + 25)
    let pending: NonNullable<BatchWriteCommandInput['RequestItems']> = {}

    for (const request of chunk) {
      pending[request.table] ||= []
      pending[request.table].push({ DeleteRequest: { Key: request.key } })
    }

    for (let attempt = 0; Object.keys(pending).length > 0 && attempt < 5; attempt += 1) {
      const result = await dynamodb.send(new BatchWriteCommand({ RequestItems: pending }))
      pending = result.UnprocessedItems || {}
      if (Object.keys(pending).length > 0) {
        await new Promise(resolve => setTimeout(resolve, 50 * 2 ** attempt))
      }
    }

    if (Object.keys(pending).length > 0) {
      throw new Error('DynamoDB não processou todas as exclusões após 5 tentativas')
    }
  }
}

/** Exclui o lead e os registros vinculados (chat e interações). */
export async function deleteLeadById(id: string): Promise<boolean> {
  const existing = await getLeadById(id)
  if (!existing) return false

  const [chatItems, interactions] = await Promise.all([
    queryAll({
      TableName: tables.chatHistory,
      IndexName: 'lead-id-index',
      KeyConditionExpression: '#lead_id = :lead_id',
      ExpressionAttributeNames: { '#lead_id': 'lead_id' },
      ExpressionAttributeValues: { ':lead_id': id },
      ProjectionExpression: 'session_id, message_key',
    }),
    queryAll({
      TableName: tables.interactions,
      KeyConditionExpression: '#lead_id = :lead_id',
      ExpressionAttributeNames: { '#lead_id': 'lead_id' },
      ExpressionAttributeValues: { ':lead_id': id },
      ProjectionExpression: 'lead_id, interaction_key',
    }),
  ])

  await batchDelete([
    ...chatItems.map(item => ({
      table: tables.chatHistory,
      key: { session_id: item.session_id, message_key: item.message_key },
    })),
    ...interactions.map(item => ({
      table: tables.interactions,
      key: { lead_id: item.lead_id, interaction_key: item.interaction_key },
    })),
  ])

  await dynamodb.send(
    new DeleteCommand({ TableName: tables.leads, Key: { email: existing.email } })
  )
  return true
}

/** Vincula todas as mensagens ainda não vinculadas de uma sessão ao lead. */
export async function linkChatSessionToLead(sessionId: string, leadId: string): Promise<void> {
  const messages = await queryAll({
    TableName: tables.chatHistory,
    KeyConditionExpression: '#session_id = :session_id',
    ExpressionAttributeNames: { '#session_id': 'session_id' },
    ExpressionAttributeValues: { ':session_id': sessionId },
    ProjectionExpression: 'session_id, message_key, lead_id',
  })

  const unlinked = messages.filter(message => !message.lead_id)
  await Promise.all(
    unlinked.map(message =>
      dynamodb.send(
        new UpdateCommand({
          TableName: tables.chatHistory,
          Key: { session_id: message.session_id, message_key: message.message_key },
          UpdateExpression: 'SET #lead_id = :lead_id',
          ExpressionAttributeNames: { '#lead_id': 'lead_id' },
          ExpressionAttributeValues: { ':lead_id': leadId },
        })
      )
    )
  )
}

/** Calcula score de qualificação baseado em interações. */
export function calculateLeadScore(
  messageCount: number,
  hasObjective: boolean,
  hasPhone: boolean,
  sessionDurationMinutes: number
): number {
  let score = Math.min(messageCount * 5, 40)
  if (hasObjective) score += 20
  if (hasPhone) score += 15
  score += Math.min((sessionDurationMinutes / 10) * 25, 25)
  return Math.min(score, 100)
}

export async function logInteraction(
  leadId: string,
  type: 'message' | 'page_view' | 'form_submit' | 'button_click',
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const createdAt = new Date().toISOString()
    const id = randomUUID()
    await dynamodb.send(
      new PutCommand({
        TableName: tables.interactions,
        Item: {
          lead_id: leadId,
          interaction_key: `${createdAt}#${id}`,
          id,
          type,
          metadata,
          created_at: createdAt,
        },
      })
    )
    return true
  } catch (error) {
    console.error('Erro ao registrar interação no DynamoDB:', error)
    return false
  }
}

export interface NewsletterSubscriberState {
  email: string
  name: string | null
  confirmToken: string
  confirmed: boolean
}

export async function upsertNewsletterSubscriber(
  email: string,
  name?: string
): Promise<NewsletterSubscriberState> {
  const normalizedEmail = normalizeEmail(email)
  const now = new Date().toISOString()

  const result = await dynamodb.send(
    new UpdateCommand({
      TableName: tables.newsletter,
      Key: { email: normalizedEmail },
      UpdateExpression:
        'SET #id = if_not_exists(#id, :id), #name = :name, #source = :source, ' +
        '#confirmed = if_not_exists(#confirmed, :confirmed), ' +
        '#confirm_token = if_not_exists(#confirm_token, :confirm_token), ' +
        '#unsub_token = if_not_exists(#unsub_token, :unsub_token), ' +
        '#created_at = if_not_exists(#created_at, :created_at)',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#name': 'name',
        '#source': 'source',
        '#confirmed': 'confirmed',
        '#confirm_token': 'confirm_token',
        '#unsub_token': 'unsub_token',
        '#created_at': 'created_at',
      },
      ExpressionAttributeValues: {
        ':id': randomUUID(),
        ':name': name?.trim() || null,
        ':source': 'blog',
        ':confirmed': false,
        ':confirm_token': randomUUID(),
        ':unsub_token': randomUUID(),
        ':created_at': now,
      },
      ReturnValues: 'ALL_NEW',
    })
  )

  const subscriber = result.Attributes
  if (!subscriber?.confirm_token) {
    throw new Error('DynamoDB não retornou o token de confirmação da newsletter')
  }

  return {
    email: normalizedEmail,
    name: typeof subscriber.name === 'string' ? subscriber.name : null,
    confirmToken: String(subscriber.confirm_token),
    confirmed: subscriber.confirmed === true,
  }
}

export async function confirmNewsletterSubscription(token: string): Promise<boolean> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.newsletter,
      IndexName: 'confirm-token-index',
      KeyConditionExpression: '#confirm_token = :confirm_token',
      ExpressionAttributeNames: { '#confirm_token': 'confirm_token' },
      ExpressionAttributeValues: { ':confirm_token': token },
      Limit: 1,
    })
  )

  const subscriber = result.Items?.[0]
  if (!subscriber?.email) return false

  await dynamodb.send(
    new UpdateCommand({
      TableName: tables.newsletter,
      Key: { email: subscriber.email },
      UpdateExpression:
        'SET #confirmed = :confirmed, #confirmed_at = :confirmed_at REMOVE #unsubscribed_at',
      ExpressionAttributeNames: {
        '#confirmed': 'confirmed',
        '#confirmed_at': 'confirmed_at',
        '#unsubscribed_at': 'unsubscribed_at',
      },
      ExpressionAttributeValues: {
        ':confirmed': true,
        ':confirmed_at': new Date().toISOString(),
      },
    })
  )
  return true
}

export async function unsubscribeNewsletterSubscription(token: string): Promise<boolean> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.newsletter,
      IndexName: 'unsub-token-index',
      KeyConditionExpression: '#unsub_token = :unsub_token',
      ExpressionAttributeNames: { '#unsub_token': 'unsub_token' },
      ExpressionAttributeValues: { ':unsub_token': token },
      Limit: 1,
    })
  )

  const subscriber = result.Items?.[0]
  if (!subscriber?.email) return false

  await dynamodb.send(
    new UpdateCommand({
      TableName: tables.newsletter,
      Key: { email: subscriber.email },
      UpdateExpression:
        'SET #confirmed = :confirmed, #unsubscribed_at = :unsubscribed_at, ' +
        '#confirm_token = :confirm_token REMOVE #confirmed_at',
      ExpressionAttributeNames: {
        '#confirmed': 'confirmed',
        '#unsubscribed_at': 'unsubscribed_at',
        '#confirm_token': 'confirm_token',
        '#confirmed_at': 'confirmed_at',
      },
      ExpressionAttributeValues: {
        ':confirmed': false,
        ':unsubscribed_at': new Date().toISOString(),
        ':confirm_token': randomUUID(),
      },
    })
  )
  return true
}

/** Used by health checks and local smoke tests. */
export async function getLeadByEmail(email: string): Promise<Lead | null> {
  const result = await dynamodb.send(
    new GetCommand({ TableName: tables.leads, Key: { email: normalizeEmail(email) } })
  )
  return result.Item ? toLead(result.Item as DynamoItem) : null
}
