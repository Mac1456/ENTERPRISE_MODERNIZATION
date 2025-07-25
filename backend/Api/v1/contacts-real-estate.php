<?php

/**
 * Real Estate Contact Management API Endpoints
 * Provides comprehensive property-centric contact management functionality
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../modules/Contacts/RealEstateContact.php';
require_once __DIR__ . '/../../modules/Properties/Property.php';

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($request_uri, '/'));

// Extract the action from the URL
$action = $path_parts[count($path_parts) - 1] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGetRequest($action);
            break;
        case 'POST':
            handlePostRequest($action);
            break;
        case 'PUT':
            handlePutRequest($action);
            break;
        case 'DELETE':
            handleDeleteRequest($action);
            break;
        default:
            throw new Exception('Method not allowed', 405);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
}

/**
 * Handle GET requests
 */
function handleGetRequest($action)
{
    switch ($action) {
        case 'contacts':
            getContacts();
            break;
        case 'contact':
            getContact();
            break;
        case 'property-interests':
            getContactPropertyInterests();
            break;
        case 'showing-history':
            getContactShowingHistory();
            break;
        case 'saved-searches':
            getContactSavedSearches();
            break;
        case 'property-alerts':
            getContactPropertyAlerts();
            break;
        case 'matching-properties':
            getMatchingProperties();
            break;
        case 'contact-profile':
            getContactRealEstateProfile();
            break;
        default:
            throw new Exception('Endpoint not found', 404);
    }
}

/**
 * Handle POST requests
 */
function handlePostRequest($action)
{
    switch ($action) {
        case 'contact':
            createContact();
            break;
        case 'property-interest':
            addPropertyInterest();
            break;
        case 'schedule-showing':
            schedulePropertyShowing();
            break;
        case 'save-search':
            savePropertySearch();
            break;
        case 'update-profile':
            updateContactProfile();
            break;
        case 'calculate-score':
            calculateLeadScore();
            break;
        default:
            throw new Exception('Endpoint not found', 404);
    }
}

/**
 * Handle PUT requests
 */
