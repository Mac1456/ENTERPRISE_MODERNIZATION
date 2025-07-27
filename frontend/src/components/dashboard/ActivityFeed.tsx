import React from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  UserPlusIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { ActivityFeed as ActivityFeedType } from '@/types'

interface ActivityFeedProps {
  activities: ActivityFeedType[]
  isLoading?: boolean
}

const activityIcons = {
  lead_created: UserPlusIcon,
  contact_updated: UserPlusIcon,
  opportunity_won: CurrencyDollarIcon,
  property_listed: BuildingOffice2Icon,
  meeting_scheduled: CalendarIcon,
  call_logged: PhoneIcon,
  document_uploaded: DocumentTextIcon,
}

const activityColors = {
  lead_created: 'text-blue-600 bg-blue-50',
  contact_updated: 'text-green-600 bg-green-50',
  opportunity_won: 'text-purple-600 bg-purple-50',
  property_listed: 'text-orange-600 bg-orange-50',
  meeting_scheduled: 'text-indigo-600 bg-indigo-50',
  call_logged: 'text-teal-600 bg-teal-50',
  document_uploaded: 'text-gray-600 bg-gray-50',
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || DocumentTextIcon
          const colorClass = activityColors[activity.type] || 'text-gray-600 bg-gray-50'

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <span>{activity.userName}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <PhoneIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  )
}
