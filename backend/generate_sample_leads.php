<?php
/**
 * Sample Lead Generator for Testing Assignment Functionality
 * 
 * This script generates realistic sample leads with various statuses,
 * sources, and assignment states to test the lead management features.
 */

// Include SuiteCRM configuration
require_once('config.php');
require_once('include/entryPoint.php');
require_once('modules/Leads/Lead.php');
require_once('include/utils.php');

// Sample lead data arrays
$firstNames = [
    'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley',
    'James', 'Amanda', 'William', 'Jennifer', 'Christopher', 'Lisa', 'Daniel',
    'Michelle', 'Matthew', 'Kimberly', 'Anthony', 'Amy', 'Mark', 'Angela',
    'Donald', 'Helen', 'Steven', 'Brenda', 'Paul', 'Emma', 'Andrew', 'Olivia'
];

$lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

$companies = [
    'Tech Solutions Inc', 'Global Marketing Group', 'Innovative Systems LLC',
    'Premier Consulting', 'Digital Dynamics Corp', 'Strategic Partners', 
    'Advanced Technologies', 'Elite Services', 'Progressive Enterprises',
    'Modern Solutions', 'Future Innovations', 'Professional Services Group',
    'Integrated Systems', 'Dynamic Solutions', 'Creative Industries'
];

$leadSources = [
    'Website', 'Google Ads', 'Facebook', 'Referral', 'Cold Call', 'Email Campaign',
    'Trade Show', 'LinkedIn', 'Direct Mail', 'Partner', 'Webinar', 'Social Media'
];

$leadStatuses = ['New', 'Contacted', 'Qualified', 'Converted'];

$phoneAreaCodes = ['555', '214', '469', '972', '713', '281', '832'];

$emailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com',
    'business.org', 'enterprise.net', 'professional.co'
];

// Real estate specific data
$propertyTypes = [
    'Single Family Home', 'Condo', 'Townhouse', 'Multi-Family', 'Land',
    'Commercial', 'Investment Property', 'Luxury Home'
];

$budgetRanges = [
    ['min' => 150000, 'max' => 300000],
    ['min' => 300000, 'max' => 500000],
    ['min' => 500000, 'max' => 750000],
    ['min' => 750000, 'max' => 1000000],
    ['min' => 1000000, 'max' => 2000000]
];

$locations = [
    'Downtown', 'Uptown', 'North Dallas', 'South Dallas', 'East Dallas',
    'West Dallas', 'Plano', 'Frisco', 'McKinney', 'Allen', 'Richardson',
    'Garland', 'Irving', 'Arlington', 'Fort Worth'
];

$timelines = [
    'ASAP', 'Within 1 month', 'Within 3 months', 'Within 6 months', 
    'Within 1 year', 'Just browsing'
];

// Get available users for assignment
$users = get_user_array(false, 'Active');
$userIds = array_keys($users);

echo "🚀 Starting Sample Lead Generation...\n";
echo "Available users for assignment: " . count($userIds) . "\n";

$createdLeads = 0;
$errors = 0;

// Generate 25 sample leads
for ($i = 1; $i <= 25; $i++) {
    try {
        $lead = new Lead();
        
        // Basic contact information
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        $company = $companies[array_rand($companies)];
        
        $lead->first_name = $firstName;
        $lead->last_name = $lastName;
        $lead->account_name = $company;
        
        // Generate email based on name
        $emailDomain = $emailDomains[array_rand($emailDomains)];
        $lead->email1 = strtolower($firstName . '.' . $lastName . '@' . $emailDomain);
        
        // Generate phone number
        $areaCode = $phoneAreaCodes[array_rand($phoneAreaCodes)];
        $lead->phone_work = $areaCode . '-' . rand(100, 999) . '-' . rand(1000, 9999);
        
        // Lead details
        $lead->status = $leadStatuses[array_rand($leadStatuses)];
        $lead->lead_source = $leadSources[array_rand($leadSources)];
        
        // Real estate specific details in description
        $propertyType = $propertyTypes[array_rand($propertyTypes)];
        $budget = $budgetRanges[array_rand($budgetRanges)];
        $location = $locations[array_rand($locations)];
        $timeline = $timelines[array_rand($timelines)];
        
        $lead->description = "Interested in: {$propertyType}\n";
        $lead->description .= "Budget: $" . number_format($budget['min']) . " - $" . number_format($budget['max']) . "\n";
        $lead->description .= "Preferred Location: {$location}\n";
        $lead->description .= "Timeline: {$timeline}\n";
        $lead->description .= "Lead Score: " . rand(60, 95);
        
        // Assignment logic - 60% assigned, 40% unassigned for testing
        if (rand(1, 100) <= 60 && !empty($userIds)) {
            $randomUserId = $userIds[array_rand($userIds)];
            $lead->assigned_user_id = $randomUserId;
            $assignmentStatus = "Assigned to: " . $users[$randomUserId];
        } else {
            $lead->assigned_user_id = '';
            $assignmentStatus = "Unassigned";
        }
        
        // Set creation date with some variation (last 30 days)
        $daysAgo = rand(0, 30);
        $lead->date_entered = date('Y-m-d H:i:s', strtotime("-{$daysAgo} days"));
        
        // Save the lead
        $lead->save();
        
        if (!empty($lead->id)) {
            $createdLeads++;
            echo "✅ Lead #{$i}: {$firstName} {$lastName} ({$lead->status}) - {$assignmentStatus}\n";
        } else {
            $errors++;
            echo "❌ Failed to create lead #{$i}: {$firstName} {$lastName}\n";
        }
        
    } catch (Exception $e) {
        $errors++;
        echo "❌ Error creating lead #{$i}: " . $e->getMessage() . "\n";
    }
    
    // Small delay to avoid overwhelming the system
    usleep(100000); // 0.1 second delay
}

echo "\n🎯 Sample Lead Generation Complete!\n";
echo "✅ Successfully created: {$createdLeads} leads\n";
echo "❌ Errors: {$errors}\n";
echo "\n📊 Distribution Summary:\n";
echo "- Various statuses: New, Contacted, Qualified, Converted\n";
echo "- Multiple sources: Website, Google Ads, Referrals, etc.\n";
echo "- Mixed assignments: ~60% assigned to users, ~40% unassigned\n";
echo "- Real estate data: Property types, budgets, locations, timelines\n";
echo "- Lead scores: Random scores between 60-95\n";
echo "- Creation dates: Spread over last 30 days\n";

echo "\n🧪 Testing Scenarios Available:\n";
echo "1. ✅ Auto-assignment: Unassigned leads can be auto-assigned\n";
echo "2. ✅ Manual assignment: Leads can be manually assigned to users\n";
echo "3. ✅ Re-assignment: Assigned leads can be reassigned to different users\n";
echo "4. ✅ Status updates: Leads have various statuses to test workflows\n";
echo "5. ✅ Filter testing: Multiple sources and statuses for filtering\n";
echo "6. ✅ Lead scoring: Various scores for prioritization testing\n";

echo "\n🎉 Ready for lead management testing!\n";
echo "Visit your leads page to see the generated sample data.\n";

?> 