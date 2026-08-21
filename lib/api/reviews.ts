import { apiFetch } from './client'

export interface ReviewItem {
  id: string
  rating: number
  comment?: string
  created_at: string
  patient?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export async function submitReview(data: {
  appointment_id?: string | number
  doctor_id: string
  rating: number
  comment?: string
}): Promise<{ message: string; review: any }> {
  return apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getDoctorReviews(doctorId: string): Promise<{ reviews: ReviewItem[] }> {
  return apiFetch(`/api/reviews?doctor_id=${doctorId}`)
}
