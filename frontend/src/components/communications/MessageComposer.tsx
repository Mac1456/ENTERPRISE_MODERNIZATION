import React, { useState, useRef } from 'react'
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface MessageComposerProps {
  conversationId: string
  onSendMessage: (messageData: {
    content: string
    attachments?: File[]
    replyToId?: string
  }) => void
  replyToMessage?: {
    id: string
    senderName: string
    content: string
  }
  onCancelReply?: () => void
  disabled?: boolean
}

export default function MessageComposer({
  conversationId,
  onSendMessage,
  replyToMessage,
  onCancelReply,
  disabled = false
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim() || attachments.length > 0) {
      onSendMessage({
        content: message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        replyToId: replyToMessage?.id
      })
      
      setMessage('')
      setAttachments([])
      if (onCancelReply) {
        onCancelReply()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  return (
    <div className="border-t bg-white p-4">
      {/* Reply indicator */}
      {replyToMessage && (
        <div className="mb-3 p-3 bg-gray-50 border-l-4 border-blue-500 rounded">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Replying to {replyToMessage.senderName}
              </p>
              <p className="text-sm text-gray-600 truncate max-w-md">
                {replyToMessage.content}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm"
            >
              <PaperClipIcon className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700">
                {file.name} ({formatFileSize(file.size)})
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            disabled={disabled}
          />
        </div>
        
        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0"
        >
          <PaperClipIcon className="w-4 h-4" />
        </Button>
        
        {/* Emoji button (placeholder for future implementation) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="shrink-0"
        >
          <FaceSmileIcon className="w-4 h-4" />
        </Button>
        
        {/* Send button */}
        <Button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="shrink-0"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </Button>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
      />
    </div>
  )
}
