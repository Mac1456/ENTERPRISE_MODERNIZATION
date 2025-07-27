import { apiService } from './api'
import { DashboardStats, ChartData, ActivityFeed, ApiResponse, PaginatedResponse } from '@/types'

export class DashboardService {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<ApiResponse<DashboardStats>>('/dashboard/stats')
      .then(response => response.data)
  }

  // Get sales pipeline data for charts
  static async getSalesPipelineData(): Promise<ChartData[]> {
    return apiService.get<ApiResponse<ChartData[]>>('/dashboard/sales-pipeline')
      .then(response => response.data)
  }

  // Get lead source distribution
  static async getLeadSourceData(): Promise<ChartData[]> {
    return apiService.get<ApiResponse<ChartData[]>>('/dashboard/lead-sources')
      .then(response => response.data)
  }

  // Get recent activity feed
  static async getActivityFeed(limit: number = 10): Promise<ActivityFeed[]> {
    return apiService.get<ApiResponse<ActivityFeed[]>>('/dashboard/activity', { limit })
      .then(response => response.data)
  }

  // Get revenue trends (last 12 months)
  static async getRevenueTrends(): Promise<ChartData[]> {
    return apiService.get<ApiResponse<ChartData[]>>('/dashboard/revenue-trends')
      .then(response => response.data)
  }

  // Get property listing performance
  static async getPropertyPerformance(): Promise<ChartData[]> {
    return apiService.get<ApiResponse<ChartData[]>>('/dashboard/property-performance')
      .then(response => response.data)
  }

  // Get quick metrics for mobile dashboard
  static async getQuickMetrics(): Promise<{
    todayLeads: number
    todayAppointments: number
    pendingTasks: number
    activeListings: number
  }> {
    return apiService.get<ApiResponse<any>>('/dashboard/quick-metrics')
      .then(response => response.data)
  }

  // Get user performance metrics
  static async getUserPerformance(userId?: string): Promise<{
    leadsGenerated: number
    contactsAdded: number
    dealsWon: number
    revenue: number
    conversionRate: number
  }> {
    const params = userId ? { userId } : {}
    return apiService.get<ApiResponse<any>>('/dashboard/user-performance', params)
      .then(response => response.data)
  }
}
