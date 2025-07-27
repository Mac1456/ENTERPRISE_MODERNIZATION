<?php
/**
 * Modern UI API Bridge for SuiteCRM Real Estate Pro
 * This file handles API requests from the React frontend
 */

// Start output buffering and suppress ALL output
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 0);

// Define sugarEntry to allow SuiteCRM access
if (!defined('sugarEntry')) define('sugarEntry', true);

// Navigate to SuiteCRM root and include entry point
chdir(dirname(__FILE__) . '/../..');
require_once('include/entryPoint.php');

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Clean any output that happened during SuiteCRM initialization
ob_clean();

// Set JSON content type
header('Content-Type: application/json');

// Parse the request
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'];

// Extract the endpoint from the path
$apiPath = str_replace('/custom/modernui/api.php', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// Get JSON input for POST/PUT requests
$input = [];
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];
}

// Use SuiteCRM's cache directory for assignments storage
function getAssignmentFile() {
    // Use SuiteCRM's cache directory which should be writable
    $cacheDir = dirname(__FILE__) . '/../../cache/';
    if (!is_dir($cacheDir)) {
        $cacheDir = '/tmp/'; // Fallback to tmp if cache dir doesn't exist
    }
    return $cacheDir . 'lead_assignments.json';
}

function loadAssignments() {
    $assignmentFile = getAssignmentFile();
    if (file_exists($assignmentFile) && is_readable($assignmentFile)) {
        $content = file_get_contents($assignmentFile);
        $assignments = json_decode($content, true);
        if ($assignments) {
            return $assignments;
        }
    }
    
    // Default assignments
    return [
        '1' => null,
        '2' => ['userId' => 'agent2', 'userName' => 'Mike Chen'],
        '3' => null,
        '4' => ['userId' => 'agent1', 'userName' => 'Sarah Johnson'],
        '5' => null
    ];
}

function saveAssignments($assignments) {
    $assignmentFile = getAssignmentFile();
    $success = file_put_contents($assignmentFile, json_encode($assignments, JSON_PRETTY_PRINT));
    
    // Log if save failed for debugging
    if ($success === false) {
        error_log("Failed to save assignments to: " . $assignmentFile);
        error_log("Directory writable: " . (is_writable(dirname($assignmentFile)) ? 'yes' : 'no'));
    }
    
    return $success !== false;
}

// Load assignments for this request
$lead_assignments = loadAssignments();

function handleLeads($method, $input) {
    if ($method === 'GET') {
        // Base mock data
        $mockLeads = [
            [
                'id' => '1',
                'firstName' => 'John',
                'lastName' => 'Smith',
                'email' => 'john.smith@gmail.com',
                'phone' => '555-123-4567',
                'status' => 'New',
                'source' => 'Website',
                'company' => 'Tech Solutions',
                'createdAt' => '2024-07-27 10:00:00',
                'leadScore' => 85,
                'propertyType' => 'Single Family Home',
                'budget' => ['min' => 300000, 'max' => 500000],
                'preferredLocation' => 'Downtown',
                'timeline' => 'Within 3 months'
            ],
            [
                'id' => '2',
                'firstName' => 'Sarah',
                'lastName' => 'Johnson',
                'email' => 'sarah.johnson@company.com',
                'phone' => '555-234-5678',
                'status' => 'Contacted',
                'source' => 'Google Ads',
                'company' => 'Global Marketing',
                'createdAt' => '2024-07-26 14:30:00',
                'leadScore' => 78,
                'propertyType' => 'Condo',
                'budget' => ['min' => 200000, 'max' => 400000],
                'preferredLocation' => 'Uptown',
                'timeline' => 'Within 6 months'
            ],
            [
                'id' => '3',
                'firstName' => 'Michael',
                'lastName' => 'Williams',
                'email' => 'michael.williams@business.org',
                'phone' => '555-345-6789',
                'status' => 'Qualified',
                'source' => 'Referral',
                'company' => 'Digital Dynamics',
                'createdAt' => '2024-07-25 09:15:00',
                'leadScore' => 92,
                'propertyType' => 'Investment Property',
                'budget' => ['min' => 500000, 'max' => 750000],
                'preferredLocation' => 'Plano',
                'timeline' => 'ASAP'
            ],
            [
                'id' => '4',
                'firstName' => 'Emily',
                'lastName' => 'Brown',
                'email' => 'emily.brown@professional.co',
                'phone' => '555-456-7890',
                'status' => 'New',
                'source' => 'Facebook',
                'company' => 'Elite Services',
                'createdAt' => '2024-07-24 16:45:00',
                'leadScore' => 71,
                'propertyType' => 'Townhouse',
                'budget' => ['min' => 250000, 'max' => 350000],
                'preferredLocation' => 'Frisco',
                'timeline' => 'Within 1 year'
            ],
            [
                'id' => '5',
                'firstName' => 'David',
                'lastName' => 'Garcia',
                'email' => 'david.garcia@enterprise.net',
                'phone' => '555-567-8901',
                'status' => 'Contacted',
                'source' => 'Email Campaign',
                'company' => 'Modern Solutions',
                'createdAt' => '2024-07-23 11:20:00',
                'leadScore' => 83,
                'propertyType' => 'Single Family Home',
                'budget' => ['min' => 400000, 'max' => 600000],
                'preferredLocation' => 'McKinney',
                'timeline' => 'Within 3 months'
            ]
        ];

        // Apply current assignments to the mock data
        $lead_assignments = loadAssignments();
        foreach ($mockLeads as &$lead) {
            $assignment = $lead_assignments[$lead['id']] ?? null;
            if ($assignment) {
                $lead['assignedUserId'] = $assignment['userId'];
                $lead['assignedUserName'] = $assignment['userName'];
            } else {
                $lead['assignedUserId'] = null;
                $lead['assignedUserName'] = 'Unassigned';
            }
        }

        echo json_encode([
            'success' => true,
            'data' => $mockLeads,
            'pagination' => [
                'page' => 1,
                'limit' => 10,
                'total' => count($mockLeads),
                'pages' => 1
            ]
        ]);

    } elseif ($method === 'POST') {
        // For now, just return success for lead creation
        echo json_encode([
            'success' => true,
            'id' => uniqid(),
            'message' => 'Lead created successfully'
        ]);
    }
}

