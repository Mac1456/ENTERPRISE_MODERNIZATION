import React, { useState, useEffect } from 'react'
import { Property, PropertyType, PropertyStatus } from '../../types'
import { apiService } from '../../services/api'
import {
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface PropertyModalProps {
  property?: Property | null
  isOpen: boolean
  onClose: () => void
  onSave: (property: Property) => void
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'Single Family' as PropertyType,
    listingPrice: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    description: '',
    features: [] as string[],
    newFeature: '',
    status: 'Active' as PropertyStatus,
    mlsNumber: '',
    listingAgentId: '1'
  })

  useEffect(() => {
    if (isOpen) {
      if (property) {
        setFormData({
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          propertyType: property.propertyType,
          listingPrice: property.listingPrice.toString(),
          squareFootage: property.squareFootage.toString(),
          bedrooms: property.bedrooms.toString(),
          bathrooms: property.bathrooms.toString(),
          yearBuilt: property.yearBuilt.toString(),
          description: property.description || '',
          features: property.features || [],
          newFeature: '',
          status: property.status,
          mlsNumber: property.mlsNumber || '',
          listingAgentId: property.listingAgentId
        })
        setImageUrls(property.images || [])
      } else {
        // Reset form for new property
        setFormData({
          address: '',
          city: '',
          state: '',
          zipCode: '',
          propertyType: 'Single Family',
          listingPrice: '',
          squareFootage: '',
          bedrooms: '',
          bathrooms: '',
          yearBuilt: '',
          description: '',
          features: [],
          newFeature: '',
          status: 'Active',
          mlsNumber: '',
          listingAgentId: '1'
        })
        setImageUrls([])
      }
      setNewImageUrl('')
    }
  }, [isOpen, property])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) return

    setLoading(true)
    try {
      const propertyData: Property = {
        id: property?.id || `property-${Date.now()}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        propertyType: formData.propertyType,
        listingPrice: parseFloat(formData.listingPrice) || 0,
        squareFootage: parseInt(formData.squareFootage) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 0,
        yearBuilt: parseInt(formData.yearBuilt) || new Date().getFullYear(),
        description: formData.description,
        features: formData.features,
        images: imageUrls,
        status: formData.status,
        mlsNumber: formData.mlsNumber,
        listingAgentId: formData.listingAgentId,
        createdAt: property?.createdAt || new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      }

      if (property) {
        await apiService.put(`/properties/${property.id}`, propertyData)
      } else {
        await apiService.post('/properties', propertyData)
      }

      onSave(propertyData)
      onClose()
    } catch (error) {
      console.error('Error saving property:', error)
      alert('Error saving property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImageUrl = (url: string) => {
    setImageUrls(imageUrls.filter(img => img !== url))
  }

  const addFeature = () => {
    if (formData.newFeature.trim() && !formData.features.includes(formData.newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.newFeature.trim()],
        newFeature: ''
      })
    }
  }

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature)
    })
  }

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case 'Single Family':
        return <HomeIcon className="h-5 w-5" />
      case 'Condo':
      case 'Townhouse':
      case 'Multi Family':
      case 'Commercial':
        return <BuildingOfficeIcon className="h-5 w-5" />
      default:
        return <HomeIcon className="h-5 w-5" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getPropertyTypeIcon(formData.propertyType)}
            <h2 className="text-xl font-bold text-gray-900">
              {property ? 'Edit Property' : 'Add New Property'}
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
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter state"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ZIP code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Single Family">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Multi Family">Multi Family</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Price ($)
                </label>
                <input
                  type="number"
                  value={formData.listingPrice}
                  onChange={(e) => setFormData({ ...formData, listingPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  value={formData.squareFootage}
                  onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2024"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* MLS Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">MLS Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MLS Number
                </label>
                <input
                  type="text"
                  value={formData.mlsNumber}
                  onChange={(e) => setFormData({ ...formData, mlsNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter MLS number"
                />
              </div>
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
              placeholder="Enter property description"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={formData.newFeature}
                onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter feature"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading || !formData.address.trim() || !formData.city.trim() || !formData.state.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PropertyModal
