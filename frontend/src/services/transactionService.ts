/**
 * ✅ ACTIVE SERVICE - TRANSACTION PIPELINE MANAGEMENT
 * 
 * Feature 6: Transaction Pipeline Management Service
 * Handles API calls for transactions, opportunities, milestones, and commission tracking
 * Following exact patterns from contactService.ts, leadService.ts, communicationService.ts
 */

import { api } from './api'
import type { Opportunity, TransactionMilestone } from '@/types'

export interface TransactionFilters {
  stage?: string
  transactionType?: string
  assignedUserId?: string
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface TransactionQuery {
  search?: string
  filters?: TransactionFilters
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CommissionReport {
  id: string
  agentId: string
  agentName: string
  period: string
  totalCommission: number
  paidCommission: number
  pendingCommission: number
  transactionCount: number
  transactions: Opportunity[]
}

export interface TransactionTask {
  id: string
  transactionId: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  assignedTo: string
  priority: 'low' | 'medium' | 'high'
  category: 'documentation' | 'inspection' | 'financing' | 'closing' | 'other'
}

export interface PipelineStats {
  totalTransactions: number
  activeTransactions: number
  closedThisMonth: number
  totalVolume: number
  averageCloseTime: number
  conversionRate: number
  commissionEarned: number
  pendingCommission: number
}

class TransactionService {
  private baseUrl = '/api/transactions'

  // Core CRUD operations
  async getTransactions(query?: TransactionQuery): Promise<{
    transactions: Opportunity[]
    totalResults: number
    stats: PipelineStats
  }> {
    try {
      const params = new URLSearchParams()
      
      if (query?.search) params.append('search', query.search)
      if (query?.filters?.stage) params.append('stage', query.filters.stage)
      if (query?.filters?.transactionType) params.append('type', query.filters.transactionType)
      if (query?.filters?.assignedUserId) params.append('assigned_user_id', query.filters.assignedUserId)
      if (query?.sortBy) params.append('sort_by', query.sortBy)
      if (query?.sortOrder) params.append('sort_order', query.sortOrder)
      if (query?.page) params.append('page', query.page.toString())
      if (query?.limit) params.append('limit', query.limit.toString())

      const response = await api.get(`${this.baseUrl}?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async getTransaction(id: string): Promise<Opportunity> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching transaction:', error)
      throw error
    }
  }

  async createTransaction(transaction: Partial<Opportunity>): Promise<Opportunity> {
    try {
      const response = await api.post(this.baseUrl, transaction)
      return response.data
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  async updateTransaction(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  // Transaction stage management
  async updateTransactionStage(id: string, stage: string, data?: any): Promise<Opportunity> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/stage`, { stage, ...data })
      return response.data
    } catch (error) {
      console.error('Error updating transaction stage:', error)
      throw error
    }
  }

  // Milestone management
  async getMilestones(transactionId: string): Promise<TransactionMilestone[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${transactionId}/milestones`)
      return response.data
    } catch (error) {
      console.error('Error fetching milestones:', error)
      throw error
    }
  }

  async updateMilestone(transactionId: string, milestoneId: string, updates: Partial<TransactionMilestone>): Promise<TransactionMilestone> {
    try {
      const response = await api.put(`${this.baseUrl}/${transactionId}/milestones/${milestoneId}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating milestone:', error)
      throw error
    }
  }

  async completeMilestone(transactionId: string, milestoneId: string): Promise<TransactionMilestone> {
    try {
      const response = await api.post(`${this.baseUrl}/${transactionId}/milestones/${milestoneId}/complete`)
      return response.data
    } catch (error) {
      console.error('Error completing milestone:', error)
      throw error
    }
  }

  // Task management
  async getTasks(transactionId: string): Promise<TransactionTask[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${transactionId}/tasks`)
      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  async createTask(transactionId: string, task: Partial<TransactionTask>): Promise<TransactionTask> {
    try {
      const response = await api.post(`${this.baseUrl}/${transactionId}/tasks`, task)
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  async updateTask(transactionId: string, taskId: string, updates: Partial<TransactionTask>): Promise<TransactionTask> {
    try {
      const response = await api.put(`${this.baseUrl}/${transactionId}/tasks/${taskId}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  async completeTask(transactionId: string, taskId: string): Promise<TransactionTask> {
    try {
      const response = await api.post(`${this.baseUrl}/${transactionId}/tasks/${taskId}/complete`)
      return response.data
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }

  // Commission tracking
  async getCommissionReport(agentId?: string, period?: string): Promise<CommissionReport[]> {
    try {
      const params = new URLSearchParams()
      if (agentId) params.append('agent_id', agentId)
      if (period) params.append('period', period)

      const response = await api.get(`${this.baseUrl}/commission?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching commission report:', error)
      throw error
    }
  }

  async updateCommissionStatus(transactionId: string, status: 'pending' | 'paid'): Promise<Opportunity> {
    try {
      const response = await api.post(`${this.baseUrl}/${transactionId}/commission`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating commission status:', error)
      throw error
    }
  }

  // Pipeline analytics
  async getPipelineStats(filters?: TransactionFilters): Promise<PipelineStats> {
    try {
      const params = new URLSearchParams()
      if (filters?.assignedUserId) params.append('assigned_user_id', filters.assignedUserId)
      if (filters?.dateRange?.start) params.append('start_date', filters.dateRange.start)
      if (filters?.dateRange?.end) params.append('end_date', filters.dateRange.end)

      const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching pipeline stats:', error)
      throw error
    }
  }

  // Bulk operations
  async bulkUpdateStage(transactionIds: string[], stage: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/bulk/stage`, { transaction_ids: transactionIds, stage })
    } catch (error) {
      console.error('Error bulk updating stage:', error)
      throw error
    }
  }

  async bulkAssign(transactionIds: string[], assignedUserId: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/bulk/assign`, { transaction_ids: transactionIds, assigned_user_id: assignedUserId })
    } catch (error) {
      console.error('Error bulk assigning transactions:', error)
      throw error
    }
  }
}

export const TransactionService = new TransactionService()
