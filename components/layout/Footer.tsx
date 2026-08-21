import Link from 'next/link'
import { Heart, Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const FOOTER_LINKS = {
  Company:   [
    { label: 'About Us',  href: '/about'   },
    { label: 'Blog',      href: '/blog'    },
    { label: 'Careers',   href: '#'        },
    { label: 'Press',     href: '#'        },
  ],
  Patients:  [
    { label: 'Find a Doctor', href: '/doctors'          },
    { label: 'Book Appointment', href: '/doctors'       },
    { label: 'Patient Portal', href: '/patient'         },
    { label: 'Reviews',       href: '/patient/reviews'  },
  ],
  Doctors:   [
    { label: 'Join as Doctor', href: '/signup'           },
    { label: 'Doctor Portal',  href: '/doctor'           },
    { label: 'Manage Schedule', href: '/doctor/availability' },
    { label: 'Doctor Setup',   href: '/doctor/setup'    },
  ],
  Legal:     [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use',   href: '#' },
    { label: 'Cookie Policy',  href: '#' },
    { label: 'HIPAA Notice',   href: '#' },
  ],
}

const SOCIALS = [
  { icon: Twitter,   href: '#', label: 'Twitter'   },
  { icon: Linkedin,  href: '#', label: 'LinkedIn'  },
  { icon: Facebook,  href: '#', label: 'Facebook'  },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export function Footer() {
  return (
    <footer className="bg-text-primary text-white" role="contentinfo">
      <div className="container-app py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="mb-5">
              <Logo variant="white" size="md" />
            </div>

            <p className="text-body-md text-gray-400 leading-relaxed mb-6 max-w-xs">
              Connecting patients with trusted healthcare professionals for better, more accessible care.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6 text-body-sm text-gray-400">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>support@medbook.app</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>San Francisco, CA 94103</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-body-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-body-sm text-gray-500">
            © {new Date().getFullYear()} MedBook. All rights reserved.
          </p>
          <p className="text-body-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-danger fill-danger mx-0.5" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  )
}
