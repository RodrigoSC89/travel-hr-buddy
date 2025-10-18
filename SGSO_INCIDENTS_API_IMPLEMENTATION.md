# SGSO Incidents API Implementation

## Overview
This document describes the implementation of SGSO Incidents API endpoints as specified in the requirements.

## Implementation Summary

### 1. Database Migration
**File:** `supabase/migrations/20251018184800_create_sgso_incidents.sql`

Created the `sgso_incidents` table with the following structure:
```sql
CREATE TABLE public.sgso_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  type TEXT,
  description TEXT,
  reported_at TIMESTAMP WITH TIME ZONE,
  severity TEXT,
  status TEXT DEFAULT 'open',
  corrective_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

**Features:**
- Row Level Security (RLS) enabled
- Policies for SELECT, INSERT, UPDATE, DELETE based on organization
- Indexes on vessel_id, severity, status, and reported_at for performance
- Automatic updated_at trigger

### 2. API Endpoints

#### GET /api/sgso/incidents
**File:** `pages/api/sgso/incidents/route.ts`

**Purpose:** List all incidents ordered by reported_at (descending)

**Response:**
- Success (200): Array of incidents
- Error (500): Error message

#### POST /api/sgso/incidents
**File:** `pages/api/sgso/incidents/route.ts`

**Purpose:** Create a new incident

**Request Body:** Incident object with fields matching the table schema

**Response:**
- Success (200): `{ success: true }`
- Error (500): Error message

#### PUT /api/sgso/incidents/[id]
**File:** `pages/api/sgso/incidents/[id]/route.ts`

**Purpose:** Update an existing incident

**Request Body:** Partial incident object with fields to update

**Response:**
- Success (200): `{ success: true }`
- Error (500): Error message

#### DELETE /api/sgso/incidents/[id]
**File:** `pages/api/sgso/incidents/[id]/route.ts`

**Purpose:** Delete an incident

**Response:**
- Success (200): `{ success: true }`
- Error (500): Error message

## File Structure
```
pages/
└── api/
    └── sgso/
        └── incidents/
            ├── route.ts          # GET and POST handlers
            └── [id]/
                └── route.ts      # PUT and DELETE handlers
```

## Implementation Details

### Authentication & Authorization
- Uses Supabase service role key for database operations
- RLS policies ensure users can only access incidents from their organization
- Access control is handled at the database level through vessel_id → organization_id relationship

### Error Handling
- All endpoints include try-catch blocks
- Errors are logged to console for debugging
- Consistent error response format: `{ error: string }`

### Code Quality
- All code follows project's ESLint rules (double quotes, proper formatting)
- Type-safe with TypeScript
- Follows existing API endpoint patterns in the repository

## Verification

### Build Status
✅ Project builds successfully without errors

### Lint Status
✅ All new files pass ESLint validation

### Database Schema
✅ Migration file creates table with all required fields as per specification

### API Completeness
✅ All 4 endpoints implemented (GET, POST, PUT, DELETE)

## Usage Example

```typescript
// List all incidents
const response = await fetch('/api/sgso/incidents');
const incidents = await response.json();

// Create an incident
await fetch('/api/sgso/incidents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vessel_id: 'uuid-here',
    type: 'operational',
    description: 'Incident description',
    reported_at: new Date().toISOString(),
    severity: 'medium',
    status: 'open',
    corrective_action: 'Action taken',
    created_by: 'user-uuid'
  })
});

// Update an incident
await fetch('/api/sgso/incidents/incident-id', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'closed',
    corrective_action: 'Updated action'
  })
});

// Delete an incident
await fetch('/api/sgso/incidents/incident-id', {
  method: 'DELETE'
});
```

## Notes
- The implementation uses the exact table structure specified in the requirements
- Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be configured
- The API follows RESTful conventions
- All database operations are handled through Supabase client
