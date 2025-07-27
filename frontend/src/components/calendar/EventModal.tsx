import React, { useState, useEffect } from 'react'
import { CalendarEvent, EventType, Contact, Account, Opportunity } from '../../types'
import { apiService } from '../../services/api'
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PhoneIcon,
  VideoCameraIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface EventModalProps {
  event?: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  selectedDate?: Date
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onSave, selectedDate }) => {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Meeting' as EventType,
    startDate: '',
    endDate: '',
    location: '',
    attendees: [] as string[],
    attendeeInput: '',
    assignedUserId: '',
    assignedUserName: '',
    relatedContactId: '',
    relatedAccountId: '',
    relatedOpportunityId: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadRelatedData()
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          type: event.type,
          startDate: new Date(event.startDate).toISOString().slice(0, 16),
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
          location: event.location || '',
          attendees: event.attendees || [],
          attendeeInput: '',
          assignedUserId: event.assignedUserId,
          assignedUserName: event.assignedUserName,
          relatedContactId: event.relatedContactId || '',
          relatedAccountId: event.relatedAccountId || '',
          relatedOpportunityId: event.relatedOpportunityId || ''
        })
      } else {
        const defaultStart = selectedDate || new Date()
        const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000) // 1 hour later
        
        setFormData({
          title: '',
          description: '',
          type: 'Meeting',
          startDate: defaultStart.toISOString().slice(0, 16),
          endDate: defaultEnd.toISOString().slice(0, 16),
          location: '',
          attendees: [],
          attendeeInput: '',
          assignedUserId: '1', // Default to current user
          assignedUserName: 'Current User',
          relatedContactId: '',
          relatedAccountId: '',
          relatedOpportunityId: ''
        })
      }
    }
  }, [isOpen, event, selectedDate])

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
    if (!formData.title.trim() || !formData.startDate) return

    setLoading(true)
    try {
      const eventData: CalendarEvent = {
        id: event?.id || `event-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        location: formData.location,
        attendees: formData.attendees,
        assignedUserId: formData.assignedUserId,
        assignedUserName: formData.assignedUserName,
        relatedContactId: formData.relatedContactId || undefined,
        relatedContactName: contacts.find(c => c.id === formData.relatedContactId)?.firstName + ' ' + contacts.find(c => c.id === formData.relatedContactId)?.lastName,
        relatedAccountId: formData.relatedAccountId || undefined,
        relatedAccountName: accounts.find(a => a.id === formData.relatedAccountId)?.name,
        relatedOpportunityId: formData.relatedOpportunityId || undefined,
        relatedOpportunityName: opportunities.find(o => o.id === formData.relatedOpportunityId)?.name
      }

      if (event) {
        await apiService.put(`/calendar/events/${event.id}`, eventData)
      } else {
        await apiService.post('/calendar/events', eventData)
      }

      onSave(eventData)
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addAttendee = () => {
    if (formData.attendeeInput.trim() && !formData.attendees.includes(formData.attendeeInput.trim())) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, formData.attendeeInput.trim()],
        attendeeInput: ''
      })
    }
  }

  const removeAttendee = (attendee: string) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter(a => a !== attendee)
    })
  }

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'Meeting':
        return <UserGroupIcon className="h-5 w-5" />
      case 'Call':
        return <PhoneIcon className="h-5 w-5" />
      case 'Property Showing':
        return <HomeIcon className="h-5 w-5" />
      case 'Inspection':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'Closing':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'Task':
        return <ClockIcon className="h-5 w-5" />
      default:
        return <CalendarIcon className="h-5 w-5" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getEventTypeIcon(formData.type)}
            <h2 className="text-xl font-bold text-gray-900">
              {event ? 'Edit Event' : 'Create New Event'}
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
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Meeting">Meeting</option>
                <option value="Call">Call</option>
                <option value="Property Showing">Property Showing</option>
                <option value="Inspection">Inspection</option>
                <option value="Closing">Closing</option>
                <option value="Task">Task</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              placeholder="Enter event description"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendees
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={formData.attendeeInput}
                onChange={(e) => setFormData({ ...formData, attendeeInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter attendee name or email"
              />
              <button
                type="button"
                onClick={addAttendee}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            {formData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {attendee}
                    <button
                      type="button"
                      onClick={() => removeAttendee(attendee)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              disabled={loading || !formData.title.trim() || !formData.startDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
