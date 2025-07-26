<?php

declare(strict_types=1);

namespace App\Domain\Lead;

enum PropertyType: string
{
    case SINGLE_FAMILY = 'Single Family';
    case CONDO = 'Condo';
    case TOWNHOUSE = 'Townhouse';
    case MULTI_FAMILY = 'Multi Family';
    case COMMERCIAL = 'Commercial';
    case LAND = 'Land';

    public function getDisplayName(): string
    {
        return $this->value;
    }

    public function isResidential(): bool
    {
        return in_array($this, [
            self::SINGLE_FAMILY,
            self::CONDO,
            self::TOWNHOUSE,
            self::MULTI_FAMILY
        ]);
    }

    public function isCommercial(): bool
    {
        return $this === self::COMMERCIAL;
    }

    public function getAveragePrice(): int
    {
        return match($this) {
            self::SINGLE_FAMILY => 450000,
            self::CONDO => 320000,
            self::TOWNHOUSE => 380000,
            self::MULTI_FAMILY => 650000,
            self::COMMERCIAL => 1200000,
            self::LAND => 200000,
        };
    }

    public function getTypicalFeatures(): array
    {
        return match($this) {
            self::SINGLE_FAMILY => ['Yard', 'Garage', 'Multiple Bedrooms', 'Privacy'],
            self::CONDO => ['Amenities', 'Low Maintenance', 'Security', 'Urban Location'],
            self::TOWNHOUSE => ['Multiple Levels', 'Garage', 'Small Yard', 'Community'],
            self::MULTI_FAMILY => ['Rental Income', 'Multiple Units', 'Investment Potential'],
            self::COMMERCIAL => ['Business Use', 'High Traffic', 'Parking', 'Zoning'],
            self::LAND => ['Development Potential', 'Raw Land', 'Investment', 'Future Build'],
        };
    }
}
