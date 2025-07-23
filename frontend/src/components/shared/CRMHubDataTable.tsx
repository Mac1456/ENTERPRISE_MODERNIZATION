import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'

interface TableColumn {
  key: string
  title: string
  width?: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface TableRow {
  id: string
  [key: string]: any
}

interface CRMHubDataTableProps {
  columns: TableColumn[]
  data: TableRow[]
  pagination?: {
    currentPage: number
    totalPages: number
    total: number
    onPageChange: (page: number) => void
  }
  loading?: boolean
  title?: string
  actions?: React.ReactNode
}

const StatusBadge = ({ status, type = 'default' }: { status: string, type?: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'pending':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'qualified':
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'contacted':
      case 'progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'converted':
      case 'high':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'dead':
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle()}`}>
      {status}
    </span>
  )
}

export default function CRMHubDataTable({ 
  columns, 
  data, 
  pagination, 
  loading, 
  title,
  actions 
}: CRMHubDataTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-crmhub-blue focus:ring-crmhub-blue"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.title}
                </th>
              ))}
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-crmhub-blue focus:ring-crmhub-blue"
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm">
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : column.key === 'status' ? (
                      <StatusBadge status={row[column.key]} />
                    ) : (
                      <span className="text-gray-900">{row[column.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-4">
                  <button className="text-gray-400 hover:text-gray-600">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    page === pagination.currentPage
                      ? 'bg-crmhub-blue text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { StatusBadge }
