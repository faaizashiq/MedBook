'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserRound,
  Stethoscope,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Star,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth/authContext'

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'patient' | 'doctor'

interface FormData {
  name: string
  email: string
  password: string
  confirm: string
}

// ─── Left Showcase Panel (Signup) ─────────────────────────────────────────────

function SignupLeftPanel() {
  return (
    <div
      className="
        relative hidden h-full w-[470px] flex-shrink-0
        flex-col justify-between overflow-hidden
        bg-gradient-to-br from-primary via-blue-600 to-indigo-900
        p-8 text-white
        lg:flex
        xl:w-[510px] xl:p-9
      "
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.13),transparent_55%)]" />

      {/* Top */}
      <div className="relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-100 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Join Over 10,000+ Happy Patients
        </div>

        <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-[34px]">
          Modern Healthcare <br />
          <span className="text-blue-200">At Your Fingertips</span>
        </h2>

        <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-blue-100">
          Connect with trusted doctors, book appointments instantly, and take charge of your health.
        </p>
      </div>

      {/* Center Visual with Floating Badges */}
      <div className="relative z-10 my-4 flex items-center justify-center">
        {/* Doctor Image Frame */}
        <div className="relative h-60 w-56 xl:h-64 xl:w-60 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-t from-blue-950/70 via-transparent to-white/10 backdrop-blur-sm flex items-end justify-center">
          <img
            src="/images/doctor-signup.png"
            alt="Expert Doctor"
            className="w-full h-full object-cover object-top filter contrast-105"
          />

          {/* Doctor Info Pill Overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-2 text-center">
            <p className="text-xs font-bold text-blue-900 leading-tight">Dr. Sarah Johnson</p>
            <p className="text-[10px] text-black">Senior Cardiologist • 8+ Yrs Exp.</p>
          </div>
        </div>

        {/* Floating Badge 1 (Top Right): Rating */}
        <div className="absolute -top-3 -right-2 bg-white rounded-xl px-3 py-2 text-slate-900 shadow-xl border border-white flex items-center gap-2 animate-float z-30">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900">4.9 / 5.0</span>
            </div>
            <p className="text-[9px] text-slate-500">Top Rated Doctor</p>
          </div>
        </div>

        {/* Floating Badge 2 (Bottom Left): Instant Booking */}
        <div
          className="absolute -bottom-3 -left-2 bg-white rounded-xl px-3 py-2 text-slate-900 shadow-xl border border-white flex items-center gap-2 animate-float z-30"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900">Instant Booking</span>
            <p className="text-[9px] text-slate-500">Confirmed in seconds</p>
          </div>
        </div>
      </div>

      {/* Bottom Feature List */}
      <div className="relative z-10 space-y-2 border-t border-white/15 pt-4">
        {[
          'Verified and board-certified healthcare specialists',
          'Flexible video visits or in-person clinic appointments',
          'Bank-grade encrypted medical privacy & records',
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs text-blue-100">
            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
              <ShieldCheck className="h-2.5 w-2.5 text-white" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Role Selector ───────────────────────────────────────────────────────────

function RoleSelector({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl">
      <button
        type="button"
        id="signup-role-patient"
        onClick={() => onChange('patient')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
          role === 'patient'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <UserRound className="h-4 w-4" />
        <span>I&apos;m a Patient</span>
      </button>

      <button
        type="button"
        id="signup-role-doctor"
        onClick={() => onChange('doctor')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
          role === 'doctor'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Stethoscope className="h-4 w-4" />
        <span>I&apos;m a Doctor</span>
      </button>
    </div>
  )
}

// ─── Single-Step Signup Page ──────────────────────────────────────────────────

export default function SignupPage() {
  const { signup } = useAuth()
  const [role, setRole] = useState<Role>('patient')
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState<Partial<FormData & { general: string }>>({})
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((err) => ({ ...err, [field]: '', general: '' }))
  }

  const validateForm = (): boolean => {
    const e: typeof errors = {}

    if (!form.name.trim()) {
      e.name = 'Full name is required.'
    }
    if (!form.email.trim()) {
      e.email = 'Email address is required.'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Please enter a valid email address.'
    }
    if (!form.password) {
      e.password = 'Password is required.'
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters long.'
    }
    if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      await signup({
        email: form.email.trim(),
        password: form.password,
        full_name: form.name.trim(),
        role: role.toUpperCase() as 'PATIENT' | 'DOCTOR',
      })

      // ─── Post-Signup Routing:
      // Doctor MUST setup profile first
      // Patient goes DIRECTLY to Patient Dashboard
      if (role === 'doctor') {
        window.location.href = '/doctor/setup'
      } else {
        window.location.href = '/patient'
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: err?.message || 'An error occurred during signup. Please try again.',
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden">
      {/* ── Left Side: Showcase Banner ── */}
      <SignupLeftPanel />

      {/* ── Right Side: Unified 1-Step Signup Form ── */}
      <section className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto bg-background px-6 py-6 md:px-10 lg:px-12">
        <div className="w-full max-w-[420px] my-auto">
          {/* Heading */}
          <div className="mb-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              Quick Registration
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {role === 'patient' ? 'Create Patient Account' : 'Create Doctor Account'}
            </h1>

            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-text-secondary">
              {role === 'patient'
                ? 'Register now to instantly access your patient dashboard and book appointments.'
                : 'Register as a doctor. You will complete your professional schedule setup next.'}
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-4">
            <RoleSelector
              role={role}
              onChange={(r) => {
                setRole(r)
                setErrors({})
              }}
            />
          </div>

          {/* Unified 1-Step Form */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <Input
              id="signup-name"
              label="Full Name"
              placeholder="e.g. Sarah Connor"
              value={form.name}
              onChange={updateField('name')}
              leftIcon={<UserRound className="h-4 w-4" />}
              error={errors.name}
              autoComplete="name"
              required
            />

            <Input
              id="signup-email"
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={updateField('email')}
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={updateField('password')}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password}
              hint={!errors.password ? 'Must be at least 8 characters.' : undefined}
              autoComplete="new-password"
              required
            />

            <Input
              id="signup-confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={updateField('confirm')}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirm}
              autoComplete="new-password"
              required
            />

            {/* General error message */}
            {errors.general && (
              <div
                role="alert"
                className="mt-2 flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl"
              >
                <div className="w-1.5 h-1.5 bg-danger rounded-full flex-shrink-0" />
                <p className="text-xs text-danger">{errors.general}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              id="signup-submit-btn"
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-4 shadow-btn"
              icon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
              iconPosition="right"
            >
              {role === 'doctor' ? 'Create Account & Continue Setup' : 'Create Account'}
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              id="signup-login-link"
              className="font-semibold text-primary hover:text-primary-700 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
