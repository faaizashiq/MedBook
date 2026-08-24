'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  AuthUser,
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  LoginData,
  SignupData,
  AuthResponse,
} from '@/lib/api/auth'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  role: 'PATIENT' | 'DOCTOR' | null
  isAuthenticated: boolean
  isDoctorSetupCompleted: boolean
  loading: boolean
  login: (data: LoginData) => Promise<AuthResponse>
  signup: (data: SignupData) => Promise<AuthResponse>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (partial: Partial<AuthUser>, newToken?: string) => void
  setDoctorSetupCompleted: (completed: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isDoctorSetupCompleted, setIsDoctorSetupCompleted] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)

  // Instant rehydration from localStorage first (0ms initial render), followed by live API verification
  const rehydrate = async () => {
    try {
      const storedToken = localStorage.getItem('medbook_token')
      const storedUser = localStorage.getItem('medbook_user')
      const storedSetup = localStorage.getItem('medbook_doctor_setup_completed')

      if (storedSetup !== null) {
        setIsDoctorSetupCompleted(storedSetup === 'true')
      }

      if (storedToken) {
        setToken(storedToken)
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            setUser(parsed)
            if (parsed.role === 'PATIENT') {
              setIsDoctorSetupCompleted(true)
            }
          } catch {}
        }
        // Unlock page immediately for 0ms visual loading
        setLoading(false)

        // Verify/refresh user
        try {
          const me = await getCurrentUser()
          if (me?.user) {
            setUser(me.user)
            localStorage.setItem('medbook_user', JSON.stringify(me.user))
            const setupDone = me.user.role === 'PATIENT' ? true : !!me.is_doctor_setup_completed
            setIsDoctorSetupCompleted(setupDone)
            localStorage.setItem('medbook_doctor_setup_completed', String(setupDone))
          }
        } catch (err) {
          console.warn('Session verification warning:', err)
        }
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.warn('Session rehydration failed:', err)
      logoutUser()
      setUser(null)
      setToken(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    rehydrate()

    const handleSync = () => {
      try {
        const storedUser = localStorage.getItem('medbook_user')
        const storedToken = localStorage.getItem('medbook_token')
        const storedSetup = localStorage.getItem('medbook_doctor_setup_completed')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        if (storedToken) {
          setToken(storedToken)
        }
        if (storedSetup !== null) {
          setIsDoctorSetupCompleted(storedSetup === 'true')
        }
      } catch {}
    }

    window.addEventListener('medbook:sync', handleSync)
    window.addEventListener('storage', handleSync)

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('medbook_sync_channel')
      channel.onmessage = (event) => {
        if (
          event.data?.type === 'SYNC_APPOINTMENTS' ||
          event.data?.type === 'SYNC_PROFILE' ||
          event.data?.type === 'APPOINTMENTS_UPDATED'
        ) {
          handleSync()
        }
      }
    } catch {}

    return () => {
      window.removeEventListener('medbook:sync', handleSync)
      window.removeEventListener('storage', handleSync)
      if (channel) {
        try {
          channel.close()
        } catch {}
      }
    }
  }, [])

  const login = async (data: LoginData) => {
    const res = await loginUser(data)
    setUser(res.user)
    setToken(res.access_token)
    const setupDone = res.user.role === 'PATIENT' ? true : !!res.is_doctor_setup_completed
    setIsDoctorSetupCompleted(setupDone)
    localStorage.setItem('medbook_doctor_setup_completed', String(setupDone))
    return res
  }

  const signup = async (data: SignupData) => {
    const res = await signupUser(data)
    setUser(res.user)
    setToken(res.access_token)
    const setupDone = res.user.role === 'PATIENT' ? true : !!res.is_doctor_setup_completed
    setIsDoctorSetupCompleted(setupDone)
    localStorage.setItem('medbook_doctor_setup_completed', String(setupDone))
    return res
  }

  const logout = () => {
    logoutUser()
    setUser(null)
    setToken(null)
    setIsDoctorSetupCompleted(true)
    localStorage.removeItem('medbook_doctor_setup_completed')
    window.location.href = '/'
  }

  const setDoctorSetupCompleted = (completed: boolean) => {
    setIsDoctorSetupCompleted(completed)
    localStorage.setItem('medbook_doctor_setup_completed', String(completed))
  }

  const refreshUser = async () => {
    await rehydrate()
  }

  const updateUser = (partial: Partial<AuthUser>, newToken?: string) => {
    if (newToken) {
      setToken(newToken)
      localStorage.setItem('medbook_token', newToken)
      document.cookie = `medbook_token=${newToken}; path=/; max-age=604800; SameSite=Lax`
    }
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...partial }
      localStorage.setItem('medbook_user', JSON.stringify(updated))
      try {
        const storedAuth = localStorage.getItem('medbook_auth')
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth)
          if (partial.fullName) parsed.name = partial.fullName
          localStorage.setItem('medbook_auth', JSON.stringify(parsed))
        }
      } catch {}
      return updated
    })

    try {
      const channel = new BroadcastChannel('medbook_sync_channel')
      channel.postMessage({ type: 'SYNC_PROFILE', timestamp: Date.now() })
      channel.close()
    } catch {}

    try {
      window.dispatchEvent(new CustomEvent('medbook:sync'))
      localStorage.setItem('medbook_sync_ping', Date.now().toString())
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isDoctorSetupCompleted,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        updateUser,
        setDoctorSetupCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
