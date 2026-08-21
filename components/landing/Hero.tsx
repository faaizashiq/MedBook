'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  CalendarCheck,
  Headphones,
} from 'lucide-react'

// ─── Stats ───────────────────────────────────────────────────────────────────

const STATS = [
  { value: '10k+', label: 'Happy Patients' },
  { value: '500+', label: 'Expert Doctors' },
  { value: '50+', label: 'Specialties' },
]

// ─── Hero Component ──────────────────────────────────────────────────────────

export function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/doctors?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/doctors')
    }
  }

  return (
    <section
      className="relative bg-white pt-6 pb-14 md:pt-10 md:pb-24 overflow-hidden"
      aria-label="Hero section"
    >
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[560px]">

          {/* ═════════════════════════════════════════════════════════════════
              LEFT COLUMN — Heading, Subtext, Search Bar, Stats
          ═════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 z-10 animate-fade-up">

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.15] tracking-tight">
              Find The Best <br />
              <span className="text-blue-600">Doctors</span> &amp; Book <br />
              Appointments
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed">
              Connect with trusted healthcare professionals and book appointments that fit your schedule.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="
    mt-8
    flex items-center
    w-full max-w-2xl
    h-14 sm:h-16
    bg-white
    rounded-full
    p-1
    border border-blue-200
    shadow-[0_10px_30px_rgba(37,99,235,0.10)]
    transition-all duration-200
    focus-within:border-blue-500
    focus-within:ring-4
    focus-within:ring-blue-500/10
  "
            >
              {/* Search Icon */}
              <div className="flex items-center justify-center w-11 sm:w-12 flex-shrink-0">
                <Search className="h-5 w-5 text-slate-400" />
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, specialties..."
                className="
      flex-1
      min-w-0
      h-full
      px-1
      sm:px-2
      bg-transparent
      border-0
      outline-none
      ring-0
      focus:outline-none
      focus:ring-0
      text-sm sm:text-base
      text-slate-800
      placeholder:text-slate-400
    "
              />

              {/* Search Button */}
              <button
                type="submit"
                id="hero-search-submit-btn"
                className="
      h-full
      px-6 sm:px-8
      flex-shrink-0
      rounded-full
      bg-blue-600
      hover:bg-blue-700
      active:bg-blue-800
      text-white
      text-sm sm:text-base
      font-semibold
      transition-all duration-200
      shadow-sm
      hover:shadow-md
      active:scale-[0.98]
      cursor-pointer
    "
              >
                Search
              </button>
            </form>

            {/* Stats Row */}
            <div className="mt-10 sm:mt-12 flex items-center gap-8 sm:gap-14">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 leading-tight">
                    {value}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              RIGHT COLUMN — Doctor Image & 2 Floating Cards
          ═════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[500px] flex items-center justify-center">

              {/* Circular Soft Blue Disc Background */}
              <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] rounded-full bg-gradient-to-tr from-blue-100/70 via-blue-50/50 to-indigo-50/40 -z-10" />

              {/* Decorative Subtle Plus Crosses */}
              <span className="absolute top-8 left-4 text-blue-300/80 text-xl font-light select-none pointer-events-none">+</span>
              <span className="absolute top-24 right-6 text-blue-300/80 text-sm font-light select-none pointer-events-none">+</span>
              <span className="absolute bottom-16 left-8 text-blue-300/80 text-base font-light select-none pointer-events-none">+</span>

              {/* Doctor Cutout Photo */}
              <div className="relative z-10 flex justify-center">
                <img
                  src="/images/hero-doctor.png"
                  alt="Doctor"
                  className="w-auto h-[360px] sm:h-[460px] lg:h-[500px] object-contain drop-shadow-sm select-none pointer-events-none"
                />
              </div>

              {/* ── DESKTOP & TABLET: Floating Cards (Positioned clearly to the side) ── */}

              {/* Floating Popup 1: Quick & Easy (Top Right) */}
              <div
                className="hidden md:block absolute top-10 -right-4 lg:-right-8 xl:-right-10 z-20 bg-white rounded-2xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-slate-100/90 w-[175px] sm:w-[190px] animate-float"
                style={{ animationDuration: '3.5s' }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Quick &amp; Easy
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Book in just a few clicks
                </p>
              </div>

              {/* Floating Popup 2: 24/7 Support (Bottom Right) */}
              <div
                className="hidden md:block absolute bottom-12 -right-4 lg:-right-8 xl:-right-10 z-20 bg-white rounded-2xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-slate-100/90 w-[175px] sm:w-[190px] animate-float"
                style={{ animationDelay: '1.8s', animationDuration: '3.5s' }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <Headphones className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  24/7 Support
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  We&apos;re here to help you
                </p>
              </div>

            </div>

            {/* ── MOBILE ONLY: Clean Cards Below Doctor (Never overlaps the image) ── */}
            <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-[360px] md:hidden z-20">
              <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Quick &amp; Easy</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Book in clicks</p>
              </div>

              <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <Headphones className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">24/7 Support</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Here to help</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
