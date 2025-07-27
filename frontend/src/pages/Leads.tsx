import React, { useState } from 'react'
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
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { LeadService } from '@/services/leadService'
import { Lead, LeadStatus } from '@/types'
import LeadCaptureModal from '@/components/leads/LeadCaptureModal'
import LeadAssignmentPanel from '@/components/leads/LeadAssignmentPanel'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'

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
    lastName: 'Anderson',
    email: 'mike.anderson@example.com',
    phone: '(555) 987-6543',
    status: 'Qualified',
    source: 'Referral',
    assignedUserId: '2',
    assignedUserName: 'Emily Davis',
    propertyType: 'Single Family',
    budget: { min: 400000, max: 700000 },
    preferredLocation: 'Suburbs',
    timeline: 'Within 6 months',
    leadScore: 85,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'lisa.thompson@example.com',
    phone: '(555) 456-7890',
    status: 'Contacted',
    source: 'Social Media',
    assignedUserId: '3',
    assignedUserName: 'Robert Wilson',
    propertyType: 'Townhouse',
    budget: { min: 250000, max: 400000 },
    preferredLocation: 'Midtown',
    timeline: 'Within 30 days',
    leadScore: 92,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
]

const statusColors: Record<LeadStatus, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Converted': 'bg-purple-100 text-purple-800',
  'Dead': 'bg-gray-100 text-gray-800'
}

const leadSources = ['All Sources', 'Website', 'Referral', 'Social Media', 'Google Ads', 'Other']
const leadStatuses = ['All Statuses', 'New', 'Contacted', 'Qualified', 'Converted', 'Dead']

export default function Leads() {
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [sourceFilter, setSourceFilter] = useState('All Sources')

  // In a real app, this would fetch from the API
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', { searchTerm, statusFilter, sourceFilter }],
    queryFn: () => Promise.resolve({
      data: mockLeads.filter(lead => {
        const matchesSearch = searchTerm === '' || 
          `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'All Statuses' || lead.status === statusFilter
        const matchesSource = sourceFilter === 'All Sources' || lead.source === sourceFilter
        
        return matchesSearch && matchesStatus && matchesSource
      }),
      pagination: {
        page: 1,
        limit: 10,
        total: mockLeads.length,
        totalPages: 1
      }
    })
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

  const handleAssignLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowAssignmentPanel(true)
  }

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
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and nurture your real estate leads
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCaptureModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Capture Lead
          </motion.button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          {leadStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="input-field"
        >
          {leadSources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>

        <button className="btn-secondary">
          <FunnelIcon className="w-4 h-4 mr-2" />
          More Filters
        </button>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {leadsData?.data.map((lead, index) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserPlusIcon className="w-6 h-6 text-primary-600" />
                </div>

                {/* Lead Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <TrophyIcon className="w-4 h-4 mr-1" />
                      <span className={`font-medium ${getScoreColor(lead.leadScore)}`}>
                        {lead.leadScore}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {lead.preferredLocation}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {lead.propertyType}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {formatCurrency(lead.budget?.min || 0)} - {formatCurrency(lead.budget?.max || 0)}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {lead.timeline}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {lead.source}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    Assigned to: <span className="font-medium">{lead.assignedUserName}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAssignLead(lead)}
                  className="btn-secondary text-sm"
                >
                  Reassign
                </button>

                <Menu as="div" className="relative">
                  <Menu.Button className="p-2 text-gray-400 hover:text-gray-600">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>
                            View Details
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>
                            Convert to Contact
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>
                            Log Activity
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-red-700`}>
                            Delete Lead
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {leadsData?.data.length === 0 && (
        <div className="text-center py-12">
          <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'All Statuses' || sourceFilter !== 'All Sources'
              ? 'Try adjusting your filters to see more leads.'
              : 'Start capturing leads to build your pipeline.'
            }
          </p>
          <button
            onClick={() => setShowCaptureModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Capture Your First Lead
          </button>
        </div>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
      />

      {/* Lead Assignment Panel - In a real app, this would be a modal or slide-over */}
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
    </div>
  )
}
