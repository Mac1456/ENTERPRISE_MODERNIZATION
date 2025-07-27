import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  UserIcon,
  MapPinIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  CogIcon,
  LightBulbIcon,
  XMarkIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline'

import { LeadService } from '@/services/leadService'
import { Lead, User } from '@/types'

interface LeadAssignmentPanelProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
  onAssignmentComplete: (userId: string | null) => void
}

interface AgentCapacity {
  userId: string
  userName: string
  currentLeads: number
  maxCapacity: number
  specializations: string[]
  location: string
  performance: {
    conversionRate: number
    averageResponseTime: number // in minutes
    closedDeals: number
  }
  availability: 'Available' | 'Busy' | 'Offline'
}

// Mock data for demonstration
const mockAgents: AgentCapacity[] = [
  {
    userId: '1',
    userName: 'John Smith',
    currentLeads: 12,
    maxCapacity: 20,
    specializations: ['Single Family', 'Condo'],
    location: 'Downtown',
    performance: {
      conversionRate: 24.5,
      averageResponseTime: 15,
      closedDeals: 8
    },
    availability: 'Available'
  },
  {
    userId: '2',
    userName: 'Emily Davis',
    currentLeads: 18,
    maxCapacity: 25,
    specializations: ['Luxury', 'Commercial'],
    location: 'Uptown',
    performance: {
      conversionRate: 31.2,
      averageResponseTime: 8,
      closedDeals: 12
    },
    availability: 'Available'
  },
  {
    userId: '3',
    userName: 'Robert Wilson',
    currentLeads: 15,
    maxCapacity: 20,
    specializations: ['Multi Family', 'Investment'],
    location: 'Suburbs',
    performance: {
      conversionRate: 19.8,
      averageResponseTime: 22,
      closedDeals: 6
    },
    availability: 'Busy'
  }
]

