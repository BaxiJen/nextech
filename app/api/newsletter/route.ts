import { NextRequest, NextResponse } from 'next/server'
import {
  confirmNewsletterSubscription,
  unsubscribeNewsletterSubscription,
  upsertNewsletterSubscriber,
} from '@/lib/dynamodbService'
import { sendNewsletterConfirmation } from '@/lib/email/newsletter'
import { clientIp, rateLimit } from '@/lib/ai/rateLimit'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baxijen.com.br'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function blogRedirect(parameter: string, status: 'missing' | 'error' | 'true') {
  const redirectUrl = new URL('/blog', SITE_URL)
  redirectUrl.searchParams.set(parameter, status)
  redirectUrl.hash = 'newsletter'
  return NextResponse.redirect(redirectUrl)
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`newsletter:${clientIp(req)}`, 5, 15 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : undefined

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const subscriber = await upsertNewsletterSubscriber(email, name)
    if (subscriber.confirmed) {
      return NextResponse.json({
        message: 'Email já confirmado',
        success: true,
        already_subscribed: true,
      })
    }

    try {
      const messageId = await sendNewsletterConfirmation({
        email: subscriber.email,
        name: subscriber.name,
        token: subscriber.confirmToken,
      })
      console.info('[newsletter] confirmation sent', { messageId })
    } catch (error) {
      console.error('Newsletter confirmation email error:', error)
      return NextResponse.json(
        {
          error:
            'Sua inscrição foi salva, mas não conseguimos enviar o email de confirmação. Tente novamente em instantes.',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      message: 'Confira seu email para confirmar a inscrição',
      success: true,
      confirmation_required: true,
    })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Erro ao inscrever' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim()
  const action = req.nextUrl.searchParams.get('action')

  if (!token) {
    return blogRedirect(action === 'unsubscribe' ? 'unsubscribed' : 'confirmed', 'missing')
  }

  if (action === 'unsubscribe') {
    try {
      const unsubscribed = await unsubscribeNewsletterSubscription(token)
      return blogRedirect('unsubscribed', unsubscribed ? 'true' : 'error')
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error)
      return blogRedirect('unsubscribed', 'error')
    }
  }

  try {
    const confirmed = await confirmNewsletterSubscription(token)
    return blogRedirect('confirmed', confirmed ? 'true' : 'error')
  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    return blogRedirect('confirmed', 'error')
  }
}
