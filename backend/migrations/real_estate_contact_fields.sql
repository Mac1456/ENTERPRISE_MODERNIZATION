-- Real Estate Contact Enhancement Migration
-- This script adds real estate-specific fields to the contacts module

-- Create custom fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts_cstm (
    id_c CHAR(36) NOT NULL PRIMARY KEY,
    
    -- Real Estate Profile Type
    contact_type_c VARCHAR(100) DEFAULT 'buyer' COMMENT 'buyer, seller, investor, tenant, landlord',
    
    -- Budget Information
    budget_min_c DECIMAL(15,2) DEFAULT NULL COMMENT 'Minimum budget for property search',
    budget_max_c DECIMAL(15,2) DEFAULT NULL COMMENT 'Maximum budget for property search',
    budget_approved_c TINYINT(1) DEFAULT 0 COMMENT 'Is budget pre-approved',
    
    -- Property Preferences
    property_type_preferences_c TEXT COMMENT 'JSON array of preferred property types',
    location_preferences_c TEXT COMMENT 'JSON array of preferred locations/areas',
    bedrooms_min_c INT DEFAULT NULL COMMENT 'Minimum number of bedrooms',
    bedrooms_max_c INT DEFAULT NULL COMMENT 'Maximum number of bedrooms',
    bathrooms_min_c DECIMAL(3,1) DEFAULT NULL COMMENT 'Minimum number of bathrooms',
    bathrooms_max_c DECIMAL(3,1) DEFAULT NULL COMMENT 'Maximum number of bathrooms',
    square_footage_min_c INT DEFAULT NULL COMMENT 'Minimum square footage',
    square_footage_max_c INT DEFAULT NULL COMMENT 'Maximum square footage',
    
    -- Timeline and Urgency
    timeline_c VARCHAR(50) DEFAULT NULL COMMENT 'immediate, 1-3months, 3-6months, 6-12months, 12+months',
    urgency_level_c VARCHAR(20) DEFAULT 'medium' COMMENT 'low, medium, high, urgent',
    move_in_date_c DATE DEFAULT NULL COMMENT 'Desired move-in date',
    
    -- Real Estate Specific Information
    first_time_buyer_c TINYINT(1) DEFAULT 0 COMMENT 'Is this a first-time buyer',
    current_home_status_c VARCHAR(50) DEFAULT NULL COMMENT 'own, rent, living_with_family, other',
    needs_to_sell_first_c TINYINT(1) DEFAULT 0 COMMENT 'Needs to sell current home first',
    mortgage_preapproval_c TINYINT(1) DEFAULT 0 COMMENT 'Has mortgage pre-approval',
    cash_buyer_c TINYINT(1) DEFAULT 0 COMMENT 'Is cash buyer',
    
    -- Communication Preferences
    preferred_contact_method_c VARCHAR(20) DEFAULT 'phone' COMMENT 'phone, email, text, app',
    preferred_contact_time_c VARCHAR(50) DEFAULT NULL COMMENT 'morning, afternoon, evening, weekends',
    communication_frequency_c VARCHAR(20) DEFAULT 'weekly' COMMENT 'daily, weekly, biweekly, monthly',
    
    -- Lead Quality and Scoring
    lead_quality_score_c INT DEFAULT 0 COMMENT 'Lead quality score 1-100',
    engagement_level_c VARCHAR(20) DEFAULT 'medium' COMMENT 'low, medium, high, very_high',
    last_activity_date_c DATE DEFAULT NULL COMMENT 'Last meaningful interaction date',
    
    -- Property Search Preferences
    home_features_c TEXT COMMENT 'JSON array of desired home features',
    neighborhood_features_c TEXT COMMENT 'JSON array of desired neighborhood features',
    deal_breakers_c TEXT COMMENT 'JSON array of absolute deal breakers',
    
    -- Notes and Special Requirements
    special_requirements_c TEXT COMMENT 'Any special requirements or notes',
    accessibility_needs_c TEXT COMMENT 'Any accessibility requirements',
    pet_information_c VARCHAR(255) DEFAULT NULL COMMENT 'Pet ownership information',
    
    -- Tracking Fields
    created_date_c DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_date_c DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_c) REFERENCES contacts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Properties table for property listings
