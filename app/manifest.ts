import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MedBook — Find & Book Trusted Doctors',
    short_name: 'MedBook',
    description:
      'Connect with verified healthcare professionals and manage consultation appointments on MedBook.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8FAFE',
    theme_color: '#2563EB',
    categories: ['medical', 'health', 'lifestyle'],
    icons: [
      {
        src: '/pwa/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Find Doctors',
        short_name: 'Doctors',
        description: 'Browse and book specialists',
        url: '/doctors',
        icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'My Appointments',
        short_name: 'Appointments',
        description: 'View scheduled consultations',
        url: '/patient',
        icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Doctor Portal',
        short_name: 'Doctor',
        description: 'Manage practice & patients',
        url: '/doctor',
        icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
