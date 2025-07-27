import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import { LeadService } from '@/services/leadService'
import { Lead, LeadStatus } from '@/types'
import LeadCaptureModal from '@/components/leads/LeadCaptureModal'
import LeadAssignmentPanel from '@/components/leads/LeadAssignmentPanel'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'

// Mock data matching the screenshot format
const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'Andrew',
    lastName: 'Peterson',
    email: 'andrew.peterson@example.com',
    phone: '555-764-4117',
    status: 'New',
    source: 'Website',
    assignedUserId: '1',
    assignedUserName: 'Jack Adams',
    propertyType: 'Single Family',
    budget: { min: 300000, max: 500000 },
    preferredLocation: 'Los Angeles',
    timeline: 'Within 3 months',
    leadScore: 75,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '555-987-6543',
    status: 'Qualified',
    source: 'Referral',
    assignedUserId: '2',
    assignedUserName: 'Emily Davis',
    propertyType: 'Condo',
    budget: { min: 400000, max: 700000 },
    preferredLocation: 'Downtown',
    timeline: 'Within 6 months',
    leadScore: 85,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '555-456-7890',
    status: 'Contacted',
    source: 'Social Media',
    assignedUserId: '3',
    assignedUserName: 'Robert Wilson',
    propertyType: 'Townhouse',
    budget: { min: 250000, max: 400000 },
    preferredLocation: 'Suburbs',
    timeline: 'Within 30 days',
    leadScore: 92,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
]

const leadStatuses = ['All Statuses', 'New', 'Contacted', 'Qualified', 'Converted', 'Dead']

export default function LeadsCRMHubStyle() {
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  // Fetch real leads from SuiteCRM (with fallback to mock data)
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', { searchTerm, statusFilter }],
    queryFn: async () => {
      try {
        return await LeadService.getLeads({
          page: 1,
          limit: 10,
          search: searchTerm,
          status: statusFilter
        })
      } catch (error) {
        // Fallback to filtered mock data
        console.log('Using mock data - SuiteCRM API not available')
        const filteredLeads = mockLeads.filter(lead => {
          const matchesSearch = searchTerm === '' || 
            `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase())
          
          const matchesStatus = statusFilter === 'All Statuses' || lead.status === statusFilter
          
          return matchesSearch && matchesStatus
        })
        
        return {
          data: filteredLeads,
          pagination: {
            page: 1,
            limit: 10,
            total: filteredLeads.length,
            totalPages: 1
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  })

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleAssignLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowAssignmentPanel(true)
  }

  // Table columns definition matching CRMHUB style
  const tableColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (value: any, row: Lead) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-700">
              {row.firstName.charAt(0)}{row.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.firstName} {row.lastName}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'propertyType',
      title: 'Account Name',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value: string) => (
        <span className="text-blue-600 hover:text-blue-800">{value}</span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'preferredLocation',
      title: 'City',
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status'
    },
    {
      key: 'assignedUserName',
      title: 'Assigned User',
      render: (value: string, row: Lead) => (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-medium text-red-600">
              {value.split(' ').map(n => n.charAt(0)).join('')}
            </span>
          </div>
          <span className="text-gray-900">{value}</span>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="px-6 py-6 bg-gray-50 min-h-screen">
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
    <>
      {/* Main Content Container - Full Width for Desktop CRM */}
      <div className="px-6 lg:px-8 py-8">
        {/* CRMHUB Page header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and nurture your real estate leads
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCaptureModal(true)}
              className="bg-crmhub-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-crmhub-darkBlue transition-colors flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Lead
            </motion.button>
          </div>
        </div>

        {/* Filters and Search - Desktop Optimized */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-shrink-0">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-crmhub-blue focus:border-crmhub-blue"
              />
            </div>
            
            <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex-shrink-0">
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filter
            </button>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-crmhub-blue text-gray-600 flex-shrink-0"
            >
              {leadStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500 flex-shrink-0">
            Sort by: Name
          </div>
        </div>

        {/* CRMHUB Data Table */}
        <CRMHubDataTable
          columns={tableColumns}
          data={leadsData?.data || []}
          loading={isLoading}
          pagination={{
            currentPage: 1,
            totalPages: Math.ceil((leadsData?.pagination.total || 0) / 10),
            total: leadsData?.pagination.total || 0,
            onPageChange: (page) => console.log('Page:', page)
          }}
        />

        {/* Empty State */}
        {leadsData?.data.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'All Statuses'
                ? 'Try adjusting your filters to see more leads.'
                : 'Start capturing leads to build your pipeline.'
              }
            </p>
            <button
              onClick={() => setShowCaptureModal(true)}
              className="bg-crmhub-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-crmhub-darkBlue transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2 inline" />
              Capture Your First Lead
            </button>
          </div>
        )}
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
      />

      {/* Lead Assignment Panel */}
      {showAssignmentPanel && selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Assign Lead</h2>
                  <button
                    onClick={() => setShowAssignmentPanel(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <LeadAssignmentPanel
                  lead={selectedLead}
                  onAssignmentComplete={() => {
                    setShowAssignmentPanel(false)
                    setSelectedLead(null)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
