import { NextRequest, NextResponse } from 'next/server'
import { listRecentAudit } from '@/lib/admin/audit'
import { requireSession } from '@/lib/auth/requireSession'

/** Atividade recente do painel, para a visão geral. */
export async function GET(req: NextRequest) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    return NextResponse.json(await listRecentAudit('lead', 25))
  } catch (error) {
    console.error('Erro ao listar atividade:', error)
    return NextResponse.json({ error: 'Erro ao listar atividade' }, { status: 500 })
  }
}
