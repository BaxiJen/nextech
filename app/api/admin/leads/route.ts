import { NextResponse } from 'next/server'
import { listLeads } from '@/lib/dynamodbService'

// GET - Listar todos os leads, ordenados do mais recente para o mais antigo.
export async function GET() {
  try {
    return NextResponse.json(await listLeads())
  } catch (error) {
    console.error('Erro ao listar leads:', error)
    return NextResponse.json({ error: 'Erro ao listar leads' }, { status: 500 })
  }
}
