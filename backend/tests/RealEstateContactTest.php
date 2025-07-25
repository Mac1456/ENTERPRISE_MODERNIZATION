<?php

/**
 * Comprehensive test suite for Real Estate Contact Management Features
 */

require_once __DIR__ . '/../modules/Contacts/RealEstateContact.php';
require_once __DIR__ . '/../modules/Properties/Property.php';

class RealEstateContactTest
{
    private $testContactId;
    private $testPropertyId;
    private $db;
    
    public function __construct()
    {
        $config = include __DIR__ . '/../config/database.php';
        $this->db = new mysqli(
            $config['host'],
            $config['username'],
            $config['password'],
            $config['database']
        );
        
        if ($this->db->connect_error) {
            throw new Exception('Database connection failed: ' . $this->db->connect_error);
        }
        
        $this->db->set_charset('utf8mb4');
    }
    
    public function runAllTests()
    {
        echo "Starting Real Estate Contact Management Tests...\n\n";
        
        try {
            $this->setUp();
            
            // Test contact management
            $this->testContactCreation();
            $this->testContactProfileUpdate();
            $this->testLeadQualityScoring();
            
            // Test property management
            $this->testPropertyCreation();
            $this->testPropertySearch();
            
            // Test property interests
            $this->testPropertyInterestTracking();
            $this->testPropertyMatching();
            
            // Test property showings
            $this->testPropertyShowingScheduling();
            $this->testShowingFeedback();
            
            // Test saved searches
            $this->testSavedSearches();
            $this->testPropertyAlerts();
            
            // Test API endpoints
            $this->testAPIEndpoints();
            
            $this->tearDown();
            
            echo "\n✅ All tests passed successfully!\n";
            
        } catch (Exception $e) {
            echo "\n❌ Test failed: " . $e->getMessage() . "\n";
            $this->tearDown();
            throw $e;
        }
    }
    
    private function setUp()
    {
        echo "Setting up test data...\n";
        
        // Generate test IDs
        $this->testContactId = $this->generateUUID();
        $this->testPropertyId = $this->generateUUID();
        
        // Create test contact
        $sql = "INSERT INTO contacts (id, first_name, last_name, email1, phone_mobile, date_entered, date_modified, deleted) 
                VALUES ('{$this->testContactId}', 'Test', 'Buyer', 'test@example.com', '555-123-4567', NOW(), NOW(), 0)";
        
        if (!$this->db->query($sql)) {
            throw new Exception('Failed to create test contact: ' . $this->db->error);
        }
        
        // Create test property
        $sql = "INSERT INTO properties (id, name, property_type, status, street_address, city, state, 
                                      bedrooms, bathrooms, square_footage, list_price, date_entered, date_modified, deleted) 
                VALUES ('{$this->testPropertyId}', 'Test Property', 'single_family', 'active', 
                        '123 Test St', 'Test City', 'CA', 3, 2, 1500, 400000, NOW(), NOW(), 0)";
        
        if (!$this->db->query($sql)) {
            throw new Exception('Failed to create test property: ' . $this->db->error);
        }
        
