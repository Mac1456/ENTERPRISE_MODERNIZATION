import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Contact, PropertyType, BuyerProfile, SellerProfile } from '../../types'
import { apiService } from '../../services/api'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  mobile: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  accountName: z.string().optional(),
  assignedUserId: z.string().min(1, 'Assigned user is required'),
  // Buyer profile
  isBuyer: z.boolean(),
  preApprovalAmount: z.number().optional(),
  downPayment: z.number().optional(),
  preferredPropertyTypes: z.array(z.string()).optional(),
  mustHaveFeatures: z.string().optional(),
  dealBreakers: z.string().optional(),
  // Seller profile
  isSeller: z.boolean(),
  reasonForSelling: z.string().optional(),
  timeframe: z.string().optional(),
  expectedPrice: z.number().optional(),
  propertiesToSell: z.string().optional(),
  // Other fields
  preferredLocations: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactModalProps {
  contact?: Contact | null
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Contact) => void
}

const ContactModal: React.FC<ContactModalProps> = ({ contact, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])

  const isEdit = !!contact

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobile: '',
      title: '',
      description: '',
      accountName: '',
      assignedUserId: '',
      isBuyer: false,
      isSeller: false,
      preferredLocations: '',
      budgetMin: 0,
      budgetMax: 0,
    }
  })

  const isBuyer = watch('isBuyer')
  const isSeller = watch('isSeller')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      if (contact) {
        populateForm(contact)
      } else {
        reset()
      }
    }
  }, [isOpen, contact, reset])

  const fetchUsers = async () => {
    try {
      const response = await apiService.get<{success: boolean, data: any[]}>('/users')
      const userData = response.data || []
      setUsers(userData.map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
      })))
    } catch (error) {
      console.error('Error fetching users:', error)
      // Set default user for demo
      setUsers([{ id: '1', name: 'Demo User' }])
    }
  }

  const populateForm = (contact: Contact) => {
    setValue('firstName', contact.firstName)
    setValue('lastName', contact.lastName)
    setValue('email', contact.email)
    setValue('phone', contact.phone)
    setValue('mobile', contact.mobile || '')
    setValue('title', contact.title || '')
    setValue('description', contact.description || '')
    setValue('accountName', contact.accountName || '')
    setValue('assignedUserId', contact.assignedUserId)
    setValue('isBuyer', !!contact.buyerProfile)
    setValue('isSeller', !!contact.sellerProfile)
    setValue('preferredLocations', contact.preferredLocations?.join(', ') || '')
    setValue('budgetMin', contact.budget?.min || 0)
    setValue('budgetMax', contact.budget?.max || 0)

    if (contact.buyerProfile) {
      setValue('preApprovalAmount', contact.buyerProfile.preApprovalAmount || 0)
      setValue('downPayment', contact.buyerProfile.downPayment || 0)
      setValue('preferredPropertyTypes', contact.buyerProfile.preferredPropertyTypes || [])
      setValue('mustHaveFeatures', contact.buyerProfile.mustHaveFeatures?.join(', ') || '')
      setValue('dealBreakers', contact.buyerProfile.dealBreakers?.join(', ') || '')
    }

    if (contact.sellerProfile) {
      setValue('reasonForSelling', contact.sellerProfile.reasonForSelling || '')
      setValue('timeframe', contact.sellerProfile.timeframe || '')
      setValue('expectedPrice', contact.sellerProfile.expectedPrice || 0)
      setValue('propertiesToSell', contact.sellerProfile.propertiesToSell?.join(', ') || '')
    }
  }

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)
    try {
      const contactData: Partial<Contact> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        title: data.title,
        description: data.description,
        accountName: data.accountName,
        assignedUserId: data.assignedUserId,
        assignedUserName: users.find(u => u.id === data.assignedUserId)?.name || '',
        propertyInterests: contact?.propertyInterests || [],
        preferredLocations: data.preferredLocations ? data.preferredLocations.split(',').map(l => l.trim()) : [],
        budget: (data.budgetMin || data.budgetMax) ? {
          min: data.budgetMin || 0,
          max: data.budgetMax || 0
        } : undefined,
      }

      // Add buyer profile if checked
      if (data.isBuyer) {
        contactData.buyerProfile = {
          preApprovalAmount: data.preApprovalAmount,
          downPayment: data.downPayment,
          preferredPropertyTypes: (data.preferredPropertyTypes || []) as PropertyType[],
          mustHaveFeatures: data.mustHaveFeatures ? data.mustHaveFeatures.split(',').map(f => f.trim()) : [],
          dealBreakers: data.dealBreakers ? data.dealBreakers.split(',').map(d => d.trim()) : []
        }
      }

      // Add seller profile if checked
      if (data.isSeller) {
        contactData.sellerProfile = {
          reasonForSelling: data.reasonForSelling || '',
          timeframe: data.timeframe || '',
          expectedPrice: data.expectedPrice,
          propertiesToSell: data.propertiesToSell ? data.propertiesToSell.split(',').map(p => p.trim()) : []
        }
      }

      let savedContact: Contact
      if (isEdit && contact) {
        const response = await apiService.put<{success: boolean, data: Contact}>(`/contacts/${contact.id}`, contactData)
        savedContact = response.data
        toast.success('Contact updated successfully')
      } else {
        const response = await apiService.post<{success: boolean, data: Contact}>('/contacts', contactData)
        savedContact = response.data
        toast.success('Contact created successfully')
      }

      onSave(savedContact)
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error(isEdit ? 'Failed to update contact' : 'Failed to create contact')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90%] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Contact' : 'Create New Contact'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    {...register('mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    {...register('accountName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned User *
                  </label>
                  <select
                    {...register('assignedUserId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  {errors.assignedUserId && (
                    <p className="text-red-500 text-xs mt-1">{errors.assignedUserId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Preferences */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Property Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Locations (comma-separated)
                  </label>
                  <input
                    {...register('preferredLocations')}
                    placeholder="Downtown, Westside, Suburbs North"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Min
                  </label>
                  <input
                    {...register('budgetMin', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Max
                  </label>
                  <input
                    {...register('budgetMax', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Type */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Contact Type</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    {...register('isBuyer')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Buyer</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('isSeller')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Seller</span>
                </label>
              </div>
            </div>

            {/* Buyer Profile */}
            {isBuyer && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Buyer Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pre-approval Amount
                    </label>
                    <input
                      {...register('preApprovalAmount', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Down Payment
                    </label>
                    <input
                      {...register('downPayment', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Must-Have Features (comma-separated)
                    </label>
                    <input
                      {...register('mustHaveFeatures')}
                      placeholder="3+ bedrooms, garage, updated kitchen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Breakers (comma-separated)
                    </label>
                    <input
                      {...register('dealBreakers')}
                      placeholder="busy street, no parking"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Seller Profile */}
            {isSeller && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Seller Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Selling
                    </label>
                    <input
                      {...register('reasonForSelling')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeframe
                    </label>
                    <select
                      {...register('timeframe')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Timeframe</option>
                      <option value="Immediate">Immediate</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="12+ months">12+ months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Price
                    </label>
                    <input
                      {...register('expectedPrice', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Properties to Sell (comma-separated)
                    </label>
                    <input
                      {...register('propertiesToSell')}
                      placeholder="123 Main St, 456 Oak Ave"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Contact' : 'Create Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactModal
