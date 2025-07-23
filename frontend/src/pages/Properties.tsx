import React, { useState, useEffect } from 'react'
import { Property, PropertyType, PropertyStatus } from '../types'
import CRMHubDataTable from '../components/shared/CRMHubDataTable'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  PhotoIcon,
  EyeIcon,
  PencilIcon,
  HeartIcon,
  TagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface PropertiesProps {}

const Properties: React.FC<PropertiesProps> = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<PropertyStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<PropertyType | 'all'>('all')
  const [priceRange, setPriceRange] = useState<'all' | 'under500k' | '500k-1m' | 'over1m'>('all')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: Property[]}>('/properties')
      setProperties(response.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties(mockProperties) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
  }

  const getPropertyStatusStyle = (status: PropertyStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Under Contract':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Sold':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Withdrawn':
      case 'Expired':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case 'Single Family':
        return <HomeIcon className="h-4 w-4 text-blue-500" />
      case 'Condo':
      case 'Townhouse':
        return <BuildingOfficeIcon className="h-4 w-4 text-green-500" />
      case 'Multi Family':
        return <BuildingOfficeIcon className="h-4 w-4 text-purple-500" />
      case 'Commercial':
        return <BuildingOfficeIcon className="h-4 w-4 text-orange-500" />
      case 'Land':
        return <TagIcon className="h-4 w-4 text-brown-500" />
      default:
        return <HomeIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.state.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus
    const matchesType = filterType === 'all' || property.propertyType === filterType
    
    let matchesPrice = true
    if (priceRange === 'under500k') matchesPrice = property.listingPrice < 500000
    else if (priceRange === '500k-1m') matchesPrice = property.listingPrice >= 500000 && property.listingPrice <= 1000000
    else if (priceRange === 'over1m') matchesPrice = property.listingPrice > 1000000
    
    return matchesSearch && matchesStatus && matchesType && matchesPrice
  })

  const columns = [
    {
      key: 'property',
      title: 'Property',
      render: (value: any, property: Property) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.address}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {getPropertyTypeIcon(property.propertyType)}
              <span className="text-sm font-medium text-gray-900">{property.propertyType}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{property.address}</p>
            <p className="text-xs text-gray-500">{property.city}, {property.state} {property.zipCode}</p>
            {property.mlsNumber && (
              <p className="text-xs text-blue-600 mt-1">MLS #{property.mlsNumber}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'details',
      title: 'Details',
      render: (value: any, property: Property) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-medium">{property.bedrooms} beds</span>
            <span className="font-medium">{property.bathrooms} baths</span>
          </div>
          <div className="text-sm text-gray-600">
            {property.squareFootage.toLocaleString()} sq ft
          </div>
          <div className="text-xs text-gray-500">
            Built {property.yearBuilt}
          </div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (value: any, property: Property) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
            <span className="text-lg font-bold text-green-600">
              ${property.listingPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            ${Math.round(property.listingPrice / property.squareFootage)}/sq ft
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, property: Property) => (
        <div className="space-y-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPropertyStatusStyle(property.status)}`}>
            {property.status}
          </span>
          <div className="text-xs text-gray-500">
            Listed {new Date(property.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'agent',
      title: 'Listing Agent',
      render: (value: any, property: Property) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900">Agent #{property.listingAgentId}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, property: Property) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePropertyClick(property)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-800"
            title="Edit Property"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            title="Add to Favorites"
          >
            <HeartIcon className="h-4 w-4" />
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
          <div className={`flex-1 flex flex-col ${selectedProperty ? 'lg:mr-96' : ''}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <p className="text-sm text-gray-600">Manage your real estate property listings</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Property
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{properties.filter(p => p.status === 'Active').length}</div>
              <div className="text-sm text-gray-500">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{properties.filter(p => p.status === 'Under Contract').length}</div>
              <div className="text-sm text-gray-500">Under Contract</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{properties.filter(p => p.status === 'Sold').length}</div>
              <div className="text-sm text-gray-500">Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(properties.reduce((sum, p) => sum + p.listingPrice, 0) / properties.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Avg. Price</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as PropertyStatus | 'all')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Expired">Expired</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as PropertyType | 'all')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Single Family">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Multi Family">Multi Family</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                </select>
                
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Prices</option>
                  <option value="under500k">Under $500K</option>
                  <option value="500k-1m">$500K - $1M</option>
                  <option value="over1m">Over $1M</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredProperties.length} of {properties.length} properties
            </div>
          </div>
        </div>

            {/* Properties Table */}
            <div className="flex-1 bg-gray-50 p-6">
              <div className="overflow-x-auto">
                <CRMHubDataTable
                  data={filteredProperties}
                  columns={columns}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Property Detail Panel */}
          {selectedProperty && (
            <PropertyDetailPanel
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
              onUpdate={() => fetchProperties()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Property Detail Panel Component
const PropertyDetailPanel: React.FC<{
  property: Property
  onClose: () => void
  onUpdate: () => void
}> = ({ property, onClose, onUpdate }) => {
  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Property Images */}
        <div className="px-6 py-4 border-b border-gray-200">
          {property.images && property.images.length > 0 ? (
            <div className="space-y-2">
              <img
                src={property.images[0]}
                alt={property.address}
                className="w-full h-48 rounded-lg object-cover"
              />
              {property.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {property.images.slice(1, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.address} ${index + 2}`}
                      className="h-16 rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {getPropertyTypeIcon(property.propertyType)}
              <span className="text-sm font-medium text-gray-600">{property.propertyType}</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{property.address}</h4>
            <p className="text-gray-600">{property.city}, {property.state} {property.zipCode}</p>
            
            <div className="mt-4">
              <div className="flex items-center space-x-1 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">
                  ${property.listingPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                ${Math.round(property.listingPrice / property.squareFootage)}/sq ft
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Status</h5>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getPropertyStatusStyle(property.status)}`}>
              {property.status}
            </span>
          </div>

          {/* Property Details */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Property Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Bedrooms</span>
                <div className="font-medium">{property.bedrooms}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Bathrooms</span>
                <div className="font-medium">{property.bathrooms}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Square Footage</span>
                <div className="font-medium">{property.squareFootage.toLocaleString()} sq ft</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Year Built</span>
                <div className="font-medium">{property.yearBuilt}</div>
              </div>
            </div>
          </div>

          {/* MLS Information */}
          {property.mlsNumber && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">MLS Information</h5>
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-sm font-medium text-blue-900">MLS #{property.mlsNumber}</span>
              </div>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Features</h5>
              <div className="space-y-1">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <TagIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-700">{property.description}</p>
            </div>
          )}

          {/* Listing Information */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Listing Information</h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Listed:</span>
                <span className="ml-2 font-medium">{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 font-medium">{new Date(property.modifiedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Listing Agent:</span>
                <span className="ml-2 font-medium">Agent #{property.listingAgentId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Edit Property
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to get property type icon (moved outside component for reuse)
function getPropertyTypeIcon(type: PropertyType) {
  switch (type) {
    case 'Single Family':
      return <HomeIcon className="h-4 w-4 text-blue-500" />
    case 'Condo':
    case 'Townhouse':
      return <BuildingOfficeIcon className="h-4 w-4 text-green-500" />
    case 'Multi Family':
      return <BuildingOfficeIcon className="h-4 w-4 text-purple-500" />
    case 'Commercial':
      return <BuildingOfficeIcon className="h-4 w-4 text-orange-500" />
    case 'Land':
      return <TagIcon className="h-4 w-4 text-brown-500" />
    default:
      return <HomeIcon className="h-4 w-4 text-gray-500" />
  }
}

// Mock data for development
const mockProperties: Property[] = [
  {
    id: '1',
    address: '123 Maple Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    propertyType: 'Single Family',
    listingPrice: 750000,
    squareFootage: 2400,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2018,
    description: 'Beautiful modern home with open floor plan, updated kitchen, and spacious backyard. Perfect for families.',
    features: ['Updated Kitchen', 'Hardwood Floors', 'Two-Car Garage', 'Fenced Yard', 'Energy Efficient'],
    images: [
      'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=300',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150'
    ],
    status: 'Active',
    mlsNumber: 'MLS123456',
    listingAgentId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    modifiedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    address: '456 Oak Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    propertyType: 'Condo',
    listingPrice: 425000,
    squareFootage: 1200,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2020,
    description: 'Luxury downtown condo with stunning city views. Modern amenities and walkable to restaurants and shopping.',
    features: ['City Views', 'Granite Countertops', 'In-Unit Laundry', 'Fitness Center', 'Rooftop Deck'],
    images: [
      'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=300',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150'
    ],
    status: 'Under Contract',
    mlsNumber: 'MLS789012',
    listingAgentId: '2',
    createdAt: '2024-01-10T14:00:00Z',
    modifiedAt: '2024-01-25T09:15:00Z'
  },
  {
    id: '3',
    address: '789 Pine Road',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    propertyType: 'Townhouse',
    listingPrice: 580000,
    squareFootage: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    yearBuilt: 2019,
    description: 'Spacious townhouse in desirable neighborhood. Recently renovated with modern finishes throughout.',
    features: ['Renovated Kitchen', 'Attached Garage', 'Private Patio', 'Storage Space'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300'
    ],
    status: 'Sold',
    mlsNumber: 'MLS345678',
    listingAgentId: '1',
    createdAt: '2024-01-08T11:00:00Z',
    modifiedAt: '2024-01-28T16:45:00Z'
  }
]

export default Properties
