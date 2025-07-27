<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Mock leads data for testing
$mockLeads = [
    [
        'id' => '1',
        'firstName' => 'John',
        'lastName' => 'Smith',
        'email' => 'john.smith@gmail.com',
        'phone' => '555-123-4567',
        'status' => 'New',
        'source' => 'Website',
        'assignedUserId' => null,
        'assignedUserName' => '',
        'company' => 'Tech Solutions',
        'createdAt' => '2024-07-20 10:00:00',
        'leadScore' => 85
    ],
    [
        'id' => '2', 
        'firstName' => 'Sarah',
        'lastName' => 'Johnson',
        'email' => 'sarah.johnson@company.com',
        'phone' => '555-234-5678',
        'status' => 'Contacted',
        'source' => 'Google Ads',
        'assignedUserId' => null,
        'assignedUserName' => '',
        'company' => 'Global Marketing',
        'createdAt' => '2024-07-21 14:30:00',
        'leadScore' => 78
    ]
];

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
?>
