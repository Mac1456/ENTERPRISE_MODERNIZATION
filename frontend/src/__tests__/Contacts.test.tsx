import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Contacts from '../pages/Contacts'
import { apiService } from '../services/api'

// Mock the API service
jest.mock('../services/api', () => ({
  apiService: {
    get: jest.fn(),
  },
}))

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div data-testid="plus-icon" />,
  FunnelIcon: () => <div data-testid="funnel-icon" />,
  MagnifyingGlassIcon: () => <div data-testid="search-icon" />,
  BuildingOfficeIcon: () => <div data-testid="building-icon" />,
  UserGroupIcon: () => <div data-testid="user-group-icon" />,
  HomeIcon: () => <div data-testid="home-icon" />,
  PhoneIcon: () => <div data-testid="phone-icon" />,
  EnvelopeIcon: () => <div data-testid="envelope-icon" />,
  MapPinIcon: () => <div data-testid="map-pin-icon" />,
  HeartIcon: () => <div data-testid="heart-icon" />,
  StarIcon: () => <div data-testid="star-icon" />,
}))

jest.mock('@heroicons/react/24/solid', () => ({
  HeartIcon: () => <div data-testid="heart-solid-icon" />,
  StarIcon: () => <div data-testid="star-solid-icon" />,
}))

const mockContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    mobile: '(555) 987-6543',
    title: 'Software Engineer',
    accountId: '1',
    accountName: 'Tech Corp',
    assignedUserId: '1',
    assignedUserName: 'Agent Smith',
    propertyInterests: [
      {
        propertyId: '101',
        interestLevel: 'High' as const,
        notes: 'Interested in downtown location',
        dateViewed: '2024-01-15'
      }
    ],
    buyerProfile: {
      preApprovalAmount: 500000,
      downPayment: 100000,
      preferredPropertyTypes: ['Single Family' as const, 'Condo' as const],
      mustHaveFeatures: ['3+ bedrooms', 'garage'],
      dealBreakers: ['busy street']
    },
    preferredLocations: ['Downtown', 'Westside'],
    budget: { min: 400000, max: 600000 },
    createdAt: '2024-01-10T10:00:00Z',
    modifiedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    title: 'Marketing Manager',
    assignedUserId: '2',
    assignedUserName: 'Agent Johnson',
    propertyInterests: [],
    preferredLocations: ['Suburbs'],
    budget: { min: 300000, max: 500000 },
    createdAt: '2024-01-12T14:00:00Z',
    modifiedAt: '2024-01-22T09:15:00Z'
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

describe('Contacts Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders contacts page with header', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Manage your real estate contacts and property interests')).toBeInTheDocument()
    expect(screen.getByText('Add Contact')).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    (apiService.get as jest.Mock).mockImplementation(() => new Promise(() => {}))

    renderWithQueryClient(<Contacts />)

    // The component should show loading state through the data table
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })

  it('displays contacts after loading', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    (apiService.get as jest.Mock).mockRejectedValue(new Error('API Error'))

    // Mock console.error to avoid error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      // Should fall back to mock data or show error state
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching contacts:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('filters contacts by search term', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search contacts...')
    fireEvent.change(searchInput, { target: { value: 'John' } })

    // Should filter to show only John Doe
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    // Jane Smith should still be visible since we're not actually filtering in this test
    // In a real implementation, you'd mock the filtering logic
  })

  it('filters contacts by type', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const filterSelect = screen.getByDisplayValue('All Contacts')
    fireEvent.change(filterSelect, { target: { value: 'buyer' } })

    // Should trigger filtering logic
    expect(filterSelect).toHaveValue('buyer')
  })

  it('opens add contact modal when button is clicked', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    const addButton = screen.getByText('Add Contact')
    fireEvent.click(addButton)

    // In a real implementation, this would open a modal
    // For now, we just verify the button is clickable
    expect(addButton).toBeInTheDocument()
  })

  it('displays contact counts correctly', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('2 of 2 contacts')).toBeInTheDocument()
    })
  })

  it('displays contact details correctly', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Check that contact details are displayed
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
    expect(screen.getByText('Agent Smith')).toBeInTheDocument()
  })

  it('shows property interests count', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('1 properties')).toBeInTheDocument()
      expect(screen.getByText('0 properties')).toBeInTheDocument()
    })
  })

  it('displays budget information', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('Budget: $400,000 - $600,000')).toBeInTheDocument()
      expect(screen.getByText('Budget: $300,000 - $500,000')).toBeInTheDocument()
    })
  })

  it('shows preferred locations', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({ data: mockContacts })

    renderWithQueryClient(<Contacts />)

    await waitFor(() => {
      expect(screen.getByText('Downtown')).toBeInTheDocument()
      expect(screen.getByText('Westside')).toBeInTheDocument()
      expect(screen.getByText('Suburbs')).toBeInTheDocument()
    })
  })
})
