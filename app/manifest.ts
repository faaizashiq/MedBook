import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MedBook — Find & Book Trusted Doctors',
    short_name: 'MedBook',
    description:
      'Connect with trusted healthcare professionals anytime, anywhere.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFE',
    theme_color: '#2563EB',
    orientation: 'portrait',
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
    screenshots: [],
  }
}
