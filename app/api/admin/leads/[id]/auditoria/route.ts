import { NextRequest, NextResponse } from 'next/server'
import { listAuditForEntity } from '@/lib/admin/audit'
import { requireSession } from '@/lib/auth/requireSession'

/** Histórico de um lead: quem mexeu, no quê, quando. */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await context.params
    return NextResponse.json(await listAuditForEntity('lead', id))
  } catch (error) {
    console.error('Erro ao listar auditoria do lead:', error)
    return NextResponse.json({ error: 'Erro ao listar auditoria' }, { status: 500 })
  }
}
