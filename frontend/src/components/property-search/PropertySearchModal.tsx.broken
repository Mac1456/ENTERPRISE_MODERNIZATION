/**
 * ✅ ACTIVE COMPONENT - Property Search Modal
 * 
 * Modal for advanced property search with filters
 * Following patterns from other modal components
 * Last updated: Initial implementation - 2024-07-27
 */

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  HomeIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

import { PropertySearchQuery, PropertySearchFilters, SearchFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PropertySearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: PropertySearchQuery) => void
  currentFilters: PropertySearchFilters
  searchFilters?: SearchFilters
  isLoading?: boolean
}

export default function PropertySearchModal({
  isOpen,
  onClose,
  onSearch,
  currentFilters,
  searchFilters,
  isLoading = false
}: PropertySearchModalProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<PropertySearchFilters>(currentFilters)

  const handleSearch = () => {
    onSearch({ query, filters })
    onClose()
  }

  const handleReset = () => {
    setQuery('')
    setFilters({})
  }

  const updateFilter = (key: keyof PropertySearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleFeature = (feature: string) => {
    const currentFeatures = filters.features || []
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    
    updateFilter('features', updatedFeatures)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as=\"div\" className=\"relative z-50\" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter=\"ease-out duration-300\"
          enterFrom=\"opacity-0\"
          enterTo=\"opacity-100\"
          leave=\"ease-in duration-200\"
          leaveFrom=\"opacity-100\"
          leaveTo=\"opacity-0\"
        >
          <div className=\"fixed inset-0 bg-black bg-opacity-25\" />
        </Transition.Child>

        <div className=\"fixed inset-0 overflow-y-auto\">
          <div className=\"flex min-h-full items-center justify-center p-4 text-center\">
            <Transition.Child
              as={Fragment}
              enter=\"ease-out duration-300\"
              enterFrom=\"opacity-0 scale-95\"
              enterTo=\"opacity-100 scale-100\"
              leave=\"ease-in duration-200\"
              leaveFrom=\"opacity-100 scale-100\"
              leaveTo=\"opacity-0 scale-95\"
            >
              <Dialog.Panel className=\"w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all\">
                <div className=\"flex items-center justify-between mb-6\">
                  <div className=\"flex items-center space-x-3\">
                    <div className=\"w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center\">
                      <MagnifyingGlassIcon className=\"w-5 h-5 text-blue-600\" />
                    </div>
                    <div>
                      <Dialog.Title className=\"text-lg font-medium text-gray-900\">
                        Advanced Property Search
                      </Dialog.Title>
                      <p className=\"text-sm text-gray-500\">
                        Search properties with advanced filters and criteria
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className=\"rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\"
                  >
                    <XMarkIcon className=\"h-6 w-6\" />
                  </button>
                </div>

                <div className=\"space-y-6\">
                  {/* Search Query */}
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                      Search Query
                    </label>
                    <div className=\"relative\">
                      <MagnifyingGlassIcon className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5\" />
                      <input
                        type=\"text\"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder=\"Search by location, features, or keywords...\"
                        className=\"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500\"
                      />
                    </div>
                  </div>

                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                    {/* Price Range */}
                    <Card>
                      <CardHeader>
                        <CardTitle className=\"text-base flex items-center space-x-2\">
                          <CurrencyDollarIcon className=\"w-5 h-5\" />
                          <span>Price Range</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className=\"space-y-4\">
                        <div className=\"grid grid-cols-2 gap-4\">
                          <div>
                            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                              Min Price
                            </label>
                            <input
                              type=\"number\"
                              value={filters.priceMin || ''}
                              onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder=\"$0\"
                              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                            />
                          </div>
                          <div>
                            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                              Max Price
                            </label>
                            <input
                              type=\"number\"
                              value={filters.priceMax || ''}
                              onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder=\"No limit\"
                              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Property Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className=\"text-base flex items-center space-x-2\">
                          <HomeIcon className=\"w-5 h-5\" />
                          <span>Property Details</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className=\"space-y-4\">
                        <div>
                          <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                            Property Type
                          </label>
                          <select
                            value={filters.propertyType || ''}
                            onChange={(e) => updateFilter('propertyType', e.target.value || undefined)}
                            className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                          >
                            <option value=\"\">Any Type</option>
                            {searchFilters?.propertyTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className=\"grid grid-cols-2 gap-4\">
                          <div>
                            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                              Bedrooms
                            </label>
                            <select
                              value={filters.bedrooms || ''}
                              onChange={(e) => updateFilter('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                            >
                              <option value=\"\">Any</option>
                              {searchFilters?.bedrooms.map(bed => (
                                <option key={bed} value={bed}>{bed}+</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                              Bathrooms
                            </label>
                            <select
                              value={filters.bathrooms || ''}
                              onChange={(e) => updateFilter('bathrooms', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                            >
                              <option value=\"\">Any</option>
                              {searchFilters?.bathrooms.map(bath => (
                                <option key={bath} value={bath}>{bath}+</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Square Footage */}
                    <Card>
                      <CardHeader>
                        <CardTitle className=\"text-base\">Square Footage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className=\"grid grid-cols-2 gap-4\">
                          <div>
                            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                              Min Sqft
                            </label>
                            <input
                              type=\"number\"
                              value={filters.sqftMin || ''}
                              onChange={(e) => updateFilter('sqftMin', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder=\"0\"
                              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                            />
                          </div>
                          <div>
                            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                              Max Sqft
                            </label>
                            <input
                              type=\"number\"
                              value={filters.sqftMax || ''}
                              onChange={(e) => updateFilter('sqftMax', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder=\"No limit\"
                              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                      <CardHeader>
                        <CardTitle className=\"text-base flex items-center space-x-2\">
                          <MapPinIcon className=\"w-5 h-5\" />
                          <span>Location</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                            Area
                          </label>
                          <select
                            value={filters.location || ''}
                            onChange={(e) => updateFilter('location', e.target.value || undefined)}
                            className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                          >
                            <option value=\"\">Any Location</option>
                            {searchFilters?.locations.map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className=\"text-base\">Features & Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className=\"grid grid-cols-2 md:grid-cols-4 gap-3\">
                        {searchFilters?.features.map(feature => (
                          <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              filters.features?.includes(feature)
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Year Built */}
                  <Card>
                    <CardHeader>
                      <CardTitle className=\"text-base\">Year Built</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className=\"grid grid-cols-2 gap-4\">
                        <div>
                          <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                            Built After
                          </label>
                          <input
                            type=\"number\"
                            value={filters.yearBuiltMin || ''}
                            onChange={(e) => updateFilter('yearBuiltMin', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder=\"1900\"
                            className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                          />
                        </div>
                        <div>
                          <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                            Built Before
                          </label>
                          <input
                            type=\"number\"
                            value={filters.yearBuiltMax || ''}
                            onChange={(e) => updateFilter('yearBuiltMax', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder={new Date().getFullYear().toString()}
                            className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className=\"flex items-center justify-between pt-6 border-t border-gray-200 mt-6\">
                  <Button
                    onClick={handleReset}
                    variant=\"outline\"
                    className=\"flex items-center space-x-2\"
                  >
                    <span>Reset Filters</span>
                  </Button>
                  <div className=\"flex space-x-3\">
                    <Button
                      onClick={onClose}
                      variant=\"outline\"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className=\"flex items-center space-x-2\"
                    >
                      <MagnifyingGlassIcon className=\"w-4 h-4\" />
                      <span>Search Properties</span>
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
