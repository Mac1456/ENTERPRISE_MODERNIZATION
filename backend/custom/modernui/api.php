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
    $contactId = str_replace('/contacts', '', $apiPath);
    if ($contactId === '/assign' && $method === 'POST') {
        handleContactBulkAssign($input);
    } elseif ($contactId && $contactId !== '/') {
        handleSingleContact($method, trim($contactId, '/'), $input);
    } else {
        handleContacts($method, $input);
    }
} elseif (strpos($apiPath, '/opportunities') === 0) {
    handleOpportunities($method);
} elseif (strpos($apiPath, '/dashboard/stats') === 0) {
    handleDashboardStats();
} elseif (strpos($apiPath, '/properties') === 0) {
    handleProperties($method);
} elseif (strpos($apiPath, '/users') === 0) {
    handleUsers($method);
} elseif (strpos($apiPath, '/communications') === 0) {
    // Handle communication endpoints
    $communicationPath = str_replace('/communications', '', $apiPath);
    
    if (strpos($communicationPath, '/conversations') === 0) {
        $conversationPath = str_replace('/conversations', '', $communicationPath);
        if ($conversationPath === '/') {
            handleConversations($method, $input);
        } elseif (preg_match('/^\/([^\/]+)$/', $conversationPath, $matches)) {
            handleSingleConversation($method, $matches[1], $input);
        } elseif (preg_match('/^\/([^\/]+)\/messages$/', $conversationPath, $matches)) {
            handleConversationMessages($method, $matches[1], $input);
        } elseif (preg_match('/^\/([^\/]+)\/participants$/', $conversationPath, $matches)) {
            handleConversationParticipants($method, $matches[1], $input);
        }
    } elseif (strpos($communicationPath, '/documents') === 0) {
        $documentPath = str_replace('/documents', '', $communicationPath);
        if ($documentPath === '/') {
            handleDocuments($method, $input);
        } elseif ($documentPath === '/upload') {
            handleDocumentUpload($method, $input);
        } elseif (preg_match('/^\/([^\/]+)$/', $documentPath, $matches)) {
            handleSingleDocument($method, $matches[1], $input);
        } elseif (preg_match('/^\/([^\/]+)\/share$/', $documentPath, $matches)) {
            handleDocumentShare($method, $matches[1], $input);
        }
    } elseif (strpos($communicationPath, '/notifications') === 0) {
        $notificationPath = str_replace('/notifications', '', $communicationPath);
        if ($notificationPath === '/') {
            handleNotifications($method, $input);
        } elseif (preg_match('/^\/([^\/]+)$/', $notificationPath, $matches)) {
            handleSingleNotification($method, $matches[1], $input);
        }
    } elseif ($communicationPath === '/stats') {
        handleCommunicationStats($method);
    } elseif ($communicationPath === '/preferences') {
        handleCommunicationPreferences($method, $input);
    }
} elseif (strpos($apiPath, '/property-search') === 0) {
    // Handle property search endpoints
    $searchPath = str_replace('/property-search', '', $apiPath);
    
    if ($searchPath === '/search' && $method === 'POST') {
        handlePropertySearch($input);
    } elseif ($searchPath === '/saved-searches' && $method === 'GET') {
        handleSavedSearches($method);
    } elseif ($searchPath === '/saved-searches' && $method === 'POST') {
        handleSavedSearches($method, $input);
    } elseif (preg_match('/^\/saved-searches\/([^\/]+)$/', $searchPath, $matches) && $method === 'DELETE') {
        handleDeleteSavedSearch($matches[1]);
    } elseif ($searchPath === '/recommendations' && $method === 'GET') {
        handlePropertyRecommendations();
    } elseif ($searchPath === '/stats' && $method === 'GET') {
        handlePropertySearchStats();
    } elseif ($searchPath === '/filters' && $method === 'GET') {
        handleSearchFilters();
    } elseif ($searchPath === '/mls-data' && $method === 'GET') {
        handleMLSData();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Property search endpoint not found']);
    }
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

function handleContacts($method, $input = []) {
    if ($method === 'GET') {
        // Base mock contact data with property interests
        $mockContacts = [
            [
                'id' => '1',
                'firstName' => 'Sarah',
                'lastName' => 'Johnson',
                'email' => 'sarah.johnson@email.com',
                'phone' => '555-123-4567',
                'mobile' => '555-987-6543',
                'title' => 'Senior Developer',
                'description' => 'Looking for first-time home purchase',
                'accountId' => 'acc1',
                'accountName' => 'Tech Solutions Inc',
                'propertyInterests' => [
                    [
                        'id' => 'pi1',
                        'propertyType' => 'Single Family Home',
                        'budget' => ['min' => 300000, 'max' => 500000],
                        'location' => 'Downtown',
                        'timeline' => 'Within 3 months',
                        'status' => 'Active',
                        'priority' => 'High'
                    ]
                ],
                'buyerProfile' => [
                    'isFirstTimeBuyer' => true,
                    'financingApproved' => false,
                    'preApprovalAmount' => 450000,
                    'downPaymentReady' => true,
                    'creditScore' => 750
                ],
                'preferredLocations' => ['Downtown', 'Midtown', 'West End'],
                'budget' => ['min' => 300000, 'max' => 500000],
                'createdAt' => '2024-07-22 10:00:00',
                'modifiedAt' => '2024-07-27 08:00:00'
            ],
            [
                'id' => '2',
                'firstName' => 'Michael',
                'lastName' => 'Brown',
                'email' => 'michael.brown@company.com',
                'phone' => '555-234-5678',
                'title' => 'Marketing Manager',
                'description' => 'Investment property buyer',
                'accountId' => 'acc2',
                'accountName' => 'Global Marketing',
                'propertyInterests' => [
                    [
                        'id' => 'pi2',
                        'propertyType' => 'Investment Property',
                        'budget' => ['min' => 500000, 'max' => 750000],
                        'location' => 'Business District',
                        'timeline' => 'Within 6 months',
                        'status' => 'Active',
                        'priority' => 'Medium'
                    ]
                ],
                'sellerProfile' => [
                    'hasPropertyToSell' => true,
                    'currentPropertyValue' => 400000,
                    'reasonForSelling' => 'Upgrading',
                    'timeframeToSell' => 'Within 3 months'
                ],
                'preferredLocations' => ['Business District', 'Financial Center'],
                'budget' => ['min' => 500000, 'max' => 750000],
                'createdAt' => '2024-07-24 14:30:00',
                'modifiedAt' => '2024-07-27 09:00:00'
            ],
            [
                'id' => '3',
                'firstName' => 'Emily',
                'lastName' => 'Davis',
                'email' => 'emily.davis@real-estate.com',
                'phone' => '555-345-6789',
                'mobile' => '555-876-5432',
                'title' => 'Property Manager',
                'description' => 'Looking for rental property investment',
                'accountId' => 'acc3',
                'accountName' => 'Davis Properties',
                'propertyInterests' => [
                    [
                        'id' => 'pi3',
                        'propertyType' => 'Condo',
                        'budget' => ['min' => 200000, 'max' => 350000],
                        'location' => 'Uptown',
                        'timeline' => 'Within 1 year',
                        'status' => 'Active',
                        'priority' => 'Low'
                    ],
                    [
                        'id' => 'pi4',
                        'propertyType' => 'Townhouse',
                        'budget' => ['min' => 300000, 'max' => 450000],
                        'location' => 'Suburbs',
                        'timeline' => 'Within 6 months',
                        'status' => 'Active',
                        'priority' => 'Medium'
                    ]
                ],
                'buyerProfile' => [
                    'isFirstTimeBuyer' => false,
                    'financingApproved' => true,
                    'preApprovalAmount' => 500000,
                    'downPaymentReady' => true,
                    'creditScore' => 800
                ],
                'preferredLocations' => ['Uptown', 'Suburbs', 'East End'],
                'budget' => ['min' => 200000, 'max' => 450000],
                'createdAt' => '2024-07-20 16:45:00',
                'modifiedAt' => '2024-07-26 15:30:00'
            ]
        ];

        // Apply current contact assignments
        $contact_assignments = loadContactAssignments();
        foreach ($mockContacts as &$contact) {
            $assignment = $contact_assignments[$contact['id']] ?? null;
            if ($assignment) {
                $contact['assignedUserId'] = $assignment['userId'];
                $contact['assignedUserName'] = $assignment['userName'];
            } else {
                $contact['assignedUserId'] = null;
                $contact['assignedUserName'] = 'Unassigned';
            }
        }

        echo json_encode([
            'success' => true,
            'data' => $mockContacts,
            'pagination' => [
                'page' => 1,
                'limit' => 50,
                'total' => count($mockContacts),
                'pages' => 1
            ]
        ]);

    } elseif ($method === 'POST') {
        // For now, just return success for contact creation
        echo json_encode([
            'success' => true,
            'id' => uniqid(),
            'message' => 'Contact created successfully'
        ]);
    }
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

// Contact-specific handlers
function handleSingleContact($method, $contactId, $input) {
    if ($method === 'PUT' || $method === 'PATCH') {
        if (strpos($contactId, '/assign') !== false) {
            // Handle contact assignment
            $contactId = str_replace('/assign', '', $contactId);
            
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
                
                // UPDATE THE CONTACT ASSIGNMENTS
                $contact_assignments = loadContactAssignments();
                $contact_assignments[$contactId] = [
                    'userId' => $selectedUserId,
                    'userName' => $selectedUserName
                ];
                
                $saveSuccess = saveContactAssignments($contact_assignments);
                
                if ($saveSuccess) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Contact assigned successfully',
                        'data' => [
                            'id' => $contactId,
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
                // Unassign contact
                $contact_assignments = loadContactAssignments();
                $contact_assignments[$contactId] = null;
                
                $saveSuccess = saveContactAssignments($contact_assignments);
                
                if ($saveSuccess) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Contact unassigned successfully',
                        'data' => [
                            'id' => $contactId,
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
        } elseif (strpos($contactId, '/property-interests') !== false) {
            // Handle property interest operations
            echo json_encode([
                'success' => true,
                'message' => 'Property interest updated successfully'
            ]);
            return;
        }
    } elseif ($method === 'POST') {
        if (strpos($contactId, '/property-interests') !== false) {
            // Add property interest
            echo json_encode([
                'success' => true,
                'id' => uniqid(),
                'message' => 'Property interest added successfully'
            ]);
            return;
        }
    }
    
    // Handle other contact operations
    echo json_encode([
        'success' => true,
        'message' => 'Contact updated successfully'
    ]);
}

function handleContactBulkAssign($input) {
    $contactIds = $input['contactIds'] ?? [];
    $userId = $input['userId'] ?? null;
    
    if (empty($contactIds)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing contact IDs'
        ]);
        return;
    }
    
    $assigned = [];
    $failed = [];
    
    $contact_assignments = loadContactAssignments();
    
    if ($userId === null) {
        // Handle unassignment
        foreach ($contactIds as $contactId) {
            // Remove assignment (set to null)
            $contact_assignments[$contactId] = null;
            
            $assigned[] = [
                'contactId' => $contactId,
                'userId' => null,
                'userName' => 'Unassigned'
            ];
        }
        
        $actionMessage = count($assigned) . ' contact' . (count($assigned) > 1 ? 's' : '') . ' unassigned successfully';
    } else {
        // Handle assignment
        // Available agents for assignment
        $agents = [
            'agent1' => 'Sarah Johnson',
            'agent2' => 'Mike Chen', 
            'agent3' => 'Lisa Rodriguez',
            'agent4' => 'David Kim'
        ];
        
        $selectedUserName = $agents[$userId] ?? ('Agent ' . substr($userId, -4));
        
        foreach ($contactIds as $contactId) {
            // UPDATE THE CONTACT ASSIGNMENTS
            $contact_assignments[$contactId] = [
                'userId' => $userId,
                'userName' => $selectedUserName
            ];
            
            $assigned[] = [
                'contactId' => $contactId,
                'userId' => $userId,
                'userName' => $selectedUserName
            ];
        }
        
        $actionMessage = count($assigned) . ' contact' . (count($assigned) > 1 ? 's' : '') . ' assigned successfully';
    }
    
    // Save all contact assignments
    saveContactAssignments($contact_assignments);
    
    echo json_encode([
        'success' => true,
        'message' => $actionMessage,
        'data' => [
            'assigned' => $assigned,
            'failed' => $failed
        ]
    ]);
}

// Contact assignment storage functions
function loadContactAssignments() {
    $cacheDir = getcwd() . '/cache';
    $assignmentFile = $cacheDir . '/contact_assignments.json';
    
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
    }
    
    if (file_exists($assignmentFile)) {
        $content = file_get_contents($assignmentFile);
        $assignments = json_decode($content, true);
        return $assignments ?: [];
    }
    
    return [];
}

function saveContactAssignments($assignments) {
    $cacheDir = getcwd() . '/cache';
    $assignmentFile = $cacheDir . '/contact_assignments.json';

    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
    }

    $success = file_put_contents($assignmentFile, json_encode($assignments, JSON_PRETTY_PRINT));
    return $success !== false;
}

