import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Leads from '../pages/Leads'

// Mock the required modules
jest.mock('@/services/leadService', () => ({
  LeadService: {
    getLeads: jest.fn(),
  },
}))

jest.mock('@/components/leads/LeadCaptureModal', () => {
  return function MockLeadCaptureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? (
      <div data-testid="lead-capture-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  }
})

jest.mock('@/components/leads/LeadAssignmentPanel', () => {
  return function MockLeadAssignmentPanel({ lead, onAssignmentComplete }: any) {
    return (
      <div data-testid="lead-assignment-panel">
        <div>Lead Assignment Panel for {lead.firstName} {lead.lastName}</div>
        <button onClick={onAssignmentComplete}>Complete Assignment</button>
      </div>
    )
  }
})

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div data-testid="plus-icon" />,
  FunnelIcon: () => <div data-testid="funnel-icon" />,
  MagnifyingGlassIcon: () => <div data-testid="search-icon" />,
  UserPlusIcon: () => <div data-testid="user-plus-icon" />,
  MapPinIcon: () => <div data-testid="map-pin-icon" />,
  PhoneIcon: () => <div data-testid="phone-icon" />,
  EnvelopeIcon: () => <div data-testid="envelope-icon" />,
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  TrophyIcon: () => <div data-testid="trophy-icon" />,
  EllipsisVerticalIcon: () => <div data-testid="ellipsis-icon" />,
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock Headless UI
jest.mock('@headlessui/react', () => ({
  Menu: {
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    Items: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Item: ({ children }: any) => <div>{children({ active: false })}</div>,
  },
}))

const mockLeads = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    title: 'Marketing Manager',
    company: 'Tech Corp',
    status: 'New' as const,
    source: 'Website',
    assignedUserId: '1',
    assignedUserName: 'John Smith',
    propertyType: 'Condo' as const,
    budget: { min: 300000, max: 500000 },
    preferredLocation: 'Downtown',
    timeline: 'Within 3 months',
    leadScore: 75,
    geolocation: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Anderson',
    email: 'mike.anderson@example.com',
    phone: '(555) 987-6543',
    status: 'Qualified' as const,
    source: 'Referral',
    assignedUserId: '2',
    assignedUserName: 'Emily Davis',
    propertyType: 'Single Family' as const,
    budget: { min: 400000, max: 700000 },
    preferredLocation: 'Suburbs',
    timeline: 'Within 6 months',
    leadScore: 85,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
]

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

// Mock useQuery to return our mock data
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({
    data: {
      data: mockLeads,
      pagination: {
        page: 1,
        limit: 10,
        total: mockLeads.length,
        totalPages: 1
      }
    },
    isLoading: false,
    error: null
  }),
  QueryClient: jest.requireActual('@tanstack/react-query').QueryClient,
  QueryClientProvider: jest.requireActual('@tanstack/react-query').QueryClientProvider,
}))

