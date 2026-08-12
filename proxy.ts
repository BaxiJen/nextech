import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

function safeEqual(received: string, expected: string): boolean {
  const left = Buffer.from(received)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function unauthorized(message = 'Autenticação necessária') {
  return new NextResponse(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="BaXiJen Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * Protege dados pessoais e operações destrutivas do painel. Falha fechado: se
 * as credenciais não estiverem configuradas, nenhuma rota admin fica pública.
 */
export function proxy(request: NextRequest) {
  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    console.error('ADMIN_USERNAME/ADMIN_PASSWORD não configurados')
    return new NextResponse('Painel administrativo indisponível', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Basic ')) return unauthorized()

  try {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
    const separator = decoded.indexOf(':')
    if (separator < 0) return unauthorized()

    const username = decoded.slice(0, separator)
    const password = decoded.slice(separator + 1)
    if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
      return unauthorized('Credenciais inválidas')
    }
  } catch {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
