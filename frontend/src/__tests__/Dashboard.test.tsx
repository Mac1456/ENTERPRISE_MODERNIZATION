import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '../pages/Dashboard'

// Mock the required modules
jest.mock('@/services/dashboardService', () => ({
  DashboardService: {
    getDashboardStats: jest.fn(),
  },
}))

jest.mock('@/components/dashboard/CRMHubStatsCard', () => {
  return function MockStatsCard({ title }: { title: string }) {
    return <div data-testid="stats-card">{title}</div>
  }
})

jest.mock('@/components/dashboard/SalesPipelineChart', () => {
  return function MockChart({ title }: { title: string }) {
    return <div data-testid="chart">{title}</div>
  }
})

jest.mock('@/components/dashboard/ActivityFeed', () => {
  return function MockActivityFeed() {
    return <div data-testid="activity-feed">Activity Feed</div>
  }
})

jest.mock('@/components/dashboard/QuickActions', () => {
  return function MockQuickActions() {
    return <div data-testid="quick-actions">Quick Actions</div>
  }
})

jest.mock('@/components/shared/IntegrationStatus', () => {
  return function MockIntegrationStatus() {
    return <div data-testid="integration-status">Integration Status</div>
  }
})

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Dashboard', () => {
  it('renders dashboard with proper max-w-7xl wrapper', () => {
    renderWithQueryClient(<Dashboard />)
    
    // Check that the main content container has the correct classes
    const mainContainer = document.querySelector('.max-w-7xl.mx-auto.px-4.lg\\:px-8.py-8')
    expect(mainContainer).toBeInTheDocument()
    
    // Verify dashboard title is rendered
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('renders dashboard with proper 12-column grid layout for bottom section', () => {
    renderWithQueryClient(<Dashboard />)
    
    // Check that the bottom section uses grid-cols-12
    const gridContainer = document.querySelector('.grid.grid-cols-12.gap-6')
    expect(gridContainer).toBeInTheDocument()
    
    // Check Quick Actions and Activity Feed are rendered
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
  })

  it('renders integration status component', () => {
    renderWithQueryClient(<Dashboard />)
    
    expect(screen.getByTestId('integration-status')).toBeInTheDocument()
  })
})
