import React, { useState, useEffect } from 'react'
import { Activity, ActivityType } from '../types'
import CRMHubDataTable from '../components/shared/CRMHubDataTable'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'

interface ActivitiesProps {}

const Activities: React.FC<ActivitiesProps> = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending' | 'In Progress'>('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: Activity[]}>('/activities')
      setActivities(response.data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities(mockActivities) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const getActivityTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call':
        return <PhoneIcon className="h-4 w-4" />
      case 'Email':
        return <EnvelopeIcon className="h-4 w-4" />
      case 'Meeting':
        return <CalendarIcon className="h-4 w-4" />
      case 'Task':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'Note':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />
      case 'Property Showing':
        return <HomeIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  const getActivityTypeStyle = (type: ActivityType) => {
    switch (type) {
      case 'Call':
        return 'bg-green-100 text-green-700'
      case 'Email':
        return 'bg-blue-100 text-blue-700'
      case 'Meeting':
        return 'bg-purple-100 text-purple-700'
      case 'Task':
        return 'bg-yellow-100 text-yellow-700'
      case 'Note':
        return 'bg-gray-100 text-gray-700'
      case 'Property Showing':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleSolidIcon className="h-4 w-4 text-green-500" />
      case 'In Progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'Pending':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Pending':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.assignedUserName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const todayActivities = activities.filter(a => {
    const activityDate = new Date(a.dueDate || a.dateCreated)
    const today = new Date()
    return activityDate.toDateString() === today.toDateString()
  })

  const overdueTasks = activities.filter(a => {
    if (a.status === 'Completed') return false
    const dueDate = new Date(a.dueDate || a.dateCreated)
    return dueDate < new Date()
  })

  const columns = [
    {
      key: 'activity',
      title: 'Activity',
      render: (value: any, activity: Activity) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getActivityTypeStyle(activity.type)}`}>
              {getActivityTypeIcon(activity.type)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">{activity.subject}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeStyle(activity.type)}`}>
                {activity.type}
              </span>
            </div>
            {activity.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{activity.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-1">
              {activity.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.priority === 'High' ? 'bg-red-100 text-red-700' :
                  activity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {activity.priority} Priority
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, activity: Activity) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(activity.status)}
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(activity.status)}`}>
            {activity.status}
          </span>
        </div>
      )
    },
    {
      key: 'related',
      title: 'Related To',
      render: (value: any, activity: Activity) => (
        <div className="space-y-1">
          {activity.relatedContactName && (
            <div className="flex items-center space-x-1">
              <UserIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">Contact: {activity.relatedContactName}</span>
            </div>
          )}
          {activity.relatedAccountName && (
            <div className="flex items-center space-x-1">
              <BuildingOfficeIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">Account: {activity.relatedAccountName}</span>
            </div>
          )}
          {activity.relatedOpportunityName && (
            <div className="flex items-center space-x-1">
              <DocumentTextIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">Deal: {activity.relatedOpportunityName}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value: any, activity: Activity) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'No due date'}
            </span>
          </div>
          {activity.dueDate && (
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'assignedUser',
      title: 'Assigned To',
      render: (value: any, activity: Activity) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{activity.assignedUserName}</span>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex h-full">
          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${selectedActivity ? 'lg:mr-96' : ''}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
              <p className="text-sm text-gray-600">Track calls, meetings, tasks, and other activities</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Activity
            </button>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todayActivities.length}</div>
              <div className="text-sm text-gray-500">Today's Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {activities.filter(a => a.status === 'In Progress').length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
              <div className="text-sm text-gray-500">Overdue</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ActivityType | 'all')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Call">Calls</option>
                  <option value="Email">Emails</option>
                  <option value="Meeting">Meetings</option>
                  <option value="Task">Tasks</option>
                  <option value="Note">Notes</option>
                  <option value="Property Showing">Property Showings</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredActivities.length} activities
            </div>
          </div>
        </div>

            {/* Activities Table */}
            <div className="flex-1 bg-gray-50 p-6">
              <div className="overflow-x-auto">
                <CRMHubDataTable
                  data={filteredActivities}
                  columns={columns}
                  loading={loading}
                  onRowClick={handleActivityClick}
                />
              </div>
            </div>
          </div>

          {/* Activity Detail Panel */}
          {selectedActivity && (
            <ActivityDetailPanel
              activity={selectedActivity}
              onClose={() => setSelectedActivity(null)}
              onUpdate={() => fetchActivities()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Activity Detail Panel Component
const ActivityDetailPanel: React.FC<{
  activity: Activity
  onClose: () => void
  onUpdate: () => void
}> = ({ activity, onClose, onUpdate }) => {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleMarkComplete = async () => {
    setIsCompleting(true)
    try {
      // In a real app, call API to update status
      await new Promise(resolve => setTimeout(resolve, 1000))
      onUpdate()
    } catch (error) {
      console.error('Error completing activity:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Activity Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Activity Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className={`p-4 rounded-lg ${getActivityTypeStyle(activity.type)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getActivityTypeIcon(activity.type)}
                <span className="text-sm font-medium uppercase tracking-wide">{activity.type}</span>
              </div>
              <h4 className="text-xl font-semibold">{activity.subject}</h4>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Status</h5>
              <div className="flex items-center space-x-2">
                {getStatusIcon(activity.status)}
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            </div>
            {activity.priority && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Priority</h5>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  activity.priority === 'High' ? 'bg-red-100 text-red-700' :
                  activity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {activity.priority}
                </span>
              </div>
            )}
          </div>

          {/* Due Date */}
          {activity.dueDate && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Due Date</h5>
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-900">
                    {new Date(activity.dueDate).toLocaleDateString()} at {new Date(activity.dueDate).toLocaleTimeString()}
                  </span>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {activity.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-700">{activity.description}</p>
            </div>
          )}

          {/* Related Records */}
          {(activity.relatedContactId || activity.relatedAccountId || activity.relatedOpportunityId) && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Related Records</h5>
              <div className="space-y-2">
                {activity.relatedContactId && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Contact: {activity.relatedContactName || activity.relatedContactId}
                      </span>
                    </div>
                  </div>
                )}
                {activity.relatedAccountId && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Account: {activity.relatedAccountName || activity.relatedAccountId}
                      </span>
                    </div>
                  </div>
                )}
                {activity.relatedOpportunityId && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">
                        Opportunity: {activity.relatedOpportunityName || activity.relatedOpportunityId}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Assigned To</h5>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {activity.assignedUserName}
                </span>
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Created</h5>
            <div className="text-sm text-gray-600">
              {new Date(activity.dateCreated).toLocaleDateString()} at {new Date(activity.dateCreated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          {activity.status !== 'Completed' && (
            <button 
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isCompleting ? 'Completing...' : 'Mark Complete'}
            </button>
          )}
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Edit Activity
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Duplicate
            </button>
            <button className="bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const mockActivities: Activity[] = [
  {
    id: '1',
    subject: 'Follow-up call with Johnson Properties',
    description: 'Discuss the upcoming property development project and timeline',
    type: 'Call',
    status: 'Pending',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    relatedAccountId: '1',
    relatedAccountName: 'Johnson Properties LLC',
    relatedContactId: '1',
    relatedContactName: 'Michael Johnson',
    dateCreated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    subject: 'Property showing preparation checklist',
    description: 'Prepare marketing materials and coordinate with showing agent',
    type: 'Task',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    assignedUserId: '2',
    assignedUserName: 'Lisa Rodriguez',
    relatedOpportunityId: '1',
    relatedOpportunityName: '123 Maple Street Sale',
    dateCreated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    subject: 'Client meeting - Investment portfolio review',
    description: 'Quarterly review meeting with Westside Investment Fund',
    type: 'Meeting',
    status: 'Completed',
    priority: 'High',
    dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    relatedAccountId: '3',
    relatedAccountName: 'Westside Investment Fund',
    relatedContactId: '3',
    relatedContactName: 'Robert Chen',
    dateCreated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    subject: 'Email follow-up: Downtown development proposal',
    description: 'Send detailed proposal and pricing information to prospect',
    type: 'Email',
    status: 'Completed',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    assignedUserId: '3',
    assignedUserName: 'Robert Wilson',
    relatedAccountId: '4',
    relatedAccountName: 'Downtown Development Corp',
    relatedContactId: '4',
    relatedContactName: 'Emily Thompson',
    dateCreated: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    subject: 'Property inspection coordination',
    description: 'Schedule and coordinate buyer inspection for Oak Avenue condo',
    type: 'Task',
    status: 'Pending',
    priority: 'High',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    assignedUserId: '2',
    assignedUserName: 'Lisa Rodriguez',
    relatedOpportunityId: '2',
    relatedOpportunityName: '456 Oak Avenue Purchase',
    dateCreated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    subject: 'Property showing notes - 789 Pine Road',
    description: 'Document feedback from investor showing and next steps',
    type: 'Note',
    status: 'Completed',
    priority: 'Low',
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    relatedOpportunityId: '3',
    relatedOpportunityName: '789 Pine Road Investment',
    dateCreated: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  }
]

export default Activities
