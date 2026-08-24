'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Star,
  Video,
  MapPin,
  UserRound,
  ArrowRight,
  X,
  MessageSquare,
  RotateCcw,
  Sparkles,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  User,
  Mail,
  ShieldCheck,
  CalendarPlus,
  CalendarCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/authContext'
import {
  getAppointments,
  cancelAppointmentApi,
  rescheduleAppointmentApi,
  submitReviewApi,
  AppointmentStatus,
  ApiAppointment,
} from '@/lib/api/appointments'
import { getDoctorDetail } from '@/lib/api/doctors'
import { updatePatientProfile, getPatientProfile } from '@/lib/api/patient'
import { getAppointmentTimeWindow } from '@/lib/utils/appointmentTime'
import { Avatar } from '@/components/ui/Avatar'
import VideoConsultationModal from '@/components/consultation/VideoConsultationModal'
import { AvatarPicker } from '@/components/ui/AvatarPicker'

// ─── Types ───────────────────────────────────────────────────────────────────

export type PatientAppointment = {
  id: string | number
  doctorId: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: AppointmentStatus
  type: 'Video Consultation' | 'In-Person Visit'
  location?: string
  cancellationReason?: string
  completed: boolean
  reviewed?: boolean
  rawScheduledAt?: string
}

interface DaySlot {
  dateObj: Date
  dateStr: string
  dayName: string
  dayNumber: number
  fullDay: string
  available: boolean
  slots: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSlotInFuture(dateObj: Date, slotTimeStr: string): boolean {
  const now = new Date()
  const slotDate = new Date(dateObj)

  const isFutureDay =
    slotDate.getFullYear() > now.getFullYear() ||
    (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() > now.getMonth()) ||
    (slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() > now.getDate())

  if (isFutureDay) return true

  const isPastDay =
    slotDate.getFullYear() < now.getFullYear() ||
    (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() < now.getMonth()) ||
    (slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() < now.getDate())

  if (isPastDay) return false

  // For TODAY: must have at least 1-hour (60 minutes) advance notice buffer
  // (e.g. if time enters 3:00 PM or 3:01 PM, a 4:00 PM slot is hidden)
  try {
    const [timePart, meridiem] = slotTimeStr.trim().split(' ')
    let [hours, minutes] = timePart.split(':').map(Number)
    if (meridiem === 'PM' && hours < 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0

    const slotDateTime = new Date(now)
    slotDateTime.setHours(hours, minutes, 0, 0)

    const ONE_HOUR_MS = 60 * 60 * 1000
    return slotDateTime.getTime() - now.getTime() > ONE_HOUR_MS
  } catch {
    return true
  }
}

function getUpcomingDays(
  startDateOffset = 0,
  availabilityGrid: Record<string, string[]> = {}
): DaySlot[] {
  const days: DaySlot[] = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + startDateOffset + i)

    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNumber = d.getDate()
    const fullDay = d.toLocaleDateString('en-US', { weekday: 'long' })

    const rawConfiguredSlots = availabilityGrid[dayName] || []
    // Show only future slots (hides passed slots for today)
    const validFutureSlots = rawConfiguredSlots.filter((slot) => isSlotInFuture(d, slot))
    const available = validFutureSlots.length > 0

    days.push({
      dateObj: d,
      dateStr,
      dayName,
      dayNumber,
      fullDay,
      available,
      slots: validFutureSlots,
    })
  }

  return days
}

