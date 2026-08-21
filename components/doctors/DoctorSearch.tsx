'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ─── Specialties ──────────────────────────────────────────────────────────────

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Oncology',
  'Gynecology',
  'General Practice',
  'ENT',
  'Ophthalmology',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface DoctorSearchProps {
  onSearch:   (query: string)    => void
  onSpecialty:(specialty: string)=> void
  onSort:     (sort: string)     => void
  totalCount: number
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DoctorSearch({ onSearch, onSpecialty, onSort, totalCount }: DoctorSearchProps) {
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState('All')

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleSpecialty = (specialty: string) => {
    setSelected(specialty)
    onSpecialty(specialty)
  }

  const clearSearch = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
        <input
          id="doctor-search-input"
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search doctors by name, specialty or condition..."
          className="input-base pl-12 pr-10 h-12 text-base rounded-xl"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 text-text-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Specialty chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              id={`specialty-filter-${s.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleSpecialty(s)}
              className={`
                flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 border
                ${selected === s
                  ? 'bg-primary text-white border-primary shadow-btn'
                  : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-body-sm text-text-muted whitespace-nowrap">
            <span className="font-semibold text-text-primary">{totalCount}</span> doctors found
          </span>
          <select
            id="doctor-sort-select"
            onChange={(e) => onSort(e.target.value)}
            className="input-base py-1.5 px-3 h-9 text-sm w-auto rounded-lg pr-8"
          >
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  )
}
