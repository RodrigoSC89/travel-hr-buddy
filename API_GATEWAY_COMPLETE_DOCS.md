# 🌐 API Gateway - Complete Documentation

## PATCH 251 - API Gateway Module

### Overview
The Nautilus One API Gateway provides a unified, secure, and scalable interface for accessing all platform resources through both REST and GraphQL endpoints. It includes authentication, rate limiting, request logging, and comprehensive monitoring capabilities.

---

## 🚀 Quick Start

### 1. Create an API Key

```bash
# Navigate to API Gateway Dashboard
https://your-domain.com/admin/api-gateway

# Click "Create New Key"
# Save your key securely - it won't be shown again!
```

### 2. Make Your First Request

```bash
# REST API
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-domain.com/functions/v1/api-gateway/status

# GraphQL
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id email } }"}' \
  https://your-domain.com/functions/v1/api-gateway/graphql
```

---

## 📡 Available Endpoints

### REST API Endpoints (14 Total)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/status` | GET | API status and available endpoints | Required |
| `/weather` | GET | Real-time weather data | Required |
| `/satellite` | GET | Vessel satellite tracking | Required |
| `/ais` | GET | AIS vessel traffic data | Required |
| `/logistics` | POST | Cargo and port operations | Required |
| `/documents` | GET, POST, PUT, DELETE | Document management | Required |
| `/checklists` | GET, POST, PUT, DELETE | Checklist management | Required |
| `/audits` | GET, POST, PUT | Audit management | Required |
| `/vessels` | GET | Fleet information | Required |
| `/forecasts` | GET | AI predictions | Required |
| `/analytics` | GET | BI metrics and analytics | Required |
| `/templates` | GET | Document templates | Required |
| `/users` | GET | User information | Required |
| `/api-keys` | GET, POST, DELETE | API key management | Required |
| `/webhooks` | GET, POST, DELETE | Webhook configuration | Required |
| `/graphql` | GET, POST | GraphQL endpoint | Required |

---

## 🔐 Authentication

### Methods

1. **JWT Bearer Token (Recommended)**
   ```bash
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

2. **Custom API Key**
   ```bash
   x-nautilus-token: YOUR_API_KEY
   ```

### Example

```javascript
const response = await fetch('https://api.nautilus.com/weather?location=Santos', {
  headers: {
    'Authorization': 'Bearer sk_abc123...',
    'Content-Type': 'application/json'
  }
});
```

---

## 📝 REST API Examples

### Weather Data

```bash
GET /weather?location=Santos

Response:
{
  "location": "Santos, Brazil",
  "temperature": 24,
  "humidity": 75,
  "wind_speed": 12,
  "conditions": "Sunny",
  "forecast": [
    { "day": "Tomorrow", "temp": 24, "conditions": "Sunny" }
  ]
}
```

### Satellite Tracking

```bash
GET /satellite?vessel_id=NAV-001

Response:
{
  "vessel_id": "NAV-001",
  "position": {
    "latitude": -23.96,
    "longitude": -46.33,
    "accuracy": "±10m"
  },
  "speed": 12,
  "heading": 180,
  "timestamp": "2025-01-27T10:30:00Z"
}
```

### Documents (CRUD)

```bash
# List documents
GET /documents?limit=10&offset=0

# Create document
POST /documents
Body: {
  "title": "Safety Report",
  "content": "...",
  "category": "safety"
}

# Update document
PUT /documents?id=doc-123
Body: {
  "title": "Updated Safety Report"
}

# Delete document
DELETE /documents?id=doc-123
```

### Analytics

```bash
GET /analytics?metric=vessel_performance&period=daily