// ===== COMMUNICATION HANDLERS =====

function handleConversations($method, $input = []) {
    if ($method === 'GET') {
        // Return mock conversations
        $mockConversations = [
            [
                'id' => '1',
                'name' => 'Johnson Property Inquiry',
                'type' => 'property_inquiry',
                'participants' => [
                    [
                        'userId' => 'user1',
                        'userName' => 'Sarah Johnson',
                        'userRole' => 'client',
                        'joinedAt' => '2024-07-25T10:00:00Z',
                        'isActive' => true,
                        'permissions' => [
                            'canAddParticipants' => false,
                            'canRemoveParticipants' => false,
                            'canUploadDocuments' => true,
                            'canCreateTasks' => false,
                            'canViewAllMessages' => true
                        ]
                    ],
                    [
                        'userId' => 'agent1',
                        'userName' => 'Mike Agent',
                        'userRole' => 'agent',
                        'joinedAt' => '2024-07-25T10:00:00Z',
                        'isActive' => true,
                        'permissions' => [
                            'canAddParticipants' => true,
                            'canRemoveParticipants' => true,
                            'canUploadDocuments' => true,
                            'canCreateTasks' => true,
                            'canViewAllMessages' => true
                        ]
                    ]
                ],
                'lastMessage' => [
                    'id' => 'msg1',
                    'conversationId' => '1',
                    'senderId' => 'user1',
                    'senderName' => 'Sarah Johnson',
                    'content' => 'I\'m interested in the 3BR house on Maple Street',
                    'messageType' => 'text',
                    'timestamp' => '2024-07-27T14:30:00Z',
                    'readBy' => ['agent1'],
                    'status' => 'delivered'
                ],
                'lastActivity' => '2024-07-27T14:30:00Z',
                'isArchived' => false,
                'isMuted' => false,
                'relatedContactId' => '1',
                'relatedContactName' => 'Sarah Johnson',
                'relatedPropertyAddress' => '123 Maple Street',
                'createdAt' => '2024-07-25T10:00:00Z',
                'createdBy' => 'agent1'
            ],
            [
                'id' => '2',
                'name' => 'Downtown Condo Transaction Team',
                'type' => 'transaction_team',
                'participants' => [
                    [
                        'userId' => 'agent1',
                        'userName' => 'Mike Agent',
                        'userRole' => 'listing_agent',
                        'joinedAt' => '2024-07-20T09:00:00Z',
                        'isActive' => true,
                        'permissions' => [
                            'canAddParticipants' => true,
                            'canRemoveParticipants' => true,
                            'canUploadDocuments' => true,
                            'canCreateTasks' => true,
                            'canViewAllMessages' => true
                        ]
                    ],
                    [
                        'userId' => 'agent2',
                        'userName' => 'Lisa Buyer Agent',
                        'userRole' => 'buyer_agent',
                        'joinedAt' => '2024-07-20T09:15:00Z',
                        'isActive' => true,
                        'permissions' => [
                            'canAddParticipants' => true,
                            'canRemoveParticipants' => false,
                            'canUploadDocuments' => true,
                            'canCreateTasks' => true,
                            'canViewAllMessages' => true
                        ]
                    ]
                ],
                'lastMessage' => [
                    'id' => 'msg2',
                    'conversationId' => '2',
                    'senderId' => 'agent2',
                    'senderName' => 'Lisa Buyer Agent',
                    'content' => 'Contract review completed',
                    'messageType' => 'document',
                    'timestamp' => '2024-07-27T13:15:00Z',
                    'readBy' => ['agent1'],
                    'status' => 'read'
                ],
                'lastActivity' => '2024-07-27T13:15:00Z',
                'isArchived' => false,
                'isMuted' => false,
                'relatedPropertyAddress' => '456 Downtown Plaza #5B',
                'createdAt' => '2024-07-20T09:00:00Z',
                'createdBy' => 'agent1'
            ]
        ];

        echo json_encode([
            'success' => true,
            'data' => [
                'data' => $mockConversations,
                'pagination' => [
                    'page' => 1,
                    'limit' => 50,
                    'total' => count($mockConversations),
                    'totalPages' => 1
                ]
            ]
        ]);
    } elseif ($method === 'POST') {
        // Create new conversation
        $newConversation = [
            'id' => uniqid(),
            'name' => $input['name'] ?? 'New Conversation',
            'type' => $input['type'] ?? 'direct',
            'participants' => [],
            'lastActivity' => date('c'),
            'isArchived' => false,
            'isMuted' => false,
            'createdAt' => date('c'),
            'createdBy' => 'current_user'
        ];

        echo json_encode([
            'success' => true,
            'data' => $newConversation,
            'message' => 'Conversation created successfully'
        ]);
    }
}

