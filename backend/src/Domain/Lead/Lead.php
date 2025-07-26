<?php

declare(strict_types=1);

namespace App\Domain\Lead;

use JsonSerializable;

class Lead implements JsonSerializable
{
    private string $id;
    private string $firstName;
    private string $lastName;
    private string $email;
    private string $phone;
    private ?string $title;
    private ?string $company;
    private ?string $website;
    private ?string $description;
    private LeadStatus $status;
    private string $source;
    private string $assignedUserId;
    private string $assignedUserName;
    
    // Real estate specific fields
    private PropertyType $propertyType;
    private ?array $budget;
    private string $preferredLocation;
    private string $timeline;
    private int $leadScore;
    private ?array $geolocation;
    
    private \DateTimeImmutable $createdAt;
    private \DateTimeImmutable $modifiedAt;

    public function __construct(
        string $id,
        string $firstName,
        string $lastName,
        string $email,
        string $phone,
        LeadStatus $status,
        string $source,
        string $assignedUserId,
        string $assignedUserName,
        PropertyType $propertyType,
        string $preferredLocation,
        string $timeline,
        int $leadScore,
        ?string $title = null,
        ?string $company = null,
        ?string $website = null,
        ?string $description = null,
        ?array $budget = null,
        ?array $geolocation = null,
        ?\DateTimeImmutable $createdAt = null,
        ?\DateTimeImmutable $modifiedAt = null
    ) {
        $this->id = $id;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->email = $email;
        $this->phone = $phone;
        $this->title = $title;
        $this->company = $company;
        $this->website = $website;
        $this->description = $description;
        $this->status = $status;
        $this->source = $source;
        $this->assignedUserId = $assignedUserId;
        $this->assignedUserName = $assignedUserName;
        $this->propertyType = $propertyType;
        $this->budget = $budget;
        $this->preferredLocation = $preferredLocation;
        $this->timeline = $timeline;
        $this->leadScore = $leadScore;
        $this->geolocation = $geolocation;
        $this->createdAt = $createdAt ?? new \DateTimeImmutable();
        $this->modifiedAt = $modifiedAt ?? new \DateTimeImmutable();
    }

    // Getters
    public function getId(): string
    {
        return $this->id;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getFullName(): string
    {
        return $this->firstName . ' ' . $this->lastName;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getCompany(): ?string
    {
        return $this->company;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getStatus(): LeadStatus
    {
        return $this->status;
    }

    public function getSource(): string
    {
        return $this->source;
    }

    public function getAssignedUserId(): string
    {
        return $this->assignedUserId;
    }

    public function getAssignedUserName(): string
    {
        return $this->assignedUserName;
    }

    public function getPropertyType(): PropertyType
    {
        return $this->propertyType;
    }

    public function getBudget(): ?array
    {
        return $this->budget;
    }

    public function getPreferredLocation(): string
    {
        return $this->preferredLocation;
    }

    public function getTimeline(): string
    {
        return $this->timeline;
    }

    public function getLeadScore(): int
    {
        return $this->leadScore;
    }

    public function getGeolocation(): ?array
    {
        return $this->geolocation;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getModifiedAt(): \DateTimeImmutable
    {
        return $this->modifiedAt;
    }

    // Business logic methods
    public function assignTo(string $userId, string $userName): self
    {
        return new self(
            $this->id,
            $this->firstName,
            $this->lastName,
            $this->email,
            $this->phone,
            $this->status,
            $this->source,
            $userId,
            $userName,
            $this->propertyType,
            $this->preferredLocation,
            $this->timeline,
            $this->leadScore,
            $this->title,
            $this->company,
            $this->website,
            $this->description,
            $this->budget,
            $this->geolocation,
            $this->createdAt,
            new \DateTimeImmutable()
        );
    }

    public function updateStatus(LeadStatus $status): self
    {
        return new self(
            $this->id,
            $this->firstName,
            $this->lastName,
            $this->email,
            $this->phone,
            $status,
            $this->source,
            $this->assignedUserId,
            $this->assignedUserName,
            $this->propertyType,
            $this->preferredLocation,
            $this->timeline,
            $this->leadScore,
            $this->title,
            $this->company,
            $this->website,
            $this->description,
            $this->budget,
            $this->geolocation,
            $this->createdAt,
            new \DateTimeImmutable()
        );
    }

    public function updateScore(int $score): self
    {
        if ($score < 0 || $score > 100) {
            throw new \InvalidArgumentException('Lead score must be between 0 and 100');
        }

        return new self(
            $this->id,
            $this->firstName,
            $this->lastName,
            $this->email,
            $this->phone,
            $this->status,
            $this->source,
            $this->assignedUserId,
            $this->assignedUserName,
            $this->propertyType,
            $this->preferredLocation,
            $this->timeline,
            $score,
            $this->title,
            $this->company,
            $this->website,
            $this->description,
            $this->budget,
            $this->geolocation,
            $this->createdAt,
            new \DateTimeImmutable()
        );
    }

    public function isQualified(): bool
    {
        return $this->leadScore >= 70 && $this->status !== LeadStatus::DEAD;
    }

    public function isHighPriority(): bool
    {
        return $this->leadScore >= 80 && 
               in_array($this->timeline, ['Immediately', 'Within 30 days']);
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'email' => $this->email,
            'phone' => $this->phone,
            'title' => $this->title,
            'company' => $this->company,
            'website' => $this->website,
            'description' => $this->description,
            'status' => $this->status->value,
            'source' => $this->source,
            'assignedUserId' => $this->assignedUserId,
            'assignedUserName' => $this->assignedUserName,
            'propertyType' => $this->propertyType->value,
            'budget' => $this->budget,
            'preferredLocation' => $this->preferredLocation,
            'timeline' => $this->timeline,
            'leadScore' => $this->leadScore,
            'geolocation' => $this->geolocation,
            'createdAt' => $this->createdAt->format(\DateTimeInterface::ATOM),
            'modifiedAt' => $this->modifiedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
