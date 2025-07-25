<?php

if (!defined('sugarEntry') || !sugarEntry) {
    die('Not A Valid Entry Point');
}

require_once('include/SugarObjects/SugarBean.php');

/**
 * Property class for managing real estate property listings
 */
class Property extends SugarBean
{
    public $id;
    public $name;
    public $description;
    public $property_type;
    public $status;
    
    // Address Information
    public $street_address;
    public $city;
    public $state;
    public $postal_code;
    public $country;
    public $latitude;
    public $longitude;
    
    // Property Details
    public $bedrooms;
    public $bathrooms;
    public $square_footage;
    public $lot_size;
    public $year_built;
    
    // Pricing
    public $list_price;
    public $price_per_sqft;
    public $hoa_fees;
    public $property_taxes;
    
    // MLS Information
    public $mls_number;
    public $mls_listing_date;
    
    // Features (JSON fields)
    public $features;
    public $appliances;
    public $amenities;
    
    // Media
    public $primary_photo_url;
    public $photo_urls;
    public $virtual_tour_url;
    
    // Tracking
    public $assigned_user_id;
    public $created_by;
    public $date_entered;
    public $date_modified;
    public $deleted;

    public $table_name = 'properties';
    public $object_name = 'Property';
    public $module_dir = 'Properties';
    public $new_schema = true;
    public $importable = true;

    public function __construct()
    {
        parent::__construct();
        
        // Set default values
        $this->status = 'active';
        $this->country = 'USA';
        $this->deleted = 0;
    }

    /**
     * Get properties matching specific criteria
     */
    public static function searchProperties($criteria, $limit = 20, $offset = 0)
    {
        global $db;
        
        $whereConditions = ["deleted = 0"];
        
        // Status filter
        if (!empty($criteria['status'])) {
            $whereConditions[] = "status = '" . $db->quote($criteria['status']) . "'";
        } else {
            $whereConditions[] = "status = 'active'";
        }
        
        // Property type filter
        if (!empty($criteria['property_type'])) {
            if (is_array($criteria['property_type'])) {
                $types = "'" . implode("','", array_map([$db, 'quote'], $criteria['property_type'])) . "'";
                $whereConditions[] = "property_type IN ({$types})";
            } else {
                $whereConditions[] = "property_type = '" . $db->quote($criteria['property_type']) . "'";
            }
        }
        
        // Price range filter
        if (!empty($criteria['price_min'])) {
            $whereConditions[] = "list_price >= " . floatval($criteria['price_min']);
        }
        if (!empty($criteria['price_max'])) {
            $whereConditions[] = "list_price <= " . floatval($criteria['price_max']);
        }
        
        // Bedroom filter
        if (!empty($criteria['bedrooms_min'])) {
            $whereConditions[] = "bedrooms >= " . intval($criteria['bedrooms_min']);
        }
        if (!empty($criteria['bedrooms_max'])) {
            $whereConditions[] = "bedrooms <= " . intval($criteria['bedrooms_max']);
        }
        
        // Bathroom filter
        if (!empty($criteria['bathrooms_min'])) {
            $whereConditions[] = "bathrooms >= " . floatval($criteria['bathrooms_min']);
        }
        if (!empty($criteria['bathrooms_max'])) {
            $whereConditions[] = "bathrooms <= " . floatval($criteria['bathrooms_max']);
        }
        
        // Square footage filter
        if (!empty($criteria['sqft_min'])) {
            $whereConditions[] = "square_footage >= " . intval($criteria['sqft_min']);
        }
        if (!empty($criteria['sqft_max'])) {
            $whereConditions[] = "square_footage <= " . intval($criteria['sqft_max']);
        }
        
        // Location filter
        if (!empty($criteria['city'])) {
            $whereConditions[] = "city LIKE '%" . $db->quote($criteria['city']) . "%'";
        }
        if (!empty($criteria['state'])) {
            $whereConditions[] = "state = '" . $db->quote($criteria['state']) . "'";
        }
        if (!empty($criteria['postal_code'])) {
            $whereConditions[] = "postal_code = '" . $db->quote($criteria['postal_code']) . "'";
        }
        
        // Features filter
        if (!empty($criteria['features']) && is_array($criteria['features'])) {
            foreach ($criteria['features'] as $feature) {
                $whereConditions[] = "features LIKE '%" . $db->quote($feature) . "%'";
            }
        }
        
        // Keyword search
        if (!empty($criteria['keyword'])) {
            $keyword = $db->quote($criteria['keyword']);
            $whereConditions[] = "(name LIKE '%{$keyword}%' OR description LIKE '%{$keyword}%' OR 
                                  street_address LIKE '%{$keyword}%' OR city LIKE '%{$keyword}%')";
        }
        