export default function LeadAssignmentPanel({ isOpen, onClose, lead, onAssignmentComplete }: LeadAssignmentPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [assignmentReason, setAssignmentReason] = useState<string>('')
  const queryClient = useQueryClient()

  // Fetch real agents from API
  const { data: agents } = useQuery({
    queryKey: ['agent-capacity'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:8080/custom/modernui/api.php/users')
        const result = await response.json()
        
        if (!result.success) {
          // Fallback to mock data if API fails
          console.warn('Failed to fetch agents from API, using mock data')
          return mockAgents
        }
        
        // Transform API response to match component expectations
        return result.data.map((agent: any) => ({
          userId: agent.id,
          userName: agent.name,
          currentLeads: agent.currentLeads || 0,
          maxCapacity: agent.maxCapacity || 25,
          specializations: ['General'], // Mock for now
          location: 'Various', // Mock for now
          performance: agent.performance || {
            conversionRate: 20,
            averageResponseTime: 15,
            closedDeals: 5
          },
          availability: agent.availability || 'Available'
        }))
      } catch (error) {
        console.warn('Error fetching agents, using mock data:', error)
        return mockAgents
      }
    }
  })

  const assignLeadMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string, userId: string }) =>
      LeadService.assignLead(leadId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success(data.message || 'Lead assigned successfully!')
      onAssignmentComplete(variables.userId)
    },
    onError: (error: any) => {
      console.error('Assignment error:', error)
      const errorData = error?.response?.data
      const errorMessage = errorData?.message || errorData?.error || 'Failed to assign lead'
      
      // Handle specific error types with user-friendly messages
      if (errorData?.error === 'AgentNotFound') {
        toast.error('The selected agent does not exist in the system')
      } else if (errorData?.error === 'AgentInactive') {
        toast.error('Cannot assign leads to inactive agents')
      } else if (errorData?.error === 'AgentTerminated') {
        toast.error('Cannot assign leads to terminated employees')
      } else if (errorData?.error === 'LeadAlreadyAssigned') {
        toast.error('This lead is already assigned to the selected agent')
      } else {
        toast.error(errorMessage)
      }
    }
  })

  const unassignLeadMutation = useMutation({
    mutationFn: (leadId: string) => LeadService.unassignLead(leadId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success(data.message || 'Lead unassigned successfully!')
      onAssignmentComplete(null)
    },
    onError: (error: any) => {
      console.error('Unassign error:', error)
      const errorData = error?.response?.data
      const errorMessage = errorData?.message || errorData?.error || 'Failed to unassign lead'
      
      toast.error(errorMessage)
    }
  })

  const autoAssignMutation = useMutation({
    mutationFn: (leadIds: string[]) => LeadService.autoAssignLeads(leadIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead auto-assigned successfully!')
      onAssignmentComplete('auto-assigned')
    },
    onError: (error: any) => {
      console.error('Auto-assignment error:', error)
      const errorData = error?.response?.data
      const errorMessage = errorData?.message || errorData?.error || 'Auto-assignment failed'
      
      toast.error(errorMessage)
    }
  })

  const handleManualAssignment = () => {
    if (!selectedAgent) {
      toast.error('Please select an agent')
      return
    }
    assignLeadMutation.mutate({ leadId: lead.id, userId: selectedAgent })
  }

  const handleUnassignment = () => {
    unassignLeadMutation.mutate(lead.id)
  }

  const handleAutoAssignment = () => {
    autoAssignMutation.mutate([lead.id])
  }

  const calculateMatchScore = (agent: AgentCapacity): number => {
    let score = 0
    
    // Capacity score (30%)
    const capacityRatio = agent.currentLeads / agent.maxCapacity
    score += (1 - capacityRatio) * 30
    
    // Specialization match (25%)
    if (agent.specializations.includes(lead.propertyType)) {
      score += 25
    }
    
    // Performance score (25%)
    score += (agent.performance.conversionRate / 100) * 25
    
    // Response time score (20%)
    const responseScore = Math.max(0, (60 - agent.performance.averageResponseTime) / 60) * 20
    score += responseScore
    
    return Math.round(score)
  }

  const getCapacityColor = (agent: AgentCapacity): string => {
    const ratio = agent.currentLeads / agent.maxCapacity
    if (ratio < 0.6) return 'text-green-600'
    if (ratio < 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Busy': return 'bg-yellow-100 text-yellow-800'
      case 'Offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Assign Lead: {lead.firstName} {lead.lastName}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Lead Information */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Lead Name</p>
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-medium">{lead.propertyType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {lead.preferredLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lead Score</p>
                        <p className="font-medium flex items-center">
                          <TrophyIcon className="w-4 h-4 mr-1 text-yellow-500" />
                          {lead.leadScore}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Assignment Status */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Current Assignment</h3>
                      {lead.assignedUserName && lead.assignedUserName !== 'Unassigned' && lead.assignedUserId && (
                        <button
                          onClick={handleUnassignment}
                          disabled={unassignLeadMutation.isPending}
                          className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserMinusIcon className="w-4 h-4 mr-1" />
                          {unassignLeadMutation.isPending ? 'Unassigning...' : 'Unassign'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {lead.assignedUserName && lead.assignedUserName !== 'Unassigned' && lead.assignedUserId
                            ? lead.assignedUserName 
                            : 'Unassigned'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-medium ${
                            lead.assignedUserName && lead.assignedUserName !== 'Unassigned' && lead.assignedUserId 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {lead.assignedUserName && lead.assignedUserName !== 'Unassigned' && lead.assignedUserId
                              ? 'Assigned' 
                              : 'Awaiting Assignment'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

      {/* Auto-Assignment */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Smart Assignment</h3>
          </div>
          <button
            onClick={handleAutoAssignment}
            disabled={autoAssignMutation.isPending}
            className="btn-primary"
          >
            {autoAssignMutation.isPending ? 'Assigning...' : 'Auto-Assign'}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Let our AI automatically assign this lead to the best available agent based on location, 
          specialization, capacity, and performance metrics.
        </p>
      </div>

      {/* Available Agents */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Agents</h3>
        <div className="space-y-4">
          {agents?.map((agent) => {
            const matchScore = calculateMatchScore(agent)
            return (
              <motion.div
                key={agent.userId}
                whileHover={{ scale: 1.02 }}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedAgent === agent.userId 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedAgent(agent.userId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{agent.userName}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(agent.availability)}`}>
                        {agent.availability}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Match Score</div>
                    <div className="text-lg font-bold text-primary-600">{matchScore}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Capacity</div>
                    <div className={`font-medium ${getCapacityColor(agent)}`}>
                      {agent.currentLeads}/{agent.maxCapacity}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Conversion</div>
                    <div className="font-medium">{agent.performance.conversionRate}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Response Time</div>
                    <div className="font-medium flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {agent.performance.averageResponseTime}m
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Closed Deals</div>
                    <div className="font-medium">{agent.performance.closedDeals}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-gray-500 text-xs">Specializations</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.specializations.map((spec) => (
                      <span 
                        key={spec} 
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          spec === lead.propertyType 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Assignment Reason */}
        {selectedAgent && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Reason (Optional)
            </label>
            <textarea
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Why are you assigning this lead to the selected agent?"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleManualAssignment}
            disabled={!selectedAgent || assignLeadMutation.isPending}
            className="btn-primary"
          >
            {assignLeadMutation.isPending ? 'Assigning...' : 'Assign Lead'}
          </button>
        </div>
      </div>

      {/* Assignment Rules */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CogIcon className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Assignment Rules</h3>
          </div>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Configure Rules
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Location Priority</div>
            <div className="text-gray-600">Agents in same area get priority</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Capacity Balancing</div>
            <div className="text-gray-600">Distribute based on current workload</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Specialization Match</div>
            <div className="text-gray-600">Match property types to expertise</div>
          </div>
        </div>
      </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
