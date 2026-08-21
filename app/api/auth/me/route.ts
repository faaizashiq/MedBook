import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/db'
import { verifyJWT } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or malformed Authorization header.' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyJWT(token)

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 401 }
      )
    }

    const user = await db.findUserById(payload.sub)
    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: 'User account not found or deactivated.' },
        { status: 401 }
      )
    }

    let isDoctorSetupCompleted = true
    if (user.role === 'DOCTOR') {
      const docProfile = await db.findDoctorProfile(user.id)
      isDoctorSetupCompleted = docProfile?.is_completed || false
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
      is_doctor_setup_completed: isDoctorSetupCompleted,
    })
  } catch (error: any) {
    console.error('Session verify error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error verifying session.' },
      { status: 500 }
    )
  }
}
