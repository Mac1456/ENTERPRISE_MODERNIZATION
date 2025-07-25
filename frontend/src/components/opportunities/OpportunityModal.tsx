import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Opportunity, Account, Contact } from '../../types'
import { apiService } from '../../services/api'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const opportunitySchema = z.object({
  name: z.string().min(1, 'Opportunity name is required'),
  accountId: z.string().min(1, 'Account is required'),
  contactId: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  salesStage: z.enum(['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], {
    required_error: 'Sales stage is required'
  }),
  probability: z.number().min(0).max(100, 'Probability must be between 0 and 100'),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  description: z.string().optional(),
  assignedUserId: z.string().min(1, 'Assigned user is required'),
  transactionType: z.enum(['Sale', 'Purchase', 'Lease', 'Rental'], {
    required_error: 'Transaction type is required'
  }),
  commissionRate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100'),
})

type OpportunityFormData = z.infer<typeof opportunitySchema>

interface OpportunityModalProps {
  opportunity?: Opportunity | null
  accountId?: string
  isOpen: boolean
  onClose: () => void
  onSave: (opportunity: Opportunity) => void
}

const OpportunityModal: React.FC<OpportunityModalProps> = ({ 
  opportunity, 
  accountId, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  const isEdit = !!opportunity

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: '',
      accountId: accountId || '',
      contactId: '',
      amount: 0,
      salesStage: 'Prospecting',
      probability: 10,
      expectedCloseDate: '',
      description: '',
      assignedUserId: '',
      transactionType: 'Sale',
      commissionRate: 3,
    }
  })

  const selectedAccountId = watch('accountId')
  const salesStage = watch('salesStage')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchAccounts()
      if (opportunity) {
        populateForm(opportunity)
      } else {
        reset()
        if (accountId) {
          setValue('accountId', accountId)
        }
      }
    }
  }, [isOpen, opportunity, accountId, reset])

  useEffect(() => {
    if (selectedAccountId) {
      fetchContactsForAccount(selectedAccountId)
    }
  }, [selectedAccountId])

  useEffect(() => {
    // Auto-update probability based on sales stage
    const stageProbabilities = {
      'Prospecting': 10,
      'Qualification': 25,
      'Proposal': 50,
      'Negotiation': 75,
      'Closed Won': 100,
      'Closed Lost': 0
    }
    setValue('probability', stageProbabilities[salesStage])
  }, [salesStage, setValue])

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
      setUsers([{ id: '1', name: 'Demo User' }])
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await apiService.get<{success: boolean, data: Account[]}>('/accounts')
      setAccounts(response.data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setAccounts([])
    }
  }

  const fetchContactsForAccount = async (accountId: string) => {
    try {
      const response = await apiService.get<{success: boolean, data: Contact[]}>(`/contacts?accountId=${accountId}`)
      setContacts(response.data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
    }
  }

  const populateForm = (opportunity: Opportunity) => {
    setValue('name', opportunity.name)
    setValue('accountId', opportunity.accountId)
    setValue('contactId', opportunity.contactId || '')
    setValue('amount', opportunity.amount)
    setValue('salesStage', opportunity.salesStage)
    setValue('probability', opportunity.probability)
    setValue('expectedCloseDate', opportunity.expectedCloseDate.split('T')[0])
    setValue('description', opportunity.description || '')
    setValue('assignedUserId', opportunity.assignedUserId)
    setValue('transactionType', opportunity.transactionType)
    setValue('commissionRate', opportunity.commission.rate)
  }

  const onSubmit = async (data: OpportunityFormData) => {
    setLoading(true)
    try {
      const opportunityData: Partial<Opportunity> = {
        name: data.name,
        accountId: data.accountId,
        contactId: data.contactId || undefined,
        amount: data.amount,
        salesStage: data.salesStage,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate,
        description: data.description,
        assignedUserId: data.assignedUserId,
        assignedUserName: users.find(u => u.id === data.assignedUserId)?.name || '',
        transactionType: data.transactionType,
        commission: {
          rate: data.commissionRate,
          amount: (data.amount * data.commissionRate) / 100
        },
        milestones: opportunity?.milestones || []
      }

      let savedOpportunity: Opportunity
      if (isEdit && opportunity) {
        const response = await apiService.put<{success: boolean, data: Opportunity}>(`/opportunities/${opportunity.id}`, opportunityData)
        savedOpportunity = response.data
        toast.success('Opportunity updated successfully')
      } else {
        const response = await apiService.post<{success: boolean, data: Opportunity}>('/opportunities', opportunityData)
        savedOpportunity = response.data
        toast.success('Opportunity created successfully')
      }

      onSave(savedOpportunity)
      onClose()
    } catch (error) {
      console.error('Error saving opportunity:', error)
      toast.error(isEdit ? 'Failed to update opportunity' : 'Failed to create opportunity')
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
              {isEdit ? 'Edit Opportunity' : 'Create New Opportunity'}
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
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opportunity Name *
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
                    Account *
                  </label>
                  <select
                    {...register('accountId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                  {errors.accountId && (
                    <p className="text-red-500 text-xs mt-1">{errors.accountId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <select
                    {...register('contactId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    {...register('transactionType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Sale">Sale</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Lease">Lease</option>
                    <option value="Rental">Rental</option>
                  </select>
                  {errors.transactionType && (
                    <p className="text-red-500 text-xs mt-1">{errors.transactionType.message}</p>
                  )}
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
              </div>
            </div>

            {/* Sales Information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Sales Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Stage *
                  </label>
                  <select
                    {...register('salesStage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Prospecting">Prospecting</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                  {errors.salesStage && (
                    <p className="text-red-500 text-xs mt-1">{errors.salesStage.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability (%) *
                  </label>
                  <input
                    {...register('probability', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.probability && (
                    <p className="text-red-500 text-xs mt-1">{errors.probability.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Close Date *
                  </label>
                  <input
                    {...register('expectedCloseDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.expectedCloseDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.expectedCloseDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Rate (%) *
                  </label>
                  <input
                    {...register('commissionRate', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.commissionRate && (
                    <p className="text-red-500 text-xs mt-1">{errors.commissionRate.message}</p>
                  )}
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
                {loading ? 'Saving...' : isEdit ? 'Update Opportunity' : 'Create Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OpportunityModal
