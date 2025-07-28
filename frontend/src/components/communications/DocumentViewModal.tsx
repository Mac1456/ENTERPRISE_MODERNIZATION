/**
 * ✅ ACTIVE COMPONENT - Document View Modal
 * 
 * Document viewing modal with share and signature functionality
 * Following patterns from other modal components
 * Last updated: Fix implementation - 2024-07-27
 */

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  XMarkIcon,
  DocumentTextIcon,
  ShareIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import { Document } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface DocumentViewModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  onShare?: (documentId: string) => void
  onRequestSignature?: (documentId: string) => void
}

export default function DocumentViewModal({
  isOpen,
  onClose,
  document,
  onShare,
  onRequestSignature
}: DocumentViewModalProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareEmails, setShareEmails] = useState('')

  const handleShare = async () => {
    if (!document) return
    
    setIsSharing(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onShare) {
        onShare(document.id)
      }
      
      toast.success(`Document shared successfully`)
      setShareEmails('')
    } catch (error) {
      toast.error('Failed to share document')
    } finally {
      setIsSharing(false)
    }
  }

  const handleRequestSignature = async () => {
    if (!document) return
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (onRequestSignature) {
        onRequestSignature(document.id)
      }
      
      toast.success('Signature request sent successfully')
    } catch (error) {
      toast.error('Failed to send signature request')
    }
  }

  const handleDownload = () => {
    if (!document) return
    
    // Simulate download
    toast.success('Download started')
    console.log('Downloading document:', document.name)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'complete':
        return 'default' // green
      case 'pending':
        return 'secondary' // yellow
      case 'partial':
        return 'outline' // blue
      default:
        return 'destructive' // red
    }
  }

  if (!document) return null

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {document.name}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">{document.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Document Info */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Uploaded By</label>
                      <p className="mt-1 text-sm text-gray-900">{document.uploadedByName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Upload Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">File Size</label>
                      <p className="mt-1 text-sm text-gray-900">{document.fileSize}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Signature Status</label>
                      <div className="mt-1">
                        {document.signatureStatus ? (
                          <Badge variant={getStatusBadgeVariant(document.signatureStatus)}>
                            {document.signatureStatus}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {document.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{document.description}</p>
                    </div>
                  )}

                  {/* Document Preview Placeholder */}
                  <Card>
                    <CardContent className="p-8 text-center">
                      <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Document preview coming soon</p>
                      <p className="text-sm text-gray-400">
                        Click the download button to view the full document
                      </p>
                    </CardContent>
                  </Card>

                  {/* Share Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Share Document</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email addresses (comma separated)
                        </label>
                        <textarea
                          value={shareEmails}
                          onChange={(e) => setShareEmails(e.target.value)}
                          placeholder="john@example.com, jane@example.com"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <Button
                        onClick={handleShare}
                        disabled={isSharing || !shareEmails.trim()}
                        className="w-full"
                      >
                        <ShareIcon className="w-4 h-4 mr-2" />
                        {isSharing ? 'Sharing...' : 'Share Document'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                    {document.requiresSignature && (
                      <Button
                        onClick={handleRequestSignature}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Request Signature</span>
                      </Button>
                    )}
                  </div>
                  <Button onClick={onClose} variant="outline">
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
