import bcrypt from 'bcryptjs'
import { supabaseAdmin as supabase } from './supabase'

export type UserRole = 'PATIENT' | 'DOCTOR'

export interface UserProfile {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export interface DoctorProfile {
  user_id: string
  specialty?: string
  biography?: string
  clinic_address?: string
  consultation_fee?: number
  years_experience?: number
  availability_grid?: Record<string, string[]>
  is_completed: boolean
  updated_at: string
}

export const db = {
  // ─── User Operations ────────────────────────────────────────────────────────
  findUserByEmail: async (email: string): Promise<UserProfile | null> => {
    const cleanEmail = email.toLowerCase().trim()
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle()

      if (error) {
        console.warn('Supabase findUserByEmail warning:', error.message)
      }

      if (data) {
        return {
          id: data.id,
          email: data.email,
          password_hash: data.password_hash,
          full_name: data.full_name,
          role: data.role as UserRole,
          avatar_url: data.avatar_url,
          is_active: data.is_active ?? true,
          created_at: data.created_at,
        }
      }
    } catch (err) {
      console.error('Supabase query error in findUserByEmail:', err)
    }

    return null
  },

  findUserById: async (id: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.warn('Supabase findUserById warning:', error.message)
      }

      if (data) {
        return {
          id: data.id,
          email: data.email,
          password_hash: data.password_hash,
          full_name: data.full_name,
          role: data.role as UserRole,
          avatar_url: data.avatar_url,
          is_active: data.is_active ?? true,
          created_at: data.created_at,
        }
      }
    } catch (err) {
      console.error('Supabase query error in findUserById:', err)
    }

    return null
  },

  createUser: async (
    data: Omit<UserProfile, 'id' | 'is_active' | 'created_at'>
  ): Promise<UserProfile> => {
    const cleanEmail = data.email.toLowerCase().trim()
    const role = data.role.toUpperCase() as UserRole

    const insertPayload = {
      email: cleanEmail,
      password_hash: data.password_hash,
      full_name: data.full_name,
      role: role,
      avatar_url: data.avatar_url || null,
      is_active: true,
    }

    const { data: created, error } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error || !created) {
      throw new Error(error?.message || 'Failed to insert user into Supabase database.')
    }

    const newUser: UserProfile = {
      id: created.id,
      email: created.email,
      password_hash: created.password_hash,
      full_name: created.full_name,
      role: created.role,
      avatar_url: created.avatar_url,
      is_active: created.is_active ?? true,
      created_at: created.created_at,
    }

    // If role is DOCTOR, create initial doctor_profiles row
    if (role === 'DOCTOR') {
      const { error: docError } = await supabase
        .from('doctor_profiles')
        .insert({
          user_id: newUser.id,
          is_completed: false,
        })
      if (docError) {
        console.warn('Initial doctor_profiles insert warning:', docError.message)
      }
    }

    return newUser
  },

  // ─── Doctor Profile Operations ──────────────────────────────────────────────
  findDoctorProfile: async (userId: string): Promise<DoctorProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Supabase findDoctorProfile warning:', error.message)
      }

      if (data) {
        return {
          user_id: data.user_id,
          specialty: data.specialty,
          biography: data.biography,
          clinic_address: data.clinic_address,
          consultation_fee: data.consultation_fee ? Number(data.consultation_fee) : undefined,
          years_experience: data.years_experience ? Number(data.years_experience) : undefined,
          availability_grid: data.availability_grid || {},
          is_completed: data.is_completed ?? false,
          updated_at: data.updated_at,
        }
      }
    } catch (err) {
      console.error('Supabase query error in findDoctorProfile:', err)
    }

    return null
  },

  upsertDoctorProfile: async (
    userId: string,
    data: Partial<Omit<DoctorProfile, 'user_id' | 'updated_at'>>
  ): Promise<DoctorProfile> => {
    const payload = {
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error } = await supabase
      .from('doctor_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single()

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update doctor profile in Supabase.')
    }

    return {
      user_id: updated.user_id,
      specialty: updated.specialty,
      biography: updated.biography,
      clinic_address: updated.clinic_address,
      consultation_fee: updated.consultation_fee ? Number(updated.consultation_fee) : undefined,
      years_experience: updated.years_experience ? Number(updated.years_experience) : undefined,
      availability_grid: updated.availability_grid || {},
      is_completed: updated.is_completed ?? false,
      updated_at: updated.updated_at,
    }
  },

  // ─── List Completed Doctors for Public Directory ───────────────────────────
  listCompletedDoctors: async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
          user_id,
          specialty,
          biography,
          clinic_address,
          consultation_fee,
          years_experience,
          availability_grid,
          is_completed,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('is_completed', true)

      if (error) {
        console.error('Supabase listCompletedDoctors error:', error.message)
        return []
      }

      return (data || []).map((row: any) => ({
        user_id: row.user_id,
        specialty: row.specialty,
        biography: row.biography,
        clinic_address: row.clinic_address,
        consultation_fee: Number(row.consultation_fee),
        years_experience: Number(row.years_experience),
        availability_grid: row.availability_grid,
        is_completed: row.is_completed,
        doctorName: row.profiles?.full_name || 'Dr. Specialist',
        email: row.profiles?.email,
        avatarUrl: row.profiles?.avatar_url,
      }))
    } catch (err) {
      console.error('Supabase listCompletedDoctors exception:', err)
      return []
    }
  },
}
