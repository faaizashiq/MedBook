'use client'

import Link from 'next/link'
import {
  HeartPulse,
  ShieldCheck,
  Users,
  CalendarCheck,
  Stethoscope,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  HeartHandshake,
  Lightbulb,
} from 'lucide-react'

// ─── Stats ───────────────────────────────────────────────────────────────────

const stats = [
  { value: '10K+', label: 'Happy Patients' },
  { value: '500+', label: 'Verified Doctors' },
  { value: '50+', label: 'Medical Specialties' },
  { value: '4.9/5', label: 'Patient Rating' },
]

// ─── Core Values ──────────────────────────────────────────────────────────────

const values = [
  {
    icon: HeartHandshake,
    title: 'Patient First',
    description:
      'Every feature we build starts with one question: how can we make healthcare easier for patients?',
    className: 'bg-blue-50 text-primary',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Safety',
    description:
      'We focus on secure healthcare experiences and connecting patients with trusted professionals.',
    className: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Lightbulb,
    title: 'Simple Innovation',
    description:
      'We use modern technology to remove unnecessary complexity from booking and managing appointments.',
    className: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: 'Better Together',
    description:
      'We believe better healthcare happens when patients and doctors have the right tools to connect.',
    className: 'bg-indigo-50 text-indigo-600',
  },
]

// ─── Team ─────────────────────────────────────────────────────────────────────

const team = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Medical Director',
    image: '/images/team/sarah.jpg',
    initials: 'SJ',
  },
  {
    name: 'Ahmed Khan',
    role: 'Chief Technology Officer',
    image: '/images/team/ahmed.jpg',
    initials: 'AK',
  },
  {
    name: 'Emma Williams',
    role: 'Patient Experience Lead',
    image: '/images/team/emma.jpg',
    initials: 'EW',
  },
]

// ─── About Page ───────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="bg-background">

      {/* ═════════════════════════════════════════════════════════════════════
          HERO
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-32 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-10 md:pt-16 md:pb-14">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary text-xs font-semibold mb-5">
            <HeartPulse className="h-3.5 w-3.5" />
            About MedBook
          </div>

          {/* Heading */}
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
              Making Healthcare
              <span className="text-primary"> Easier for Everyone</span>
            </h1>

            <p className="mt-5 text-body-lg text-text-secondary leading-relaxed max-w-2xl">
              MedBook is a modern appointment booking platform designed to
              connect patients with trusted healthcare professionals quickly,
              simply, and securely.
            </p>
          </div>

          {/* Small trust indicators */}
          <div className="flex flex-wrap items-center gap-5 mt-7">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Verified Professionals
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Easy Appointment Booking
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Patient-Focused Care
            </div>
          </div>
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════
          MISSION
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Mission */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-7 md:p-8 text-white shadow-btn">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full" />

            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-5">
                <Target className="h-5 w-5 text-white" />
              </div>

              <p className="text-xs uppercase tracking-wider font-semibold text-blue-200 mb-2">
                Our Mission
              </p>

              <h2 className="text-2xl font-bold mb-3">
                Healthcare should be simple.
              </h2>

              <p className="text-sm text-blue-100 leading-relaxed max-w-lg">
                Our mission is to remove the barriers between patients and
                quality healthcare. MedBook makes it easier to discover
                doctors, compare available options, and book appointments
                without unnecessary waiting or complicated processes.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white border border-border rounded-3xl p-7 md:p-8 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
              <HeartPulse className="h-5 w-5 text-primary" />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
              Our Vision
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-3">
              A better healthcare experience.
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              We envision a healthcare experience where finding the right
              doctor and scheduling an appointment takes only a few moments.
              By combining thoughtful design with modern technology, MedBook
              aims to make healthcare more accessible and convenient.
            </p>
          </div>

        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════
          STATS
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="bg-slate-50 border border-border rounded-3xl p-6 md:p-8">

          <div className="text-center mb-7">
            <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
              MedBook by the Numbers
            </p>

            <h2 className="text-2xl font-bold text-text-primary">
              Healthcare is better when it&apos;s connected.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white border border-border rounded-2xl p-5 text-center shadow-sm"
              >
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {value}
                </p>

                <p className="text-xs text-text-muted mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════
          VALUES
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">

        <div className="max-w-2xl mb-7">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
            What We Believe
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            The values behind MedBook
          </h2>

          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            These principles guide how we build our platform and how we
            support the people who use it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map(
            ({ icon: Icon, title, description, className }) => (
              <div
                key={title}
                className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${className}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-sm font-bold text-text-primary">
                  {title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed mt-2">
                  {description}
                </p>
              </div>
            )
          )}
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">

        <div className="bg-white border border-border rounded-3xl p-7 md:p-9">

          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
              How MedBook Helps
            </p>

            <h2 className="text-2xl font-bold text-text-primary">
              Healthcare in three simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-4">
                <Stethoscope className="h-5 w-5" />
              </div>

              <h3 className="font-bold text-sm text-text-primary">
                Find a Doctor
              </h3>

              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Browse healthcare professionals and find the specialist
                that fits your needs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <CalendarCheck className="h-5 w-5" />
              </div>

              <h3 className="font-bold text-sm text-text-primary">
                Choose a Time
              </h3>

              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                View available schedules and choose a convenient appointment
                time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CalendarCheck className="h-5 w-5" />
              </div>

              <h3 className="font-bold text-sm text-text-primary">
                Get Care
              </h3>

              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Receive your appointment confirmation and connect with your
                healthcare professional.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════
          TEAM
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">

        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
              Our Team
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              People behind MedBook
            </h2>

            <p className="text-sm text-text-secondary mt-2">
              A team working to make healthcare more accessible.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">

          {team.map(({ name, role, image, initials }) => (
            <div
              key={name}
              className="bg-white border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-52 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">

                {/* Replace with actual team image if available */}
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement?.classList.add(
                      'text-primary'
                    )
                  }}
                />

                <span className="absolute sr-only">
                  {initials}
                </span>
              </div>

              <div className="pt-4 px-1">
                <h3 className="font-bold text-sm text-text-primary">
                  {name}
                </h3>

                <p className="text-xs text-primary font-medium mt-1">
                  {role}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>


      {/* ═════════════════════════════════════════════════════════════════════
          CTA
      ═════════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-blue-600 to-indigo-800 p-8 md:p-10 text-white">

          {/* Decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-100 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Your health matters
              </div>

              <h2 className="text-2xl md:text-3xl font-bold">
                Ready to take the next step?
              </h2>

              <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                Find a trusted healthcare professional and book your
                appointment with MedBook today.
              </p>
            </div>

            <Link
              href="/doctors"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-semibold text-sm shadow-lg hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              Find a Doctor
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </div>

      </section>

    </main>
  )
}