// Route the request
if (strpos($apiPath, '/leads') === 0) {
    $leadId = str_replace('/leads', '', $apiPath);
    if ($leadId === '/auto-assign' && $method === 'POST') {
        handleAutoAssign($input);
    } elseif ($leadId === '/bulk-assign' && $method === 'POST') {
        handleBulkAssign($input);
    } elseif ($leadId && $leadId !== '/') {
        handleSingleLead($method, trim($leadId, '/'), $input);
    } else {
        handleLeads($method, $input);
    }
} elseif (strpos($apiPath, '/contacts') === 0) {
    handleContacts($method);
} elseif (strpos($apiPath, '/opportunities') === 0) {
    handleOpportunities($method);
} elseif (strpos($apiPath, '/dashboard/stats') === 0) {
    handleDashboardStats();
} elseif (strpos($apiPath, '/properties') === 0) {
    handleProperties($method);
} elseif (strpos($apiPath, '/users') === 0) {
    handleUsers($method);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

// Handler functions

function handleSingleLead($method, $leadId, $input) {
    if ($method === 'PUT' || $method === 'PATCH') {
        if (strpos($leadId, '/assign') !== false) {
            // Handle lead assignment
            $leadId = str_replace('/assign', '', $leadId);
            
            if (!empty($input['userId']) && $input['userId'] !== 'unassign') {
                // Assign to specific user
                $selectedUserId = $input['userId'];
                
                // Use proper agent names
                $agentNames = [
                    'agent1' => 'Sarah Johnson',
                    'agent2' => 'Mike Chen',
                    'agent3' => 'Lisa Rodriguez',
                    'agent4' => 'David Kim'
                ];
                $selectedUserName = $agentNames[$selectedUserId] ?? ('Agent ' . substr($selectedUserId, -4));
                
                // UPDATE THE ASSIGNMENTS
                $lead_assignments = loadAssignments();
                $lead_assignments[$leadId] = [
                    'userId' => $selectedUserId,
                    'userName' => $selectedUserName
                ];
                
                $saveSuccess = saveAssignments($lead_assignments);
                
                if ($saveSuccess) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Lead assigned successfully',
                        'data' => [
                            'id' => $leadId,
                            'assignedUserId' => $selectedUserId,
                            'assignedUserName' => $selectedUserName
                        ]
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Assignment failed - could not save to storage',
                        'error' => 'STORAGE_ERROR'
                    ]);
                }
            } else {
                // Unassign lead
                $lead_assignments = loadAssignments();
                $lead_assignments[$leadId] = null;
                
                $saveSuccess = saveAssignments($lead_assignments);
                
                if ($saveSuccess) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Lead unassigned successfully',
                        'data' => [
                            'id' => $leadId,
                            'assignedUserId' => null,
                            'assignedUserName' => 'Unassigned'
                        ]
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Unassignment failed - could not save to storage',
                        'error' => 'STORAGE_ERROR'
                    ]);
                }
            }
            return;
        }
    }
    
    // Handle other lead operations
    echo json_encode([
        'success' => true,
        'message' => 'Lead updated successfully'
    ]);
}

