'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/authContext'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
  ChevronRight,
  Video,
  MapPin,
  AlertCircle,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Loader2,
  CalendarCheck,
  Eye,
  Edit3,
  X,
  Camera,
  DollarSign,
} from 'lucide-react'
import {
  getAppointments,
  confirmAppointmentApi,
  completeAppointmentApi,
  cancelAppointmentApi,
  AppointmentStatus,
  ApiAppointment,
} from '@/lib/api/appointments'
import { Avatar } from '@/components/ui/Avatar'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { apiFetch } from '@/lib/api/client'
import VideoConsultationModal from '@/components/consultation/VideoConsultationModal'

// ─── Types ───────────────────────────────────────────────────────────────────

type DoctorAppointment = {
  id: string | number
  patientId: string
  patientName: string
  patientEmail?: string
  date: string
  time: string
  status: AppointmentStatus
  type: 'Video Consultation' | 'In-Person Visit'
  location?: string
  cancellationReason?: string
  rawScheduledAt?: string
}

function parseDateAndTime(isoString?: string) {
  if (!isoString) return { date: 'Not set', time: 'Not set' }
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { date: 'Not set', time: 'Not set' }
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return { date, time }
  } catch {
    return { date: 'Not set', time: 'Not set' }
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  description,
}: {
  title: string
  value: number
  icon: React.ElementType
  iconClass: string
  description: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          <p className="text-xs text-slate-400 mt-2">{description}</p>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    RESCHEDULED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }

  const labels: Record<AppointmentStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
    RESCHEDULED: 'Rescheduled',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
        styles[status] || styles.PENDING
      }`}
    >
      {status === 'PENDING' && <Clock3 className="w-3.5 h-3.5" />}
      {status === 'CONFIRMED' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {status === 'CANCELLED' && <XCircle className="w-3.5 h-3.5" />}
      {status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {status === 'RESCHEDULED' && <Clock3 className="w-3.5 h-3.5" />}
      {labels[status] || status}
    </span>
  )
}

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({
  appointment,
  onConfirm,
  onDecline,
  onComplete,
  onJoinVideoCall,
}: {
  appointment: DoctorAppointment
  onConfirm?: () => void
  onDecline?: () => void
  onComplete?: () => void
  onJoinVideoCall?: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Left: Patient Info */}
        <div className="flex items-start gap-3.5 min-w-[240px]">
          <Avatar name={appointment.patientName} size="lg" />

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900">{appointment.patientName}</h4>
              <StatusBadge status={appointment.status} />
            </div>

            {appointment.patientEmail && (
              <p className="text-xs text-slate-500 mt-0.5">{appointment.patientEmail}</p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
              {appointment.type === 'Video Consultation' ? (
                <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                  <Video className="w-3.5 h-3.5" />
                  Video Call
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  In-Person Visit
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Schedule Info */}
        <div className="grid grid-cols-2 gap-4 lg:flex-1 p-3 bg-slate-50 rounded-xl">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Scheduled Date</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              {appointment.date}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400 font-medium">Time Slot</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 text-blue-600" />
              {appointment.time}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 lg:justify-end">
          {(appointment.status === 'PENDING' || appointment.status === 'RESCHEDULED') && (
            <>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                {appointment.status === 'RESCHEDULED' ? 'Approve Reschedule' : 'Confirm'}
              </button>

              <button
                type="button"
                onClick={onDecline}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-700 text-xs font-bold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </>
          )}

          {appointment.status === 'CONFIRMED' && (
            <div className="flex items-center gap-2 flex-wrap lg:justify-end">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Confirmed
              </span>

              {appointment.type === 'Video Consultation' && (
                <button
                  type="button"
                  onClick={onJoinVideoCall}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-btn transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Video Call</span>
                </button>
              )}

              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
                title="Mark consultation as completed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            </div>
          )}

          {appointment.status === 'CANCELLED' && (
            <div className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{appointment.cancellationReason || 'Cancelled'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-14 px-6 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <CalendarCheck className="w-7 h-7" />
      </div>

      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// ─── Edit Doctor Profile Modal ────────────────────────────────────────────────

function EditDoctorProfileModal({
  currentName,
  currentAvatar,
  email,
  onClose,
  onSave,
}: {
  currentName: string
  currentAvatar?: string
  email: string
  onClose: () => void
  onSave: (newName: string, newAvatar: string) => Promise<void>
}) {
  const [name, setName] = useState(currentName)
  const [avatar, setAvatar] = useState(currentAvatar || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      return setError('Doctor name cannot be empty.')
    }
    setSaving(true)
    setError('')
    try {
      await onSave(name.trim(), avatar)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to update doctor profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Doctor Profile & Avatar</h2>
              <p className="text-xs text-slate-500">Update your clinical identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Doctor Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium"
              placeholder="e.g. Dr. Sarah Jenkins, MD"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Avatar or Upload Photo
            </label>
            <AvatarPicker
              currentAvatar={avatar}
              name={name}
              role="DOCTOR"
              onSelect={(selected) => setAvatar(selected)}
              allowDeviceUpload={true}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-btn"
            >
              {saving ? 'Saving...' : 'Save Profile & Avatar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, isDoctorSetupCompleted, loading: authLoading, logout, updateUser, refreshUser } = useAuth()
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'history'>('requests')

  const [declineId, setDeclineId] = useState<string | number | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [activeVideoCall, setActiveVideoCall] = useState<DoctorAppointment | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated or not doctor
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'DOCTOR')) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Redirect if doctor profile setup is incomplete
  useEffect(() => {
    if (!authLoading && user && user.role === 'DOCTOR' && !isDoctorSetupCompleted) {
      router.push('/doctor/setup')
    }
  }, [authLoading, user, isDoctorSetupCompleted, router])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch real appointments from Supabase for this doctor (with instant real-time auto-sync)
  useEffect(() => {
    let isMounted = true

    async function loadDoctorAppointments(silent = false) {
      if (!silent) setLoading(true)
      try {
        const res = await getAppointments()
        if (!isMounted) return
        if (res?.appointments) {
          const mapped: DoctorAppointment[] = res.appointments.map((item: ApiAppointment) => {
            const { date, time } = parseDateAndTime(item.scheduled_at)
            const isTimePassed = item.scheduled_at ? new Date(item.scheduled_at).getTime() <= Date.now() : false
            const effectiveStatus: AppointmentStatus =
              item.status === 'CONFIRMED' && isTimePassed ? 'COMPLETED' : item.status

            return {
              id: item.id,
              patientId: item.patient?.id || '',
              patientName: item.patient?.full_name || 'Patient',
              patientEmail: item.patient?.email,
              date,
              time,
              status: effectiveStatus,
              type: item.type,
              location: item.location,
              cancellationReason: item.cancellation_reason,
              rawScheduledAt: item.scheduled_at,
            }
          })
          setAppointments(mapped)
        } else {
          setAppointments([])
        }
      } catch (err) {
        if (!silent) {
          console.error('Error fetching doctor appointments from database:', err)
          setAppointments([])
        }
      } finally {
        if (isMounted && !silent) {
          setLoading(false)
        }
      }
    }

    if (user && user.role === 'DOCTOR') {
      loadDoctorAppointments(false)

      // 1. Instant 0ms Cross-Tab Sync via BroadcastChannel
      let broadcastChannel: BroadcastChannel | null = null
      try {
        broadcastChannel = new BroadcastChannel('medbook_sync_channel')
        broadcastChannel.onmessage = () => {
          loadDoctorAppointments(true)
        }
      } catch {}

      // 2. Instant Cross-Tab Storage & Custom Events
      const handleStoragePing = (e: StorageEvent) => {
        if (e.key === 'medbook_sync_ping') {
          loadDoctorAppointments(true)
        }
      }
      const handleCustomSync = () => loadDoctorAppointments(true)
      window.addEventListener('storage', handleStoragePing)
      window.addEventListener('medbook:sync', handleCustomSync)

      // 3. Fast Heartbeat Polling (every 2.5 seconds)
      const intervalId = setInterval(() => {
        loadDoctorAppointments(true)
      }, 2500)

      // 4. Instant Sync on Window / Tab Focus
      const handleFocus = () => loadDoctorAppointments(true)
      window.addEventListener('focus', handleFocus)

      return () => {
        isMounted = false
        if (broadcastChannel) broadcastChannel.close()
        window.removeEventListener('storage', handleStoragePing)
        window.removeEventListener('medbook:sync', handleCustomSync)
        window.removeEventListener('focus', handleFocus)
        clearInterval(intervalId)
      }
    }
  }, [user])

  // ─── Stats Calculation
  const stats = useMemo(() => {
    const totalPatients = new Set(
      appointments.map((appointment) => appointment.patientName).filter(Boolean)
    ).size

    const confirmed = appointments.filter(
      (appointment) => appointment.status === 'CONFIRMED'
    ).length

    const completed = appointments.filter(
      (appointment) => appointment.status === 'COMPLETED'
    ).length

    const confirmedAndCompleted = appointments.filter(
      (appointment) => appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED'
    ).length

    const pending = appointments.filter(
      (appointment) => appointment.status === 'PENDING' || appointment.status === 'RESCHEDULED'
    ).length

    const history = appointments.filter(
      (appointment) => appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'
    ).length

    return {
      totalPatients,
      confirmed,
      completed,
      confirmedAndCompleted,
      pending,
      history,
      totalAppointments: appointments.length,
    }
  }, [appointments])

  // ─── Tab filtering
  const filteredAppointments = useMemo(() => {
    if (activeTab === 'requests') {
      return appointments.filter(
        (appointment) => appointment.status === 'PENDING' || appointment.status === 'RESCHEDULED'
      )
    }

    if (activeTab === 'upcoming') {
      return appointments.filter((appointment) => appointment.status === 'CONFIRMED')
    }

    return appointments.filter(
      (appointment) =>
        appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'
    )
  }, [appointments, activeTab])

  // ─── Confirm appointment
  const handleConfirm = async (id: string | number) => {
    try {
      await confirmAppointmentApi(id)
    } catch (err) {
      console.warn('Confirm API warning:', err)
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: 'CONFIRMED' as AppointmentStatus,
            }
          : appointment
      )
    )
  }

  // ─── Complete appointment
  const handleComplete = async (id: string | number) => {
    try {
      await completeAppointmentApi(id)
    } catch (err) {
      console.warn('Complete API warning:', err)
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: 'COMPLETED' as AppointmentStatus,
            }
          : appointment
      )
    )
  }

  const [selectedDeclinePreset, setSelectedDeclinePreset] = useState(
    'Schedule conflict at this requested consultation time'
  )

  // ─── Decline appointment
  const handleDecline = async () => {
    if (!declineId) return
    const finalReason =
      selectedDeclinePreset === 'Other reason'
        ? declineReason.trim() || 'Appointment request declined by doctor.'
        : declineReason.trim()
        ? `${selectedDeclinePreset} — ${declineReason.trim()}`
        : selectedDeclinePreset

    try {
      await cancelAppointmentApi(declineId, finalReason)
    } catch (err) {
      console.warn('Decline API warning:', err)
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === declineId
          ? {
              ...appointment,
              status: 'CANCELLED' as AppointmentStatus,
              cancellationReason: finalReason,
            }
          : appointment
      )
    )

    setDeclineId(null)
    setDeclineReason('')
  }

  const handleSaveProfile = async (newName: string, newAvatar: string) => {
    await apiFetch('/api/doctor/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: newName,
        avatar_url: newAvatar,
      }),
    })

    updateUser({ fullName: newName, avatarUrl: newAvatar })
    await refreshUser()
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50">
      {/* Dashboard Top Banner */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Greeting */}
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-500">Live Dashboard</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Good morning, {user?.fullName || 'Doctor'} 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Here is your live appointment schedule synced from your medical practice.
              </p>
            </div>

            {/* Action Buttons (Docked to the RIGHT side on mobile & desktop) */}
            <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap self-end sm:self-auto w-full sm:w-auto">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">
                  Accepting Appointments
                </span>
              </div>

              {/* Update Fee Button (Mobile & Desktop) */}
              <Link
                href="/doctor/setup?tab=fee"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all shadow-xs"
                title="Update your consultation fee"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fee</span>
              </Link>

              {/* Update Availability Button (Mobile & Desktop) */}
              <Link
                href="/doctor/setup?tab=schedule"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all shadow-xs"
                title="Update your weekly consultation hours & slots"
              >
                <Clock3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Availability</span>
              </Link>

              {/* View Public Profile Button */}
              <Link
                href={`/doctors/${user?.id || ''}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all shadow-xs"
                title="View your public doctor profile as patients see it"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Public</span>
              </Link>

              {/* Edit Profile & Avatar Button */}
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-btn"
                title="Edit your doctor profile name and avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
            description="Patients under your care"
          />

          <StatCard
            title="Confirmed Visits"
            value={stats.confirmedAndCompleted}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
            description={
              stats.completed > 0
                ? `${stats.confirmed} upcoming • ${stats.completed} completed`
                : 'All confirmed consultations'
            }
          />

          <StatCard
            title="Pending Requests"
            value={stats.pending}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
            description="Awaiting your confirmation"
          />

          <StatCard
            title="Total Records"
            value={stats.totalAppointments}
            icon={CalendarDays}
            iconClass="bg-indigo-50 text-indigo-600"
            description="All practice consultations"
          />
        </div>

        {/* Appointment section */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-5 sm:px-6 pt-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Patient Appointments</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm or decline consultation requests from patients.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/doctor/setup?tab=fee"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  Update Fee
                </Link>

                <Link
                  href="/doctor/setup?tab=schedule"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Clock3 className="w-3 h-3 text-blue-600" />
                  Update Availability
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6">
              {[
                { id: 'requests', label: 'Requests', count: stats.pending },
                { id: 'upcoming', label: 'Upcoming', count: stats.confirmed },
                {
                  id: 'history',
                  label: 'History',
                  count: stats.history,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'requests' | 'upcoming' | 'history')}
                  className={`relative pb-3 text-sm font-semibold transition-colors ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment list */}
          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600">Loading your appointments...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onConfirm={() => handleConfirm(appointment.id)}
                    onDecline={() => setDeclineId(appointment.id)}
                    onComplete={() => handleComplete(appointment.id)}
                    onJoinVideoCall={() => setActiveVideoCall(appointment)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  activeTab === 'requests'
                    ? 'No Pending Requests'
                    : activeTab === 'upcoming'
                    ? 'No Upcoming Appointments'
                    : 'No Appointment History'
                }
                description={
                  activeTab === 'requests'
                    ? 'New consultation bookings from patients will appear here for you to confirm or decline.'
                    : activeTab === 'upcoming'
                    ? 'Confirmed patient appointments will appear here.'
                    : 'Completed and cancelled appointments will appear here.'
                }
              />
            )}
          </div>
        </section>
      </main>

      {/* Video Consultation Modal */}
      {activeVideoCall && (
        <VideoConsultationModal
          isOpen={activeVideoCall !== null}
          onClose={() => setActiveVideoCall(null)}
          appointmentId={activeVideoCall.id}
          patientName={activeVideoCall.patientName}
          doctorName={user?.fullName || 'Doctor'}
          userRole="DOCTOR"
          userEmail={user?.email || ''}
          onCallEnd={() => {
            // Video consultation ended
          }}
        />
      )}

      {/* Edit Doctor Profile Modal */}
      {showEditProfileModal && (
        <EditDoctorProfileModal
          currentName={user?.fullName || ''}
          currentAvatar={user?.avatarUrl}
          email={user?.email || ''}
          onClose={() => setShowEditProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Decline Modal */}
      {declineId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">Decline Appointment Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please select a reason to notify the patient.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Decline Reason <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {[
                    'Emergency surgery / Hospital on-call duties',
                    'Schedule conflict at this requested consultation time',
                    'Patient condition requires in-person emergency hospital care',
                    'Clinic closed / Doctor on official medical leave',
                    'Other reason',
                  ].map((preset) => (
                    <label
                      key={preset}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedDeclinePreset === preset
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="doctor_decline_preset"
                        value={preset}
                        checked={selectedDeclinePreset === preset}
                        onChange={() => setSelectedDeclinePreset(preset)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="decline-reason" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Additional Explanation <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  id="decline-reason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Optional note or guidance for the patient..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeclineId(null)
                    setDeclineReason('')
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Keep Request
                </button>

                <button
                  type="button"
                  onClick={handleDecline}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}