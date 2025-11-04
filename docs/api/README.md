# Nautilus One API v1 Documentation

## Overview

The Nautilus One REST API provides external access to system modules, missions, crew, and inspection data.

**Base URL**: `/api/v1`  
**Version**: 1.0.0  
**Rate Limit**: 1000 requests per minute

## Authentication

Currently, API access is JWT-based through Supabase authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Modules

#### GET /api/v1/modules

Get list of all system modules.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "crew-management",
      "name": "Crew Management",
      "status": "active",
      "category": "operations",
      "version": "553.0",
      "route": "/crew-management"
    }
  ],
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

#### GET /api/v1/module/:id

Get specific module details.

**Parameters**:
- `id` (string): Module identifier

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "crew-management",
    "name": "Crew Management",
    "status": "active",
    "category": "operations",
    "version": "553.0",
    "route": "/crew-management"
  },
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

### Missions

#### GET /api/v1/missions

Get list of recent missions (last 100).

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Mission Alpha",
      "status": "active",
      "created_at": "2025-11-04T22:00:00.000Z"
    }
  ],
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

#### POST /api/v1/missions

Create a new mission.

**Request Body**:
```json
{
  "name": "Mission Alpha",
  "description": "Test mission",
  "status": "planned"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mission Alpha",
    "description": "Test mission",
    "status": "planned",
    "created_at": "2025-11-04T22:00:00.000Z"
  },
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

### Crew

#### GET /api/v1/crew

Get list of crew members.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "position": "Captain",
      "status": "active"
    }
  ],
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

### Inspections

#### POST /api/v1/inspections

Create a new inspection.

**Request Body**:
```json
{
  "type": "safety",
  "inspector": "John Doe",
  "vessel_id": "uuid",
  "status": "pending"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "safety",
    "inspector": "John Doe",
    "vessel_id": "uuid",
    "status": "pending",
    "created_at": "2025-11-04T22:00:00.000Z"
  },
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

### Health

#### GET /api/v1/health

Check API health status.

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0"
  },
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

The API enforces a rate limit of **1000 requests per minute** per client. When the limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "timestamp": "2025-11-04T22:00:00.000Z"
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
import { nautilusAPI } from '@/api/v1';

// Get all modules
const response = await nautilusAPI.getModules();
if (response.success) {
  console.log('Modules:', response.data);
}

// Get specific module
const module = await nautilusAPI.getModule('crew-management');
if (module.success) {
  console.log('Module:', module.data);
}

// Create mission
const mission = await nautilusAPI.createMission({
  name: 'Test Mission',
  description: 'A test mission',
  status: 'planned'
});
```

### cURL

```bash
# Get all modules
curl -X GET "https://your-domain.com/api/v1/modules" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific module
curl -X GET "https://your-domain.com/api/v1/module/crew-management" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create mission
curl -X POST "https://your-domain.com/api/v1/missions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Mission","description":"A test mission","status":"planned"}'
```

## Support

For API support, please contact the development team or file an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-04  
**Status**: Active
