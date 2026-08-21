import type { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'

export const metadata: Metadata = {
  title: 'MedBook — Find & Book Trusted Doctors',
  description:
    'Connect with trusted healthcare professionals anytime, anywhere. Book appointments with verified doctors instantly on MedBook.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  )
}