        $whereClause = implode(" AND ", $whereConditions);
        
        // Order by clause
        $orderBy = "date_entered DESC";
        if (!empty($criteria['sort'])) {
            switch ($criteria['sort']) {
                case 'price_asc':
                    $orderBy = "list_price ASC";
                    break;
                case 'price_desc':
                    $orderBy = "list_price DESC";
                    break;
                case 'date_asc':
                    $orderBy = "date_entered ASC";
                    break;
                case 'sqft_desc':
                    $orderBy = "square_footage DESC";
                    break;
                case 'bedrooms_desc':
                    $orderBy = "bedrooms DESC";
                    break;
            }
        }
        
        $query = "SELECT * FROM properties 
                  WHERE {$whereClause}
                  ORDER BY {$orderBy}
                  LIMIT {$limit} OFFSET {$offset}";
        
        $result = $db->query($query);
        $properties = [];
        
        while ($row = $db->fetchByAssoc($result)) {
            // Decode JSON fields
            $jsonFields = ['features', 'appliances', 'amenities', 'photo_urls'];
            foreach ($jsonFields as $field) {
                if (!empty($row[$field])) {
                    $decoded = json_decode($row[$field], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $row[$field] = $decoded;
                    }
                }
            }
            $properties[] = $row;
        }
        
