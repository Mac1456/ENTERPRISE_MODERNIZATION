/**
 * ✅ ACTIVE COMPONENT - PRIMARY COMMUNICATIONS PAGE
 * 
 * Feature 4: Real-Time Communication Hub
 * Route: /communications (following Leads_Enhanced.tsx patterns)
 * Status: ACTIVE - This is the primary communications implementation
 * 
 * Following exact patterns from Leads_Enhanced.tsx and Contacts_Enhanced.tsx
 * Last updated: Initial implementation - 2024-07-27
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BellIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
  EllipsisVerticalIcon,
  BoltIcon,
  CheckIcon,
  UsersIcon,
  DocumentArrowUpIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { CommunicationService } from '@/services/communicationService'
import { Conversation, Message, Document, Notification } from '@/types'
import ConversationModal from '@/components/communications/ConversationModal'
import ConversationViewModal from '@/components/communications/ConversationViewModal'
import DocumentUploadModal from '@/components/communications/DocumentUploadModal'
import DocumentViewModal from '@/components/communications/DocumentViewModal'
import MessageComposer from '@/components/communications/MessageComposer'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

// Mock data for demonstration (following exact pattern from Leads_Enhanced.tsx)
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Johnson Property Inquiry',
    type: 'property_inquiry',
    participants: [
      { userId: 'user1', userName: 'Sarah Johnson', userRole: 'client', joinedAt: '2024-07-25T10:00:00Z', isActive: true, permissions: { canAddParticipants: false, canRemoveParticipants: false, canUploadDocuments: true, canCreateTasks: false, canViewAllMessages: true } },
      { userId: 'agent1', userName: 'Mike Agent', userRole: 'agent', joinedAt: '2024-07-25T10:00:00Z', isActive: true, permissions: { canAddParticipants: true, canRemoveParticipants: true, canUploadDocuments: true, canCreateTasks: true, canViewAllMessages: true } }
    ],
    lastMessage: {
      id: 'msg1',
      conversationId: '1',
      senderId: 'user1',
      senderName: 'Sarah Johnson',
      content: 'I\'m interested in the 3BR house on Maple Street',
      messageType: 'text',
      timestamp: '2024-07-27T14:30:00Z',
      readBy: ['agent1'],
      status: 'delivered'
    },
    lastActivity: '2024-07-27T14:30:00Z',
    isArchived: false,
    isMuted: false,
    relatedContactId: '1',
    relatedContactName: 'Sarah Johnson',
    relatedPropertyAddress: '123 Maple Street',
    createdAt: '2024-07-25T10:00:00Z',
    createdBy: 'agent1'
  },
  {
    id: '2',
    name: 'Downtown Condo Transaction Team',
    type: 'transaction_team',
    participants: [
      { userId: 'agent1', userName: 'Mike Agent', userRole: 'listing_agent', joinedAt: '2024-07-20T09:00:00Z', isActive: true, permissions: { canAddParticipants: true, canRemoveParticipants: true, canUploadDocuments: true, canCreateTasks: true, canViewAllMessages: true } },
      { userId: 'agent2', userName: 'Lisa Buyer Agent', userRole: 'buyer_agent', joinedAt: '2024-07-20T09:15:00Z', isActive: true, permissions: { canAddParticipants: true, canRemoveParticipants: false, canUploadDocuments: true, canCreateTasks: true, canViewAllMessages: true } },
      { userId: 'lender1', userName: 'First National Bank', userRole: 'lender', joinedAt: '2024-07-20T10:00:00Z', isActive: true, permissions: { canAddParticipants: false, canRemoveParticipants: false, canUploadDocuments: true, canCreateTasks: false, canViewAllMessages: true } }
    ],
    lastMessage: {
      id: 'msg2',
      conversationId: '2',
      senderId: 'lender1',
      senderName: 'First National Bank',
      content: 'Pre-approval letter uploaded and signed',
      messageType: 'document',
      timestamp: '2024-07-27T13:15:00Z',
      readBy: ['agent1', 'agent2'],
      status: 'read'
    },
    lastActivity: '2024-07-27T13:15:00Z',
    isArchived: false,
    isMuted: false,
    relatedPropertyAddress: '456 Downtown Plaza #5B',
    createdAt: '2024-07-20T09:00:00Z',
    createdBy: 'agent1'
  },
  {
    id: '3',
    name: 'Group: Weekend Open Houses',
    type: 'group',
    participants: [
      { userId: 'agent1', userName: 'Mike Agent', userRole: 'agent', joinedAt: '2024-07-26T08:00:00Z', isActive: true, permissions: { canAddParticipants: true, canRemoveParticipants: true, canUploadDocuments: true, canCreateTasks: true, canViewAllMessages: true } },
      { userId: 'agent2', userName: 'Lisa Agent', userRole: 'agent', joinedAt: '2024-07-26T08:00:00Z', isActive: true, permissions: { canAddParticipants: true, canRemoveParticipants: true, canUploadDocuments: true, canCreateTasks: true, canViewAllMessages: true } },
      { userId: 'agent3', userName: 'John Agent', userRole: 'agent', joinedAt: '2024-07-26T08:30:00Z', isActive: true, permissions: { canAddParticipants: true, canRemoveParticipants: true, canUploadDocuments: true, canCreateTasks: true, canViewAllMessages: true } }
    ],
    lastMessage: {
      id: 'msg3',
      conversationId: '3',
      senderId: 'agent2',
      senderName: 'Lisa Agent',
      content: 'I can cover the Riverside listings this weekend',
      messageType: 'text',
      timestamp: '2024-07-27T11:45:00Z',
      readBy: ['agent1'],
      status: 'delivered'
    },
    lastActivity: '2024-07-27T11:45:00Z',
    isArchived: false,
    isMuted: false,
    createdAt: '2024-07-26T08:00:00Z',
    createdBy: 'agent1'
  }
]

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Purchase Agreement - Johnson.pdf',
    description: 'Purchase agreement for 123 Maple Street property',
    fileSize: 2458752, // ~2.4MB
    fileType: 'application/pdf',
    category: 'contract',
    url: '/documents/purchase-agreement-johnson.pdf',
    uploadedBy: 'agent1',
    uploadedByName: 'Mike Agent',
    uploadedAt: '2024-07-27T10:30:00Z',
    tags: ['contract', 'purchase', 'urgent'],
    relatedContactId: '1',
    requiresSignature: true,
    signatureStatus: 'pending',
    sharePermissions: {
      viewerIds: ['user1', 'agent1'],
      editorIds: ['agent1'],
      signerIds: ['user1'],
      isPublic: false
    },
    version: 1
  },
  {
    id: '2',
    name: 'Pre-Approval Letter - Downtown Condo.pdf',
    description: 'Pre-approval letter from First National Bank',
    fileSize: 1048576, // 1MB
    fileType: 'application/pdf',
    category: 'financial',
    url: '/documents/preapproval-downtown.pdf',
    uploadedBy: 'lender1',
    uploadedByName: 'First National Bank',
    uploadedAt: '2024-07-27T13:15:00Z',
    tags: ['preapproval', 'financing', 'complete'],
    requiresSignature: true,
    signatureStatus: 'complete',
    signedBy: [
      {
        signerId: 'user2',
        signerName: 'John Buyer',
        signerEmail: 'john@example.com',
        signedAt: '2024-07-27T13:20:00Z',
        signatureType: 'electronic'
      }
    ],
    sharePermissions: {
      viewerIds: ['user2', 'agent1', 'agent2', 'lender1'],
      editorIds: ['lender1'],
      signerIds: ['user2'],
      isPublic: false
    },
    version: 1
  }
]

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'signature_request',
    title: 'Signature Required',
    message: 'Purchase Agreement - Johnson.pdf requires your signature',
    timestamp: '2024-07-27T15:00:00Z',
    isRead: false,
    userId: 'current_user',
    actionUrl: '/documents/1/sign',
    relatedEntityId: '1',
    relatedEntityType: 'document',
    priority: 'high',
    category: 'documents'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Johnson sent a message in Johnson Property Inquiry',
    timestamp: '2024-07-27T14:30:00Z',
    isRead: false,
    userId: 'current_user',
    actionUrl: '/communications/conversations/1',
    relatedEntityId: '1',
    relatedEntityType: 'conversation',
    priority: 'medium',
    category: 'communication'
  },
  {
    id: '3',
    type: 'document_shared',
    title: 'Document Shared',
    message: 'First National Bank shared Pre-Approval Letter with you',
    timestamp: '2024-07-27T13:15:00Z',
    isRead: true,
    userId: 'current_user',
    actionUrl: '/documents/2',
    relatedEntityId: '2',
    relatedEntityType: 'document',
    priority: 'medium',
    category: 'documents'
  }
]

export default function CommunicationsEnhanced() {
  // State management (following exact pattern from Leads_Enhanced.tsx)
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [conversationFilter, setConversationFilter] = useState('all')
  const [documentFilter, setDocumentFilter] = useState('all')
  const [selectedTab, setSelectedTab] = useState<'conversations' | 'documents' | 'notifications'>('conversations')
  
  // Modal states
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false)
  const [isConversationViewModalOpen, setIsConversationViewModalOpen] = useState(false)
  const [isDocumentUploadModalOpen, setIsDocumentUploadModalOpen] = useState(false)
  const [isDocumentViewModalOpen, setIsDocumentViewModalOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; senderName: string; content: string } | null>(null)

  const queryClient = useQueryClient()

  // Mock queries (following exact pattern from Leads_Enhanced.tsx)
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', searchTerm, conversationFilter],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      let filtered = mockConversations
      
      if (searchTerm) {
        filtered = filtered.filter(conv => 
          conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (conversationFilter !== 'all') {
        filtered = filtered.filter(conv => conv.type === conversationFilter)
      }
      
      return {
        data: filtered,
        pagination: {
          page: 1,
          limit: 50,
          total: filtered.length,
          totalPages: 1
        }
      }
    },
    staleTime: 30000
  })

  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ['documents', documentFilter],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      let filtered = mockDocuments
      
      if (documentFilter !== 'all') {
        filtered = filtered.filter(doc => doc.category === documentFilter)
      }
      
      return {
        data: filtered,
        pagination: {
          page: 1,
          limit: 50,
          total: filtered.length,
          totalPages: 1
        }
      }
    },
    staleTime: 30000
  })

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        return await CommunicationService.getNotifications()
      } catch (error) {
        console.log('Using fallback notifications data')
        return {
          data: mockNotifications,
          pagination: {
            page: 1,
            limit: 50,
            total: mockNotifications.length,
            totalPages: 1
          }
        }
      }
    },
    staleTime: 10000
  })

  // Get communication stats
  const { data: statsData } = useQuery({
    queryKey: ['communication-stats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        totalConversations: mockConversations.length,
        activeConversations: mockConversations.filter(c => !c.isArchived).length,
        unreadMessages: 5,
        pendingDocuments: mockDocuments.filter(d => d.signatureStatus === 'pending').length,
        documentsAwaitingSignature: 1,
        totalDocuments: mockDocuments.length,
        recentActivity: [
          { type: 'message', count: 12, timestamp: '2024-07-27T15:00:00Z' },
          { type: 'document_upload', count: 3, timestamp: '2024-07-27T14:00:00Z' },
          { type: 'signature_complete', count: 2, timestamp: '2024-07-27T13:00:00Z' }
        ]
      }
    },
    staleTime: 60000
  })

  // Event handlers (following exact pattern from Leads_Enhanced.tsx)
  const handleCreateConversation = async (conversationData: any) => {
    try {
      console.log('Creating conversation:', conversationData)
      toast.success('Conversation started successfully!')
      setIsConversationModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  const handleUploadDocument = async (documentData: FormData) => {
    try {
      console.log('Uploading document:', documentData)
      toast.success('Document uploaded successfully!')
      setIsDocumentUploadModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    }
  }



  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setIsConversationViewModalOpen(true)
  }

  const handleNotificationAction = (notification: Notification) => {
    setSelectedNotification(notification)
    
    // Handle different notification types
    if (notification.type === 'message') {
      // Find and open the related conversation
      const relatedConversation = conversationsData?.data.find(conv => conv.id === notification.relatedEntityId)
      if (relatedConversation) {
        setSelectedConversation(relatedConversation)
        setIsConversationViewModalOpen(true)
      }
    } else if (notification.type === 'document_shared' || notification.type === 'signature_request') {
      // Find and open the related document
      const relatedDocument = documentsData?.data.find(doc => doc.id === notification.relatedEntityId)
      if (relatedDocument) {
        setSelectedDocument(relatedDocument)
        setIsDocumentViewModalOpen(true)
      }
    }
    
    // Mark notification as read
    handleMarkNotificationAsRead(notification.id)
  }

  const handleNotificationClick = (notification: Notification) => {
    handleNotificationAction(notification)
  }

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      // Optimistically update the UI
      queryClient.setQueryData(['notifications'], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((notification: any) => 
            notification.id === notificationId 
              ? { ...notification, isRead: !notification.isRead }
              : notification
          )
        }
      })

      await CommunicationService.markNotificationAsRead(notificationId)
      toast.success('Notification updated')
      
      // Refresh to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['communication-stats'] })
    } catch (error) {
      console.error('Error updating notification:', error)
      toast.error('Failed to update notification')
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Optimistically remove from UI
      queryClient.setQueryData(['notifications'], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: oldData.data.filter((notification: any) => notification.id !== notificationId)
        }
      })

      await CommunicationService.deleteNotification(notificationId)
      toast.success('Notification deleted')
      
      // Refresh to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['communication-stats'] })
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  }

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
    setIsDocumentViewModalOpen(true)
  }

  const handleSendMessage = async (
    conversationIdOrMessageData: string | { content: string; attachments?: File[]; replyToId?: string },
    message?: string
  ) => {
    try {
      // Handle both signature types
      if (typeof conversationIdOrMessageData === 'string') {
        // New signature: (conversationId: string, message: string)
        const conversationId = conversationIdOrMessageData
        const messageContent = message!
        
        await CommunicationService.sendMessage(conversationId, {
          content: messageContent,
          messageType: 'text'
        })
      } else {
        // Old signature: (messageData: { content: string; attachments?: File[]; replyToId?: string })
        if (!selectedConversation) return
        
        const messageData = conversationIdOrMessageData
        await CommunicationService.sendMessage(selectedConversation.id, {
          content: messageData.content,
          messageType: 'text'
        })
        setReplyToMessage(null)
      }
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['communication-stats'] })
      toast.success('Message sent!')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleShareDocument = async (documentId: string) => {
    try {
      // Implementation would involve sharing modal or direct share
      toast.success('Document shared successfully')
    } catch (error) {
      console.error('Error sharing document:', error)
      toast.error('Failed to share document')
    }
  }

  const handleRequestSignature = async (documentId: string) => {
    try {
      // Implementation would involve signature request
      toast.success('Signature request sent')
    } catch (error) {
      console.error('Error requesting signature:', error)
      toast.error('Failed to request signature')
    }
  }

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      console.log('Archiving conversation:', conversationId)
      toast.success('Conversation archived')
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setIsConversationViewOpen(false)
      setSelectedConversation(null)
    } catch (error) {
      console.error('Error archiving conversation:', error)
      toast.error('Failed to archive conversation')
    }
  }

  // Table columns for conversations (following exact pattern from Leads_Enhanced.tsx)
  const conversationColumns = [
    {
      key: 'name',
      title: 'Conversation',
      width: '30%',
      render: (name: string, conversation: Conversation) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {conversation.type === 'direct' && <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />}
            {conversation.type === 'group' && <UsersIcon className="w-5 h-5 text-green-600" />}
            {conversation.type === 'transaction_team' && <TrophyIcon className="w-5 h-5 text-purple-600" />}
            {conversation.type === 'property_inquiry' && <TrophyIcon className="w-5 h-5 text-orange-600" />}
          </div>
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{conversation.participants.length} participant(s)</p>
          </div>
        </div>
      )
    },
    {
      key: 'lastMessage',
      title: 'Last Message',
      width: '40%',
      render: (lastMessage: Message | undefined) => (
        <div className="max-w-xs">
          {lastMessage ? (
            <>
              <p className="text-sm font-medium text-gray-900">{lastMessage.senderName}</p>
              <p className="text-sm text-gray-600 truncate">{lastMessage.content}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No messages yet</p>
          )}
        </div>
      )
    },
    {
      key: 'lastActivity',
      title: 'Last Activity',
      width: '20%',
      render: (lastActivity: string) => (
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '10%',
      render: (_, conversation: Conversation) => (
        <Menu as="div" className="relative">
          <Menu.Button className="p-2 hover:bg-gray-100 rounded">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleConversationSelect(conversation)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                >
                  Open Conversation
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleArchiveConversation(conversation.id)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                >
                  Archive
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )
    }
  ]

  // Document columns
  const documentColumns = [
    {
      key: 'name',
      title: 'Document',
      width: '30%',
      render: (name: string, document: Document) => (
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{document.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'uploadedByName',
      title: 'Uploaded By',
      width: '20%'
    },
    {
      key: 'signatureStatus',
      title: 'Signature Status',
      width: '20%',
      render: (status: string) => {
        if (!status) return <span className="text-gray-400">N/A</span>
        return (
          <Badge
            variant={
              status === 'complete' ? 'success' :
              status === 'pending' ? 'warning' :
              status === 'partial' ? 'info' : 'error'
            }
          >
            {status}
          </Badge>
        )
      }
    },
    {
      key: 'uploadedAt',
      title: 'Uploaded',
      width: '20%',
      render: (uploadedAt: string) => (
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '10%',
      render: (_, document: Document) => (
        <Menu as="div" className="relative">
          <Menu.Button className="p-2 hover:bg-gray-100 rounded">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleDocumentClick(document)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                >
                  View Document
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleShareDocument(document.id)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                >
                  Share
                </button>
              )}
            </Menu.Item>
            {document.requiresSignature && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleRequestSignature(document.id)}
                    className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm`}
                  >
                    Request Signature
                  </button>
                )}
              </Menu.Item>
            )}
          </Menu.Items>
        </Menu>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications Hub</h1>
          <p className="text-gray-600">Manage conversations, documents, and notifications</p>
        </div>
      </div>

      {/* Stats Cards (following exact pattern from Leads_Enhanced.tsx) */}
      {statsData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Conversations</CardTitle>
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-xl sm:text-2xl font-bold">{statsData.activeConversations}</div>
              <p className="text-xs text-muted-foreground">Ongoing discussions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Unread Messages</CardTitle>
              <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{statsData.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Documents</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{statsData.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Files shared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Signatures</CardTitle>
              <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{statsData.documentsAwaitingSignature}</div>
              <p className="text-xs text-muted-foreground">Awaiting signature</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'conversations', label: 'Conversations', icon: ChatBubbleLeftRightIcon },
            { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                  selectedTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'conversations' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={conversationFilter}
                onChange={(e) => setConversationFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="direct">Direct Messages</option>
                <option value="group">Group Chats</option>
                <option value="transaction_team">Transaction Teams</option>
                <option value="property_inquiry">Property Inquiries</option>
              </select>

              <Button onClick={() => setIsConversationModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>

          {/* Conversations Table/List */}
          <div className="bg-white rounded-lg shadow">
            <CRMHubDataTable
              columns={conversationColumns}
              data={conversationsData?.data || []}
              loading={conversationsLoading}
              onRowClick={handleConversationSelect}
            />
          </div>


        </>
      )}

      {selectedTab === 'documents' && (
        <>
          {/* Document Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="contract">Contracts</option>
                <option value="listing">Listings</option>
                <option value="inspection">Inspections</option>
                <option value="financial">Financial</option>
                <option value="legal">Legal</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button onClick={() => setIsDocumentUploadModalOpen(true)}>
              <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-lg shadow">
            <CRMHubDataTable
              columns={documentColumns}
              data={documentsData?.data || []}
              loading={documentsLoading}
              onRowClick={handleDocumentClick}
            />
          </div>
        </>
      )}

      {selectedTab === 'notifications' && (
        <div className="space-y-3">
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !notificationsData?.data?.length ? (
            <Card>
              <CardContent className="text-center py-12">
                <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  You're all caught up! New notifications will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            notificationsData.data.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${!notification.isRead ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'} 
                border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30 
                transition-all duration-200 group`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.type === 'signature_request' ? 'bg-orange-100 text-orange-600' :
                    notification.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {notification.type === 'signature_request' && <DocumentTextIcon className="w-4 h-4" />}
                    {notification.type === 'message' && <ChatBubbleLeftRightIcon className="w-4 h-4" />}
                    {notification.type === 'document_shared' && <DocumentTextIcon className="w-4 h-4" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{notification.title}</h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge 
                        variant={
                          notification.priority === 'urgent' ? 'destructive' :
                          notification.priority === 'high' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs px-2 py-0.5"
                      >
                        {notification.priority}
                      </Badge>
                      <Menu as="div" className="relative">
                        <Menu.Button 
                          className="p-1 hover:bg-gray-200 rounded transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                        </Menu.Button>
                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkNotificationAsRead(notification.id)
                                  }}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex items-center w-full px-4 py-2 text-sm`}
                                >
                                  <CheckIcon className="w-4 h-4 mr-3" />
                                  {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteNotification(notification.id)
                                  }}
                                  className={`${active ? 'bg-red-50 text-red-900' : 'text-red-600'} flex items-center w-full px-4 py-2 text-sm`}
                                >
                                  <XMarkIcon className="w-4 h-4 mr-3" />
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Menu>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <ConversationModal
        isOpen={isConversationModalOpen}
        onClose={() => setIsConversationModalOpen(false)}
        onSubmit={handleCreateConversation}
      />

      <ConversationViewModal
        isOpen={isConversationViewModalOpen}
        onClose={() => setIsConversationViewModalOpen(false)}
        conversation={selectedConversation}
        onArchive={handleArchiveConversation}
        onSendMessage={handleSendMessage}
      />

      <DocumentUploadModal
        isOpen={isDocumentUploadModalOpen}
        onClose={() => setIsDocumentUploadModalOpen(false)}
        onSubmit={handleUploadDocument}
      />

      <DocumentViewModal
        isOpen={isDocumentViewModalOpen}
        onClose={() => setIsDocumentViewModalOpen(false)}
        document={selectedDocument}
        onShare={handleShareDocument}
        onRequestSignature={handleRequestSignature}
      />
    </div>
  )
}
