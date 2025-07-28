import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, DocumentArrowUpIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (documentData: any) => void
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit
}: DocumentUploadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    tags: '',
    relatedContactId: '',
    relatedPropertyId: '',
    requiresSignature: false,
    signerEmails: ''
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Please select a file to upload')
      return
    }

    const documentFormData = new FormData()
    documentFormData.append('file', selectedFile)
    documentFormData.append('name', formData.name || selectedFile.name)
    documentFormData.append('description', formData.description)
    documentFormData.append('category', formData.category)
    documentFormData.append('tags', formData.tags)
    documentFormData.append('relatedContactId', formData.relatedContactId)
    documentFormData.append('relatedPropertyId', formData.relatedPropertyId)
    documentFormData.append('requiresSignature', formData.requiresSignature.toString())
    
    if (formData.requiresSignature && formData.signerEmails) {
      documentFormData.append('signerEmails', formData.signerEmails)
    }
    
    onSubmit(documentFormData)
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: 'other',
      tags: '',
      relatedContactId: '',
      relatedPropertyId: '',
      requiresSignature: false,
      signerEmails: ''
    })
    setSelectedFile(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    if (!formData.name) {
      setFormData(prev => ({
        ...prev,
        name: file.name
      }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DocumentArrowUpIcon className="w-5 h-5" />
              Upload Document
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <PaperClipIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </span>
                    </div>
                  ) : (
                    <div>
                      <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop a file here, or{' '}
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0])
                      }
                    }}
                  />
                </div>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contract">Contract</option>
                  <option value="listing">Listing</option>
                  <option value="inspection">Inspection</option>
                  <option value="financial">Financial</option>
                  <option value="legal">Legal</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the document"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contract, urgent, review"
                />
              </div>

              {/* Signature Required */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="requiresSignature"
                  checked={formData.requiresSignature}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Requires Digital Signature
                </label>
              </div>

              {/* Signer Emails (conditional) */}
              {formData.requiresSignature && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signer Email Addresses (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="signerEmails"
                    value={formData.signerEmails}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com, jane@example.com"
                  />
                </div>
              )}

              {/* Related Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Contact ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedContactId"
                  value={formData.relatedContactId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact ID"
                />
              </div>

              {/* Related Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Property ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedPropertyId"
                  value={formData.relatedPropertyId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Property ID"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedFile}>
                  Upload Document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
