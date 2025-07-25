import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TransactionMilestone } from '../../types'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const milestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  assignedTo: z.string().min(1, 'Assigned user is required'),
  completed: z.boolean()
})

type MilestoneFormData = z.infer<typeof milestoneSchema>

interface MilestoneModalProps {
  milestone?: TransactionMilestone | null
  isOpen: boolean
  onClose: () => void
  onSave: (milestone: Partial<TransactionMilestone>) => void
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ 
  milestone, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false)
  const [users] = useState([
    { id: 'agent', name: 'Real Estate Agent' },
    { id: 'inspector', name: 'Inspector' },
    { id: 'lender', name: 'Lender' },
    { id: 'title', name: 'Title Company' },
    { id: 'photographer', name: 'Photography Team' }
  ])

  const isEdit = !!milestone

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: '',
      description: '',
      dueDate: '',
      assignedTo: '',
      completed: false
    }
  })

  const completed = watch('completed')

  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        populateForm(milestone)
      } else {
        reset()
      }
    }
  }, [isOpen, milestone, reset])

  const populateForm = (milestone: TransactionMilestone) => {
    setValue('name', milestone.name)
    setValue('description', milestone.description)
    setValue('dueDate', milestone.dueDate.split('T')[0])
    setValue('assignedTo', milestone.assignedTo)
    setValue('completed', milestone.completed)
  }

  const onSubmit = async (data: MilestoneFormData) => {
    setLoading(true)
    try {
      const milestoneData: Partial<TransactionMilestone> = {
        id: milestone?.id || `milestone_${Date.now()}`,
        name: data.name,
        description: data.description,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo,
        completed: data.completed,
        completedDate: data.completed ? new Date().toISOString() : undefined
      }

      onSave(milestoneData)
      toast.success(isEdit ? 'Milestone updated successfully' : 'Milestone created successfully')
      onClose()
    } catch (error) {
      console.error('Error saving milestone:', error)
      toast.error(isEdit ? 'Failed to update milestone' : 'Failed to create milestone')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Milestone' : 'Create New Milestone'}
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
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Milestone Details
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Milestone Name *
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Home Inspection"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed description of the milestone..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Due Date *
                    </label>
                    <input
                      {...register('dueDate')}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      Assigned To *
                    </label>
                    <select
                      {...register('assignedTo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Assignee</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                    {errors.assignedTo && (
                      <p className="text-red-500 text-xs mt-1">{errors.assignedTo.message}</p>
                    )}
                  </div>
                </div>

                {/* Completion Status */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    {...register('completed')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className={`h-5 w-5 ${completed ? 'text-green-600' : 'text-gray-400'}`} />
                    <label className="text-sm font-medium text-gray-700">
                      Mark as completed
                    </label>
                  </div>
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
                {loading ? 'Saving...' : isEdit ? 'Update Milestone' : 'Create Milestone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MilestoneModal
