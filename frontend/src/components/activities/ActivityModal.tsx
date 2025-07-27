import React, { useState, useEffect } from 'react'
import { Activity, ActivityType, Contact, Account, Opportunity } from '../../types'
import { apiService } from '../../services/api'
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface ActivityModalProps {
  activity?: Activity | null
  isOpen: boolean
  onClose: () => void
  onSave: (activity: Activity) => void
}

const ActivityModal: React.FC<ActivityModalProps> = ({ activity, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: 'Call' as ActivityType,
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
    assignedUserId: '',
    assignedUserName: '',
    relatedContactId: '',
    relatedAccountId: '',
    relatedOpportunityId: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadRelatedData()
      if (activity) {
        setFormData({
          subject: activity.subject,
          description: activity.description || '',
          type: activity.type,
          status: activity.status,
          priority: activity.priority || 'Medium',
          dueDate: activity.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : '',
          assignedUserId: activity.assignedUserId,
          assignedUserName: activity.assignedUserName,
          relatedContactId: activity.relatedContactId || '',
          relatedAccountId: activity.relatedAccountId || '',
          relatedOpportunityId: activity.relatedOpportunityId || ''
        })
      } else {
        // Reset form for new activity
        setFormData({
          subject: '',
          description: '',
          type: 'Call',
          status: 'Pending',
          priority: 'Medium',
          dueDate: '',
          assignedUserId: '1', // Default to current user
          assignedUserName: 'Current User',
          relatedContactId: '',
          relatedAccountId: '',
          relatedOpportunityId: ''
        })
      }
    }
  }, [isOpen, activity])

  const loadRelatedData = async () => {
    try {
      const [contactsRes, accountsRes, opportunitiesRes] = await Promise.all([
        apiService.get<{success: boolean, data: Contact[]}>('/contacts'),
        apiService.get<{success: boolean, data: Account[]}>('/accounts'),
        apiService.get<{success: boolean, data: Opportunity[]}>('/opportunities')
      ])
      
      setContacts(contactsRes.data || [])
      setAccounts(accountsRes.data || [])
      setOpportunities(opportunitiesRes.data || [])
    } catch (error) {
      console.error('Error loading related data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim()) return

    setLoading(true)
    try {
      const activityData: Activity = {
        id: activity?.id || `activity-${Date.now()}`,
        subject: formData.subject,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        priority: formData.priority as 'Low' | 'Medium' | 'High',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedUserId: formData.assignedUserId,
        assignedUserName: formData.assignedUserName,
        relatedContactId: formData.relatedContactId || undefined,
        relatedContactName: contacts.find(c => c.id === formData.relatedContactId)?.firstName + ' ' + contacts.find(c => c.id === formData.relatedContactId)?.lastName,
        relatedAccountId: formData.relatedAccountId || undefined,
        relatedAccountName: accounts.find(a => a.id === formData.relatedAccountId)?.name,
        relatedOpportunityId: formData.relatedOpportunityId || undefined,
        relatedOpportunityName: opportunities.find(o => o.id === formData.relatedOpportunityId)?.name,
        dateCreated: activity?.dateCreated || new Date().toISOString()
      }

      if (activity) {
        await apiService.put(`/activities/${activity.id}`, activityData)
      } else {
        await apiService.post('/activities', activityData)
      }

      onSave(activityData)
      onClose()
    } catch (error) {
      console.error('Error saving activity:', error)
      alert('Error saving activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getActivityTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call':
        return <PhoneIcon className="h-5 w-5" />
      case 'Email':
        return <EnvelopeIcon className="h-5 w-5" />
      case 'Meeting':
        return <CalendarIcon className="h-5 w-5" />
      case 'Task':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'Note':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />
      case 'Property Showing':
        return <HomeIcon className="h-5 w-5" />
      default:
        return <DocumentTextIcon className="h-5 w-5" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getActivityTypeIcon(formData.type)}
            <h2 className="text-xl font-bold text-gray-900">
              {activity ? 'Edit Activity' : 'Create New Activity'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter activity subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Task">Task</option>
                <option value="Note">Note</option>
                <option value="Property Showing">Property Showing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter activity description"
            />
          </div>

          {/* Related Records */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Contact
              </label>
              <select
                value={formData.relatedContactId}
                onChange={(e) => setFormData({ ...formData, relatedContactId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Account
              </label>
              <select
                value={formData.relatedAccountId}
                onChange={(e) => setFormData({ ...formData, relatedAccountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Opportunity
              </label>
              <select
                value={formData.relatedOpportunityId}
                onChange={(e) => setFormData({ ...formData, relatedOpportunityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Opportunity</option>
                {opportunities.map((opportunity) => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.subject.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (activity ? 'Update Activity' : 'Create Activity')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ActivityModal
