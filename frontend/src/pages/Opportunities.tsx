import React, { useState, useEffect } from 'react'
import { Opportunity, SalesStage, TransactionMilestone } from '../types'
import CRMHubDataTable from '../components/shared/CRMHubDataTable'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  HomeIcon,
  BuildingOfficeIcon,
  KeyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface OpportunitiesProps {}

const Opportunities: React.FC<OpportunitiesProps> = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterStage, setFilterStage] = useState<SalesStage | 'all'>('all')
  const [filterType, setFilterType] = useState<'all' | 'Sale' | 'Purchase' | 'Lease' | 'Rental'>('all')

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: Opportunity[]}>('/opportunities')
      setOpportunities(response.data || [])
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      setOpportunities(mockOpportunities) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
  }

  const getSalesStageStyle = (stage: SalesStage) => {
    switch (stage) {
      case 'Prospecting':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Qualification':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Proposal':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Negotiation':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Closed Won':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Closed Lost':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'Sale':
        return <BanknotesIcon className="h-4 w-4 text-green-500" />
      case 'Purchase':
        return <HomeIcon className="h-4 w-4 text-blue-500" />
      case 'Lease':
      case 'Rental':
        return <KeyIcon className="h-4 w-4 text-purple-500" />
      default:
        return <UserGroupIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getMilestoneProgress = (milestones: TransactionMilestone[]) => {
    const completed = milestones.filter(m => m.completed).length
    const total = milestones.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.accountId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = filterStage === 'all' || opportunity.salesStage === filterStage
    const matchesType = filterType === 'all' || opportunity.transactionType === filterType
    
    return matchesSearch && matchesStage && matchesType
  })

  const totalPipelineValue = filteredOpportunities
    .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.salesStage))
    .reduce((sum, opp) => sum + opp.amount, 0)

  const closedWonValue = filteredOpportunities
    .filter(opp => opp.salesStage === 'Closed Won')
    .reduce((sum, opp) => sum + opp.amount, 0)

  const columns = [
    {
      key: 'opportunity',
      title: 'Opportunity',
      render: (value: any, opportunity: Opportunity) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              {getTransactionTypeIcon(opportunity.transactionType)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">{opportunity.name}</span>
            </div>
            <p className="text-xs text-gray-500">Account: {opportunity.accountId}</p>
            <div className="flex items-center space-x-1 mt-1">
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {opportunity.transactionType}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: any, opportunity: Opportunity) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
            <span className="text-lg font-bold text-green-600">
              ${opportunity.amount.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Commission: ${opportunity.commission.amount.toLocaleString()} ({opportunity.commission.rate}%)
          </div>
        </div>
      )
    },
    {
      key: 'stage',
      title: 'Sales Stage',
      render: (value: any, opportunity: Opportunity) => (
        <div className="space-y-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSalesStageStyle(opportunity.salesStage)}`}>
            {opportunity.salesStage}
          </span>
          <div className="flex items-center space-x-1">
            <div className="text-xs text-gray-500">{opportunity.probability}% probability</div>
          </div>
        </div>
      )
    },
    {
      key: 'milestones',
      title: 'Progress',
      render: (value: any, opportunity: Opportunity) => {
        const progress = getMilestoneProgress(opportunity.milestones || [])
        const completedMilestones = opportunity.milestones?.filter(m => m.completed).length || 0
        const totalMilestones = opportunity.milestones?.length || 0
        
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{progress}%</span>
            </div>
            <div className="text-xs text-gray-500">
              {completedMilestones}/{totalMilestones} milestones
            </div>
          </div>
        )
      }
    },
    {
      key: 'closeDate',
      title: 'Expected Close',
      render: (value: any, opportunity: Opportunity) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {Math.ceil((new Date(opportunity.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
          </div>
        </div>
      )
    },
    {
      key: 'assignedUser',
      title: 'Assigned Agent',
      render: (value: any, opportunity: Opportunity) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{opportunity.assignedUserName}</span>
        </div>
      )
    }
  ]

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex h-full">
          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${selectedOpportunity ? 'lg:mr-96' : ''}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction Pipeline</h1>
              <p className="text-sm text-gray-600">Manage real estate transactions and deal milestones</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Deal
            </button>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalPipelineValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Active Pipeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${closedWonValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Closed Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filteredOpportunities.filter(o => o.salesStage === 'Negotiation').length}</div>
              <div className="text-sm text-gray-500">In Negotiation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredOpportunities.reduce((sum, o) => sum + o.probability, 0) / filteredOpportunities.length) || 0}%
              </div>
              <div className="text-sm text-gray-500">Avg. Probability</div>
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
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value as SalesStage | 'all')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stages</option>
                  <option value="Prospecting">Prospecting</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Sale">Sale</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Lease">Lease</option>
                  <option value="Rental">Rental</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredOpportunities.length} deals
            </div>
          </div>
        </div>

            {/* Opportunities Table */}
            <div className="flex-1 bg-gray-50 p-6">
              <div className="overflow-x-auto">
                <CRMHubDataTable
                  data={filteredOpportunities}
                  columns={columns}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Transaction Detail Panel */}
          {selectedOpportunity && (
            <TransactionDetailPanel
              opportunity={selectedOpportunity}
              onClose={() => setSelectedOpportunity(null)}
              onUpdate={() => fetchOpportunities()}
            />
          )}
        </div>
      </div>
    </>
  )
}