function handleSingleConversation($method, $conversationId, $input = []) {
    if ($method === 'GET') {
        // Return single conversation with detailed info
        $conversation = [
            'id' => $conversationId,
            'name' => 'Sample Conversation',
            'type' => 'property_inquiry',
            'participants' => [
                [
                    'userId' => 'user1',
                    'userName' => 'Sarah Johnson',
                    'userRole' => 'client',
                    'isActive' => true
                ]
            ],
            'lastActivity' => '2024-07-27T14:30:00Z',
            'isArchived' => false,
            'isMuted' => false
        ];

        echo json_encode([
            'success' => true,
            'data' => $conversation
        ]);
    } elseif ($method === 'PUT') {
        echo json_encode([
            'success' => true,
            'message' => 'Conversation updated successfully'
        ]);
    }
}

function handleConversationMessages($method, $conversationId, $input = []) {
    if ($method === 'GET') {
        // Return messages for conversation
        $mockMessages = [
            [
                'id' => 'msg1',
                'conversationId' => $conversationId,
                'senderId' => 'user1',
                'senderName' => 'Sarah Johnson',
                'content' => 'Hi, I\'m interested in the property listing',
                'messageType' => 'text',
                'timestamp' => '2024-07-27T14:30:00Z',
                'readBy' => ['agent1'],
                'status' => 'delivered'
            ],
            [
                'id' => 'msg2',
                'conversationId' => $conversationId,
                'senderId' => 'agent1',
                'senderName' => 'Mike Agent',
                'content' => 'Great! I\'d be happy to help. When would you like to schedule a viewing?',
                'messageType' => 'text',
                'timestamp' => '2024-07-27T14:35:00Z',
                'readBy' => [],
                'status' => 'sent'
            ]
        ];

        echo json_encode([
            'success' => true,
            'data' => [
                'data' => $mockMessages,
                'pagination' => [
                    'page' => 1,
                    'limit' => 50,
                    'total' => count($mockMessages),
                    'totalPages' => 1
                ]
            ]
        ]);
    } elseif ($method === 'POST') {
        // Send new message
        $newMessage = [
            'id' => uniqid(),
            'conversationId' => $conversationId,
            'senderId' => 'current_user',
            'senderName' => 'Current User',
            'content' => $input['content'] ?? '',
            'messageType' => $input['messageType'] ?? 'text',
            'timestamp' => date('c'),
            'readBy' => [],
            'status' => 'sent'
        ];

        echo json_encode([
            'success' => true,
            'data' => $newMessage,
            'message' => 'Message sent successfully'
        ]);
    }
}