Response:
{
  "metric": "vessel_performance",
  "period": "daily",
  "data": [
    {
      "value": 87.5,
      "trend": "up",
      "timestamp": "2025-01-27T00:00:00Z"
    }
  ]
}
```

---

## 🎯 GraphQL API

### Schema Overview

The GraphQL API exposes 25+ types covering all platform resources:
- User & Authentication
- Documents & Templates
- Checklists & Audits
- Vessels & Tracking
- Weather & Environmental
- Analytics & Forecasts

### GraphQL Playground

Access the interactive playground at:
```
GET /graphql
```

### Query Examples

#### Get Current User

```graphql
query {
  me {
    id
    email
    role
    created_at
  }
}
```

#### List Documents

```graphql
query {
  documents(limit: 10) {
    id
    title
    category
    created_at
  }
}
```

#### Weather Query

```graphql
query {
  weather(location: "Santos") {
    location
    temperature
    humidity
    conditions
    forecast {
      day
      temp
      conditions
    }
  }
}
```

#### Multiple Queries

```graphql
query {
  me {
    id
    email
  }
  vessels {
    id
    name
    status
  }
  weather(location: "Santos") {
    temperature
    conditions
  }
}
```

### Mutation Examples

#### Create Document

```graphql
mutation {
  createDocument(input: {
    title: "Safety Report"
    category: "safety"
    content: "Detailed safety analysis..."
  }) {
    id
    title
    created_at
  }
}
```

#### Create Checklist

```graphql
mutation {
  createChecklist(input: {
    title: "Pre-departure Checklist"
    category: "operations"
    items: [
      "Check fuel levels",
      "Verify crew count",
      "Inspect safety equipment"
    ]
  }) {
    id
    title
    items {
      text
      completed
    }
  }
}
```

#### Update Checklist Item

```graphql
mutation {
  updateChecklistItem(
    id: "item-123"
    completed: true
  )
}
```

#### Create API Key

```graphql
mutation {
  createAPIKey(input: {
    name: "Production API"
    scope: ["*"]
    expires_in_days: 365
  }) {
    id
    name
    key_prefix
    created_at
  }
}
```

---

## ⚡ Rate Limiting

### Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth` | 100 req | 1 minute |
| `/api/documents` | 50 req | 1 minute |
| `/api/analytics` | 30 req | 1 minute |
| **Default** | 100 req | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2025-01-27T10:35:00Z
```

### Handling Rate Limits

```javascript
async function makeRequest() {
  const response = await fetch(endpoint, { headers });
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    console.log('Rate limited. Resets at:', resetTime);
    // Wait and retry
    await sleep(60000);
    return makeRequest();
  }
  
  return response.json();
}
```

---

## 📊 Monitoring & Analytics

### Request Logs

All API requests are logged with:
- Endpoint accessed
- HTTP method
- Response status
- Response time
- User/API key used
- Timestamp

### Quota Dashboard

View real-time usage metrics:
```
/admin/api-gateway → Quotas Tab
```

- Current usage vs limits
- Percentage consumed
- Remaining quota
- Reset time

### Performance Metrics

Track API performance:
- Average response time
- Success rate
- Error rate
- Requests per endpoint

---

## 🔧 Error Handling

### Error Response Format

```json
{
  "error": "Description of the error",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-27T10:30:00Z",
  "request_id": "req_abc123"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Endpoint or resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

### Error Handling Example

```javascript
try {
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.error}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('API request failed:', error);
  // Handle error appropriately
}
```

---

## 🛡️ Security Best Practices

### API Key Management

1. **Never expose keys in client code**
   ```javascript
   // ❌ Bad
   const API_KEY = 'sk_abc123...';
   
   // ✅ Good - Use environment variables
   const API_KEY = process.env.NAUTILUS_API_KEY;
   ```

2. **Use scoped keys**
   - Create keys with minimal required permissions
   - Separate keys for different services
   - Rotate keys regularly

3. **Monitor key usage**
   - Review request logs regularly
   - Set up alerts for unusual activity
   - Revoke compromised keys immediately

4. **Set expiration dates**
   - Use short-lived keys for temporary access
   - Long-lived keys for production services
   - Never use keys without expiration

### HTTPS Only

All API requests must use HTTPS. HTTP requests will be rejected.

### CORS Configuration

The API supports CORS for browser-based applications:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, content-type
```

---

## 📦 Database Schema

### Tables Created

1. **api_keys** - API key storage
2. **api_request_logs** - Request logging
3. **rate_limit_tracking** - Rate limit tracking
4. **webhooks** - Webhook configurations
5. **webhook_logs** - Webhook delivery logs

### Migration

```sql
-- Run migration
psql -f supabase/migrations/20250127_api_gateway_schema.sql

-- Verify tables
\dt api_*
```

---

## 🧪 Testing

### Run Tests

```bash
npm run test __tests__/api-gateway.test.ts
```

### Test Coverage

- ✅ Authentication & authorization
- ✅ All REST endpoints
- ✅ GraphQL queries & mutations
- ✅ Rate limiting
- ✅ Error handling
- ✅ CORS support

---

## 🚢 Deployment

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Deploy Edge Function

```bash
# Deploy to Supabase
supabase functions deploy api-gateway

# Test deployment
curl https://your-project.supabase.co/functions/v1/api-gateway/status
```

---

## 📚 Additional Resources

- [GraphQL Playground](/api-gateway/graphql)
- [API Status](/api-gateway/status)
- [Management Dashboard](/admin/api-gateway)
- [Full API Documentation](/api-gateway-docs)

---

## 🆘 Support

For issues or questions:
1. Check the [FAQ](#)
2. Review [error logs](#)
3. Contact support team

---

## 📝 Changelog

### Version 2.0.0 (2025-01-27)

- ✨ Added GraphQL support with 25+ types
- ✨ Expanded REST endpoints to 14 resources
- ✨ Implemented rate limiting at edge function
- ✨ Added API key management dashboard
- ✨ Created comprehensive monitoring & analytics
- ✨ Added database schema for persistent storage
- 🔒 Enhanced security with RLS policies
- 📊 Real-time quota tracking
- 🧪 Comprehensive test suite

### Version 1.0.0

- Initial REST API with 4 endpoints
- Basic authentication
- Mock data responses

---

**Built with ❤️ by the Nautilus One Team**