// Transaction Detail Panel Component
const TransactionDetailPanel: React.FC<{
  opportunity: Opportunity
  onClose: () => void
  onUpdate: () => void
}> = ({ opportunity, onClose, onUpdate }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<TransactionMilestone | null>(null)

  const getNextMilestone = (milestones: TransactionMilestone[]) => {
    return milestones.find(m => !m.completed)
  }

  const getMilestoneStatus = (milestone: TransactionMilestone) => {
    if (milestone.completed) return 'completed'
    
    const dueDate = new Date(milestone.dueDate)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) return 'overdue'
    if (daysUntilDue <= 3) return 'due-soon'
    return 'on-track'
  }

  const getMilestoneStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'overdue':
        return 'text-red-600 bg-red-50'
      case 'due-soon':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleSolidIcon className="h-5 w-5 text-green-600" />
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'due-soon':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const nextMilestone = getNextMilestone(opportunity.milestones || [])

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              {getTransactionTypeIcon(opportunity.transactionType)}
              <h4 className="text-xl font-semibold text-gray-900">{opportunity.name}</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Transaction Type:</span>
                <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  {opportunity.transactionType}
                </span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="ml-2 text-xl font-bold text-green-600">
                  ${opportunity.amount.toLocaleString()}
                </span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Sales Stage:</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSalesStageStyle(opportunity.salesStage)}`}>
                  {opportunity.salesStage}
                </span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Probability:</span>
                <span className="ml-2 font-medium">{opportunity.probability}%</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Expected Close:</span>
                <span className="ml-2 font-medium">{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Commission Details */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Commission</h5>
            <div className="bg-green-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rate:</span>
                <span className="font-medium">{opportunity.commission.rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">${opportunity.commission.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Next Milestone</h5>
              <div className={`rounded-lg p-3 ${getMilestoneStatusStyle(getMilestoneStatus(nextMilestone))}`}>
                <div className="flex items-start space-x-3">
                  {getMilestoneIcon(getMilestoneStatus(nextMilestone))}
                  <div className="flex-1">
                    <h6 className="font-medium">{nextMilestone.name}</h6>
                    <p className="text-sm mt-1">{nextMilestone.description}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Due: {new Date(nextMilestone.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs">
                      <UserIcon className="h-4 w-4" />
                      <span>Assigned to: {nextMilestone.assignedTo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Milestones */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Transaction Milestones</h5>
            <div className="space-y-3">
              {opportunity.milestones?.map((milestone, index) => {
                const status = getMilestoneStatus(milestone)
                return (
                  <div
                    key={milestone.id}
                    className={`rounded-lg p-3 border cursor-pointer hover:shadow-sm transition-all ${
                      milestone.completed 
                        ? 'border-green-200 bg-green-50' 
                        : status === 'overdue'
                        ? 'border-red-200 bg-red-50'
                        : status === 'due-soon'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <div className="flex items-start space-x-3">
                      {getMilestoneIcon(status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h6 className="font-medium">{milestone.name}</h6>
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          {milestone.completed && milestone.completedDate && (
                            <span className="text-green-600">
                              Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Property Information */}
          {opportunity.propertyId && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Property</h5>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Property #{opportunity.propertyId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {opportunity.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-700">{opportunity.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Update Deal
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              View Documents
            </button>
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Send for Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: '123 Maple Street - Home Sale',
    accountId: 'ACC001',
    contactId: 'CON001',
    amount: 750000,
    salesStage: 'Negotiation',
    probability: 85,
    expectedCloseDate: '2024-02-15',
    description: 'Sale of beautiful family home with updated kitchen and spacious yard.',
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    propertyId: '1',
    transactionType: 'Sale',
    commission: {
      rate: 6,
      amount: 45000
    },
    milestones: [
      {
        id: '1',
        name: 'Listing Agreement Signed',
        description: 'Property listing agreement executed with homeowner',
        dueDate: '2024-01-05',
        completed: true,
        completedDate: '2024-01-05',
        assignedTo: 'Mike Smith'
      },
      {
        id: '2',
        name: 'Property Photography',
        description: 'Professional photos taken and edited',
        dueDate: '2024-01-08',
        completed: true,
        completedDate: '2024-01-07',
        assignedTo: 'Photography Team'
      },
      {
        id: '3',
        name: 'MLS Listing Active',
        description: 'Property listed on MLS and marketing begins',
        dueDate: '2024-01-10',
        completed: true,
        completedDate: '2024-01-09',
        assignedTo: 'Mike Smith'
      },
      {
        id: '4',
        name: 'Offer Received',
        description: 'Buyer submits offer on property',
        dueDate: '2024-01-25',
        completed: true,
        completedDate: '2024-01-22',
        assignedTo: 'Mike Smith'
      },
      {
        id: '5',
        name: 'Purchase Agreement Signed',
        description: 'Seller accepts offer and signs purchase agreement',
        dueDate: '2024-01-27',
        completed: true,
        completedDate: '2024-01-24',
        assignedTo: 'Mike Smith'
      },
      {
        id: '6',
        name: 'Inspection Period',
        description: 'Buyer completes home inspection',
        dueDate: '2024-02-02',
        completed: false,
        assignedTo: 'Inspector'
      },
      {
        id: '7',
        name: 'Financing Approval',
        description: 'Buyer receives mortgage approval',
        dueDate: '2024-02-08',
        completed: false,
        assignedTo: 'Lender'
      },
      {
        id: '8',
        name: 'Final Walkthrough',
        description: 'Buyer conducts final property walkthrough',
        dueDate: '2024-02-14',
        completed: false,
        assignedTo: 'Mike Smith'
      },
      {
        id: '9',
        name: 'Closing',
        description: 'Final closing and key transfer',
        dueDate: '2024-02-15',
        completed: false,
        assignedTo: 'Title Company'
      }
    ],
    createdAt: '2024-01-01T10:00:00Z',
    modifiedAt: '2024-01-24T15:30:00Z'
  },
  {
    id: '2',
    name: '456 Oak Avenue - Condo Purchase',
    accountId: 'ACC002',
    contactId: 'CON002',
    amount: 425000,
    salesStage: 'Qualification',
    probability: 65,
    expectedCloseDate: '2024-03-01',
    description: 'Buyer looking for downtown condo with city views.',
    assignedUserId: '2',
    assignedUserName: 'Lisa Rodriguez',
    propertyId: '2',
    transactionType: 'Purchase',
    commission: {
      rate: 3,
      amount: 12750
    },
    milestones: [
      {
        id: '10',
        name: 'Buyer Consultation',
        description: 'Initial meeting with buyer to understand needs',
        dueDate: '2024-01-15',
        completed: true,
        completedDate: '2024-01-15',
        assignedTo: 'Lisa Rodriguez'
      },
      {
        id: '11',
        name: 'Pre-approval Letter',
        description: 'Buyer obtains mortgage pre-approval',
        dueDate: '2024-01-20',
        completed: true,
        completedDate: '2024-01-18',
        assignedTo: 'Buyer'
      },
      {
        id: '12',
        name: 'Property Search',
        description: 'Search for properties matching buyer criteria',
        dueDate: '2024-02-01',
        completed: false,
        assignedTo: 'Lisa Rodriguez'
      },
      {
        id: '13',
        name: 'Property Showings',
        description: 'Schedule and conduct property tours',
        dueDate: '2024-02-10',
        completed: false,
        assignedTo: 'Lisa Rodriguez'
      }
    ],
    createdAt: '2024-01-10T14:00:00Z',
    modifiedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    name: '789 Pine Road - Investment Property',
    accountId: 'ACC003',
    contactId: 'CON003',
    amount: 580000,
    salesStage: 'Closed Won',
    probability: 100,
    expectedCloseDate: '2024-01-30',
    description: 'Investment property purchase completed successfully.',
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    propertyId: '3',
    transactionType: 'Sale',
    commission: {
      rate: 5,
      amount: 29000
    },
    milestones: [
      {
        id: '14',
        name: 'Investment Analysis',
        description: 'Analyze property investment potential',
        dueDate: '2024-01-05',
        completed: true,
        completedDate: '2024-01-05',
        assignedTo: 'Mike Smith'
      },
      {
        id: '15',
        name: 'Offer Submitted',
        description: 'Investment offer submitted to seller',
        dueDate: '2024-01-10',
        completed: true,
        completedDate: '2024-01-08',
        assignedTo: 'Mike Smith'
      },
      {
        id: '16',
        name: 'Due Diligence',
        description: 'Property inspection and financial review',
        dueDate: '2024-01-20',
        completed: true,
        completedDate: '2024-01-18',
        assignedTo: 'Inspector'
      },
      {
        id: '17',
        name: 'Closing Complete',
        description: 'Transaction closed and keys transferred',
        dueDate: '2024-01-30',
        completed: true,
        completedDate: '2024-01-30',
        assignedTo: 'Title Company'
      }
    ],
    createdAt: '2024-01-01T08:00:00Z',
    modifiedAt: '2024-01-30T16:45:00Z'
  }
]

export default Opportunities
