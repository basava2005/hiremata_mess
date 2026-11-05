import React from 'react'

export type BadgeVariant =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'UPCOMING'
  | 'SUCCESS'
  | 'FAILED'
  | 'DEFAULT'

interface BadgeProps {
  variant?: BadgeVariant | string
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export const StatusBadge: React.FC<BadgeProps> = ({
  variant = 'DEFAULT',
  children,
  className = '',
  dot = true,
}) => {
  const norm = variant.toUpperCase()

  let style = 'bg-slate-100 text-slate-700 border-slate-200'
  let dotColor = 'bg-slate-400'

  switch (norm) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'SUCCESS':
      // Active green, Approved green
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200'
      dotColor = 'bg-emerald-500'
      break

    case 'EXPIRING_SOON':
      // Expiring Soon amber
      style = 'bg-amber-50 text-amber-800 border-amber-200'
      dotColor = 'bg-amber-500 animate-pulse'
      break

    case 'EXPIRED':
    case 'REJECTED':
    case 'FAILED':
      // Expired red, Rejected red
      style = 'bg-rose-50 text-rose-800 border-rose-200'
      dotColor = 'bg-rose-500'
      break

    case 'PENDING':
      // Pending yellow
      style = 'bg-yellow-50 text-yellow-800 border-yellow-200'
      dotColor = 'bg-yellow-500'
      break

    case 'CANCELLED':
      // Cancelled gray
      style = 'bg-slate-100 text-slate-600 border-slate-200'
      dotColor = 'bg-slate-400'
      break

    case 'UPCOMING':
      style = 'bg-blue-50 text-blue-800 border-blue-200'
      dotColor = 'bg-blue-500'
      break
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  )
}

