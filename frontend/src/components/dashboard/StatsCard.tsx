import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    text: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    text: 'text-orange-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-600'
  }
}

export default function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card"
    >
      <div className="flex items-center">
        <div className={`${colors.bg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center">
          <div className={`flex items-center text-sm ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="font-medium">{Math.abs(change.value)}%</span>
          </div>
          <span className="text-sm text-gray-500 ml-2">{change.period}</span>
        </div>
      )}
    </motion.div>
  )
}