// Add auto-assignment handler
function handleAutoAssign($input) {
    $leadIds = $input['leadIds'] ?? [];
    
    if (empty($leadIds)) {
        echo json_encode([
            'success' => false,
            'message' => 'No leads provided for assignment'
        ]);
        return;
    }
    
    // Available agents for assignment
    $agents = [
        'agent1' => 'Sarah Johnson',
        'agent2' => 'Mike Chen', 
        'agent3' => 'Lisa Rodriguez',
        'agent4' => 'David Kim'
    ];
    $agentKeys = array_keys($agents);
    
    $assigned = [];
    $failed = [];
    
    $lead_assignments = loadAssignments();
    
    foreach ($leadIds as $leadId) {
        if (!empty($agentKeys)) {
            // Simulate round-robin assignment
            $selectedUserId = $agentKeys[array_rand($agentKeys)];
            $selectedUserName = $agents[$selectedUserId];
            
            // UPDATE THE ASSIGNMENTS
            $lead_assignments[$leadId] = [
                'userId' => $selectedUserId,
                'userName' => $selectedUserName
            ];
            
            $assigned[] = [
                'leadId' => $leadId,
                'userId' => $selectedUserId,
                'userName' => $selectedUserName
            ];
        } else {
            $failed[] = $leadId;
        }
    }
    
    // Save all assignments
    saveAssignments($lead_assignments);
    
    echo json_encode([
        'success' => true,
        'message' => count($assigned) . ' leads assigned successfully',
        'data' => [
            'assigned' => $assigned,
            'failed' => $failed
        ]
    ]);
}

// Add bulk assignment handler  
function handleBulkAssign($input) {
    $leadIds = $input['leadIds'] ?? [];
    $userId = $input['userId'] ?? '';
    
    if (empty($leadIds) || empty($userId)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing lead IDs or user ID'
        ]);
        return;
    }
    
    // Get user info
    $users = get_user_array(false, 'Active');
    $userName = $users[$userId] ?? ('Agent ' . substr($userId, 0, 8));
    
    $assigned = [];
    
    $leads = getMockLeads();
    
    foreach ($leadIds as $leadId) {
        // Find the lead in our mock data
        $leadIndex = -1;
        for ($i = 0; $i < count($leads); $i++) {
            if ($leads[$i]['id'] === $leadId) {
                $leadIndex = $i;
                break;
            }
        }
        
                 if ($leadIndex !== -1) {
             // UPDATE THE MOCK DATA
             $leads[$leadIndex]['assignedUserId'] = $userId;
             $leads[$leadIndex]['assignedUserName'] = $userName;
             
             $assigned[] = [
                 'leadId' => $leadId,
                 'userId' => $userId,
                 'userName' => $userName
             ];
         }
     }
     
     // Save all changes at once
     saveMockLeads($leads);
    
    echo json_encode([
        'success' => true,
        'message' => count($assigned) . ' leads assigned to ' . $userName,
        'data' => [
            'assigned' => $assigned,
            'failed' => []
        ]
    ]);
}

function handleContacts($method) {
    echo json_encode([
        'success' => true,
        'data' => [],
        'pagination' => ['page' => 1, 'limit' => 10, 'total' => 0, 'pages' => 1]
    ]);
}

function handleOpportunities($method) {
    echo json_encode([
        'success' => true,
        'data' => [],
        'pagination' => ['page' => 1, 'limit' => 10, 'total' => 0, 'pages' => 1]
    ]);
}

function handleProperties($method) {
    echo json_encode([
        'success' => true,
        'data' => [],
        'pagination' => ['page' => 1, 'limit' => 10, 'total' => 0, 'pages' => 1]
    ]);
}

function handleUsers($method) {
    // Return mock user data for agent assignment
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 'agent1',
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@company.com',
                'role' => 'Senior Agent',
                'active' => true
            ],
            [
                'id' => 'agent2', 
                'name' => 'Mike Chen',
                'email' => 'mike.chen@company.com',
                'role' => 'Lead Agent',
                'active' => true
            ],
            [
                'id' => 'agent3',
                'name' => 'Lisa Rodriguez', 
                'email' => 'lisa.rodriguez@company.com',
                'role' => 'Agent',
                'active' => true
            ],
            [
                'id' => 'agent4',
                'name' => 'David Kim',
                'email' => 'david.kim@company.com', 
                'role' => 'Agent',
                'active' => true
            ]
        ]
    ]);
}

function handleDashboardStats() {
    // Count unassigned leads dynamically
    $unassignedCount = 0;
    $totalLeads = 5; // We have 5 leads
    
    $lead_assignments = loadAssignments();
    foreach ($lead_assignments as $leadId => $assignment) {
        if (!$assignment) {
            $unassignedCount++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'totalLeads' => $totalLeads,
        'newLeads' => $unassignedCount,
        'qualifiedLeads' => 1,
        'totalRevenue' => 150000,
        'conversionRate' => 15.5
    ]);
}
?> 