        return $properties;
    }

    /**
     * Get property count for search criteria
     */
    public static function getPropertyCount($criteria)
    {
        global $db;
        
        $whereConditions = ["deleted = 0"];
        
        // Apply same filters as searchProperties but for count
        if (!empty($criteria['status'])) {
            $whereConditions[] = "status = '" . $db->quote($criteria['status']) . "'";
        } else {
            $whereConditions[] = "status = 'active'";
        }
        
        if (!empty($criteria['property_type'])) {
            if (is_array($criteria['property_type'])) {
                $types = "'" . implode("','", array_map([$db, 'quote'], $criteria['property_type'])) . "'";
                $whereConditions[] = "property_type IN ({$types})";
            } else {
                $whereConditions[] = "property_type = '" . $db->quote($criteria['property_type']) . "'";
            }
        }
        
        if (!empty($criteria['price_min'])) {
            $whereConditions[] = "list_price >= " . floatval($criteria['price_min']);
        }
        if (!empty($criteria['price_max'])) {
            $whereConditions[] = "list_price <= " . floatval($criteria['price_max']);
        }
        
        $whereClause = implode(" AND ", $whereConditions);
        
        $query = "SELECT COUNT(*) as property_count FROM properties WHERE {$whereClause}";
        $result = $db->query($query);
        $row = $db->fetchByAssoc($result);
        
        return intval($row['property_count']);
    }

    /**
     * Get properties similar to the current property
     */
    public function getSimilarProperties($limit = 5)
    {
        $criteria = [
            'property_type' => $this->property_type,
            'price_min' => $this->list_price * 0.8, // 20% below
            'price_max' => $this->list_price * 1.2, // 20% above
        ];
        
        // Add bedroom/bathroom criteria if available
        if (!empty($this->bedrooms)) {
            $criteria['bedrooms_min'] = max(1, $this->bedrooms - 1);
            $criteria['bedrooms_max'] = $this->bedrooms + 1;
        }
        
        if (!empty($this->bathrooms)) {
            $criteria['bathrooms_min'] = max(1, $this->bathrooms - 0.5);
            $criteria['bathrooms_max'] = $this->bathrooms + 0.5;
        }
        
        // Prefer same city
        if (!empty($this->city)) {
            $criteria['city'] = $this->city;
        }
        
        $properties = self::searchProperties($criteria, $limit);
        
        // Remove current property from results
        return array_filter($properties, function($prop) {
            return $prop['id'] !== $this->id;
        });
    }

    /**
     * Calculate price per square foot
     */
    public function calculatePricePerSqft()
    {
        if (!empty($this->list_price) && !empty($this->square_footage) && $this->square_footage > 0) {
            $this->price_per_sqft = round($this->list_price / $this->square_footage, 2);
        }
        return $this->price_per_sqft;
    }

    /**
     * Get interested contacts for this property
     */
    public function getInterestedContacts()
    {
        $query = "SELECT cpi.*, c.first_name, c.last_name, c.email1, c.phone_mobile, c.assigned_user_id
                  FROM contact_property_interests cpi
                  LEFT JOIN contacts c ON cpi.contact_id = c.id
                  WHERE cpi.property_id = '{$this->id}' AND cpi.deleted = 0 AND c.deleted = 0
                  ORDER BY cpi.interest_date DESC";
        
        $result = $this->db->query($query);
        $contacts = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $contacts[] = $row;
        }
        
        return $contacts;
    }

    /**
     * Get showing history for this property
     */
    public function getShowingHistory()
    {
        $query = "SELECT ps.*, c.first_name, c.last_name, c.email1, c.phone_mobile,
                         u.first_name as agent_first_name, u.last_name as agent_last_name
                  FROM property_showings ps
                  LEFT JOIN contacts c ON ps.contact_id = c.id
                  LEFT JOIN users u ON ps.agent_id = u.id
                  WHERE ps.property_id = '{$this->id}' AND ps.deleted = 0
                  ORDER BY ps.showing_date DESC";
        
        $result = $this->db->query($query);
        $showings = [];
        
        while ($row = $this->db->fetchByAssoc($result)) {
            $showings[] = $row;
        }
        
        return $showings;
    }

    /**
     * Update property status
     */
    public function updateStatus($newStatus, $reason = '')
    {
        $allowedStatuses = ['active', 'pending', 'sold', 'off_market', 'coming_soon'];
        
        if (!in_array($newStatus, $allowedStatuses)) {
            return false;
        }
        
        $oldStatus = $this->status;
        $this->status = $newStatus;
        $this->date_modified = gmdate('Y-m-d H:i:s');
        
        $query = "UPDATE properties 
                  SET status = '{$newStatus}', date_modified = '{$this->date_modified}'
                  WHERE id = '{$this->id}'";
        
        $result = $this->db->query($query);
        
        if ($result && $oldStatus !== $newStatus) {
            // Create property alerts for interested contacts
            $this->createStatusChangeAlerts($oldStatus, $newStatus, $reason);
        }
        
        return $result;
    }

    /**
     * Create alerts for property status changes
     */
    private function createStatusChangeAlerts($oldStatus, $newStatus, $reason = '')
    {
        $interestedContacts = $this->getInterestedContacts();
        
        foreach ($interestedContacts as $contact) {
            $alertId = create_guid();
            $now = gmdate('Y-m-d H:i:s');
            $message = "Property status changed from {$oldStatus} to {$newStatus}";
            if (!empty($reason)) {
                $message .= ": {$reason}";
            }
            
            $query = "INSERT INTO property_alerts 
                      (id, contact_id, property_id, alert_type, alert_message, sent_date, date_entered)
                      VALUES ('{$alertId}', '{$contact['contact_id']}', '{$this->id}', 
                              'status_change', '{$this->db->quote($message)}', '{$now}', '{$now}')";
            
            $this->db->query($query);
        }
    }

    /**
     * Retrieve property with JSON field decoding
     */
    public function retrieve($id = -1, $encode = true, $deleted = true)
    {
        $result = parent::retrieve($id, $encode, $deleted);
        
        if ($result) {
            // Decode JSON fields
            $jsonFields = ['features', 'appliances', 'amenities', 'photo_urls'];
            
            foreach ($jsonFields as $field) {
                if (!empty($this->$field)) {
                    $decoded = json_decode($this->$field, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $this->$field = $decoded;
                    }
                }
            }
            
            // Calculate price per sqft if not set
            if (empty($this->price_per_sqft)) {
                $this->calculatePricePerSqft();
            }
        }
        
        return $result;
    }

    /**
     * Save property with JSON field encoding
     */
    public function save($check_notify = false)
    {
        // Encode JSON fields before saving
        $jsonFields = ['features', 'appliances', 'amenities', 'photo_urls'];
        
        foreach ($jsonFields as $field) {
            if (!empty($this->$field) && is_array($this->$field)) {
                $this->$field = json_encode($this->$field);
            }
        }
        
        // Calculate price per sqft
        $this->calculatePricePerSqft();
        
        // Set dates
        if (empty($this->id)) {
            $this->date_entered = gmdate('Y-m-d H:i:s');
            $this->created_by = $GLOBALS['current_user']->id ?? null;
        }
        $this->date_modified = gmdate('Y-m-d H:i:s');
        
        return parent::save($check_notify);
    }
}
