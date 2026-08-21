'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Types ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'warning'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

// ─── Variant Styles ───────────────────────────────────────────────────────────

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-700 active:bg-primary-800 shadow-btn hover:shadow-lg focus:ring-primary/30',
  secondary:
    'bg-primary-50 text-primary hover:bg-primary-100 active:bg-primary-200 focus:ring-primary/20',
  outline:
    'border-2 border-primary text-primary bg-transparent hover:bg-primary-50 active:bg-primary-100 focus:ring-primary/20',
  ghost:
    'text-text-secondary bg-transparent hover:bg-gray-100 hover:text-text-primary active:bg-gray-200 focus:ring-gray-200',
  success:
    'bg-success text-white hover:bg-success-700 active:bg-success-700 shadow-sm hover:shadow-md focus:ring-success/30',
  danger:
    'bg-danger text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm hover:shadow-md focus:ring-danger/30',
  warning:
    'bg-warning text-white hover:bg-warning-700 active:bg-warning-700 shadow-sm hover:shadow-md focus:ring-warning/30',
}

// ─── Size Styles ──────────────────────────────────────────────────────────────

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7  px-3   text-[11px] gap-1   rounded-lg',
  sm: 'h-8  px-4   text-xs     gap-1.5 rounded-lg',
  md: 'h-10 px-5   text-sm     gap-2   rounded-pill',
  lg: 'h-12 px-7   text-base   gap-2   rounded-pill',
  xl: 'h-14 px-8   text-lg     gap-2.5 rounded-pill',
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={twMerge(
          clsx(
            // Base
            'inline-flex items-center justify-center font-semibold',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
            'select-none no-tap',
            // Variant
            variants[variant],
            // Size
            sizes[size],
            // Width
            fullWidth && 'w-full',
            className,
          ),
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
        ) : icon && iconPosition === 'left' ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && icon && iconPosition === 'right' ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
      </button>
    )
  },
)

Button.displayName = 'Button'

// ─── Icon Button ─────────────────────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  label: string  // a11y
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', label, children, className, ...props }, ref) => {
    const squareSizes: Record<ButtonSize, string> = {
      xs: 'h-7  w-7',
      sm: 'h-8  w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-14 w-14',
    }

    return (
      <button
        ref={ref}
        aria-label={label}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'select-none no-tap',
            variants[variant],
            squareSizes[size],
            className,
          ),
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
