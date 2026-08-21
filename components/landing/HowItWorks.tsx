import { UserRound, Search, CalendarCheck, Video } from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step:        '01',
    icon:        UserRound,
    iconBg:      'bg-primary-50',
    iconColor:   'text-primary',
    stepColor:   'bg-primary',
    title:       'Create Your Account',
    description: 'Sign up as a patient in seconds. No lengthy forms — just the basics to get you started.',
  },
  {
    step:        '02',
    icon:        Search,
    iconBg:      'bg-success-50',
    iconColor:   'text-success',
    stepColor:   'bg-success',
    title:       'Find Your Doctor',
    description: 'Browse 500+ verified specialists filtered by specialty, location, and availability.',
  },
  {
    step:        '03',
    icon:        CalendarCheck,
    iconBg:      'bg-warning-50',
    iconColor:   'text-warning-700',
    stepColor:   'bg-warning',
    title:       'Book an Appointment',
    description: 'Pick a convenient time slot and confirm your booking instantly — no waiting on hold.',
  },
  {
    step:        '04',
    icon:        Video,
    iconBg:      'bg-violet-50',
    iconColor:   'text-violet-600',
    stepColor:   'bg-violet-600',
    title:       'See Your Doctor',
    description: 'Meet your doctor in-person or via video consultation from the comfort of your home.',
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <section className="section bg-background" aria-labelledby="how-it-works-heading">
      <div className="container-app">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-badge">Simple & Fast</span>
          <h2 id="how-it-works-heading" className="section-title">
            How <span className="text-gradient-primary">MedBook</span> Works
          </h2>
          <p className="section-subtitle mx-auto">
            From registration to your first appointment in under 5 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-10 left-0 right-0 mx-auto w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent z-0"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map(({ step, icon: Icon, iconBg, iconColor, stepColor, title, description }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                {/* Step circle + icon */}
                <div className="relative mb-6">
                  <div className={`feature-icon ${iconBg} ${iconColor} w-20 h-20 ring-4 ring-white shadow-feature`}>
                    <Icon className="h-8 w-8" strokeWidth={1.75} />
                  </div>
                  {/* Step number badge */}
                  <div className={`absolute -top-1 -right-1 w-7 h-7 ${stepColor} rounded-full flex items-center justify-center shadow-sm`}>
                    <span className="text-[10px] font-bold text-white">{step}</span>
                  </div>
                </div>

                <h3 className="text-h4 font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-body-md text-text-secondary leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
