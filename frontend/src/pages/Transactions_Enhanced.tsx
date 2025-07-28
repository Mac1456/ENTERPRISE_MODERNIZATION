/**
 * ✅ ACTIVE COMPONENT - PRIMARY TRANSACTION PIPELINE PAGE
 * 
 * Feature 6: Transaction Pipeline Management
 * Route: /transactions (following exact patterns from Features 1-5)
 * Status: ACTIVE - This is the primary transaction pipeline implementation
 * 
 * Following exact patterns from Leads_Enhanced.tsx, Contacts_Enhanced.tsx, Communications_Enhanced.tsx, PropertySearch_Enhanced.tsx
 * Last updated: Initial implementation - 2024-07-27
 */

import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrophyIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { TransactionService, type TransactionQuery, type TransactionFilters, type PipelineStats } from '@/services/transactionService'
import { Opportunity, TransactionMilestone, SalesStage } from '@/types'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

// Mock data for demonstration (following exact pattern from other Enhanced pages)
const mockTransactions: Opportunity[] = [
  {
    id: 'txn1',
    name: '123 Oak Street - Smith Purchase',
    accountId: 'acc1',
    contactId: 'contact1',
    amount: 450000,
    salesStage: 'Proposal' as SalesStage,
    probability: 75,
    expectedCloseDate: '2024-08-15T00:00:00Z',
    description: 'Single family home purchase for the Smith family',
    assignedUserId: 'user1',
    assignedUserName: 'Sarah Johnson',
    propertyId: 'prop1',
    transactionType: 'Purchase',
    commission: {
      rate: 3.0,
      amount: 13500
    },
    milestones: [
      {
        id: 'milestone1',
        name: 'Offer Accepted',
        description: 'Initial offer has been accepted by seller',
        dueDate: '2024-07-20T00:00:00Z',
        completed: true,
        completedDate: '2024-07-18T14:30:00Z',
        assignedTo: 'user1'
      },
      {
        id: 'milestone2',
        name: 'Home Inspection',
        description: 'Professional home inspection scheduled and completed',
        dueDate: '2024-07-28T00:00:00Z',
        completed: true,
        completedDate: '2024-07-26T10:00:00Z',
        assignedTo: 'user1'
      },
      {
        id: 'milestone3',
        name: 'Financing Approval',
        description: 'Mortgage financing approved by lender',
        dueDate: '2024-08-05T00:00:00Z',
        completed: false,
        assignedTo: 'user1'
      },
      {
        id: 'milestone4',
        name: 'Final Walkthrough',
        description: 'Final property walkthrough before closing',
        dueDate: '2024-08-12T00:00:00Z',
        completed: false,
        assignedTo: 'user1'
      },
      {
        id: 'milestone5',
        name: 'Closing',
        description: 'Final closing and property transfer',
        dueDate: '2024-08-15T00:00:00Z',
        completed: false,
        assignedTo: 'user1'
      }
    ],
    createdAt: '2024-07-15T00:00:00Z',
    modifiedAt: '2024-07-26T16:45:00Z'
  },
  {
    id: 'txn2',
    name: '456 Pine Avenue - Chen Sale',
    accountId: 'acc2',
    contactId: 'contact2',
    amount: 325000,
    salesStage: 'Negotiation' as SalesStage,
    probability: 85,
    expectedCloseDate: '2024-08-20T00:00:00Z',
    description: 'Condo sale for Mr. Chen',
    assignedUserId: 'user2',
    assignedUserName: 'Mike Rodriguez',
    propertyId: 'prop2',
    transactionType: 'Sale',
    commission: {
      rate: 2.5,
      amount: 8125
    },
    milestones: [
      {
        id: 'milestone6',
        name: 'Property Listed',
        description: 'Property listed on MLS and marketing sites',
        dueDate: '2024-07-10T00:00:00Z',
        completed: true,
        completedDate: '2024-07-08T09:00:00Z',
        assignedTo: 'user2'
      },
      {
        id: 'milestone7',
        name: 'Offer Received',
        description: 'First offer received from qualified buyer',
        dueDate: '2024-07-25T00:00:00Z',
        completed: true,
        completedDate: '2024-07-22T11:30:00Z',
        assignedTo: 'user2'
      },
      {
        id: 'milestone8',
        name: 'Contract Negotiation',
        description: 'Negotiate terms and finalize purchase agreement',
        dueDate: '2024-08-01T00:00:00Z',
        completed: false,
        assignedTo: 'user2'
      }
    ],
    createdAt: '2024-07-08T00:00:00Z',
    modifiedAt: '2024-07-22T14:20:00Z'
  }
]

