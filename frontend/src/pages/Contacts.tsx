import React, { useState, useEffect } from 'react'
import { Contact, PropertyInterest, BuyerProfile, SellerProfile, PropertyType } from '../types'
import CRMHubDataTable from '../components/shared/CRMHubDataTable'
import ContactModal from '../components/contacts/ContactModal'
import { apiService } from '../services/api'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface ContactsProps {}

// Helper functions for contact type display
const getContactTypeIcon = (contact: Contact) => {
  if (contact.buyerProfile) return <HomeIcon className="h-4 w-4 text-blue-500" />
  if (contact.sellerProfile) return <BuildingOfficeIcon className="h-4 w-4 text-green-500" />
  return <UserGroupIcon className="h-4 w-4 text-gray-500" />
}

const getContactTypeLabel = (contact: Contact) => {
  if (contact.buyerProfile && contact.sellerProfile) return 'Buyer/Seller'
  if (contact.buyerProfile) return 'Buyer'
  if (contact.sellerProfile) return 'Seller'
  return 'Contact'
}

const Contacts: React.FC<ContactsProps> = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'buyer' | 'seller' | 'investor'>('all')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<{success: boolean, data: Contact[]}>('/contacts')
      setContacts(response.data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts(mockContacts) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
  }

  const handleContactSave = (contact: Contact) => {
    if (editingContact) {
      // Update existing contact
      setContacts(prev => prev.map(c => c.id === contact.id ? contact : c))
    } else {
      // Add new contact
      setContacts(prev => [...prev, contact])
    }
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingContact(null)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setIsEditModalOpen(true)
    setSelectedContact(null) // Close detail panel
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'buyer') return matchesSearch && contact.buyerProfile
    if (filterStatus === 'seller') return matchesSearch && contact.sellerProfile
    if (filterStatus === 'investor') return matchesSearch && contact.accountName?.toLowerCase().includes('investor')
    
    return matchesSearch
  })

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value: any, contact: Contact) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {contact.firstName[0]}{contact.lastName[0]}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </p>
            <div className="flex items-center space-x-1">
              {getContactTypeIcon(contact)}
              <span className="text-xs text-gray-500">{getContactTypeLabel(contact)}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact Info',
      render: (value: any, contact: Contact) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{contact.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{contact.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'propertyInterests',
      title: 'Property Interests',
      render: (value: any, contact: Contact) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{contact.propertyInterests?.length || 0} properties</span>
          </div>
          {contact.budget && (
            <div className="text-xs text-gray-500">
              Budget: ${contact.budget.min.toLocaleString()} - ${contact.budget.max.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      title: 'Preferred Locations',
      render: (value: any, contact: Contact) => (
        <div className="space-y-1">
          {contact.preferredLocations?.slice(0, 2).map((location, index) => (
            <div key={index} className="flex items-center space-x-1">
              <MapPinIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">{location}</span>
            </div>
          ))}
          {(contact.preferredLocations?.length || 0) > 2 && (
            <span className="text-xs text-gray-400">+{(contact.preferredLocations?.length || 0) - 2} more</span>
          )}
        </div>
      )
    },
    {
      key: 'assignedUser',
      title: 'Assigned Agent',
      render: (value: any, contact: Contact) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900">{contact.assignedUserName}</span>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your real estate contacts and property interests
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Contacts</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                  <option value="investor">Investors</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredContacts.length} of {contacts.length} contacts
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <CRMHubDataTable
            data={filteredContacts}
            columns={columns}
            loading={loading}
            onRowClick={handleContactClick}
          />
        </div>
      </div>

      {/* Contact Detail Panel */}
      {selectedContact && (
        <ContactDetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={() => fetchContacts()}
          onEdit={handleEditContact}
        />
      )}

      {/* Create Contact Modal */}
      <ContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleContactSave}
      />

      {/* Edit Contact Modal */}
      <ContactModal
        contact={editingContact}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingContact(null)
        }}
        onSave={handleContactSave}
      />
    </div>
  )
}

