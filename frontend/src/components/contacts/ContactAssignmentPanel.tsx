import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ContactAssignmentPanelProps {
  isOpen: boolean
  onClose: () => void
  contactIds: string[]
  onAssign: (contactIds: string[], assignmentData: any) => void
}

interface Agent {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  workload?: number
}

export default function ContactAssignmentPanel({
  isOpen,
  onClose,
  contactIds,
  onAssign
}: ContactAssignmentPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<'manual' | 'auto'>('manual')

  // Fetch available agents
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/custom/modernui/api.php/users')
      const result = await response.json()
      return result.data || []
    },
    enabled: isOpen
  })

  const agents: Agent[] = agentsData || []

  const getWorkloadColor = (workload: number = 0) => {
    if (workload >= 80) return 'text-red-600'
    if (workload >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getWorkloadBadgeVariant = (workload: number = 0) => {
    if (workload >= 80) return 'destructive'
    if (workload >= 60) return 'secondary'
    return 'default'
  }

  const handleManualAssignment = () => {
    if (!selectedAgent) return

    const agent = agents.find(a => a.id === selectedAgent)
    if (!agent) return

    onAssign(contactIds, {
      userId: selectedAgent,
      userName: agent.name,
      type: 'manual'
    })
  }

  const handleAutoAssignment = () => {
    // Auto-assignment will be handled by the API
    onAssign(contactIds, {
      type: 'auto'
    })
  }

  const handleUnassign = () => {
    onAssign(contactIds, {
      userId: null,
      userName: 'Unassigned',
      type: 'unassign'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Assign Contacts ({contactIds.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assignment Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assignment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assignmentType"
                    value="manual"
                    checked={assignmentType === 'manual'}
                    onChange={(e) => setAssignmentType(e.target.value as 'manual' | 'auto')}
                    className="mr-3"
                  />
                  Manual Assignment
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assignmentType"
                    value="auto"
                    checked={assignmentType === 'auto'}
                    onChange={(e) => setAssignmentType(e.target.value as 'manual' | 'auto')}
                    className="mr-3"
                  />
                  Auto Assignment (Smart Distribution)
                </label>
              </div>
            </div>

            {/* Manual Assignment */}
            {assignmentType === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Agent
                </label>
                {isLoading ? (
                  <div className="text-center py-4">Loading agents...</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {agents.map((agent) => {
                      const workload = Math.floor(Math.random() * 100) // Mock workload
                      return (
                        <label
                          key={agent.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedAgent === agent.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedAgent"
                            value={agent.id}
                            checked={selectedAgent === agent.id}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="mr-3"
                          />
                          <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{agent.name}</span>
                              <Badge variant={getWorkloadBadgeVariant(workload)}>
                                {workload}% Load
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">{agent.role}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Auto Assignment Info */}
            {assignmentType === 'auto' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Smart Auto Assignment</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      Contacts will be distributed automatically based on agent workload, 
                      location proximity, and specialization.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleUnassign}>
                Unassign All
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {assignmentType === 'manual' ? (
                  <Button 
                    onClick={handleManualAssignment}
                    disabled={!selectedAgent}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Assign to {selectedAgent ? agents.find(a => a.id === selectedAgent)?.name : 'Agent'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleAutoAssignment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Auto Assign
                  </Button>
                )}
              </div>
            </div>

            {/* Assignment Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {contactIds.length} contact{contactIds.length > 1 ? 's' : ''} will be assigned
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
