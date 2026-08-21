'use client'

import Link from 'next/link'

interface LogoProps {
  variant?: 'default' | 'white' | 'black'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
}

const SIZE_MAP = {
  sm: 'h-8 sm:h-9',
  md: 'h-10 sm:h-12 md:h-14',
  lg: 'h-11 sm:h-12 md:h-14',
  xl: 'h-38 sm:h-14 md:h-44',
}

export function Logo({
  variant = 'default',
  size = 'md',
  href = '/',
  className = '',
}: LogoProps) {
  const logoSrc =
    variant === 'white'
      ? '/logo/default-monochrome-white.svg'
      : variant === 'black'
        ? '/logo/default-monochrome-black.svg'
        : '/logo/default.svg'

  const content = (
    <div
      className={`inline-flex items-center select-none group transition-transform duration-200 hover:scale-[1.02] ${className}`}
    >
      <img
        src={logoSrc}
        alt="MedBook Logo"
        className={`${SIZE_MAP[size]} w-auto object-contain`}
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center no-tap">
        {content}
      </Link>
    )
  }

  return content
}