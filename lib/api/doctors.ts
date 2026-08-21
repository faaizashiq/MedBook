import { apiFetch } from './client'
import type { Doctor } from '@/components/doctors/DoctorCard'

export interface DoctorDetail {
  id: string
  name: string
  email?: string
  avatarUrl?: string
  specialty: string
  biography: string
  clinicAddress: string
  consultationFee: number
  yearsExperience: number
  availabilityGrid: Record<string, string[]>
  isCompleted: boolean
}

// 1. Fetch public doctors directory
export async function getPublicDoctors(params?: {
  specialty?: string
  query?: string
}): Promise<{ doctors: Doctor[] }> {
  const queryParams = new URLSearchParams()
  if (params?.specialty && params.specialty !== 'All') {
    queryParams.set('specialty', params.specialty)
  }
  if (params?.query) {
    queryParams.set('query', params.query)
  }

  const qs = queryParams.toString() ? `?${queryParams.toString()}` : ''
  return apiFetch(`/api/doctors${qs}`)
}

// 2. Fetch single doctor detail and availability
export async function getDoctorDetail(id: string): Promise<{ doctor: DoctorDetail }> {
  return apiFetch(`/api/doctors/${id}`)
}