function handleConversationParticipants($method, $conversationId, $input = []) {
    if ($method === 'POST') {
        // Add participant
        echo json_encode([
            'success' => true,
            'message' => 'Participant added successfully'
        ]);
    } elseif ($method === 'DELETE') {
        // Remove participant (handled by specific user ID in URL)
        echo json_encode([
            'success' => true,
            'message' => 'Participant removed successfully'
        ]);
    }
}

function handleDocuments($method, $input = []) {
    if ($method === 'GET') {
        // Return mock documents
        $mockDocuments = [
            [
                'id' => '1',
                'name' => 'Purchase Agreement - Johnson.pdf',
                'description' => 'Purchase agreement for 123 Maple Street property',
                'fileSize' => 2458752,
                'fileType' => 'application/pdf',
                'category' => 'contract',
                'url' => '/documents/purchase-agreement-johnson.pdf',
                'uploadedBy' => 'agent1',
                'uploadedByName' => 'Mike Agent',
                'uploadedAt' => '2024-07-27T10:30:00Z',
                'tags' => ['contract', 'purchase', 'urgent'],
                'relatedContactId' => '1',
                'requiresSignature' => true,
                'signatureStatus' => 'pending',
                'sharePermissions' => [
                    'viewerIds' => ['user1', 'agent1'],
                    'editorIds' => ['agent1'],
                    'signerIds' => ['user1'],
                    'isPublic' => false
                ],
                'version' => 1
            ],
            [
                'id' => '2',
                'name' => 'Pre-Approval Letter - Downtown Condo.pdf',
                'description' => 'Pre-approval letter from First National Bank',
                'fileSize' => 1048576,
                'fileType' => 'application/pdf',
                'category' => 'financial',
                'url' => '/documents/preapproval-downtown.pdf',
                'uploadedBy' => 'lender1',
                'uploadedByName' => 'First National Bank',
                'uploadedAt' => '2024-07-27T13:15:00Z',
                'tags' => ['preapproval', 'financing', 'complete'],
                'requiresSignature' => true,
                'signatureStatus' => 'complete',
                'sharePermissions' => [
                    'viewerIds' => ['user2', 'agent1', 'agent2', 'lender1'],
                    'editorIds' => ['lender1'],
                    'signerIds' => ['user2'],
                    'isPublic' => false
                ],
                'version' => 1
            ]
        ];

        echo json_encode([
            'success' => true,
            'data' => [
                'data' => $mockDocuments,
                'pagination' => [
                    'page' => 1,
                    'limit' => 50,
                    'total' => count($mockDocuments),
                    'totalPages' => 1
                ]
            ]
        ]);
    }
}

