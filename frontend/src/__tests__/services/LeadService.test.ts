import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeadService } from '@/services/leadService'
import { apiService } from '@/services/api'

// Mock the api service
vi.mock('@/services/api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('LeadService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLeads', () => {
    it('should fetch leads with default parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              status: 'New'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
          }
        }
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await LeadService.getLeads()

      expect(apiService.get).toHaveBeenCalledWith('/leads', {})
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch leads with custom parameters', async () => {
      const params = {
        page: 2,
        limit: 20,
        search: 'john',
        status: 'Qualified',
        source: 'Website'
      }

      const mockResponse = {
        data: {
          data: [],
          pagination: { page: 2, limit: 20, total: 0, totalPages: 0 }
        }
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await LeadService.getLeads(params)

      expect(apiService.get).toHaveBeenCalledWith('/leads', params)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createLead', () => {
    it('should create a new lead', async () => {
      const leadData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-1234',
        source: 'Website'
      }

      const mockResponse = {
        data: {
          id: 'new-lead-id',
          ...leadData,
          status: 'New',
          createdAt: new Date().toISOString()
        }
      }

      vi.mocked(apiService.post).mockResolvedValue(mockResponse)

      const result = await LeadService.createLead(leadData)

      expect(apiService.post).toHaveBeenCalledWith('/leads', leadData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('autoAssignLeads', () => {
    it('should auto-assign multiple leads successfully', async () => {
      const leadIds = ['lead1', 'lead2', 'lead3']
      const mockResponse = {
        data: {
          assigned: [
            { leadId: 'lead1', userId: 'agent1' },
            { leadId: 'lead2', userId: 'agent2' }
          ],
          failed: ['lead3']
        }
      }

      vi.mocked(apiService.post).mockResolvedValue(mockResponse)

      const result = await LeadService.autoAssignLeads(leadIds)

      expect(apiService.post).toHaveBeenCalledWith('/leads/auto-assign', { leadIds })
      expect(result).toEqual(mockResponse.data)
      expect(result.assigned).toHaveLength(2)
      expect(result.failed).toHaveLength(1)
    })

    it('should handle auto-assignment failures', async () => {
      const leadIds = ['lead1']
      const mockResponse = {
        data: {
          assigned: [],
          failed: ['lead1']
        }
      }

      vi.mocked(apiService.post).mockResolvedValue(mockResponse)

      const result = await LeadService.autoAssignLeads(leadIds)

      expect(result.assigned).toHaveLength(0)
      expect(result.failed).toHaveLength(1)
    })
  })

  describe('updateLeadScore', () => {
    it('should update lead score with reason', async () => {
      const leadId = 'lead123'
      const score = 85
      const reason = 'High engagement and qualified budget'

      const mockResponse = {
        data: {
          id: leadId,
          leadScore: score,
          firstName: 'John',
          lastName: 'Doe'
        }
      }

      vi.mocked(apiService.patch).mockResolvedValue(mockResponse)

      const result = await LeadService.updateLeadScore(leadId, score, reason)

      expect(apiService.patch).toHaveBeenCalledWith(`/leads/${leadId}/score`, { score, reason })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getAssignmentRules', () => {
    it('should fetch assignment rules', async () => {
      const mockResponse = {
        data: {
          geolocationRules: [
            {
              id: 'geo1',
              name: 'Downtown Rule',
              rule_type: 'geolocation',
              priority: 1,
              is_active: true
            }
          ],
          capacityRules: [
            {
              id: 'cap1',
              name: 'Capacity Management',
              rule_type: 'capacity',
              priority: 2,
              is_active: true
            }
          ],
          specializationRules: []
        }
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await LeadService.getAssignmentRules()

      expect(apiService.get).toHaveBeenCalledWith('/leads/assignment-rules')
      expect(result).toEqual(mockResponse.data)
      expect(result.geolocationRules).toHaveLength(1)
      expect(result.capacityRules).toHaveLength(1)
      expect(result.specializationRules).toHaveLength(0)
    })
  })

  describe('updateAssignmentRules', () => {
    it('should update assignment rules', async () => {
      const rules = {
        geolocationRules: [
          {
            id: 'geo1',
            name: 'Updated Downtown Rule',
            rule_type: 'geolocation' as const,
            rule_data: { areas: [] },
            priority: 1,
            is_active: true,
            conditions: {}
          }
        ]
      }

      vi.mocked(apiService.put).mockResolvedValue({ data: { success: true } })

      await LeadService.updateAssignmentRules(rules)

      expect(apiService.put).toHaveBeenCalledWith('/leads/assignment-rules', rules)
    })
  })

  describe('calculateLeadScore', () => {
    it('should calculate lead score', async () => {
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        budget: { min: 400000, max: 500000 },
        timeline: 'within 3 months',
        source: 'referral'
      }

      const mockResponse = {
        data: {
          score: 88,
          factors: {
            budget: { score: 85, weight: 0.25, weighted_score: 21.25 },
            timeline: { score: 90, weight: 0.20, weighted_score: 18 },
            location: { score: 75, weight: 0.15, weighted_score: 11.25 },
            source: { score: 95, weight: 0.15, weighted_score: 14.25 },
            engagement: { score: 80, weight: 0.15, weighted_score: 12 },
            preapproval: { score: 50, weight: 0.10, weighted_score: 5 }
          },
          reasoning: 'High-quality referral lead with strong budget and immediate timeline',
          grade: 'A',
          priority: 'Hot'
        }
      }

      vi.mocked(apiService.post).mockResolvedValue(mockResponse)

      const result = await LeadService.calculateLeadScore(leadData)

      expect(apiService.post).toHaveBeenCalledWith('/leads/calculate-score', leadData)
      expect(result).toEqual(mockResponse.data)
      expect(result.score).toBe(88)
      expect(result.grade).toBe('A')
      expect(result.priority).toBe('Hot')
    })
  })

  describe('assignLead', () => {
    it('should assign lead to specific user', async () => {
      const leadId = 'lead123'
      const userId = 'agent456'

      const mockResponse = {
        data: {
          id: leadId,
          assignedUserId: userId,
          assignedUserName: 'Agent Smith',
          firstName: 'John',
          lastName: 'Doe'
        }
      }

      vi.mocked(apiService.patch).mockResolvedValue(mockResponse)

      const result = await LeadService.assignLead(leadId, userId)

      expect(apiService.patch).toHaveBeenCalledWith(`/leads/${leadId}/assign`, { userId })
      expect(result).toEqual(mockResponse.data)
      expect(result.assignedUserId).toBe(userId)
    })
  })

  describe('getLead', () => {
    it('should fetch individual lead', async () => {
      const leadId = 'lead123'
      const mockResponse = {
        data: {
          id: leadId,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'Qualified',
          leadScore: 85
        }
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await LeadService.getLead(leadId)

      expect(apiService.get).toHaveBeenCalledWith(`/leads/${leadId}`)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updateLead', () => {
    it('should update lead information', async () => {
      const leadId = 'lead123'
      const updateData = {
        status: 'Qualified',
        notes: 'Follow up scheduled'
      }

      const mockResponse = {
        data: {
          id: leadId,
          ...updateData,
          firstName: 'John',
          lastName: 'Doe'
        }
      }

      vi.mocked(apiService.put).mockResolvedValue(mockResponse)

      const result = await LeadService.updateLead(leadId, updateData)

      expect(apiService.put).toHaveBeenCalledWith(`/leads/${leadId}`, updateData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteLead', () => {
    it('should delete lead', async () => {
      const leadId = 'lead123'

      vi.mocked(apiService.delete).mockResolvedValue(undefined)

      await LeadService.deleteLead(leadId)

      expect(apiService.delete).toHaveBeenCalledWith(`/leads/${leadId}`)
    })
  })

  describe('bulkUpdateLeads', () => {
    it('should bulk update multiple leads', async () => {
      const leadIds = ['lead1', 'lead2', 'lead3']
      const updates = { status: 'Contacted' }

      const mockResponse = {
        data: {
          updated: ['lead1', 'lead2'],
          failed: ['lead3']
        }
      }

      vi.mocked(apiService.patch).mockResolvedValue(mockResponse)

      const result = await LeadService.bulkUpdateLeads(leadIds, updates)

      expect(apiService.patch).toHaveBeenCalledWith('/leads/bulk-update', { leadIds, updates })
      expect(result).toEqual(mockResponse.data)
      expect(result.updated).toHaveLength(2)
      expect(result.failed).toHaveLength(1)
    })
  })

  describe('getLeadAnalytics', () => {
    it('should fetch lead analytics with default parameters', async () => {
      const mockResponse = {
        data: {
          totalLeads: 150,
          qualifiedLeads: 45,
          convertedLeads: 12,
          conversionRate: 8.0,
          leadsBySource: [
            { source: 'Website', count: 50 },
            { source: 'Zillow', count: 35 },
            { source: 'Referral', count: 25 }
          ],
          leadsByStatus: [
            { status: 'New', count: 80 },
            { status: 'Qualified', count: 45 },
            { status: 'Converted', count: 12 }
          ],
          trends: [
            { date: '2024-01-01', leads: 10, qualified: 3, converted: 1 },
            { date: '2024-01-02', leads: 12, qualified: 4, converted: 2 }
          ]
        }
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await LeadService.getLeadAnalytics()

      expect(apiService.get).toHaveBeenCalledWith('/leads/analytics', {})
      expect(result).toEqual(mockResponse.data)
      expect(result.totalLeads).toBe(150)
      expect(result.conversionRate).toBe(8.0)
    })

    it('should fetch analytics with custom date range', async () => {
      const params = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        groupBy: 'week' as const
      }

      const mockResponse = {
        data: {
          totalLeads: 50,
          qualifiedLeads: 15,
          convertedLeads: 5,
          conversionRate: 10.0,
          leadsBySource: [],
          leadsByStatus: [],
          trends: []
        }
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await LeadService.getLeadAnalytics(params)

      expect(apiService.get).toHaveBeenCalledWith('/leads/analytics', params)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error')
      vi.mocked(apiService.get).mockRejectedValue(error)

      await expect(LeadService.getLeads()).rejects.toThrow('Network error')
    })

    it('should handle auto-assignment API errors', async () => {
      const error = new Error('Assignment service unavailable')
      vi.mocked(apiService.post).mockRejectedValue(error)

      await expect(LeadService.autoAssignLeads(['lead1'])).rejects.toThrow('Assignment service unavailable')
    })
  })
})
