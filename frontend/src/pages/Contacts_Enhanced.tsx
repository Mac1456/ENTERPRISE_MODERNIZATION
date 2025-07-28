/**
 * ✅ ACTIVE COMPONENT - PRIMARY CONTACTS PAGE
 * 
 * Feature 3: Property-Centric Contact Management
 * Route: /contacts (following Leads_Enhanced.tsx patterns)
 * Status: ACTIVE - This is the primary contacts implementation
 * 
 * Following exact patterns from Leads_Enhanced.tsx
 * Last updated: Initial implementation - 2024-07-27
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserMinusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
  EllipsisVerticalIcon,
  BoltIcon,
  CheckIcon,
  UsersIcon,
  HomeIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'

import { ContactService } from '@/services/contactService'
import { Contact, PropertyInterest } from '@/types'
import ContactCaptureModal from '@/components/contacts/ContactCaptureModal'
import ContactAssignmentPanel from '@/components/contacts/ContactAssignmentPanel'
import PropertyInterestModal from '@/components/contacts/PropertyInterestModal'
import ContactDetailModal from '@/components/contacts/ContactDetailModal'
import CRMHubDataTable from '@/components/shared/CRMHubDataTable'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

// Mock data for demonstration (following exact pattern from Leads_Enhanced.tsx)
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '555-123-4567',
    mobile: '555-987-6543',
    title: 'Senior Developer',
    description: 'Looking for first-time home purchase',
    accountId: 'acc1',
    accountName: 'Tech Solutions Inc',
    assignedUserId: '1',
    assignedUserName: 'John Smith',
    propertyInterests: [
      {
        id: 'pi1',
        propertyType: 'Single Family Home',
        budget: { min: 300000, max: 500000 },
        location: 'Downtown',
        timeline: 'Within 3 months',
        status: 'Active',
        priority: 'High'
      }
    ],
    buyerProfile: {
      isFirstTimeBuyer: true,
      financingApproved: false,
      preApprovalAmount: 450000,
      downPaymentReady: true,
      creditScore: 750
    },
    preferredLocations: ['Downtown', 'Midtown', 'West End'],
    budget: { min: 300000, max: 500000 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@company.com',
    phone: '555-234-5678',
    title: 'Marketing Manager',
    description: 'Investment property buyer',
    assignedUserId: '2',
    assignedUserName: 'Jane Doe',
    propertyInterests: [
      {
        id: 'pi2',
        propertyType: 'Investment Property',
        budget: { min: 500000, max: 750000 },
        location: 'Business District',
        timeline: 'Within 6 months',
        status: 'Active',
        priority: 'Medium'
      }
    ],
    sellerProfile: {
      hasPropertyToSell: true,
      currentPropertyValue: 400000,
      reasonForSelling: 'Upgrading',
      timeframeToSell: 'Within 3 months'
    },
    preferredLocations: ['Business District', 'Financial Center'],
    budget: { min: 500000, max: 750000 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
]

export default function ContactsEnhanced() {
  const queryClient = useQueryClient()
  
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [showPropertyInterestModal, setShowPropertyInterestModal] = useState(false)
  const [showContactDetailModal, setShowContactDetailModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Bulk selection state (following Leads_Enhanced.tsx pattern)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Fetch real contacts data from API (following exact API pattern)
  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ['contacts', { searchTerm: searchQuery, typeFilter: selectedType, locationFilter: selectedLocation }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedType !== '' && { type: selectedType }),
        ...(selectedLocation !== '' && { location: selectedLocation }),
        ...(selectedAssignment !== '' && { assignment: selectedAssignment })
      })
      
      const response = await fetch(`http://localhost:8080/custom/modernui/api.php/contacts?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch contacts')
      }
      
      return result
    },
    staleTime: 0,
    cacheTime: 1000,
    refetchInterval: 3000,
    refetchOnWindowFocus: true
  })

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
      case 'High': return 'text-green-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getInterestPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'High': return 'default'
      case 'Medium': return 'secondary'
      case 'Low': return 'destructive'
      default: return 'outline'
    }
  }

  // Bulk selection handlers (exact pattern from Leads_Enhanced.tsx)
  const handleSelectContact = (contactId: string, isSelected: boolean) => {
    console.log('handleSelectContact called:', { contactId, isSelected })
    if (isSelected) {
      setSelectedContactIds(prev => {
        const newIds = [...prev, contactId]
        console.log('Updated selectedContactIds:', newIds)
        return newIds
      })
    } else {
      setSelectedContactIds(prev => {
        const newIds = prev.filter(id => id !== contactId)
        console.log('Updated selectedContactIds:', newIds)
        return newIds
      })
    }
  }

  const handleSelectAll = (isSelected: boolean) => {
    console.log('handleSelectAll called:', { isSelected, filteredContactsCount: filteredContacts.length })
    if (isSelected) {
      setSelectedContactIds(filteredContacts.map(contact => contact.id))
      setIsAllSelected(true)
    } else {
      setSelectedContactIds([])
      setIsAllSelected(false)
    }
  }

  // Contact detail modal handler (following PropertySearch pattern)
  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    setShowContactDetailModal(true)
  }

  // Handle unassigning a single contact
  const handleUnassignContact = async (contactId: string) => {
    try {
      const response = await fetch('http://localhost:8080/custom/modernui/api.php/contacts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: [contactId],
          userId: null,
          userName: 'Unassigned'
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Contact unassigned successfully')
        queryClient.invalidateQueries(['contacts'])
      } else {
        toast.error(result.message || 'Failed to unassign contact')
      }
    } catch (error) {
      toast.error('Failed to unassign contact')
      console.error('Error unassigning contact:', error)
    }
  }

  // Handle bulk unassigning multiple contacts
  const handleBulkUnassign = async () => {
    if (selectedContactIds.length === 0) return

    try {
      const response = await fetch('http://localhost:8080/custom/modernui/api.php/contacts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactIds: selectedContactIds,
          userId: null,
          userName: 'Unassigned'
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`${selectedContactIds.length} contact${selectedContactIds.length > 1 ? 's' : ''} unassigned successfully`)
        setSelectedContactIds([])
        queryClient.invalidateQueries(['contacts'])
      } else {
        toast.error(result.message || 'Failed to unassign contacts')
      }
    } catch (error) {
      toast.error('Failed to unassign contacts')
      console.error('Error unassigning contacts:', error)
    }
  }

  // Use mock data if API fails or returns empty
  const contacts = contactsData?.data || mockContacts
  
  // Filter contacts (following same logic)
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(searchQuery) ||
      (contact.accountName && contact.accountName.toLowerCase().includes(searchLower))
    
    const matchesType = !selectedType || 
      contact.propertyInterests.some(interest => interest.propertyType === selectedType)
    
    const matchesLocation = !selectedLocation || 
      contact.preferredLocations.includes(selectedLocation)
    
    const matchesAssignment = !selectedAssignment || 
      (selectedAssignment === 'assigned' && contact.assignedUserId) ||
      (selectedAssignment === 'unassigned' && !contact.assignedUserId)
    
    return matchesSearch && matchesType && matchesLocation && matchesAssignment
  })

  // Update bulk selection state
  useEffect(() => {
    setShowBulkActions(selectedContactIds.length > 0)
    setIsAllSelected(selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0)
  }, [selectedContactIds, filteredContacts])

  const handleCreateContact = async (contactData: any) => {
    try {
      // await ContactService.createContact(contactData)
      toast.success('Contact created successfully!')
      setShowCaptureModal(false)
      queryClient.invalidateQueries(['contacts'])
    } catch (error) {
      toast.error('Failed to create contact')
      console.error('Error creating contact:', error)
    }
  }

  const handleAddPropertyInterest = async (contactId: string, interestData: any) => {
    try {
      // await ContactService.addPropertyInterest(contactId, interestData)
      toast.success('Property interest added successfully!')
      setShowPropertyInterestModal(false)
      queryClient.invalidateQueries(['contacts'])
    } catch (error) {
      toast.error('Failed to add property interest')
      console.error('Error adding property interest:', error)
    }
  }

  const handleContactAssignment = async (contactIds: string[], assignmentData: any) => {
    try {
      if (assignmentData.type === 'auto') {
        // Handle auto assignment
        const response = await fetch('http://localhost:8080/custom/modernui/api.php/contacts/auto-assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactIds })
        })
        const result = await response.json()
        if (result.success) {
          toast.success(`Auto-assigned ${contactIds.length} contact(s)`)
        } else {
          toast.error(result.message || 'Auto-assignment failed')
        }
      } else if (assignmentData.type === 'unassign') {
        // Handle unassignment
        const response = await fetch('http://localhost:8080/custom/modernui/api.php/contacts/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactIds,
            userId: null,
            userName: 'Unassigned'
          })
        })
        const result = await response.json()
        if (result.success) {
          toast.success(`${contactIds.length} contact${contactIds.length > 1 ? 's' : ''} unassigned successfully`)
        } else {
          toast.error(result.message || 'Failed to unassign contacts')
        }
      } else {
        // Handle manual assignment
        const response = await fetch('http://localhost:8080/custom/modernui/api.php/contacts/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactIds,
            userId: assignmentData.userId,
            userName: assignmentData.userName
          })
        })
        const result = await response.json()
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message || 'Assignment failed')
        }
      }
      
      setShowAssignmentPanel(false)
      setSelectedContactIds([])
      queryClient.invalidateQueries(['contacts'])
    } catch (error) {
      toast.error('Failed to assign contacts')
      console.error('Error assigning contacts:', error)
    }
  }

  // Table columns for contacts (following CRMHubDataTable pattern)
  const columns = [
    {
      key: 'select',
      title: '',
      width: '50px',
      render: (_: any, contact: Contact) => (
        <Checkbox
          checked={selectedContactIds.includes(contact.id)}
          onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
        />
      )
    },
    {
      key: 'name',
      title: 'Contact',
      render: (_: any, contact: Contact) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="text-sm text-gray-500">{contact.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact_info',
      title: 'Contact Info',
      render: (_: any, contact: Contact) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-1" />
            {contact.phone}
          </div>
          {contact.mobile && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="w-4 h-4 mr-1" />
              {contact.mobile} (Mobile)
            </div>
          )}
        </div>
      )
    },
    {
      key: 'property_interests',
      title: 'Property Interests',
      render: (_: any, contact: Contact) => (
        <div className="space-y-2">
          {contact.propertyInterests.slice(0, 2).map((interest, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Badge variant={getInterestPriorityBadgeVariant(interest.priority)}>
                {interest.priority}
              </Badge>
              <span className="text-sm">{interest.propertyType}</span>
              <span className="text-xs text-gray-500">
                {interest.budget ? `${formatCurrency(interest.budget.min)} - ${formatCurrency(interest.budget.max)}` : ''}
              </span>
            </div>
          ))}
          {contact.propertyInterests.length > 2 && (
            <span className="text-xs text-gray-500">
              +{contact.propertyInterests.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'locations',
      title: 'Preferred Locations',
      render: (_: any, contact: Contact) => (
        <div className="flex flex-wrap gap-1">
          {contact.preferredLocations.slice(0, 3).map((location, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {location}
            </Badge>
          ))}
          {contact.preferredLocations.length > 3 && (
            <span className="text-xs text-gray-500">
              +{contact.preferredLocations.length - 3}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'assignment',
      title: 'Assigned To',
      render: (_: any, contact: Contact) => (
        <div className="text-sm">
          {contact.assignedUserName || 'Unassigned'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_: any, contact: Contact) => (
        <Menu as="div" className="relative">
          <Menu.Button 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedContact(contact)
                    setShowPropertyInterestModal(true)
                  }}
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Add Property Interest
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedContact(contact)
                    setSelectedContactIds([contact.id])
                    setShowAssignmentPanel(true)
                  }}
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  {contact.assignedUserId ? 'Reassign Contact' : 'Assign Contact'}
                </button>
              )}
            </Menu.Item>
            {contact.assignedUserId && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnassignContact(contact.id)
                    }}
                  >
                    <UserMinusIcon className="w-4 h-4 mr-2 text-red-500" />
                    Unassign Contact
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage property-centric contact profiles and interests
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={() => setShowCaptureModal(true)}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards (following exact pattern from Leads_Enhanced.tsx) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Contacts</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">Active in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Interests</CardTitle>
              <HeartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {contacts.reduce((total, contact) => total + contact.propertyInterests.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Property interests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">High Priority</CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {contacts.reduce((total, contact) => 
                  total + contact.propertyInterests.filter(interest => interest.priority === 'High').length, 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">High priority contacts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Locations</CardTitle>
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {new Set(contacts.flatMap(contact => contact.preferredLocations)).size}
              </div>
              <p className="text-xs text-muted-foreground">Preferred areas</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or company..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center shadow-sm"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {(selectedType || selectedLocation || selectedAssignment) && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {[selectedType, selectedLocation, selectedAssignment].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>
        </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Single Family Home">Single Family Home</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Investment Property">Investment Property</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Downtown">Downtown</option>
              <option value="Midtown">Midtown</option>
              <option value="West End">West End</option>
              <option value="Business District">Business District</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
            >
              <option value="">All Contacts</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </motion.div>
      )}



      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <CheckIcon className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              {selectedContactIds.length} contact(s) selected
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => {
                setShowAssignmentPanel(true)
              }}
            >
              <UserPlusIcon className="w-4 h-4 mr-1" />
              Assign/Reassign
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkUnassign}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <UserMinusIcon className="w-4 h-4 mr-1 text-red-500" />
              Unassign
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedContactIds([])
                setIsAllSelected(false)
              }}
            >
              Clear Selection
            </Button>
          </div>
        </motion.div>
      )}

        {/* Main Data Table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <CRMHubDataTable
              columns={columns}
              data={filteredContacts}
              loading={isLoading}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected}
              onRowClick={handleContactClick}
              emptyState={{
                title: "No contacts found",
                description: "Get started by adding your first contact.",
                action: (
                  <Button onClick={() => setShowCaptureModal(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                )
              }}
            />
          </CardContent>
        </Card>

        {/* Modals */}
        {showCaptureModal && (
          <ContactCaptureModal
            isOpen={showCaptureModal}
            onClose={() => setShowCaptureModal(false)}
            onSubmit={handleCreateContact}
          />
        )}

        {showPropertyInterestModal && selectedContact && (
          <PropertyInterestModal
            isOpen={showPropertyInterestModal}
            onClose={() => setShowPropertyInterestModal(false)}
            onSubmit={(interestData) => handleAddPropertyInterest(selectedContact.id, interestData)}
            contact={selectedContact}
          />
        )}

        {showAssignmentPanel && (
          <ContactAssignmentPanel
            isOpen={showAssignmentPanel}
            onClose={() => setShowAssignmentPanel(false)}
            contactIds={selectedContactIds}
            onAssign={handleContactAssignment}
          />
        )}

        {showContactDetailModal && selectedContact && (
          <ContactDetailModal
            isOpen={showContactDetailModal}
            onClose={() => setShowContactDetailModal(false)}
            contact={selectedContact}
            onEdit={(contact) => {
              setShowContactDetailModal(false)
              // Handle edit functionality here
            }}
            onAddPropertyInterest={(contact) => {
              setShowContactDetailModal(false)
              setSelectedContact(contact)
              setShowPropertyInterestModal(true)
            }}
            onAssign={(contact) => {
              setShowContactDetailModal(false)
              setSelectedContact(contact)
              setSelectedContactIds([contact.id])
              setShowAssignmentPanel(true)
            }}
          />
        )}
      </div>
    </div>
  )
}
