import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'
import { verifyJWT } from '@/lib/auth/jwt'
import { 
  sendAppointmentBooked,
  sendAppointmentConfirmed,
  sendAppointmentCancelled,
  sendAppointmentRescheduled 
} from '@/lib/services/appointmentEmails'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to extract and verify JWT from header or cookie
function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    token = req.cookies.get('medbook_token')?.value || null
  }

  if (!token) return null
  return verifyJWT(token)
}

// Helper: Format date/time for emails
function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  return {
    date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
}

// Helper: Fetch full appointment with patient & doctor details
async function fetchFullAppointment(appointmentId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patient_id (id, email, full_name),
      doctor:doctor_id (id, email, full_name, doctor_profiles (clinic_address))
    `)
    .eq('id', appointmentId)
    .single()
  
  if (error) throw error
  return data
}

// GET /api/appointments - Fetch appointments for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req)

    if (!user || !user.sub) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to view appointments.' },
        { status: 401 }
      )
    }

    const userId = user.sub
    const isDoctor = user.role === 'DOCTOR'

    let query = supabase.from('appointments').select(
      isDoctor
        ? `
            id,
            scheduled_at,
            status,
            type,
            location,
            cancellation_reason,
            patient:patient_id (
              id,
              full_name,
              email,
              avatar_url
            )
          `
        : `
            id,
            scheduled_at,
            status,
            type,
            location,
            cancellation_reason,
            doctor:doctor_id (
              id,
              full_name,
              avatar_url,
              doctor_profiles (
                specialty,
                clinic_address
              )
            )
          `
    )

    query = isDoctor
      ? query.eq('doctor_id', userId)
      : query.eq('patient_id', userId)

    const { data, error } = await query.order('scheduled_at', { ascending: true })

    if (error) {
      console.error('Supabase get appointments error:', error.message)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch appointments.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { appointments: data || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    )
  } catch (error: any) {
    console.error('Appointments GET error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Book a new appointment
export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req)

    if (!user || !user.sub) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to book an appointment.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { doctor_id, scheduled_at, type = 'Video Consultation', location } = body

    if (!doctor_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'Doctor ID and scheduled date/time are required.' },
        { status: 400 }
      )
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.sub,
        doctor_id,
        scheduled_at,
        type,
        location: location || null,
        status: 'PENDING',
      })
      .select(`
        id,
        scheduled_at,
        status,
        type,
        location,
        cancellation_reason,
        doctor:doctor_id (
          id,
          full_name,
          doctor_profiles (
            specialty,
            clinic_address
          )
        )
      `)
      .single()

    if (error) {
      console.error('Supabase book appointment error:', error.message)
      return NextResponse.json(
        { error: error.message || 'Failed to create appointment.' },
        { status: 500 }
      )
    }

    // Fetch doctor profile for email notification
    const { data: doctorProfile } = await supabase
      .from('profiles')
      .select('email, full_name, doctor_profiles(clinic_address)')
      .eq('id', doctor_id)
      .single()

    // Send booking emails (non-blocking)
    const formatted = formatDateTime(scheduled_at)
    sendAppointmentBooked({
      patient: { email: user.email, name: user.fullName },
      doctor: { email: doctorProfile?.email || '', name: doctorProfile?.full_name || '' },
      appointment: {
        date: formatted.date,
        time: formatted.time,
        doctorName: doctorProfile?.full_name || 'Doctor',
        clinicAddress: doctorProfile?.doctor_profiles?.[0]?.clinic_address || location || 'MedBook Medical Center',
        consultationType: type,
      }
    }).catch(err => console.error('Booking email failed:', err))

    return NextResponse.json(
      { message: 'Appointment booked successfully.', appointment },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Appointments POST error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}

// PATCH /api/appointments - Update appointment (reschedule, cancel, confirm)
export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req)

    if (!user || !user.sub) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { appointment_id, status, scheduled_at, cancellation_reason } = body

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'Appointment ID is required.' },
        { status: 400 }
      )
    }

    // Store old date/time for reschedule emails
    const oldAppointment = await fetchFullAppointment(appointment_id)
    const oldFormatted = oldAppointment ? formatDateTime(oldAppointment.scheduled_at) : null

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (status) updates.status = status
    if (scheduled_at) updates.scheduled_at = scheduled_at
    if (cancellation_reason !== undefined) updates.cancellation_reason = cancellation_reason

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointment_id)
      .select('*')
      .single()

    if (error) {
      console.error('Supabase update appointment error:', error.message)
      return NextResponse.json(
        { error: error.message || 'Failed to update appointment.' },
        { status: 500 }
      )
    }

    // Fetch full appointment with relations for emails
    const fullAppointment = await fetchFullAppointment(appointment_id)
    if (!fullAppointment) {
      return NextResponse.json({ error: 'Appointment not found after update' }, { status: 404 })
    }

    const patient = fullAppointment.patient
    const doctor = fullAppointment.doctor
    const clinicAddress = doctor?.doctor_profiles?.clinic_address || 'MedBook Clinic'
    const formatted = formatDateTime(fullAppointment.scheduled_at)

    // Send appropriate email based on status change
    try {
      switch (status) {
        case 'CONFIRMED':
          await sendAppointmentConfirmed({
            patient: { email: patient.email, name: patient.full_name },
            doctor: { email: doctor.email, name: doctor.full_name },
            appointment: { date: formatted.date, time: formatted.time, doctorName: doctor.full_name, clinicAddress }
          })
          break

        case 'CANCELLED':
          await sendAppointmentCancelled({
            patient: { email: patient.email, name: patient.full_name },
            doctor: { email: doctor.email, name: doctor.full_name },
            appointment: { 
              date: formatted.date, 
              time: formatted.time, 
              doctorName: doctor.full_name, 
              clinicAddress,
              cancelledBy: user.role === 'DOCTOR' ? 'Doctor' : 'Patient',
              cancellationReason: cancellation_reason
            }
          })
          break

        case 'RESCHEDULED':
          await sendAppointmentRescheduled({
            patient: { email: patient.email, name: patient.full_name },
            doctor: { email: doctor.email, name: doctor.full_name },
            appointment: {
              date: formatted.date,
              time: formatted.time,
              doctorName: doctor.full_name,
              clinicAddress,
              oldDate: oldFormatted?.date,
              oldTime: oldFormatted?.time,
              rescheduledBy: user.role === 'DOCTOR' ? 'Doctor' : 'Patient',
              rescheduleReason: cancellation_reason
            }
          })
          break
      }
    } catch (emailError) {
      console.error('Status change email failed:', emailError)
    }

    return NextResponse.json({
      message: 'Appointment updated successfully.',
      appointment: updated,
    })
  } catch (error: any) {
    console.error('Appointments PATCH error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}
