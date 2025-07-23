import React from 'react'
import { motion } from 'framer-motion'

interface CRMHubStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    period: string
    isPositive: boolean
  }
  icon?: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'orange' | 'purple' | 'teal'
  size?: 'normal' | 'large'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    accent: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600', 
    border: 'border-green-200',
    accent: 'bg-green-500'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    accent: 'bg-orange-500'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    accent: 'bg-purple-500'
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    border: 'border-teal-200',
    accent: 'bg-teal-500'
  }
}

export default function CRMHubStatsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color, 
  size = 'normal' 
}: CRMHubStatsCardProps) {
  const colors = colorClasses[color]
  const isLarge = size === 'large'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        bg-white rounded-xl border ${colors.border} p-6 relative overflow-hidden h-full
        ${isLarge ? 'col-span-2' : ''}
      `}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colors.accent}`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {Icon && (
              <div className={`${colors.bg} p-2 rounded-lg mr-3`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                {title}
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <p className={`font-bold text-gray-900 ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>

          {trend && (
            <div className="mt-4 flex items-center">
              <div className={`flex items-center text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.isPositive ? '+' : ''}{trend.value}</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">{trend.period}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
