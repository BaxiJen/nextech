import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, readSession } from '@/lib/auth/session'
import { hasAuthSecret } from '@/lib/auth/secret'

/** Única página do painel que não exige sessão — é onde ela nasce. */
const LOGIN_PATH = '/admin/login'

function semCache(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store')
  return response
}

function indisponivel(): NextResponse {
  console.error('ADMIN_AUTH_SECRET não configurado')
  return semCache(new NextResponse('Painel administrativo indisponível', { status: 503 }))
}

/**
 * Protege dados pessoais e operações destrutivas do painel. Falha fechado: se
 * o segredo não estiver configurado, nenhuma rota admin fica pública.
 *
 * A sessão é lida do DynamoDB a cada requisição, não decodificada de um token
 * assinado. Custa uma leitura e paga por si: apagar a linha da tabela corta o
 * acesso na hora, coisa que um JWT só faria quando expirasse.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  if (pathname === LOGIN_PATH) return NextResponse.next()

  if (!hasAuthSecret()) return indisponivel()

  let session = null
  try {
    session = await readSession(request.cookies.get(SESSION_COOKIE)?.value)
  } catch (error) {
    // Falha de infraestrutura não pode virar porta aberta.
    console.error('[auth] falha ao ler a sessão', error)
    return semCache(
      isApi
        ? NextResponse.json({ error: 'Erro ao validar a sessão' }, { status: 503 })
        : new NextResponse('Painel administrativo indisponível', { status: 503 })
    )
  }

  if (session) return NextResponse.next()

  // A API responde 401 para o fetch tratar; a página manda a pessoa para o
  // login, guardando para onde ela queria ir.
  if (isApi) {
    return semCache(NextResponse.json({ error: 'Sessão expirada ou ausente' }, { status: 401 }))
  }

  const login = new URL(LOGIN_PATH, request.url)
  login.searchParams.set('next', pathname + request.nextUrl.search)
  return semCache(NextResponse.redirect(login))
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
