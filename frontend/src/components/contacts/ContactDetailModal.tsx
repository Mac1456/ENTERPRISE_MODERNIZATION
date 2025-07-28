/**
 * ✅ ACTIVE COMPONENT - Contact Detail Modal
 * 
 * Full contact detail view with property interests, buyer/seller profiles, and action buttons
 * Following patterns from ConversationViewModal and other modal components
 * Last updated: Initial implementation - 2024-07-28
 */

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  BanknotesIcon,
  UserPlusIcon,
  UserMinusIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface ContactDetailModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onEdit?: (contact: Contact) => void
  onAddPropertyInterest?: (contact: Contact) => void
  onAssign?: (contact: Contact) => void
  onUnassign?: (contact: Contact) => void
}

export default function ContactDetailModal({
  isOpen,
  onClose,
  contact,
  onEdit,
  onAddPropertyInterest,
  onAssign,
  onUnassign
}: ContactDetailModalProps) {
  if (!contact) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInterestPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEdit = () => {
    onEdit?.(contact)
    toast.success('Edit functionality not yet implemented')
  }

  const handleAddPropertyInterest = () => {
    onAddPropertyInterest?.(contact)
  }

  const handleAssign = () => {
    onAssign?.(contact)
  }

  const handleUnassign = () => {
    onUnassign?.(contact)
  }

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
              <Dialog.Panel className="w-full max-w-3xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">{contact.title || 'Contact'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={handleEdit}>
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Contact Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <UserIcon className="w-5 h-5 mr-2" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{contact.email}</div>
                              <div className="text-sm text-gray-500">Primary Email</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <PhoneIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{contact.phone}</div>
                              <div className="text-sm text-gray-500">Primary Phone</div>
                            </div>
                          </div>
                          
                          {contact.mobile && (
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium">{contact.mobile}</div>
                                <div className="text-sm text-gray-500">Mobile</div>
                              </div>
                            </div>
                          )}

                          {contact.accountName && (
                            <div className="flex items-center space-x-3">
                              <UserIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium">{contact.accountName}</div>
                                <div className="text-sm text-gray-500">Company</div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                              </div>
                              <div className="text-sm text-gray-500">Contact Created</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <UserPlusIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{contact.assignedUserName || 'Unassigned'}</div>
                              <div className="text-sm text-gray-500">Assigned Agent</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Buyer Profile */}
                      {contact.buyerProfile && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <HomeIcon className="w-5 h-5 mr-2" />
                              Buyer Profile
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-500">First Time Buyer</div>
                                <div className="font-medium">
                                  {contact.buyerProfile.isFirstTimeBuyer ? 'Yes' : 'No'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Financing Approved</div>
                                <div className="font-medium">
                                  {contact.buyerProfile.financingApproved ? 'Yes' : 'No'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Pre-approval Amount</div>
                                <div className="font-medium">
                                  {formatCurrency(contact.buyerProfile.preApprovalAmount || 0)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Credit Score</div>
                                <div className="font-medium">
                                  {contact.buyerProfile.creditScore || 'Not provided'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Seller Profile */}
                      {contact.sellerProfile && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <BanknotesIcon className="w-5 h-5 mr-2" />
                              Seller Profile
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-500">Has Property to Sell</div>
                                <div className="font-medium">
                                  {contact.sellerProfile.hasPropertyToSell ? 'Yes' : 'No'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Current Property Value</div>
                                <div className="font-medium">
                                  {formatCurrency(contact.sellerProfile.currentPropertyValue || 0)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Reason for Selling</div>
                                <div className="font-medium">
                                  {contact.sellerProfile.reasonForSelling || 'Not specified'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Timeframe to Sell</div>
                                <div className="font-medium">
                                  {contact.sellerProfile.timeframeToSell || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Property Interests */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center">
                            <HomeIcon className="w-5 h-5 mr-2" />
                            Property Interests
                          </CardTitle>
                          <Button size="sm" onClick={handleAddPropertyInterest}>
                            <HomeIcon className="w-4 h-4 mr-2" />
                            Add Interest
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {contact.propertyInterests.length > 0 ? (
                            <div className="space-y-4">
                              {contact.propertyInterests.map((interest, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">{interest.propertyType}</h4>
                                    <Badge className={getInterestPriorityColor(interest.priority)}>
                                      {interest.priority}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <div className="text-gray-500">Budget</div>
                                      <div className="font-medium">
                                        {interest.budget ? 
                                          `${formatCurrency(interest.budget.min)} - ${formatCurrency(interest.budget.max)}` 
                                          : 'Not specified'
                                        }
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Location</div>
                                      <div className="font-medium">{interest.location}</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Timeline</div>
                                      <div className="font-medium">{interest.timeline}</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Status</div>
                                      <div className="font-medium">{interest.status}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <HomeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>No property interests recorded</p>
                              <Button size="sm" className="mt-3" onClick={handleAddPropertyInterest}>
                                Add First Interest
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Preferred Locations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <MapPinIcon className="w-5 h-5 mr-2" />
                            Preferred Locations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {contact.preferredLocations.map((location, index) => (
                              <Badge key={index} variant="outline" className="flex items-center">
                                <MapPinIcon className="w-3 h-3 mr-1" />
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Budget Information */}
                      {contact.budget && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                              Budget Range
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(contact.budget.min)} - {formatCurrency(contact.budget.max)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">Overall budget range</div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Description */}
                      {contact.description && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Notes & Description</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700">{contact.description}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <div className="flex space-x-2">
                    {contact.assignedUserId ? (
                      <>
                        <Button variant="outline" onClick={handleUnassign} className="border-red-200 text-red-600 hover:bg-red-50">
                          <UserMinusIcon className="w-4 h-4 mr-2" />
                          Unassign Contact
                        </Button>
                        <Button onClick={handleAssign}>
                          <UserPlusIcon className="w-4 h-4 mr-2" />
                          Reassign Contact
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleAssign}>
                        <UserPlusIcon className="w-4 h-4 mr-2" />
                        Assign Contact
                      </Button>
                    )}
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
