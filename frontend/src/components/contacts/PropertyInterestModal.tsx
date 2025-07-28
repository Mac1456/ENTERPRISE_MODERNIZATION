import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, HomeIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Contact } from '@/types'

interface PropertyInterestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (interestData: any) => void
  contact: Contact
}

export default function PropertyInterestModal({
  isOpen,
  onClose,
  onSubmit,
  contact
}: PropertyInterestModalProps) {
  const [formData, setFormData] = useState({
    propertyType: '',
    budget: { min: '', max: '' },
    location: '',
    timeline: '',
    priority: 'Medium',
    status: 'Active',
    bedrooms: '',
    bathrooms: '',
    squareFootage: { min: '', max: '' },
    features: [] as string[],
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const interestData = {
      ...formData,
      budget: {
        min: parseInt(formData.budget.min) || 0,
        max: parseInt(formData.budget.max) || 0
      },
      squareFootage: {
        min: parseInt(formData.squareFootage.min) || 0,
        max: parseInt(formData.squareFootage.max) || 0
      },
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseFloat(formData.bathrooms) || 0,
      contactId: contact.id
    }
    
    onSubmit(interestData)
    
    // Reset form
    setFormData({
      propertyType: '',
      budget: { min: '', max: '' },
      location: '',
      timeline: '',
      priority: 'Medium',
      status: 'Active',
      bedrooms: '',
      bathrooms: '',
      squareFootage: { min: '', max: '' },
      features: [],
      notes: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('budget.')) {
      const budgetField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          [budgetField]: value
        }
      }))
    } else if (name.startsWith('squareFootage.')) {
      const sqftField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        squareFootage: {
          ...prev.squareFootage,
          [sqftField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const availableFeatures = [
    'Pool', 'Garage', 'Garden', 'Fireplace', 'Basement', 'Balcony',
    'Walk-in Closet', 'Hardwood Floors', 'Updated Kitchen', 'New Appliances',
    'Security System', 'Laundry Room', 'Home Office', 'Gym'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Add Property Interest for {contact.firstName} {contact.lastName}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Property Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Property Type</option>
                    <option value="Single Family Home">Single Family Home</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Investment Property">Investment Property</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Downtown, Suburbs, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="budget.min"
                      value={formData.budget.min}
                      onChange={handleChange}
                      placeholder="Minimum Budget"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="budget.max"
                      value={formData.budget.max}
                      onChange={handleChange}
                      placeholder="Maximum Budget"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3</option>
                    <option value="3.5">3.5</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Square Footage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="squareFootage.min"
                      value={formData.squareFootage.min}
                      onChange={handleChange}
                      placeholder="Min Sq Ft"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="squareFootage.max"
                      value={formData.squareFootage.max}
                      onChange={handleChange}
                      placeholder="Max Sq Ft"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Timeline</option>
                  <option value="Immediate">Immediate (Within 1 month)</option>
                  <option value="Within 3 months">Within 3 months</option>
                  <option value="Within 6 months">Within 6 months</option>
                  <option value="Within 1 year">Within 1 year</option>
                  <option value="No rush">No specific timeline</option>
                </select>
              </div>

              {/* Desired Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Desired Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableFeatures.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="mr-2"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific requirements or preferences..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Property Interest
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
