import { NextResponse, NextRequest } from 'next/server'
import {
  deleteLeadById,
  getLeadById,
  LeadNotFoundError,
  updateLeadById,
} from '@/lib/dynamodbService'
import { recordAuditEvent } from '@/lib/admin/audit'
import { requireSession } from '@/lib/auth/requireSession'
import type { Lead } from '@/lib/types'

const VALID_STATUSES: Lead['status'][] = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
]

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await context.params
    const body = (await req.json()) as { status?: unknown }

    if (typeof body.status !== 'string' || !VALID_STATUSES.includes(body.status as Lead['status'])) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const anterior = await getLeadById(id)
    if (!anterior) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

    const lead = await updateLeadById(id, { status: body.status as Lead['status'] })

    if (anterior.status !== lead.status) {
      // A mudança já aconteceu no banco. Se a auditoria falhar, o log do
      // CloudWatch guarda o suficiente para reconstruir a linha — mentir sobre
      // a atualização seria pior do que ficar com um registro fora da trilha.
      await recordAuditEvent({
        entityType: 'lead',
        entityId: id,
        actor: auth.session,
        action: 'lead.status',
        field: 'status',
        before: anterior.status,
        after: lead.status,
        label: lead.name || lead.email,
      }).catch(error =>
        console.error('[audit] falha ao registrar mudança de status', {
          leadId: id,
          actor: auth.session.email,
          before: anterior.status,
          after: lead.status,
          error,
        })
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await context.params

    // Lido antes: depois da exclusão não há mais de quem falar na trilha.
    const anterior = await getLeadById(id)

    const deleted = await deleteLeadById(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    await recordAuditEvent({
      entityType: 'lead',
      entityId: id,
      actor: auth.session,
      action: 'lead.delete',
      before: anterior ? `${anterior.name || 'sem nome'} <${anterior.email}>` : undefined,
      label: anterior?.name || anterior?.email || id,
    }).catch(error =>
      console.error('[audit] falha ao registrar exclusão', {
        leadId: id,
        actor: auth.session.email,
        error,
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return NextResponse.json({ error: 'Erro ao deletar lead' }, { status: 500 })
  }
}
