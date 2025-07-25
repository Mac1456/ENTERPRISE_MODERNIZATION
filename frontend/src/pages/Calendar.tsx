import React, { useState, useEffect } from 'react'
import { CalendarEvent, EventType } from '../types'
import EventModal from '../components/calendar/EventModal'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PhoneIcon,
  VideoCameraIcon,
  HomeIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

interface CalendarProps {}

const Calendar: React.FC<CalendarProps> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month')
  const [filterType, setFilterType] = useState<EventType | 'all'>('all')

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: CalendarEvent[]}>('/calendar/events')
      setEvents(response.data || [])
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setEvents(mockEvents) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setIsEditModalOpen(true)
  }

  const handleDuplicateEvent = async (event: CalendarEvent) => {
    try {
      const duplicatedEvent = {
        ...event,
        id: `event-${Date.now()}`,
        title: `${event.title} (Copy)`,
        startDate: new Date(new Date(event.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        endDate: event.endDate ? new Date(new Date(event.endDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
      }
      await apiService.post('/calendar/events', duplicatedEvent)
      fetchEvents()
      alert('Event duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating event:', error)
      alert('Error duplicating event. Please try again.')
    }
  }

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await apiService.delete(`/calendar/events/${event.id}`)
        fetchEvents()
        setSelectedEvent(null)
        alert('Event deleted successfully!')
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Error deleting event. Please try again.')
      }
    }
  }

  const handleSaveEvent = (event: CalendarEvent) => {
    fetchEvents()
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsCreateModalOpen(true)
  }

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startDate)
    const isInCurrentMonth = isSameMonth(eventDate, currentDate)
    const matchesType = filterType === 'all' || event.type === filterType
    
    return isInCurrentMonth && matchesType
  })

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.startDate), day)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const todayEvents = getEventsForDay(new Date())
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)

  return (
    <>
      {/* Desktop-First Layout */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                <p className="text-base text-gray-600 mt-2">Manage your schedule and events</p>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center px-4">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                  <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
                >
                  <option value="all">All Types</option>
                  <option value="Meeting">Meetings</option>
                  <option value="Call">Calls</option>
                  <option value="Property Showing">Property Showings</option>
                  <option value="Inspection">Inspections</option>
                  <option value="Closing">Closings</option>
                  <option value="Task">Tasks</option>
                </select>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Event
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Calendar Section - Takes up most space on desktop */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Days of week header */}
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <div key={day} className="px-6 py-4 text-center">
                    <div className="text-base font-semibold text-gray-900">{day}</div>
                    <div className="text-sm text-gray-500 lg:hidden">{day.slice(0, 3)}</div>
                  </div>
                ))}
              </div>

              {/* Calendar days - Larger cells for desktop */}
              <div className="grid grid-cols-7 divide-x divide-gray-200">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`min-h-[140px] lg:min-h-[160px] p-3 border-b border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      }`}
                    >
                      <div className={`text-base lg:text-lg font-semibold mb-2 ${
                        isToday 
                          ? 'bg-blue-600 text-white w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center' 
                          : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {isToday ? (
                          format(day, 'd')
                        ) : (
                          <span className={isToday ? '' : 'p-2'}>{format(day, 'd')}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {dayEvents.slice(0, 4).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`px-3 py-2 rounded-lg text-sm cursor-pointer hover:shadow-md transition-all ${getEventTypeStyle(event.type)}`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0">
                                {getEventTypeIcon(event.type)}
                              </div>
                              <span className="truncate font-medium">{event.title}</span>
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {format(new Date(event.startDate), 'h:mm a')}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 4 && (
                          <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-lg">
                            +{dayEvents.length - 4} more events
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Better organized for desktop */}
          <div className="xl:w-96 xl:flex-shrink-0 space-y-6">
            {/* Today's Events */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-900">Today's Events</h3>
                <p className="text-sm text-gray-600 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
              </div>
              <div className="p-6">
                {todayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${getEventTypeStyle(event.type)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-base">{event.title}</p>
                            <p className="text-sm opacity-80 mt-1">
                              {format(new Date(event.startDate), 'h:mm a')}
                              {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
                            </p>
                            {event.location && (
                              <div className="flex items-center space-x-2 text-sm opacity-75 mt-2">
                                <MapPinIcon className="h-4 w-4" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No events scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
                <p className="text-sm text-gray-600 mt-1">Next 5 events</p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${getEventTypeStyle(event.type)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-base">{event.title}</p>
                            <p className="text-sm opacity-80 mt-1">
                              {format(new Date(event.startDate), 'MMM d, h:mm a')}
                            </p>
                            {event.location && (
                              <div className="flex items-center space-x-2 text-sm opacity-75 mt-2">
                                <MapPinIcon className="h-4 w-4" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Panel - Mobile overlay, desktop integrated */}
      {selectedEvent && (
        <div className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl">
            <EventDetailPanel
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onUpdate={() => fetchEvents()}
            />
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="hidden xl:block fixed right-8 top-24 bottom-8 w-96 z-50">
          <EventDetailPanel
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onUpdate={() => fetchEvents()}
          />
        </div>
      )}

      {/* Event Modals */}
      <EventModal
        isOpen={isCreateModalOpen}
        selectedDate={selectedDate}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedDate(null)
        }}
        onSave={handleSaveEvent}
      />

      <EventModal
        event={editingEvent}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
      />
    </>
  )
}

// Helper functions moved outside component
const getEventTypeStyle = (type: EventType) => {
  switch (type) {
    case 'Meeting':
      return 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
    case 'Call':
      return 'bg-green-100 text-green-700 border-l-4 border-green-500'
    case 'Property Showing':
      return 'bg-purple-100 text-purple-700 border-l-4 border-purple-500'
    case 'Inspection':
      return 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
    case 'Closing':
      return 'bg-red-100 text-red-700 border-l-4 border-red-500'
    case 'Task':
      return 'bg-gray-100 text-gray-700 border-l-4 border-gray-500'
    default:
      return 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
  }
}

const getEventTypeIcon = (type: EventType) => {
  switch (type) {
    case 'Meeting':
      return <UserGroupIcon className="h-4 w-4" />
    case 'Call':
      return <PhoneIcon className="h-4 w-4" />
    case 'Property Showing':
      return <HomeIcon className="h-4 w-4" />
    case 'Inspection':
      return <DocumentTextIcon className="h-4 w-4" />
    case 'Closing':
      return <DocumentTextIcon className="h-4 w-4" />
    case 'Task':
      return <ClockIcon className="h-4 w-4" />
    default:
      return <CalendarIcon className="h-4 w-4" />
  }
}

// Event Detail Panel Component
const EventDetailPanel: React.FC<{
  event: CalendarEvent
  onClose: () => void
  onUpdate: () => void
}> = ({ event, onClose, onUpdate }) => {
  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className={`p-4 rounded-lg ${getEventTypeStyle(event.type)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getEventTypeIcon(event.type)}
                <span className="text-sm font-medium uppercase tracking-wide">{event.type}</span>
              </div>
              <h4 className="text-xl font-semibold">{event.title}</h4>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Date & Time</h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {format(new Date(event.startDate), 'h:mm a')}
                  {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Location</h5>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{event.location}</span>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Attendees</h5>
              <div className="space-y-2">
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{attendee}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Records */}
          {(event.relatedContactId || event.relatedAccountId || event.relatedOpportunityId) && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Related Records</h5>
              <div className="space-y-2">
                {event.relatedContactId && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Contact: {event.relatedContactName || event.relatedContactId}
                      </span>
                    </div>
                  </div>
                )}
                {event.relatedAccountId && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Account: {event.relatedAccountName || event.relatedAccountId}
                      </span>
                    </div>
                  </div>
                )}
                {event.relatedOpportunityId && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">
                        Opportunity: {event.relatedOpportunityName || event.relatedOpportunityId}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Description</h5>
              <p className="text-sm text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Assignment */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Assigned To</h5>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {event.assignedUserName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => handleEditEvent(event)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Event
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleDuplicateEvent(event)}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Duplicate
            </button>
            <button 
              onClick={() => handleDeleteEvent(event)}
              className="bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Property Showing - 123 Maple Street',
    description: 'Show the downtown condo to potential buyers',
    type: 'Property Showing',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    location: '123 Maple Street, Downtown',
    attendees: ['Sarah Johnson', 'Mike Anderson'],
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    relatedContactId: '1',
    relatedContactName: 'Sarah Johnson',
    relatedOpportunityId: '1',
    relatedOpportunityName: '123 Maple Street Sale'
  },
  {
    id: '2',
    title: 'Client Meeting - Investment Portfolio Review',
    description: 'Quarterly review of real estate investment portfolio',
    type: 'Meeting',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    location: 'Office Conference Room A',
    attendees: ['Robert Chen', 'Investment Team'],
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    relatedAccountId: '3',
    relatedAccountName: 'Westside Investment Fund'
  },
  {
    id: '3',
    title: 'Follow-up Call - Downtown Development Project',
    description: 'Discuss proposal terms and next steps',
    type: 'Call',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    attendees: ['Emily Thompson'],
    assignedUserId: '3',
    assignedUserName: 'Robert Wilson',
    relatedAccountId: '4',
    relatedAccountName: 'Downtown Development Corp'
  },
  {
    id: '4',
    title: 'Property Inspection - 456 Oak Avenue',
    description: 'Buyer inspection for condo purchase',
    type: 'Inspection',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: '456 Oak Avenue, Unit 12B',
    attendees: ['Michael Anderson', 'Professional Inspector'],
    assignedUserId: '2',
    assignedUserName: 'Lisa Rodriguez',
    relatedOpportunityId: '2',
    relatedOpportunityName: '456 Oak Avenue Purchase'
  },
  {
    id: '5',
    title: 'Closing - 789 Pine Road Investment Property',
    description: 'Final closing for investment property purchase',
    type: 'Closing',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Title Company Office',
    attendees: ['Investment Client', 'Title Officer', 'Lender Representative'],
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    relatedOpportunityId: '3',
    relatedOpportunityName: '789 Pine Road Investment'
  }
]

export default Calendar
