import { Resend } from 'resend'

type SendEmailArgs = {
  to: string | string[]
  subject: string
  html: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string | string[]
}

let client: Resend | null = null

function getClient(): Resend | null {
  if (client) return client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  client = new Resend(apiKey)
  return client
}

export async function sendEmail(args: SendEmailArgs) {
  const resend = getClient()
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[email] RESEND_API_KEY not set; skipping send:', args.subject)
    }
    return { skipped: true }
  }

  const from = args.from || process.env.EMAIL_FROM || 'NepQue <no-reply@nepque.app>'

  return resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    cc: args.cc,
    bcc: args.bcc,
    replyTo: args.replyTo,
  })
}

// Shared HTML layout for branded emails
export function emailLayout({ title, preview, contentHtml }: { title: string; preview?: string; contentHtml: string }) {
  const brand = {
    name: 'NepQue',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://nepque.com',
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/logo-email.png`,
    color: '#111827',
    muted: '#6B7280',
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    link: '#2563EB'
  }

  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    ${preview ? `<meta name="x-preview-text" content="${preview}" />` : ''}
    <style>
      @media (prefers-color-scheme: dark) {
        .card { background:#0B1220!important; border-color:#1F2937!important; }
        .text { color:#E5E7EB!important; }
        .muted { color:#9CA3AF!important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${brand.bg}">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table class="card" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:${brand.cardBg};border:1px solid ${brand.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 0 24px;">
                <a href="${brand.url}" style="text-decoration:none;color:${brand.color};display:inline-flex;align-items:center;gap:10px;">
                  <img src="${brand.logo}" alt="${brand.name}" width="32" height="32" style="border-radius:8px;display:block" />
                  <strong style="font-size:18px;line-height:28px;font-family:system-ui,-apple-system,Segoe UI,Roboto">${brand.name}</strong>
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 0 24px;">
                <h1 class="text" style="margin:0 0 8px 0;font-size:22px;line-height:32px;font-weight:700;font-family:system-ui,-apple-system,Segoe UI,Roboto;color:${brand.color}">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 24px 24px;">
                <div class="text" style="font-family:system-ui,-apple-system,Segoe UI,Roboto;font-size:16px;line-height:24px;color:${brand.color}">
                  ${contentHtml}
                </div>
                <div class="muted" style="margin-top:28px;font-size:12px;line-height:18px;color:${brand.muted};font-family:system-ui,-apple-system,Segoe UI,Roboto">
                  You’re receiving this email because you have an account on ${brand.name}.
                </div>
              </td>
            </tr>
          </table>
          <div class="muted" style="margin-top:16px;font-size:12px;line-height:18px;color:${brand.muted};font-family:system-ui,-apple-system,Segoe UI,Roboto">
            © ${new Date().getFullYear()} ${brand.name}
          </div>
        </td>
      </tr>
    </table>
  </body>
 </html>`
}

export function welcomeEmailHtml(name?: string) {
  const title = 'Welcome to NepQue 🎉'
  const contentHtml = `
    <p>Hi ${name ? name.split(' ')[0] : 'there'},</p>
    <p>Your account has been created successfully. We’re excited to have you.</p>
    <p style="margin:18px 0 26px 0">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/" style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;display:inline-block">Start exploring coupons →</a>
    </p>
    <p class="muted" style="color:#6B7280">— The NepQue Team</p>
  `
  return emailLayout({ title, contentHtml, preview: 'Welcome to NepQue' })
}

export function favoriteAddedEmailHtml(brandName: string, baseUrl: string) {
  const title = 'Saved to favorites ✅'
  const contentHtml = `
    <p>You added <strong>${brandName}</strong> to your favorites.</p>
    <p style="margin:18px 0 26px 0">
      <a href="${(baseUrl || '').replace(/\/$/, '')}/favorites" style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;display:inline-block">View favorites →</a>
    </p>
    <p class="muted" style="color:#6B7280">— The NepQue Team</p>
  `
  return emailLayout({ title, contentHtml, preview: 'Added to your favorites' })
}

export function passwordResetEmailHtml(link: string) {
  const title = 'Reset your NepQue password'
  const contentHtml = `
    <p>We received a request to reset your password.</p>
    <p>If you made this request, click the button below to set a new password. This link expires in 60 minutes.</p>
    <p style="margin:18px 0 26px 0">
      <a href="${link}" style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;display:inline-block">Reset password →</a>
    </p>
    <p>If you didn’t request this, you can safely ignore this email.</p>
    <p class="muted" style="color:#6B7280">— The NepQue Team</p>
  `
  return emailLayout({ title, contentHtml, preview: 'Password reset request' })
}


