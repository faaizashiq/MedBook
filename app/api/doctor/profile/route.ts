import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/db'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'
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

export async function GET(req: NextRequest) {
  try {
    const payload = getAuthenticatedUser(req)
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const profile = await db.findDoctorProfile(payload.sub)
    const user = await db.findUserById(payload.sub)

    return NextResponse.json({
      profile,
      user: user
        ? {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            avatarUrl: user.avatar_url,
            role: user.role,
          }
        : null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getAuthenticatedUser(req)
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const {
      full_name,
      avatar_url,
      specialty,
      biography,
      clinic_address,
      consultation_fee,
      years_experience,
      availability_grid,
    } = body

    // Update profiles table if name or avatar provided
    if (full_name !== undefined || avatar_url !== undefined) {
      const profileUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }
      if (full_name !== undefined) profileUpdates.full_name = full_name.trim()
      if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url

      const { error: profErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', payload.sub)

      if (profErr) {
        console.error('POST /api/doctor/profile update profiles error:', profErr.message)
      }
    }

    if (!specialty || !biography || !clinic_address || !consultation_fee) {
      return NextResponse.json(
        { error: 'Specialty, biography, clinic address, and fee are required.' },
        { status: 400 }
      )
    }

    const updated = await db.upsertDoctorProfile(payload.sub, {
      specialty,
      biography,
      clinic_address,
      consultation_fee: Number(consultation_fee),
      years_experience: Number(years_experience) || 0,
      availability_grid: availability_grid || {},
      is_completed: true,
    })

    const updatedUser = await db.findUserById(payload.sub)
    const freshToken = updatedUser
      ? signJWT({
          sub: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          fullName: updatedUser.full_name,
        })
      : null

    const response = NextResponse.json({
      message: 'Doctor profile completed successfully.',
      profile: updated,
      access_token: freshToken,
      user: updatedUser
        ? {
            id: updatedUser.id,
            fullName: updatedUser.full_name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatar_url,
            role: updatedUser.role,
          }
        : null,
    })

    if (freshToken) {
      response.cookies.set('medbook_token', freshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })
    }

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = getAuthenticatedUser(req)
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, avatar_url, specialty, biography, clinic_address, consultation_fee, years_experience, availability_grid } = body

    // 1. Update basic user profile (name, avatar) in `profiles` table
    const profileUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (full_name !== undefined) profileUpdates.full_name = full_name.trim()
    if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url

    if (Object.keys(profileUpdates).length > 1) {
      const { error: profErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', payload.sub)

      if (profErr) {
        console.error('PATCH /api/doctor/profile update profiles error:', profErr.message)
      }
    }

    // 2. Update doctor specific details in `doctor_profiles` table if provided
    const docUpdates: Record<string, any> = {}
    if (specialty !== undefined) docUpdates.specialty = specialty
    if (biography !== undefined) docUpdates.biography = biography
    if (clinic_address !== undefined) docUpdates.clinic_address = clinic_address
    if (consultation_fee !== undefined) docUpdates.consultation_fee = Number(consultation_fee)
    if (years_experience !== undefined) docUpdates.years_experience = Number(years_experience)
    if (availability_grid !== undefined) docUpdates.availability_grid = availability_grid

    let updatedDocProfile = null
    if (Object.keys(docUpdates).length > 0) {
      updatedDocProfile = await db.upsertDoctorProfile(payload.sub, docUpdates)
    } else {
      updatedDocProfile = await db.findDoctorProfile(payload.sub)
    }

    const updatedUser = await db.findUserById(payload.sub)
    const freshToken = updatedUser
      ? signJWT({
          sub: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          fullName: updatedUser.full_name,
        })
      : null

    const response = NextResponse.json({
      message: 'Doctor profile updated successfully.',
      profile: updatedDocProfile,
      access_token: freshToken,
      user: updatedUser
        ? {
            id: updatedUser.id,
            fullName: updatedUser.full_name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatar_url,
            role: updatedUser.role,
          }
        : null,
    })

    if (freshToken) {
      response.cookies.set('medbook_token', freshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })
    }

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