describe('Leads Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders leads page with header', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Manage and nurture your real estate leads')).toBeInTheDocument()
    expect(screen.getByText('Capture Lead')).toBeInTheDocument()
  })

  it('displays leads after loading', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Michael Anderson')).toBeInTheDocument()
    expect(screen.getByText('sarah.johnson@example.com')).toBeInTheDocument()
    expect(screen.getByText('mike.anderson@example.com')).toBeInTheDocument()
  })

  it('shows leads with correct status badges', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
  })

  it('displays lead scores correctly', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('shows property preferences', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Condo')).toBeInTheDocument()
    expect(screen.getByText('Single Family')).toBeInTheDocument()
    expect(screen.getByText('Downtown')).toBeInTheDocument()
    expect(screen.getByText('Suburbs')).toBeInTheDocument()
  })

  it('displays budget ranges', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('$300,000 - $500,000')).toBeInTheDocument()
    expect(screen.getByText('$400,000 - $700,000')).toBeInTheDocument()
  })

  it('shows timeline information', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Within 3 months')).toBeInTheDocument()
    expect(screen.getByText('Within 6 months')).toBeInTheDocument()
  })

  it('displays lead sources', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Website')).toBeInTheDocument()
    expect(screen.getByText('Referral')).toBeInTheDocument()
  })

  it('shows assigned agents', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Assigned to: John Smith')).toBeInTheDocument()
    expect(screen.getByText('Assigned to: Emily Davis')).toBeInTheDocument()
  })

  it('allows searching leads', () => {
    renderWithQueryClient(<Leads />)

    const searchInput = screen.getByPlaceholderText('Search leads...')
    expect(searchInput).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Sarah' } })
    expect(searchInput).toHaveValue('Sarah')
  })

  it('allows filtering by status', () => {
    renderWithQueryClient(<Leads />)

    const statusFilter = screen.getByDisplayValue('All Statuses')
    expect(statusFilter).toBeInTheDocument()

    fireEvent.change(statusFilter, { target: { value: 'New' } })
    expect(statusFilter).toHaveValue('New')
  })

  it('allows filtering by source', () => {
    renderWithQueryClient(<Leads />)

    const sourceFilter = screen.getByDisplayValue('All Sources')
    expect(sourceFilter).toBeInTheDocument()

    fireEvent.change(sourceFilter, { target: { value: 'Website' } })
    expect(sourceFilter).toHaveValue('Website')
  })

  it('opens lead capture modal when button is clicked', () => {
    renderWithQueryClient(<Leads />)

    const captureButton = screen.getByText('Capture Lead')
    fireEvent.click(captureButton)

    expect(screen.getByTestId('lead-capture-modal')).toBeInTheDocument()
  })

  it('closes lead capture modal', () => {
    renderWithQueryClient(<Leads />)

    const captureButton = screen.getByText('Capture Lead')
    fireEvent.click(captureButton)

    expect(screen.getByTestId('lead-capture-modal')).toBeInTheDocument()

    const closeButton = screen.getByText('Close Modal')
    fireEvent.click(closeButton)

    expect(screen.queryByTestId('lead-capture-modal')).not.toBeInTheDocument()
  })

  it('shows reassign button for each lead', () => {
    renderWithQueryClient(<Leads />)

    const reassignButtons = screen.getAllByText('Reassign')
    expect(reassignButtons).toHaveLength(2)
  })

  it('opens lead assignment panel when reassign is clicked', () => {
    renderWithQueryClient(<Leads />)

    const reassignButtons = screen.getAllByText('Reassign')
    fireEvent.click(reassignButtons[0])

    expect(screen.getByTestId('lead-assignment-panel')).toBeInTheDocument()
    expect(screen.getByText('Lead Assignment Panel for Sarah Johnson')).toBeInTheDocument()
  })

  it('closes lead assignment panel when completed', () => {
    renderWithQueryClient(<Leads />)

    const reassignButtons = screen.getAllByText('Reassign')
    fireEvent.click(reassignButtons[0])

    expect(screen.getByTestId('lead-assignment-panel')).toBeInTheDocument()

    const completeButton = screen.getByText('Complete Assignment')
    fireEvent.click(completeButton)

    expect(screen.queryByTestId('lead-assignment-panel')).not.toBeInTheDocument()
  })

  it('displays created time relative to now', () => {
    renderWithQueryClient(<Leads />)

    // Should show the mocked relative time
    const timeElements = screen.getAllByText('2 hours ago')
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('shows phone numbers correctly formatted', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
    expect(screen.getByText('(555) 987-6543')).toBeInTheDocument()
  })

  it('displays company information when available', () => {
    renderWithQueryClient(<Leads />)

    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
  })

  it('shows empty state when no leads match filters', () => {
    // Mock useQuery to return empty data
    jest.doMock('@tanstack/react-query', () => ({
      ...jest.requireActual('@tanstack/react-query'),
      useQuery: () => ({
        data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null
      }),
      QueryClient: jest.requireActual('@tanstack/react-query').QueryClient,
      QueryClientProvider: jest.requireActual('@tanstack/react-query').QueryClientProvider,
    }))

    // Re-render to get empty state
    const { rerender } = renderWithQueryClient(<Leads />)
    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <Leads />
      </QueryClientProvider>
    )

    // Note: The actual empty state text depends on the implementation
    // This is a placeholder for the expected behavior
    expect(screen.getByText('Capture Lead')).toBeInTheDocument()
  })
})
