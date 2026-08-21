'use client'

import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  src?:       string | null
  name?:      string          // used to generate initials
  size?:      'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  online?:    boolean
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return '?'
  // Remove common prefixes like Dr., Mr., Prof.
  const cleanName = name.replace(/^(dr\.|dr|mr\.|mr|mrs\.|mrs|ms\.|ms|prof\.|prof)\s+/i, '').trim()
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Deterministic gradient from name
const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-indigo-600 to-violet-600',
  'from-violet-600 to-purple-600',
  'from-emerald-600 to-teal-600',
  'from-sky-600 to-blue-600',
  'from-pink-600 to-rose-600',
  'from-amber-600 to-orange-600',
  'from-teal-600 to-emerald-600',
]

function getAvatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeMap = {
  xs:  { wrapper: 'h-6  w-6',  text: 'text-[9px]',  badge: 'h-1.5 w-1.5 border' },
  sm:  { wrapper: 'h-8  w-8',  text: 'text-xs',      badge: 'h-2   w-2   border' },
  md:  { wrapper: 'h-10 w-10', text: 'text-sm font-semibold',      badge: 'h-2.5 w-2.5 border' },
  lg:  { wrapper: 'h-12 w-12', text: 'text-base font-bold',    badge: 'h-3   w-3   border-2' },
  xl:  { wrapper: 'h-16 w-16', text: 'text-xl font-bold',      badge: 'h-3.5 w-3.5 border-2' },
  '2xl': { wrapper: 'h-20 w-20', text: 'text-2xl font-bold',   badge: 'h-4   w-4   border-2' },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Avatar({ src, name, size = 'md', online, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Reset imgError whenever src changes so newly selected avatars render immediately
  useEffect(() => {
    setImgError(false)
  }, [src])

  const s = sizeMap[size]
  const initials = name ? getInitials(name) : '?'
  const gradient = name ? getAvatarGradient(name) : 'from-slate-600 to-slate-700'

  const showImage = Boolean(src && !imgError)
  const hasCustomSize = Boolean(className && (className.includes('w-') || className.includes('h-')))

  return (
    <div className={twMerge('relative flex-shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden flex items-center justify-center select-none shadow-xs',
          hasCustomSize ? 'w-full h-full' : s.wrapper,
          !showImage && `bg-gradient-to-tr ${gradient}`,
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={name ?? 'avatar'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={clsx('text-white tracking-wider', s.text)}>{initials}</span>
        )}
      </div>

      {/* Online indicator */}
      {online !== undefined && (
        <span
          aria-label={online ? 'Online' : 'Offline'}
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-white',
            s.badge,
            online ? 'bg-emerald-500' : 'bg-slate-300',
          )}
        />
      )}
    </div>
  )
}

// ─── Avatar Group ─────────────────────────────────────────────────────────────

interface AvatarGroupProps {
  avatars: { src?: string; name?: string }[]
  max?:    number
  size?:   AvatarProps['size']
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const shown    = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className="flex -space-x-2">
      {shown.map((a, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar src={a.src} name={a.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={clsx(
            'ring-2 ring-white rounded-full bg-gray-100 flex items-center justify-center',
            sizeMap[size].wrapper,
          )}
        >
          <span className={clsx('font-semibold text-text-secondary', sizeMap[size].text)}>
            +{overflow}
          </span>
        </div>
      )}
    </div>
  )
}
