import React, { useState, useEffect } from 'react'
import { Report, ReportType } from '../../types'
import { apiService } from '../../services/api'
import {
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CalendarIcon,
  TrophyIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface ReportModalProps {
  report?: Report | null
  isOpen: boolean
  onClose: () => void
  onSave: (report: Report) => void
}

interface ReportParameter {
  name: string
  value: string
  type: 'text' | 'select' | 'date' | 'number'
  options?: string[]
}

const ReportModal: React.FC<ReportModalProps> = ({ report, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [parameters, setParameters] = useState<ReportParameter[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Sales' as ReportType,
    createdBy: 'Current User'
  })

  useEffect(() => {
    if (isOpen) {
      if (report) {
        setFormData({
          name: report.name,
          description: report.description || '',
          type: report.type,
          createdBy: report.createdBy
        })
        setParameters(report.parameters || [])
      } else {
        // Reset form for new report
        setFormData({
          name: '',
          description: '',
          type: 'Sales',
          createdBy: 'Current User'
        })
        setParameters([])
      }
    }
  }, [isOpen, report])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const reportData: Report = {
        id: report?.id || `report-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        createdBy: formData.createdBy,
        createdDate: report?.createdDate || new Date().toISOString(),
        lastRun: report?.lastRun || null,
        parameters: parameters
      }

      if (report) {
        await apiService.put(`/reports/${report.id}`, reportData)
      } else {
        await apiService.post('/reports', reportData)
      }

      onSave(reportData)
      onClose()
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Error saving report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addParameter = () => {
    const newParam: ReportParameter = {
      name: '',
      value: '',
      type: 'text'
    }
    setParameters([...parameters, newParam])
  }

  const updateParameter = (index: number, field: keyof ReportParameter, value: string) => {
    const updatedParams = [...parameters]
    updatedParams[index] = { ...updatedParams[index], [field]: value }
    setParameters(updatedParams)
  }

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'Sales':
        return <CurrencyDollarIcon className="h-5 w-5" />
      case 'Lead':
        return <UserGroupIcon className="h-5 w-5" />
      case 'Contact':
        return <UserGroupIcon className="h-5 w-5" />
      case 'Account':
        return <BuildingOfficeIcon className="h-5 w-5" />
      case 'Property':
        return <HomeIcon className="h-5 w-5" />
      case 'Activity':
        return <CalendarIcon className="h-5 w-5" />
      case 'Performance':
        return <TrophyIcon className="h-5 w-5" />
      default:
        return <ChartBarIcon className="h-5 w-5" />
    }
  }

  const getReportTypeOptions = (type: ReportType): ReportParameter[] => {
    const baseOptions: Record<ReportType, ReportParameter[]> = {
      Sales: [
        { name: 'Date Range', value: 'Last 30 days', type: 'select', options: ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This Year'] },
        { name: 'Include Projections', value: 'Yes', type: 'select', options: ['Yes', 'No'] }
      ],
      Lead: [
        { name: 'Lead Source', value: 'All Sources', type: 'select', options: ['All Sources', 'Website', 'Phone', 'Email', 'Referral'] },
        { name: 'Time Period', value: 'Quarter', type: 'select', options: ['Month', 'Quarter', 'Year'] }
      ],
      Contact: [
        { name: 'Segment Type', value: 'All Segments', type: 'select', options: ['All Segments', 'Buyers', 'Sellers', 'Investors'] },
        { name: 'Active Only', value: 'Yes', type: 'select', options: ['Yes', 'No'] }
      ],
      Account: [
        { name: 'Account Type', value: 'All Types', type: 'select', options: ['All Types', 'Individual', 'Corporation', 'Partnership'] },
        { name: 'Revenue Threshold', value: '$100K+', type: 'select', options: ['$10K+', '$50K+', '$100K+', '$500K+'] }
      ],
      Property: [
        { name: 'Property Type', value: 'All Types', type: 'select', options: ['All Types', 'Single Family', 'Condo', 'Townhouse', 'Commercial'] },
        { name: 'Price Range', value: '$0 - $2M', type: 'select', options: ['$0 - $500K', '$500K - $1M', '$1M - $2M', '$2M+'] }
      ],
      Activity: [
        { name: 'Activity Type', value: 'All Types', type: 'select', options: ['All Types', 'Calls', 'Meetings', 'Tasks', 'Emails'] },
        { name: 'Status', value: 'All Status', type: 'select', options: ['All Status', 'Completed', 'Pending', 'In Progress'] }
      ],
      Performance: [
        { name: 'Agent', value: 'All Agents', type: 'select', options: ['All Agents', 'Top Performers', 'New Agents'] },
        { name: 'Metrics', value: 'All Metrics', type: 'select', options: ['All Metrics', 'Sales Volume', 'Lead Conversion', 'Customer Satisfaction'] }
      ]
    }
    return baseOptions[type] || []
  }

  const handleTypeChange = (newType: ReportType) => {
    setFormData({ ...formData, type: newType })
    // Auto-populate default parameters for the selected report type
    if (!report) {
      setParameters(getReportTypeOptions(newType))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getReportTypeIcon(formData.type)}
            <h2 className="text-xl font-bold text-gray-900">
              {report ? 'Edit Report' : 'Create New Report'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter report name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as ReportType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Sales">Sales</option>
                <option value="Lead">Lead</option>
                <option value="Contact">Contact</option>
                <option value="Account">Account</option>
                <option value="Property">Property</option>
                <option value="Activity">Activity</option>
                <option value="Performance">Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created By
              </label>
              <input
                type="text"
                value={formData.createdBy}
                onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter report description"
            />
          </div>

          {/* Report Parameters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Report Parameters
              </label>
              <button
                type="button"
                onClick={addParameter}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Parameter
              </button>
            </div>

            {parameters.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <ChartBarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  No parameters configured. Add parameters to customize your report.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {parameters.map((param, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Parameter Name
                        </label>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => updateParameter(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Parameter name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={param.type}
                          onChange={(e) => updateParameter(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="select">Select</option>
                          <option value="date">Date</option>
                          <option value="number">Number</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Default Value
                        </label>
                        {param.type === 'select' && param.options ? (
                          <select
                            value={param.value}
                            onChange={(e) => updateParameter(index, 'value', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            {param.options.map((option, optIndex) => (
                              <option key={optIndex} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type === 'date' ? 'date' : param.type === 'number' ? 'number' : 'text'}
                            value={param.value}
                            onChange={(e) => updateParameter(index, 'value', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Default value"
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeParameter(index)}
                      className="mt-6 text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Type Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              About {formData.type} Reports
            </h4>
            <p className="text-sm text-blue-700">
              {getReportDescription(formData.type)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (report ? 'Update Report' : 'Create Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const getReportDescription = (type: ReportType): string => {
  const descriptions = {
    Sales: 'Track revenue, closed deals, pipeline performance, and sales trends over time.',
    Lead: 'Analyze lead sources, conversion rates, and lead management effectiveness.',
    Contact: 'Generate insights about your contact database, segmentation, and engagement.',
    Account: 'Review account performance, revenue analysis, and relationship management.',
    Property: 'Monitor property listings, market trends, and inventory management.',
    Activity: 'Track team activities, productivity metrics, and task completion rates.',
    Performance: 'Measure individual and team performance across key business metrics.'
  }
  return descriptions[type] || 'Generate custom reports for your business needs.'
}

export default ReportModal
