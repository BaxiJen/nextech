import { NextRequest, NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'
import { requireSession } from '@/lib/auth/requireSession'

export interface Campanha {
  campaign_id: string
  type: string
  subject?: string
  status?: string
  started_at?: string
  finished_at?: string
  subscribers?: number
  sent?: number
  skipped?: number
  failed?: number
  error?: string
  posts?: Array<{ title: string; url: string }>
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: tables.campaigns,
        IndexName: 'type-index',
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':type': 'newsletter_digest' },
        ScanIndexForward: false,
        Limit: 50,
      })
    )

    return NextResponse.json((result.Items ?? []) as Campanha[], {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Erro ao listar campanhas:', error)
    return NextResponse.json({ error: 'Erro ao listar campanhas' }, { status: 500 })
  }
}
