import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { ChartData } from '@/types'

interface SalesPipelineChartProps {
  data: ChartData[]
  type?: 'bar' | 'pie'
  title: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function SalesPipelineChart({ data, type = 'bar', title }: SalesPipelineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-primary-600">
            Value: <span className="font-semibold">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="name" 
          className="text-sm text-gray-600"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-sm text-gray-600"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
          className="hover:opacity-80 transition-opacity"
        />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      {type === 'bar' ? renderBarChart() : renderPieChart()}
      
      {type === 'pie' && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
