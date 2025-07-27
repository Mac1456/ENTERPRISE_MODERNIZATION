<?php
/**
 * Modern UI API Bridge for SuiteCRM Real Estate Pro
 * This file handles API requests from the React frontend
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define sugarEntry to allow SuiteCRM access
if (!defined('sugarEntry')) define('sugarEntry', true);

// Navigate to SuiteCRM root and include entry point
chdir(dirname(__FILE__) . '/../..');
require_once('include/entryPoint.php');

// Enable CORS for the frontend
header('Access-Control-Allow-Origin: http://localhost:3002');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON content type
header('Content-Type: application/json');

// Get the request path and method
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/custom/modernui/api.php';
$path = str_replace($basePath, '', parse_url($requestUri, PHP_URL_PATH));
$method = $_SERVER['REQUEST_METHOD'];

// Get JSON input for POST/PUT requests
$input = json_decode(file_get_contents('php://input'), true);

// Simple router
try {
    switch ($path) {
        case '/dashboard-stats':
            handleDashboardStats();
            break;
            
        case '/leads':
            handleLeads($method, $input);
            break;
            
        case '/contacts':
            handleContacts($method, $input);
            break;
            
        case '/properties':
            handleProperties($method, $input);
            break;
            
        case '/opportunities':
            handleOpportunities($method, $input);
            break;
            
        case '/auth/login':
            handleLogin($input);
            break;
            
        case '/auth/logout':
            handleLogout();
            break;
            
        case '/auth/me':
            handleCurrentUser();
            break;
            
        default:
            if (preg_match('/^\/leads\/(.+)$/', $path, $matches)) {
                handleSingleLead($method, $matches[1], $input);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
            }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// Handler functions

function handleDashboardStats() {
    global $db;
    
    // Get real stats from database
    $stats = [
        'totalContacts' => 0,
        'activeLeads' => 0,
        'pipelineValue' => 0,
        'monthlyRevenue' => 0
    ];
    
    // Count contacts
    $contactsQuery = "SELECT COUNT(*) as count FROM contacts WHERE deleted = 0";
    $result = $db->query($contactsQuery);
    if ($row = $db->fetchByAssoc($result)) {
        $stats['totalContacts'] = (int)$row['count'];
    }
    
    // Count active leads
    $leadsQuery = "SELECT COUNT(*) as count FROM leads WHERE deleted = 0 AND status IN ('New', 'Assigned', 'In Process')";
    $result = $db->query($leadsQuery);
    if ($row = $db->fetchByAssoc($result)) {
        $stats['activeLeads'] = (int)$row['count'];
    }
    
    // Calculate pipeline value
    $oppQuery = "SELECT SUM(amount) as total FROM opportunities WHERE deleted = 0 AND sales_stage NOT IN ('Closed Won', 'Closed Lost')";
    $result = $db->query($oppQuery);
    if ($row = $db->fetchByAssoc($result)) {
        $stats['pipelineValue'] = (float)($row['total'] ?? 0);
    }
    
    // Calculate monthly revenue (closed won this month)
    $firstDay = date('Y-m-01');
    $revenueQuery = "SELECT SUM(amount) as total FROM opportunities WHERE deleted = 0 AND sales_stage = 'Closed Won' AND date_closed >= '$firstDay'";
    $result = $db->query($revenueQuery);
    if ($row = $db->fetchByAssoc($result)) {
        $stats['monthlyRevenue'] = (float)($row['total'] ?? 0);
    }
    
    echo json_encode($stats);
}

function handleLeads($method, $input) {
    global $db;
    
    if ($method === 'GET') {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;
        
        // Get leads with user assignment info
        $query = "SELECT 
            l.id,
            l.first_name,
            l.last_name,
            l.email1 as email,
            l.phone_work as phone,
            l.status,
            l.lead_source as source,
            l.date_entered as createdAt,
            l.assigned_user_id,
            CONCAT(u.first_name, ' ', u.last_name) as assignedUserName,
            l.description,
            l.account_name as company
        FROM leads l
        LEFT JOIN users u ON l.assigned_user_id = u.id
        WHERE l.deleted = 0
        ORDER BY l.date_entered DESC
        LIMIT $limit OFFSET $offset";
        
        $result = $db->query($query);
        $leads = [];
        
        while ($row = $db->fetchByAssoc($result)) {
            // Add some mock real estate data
            $row['propertyType'] = 'Single Family';
            $row['budget'] = ['min' => 200000, 'max' => 500000];
            $row['preferredLocation'] = 'Downtown';
            $row['timeline'] = 'Within 3 months';
            $row['leadScore'] = rand(60, 95);
            
            $leads[] = $row;
        }
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM leads WHERE deleted = 0";
        $countResult = $db->query($countQuery);
        $countRow = $db->fetchByAssoc($countResult);
        $total = (int)$countRow['total'];
        
        echo json_encode([
            'data' => $leads,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    } elseif ($method === 'POST') {
        // Create new lead
        require_once('modules/Leads/Lead.php');
        $lead = new Lead();
        
        $lead->first_name = $input['firstName'] ?? '';
        $lead->last_name = $input['lastName'] ?? '';
        $lead->email1 = $input['email'] ?? '';
        $lead->phone_work = $input['phone'] ?? '';
        $lead->status = $input['status'] ?? 'New';
        $lead->lead_source = $input['source'] ?? 'Website';
        $lead->description = $input['description'] ?? '';
        $lead->account_name = $input['company'] ?? '';
        
        $lead->save();
        
        echo json_encode(['id' => $lead->id, 'message' => 'Lead created successfully']);
    }
}

function handleSingleLead($method, $leadId, $input) {
    if ($method === 'PUT' && strpos($leadId, '/assign') !== false) {
        // Handle lead assignment
        $leadId = str_replace('/assign', '', $leadId);
        require_once('modules/Leads/Lead.php');
        $lead = new Lead();
        $lead->retrieve($leadId);
        
        if (!empty($lead->id)) {
            $lead->assigned_user_id = $input['userId'];
            $lead->save();
            
            echo json_encode(['success' => true, 'message' => 'Lead assigned successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Lead not found']);
        }
    }
}

function handleContacts($method, $input) {
    global $db;
    
    if ($method === 'GET') {
        $query = "SELECT 
            c.id,
            c.first_name,
            c.last_name,
            c.email1 as email,
            c.phone_work as phone,
            c.title,
            a.name as accountName,
            c.date_entered as createdAt
        FROM contacts c
        LEFT JOIN accounts_contacts ac ON c.id = ac.contact_id AND ac.deleted = 0
        LEFT JOIN accounts a ON ac.account_id = a.id AND a.deleted = 0
        WHERE c.deleted = 0
        ORDER BY c.date_entered DESC
        LIMIT 20";
        
        $result = $db->query($query);
        $contacts = [];
        
        while ($row = $db->fetchByAssoc($result)) {
            // Add mock real estate preferences
            $row['propertyPreferences'] = [
                'type' => ['Single Family', 'Condo'],
                'bedrooms' => '3+',
                'budget' => '$400k-$600k'
            ];
            $row['lastActivity'] = date('Y-m-d', strtotime('-' . rand(1, 30) . ' days'));
            
            $contacts[] = $row;
        }
        
        echo json_encode(['data' => $contacts]);
    }
}

function handleProperties($method, $input) {
    // Mock property data since SuiteCRM doesn't have a properties module by default
    $properties = [
        [
            'id' => '1',
            'address' => '123 Main St',
            'city' => 'San Francisco',
            'state' => 'CA',
            'zipCode' => '94105',
            'price' => 850000,
            'propertyType' => 'Single Family',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'sqft' => 1800,
            'status' => 'For Sale',
            'listingDate' => '2024-01-15',
            'agent' => 'John Smith'
        ],
        [
            'id' => '2',
            'address' => '456 Oak Ave',
            'city' => 'San Francisco',
            'state' => 'CA',
            'zipCode' => '94110',
            'price' => 1200000,
            'propertyType' => 'Condo',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'sqft' => 1200,
            'status' => 'For Sale',
            'listingDate' => '2024-01-20',
            'agent' => 'Jane Doe'
        ]
    ];
    
    echo json_encode(['data' => $properties]);
}

function handleOpportunities($method, $input) {
    global $db;
    
    if ($method === 'GET') {
        $query = "SELECT 
            o.id,
            o.name,
            o.amount,
            o.sales_stage as stage,
            o.probability,
            o.date_closed as closeDate,
            a.name as accountName,
            CONCAT(u.first_name, ' ', u.last_name) as assignedTo
        FROM opportunities o
        LEFT JOIN accounts_opportunities ao ON o.id = ao.opportunity_id AND ao.deleted = 0
        LEFT JOIN accounts a ON ao.account_id = a.id AND a.deleted = 0
        LEFT JOIN users u ON o.assigned_user_id = u.id
        WHERE o.deleted = 0
        ORDER BY o.date_entered DESC
        LIMIT 20";
        
        $result = $db->query($query);
        $opportunities = [];
        
        while ($row = $db->fetchByAssoc($result)) {
            // Add mock milestones
            $row['milestones'] = [
                ['id' => '1', 'name' => 'Initial Meeting', 'completed' => true],
                ['id' => '2', 'name' => 'Property Tour', 'completed' => true],
                ['id' => '3', 'name' => 'Offer Submitted', 'completed' => false],
                ['id' => '4', 'name' => 'Closing', 'completed' => false]
            ];
            
            $opportunities[] = $row;
        }
        
        echo json_encode(['data' => $opportunities]);
    }
}

function handleLogin($input) {
    global $sugar_config;
    
    $username = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    // Use SuiteCRM authentication
    $authController = AuthenticationController::getInstance();
    $authResult = $authController->login($username, $password);
    
    if ($authResult) {
        echo json_encode([
            'user' => [
                'id' => $GLOBALS['current_user']->id,
                'name' => $GLOBALS['current_user']->full_name,
                'email' => $GLOBALS['current_user']->email1,
                'role' => $GLOBALS['current_user']->is_admin ? 'admin' : 'user'
            ],
            'token' => session_id()
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['message' => 'Logged out successfully']);
}

function handleCurrentUser() {
    global $current_user;
    
    if (!empty($current_user->id)) {
        echo json_encode([
            'user' => [
                'id' => $current_user->id,
                'name' => $current_user->full_name,
                'email' => $current_user->email1,
                'role' => $current_user->is_admin ? 'admin' : 'user'
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
    }
} 