function handleDocumentUpload($method, $input = []) {
    if ($method === 'POST') {
        // Handle file upload (in real implementation, process $_FILES)
        $newDocument = [
            'id' => uniqid(),
            'name' => $input['name'] ?? 'New Document',
            'description' => $input['description'] ?? '',
            'category' => $input['category'] ?? 'other',
            'uploadedBy' => 'current_user',
            'uploadedByName' => 'Current User',
            'uploadedAt' => date('c'),
            'requiresSignature' => $input['requiresSignature'] === 'true',
            'signatureStatus' => $input['requiresSignature'] === 'true' ? 'pending' : null,
            'version' => 1
        ];

        echo json_encode([
            'success' => true,
            'data' => $newDocument,
            'message' => 'Document uploaded successfully'
        ]);
    }
}

function handleSingleDocument($method, $documentId, $input = []) {
    if ($method === 'GET') {
        $document = [
            'id' => $documentId,
            'name' => 'Sample Document.pdf',
            'category' => 'contract',
            'uploadedBy' => 'agent1',
            'uploadedByName' => 'Mike Agent',
            'uploadedAt' => '2024-07-27T10:30:00Z'
        ];

        echo json_encode([
            'success' => true,
            'data' => $document
        ]);
    } elseif ($method === 'PUT') {
        echo json_encode([
            'success' => true,
            'message' => 'Document updated successfully'
        ]);
    } elseif ($method === 'DELETE') {
        echo json_encode([
            'success' => true,
            'message' => 'Document deleted successfully'
        ]);
    }
}

function handleDocumentShare($method, $documentId, $input = []) {
    if ($method === 'POST') {
        echo json_encode([
            'success' => true,
            'message' => 'Document shared successfully'
        ]);
    }
}

