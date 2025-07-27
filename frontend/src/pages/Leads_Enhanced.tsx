/**
 * ✅ ACTIVE COMPONENT - PRIMARY LEADS PAGE
 * 
 * This is the MAIN leads page currently used in production.
 * Route: /leads (see App.tsx line 10, 57)
 * Status: ACTIVE - This is the primary leads implementation
 * 
 * DO NOT MODIFY without testing the /leads route!
 */

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
  EllipsisVerticalIcon,
  BoltIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { LeadService } from '@/services/leadService'
import { Lead, LeadStatus } from '@/types'
import LeadCaptureModal from '@/components/leads/LeadCaptureModal'
import LeadAssignmentPanel from '@/components/leads/LeadAssignmentPanel'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

// Mock data for demonstration
const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    title: 'Marketing Manager',
    company: 'Tech Corp',
    status: 'New',
    source: 'Website',
    assignedUserId: '1',
    assignedUserName: 'John Smith',
    propertyType: 'Condo',
    budget: { min: 300000, max: 500000 },
    preferredLocation: 'Downtown',
    timeline: 'Within 3 months',
    leadScore: 75,
    geolocation: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '(555) 987-6543',
    title: 'Software Engineer',
    company: 'Dev Solutions',
    status: 'Qualified',
    source: 'Zillow',
    assignedUserId: '2',
    assignedUserName: 'Jane Doe',
    propertyType: 'Single Family',
    budget: { min: 400000, max: 750000 },
    preferredLocation: 'Suburbs',
    timeline: 'Within 6 months',
    leadScore: 88,
    geolocation: { lat: 40.6782, lng: -73.9442 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 456-7890',
    title: 'Designer',
    company: 'Creative Agency',
    status: 'New',
    source: 'Referral',
    assignedUserId: null,
    assignedUserName: 'Unassigned',
    propertyType: 'Townhouse',
    budget: { min: 350000, max: 600000 },
    preferredLocation: 'Historic District',
    timeline: 'Immediate',
    leadScore: 92,
    geolocation: { lat: 40.7589, lng: -73.9851 },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
]

