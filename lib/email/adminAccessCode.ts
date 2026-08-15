import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { displayName } from '@/lib/auth/allowlist'

const SES_REGION = process.env.SES_REGION || 'sa-east-1'
const ses = new SESv2Client({ region: SES_REGION })

/**
 * Lido por chamada, não no topo do módulo: no runtime SSR o import pode
 * acontecer antes de as variáveis valerem.
 */
function fromEmail(): string {
  return process.env.ADMIN_FROM_EMAIL || 'BaXiJen <contato@baxi.ia.br>'
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendAdminAccessCode(input: {
  email: string
  code: string
  minutes: number
}): Promise<string | undefined> {
  const nome = displayName(input.email)
  const texto = [
    `Olá, ${nome}!`,
    '',
    `Seu código de acesso ao painel BaXiJen é ${input.code}.`,
    '',
    `Ele vale por ${input.minutes} minutos, serve uma vez só e aceita no máximo 5 tentativas.`,
    'Digite na tela que pediu o código — não é preciso clicar em link nenhum.',
    '',
    'Se não foi você que pediu, ignore esta mensagem. O código sozinho não abre nada:',
    'quem entra precisa também ter pedido a partir deste endereço.',
  ].join('\n')

  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#0b0b0f;padding:32px 16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#e8e8ee">
  <div style="max-width:520px;margin:0 auto;background:#14141b;border:1px solid #26263a;border-radius:16px;padding:32px">
    <p style="margin:0 0 24px;font-size:16px">Olá, ${escapeHtml(nome)}!</p>
    <p style="margin:0 0 12px;font-size:14px;color:#a5a5be">Seu código de acesso ao painel:</p>
    <p style="margin:0 0 24px;font-size:38px;font-weight:700;letter-spacing:10px;color:#fff;font-family:ui-monospace,'SFMono-Regular',Menlo,monospace">${escapeHtml(input.code)}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#a5a5be">Vale por ${input.minutes} minutos, serve uma vez só e aceita no máximo 5 tentativas.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#a5a5be">Digite na tela que pediu o código — não há link para clicar.</p>
    <p style="margin:0;font-size:12px;color:#6f6f88">Se não foi você que pediu, ignore esta mensagem.</p>
  </div>
</body></html>`

  const response = await ses.send(
    new SendEmailCommand({
      FromEmailAddress: fromEmail(),
      Destination: { ToAddresses: [input.email] },
      ReplyToAddresses: ['contato@baxi.ia.br'],
      Content: {
        Simple: {
          Subject: { Data: `${input.code} — seu código de acesso ao painel BaXiJen`, Charset: 'UTF-8' },
          Body: {
            Text: { Charset: 'UTF-8', Data: texto },
            Html: { Charset: 'UTF-8', Data: html },
          },
        },
      },
    })
  )

  return response.MessageId
}
