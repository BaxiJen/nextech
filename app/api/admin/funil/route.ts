import { NextRequest, NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'
import { FUNNEL_STEPS, STEP_LABELS, type FunnelStep } from '@/lib/funnel/steps'
import { requireSession } from '@/lib/auth/requireSession'

/** Conta sessões que alcançaram a etapa, paginando — `Count` é por página. */
async function contarSessoes(step: FunnelStep, desde: string): Promise<number> {
  let total = 0
  let startKey: Record<string, unknown> | undefined

  do {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: tables.funnelEvents,
        IndexName: 'step-index',
        KeyConditionExpression: '#step = :step AND occurred_at >= :desde',
        ExpressionAttributeNames: { '#step': 'step' },
        ExpressionAttributeValues: { ':step': step, ':desde': desde },
        Select: 'COUNT',
        ExclusiveStartKey: startKey,
      })
    )
    total += result.Count ?? 0
    startKey = result.LastEvaluatedKey
  } while (startKey)

  return total
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    const dias = Math.min(365, Math.max(1, Number.parseInt(req.nextUrl.searchParams.get('dias') || '30', 10) || 30))
    const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()

    const contagens = await Promise.all(FUNNEL_STEPS.map(step => contarSessoes(step, desde)))
    const base = contagens[0] || 0

    const etapas = FUNNEL_STEPS.map((step, i) => {
      const sessoes = contagens[i]
      const anterior = i === 0 ? sessoes : contagens[i - 1]
      return {
        step,
        label: STEP_LABELS[step],
        sessoes,
        // Percentual sobre quem iniciou conversa, e perda em relação à etapa
        // imediatamente anterior — é a segunda que aponta onde consertar.
        percentualDoTopo: base ? Math.round((sessoes / base) * 100) : 0,
        perdaNaEtapa: anterior - sessoes,
        percentualPerdido: anterior ? Math.round(((anterior - sessoes) / anterior) * 100) : 0,
      }
    })

    // A maior queda entre duas etapas consecutivas: o gargalo.
    const gargalo = etapas.slice(1).reduce(
      (pior, atual) => (atual.perdaNaEtapa > (pior?.perdaNaEtapa ?? -1) ? atual : pior),
      null as (typeof etapas)[number] | null
    )

    return NextResponse.json({
      dias,
      desde,
      etapas,
      gargalo: gargalo && gargalo.perdaNaEtapa > 0 ? gargalo : null,
      geradoEm: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao montar o funil:', error)
    return NextResponse.json({ error: 'Erro ao montar o funil' }, { status: 500 })
  }
}
