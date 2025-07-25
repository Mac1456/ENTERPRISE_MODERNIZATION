import React, { useState, useEffect } from 'react';
import { Save, X, DollarSign, Home, MapPin, Calendar, User, Star, Phone, Mail, Clock } from 'lucide-react';

interface ContactProfile {
  contact_type: string;
  budget_min: number | null;
  budget_max: number | null;
  budget_approved: boolean;
  property_type_preferences: string[];
  location_preferences: string[];
  bedrooms_min: number | null;
  bedrooms_max: number | null;
  bathrooms_min: number | null;
  bathrooms_max: number | null;
  square_footage_min: number | null;
  square_footage_max: number | null;
  timeline: string;
  urgency_level: string;
  move_in_date: string;
  first_time_buyer: boolean;
  current_home_status: string;
  needs_to_sell_first: boolean;
  mortgage_preapproval: boolean;
  cash_buyer: boolean;
  preferred_contact_method: string;
  preferred_contact_time: string;
  communication_frequency: string;
  engagement_level: string;
  home_features: string[];
  neighborhood_features: string[];
  deal_breakers: string[];
  special_requirements: string;
  accessibility_needs: string;
  pet_information: string;
}

interface ContactProfileEditorProps {
  contactId: string;
  onSave: (profile: ContactProfile) => void;
  onCancel: () => void;
}

