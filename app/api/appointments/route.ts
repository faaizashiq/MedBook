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

// Helper: Format date/time for emails with timezone support
function formatDateTime(isoString: string, timeZone?: string) {
  try {
    const date = new Date(isoString)
    const tz = timeZone || 'Asia/Karachi'
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: tz }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz }),
    }
  } catch {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    }
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

    // Hybrid Approach: Auto-complete confirmed appointments ONLY after the 30-minute consultation window has passed
    const nowIso = new Date().toISOString()
    const thirtyMinsAgoIso = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    try {
      if (isDoctor) {
        await supabase
          .from('appointments')
          .update({ status: 'COMPLETED', updated_at: nowIso })
          .eq('doctor_id', userId)
          .eq('status', 'CONFIRMED')
          .lte('scheduled_at', thirtyMinsAgoIso)
      } else {
        await supabase
          .from('appointments')
          .update({ status: 'COMPLETED', updated_at: nowIso })
          .eq('patient_id', userId)
          .eq('status', 'CONFIRMED')
          .lte('scheduled_at', thirtyMinsAgoIso)
      }
    } catch (autoErr) {
      console.warn('Auto-complete check warning:', autoErr)
    }

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
    const { doctor_id, scheduled_at, type = 'Video Consultation', location, timeZone } = body

    if (!doctor_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'Doctor ID and scheduled date/time are required.' },
        { status: 400 }
      )
    }

    // 1. Restriction: A doctor cannot book an appointment with themselves, nor book as a doctor
    if (user.role === 'DOCTOR' || user.sub === doctor_id) {
      return NextResponse.json(
        {
          error:
            user.sub === doctor_id
              ? 'You cannot book an appointment with yourself.'
              : 'Doctor accounts cannot book appointments. Please use a patient account to book consultations.',
        },
        { status: 400 }
      )
    }

    // 2. Restriction: A patient cannot book 2 appointments at the same date & time
    const { data: patientConflicts } = await supabase
      .from('appointments')
      .select('id, scheduled_at, status')
      .eq('patient_id', user.sub)
      .eq('scheduled_at', scheduled_at)
      .not('status', 'in', '("CANCELLED","DECLINED")')
      .limit(1)

    if (patientConflicts && patientConflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'You already have another active consultation booked at this exact time. Please choose a different time slot.',
        },
        { status: 400 }
      )
    }

    // 3. Restriction: Check if the doctor is already booked for this slot
    const { data: doctorConflicts } = await supabase
      .from('appointments')
      .select('id, scheduled_at, status')
      .eq('doctor_id', doctor_id)
      .eq('scheduled_at', scheduled_at)
      .not('status', 'in', '("CANCELLED","DECLINED")')
      .limit(1)

    if (doctorConflicts && doctorConflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'This doctor already has an appointment booked for this time slot. Please select another slot.',
        },
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

    // Fetch live doctor and patient profile from database for accurate current names
    const [{ data: doctorProfile }, { data: patientProfile }] = await Promise.all([
      supabase
        .from('profiles')
        .select('email, full_name, doctor_profiles(clinic_address)')
        .eq('id', doctor_id)
        .single(),
      supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.sub)
        .single(),
    ])

    const patientName = patientProfile?.full_name || user.fullName || 'Patient'
    const patientEmail = patientProfile?.email || user.email
    const doctorName = doctorProfile?.full_name || 'Doctor'
    const doctorEmail = doctorProfile?.email || ''

    // Send booking emails (non-blocking) with accurate timezone
    const formatted = formatDateTime(scheduled_at, timeZone)
    sendAppointmentBooked({
      patient: { email: patientEmail, name: patientName },
      doctor: { email: doctorEmail, name: doctorName },
      appointment: {
        date: formatted.date,
        time: formatted.time,
        doctorName: doctorName,
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
