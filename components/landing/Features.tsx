import {
  CalendarCheck,
  BadgeCheck,
  ShieldCheck,
  Headphones,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'feat-easy-booking',
    icon:        CalendarCheck,
    iconBg:      'bg-primary-50',
    iconColor:   'text-primary',
    title:       'Easy Booking',
    description: 'Book appointments with your preferred doctors in just a few clicks. No phone calls needed.',
  },
  {
    id: 'feat-verified-doctors',
    icon:        BadgeCheck,
    iconBg:      'bg-success-50',
    iconColor:   'text-success',
    title:       'Verified Doctors',
    description: 'All doctors are thoroughly verified and experienced healthcare professionals.',
  },
  {
    id: 'feat-secure-private',
    icon:        ShieldCheck,
    iconBg:      'bg-violet-50',
    iconColor:   'text-violet-600',
    title:       'Secure & Private',
    description: 'Your health data is always protected with industry-standard encryption.',
  },
  {
    id: 'feat-247-support',
    icon:        Headphones,
    iconBg:      'bg-warning-50',
    iconColor:   'text-warning-700',
    title:       '24/7 Support',
    description: 'Our dedicated support team is here to help you anytime, day or night.',
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Features() {
  return (
    <section className="section bg-white" aria-labelledby="features-heading">
      <div className="container-app">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-badge">Why Choose MedBook</span>
          <h2 id="features-heading" className="section-title">
            Everything You Need for{' '}
            <span className="text-gradient-primary">Better Healthcare</span>
          </h2>
          <p className="section-subtitle mx-auto">
            MedBook makes it simple to find the right doctor and manage your health — all in one place.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ id, icon: Icon, iconBg, iconColor, title, description }) => (
            <div
              key={id}
              id={id}
              className="group card-base p-7 text-center flex flex-col items-center"
            >
              {/* Icon */}
              <div
                className={`feature-icon ${iconBg} ${iconColor} w-16 h-16 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} />
              </div>

              {/* Text */}
              <h3 className="text-h4 text-text-primary font-semibold mb-2">{title}</h3>
              <p className="text-body-md text-text-secondary leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
