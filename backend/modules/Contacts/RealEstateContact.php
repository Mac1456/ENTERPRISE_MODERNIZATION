<?php

if (!defined('sugarEntry') || !sugarEntry) {
    die('Not A Valid Entry Point');
}

require_once 'modules/Contacts/Contact.php';

/**
 * RealEstateContact extends the base Contact class with real estate specific functionality
 */
class RealEstateContact extends Contact
{
    // Real estate specific properties
    public $contact_type_c;
    public $budget_min_c;
    public $budget_max_c;
    public $budget_approved_c;
    public $property_type_preferences_c;
    public $location_preferences_c;
    public $bedrooms_min_c;
    public $bedrooms_max_c;
    public $bathrooms_min_c;
    public $bathrooms_max_c;
    public $square_footage_min_c;
    public $square_footage_max_c;
    public $timeline_c;
    public $urgency_level_c;
    public $move_in_date_c;
    public $first_time_buyer_c;
    public $current_home_status_c;
    public $needs_to_sell_first_c;
    public $mortgage_preapproval_c;
    public $cash_buyer_c;
    public $preferred_contact_method_c;
    public $preferred_contact_time_c;
    public $communication_frequency_c;
    public $lead_quality_score_c;
    public $engagement_level_c;
    public $last_activity_date_c;
    public $home_features_c;
    public $neighborhood_features_c;
    public $deal_breakers_c;
    public $special_requirements_c;
    public $accessibility_needs_c;
    public $pet_information_c;

    public function __construct()
    {
        parent::__construct();
        
        // Set default values for real estate fields
        $this->contact_type_c = 'buyer';
        $this->urgency_level_c = 'medium';
        $this->preferred_contact_method_c = 'phone';
        $this->communication_frequency_c = 'weekly';
        $this->engagement_level_c = 'medium';
        $this->lead_quality_score_c = 50;
    }

    /**
     * Get property interests for this contact
     */
    public function getPropertyInterests($includeInactive = false)
    {
        $whereClause = "contact_id = '{$this->id}' AND deleted = 0";
        if (!$includeInactive) {
            $whereClause .= " AND status = 'active'";
        }
        
        $query = "SELECT cpi.*, p.name as property_name, p.street_address, p.city, p.state, 
                         p.list_price, p.property_type, p.bedrooms, p.bathrooms, p.square_footage
                  FROM contact_property_interests cpi
                  LEFT JOIN properties p ON cpi.property_id = p.id
                  WHERE {$whereClause}
                  ORDER BY cpi.interest_date DESC";
        
        $result = $this->db->query($query);
        $interests = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $interests[] = $row;
        }
        