export default function LeadsEnhanced() {
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [sourceFilter, setSourceFilter] = useState('All Sources')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [autoAssigning, setAutoAssigning] = useState(false)

  // Fetch real leads data from API
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', { searchTerm, statusFilter, sourceFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'All Statuses' && { status: statusFilter }),
        ...(sourceFilter !== 'All Sources' && { source: sourceFilter })
      })
      
      const response = await fetch(`http://localhost:8080/custom/modernui/api.php/leads?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch leads')
      }
      
      return result
    },
    refetchInterval: 5000 // Refresh every 5 seconds to see updates
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  const handleAssignLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowAssignmentPanel(true)
  }

  const handleAssignmentComplete = () => {
    setShowAssignmentPanel(false)
    setSelectedLead(null)
    refetch() // Refresh the leads data to show updates
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId])
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leadsData?.data.map(lead => lead.id) || [])
    } else {
      setSelectedLeads([])
    }
  }

  const handleAutoAssign = async () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to auto-assign')
      return
    }

    try {
      setAutoAssigning(true)
      const result = await LeadService.autoAssignLeads(selectedLeads)
      
      const assignedCount = result.assigned.length
      const failedCount = result.failed.length
      
      if (assignedCount > 0) {
        toast.success(`Successfully auto-assigned ${assignedCount} lead${assignedCount > 1 ? 's' : ''}`)
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to assign ${failedCount} lead${failedCount > 1 ? 's' : ''}`)
      }
      
      // Clear selection and refetch data
      setSelectedLeads([])
      refetch()
      
    } catch (error) {
      console.error('Auto-assignment failed:', error)
      toast.error('Auto-assignment failed. Please try again.')
    } finally {
      setAutoAssigning(false)
    }
  }

  const unassignedLeads = leadsData?.data.filter(lead => !lead.assignedUserId) || []
  const hasUnassignedLeads = unassignedLeads.length > 0

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and nurture your real estate leads with intelligent assignment
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedLeads.length > 0 && (
            <Button
              onClick={handleAutoAssign}
              disabled={autoAssigning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {autoAssigning ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <BoltIcon className="w-4 h-4 mr-2" />
                  Auto-Assign ({selectedLeads.length})
                </>
              )}
            </Button>
          )}
          <Button onClick={() => setShowCaptureModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Capture Lead
          </Button>
        </div>
      </div>

      {/* Auto-assignment alert */}
      {hasUnassignedLeads && (
        <Alert>
          <BoltIcon className="h-4 w-4" />
          <AlertDescription>
            You have {unassignedLeads.length} unassigned lead{unassignedLeads.length > 1 ? 's' : ''}. 
            Select them and use auto-assignment to distribute based on your configured rules.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsData?.data.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active in pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <EllipsisVerticalIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unassignedLeads.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Score</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leadsData?.data.filter(lead => lead.leadScore >= 80).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Score 80+ leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadsData?.data.length 
                ? Math.round(leadsData.data.reduce((sum, lead) => sum + lead.leadScore, 0) / leadsData.data.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Average lead score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option>All Statuses</option>
          <option>New</option>
          <option>Assigned</option>
          <option>Qualified</option>
          <option>Contacted</option>
          <option>Converted</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option>All Sources</option>
          <option>Website</option>
          <option>Zillow</option>
          <option>Realtor.com</option>
          <option>Referral</option>
          <option>Social Media</option>
        </select>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Management</CardTitle>
            {leadsData?.data && leadsData.data.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedLeads.length === leadsData.data.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select All ({selectedLeads.length} selected)
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadsData?.data.map((lead) => (
              <motion.div
                key={lead.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAssignLead(lead)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <Badge variant={
                          lead.status === 'New' ? 'default' : 
                          lead.status === 'Assigned' ? 'secondary' : 
                          lead.status === 'Qualified' ? 'secondary' : 
                          'outline'
                        }>
                          {lead.status}
                        </Badge>
                        <Badge variant={getScoreBadgeVariant(lead.leadScore)}>
                          Score: {lead.leadScore}
                        </Badge>
                        {!lead.assignedUserId && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Unassigned
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{lead.preferredLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{lead.timeline}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span><strong>Budget:</strong> {formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}</span>
                        <span><strong>Property:</strong> {lead.propertyType}</span>
                        <span><strong>Source:</strong> {lead.source}</span>
                        {lead.assignedUserName && lead.assignedUserName !== 'Unassigned' && (
                          <span><strong>Assigned to:</strong> {lead.assignedUserName}</span>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Created {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })} • 
                        Last updated {formatDistanceToNow(new Date(lead.modifiedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  <Menu as="div" className="relative">
                    <Menu.Button 
                      className="flex items-center p-2 text-gray-400 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleAssignLead(lead)}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              <UserPlusIcon className="w-4 h-4 inline mr-2" />
                              {lead.assignedUserId ? 'Reassign' : 'Assign'} Lead
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              <PhoneIcon className="w-4 h-4 inline mr-2" />
                              Call Lead
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                              Send Email
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                </div>
              </motion.div>
            ))}

            {(!leadsData?.data || leadsData.data.length === 0) && (
              <div className="text-center py-12">
                <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by capturing your first lead.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowCaptureModal(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Capture Lead
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCaptureModal && (
        <LeadCaptureModal
          isOpen={showCaptureModal}
          onClose={() => setShowCaptureModal(false)}
          onLeadCaptured={() => {
            refetch()
          }}
        />
      )}

      {showAssignmentPanel && selectedLead && (
        <LeadAssignmentPanel
          isOpen={showAssignmentPanel}
          onClose={() => {
            setShowAssignmentPanel(false)
            setSelectedLead(null)
          }}
          lead={selectedLead}
          onAssignmentComplete={() => {
            refetch()
            setShowAssignmentPanel(false)
            setSelectedLead(null)
          }}
        />
      )}
    </div>
  )
}
