import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/authContext'
import { Navbar } from '@/components/layout/Navbar'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MedBook — Find & Book Trusted Doctors',
    template: '%s | MedBook',
  },
  description:
    'Connect with trusted healthcare professionals anytime, anywhere. Book appointments with verified doctors instantly on MedBook.',
  keywords: ['doctor', 'appointment', 'healthcare', 'medical', 'booking', 'telemedicine'],
  authors: [{ name: 'MedBook Team' }],
  creator: 'MedBook',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    siteName: 'MedBook',
    title: 'MedBook — Find & Book Trusted Doctors',
    description: 'Connect with trusted healthcare professionals anytime, anywhere.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedBook — Find & Book Trusted Doctors',
    description: 'Connect with trusted healthcare professionals anytime, anywhere.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MedBook',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/pwa/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/pwa/icon-512.png" />
      </head>
      <body className="min-h-screen bg-background antialiased flex flex-col">
        <AuthProvider>
          <ServiceWorkerRegister />
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <PwaInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  )
}
