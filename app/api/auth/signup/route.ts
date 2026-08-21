import { NextRequest, NextResponse } from 'next/server'
import { db, UserRole } from '@/lib/database/db'
import { hashPassword } from '@/lib/auth/password'
import { signJWT } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, full_name, role } = body

    // 1. Validation
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'All fields (email, password, full_name, role) are required.' },
        { status: 400 }
      )
    }

    const formattedRole = role.toUpperCase() as UserRole
    if (formattedRole !== 'PATIENT' && formattedRole !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Role must be either PATIENT or DOCTOR.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    // 2. Check if user already exists with specific role conflict messages
    const cleanEmail = email.toLowerCase().trim()
    const existing = await db.findUserByEmail(cleanEmail)
    if (existing) {
      if (existing.role === 'PATIENT' && formattedRole === 'DOCTOR') {
        return NextResponse.json(
          {
            error:
              'This email is already registered as a Patient. Please log in to your patient account or use a different email address to register as a Doctor.',
          },
          { status: 409 }
        )
      }

      if (existing.role === 'DOCTOR' && formattedRole === 'PATIENT') {
        return NextResponse.json(
          {
            error:
              'This email is already registered as a Doctor. Please log in to your doctor account or use a different email address to register as a Patient.',
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          error: `An account with this email already exists as a ${formattedRole.toLowerCase()}. Please log in instead.`,
        },
        { status: 409 }
      )
    }

    // 3. Hash password & create user in Supabase / DB
    const password_hash = await hashPassword(password)
    const newUser = await db.createUser({
      email: cleanEmail,
      password_hash,
      full_name,
      role: formattedRole,
    })

    // 4. Generate JWT Token
    const token = signJWT({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.full_name,
    })

    // 5. Determine redirection
    const redirectUrl = formattedRole === 'PATIENT' ? '/patient' : '/doctor/setup'

    const response = NextResponse.json(
      {
        message: 'Account created successfully.',
        access_token: token,
        token_type: 'bearer',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role,
        },
        redirect_url: redirectUrl,
        is_doctor_setup_completed: false,
      },
      { status: 201 }
    )

    // 6. Set Auth Cookies for middleware and SSR
    response.cookies.set('medbook_token', token, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    response.cookies.set('medbook_role', formattedRole.toLowerCase(), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error during signup.' },
      { status: 500 }
    )
  }
}
