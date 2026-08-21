'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string
  error?:       string
  hint?:        string
  leftIcon?:    React.ReactNode
  rightIcon?:   React.ReactNode
  containerClassName?: string
}

// ─── Input Component ──────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = 'text',
      containerClassName,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type
    const inputId    = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={twMerge('flex flex-col gap-1.5', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-sm font-semibold text-text-primary"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={twMerge(
              clsx(
                'input-base',
                leftIcon  && 'pl-10',
                (rightIcon || isPassword) && 'pr-10',
                error &&
                  'border-danger focus:border-danger focus:ring-danger/20 bg-danger-50/30',
              ),
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {/* Right icon / password toggle */}
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-text-muted">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="p-0.5 hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : rightIcon ? (
              <span className="pointer-events-none">{rightIcon}</span>
            ) : null}

            {error && !isPassword && (
              <AlertCircle className="h-4 w-4 text-danger" />
            )}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-body-sm text-danger"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Hint */}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-body-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
