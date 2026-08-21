import { Star, Quote } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

// ─── Data ────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id:       't-1',
    name:     'Emily Richardson',
    role:     'Patient',
    avatar:   undefined,
    rating:   5,
    text:     'MedBook completely changed how I access healthcare. I found a great cardiologist within minutes and booked an appointment the same day. The reminder system is fantastic!',
    specialty: 'Cardiology appointment',
  },
  {
    id:       't-2',
    name:     'James Thompson',
    role:     'Patient',
    avatar:   undefined,
    rating:   5,
    text:     'The video consultation feature saved me so much time. My doctor was professional, and the whole experience felt seamless. Highly recommended for anyone with a busy schedule.',
    specialty: 'Online consultation',
  },
  {
    id:       't-3',
    name:     'Priya Sharma',
    role:     'Patient',
    avatar:   undefined,
    rating:   5,
    text:     "I was skeptical at first, but MedBook exceeded my expectations. The doctor profiles are detailed, ratings are genuine, and booking is incredibly easy. A game changer!",
    specialty: 'Dermatology appointment',
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Testimonials() {
  return (
    <section className="section bg-white" aria-labelledby="testimonials-heading">
      <div className="container-app">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-badge">Patient Stories</span>
          <h2 id="testimonials-heading" className="section-title">
            What Our <span className="text-gradient-primary">Patients Say</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Real experiences from real patients who found their perfect doctor through MedBook.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ id, name, role, avatar, rating, text, specialty }) => (
            <div
              key={id}
              id={id}
              className="card-base p-7 flex flex-col gap-5 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="h-10 w-10 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-warning fill-warning" />
                ))}
              </div>

              {/* Text */}
              <p className="text-body-md text-text-secondary leading-relaxed flex-1 italic">
                &ldquo;{text}&rdquo;
              </p>

              {/* Specialty tag */}
              <span className="inline-flex self-start items-center px-3 py-1 bg-primary-50 text-primary text-body-sm font-medium rounded-pill">
                {specialty}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Avatar name={name} size="md" />
                <div>
                  <p className="text-body-md font-semibold text-text-primary">{name}</p>
                  <p className="text-body-sm text-text-muted">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '4.9/5', label: 'Average Rating',    color: 'text-warning' },
            { value: '10K+',  label: 'Happy Patients',    color: 'text-primary' },
            { value: '98%',   label: 'Satisfaction Rate', color: 'text-success' },
            { value: '500+',  label: 'Verified Doctors',  color: 'text-violet-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="text-center p-5 bg-background rounded-2xl border border-border">
              <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
              <p className="text-body-sm text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
