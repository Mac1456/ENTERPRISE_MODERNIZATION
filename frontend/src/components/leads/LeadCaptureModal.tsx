import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { XMarkIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { LeadService } from '@/services/leadService'
import { LeadCaptureForm, PropertyType } from '@/types'

// Form validation schema
const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  propertyType: z.enum(['Single Family', 'Condo', 'Townhouse', 'Multi Family', 'Commercial', 'Land']),
  budget: z.object({
    min: z.number().min(0, 'Minimum budget must be positive'),
    max: z.number().min(0, 'Maximum budget must be positive'),
  }).refine(data => data.max >= data.min, {
    message: 'Maximum budget must be greater than or equal to minimum',
    path: ['max']
  }),
  preferredLocation: z.string().min(1, 'Preferred location is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  source: z.string().min(1, 'Lead source is required'),
  notes: z.string().optional(),
})

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<LeadCaptureForm>
}

const propertyTypes: PropertyType[] = [
  'Single Family', 'Condo', 'Townhouse', 'Multi Family', 'Commercial', 'Land'
]

const timelineOptions = [
  'Immediately',
  'Within 30 days',
  'Within 3 months',
  'Within 6 months',
  'Within 1 year',
  'Just browsing'
]

const leadSources = [
  'Website',
  'Referral',
  'Social Media',
  'Google Ads',
  'Facebook Ads',
  'Open House',
  'Cold Call',
  'Email Campaign',
  'Zillow',
  'Realtor.com',
  'Other'
]

export default function LeadCaptureModal({ isOpen, onClose, initialData }: LeadCaptureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<LeadCaptureForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyType: 'Single Family',
      budget: { min: 100000, max: 500000 },
      preferredLocation: '',
      timeline: 'Within 3 months',
      source: 'Website',
      notes: '',
      ...initialData
    }
  })

  const createLeadMutation = useMutation({
    mutationFn: LeadService.createLead,
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(`Lead "${newLead.firstName} ${newLead.lastName}" created successfully!`)
      reset()
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create lead')
    }
  })

  const onSubmit = async (data: LeadCaptureForm) => {
    setIsSubmitting(true)
    try {
      await createLeadMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-detect location if geolocation is available
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you'd use a geocoding service here
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            )
            const data = await response.json()
            const location = `${data.city}, ${data.principalSubdivision}`
            setValue('preferredLocation', location)
            toast.success('Location detected!')
          } catch (error) {
            toast.error('Failed to detect location')
          }
        },
        () => {
          toast.error('Location access denied')
        }
      )
    } else {
      toast.error('Geolocation not supported')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      Capture New Lead
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          {...register('firstName')}
                          className="input-field"
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          {...register('lastName')}
                          className="input-field"
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          className="input-field"
                          placeholder="Enter email address"
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone *
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          className="input-field"
                          placeholder="Enter phone number"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Property Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Type *
                      </label>
                      <select {...register('propertyType')} className="input-field">
                        {propertyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                          <div className="relative">
                            <CurrencyDollarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                              {...register('budget.min', { valueAsNumber: true })}
                              type="number"
                              className="input-field pl-10"
                              placeholder="100,000"
                              step="1000"
                            />
                          </div>
                          {errors.budget?.min && (
                            <p className="text-red-600 text-sm mt-1">{errors.budget.min.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                          <div className="relative">
                            <CurrencyDollarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                              {...register('budget.max', { valueAsNumber: true })}
                              type="number"
                              className="input-field pl-10"
                              placeholder="500,000"
                              step="1000"
                            />
                          </div>
                          {errors.budget?.max && (
                            <p className="text-red-600 text-sm mt-1">{errors.budget.max.message}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Range: {formatCurrency(watch('budget.min') || 0)} - {formatCurrency(watch('budget.max') || 0)}
                      </p>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Location *
                      </label>
                      <div className="relative">
                        <input
                          {...register('preferredLocation')}
                          className="input-field pr-10"
                          placeholder="Enter city, neighborhood, or area"
                        />
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          <MapPinIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {errors.preferredLocation && (
                        <p className="text-red-600 text-sm mt-1">{errors.preferredLocation.message}</p>
                      )}
                    </div>

                    {/* Timeline and Source */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeline *
                        </label>
                        <select {...register('timeline')} className="input-field">
                          {timelineOptions.map(timeline => (
                            <option key={timeline} value={timeline}>{timeline}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lead Source *
                        </label>
                        <select {...register('source')} className="input-field">
                          {leadSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        className="input-field"
                        placeholder="Any additional information about the lead..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Lead'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
