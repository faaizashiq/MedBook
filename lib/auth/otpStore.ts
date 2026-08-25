import { supabaseAdmin as supabase } from '@/lib/database/supabase'

interface OtpRecord {
  otp: string
  expiresAt: number
  attempts: number
  meta?: any
}

// Global in-memory cache for ultra-fast validation & fallback
const globalOtpStore = new Map<string, OtpRecord>()

export const otpStore = {
  /**
   * Save 6-digit OTP with a 10-minute expiration window
   */
  async saveOtp(email: string, otp: string, meta?: any): Promise<void> {
    const cleanEmail = email.toLowerCase().trim()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // 1. In-memory store
    globalOtpStore.set(cleanEmail, {
      otp: otp.trim(),
      expiresAt,
      attempts: 0,
      meta,
    })

    // 2. Persist to Supabase if table exists
    try {
      await supabase.from('email_verifications').delete().eq('email', cleanEmail)
      await supabase.from('email_verifications').insert({
        email: cleanEmail,
        otp_code: otp.trim(),
        expires_at: new Date(expiresAt).toISOString(),
        attempts: 0,
      })
    } catch {
      // Graceful fallback to in-memory store if table is pending migration
    }
  },

  /**
   * Validate user input OTP
   */
  async verifyOtp(email: string, inputOtp: string): Promise<{ valid: boolean; error?: string }> {
    const cleanEmail = email.toLowerCase().trim()
    const cleanCode = inputOtp.trim()
    const now = Date.now()

    // 1. Check in-memory store first
    let record = globalOtpStore.get(cleanEmail)

    // 2. If not found in memory, check Supabase
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
        error: 'No verification code found. Please request a new code.',
      }
    }

    // Check expiry (10 minutes)
    if (now > record.expiresAt) {
      globalOtpStore.delete(cleanEmail)
      try {
        await supabase.from('email_verifications').delete().eq('email', cleanEmail)
      } catch {}
      return {
        valid: false,
        error: 'Verification code has expired. Please request a new one.',
      }
    }

    // Check brute-force attempts limit
    if (record.attempts >= 5) {
      globalOtpStore.delete(cleanEmail)
      try {
        await supabase.from('email_verifications').delete().eq('email', cleanEmail)
      } catch {}
      return {
        valid: false,
        error: 'Too many incorrect attempts. Please request a new code.',
      }
    }

    // Verify OTP match
    if (record.otp !== cleanCode) {
      record.attempts += 1
      globalOtpStore.set(cleanEmail, record)
      try {
        await supabase
          .from('email_verifications')
          .update({ attempts: record.attempts })
          .eq('email', cleanEmail)
      } catch {}
      return {
        valid: false,
        error: `Invalid verification code. ${5 - record.attempts} attempt(s) remaining.`,
      }
    }

    // Code matches! Clear from store
    globalOtpStore.delete(cleanEmail)
    try {
      await supabase.from('email_verifications').delete().eq('email', cleanEmail)
    } catch {}

    return { valid: true }
  },
}
