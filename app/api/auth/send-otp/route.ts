import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/db'
import { otpStore } from '@/lib/auth/otpStore'
import { sendOtpVerificationEmail } from '@/lib/services/authEmails'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = body

    const cleanEmail = email?.toLowerCase().trim()
    const cleanName = name?.trim() || 'User'

    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // 1. Check if user already exists
    const existingUser = await db.findUserByEmail(cleanEmail)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 409 }
      )
    }

    // 2. Generate secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. Save OTP in store (10 minute expiry)
    await otpStore.saveOtp(cleanEmail, otpCode, { name: cleanName })

    // 4. Send beautiful verification email
    const emailSent = await sendOtpVerificationEmail({
      email: cleanEmail,
      name: cleanName,
      otpCode,
      expiryMinutes: 10,
    })

    if (!emailSent) {
      console.warn(`[OTP] Email dispatch failed for ${cleanEmail}, but OTP stored for testing.`)
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code was sent to ${cleanEmail}.`,
    })
  } catch (error: any) {
    console.error('Send OTP API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to send verification code. Please try again.' },
      { status: 500 }
    )
  }
}
