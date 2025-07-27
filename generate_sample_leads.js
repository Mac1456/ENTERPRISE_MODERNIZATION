#!/usr/bin/env node

/**
 * Sample Lead Generator for Testing Assignment Functionality
 * 
 * This script generates realistic sample leads with various statuses,
 * sources, and assignment states to test the lead management features.
 * Uses the API endpoint to create leads.
 */

const API_BASE_URL = 'http://localhost:8080/custom/modernui/api.php';

// Sample lead data arrays
const firstNames = [
    'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley',
    'James', 'Amanda', 'William', 'Jennifer', 'Christopher', 'Lisa', 'Daniel',
    'Michelle', 'Matthew', 'Kimberly', 'Anthony', 'Amy', 'Mark', 'Angela',
    'Donald', 'Helen', 'Steven', 'Brenda', 'Paul', 'Emma', 'Andrew', 'Olivia'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const companies = [
    'Tech Solutions Inc', 'Global Marketing Group', 'Innovative Systems LLC',
    'Premier Consulting', 'Digital Dynamics Corp', 'Strategic Partners', 
    'Advanced Technologies', 'Elite Services', 'Progressive Enterprises',
    'Modern Solutions', 'Future Innovations', 'Professional Services Group',
    'Integrated Systems', 'Dynamic Solutions', 'Creative Industries'
];

const leadSources = [
    'Website', 'Google Ads', 'Facebook', 'Referral', 'Cold Call', 'Email Campaign',
    'Trade Show', 'LinkedIn', 'Direct Mail', 'Partner', 'Webinar', 'Social Media'
];

const leadStatuses = ['New', 'Contacted', 'Qualified', 'Converted'];

const phoneAreaCodes = ['555', '214', '469', '972', '713', '281', '832'];

const emailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com',
    'business.org', 'enterprise.net', 'professional.co'
];

// Real estate specific data
const propertyTypes = [
    'Single Family Home', 'Condo', 'Townhouse', 'Multi-Family', 'Land',
    'Commercial', 'Investment Property', 'Luxury Home'
];

const budgetRanges = [
    { min: 150000, max: 300000 },
    { min: 300000, max: 500000 },
    { min: 500000, max: 750000 },
    { min: 750000, max: 1000000 },
    { min: 1000000, max: 2000000 }
];

const locations = [
    'Downtown', 'Uptown', 'North Dallas', 'South Dallas', 'East Dallas',
    'West Dallas', 'Plano', 'Frisco', 'McKinney', 'Allen', 'Richardson',
    'Garland', 'Irving', 'Arlington', 'Fort Worth'
];

const timelines = [
    'ASAP', 'Within 1 month', 'Within 3 months', 'Within 6 months', 
    'Within 1 year', 'Just browsing'
];

// Utility functions
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatPhoneNumber(areaCode) {
    const exchange = randomInt(100, 999);
    const number = randomInt(1000, 9999);
    return `${areaCode}-${exchange}-${number}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Create a single lead
async function createLead(leadData) {
    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData)
        });

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Generate sample leads
async function generateSampleLeads() {
    console.log('🚀 Starting Sample Lead Generation...\n');
    
    let createdLeads = 0;
    let errors = 0;
    const totalLeads = 25;

    for (let i = 1; i <= totalLeads; i++) {
        try {
            // Generate lead data
            const firstName = randomChoice(firstNames);
            const lastName = randomChoice(lastNames);
            const company = randomChoice(companies);
            const emailDomain = randomChoice(emailDomains);
            const areaCode = randomChoice(phoneAreaCodes);
            const propertyType = randomChoice(propertyTypes);
            const budget = randomChoice(budgetRanges);
            const location = randomChoice(locations);
            const timeline = randomChoice(timelines);
            const leadScore = randomInt(60, 95);

            const leadData = {
                firstName: firstName,
                lastName: lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
                phone: formatPhoneNumber(areaCode),
                company: company,
                status: randomChoice(leadStatuses),
                source: randomChoice(leadSources),
                description: [
                    `Interested in: ${propertyType}`,
                    `Budget: ${formatCurrency(budget.min)} - ${formatCurrency(budget.max)}`,
                    `Preferred Location: ${location}`,
                    `Timeline: ${timeline}`,
                    `Lead Score: ${leadScore}`
                ].join('\n')
            };

            const result = await createLead(leadData);
            
            if (result.success) {
                createdLeads++;
                console.log(`✅ Lead #${i}: ${firstName} ${lastName} (${leadData.status}) - ${leadData.source}`);
            } else {
                errors++;
                console.log(`❌ Failed to create lead #${i}: ${firstName} ${lastName} - ${result.error}`);
            }

            // Small delay to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
            errors++;
            console.log(`❌ Error creating lead #${i}: ${error.message}`);
        }
    }

    console.log('\n🎯 Sample Lead Generation Complete!');
    console.log(`✅ Successfully created: ${createdLeads} leads`);
    console.log(`❌ Errors: ${errors}`);
    
    console.log('\n📊 Distribution Summary:');
    console.log('- Various statuses: New, Contacted, Qualified, Converted');
    console.log('- Multiple sources: Website, Google Ads, Referrals, etc.');
    console.log('- Real estate data: Property types, budgets, locations, timelines');
    console.log('- Lead scores: Random scores between 60-95');
    console.log('- Realistic contact info: Names, emails, phone numbers');

    console.log('\n🧪 Testing Scenarios Available:');
    console.log('1. ✅ Manual assignment: Leads can be manually assigned to users');
    console.log('2. ✅ Auto-assignment: Test auto-assignment rules and workflows');
    console.log('3. ✅ Status updates: Leads have various statuses to test workflows');
    console.log('4. ✅ Filter testing: Multiple sources and statuses for filtering');
    console.log('5. ✅ Lead scoring: Various scores for prioritization testing');
    console.log('6. ✅ Contact management: Full contact details for testing');

    console.log('\n🎉 Ready for lead management testing!');
    console.log('Visit your leads page to see the generated sample data.');
    console.log('You should now see the dynamic badge count update based on actual leads!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with fetch support.');
    console.log('Please run: brew install node (to get latest version)');
    console.log('Or install node-fetch: npm install node-fetch');
    process.exit(1);
}

// Run the generator
generateSampleLeads().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
}); 