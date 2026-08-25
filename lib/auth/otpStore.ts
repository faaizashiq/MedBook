import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'medbook-super-secret-jwt-key-2026'

interface OtpRecord {
  otp: string
  expiresAt: number
  attempts: number
  meta?: any
}

// In-memory store for single-instance / dev
const globalOtpStore = new Map<string, OtpRecord>()

export const otpStore = {
  /**
   * Generates a signed, stateless, cryptographic OTP token valid for 10 minutes.
   * This is 100% resilient across multiple Vercel Serverless instances.
   */
  createStatelessOtpToken(email: string, otpCode: string): string {
    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = otpCode.trim()
    const hash = crypto
      .createHash('sha256')
      .update(`${cleanEmail}:${cleanOtp}:${JWT_SECRET}`)
      .digest('hex')

    return jwt.sign(
      {
        email: cleanEmail,
        hash,
        type: 'email_otp_verification',
      },
      JWT_SECRET,
      { expiresIn: '10m' }
    )
  },

  /**
   * Saves OTP in memory and Supabase if available
   */
  async saveOtp(email: string, otp: string, meta?: any): Promise<string> {
    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = otp.trim()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // 1. In-memory
    globalOtpStore.set(cleanEmail, {
      otp: cleanOtp,
      expiresAt,
      attempts: 0,
      meta,
    })

    // 2. Supabase if table exists
    try {
      await supabase.from('email_verifications').delete().eq('email', cleanEmail)
      await supabase.from('email_verifications').insert({
        email: cleanEmail,
        otp_code: cleanOtp,
        expires_at: new Date(expiresAt).toISOString(),
        attempts: 0,
      })
    } catch {}

    // 3. Return cryptographic token for serverless resilience
    return this.createStatelessOtpToken(cleanEmail, cleanOtp)
  },

  /**
   * Validates user input OTP using cryptographic token (primary) and memory/Supabase (fallback)
   */
  async verifyOtp(
    email: string,
    inputOtp: string,
    otpToken?: string
  ): Promise<{ valid: boolean; error?: string }> {
    const cleanEmail = email.toLowerCase().trim()
    const cleanCode = inputOtp.trim()

    // ── Method 1: Cryptographic Stateless Verification (100% Serverless Reliable) ──
    if (otpToken) {
      try {
        const decoded = jwt.verify(otpToken, JWT_SECRET) as any

        if (decoded.email !== cleanEmail || decoded.type !== 'email_otp_verification') {
          return { valid: false, error: 'Invalid verification session. Please request a new code.' }
        }

        const expectedHash = crypto
          .createHash('sha256')
          .update(`${cleanEmail}:${cleanCode}:${JWT_SECRET}`)
          .digest('hex')

        if (decoded.hash !== expectedHash) {
          return { valid: false, error: 'Incorrect verification code. Please check and try again.' }
        }

        // Token is valid and matches!
        globalOtpStore.delete(cleanEmail)
        try {
          await supabase.from('email_verifications').delete().eq('email', cleanEmail)
        } catch {}

        return { valid: true }
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          return { valid: false, error: 'Verification code has expired (10 mins). Please request a new code.' }
        }
        return { valid: false, error: 'Invalid or expired verification session.' }
      }
    }

    // ── Method 2: In-Memory / Supabase Fallback ──
    const now = Date.now()
    let record = globalOtpStore.get(cleanEmail)

    if (!record) {
      try {
        const { data } = await supabase
          .from('email_verifications')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (data) {
          record = {
            otp: data.otp_code,
            expiresAt: new Date(data.expires_at).getTime(),
            attempts: data.attempts || 0,
          }
        }
      } catch {}
    }

    if (!record) {
      return {
        valid: false,
        error: 'No verification code found for this email. Please request a new code.',
      }
    }

    if (now > record.expiresAt) {
      globalOtpStore.delete(cleanEmail)
      return {
        valid: false,
        error: 'Verification code has expired. Please request a new one.',
      }
    }

    if (record.otp !== cleanCode) {
      return {
        valid: false,
        error: 'Invalid verification code. Please try again.',
      }
    }

    globalOtpStore.delete(cleanEmail)
    try {
      await supabase.from('email_verifications').delete().eq('email', cleanEmail)
    } catch {}

    return { valid: true }
  },
}
