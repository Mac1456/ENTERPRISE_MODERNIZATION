import React, { useState, useEffect } from 'react'
import { Account, Contact } from '../types'
import CRMHubDataTable from '../components/shared/CRMHubDataTable'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  GlobeAmericasIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface AccountsProps {}

const Accounts: React.FC<AccountsProps> = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'Customer' | 'Prospect' | 'Partner' | 'Investor'>('all')

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: Account[]}>('/accounts')
      setAccounts(response.data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setAccounts(mockAccounts) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
  }



  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || account.accountType === filterType
    
    return matchesSearch && matchesType
  })

  const columns = [
    {
      key: 'name',
      title: 'Account Name',
      render: (value: any, account: Account) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center">
              {getAccountTypeIcon(account.accountType)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{account.name}</p>
            <div className="flex items-center space-x-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getAccountTypeStyle(account.accountType)}`}>
                {account.accountType}
              </span>
            </div>
            {account.industry && (
              <p className="text-xs text-gray-500 mt-1">{account.industry}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Primary Contact',
      render: (value: any, account: Account) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{account.billingContactName || 'No primary contact'}</span>
          </div>
          {account.email && (
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">{account.email}</span>
            </div>
          )}
          {account.phone && (
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">{account.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (value: any, account: Account) => (
        <div className="space-y-1">
          {account.billingAddressCity && (
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {account.billingAddressCity}
                {account.billingAddressState && `, ${account.billingAddressState}`}
              </span>
            </div>
          )}
          {account.website && (
            <div className="flex items-center space-x-1">
              <GlobeAmericasIcon className="h-4 w-4 text-gray-400" />
              <a 
                href={`https://${account.website.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {account.website}
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'opportunities',
      title: 'Opportunities',
      render: (value: any, account: Account) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">
              {account.opportunityCount || 0} active
            </span>
          </div>
          {account.opportunityValue && (
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                ${account.opportunityValue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'assignedUser',
      title: 'Account Manager',
      render: (value: any, account: Account) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900">{account.assignedUserName}</span>
        </div>
      )
    }
  ]

  return (
    <>
      {/* Desktop-First Layout with max-width container */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Full Width */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
              <p className="text-base text-gray-600 mt-2">Manage your business accounts and organizations</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Account
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout - Two Column Desktop */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Summary Stats - Desktop Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-blue-600 mb-2">{accounts.length}</div>
                <div className="text-sm font-medium text-gray-600">Total Accounts</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {accounts.filter(a => a.accountType === 'Customer').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Customers</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {accounts.filter(a => a.accountType === 'Prospect').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Prospects</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  ${accounts.reduce((sum, a) => sum + (a.opportunityValue || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-600">Pipeline Value</div>
              </div>
            </div>

            {/* Filters and Search - Desktop Layout */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <FunnelIcon className="h-5 w-5 text-gray-400" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
                      >
                        <option value="all">All Types</option>
                        <option value="Customer">Customers</option>
                        <option value="Prospect">Prospects</option>
                        <option value="Partner">Partners</option>
                        <option value="Investor">Investors</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-600">
                  {filteredAccounts.length} of {accounts.length} accounts
                </div>
              </div>
            </div>

            {/* Accounts Table - Full Width Desktop */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <CRMHubDataTable
                  data={filteredAccounts}
                  columns={columns}
                  loading={loading}
                  onRowClick={handleAccountClick}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Detail Panel (Desktop Only) */}
          {selectedAccount && (
            <div className="xl:w-96 xl:flex-shrink-0">
              <AccountDetailPanel
                account={selectedAccount}
                onClose={() => setSelectedAccount(null)}
                onUpdate={() => fetchAccounts()}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Detail Panel Overlay */}
      {selectedAccount && (
        <div className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <AccountDetailPanel
              account={selectedAccount}
              onClose={() => setSelectedAccount(null)}
              onUpdate={() => fetchAccounts()}
            />
          </div>
        </div>
      )}
    </>
  )
}

// Helper functions
const getAccountTypeIcon = (type: string) => {
  switch (type) {
    case 'Customer':
      return <UserGroupIcon className="h-4 w-4 text-green-500" />
    case 'Prospect':
      return <ChartBarIcon className="h-4 w-4 text-blue-500" />
    case 'Partner':
      return <BuildingOfficeIcon className="h-4 w-4 text-purple-500" />
    case 'Investor':
      return <BanknotesIcon className="h-4 w-4 text-yellow-500" />
    default:
      return <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
  }
}

const getAccountTypeStyle = (type: string) => {
  switch (type) {
    case 'Customer':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'Prospect':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Partner':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'Investor':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Account Detail Panel Component
const AccountDetailPanel: React.FC<{
  account: Account
  onClose: () => void
  onUpdate: () => void
}> = ({ account, onClose, onUpdate }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-fit xl:sticky xl:top-8">
      <div className="flex flex-col max-h-[calc(100vh-4rem)] xl:max-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Account Details</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center shadow-lg">
                <div className="scale-150">
                  {getAccountTypeIcon(account.accountType)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-2xl font-bold text-gray-900 truncate">{account.name}</h4>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getAccountTypeStyle(account.accountType)} mt-2`}>
                  {account.accountType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {account.industry && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Industry</div>
                  <div className="text-base font-semibold text-gray-900">{account.industry}</div>
                </div>
              )}
              
              {account.website && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <GlobeAmericasIcon className="h-6 w-6 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600">Website</div>
                    <a 
                      href={`https://${account.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-blue-600 hover:text-blue-700 font-medium truncate block"
                    >
                      {account.website}
                    </a>
                  </div>
                </div>
              )}

              {account.email && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600">Email</div>
                    <div className="text-base text-gray-900 font-medium truncate">{account.email}</div>
                  </div>
                </div>
              )}

              {account.phone && (
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <PhoneIcon className="h-6 w-6 text-purple-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600">Phone</div>
                    <div className="text-base text-gray-900 font-medium">{account.phone}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {(account.billingAddressStreet || account.billingAddressCity) && (
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-3">Billing Address</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-6 w-6 text-gray-600 mt-0.5" />
                  <div className="text-base text-gray-800 leading-relaxed">
                    {account.billingAddressStreet && (
                      <div className="font-medium">{account.billingAddressStreet}</div>
                    )}
                    <div>
                      {account.billingAddressCity}
                      {account.billingAddressState && `, ${account.billingAddressState}`} 
                      {account.billingAddressZip && ` ${account.billingAddressZip}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Summary */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-3">Opportunities</h5>
            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-700">Active Opportunities</span>
                <span className="text-2xl font-bold text-green-600">{account.opportunityCount || 0}</span>
              </div>
              {account.opportunityValue && (
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-700">Pipeline Value</span>
                  <span className="text-xl font-bold text-green-600">${account.opportunityValue.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {account.description && (
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-3">Description</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-base text-gray-700 leading-relaxed">{account.description}</p>
              </div>
            </div>
          )}

          {/* Assignment */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-3">Account Manager</h5>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-6 w-6 text-blue-600" />
                <span className="text-base font-semibold text-blue-900">{account.assignedUserName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-3 bg-gray-50 rounded-b-xl">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base transition-colors">
            Edit Account
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-sm transition-colors">
              View Contacts
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-sm transition-colors">
              New Opportunity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Johnson Properties LLC',
    accountType: 'Customer',
    industry: 'Real Estate',
    website: 'johnsonproperties.com',
    email: 'info@johnsonproperties.com',
    phone: '(555) 123-4567',
    billingAddressStreet: '123 Business Ave',
    billingAddressCity: 'Los Angeles',
    billingAddressState: 'CA',
    billingAddressZip: '90210',
    billingContactName: 'Michael Johnson',
    description: 'Leading property development company specializing in residential and commercial real estate.',
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    opportunityCount: 3,
    opportunityValue: 2500000,
    createdAt: '2024-01-01T10:00:00Z',
    modifiedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Metro Construction Group',
    accountType: 'Partner',
    industry: 'Construction',
    website: 'metroconstruction.com',
    email: 'contact@metroconstruction.com',
    phone: '(555) 234-5678',
    billingAddressStreet: '456 Industrial Blvd',
    billingAddressCity: 'Phoenix',
    billingAddressState: 'AZ',
    billingAddressZip: '85001',
    billingContactName: 'Sarah Davis',
    description: 'Commercial construction and renovation services for real estate projects.',
    assignedUserId: '2',
    assignedUserName: 'Lisa Rodriguez',
    opportunityCount: 1,
    opportunityValue: 750000,
    createdAt: '2024-01-05T14:00:00Z',
    modifiedAt: '2024-01-22T09:15:00Z'
  },
  {
    id: '3',
    name: 'Westside Investment Fund',
    accountType: 'Investor',
    industry: 'Financial Services',
    website: 'westsideinvestments.com',
    email: 'investments@westsideinvestments.com',
    phone: '(555) 345-6789',
    billingAddressStreet: '789 Financial Center',
    billingAddressCity: 'San Francisco',
    billingAddressState: 'CA',
    billingAddressZip: '94105',
    billingContactName: 'Robert Chen',
    description: 'Private investment fund focused on commercial real estate opportunities.',
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    opportunityCount: 2,
    opportunityValue: 5000000,
    createdAt: '2024-01-10T09:00:00Z',
    modifiedAt: '2024-01-25T11:45:00Z'
  },
  {
    id: '4',
    name: 'Downtown Development Corp',
    accountType: 'Prospect',
    industry: 'Real Estate Development',
    website: 'downtowndev.com',
    email: 'info@downtowndev.com',
    phone: '(555) 456-7890',
    billingAddressStreet: '321 Downtown Plaza',
    billingAddressCity: 'Seattle',
    billingAddressState: 'WA',
    billingAddressZip: '98101',
    billingContactName: 'Emily Thompson',
    description: 'Urban development company focusing on mixed-use commercial and residential projects.',
    assignedUserId: '3',
    assignedUserName: 'Robert Wilson',
    opportunityCount: 0,
    opportunityValue: 0,
    createdAt: '2024-01-15T16:00:00Z',
    modifiedAt: '2024-01-28T10:20:00Z'
  }
]

export default Accounts
