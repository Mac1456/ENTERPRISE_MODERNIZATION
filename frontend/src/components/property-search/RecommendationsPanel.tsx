/**
 * ✅ ACTIVE COMPONENT - Recommendations Panel
 * 
 * Panel for displaying property recommendations for clients
 * Following patterns from other modal components and cards
 * Last updated: 2024-07-27
 */

import React, { useState } from 'react'
import {
    SparklesIcon,
    XMarkIcon,
    EyeIcon,
    HeartIcon,
    ShareIcon,
    ChevronRightIcon,
    UserIcon,
    StarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, CheckCircleIcon as CheckSolidIcon } from '@heroicons/react/24/solid'

import { PropertyRecommendation, PropertySearchListing, Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RecommendationsPanelProps {
    isOpen?: boolean
    onClose?: () => void
    recommendations: PropertyRecommendation[]
    properties: PropertySearchListing[]
    clients: Contact[]
    onViewProperty?: (propertyId: string) => void
    onUpdateRecommendationStatus?: (recommendationId: string, status: 'viewed' | 'interested' | 'dismissed') => void
    onSendRecommendation?: (recommendationId: string) => void
    isLoading?: boolean
    className?: string
}

export default function RecommendationsPanel({
    isOpen = true,
    onClose,
    recommendations,
    properties,
    clients,
    onViewProperty,
    onUpdateRecommendationStatus,
    onSendRecommendation,
    isLoading = false,
    className = ''
}: RecommendationsPanelProps) {
    const [selectedClient, setSelectedClient] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'viewed' | 'interested'>('all')

    // Helper function to get property details by ID
    const getPropertyById = (propertyId: string) => {
        return properties.find(p => p.id === propertyId)
    }

    // Helper function to get client details by ID
    const getClientById = (clientId: string) => {
        return clients.find(c => c.id === clientId)
    }

    // Filter recommendations based on selected filters
    const filteredRecommendations = recommendations.filter(rec => {
        if (selectedClient && rec.clientId !== selectedClient) return false
        if (filter === 'all') return true
        return rec.status === filter
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            viewed: 'bg-blue-100 text-blue-800',
            interested: 'bg-green-100 text-green-800',
            dismissed: 'bg-gray-100 text-gray-800'
        }

        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {status}
            </Badge>
        )
    }

    const getMatchScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100'
        if (score >= 80) return 'text-blue-600 bg-blue-100'
        if (score >= 70) return 'text-yellow-600 bg-yellow-100'
        return 'text-gray-600 bg-gray-100'
    }

    if (!isOpen) return null

    return (
        <div className={`bg-white border-l border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                Property Recommendations
                            </h2>
                            <p className="text-sm text-gray-500">
                                AI-powered matches for your clients
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="space-y-4">
                    {/* Client Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Client
                        </label>
                        <select
                            value={selectedClient || ''}
                            onChange={(e) => setSelectedClient(e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                        >
                            <option value="">All Clients</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.firstName} {client.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <div className="flex space-x-2">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'pending', label: 'Pending' },
                                { key: 'viewed', label: 'Viewed' },
                                { key: 'interested', label: 'Interested' }
                            ].map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => setFilter(option.key as any)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${filter === option.key
                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations List */}
            <div className="flex-1 overflow-y-auto">
                {filteredRecommendations.length === 0 ? (
                    <div className="p-6 text-center">
                        <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No recommendations found</p>
                        <p className="text-sm text-gray-400">
                            Try adjusting your filters or check back later for new matches
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {filteredRecommendations.map((recommendation) => {
                            const property = getPropertyById(recommendation.propertyId)
                            const client = getClientById(recommendation.clientId)

                            if (!property || !client) return null

                            return (
                                <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-4">
                                            {/* Property Image */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {property.images.length > 0 ? (
                                                    <img
                                                        src={property.images[0]}
                                                        alt={property.address}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <UserIcon className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Property Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {property.address}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {property.city}, {property.state}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-2">
                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(recommendation.matchScore)}`}>
                                                            {recommendation.matchScore}% match
                                                        </div>
                                                        {getStatusBadge(recommendation.status)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                                                    <span className="font-medium text-green-600">
                                                        {formatPrice(property.price)}
                                                    </span>
                                                    <span>{property.bedrooms} bed</span>
                                                    <span>{property.bathrooms} bath</span>
                                                    <span>{property.sqft.toLocaleString()} sqft</span>
                                                </div>

                                                {/* Client Info */}
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-600">
                                                        For: {client.firstName} {client.lastName}
                                                    </span>
                                                </div>

                                                {/* Match Reasons */}
                                                <div className="mb-3">
                                                    <p className="text-xs text-gray-500 mb-1">Why it matches:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {recommendation.reasonsMatched.slice(0, 3).map((reason, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded"
                                                            >
                                                                {reason}
                                                            </span>
                                                        ))}
                                                        {recommendation.reasonsMatched.length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{recommendation.reasonsMatched.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="flex items-center space-x-1 text-xs text-gray-400 mb-3">
                                                    <ClockIcon className="w-3 h-3" />
                                                    <span>
                                                        Recommended {new Date(recommendation.recommendedAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        onClick={() => onViewProperty?.(property.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <EyeIcon className="w-3 h-3" />
                                                        <span>View</span>
                                                    </Button>

                                                    {recommendation.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                onClick={() => onUpdateRecommendationStatus?.(recommendation.id, 'interested')}
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                                                            >
                                                                <CheckCircleIcon className="w-3 h-3" />
                                                                <span>Accept</span>
                                                            </Button>
                                                            <Button
                                                                onClick={() => onUpdateRecommendationStatus?.(recommendation.id, 'dismissed')}
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                                            >
                                                                <XCircleIcon className="w-3 h-3" />
                                                                <span>Dismiss</span>
                                                            </Button>
                                                        </>
                                                    )}

                                                    <Button
                                                        onClick={() => onSendRecommendation?.(recommendation.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <ShareIcon className="w-3 h-3" />
                                                        <span>Send</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-medium text-gray-900">
                            {recommendations.length}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div>
                        <div className="text-lg font-medium text-yellow-600">
                            {recommendations.filter(r => r.status === 'pending').length}
                        </div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div>
                        <div className="text-lg font-medium text-green-600">
                            {recommendations.filter(r => r.status === 'interested').length}
                        </div>
                        <div className="text-xs text-gray-500">Interested</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