function handleNotifications($method, $input = []) {
    if ($method === 'GET') {
        $mockNotifications = [
            [
                'id' => '1',
                'type' => 'signature_request',
                'title' => 'Signature Required',
                'message' => 'Purchase Agreement - Johnson.pdf requires your signature',
                'timestamp' => '2024-07-27T15:00:00Z',
                'isRead' => false,
                'userId' => 'current_user',
                'actionUrl' => '/documents/1/sign',
                'relatedEntityId' => '1',
                'relatedEntityType' => 'document',
                'priority' => 'high',
                'category' => 'documents'
            ],
            [
                'id' => '2',
                'type' => 'message',
                'title' => 'New Message',
                'message' => 'Sarah Johnson sent a message in Johnson Property Inquiry',
                'timestamp' => '2024-07-27T14:30:00Z',
                'isRead' => false,
                'userId' => 'current_user',
                'actionUrl' => '/communications/conversations/1',
                'relatedEntityId' => '1',
                'relatedEntityType' => 'conversation',
                'priority' => 'medium',
                'category' => 'communication'
            ]
        ];

        echo json_encode([
            'success' => true,
            'data' => [
                'data' => $mockNotifications,
                'pagination' => [
                    'page' => 1,
                    'limit' => 50,
                    'total' => count($mockNotifications),
                    'totalPages' => 1
                ]
            ]
        ]);
    }
}