// Contact Detail Panel Component
const ContactDetailPanel: React.FC<{
  contact: Contact
  onClose: () => void
  onUpdate: () => void
  onEdit: (contact: Contact) => void
}> = ({ contact, onClose, onUpdate, onEdit }) => {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Contact Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-xl">
                  {contact.firstName[0]}{contact.lastName[0]}
                </span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h4>
                <p className="text-sm text-gray-500">{getContactTypeLabel(contact)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{contact.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{contact.phone}</span>
              </div>
              {contact.mobile && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{contact.mobile} (Mobile)</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget & Preferences */}
          {contact.budget && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Budget Range</h5>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-lg font-semibold text-green-600">
                  ${contact.budget.min.toLocaleString()} - ${contact.budget.max.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Preferred Locations */}
          {contact.preferredLocations && contact.preferredLocations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Preferred Locations</h5>
              <div className="space-y-2">
                {contact.preferredLocations.map((location, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Interests */}
          {contact.propertyInterests && contact.propertyInterests.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Property Interests</h5>
              <div className="space-y-3">
                {contact.propertyInterests.map((interest, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Property #{interest.propertyId}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < (interest.interestLevel === 'High' ? 3 : interest.interestLevel === 'Medium' ? 2 : 1)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{interest.notes}</p>
                    {interest.dateViewed && (
                      <p className="text-xs text-gray-500 mt-1">
                        Viewed: {new Date(interest.dateViewed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buyer Profile */}
          {contact.buyerProfile && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Buyer Profile</h5>
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                {contact.buyerProfile.preApprovalAmount && (
                  <div>
                    <span className="text-xs text-gray-600">Pre-approval:</span>
                    <span className="ml-2 text-sm font-medium">${contact.buyerProfile.preApprovalAmount.toLocaleString()}</span>
                  </div>
                )}
                {contact.buyerProfile.downPayment && (
                  <div>
                    <span className="text-xs text-gray-600">Down payment:</span>
                    <span className="ml-2 text-sm font-medium">${contact.buyerProfile.downPayment.toLocaleString()}</span>
                  </div>
                )}
                {contact.buyerProfile.preferredPropertyTypes.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600">Preferred types:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {contact.buyerProfile.preferredPropertyTypes.map((type, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seller Profile */}
          {contact.sellerProfile && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Seller Profile</h5>
              <div className="bg-green-50 rounded-lg p-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-600">Reason for selling:</span>
                  <p className="text-sm mt-1">{contact.sellerProfile.reasonForSelling}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Timeframe:</span>
                  <span className="ml-2 text-sm font-medium">{contact.sellerProfile.timeframe}</span>
                </div>
                {contact.sellerProfile.expectedPrice && (
                  <div>
                    <span className="text-xs text-gray-600">Expected price:</span>
                    <span className="ml-2 text-sm font-medium">${contact.sellerProfile.expectedPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button 
            onClick={() => onEdit(contact)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Contact
          </button>
        </div>
      </div>
    </div>
  )
}

// Mock data for development
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    mobile: '(555) 987-6543',
    title: 'Marketing Director',
    accountId: '1',
    accountName: 'Johnson Family Trust',
    assignedUserId: '1',
    assignedUserName: 'Mike Smith',
    propertyInterests: [
      {
        propertyId: '101',
        interestLevel: 'High',
        notes: 'Perfect location near schools',
        dateViewed: '2024-01-15'
      },
      {
        propertyId: '102',
        interestLevel: 'Medium',
        notes: 'Good backup option',
        dateViewed: '2024-01-18'
      }
    ],
    buyerProfile: {
      preApprovalAmount: 650000,
      downPayment: 130000,
      preferredPropertyTypes: ['Single Family', 'Condo'],
      mustHaveFeatures: ['3+ bedrooms', 'garage', 'updated kitchen'],
      dealBreakers: ['busy street', 'no parking']
    },
    preferredLocations: ['Downtown', 'Westside', 'Suburbs North'],
    budget: { min: 500000, max: 700000 },
    createdAt: '2024-01-10T10:00:00Z',
    modifiedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@email.com',
    phone: '(555) 234-5678',
    title: 'Real Estate Investor',
    assignedUserId: '2',
    assignedUserName: 'Lisa Rodriguez',
    propertyInterests: [
      {
        propertyId: '201',
        interestLevel: 'High',
        notes: 'Great rental potential',
        dateViewed: '2024-01-22'
      }
    ],
    sellerProfile: {
      reasonForSelling: 'Relocating for work',
      timeframe: '3-6 months',
      expectedPrice: 875000,
      propertiesToSell: ['456 Oak Street']
    },
    preferredLocations: ['Investment Districts', 'Emerging Areas'],
    budget: { min: 400000, max: 1200000 },
    createdAt: '2024-01-05T14:00:00Z',
    modifiedAt: '2024-01-22T09:15:00Z'
  }
]

export default Contacts
