import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?:   boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?:  boolean
  shadow?:  boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
  xl:   'p-10',
}

export function Card({
  hover   = false,
  padding = 'md',
  border  = true,
  shadow  = true,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl',
          border && 'border border-border/80',
          shadow && 'shadow-card',
          hover && [
            'cursor-pointer',
            'transition-all duration-300',
            'hover:-translate-y-1 hover:shadow-card-hover hover:border-primary-100',
          ],
          paddings[padding],
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Card Header ─────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title:      string
  subtitle?:  string
  action?:    React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        <h3 className="text-h4 text-text-primary font-semibold">{title}</h3>
        {subtitle && <p className="text-body-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  value:      string | number
  label:      string
  icon:       React.ReactNode
  iconColor?: string
  trend?:     { value: number; positive: boolean }
  className?: string
}

export function StatCard({ value, label, icon, iconColor = 'bg-primary-50 text-primary', trend, className }: StatCardProps) {
  return (
    <Card className={twMerge('flex items-center gap-4', className)}>
      <div className={clsx('feature-icon flex-shrink-0', iconColor, 'rounded-xl w-12 h-12')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-text-primary">{value}</span>
          {trend && (
            <span className={clsx('text-body-sm font-semibold mb-0.5', trend.positive ? 'text-success' : 'text-danger')}>
              {trend.positive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        <p className="text-body-sm text-text-secondary">{label}</p>
      </div>
    </Card>
  )
}
