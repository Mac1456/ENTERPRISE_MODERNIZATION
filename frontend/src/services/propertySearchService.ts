/**
 * ✅ ACTIVE SERVICE - Property Search Service
 * 
 * Handles all property search API interactions following patterns from leadService.ts and contactService.ts
 * Last updated: Initial implementation - 2024-07-27
 */

import { 
  PropertySearchQuery, 
  PropertySearchResults, 
  SavedSearch, 
  PropertyRecommendation,
  PropertySearchStats,
  SearchFilters,
  MLSData
} from '@/types'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8080/custom/modernui/api.php'
  : 'http://localhost:8080/custom/modernui/api.php'

export class PropertySearchService {
  // Search properties with filters and query
  static async searchProperties(searchQuery: PropertySearchQuery): Promise<PropertySearchResults> {
    try {
      const response = await fetch(`${API_BASE}/property-search/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQuery)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Property search failed')
      }

      return data.data
    } catch (error) {
      console.error('Property search error:', error)
      throw error
    }
  }

  // Get saved searches
  static async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const response = await fetch(`${API_BASE}/property-search/saved-searches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch saved searches')
      }

      return data.data
    } catch (error) {
      console.error('Saved searches fetch error:', error)
      throw error
    }
  }

  // Create saved search
  static async createSavedSearch(savedSearch: Omit<SavedSearch, 'id' | 'createdAt' | 'lastRun' | 'newMatches'>): Promise<SavedSearch> {
    try {
      const response = await fetch(`${API_BASE}/property-search/saved-searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savedSearch)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create saved search')
      }

      return data.data
    } catch (error) {
      console.error('Create saved search error:', error)
      throw error
    }
  }

  // Delete saved search
  static async deleteSavedSearch(searchId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/property-search/saved-searches/${searchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete saved search')
      }
    } catch (error) {
      console.error('Delete saved search error:', error)
      throw error
    }
  }

  // Get property recommendations for clients
  static async getPropertyRecommendations(): Promise<PropertyRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE}/property-search/recommendations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch property recommendations')
      }

      return data.data
    } catch (error) {
      console.error('Property recommendations fetch error:', error)
      throw error
    }
  }

  // Get property search statistics
  static async getSearchStats(): Promise<PropertySearchStats> {
    try {
      const response = await fetch(`${API_BASE}/property-search/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch search stats')
      }

      return data.data
    } catch (error) {
      console.error('Search stats fetch error:', error)
      throw error
    }
  }

  // Get available search filters
  static async getSearchFilters(): Promise<SearchFilters> {
    try {
      const response = await fetch(`${API_BASE}/property-search/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch search filters')
      }

      return data.data
    } catch (error) {
      console.error('Search filters fetch error:', error)
      throw error
    }
  }

  // Get MLS data sync status
  static async getMLSData(): Promise<MLSData> {
    try {
      const response = await fetch(`${API_BASE}/property-search/mls-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch MLS data')
      }

      return data.data
    } catch (error) {
      console.error('MLS data fetch error:', error)
      throw error
    }
  }
}
