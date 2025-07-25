import React, { useState, useEffect } from 'react';
import { Heart, Home, MapPin, DollarSign, Star, Calendar, Eye, Plus, Trash2, Edit3 } from 'lucide-react';

interface PropertyInterest {
  id: string;
  property_id: string;
  property_name: string;
  street_address: string;
  city: string;
  state: string;
  list_price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  interest_level: string;
  interest_date: string;
  notes: string;
  follow_up_date: string;
  status: string;
}

interface PropertyInterestTrackerProps {
  contactId: string;
}

export default function PropertyInterestTracker({ contactId }: PropertyInterestTrackerProps) {
  const [interests, setInterests] = useState<PropertyInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInterest, setEditingInterest] = useState<PropertyInterest | null>(null);

  useEffect(() => {
    if (contactId) {
      fetchPropertyInterests();
    }
  }, [contactId]);

  const fetchPropertyInterests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/contacts-real-estate/property-interests?contact_id=${contactId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch property interests');
      }

      const result = await response.json();
      
      if (result.success) {
        setInterests(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch property interests');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case 'favorite': return 'text-red-600 bg-red-50 border-red-200';
      case 'very_interested': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'interested': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'not_interested': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInterestIcon = (level: string) => {
    switch (level) {
      case 'favorite': return <Heart className="h-4 w-4 fill-current" />;
      case 'very_interested': return <Star className="h-4 w-4 fill-current" />;
      case 'interested': return <Star className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Property Interests</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Interest
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {interests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No property interests tracked yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map((interest) => (
            <div key={interest.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{interest.property_name}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getInterestLevelColor(interest.interest_level)}`}>
                      {getInterestIcon(interest.interest_level)}
                      {interest.interest_level.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{interest.street_address}, {interest.city}, {interest.state}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(interest.list_price)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Home className="h-4 w-4" />
                      <span>{interest.property_type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{interest.bedrooms} bed, {interest.bathrooms} bath</span>
                    </div>
                  </div>

                  {interest.square_footage && (
                    <div className="text-sm text-gray-600 mb-2">
                      {interest.square_footage.toLocaleString()} sq ft
                    </div>
                  )}

                  {interest.notes && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Notes:</strong> {interest.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Added {formatDate(interest.interest_date)}</span>
                    </div>
                    {interest.follow_up_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Follow-up {formatDate(interest.follow_up_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/properties/${interest.property_id}`, '_blank')}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="View Property"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingInterest(interest)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                    title="Edit Interest"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removePropertyInterest(interest.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove Interest"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Interest Modal */}
      {showAddModal && (
        <AddPropertyInterestModal
          contactId={contactId}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchPropertyInterests();
          }}
        />
      )}

      {/* Edit Interest Modal */}
      {editingInterest && (
        <EditPropertyInterestModal
          interest={editingInterest}
          onClose={() => setEditingInterest(null)}
          onSave={() => {
            setEditingInterest(null);
            fetchPropertyInterests();
          }}
        />
      )}
    </div>
  );

  async function removePropertyInterest(interestId: string) {
    if (!confirm('Are you sure you want to remove this property interest?')) {
      return;
    }

    try {
      const response = await fetch('/api/v1/contacts-real-estate/property-interest', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interest_id: interestId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove property interest');
      }

      await fetchPropertyInterests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }
}

// Add Property Interest Modal
interface AddPropertyInterestModalProps {
  contactId: string;
  onClose: () => void;
  onSave: () => void;
}

function AddPropertyInterestModal({ contactId, onClose, onSave }: AddPropertyInterestModalProps) {
  const [propertyId, setPropertyId] = useState('');
  const [interestLevel, setInterestLevel] = useState('interested');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!propertyId) {
      setError('Property ID is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/v1/contacts-real-estate/property-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          property_id: propertyId,
          interest_level: interestLevel,
          notes,
          follow_up_date: followUpDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add property interest');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Property Interest</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Enter property ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Level</label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="interested">Interested</option>
                <option value="very_interested">Very Interested</option>
                <option value="favorite">Favorite</option>
                <option value="not_interested">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this property interest"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date (Optional)</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Interest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Property Interest Modal
interface EditPropertyInterestModalProps {
  interest: PropertyInterest;
  onClose: () => void;
  onSave: () => void;
}

function EditPropertyInterestModal({ interest, onClose, onSave }: EditPropertyInterestModalProps) {
  const [interestLevel, setInterestLevel] = useState(interest.interest_level);
  const [notes, setNotes] = useState(interest.notes);
  const [followUpDate, setFollowUpDate] = useState(interest.follow_up_date ? interest.follow_up_date.split('T')[0] : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/v1/contacts-real-estate/property-interest', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interest_id: interest.id,
          interest_level: interestLevel,
          notes,
          follow_up_date: followUpDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update property interest');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Edit Property Interest</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <p className="text-sm text-gray-600">{interest.property_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Level</label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="interested">Interested</option>
                <option value="very_interested">Very Interested</option>
                <option value="favorite">Favorite</option>
                <option value="not_interested">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this property interest"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
