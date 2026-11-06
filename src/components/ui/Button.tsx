import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'white' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40 disabled:pointer-events-none disabled:opacity-50 select-none'

    let variantStyles = ''
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-[#15803d] text-white hover:bg-[#166534] shadow-sm active:bg-[#14532d]'
        break
      case 'white':
        variantStyles = 'bg-white text-[#15803d] hover:bg-emerald-50 border border-emerald-100 shadow-md active:bg-emerald-100 font-extrabold'
        break
      case 'amber':
        variantStyles = 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md font-extrabold active:bg-amber-500'
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
        sizeStyles = 'h-8 px-3 text-xs rounded-xl'
        break
      case 'md':
        sizeStyles = 'h-10 px-4 text-sm rounded-xl'
        break
      case 'lg':
        sizeStyles = 'h-12 px-6 text-base rounded-2xl'
        break
      case 'icon':
        sizeStyles = 'h-10 w-10 rounded-xl'
        break
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
