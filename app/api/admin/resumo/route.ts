import { NextRequest, NextResponse } from 'next/server'
import { countNewsletterSubscribers, listLeads } from '@/lib/dynamodbService'
import { requireSession } from '@/lib/auth/requireSession'
import type { Lead } from '@/lib/types'

const STATUSES: Lead['status'][] = ['new', 'contacted', 'qualified', 'converted', 'lost']

function desde(dias: number): number {
  return Date.now() - dias * 24 * 60 * 60 * 1000
}

/** Números da visão geral. Tudo vem do que já é gravado hoje. */
export async function GET(req: NextRequest) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    const [leads, newsletter] = await Promise.all([
      listLeads(),
      countNewsletterSubscribers().catch(error => {
        // A contagem é secundária: um erro aqui não pode derrubar o painel.
        console.error('Erro ao contar inscritos da newsletter:', error)
        return null
      }),
    ])

    const porStatus = Object.fromEntries(STATUSES.map(status => [status, 0])) as Record<
      Lead['status'],
      number
    >

    let ultimos7 = 0
    let ultimos30 = 0
    let somaScore = 0

    for (const lead of leads) {
      if (lead.status in porStatus) porStatus[lead.status] += 1
      const criado = new Date(lead.created_at).getTime()
      if (criado >= desde(7)) ultimos7 += 1
      if (criado >= desde(30)) ultimos30 += 1
      somaScore += Number(lead.score) || 0
    }

    return NextResponse.json({
      leads: {
        total: leads.length,
        porStatus,
        ultimos7,
        ultimos30,
        scoreMedio: leads.length ? Math.round(somaScore / leads.length) : 0,
      },
      newsletter,
      geradoEm: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao montar o resumo:', error)
    return NextResponse.json({ error: 'Erro ao montar o resumo' }, { status: 500 })
  }
}