function handleSingleNotification($method, $notificationId, $input = []) {
    if ($method === 'PATCH') {
        echo json_encode([
            'success' => true,
            'message' => 'Notification updated successfully'
        ]);
    } elseif ($method === 'DELETE') {
        echo json_encode([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }
}

function handleCommunicationStats($method) {
    if ($method === 'GET') {
        $stats = [
            'totalConversations' => 3,
            'activeConversations' => 3,
            'unreadMessages' => 5,
            'pendingDocuments' => 1,
            'documentsAwaitingSignature' => 1,
            'totalDocuments' => 2,
            'recentActivity' => [
                ['type' => 'message', 'count' => 12, 'timestamp' => '2024-07-27T15:00:00Z'],
                ['type' => 'document_upload', 'count' => 3, 'timestamp' => '2024-07-27T14:00:00Z'],
                ['type' => 'signature_complete', 'count' => 2, 'timestamp' => '2024-07-27T13:00:00Z']
            ]
        ];

        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
    }
}

function handleCommunicationPreferences($method, $input = []) {
    if ($method === 'GET') {
        $preferences = [
            'userId' => 'current_user',
            'emailNotifications' => true,
            'pushNotifications' => true,
            'smsNotifications' => false,
            'notificationTypes' => [
                'messages' => true,
                'documentUpdates' => true,
                'signatureRequests' => true,
                'milestoneAlerts' => true,
                'taskAssignments' => true
            ],
            'quietHours' => [
                'enabled' => false,
                'startTime' => '22:00',
                'endTime' => '08:00'
            ]
        ];

        echo json_encode([
            'success' => true,
            'data' => $preferences
        ]);
    } elseif ($method === 'PUT') {
        echo json_encode([
            'success' => true,
            'message' => 'Preferences updated successfully'
        ]);
    }
}

// ===== PROPERTY SEARCH HANDLERS =====

function handlePropertySearch($input) {
    // Extract search parameters
    $query = $input['query'] ?? '';
    $filters = $input['filters'] ?? [];
    $location = $input['location'] ?? '';
    $priceMin = $filters['priceMin'] ?? null;
    $priceMax = $filters['priceMax'] ?? null;
    $propertyType = $filters['propertyType'] ?? '';
    $bedrooms = $filters['bedrooms'] ?? null;
    $bathrooms = $filters['bathrooms'] ?? null;
    $sqftMin = $filters['sqftMin'] ?? null;
    $sqftMax = $filters['sqftMax'] ?? null;
    $yearBuiltMin = $filters['yearBuiltMin'] ?? null;
    $yearBuiltMax = $filters['yearBuiltMax'] ?? null;
    $features = $filters['features'] ?? [];
    
    // Mock property data based on search
    $properties = [
        [
            'id' => 'prop1',
            'mlsNumber' => 'MLS123456',
            'address' => '123 Maple Street',
            'city' => 'Downtown',
            'state' => 'CA',
            'zipCode' => '90210',
            'price' => 450000,
            'propertyType' => 'Single Family Home',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'sqft' => 1800,
            'lotSize' => 0.25,
            'yearBuilt' => 2015,
            'status' => 'Active',
            'listingAgent' => 'Sarah Johnson',
            'listingAgentId' => 'agent1',
            'daysOnMarket' => 15,
            'features' => ['Garage', 'Fireplace', 'Hardwood Floors', 'Updated Kitchen'],
            'description' => 'Beautiful 3BR/2BA home in desirable downtown location with modern updates throughout.',
            'images' => [
                '/api/images/prop1-1.jpg',
                '/api/images/prop1-2.jpg',
                '/api/images/prop1-3.jpg'
            ],
            'virtualTourUrl' => 'https://tour.example.com/prop1',
            'schoolDistrict' => 'Downtown Elementary School',
            'coordinates' => ['lat' => 40.7128, 'lng' => -74.0060],
            'matchScore' => 95,
            'listingDate' => '2024-07-12T00:00:00Z',
            'lastModified' => '2024-07-25T10:30:00Z'
        ],
        [
            'id' => 'prop2',
            'mlsNumber' => 'MLS789012',
            'address' => '456 Oak Avenue',
            'city' => 'Midtown',
            'state' => 'CA',
            'zipCode' => '90211',
            'price' => 375000,
            'propertyType' => 'Condo',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'sqft' => 1200,
            'lotSize' => null,
            'yearBuilt' => 2010,
            'status' => 'Active',
            'listingAgent' => 'Mike Chen',
            'listingAgentId' => 'agent2',
            'daysOnMarket' => 8,
            'features' => ['Balcony', 'In-unit Laundry', 'Granite Countertops', 'Stainless Appliances'],
            'description' => 'Modern 2BR/2BA condo with stunning city views and luxury amenities.',
            'images' => [
                '/api/images/prop2-1.jpg',
                '/api/images/prop2-2.jpg'
            ],
            'virtualTourUrl' => null,
            'schoolDistrict' => 'Midtown High School',
            'coordinates' => ['lat' => 40.7589, 'lng' => -73.9851],
            'matchScore' => 88,
            'listingDate' => '2024-07-19T00:00:00Z',
            'lastModified' => '2024-07-26T14:15:00Z'
        ],
        [
            'id' => 'prop3',
            'mlsNumber' => 'MLS345678',
            'address' => '789 Pine Lane',
            'city' => 'Suburbs',
            'state' => 'CA',
            'zipCode' => '90212',
            'price' => 525000,
            'propertyType' => 'Single Family Home',
            'bedrooms' => 4,
            'bathrooms' => 3,
            'sqft' => 2200,
            'lotSize' => 0.4,
            'yearBuilt' => 2018,
            'status' => 'Active',
            'listingAgent' => 'Lisa Rodriguez',
            'listingAgentId' => 'agent3',
            'daysOnMarket' => 22,
            'features' => ['Pool', 'Garage', 'Walk-in Closets', 'Modern Kitchen', 'Backyard'],
            'description' => 'Spacious 4BR/3BA family home with pool in quiet suburban neighborhood.',
            'images' => [
                '/api/images/prop3-1.jpg',
                '/api/images/prop3-2.jpg',
                '/api/images/prop3-3.jpg',
                '/api/images/prop3-4.jpg'
            ],
            'virtualTourUrl' => 'https://tour.example.com/prop3',
            'schoolDistrict' => 'Suburban Elementary & High School',
            'coordinates' => ['lat' => 40.6892, 'lng' => -74.0445],
            'matchScore' => 82,
            'listingDate' => '2024-07-05T00:00:00Z',
            'lastModified' => '2024-07-24T09:20:00Z'
        ]
    ];
    
    // Filter properties based on search criteria
    $filteredProperties = array_filter($properties, function($property) use ($priceMin, $priceMax, $propertyType, $bedrooms, $bathrooms, $sqftMin, $sqftMax, $yearBuiltMin, $yearBuiltMax, $location) {
        if ($priceMin && $property['price'] < $priceMin) return false;
        if ($priceMax && $property['price'] > $priceMax) return false;
        if ($propertyType && $property['propertyType'] !== $propertyType) return false;
        if ($bedrooms && $property['bedrooms'] < $bedrooms) return false;
        if ($bathrooms && $property['bathrooms'] < $bathrooms) return false;
        if ($sqftMin && $property['sqft'] < $sqftMin) return false;
        if ($sqftMax && $property['sqft'] > $sqftMax) return false;
        if ($yearBuiltMin && $property['yearBuilt'] < $yearBuiltMin) return false;
        if ($yearBuiltMax && $property['yearBuilt'] > $yearBuiltMax) return false;
        if ($location && stripos($property['city'], $location) === false) return false;
        
        return true;
    });
    
    // Sort by match score
    usort($filteredProperties, function($a, $b) {
        return $b['matchScore'] - $a['matchScore'];
    });
    
    echo json_encode([
        'success' => true,
        'data' => [
            'properties' => array_values($filteredProperties),
            'totalResults' => count($filteredProperties),
            'searchQuery' => $query,
            'appliedFilters' => $filters,
            'searchTimestamp' => date('c')
        ]
    ]);
}

function handleSavedSearches($method, $input = []) {
    if ($method === 'GET') {
        $savedSearches = [
            [
                'id' => 'search1',
                'name' => 'Downtown Condos Under $400K',
                'query' => 'downtown condo',
                'filters' => [
                    'priceMax' => 400000,
                    'propertyType' => 'Condo',
                    'location' => 'Downtown'
                ],
                'alertsEnabled' => true,
                'alertFrequency' => 'daily',
                'createdAt' => '2024-07-20T10:00:00Z',
                'lastRun' => '2024-07-27T08:00:00Z',
                'newMatches' => 2
            ],
            [
                'id' => 'search2',
                'name' => 'Family Homes with Pool',
                'query' => 'family home pool',
                'filters' => [
                    'priceMin' => 400000,
                    'priceMax' => 600000,
                    'propertyType' => 'Single Family Home',
                    'bedrooms' => 3,
                    'features' => ['Pool']
                ],
                'alertsEnabled' => false,
                'alertFrequency' => 'weekly',
                'createdAt' => '2024-07-15T14:30:00Z',
                'lastRun' => '2024-07-26T08:00:00Z',
                'newMatches' => 0
            ]
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $savedSearches
        ]);
    } elseif ($method === 'POST') {
        // Create new saved search
        $newSearch = [
            'id' => uniqid(),
            'name' => $input['name'] ?? 'Untitled Search',
            'query' => $input['query'] ?? '',
            'filters' => $input['filters'] ?? [],
            'alertsEnabled' => $input['alertsEnabled'] ?? false,
            'alertFrequency' => $input['alertFrequency'] ?? 'daily',
            'createdAt' => date('c'),
            'lastRun' => null,
            'newMatches' => 0
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $newSearch,
            'message' => 'Saved search created successfully'
        ]);
    }
}