function parseDateAndTime(isoString: string): { date: string; time: string } {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { date: 'TBD', time: 'TBD' }
    return {
      date: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }
  } catch {
    return { date: 'TBD', time: 'TBD' }
  }
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const configs: Record<AppointmentStatus, { label: string; className: string }> = {
    CONFIRMED: {
      label: 'Confirmed',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    PENDING: {
      label: 'Pending Confirmation',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    RESCHEDULED: {
      label: 'Reschedule Requested',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    CANCELLED: {
      label: 'Cancelled',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  }

  const config = configs[status] || configs.PENDING

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: {
  title: string
  value: number
  icon: React.ElementType
  iconClass: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  onReview,
  onJoinVideoCall,
}: {
  appointment: PatientAppointment
  onCancel: (appointment: PatientAppointment) => void
  onReschedule: (appointment: PatientAppointment) => void
  onReview: (appointment: PatientAppointment) => void
  onJoinVideoCall?: (appointment: PatientAppointment) => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={appointment.doctor} size="md" />
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{appointment.doctor}</h4>
            <p className="text-xs text-blue-600 font-medium">{appointment.specialty}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {/* Details strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <CalendarDays className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="font-semibold">{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Clock3 className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="font-semibold">{appointment.time}</span>
        </div>
      </div>

      {/* Location / Type */}
      {appointment.location && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{appointment.location}</span>
        </div>
      )}

      {appointment.cancellationReason && (
        <div className="mt-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
          <p className="text-[11px] font-semibold text-red-700">Cancellation / Status Note</p>
          <p className="text-xs text-red-600 mt-0.5">{appointment.cancellationReason}</p>
        </div>
      )}

      {/* Actions */}
      {appointment.status !== 'CANCELLED' && !appointment.completed && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          {appointment.status === 'RESCHEDULED' || appointment.cancellationReason?.toLowerCase().includes('rescheduled') ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 border border-slate-200 cursor-not-allowed"
              title="Each appointment can be rescheduled only once. To change again, please cancel and book a new visit."
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              Rescheduled (1/1 Limit)
            </span>
          ) : (
            <button
              onClick={() => onReschedule(appointment)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reschedule
            </button>
          )}

          <button
            onClick={() => onCancel(appointment)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </button>

          {(appointment.type === 'Video Consultation' || appointment.type?.toLowerCase().includes('video')) && appointment.status === 'CONFIRMED' && (() => {
            const timeWindow = getAppointmentTimeWindow(appointment.date, appointment.time, 30, 10)
            if (timeWindow.canJoin) {
              return (
                <button
                  type="button"
                  onClick={() => onJoinVideoCall?.(appointment)}
                  className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-btn animate-pulse"
                  title="Consultation room is open! Click to join."
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Join Video Call (Live)</span>
                </button>
              )
            } else if (timeWindow.isUpcoming) {
              return (
                <button
                  type="button"
                  disabled
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed"
                  title={`Room opens 10 minutes before start time (${timeWindow.formattedOpensAt}).`}
                >
                  <Video className="h-3.5 w-3.5 text-slate-400" />
                  <span>Opens at {timeWindow.formattedOpensAt}</span>
                </button>
              )
            } else {
              return (
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  Session Concluded
                </span>
              )
            }
          })()}
        </div>
      )}

      {appointment.completed && !appointment.reviewed && (
        <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onReview(appointment)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Star className="h-3.5 w-3.5" />
            Leave a Review
          </button>
        </div>
      )}

      {appointment.reviewed && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Review submitted
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Reschedule Slot Picker Modal (2-Weeks + Future Slots Only) ─────────────────

function RescheduleModal({
  appointment,
  onClose,
  onSuccess,
}: {
  appointment: PatientAppointment
  onClose: () => void
  onSuccess: (appointmentId: string | number, newDate: string, newTime: string) => void
}) {
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availabilityGrid, setAvailabilityGrid] = useState<Record<string, string[]>>({})
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    async function loadDoctorSchedule() {
      setLoadingSchedule(true)
      try {
        const res = await getDoctorDetail(appointment.doctorId)
        if (res?.doctor?.availabilityGrid) {
          setAvailabilityGrid(res.doctor.availabilityGrid)
        } else {
          setAvailabilityGrid({
            Mon: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
            Tue: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
            Wed: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
            Thu: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
            Fri: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
            Sat: ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'],
          })
        }
      } catch (err) {
        setAvailabilityGrid({
          Mon: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
          Tue: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
          Wed: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
          Thu: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
          Fri: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
          Sat: ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'],
        })
      } finally {
        setLoadingSchedule(false)
      }
    }
    loadDoctorSchedule()
  }, [appointment.doctorId])

  const days = useMemo(() => {
    return getUpcomingDays(weekOffset * 7, availabilityGrid)
  }, [weekOffset, availabilityGrid])

  const selectedDay = days[selectedDayIndex] || days[0]
  const currentSlots = selectedDay?.slots || []

  // Update selected slot when days or week changes
  useEffect(() => {
    const firstAvail = days.findIndex((d) => d.available)
    const idx = firstAvail >= 0 ? firstAvail : 0
    setSelectedDayIndex(idx)
    const slots = days[idx]?.slots || []
    setSelectedSlot(slots.length > 0 ? slots[0] : '')
  }, [days])

  const handleSelectDay = (index: number) => {
    setSelectedDayIndex(index)
    const slots = days[index]?.slots || []
    setSelectedSlot(slots.length > 0 ? slots[0] : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedSlot) {
      setError('Please select an available time slot for your reschedule request.')
      return
    }

    setSubmitting(true)

    try {
      const targetDate = selectedDay?.dateObj || new Date()
      const [timePart, meridiem] = selectedSlot.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)
      if (meridiem === 'PM' && hours < 12) hours += 12
      if (meridiem === 'AM' && hours === 12) hours = 0

      const scheduledDate = new Date(targetDate)
      scheduledDate.setHours(hours, minutes, 0, 0)

      await rescheduleAppointmentApi(appointment.id, scheduledDate.toISOString())

      onSuccess(appointment.id, selectedDay.dateStr, selectedSlot)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to submit reschedule request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Reschedule Appointment</h2>
              <p className="text-xs text-slate-500">Pick a new available slot with Dr. {appointment.doctor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current appointment info */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Current Schedule</p>
            <p className="font-bold text-slate-800 mt-0.5">
              {appointment.date} at {appointment.time}
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700">
              {appointment.specialty}
            </span>
          </div>
        </div>

        {loadingSchedule ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" />
            <p className="text-xs font-semibold text-slate-600">Loading doctor&apos;s live schedule...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Week navigation (Max 2 Weeks) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Select New Date</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-500 px-1">
                    {weekOffset === 0 ? 'This Week' : 'Next Week'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => Math.min(1, w + 1))}
                    disabled={weekOffset >= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title={weekOffset >= 1 ? 'Booking limited to 2 weeks' : 'Next week'}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 7-Day horizontal strip */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, index) => {
                  const isSelected = selectedDayIndex === index
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      disabled={!d.available}
                      onClick={() => handleSelectDay(index)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                          : d.available
                          ? 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200/50 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {d.dayName}
                      </span>
                      <span className="text-xs font-bold mt-0.5">{d.dayNumber}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isSelected
                            ? 'bg-white'
                            : d.available
                            ? 'bg-emerald-500'
                            : 'bg-transparent'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slots (Future only) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Available Time Slots</span>
                <span className="text-[11px] text-slate-500">
                  {selectedDay?.fullDay}, {selectedDay?.dateStr}
                </span>
              </div>

              {currentSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {currentSlots.map((slot) => {
                    const isSlotSelected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSlotSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-white'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-xs font-semibold text-amber-800">No slots available for this day.</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Please select another date above.</p>
                </div>
              )}
            </div>

            {/* Reschedule Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Reason for Rescheduling <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let Dr. know why you need to adjust your visit..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedSlot || currentSlots.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-btn flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>Request Reschedule</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function EditProfileModal({
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

  useEffect(() => {
    setName(currentName)
    setAvatar(currentAvatar || '')
  }, [currentName, currentAvatar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      return setError('Name cannot be empty.')
    }
    setSaving(true)
    setError('')
    try {
      await onSave(name.trim(), avatar)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.')
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
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Patient Profile</h2>
              <p className="text-xs text-slate-500">Update your name and avatar</p>
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">{email}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Email is linked to your account.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Choose Avatar
            </label>
            <AvatarPicker
              currentAvatar={avatar}
              name={name}
              role="PATIENT"
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PATIENT_CANCELLATION_REASONS = [
  'Schedule conflict / Unexpected commitment',
  'Feeling better / Symptoms resolved',
  'Need to see a different specialist or visit in-person',
  'Booked duplicate or accidental slot',
  'Need to reschedule for a later date',
  'Other reason',
]

function CancelModal({
  appointment,
  onClose,
  onConfirm,
}: {
  appointment: PatientAppointment
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [selectedPreset, setSelectedPreset] = useState(PATIENT_CANCELLATION_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const finalReason =
      selectedPreset === 'Other reason'
        ? customReason.trim() || 'Cancelled by patient.'
        : customReason.trim()
        ? `${selectedPreset} — ${customReason.trim()}`
        : selectedPreset

    onConfirm(finalReason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cancel Appointment</h2>
              <p className="text-xs text-slate-500">Please provide a reason for cancellation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Appointment summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl mb-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-xs text-slate-900">{appointment.doctor}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {appointment.date} &middot; {appointment.time}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {appointment.type}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {PATIENT_CANCELLATION_REASONS.map((preset) => (
                <label
                  key={preset}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPreset === preset
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="patient_cancel_reason"
                    value={preset}
                    checked={selectedPreset === preset}
                    onChange={() => setSelectedPreset(preset)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{preset}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Additional Details <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Any additional message for Dr. and clinic staff..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Keep Appointment
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReviewModal({
  appointment,
  onClose,
  onSubmit,
}: {
  appointment: PatientAppointment
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    onSubmit(rating, comment)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Leave a Review</h2>
            <p className="text-xs text-slate-500 mt-1">How was your visit with {appointment.doctor}?</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Feedback</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your consultation experience, professionalism, and care..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none font-normal"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Patient Dashboard ───────────────────────────────────────────────────

export default function PatientDashboard() {
  const { user, loading: authLoading, logout, updateUser, refreshUser } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [appointments, setAppointments] = useState<PatientAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelAppointment, setCancelAppointment] = useState<PatientAppointment | null>(null)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<PatientAppointment | null>(null)
  const [reviewAppointment, setReviewAppointment] = useState<PatientAppointment | null>(null)
  const [activeVideoCall, setActiveVideoCall] = useState<PatientAppointment | null>(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')

  const menuRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated or not patient
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'PATIENT')) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Initialize and keep live profile synced from database
  useEffect(() => {
    if (user?.fullName) {
      setDisplayName(user.fullName)
    }

    async function loadLiveProfile() {
      try {
        const res = await getPatientProfile()
        if (res?.profile?.full_name) {
          setDisplayName(res.profile.full_name)
          updateUser({
            fullName: res.profile.full_name,
            avatarUrl: res.profile.avatar_url,
          })
        }
      } catch (err) {
        console.warn('Failed to load patient live profile:', err)
      }
    }

    if (user && user.role === 'PATIENT') {
      loadLiveProfile()
    }
  }, [user?.id])

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

  // Fetch real appointments exclusively from Supabase (with instant real-time auto-sync)
  useEffect(() => {
    let isMounted = true

    async function loadLiveData(silent = false) {
      if (!silent) setLoading(true)
      try {
        const res = await getAppointments()
        if (!isMounted) return
        if (res?.appointments) {
          const mapped: PatientAppointment[] = res.appointments.map((item: ApiAppointment) => {
            const { date, time } = parseDateAndTime(item.scheduled_at)
            const isReviewed = typeof window !== 'undefined' && localStorage.getItem(`medbook_reviewed_${item.id}`) === 'true'
            const isSessionConcluded = item.scheduled_at ? new Date(item.scheduled_at).getTime() + 30 * 60 * 1000 <= Date.now() : false
            const isCompleted = item.status === 'COMPLETED' || (item.status === 'CONFIRMED' && isSessionConcluded)
            return {
              id: item.id,
              doctorId: item.doctor?.id || '1',
              doctor: item.doctor?.full_name || 'Dr. Specialist',
              specialty: item.doctor?.doctor_profiles?.specialty || 'General Care',
              location: item.location || item.doctor?.doctor_profiles?.clinic_address,
              date,
              time,
              status: (isCompleted ? 'COMPLETED' : item.status) as AppointmentStatus,
              type: item.type,
              cancellationReason: item.cancellation_reason,
              completed: isCompleted,
              reviewed: isReviewed,
              rawScheduledAt: item.scheduled_at,
            }
          })
          setAppointments(mapped)

          // Auto-prompt review for newly completed unreviewed appointments
          if (typeof window !== 'undefined') {
            const unreviewed = mapped.find(
              (a) =>
                (a.completed || a.status === 'COMPLETED') &&
                !a.reviewed &&
                sessionStorage.getItem(`medbook_review_dismissed_${a.id}`) !== 'true'
            )
            if (unreviewed) {
              setReviewAppointment((current) => current || unreviewed)
            }
          }
        } else {
          setAppointments([])
        }
      } catch (err) {
        if (!silent) {
          console.error('Error fetching patient appointments from database:', err)
          setAppointments([])
        }
      } finally {
        if (isMounted && !silent) {
          setLoading(false)
        }
      }
    }

    if (user && user.role === 'PATIENT') {
      loadLiveData(false)

      // 1. Instant 0ms Cross-Tab Sync via BroadcastChannel
      let broadcastChannel: BroadcastChannel | null = null
      try {
        broadcastChannel = new BroadcastChannel('medbook_sync_channel')
        broadcastChannel.onmessage = () => {
          loadLiveData(true)
        }
      } catch {}

      // 2. Instant Cross-Tab Storage & Custom Events
      const handleStoragePing = (e: StorageEvent) => {
        if (e.key === 'medbook_sync_ping') {
          loadLiveData(true)
        }
      }
      const handleCustomSync = () => loadLiveData(true)
      window.addEventListener('storage', handleStoragePing)
      window.addEventListener('medbook:sync', handleCustomSync)

      // 3. Fast Heartbeat Polling (every 2.5 seconds)
      const intervalId = setInterval(() => {
        loadLiveData(true)
      }, 2500)

      // 4. Instant Sync on Window / Tab Focus
      const handleFocus = () => loadLiveData(true)
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

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      upcoming: appointments.filter((a) => !a.completed && a.status !== 'CANCELLED').length,
      completed: appointments.filter((a) => a.completed || a.status === 'COMPLETED').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
    }
  }, [appointments])

  const handleCancel = async (reason: string) => {
    if (!cancelAppointment) return

    const cancelReason = reason || 'Cancelled by patient.'

    try {
      await cancelAppointmentApi(cancelAppointment.id, cancelReason)
    } catch (err) {
      console.warn('Cancel API error:', err)
    }

    setAppointments((items) =>
      items.map((item) =>
        item.id === cancelAppointment.id
          ? {
              ...item,
              status: 'CANCELLED' as AppointmentStatus,
              cancellationReason: cancelReason,
            }
          : item
      )
    )

    setCancelAppointment(null)
  }

  const handleRescheduleSuccess = (appointmentId: string | number, newDate: string, newTime: string) => {
    setAppointments((items) =>
      items.map((item) =>
        item.id === appointmentId
          ? {
              ...item,
              status: 'RESCHEDULED' as AppointmentStatus,
              date: newDate,
              time: newTime,
            }
          : item
      )
    )
    setRescheduleAppointment(null)
  }

  const handleReview = async (rating: number, comment: string) => {
    if (!reviewAppointment) return

    const apptId = reviewAppointment.id
    try {
      await submitReviewApi({
        appointment_id: apptId,
        doctor_id: reviewAppointment.doctorId,
        rating,
        comment,
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem(`medbook_reviewed_${apptId}`, 'true')
      }
    } catch (err) {
      console.warn('Submit review API error:', err)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`medbook_reviewed_${apptId}`, 'true')
      }
    }

    setAppointments((items) =>
      items.map((item) => (item.id === apptId ? { ...item, reviewed: true } : item))
    )

    setReviewAppointment(null)
  }

  const handleSaveProfile = async (newName: string, newAvatar: string) => {
    const res = await updatePatientProfile({ full_name: newName, avatar_url: newAvatar })
    setDisplayName(newName)
    if (res?.user) {
      updateUser(res.user, res.access_token)
    } else {
      updateUser({ fullName: newName, avatarUrl: newAvatar }, res?.access_token)
    }
    await refreshUser()
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (activeTab === 'upcoming') {
        return !appointment.completed && appointment.status !== 'CANCELLED'
      }
      if (activeTab === 'completed') {
        return appointment.completed || appointment.status === 'COMPLETED'
      }
      return appointment.status === 'CANCELLED'
    })
  }, [appointments, activeTab])

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Greeting */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              Patient Portal
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Good morning, {displayName ? displayName.split(' ')[0] : 'Patient'} 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your healthcare appointments, reschedule visits, and view consultation history.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 self-end sm:self-auto w-full sm:w-auto">
            <Link href="/doctors">
              <button className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs">
                <span>Find Doctor</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
              </button>
            </Link>

            {/* Edit Profile & Avatar Button */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors shadow-btn"
              title="Edit your patient profile name and avatar"
            >
              <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            title="Total Appointments"
            value={stats.total}
            icon={CalendarDays}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Upcoming"
            value={stats.upcoming}
            icon={CalendarClock}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />
        </div>

        {/* Appointments Section */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">My Appointments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time appointment schedule synced from your medical records.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {[
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as 'upcoming' | 'completed' | 'cancelled')
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment List / Loading / Empty State */}
          <div className="p-4 sm:p-5">
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
                    onCancel={setCancelAppointment}
                    onReschedule={setRescheduleAppointment}
                    onReview={setReviewAppointment}
                    onJoinVideoCall={setActiveVideoCall}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                  <CalendarPlus className="h-7 w-7" />
                </div>

                <h3 className="text-base font-bold text-slate-800">
                  {appointments.length === 0
                    ? 'No Appointments Yet'
                    : `No ${activeTab} appointments`}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {appointments.length === 0
                    ? "You don't have any appointments booked in your account yet. Browse our verified doctors directory to schedule your first consultation."
                    : `You have no appointments currently in the ${activeTab} tab.`}
                </p>

                <div className="mt-5">
                  <Link href="/doctors">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-btn hover:bg-blue-700 transition-colors">
                      <CalendarDays className="h-4 w-4" />
                      Find a Doctor & Book Appointment
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Health Tip Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-900">Manage your care anytime</p>
            <p className="text-xs text-blue-700 mt-0.5">
              You can reschedule, cancel, or join secure video consultations directly from this dashboard.
            </p>
          </div>
        </div>
      </main>

      {/* Video Consultation Modal */}
      {activeVideoCall && (
        <VideoConsultationModal
          isOpen={activeVideoCall !== null}
          onClose={() => setActiveVideoCall(null)}
          appointmentId={activeVideoCall.id}
          patientName={displayName || user?.fullName || 'Patient'}
          doctorName={activeVideoCall.doctor}
          userRole="PATIENT"
          userEmail={user?.email || ''}
          appointmentDate={activeVideoCall.date}
          appointmentTime={activeVideoCall.time}
          onCallEnd={() => {
            if (activeVideoCall.completed && !activeVideoCall.reviewed) {
              setReviewAppointment(activeVideoCall)
            }
          }}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <RescheduleModal
          appointment={rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          currentName={displayName || user?.fullName || ''}
          currentAvatar={user?.avatarUrl}
          email={user?.email || ''}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Cancel Modal */}
      {cancelAppointment && (
        <CancelModal
          appointment={cancelAppointment}
          onClose={() => setCancelAppointment(null)}
          onConfirm={handleCancel}
        />
      )}

      {/* Review Modal */}
      {reviewAppointment && (
        <ReviewModal
          appointment={reviewAppointment}
          onClose={() => {
            if (typeof window !== 'undefined' && reviewAppointment) {
              sessionStorage.setItem(`medbook_review_dismissed_${reviewAppointment.id}`, 'true')
            }
            setReviewAppointment(null)
          }}
          onSubmit={handleReview}
        />
      )}
    </div>
  )
}