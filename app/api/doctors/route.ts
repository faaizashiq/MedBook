import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/doctors — List all completed doctors for public directory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specialty = searchParams.get('specialty')
    const query = searchParams.get('query')

    let dbQuery = supabase
      .from('doctor_profiles')
      .select('*')
      .eq('is_completed', true)

    if (specialty && specialty !== 'All') {
      dbQuery = dbQuery.ilike('specialty', `%${specialty}%`)
    }

    const { data: docRows, error } = await dbQuery

    if (error) {
      console.error('Supabase list completed doctors error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const userIds = (docRows || []).map((d: any) => d.user_id)
    const userProfilesMap: Record<string, any> = {}
    const reviewsMap: Record<string, { total: number; sum: number }> = {}

    if (userIds.length > 0) {
      // Parallel fetch user profiles & review statistics
      const [profilesRes, reviewsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds),
        supabase
          .from('reviews')
          .select('doctor_id, rating')
          .in('doctor_id', userIds),
      ])

      if (profilesRes.data) {
        for (const p of profilesRes.data) {
          userProfilesMap[p.id] = p
        }
      }

      if (reviewsRes.data) {
        for (const r of reviewsRes.data) {
          if (!reviewsMap[r.doctor_id]) {
            reviewsMap[r.doctor_id] = { total: 0, sum: 0 }
          }
          reviewsMap[r.doctor_id].total += 1
          reviewsMap[r.doctor_id].sum += Number(r.rating) || 5
        }
      }
    }

    let doctors = (docRows || []).map((doc: any) => {
      const p = userProfilesMap[doc.user_id]
      const avatar = p?.avatar_url || undefined
      const revStats = reviewsMap[doc.user_id]
      const reviewCount = revStats?.total || 0
      const rating = reviewCount > 0 ? Number((revStats.sum / reviewCount).toFixed(1)) : 5.0

      return {
        id: doc.user_id,
        name: p?.full_name || 'Dr. Specialist',
        email: p?.email,
        avatar: avatar,
        avatarUrl: avatar,
        specialty: doc.specialty || 'General Practitioner',
        biography: doc.biography || '',
        location: doc.clinic_address || 'MedBook Clinic Center',
        price: Number(doc.consultation_fee) || 120,
        experience: Number(doc.years_experience) || 5,
        rating: rating,
        reviewCount: reviewCount,
        available: true,
        nextSlot: 'Today, 10:00 AM',
        verified: true,
        availabilityGrid: doc.availability_grid || {},
      }
    })

    // Filter by text search query (name, specialty, location)
    if (query) {
      const q = query.toLowerCase()
      doctors = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      )
    }

    return NextResponse.json(
      { doctors },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    )
  } catch (err: any) {
    console.error('GET /api/doctors error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
