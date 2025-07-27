/**
 * ✅ ACTIVE COMPONENT - PRIMARY LEADS PAGE
 * 
 * This is the MAIN leads page currently used in production.
 * Route: /leads (see App.tsx line 10, 57)
 * Status: ACTIVE - This is the primary leads implementation
 * 
 * DO NOT MODIFY without testing the /leads route!
 * Last updated: Fixed clientAssignments references - 2024-07-27
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  CheckIcon,
  UsersIcon
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
    assignedUserId: undefined,
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
  const queryClient = useQueryClient()
  
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // NEW: Bulk selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)



  // Fetch real leads data from API
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', { searchTerm: searchQuery, statusFilter: selectedStatus, sourceFilter: selectedSource }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedStatus !== '' && { status: selectedStatus }),
        ...(selectedSource !== '' && { source: selectedSource }),
        ...(selectedAssignment !== '' && { assignment: selectedAssignment })
      })
      
      const response = await fetch(`http://localhost:8080/custom/modernui/api.php/leads?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch leads')
      }
      
      return result
    },
    staleTime: 0, // Consider data stale immediately
    cacheTime: 1000, // Keep in cache for only 1 second
    refetchInterval: 3000, // Refresh every 3 seconds
    refetchOnWindowFocus: true // Refetch when window gains focus
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

  // NEW: Bulk selection handlers
  const handleSelectLead = (leadId: string, isSelected: boolean) => {
    console.log('handleSelectLead called:', { leadId, isSelected })
    if (isSelected) {
      setSelectedLeadIds(prev => {
        const newIds = [...prev, leadId]
        console.log('Updated selectedLeadIds:', newIds)
        return newIds
      })
    } else {
      setSelectedLeadIds(prev => {
        const newIds = prev.filter(id => id !== leadId)
        console.log('Updated selectedLeadIds:', newIds)
        return newIds
      })
    }
  }

  const handleSelectAll = (isSelected: boolean) => {
    console.log('handleSelectAll called:', { isSelected, filteredLeadsCount: filteredLeads.length })
    if (isSelected) {
      const allLeadIds = filteredLeads.map((lead: Lead) => lead.id)
      console.log('Selecting all leads:', allLeadIds)
      setSelectedLeadIds(allLeadIds)
      setIsAllSelected(true)
    } else {
      console.log('Deselecting all leads')
      setSelectedLeadIds([])
      setIsAllSelected(false)
    }
  }



  // NEW: Auto-assign selected leads via API
  const handleAutoAssignSelected = async () => {
    if (selectedLeadIds.length === 0) return
    
    try {
      const response = await fetch('http://localhost:8080/custom/modernui/api.php/leads/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeadIds })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Clear selections first
        setSelectedLeadIds([])
        setIsAllSelected(false)
        
        // Show loading toast and refetch data
        const loadingToast = toast.loading('Updating lead assignments...')
        try {
          // Invalidate all leads queries to force fresh data
          await queryClient.invalidateQueries({ queryKey: ['leads'] })
          await refetch()
          toast.success(`${selectedLeadIds.length} leads assigned successfully`, { id: loadingToast })
        } catch (error) {
          console.error('Failed to refresh data:', error)
          toast.error('Assignments completed but failed to refresh data', { id: loadingToast })
        }
      } else {
        toast.error(result.message || 'Failed to assign leads')
      }
    } catch (error) {
      console.error('Auto-assign failed:', error)
      toast.error('Failed to assign leads')
    }
  }

  // NEW: Open assignment panel for single lead
  const handleAssignLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowAssignmentPanel(true)
  }

  const handleAssignmentComplete = async (leadId: string, userId: string | null) => {
    // Close the assignment panel first
    setShowAssignmentPanel(false)
    setSelectedLead(null)
    
    // Show loading toast
    const loadingToast = toast.loading('Updating lead assignment...')
    
    try {
      // Invalidate all leads queries to force fresh data
      await queryClient.invalidateQueries({ queryKey: ['leads'] })
      
      // Also do a manual refetch
      await refetch()
      
      // Show success toast
      if (userId && userId !== 'unassign') {
        toast.success('Lead assigned successfully!', { id: loadingToast })
      } else {
        toast.success('Lead unassigned successfully!', { id: loadingToast })
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
      toast.error('Assignment completed but failed to refresh data', { id: loadingToast })
    }
  }

    // Update filtered leads logic
  const filteredLeads = React.useMemo(() => {
    let filtered = leadsData?.data || []

    if (searchQuery) {
      filtered = filtered.filter((lead: Lead) =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter((lead: Lead) => lead.status === selectedStatus)
    }

    if (selectedSource) {
      filtered = filtered.filter((lead: Lead) => lead.source === selectedSource)
    }

    if (selectedAssignment) {
      if (selectedAssignment === 'assigned') {
        filtered = filtered.filter((lead: Lead) => lead.assignedUserId)
      } else if (selectedAssignment === 'unassigned') {
        filtered = filtered.filter((lead: Lead) => !lead.assignedUserId)
      }
    }

    return filtered
  }, [leadsData?.data, searchQuery, selectedStatus, selectedSource, selectedAssignment])

  // Update selection state when filtered leads change
  React.useEffect(() => {
    const validSelectedIds = selectedLeadIds.filter(id => 
      filteredLeads.some((lead: Lead) => lead.id === id)
    )
    if (validSelectedIds.length !== selectedLeadIds.length) {
      setSelectedLeadIds(validSelectedIds)
    }
    setIsAllSelected(validSelectedIds.length > 0 && validSelectedIds.length === filteredLeads.length)
    setShowBulkActions(validSelectedIds.length > 0)
  }, [filteredLeads, selectedLeadIds])

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and nurture your real estate leads with intelligent assignment
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {showBulkActions && (
            <Button
              onClick={handleAutoAssignSelected}
              disabled={selectedLeadIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {selectedLeadIds.length === 0 ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <BoltIcon className="w-4 h-4 mr-2" />
                  Auto-Assign ({selectedLeadIds.length})
                </>
              )}
            </Button>
          )}
          <Button onClick={() => setShowCaptureModal(true)} className="w-full sm:w-auto">
            <PlusIcon className="w-4 h-4 mr-2" />
            Capture Lead
          </Button>
        </div>
      </div>

      {/* Auto-assignment alert */}
      {leadsData?.data.filter((lead: Lead) => !lead.assignedUserId).length > 0 && (
        <Alert className="mx-4 sm:mx-0">
          <BoltIcon className="h-4 w-4" />
          <AlertDescription>
            You have {leadsData?.data.filter((lead: Lead) => !lead.assignedUserId).length} unassigned lead{leadsData?.data.filter((lead: Lead) => !lead.assignedUserId).length > 1 ? 's' : ''}. 
            Select them and use auto-assignment to distribute based on your configured rules.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Leads</CardTitle>
            <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{leadsData?.data.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active in pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unassigned</CardTitle>
            <EllipsisVerticalIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{leadsData?.data.filter((lead: Lead) => !lead.assignedUserId).length}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">High Score</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {leadsData?.data.filter((lead: Lead) => lead.leadScore >= 80).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Score 80+ leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Score</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {leadsData?.data.length 
                ? Math.round(leadsData.data.reduce((sum: number, lead: Lead) => sum + lead.leadScore, 0) / leadsData.data.length)
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Enhanced filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 p-4 rounded-lg border"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select 
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Zillow">Zillow</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
              <select 
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Leads</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Types</option>
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Score</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (Below 60)</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}



      {/* Bulk Actions Bar */}
      {(showBulkActions || selectedLeadIds.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-900">
                {selectedLeadIds.length} of {filteredLeads.length} leads selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSelectAll(true)}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                Select All
              </Button>
              <Button
                onClick={handleAutoAssignSelected}
                disabled={selectedLeadIds.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                <BoltIcon className="w-4 h-4 mr-1" />
                Auto-Assign ({selectedLeadIds.length})
              </Button>
              <Button
                onClick={() => {
                  setSelectedLeadIds([])
                  setIsAllSelected(false)
                }}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional rendering: Empty State or Data Table */}
      {filteredLeads.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <UsersIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedStatus || selectedSource || selectedAssignment
              ? 'Try adjusting your filters to see more leads.'
              : 'Get started by capturing your first lead.'
            }
          </p>
          <button
            onClick={() => setShowCaptureModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Capture Lead
          </button>
        </div>
      ) : (
        /* Data Table */
        <CRMHubDataTable
        columns={[
                     { 
             key: 'select', 
             title: '',
             mobileLabel: 'Select',
             render: (_, row: Lead) => (
               <div 
                 className="flex items-center justify-center w-8 h-8 -m-2 cursor-pointer hover:bg-gray-100 rounded"
                 onClick={(e) => {
                   e.stopPropagation(); // Prevent row click
                   handleSelectLead(row.id, !selectedLeadIds.includes(row.id));
                 }}
               >
                 <Checkbox
                   checked={selectedLeadIds.includes(row.id)}
                   onCheckedChange={(checked: boolean) => handleSelectLead(row.id, checked)}
                   className="w-4 h-4 text-blue-600 pointer-events-none"
                 />
               </div>
             )
           },
          { 
            key: 'name', 
            title: 'Name',
            mobileLabel: 'Name',
            render: (_, row) => (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {row.firstName?.[0]}{row.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {row.firstName} {row.lastName}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <EnvelopeIcon className="w-3 h-3 mr-1" />
                    {row.email}
                  </div>
                </div>
              </div>
            )
          },
          { 
            key: 'status', 
            title: 'Status',
            mobileLabel: 'Status'
          },
          { 
            key: 'phone', 
            title: 'Phone',
            mobileLabel: 'Phone',
            render: (phone) => (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-3 h-3 mr-1" />
                {phone}
              </div>
            )
          },
          { 
            key: 'source', 
            title: 'Source',
            mobileLabel: 'Source'
          },
          { 
            key: 'assignedUserName', 
            title: 'Assigned To',
            mobileLabel: 'Assigned',
            render: (assignedUserName, row) => (
              <div>
                {row.assignedUserId ? (
                  <span className="text-sm text-gray-900">{assignedUserName}</span>
                ) : (
                  <span className="text-sm text-orange-600 font-medium">Unassigned</span>
                )}
              </div>
            )
          },
          { 
            key: 'leadScore', 
            title: 'Score',
            mobileLabel: 'Score',
            render: (score) => (
              <div className="flex items-center">
                <div className={`text-sm font-medium ${
                  score >= 80 ? 'text-green-600' : 
                  score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {score}
                </div>
                <TrophyIcon className={`w-3 h-3 ml-1 ${
                  score >= 80 ? 'text-green-600' : 
                  score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            )
          },
          { 
            key: 'createdAt', 
            title: 'Created',
            mobileLabel: 'Created',
            render: (createdAt) => (
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </div>
            )
          }
        ]}
        data={filteredLeads}
        pagination={{
          currentPage: 1,
          totalPages: Math.ceil(filteredLeads.length / 10),
          total: filteredLeads.length,
          onPageChange: (page) => console.log('Page changed:', page)
        }}
        onRowClick={(lead: Lead) => {
          // Only open assignment panel, selection is handled by checkboxes
          setSelectedLead(lead)
          setShowAssignmentPanel(true)
        }}
      />
      )}

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
            onAssignmentComplete={(userId) => {
              handleAssignmentComplete(selectedLead.id, userId)
            }}
          />
        )}
    </div>
  )
}
