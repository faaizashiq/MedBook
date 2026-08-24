'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Menu,
  X,
  Stethoscope,
  Users,
  BookOpen,
  Phone,
  Home,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Eye,
  CalendarDays,
  Sparkles,
  DollarSign,
  Clock,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/lib/auth/authContext'

// ─── Nav Links ───────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/about', label: 'About', icon: Users },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/contact', label: 'Contact', icon: Phone },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close mobile & dropdown on route change */
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  /* Close user dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isDoctor = user?.role === 'DOCTOR'
  const dashboardHref = isDoctor ? '/doctor' : '/patient'
  const dashboardLabel = isDoctor ? 'Doctor Dashboard' : 'Patient Portal'
  const isOnDashboard = pathname === dashboardHref || pathname.startsWith(`${dashboardHref}/`)

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push('/login')
  }

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-border/50'
            : 'bg-white/85 backdrop-blur-sm border-b border-slate-100'
        )}
      >
        <div className="container-app">
          <nav
            className="flex items-center justify-between h-16 md:h-18"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Logo size="xl" />

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={clsx(
                        'nav-link px-3.5 py-2 rounded-xl block text-sm font-medium transition-colors',
                        isActive
                          ? 'text-primary bg-primary-50 font-semibold'
                          : 'text-text-secondary hover:text-primary hover:bg-primary-50/60'
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <button
                id="navbar-search-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-primary hover:bg-primary-50 transition-colors"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              {/* Dynamic Auth / Dashboard buttons */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {!isOnDashboard && (
                    <Link
                      href={dashboardHref}
                      id="navbar-dashboard-btn"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{dashboardLabel}</span>
                      <span className="sm:hidden">Dashboard</span>
                    </Link>
                  )}

                  {/* User Profile Dropdown (Desktop) */}
                  <div className="relative hidden md:block" ref={menuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                    >
                      <Avatar
                        src={user.avatarUrl}
                        name={user.fullName}
                        size="sm"
                        online
                      />
                      <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                        {user.fullName || 'My Account'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in">
                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                          <Avatar src={user.avatarUrl} name={user.fullName} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                              <ShieldCheck className="h-3 w-3" />
                              {isDoctor ? 'Verified Doctor' : 'Verified Patient'}
                            </span>
                          </div>
                        </div>

                        <div className="p-1 space-y-0.5">
                          <Link
                            href={dashboardHref}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                            {dashboardLabel}
                          </Link>

                          {isDoctor && (
                            <>
                              <Link
                                href={`/doctors/${user.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                                View Public Profile
                              </Link>
                              <Link
                                href="/doctor/setup?tab=profile"
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <User className="h-3.5 w-3.5 text-slate-500" />
                                Practice Settings
                              </Link>
                            </>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    id="navbar-login-btn"
                    className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    id="navbar-signup-btn"
                    className="hidden md:inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                id="navbar-menu-btn"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:bg-slate-100 transition-colors"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Slide panel */}
        <div
          className={clsx(
            'absolute top-16 left-0 right-0 bg-white border-b border-border shadow-modal transition-all duration-300 max-h-[calc(100vh-64px)] overflow-y-auto',
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          {/* Search bar */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="search"
                placeholder="Search doctors, specialties..."
                className="input-base pl-10 bg-background text-sm"
              />
            </div>
          </div>

          {/* Nav links */}
          <ul className="p-3 space-y-1" role="list">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary bg-primary-50 font-semibold'
                        : 'text-text-secondary hover:text-primary hover:bg-primary-50/60'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Auth / Dashboard actions */}
          <div className="p-4 border-t border-border flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 mb-1">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      {isDoctor ? 'Doctor' : 'Patient'}
                    </span>
                  </div>
                </div>

                {!isOnDashboard && (
                  <Link
                    href={dashboardHref}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-center text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {dashboardLabel}
                  </Link>
                )}

                {isDoctor && (
                  <>
                    <Link
                      href="/doctor/setup?tab=fee"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-center text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      Update Consultation Fee
                    </Link>

                    <Link
                      href="/doctor/setup?tab=schedule"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-center text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-blue-600" />
                      Update Availability
                    </Link>

                    <Link
                      href={`/doctors/${user.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-center text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4 text-indigo-600" />
                      View Public Profile
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-center text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-center text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-center text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-modal overflow-hidden animate-fade-up">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-5 w-5 text-primary flex-shrink-0" />
              <input
                autoFocus
                type="search"
                placeholder="Search doctors, specialties, conditions..."
                className="flex-1 text-base outline-none text-text-primary placeholder-text-muted bg-transparent"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-body-sm text-text-muted text-center py-6">
                Start typing to search doctors, specialties, or conditions...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so content isn't behind the fixed navbar */}
      <div className="h-16 md:h-18" />
    </>
  )
}
