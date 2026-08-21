import { sendEmail } from './email'

// ============================================================
// TYPES
// ============================================================

export interface PasswordResetEmailData {
  email: string
  name: string
  resetUrl: string
  expiryHours: number
}
// ============================================================
// PASSWORD RESET EMAIL
// ============================================================

/**
 * Sends password reset email using reset_password.html template
 * Call this from /api/auth/forgot-password route
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const { email, name, resetUrl, expiryHours } = data

  await sendEmail({
    to: email,
    subject: 'Reset Your MedBook Password',
    templateName: 'reset_password',
    variables: {
      recipient_name: name,
      reset_password_url: resetUrl,
      reset_link_expiry: `${expiryHours} hours`,
      current_year: new Date().getFullYear().toString(),
    },
  })
}

/**
 * Optional: Welcome email after successful signup
 */
export interface WelcomeEmailData {
  email: string
  name: string
  role: 'PATIENT' | 'DOCTOR'
  dashboardUrl: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const { email, name, role, dashboardUrl } = data

  // You can create a welcome.html template or reuse existing
  await sendEmail({
    to: email,
    subject: `Welcome to MedBook, ${name}!`,
    templateName: 'welcome', // Create this template if needed
    variables: {
      recipient_name: name,
      dashboard_url: dashboardUrl,
      role: role.toLowerCase(),
      current_year: new Date().getFullYear().toString(),
    },
  })
}