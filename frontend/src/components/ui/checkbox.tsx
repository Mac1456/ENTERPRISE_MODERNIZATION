import React from 'react'
import { clsx } from 'clsx'
import { CheckIcon } from '@heroicons/react/24/outline'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
}) => {
  const handleChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={handleChange}
      className={clsx(
        'h-4 w-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        {
          'bg-blue-600 border-blue-600': checked,
          'bg-white': !checked,
          'opacity-50 cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
        },
        className
      )}
    >
      {checked && (
        <CheckIcon className="h-3 w-3 text-white" />
      )}
    </button>
  )
}
