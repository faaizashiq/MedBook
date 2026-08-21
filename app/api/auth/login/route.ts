import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/db'
import { comparePassword } from '@/lib/auth/password'
import { signJWT } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // 1. Find user in Supabase / DB
    const user = await db.findUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // 2. Verify password
    const isMatch = await comparePassword(password, user.password_hash)
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // 3. Check Doctor Profile Setup Status
    let isDoctorSetupCompleted = true
    let redirectUrl = user.role === 'PATIENT' ? '/patient' : '/doctor'

    if (user.role === 'DOCTOR') {
      const docProfile = await db.findDoctorProfile(user.id)
      isDoctorSetupCompleted = docProfile?.is_completed || false
      redirectUrl = isDoctorSetupCompleted ? '/doctor' : '/doctor/setup'
    }

    // 4. Generate JWT Token
    const token = signJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    })

    const response = NextResponse.json({
      message: 'Login successful.',
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
      is_doctor_setup_completed: isDoctorSetupCompleted,
      redirect_url: redirectUrl,
    })

    // 5. Set Auth Cookies for middleware and SSR
    response.cookies.set('medbook_token', token, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })
    response.cookies.set('medbook_role', user.role.toLowerCase(), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error during login.' },
      { status: 500 }
    )
  }
}
