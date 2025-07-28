/**
 * ✅ ACTIVE COMPONENT - Property Details Modal
 * 
 * Modal for viewing detailed property information
 * Following patterns from other modal components
 * Last updated: 2024-07-27
 */

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
    XMarkIcon,
    HomeIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ShareIcon,
    HeartIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

import { PropertySearchListing } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PropertyDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    property: PropertySearchListing | null
    onScheduleShowing?: (propertyId: string) => void
    onContactAgent?: (propertyId: string) => void
    onToggleFavorite?: (propertyId: string, isFavorite: boolean) => void
    onShareProperty?: (propertyId: string) => void
    isFavorite?: boolean
    isLoading?: boolean
}

export default function PropertyDetailsModal({
    isOpen,
    onClose,
    property,
    onScheduleShowing,
    onContactAgent,
    onToggleFavorite,
    onShareProperty,
    isFavorite = false,
    isLoading = false
}: PropertyDetailsModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showVirtualTour, setShowVirtualTour] = useState(false)

    if (!property) return null

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === property.images.length - 1 ? 0 : prev + 1
        )
    }

    const previousImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? property.images.length - 1 : prev - 1
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            'Active': 'bg-green-100 text-green-800',
            'Under Contract': 'bg-yellow-100 text-yellow-800',
            'Sold': 'bg-gray-100 text-gray-800',
            'Withdrawn': 'bg-red-100 text-red-800',
            'Expired': 'bg-red-100 text-red-800'
        }

        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {status}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <HomeIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-medium text-gray-900">
                                                Property Details
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500">
                                                {property.address}, {property.city}, {property.state}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={() => onToggleFavorite?.(property.id, !isFavorite)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center space-x-1"
                                        >
                                            {isFavorite ? (
                                                <HeartSolidIcon className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <HeartIcon className="w-4 h-4" />
                                            )}
                                            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                                        </Button>
                                        <Button
                                            onClick={() => onShareProperty?.(property.id)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center space-x-1"
                                        >
                                            <ShareIcon className="w-4 h-4" />
                                            <span>Share</span>
                                        </Button>
                                        <button
                                            onClick={onClose}
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                    {/* Image Gallery */}
                                    <div className="lg:col-span-2 space-y-4">
                                        {/* Main Image */}
                                        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                                            {property.images.length > 0 ? (
                                                <>
                                                    <img
                                                        src={property.images[currentImageIndex]}
                                                        alt={`Property ${currentImageIndex + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {property.images.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={previousImage}
                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                                            >
                                                                <ChevronLeftIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={nextImage}
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                                            >
                                                                <ChevronRightIcon className="w-5 h-5" />
                                                            </button>
                                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                                                {currentImageIndex + 1} / {property.images.length}
                                                            </div>
                                                        </>
                                                    )}
                                                    {property.virtualTourUrl && (
                                                        <button
                                                            onClick={() => setShowVirtualTour(true)}
                                                            className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                                                        >
                                                            <PlayIcon className="w-4 h-4" />
                                                            <span>Virtual Tour</span>
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <HomeIcon className="w-16 h-16 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Thumbnail Gallery */}
                                        {property.images.length > 1 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {property.images.slice(0, 8).map((image, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        className={`relative aspect-video rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-green-500' : 'border-transparent'
                                                            }`}
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Property Description */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Description</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {property.description}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Features */}
                                        {property.features.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Features & Amenities</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {property.features.map((feature, index) => (
                                                            <div
                                                                key={index}
                                                                className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700"
                                                            >
                                                                {feature}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Property Information Sidebar */}
                                    <div className="space-y-4">
                                        {/* Price and Status */}
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {formatPrice(property.price)}
                                                    </div>
                                                    {getStatusBadge(property.status)}
                                                </div>
                                                {property.matchScore && (
                                                    <div className="text-sm text-gray-500">
                                                        {property.matchScore}% match for your criteria
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Key Details */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Property Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Bedrooms</span>
                                                        <div className="font-medium">{property.bedrooms}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Bathrooms</span>
                                                        <div className="font-medium">{property.bathrooms}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Square Feet</span>
                                                        <div className="font-medium">{property.sqft.toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Year Built</span>
                                                        <div className="font-medium">{property.yearBuilt}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Property Type</span>
                                                        <div className="font-medium">{property.propertyType}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Days on Market</span>
                                                        <div className="font-medium">{property.daysOnMarket}</div>
                                                    </div>
                                                </div>

                                                {property.lotSize && (
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <span className="text-gray-500 text-sm">Lot Size</span>
                                                        <div className="font-medium">{property.lotSize.toLocaleString()} sq ft</div>
                                                    </div>
                                                )}

                                                {property.mlsNumber && (
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <span className="text-gray-500 text-sm">MLS #</span>
                                                        <div className="font-medium">{property.mlsNumber}</div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Location */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <MapPinIcon className="w-4 h-4" />
                                                    <span>Location</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="text-sm text-gray-700">
                                                    {property.address}<br />
                                                    {property.city}, {property.state} {property.zipCode}
                                                </div>
                                                {property.schoolDistrict && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">School District:</span>
                                                        <span className="ml-1 font-medium">{property.schoolDistrict}</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Listing Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Listing Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Listed by:</span>
                                                    <span className="ml-1 font-medium">{property.listingAgent}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Listed on:</span>
                                                    <span className="ml-1">{formatDate(property.listingDate)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <Button
                                                onClick={() => onScheduleShowing?.(property.id)}
                                                className="w-full flex items-center justify-center space-x-2"
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>Schedule Showing</span>
                                            </Button>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={() => onContactAgent?.(property.id)}
                                                    variant="outline"
                                                    className="flex items-center justify-center space-x-1"
                                                >
                                                    <PhoneIcon className="w-4 h-4" />
                                                    <span>Call</span>
                                                </Button>
                                                <Button
                                                    onClick={() => onContactAgent?.(property.id)}
                                                    variant="outline"
                                                    className="flex items-center justify-center space-x-1"
                                                >
                                                    <EnvelopeIcon className="w-4 h-4" />
                                                    <span>Email</span>
                                                </Button>
                                            </div>
                                        </div>
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
