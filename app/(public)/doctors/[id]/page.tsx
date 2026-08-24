'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Clock,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Video,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  Languages,
  Stethoscope,
  Lock,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { getDoctorById, DoctorDetail as StaticDoctorDetail } from '@/lib/doctors/doctorData'
import { getDoctorDetail, DoctorDetail } from '@/lib/api/doctors'
import { createAppointment, getDoctorReviews } from '@/lib/api/appointments'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/lib/auth/authContext'

// ─── Weekly Date Generation Helper ────────────────────────────────────────────

interface DaySlot {
  dateObj: Date
  dateStr: string // "Aug 24, 2026"
  dayName: string // "Mon"
  dayNumber: number // 24
  fullDay: string // "Monday"
  available: boolean
  slots: string[]
}

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

export default function DoctorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = (params?.id as string) || '1'
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [doctor, setDoctor] = useState<{
    id: string
    name: string
    email?: string
    avatarUrl?: string
    specialty: string
    biography: string
    clinicAddress: string
    consultationFee: number
    yearsExperience: number
    rating: number
    reviewCount: number
    availabilityGrid: Record<string, string[]>
  } | null>(null)

  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState<DaySlot[]>([])
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [consultationType, setConsultationType] = useState<
    'Video Consultation' | 'In-Person Visit'
  >('Video Consultation')
  const [reason, setReason] = useState('')

  // Modals & States
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookedAppointmentInfo, setBookedAppointmentInfo] = useState<any>(null)

  // ─── Fetch Live Reviews from Database
  useEffect(() => {
    async function loadReviews() {
      setLoadingReviews(true)
      try {
        const res = await getDoctorReviews(doctorId)
        if (res?.reviews) {
          setReviews(res.reviews)
        }
      } catch (err) {
        console.warn('Live reviews fetch warning:', err)
      } finally {
        setLoadingReviews(false)
      }
    }
    loadReviews()
  }, [doctorId])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0)
    return Number((sum / reviews.length).toFixed(1))
  }, [reviews])

  // ─── Fetch Doctor Details from Supabase API / Fallback
  useEffect(() => {
    async function loadDoctor() {
      setLoading(true)
      try {
        const res = await getDoctorDetail(doctorId)
        if (res?.doctor) {
          const d = res.doctor
          const isCurrentUser = user?.id === d.id
          setDoctor({
            id: d.id,
            name: isCurrentUser && user?.fullName ? user.fullName : d.name,
            email: isCurrentUser && user?.email ? user.email : d.email,
            avatarUrl: isCurrentUser && user?.avatarUrl ? user.avatarUrl : (d.avatarUrl || (d as any).avatar),
            specialty: d.specialty || 'General Practitioner',
            biography: d.biography || 'Board-certified medical specialist dedicated to providing empathetic, evidence-based care.',
            clinicAddress: d.clinicAddress || 'MedBook Medical Center',
            consultationFee: d.consultationFee || 150,
            yearsExperience: d.yearsExperience || 5,
            rating: 5.0,
            reviewCount: 0,
            availabilityGrid: d.availabilityGrid || {},
          })
          return
        }
      } catch (err) {
        console.warn('Database doctor detail fetch fallback to static dataset:', err)
      }

      // Fallback to static mock doctor if not found in DB
      const staticDoc = getDoctorById(doctorId)
      if (staticDoc) {
        const isCurrentUser = user?.id === staticDoc.id
        setDoctor({
          id: staticDoc.id,
          name: isCurrentUser && user?.fullName ? user.fullName : staticDoc.name,
          avatarUrl: isCurrentUser && user?.avatarUrl ? user.avatarUrl : staticDoc.avatar,
          specialty: staticDoc.specialty,
          biography: staticDoc.about,
          clinicAddress: staticDoc.clinicAddress || staticDoc.location,
          consultationFee: staticDoc.price,
          yearsExperience: staticDoc.experience,
          rating: 5.0,
          reviewCount: 0,
          availabilityGrid: {
            Mon: [
              '09:00 AM',
              '09:30 AM',
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '01:00 PM',
              '01:30 PM',
              '02:00 PM',
              '02:30 PM',
              '03:00 PM',
              '03:30 PM',
              '04:00 PM',
              '04:30 PM',
              '05:00 PM',
            ],
            Tue: [
              '09:00 AM',
              '09:30 AM',
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '01:00 PM',
              '01:30 PM',
              '02:00 PM',
              '02:30 PM',
              '03:00 PM',
              '03:30 PM',
              '04:00 PM',
              '04:30 PM',
              '05:00 PM',
            ],
            Wed: [
              '09:00 AM',
              '09:30 AM',
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '01:00 PM',
              '01:30 PM',
              '02:00 PM',
              '02:30 PM',
              '03:00 PM',
              '03:30 PM',
              '04:00 PM',
              '04:30 PM',
              '05:00 PM',
            ],
            Thu: [
              '09:00 AM',
              '09:30 AM',
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '01:00 PM',
              '01:30 PM',
              '02:00 PM',
              '02:30 PM',
              '03:00 PM',
              '03:30 PM',
              '04:00 PM',
              '04:30 PM',
              '05:00 PM',
            ],
            Fri: [
              '09:00 AM',
              '09:30 AM',
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '01:00 PM',
              '01:30 PM',
              '02:00 PM',
              '02:30 PM',
              '03:00 PM',
              '03:30 PM',
              '04:00 PM',
              '04:30 PM',
              '05:00 PM',
            ],
            Sat: [
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '12:00 PM',
              '12:30 PM',
              '01:00 PM',
            ],
          },
        })
      }
      setLoading(false)
    }

    loadDoctor()
  }, [doctorId, user?.avatarUrl, user?.fullName, user?.id])

  // Reactively sync with active logged-in doctor profile updates
  useEffect(() => {
    if (user && doctor && user.id === doctor.id) {
      if (user.avatarUrl !== doctor.avatarUrl || user.fullName !== doctor.name) {
        setDoctor((prev) =>
          prev
            ? {
                ...prev,
                name: user.fullName || prev.name,
                avatarUrl: user.avatarUrl,
              }
            : null
        )
      }
    }
  }, [user?.avatarUrl, user?.fullName, user?.id, doctor?.id])

  // Compute days when doctor or week offset changes
  useEffect(() => {
    if (!doctor) return
    const grid = doctor.availabilityGrid || {}
    const upcoming = getUpcomingDays(weekOffset * 7, grid)
    setDays(upcoming)

    // select first available day
    const firstAvail = upcoming.findIndex((d) => d.available)
    const initialIndex = firstAvail >= 0 ? firstAvail : 0
    setSelectedDayIndex(initialIndex)

    const initialSlots = upcoming[initialIndex]?.slots || []
    setSelectedSlot(initialSlots.length > 0 ? initialSlots[0] : '')
    setLoading(false)
  }, [doctor, weekOffset])

  const selectedDay = days[selectedDayIndex] || days[0]
  const currentSlots = selectedDay?.slots || []

  // When selected day changes, update selectedSlot to first slot of that day
  const handleSelectDay = (index: number) => {
    setSelectedDayIndex(index)
    const s = days[index]?.slots || []
    setSelectedSlot(s.length > 0 ? s[0] : '')
  }

  // ─── Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError('')

    if (!selectedSlot) {
      setBookingError('Please select an available time slot for your appointment.')
      return
    }

    // Require Login Check
    if (!user) {
      setShowLoginModal(true)
      return
    }

    // Role & self-booking restriction
    const isBookingSelf = user.id === (doctor?.id || doctorId)
    if (user.role === 'DOCTOR' || isBookingSelf) {
      setBookingError(
        isBookingSelf
          ? 'You cannot book an appointment with yourself.'
          : 'Doctor accounts cannot book patient appointments. Please use a patient account to book consultations.'
      )
      return
    }

    setIsBooking(true)

    try {
      // Build ISO timestamp for scheduled_at
      const targetDate = selectedDay?.dateObj || new Date()
      const [timePart, meridiem] = selectedSlot.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)
      if (meridiem === 'PM' && hours < 12) hours += 12
      if (meridiem === 'AM' && hours === 12) hours = 0

      const scheduledDate = new Date(targetDate)
      scheduledDate.setHours(hours, minutes, 0, 0)

      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi'

      const appointmentRes = await createAppointment({
        doctor_id: doctor?.id || doctorId,
        scheduled_at: scheduledDate.toISOString(),
        type: consultationType,
        location: doctor?.clinicAddress || 'MedBook Medical Center',
        notes: reason,
        timeZone: userTimeZone,
      })

      setBookedAppointmentInfo({
        doctorName: doctor?.name,
        specialty: doctor?.specialty,
        date: selectedDay?.dateStr,
        time: selectedSlot,
        type: consultationType,
        price: doctor?.consultationFee,
        location: doctor?.clinicAddress,
      })

      setShowSuccessModal(true)
    } catch (err: any) {
      setBookingError(err?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  if (loading || !doctor) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading doctor profile & schedule...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 pb-16">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app py-3.5">
          <div className="flex items-center justify-between">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Doctors List
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Healthcare Provider
            </span>
          </div>
        </div>
      </div>

      <div className="container-app pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT COLUMN: Doctor Details & Bio (7 cols) ─── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Doctor Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={(user?.id === doctor.id ? user?.avatarUrl : doctor.avatarUrl) || doctor.avatarUrl || (doctor as any).avatar}
                    name={(user?.id === doctor.id ? user?.fullName : doctor.name) || doctor.name}
                    size="2xl"
                    className="w-24 h-24 sm:w-28 sm:h-28"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                {/* Main Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                      {doctor.name}
                    </h1>
                    <BadgeCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </div>

                  <p className="text-sm font-semibold text-blue-600 mt-1">{doctor.specialty}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <span>{doctor.yearsExperience}+ Years Experience</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-800">{averageRating}</span>
                      <span>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  </div>

                  {/* Location & Fee summary badge */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0 flex-1" title={doctor.clinicAddress}>
                      <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate block font-medium">{doctor.clinicAddress}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">
                        ${doctor.consultationFee}
                      </span>
                      <span className="text-xs text-slate-500"> / consultation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About / Biography Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                About Specialist & Clinical Background
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {doctor.biography}
              </p>
            </div>

            {/* Clinic Office Details */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Clinic Location & Consultation Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Office Address
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{doctor.clinicAddress}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                    <Video className="h-4 w-4 text-blue-600" />
                    Telehealth Available
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    HD Video Consultation with end-to-end encrypted medical room.
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Reviews Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Patient Testimonials</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verified MedBook patient reviews</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{averageRating} / 5.0 ({reviews.length})</span>
                </div>
              </div>

              {loadingReviews ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-500">Loading patient reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
                  <p className="text-xs font-semibold text-slate-700">No Patient Reviews Yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Be the first patient to share feedback after completing your consultation with Dr. {doctor.name.split(' ')[0]}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={rev.patient?.full_name || 'Verified Patient'}
                            src={rev.patient?.avatar_url}
                            size="xs"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {rev.patient?.full_name || 'Verified Patient'}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Visit
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {rev.created_at
                            ? new Date(rev.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                      </div>

                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Number(rev.rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'
                            }`}
                          />
                        ))}
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Live Interactive Booking Panel (5 cols) ─── */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Schedule Appointment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select visit type & time slot</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-600">
                    ${doctor.consultationFee}
                  </span>
                  <p className="text-[10px] text-slate-400">per visit</p>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* 1. Visit Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'Video Consultation', icon: Video, label: 'Video Call' },
                      { type: 'In-Person Visit', icon: Building2, label: 'In-Person' },
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setConsultationType(
                            type as 'Video Consultation' | 'In-Person Visit'
                          )
                        }
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
                          consultationType === type
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Week Navigation Header */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-800">Select Date</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                        disabled={weekOffset === 0}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeekOffset((w) => Math.min(1, w + 1))}
                        disabled={weekOffset >= 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title={weekOffset >= 1 ? 'Booking available up to 2 weeks in advance' : 'Next week'}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 7-Day Horizontal Strip */}
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

                {/* 3. Time Slots Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Available Time Slots</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        30 Min Sessions
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedDay?.fullDay}, {selectedDay?.dateStr}
                    </span>
                  </div>

                  {currentSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {currentSlots.map((slot) => {
                        const isSlotSelected = selectedSlot === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                              isSlotSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-white'
                            }`}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <p className="text-xs font-semibold text-amber-800">
                        No slots available on this day.
                      </p>
                      <p className="text-[11px] text-amber-600 mt-0.5">
                        Please select another day from the calendar above.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Reason for Consultation */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Reason for Visit <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or medical concern..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
                  />
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Submit Booking Button */}
                <button
                  type="submit"
                  disabled={isBooking || !selectedSlot || currentSlots.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-btn disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Confirming Appointment...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="h-4 w-4" />
                      <span>Book Appointment (${doctor.consultationFee})</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  🔒 Secure instant booking. Free cancellation up to 24 hours prior.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Login Required Modal ─── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Patient Account Required</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Please sign in or create your free MedBook patient account to confirm this appointment with Dr. {doctor.name}.
            </p>

            <div className="flex flex-col gap-2 mt-6">
              <Link
                href={`/login?redirect=/doctors/${doctor.id}`}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Log In as Patient
              </Link>
              <Link
                href={`/signup?role=patient&redirect=/doctors/${doctor.id}`}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Create Free Account
              </Link>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 mt-2 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Success Confirmation Modal ─── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Appointment Requested!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your consultation request has been sent to Dr. {doctor.name}.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left my-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-900">{bookedAppointmentInfo?.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-900">
                  {bookedAppointmentInfo?.date} at {bookedAppointmentInfo?.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visit Type:</span>
                <span className="font-bold text-blue-600">{bookedAppointmentInfo?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Fee:</span>
                <span className="font-bold text-slate-900">${bookedAppointmentInfo?.price}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/patient"
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Go to Patient Portal
              </Link>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 mt-2 font-medium"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
