<?php

declare(strict_types=1);

namespace App\Domain\Lead;

interface LeadRepositoryInterface
{
    /**
     * Find a lead by ID
     */
    public function findById(string $id): ?Lead;

    /**
     * Find leads by criteria with pagination
     */
    public function findByCriteria(array $criteria = [], int $page = 1, int $limit = 10): array;

    /**
     * Save a lead (create or update)
     */
    public function save(Lead $lead): void;

    /**
     * Delete a lead
     */
    public function delete(string $id): void;

    /**
     * Find leads assigned to a specific user
     */
    public function findByAssignedUser(string $userId, array $criteria = []): array;

    /**
     * Find leads by source
     */
    public function findBySource(string $source): array;

    /**
     * Find leads by status
     */
    public function findByStatus(LeadStatus $status): array;

    /**
     * Find leads by property type
     */
    public function findByPropertyType(PropertyType $propertyType): array;

    /**
     * Find leads in a geographic area
     */
    public function findInArea(float $lat, float $lng, float $radiusKm): array;

    /**
     * Find leads with score above threshold
     */
    public function findHighScoreLeads(int $minScore = 70): array;

    /**
     * Count leads by criteria
     */
    public function countByCriteria(array $criteria = []): int;

    /**
     * Get lead analytics data
     */
    public function getAnalytics(\DateTimeImmutable $from, \DateTimeImmutable $to): array;

    /**
     * Find unassigned leads
     */
    public function findUnassigned(): array;

    /**
     * Find leads created within time period
     */
    public function findCreatedInPeriod(\DateTimeImmutable $from, \DateTimeImmutable $to): array;

    /**
     * Get lead sources distribution
     */
    public function getSourceDistribution(): array;

    /**
     * Get lead status distribution
     */
    public function getStatusDistribution(): array;

    /**
     * Bulk update leads
     */
    public function bulkUpdate(array $leadIds, array $updates): array;

    /**
     * Bulk assign leads
     */
    public function bulkAssign(array $leadIds, string $userId, string $userName): array;
}
