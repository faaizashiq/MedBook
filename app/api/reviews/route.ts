import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'
import { verifyJWT } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    token = req.cookies.get('medbook_token')?.value || null
  }

  if (!token) return null
  return verifyJWT(token)
}

// POST /api/reviews — Patient submits a review on a completed visit
export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req)
    if (!user || !user.sub) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await req.json()
    const { appointment_id, doctor_id, rating, comment } = body

    if (!doctor_id || !rating) {
      return NextResponse.json(
        { error: 'Doctor ID and rating (1-5 stars) are required.' },
        { status: 400 }
      )
    }

    const numRating = Number(rating)
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        appointment_id: appointment_id || null,
        patient_id: user.sub,
        doctor_id,
        rating: numRating,
        comment: comment || null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to insert review in Supabase:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Review submitted successfully.', review: data },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('POST /api/reviews error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}

// GET /api/reviews?doctor_id=... — Fetch reviews for a specific doctor
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctor_id')

    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        patient:patient_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reviews: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
