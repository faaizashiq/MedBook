import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/db'
import { otpStore } from '@/lib/auth/otpStore'
import { hashPassword } from '@/lib/auth/password'
import { signJWT } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, otp_code, otp_token, password, full_name, role } = body

    const cleanEmail = email?.toLowerCase().trim()
    const cleanOtp = otp_code?.trim()

    if (!cleanEmail || !cleanOtp) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    const assignedRole = (role?.toUpperCase() || 'PATIENT') as 'PATIENT' | 'DOCTOR'

    // 1. Verify 6-digit OTP code with stateless token fallback
    const verification = await otpStore.verifyOtp(cleanEmail, cleanOtp, otp_token)
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired verification code.' },
        { status: 400 }
      )
    }

    // 2. Check if user already exists
    const existingUser = await db.findUserByEmail(cleanEmail)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      )
    }

    // 3. Hash password and create the verified user profile in Supabase
    const passwordHash = await hashPassword(password)
    const user = await db.createUser({
      email: cleanEmail,
      password_hash: passwordHash,
      full_name: full_name?.trim() || 'User',
      role: assignedRole,
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      )
    }

    // 4. Determine post-signup routing
    const isDoctor = assignedRole === 'DOCTOR'
    const redirectUrl = isDoctor ? '/doctor/setup' : '/patient'

    // 5. Generate signed JWT token
    const token = signJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    })

    const response = NextResponse.json({
      message: 'Account verified and created successfully.',
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
      is_doctor_setup_completed: !isDoctor,
      redirect_url: redirectUrl,
    })

    // 6. Set Cookies for Edge Middleware & SSR
    response.cookies.set('medbook_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    response.cookies.set('medbook_role', user.role.toLowerCase(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Verify OTP API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to verify code. Please try again.' },
      { status: 500 }
    )
  }
}
