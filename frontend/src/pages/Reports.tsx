import React, { useState, useEffect } from 'react'
import { Report, ReportType } from '../types'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  BuildingOfficeIcon,
  HomeIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import CRMHubDataTable from '../components/shared/CRMHubDataTable'
import SalesPipelineChart from '../components/dashboard/SalesPipelineChart'

interface ReportsProps {}

const Reports: React.FC<ReportsProps> = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: Report[]}>('/reports')
      setReports(response.data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports(mockReports) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
  }



  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || report.type === filterType
    
    return matchesSearch && matchesType
  })

  const handleRunReport = (report: Report) => {
    // In a real app, this would generate and run the report
    console.log('Running report:', report.name)
    alert(`Running report: ${report.name}`)
  }

  const handleExportReport = (report: Report) => {
    // In a real app, this would export the report data
    console.log('Exporting report:', report.name)
    alert(`Exporting report: ${report.name}`)
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredReports.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleReportClick(report)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${getReportTypeStyle(report.type)}`}>
                {getReportTypeIcon(report.type)}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRunReport(report)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Run Report"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportReport(report)
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                  title="Export Report"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
            {report.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className={`inline-flex px-2 py-1 rounded-full border ${getReportTypeStyle(report.type)}`}>
                {report.type} Report
              </span>
              <span>Last run: {report.lastRun ? new Date(report.lastRun).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const columns = [
    {
      key: 'name',
      title: 'Report Name',
      render: (value: any, report: Report) => (
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getReportTypeStyle(report.type)}`}>
            {getReportTypeIcon(report.type)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{report.name}</p>
            {report.description && (
              <p className="text-xs text-gray-500 mt-1">{report.description}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: any, report: Report) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getReportTypeStyle(report.type)}`}>
          {report.type}
        </span>
      )
    },
    {
      key: 'lastRun',
      title: 'Last Run',
      render: (value: any, report: Report) => (
        <div className="text-sm text-gray-900">
          {report.lastRun ? new Date(report.lastRun).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'createdBy',
      title: 'Created By',
      render: (value: any, report: Report) => (
        <div className="text-sm text-gray-900">{report.createdBy}</div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, report: Report) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRunReport(report)}
            className="text-blue-600 hover:text-blue-700"
            title="Run Report"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleExportReport(report)}
            className="text-green-600 hover:text-green-700"
            title="Export Report"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-700"
            title="Edit Report"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex h-full">
          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${selectedReport ? 'lg:mr-96' : ''}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-600">Generate insights and analytics for your business</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Report
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <div className="text-sm text-gray-500">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.type === 'Sales').length}
              </div>
              <div className="text-sm text-gray-500">Sales Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reports.filter(r => r.lastRun && new Date(r.lastRun) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-500">Run This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {reports.filter(r => r.type === 'Performance').length}
              </div>
              <div className="text-sm text-gray-500">Performance Reports</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ReportType | 'all')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Sales">Sales</option>
                  <option value="Lead">Lead</option>
                  <option value="Contact">Contact</option>
                  <option value="Account">Account</option>
                  <option value="Property">Property</option>
                  <option value="Activity">Activity</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>

            {/* Reports View */}
            <div className="flex-1 bg-gray-50 p-6">
              {viewMode === 'grid' ? (
                renderGridView()
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <CRMHubDataTable
                      data={filteredReports}
                      columns={columns}
                      loading={loading}
                      onRowClick={handleReportClick}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Detail Panel */}
          {selectedReport && (
            <ReportDetailPanel
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
              onUpdate={() => fetchReports()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions
const getReportTypeIcon = (type: ReportType) => {
  switch (type) {
    case 'Sales':
      return <CurrencyDollarIcon className="h-6 w-6" />
    case 'Lead':
      return <UserGroupIcon className="h-6 w-6" />
    case 'Contact':
      return <UserGroupIcon className="h-6 w-6" />
    case 'Account':
      return <BuildingOfficeIcon className="h-6 w-6" />
    case 'Property':
      return <HomeIcon className="h-6 w-6" />
    case 'Activity':
      return <CalendarIcon className="h-6 w-6" />
    case 'Performance':
      return <TrophyIcon className="h-6 w-6" />
    default:
      return <ChartBarIcon className="h-6 w-6" />
  }
}

const getReportTypeStyle = (type: ReportType) => {
  switch (type) {
    case 'Sales':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'Lead':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Contact':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'Account':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'Property':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'Activity':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'Performance':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Report Detail Panel Component
const ReportDetailPanel: React.FC<{
  report: Report
  onClose: () => void
  onUpdate: () => void
}> = ({ report, onClose, onUpdate }) => {
  const [isRunning, setIsRunning] = useState(false)

  const handleRunReport = async () => {
    setIsRunning(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Report "${report.name}" has been generated successfully!`)
    } catch (error) {
      console.error('Error running report:', error)
    } finally {
      setIsRunning(false)
    }
  }

  // Mock chart data for demonstration
  const mockChartData = [
    { name: 'Jan', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 67000 },
    { name: 'May', value: 58000 },
    { name: 'Jun', value: 71000 }
  ]

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Report Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Report Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className={`p-4 rounded-lg ${getReportTypeStyle(report.type)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getReportTypeIcon(report.type)}
                <span className="text-sm font-medium uppercase tracking-wide">{report.type} REPORT</span>
              </div>
              <h4 className="text-xl font-semibold">{report.name}</h4>
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-700">{report.description}</p>
            </div>
          )}

          {/* Report Statistics */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Report Statistics</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Run:</span>
                <span className="text-sm font-medium">
                  {report.lastRun ? new Date(report.lastRun).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created By:</span>
                <span className="text-sm font-medium">{report.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium">
                  {new Date(report.createdDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Sample Chart Preview */}
          {report.type === 'Sales' && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Sample Preview</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <SalesPipelineChart
                  data={mockChartData}
                  title="Monthly Sales Trend"
                  type="bar"
                />
              </div>
            </div>
          )}

          {/* Report Parameters */}
          {report.parameters && report.parameters.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Parameters</h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {report.parameters.map((param, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{param.name}:</span>
                    <span className="font-medium">{param.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Formats */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Available Formats</h5>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-green-50 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-100">
                Excel
              </button>
              <button className="bg-red-50 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-100">
                PDF
              </button>
              <button className="bg-blue-50 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100">
                CSV
              </button>
              <button className="bg-purple-50 text-purple-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-purple-100">
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={handleRunReport}
            disabled={isRunning}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Report...' : 'Run Report'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Edit Report
            </button>
            <button className="bg-green-100 text-green-700 py-2 px-4 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
              Export
            </button>
          </div>
          <button className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
            Delete Report
          </button>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Sales Performance',
    description: 'Comprehensive monthly sales report showing revenue, deals closed, and agent performance',
    type: 'Sales',
    createdBy: 'Mike Smith',
    createdDate: '2024-01-01T10:00:00Z',
    lastRun: '2024-01-25T14:30:00Z',
    parameters: [
      { name: 'Date Range', value: 'Last 30 days' },
      { name: 'Include Projections', value: 'Yes' }
    ]
  },
  {
    id: '2',
    name: 'Lead Conversion Analysis',
    description: 'Track lead sources, conversion rates, and identify top-performing channels',
    type: 'Lead',
    createdBy: 'Lisa Rodriguez',
    createdDate: '2024-01-05T12:00:00Z',
    lastRun: '2024-01-20T09:15:00Z',
    parameters: [
      { name: 'Lead Source', value: 'All Sources' },
      { name: 'Time Period', value: 'Quarter' }
    ]
  },
  {
    id: '3',
    name: 'Property Inventory Report',
    description: 'Current property listings, average days on market, and pricing trends',
    type: 'Property',
    createdBy: 'Robert Wilson',
    createdDate: '2024-01-10T16:00:00Z',
    lastRun: '2024-01-22T11:45:00Z',
    parameters: [
      { name: 'Property Type', value: 'All Types' },
      { name: 'Price Range', value: '$0 - $2M' }
    ]
  },
  {
    id: '4',
    name: 'Agent Performance Dashboard',
    description: 'Individual agent metrics including sales volume, client satisfaction, and activity levels',
    type: 'Performance',
    createdBy: 'Mike Smith',
    createdDate: '2024-01-15T08:00:00Z',
    lastRun: '2024-01-24T16:20:00Z',
    parameters: [
      { name: 'Agent', value: 'All Agents' },
      { name: 'Metrics', value: 'All Metrics' }
    ]
  },
  {
    id: '5',
    name: 'Contact Segmentation Report',
    description: 'Analyze contact database by buyer/seller profiles, location preferences, and engagement levels',
    type: 'Contact',
    createdBy: 'Lisa Rodriguez',
    createdDate: '2024-01-18T13:30:00Z',
    lastRun: null,
    parameters: [
      { name: 'Segment Type', value: 'All Segments' },
      { name: 'Active Only', value: 'Yes' }
    ]
  },
  {
    id: '6',
    name: 'Account Revenue Analysis',
    description: 'Top accounts by revenue, growth trends, and opportunity pipeline',
    type: 'Account',
    createdBy: 'Mike Smith',
    createdDate: '2024-01-20T10:15:00Z',
    lastRun: '2024-01-26T15:00:00Z',
    parameters: [
      { name: 'Account Type', value: 'All Types' },
      { name: 'Revenue Threshold', value: '$100K+' }
    ]
  }
]

export default Reports
