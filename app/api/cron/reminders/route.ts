import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/database/supabase'
import { sendAppointmentReminder } from '@/lib/services/appointmentEmails'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDateTime(isoString: string): { date: string; time: string } {
  try {
    const d = new Date(isoString)
    return {
      date: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }
  } catch {
    return { date: 'Scheduled Date', time: 'Scheduled Time' }
  }
}

// GET /api/cron/reminders or POST /api/cron/reminders
// Triggered on schedule (e.g., Every 15-60 minutes by Cron-Job.org or Vercel Cron)
export async function GET(req: NextRequest) {
  return handleCronReminders(req)
}

export async function POST(req: NextRequest) {
  return handleCronReminders(req)
}

async function handleCronReminders(req: NextRequest) {
  try {
    // 1. Authenticate with CRON_SECRET if configured
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing Bearer CRON_SECRET.' },
        { status: 401 }
      )
    }

    const now = new Date()
    // Target window: appointments scheduled between right now and the next 65 minutes
    const windowStart = now.toISOString()
    const windowEnd = new Date(now.getTime() + 65 * 60 * 1000).toISOString()

    // 2. Query Supabase for confirmed appointments within the reminder window that haven't been reminded
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        type,
        location,
        reminder_sent,
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
            clinic_address
          )
        )
      `)
      .eq('status', 'CONFIRMED')
      .eq('reminder_sent', false)
      .gte('scheduled_at', windowStart)
      .lte('scheduled_at', windowEnd)

    if (error) {
      console.error('Cron reminder query error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        message: 'No upcoming appointments requiring reminders in this window.',
        windowStart,
        windowEnd,
        processed: 0,
      })
    }

    const reminderResults: Array<{ id: string; success: boolean; error?: string }> = []

    // 3. Dispatch reminder emails & update database flag
    for (const appt of appointments) {
      const patient = appt.patient as any
      const doctor = appt.doctor as any
      const { date, time } = formatDateTime(appt.scheduled_at)

      if (!patient?.email || !doctor?.email) {
        reminderResults.push({ id: appt.id, success: false, error: 'Missing email addresses.' })
        continue
      }

      try {
        await sendAppointmentReminder({
          patient: {
            email: patient.email,
            name: patient.full_name || 'Patient',
          },
          doctor: {
            email: doctor.email,
            name: doctor.full_name || 'Doctor',
          },
          appointment: {
            date,
            time,
            doctorName: doctor.full_name || 'Doctor',
            clinicAddress: appt.location || doctor.doctor_profiles?.clinic_address,
            consultationType: appt.type,
          },
        })

        // Mark as reminded so duplicate emails are never sent
        await supabase
          .from('appointments')
          .update({
            reminder_sent: true,
            reminded_at: new Date().toISOString(),
          })
          .eq('id', appt.id)

        reminderResults.push({ id: appt.id, success: true })
      } catch (err: any) {
        console.error(`Failed to send reminder for appointment ${appt.id}:`, err)
        reminderResults.push({ id: appt.id, success: false, error: err?.message })
      }
    }

    return NextResponse.json({
      message: `Processed ${reminderResults.length} appointment reminder(s).`,
      timestamp: new Date().toISOString(),
      results: reminderResults,
    })
  } catch (err: any) {
    console.error('Unhandled cron reminders error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 })
  }
}