export default function TransactionsEnhanced() {
  const [transactions, setTransactions] = useState<Opportunity[]>(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState<Opportunity[]>(mockTransactions)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TransactionFilters>({})
  
  // Tab state (following exact pattern from Communications_Enhanced.tsx and PropertySearch_Enhanced.tsx)
  const [selectedTab, setSelectedTab] = useState<'pipeline' | 'milestones' | 'commission' | 'analytics'>('pipeline')
  
  // Modal states (following exact pattern from other Enhanced pages)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Opportunity | null>(null)

  const queryClient = useQueryClient()

  // Mock pipeline stats data
  const pipelineStats: PipelineStats = {
    totalTransactions: 24,
    activeTransactions: 18,
    closedThisMonth: 6,
    totalVolume: 2450000,
    averageCloseTime: 32,
    conversionRate: 78.5,
    commissionEarned: 84250,
    pendingCommission: 52850
  }

  // Real-time search filtering function
  const performSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions)
      return
    }

    const filtered = transactions.filter(transaction => {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.name.toLowerCase().includes(searchLower) ||
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.assignedUserName.toLowerCase().includes(searchLower) ||
        transaction.transactionType.toLowerCase().includes(searchLower) ||
        transaction.salesStage.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchTerm)
      )
    })

    setFilteredTransactions(filtered)
    toast.success(`Found ${filtered.length} matching transactions`)
  }

  const handleSearch = async (query: TransactionQuery) => {
    try {
      performSearch(query.search || '')
      setSearchQuery(query.search || '')
      setFilters(query.filters || {})
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    }
  }

  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  // Event handlers (following exact pattern from other Enhanced pages)
  const handleTransactionClick = (transaction: Opportunity) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleStageUpdate = async (transactionId: string, newStage: SalesStage) => {
    try {
      const updatedTransaction = { ...transactions.find(t => t.id === transactionId)!, salesStage: newStage }
      setTransactions(prev => prev.map(t => t.id === transactionId ? updatedTransaction : t))
      setFilteredTransactions(prev => prev.map(t => t.id === transactionId ? updatedTransaction : t))
      toast.success(`Transaction moved to ${newStage}`)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    } catch (error) {
      console.error('Error updating transaction stage:', error)
      toast.error('Failed to update transaction stage')
    }
  }

  const handleMilestoneComplete = async (transactionId: string, milestoneId: string) => {
    try {
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.id === transactionId) {
          return {
            ...transaction,
            milestones: transaction.milestones.map(milestone => 
              milestone.id === milestoneId 
                ? { ...milestone, completed: true, completedDate: new Date().toISOString() }
                : milestone
            )
          }
        }
        return transaction
      })
      
      setTransactions(updatedTransactions)
      setFilteredTransactions(updatedTransactions)
      toast.success('Milestone completed!')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    } catch (error) {
      console.error('Error completing milestone:', error)
      toast.error('Failed to complete milestone')
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      setFilteredTransactions(prev => prev.filter(t => t.id !== transactionId))
      toast.success('Transaction deleted')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction')
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get stage color
  const getStageColor = (stage: SalesStage) => {
    switch (stage) {
      case 'Prospecting':
        return 'bg-gray-100 text-gray-800'
      case 'Qualification':
        return 'bg-blue-100 text-blue-800'
      case 'Proposal':
        return 'bg-yellow-100 text-yellow-800'
      case 'Negotiation':
        return 'bg-orange-100 text-orange-800'
      case 'Closed Won':
        return 'bg-green-100 text-green-800'
      case 'Closed Lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Transaction table columns (following CRMHubDataTable pattern)
  const transactionColumns = [
    {
      key: 'transaction',
      title: 'Transaction',
      render: (value: any, transaction: Opportunity) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{transaction.name}</div>
            <div className="text-sm text-gray-500">{transaction.transactionType}</div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: any, transaction: Opportunity) => (
        <div className="text-sm">
          <div className="text-gray-900 font-medium">{formatCurrency(transaction.amount)}</div>
          <div className="text-gray-500">Commission: {formatCurrency(transaction.commission.amount)}</div>
        </div>
      )
    },
    {
      key: 'stage',
      title: 'Stage',
      render: (value: any, transaction: Opportunity) => (
        <div className="flex items-center space-x-2">
          <Badge className={getStageColor(transaction.salesStage)}>
            {transaction.salesStage}
          </Badge>
          <div className="text-sm text-gray-500">{transaction.probability}%</div>
        </div>
      )
    },
    {
      key: 'milestones',
      title: 'Progress',
      render: (value: any, transaction: Opportunity) => {
        const completedMilestones = transaction.milestones.filter(m => m.completed).length
        const totalMilestones = transaction.milestones.length
        const percentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
        
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">{completedMilestones}/{totalMilestones}</span>
          </div>
        )
      }
    },
    {
      key: 'agent',
      title: 'Agent',
      render: (value: any, transaction: Opportunity) => (
        <div className="text-sm">
          <div className="text-gray-900">{transaction.assignedUserName}</div>
          <div className="text-gray-500">
            Due: {new Date(transaction.expectedCloseDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, transaction: Opportunity) => (
        <Menu as="div" className="relative">
          <Menu.Button className="p-2 hover:bg-gray-100 rounded">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleTransactionClick(transaction)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                >
                  <PencilIcon className="w-4 h-4 mr-2 inline" />
                  View Details
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {
                    const nextStage = getNextStage(transaction.salesStage)
                    if (nextStage) handleStageUpdate(transaction.id, nextStage)
                  }}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                  disabled={transaction.salesStage === 'Closed Won' || transaction.salesStage === 'Closed Lost'}
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2 inline" />
                  Advance Stage
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-red-600`}
                >
                  <TrashIcon className="w-4 h-4 mr-2 inline" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )
    }
  ]

  // Helper function to get next stage
  const getNextStage = (currentStage: SalesStage): SalesStage | null => {
    const stages: SalesStage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won']
    const currentIndex = stages.indexOf(currentStage)
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null
  }

  // Stats cards data (following pattern from other Enhanced pages)
  const statsCards = [
    {
      title: 'Active Pipeline',
      value: pipelineStats.activeTransactions.toString(),
      icon: ChartBarIcon,
      bgColor: 'bg-blue-500',
      change: '+3',
      changeType: 'increase' as const
    },
    {
      title: 'Total Volume',
      value: formatCurrency(pipelineStats.totalVolume),
      icon: CurrencyDollarIcon,
      bgColor: 'bg-green-500',
      change: '+15%',
      changeType: 'increase' as const
    },
    {
      title: 'Commission Earned',
      value: formatCurrency(pipelineStats.commissionEarned),
      icon: BanknotesIcon,
      bgColor: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase' as const
    },
    {
      title: 'Avg Close Time',
      value: `${pipelineStats.averageCloseTime} days`,
      icon: ClockIcon,
      bgColor: 'bg-orange-500',
      change: '-5 days',
      changeType: 'decrease' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Section (following exact pattern from all Enhanced pages) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Pipeline</h1>
          <p className="text-gray-600">Manage real estate transactions, milestones, and commission tracking</p>
        </div>
        <Button
          onClick={() => setShowTransactionModal(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Transaction</span>
        </Button>
      </div>

      {/* Stats Cards (following exact pattern from other Enhanced pages) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation (following exact pattern from Communications_Enhanced.tsx and PropertySearch_Enhanced.tsx) */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pipeline', label: 'Pipeline', icon: ChartBarIcon },
            { id: 'milestones', label: 'Milestones', icon: CheckCircleIcon },
            { id: 'commission', label: 'Commission', icon: BanknotesIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartPieIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                  selectedTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'pipeline' && (
        <>
          {/* Search Bar and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions by name, type, agent, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch({ search: searchQuery, filters })
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFiltersModal(true)
                    toast.info('Advanced filters coming soon!')
                  }}
                  className="flex items-center space-x-2"
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
                <Button
                  onClick={() => handleSearch({ search: searchQuery, filters })}
                  className="flex items-center space-x-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  <span>Search</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Transactions Table/Cards - Mobile Responsive Dual Layout */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Active Transactions ({filteredTransactions.length})
              </h3>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <CRMHubDataTable
                data={filteredTransactions}
                columns={transactionColumns}
                onRowClick={handleTransactionClick}
                loading={false}
              />
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4">
              {filteredTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{transaction.name}</h4>
                          <p className="text-xs text-gray-500">{transaction.transactionType}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                        <div>
                          <Badge className={getStageColor(transaction.salesStage)}>
                            {transaction.salesStage}
                          </Badge>
                        </div>
                        <div>Commission: {formatCurrency(transaction.commission.amount)}</div>
                        <div>{transaction.probability}% probability</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">{transaction.assignedUserName}</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full bg-blue-500" 
                              style={{ 
                                width: `${(transaction.milestones.filter(m => m.completed).length / transaction.milestones.length) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {transaction.milestones.filter(m => m.completed).length}/{transaction.milestones.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Menu as="div" className="relative ml-2">
                      <Menu.Button className="p-1 hover:bg-gray-100 rounded">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const nextStage = getNextStage(transaction.salesStage)
                                if (nextStage) handleStageUpdate(transaction.id, nextStage)
                              }}
                              className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                              disabled={transaction.salesStage === 'Closed Won' || transaction.salesStage === 'Closed Lost'}
                            >
                              <ArrowRightIcon className="w-4 h-4 mr-2 inline" />
                              Advance Stage
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedTab === 'milestones' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Transaction Milestones</h3>
          
          <div className="space-y-6">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{transaction.name}</CardTitle>
                  <p className="text-sm text-gray-500">{transaction.assignedUserName} • {formatCurrency(transaction.amount)}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transaction.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {milestone.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{milestone.name}</h4>
                            <p className="text-xs text-gray-500">{milestone.description}</p>
                            <p className="text-xs text-gray-400">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              {milestone.completed && milestone.completedDate && (
                                <span> • Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {!milestone.completed && (
                          <Button
                            size="sm"
                            onClick={() => handleMilestoneComplete(transaction.id, milestone.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'commission' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Commission Tracking</h3>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Earned This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(pipelineStats.commissionEarned)}</div>
                  <p className="text-sm text-gray-500">From {pipelineStats.closedThisMonth} closed deals</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Commission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{formatCurrency(pipelineStats.pendingCommission)}</div>
                  <p className="text-sm text-gray-500">From {pipelineStats.activeTransactions} active deals</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Pipeline Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(pipelineStats.totalVolume)}</div>
                  <p className="text-sm text-gray-500">Across all active transactions</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Breakdown by Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{transaction.name}</h4>
                        <p className="text-xs text-gray-500">
                          {transaction.transactionType} • {transaction.salesStage} • {transaction.commission.rate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.commission.amount)}</div>
                        <div className={`text-xs ${
                          transaction.salesStage === 'Closed Won' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {transaction.salesStage === 'Closed Won' ? 'Earned' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Pipeline Analytics</h3>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="text-sm font-medium">{pipelineStats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Close Time</span>
                      <span className="text-sm font-medium">{pipelineStats.averageCloseTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Deal Size</span>
                      <span className="text-sm font-medium">{formatCurrency(pipelineStats.totalVolume / pipelineStats.totalTransactions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Win Rate</span>
                      <span className="text-sm font-medium">
                        {((pipelineStats.closedThisMonth / pipelineStats.totalTransactions) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pipeline Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Prospecting</span>
                        <span className="text-sm font-medium">
                          {transactions.filter(t => t.salesStage === 'Prospecting').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${(transactions.filter(t => t.salesStage === 'Prospecting').length / transactions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Qualification</span>
                        <span className="text-sm font-medium">
                          {transactions.filter(t => t.salesStage === 'Qualification').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(transactions.filter(t => t.salesStage === 'Qualification').length / transactions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Proposal</span>
                        <span className="text-sm font-medium">
                          {transactions.filter(t => t.salesStage === 'Proposal').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(transactions.filter(t => t.salesStage === 'Proposal').length / transactions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Negotiation</span>
                        <span className="text-sm font-medium">
                          {transactions.filter(t => t.salesStage === 'Negotiation').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(transactions.filter(t => t.salesStage === 'Negotiation').length / transactions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Closed Won</span>
                        <span className="text-sm font-medium">
                          {transactions.filter(t => t.salesStage === 'Closed Won').length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(transactions.filter(t => t.salesStage === 'Closed Won').length / transactions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal Placeholder */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              <button
                onClick={() => {
                  setShowTransactionModal(false)
                  setSelectedTransaction(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Name</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.transactionType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <Badge className={getStageColor(selectedTransaction.salesStage)}>
                    {selectedTransaction.salesStage}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(selectedTransaction.commission.amount)} ({selectedTransaction.commission.rate}%)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTransaction.expectedCloseDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Milestones Progress</label>
                <div className="space-y-2">
                  {selectedTransaction.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">{milestone.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTransactionModal(false)
                  setSelectedTransaction(null)
                }}
              >
                Close
              </Button>
              <Button>
                Edit Transaction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
