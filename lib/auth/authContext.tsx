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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isDoctorSetupCompleted, setIsDoctorSetupCompleted] = useState(true)
  const [loading, setLoading] = useState(true)

  // Instant rehydration from localStorage first (0ms initial render), followed by non-blocking live API verification
  const rehydrate = async () => {
    try {
      const storedToken = localStorage.getItem('medbook_token')
      const storedUser = localStorage.getItem('medbook_user')

      if (storedToken) {
        setToken(storedToken)
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch {}
        }
        // Unlock page immediately for 0ms visual loading
        setLoading(false)

        // Verify/refresh user in background without blocking UI
        getCurrentUser()
          .then((me) => {
            if (me?.user) {
              setUser(me.user)
              localStorage.setItem('medbook_user', JSON.stringify(me.user))
              setIsDoctorSetupCompleted(me.is_doctor_setup_completed)
            }
          })
          .catch((err) => {
            console.warn('Session verification warning:', err)
          })
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
  }, [])

  const login = async (data: LoginData) => {
    const res = await loginUser(data)
    setUser(res.user)
    setToken(res.access_token)
    setIsDoctorSetupCompleted(res.is_doctor_setup_completed)
    return res
  }

  const signup = async (data: SignupData) => {
    const res = await signupUser(data)
    setUser(res.user)
    setToken(res.access_token)
    setIsDoctorSetupCompleted(res.is_doctor_setup_completed)
    return res
  }

  const logout = () => {
    logoutUser()
    setUser(null)
    setToken(null)
    setIsDoctorSetupCompleted(true)
    window.location.href = '/'
  }

  const refreshUser = async () => {
    await rehydrate()
  }

  const updateUser = (partial: Partial<AuthUser>, newToken?: string) => {
    if (newToken) {
      setToken(newToken)
      localStorage.setItem('medbook_token', newToken)
    }
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...partial }
      localStorage.setItem('medbook_user', JSON.stringify(updated))
      return updated
    })

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
