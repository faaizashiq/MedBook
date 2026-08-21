import { apiFetch } from './client'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'PATIENT' | 'DOCTOR'
  avatarUrl?: string
}

export interface AuthResponse {
  message: string
  access_token: string
  token_type: string
  user: AuthUser
  redirect_url: string
  is_doctor_setup_completed: boolean
}

export interface SignupData {
  email: string
  password: string
  full_name: string
  role: 'PATIENT' | 'DOCTOR'
}

export interface LoginData {
  email: string
  password: string
}

export async function signupUser(data: SignupData): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (typeof window !== 'undefined' && res.access_token) {
    localStorage.setItem('medbook_token', res.access_token)
    localStorage.setItem('medbook_user', JSON.stringify(res.user))
    localStorage.setItem(
      'medbook_auth',
      JSON.stringify({
        loggedIn: true,
        role: res.user.role.toLowerCase(),
        name: res.user.fullName,
        email: res.user.email,
        id: res.user.id,
      })
    )
  }

  return res
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (typeof window !== 'undefined' && res.access_token) {
    localStorage.setItem('medbook_token', res.access_token)
    localStorage.setItem('medbook_user', JSON.stringify(res.user))
    localStorage.setItem(
      'medbook_auth',
      JSON.stringify({
        loggedIn: true,
        role: res.user.role.toLowerCase(),
        name: res.user.fullName,
        email: res.user.email,
        id: res.user.id,
      })
    )
  }

  return res
}

export async function getCurrentUser(): Promise<{
  user: AuthUser
  is_doctor_setup_completed: boolean
}> {
  return apiFetch('/api/auth/me')
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medbook_token')
    localStorage.removeItem('medbook_user')
    localStorage.removeItem('medbook_auth')
    // Clear cookies
    document.cookie = 'medbook_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    document.cookie = 'medbook_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
  }
}