export default function ContactProfileEditor({ contactId, onSave, onCancel }: ContactProfileEditorProps) {
  const [profile, setProfile] = useState<ContactProfile>({
    contact_type: 'buyer',
    budget_min: null,
    budget_max: null,
    budget_approved: false,
    property_type_preferences: [],
    location_preferences: [],
    bedrooms_min: null,
    bedrooms_max: null,
    bathrooms_min: null,
    bathrooms_max: null,
    square_footage_min: null,
    square_footage_max: null,
    timeline: 'immediate',
    urgency_level: 'medium',
    move_in_date: '',
    first_time_buyer: false,
    current_home_status: 'rent',
    needs_to_sell_first: false,
    mortgage_preapproval: false,
    cash_buyer: false,
    preferred_contact_method: 'phone',
    preferred_contact_time: 'morning',
    communication_frequency: 'weekly',
    engagement_level: 'medium',
    home_features: [],
    neighborhood_features: [],
    deal_breakers: [],
    special_requirements: '',
    accessibility_needs: '',
    pet_information: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Property type options
  const propertyTypes = [
    'Single Family Home',
    'Condo',
    'Townhouse',
    'Apartment',
    'Multi-Family',
    'Commercial',
    'Land',
    'Manufactured Home'
  ];

  // Home feature options
  const homeFeatures = [
    'Hardwood Floors',
    'Updated Kitchen',
    'Fireplace',
    'Walk-in Closets',
    'Cathedral Ceilings',
    'Open Floor Plan',
    'Garage',
    'Pool',
    'Patio/Deck',
    'Fenced Yard',
    'Garden',
    'Basement',
    'Attic Storage',
    'Central Air',
    'Granite Countertops',
    'Stainless Steel Appliances'
  ];

  // Neighborhood feature options
  const neighborhoodFeatures = [
    'Good Schools',
    'Near Shopping',
    'Public Transportation',
    'Low Crime',
    'Walkable',
    'Parks Nearby',
    'Restaurants',
    'Gym/Fitness Center',
    'Community Pool',
    'Golf Course',
    'Beach Access',
    'Mountain Views',
    'Quiet Neighborhood',
    'Family Friendly'
  ];

  useEffect(() => {
    if (contactId) {
      fetchProfile();
    }
  }, [contactId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/contacts-real-estate/contact-profile?contact_id=${contactId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/contacts-real-estate/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          ...profile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const result = await response.json();
      
      if (result.success) {
        onSave(profile);
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayFieldChange = (field: keyof ContactProfile, value: string, checked: boolean) => {
    setProfile(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border max-w-4xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Real Estate Profile</h2>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Basic Information */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
              <select
                value={profile.contact_type}
                onChange={(e) => setProfile(prev => ({ ...prev, contact_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="investor">Investor</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
              <select
                value={profile.timeline}
                onChange={(e) => setProfile(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="1-3months">1-3 Months</option>
                <option value="3-6months">3-6 Months</option>
                <option value="6-12months">6-12 Months</option>
                <option value="12+months">12+ Months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
              <select
                value={profile.urgency_level}
                onChange={(e) => setProfile(prev => ({ ...prev, urgency_level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
              <input
                type="date"
                value={profile.move_in_date}
                onChange={(e) => setProfile(prev => ({ ...prev, move_in_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Home Status</label>
              <select
                value={profile.current_home_status}
                onChange={(e) => setProfile(prev => ({ ...prev, current_home_status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="own">Own</option>
                <option value="rent">Rent</option>
                <option value="living_with_family">Living with Family</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile.first_time_buyer}
                onChange={(e) => setProfile(prev => ({ ...prev, first_time_buyer: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">First-time buyer</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile.needs_to_sell_first}
                onChange={(e) => setProfile(prev => ({ ...prev, needs_to_sell_first: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Needs to sell first</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile.mortgage_preapproval}
                onChange={(e) => setProfile(prev => ({ ...prev, mortgage_preapproval: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Pre-approved</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile.cash_buyer}
                onChange={(e) => setProfile(prev => ({ ...prev, cash_buyer: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Cash buyer</span>
            </label>
          </div>
        </section>

        {/* Budget Information */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Budget Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Budget</label>
              <input
                type="number"
                value={profile.budget_min || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, budget_min: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Minimum budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Budget</label>
              <input
                type="number"
                value={profile.budget_max || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, budget_max: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Maximum budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.budget_approved}
                  onChange={(e) => setProfile(prev => ({ ...prev, budget_approved: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Budget Pre-approved</span>
              </label>
            </div>
          </div>
        </section>

        {/* Property Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Property Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Types</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {propertyTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.property_type_preferences.includes(type)}
                      onChange={(e) => handleArrayFieldChange('property_type_preferences', type, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={profile.bedrooms_min || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bedrooms_min: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={profile.bedrooms_max || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bedrooms_max: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={profile.bathrooms_min || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bathrooms_min: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={profile.bathrooms_max || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bathrooms_max: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Square Footage</label>
                <input
                  type="number"
                  value={profile.square_footage_min || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, square_footage_min: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Square Footage</label>
                <input
                  type="number"
                  value={profile.square_footage_max || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, square_footage_max: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Location Preferences</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
            <textarea
              value={profile.location_preferences.join(', ')}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                location_preferences: e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc) 
              }))}
              placeholder="Enter preferred cities, neighborhoods, or areas (comma-separated)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </section>

        {/* Home Features */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Desired Features</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Features</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {homeFeatures.map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.home_features.includes(feature)}
                      onChange={(e) => handleArrayFieldChange('home_features', feature, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood Features</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {neighborhoodFeatures.map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.neighborhood_features.includes(feature)}
                      onChange={(e) => handleArrayFieldChange('neighborhood_features', feature, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Breakers</label>
              <textarea
                value={profile.deal_breakers.join(', ')}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  deal_breakers: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                }))}
                placeholder="Enter absolute deal breakers (comma-separated)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Communication Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Communication Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Method</label>
              <select
                value={profile.preferred_contact_method}
                onChange={(e) => setProfile(prev => ({ ...prev, preferred_contact_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="text">Text/SMS</option>
                <option value="app">App Notification</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select
                value={profile.preferred_contact_time}
                onChange={(e) => setProfile(prev => ({ ...prev, preferred_contact_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="weekends">Weekends</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Frequency</label>
              <select
                value={profile.communication_frequency}
                onChange={(e) => setProfile(prev => ({ ...prev, communication_frequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
              <textarea
                value={profile.special_requirements}
                onChange={(e) => setProfile(prev => ({ ...prev, special_requirements: e.target.value }))}
                placeholder="Any special requirements or notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Needs</label>
              <textarea
                value={profile.accessibility_needs}
                onChange={(e) => setProfile(prev => ({ ...prev, accessibility_needs: e.target.value }))}
                placeholder="Any accessibility requirements"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Information</label>
              <input
                type="text"
                value={profile.pet_information}
                onChange={(e) => setProfile(prev => ({ ...prev, pet_information: e.target.value }))}
                placeholder="Pet ownership information"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
