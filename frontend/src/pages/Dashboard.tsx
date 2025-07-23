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
import SalesPipelineChart from '@/components/dashboard/SalesPipelineChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import QuickActions from '@/components/dashboard/QuickActions'
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

const mockPipelineData = [
  { name: 'Prospecting', value: 15 },
  { name: 'Qualification', value: 12 },
  { name: 'Proposal', value: 8 },
  { name: 'Negotiation', value: 5 },
  { name: 'Closed Won', value: 12 },
  { name: 'Closed Lost', value: 3 }
]

const mockLeadSourceData = [
  { name: 'Website', value: 35 },
  { name: 'Referrals', value: 28 },
  { name: 'Social Media', value: 18 },
  { name: 'Cold Calls', value: 12 },
  { name: 'Other', value: 7 }
]

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

  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ['sales-pipeline'],
    queryFn: () => Promise.resolve(mockPipelineData),
    staleTime: Infinity,
    retry: false
  })

  const { data: leadSourceData, isLoading: leadSourceLoading } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: () => Promise.resolve(mockLeadSourceData),
    staleTime: Infinity,
    retry: false
  })

  const { data: activityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => Promise.resolve(mockActivityFeed),
    staleTime: Infinity,
    retry: false
  })

  // Quick action handlers
  const handleCreateLead = () => {
    toast.success('Lead creation form would open here')
    // In real app: navigate to lead creation form
  }

  const handleAddProperty = () => {
    toast.success('Property listing form would open here')
    // In real app: navigate to property creation form
  }

  const handleLogCall = () => {
    toast.success('Call logging form would open here')
    // In real app: open call logging modal
  }

  const handleScheduleMeeting = () => {
    toast.success('Meeting scheduler would open here')
    // In real app: open calendar scheduling modal
  }

  const handleCreateDocument = () => {
    toast.success('Document creation would open here')
    // In real app: open document creation modal
  }

  const handleStartChat = () => {
    toast.success('Messaging interface would open here')
    // In real app: open messaging interface
  }

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

        {/* Stats cards - Full width desktop grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
          title="Active Properties"
          value="156"
          subtitle="Listed properties"
          trend={{
            value: '+5%',
            period: 'From the last month',
            isPositive: true
          }}
          icon={BuildingOffice2Icon}
          color="blue"
        />
        <CRMHubStatsCard
          title="Conversion Rate"
          value="24.5%"
          subtitle="Lead to customer"
          trend={{
            value: '+3.2%',
            period: 'From the last month',
            isPositive: true
          }}
          icon={ChartBarIcon}
          color="green"
        />
      </div>

        {/* Charts and content - Optimized for wide desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Sales Pipeline Chart */}
          <div className="lg:col-span-1 xl:col-span-2">
            <SalesPipelineChart
              data={pipelineData || []}
              title="Sales Pipeline"
              type="bar"
            />
          </div>

          {/* Lead Sources Pie Chart */}
          <div className="lg:col-span-1 xl:col-span-1">
            <SalesPipelineChart
              data={leadSourceData || []}
              title="Lead Sources"
              type="pie"
            />
          </div>

          {/* Additional Chart for Desktop */}
          <div className="lg:col-span-1 xl:col-span-1">
            <SalesPipelineChart
              data={[
                { name: 'Jan', value: 45 },
                { name: 'Feb', value: 52 },
                { name: 'Mar', value: 48 },
                { name: 'Apr', value: 67 },
                { name: 'May', value: 58 },
                { name: 'Jun', value: 71 }
              ]}
              title="Monthly Performance"
              type="bar"
            />
          </div>
        </div>

        {/* Bottom section - Grid with 12 columns */}
        <div className="grid grid-cols-12 gap-4">
          {/* Quick Actions */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 xl:col-span-2">
            <QuickActions
              onCreateLead={handleCreateLead}
              onAddProperty={handleAddProperty}
              onLogCall={handleLogCall}
              onScheduleMeeting={handleScheduleMeeting}
              onCreateDocument={handleCreateDocument}
              onStartChat={handleStartChat}
            />
          </div>

          {/* Activity Feed */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-9 xl:col-span-10">
            <ActivityFeed
              activities={activityFeed || []}
              isLoading={activityLoading}
            />
          </div>
        </div>
      </div>

      {/* Mobile optimization notice */}
      <div className="mt-6 lg:hidden">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start">
            <BuildingOffice2Icon className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-primary-800">Mobile Optimized</h3>
              <p className="text-sm text-primary-700 mt-1">
                This dashboard is fully optimized for mobile use. Swipe and tap to interact with charts and data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
