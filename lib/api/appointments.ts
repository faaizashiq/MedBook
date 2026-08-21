import { apiFetch } from './client'

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'

export interface ApiAppointment {
  id: string | number
  scheduled_at: string
  status: AppointmentStatus
  type: 'Video Consultation' | 'In-Person Visit'
  location?: string
  cancellation_reason?: string
  doctor?: {
    id: string
    full_name: string
    avatar_url?: string
    doctor_profiles?: {
      specialty?: string
      clinic_address?: string
    }
  }
  patient?: {
    id: string
    full_name: string
    email?: string
    avatar_url?: string
  }
}

// Global broadcast trigger to notify all open browser tabs & windows in 0ms
export function notifyAppointmentSync() {
  if (typeof window !== 'undefined') {
    try {
      const channel = new BroadcastChannel('medbook_sync_channel')
      channel.postMessage({ type: 'SYNC_APPOINTMENTS', timestamp: Date.now() })
      channel.close()
    } catch {}
    try {
      localStorage.setItem('medbook_sync_ping', Date.now().toString())
      window.dispatchEvent(new CustomEvent('medbook:sync'))
    } catch {}
  }
}

// 1. Fetch appointments for logged-in user (patient or doctor)
export async function getAppointments(): Promise<{ appointments: ApiAppointment[] }> {
  return apiFetch<{ appointments: ApiAppointment[] }>('/api/appointments')
}

// 2. Book a new appointment
export async function createAppointment(data: {
  doctor_id: string
  scheduled_at: string
  type?: string
  location?: string
  notes?: string
}): Promise<{ appointment: ApiAppointment; message: string }> {
  const res = await apiFetch<{ appointment: ApiAppointment; message: string }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  notifyAppointmentSync()
  return res
}

// 3. Cancel an appointment
export async function cancelAppointmentApi(
  id: string | number,
  cancellation_reason?: string
): Promise<{ appointment: ApiAppointment; message: string }> {
  const res = await apiFetch<{ appointment: ApiAppointment; message: string }>(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'CANCEL',
      cancellation_reason: cancellation_reason || 'Cancelled by user',
    }),
  })
  notifyAppointmentSync()
  return res
}

// 4. Reschedule an appointment
export async function rescheduleAppointmentApi(
  id: string | number,
  scheduled_at: string
): Promise<{ appointment: ApiAppointment; message: string }> {
  const res = await apiFetch<{ appointment: ApiAppointment; message: string }>(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'RESCHEDULE',
      scheduled_at,
    }),
  })
  notifyAppointmentSync()
  return res
}

// 5. Doctor Confirm appointment
export async function confirmAppointmentApi(
  id: string | number
): Promise<{ appointment: ApiAppointment; message: string }> {
  const res = await apiFetch<{ appointment: ApiAppointment; message: string }>(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'CONFIRM' }),
  })
  notifyAppointmentSync()
  return res
}

// 6. Submit a review for a completed appointment
export async function submitReviewApi(data: {
  appointment_id?: string | number
  doctor_id: string
  rating: number
  comment?: string
}): Promise<{ message: string; review: any }> {
  const res = await apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  notifyAppointmentSync()
  return res
}

// 7. Get reviews for a doctor
export async function getDoctorReviews(doctorId: string): Promise<{ reviews: any[] }> {
  return apiFetch(`/api/reviews?doctor_id=${doctorId}`)
}
