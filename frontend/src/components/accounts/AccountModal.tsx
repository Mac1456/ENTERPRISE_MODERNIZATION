import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Account } from '../../types'
import { apiService } from '../../services/api'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAmericasIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['Customer', 'Prospect', 'Partner', 'Investor'], {
    required_error: 'Account type is required'
  }),
  industry: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  description: z.string().optional(),
  assignedUserId: z.string().min(1, 'Assigned user is required'),
  // Address fields
  billingAddressStreet: z.string().optional(),
  billingAddressCity: z.string().optional(),
  billingAddressState: z.string().optional(),
  billingAddressZip: z.string().optional(),
  billingContactName: z.string().optional(),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountModalProps {
  account?: Account | null
  isOpen: boolean
  onClose: () => void
  onSave: (account: Account) => void
}

const AccountModal: React.FC<AccountModalProps> = ({ account, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])

  const isEdit = !!account

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      accountType: 'Prospect',
      industry: '',
      website: '',
      email: '',
      phone: '',
      description: '',
      assignedUserId: '',
      billingAddressStreet: '',
      billingAddressCity: '',
      billingAddressState: '',
      billingAddressZip: '',
      billingContactName: '',
    }
  })

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      if (account) {
        populateForm(account)
      } else {
        reset()
      }
    }
  }, [isOpen, account, reset])

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

  const populateForm = (account: Account) => {
    setValue('name', account.name)
    setValue('accountType', account.accountType)
    setValue('industry', account.industry || '')
    setValue('website', account.website || '')
    setValue('email', account.email || '')
    setValue('phone', account.phone || '')
    setValue('description', account.description || '')
    setValue('assignedUserId', account.assignedUserId)
    setValue('billingAddressStreet', account.billingAddressStreet || '')
    setValue('billingAddressCity', account.billingAddressCity || '')
    setValue('billingAddressState', account.billingAddressState || '')
    setValue('billingAddressZip', account.billingAddressZip || '')
    setValue('billingContactName', account.billingContactName || '')
  }

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true)
    try {
      const accountData: Partial<Account> = {
        name: data.name,
        accountType: data.accountType,
        industry: data.industry,
        website: data.website,
        email: data.email,
        phone: data.phone,
        description: data.description,
        assignedUserId: data.assignedUserId,
        assignedUserName: users.find(u => u.id === data.assignedUserId)?.name || '',
        billingAddressStreet: data.billingAddressStreet,
        billingAddressCity: data.billingAddressCity,
        billingAddressState: data.billingAddressState,
        billingAddressZip: data.billingAddressZip,
        billingContactName: data.billingContactName,
        opportunityCount: account?.opportunityCount || 0,
        opportunityValue: account?.opportunityValue || 0,
      }

      let savedAccount: Account
      if (isEdit && account) {
        const response = await apiService.put<{success: boolean, data: Account}>(`/accounts/${account.id}`, accountData)
        savedAccount = response.data
        toast.success('Account updated successfully')
      } else {
        const response = await apiService.post<{success: boolean, data: Account}>('/accounts', accountData)
        savedAccount = response.data
        toast.success('Account created successfully')
      }

      onSave(savedAccount)
      onClose()
    } catch (error) {
      console.error('Error saving account:', error)
      toast.error(isEdit ? 'Failed to update account' : 'Failed to create account')
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
              {isEdit ? 'Edit Account' : 'Create New Account'}
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
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    {...register('accountType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Partner">Partner</option>
                    <option value="Investor">Investor</option>
                  </select>
                  {errors.accountType && (
                    <p className="text-red-500 text-xs mt-1">{errors.accountType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    {...register('industry')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    {...register('website')}
                    placeholder="example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
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
                    Phone
                  </label>
                  <input
                    {...register('phone')}
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

            {/* Billing Address */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Billing Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    {...register('billingAddressStreet')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    {...register('billingAddressCity')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    {...register('billingAddressState')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    {...register('billingAddressZip')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Contact Name
                  </label>
                  <input
                    {...register('billingContactName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

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
                {loading ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AccountModal
