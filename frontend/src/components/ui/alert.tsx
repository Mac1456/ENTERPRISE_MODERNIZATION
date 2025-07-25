import React from 'react'
import { clsx } from 'clsx'

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'warning' | 'error' | 'success'
  className?: string
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'default', 
  className 
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg border p-4',
        {
          'bg-blue-50 border-blue-200 text-blue-800': variant === 'default',
          'bg-yellow-50 border-yellow-200 text-yellow-800': variant === 'warning',
          'bg-red-50 border-red-200 text-red-800': variant === 'error',
          'bg-green-50 border-green-200 text-green-800': variant === 'success',
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface AlertDescriptionProps {
  children: React.ReactNode
  className?: string
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={clsx('text-sm mt-2', className)}>
      {children}
    </div>
  )
}
