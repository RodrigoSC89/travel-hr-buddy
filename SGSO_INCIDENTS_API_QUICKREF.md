# SGSO Incidents API - Quick Reference

## Endpoints

### List Incidents
```http
GET /api/sgso/incidents
```
Returns all incidents ordered by `reported_at` (newest first)

### Create Incident
```http
POST /api/sgso/incidents
Content-Type: application/json

{
  "vessel_id": "uuid",
  "type": "string",
  "description": "string",
  "reported_at": "2024-01-01T00:00:00Z",
  "severity": "string",
  "status": "open",
  "corrective_action": "string",
  "created_by": "uuid"
}
```

### Update Incident
```http
PUT /api/sgso/incidents/{id}
Content-Type: application/json

{
  "status": "closed",
  "corrective_action": "Updated action"
}
```

### Delete Incident
```http
DELETE /api/sgso/incidents/{id}
```

## Database Schema

```sql
CREATE TABLE sgso_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  type TEXT,
  description TEXT,
  reported_at TIMESTAMP WITH TIME ZONE,
  severity TEXT,
  status TEXT DEFAULT 'open',
  corrective_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id)
);
```

## Response Format

**Success:**
```json
{
  "success": true
}
```
or
```json
[
  {
    "id": "uuid",
    "vessel_id": "uuid",
    "type": "operational",
    "description": "Incident description",
    "reported_at": "2024-01-01T00:00:00Z",
    "severity": "medium",
    "status": "open",
    "corrective_action": "Action taken",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "uuid"
  }
]
```

**Error:**
```json
{
  "error": "Error message"
}
```

## Security

- Row Level Security (RLS) enabled
- Users can only access incidents from vessels in their organization
- Authentication handled via Supabase auth

## Files

- API Routes: `pages/api/sgso/incidents/`
- Migration: `supabase/migrations/20251018184800_create_sgso_incidents.sql`
- Documentation: `SGSO_INCIDENTS_API_IMPLEMENTATION.md`
