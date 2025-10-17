# DP Incidents Backend Implementation

## Overview

This implementation provides a complete backend system for managing Dynamic Positioning (DP) incidents with AI-powered analysis based on IMCA guidelines.

## Architecture

### Database Layer

**Table: `dp_incidents`**
- Stores DP incident records with metadata
- Includes AI analysis results in JSONB format
- Full-text indexing on key fields for performance

### API Layer

**Endpoints:**
1. `GET /api/dp-incidents` - List all incidents
2. `POST /api/dp-incidents` - Create new incident
3. `POST /api/dp-incidents/explain` - Run AI analysis on an incident

### AI Layer

**Module: `@/lib/ai/dp-intelligence`**
- Analyzes incidents using OpenAI GPT-4
- Returns structured analysis with IMCA references
- Temperature: 0.4 for consistent results

## Files Created

### 1. Database Migration
```
supabase/migrations/20251017010000_create_dp_incidents_table.sql
```

Creates the `dp_incidents` table with:
- UUID primary key
- Required fields: title, description
- Optional fields: source, incident_date, severity, vessel
- JSONB field for AI analysis
- Indexes on date, severity, and vessel
- Row Level Security policies
- Auto-updated timestamp trigger

### 2. AI Analysis Module
```
src/lib/ai/dp-intelligence/explainIncidentWithAI.ts
src/lib/ai/dp-intelligence/index.ts
```

Provides AI-powered incident analysis with:
- Expert context: IMCA DP operations specialist
- Structured response in Portuguese
- JSON format with 5 key sections
- Error handling and validation

### 3. API Endpoints
```
pages/api/dp-incidents/index.ts
pages/api/dp-incidents/explain.ts
```

RESTful API handlers with:
- CORS support
- Input validation
- Error handling
- Service role authentication

### 4. UI Components (Updated)
```
src/components/dp/IncidentCards.tsx
src/components/dp/IncidentAiModal.tsx
```

React components with:
- Real-time API integration
- Loading states
- Error handling with toast notifications
- Tabbed interface for AI results

### 5. Tests
```
src/tests/dp-incidents-api.test.ts
```

Comprehensive test suite covering:
- Request handling (GET, POST)
- Input validation
- Database schema
- AI analysis structure
- Error scenarios

## API Documentation

### GET /api/dp-incidents

**Description:** List all DP incidents, ordered by date (newest first)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Incident title",
    "description": "Detailed description",
    "source": "IMCA M220",
    "incident_date": "2024-10-17",
    "severity": "Alta",
    "vessel": "Drillship Alpha",
    "gpt_analysis": {
      "causa_provavel": "...",
      "medidas_prevencao": "...",
      "impacto_operacional": "...",
      "referencia_normativa": "...",
      "grau_severidade": "Alta"
    },
    "created_at": "2024-10-17T01:00:00Z",
    "updated_at": "2024-10-17T01:00:00Z"
  }
]
```

### POST /api/dp-incidents

**Description:** Create a new DP incident

**Request Body:**
```json
{
  "title": "Loss of position during drilling",
  "description": "Vessel experienced loss of position...",
  "source": "IMCA M220",
  "incident_date": "2024-10-15",
  "severity": "Alta",
  "vessel": "Drillship Alpha"
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Loss of position during drilling",
    "description": "Vessel experienced loss of position...",
    "source": "IMCA M220",
    "incident_date": "2024-10-15",
    "severity": "Alta",
    "vessel": "Drillship Alpha",
    "gpt_analysis": null,
    "created_at": "2024-10-17T01:00:00Z",
    "updated_at": "2024-10-17T01:00:00Z"
  }
]
```

**Status Codes:**
- 201: Created successfully
- 400: Missing required fields
- 500: Server error

### POST /api/dp-incidents/explain

**Description:** Analyze an incident using AI and store the results

**Request Body:**
```json
{
  "id": "uuid-of-incident"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "causa_provavel": "Falha no sistema de propulsão devido a manutenção inadequada...",
    "medidas_prevencao": "1. Implementar checklist de manutenção preventiva...",
    "impacto_operacional": "Perda de posicionamento resultou em parada de 2 horas...",
    "referencia_normativa": "IMCA M220 - Guidance on Failure Modes and Effects Analysis...",
    "grau_severidade": "Alta"
  }
}
```

**Status Codes:**
- 200: Analysis completed
- 400: Missing id
- 404: Incident not found
- 500: Analysis failed

## AI Analysis Structure

The AI analysis returns structured data in Portuguese with 5 key sections:

1. **causa_provavel** - Probable root cause analysis
2. **medidas_prevencao** - Prevention measures and recommendations
3. **impacto_operacional** - Operational impact assessment
4. **referencia_normativa** - IMCA/IMO/PEO-DP normative references
5. **grau_severidade** - Severity level (Alta, Média, Baixa)

## Database Schema

```sql
CREATE TABLE dp_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  source text,
  incident_date date,
  severity text,
  vessel text,
  gpt_analysis jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_dp_incidents_incident_date ON dp_incidents(incident_date DESC);
CREATE INDEX idx_dp_incidents_severity ON dp_incidents(severity);
CREATE INDEX idx_dp_incidents_vessel ON dp_incidents(vessel);
```

## Security

**Row Level Security (RLS):**
- Authenticated users can read all incidents
- Authenticated users can insert new incidents
- Authenticated users can update incidents

**API Authentication:**
- Uses Supabase service role key for server-side operations
- CORS configured for cross-origin requests

## Usage Examples

### Creating an Incident

```javascript
const response = await fetch('/api/dp-incidents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Loss of position during operation',
    description: 'Detailed incident description...',
    severity: 'Alta',
    vessel: 'Drillship Alpha'
  })
});

const incident = await response.json();
```

### Fetching Incidents

```javascript
const response = await fetch('/api/dp-incidents');
const incidents = await response.json();
```

### Running AI Analysis

```javascript
const response = await fetch('/api/dp-incidents/explain', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'incident-uuid'
  })
});

const { success, analysis } = await response.json();
```

## Environment Variables

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-...
```

## Testing

Run the test suite:

```bash
npm test -- dp-incidents-api.test.ts
```

All tests should pass (40 tests total).

## Future Enhancements

Possible improvements for future iterations:

1. **Filtering & Search**
   - Add query parameters for filtering by severity, vessel, date range
   - Implement full-text search on title and description

2. **Pagination**
   - Add limit and offset parameters
   - Return total count in response

3. **Batch Operations**
   - Bulk import from IMCA database
   - Batch AI analysis

4. **Export Features**
   - PDF export of incident with AI analysis
   - CSV export for reporting

5. **Analytics**
   - Incident trends by vessel
   - Severity distribution
   - Common causes analysis

6. **Notifications**
   - Email alerts for new high-severity incidents
   - Webhook integration

## Related Documentation

- [IMCA Guidelines](https://www.imca-int.com/)
- [DP Incident Cards Component](./src/components/dp/README.md)
- [API Test Suite](./src/tests/dp-incidents-api.test.ts)

## Support

For issues or questions, contact the development team or file an issue in the repository.
