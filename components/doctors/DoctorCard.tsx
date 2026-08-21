import Link from 'next/link'
import { Star, MapPin, Clock, BadgeCheck, Heart } from 'lucide-react'
import { Avatar }  from '@/components/ui/Avatar'
import { Badge }   from '@/components/ui/Badge'
import { Button }  from '@/components/ui/Button'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Doctor {
  id:           string
  name:         string
  specialty:    string
  experience:   number       // years
  rating:       number       // 0–5
  reviewCount:  number
  price:        number       // consultation fee in $
  location:     string
  avatar?:      string
  available:    boolean
  nextSlot?:    string       // e.g. "Today, 2:30 PM"
  verified:     boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

interface DoctorCardProps {
  doctor:      Doctor
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

export function DoctorCard({ doctor, onFavorite, isFavorited = false }: DoctorCardProps) {
  return (
    <div
      id={`doctor-card-${doctor.id}`}
      className="card-base p-5 flex flex-col gap-4 group"
    >
      {/* Top row */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar name={doctor.name} src={doctor.avatar || (doctor as any).avatarUrl} size="xl" />
          {doctor.available && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-success rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-text-primary truncate">
                  {doctor.name}
                </h3>
                {doctor.verified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-body-sm text-text-secondary">{doctor.specialty}</p>
              <p className="text-body-sm text-text-muted">{doctor.experience} Years Exp.</p>
            </div>

            {/* Favorite button */}
            <button
              id={`favorite-btn-${doctor.id}`}
              onClick={() => onFavorite?.(doctor.id)}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="p-1.5 rounded-lg hover:bg-danger-50 text-text-muted hover:text-danger transition-colors flex-shrink-0"
            >
              <Heart
                className={`h-4.5 w-4.5 ${isFavorited ? 'fill-danger text-danger' : ''}`}
              />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(doctor.rating)
                      ? 'text-warning fill-warning'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-body-sm font-semibold text-text-primary">{doctor.rating}</span>
            <span className="text-body-sm text-text-muted">({doctor.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Meta row - Strict overflow safety */}
      <div className="flex flex-col gap-1.5 text-xs text-slate-500 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0" title={doctor.location}>
          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate block flex-1 font-medium text-slate-600">
            {doctor.location || 'Clinic address available'}
          </span>
        </div>
        {doctor.nextSlot && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-700 font-semibold truncate">{doctor.nextSlot}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-2 mt-auto border-t border-slate-100">
        <div className="min-w-0 flex-shrink-0">
          <span className="text-lg font-bold text-slate-900">${doctor.price}</span>
          <span className="text-[11px] text-slate-400"> / visit</span>
        </div>
        <Link href={`/doctors/${doctor.id}`} id={`book-btn-${doctor.id}`} className="flex-shrink-0">
          <Button size="sm" variant={doctor.available ? 'primary' : 'outline'}>
            {doctor.available ? 'Book Now' : 'View Profile'}
          </Button>
        </Link>
      </div>
    </div>
  )
}