function handlePutRequest($action)
{
    switch ($action) {
        case 'contact':
            updateContact();
            break;
        case 'property-interest':
            updatePropertyInterest();
            break;
        case 'showing-feedback':
            updateShowingFeedback();
            break;
        case 'mark-alert-read':
            markAlertAsRead();
            break;
        default:
            throw new Exception('Endpoint not found', 404);
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($action)
{
    switch ($action) {
        case 'property-interest':
            removePropertyInterest();
            break;
        case 'saved-search':
            deleteSavedSearch();
            break;
        default:
            throw new Exception('Endpoint not found', 404);
    }
}

/**
 * Get all contacts with real estate profiles
 */
function getContacts()
{
    $page = intval($_GET['page'] ?? 1);
    $limit = min(intval($_GET['limit'] ?? 20), 100);
    $offset = ($page - 1) * $limit;
    $search = $_GET['search'] ?? '';
    $contact_type = $_GET['contact_type'] ?? '';
    $agent_id = $_GET['agent_id'] ?? '';

    $db = getDB();
    
    $whereConditions = ["c.deleted = 0"];
    
    if (!empty($search)) {
        $search = $db->real_escape_string($search);
        $whereConditions[] = "(c.first_name LIKE '%{$search}%' OR c.last_name LIKE '%{$search}%' OR c.email1 LIKE '%{$search}%')";
    }
    
    if (!empty($contact_type)) {
        $contact_type = $db->real_escape_string($contact_type);
        $whereConditions[] = "cc.contact_type_c = '{$contact_type}'";
    }
    
    if (!empty($agent_id)) {
        $agent_id = $db->real_escape_string($agent_id);
        $whereConditions[] = "c.assigned_user_id = '{$agent_id}'";
    }
    
    $whereClause = implode(" AND ", $whereConditions);
    
    $query = "SELECT c.id, c.first_name, c.last_name, c.email1, c.phone_mobile, c.phone_work,
                     c.assigned_user_id, c.date_entered, c.date_modified,
                     cc.contact_type_c, cc.budget_min_c, cc.budget_max_c, cc.timeline_c,
                     cc.urgency_level_c, cc.lead_quality_score_c, cc.engagement_level_c,
                     cc.preferred_contact_method_c, cc.last_activity_date_c,
                     u.first_name as agent_first_name, u.last_name as agent_last_name
              FROM contacts c
              LEFT JOIN contacts_cstm cc ON c.id = cc.id_c
              LEFT JOIN users u ON c.assigned_user_id = u.id
              WHERE {$whereClause}
              ORDER BY c.date_modified DESC
              LIMIT {$limit} OFFSET {$offset}";
    
    $result = $db->query($query);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . $db->error, 500);
    }
    
    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate days since last activity
        if ($row['last_activity_date_c']) {
            $row['days_since_activity'] = (time() - strtotime($row['last_activity_date_c'])) / (24 * 60 * 60);
        }
        
        // Format budget display
        if ($row['budget_min_c'] || $row['budget_max_c']) {
            $min = $row['budget_min_c'] ? '$' . number_format($row['budget_min_c']) : 'No min';
            $max = $row['budget_max_c'] ? '$' . number_format($row['budget_max_c']) : 'No max';
            $row['budget_display'] = "{$min} - {$max}";
        }
        
        $contacts[] = $row;
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM contacts c 
                   LEFT JOIN contacts_cstm cc ON c.id = cc.id_c 
                   WHERE {$whereClause}";
    $countResult = $db->query($countQuery);
    $total = $countResult->fetch_assoc()['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $contacts,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Get single contact with full real estate profile
 */
function getContact()
{
    $contactId = $_GET['id'] ?? '';
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    // Get property interests
    $propertyInterests = $contact->getPropertyInterests();
    
    // Get showing history
    $showingHistory = $contact->getPropertyShowings(10);
    
    // Get saved searches
    $savedSearches = $contact->getSavedSearches();
    
    // Get recent alerts
    $recentAlerts = $contact->getPropertyAlerts(5);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'contact' => $contact,
            'property_interests' => $propertyInterests,
            'showing_history' => $showingHistory,
            'saved_searches' => $savedSearches,
            'recent_alerts' => $recentAlerts
        ]
    ]);
}

/**
 * Get contact's real estate profile
 */
function getContactRealEstateProfile()
{
    $contactId = $_GET['contact_id'] ?? '';
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $profile = [
        'contact_type' => $contact->contact_type_c,
        'budget_min' => $contact->budget_min_c,
        'budget_max' => $contact->budget_max_c,
        'budget_approved' => $contact->budget_approved_c,
        'property_type_preferences' => $contact->property_type_preferences_c,
        'location_preferences' => $contact->location_preferences_c,
        'bedrooms_min' => $contact->bedrooms_min_c,
        'bedrooms_max' => $contact->bedrooms_max_c,
        'bathrooms_min' => $contact->bathrooms_min_c,
        'bathrooms_max' => $contact->bathrooms_max_c,
        'square_footage_min' => $contact->square_footage_min_c,
        'square_footage_max' => $contact->square_footage_max_c,
        'timeline' => $contact->timeline_c,
        'urgency_level' => $contact->urgency_level_c,
        'move_in_date' => $contact->move_in_date_c,
        'first_time_buyer' => $contact->first_time_buyer_c,
        'current_home_status' => $contact->current_home_status_c,
        'needs_to_sell_first' => $contact->needs_to_sell_first_c,
        'mortgage_preapproval' => $contact->mortgage_preapproval_c,
        'cash_buyer' => $contact->cash_buyer_c,
        'preferred_contact_method' => $contact->preferred_contact_method_c,
        'preferred_contact_time' => $contact->preferred_contact_time_c,
        'communication_frequency' => $contact->communication_frequency_c,
        'lead_quality_score' => $contact->lead_quality_score_c,
        'engagement_level' => $contact->engagement_level_c,
        'home_features' => $contact->home_features_c,
        'neighborhood_features' => $contact->neighborhood_features_c,
        'deal_breakers' => $contact->deal_breakers_c,
        'special_requirements' => $contact->special_requirements_c,
        'accessibility_needs' => $contact->accessibility_needs_c,
        'pet_information' => $contact->pet_information_c
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $profile
    ]);
}

