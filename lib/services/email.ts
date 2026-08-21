import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

//==============================================
// TRANSPORTER SETUP
//==============================================

const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
const emailPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER
const emailPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS

export const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
})

// Verify connection on server initialization during active runtime (skipped during static build)
if (
  typeof window === 'undefined' &&
  emailUser &&
  emailPass &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  transporter.verify((error) => {
    if (error) {
      console.warn('[SMTP] Connection warning:', error.message)
    } else {
      console.log('[SMTP] Mail server is ready to send notifications')
    }
  })
}

//==============================================
// HTML TO PLAIN-TEXT CONVERTER (Anti-Spam)
//==============================================

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s+\n/g, '\n\n')
    .trim()
}

//==============================================
// TEMPLATE LOADING & RENDERING
//==============================================

export function renderTemplate(
  templateName: string,
  variables: Record<string, string | undefined>
): string {
  const cleanName = templateName.replace(/\.html$/, '')
  const templatePath = path.join(
    process.cwd(),
    'app',
    'Email',
    'templates',
    `${cleanName}.html`
  )

  if (!fs.existsSync(templatePath)) {
    console.error(`[Email] Template not found at: ${templatePath}`)
    throw new Error(`Email template "${cleanName}" not found.`)
  }

  let html = fs.readFileSync(templatePath, 'utf8')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const mergedVariables: Record<string, string> = {
    current_year: new Date().getFullYear().toString(),
    dashboard_url: `${appUrl}/patient`,
    browse_doctors_url: `${appUrl}/doctors`,
    ...Object.fromEntries(
      Object.entries(variables).filter(([_, v]) => v !== undefined) as [string, string][]
    ),
  }

  // Replace {{variable}} placeholders with actual values
  for (const [key, value] of Object.entries(mergedVariables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, value)
  }

  // Replace any leftover unreplaced placeholders
  html = html.replace(/{{[a-zA-Z][a-zA-Z0-9_]*}}/g, '')
  return html
}

//==============================================
// EMAIL SENDING FUNCTION (Anti-Spam Configured)
//==============================================

export interface SendEmailOptions {
  to: string
  subject: string
  templateName: string
  variables: Record<string, string | undefined>
  from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, templateName, variables, from } = options

  if (!to) {
    console.warn(`[Email] Skipping email "${subject}" — missing recipient email.`)
    return false
  }

  try {
    const html = renderTemplate(templateName, variables)
    const text = htmlToPlainText(html)

    const fromName = process.env.EMAIL_FROM_NAME || 'MedBook'
    const fromEmail = process.env.EMAIL_FROM || emailUser || 'medbook.application@gmail.com'
    const fromAddress = from || `"${fromName}" <${fromEmail}>`

    const info = await transporter.sendMail({
      from: fromAddress,
      replyTo: fromEmail,
      to,
      subject,
      text, // Plain text alternative avoids MIME_HTML_ONLY spam penalty
      html,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'MedBook Notification Engine',
        'X-Entity-Ref-ID': `medbook-${Date.now()}`,
      },
    })

    console.log(
      `[Email Sent] ✅ To: ${to} | Subject: "${subject}" | Template: ${templateName} | MsgId: ${info.messageId}`
    )
    return true
  } catch (error: any) {
    console.error(
      `[Email Failed] ❌ To: ${to} | Template: ${templateName} | Error:`,
      error?.message || error
    )
    return false
  }
}

export async function sendEmailBatch(emails: SendEmailOptions[]): Promise<void> {
  await Promise.all(emails.map((e) => sendEmail(e)))
}