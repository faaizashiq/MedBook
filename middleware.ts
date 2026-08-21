import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PATIENT = ['/patient']
const PROTECTED_DOCTOR = ['/doctor']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get JWT token and role from cookie
  const token = request.cookies.get('medbook_token')?.value
  const role = request.cookies.get('medbook_role')?.value?.toLowerCase()

  // 1. Protect patient routes (/patient)
  if (PROTECTED_PATIENT.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    if (role && role !== 'patient') {
      return NextResponse.redirect(new URL('/doctor', request.url))
    }
  }

  // 2. Protect doctor routes (/doctor and /doctor/setup)
  if (PROTECTED_DOCTOR.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    if (role && role !== 'doctor') {
      return NextResponse.redirect(new URL('/patient', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets, manifest, icons
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest|pwa|icons|images|doctors|api).*)',
  ],
}
