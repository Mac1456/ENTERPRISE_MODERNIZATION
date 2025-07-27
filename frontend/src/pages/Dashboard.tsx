import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  UsersIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

// Components
import CRMHubStatsCard from '@/components/dashboard/CRMHubStatsCard'
import IntegrationStatus from '@/components/shared/IntegrationStatus'

// Services
import { DashboardService } from '@/services/dashboardService'

// Mock data for demo purposes
const mockStats = {
  totalContacts: 1247,
  totalLeads: 89,
  totalOpportunities: 34,
  totalRevenue: 2450000,
  activePipeline: 1200000,
  closedDeals: 12,
  leadsThisMonth: 23,
  revenueThisMonth: 450000,
  averageDealSize: 125000,
  conversionRate: 24.5
}



const mockActivityFeed = [
  {
    id: '1',
    type: 'lead_created' as const,
    title: 'New lead captured',
    description: 'Sarah Johnson expressed interest in downtown condos',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    userId: '1',
    userName: 'John Smith'
  },
  {
    id: '2',
    type: 'opportunity_won' as const,
    title: 'Deal closed successfully',
    description: '$320,000 property sale completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: '2',
    userName: 'Emily Davis'
  },
  {
    id: '3',
    type: 'meeting_scheduled' as const,
    title: 'Property showing scheduled',
    description: 'Meeting with Mike Anderson for 123 Oak Street',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userId: '1',
    userName: 'John Smith'
  },
  {
    id: '4',
    type: 'contact_updated' as const,
    title: 'Contact information updated',
    description: 'Updated preferences for Lisa Thompson',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userId: '3',
    userName: 'Robert Wilson'
  }
]

export default function Dashboard() {
  const [isConnectedToSuiteCRM, setIsConnectedToSuiteCRM] = useState(false)

  // Fetch real data from SuiteCRM (with fallback to mock data)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const data = await DashboardService.getDashboardStats()
        setIsConnectedToSuiteCRM(true)
        return data
      } catch (error) {
        // Fallback to mock data if SuiteCRM API is not available
        setIsConnectedToSuiteCRM(false)
        console.log('Using mock data - SuiteCRM API not available')
        return mockStats
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  })



  const { data: activityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => Promise.resolve(mockActivityFeed),
    staleTime: Infinity,
    retry: false
  })



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <>
      {/* Integration Status */}
      <IntegrationStatus 
        isConnected={isConnectedToSuiteCRM}
        message={isConnectedToSuiteCRM 
          ? 'Successfully connected to SuiteCRM backend'
          : 'Demo mode - All features functional with sample data'
        }
      />

      {/* Main Content Container - Centered with max-width */}
      <div className="max-w-7xl mx-auto">
        {/* CRMHUB Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back! Here's what's happening with your real estate business.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
              <div className="mb-2 sm:mb-0">Today</div>
              <div>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Essential KPI Cards - Reduced to 4 key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CRMHubStatsCard
          title="Active Leads"
          value={statsLoading ? '...' : formatNumber(stats?.totalLeads || 0)}
          subtitle="Potential customers"
          trend={{
            value: '+8%',
            period: 'From the last month',
            isPositive: true
          }}
          icon={UserPlusIcon}
          color="orange"
        />
        <CRMHubStatsCard
          title="Pipeline Value"
          value={statsLoading ? '...' : formatCurrency(stats?.activePipeline || 0)}
          subtitle="Active opportunities"
          trend={{
            value: '+15%',
            period: 'From the last month',
            isPositive: true
          }}
          icon={ArrowTrendingUpIcon}
          color="green"
        />
        <CRMHubStatsCard
          title="Monthly Revenue"
          value={statsLoading ? '...' : formatCurrency(stats?.revenueThisMonth || 0)}
          subtitle="Closed deals this month"
          trend={{
            value: '+22%',
            period: 'From the last month',
            isPositive: true
          }}
          icon={CurrencyDollarIcon}
          color="purple"
        />
        <CRMHubStatsCard
          title="Total Contacts"
          value={statsLoading ? '...' : formatNumber(stats?.totalContacts || 0)}
          subtitle="Active contacts in CRM"
          trend={{
            value: '+12%',
            period: 'From the last month',
            isPositive: true
          }}
          icon={UsersIcon}
          color="blue"
        />
      </div>

        {/* Core CRM Data Tables - Similar to original SuiteCRM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* My Top Open Opportunities */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-medium text-gray-900">My Top Open Opportunities</h3>
            </div>
            <div className="p-4">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Downtown Condo</td>
                      <td className="px-3 py-2 text-sm text-gray-900">$320,000</td>
                      <td className="px-3 py-2 text-sm text-gray-600">12/15/24</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Oak Street House</td>
                      <td className="px-3 py-2 text-sm text-gray-900">$475,000</td>
                      <td className="px-3 py-2 text-sm text-gray-600">01/08/25</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Luxury Penthouse</td>
                      <td className="px-3 py-2 text-sm text-gray-900">$850,000</td>
                      <td className="px-3 py-2 text-sm text-gray-600">02/20/25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* My Accounts */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-medium text-gray-900">My Accounts</h3>
            </div>
            <div className="p-4">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Johnson Properties</td>
                      <td className="px-3 py-2 text-sm text-gray-600">Customer</td>
                      <td className="px-3 py-2 text-sm text-gray-600">(555) 111-2222</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Anderson Family</td>
                      <td className="px-3 py-2 text-sm text-gray-600">Prospect</td>
                      <td className="px-3 py-2 text-sm text-gray-600">(555) 333-4444</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Wilson Group</td>
                      <td className="px-3 py-2 text-sm text-gray-600">Investor</td>
                      <td className="px-3 py-2 text-sm text-gray-600">(555) 555-6666</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* My Recent Leads */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-medium text-gray-900">My Recent Leads</h3>
            </div>
            <div className="p-4">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Sarah Johnson</td>
                      <td className="px-3 py-2 text-sm text-gray-600">sarah.j@email.com</td>
                      <td className="px-3 py-2 text-sm text-green-600">New</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Mike Anderson</td>
                      <td className="px-3 py-2 text-sm text-gray-600">mike.a@email.com</td>
                      <td className="px-3 py-2 text-sm text-blue-600">Qualified</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-900">Lisa Thompson</td>
                      <td className="px-3 py-2 text-sm text-gray-600">lisa.t@email.com</td>
                      <td className="px-3 py-2 text-sm text-orange-600">Follow-up</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Stream - Simple and focused like original */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900">My Activity Stream</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {(activityFeed || []).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.userName} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
