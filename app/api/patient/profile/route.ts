import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database/supabase'
import { verifyJWT, signJWT } from '@/lib/auth/jwt'

function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    token = req.cookies.get('medbook_token')?.value || null
  }

  if (!token) return null
  return verifyJWT(token)
}

// GET /api/patient/profile — Get current patient profile
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req)
    if (!user || !user.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, created_at')
      .eq('id', user.sub)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}

// PATCH /api/patient/profile — Update patient profile (full name, avatar)
export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req)
    if (!user || !user.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, avatar_url } = body

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (full_name) updates.full_name = full_name.trim()
    if (avatar_url !== undefined) updates.avatar_url = avatar_url

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.sub)
      .select('id, full_name, email, role, avatar_url, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Re-issue a fresh JWT token with the newly updated name
    const freshToken = signJWT({
      sub: data.id,
      email: data.email,
      role: data.role,
      fullName: data.full_name,
    })

    const userObj = {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      avatarUrl: data.avatar_url,
      role: data.role,
    }

    const response = NextResponse.json({
      message: 'Profile updated successfully.',
      profile: data,
      access_token: freshToken,
      user: userObj,
    })

    // Set updated token cookie
    response.cookies.set('medbook_token', freshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
