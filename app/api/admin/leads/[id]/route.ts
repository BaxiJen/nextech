import { NextResponse, NextRequest } from 'next/server'
import {
  deleteLeadById,
  LeadNotFoundError,
  updateLeadById,
} from '@/lib/dynamodbService'
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
  try {
    const { id } = await context.params
    const body = (await req.json()) as { status?: unknown }

    if (typeof body.status !== 'string' || !VALID_STATUSES.includes(body.status as Lead['status'])) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    return NextResponse.json(
      await updateLeadById(id, { status: body.status as Lead['status'] })
    )
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const deleted = await deleteLeadById(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return NextResponse.json({ error: 'Erro ao deletar lead' }, { status: 500 })
  }
}
