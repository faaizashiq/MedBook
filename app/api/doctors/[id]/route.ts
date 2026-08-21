import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/doctors/[id] — Fetch single doctor profile and schedule
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id
    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required.' }, { status: 400 })
    }

    // 1. Fetch doctor clinical profile
    const { data: docData } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', doctorId)
      .maybeSingle()

    // 2. Fetch user profile (name, avatar, email) directly
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', doctorId)
      .maybeSingle()

    if (!docData && !profData) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 })
    }

    const doctor = {
      id: doctorId,
      name: profData?.full_name || 'Dr. Specialist',
      email: profData?.email,
      avatar: profData?.avatar_url || undefined,
      avatarUrl: profData?.avatar_url || undefined,
      specialty: docData?.specialty || 'General Care',
      biography:
        docData?.biography ||
        'Board-certified medical specialist dedicated to providing empathetic, evidence-based care.',
      clinicAddress: docData?.clinic_address || 'MedBook Medical Center',
      consultationFee: Number(docData?.consultation_fee) || 150,
      yearsExperience: Number(docData?.years_experience) || 8,
      availabilityGrid: docData?.availability_grid || {},
      isCompleted: docData?.is_completed ?? true,
    }

    return NextResponse.json(
      { doctor },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    )
  } catch (err: any) {
    console.error('GET /api/doctors/[id] error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
