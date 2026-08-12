import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const region = process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'sa-east-1'
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'baxijen-prod'
const localEndpoint = process.env.DYNAMODB_ENDPOINT

const clientConfig: DynamoDBClientConfig = {
  region,
  ...(localEndpoint
    ? {
        endpoint: localEndpoint,
        // DynamoDB Local aceita qualquer valor; em produção o SDK usa as
        // credenciais temporárias da Amplify SSR Compute role.
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
      }
    : {}),
}

const lowLevelClient = new DynamoDBClient(clientConfig)

export const dynamodb = DynamoDBDocumentClient.from(lowLevelClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
})

export const DYNAMODB_REGION = region

export const tables = {
  leads: `${tablePrefix}-leads`,
  chatHistory: `${tablePrefix}-chat-history`,
  interactions: `${tablePrefix}-interactions`,
  newsletter: `${tablePrefix}-newsletter`,
} as const
