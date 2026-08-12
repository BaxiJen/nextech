import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'

const SES_REGION = process.env.SES_REGION || 'sa-east-1'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baxijen.com.br'
const FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL || 'BaXiJen Newsletter <newsletter@baxi.ia.br>'

const ses = new SESv2Client({ region: SES_REGION })

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendNewsletterConfirmation(input: {
  email: string
  name?: string | null
  token: string
}): Promise<string | undefined> {
  const confirmationUrl = new URL('/api/newsletter', SITE_URL)
  confirmationUrl.searchParams.set('token', input.token)

  const greeting = input.name?.trim() ? `Olá, ${input.name.trim()}!` : 'Olá!'
  const safeGreeting = escapeHtml(greeting)
  const safeUrl = escapeHtml(confirmationUrl.toString())

  const response = await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [input.email] },
      ReplyToAddresses: ['contato@baxi.ia.br'],
      Content: {
        Simple: {
          Subject: { Data: 'Confirme sua inscrição na Newsletter BaXiJen', Charset: 'UTF-8' },
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: `${greeting}\n\nConfirme sua inscrição para receber os novos posts da BaXiJen em um único resumo semanal:\n${confirmationUrl}\n\nSe você não solicitou esta inscrição, ignore esta mensagem.`,
            },
            Html: {
              Charset: 'UTF-8',
              Data: `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f6f3ed;color:#202020;font-family:Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px">
      <div style="background:#fff;border:1px solid #e6dfd4;border-radius:16px;padding:32px">
        <p style="margin:0 0 16px">${safeGreeting}</p>
        <h1 style="font-size:24px;margin:0 0 16px">Confirme sua inscrição</h1>
        <p style="line-height:1.6;margin:0 0 24px">Receba os novos posts sobre IA soberana, agentes autônomos e produto em um único resumo semanal. Se não houver publicação nova, não enviamos nada.</p>
        <p style="margin:0 0 24px">
          <a href="${safeUrl}" style="display:inline-block;background:#8c5a2b;color:#fff;text-decoration:none;border-radius:8px;padding:12px 20px;font-weight:600">Confirmar inscrição</a>
        </p>
        <p style="font-size:13px;color:#666;line-height:1.5;margin:0">Se você não solicitou esta inscrição, ignore esta mensagem.</p>
      </div>
    </div>
  </body>
</html>`,
            },
          },
        },
      },
    })
  )

  return response.MessageId
}
