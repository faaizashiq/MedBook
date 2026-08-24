import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'
import { verifyJWT } from '@/lib/auth/jwt'
import {
  sendAppointmentConfirmed,
  sendAppointmentCancelled,
  sendAppointmentDeclined,
  sendAppointmentRescheduled,
} from '@/lib/services/appointmentEmails'

function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    token = req.cookies.get('medbook_token')?.value || null
  }

  if (!token) return null
  return verifyJWT(token)
}

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

// PATCH /api/appointments/[id] — Update status (cancel, reschedule, confirm, complete)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(req)
    if (!user || !user.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const appointmentId = params.id
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointment ID.' }, { status: 400 })
    }

    // 1. Fetch current appointment before updating
    const { data: currentAppt, error: fetchErr } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        type,
        location,
        cancellation_reason,
        patient:patient_id (
          id,
          full_name,
          email
        ),
        doctor:doctor_id (
          id,
          full_name,
          email,
          doctor_profiles (
            specialty,
            clinic_address
          )
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (fetchErr || !currentAppt) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
    }

    const body = await req.json()
    const { action, status, scheduled_at, cancellation_reason } = body

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    const previousScheduledAt = currentAppt.scheduled_at
    const isDoctor = user.role === 'DOCTOR'
    const userName = user.fullName || (isDoctor ? 'Doctor' : 'Patient')

    if (action === 'CANCEL' || status === 'CANCELLED') {
      updates.status = 'CANCELLED'
      updates.cancellation_reason = cancellation_reason || `Cancelled by ${userName}`
    } else if (action === 'RESCHEDULE' || status === 'RESCHEDULED') {
      const alreadyRescheduled =
        currentAppt.status === 'RESCHEDULED' ||
        currentAppt.cancellation_reason?.toLowerCase().includes('rescheduled')

      if (alreadyRescheduled) {
        return NextResponse.json(
          {
            error:
              'This appointment has already reached the 1-time reschedule limit. To change your visit, please cancel and book a new appointment.',
          },
          { status: 400 }
        )
      }

      updates.status = 'RESCHEDULED'
      updates.cancellation_reason = 'Rescheduled by patient.'
      if (scheduled_at) {
        updates.scheduled_at = scheduled_at
      }
    } else if (action === 'CONFIRM' || status === 'CONFIRMED') {
      updates.status = 'CONFIRMED'
    } else if (action === 'COMPLETE' || status === 'COMPLETED') {
      updates.status = 'COMPLETED'
    }

    const { data: updatedAppt, error: updateErr } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select('*')
      .single()

    if (updateErr) {
      console.error('Failed to update appointment:', updateErr.message)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 2. Trigger Emails Asynchronously
    const patientData = currentAppt.patient as any
    const doctorData = currentAppt.doctor as any
    const formattedNew = formatDateTime(updates.scheduled_at || currentAppt.scheduled_at)
    const formattedOld = formatDateTime(previousScheduledAt)

    const emailPayload = {
      patient: {
        email: patientData?.email || '',
        name: patientData?.full_name || 'Patient',
      },
      doctor: {
        email: doctorData?.email || '',
        name: doctorData?.full_name || 'Doctor',
      },
      appointment: {
        date: formattedNew.date,
        time: formattedNew.time,
        doctorName: doctorData?.full_name || 'Doctor',
        clinicAddress: doctorData?.doctor_profiles?.clinic_address || currentAppt.location || 'MedBook Clinic',
        oldDate: formattedOld.date,
        oldTime: formattedOld.time,
        rescheduledBy: userName,
        rescheduleReason: cancellation_reason || 'Schedule updated',
        cancelledBy: userName,
        cancellationReason: cancellation_reason || 'Appointment cancelled',
        declineReason: cancellation_reason || 'Doctor unavailable at this time',
      },
    }

    if (updates.status === 'CONFIRMED') {
      sendAppointmentConfirmed(emailPayload).catch((err) =>
        console.error('[Email] Failed to send confirmation email:', err)
      )
    } else if (updates.status === 'CANCELLED') {
      if (isDoctor && currentAppt.status === 'PENDING') {
        sendAppointmentDeclined(emailPayload).catch((err) =>
          console.error('[Email] Failed to send decline email:', err)
        )
      } else {
        sendAppointmentCancelled(emailPayload).catch((err) =>
          console.error('[Email] Failed to send cancellation email:', err)
        )
      }
    } else if (updates.status === 'RESCHEDULED') {
      sendAppointmentRescheduled(emailPayload).catch((err) =>
        console.error('[Email] Failed to send reschedule email:', err)
      )
    }

    return NextResponse.json({
      message: 'Appointment updated successfully.',
      appointment: updatedAppt,
    })
  } catch (err: any) {
    console.error('PATCH /api/appointments/[id] error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}

// GET /api/appointments/[id] — Get single appointment details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(req)
    if (!user || !user.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const appointmentId = params.id
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        type,
        location,
        cancellation_reason,
        patient:patient_id (
          id,
          full_name,
          email
        ),
        doctor:doctor_id (
          id,
          full_name,
          email,
          doctor_profiles (
            specialty,
            clinic_address
          )
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
    }

    return NextResponse.json({ appointment: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
