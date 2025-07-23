<?php

declare(strict_types=1);

namespace App\Domain\Lead;

enum LeadStatus: string
{
    case NEW = 'New';
    case CONTACTED = 'Contacted';
    case QUALIFIED = 'Qualified';
    case CONVERTED = 'Converted';
    case DEAD = 'Dead';

    public function getDisplayName(): string
    {
        return match($this) {
            self::NEW => 'New Lead',
            self::CONTACTED => 'Contacted',
            self::QUALIFIED => 'Qualified',
            self::CONVERTED => 'Converted',
            self::DEAD => 'Dead Lead',
        };
    }

    public function getNextStatuses(): array
    {
        return match($this) {
            self::NEW => [self::CONTACTED, self::DEAD],
            self::CONTACTED => [self::QUALIFIED, self::DEAD],
            self::QUALIFIED => [self::CONVERTED, self::DEAD],
            self::CONVERTED => [],
            self::DEAD => [self::NEW, self::CONTACTED],
        };
    }

    public function canTransitionTo(LeadStatus $status): bool
    {
        return in_array($status, $this->getNextStatuses());
    }

    public function isActive(): bool
    {
        return $this !== self::DEAD && $this !== self::CONVERTED;
    }

    public static function getActiveStatuses(): array
    {
        return [self::NEW, self::CONTACTED, self::QUALIFIED];
    }
}
