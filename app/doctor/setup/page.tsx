'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Stethoscope,
  Building2,
  CalendarDays,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  Save,
  User,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Copy,
  Check,
  RotateCcw,
  CheckCheck,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { useAuth } from '@/lib/auth/authContext'
import { apiFetch } from '@/lib/api/client'

const SPECIALTIES = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'General Practitioner',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Psychiatrist',
  'Gynecologist',
  'Oncologist',
  'Ophthalmologist',
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Full 9:00 AM to 9:00 PM 30-minute consultation slots (25 half-hour slots)
const ALL_AVAILABLE_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
]

const SLOT_PERIODS = [
  {
    name: 'Morning',
    label: '9 AM – 12 PM',
    icon: Sunrise,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: 'bg-amber-100/70 text-amber-800',
    slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
  },
  {
    name: 'Afternoon',
    label: '12 PM – 5 PM',
    icon: Sun,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    badge: 'bg-blue-100/70 text-blue-800',
    slots: [
      '12:00 PM',
      '12:30 PM',
      '01:00 PM',
      '01:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
    ],
  },
  {
    name: 'Evening',
    label: '5 PM – 9 PM',
    icon: Moon,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100/70 text-indigo-800',
    slots: [
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
      '06:30 PM',
      '07:00 PM',
      '07:30 PM',
      '08:00 PM',
      '08:30 PM',
      '09:00 PM',
    ],
  },
]

const DEFAULT_ACTIVE_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
]

function DoctorSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')

  const { user, refreshUser, updateUser, setDoctorSetupCompleted } = useAuth()

  // Initial step based on query param: ?tab=profile (1), ?tab=fee (2), ?tab=schedule (3)
  const initialStep: 1 | 2 | 3 =
    tabParam === 'schedule' || tabParam === 'availability'
      ? 3
      : tabParam === 'fee' || tabParam === 'pricing'
      ? 2
      : 1

  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [copiedDay, setCopiedDay] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatar, setAvatar] = useState(user?.avatarUrl || '')
  const [specialty, setSpecialty] = useState(SPECIALTIES[0])
  const [experience, setExperience] = useState('5')
  const [fee, setFee] = useState('150')
  const [bio, setBio] = useState(
    'Dedicated medical specialist committed to providing empathetic, evidence-based care and patient-first consultations.'
  )
  const [clinicAddress, setClinicAddress] = useState(
    '450 Lexington Ave, Suite 1200, New York, NY 10017'
  )

  // Availability Grid state (9 AM - 9 PM)
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    Mon: [...DEFAULT_ACTIVE_SLOTS],
    Tue: [...DEFAULT_ACTIVE_SLOTS],
    Wed: [...DEFAULT_ACTIVE_SLOTS],
    Thu: [...DEFAULT_ACTIVE_SLOTS],
    Fri: [...DEFAULT_ACTIVE_SLOTS],
    Sat: ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'],
    Sun: [],
  })

  // Load existing profile from backend
  useEffect(() => {
    async function loadExistingProfile() {
      if (!user?.id) return
      if (user.fullName) setFullName(user.fullName)
      if (user.avatarUrl) setAvatar(user.avatarUrl)

      try {
        const res = await apiFetch<any>(`/api/doctors/${user.id}`)
        if (res?.doctor) {
          const d = res.doctor
          if (d.name) setFullName(d.name)
          if (d.avatarUrl) setAvatar(d.avatarUrl)
          if (d.specialty) setSpecialty(d.specialty)
          if (d.yearsExperience) setExperience(String(d.yearsExperience))
          if (d.consultationFee) setFee(String(d.consultationFee))
          if (d.biography) setBio(d.biography)
          if (d.clinicAddress) setClinicAddress(d.clinicAddress)
          if (d.availabilityGrid && Object.keys(d.availabilityGrid).length > 0) {
            setAvailability(d.availabilityGrid)
          }
        }
      } catch {
        // use defaults
      } finally {
        setFetchingProfile(false)
      }
    }

    loadExistingProfile()
  }, [user])

  // Toggle individual slot
  const toggleDaySlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const current = prev[day] || []
      const exists = current.includes(slot)
      const updated = exists ? current.filter((s) => s !== slot) : [...current, slot]
      // Maintain strict chronological order
      updated.sort((a, b) => ALL_AVAILABLE_SLOTS.indexOf(a) - ALL_AVAILABLE_SLOTS.indexOf(b))
      return { ...prev, [day]: updated }
    })
  }

  // Toggle time-of-day period (e.g. Morning, Afternoon, Evening) for a day
  const togglePeriodSlots = (day: string, periodSlots: string[]) => {
    setAvailability((prev) => {
      const current = prev[day] || []
      const allActive = periodSlots.every((s) => current.includes(s))
      let updated: string[]
      if (allActive) {
        // Remove period slots
        updated = current.filter((s) => !periodSlots.includes(s))
      } else {
        // Add missing period slots
        const combined = Array.from(new Set([...current, ...periodSlots]))
        combined.sort((a, b) => ALL_AVAILABLE_SLOTS.indexOf(a) - ALL_AVAILABLE_SLOTS.indexOf(b))
        updated = combined
      }
      return { ...prev, [day]: updated }
    })
  }

  // Toggle entire day (All 9 AM - 9 PM or Clear)
  const toggleFullDay = (day: string) => {
    setAvailability((prev) => {
      const current = prev[day] || []
      const isAll = current.length === ALL_AVAILABLE_SLOTS.length
      return {
        ...prev,
        [day]: isAll ? [] : [...ALL_AVAILABLE_SLOTS],
      }
    })
  }

  // Master Day Off Toggle (Clears slots if active, restores standard 9-5 slots if off)
  const toggleDayOff = (day: string) => {
    setAvailability((prev) => {
      const current = prev[day] || []
      const isWorking = current.length > 0
      return {
        ...prev,
        [day]: isWorking ? [] : [...DEFAULT_ACTIVE_SLOTS],
      }
    })
  }

  // Copy schedule from one day to all weekdays (Mon-Fri)
  const copyDayToWeekdays = (fromDay: string) => {
    const template = availability[fromDay] || []
    setAvailability((prev) => ({
      ...prev,
      Mon: [...template],
      Tue: [...template],
      Wed: [...template],
      Thu: [...template],
      Fri: [...template],
    }))
    setCopiedDay(fromDay)
    setTimeout(() => setCopiedDay(null), 2500)
  }

  // Apply Global Presets across weekdays
  const applyGlobalPreset = (
    type: 'full-9-9' | 'standard-9-5' | 'morning-only' | 'evening-only' | 'clear-all'
  ) => {
    if (type === 'clear-all') {
      const empty: Record<string, string[]> = {}
      DAYS.forEach((d) => {
        empty[d] = []
      })
      setAvailability(empty)
      return
    }

    let targetSlots: string[] = []
    if (type === 'full-9-9') {
      targetSlots = [...ALL_AVAILABLE_SLOTS]
    } else if (type === 'standard-9-5') {
      targetSlots = [...DEFAULT_ACTIVE_SLOTS]
    } else if (type === 'morning-only') {
      targetSlots = [
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '12:00 PM',
        '12:30 PM',
        '01:00 PM',
      ]
    } else if (type === 'evening-only') {
      targetSlots = [
        '04:00 PM',
        '04:30 PM',
        '05:00 PM',
        '05:30 PM',
        '06:00 PM',
        '06:30 PM',
        '07:00 PM',
        '07:30 PM',
        '08:00 PM',
        '08:30 PM',
        '09:00 PM',
      ]
    }

    setAvailability((prev) => ({
      ...prev,
      Mon: [...targetSlots],
      Tue: [...targetSlots],
      Wed: [...targetSlots],
      Thu: [...targetSlots],
      Fri: [...targetSlots],
      Sat: prev.Sat?.length ? prev.Sat : [],
      Sun: prev.Sun?.length ? prev.Sun : [],
    }))
  }

  // Calculate statistics
  const totalWeeklySlots = Object.values(availability).reduce(
    (acc, curr) => acc + (curr?.length || 0),
    0
  )
  const activeDaysCount = Object.values(availability).filter(
    (slots) => slots && slots.length > 0
  ).length
  const totalWeeklyHours = (totalWeeklySlots * 0.5).toFixed(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSavedSuccess(false)
    setLoading(true)

    try {
      const res = await apiFetch<{ user?: any; access_token?: string }>('/api/doctor/profile', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          avatar_url: avatar,
          specialty,
          biography: bio,
          clinic_address: clinicAddress,
          consultation_fee: Number(fee),
          years_experience: Number(experience),
          availability_grid: availability,
        }),
      })

      // Update local storage and context synchronously
      setDoctorSetupCompleted(true)
      localStorage.setItem('medbook_doctor_setup_completed', 'true')
      if (res?.user) {
        updateUser(res.user, res.access_token)
      } else {
        updateUser({ fullName: fullName.trim(), avatarUrl: avatar }, res?.access_token)
      }
      await refreshUser()

      setSavedSuccess(true)
      window.location.href = '/doctor'
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top bar with back to dashboard link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/doctor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Doctor Practice Settings
          </span>
        </div>

        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Practice Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {step === 1
              ? 'Update Doctor Profile'
              : step === 2
              ? 'Update Consultation Fee & Clinic'
              : 'Update Weekly Availability'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {step === 1
              ? 'Manage your identity, specialty, avatar, medical biography, and years of clinical experience.'
              : step === 2
              ? 'Set your consultation fees and primary clinic location for patient visits.'
              : 'Configure your weekly working days and booking time slots.'}
          </p>
        </div>

        {/* Step / Tab Switcher (Direct Clickable Tabs) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-8 bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { s: 1, label: 'Profile', icon: Stethoscope },
            { s: 2, label: 'Fee & Clinic', icon: DollarSign },
            { s: 3, label: 'Availability', icon: CalendarDays },
          ].map(({ s, label, icon: Icon }) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStep(s as 1 | 2 | 3)
                setSavedSuccess(false)
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                step === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              Your changes have been saved to your practice profile!
            </div>
            <Link
              href="/doctor"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Form Body */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ─── TAB 1: Specialty, Experience, Bio, Avatar ─── */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Doctor Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Sarah Jenkins, MD"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Doctor Avatar / Photo
                  </label>
                  <AvatarPicker
                    currentAvatar={avatar}
                    name={fullName}
                    role="DOCTOR"
                    onSelect={(selected) => setAvatar(selected)}
                    allowDeviceUpload={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Medical Specialty <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    >
                      {SPECIALTIES.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                    <Stethoscope className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Years of Clinical Experience
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                    <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Professional Biography & Background
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your medical education, hospital affiliations, and areas of expertise..."
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 2: Fee & Clinic Location ─── */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Consultation Fee ($ USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="2000"
                      step="5"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="150"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard fee charged per 30-minute video or in-person consultation visit.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Clinic / Office Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      placeholder="e.g. 450 Lexington Ave, Suite 1200, New York, NY 10017"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed on your public profile and on appointment booking confirmations.
                  </p>
                </div>
              </div>
            )}

            {/* ─── TAB 3: Weekly Availability Grid (9:00 AM – 9:00 PM) ─── */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in">
                {/* Header & Stats Banner */}
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl p-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                      30-Minute Consultation Slots (9:00 AM – 9:00 PM)
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Enable or disable half-hour consultation sessions and manage your days off.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-blue-200/60 shadow-xs text-center">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total Slots</span>
                      <span className="text-xs font-extrabold text-blue-700">{totalWeeklySlots} / wk</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-blue-200/60 shadow-xs text-center">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Weekly Hours</span>
                      <span className="text-xs font-extrabold text-emerald-700">{totalWeeklyHours} hrs</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-blue-200/60 shadow-xs text-center">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Working Days</span>
                      <span className="text-xs font-extrabold text-indigo-700">{activeDaysCount} / 7 days</span>
                    </div>
                  </div>
                </div>

                {/* Quick Schedule Presets Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Quick Schedule Presets
                    </span>
                    <span className="text-[10px] text-slate-400">Apply to Mon–Fri</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyGlobalPreset('standard-9-5')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Sun className="h-3.5 w-3.5 text-blue-600" />
                      Standard (9 AM – 5 PM)
                    </button>

                    <button
                      type="button"
                      onClick={() => applyGlobalPreset('full-9-9')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Full (9 AM – 9 PM)
                    </button>

                    <button
                      type="button"
                      onClick={() => applyGlobalPreset('morning-only')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1.5"
                    >
                      <Sunrise className="h-3.5 w-3.5 text-amber-600" />
                      Morning (9 AM – 1 PM)
                    </button>

                    <button
                      type="button"
                      onClick={() => applyGlobalPreset('evening-only')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                    >
                      <Moon className="h-3.5 w-3.5 text-indigo-600" />
                      Evening (4 PM – 9 PM)
                    </button>

                    <button
                      type="button"
                      onClick={() => applyGlobalPreset('clear-all')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clear All (All Days Off)
                    </button>
                  </div>
                </div>

                {/* Day-by-Day Grid */}
                <div className="space-y-3.5">
                  {DAYS.map((day) => {
                    const slots = availability[day] || []
                    const isWorking = slots.length > 0
                    const isFullDay = slots.length === ALL_AVAILABLE_SLOTS.length
                    const isJustCopied = copiedDay === day

                    return (
                      <div
                        key={day}
                        className={`p-4 rounded-2xl border transition-all ${
                          isWorking
                            ? 'bg-slate-50/80 border-slate-200 shadow-xs'
                            : 'bg-slate-100/50 border-slate-200/80'
                        }`}
                      >
                        {/* Day Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-200/70">
                          <div className="flex items-center gap-3">
                            <span className="w-12 font-extrabold text-sm text-slate-800">{day}</span>

                            {/* Master Day Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => toggleDayOff(day)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                isWorking ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                              title={isWorking ? `Click to mark ${day} as Day Off` : `Click to mark ${day} as Working Day`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isWorking ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>

                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                isFullDay
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : isWorking
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isFullDay
                                ? `All 25 Slots Active (12.5 hrs)`
                                : isWorking
                                ? `${slots.length} slots active (${(slots.length * 0.5).toFixed(1)} hrs)`
                                : '🔴 Day Off'}
                            </span>
                          </div>

                          {/* Quick Actions for this Day (when working) */}
                          {isWorking && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => togglePeriodSlots(day, SLOT_PERIODS[0].slots)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 transition-all"
                              >
                                Morning (9-12)
                              </button>

                              <button
                                type="button"
                                onClick={() => togglePeriodSlots(day, SLOT_PERIODS[1].slots)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 transition-all"
                              >
                                Afternoon (12-5)
                              </button>

                              <button
                                type="button"
                                onClick={() => togglePeriodSlots(day, SLOT_PERIODS[2].slots)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all"
                              >
                                Evening (5-9)
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleFullDay(day)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                  isFullDay
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                {isFullDay ? 'Clear' : 'Select All 9-9'}
                              </button>

                              <button
                                type="button"
                                onClick={() => copyDayToWeekdays(day)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center gap-1"
                                title={`Copy ${day}'s slots to Mon–Fri`}
                              >
                                {isJustCopied ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-slate-400" />
                                    <span>To Mon–Fri</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Collapsed State for Day Off */}
                        {!isWorking ? (
                          <div className="mt-2.5 flex items-center justify-between py-2.5 px-3.5 bg-white/80 rounded-xl border border-slate-200/60 text-xs text-slate-500">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-400" />
                              Doctor is off on {day} — No patient consultations will be scheduled.
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleDayOff(day)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              Set as Working Day
                            </button>
                          </div>
                        ) : (
                          /* 25 Half-Hour Slots (9:00 AM – 9:00 PM) */
                          <div className="mt-3.5 space-y-2.5">
                            {SLOT_PERIODS.map((period) => (
                              <div key={period.name} className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                  <period.icon className="h-3 w-3 text-slate-400" />
                                  {period.name}
                                </span>

                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
                                  {period.slots.map((slot) => {
                                    const active = slots.includes(slot)
                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => toggleDaySlot(day, slot)}
                                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                                          active
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                                        }`}
                                      >
                                        {active && <Check className="h-3 w-3 stroke-[3]" />}
                                        <span>{slot}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 rotate-45 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step Navigation / Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-btn disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function DoctorSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading practice settings...</p>
          </div>
        </div>
      }
    >
      <DoctorSetupContent />
    </Suspense>
  )
}
