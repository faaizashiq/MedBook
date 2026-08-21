import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  // appointment statuses
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'

type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  variant?:  BadgeVariant
  size?:     BadgeSize
  dot?:      boolean
  children:  React.ReactNode
  className?: string
}

// ─── Variant Styles ───────────────────────────────────────────────────────────

const variants: Record<BadgeVariant, { badge: string; dot: string }> = {
  default:     { badge: 'bg-gray-100   text-gray-600',         dot: 'bg-gray-400'    },
  primary:     { badge: 'bg-primary-50 text-primary',          dot: 'bg-primary'     },
  success:     { badge: 'bg-success-50 text-success',          dot: 'bg-success'     },
  warning:     { badge: 'bg-warning-50 text-warning-700',      dot: 'bg-warning'     },
  danger:      { badge: 'bg-danger-50  text-danger',           dot: 'bg-danger'      },
  info:        { badge: 'bg-blue-50    text-blue-600',         dot: 'bg-blue-500'    },
  // Appointment statuses
  pending:     { badge: 'bg-warning-50 text-warning-700',      dot: 'bg-warning'     },
  confirmed:   { badge: 'bg-success-50 text-success-600',      dot: 'bg-success'     },
  cancelled:   { badge: 'bg-danger-50  text-danger-600',       dot: 'bg-danger'      },
  rescheduled: { badge: 'bg-primary-50 text-primary-700',      dot: 'bg-primary'     },
}

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2   py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1   text-xs     gap-1.5',
  lg: 'px-3   py-1.5 text-sm     gap-2',
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Badge({
  variant  = 'default',
  size     = 'md',
  dot      = false,
  children,
  className,
}: BadgeProps) {
  const style = variants[variant]

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-semibold rounded-pill',
          style.badge,
          sizes[size],
          className,
        ),
      )}
    >
      {dot && (
        <span className={clsx('rounded-full flex-shrink-0', style.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      )}
      {children}
    </span>
  )
}

// ─── Status label map (for appointment status) ────────────────────────────────

export const statusLabels: Record<string, { label: string; variant: BadgeVariant }> = {
  pending:     { label: 'Pending',     variant: 'pending'     },
  confirmed:   { label: 'Confirmed',   variant: 'confirmed'   },
  cancelled:   { label: 'Cancelled',   variant: 'cancelled'   },
  rescheduled: { label: 'Rescheduled', variant: 'rescheduled' },
  completed:   { label: 'Completed',   variant: 'success'     },
}

export function AppointmentBadge({ status }: { status: string }) {
  const s = statusLabels[status] ?? { label: status, variant: 'default' as BadgeVariant }
  return (
    <Badge variant={s.variant} dot size="md">
      {s.label}
    </Badge>
  )
}
