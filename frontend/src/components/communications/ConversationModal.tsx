import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (conversationData: any) => void
}

export default function ConversationModal({
  isOpen,
  onClose,
  onSubmit
}: ConversationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'direct',
    participantEmails: '',
    relatedContactId: '',
    relatedPropertyId: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const conversationData = {
      ...formData,
      participantIds: formData.participantEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
    }
    
    onSubmit(conversationData)
    setFormData({
      name: '',
      type: 'direct',
      participantEmails: '',
      relatedContactId: '',
      relatedPropertyId: '',
      description: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlusIcon className="w-5 h-5" />
              Start New Conversation
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Conversation Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter conversation name"
                  required
                />
              </div>

              {/* Conversation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="direct">Direct Message</option>
                  <option value="group">Group Chat</option>
                  <option value="transaction_team">Transaction Team</option>
                  <option value="property_inquiry">Property Inquiry</option>
                </select>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants (Email addresses, comma-separated)
                </label>
                <textarea
                  name="participantEmails"
                  value={formData.participantEmails}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com, client@example.com"
                />
              </div>

              {/* Related Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Contact ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedContactId"
                  value={formData.relatedContactId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact ID"
                />
              </div>

              {/* Related Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Property ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedPropertyId"
                  value={formData.relatedPropertyId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Property ID"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the conversation purpose"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Start Conversation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
