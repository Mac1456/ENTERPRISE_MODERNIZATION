import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className 
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': variant === 'default',
          'bg-gray-100 text-gray-800': variant === 'secondary',
          'bg-transparent border border-gray-300 text-gray-700': variant === 'outline',
          'bg-red-100 text-red-800': variant === 'destructive',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
