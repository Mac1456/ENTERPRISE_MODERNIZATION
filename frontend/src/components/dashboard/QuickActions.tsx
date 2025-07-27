import React from 'react'
import { motion } from 'framer-motion'
import {
  UserPlusIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  CalendarIcon,
  DocumentPlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface QuickAction {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  color: string
}

interface QuickActionsProps {
  onCreateLead: () => void
  onAddProperty: () => void
  onLogCall: () => void
  onScheduleMeeting: () => void
  onCreateDocument: () => void
  onStartChat: () => void
}

export default function QuickActions({
  onCreateLead,
  onAddProperty,
  onLogCall,
  onScheduleMeeting,
  onCreateDocument,
  onStartChat
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      name: 'New Lead',
      description: 'Capture new lead',
      icon: UserPlusIcon,
      onClick: onCreateLead,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      name: 'Add Property',
      description: 'List new property',
      icon: BuildingOffice2Icon,
      onClick: onAddProperty,
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      name: 'Log Call',
      description: 'Record phone call',
      icon: PhoneIcon,
      onClick: onLogCall,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    },
    {
      name: 'Schedule',
      description: 'Book meeting',
      icon: CalendarIcon,
      onClick: onScheduleMeeting,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    },
    {
      name: 'Document',
      description: 'Create document',
      icon: DocumentPlusIcon,
      onClick: onCreateDocument,
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
    },
    {
      name: 'Message',
      description: 'Send message',
      icon: ChatBubbleLeftRightIcon,
      onClick: onStartChat,
      color: 'text-teal-600 bg-teal-50 hover:bg-teal-100'
    }
  ]

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className={`
              p-4 rounded-lg border border-gray-200 transition-all duration-200
              ${action.color}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">{action.name}</p>
            <p className="text-xs opacity-75 mt-1">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