CREATE TABLE IF NOT EXISTS properties (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL COMMENT 'single_family, condo, townhouse, apartment, commercial, land',
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active, pending, sold, off_market, coming_soon',
    
    -- Address Information
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL,
    
    -- Property Details
    bedrooms INT DEFAULT NULL,
    bathrooms DECIMAL(3,1) DEFAULT NULL,
    square_footage INT DEFAULT NULL,
    lot_size DECIMAL(10,2) DEFAULT NULL,
    year_built YEAR DEFAULT NULL,
    
    -- Pricing
    list_price DECIMAL(15,2) DEFAULT NULL,
    price_per_sqft DECIMAL(10,2) DEFAULT NULL,
    hoa_fees DECIMAL(10,2) DEFAULT NULL,
    property_taxes DECIMAL(10,2) DEFAULT NULL,
    
    -- MLS Information
    mls_number VARCHAR(50) UNIQUE,
    mls_listing_date DATE DEFAULT NULL,
    
    -- Features
    features TEXT COMMENT 'JSON array of property features',
    appliances TEXT COMMENT 'JSON array of included appliances',
    amenities TEXT COMMENT 'JSON array of community amenities',
    
    -- Media
    primary_photo_url VARCHAR(500),
    photo_urls TEXT COMMENT 'JSON array of photo URLs',
    virtual_tour_url VARCHAR(500),
    
    -- Tracking
    assigned_user_id CHAR(36),
    created_by CHAR(36),
    date_entered DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    
    INDEX idx_properties_status (status),
    INDEX idx_properties_type (property_type),
    INDEX idx_properties_location (city, state),
    INDEX idx_properties_price (list_price),
    INDEX idx_properties_mls (mls_number),
    INDEX idx_properties_assigned (assigned_user_id),
    INDEX idx_properties_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Property Interest Tracking table (many-to-many)
CREATE TABLE IF NOT EXISTS contact_property_interests (
    id CHAR(36) NOT NULL PRIMARY KEY,
    contact_id CHAR(36) NOT NULL,
    property_id CHAR(36) NOT NULL,
    interest_level VARCHAR(20) DEFAULT 'interested' COMMENT 'interested, very_interested, not_interested, favorite',
    interest_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    follow_up_date DATE DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active, closed, no_longer_available',
    date_entered DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contact_property (contact_id, property_id),
    INDEX idx_contact_interests (contact_id),
    INDEX idx_property_interests (property_id),
    INDEX idx_interest_level (interest_level),
    INDEX idx_interest_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Property Showing History table
CREATE TABLE IF NOT EXISTS property_showings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    contact_id CHAR(36) NOT NULL,
    property_id CHAR(36) NOT NULL,
    agent_id CHAR(36) NOT NULL,
    showing_date DATETIME NOT NULL,
    showing_type VARCHAR(20) DEFAULT 'in_person' COMMENT 'in_person, virtual, drive_by',
    duration_minutes INT DEFAULT 30,
    
    -- Feedback
    contact_feedback TEXT,
    agent_notes TEXT,
    interest_rating INT DEFAULT NULL COMMENT '1-10 rating of interest level',
    likelihood_to_purchase INT DEFAULT NULL COMMENT '1-10 likelihood to purchase',
    
    -- Follow-up
    follow_up_required TINYINT(1) DEFAULT 0,
    follow_up_date DATE DEFAULT NULL,
    follow_up_notes TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' COMMENT 'scheduled, completed, cancelled, no_show',
    
    -- Tracking
    created_by CHAR(36),
    date_entered DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_showings_contact (contact_id),
    INDEX idx_showings_property (property_id),
    INDEX idx_showings_agent (agent_id),
    INDEX idx_showings_date (showing_date),
    INDEX idx_showings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Saved Searches table
CREATE TABLE IF NOT EXISTS contact_saved_searches (
    id CHAR(36) NOT NULL PRIMARY KEY,
    contact_id CHAR(36) NOT NULL,
    search_name VARCHAR(255) NOT NULL,
    search_criteria TEXT NOT NULL COMMENT 'JSON object with search parameters',
    alert_frequency VARCHAR(20) DEFAULT 'immediate' COMMENT 'immediate, daily, weekly, none',
    last_alert_sent DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    
    -- Tracking
    date_entered DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    INDEX idx_saved_searches_contact (contact_id),
    INDEX idx_saved_searches_active (is_active),
    INDEX idx_saved_searches_alerts (alert_frequency, last_alert_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Property Alerts table
CREATE TABLE IF NOT EXISTS property_alerts (
    id CHAR(36) NOT NULL PRIMARY KEY,
    contact_id CHAR(36) NOT NULL,
    property_id CHAR(36) NOT NULL,
    saved_search_id CHAR(36) DEFAULT NULL,
    alert_type VARCHAR(50) NOT NULL COMMENT 'new_listing, price_change, status_change, similar_property',
    alert_message TEXT NOT NULL,
    sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_method VARCHAR(20) DEFAULT 'email' COMMENT 'email, sms, app_notification',
    read_status TINYINT(1) DEFAULT 0,
    clicked TINYINT(1) DEFAULT 0,
    
    -- Tracking
    date_entered DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (saved_search_id) REFERENCES contact_saved_searches(id) ON DELETE SET NULL,
    INDEX idx_alerts_contact (contact_id),
    INDEX idx_alerts_property (property_id),
    INDEX idx_alerts_type (alert_type),
    INDEX idx_alerts_sent (sent_date),
    INDEX idx_alerts_read (read_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample property types and features for reference
CREATE TABLE IF NOT EXISTS property_features_reference (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    
    INDEX idx_features_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert common property features
INSERT INTO property_features_reference (category, feature_name, description) VALUES
('interior', 'Hardwood Floors', 'Hardwood flooring throughout'),
('interior', 'Updated Kitchen', 'Recently renovated kitchen'),
('interior', 'Fireplace', 'Working fireplace'),
('interior', 'Walk-in Closets', 'Walk-in closet space'),
('interior', 'Cathedral Ceilings', 'High, angled ceilings'),
('interior', 'Open Floor Plan', 'Open concept living space'),
('exterior', 'Garage', 'Attached or detached garage'),
('exterior', 'Pool', 'Swimming pool'),
('exterior', 'Patio/Deck', 'Outdoor living space'),
('exterior', 'Fenced Yard', 'Fenced backyard'),
('exterior', 'Garden', 'Landscaped garden area'),
('community', 'HOA', 'Homeowners association'),
('community', 'Gym/Fitness Center', 'Community fitness facilities'),
('community', 'Pool', 'Community pool'),
('community', 'Playground', 'Children playground'),
('community', 'Security', '24/7 security or gated community'),
('location', 'Good Schools', 'Highly rated school district'),
('location', 'Near Shopping', 'Close to shopping centers'),
('location', 'Public Transportation', 'Access to public transit'),
('location', 'Low Crime', 'Low crime neighborhood'),
('location', 'Walkable', 'Walkable neighborhood');
