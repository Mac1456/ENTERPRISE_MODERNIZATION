import { apiService } from './api'
import { Contact, PropertyInterest, ApiResponse, PaginatedResponse } from '@/types'

export class ContactService {
  // Get paginated contacts
  static async getContacts(params: {
    page?: number
    limit?: number
    search?: string
    type?: string
    location?: string
    assignedTo?: string
  } = {}): Promise<PaginatedResponse<Contact>> {
    return apiService.get<ApiResponse<PaginatedResponse<Contact>>>('/contacts', params)
      .then(response => response.data)
  }

  // Get single contact
  static async getContact(id: string): Promise<Contact> {
    return apiService.get<ApiResponse<Contact>>(`/contacts/${id}`)
      .then(response => response.data)
  }

  // Create new contact
  static async createContact(contactData: Partial<Contact>): Promise<Contact> {
    return apiService.post<ApiResponse<Contact>>('/contacts', contactData)
      .then(response => response.data)
  }

  // Update contact
  static async updateContact(id: string, contactData: Partial<Contact>): Promise<Contact> {
    return apiService.put<ApiResponse<Contact>>(`/contacts/${id}`, contactData)
      .then(response => response.data)
  }

  // Delete contact
  static async deleteContact(id: string): Promise<void> {
    return apiService.delete(`/contacts/${id}`)
  }

  // Add property interest to contact
  static async addPropertyInterest(contactId: string, interestData: Partial<PropertyInterest>): Promise<PropertyInterest> {
    return apiService.post<ApiResponse<PropertyInterest>>(`/contacts/${contactId}/property-interests`, interestData)
      .then(response => response.data)
  }

  // Update property interest
  static async updatePropertyInterest(contactId: string, interestId: string, interestData: Partial<PropertyInterest>): Promise<PropertyInterest> {
    return apiService.put<ApiResponse<PropertyInterest>>(`/contacts/${contactId}/property-interests/${interestId}`, interestData)
      .then(response => response.data)
  }

  // Remove property interest
  static async removePropertyInterest(contactId: string, interestId: string): Promise<void> {
    return apiService.delete(`/contacts/${contactId}/property-interests/${interestId}`)
  }

  // Assign contacts to user
  static async assignContacts(contactIds: string[], assignmentData: {
    userId: string
    userName: string
  }): Promise<void> {
    return apiService.post('/contacts/assign', {
      contactIds,
      ...assignmentData
    })
  }

  // Get contact property recommendations
  static async getPropertyRecommendations(contactId: string): Promise<any[]> {
    return apiService.get<ApiResponse<any[]>>(`/contacts/${contactId}/recommendations`)
      .then(response => response.data)
  }

  // Get contact showing history
  static async getShowingHistory(contactId: string): Promise<any[]> {
    return apiService.get<ApiResponse<any[]>>(`/contacts/${contactId}/showings`)
      .then(response => response.data)
  }

  // Save contact search criteria
  static async saveSearchCriteria(contactId: string, criteria: any): Promise<void> {
    return apiService.post(`/contacts/${contactId}/saved-searches`, criteria)
  }

  // Get saved searches for contact
  static async getSavedSearches(contactId: string): Promise<any[]> {
    return apiService.get<ApiResponse<any[]>>(`/contacts/${contactId}/saved-searches`)
      .then(response => response.data)
  }

  // Get buyer/seller profile
  static async getBuyerProfile(contactId: string): Promise<any> {
    return apiService.get<ApiResponse<any>>(`/contacts/${contactId}/buyer-profile`)
      .then(response => response.data)
  }

  static async getSellerProfile(contactId: string): Promise<any> {
    return apiService.get<ApiResponse<any>>(`/contacts/${contactId}/seller-profile`)
      .then(response => response.data)
  }

  // Update buyer/seller profile
  static async updateBuyerProfile(contactId: string, profileData: any): Promise<any> {
    return apiService.put<ApiResponse<any>>(`/contacts/${contactId}/buyer-profile`, profileData)
      .then(response => response.data)
  }

  static async updateSellerProfile(contactId: string, profileData: any): Promise<any> {
    return apiService.put<ApiResponse<any>>(`/contacts/${contactId}/seller-profile`, profileData)
      .then(response => response.data)
  }

  // Property matching algorithms
  static async runPropertyMatch(contactId: string): Promise<any[]> {
    return apiService.post<ApiResponse<any[]>>(`/contacts/${contactId}/property-match`)
      .then(response => response.data)
  }

  // Contact analytics
  static async getContactAnalytics(contactId: string): Promise<any> {
    return apiService.get<ApiResponse<any>>(`/contacts/${contactId}/analytics`)
      .then(response => response.data)
  }
}
