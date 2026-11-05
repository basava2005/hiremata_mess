import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    let baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 select-none'

    let variantStyles = ''
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-[#15803d] text-white hover:bg-[#166534] shadow-sm active:bg-[#14532d]'
        break
      case 'secondary':
        variantStyles = 'bg-slate-100 text-slate-800 hover:bg-slate-200'
        break
      case 'outline':
        variantStyles = 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
        break
      case 'ghost':
        variantStyles = 'hover:bg-slate-100 text-slate-700'
        break
      case 'destructive':
        variantStyles = 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
        break
      case 'link':
        variantStyles = 'text-[#15803d] underline-offset-4 hover:underline p-0 h-auto'
        break
    }

    let sizeStyles = ''
    switch (size) {
      case 'sm':
        sizeStyles = 'h-8 px-3 text-xs rounded-lg'
        break
      case 'md':
        sizeStyles = 'h-10 px-4 text-sm rounded-xl'
        break
      case 'lg':
        sizeStyles = 'h-12 px-6 text-base rounded-xl'
        break
      case 'icon':
        sizeStyles = 'h-10 w-10 rounded-xl'
        break
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

