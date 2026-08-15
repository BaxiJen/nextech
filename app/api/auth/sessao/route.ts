import { NextRequest, NextResponse } from 'next/server'
import { findTeamMember } from '@/lib/auth/allowlist'
import { consumeCode } from '@/lib/auth/codes'
import { hasAuthSecret } from '@/lib/auth/secret'
import {
  SESSION_COOKIE,
  createSession,
  expiredSessionCookie,
  readSession,
  revokeSession,
  sessionCookie,
  touchSession,
} from '@/lib/auth/session'
import { recordAuditEvent } from '@/lib/admin/audit'

const SEM_CACHE = { 'Cache-Control': 'no-store' } as const

function indisponivel() {
  console.error('ADMIN_AUTH_SECRET não configurado — sessão recusada')
  return NextResponse.json(
    { error: 'Painel administrativo indisponível' },
    { status: 503, headers: SEM_CACHE }
  )
}

/** Troca email + código por uma sessão. */
export async function POST(request: NextRequest) {
  if (!hasAuthSecret()) return indisponivel()

  let body: { email?: unknown; code?: unknown }
  try {
    body = (await request.json()) as { email?: unknown; code?: unknown }
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const { email, code } = body
  if (typeof email !== 'string' || typeof code !== 'string') {
    return NextResponse.json({ error: 'Informe o email e o código' }, { status: 400 })
  }

  // Uma resposta só para código errado, expirado, queimado ou de quem não está
  // na lista: cada mensagem distinta seria informação de graça.
  const recusa = NextResponse.json(
    { error: 'Código inválido ou expirado' },
    { status: 401, headers: SEM_CACHE }
  )

  const member = findTeamMember(email)
  if (!member) return recusa

  const digits = code.replace(/\D/g, '')
  if (digits.length !== 6) return recusa

  let aceito: boolean
  try {
    aceito = await consumeCode(member.email, digits)
  } catch (error) {
    console.error('[auth] falha ao verificar código', error)
    return NextResponse.json({ error: 'Erro ao verificar o código' }, { status: 500, headers: SEM_CACHE })
  }

  if (!aceito) return recusa

  try {
    const session = await createSession(member.email, {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for'),
    })

    const response = NextResponse.json(
      { email: member.email, name: member.name, expiresAt: session.expiresAt },
      { headers: SEM_CACHE }
    )
    response.cookies.set(sessionCookie(session.token, session.maxAge))

    await recordAuditEvent({
      entityType: 'session',
      entityId: member.email,
      actor: member,
      action: 'session.start',
      label: member.name,
    }).catch(error => console.error('[auth] falha ao registrar entrada na auditoria', error))

    return response
  } catch (error) {
    console.error('[auth] falha ao criar sessão', error)
    return NextResponse.json({ error: 'Erro ao criar a sessão' }, { status: 500, headers: SEM_CACHE })
  }
}

/** Quem está logado. A tela do painel usa para o cabeçalho. */
export async function GET(request: NextRequest) {
  if (!hasAuthSecret()) return indisponivel()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = await readSession(token)

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: SEM_CACHE })
  }

  await touchSession(token as string)

  return NextResponse.json(
    { authenticated: true, email: session.email, name: session.name, expiresAt: session.expiresAt },
    { headers: SEM_CACHE }
  )
}

/** Sair: apaga o registro, então o cookie roubado também morre. */
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (token && hasAuthSecret()) {
    const session = await readSession(token).catch(() => null)
    await revokeSession(token).catch(error => console.error('[auth] falha ao revogar sessão', error))

    if (session) {
      await recordAuditEvent({
        entityType: 'session',
        entityId: session.email,
        actor: { email: session.email, name: session.name },
        action: 'session.end',
        label: session.name,
      }).catch(error => console.error('[auth] falha ao registrar saída na auditoria', error))
    }
  }

  const response = NextResponse.json({ ok: true }, { headers: SEM_CACHE })
  response.cookies.set(expiredSessionCookie())
  return response
}
