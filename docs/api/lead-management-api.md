# Lead Management API Documentation

## Overview

The Lead Management API provides intelligent lead capture, scoring, and assignment functionality for the SuiteCRM Real Estate Pro modernization project. This API implements Feature 2 requirements including geolocation-based assignment, agent capacity management, and specialization-based routing.

## Base URL

```
http://localhost/SuiteCRM/custom/modernui/api.php
```

## Authentication

All endpoints require basic authentication. In production, this should be replaced with JWT/OAuth 2.0.

## Endpoints

### Lead CRUD Operations

#### Get Leads
```http
GET /leads
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 10)
- `search` (string): Search term for name/email
- `status` (string): Filter by lead status
- `source` (string): Filter by lead source
- `assignedTo` (string): Filter by assigned user ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lead123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "status": "New",
      "source": "Website",
      "assignedUserId": "agent1",
      "assignedUserName": "Agent Smith",
      "propertyType": "Single Family",
      "budget": {
        "min": 300000,
        "max": 500000
      },
      "preferredLocation": "Downtown",
      "timeline": "Within 3 months",
      "leadScore": 85,
      "createdAt": "2024-01-15T10:00:00Z",
      "modifiedAt": "2024-01-15T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

#### Get Single Lead
```http
GET /leads/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lead123",
    "firstName": "John",
    "lastName": "Doe",
    // ... full lead object
  }
}
```

#### Create Lead
```http
POST /leads
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "555-5678",
  "title": "Marketing Manager",
  "company": "Tech Corp",
  "website": "https://techcorp.com",
  "notes": "Interested in downtown condos",
  "source": "Website",
  "propertyType": "Condo",
  "budget": {
    "min": 400000,
    "max": 600000
  },
  "preferredLocation": "Downtown",
  "timeline": "Within 6 months"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_lead_id",
    "firstName": "Jane",
    "lastName": "Smith",
    // ... created lead object
    "message": "Lead created successfully"
  }
}
```

#### Update Lead
```http
PUT /leads/{id}
```

**Request Body:** (Partial lead object with fields to update)

#### Delete Lead
```http
DELETE /leads/{id}
```

### Lead Assignment

#### Auto-Assign Leads
```http
POST /leads/auto-assign
```

**Request Body:**
```json
{
  "leadIds": ["lead1", "lead2", "lead3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assigned": [
      {
        "leadId": "lead1",
        "assignedUserId": "agent1",
        "assignedUserName": "Agent Smith",
        "reasoning": "Geographic match: Downtown Area Assignment; Capacity filtering: 1 agents under capacity limit",
        "leadScore": 85,
        "agentCapacity": 0.6
      },
      {
        "leadId": "lead2",
        "assignedUserId": "agent2",
        "assignedUserName": "Agent Jones",
        "reasoning": "Specialization match: first_time_buyers",
        "leadScore": 78,
        "agentCapacity": 0.4
      }
    ],
    "failed": [
      {
        "leadId": "lead3",
        "error": "No available agents found"
      }
    ]
  }
}
```

#### Assign Lead to Specific User
```http
PATCH /leads/{id}/assign
```

**Request Body:**
```json
{
  "userId": "agent123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lead123",
    "assignedUserId": "agent123",
    "assignedUserName": "Agent Smith",
    // ... updated lead object
  }
}
```

### Lead Scoring

#### Calculate Lead Score
```http
POST /leads/calculate-score
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "budget": {
    "min": 400000,
    "max": 500000
  },
  "timeline": "within 3 months",
  "preferredLocation": "downtown",
  "source": "referral",
  "propertyType": "single family",
  "preapprovalStatus": "pre_qualified",
  "webEngagement": {
    "pageViews": 8,
    "timeOnSite": 320,
    "returnVisitor": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 88,
    "factors": {
      "budget": {
        "score": 85,
        "weight": 0.25,
        "weighted_score": 21.25
      },
      "timeline": {
        "score": 90,
        "weight": 0.20,
        "weighted_score": 18.0
      },
      "location": {
        "score": 75,
        "weight": 0.15,
        "weighted_score": 11.25
      },
      "source": {
        "score": 95,
        "weight": 0.15,
        "weighted_score": 14.25
      },
      "engagement": {
        "score": 80,
        "weight": 0.15,
        "weighted_score": 12.0
      },
      "preapproval": {
        "score": 85,
        "weight": 0.10,
        "weighted_score": 8.5
      }
    },
    "reasoning": "High-quality referral lead with strong budget and immediate timeline; Strong budget qualification; Immediate buying timeline",
    "grade": "A",
    "priority": "Hot"
  }
}
```

#### Update Lead Score
```http
PATCH /leads/{id}/score
```

**Request Body:**
```json
{
  "score": 92,
  "reason": "Updated after follow-up call - highly motivated buyer"
}
```

### Assignment Rules Management

#### Get Assignment Rules
```http
GET /leads/assignment-rules
```

**Response:**
```json
{
  "success": true,
  "data": {
    "geolocationRules": [
      {
        "id": "geo_rule_1",
        "name": "Downtown Area Assignment",
        "rule_type": "geolocation",
        "rule_data": {
          "areas": [
            {
              "name": "Downtown",
              "lat": 39.7817,
              "lng": -89.6501,
              "radius": 5
            }
          ],
          "agents": [
            {
              "user_id": "agent1",
              "areas": ["Downtown"],
              "max_capacity": 20
            }
          ]
        },
        "priority": 1,
        "is_active": true,
        "conditions": {
          "lead_source": ["website", "zillow", "realtor.com"],
          "property_type": ["single_family", "condo", "townhouse"]
        }
      }
    ],
    "capacityRules": [
      {
        "id": "capacity_rule_1",
        "name": "Agent Capacity Management",
        "rule_type": "capacity",
        "rule_data": {
          "max_leads_per_agent": 15,
          "max_active_opportunities": 10,
          "overflow_strategy": "round_robin",
          "capacity_thresholds": {
            "green": 0.7,
            "yellow": 0.9,
            "red": 1.0
          }
        },
        "priority": 2,
        "is_active": true,
        "conditions": {
          "always_apply": true
        }
      }
    ],
    "specializationRules": [
      {
        "id": "spec_rule_1",
        "name": "First-Time Buyer Specialization",
        "rule_type": "specialization",
        "rule_data": {
          "specializations": {
            "first_time_buyers": {
              "user_id": "agent1",
              "weight": 1.0
            },
            "luxury_properties": {
              "user_id": "agent2",
              "weight": 1.0
            }
          }
        },
        "priority": 3,
        "is_active": true,
        "conditions": {
          "budget_max": 500000,
          "lead_source": ["website", "referral"],
          "timeline": ["immediate", "within_3_months"]
        }
      }
    ]
  }
}
```

#### Update Assignment Rules
```http
PUT /leads/assignment-rules
```

**Request Body:**
```json
{
  "rules": [
    {
      "id": "existing_rule_id",
      "name": "Updated Rule Name",
      "rule_type": "geolocation",
      "rule_data": {
        // ... rule configuration
      },
      "priority": 1,
      "is_active": true,
      "conditions": {
        // ... rule conditions
      }
    },
    {
      // New rule without ID
      "name": "New Rule",
      "rule_type": "capacity",
      "rule_data": {
        // ... rule configuration
      },
      "priority": 2,
      "is_active": true
    }
  ]
}
```

### External Lead Import

#### Import Lead from Zillow
```http
POST /leads/import/zillow
```

**Request Body:**
```json
{
  "zillow_lead_id": "zlw_12345",
  "firstName": "Sarah",
  "lastName": "Wilson",
  "email": "sarah.wilson@email.com",
  "phone": "555-9876",
  "propertyInterest": "Single Family Home",
  "budget": {
    "min": 450000,
    "max": 650000
  },
  "preferredLocation": "Westside",
  "notes": "Looking for move-in ready home with good schools"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "new_lead_id",
    "source": "zillow",
    "assignment": {
      "success": true,
      "assignedUserId": "agent3",
      "assignedUserName": "Agent Johnson",
      "reasoning": "Geographic match: Westside Area Assignment",
      "leadScore": 82
    }
  }
}
```

#### Import Lead from Realtor.com
```http
POST /leads/import/realtor
```

Similar structure to Zillow import with `realtor_lead_id` instead.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE" // Optional error code for programmatic handling
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP for general endpoints
- 10 requests per minute for bulk operations (auto-assign, bulk update)
- 429 status code returned when limits exceeded

## Security Considerations

1. **Input Validation**: All input is validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries used throughout
3. **CSRF Protection**: CSRF tokens required for state-changing operations
4. **Data Access Control**: Users can only access leads assigned to them or their team
5. **Audit Logging**: All assignment operations are logged for compliance

## Scoring Algorithm Details

### Scoring Factors

1. **Budget (25% weight)**
   - Higher budgets score better
   - Realistic budgets for market area score better
   - Narrower budget ranges indicate more serious buyers

2. **Timeline (20% weight)**
   - "Immediate" = 95 points
   - "Within 3 months" = 85 points
   - "Within 6 months" = 70 points
   - "Over 1 year" = 25 points

3. **Location (15% weight)**
   - Specific locations score higher
   - Areas with good inventory availability score better

4. **Source (15% weight)**
   - Referrals and past clients score highest (90-95)
   - Website forms score well (75)
   - Lead generation sites score moderately (60-70)
   - Cold calls score lowest (30)

5. **Engagement (15% weight)**
   - Complete contact information
   - Additional notes/questions provided
   - Website engagement metrics (time on site, pages viewed)

6. **Pre-approval Status (10% weight)**
   - Pre-approved or cash buyers score highest (100)
   - Pre-qualified scores well (80)
   - Unknown status scores lowest (30)

### Assignment Algorithm

1. **Rule Priority**: Rules are applied in order of priority (lower numbers first)
2. **Rule Conditions**: Each rule has conditions that must be met for the lead
3. **Agent Filtering**: Rules filter the available agent pool
4. **Final Selection**: Weighted algorithm considers capacity, performance, and specialization
5. **Fallback**: If no rules match, round-robin assignment to available agents

## Examples

### Complete Lead Capture and Assignment Flow

1. **Capture Lead**:
```bash
curl -X POST http://localhost/SuiteCRM/custom/modernui/api.php/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Emma",
    "lastName": "Thompson",
    "email": "emma.thompson@email.com",
    "phone": "555-2468",
    "source": "Website",
    "propertyType": "Townhouse",
    "budget": {"min": 350000, "max": 500000},
    "preferredLocation": "Historic District",
    "timeline": "Within 3 months"
  }'
```

2. **Calculate Score**:
```bash
curl -X POST http://localhost/SuiteCRM/custom/modernui/api.php/leads/calculate-score \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Emma",
    "lastName": "Thompson",
    "email": "emma.thompson@email.com",
    "phone": "555-2468",
    "source": "website",
    "propertyType": "townhouse",
    "budget": {"min": 350000, "max": 500000},
    "preferredLocation": "historic district",
    "timeline": "within 3 months"
  }'
```

3. **Auto-Assign**:
```bash
curl -X POST http://localhost/SuiteCRM/custom/modernui/api.php/leads/auto-assign \
  -H "Content-Type: application/json" \
  -d '{
    "leadIds": ["new_lead_id"]
  }'
```

This comprehensive API enables intelligent lead management with real estate-specific features while maintaining compatibility with existing SuiteCRM infrastructure.
