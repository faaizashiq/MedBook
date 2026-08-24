'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Stethoscope,
  UserRound,
  CalendarDays,
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Video,
  Sparkles,
  HeartPulse,
  Activity,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─────────────────────────────────────────────────────────────────────────────
// Role Toggle
// ─────────────────────────────────────────────────────────────────────────────

type Role = 'patient' | 'doctor'

function RoleToggle({
  role,
  onChange,
}: {
  role: Role
  onChange: (r: Role) => void
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-slate-100 p-1">
      {(['patient', 'doctor'] as Role[]).map((r) => {
        const active = role === r

        return (
          <button
            key={r}
            id={`login-role-${r}`}
            type="button"
            onClick={() => onChange(r)}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-lg px-3 py-2.5
              text-sm font-semibold
              transition-all duration-200
              ${active
                ? 'border border-border/60 bg-white text-primary shadow-sm'
                : 'text-text-muted hover:bg-white/60 hover:text-text-secondary'
              }
            `}
          >
            {r === 'patient' ? (
              <UserRound className="h-4 w-4" />
            ) : (
              <Stethoscope className="h-4 w-4" />
            )}

            {r === 'patient' ? 'Patient Portal' : 'Doctor Portal'}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Right Showcase Panel
// ─────────────────────────────────────────────────────────────────────────────

function LoginRightPanel() {
  return (
    <div
      className="
        relative hidden h-full w-[470px] flex-shrink-0
        flex-col justify-between overflow-hidden
        bg-gradient-to-br from-blue-700 via-primary to-indigo-900
        p-8 text-white
        lg:flex
        xl:w-[510px] xl:p-9
      "
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.13),transparent_55%)]" />

      {/* ───────────────── Top ───────────────── */}

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-100 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Secure Healthcare Network
        </div>

        <h2 className="text-3xl font-bold leading-[1.12] tracking-tight text-white xl:text-[34px]">
          Your Health.
          <br />
          <span className="text-blue-200">Your Care.</span>
        </h2>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100">
          Connect with trusted healthcare professionals, manage appointments,
          and access care from wherever you are.
        </p>
      </div>

      {/* ───────────────── Consultation Card ───────────────── */}

      <div className="relative z-10 my-5">
        <div className="relative">
          {/* Main card */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">

            {/* Doctor header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-400 to-indigo-400 shadow-lg">
                  <HeartPulse className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-blue-200">
                    UPCOMING CONSULTATION
                  </p>

                  <p className="truncate text-sm font-semibold text-white">
                    Dr. Sarah Johnson
                  </p>

                  <p className="text-[10px] text-blue-200">
                    Cardiologist • MD
                  </p>
                </div>
              </div>

              <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                15 min
              </span>
            </div>

            {/* Appointment details */}
            <div className="mt-3 grid grid-cols-2 gap-2">

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <Clock className="h-4 w-4 flex-shrink-0 text-blue-300" />

                <div>
                  <p className="text-[9px] text-blue-200">
                    TIME
                  </p>

                  <p className="text-xs font-semibold text-white">
                    02:30 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <Video className="h-4 w-4 flex-shrink-0 text-emerald-300" />

                <div>
                  <p className="text-[9px] text-blue-200">
                    CONSULTATION
                  </p>

                  <p className="text-xs font-semibold text-white">
                    HD Video Call
                  </p>
                </div>
              </div>

            </div>

            {/* Join button */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-200" />

                <span className="text-[11px] text-blue-100">
                  Appointment confirmed
                </span>
              </div>

              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
          </div>

          {/* Verified badge */}
          <div className="absolute -right-2 -top-3 flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-slate-900 shadow-xl">

            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div>
              <p className="text-[10px] font-bold leading-tight">
                Verified Doctor
              </p>

              <p className="text-[8px] text-slate-500">
                Credentials checked
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div
            className="absolute -bottom-3 -left-2 flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-slate-900 shadow-xl"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>

            <div>
              <p className="text-[10px] font-bold leading-tight">
                Secure & Private
              </p>

              <p className="text-[8px] text-slate-500">
                Your data stays protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────── Bottom ───────────────── */}

      <div className="relative z-10 space-y-3">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">

          {[
            ['10K+', 'Patients'],
            ['500+', 'Doctors'],
            ['4.9/5', 'Rating'],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm"
            >
              <p className="text-base font-bold leading-none text-white">
                {value}
              </p>

              <p className="mt-1 text-[10px] text-blue-200">
                {label}
              </p>
            </div>
          ))}

        </div>

        {/* Testimonial */}
        <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">

          <div className="mb-1.5 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-amber-300 text-amber-300"
              />
            ))}
          </div>

          <p className="text-[11px] italic leading-relaxed text-blue-100">
            &ldquo;Finding a doctor and booking my appointment took less than
            two minutes.&rdquo;
          </p>

          <p className="mt-1.5 text-[10px] font-semibold text-white">
            — Sarah K., Verified Patient
          </p>

        </div>

      </div>
    </div>
  )
}

import { Suspense } from 'react'
import { useAuth } from '@/lib/auth/authContext'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams?.get('redirect') || null

  const { login } = useAuth()
  const [role, setRole] = useState<Role>('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fillDemoCredentials = (targetRole: 'patient' | 'doctor') => {
    setRole(targetRole)
    if (targetRole === 'patient') {
      setEmail('patient@medbook.com')
      setPassword('Password123!')
    } else {
      setEmail('doctor@medbook.com')
      setPassword('Password123!')
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      return setError('Please enter your email address.')
    }

    if (!password) {
      return setError('Please enter your password.')
    }

    setLoading(true)

    try {
      const response = await login({
        email: cleanEmail,
        password,
        expected_role: role.toUpperCase() as 'PATIENT' | 'DOCTOR',
      })

      const destUrl =
        redirectParam ||
        response?.redirect_url ||
        (response?.user?.role === 'PATIENT'
          ? '/patient'
          : response?.is_doctor_setup_completed
          ? '/doctor'
          : '/doctor/setup')

      window.location.href = destUrl
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden">

      {/* LEFT — LOGIN FORM */}
      <section className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto bg-background px-6 py-6 md:px-10 lg:px-12">
        <div className="w-full max-w-[400px]">

          {/* Heading */}
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              Welcome Back
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              Sign In to MedBook
            </h1>

            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Access your healthcare account and manage your appointments.
            </p>
          </div>

          {/* Role toggle */}
          <div className="mb-3">
            <RoleToggle
              role={role}
              onChange={(r) => {
                setRole(r)
                setError('')
              }}
            />
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[11px] text-text-muted font-medium">Quick Fill:</span>
            <button
              type="button"
              onClick={() => fillDemoCredentials('patient')}
              className="text-[11px] font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded-md transition-colors"
            >
              Demo Patient
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('doctor')}
              className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
            >
              Demo Doctor
            </button>
          </div>

          {/* Form */}
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="space-y-3"
            noValidate
          >
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-body-sm font-semibold text-text-primary"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary-700"
                >
                  Forgot Password?
                </Link>
              </div>

              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2 py-0.5">
              <input
                id="remember-me"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
              />

              <label
                htmlFor="remember-me"
                className="cursor-pointer select-none text-xs text-text-secondary"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-danger-100 bg-danger-50 p-3"
              >
                <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger" />

                <p className="text-xs text-danger">
                  {error}
                </p>
              </div>
            )}

            {/* Login */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              id="login-submit-btn"
              className="mt-3 group font-bold shadow-btn"
              icon={!loading ? <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /> : undefined}
              iconPosition="right"
            >
              Log In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="whitespace-nowrap text-xs text-text-muted">
              or continue with
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="login-google-btn"
              type="button"
              className="
      flex h-9 items-center justify-center gap-2
      rounded-lg border border-border bg-white
      px-3 text-xs font-medium text-text-primary
      shadow-sm transition-all
      hover:border-primary-100 hover:bg-primary-50/30
    "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              Google
            </button>

            <button
              id="login-apple-btn"
              type="button"
              className="
      flex h-9 items-center justify-center gap-2
      rounded-lg border border-border bg-white
      px-3 text-xs font-medium text-text-primary
      shadow-sm transition-all
      hover:border-gray-300 hover:bg-gray-50
    "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current text-text-primary"
              >
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>

              Apple
            </button>
          </div>

          {/* Signup */}
          <p className="mt-4 text-center text-xs text-text-secondary">
            Don&apos;t have an account?{' '}

            <Link
              href="/signup"
              id="login-signup-link"
              className="font-semibold text-primary hover:text-primary-700"
            >
              Sign up free
            </Link>
          </p>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <LoginRightPanel />

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-background"><p className="text-sm text-text-muted">Loading...</p></div>}>
      <LoginFormContent />
    </Suspense>
  )
}