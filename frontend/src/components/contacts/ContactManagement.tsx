import React, { useState, useEffect } from 'react';
import { Search, Filter, User, MapPin, DollarSign, Calendar, Star, Eye, Phone, Mail, MessageSquare } from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email1: string;
  phone_mobile: string;
  phone_work: string;
  assigned_user_id: string;
  contact_type_c: string;
  budget_min_c: number;
  budget_max_c: number;
  timeline_c: string;
  urgency_level_c: string;
  lead_quality_score_c: number;
  engagement_level_c: string;
  preferred_contact_method_c: string;
  last_activity_date_c: string;
  agent_first_name: string;
  agent_last_name: string;
  days_since_activity: number;
  budget_display: string;
}

interface ContactFilters {
  search: string;
  contact_type: string;
  agent_id: string;
  urgency_level: string;
  timeline: string;
  engagement_level: string;
}

export default function ContactManagement() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    contact_type: '',
    agent_id: '',
    urgency_level: '',
    timeline: '',
    engagement_level: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchContacts();
  }, [filters, pagination.page]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/v1/contacts-real-estate/contacts?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const result = await response.json();
      
      if (result.success) {
        setContacts(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          pages: result.pagination.pages
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ContactFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'very_high': return 'text-purple-600 bg-purple-50';
      case 'high': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-indigo-600 bg-indigo-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getActivityStatus = (days: number) => {
    if (days <= 3) return { text: 'Very Recent', color: 'text-green-600 bg-green-50' };
    if (days <= 7) return { text: 'Recent', color: 'text-blue-600 bg-blue-50' };
    if (days <= 14) return { text: 'Moderate', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'Stale', color: 'text-red-600 bg-red-50' };
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600">Manage your real estate contacts and their property interests</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search contacts by name, email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.contact_type}
                  onChange={(e) => handleFilterChange('contact_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="investor">Investor</option>
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.urgency_level}
                  onChange={(e) => handleFilterChange('urgency_level', e.target.value)}
                >
                  <option value="">All Urgency</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.timeline}
                  onChange={(e) => handleFilterChange('timeline', e.target.value)}
                >
                  <option value="">All Timelines</option>
                  <option value="immediate">Immediate</option>
                  <option value="1-3months">1-3 Months</option>
                  <option value="3-6months">3-6 Months</option>
                  <option value="6-12months">6-12 Months</option>
                  <option value="12+months">12+ Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engagement</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.engagement_level}
                  onChange={(e) => handleFilterChange('engagement_level', e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="very_high">Very High</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '',
                    contact_type: '',
                    agent_id: '',
                    urgency_level: '',
                    timeline: '',
                    engagement_level: ''
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline & Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => {
                const activityStatus = getActivityStatus(contact.days_since_activity || 0);
                
                return (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{contact.email1}</div>
                          <div className="text-sm text-gray-500">{contact.phone_mobile}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.contact_type_c === 'buyer' ? 'bg-blue-100 text-blue-800' :
                          contact.contact_type_c === 'seller' ? 'bg-green-100 text-green-800' :
                          contact.contact_type_c === 'investor' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.contact_type_c?.charAt(0).toUpperCase() + contact.contact_type_c?.slice(1)}
                        </span>
                        {contact.budget_display && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {contact.budget_display}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {contact.timeline_c && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {contact.timeline_c.replace('_', ' ')}
                          </div>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(contact.urgency_level_c)}`}>
                          {contact.urgency_level_c?.charAt(0).toUpperCase() + contact.urgency_level_c?.slice(1)} Urgency
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(contact.lead_quality_score_c || 0)}`}>
                          <Star className="h-3 w-3 mr-1" />
                          {contact.lead_quality_score_c || 0}/100
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getEngagementColor(contact.engagement_level_c)}`}>
                          {contact.engagement_level_c?.replace('_', ' ')}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activityStatus.color}`}>
                          {activityStatus.text}
                        </div>
                        {contact.last_activity_date_c && (
                          <div className="text-xs text-gray-500">
                            {Math.floor(contact.days_since_activity || 0)} days ago
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contact.agent_first_name} {contact.agent_last_name}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} contacts
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}

// Contact Detail Modal Component
interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
}

function ContactDetailModal({ contact, onClose }: ContactDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {contact.first_name} {contact.last_name} - Contact Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {contact.email1}</p>
                  <p><span className="font-medium">Mobile:</span> {contact.phone_mobile}</p>
                  <p><span className="font-medium">Work:</span> {contact.phone_work}</p>
                  <p><span className="font-medium">Preferred Contact:</span> {contact.preferred_contact_method_c}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Real Estate Profile</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Type:</span> {contact.contact_type_c}</p>
                  <p><span className="font-medium">Budget:</span> {contact.budget_display}</p>
                  <p><span className="font-medium">Timeline:</span> {contact.timeline_c}</p>
                  <p><span className="font-medium">Urgency:</span> {contact.urgency_level_c}</p>
                  <p><span className="font-medium">Lead Score:</span> {contact.lead_quality_score_c}/100</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
