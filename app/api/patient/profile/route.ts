import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database/supabase'
import { verifyJWT } from '@/lib/auth/jwt'

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

    return NextResponse.json({
      message: 'Profile updated successfully.',
      profile: data,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