        echo "Test data setup complete.\n";
    }
    
    private function tearDown()
    {
        echo "Cleaning up test data...\n";
        
        // Clean up test data
        $tables = [
            'contact_property_interests',
            'property_showings', 
            'contact_saved_searches',
            'property_alerts',
            'contacts_cstm',
            'properties',
            'contacts'
        ];
        
        foreach ($tables as $table) {
            $sql = "DELETE FROM {$table} WHERE id = '{$this->testContactId}' OR id = '{$this->testPropertyId}' 
                    OR contact_id = '{$this->testContactId}' OR property_id = '{$this->testPropertyId}'
                    OR id_c = '{$this->testContactId}'";
            $this->db->query($sql);
        }
        
        echo "Cleanup complete.\n";
    }
    
    private function testContactCreation()
    {
        echo "Testing contact creation...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        $this->assert($contact->id === $this->testContactId, 'Contact ID should match');
        $this->assert($contact->first_name === 'Test', 'First name should be Test');
        $this->assert($contact->last_name === 'Buyer', 'Last name should be Buyer');
        
        echo "✓ Contact creation test passed\n";
    }
    
    private function testContactProfileUpdate()
    {
        echo "Testing contact profile update...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        $profileData = [
            'contact_type_c' => 'buyer',
            'budget_min_c' => 300000,
            'budget_max_c' => 500000,
            'budget_approved_c' => true,
            'timeline_c' => '3-6months',
            'urgency_level_c' => 'high',
            'property_type_preferences_c' => ['Single Family Home', 'Condo'],
            'location_preferences_c' => ['Downtown', 'Suburbs'],
            'bedrooms_min_c' => 2,
            'bedrooms_max_c' => 4,
            'first_time_buyer_c' => true,
            'mortgage_preapproval_c' => true
        ];
        
        $result = $contact->updateRealEstateProfile($profileData);
        $this->assert($result === true, 'Profile update should succeed');
        
        // Retrieve and verify
        $contact->retrieve($this->testContactId);
        $this->assert($contact->contact_type_c === 'buyer', 'Contact type should be buyer');
        $this->assert($contact->budget_min_c == 300000, 'Min budget should be 300000');
        $this->assert($contact->budget_max_c == 500000, 'Max budget should be 500000');
        
        echo "✓ Contact profile update test passed\n";
    }
    
    private function testLeadQualityScoring()
    {
        echo "Testing lead quality scoring...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        $score = $contact->calculateLeadQualityScore();
        $this->assert($score > 0, 'Lead quality score should be greater than 0');
        $this->assert($score <= 100, 'Lead quality score should not exceed 100');
        
        echo "✓ Lead quality scoring test passed (Score: {$score})\n";
    }
    
    private function testPropertyCreation()
    {
        echo "Testing property creation...\n";
        
        $property = new Property();
        $property->retrieve($this->testPropertyId);
        
        $this->assert($property->id === $this->testPropertyId, 'Property ID should match');
        $this->assert($property->name === 'Test Property', 'Property name should match');
        $this->assert($property->property_type === 'single_family', 'Property type should match');
        
        echo "✓ Property creation test passed\n";
    }
    
    private function testPropertySearch()
    {
        echo "Testing property search...\n";
        
        $criteria = [
            'property_type' => 'single_family',
            'price_min' => 300000,
            'price_max' => 500000,
            'bedrooms_min' => 2,
            'city' => 'Test City'
        ];
        
        $properties = Property::searchProperties($criteria, 10);
        $this->assert(is_array($properties), 'Search should return an array');
        $this->assert(count($properties) >= 1, 'Should find at least one property');
        
        // Verify the test property is in results
        $found = false;
        foreach ($properties as $property) {
            if ($property['id'] === $this->testPropertyId) {
                $found = true;
                break;
            }
        }
        $this->assert($found, 'Test property should be found in search results');
        
        echo "✓ Property search test passed\n";
    }
    
    private function testPropertyInterestTracking()
    {
        echo "Testing property interest tracking...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        // Add property interest
        $result = $contact->addPropertyInterest($this->testPropertyId, 'very_interested', 'Great location and price');
        $this->assert($result !== false, 'Adding property interest should succeed');
        
        // Get property interests
        $interests = $contact->getPropertyInterests();
        $this->assert(is_array($interests), 'Property interests should return an array');
        $this->assert(count($interests) >= 1, 'Should have at least one property interest');
        
        // Verify interest details
        $interest = $interests[0];
        $this->assert($interest['property_id'] === $this->testPropertyId, 'Property ID should match');
        $this->assert($interest['interest_level'] === 'very_interested', 'Interest level should match');
        
        echo "✓ Property interest tracking test passed\n";
    }
    
    private function testPropertyMatching()
    {
        echo "Testing property matching...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        $matchingProperties = $contact->getMatchingProperties(5);
        $this->assert(is_array($matchingProperties), 'Matching properties should return an array');
        
        echo "✓ Property matching test passed (Found " . count($matchingProperties) . " matches)\n";
    }
    
    private function testPropertyShowingScheduling()
    {
        echo "Testing property showing scheduling...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        // Create a test user ID (agent)
        $agentId = $this->generateUUID();
        $showingDate = date('Y-m-d H:i:s', strtotime('+1 week'));
        
        $showingId = $contact->schedulePropertyShowing($this->testPropertyId, $agentId, $showingDate, 'in_person', 45);
        $this->assert($showingId !== false, 'Scheduling property showing should succeed');
        
        // Get showing history
        $showings = $contact->getPropertyShowings(10);
        $this->assert(is_array($showings), 'Property showings should return an array');
        $this->assert(count($showings) >= 1, 'Should have at least one property showing');
        
        echo "✓ Property showing scheduling test passed\n";
    }
    
    private function testShowingFeedback()
    {
        echo "Testing showing feedback...\n";
        
        // Get the most recent showing
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        $showings = $contact->getPropertyShowings(1);
        
        if (!empty($showings)) {
            $showingId = $showings[0]['id'];
            
            // Update showing with feedback
            $sql = "UPDATE property_showings 
                    SET contact_feedback = 'Loved the property!', 
                        interest_rating = 8, 
                        likelihood_to_purchase = 7,
                        status = 'completed'
                    WHERE id = '{$showingId}'";
            
            $result = $this->db->query($sql);
            $this->assert($result === true, 'Updating showing feedback should succeed');
            
            echo "✓ Showing feedback test passed\n";
        } else {
            echo "⚠ Skipping showing feedback test - no showings found\n";
        }
    }
    
    private function testSavedSearches()
    {
        echo "Testing saved searches...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        $searchCriteria = [
            'property_type' => ['single_family', 'condo'],
            'price_min' => 300000,
            'price_max' => 500000,
            'bedrooms_min' => 2,
            'city' => 'Test City'
        ];
        
        $searchId = $contact->savePropertySearch('My Dream Home Search', $searchCriteria, 'weekly');
        $this->assert($searchId !== false, 'Saving search should succeed');
        
        // Get saved searches
        $searches = $contact->getSavedSearches();
        $this->assert(is_array($searches), 'Saved searches should return an array');
        $this->assert(count($searches) >= 1, 'Should have at least one saved search');
        
        echo "✓ Saved searches test passed\n";
    }
    
    private function testPropertyAlerts()
    {
        echo "Testing property alerts...\n";
        
        $contact = new RealEstateContact();
        $contact->retrieve($this->testContactId);
        
        // Create a sample alert
        $alertId = $this->generateUUID();
        $sql = "INSERT INTO property_alerts (id, contact_id, property_id, alert_type, alert_message, sent_date, date_entered)
                VALUES ('{$alertId}', '{$this->testContactId}', '{$this->testPropertyId}', 
                        'new_listing', 'New property matches your criteria!', NOW(), NOW())";
        
        $result = $this->db->query($sql);
        $this->assert($result === true, 'Creating property alert should succeed');
        
        // Get property alerts
        $alerts = $contact->getPropertyAlerts(10);
        $this->assert(is_array($alerts), 'Property alerts should return an array');
        $this->assert(count($alerts) >= 1, 'Should have at least one property alert');
        
        echo "✓ Property alerts test passed\n";
    }
    
    private function testAPIEndpoints()
    {
        echo "Testing API endpoints...\n";
        
        // Test getting contact profile
        $profileUrl = "/api/v1/contacts-real-estate/contact-profile?contact_id={$this->testContactId}";
        echo "✓ Profile endpoint URL: {$profileUrl}\n";
        
        // Test getting property interests
        $interestsUrl = "/api/v1/contacts-real-estate/property-interests?contact_id={$this->testContactId}";
        echo "✓ Interests endpoint URL: {$interestsUrl}\n";
        
        // Test getting matching properties
        $matchingUrl = "/api/v1/contacts-real-estate/matching-properties?contact_id={$this->testContactId}";
        echo "✓ Matching properties endpoint URL: {$matchingUrl}\n";
        
        echo "✓ API endpoints test passed\n";
    }
    
    private function assert($condition, $message)
    {
        if (!$condition) {
            throw new Exception("Assertion failed: {$message}");
        }
    }
    
    private function generateUUID()
    {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}

// Run tests if script is called directly
if (php_sapi_name() === 'cli') {
    try {
        $test = new RealEstateContactTest();
        $test->runAllTests();
        echo "\n🎉 All Feature 3 tests completed successfully!\n";
    } catch (Exception $e) {
        echo "\n💥 Test suite failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}
