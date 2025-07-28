import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ContactCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (contactData: any) => void
}

export default function ContactCaptureModal({
  isOpen,
  onClose,
  onSubmit
}: ContactCaptureModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    title: '',
    company: '',
    description: '',
    propertyType: '',
    budget: { min: '', max: '' },
    preferredLocation: '',
    timeline: '',
    contactType: 'buyer'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const contactData = {
      ...formData,
      budget: {
        min: parseInt(formData.budget.min) || 0,
        max: parseInt(formData.budget.max) || 0
      }
    }
    
    onSubmit(contactData)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobile: '',
      title: '',
      company: '',
      description: '',
      propertyType: '',
      budget: { min: '', max: '' },
      preferredLocation: '',
      timeline: '',
      contactType: 'buyer'
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

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
            <CardTitle>Add New Contact</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Property Interest */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property Interest</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Type
                    </label>
                    <select
                      name="contactType"
                      value={formData.contactType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Single Family Home">Single Family Home</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Investment Property">Investment Property</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        name="budget.min"
                        value={formData.budget.min}
                        onChange={handleChange}
                        placeholder="Min"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        name="budget.max"
                        value={formData.budget.max}
                        onChange={handleChange}
                        placeholder="Max"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes/Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the contact..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Contact
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
