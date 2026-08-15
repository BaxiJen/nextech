import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, readSession, type AdminSession } from '@/lib/auth/session'
import { hasAuthSecret } from '@/lib/auth/secret'

/**
 * O `proxy.ts` já barra quem não tem sessão. As rotas validam de novo, por
 * conta própria, porque depender só do matcher significa que uma rota admin
 * criada fora dele nasceria pública sem ninguém perceber. Custa uma leitura.
 */
export async function requireSession(
  request: NextRequest
): Promise<{ session: AdminSession } | { response: NextResponse }> {
  if (!hasAuthSecret()) {
    console.error('ADMIN_AUTH_SECRET não configurado — rota administrativa recusada')
    return {
      response: NextResponse.json(
        { error: 'Painel administrativo indisponível' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      ),
    }
  }

  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value)
  if (!session) {
    return {
      response: NextResponse.json(
        { error: 'Sessão expirada ou ausente' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      ),
    }
  }

  return { session }
}
