'use client'

import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer:
      'Simply browse our available doctors, select a doctor that matches your needs, choose an available date and time, and confirm your appointment. You will receive a confirmation once your booking is completed.',
  },
  {
    question: 'Can I cancel or reschedule my appointment?',
    answer:
      'Yes. You can manage your upcoming appointments from your patient dashboard. Depending on the doctor and appointment type, you can cancel or select another available time.',
  },
  {
    question: 'Are the doctors on MedBook verified?',
    answer:
      'MedBook is designed to connect patients with trusted healthcare professionals. Doctor profiles can include professional information, specialties, experience, and availability to help patients make informed choices.',
  },
  {
    question: 'Can I use MedBook for online consultations?',
    answer:
      'Yes, doctors who offer telemedicine can provide online consultations. The available consultation format is shown on the doctor profile and during the booking process.',
  },
  {
    question: 'Is creating a MedBook account free?',
    answer:
      'Creating an account on MedBook is free. Appointment or consultation fees may vary depending on the healthcare professional and the type of service selected.',
  },
  {
    question: 'How can I contact MedBook support?',
    answer:
      'You can contact our support team through the message form on this page, email us directly, or call us during our listed support hours.',
  },
]

// ─── FAQ Item ────────────────────────────────────────────────────────────────

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div
      className={`border rounded-2xl transition-all duration-200 ${isOpen
        ? 'border-primary-100 bg-primary-50/40'
        : 'border-border bg-white hover:border-primary-100'
        }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 text-left p-5"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm font-semibold ${isOpen ? 'text-primary' : 'text-text-primary'
            }`}
        >
          {question}
        </span>

        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isOpen
            ? 'bg-primary text-white rotate-180'
            : 'bg-slate-100 text-text-secondary'
            }`}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          <div className="h-px bg-primary-100 mb-4" />

          <p className="text-sm text-text-secondary leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Contact Page ────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      return
    }

    setLoading(true)

    // TODO: Connect to FastAPI contact endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    setSent(true)

    setName('')
    setEmail('')
    setMessage('')

    setTimeout(() => {
      setSent(false)
    }, 5000)
  }

  return (
    <main className="bg-background">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}

      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-32 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8 md:pt-12 md:pb-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary text-xs font-semibold mb-5">
            <MessageCircle className="h-3.5 w-3.5" />
            Get in Touch
          </div>

          {/* Heading */}
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
              We&apos;re Here to
              <span className="text-primary"> Help You</span>
            </h1>

            <p className="mt-4 text-body-lg text-text-secondary leading-relaxed max-w-xl">
              Have a question about MedBook, need help with an appointment,
              or want to share feedback? Our team is ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTACT INFORMATION + FORM
      ═══════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">

        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6 lg:gap-8">

          {/* ───────────── Contact Information ───────────── */}

          <div className="space-y-4">

            {/* Email Card */}
            <div className="group bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200">
              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <Mail className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Email Us
                  </p>

                  <p className="text-xs text-text-muted mt-1">
                    We&apos;re happy to answer your questions
                  </p>

                  <a
                    href="mailto:medbook.application@gmail.com"
                    className="inline-block mt-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors"
                  >
                    medbook.application@gmail.com
                  </a>
                </div>

              </div>
            </div>

            {/* Phone Card */}
            <div className="group bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200">
              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                  <Phone className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Call Us
                  </p>

                  <p className="text-xs text-text-muted mt-1">
                    Monday – Friday, 9:00 AM – 6:00 PM
                  </p>

                  <a
                    href="tel:+923001234567"
                    className="inline-block mt-2 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                  >
                    +92 300 1234567
                  </a>
                </div>

              </div>
            </div>

            {/* Address Card */}
            <div className="group bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200">
              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                  <MapPin className="h-5 w-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Visit Us
                  </p>

                  <p className="text-xs text-text-muted mt-1">
                    Our main office
                  </p>

                  <p className="mt-2 text-sm font-medium text-text-secondary leading-relaxed">
                    MedBook Healthcare Center
                    <br />
                    Lahore, Pakistan
                  </p>
                </div>

              </div>
            </div>

            {/* Support availability */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 border border-primary-100">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />

              <p className="text-xs text-primary-700">
                <span className="font-semibold">
                  Support is available
                </span>{' '}
                during our business hours.
              </p>
            </div>

          </div>

          {/* ───────────── Message Form ───────────── */}

          <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm">

            <div className="mb-6">

              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-text-primary">
                Send Us a Message
              </h2>

              <p className="text-sm text-text-secondary mt-1.5">
                Tell us how we can help and our team will get back to you.
              </p>

            </div>

            {/* Success */}
            {sent && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />

                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Message sent successfully!
                  </p>

                  <p className="text-xs text-emerald-600 mt-0.5">
                    Thank you for contacting MedBook. We&apos;ll get back to
                    you soon.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name + Email */}
              <div className="grid md:grid-cols-2 gap-4">

                <Input
                  id="contact-name"
                  label="Your Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  id="contact-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

              {/* Message */}
              <div>

                <label
                  htmlFor="contact-message"
                  className="block text-body-sm font-semibold text-text-primary mb-1.5"
                >
                  Your Message
                </label>

                <textarea
                  id="contact-message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

              </div>

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="shadow-btn"
                icon={!loading ? <Send className="h-4 w-4" /> : undefined}
                iconPosition="right"
              >
                Send Message
              </Button>

              <p className="text-center text-[11px] text-text-muted pt-1">
                We usually respond within one business day.
              </p>

            </form>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════════ */}

      <section className="max-w-4xl mx-auto px-6 pb-14">

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary mb-4">
            <HelpCircle className="h-5 w-5" />
          </div>

          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">
            Frequently Asked Questions
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Have questions?
          </h2>

          <p className="text-sm text-text-secondary mt-2">
            Here are answers to some of the questions we hear most often.
          </p>

        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">

          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onClick={() =>
                setOpenFAQ(openFAQ === index ? null : index)
              }
            />
          ))}

        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════════════ */}

      <section className="max-w-6xl mx-auto px-6 pb-14">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-blue-600 to-indigo-800 p-8 md:p-10 text-white">

          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="max-w-xl text-center md:text-left">

              <h2 className="text-2xl md:text-3xl font-bold">
                Ready to book your appointment?
              </h2>

              <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                Find a trusted healthcare professional and schedule your
                next appointment with MedBook.
              </p>

            </div>

            <a
              href="/doctors"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-semibold text-sm shadow-lg hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              Find a Doctor
              <span>→</span>
            </a>

          </div>

        </div>

      </section>

    </main>
  )
}