/**
 * Get contact's property interests
 */
function getContactPropertyInterests()
{
    $contactId = $_GET['contact_id'] ?? '';
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $interests = $contact->getPropertyInterests();
    
    echo json_encode([
        'success' => true,
        'data' => $interests
    ]);
}

/**
 * Get contact's showing history
 */
function getContactShowingHistory()
{
    $contactId = $_GET['contact_id'] ?? '';
    $limit = min(intval($_GET['limit'] ?? 20), 100);
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $showings = $contact->getPropertyShowings($limit);
    
    echo json_encode([
        'success' => true,
        'data' => $showings
    ]);
}

/**
 * Get contact's saved searches
 */
function getContactSavedSearches()
{
    $contactId = $_GET['contact_id'] ?? '';
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $searches = $contact->getSavedSearches();
    
    echo json_encode([
        'success' => true,
        'data' => $searches
    ]);
}

/**
 * Get contact's property alerts
 */
function getContactPropertyAlerts()
{
    $contactId = $_GET['contact_id'] ?? '';
    $limit = min(intval($_GET['limit'] ?? 20), 50);
    $unreadOnly = !empty($_GET['unread_only']);
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $alerts = $contact->getPropertyAlerts($limit, $unreadOnly);
    
    echo json_encode([
        'success' => true,
        'data' => $alerts
    ]);
}

/**
 * Get matching properties for a contact
 */
function getMatchingProperties()
{
    $contactId = $_GET['contact_id'] ?? '';
    $limit = min(intval($_GET['limit'] ?? 10), 50);
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $properties = $contact->getMatchingProperties($limit);
    
    echo json_encode([
        'success' => true,
        'data' => $properties
    ]);
}

/**
 * Create a new real estate contact
 */
function createContact()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $requiredFields = ['first_name', 'last_name', 'email1'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field '{$field}' is required", 400);
        }
    }
    
    $contact = new RealEstateContact();
    
    // Set basic contact fields
    $contact->first_name = $input['first_name'];
    $contact->last_name = $input['last_name'];
    $contact->email1 = $input['email1'];
    $contact->phone_mobile = $input['phone_mobile'] ?? '';
    $contact->phone_work = $input['phone_work'] ?? '';
    $contact->assigned_user_id = $input['assigned_user_id'] ?? $GLOBALS['current_user']->id;
    
    // Save basic contact first
    $contactId = $contact->save();
    
    if (!$contactId) {
        throw new Exception('Failed to create contact', 500);
    }
    
    // Update real estate profile if provided
    if (!empty($input['real_estate_profile'])) {
        $contact->updateRealEstateProfile($input['real_estate_profile']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $contactId,
            'message' => 'Contact created successfully'
        ]
    ]);
}

/**
 * Update contact's real estate profile
 */
function updateContactProfile()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $contactId = $input['contact_id'] ?? '';
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $result = $contact->updateRealEstateProfile($input);
    
    if (!$result) {
        throw new Exception('Failed to update contact profile', 500);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'message' => 'Contact profile updated successfully',
            'lead_quality_score' => $contact->lead_quality_score_c
        ]
    ]);
}

/**
 * Add property interest for a contact
 */
