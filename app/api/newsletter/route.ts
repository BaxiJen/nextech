import { NextRequest, NextResponse } from 'next/server'
import {
  confirmNewsletterSubscription,
  upsertNewsletterSubscriber,
} from '@/lib/dynamodbService'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = body

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    await upsertNewsletterSubscriber(
      email,
      typeof name === 'string' ? name : undefined
    )

    // TODO: Send confirmation email via Resend/SendGrid when configured.
    return NextResponse.json({ message: 'Inscrito com sucesso', success: true })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Erro ao inscrever' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/blog?confirmed=missing', req.url))
  }

  try {
    const confirmed = await confirmNewsletterSubscription(token)
    return NextResponse.redirect(
      new URL(confirmed ? '/blog?confirmed=true' : '/blog?confirmed=error', req.url)
    )
  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    return NextResponse.redirect(new URL('/blog?confirmed=error', req.url))
  }
}
