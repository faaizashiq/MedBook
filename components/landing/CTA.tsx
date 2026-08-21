import Link from 'next/link'
import { CalendarDays, ArrowRight, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="section bg-background" aria-labelledby="cta-heading">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary shadow-modal px-8 py-16 md:px-16 md:py-20 text-center">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute top-1/2 right-16 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-pill text-white/90 text-body-sm font-medium mb-5 border border-white/20">
              <Stethoscope className="h-3.5 w-3.5" />
              Start your health journey today
            </div>

            <h2
              id="cta-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight text-balance"
            >
              Ready to Take Control of{' '}
              <br className="hidden md:block" />
              Your Health?
            </h2>

            <p className="text-blue-100 text-body-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join over 10,000 patients who have already discovered a better way to manage their healthcare.
              Sign up free and book your first appointment today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" id="cta-get-started-btn">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-blue-50 shadow-lg"
                  icon={<CalendarDays className="h-5 w-5" />}
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/doctors" id="cta-browse-doctors-btn">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                  icon={<ArrowRight className="h-5 w-5" />}
                  iconPosition="right"
                >
                  Browse Doctors
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-blue-200 text-body-sm">
              ✓ No credit card required &nbsp;·&nbsp; ✓ Free to sign up &nbsp;·&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