function handleDeleteSavedSearch($searchId) {
    echo json_encode([
        'success' => true,
        'message' => 'Saved search deleted successfully'
    ]);
}

function handlePropertyRecommendations() {
    // Mock recommendations based on client preferences
    $recommendations = [
        [
            'id' => 'rec1',
            'propertyId' => 'prop1',
            'clientId' => '1',
            'clientName' => 'Sarah Johnson',
            'matchScore' => 95,
            'reasonsMatched' => [
                'Budget match: $450K within $300K-$500K range',
                'Location preference: Downtown area',
                'Property type: Single Family Home',
                'Timeline: Available within 3 months'
            ],
            'recommendedAt' => '2024-07-27T10:00:00Z',
            'status' => 'pending'
        ],
        [
            'id' => 'rec2',
            'propertyId' => 'prop2',
            'clientId' => '2',
            'clientName' => 'Michael Brown',
            'matchScore' => 88,
            'reasonsMatched' => [
                'Investment property type',
                'Price range match: $375K within budget',
                'Good rental potential in Midtown',
                'Modern amenities as requested'
            ],
            'recommendedAt' => '2024-07-27T09:30:00Z',
            'status' => 'viewed'
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $recommendations
    ]);
}

function handlePropertySearchStats() {
    $stats = [
        'totalSearches' => 147,
        'searchesToday' => 23,
        'savedSearches' => 8,
        'activeAlerts' => 5,
        'matchesFound' => 89,
        'propertiesViewed' => 45,
        'showingsScheduled' => 12,
        'averageMatchScore' => 82.5,
        'topSearchTerms' => [
            ['term' => 'downtown', 'count' => 34],
            ['term' => 'condo', 'count' => 28],
            ['term' => 'pool', 'count' => 19],
            ['term' => 'garage', 'count' => 16]
        ],
        'priceRangeDistribution' => [
            ['range' => '$0-$300K', 'count' => 12],
            ['range' => '$300K-$500K', 'count' => 45],
            ['range' => '$500K-$700K', 'count' => 31],
            ['range' => '$700K+', 'count' => 15]
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
}

function handleSearchFilters() {
    $filters = [
        'propertyTypes' => [
            'Single Family Home',
            'Condo',
            'Townhouse',
            'Multi-Family',
            'Investment Property',
            'Luxury Home',
            'New Construction'
        ],
        'priceRanges' => [
            ['label' => 'Under $300K', 'min' => 0, 'max' => 300000],
            ['label' => '$300K - $500K', 'min' => 300000, 'max' => 500000],
            ['label' => '$500K - $700K', 'min' => 500000, 'max' => 700000],
            ['label' => '$700K - $1M', 'min' => 700000, 'max' => 1000000],
            ['label' => '$1M+', 'min' => 1000000, 'max' => null]
        ],
        'bedrooms' => [1, 2, 3, 4, 5, '5+'],
        'bathrooms' => [1, 1.5, 2, 2.5, 3, 3.5, 4, '4+'],
        'features' => [
            'Pool',
            'Garage',
            'Fireplace',
            'Hardwood Floors',
            'Updated Kitchen',
            'Stainless Appliances',
            'Granite Countertops',
            'Walk-in Closets',
            'Balcony',
            'Backyard',
            'In-unit Laundry',
            'Air Conditioning',
            'Central Heating'
        ],
        'locations' => [
            'Downtown',
            'Midtown',
            'Suburbs',
            'West End',
            'North District',
            'South Bay',
            'Waterfront',
            'Historic District'
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $filters
    ]);
}

function handleMLSData() {
    // Mock MLS data sync status
    $mlsData = [
        'lastSync' => '2024-07-27T06:00:00Z',
        'nextSync' => '2024-07-27T18:00:00Z',
        'syncFrequency' => 'every 12 hours',
        'totalProperties' => 1247,
        'newListings' => 15,
        'priceChanges' => 8,
        'statusChanges' => 12,
        'removedListings' => 3,
        'syncStatus' => 'active',
        'dataProviders' => [
            ['name' => 'Regional MLS', 'status' => 'connected', 'lastSync' => '2024-07-27T06:00:00Z'],
            ['name' => 'Local Board MLS', 'status' => 'connected', 'lastSync' => '2024-07-27T06:00:00Z'],
            ['name' => 'Commercial MLS', 'status' => 'connected', 'lastSync' => '2024-07-27T05:45:00Z']
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $mlsData
    ]);
}
?>