function addPropertyInterest()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $contactId = $input['contact_id'] ?? '';
    $propertyId = $input['property_id'] ?? '';
    $interestLevel = $input['interest_level'] ?? 'interested';
    $notes = $input['notes'] ?? '';
    
    if (empty($contactId) || empty($propertyId)) {
        throw new Exception('Contact ID and Property ID are required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $result = $contact->addPropertyInterest($propertyId, $interestLevel, $notes);
    
    if (!$result) {
        throw new Exception('Failed to add property interest', 500);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'message' => 'Property interest added successfully'
        ]
    ]);
}

/**
 * Schedule property showing
 */
function schedulePropertyShowing()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $contactId = $input['contact_id'] ?? '';
    $propertyId = $input['property_id'] ?? '';
    $agentId = $input['agent_id'] ?? '';
    $showingDate = $input['showing_date'] ?? '';
    $showingType = $input['showing_type'] ?? 'in_person';
    $duration = intval($input['duration'] ?? 30);
    
    if (empty($contactId) || empty($propertyId) || empty($agentId) || empty($showingDate)) {
        throw new Exception('Contact ID, Property ID, Agent ID, and Showing Date are required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $showingId = $contact->schedulePropertyShowing($propertyId, $agentId, $showingDate, $showingType, $duration);
    
    if (!$showingId) {
        throw new Exception('Failed to schedule property showing', 500);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'showing_id' => $showingId,
            'message' => 'Property showing scheduled successfully'
        ]
    ]);
}

/**
 * Save property search for a contact
 */
function savePropertySearch()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $contactId = $input['contact_id'] ?? '';
    $searchName = $input['search_name'] ?? '';
    $searchCriteria = $input['search_criteria'] ?? [];
    $alertFrequency = $input['alert_frequency'] ?? 'weekly';
    
    if (empty($contactId) || empty($searchName) || empty($searchCriteria)) {
        throw new Exception('Contact ID, Search Name, and Search Criteria are required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $searchId = $contact->savePropertySearch($searchName, $searchCriteria, $alertFrequency);
    
    if (!$searchId) {
        throw new Exception('Failed to save property search', 500);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'search_id' => $searchId,
            'message' => 'Property search saved successfully'
        ]
    ]);
}

/**
 * Calculate lead quality score
 */
function calculateLeadScore()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $contactId = $input['contact_id'] ?? '';
    
    if (empty($contactId)) {
        throw new Exception('Contact ID is required', 400);
    }
    
    $contact = new RealEstateContact();
    $contact->retrieve($contactId);
    
    if (empty($contact->id)) {
        throw new Exception('Contact not found', 404);
    }
    
    $score = $contact->calculateLeadQualityScore();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'lead_quality_score' => $score,
            'message' => 'Lead quality score calculated successfully'
        ]
    ]);
}

/**
 * Mark property alert as read
 */
function markAlertAsRead()
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }
    
    $alertId = $input['alert_id'] ?? '';
    
    if (empty($alertId)) {
        throw new Exception('Alert ID is required', 400);
    }
    
    $db = getDB();
    $alertId = $db->real_escape_string($alertId);
    $now = date('Y-m-d H:i:s');
    
    $query = "UPDATE property_alerts SET read_status = 1, date_modified = '{$now}' WHERE id = '{$alertId}'";
    $result = $db->query($query);
    
    if (!$result) {
        throw new Exception('Failed to mark alert as read', 500);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'message' => 'Alert marked as read'
        ]
    ]);
}

/**
 * Helper function to get database connection
 */
function getDB()
{
    static $db = null;
    
    if ($db === null) {
        $config = include __DIR__ . '/../../config/database.php';
        $db = new mysqli(
            $config['host'],
            $config['username'],
            $config['password'],
            $config['database']
        );
        
        if ($db->connect_error) {
            throw new Exception('Database connection failed: ' . $db->connect_error, 500);
        }
        
        $db->set_charset('utf8mb4');
    }
    
    return $db;
}

/**
 * Helper function to generate UUID
 */
function create_guid()
{
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
