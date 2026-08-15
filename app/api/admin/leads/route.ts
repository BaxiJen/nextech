import { NextRequest, NextResponse } from 'next/server'
import { listLeads } from '@/lib/dynamodbService'
import { requireSession } from '@/lib/auth/requireSession'

// GET - Listar todos os leads, ordenados do mais recente para o mais antigo.
export async function GET(req: NextRequest) {
  const auth = await requireSession(req)
  if ('response' in auth) return auth.response

  try {
    return NextResponse.json(await listLeads(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Erro ao listar leads:', error)
    return NextResponse.json({ error: 'Erro ao listar leads' }, { status: 500 })
  }
}
