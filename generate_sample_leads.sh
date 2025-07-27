#!/bin/bash

# Sample Lead Generator using curl
# Creates realistic sample leads for testing assignment functionality

API_URL="http://localhost:8080/custom/modernui/api.php/leads"

echo "🚀 Starting Sample Lead Generation via curl..."
echo "API Endpoint: $API_URL"
echo ""

# Sample data arrays (limited for shell script)
first_names=("John" "Sarah" "Michael" "Emily" "David" "Jessica" "Robert" "Amanda" "James" "Lisa")
last_names=("Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller" "Davis" "Wilson" "Moore")
companies=("Tech Solutions Inc" "Global Marketing" "Digital Dynamics" "Elite Services" "Modern Solutions")
sources=("Website" "Google Ads" "Facebook" "Referral" "Email Campaign")
statuses=("New" "Contacted" "Qualified")
property_types=("Single Family Home" "Condo" "Town house" "Investment Property")
locations=("Downtown" "Uptown" "North Dallas" "Plano" "Frisco")

created_count=0
error_count=0

# Function to get random array element
get_random() {
    local arr=("$@")
    echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# Function to generate random number in range
random_range() {
    local min=$1
    local max=$2
    echo $((RANDOM % (max - min + 1) + min))
}

# Generate 15 sample leads
for i in {1..15}; do
    # Generate random data
    first_name=$(get_random "${first_names[@]}")
    last_name=$(get_random "${last_names[@]}")
    company=$(get_random "${companies[@]}")
    source=$(get_random "${sources[@]}")
    status=$(get_random "${statuses[@]}")
    property_type=$(get_random "${property_types[@]}")
    location=$(get_random "${locations[@]}")
    
    # Generate email and phone
    email="${first_name,,}.${last_name,,}@company.com"
    phone="555-$(random_range 100 999)-$(random_range 1000 9999)"
    lead_score=$(random_range 60 95)
    
    # Create description
    description="Interested in: $property_type\\nPreferred Location: $location\\nLead Score: $lead_score"
    
    # Create JSON payload
    json_data=$(cat <<EOF
{
    "firstName": "$first_name",
    "lastName": "$last_name",
    "email": "$email",
    "phone": "$phone",
    "company": "$company",
    "status": "$status",
    "source": "$source",
    "description": "$description"
}
EOF
)
    
    echo "Creating Lead #$i: $first_name $last_name..."
    
    # Make API call
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "$API_URL")
    
    # Extract HTTP status code (last 3 characters)
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        created_count=$((created_count + 1))
        echo "✅ Lead #$i: $first_name $last_name ($status) - $source"
    else
        error_count=$((error_count + 1))
        echo "❌ Failed to create lead #$i: $first_name $last_name (HTTP: $http_code)"
        echo "   Response: $response_body"
    fi
    
    # Small delay
    sleep 0.5
done

echo ""
echo "🎯 Sample Lead Generation Complete!"
echo "✅ Successfully created: $created_count leads"
echo "❌ Errors: $error_count"
echo ""
echo "📊 Generated leads with:"
echo "- Various statuses: New, Contacted, Qualified"
echo "- Multiple sources: Website, Google Ads, Referrals"
echo "- Real estate data: Property types and locations"
echo "- Contact information: Names, emails, phone numbers"
echo ""
echo "🧪 Testing scenarios now available:"
echo "1. ✅ Manual assignment testing"
echo "2. ✅ Auto-assignment rule testing"
echo "3. ✅ Lead filtering and searching"
echo "4. ✅ Status workflow testing"
echo "5. ✅ Dynamic badge count verification"
echo ""
echo "🎉 Ready for lead management testing!"
echo "Visit your leads page to see the generated sample data." 