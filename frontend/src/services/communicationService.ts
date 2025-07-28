import { apiService } from './api'
import { 
  Message, 
  Conversation, 
  Document, 
  Notification, 
  CommunicationPreferences,
  ApiResponse, 
  PaginatedResponse 
} from '@/types'

export class CommunicationService {
  // ===== CONVERSATIONS =====
  
  // Get paginated conversations
  static async getConversations(params: {
    page?: number
    limit?: number
    search?: string
    type?: string
    archived?: boolean
  } = {}): Promise<PaginatedResponse<Conversation>> {
    return apiService.get<ApiResponse<PaginatedResponse<Conversation>>>('/communications/conversations', params)
      .then(response => response.data)
  }

  // Get single conversation
  static async getConversation(id: string): Promise<Conversation> {
    return apiService.get<ApiResponse<Conversation>>(`/communications/conversations/${id}`)
      .then(response => response.data)
  }

  // Create new conversation
  static async createConversation(conversationData: {
    name: string
    type: string
    participantIds: string[]
    relatedContactId?: string
    relatedPropertyId?: string
  }): Promise<Conversation> {
    return apiService.post<ApiResponse<Conversation>>('/communications/conversations', conversationData)
      .then(response => response.data)
  }

  // Update conversation
  static async updateConversation(id: string, conversationData: Partial<Conversation>): Promise<Conversation> {
    return apiService.put<ApiResponse<Conversation>>(`/communications/conversations/${id}`, conversationData)
      .then(response => response.data)
  }

  // Archive/unarchive conversation
  static async archiveConversation(id: string, archived: boolean): Promise<void> {
    return apiService.patch(`/communications/conversations/${id}/archive`, { archived })
  }

  // Add participant to conversation
  static async addParticipant(conversationId: string, userId: string): Promise<void> {
    return apiService.post(`/communications/conversations/${conversationId}/participants`, { userId })
  }

  // Remove participant from conversation
  static async removeParticipant(conversationId: string, userId: string): Promise<void> {
    return apiService.delete(`/communications/conversations/${conversationId}/participants/${userId}`)
  }

  // ===== MESSAGES =====
  
  // Get messages for a conversation
  static async getMessages(conversationId: string, params: {
    page?: number
    limit?: number
    before?: string // timestamp
  } = {}): Promise<PaginatedResponse<Message>> {
    return apiService.get<ApiResponse<PaginatedResponse<Message>>>(`/communications/conversations/${conversationId}/messages`, params)
      .then(response => response.data)
  }

  // Send message
  static async sendMessage(conversationId: string, messageData: {
    content: string
    messageType?: string
    replyToId?: string
    attachments?: string[]
  }): Promise<Message> {
    return apiService.post<ApiResponse<Message>>(`/communications/conversations/${conversationId}/messages`, messageData)
      .then(response => response.data)
  }

  // Mark message as read
  static async markMessageAsRead(conversationId: string, messageId: string): Promise<void> {
    return apiService.patch(`/communications/conversations/${conversationId}/messages/${messageId}/read`)
  }

  // Mark all messages in conversation as read
  static async markAllMessagesAsRead(conversationId: string): Promise<void> {
    return apiService.patch(`/communications/conversations/${conversationId}/messages/read-all`)
  }

  // ===== DOCUMENTS =====
  
  // Get documents
  static async getDocuments(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    relatedContactId?: string
    relatedPropertyId?: string
    requiresSignature?: boolean
  } = {}): Promise<PaginatedResponse<Document>> {
    return apiService.get<ApiResponse<PaginatedResponse<Document>>>('/communications/documents', params)
      .then(response => response.data)
  }

  // Get single document
  static async getDocument(id: string): Promise<Document> {
    return apiService.get<ApiResponse<Document>>(`/communications/documents/${id}`)
      .then(response => response.data)
  }

  // Upload document
  static async uploadDocument(formData: FormData): Promise<Document> {
    return apiService.post<ApiResponse<Document>>('/communications/documents/upload', formData)
      .then(response => response.data)
  }

  // Update document
  static async updateDocument(id: string, documentData: Partial<Document>): Promise<Document> {
    return apiService.put<ApiResponse<Document>>(`/communications/documents/${id}`, documentData)
      .then(response => response.data)
  }

  // Delete document
  static async deleteDocument(id: string): Promise<void> {
    return apiService.delete(`/communications/documents/${id}`)
  }

  // Share document
  static async shareDocument(id: string, shareData: {
    userIds: string[]
    permissions: 'view' | 'edit' | 'sign'
    message?: string
  }): Promise<void> {
    return apiService.post(`/communications/documents/${id}/share`, shareData)
  }

  // Request signature
  static async requestSignature(documentId: string, signerData: {
    signerEmails: string[]
    message?: string
    dueDate?: string
  }): Promise<void> {
    return apiService.post(`/communications/documents/${documentId}/signature-request`, signerData)
  }

  // ===== NOTIFICATIONS =====
  
  // Get notifications
  static async getNotifications(params: {
    page?: number
    limit?: number
    isRead?: boolean
    type?: string
    category?: string
  } = {}): Promise<PaginatedResponse<Notification>> {
    return apiService.get<ApiResponse<PaginatedResponse<Notification>>>('/communications/notifications', params)
      .then(response => response.data)
  }

  // Mark notification as read
  static async markNotificationAsRead(id: string): Promise<void> {
    return apiService.patch(`/communications/notifications/${id}/read`)
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(): Promise<void> {
    return apiService.patch('/communications/notifications/read-all')
  }

  // Delete notification
  static async deleteNotification(id: string): Promise<void> {
    return apiService.delete(`/communications/notifications/${id}`)
  }

  // ===== PREFERENCES =====
  
  // Get communication preferences
  static async getPreferences(): Promise<CommunicationPreferences> {
    return apiService.get<ApiResponse<CommunicationPreferences>>('/communications/preferences')
      .then(response => response.data)
  }

  // Update communication preferences
  static async updatePreferences(preferences: Partial<CommunicationPreferences>): Promise<CommunicationPreferences> {
    return apiService.put<ApiResponse<CommunicationPreferences>>('/communications/preferences', preferences)
      .then(response => response.data)
  }

  // ===== ANALYTICS =====
  
  // Get communication stats
  static async getCommunicationStats(): Promise<{
    totalConversations: number
    activeConversations: number
    unreadMessages: number
    pendingDocuments: number
    documentsAwaitingSignature: number
    totalDocuments: number
    recentActivity: Array<{
      type: string
      count: number
      timestamp: string
    }>
  }> {
    return apiService.get<ApiResponse<any>>('/communications/stats')
      .then(response => response.data)
  }
}
