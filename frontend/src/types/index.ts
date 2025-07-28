// Core entity types matching SuiteCRM structure
export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  avatar?: string
  isActive: boolean
  createdAt: string
  modifiedAt: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  mobile?: string
  title?: string
  description?: string
  accountId?: string
  accountName?: string
  assignedUserId: string
  assignedUserName: string
  // Real estate specific fields
  propertyInterests: PropertyInterest[]
  buyerProfile?: BuyerProfile
  sellerProfile?: SellerProfile
  preferredLocations: string[]
  budget?: {
    min: number
    max: number
  }
  createdAt: string
  modifiedAt: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  title?: string
  company?: string
  website?: string
  description?: string
  status: LeadStatus
  source: string
  assignedUserId?: string
  assignedUserName: string
  // Real estate specific fields
  propertyType: PropertyType
  budget?: {
    min: number
    max: number
  }
  preferredLocation: string
  timeline: string
  leadScore: number
  geolocation?: {
    lat: number
    lng: number
  }
  createdAt: string
  modifiedAt: string
}

export interface Account {
  id: string
  name: string
  website?: string
  phone?: string
  email?: string
  industry?: string
  description?: string
  assignedUserId: string
  assignedUserName: string
  // Address fields
  billingAddressStreet?: string
  billingAddressCity?: string
  billingAddressState?: string
  billingAddressZip?: string
  billingContactName?: string
  // Real estate specific
  accountType: 'Customer' | 'Prospect' | 'Partner' | 'Investor'
  opportunityCount?: number
  opportunityValue?: number
  createdAt: string
  modifiedAt: string
}

export interface Opportunity {
  id: string
  name: string
  accountId: string
  contactId?: string
  amount: number
  salesStage: SalesStage
  probability: number
  expectedCloseDate: string
  description?: string
  assignedUserId: string
  assignedUserName: string
  // Real estate specific
  propertyId?: string
  transactionType: 'Sale' | 'Purchase' | 'Lease' | 'Rental'
  commission: {
    rate: number
    amount: number
  }
  milestones: TransactionMilestone[]
  createdAt: string
  modifiedAt: string
}

export interface Property {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  propertyType: PropertyType
  listingPrice: number
  squareFootage: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number
  description: string
  features: string[]
  images: string[]
  status: PropertyStatus
  mlsNumber?: string
  listingAgentId: string
  createdAt: string
  modifiedAt: string
}

// Enums and utility types
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Dead'
export type SalesStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost'
export type PropertyType = 'Single Family' | 'Condo' | 'Townhouse' | 'Multi Family' | 'Commercial' | 'Land'
export type PropertyStatus = 'Active' | 'Under Contract' | 'Sold' | 'Withdrawn' | 'Expired'

export interface PropertyInterest {
  id: string
  propertyType: string
  budget?: {
    min: number
    max: number
  }
  location: string
  timeline: string
  status: 'Active' | 'Inactive' | 'Completed'
  priority: 'High' | 'Medium' | 'Low'
  bedrooms?: number
  bathrooms?: number
  squareFootage?: {
    min: number
    max: number
  }
  features?: string[]
  notes?: string
  propertyId?: string
  interestLevel?: 'High' | 'Medium' | 'Low'
  dateViewed?: string
  createdAt?: string
  modifiedAt?: string
}

export interface BuyerProfile {
  isFirstTimeBuyer?: boolean
  financingApproved?: boolean
  preApprovalAmount?: number
  downPaymentReady?: boolean
  creditScore?: number
  downPayment?: number
  preferredPropertyTypes?: PropertyType[]
  mustHaveFeatures?: string[]
  dealBreakers?: string[]
}

export interface SellerProfile {
  hasPropertyToSell?: boolean
  currentPropertyValue?: number
  reasonForSelling: string
  timeframeToSell?: string
  timeframe?: string
  expectedPrice?: number
  propertiesToSell?: string[]
}

export interface TransactionMilestone {
  id: string
  name: string
  description: string
  dueDate: string
  completed: boolean
  completedDate?: string
  assignedTo: string
}

// Dashboard specific types
export interface DashboardStats {
  totalContacts: number
  totalLeads: number
  totalOpportunities: number
  totalRevenue: number
  activePipeline: number
  closedDeals: number
  leadsThisMonth: number
  revenueThisMonth: number
  averageDealSize: number
  conversionRate: number
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface ActivityFeed {
  id: string
  type: 'lead_created' | 'contact_updated' | 'opportunity_won' | 'property_listed' | 'meeting_scheduled'
  title: string
  description: string
  timestamp: string
  userId: string
  userName: string
  entityId?: string
  entityType?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types for lead capture
export interface LeadCaptureForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  propertyType: PropertyType
  budget: {
    min: number
    max: number
  }
  preferredLocation: string
  timeline: string
  source: string
  notes?: string
}

// Calendar types
export type EventType = 'Meeting' | 'Call' | 'Property Showing' | 'Inspection' | 'Closing' | 'Task'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  startDate: string
  endDate?: string
  location?: string
  attendees?: string[]
  assignedUserId: string
  assignedUserName: string
  relatedContactId?: string
  relatedContactName?: string
  relatedAccountId?: string
  relatedAccountName?: string
  relatedOpportunityId?: string
  relatedOpportunityName?: string
}

// Activity types
export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note' | 'Property Showing'

export interface Activity {
  id: string
  subject: string
  description?: string
  type: ActivityType
  status: 'Pending' | 'In Progress' | 'Completed'
  priority?: 'High' | 'Medium' | 'Low'
  dueDate?: string
  assignedUserId: string
  assignedUserName: string
  relatedContactId?: string
  relatedContactName?: string
  relatedAccountId?: string
  relatedAccountName?: string
  relatedOpportunityId?: string
  relatedOpportunityName?: string
  dateCreated: string
}

// Report types
export type ReportType = 'Sales' | 'Lead' | 'Contact' | 'Account' | 'Property' | 'Activity' | 'Performance'

export interface Report {
  id: string
  name: string
  description?: string
  type: ReportType
  createdBy: string
  createdDate: string
  lastRun?: string
  parameters?: ReportParameter[]
}

export interface ReportParameter {
  name: string
  value: string
}

// Settings types
export interface SystemSettings {
  companyName: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  defaultCurrency: string
  dateFormat: string
  timeFormat: string
  language: string
}

// Navigation and UI types
export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
  badge?: number
}
