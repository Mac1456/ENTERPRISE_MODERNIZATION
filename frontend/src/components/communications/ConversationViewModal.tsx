/**
 * ✅ ACTIVE COMPONENT - Conversation View Modal
 * 
 * Full conversation view with messaging, emoji picker, and archive functionality
 * Following patterns from other modal components
 * Last updated: Fix implementation - 2024-07-27
 */

import React, { useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { Conversation, Message } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface ConversationViewModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
  onArchive?: (conversationId: string) => void
  onSendMessage?: (conversationId: string, message: string) => void
}

// Mock messages for the conversation
const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: '1',
    senderId: 'user1',
    senderName: 'Sarah Johnson',
    content: "Hi! I'm interested in the 3BR house on Maple Street. Can you provide more details?",
    messageType: 'text',
    timestamp: '2024-07-27T10:00:00Z',
    readBy: ['agent1'],
    status: 'read'
  },
  {
    id: 'msg2',
    conversationId: '1',
    senderId: 'agent1',
    senderName: 'Mike Agent',
    content: "Hello Sarah! I'd be happy to help. The house has been recently renovated with modern fixtures throughout. Would you like to schedule a viewing?",
    messageType: 'text',
    timestamp: '2024-07-27T10:15:00Z',
    readBy: ['user1'],
    status: 'read'
  },
  {
    id: 'msg3',
    conversationId: '1',
    senderId: 'user1',
    senderName: 'Sarah Johnson',
    content: "That sounds great! What's the earliest we could schedule for next week?",
    messageType: 'text',
    timestamp: '2024-07-27T14:30:00Z',
    readBy: ['agent1'],
    status: 'delivered'
  }
]

// Common emojis for quick access
const commonEmojis = ['😊', '👍', '❤️', '😊', '🎉', '🏠', '💰', '📅', '✅', '❌']

export default function ConversationViewModal({
  isOpen,
  onClose,
  conversation,
  onArchive,
  onSendMessage
}: ConversationViewModalProps) {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversation) return

    const message: Message = {
      id: `msg${Date.now()}`,
      conversationId: conversation.id,
      senderId: 'current_user',
      senderName: 'You',
      content: newMessage.trim(),
      messageType: 'text',
      timestamp: new Date().toISOString(),
      readBy: [],
      status: 'sent'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Call the parent callback if provided
    if (onSendMessage) {
      onSendMessage(conversation.id, newMessage.trim())
    }

    toast.success('Message sent!')
    scrollToBottom()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleArchive = () => {
    if (!conversation) return
    
    if (onArchive) {
      onArchive(conversation.id)
    }
    
    toast.success('Conversation archived')
    onClose()
  }

  const getMessageAlignment = (senderId: string) => {
    return senderId === 'current_user' ? 'justify-end' : 'justify-start'
  }

  const getMessageBubbleStyle = (senderId: string) => {
    return senderId === 'current_user' 
      ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
      : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
  }

  if (!conversation) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {conversation.name}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {conversation.participants.length} participants • {conversation.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg">
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleArchive}
                              className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                            >
                              <ArchiveBoxIcon className="w-4 h-4 mr-3" />
                              Archive Conversation
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Participants */}
                <div className="px-6 py-3 bg-gray-50 border-b">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Participants:</span>
                    <div className="flex flex-wrap gap-2">
                      {conversation.participants.map((participant) => (
                        <Badge key={participant.userId} variant="outline">
                          {participant.userName} ({participant.userRole})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${getMessageAlignment(message.senderId)}`}>
                      <div className="max-w-xs lg:max-w-md">
                        {message.senderId !== 'current_user' && (
                          <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                        )}
                        <div className={`px-4 py-2 ${getMessageBubbleStyle(message.senderId)}`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiClick(emoji)}
                            className="p-2 hover:bg-gray-200 rounded text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end space-x-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <FaceSmileIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toast.info('File attachment coming soon')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <PaperClipIcon className="w-5 h-5" />
                      </button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 min-w-[40px]"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
