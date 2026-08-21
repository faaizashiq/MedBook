'use client'

import { useState, useMemo, useEffect } from 'react'
import { DoctorSearch } from '@/components/doctors/DoctorSearch'
import { DoctorCard } from '@/components/doctors/DoctorCard'
import type { Doctor } from '@/components/doctors/DoctorCard'
import { getPublicDoctors } from '@/lib/api/doctors'
import { Loader2, Stethoscope } from 'lucide-react'

// ─── Component ───────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [sort, setSort] = useState('rating')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [dbDoctors, setDbDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch live doctors exclusively from Supabase database
  useEffect(() => {
    async function loadLiveDoctors() {
      setLoading(true)
      try {
        const res = await getPublicDoctors()
        if (res?.doctors) {
          setDbDoctors(res.doctors)
        } else {
          setDbDoctors([])
        }
      } catch (err) {
        console.error('Error fetching live doctors from database:', err)
        setDbDoctors([])
      } finally {
        setLoading(false)
      }
    }

    loadLiveDoctors()
  }, [])

  const filtered = useMemo(() => {
    let docs = [...dbDoctors]

    // filter by query
    if (query) {
      const q = query.toLowerCase()
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      )
    }

    // filter by specialty
    if (specialty !== 'All') {
      docs = docs.filter((d) => d.specialty.toLowerCase().includes(specialty.toLowerCase()))
    }

    // sort
    switch (sort) {
      case 'rating':
        docs.sort((a, b) => b.rating - a.rating)
        break
      case 'experience':
        docs.sort((a, b) => b.experience - a.experience)
        break
      case 'price-asc':
        docs.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        docs.sort((a, b) => b.price - a.price)
        break
    }

    return docs
  }, [dbDoctors, query, specialty, sort])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Hero / Header ─────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-3">
              <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
              <span>Verified Medical Specialists</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Find &amp; Book Top-Rated Doctors
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600">
              Browse board-certified doctors, check real patient reviews, and book in-person or video consultations.
            </p>
          </div>

          {/* Search bar inside header for compact layout */}
          <div className="mt-8">
            <DoctorSearch
              onSearch={setQuery}
              onSpecialty={setSpecialty}
              onSort={setSort}
              totalCount={filtered.length}
            />
          </div>
        </div>
      </section>

      {/* ─── Doctor Cards Grid ───────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-9 w-9 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading verified doctors...</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
              <Stethoscope className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Doctors Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {query || specialty !== 'All'
                ? `We couldn't find any specialists matching your filter criteria. Try searching with different keywords.`
                : `There are currently no verified doctor profiles available in the system.`}
            </p>
            {(query || specialty !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setSpecialty('All')
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                isFavorited={favorites.has(doctor.id)}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
