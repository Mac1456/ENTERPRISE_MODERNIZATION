/**
 * ✅ ACTIVE COMPONENT - Saved Search Modal
 * 
 * Modal for managing saved property searches
 * Following patterns from PropertySearchModal and LeadCaptureModal
 * Last updated: 2024-07-27
 */

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
    BookmarkIcon,
    XMarkIcon,
    BellIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    TrashIcon,
    PencilIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

import { SavedSearch, PropertySearchFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SavedSearchModalProps {
    isOpen: boolean
    onClose: () => void
    savedSearches: SavedSearch[]
    onSaveSearch?: (name: string, filters: PropertySearchFilters, alertsEnabled: boolean) => void
    onDeleteSearch?: (searchId: string) => void
    onRunSearch?: (search: SavedSearch) => void
    onToggleAlerts?: (searchId: string, enabled: boolean) => void
    currentFilters?: PropertySearchFilters
    isLoading?: boolean
}

export default function SavedSearchModal({
    isOpen,
    onClose,
    savedSearches,
    onSaveSearch,
    onDeleteSearch,
    onRunSearch,
    onToggleAlerts,
    currentFilters,
    isLoading = false
}: SavedSearchModalProps) {
    const [searchName, setSearchName] = useState('')
    const [alertsEnabled, setAlertsEnabled] = useState(true)
    const [showSaveForm, setShowSaveForm] = useState(false)
    const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)

    const handleSaveCurrentSearch = () => {
        if (!searchName.trim() || !currentFilters) return

        onSaveSearch?.(searchName, currentFilters, alertsEnabled)
        setSearchName('')
        setAlertsEnabled(true)
        setShowSaveForm(false)
    }

    const handleRunSearch = (search: SavedSearch) => {
        onRunSearch?.(search)
        onClose()
    }

    const formatFilters = (filters: PropertySearchFilters): string => {
        const parts: string[] = []

        if (filters.priceMin || filters.priceMax) {
            const min = filters.priceMin ? `$${filters.priceMin.toLocaleString()}` : 'Any'
            const max = filters.priceMax ? `$${filters.priceMax.toLocaleString()}` : 'Any'
            parts.push(`Price: ${min} - ${max}`)
        }

        if (filters.propertyType) {
            parts.push(`Type: ${filters.propertyType}`)
        }

        if (filters.bedrooms) {
            parts.push(`${filters.bedrooms}+ beds`)
        }

        if (filters.bathrooms) {
            parts.push(`${filters.bathrooms}+ baths`)
        }

        if (filters.location) {
            parts.push(`Location: ${filters.location}`)
        }

        if (filters.features && filters.features.length > 0) {
            parts.push(`Features: ${filters.features.slice(0, 2).join(', ')}${filters.features.length > 2 ? '...' : ''}`)
        }

        return parts.join(' • ')
    }

    const getAlertFrequencyBadge = (frequency: 'daily' | 'weekly' | 'instant') => {
        const variants = {
            instant: 'bg-red-100 text-red-800',
            daily: 'bg-blue-100 text-blue-800',
            weekly: 'bg-green-100 text-green-800'
        }

        return (
            <Badge className={variants[frequency]}>
                {frequency}
            </Badge>
        )
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <BookmarkIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-medium text-gray-900">
                                                Saved Searches
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500">
                                                Manage your saved property searches and alerts
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Save Current Search */}
                                    {currentFilters && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <span>Save Current Search</span>
                                                    <Button
                                                        onClick={() => setShowSaveForm(!showSaveForm)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <BookmarkIcon className="w-4 h-4" />
                                                        <span>Save Search</span>
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            {showSaveForm && (
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Search Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={searchName}
                                                            onChange={(e) => setSearchName(e.target.value)}
                                                            placeholder="e.g., Downtown Condos Under $500k"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="enableAlerts"
                                                            checked={alertsEnabled}
                                                            onChange={(e) => setAlertsEnabled(e.target.checked)}
                                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <label htmlFor="enableAlerts" className="text-sm text-gray-700 flex items-center space-x-1">
                                                            <BellIcon className="w-4 h-4" />
                                                            <span>Enable email alerts for new matches</span>
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            onClick={() => setShowSaveForm(false)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={handleSaveCurrentSearch}
                                                            disabled={!searchName.trim()}
                                                            size="sm"
                                                        >
                                                            Save Search
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    )}

                                    {/* Saved Searches List */}
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 mb-4">
                                            Your Saved Searches ({savedSearches.length})
                                        </h3>

                                        {savedSearches.length === 0 ? (
                                            <Card>
                                                <CardContent className="text-center py-8">
                                                    <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-500 mb-2">No saved searches yet</p>
                                                    <p className="text-sm text-gray-400">
                                                        Save your property searches to get alerts for new matches
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="space-y-3">
                                                {savedSearches.map((search) => (
                                                    <Card key={search.id}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-3 mb-2">
                                                                        <BookmarkSolidIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                            {search.name}
                                                                        </h4>
                                                                        {search.alertsEnabled && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <BellIcon className="w-4 h-4 text-orange-500" />
                                                                                {getAlertFrequencyBadge(search.alertFrequency)}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-xs text-gray-600 mb-2">
                                                                        {formatFilters(search.filters)}
                                                                    </p>

                                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                        <span className="flex items-center space-x-1">
                                                                            <ClockIcon className="w-3 h-3" />
                                                                            <span>Created {new Date(search.createdAt).toLocaleDateString()}</span>
                                                                        </span>
                                                                        {search.lastRun && (
                                                                            <span className="flex items-center space-x-1">
                                                                                <MagnifyingGlassIcon className="w-3 h-3" />
                                                                                <span>Last run {new Date(search.lastRun).toLocaleDateString()}</span>
                                                                            </span>
                                                                        )}
                                                                        {search.newMatches > 0 && (
                                                                            <Badge className="bg-red-100 text-red-800">
                                                                                {search.newMatches} new
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center space-x-2 ml-4">
                                                                    <Button
                                                                        onClick={() => handleRunSearch(search)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="flex items-center space-x-1"
                                                                    >
                                                                        <MagnifyingGlassIcon className="w-4 h-4" />
                                                                        <span>Search</span>
                                                                    </Button>

                                                                    <Button
                                                                        onClick={() => onToggleAlerts?.(search.id, !search.alertsEnabled)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className={search.alertsEnabled ? 'text-orange-600' : 'text-gray-400'}
                                                                    >
                                                                        <BellIcon className="w-4 h-4" />
                                                                    </Button>

                                                                    <Button
                                                                        onClick={() => onDeleteSearch?.(search.id)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
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
