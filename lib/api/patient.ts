import { apiFetch } from './client'
import { AuthUser } from './auth'

export interface PatientProfileData {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
  created_at: string
}

export async function getPatientProfile(): Promise<{ profile: PatientProfileData }> {
  return apiFetch('/api/patient/profile')
}

export async function updatePatientProfile(data: {
  full_name?: string
  avatar_url?: string
}): Promise<{ profile: PatientProfileData; message: string; access_token?: string; user?: AuthUser }> {
  return apiFetch('/api/patient/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
