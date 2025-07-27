import { apiService } from './api'
import { Lead, LeadCaptureForm, ApiResponse, PaginatedResponse } from '@/types'

export class LeadService {
  // Get paginated leads
  static async getLeads(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    source?: string
    assignedTo?: string
  } = {}): Promise<PaginatedResponse<Lead>> {
    return apiService.get<ApiResponse<PaginatedResponse<Lead>>>('/leads', params)
      .then(response => response.data)
  }

  // Get single lead
  static async getLead(id: string): Promise<Lead> {
    return apiService.get<ApiResponse<Lead>>(`/leads/${id}`)
      .then(response => response.data)
  }

  // Create new lead
  static async createLead(leadData: LeadCaptureForm): Promise<Lead> {
    return apiService.post<ApiResponse<Lead>>('/leads', leadData)
      .then(response => response.data)
  }

  // Update lead
  static async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    return apiService.put<ApiResponse<Lead>>(`/leads/${id}`, leadData)
      .then(response => response.data)
  }

  // Delete lead
  static async deleteLead(id: string): Promise<void> {
    return apiService.delete(`/leads/${id}`)
  }

  // Convert lead to contact
  static async convertLead(id: string, contactData?: Partial<any>): Promise<{
    contact: any
    account?: any
    opportunity?: any
  }> {
    return apiService.post<ApiResponse<any>>(`/leads/${id}/convert`, contactData)
      .then(response => response.data)
  }

  // Assign lead to user
  static async assignLead(id: string, userId: string): Promise<any> {
    const response = await fetch(`http://localhost:8080/custom/modernui/api.php/leads/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Assignment failed')
    }
    return result.data
  }

  // Unassign lead from current user
  static async unassignLead(id: string): Promise<any> {
    const response = await fetch(`http://localhost:8080/custom/modernui/api.php/leads/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'unassign' })
    })
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Unassignment failed')
    }
    return result.data
  }

  // Auto-assign leads based on rules
  static async autoAssignLeads(leadIds: string[]): Promise<{
    assigned: { leadId: string, userId: string, userName: string }[]
    failed: string[]
  }> {
    const response = await fetch('http://localhost:8080/custom/modernui/api.php/leads/auto-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds })
    })
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Auto-assignment failed')
    }
    return result.data
  }

  // Update lead score
  static async updateLeadScore(id: string, score: number, reason?: string): Promise<Lead> {
    return apiService.patch<ApiResponse<Lead>>(`/leads/${id}/score`, { score, reason })
      .then(response => response.data)
  }

  // Get lead assignment rules
  static async getAssignmentRules(): Promise<{
    geolocationRules: any[]
    capacityRules: any[]
    specializationRules: any[]
  }> {
    return apiService.get<ApiResponse<any>>('/leads/assignment-rules')
      .then(response => response.data)
  }

  // Create/update assignment rules
  static async updateAssignmentRules(rules: {
    geolocationRules?: any[]
    capacityRules?: any[]
    specializationRules?: any[]
  }): Promise<void> {
    return apiService.put('/leads/assignment-rules', rules)
  }

  // Get lead sources
  static async getLeadSources(): Promise<string[]> {
    return apiService.get<ApiResponse<string[]>>('/leads/sources')
      .then(response => response.data)
  }

  // Bulk operations
  static async bulkUpdateLeads(leadIds: string[], updates: Partial<Lead>): Promise<{
    updated: string[]
    failed: string[]
  }> {
    return apiService.patch<ApiResponse<any>>('/leads/bulk-update', { leadIds, updates })
      .then(response => response.data)
  }

  static async bulkDeleteLeads(leadIds: string[]): Promise<{
    deleted: string[]
    failed: string[]
  }> {
    const response = await fetch('http://localhost:8080/custom/modernui/api.php/leads/bulk-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds })
    })
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Bulk delete failed')
    }
    return result.data
  }

  // Lead analytics
  static async getLeadAnalytics(params: {
    dateFrom?: string
    dateTo?: string
    groupBy?: 'day' | 'week' | 'month'
  } = {}): Promise<{
    totalLeads: number
    qualifiedLeads: number
    convertedLeads: number
    conversionRate: number
    leadsBySource: { source: string, count: number }[]
    leadsByStatus: { status: string, count: number }[]
    trends: { date: string, leads: number, qualified: number, converted: number }[]
  }> {
    return apiService.get<ApiResponse<any>>('/leads/analytics', params)
      .then(response => response.data)
  }

  // Lead scoring
  static async calculateLeadScore(leadData: Partial<Lead>): Promise<{
    score: number
    factors: { factor: string, score: number, weight: number }[]
  }> {
    return apiService.post<ApiResponse<any>>('/leads/calculate-score', leadData)
      .then(response => response.data)
  }
}
