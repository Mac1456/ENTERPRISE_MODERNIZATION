/**
 * ✅ ACTIVE COMPONENT - PRIMARY PROPERTY SEARCH PAGE
 * 
 * Feature 5: Advanced Property Search & Matching
 * Route: /property-search (following Leads_Enhanced.tsx patterns)
 * Status: ACTIVE - This is the primary property search implementation
 * 
 * Following exact patterns from Leads_Enhanced.tsx, Contacts_Enhanced.tsx, Communications_Enhanced.tsx
 * Last updated: Initial implementation - 2024-07-27
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BookmarkIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  BoltIcon,
  EyeIcon,
  HeartIcon,
  TrophyIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { PropertySearchService } from '@/services/propertySearchService'
import { 
  PropertySearchListing, 
  PropertySearchFilters, 
  PropertySearchQuery,
  SavedSearch,
  PropertyRecommendation,
  PropertySearchStats,
  SearchFilters 
} from '@/types'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

// Mock data for demonstration (following exact pattern from other Enhanced pages)
const mockProperties: PropertySearchListing[] = [
  {
    id: 'prop1',
    address: '123 Maple Street',
    city: 'Downtown',
    state: 'CA',
    zipCode: '90210',
    propertyType: 'Single Family',
    listingPrice: 450000,
    squareFootage: 1800,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2015,
    description: 'Beautiful 3BR/2BA home in desirable downtown location with modern updates throughout.',
    features: ['Garage', 'Fireplace', 'Hardwood Floors', 'Updated Kitchen'],
    images: ['/api/images/prop1-1.jpg', '/api/images/prop1-2.jpg'],
    status: 'Active',
    mlsNumber: 'MLS123456',
    listingAgentId: 'agent1',
    createdAt: '2024-07-12T00:00:00Z',
    modifiedAt: '2024-07-25T10:30:00Z',
    // PropertySearchListing specific fields
    price: 450000,
    sqft: 1800,
    lotSize: 0.25,
    daysOnMarket: 15,
    listingAgent: 'Sarah Johnson',
    virtualTourUrl: 'https://tour.example.com/prop1',
    schoolDistrict: 'Downtown Elementary School',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    matchScore: 95,
    listingDate: '2024-07-12T00:00:00Z'
  },
  {
    id: 'prop2',
    address: '456 Oak Avenue',
    city: 'Midtown',
    state: 'CA',
    zipCode: '90211',
    propertyType: 'Condo',
    listingPrice: 375000,
    squareFootage: 1200,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2010,
    description: 'Modern 2BR/2BA condo with stunning city views and luxury amenities.',
    features: ['Balcony', 'In-unit Laundry', 'Granite Countertops', 'Stainless Appliances'],
    images: ['/api/images/prop2-1.jpg', '/api/images/prop2-2.jpg'],
    status: 'Active',
    mlsNumber: 'MLS789012',
    listingAgentId: 'agent2',
    createdAt: '2024-07-19T00:00:00Z',
    modifiedAt: '2024-07-26T14:15:00Z',
    // PropertySearchListing specific fields
    price: 375000,
    sqft: 1200,
    daysOnMarket: 8,
    listingAgent: 'Mike Chen',
    schoolDistrict: 'Midtown High School',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    matchScore: 88,
    listingDate: '2024-07-19T00:00:00Z'
  }
]

export default function PropertySearchEnhanced() {
  const [properties, setProperties] = useState<PropertySearchListing[]>(mockProperties)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<PropertySearchFilters>({})

  const queryClient = useQueryClient()

  // Query for property search stats (following pattern from other Enhanced pages)
  const { data: searchStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['property-search-stats'],
    queryFn: PropertySearchService.getSearchStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const handleSearch = async (query: PropertySearchQuery) => {
    try {
      const results = await PropertySearchService.searchProperties(query)
      setProperties(results.properties)
      setSearchQuery(query.query)
      setFilters(query.filters)
      toast.success(`Found ${results.totalResults} properties`)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    }
  }

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Property table columns (following CRMHubDataTable pattern)
  const propertyColumns = [
    {
      key: 'property',
      header: 'Property',
      render: (property: PropertySearchListing) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{property.address}</div>
            <div className="text-sm text-gray-500">{property.city}, {property.state} {property.zipCode}</div>
          </div>
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (property: PropertySearchListing) => (
        <div className="text-sm">
          <div className="text-gray-900">{property.bedrooms} BD / {property.bathrooms} BA</div>
          <div className="text-gray-500">{property.sqft?.toLocaleString()} sqft • {property.propertyType}</div>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (property: PropertySearchListing) => (
        <div className="text-sm">
          <div className="text-gray-900 font-medium">{formatPrice(property.price)}</div>
          <div className="text-gray-500">{property.daysOnMarket} days on market</div>
        </div>
      )
    },
    {
      key: 'agent',
      header: 'Listing Agent',
      render: (property: PropertySearchListing) => (
        <div className="text-sm">
          <div className="text-gray-900">{property.listingAgent}</div>
          <div className="text-gray-500">MLS: {property.mlsNumber}</div>
        </div>
      )
    },
    {
      key: 'match',
      header: 'Match Score',
      render: (property: PropertySearchListing) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-green-500" 
              style={{ width: `${property.matchScore}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">{property.matchScore}%</span>
        </div>
      )
    }
  ]

  // Stats cards data (following pattern from other Enhanced pages)
  const statsCards = [
    {
      title: 'Total Searches',
      value: searchStats?.totalSearches?.toLocaleString() || '0',
      icon: MagnifyingGlassIcon,
      bgColor: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase' as const
    },
    {
      title: 'Active Saved Searches',
      value: searchStats?.savedSearches?.toString() || '0',
      icon: BookmarkIcon,
      bgColor: 'bg-green-500',
      change: '+2',
      changeType: 'increase' as const
    },
    {
      title: 'Properties Found',
      value: searchStats?.matchesFound?.toLocaleString() || '0',
      icon: HomeIcon,
      bgColor: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase' as const
    },
    {
      title: 'Showings Scheduled',
      value: searchStats?.showingsScheduled?.toString() || '0',
      icon: CalendarIcon,
      bgColor: 'bg-orange-500',
      change: '+8',
      changeType: 'increase' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Search</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search and match properties with client preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => handleSearch({ query: searchQuery, filters })}
            className="flex items-center space-x-2"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span>New Search</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards (following exact pattern from other Enhanced pages) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${card.bgColor} rounded-md flex items-center justify-center`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {card.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search properties by location, features, or MLS number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={() => handleSearch({ query: searchQuery, filters })}
              className="flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Property Listings ({properties.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CRMHubDataTable
            data={properties}
            columns={propertyColumns}
            selectedItems={selectedProperties}
            onSelectItem={handlePropertySelect}
            onSelectAll={(selected) => setSelectedProperties(selected ? properties.map(p => p.id) : [])}
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}