        return $interests;
    }

    /**
     * Add property interest for this contact
     */
    public function addPropertyInterest($propertyId, $interestLevel = 'interested', $notes = '')
    {
        $interestId = create_guid();
        $now = gmdate('Y-m-d H:i:s');
        
        $query = "INSERT INTO contact_property_interests 
                  (id, contact_id, property_id, interest_level, notes, interest_date, date_entered, date_modified)
                  VALUES ('{$interestId}', '{$this->id}', '{$propertyId}', '{$interestLevel}', 
                          '{$this->db->quote($notes)}', '{$now}', '{$now}', '{$now}')
                  ON DUPLICATE KEY UPDATE 
                  interest_level = VALUES(interest_level),
                  notes = VALUES(notes),
                  date_modified = VALUES(date_modified)";
        
        return $this->db->query($query);
    }

    /**
     * Get property showing history for this contact
     */
    public function getPropertyShowings($limit = 50)
    {
        $query = "SELECT ps.*, p.name as property_name, p.street_address, p.city, p.state,
                         p.list_price, u.first_name, u.last_name as agent_name
                  FROM property_showings ps
                  LEFT JOIN properties p ON ps.property_id = p.id
                  LEFT JOIN users u ON ps.agent_id = u.id
                  WHERE ps.contact_id = '{$this->id}' AND ps.deleted = 0
                  ORDER BY ps.showing_date DESC
                  LIMIT {$limit}";
        
        $result = $this->db->query($query);
        $showings = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $showings[] = $row;
        }
        
        return $showings;
    }

    /**
     * Schedule a property showing
     */
    public function schedulePropertyShowing($propertyId, $agentId, $showingDate, $showingType = 'in_person', $duration = 30)
    {
        $showingId = create_guid();
        $now = gmdate('Y-m-d H:i:s');
        
        $query = "INSERT INTO property_showings 
                  (id, contact_id, property_id, agent_id, showing_date, showing_type, 
                   duration_minutes, status, created_by, date_entered, date_modified)
                  VALUES ('{$showingId}', '{$this->id}', '{$propertyId}', '{$agentId}', 
                          '{$showingDate}', '{$showingType}', {$duration}, 'scheduled', 
                          '{$GLOBALS['current_user']->id}', '{$now}', '{$now}')";
        
        return $this->db->query($query) ? $showingId : false;
    }

    /**
     * Get saved searches for this contact
     */
    public function getSavedSearches($activeOnly = true)
    {
        $whereClause = "contact_id = '{$this->id}' AND deleted = 0";
        if ($activeOnly) {
            $whereClause .= " AND is_active = 1";
        }
        
        $query = "SELECT * FROM contact_saved_searches 
                  WHERE {$whereClause}
                  ORDER BY date_entered DESC";
        
        $result = $this->db->query($query);
        $searches = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $row['search_criteria'] = json_decode($row['search_criteria'], true);
            $searches[] = $row;
        }
        
        return $searches;
    }

    /**
     * Save a property search for this contact
     */
    public function savePropertySearch($searchName, $searchCriteria, $alertFrequency = 'weekly')
    {
        $searchId = create_guid();
        $now = gmdate('Y-m-d H:i:s');
        $criteriaJson = json_encode($searchCriteria);
        
        $query = "INSERT INTO contact_saved_searches 
                  (id, contact_id, search_name, search_criteria, alert_frequency, date_entered, date_modified)
                  VALUES ('{$searchId}', '{$this->id}', '{$this->db->quote($searchName)}', 
                          '{$this->db->quote($criteriaJson)}', '{$alertFrequency}', '{$now}', '{$now}')";
        
        return $this->db->query($query) ? $searchId : false;
    }

    /**
     * Get property alerts for this contact
     */
    public function getPropertyAlerts($limit = 20, $unreadOnly = false)
    {
        $whereClause = "contact_id = '{$this->id}' AND deleted = 0";
        if ($unreadOnly) {
            $whereClause .= " AND read_status = 0";
        }
        
        $query = "SELECT pa.*, p.name as property_name, p.street_address, p.city, p.state, p.list_price
                  FROM property_alerts pa
                  LEFT JOIN properties p ON pa.property_id = p.id
                  WHERE {$whereClause}
                  ORDER BY pa.sent_date DESC
                  LIMIT {$limit}";
        
        $result = $this->db->query($query);
        $alerts = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $alerts[] = $row;
        }
        
        return $alerts;
    }

    /**
     * Calculate lead quality score based on real estate criteria
     */
    public function calculateLeadQualityScore()
    {
        $score = 0;
        
        // Budget information (25 points)
        if (!empty($this->budget_min_c) && !empty($this->budget_max_c)) {
            $score += 15;
        } elseif (!empty($this->budget_min_c) || !empty($this->budget_max_c)) {
            $score += 8;
        }
        
        if ($this->budget_approved_c) {
            $score += 10;
        }
        
        // Mortgage/financing readiness (20 points)
        if ($this->mortgage_preapproval_c) {
            $score += 15;
        }
        if ($this->cash_buyer_c) {
            $score += 20; // Cash buyers score higher
        }
        
        // Timeline urgency (20 points)
        switch ($this->timeline_c) {
            case 'immediate':
                $score += 20;
                break;
            case '1-3months':
                $score += 15;
                break;
            case '3-6months':
                $score += 10;
                break;
            case '6-12months':
                $score += 5;
                break;
        }
        
        // Property preferences specificity (15 points)
        $preferencesSet = 0;
        if (!empty($this->property_type_preferences_c)) $preferencesSet++;
        if (!empty($this->location_preferences_c)) $preferencesSet++;
        if (!empty($this->bedrooms_min_c)) $preferencesSet++;
        if (!empty($this->bathrooms_min_c)) $preferencesSet++;
        
        $score += ($preferencesSet * 4); // 4 points per preference set
        
        // Engagement and activity (10 points)
        switch ($this->engagement_level_c) {
            case 'very_high':
                $score += 10;
                break;
            case 'high':
                $score += 8;
                break;
            case 'medium':
                $score += 5;
                break;
            case 'low':
                $score += 2;
                break;
        }
        
        // Communication preferences (5 points)
        if (!empty($this->preferred_contact_method_c) && !empty($this->preferred_contact_time_c)) {
            $score += 5;
        }
        
        // Real estate experience (5 points)
        if (!$this->first_time_buyer_c) {
            $score += 5; // Experienced buyers may be easier to work with
        }
        
        // Cap the score at 100
        $this->lead_quality_score_c = min($score, 100);
        
        return $this->lead_quality_score_c;
    }

    /**
     * Get matching properties based on contact preferences
     */
    public function getMatchingProperties($limit = 10)
    {
        $whereConditions = ["p.deleted = 0", "p.status = 'active'"];
        
        // Budget filtering
        if (!empty($this->budget_min_c)) {
            $whereConditions[] = "p.list_price >= {$this->budget_min_c}";
        }
        if (!empty($this->budget_max_c)) {
            $whereConditions[] = "p.list_price <= {$this->budget_max_c}";
        }
        
        // Property type filtering
        if (!empty($this->property_type_preferences_c)) {
            $propertyTypes = json_decode($this->property_type_preferences_c, true);
            if (is_array($propertyTypes) && !empty($propertyTypes)) {
                $typesList = "'" . implode("','", array_map([$this->db, 'quote'], $propertyTypes)) . "'";
                $whereConditions[] = "p.property_type IN ({$typesList})";
            }
        }
        
        // Bedroom filtering
        if (!empty($this->bedrooms_min_c)) {
            $whereConditions[] = "p.bedrooms >= {$this->bedrooms_min_c}";
        }
        if (!empty($this->bedrooms_max_c)) {
            $whereConditions[] = "p.bedrooms <= {$this->bedrooms_max_c}";
        }
        
        // Bathroom filtering
        if (!empty($this->bathrooms_min_c)) {
            $whereConditions[] = "p.bathrooms >= {$this->bathrooms_min_c}";
        }
        if (!empty($this->bathrooms_max_c)) {
            $whereConditions[] = "p.bathrooms <= {$this->bathrooms_max_c}";
        }
        
        // Square footage filtering
        if (!empty($this->square_footage_min_c)) {
            $whereConditions[] = "p.square_footage >= {$this->square_footage_min_c}";
        }
        if (!empty($this->square_footage_max_c)) {
            $whereConditions[] = "p.square_footage <= {$this->square_footage_max_c}";
        }
        
        // Location filtering (if specific cities/areas are preferred)
        if (!empty($this->location_preferences_c)) {
            $locations = json_decode($this->location_preferences_c, true);
            if (is_array($locations) && !empty($locations)) {
                $locationConditions = [];
                foreach ($locations as $location) {
                    $location = $this->db->quote($location);
                    $locationConditions[] = "(p.city LIKE '%{$location}%' OR p.state LIKE '%{$location}%')";
                }
                if (!empty($locationConditions)) {
                    $whereConditions[] = "(" . implode(" OR ", $locationConditions) . ")";
                }
            }
        }
        
        $whereClause = implode(" AND ", $whereConditions);
        
        $query = "SELECT p.*, 
                         (CASE 
                          WHEN p.list_price BETWEEN IFNULL({$this->budget_min_c}, 0) AND IFNULL({$this->budget_max_c}, 999999999) THEN 50
                          ELSE 0 END) +
                         (CASE 
                          WHEN p.bedrooms BETWEEN IFNULL({$this->bedrooms_min_c}, 0) AND IFNULL({$this->bedrooms_max_c}, 99) THEN 30
                          ELSE 0 END) +
                         (CASE 
                          WHEN p.bathrooms BETWEEN IFNULL({$this->bathrooms_min_c}, 0) AND IFNULL({$this->bathrooms_max_c}, 99) THEN 20
                          ELSE 0 END) as match_score
                  FROM properties p
                  WHERE {$whereClause}
                  ORDER BY match_score DESC, p.date_entered DESC
                  LIMIT {$limit}";
        
        $result = $this->db->query($query);
        $properties = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $properties[] = $row;
        }
        
        return $properties;
    }

    /**
     * Update contact's real estate profile
     */
    public function updateRealEstateProfile($profileData)
    {
        $updateFields = [];
        $allowedFields = [
            'contact_type_c', 'budget_min_c', 'budget_max_c', 'budget_approved_c',
            'property_type_preferences_c', 'location_preferences_c', 'bedrooms_min_c',
            'bedrooms_max_c', 'bathrooms_min_c', 'bathrooms_max_c', 'square_footage_min_c',
            'square_footage_max_c', 'timeline_c', 'urgency_level_c', 'move_in_date_c',
            'first_time_buyer_c', 'current_home_status_c', 'needs_to_sell_first_c',
            'mortgage_preapproval_c', 'cash_buyer_c', 'preferred_contact_method_c',
            'preferred_contact_time_c', 'communication_frequency_c', 'engagement_level_c',
            'home_features_c', 'neighborhood_features_c', 'deal_breakers_c',
            'special_requirements_c', 'accessibility_needs_c', 'pet_information_c'
        ];
        
        foreach ($profileData as $field => $value) {
            if (in_array($field, $allowedFields)) {
                if (is_array($value)) {
                    $value = json_encode($value);
                }
                $updateFields[] = "{$field} = '" . $this->db->quote($value) . "'";
                $this->$field = $value;
            }
        }
        
        if (!empty($updateFields)) {
            // Recalculate lead quality score
            $this->calculateLeadQualityScore();
            $updateFields[] = "lead_quality_score_c = {$this->lead_quality_score_c}";
            $updateFields[] = "modified_date_c = '" . gmdate('Y-m-d H:i:s') . "'";
            
            $updateClause = implode(", ", $updateFields);
            $query = "INSERT INTO contacts_cstm (id_c, {$updateClause}) 
                      VALUES ('{$this->id}', " . str_repeat('?,', count($updateFields)-1) . "?)
                      ON DUPLICATE KEY UPDATE {$updateClause}";
            
            // Simple approach - construct the query directly
            $simpleQuery = "INSERT INTO contacts_cstm (id_c) VALUES ('{$this->id}') 
                           ON DUPLICATE KEY UPDATE {$updateClause}";
            
            return $this->db->query($simpleQuery);
        }
        
        return true;
    }

    /**
     * Load real estate custom fields
     */
    public function retrieve($id = -1, $encode = true, $deleted = true)
    {
        $result = parent::retrieve($id, $encode, $deleted);
        
        if ($result) {
            // Load custom real estate fields
            $query = "SELECT * FROM contacts_cstm WHERE id_c = '{$this->id}'";
            $customResult = $this->db->query($query);
            
            if ($customRow = $this->db->fetchByAssoc($customResult)) {
                foreach ($customRow as $field => $value) {
                    if ($field !== 'id_c') {
                        $this->$field = $value;
                    }
                }
            }
            
            // Decode JSON fields
            $jsonFields = ['property_type_preferences_c', 'location_preferences_c', 
                          'home_features_c', 'neighborhood_features_c', 'deal_breakers_c'];
            
            foreach ($jsonFields as $field) {
                if (!empty($this->$field)) {
                    $decoded = json_decode($this->$field, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $this->$field = $decoded;
                    }
                }
            }
        }
        
        return $result;
    }
}
