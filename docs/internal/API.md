# 📡 API Documentation

## Overview

Nautilus One provides both internal API routes (Next.js-style API routes deployed on Vercel) and Supabase Edge Functions for serverless compute. This document covers authentication, available endpoints, and usage examples.

## 🔐 Authentication

All API routes require authentication via Bearer token in the Authorization header:

```typescript
const response = await fetch('/api/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
});
```

### Getting the Access Token

```typescript
// Using Supabase client
import { supabase } from '@/integrations/supabase/client';

const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## 🛣️ API Routes

### Admin Routes

#### GET `/api/admin/alertas`
Get all audit alerts (admin only).

**Authorization**: Admin role required

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "auditoria_id": "uuid",
      "comentario_id": "uuid",
      "descricao": "Alert description",
      "criado_em": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Example**:
```typescript
const response = await fetch('/api/admin/alertas', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const { data } = await response.json();
```

#### GET `/api/admin/metrics`
Get system-wide metrics.

**Authorization**: Admin role required

**Response**:
```json
{
  "total_users": 150,
  "active_vessels": 25,
  "pending_checklists": 12,
  "compliance_score": 98.5
}
```

#### GET `/api/admin/metrics/evolucao-mensal`
Get monthly evolution metrics.

**Query Parameters**:
- `year` (optional): Year to filter (default: current year)
- `metric` (optional): Specific metric name

**Response**:
```json
{
  "months": ["Jan", "Feb", "Mar", ...],
  "values": [85, 87, 91, ...]
}
```

#### GET `/api/admin/metrics/por-embarcacao`
Get metrics by vessel.

**Response**:
```json
{
  "vessels": [
    {
      "id": "uuid",
      "name": "Vessel Name",
      "compliance_score": 95.5,
      "active_checklists": 8,
      "pending_tasks": 3
    }
  ]
}
```

#### GET `/api/admin/sgso`
Get SGSO (Safety Management System) data.

**Authorization**: Admin role required

**Response**:
```json
{
  "audits": [...],
  "practices": [...],
  "training_records": [...]
}
```

### Audit Routes

#### GET `/api/auditoria/resumo`
Get audit summary across all audits.

**Authorization**: Authenticated user

**Response**:
```json
{
  "total_audits": 45,
  "completed": 38,
  "in_progress": 7,
  "average_score": 92.3,
  "trends": {
    "improving": 28,
    "stable": 15,
    "declining": 2
  }
}
```

#### GET `/api/auditoria/tendencia`
Get audit trends over time.

**Query Parameters**:
- `period` (optional): `month`, `quarter`, `year` (default: `quarter`)

**Response**:
```json
{
  "labels": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
  "scores": [88.5, 90.2, 92.1, 93.8],
  "audit_counts": [12, 15, 10, 8]
}
```

#### GET `/api/auditoria/[id]/comentarios`
Get comments for a specific audit.

**Path Parameters**:
- `id`: Audit UUID

**Response**:
```json
{
  "comments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "John Doe",
      "comment": "Comment text",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/auditoria/[id]/export-comentarios-pdf`
Export audit comments as PDF.

**Path Parameters**:
- `id`: Audit UUID

**Response**: PDF file download

### BI (Business Intelligence) Routes

#### GET `/api/bi/conformidade`
Get compliance metrics for BI dashboard.

**Authorization**: Authenticated user

**Response**:
```json
{
  "overall_compliance": 94.5,
  "by_category": {
    "safety": 96.2,
    "operations": 93.8,
    "maintenance": 92.1
  },
  "trends": [...]
}
```

#### GET `/api/bi/jobs-trend`
Get jobs trend analysis.

**Query Parameters**:
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `component_id` (optional): Filter by component

**Response**:
```json
{
  "labels": ["Week 1", "Week 2", "Week 3", ...],
  "datasets": [
    {
      "label": "Completed",
      "data": [12, 15, 18, ...]
    },
    {
      "label": "Pending",
      "data": [5, 3, 2, ...]
    }
  ]
}
```

#### POST `/api/bi/export`
Export BI report as PDF or CSV.

**Request Body**:
```json
{
  "report_type": "compliance",
  "format": "pdf",
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  }
}
```

**Response**: File download

### DP Intelligence Routes

#### GET `/api/dp-intelligence/stats`
Get DP (Dynamic Positioning) intelligence statistics.

**Authorization**: Authenticated user

**Response**:
```json
{
  "total_incidents": 23,
  "by_severity": {
    "critical": 2,
    "high": 5,
    "medium": 10,
    "low": 6
  },
  "recent_incidents": [...]
}
```

#### POST `/api/dp-incidents/action`
Create or update DP incident action plan.

**Request Body**:
```json
{
  "incident_id": "uuid",
  "action": "Action description",
  "assigned_to": "user_id",
  "due_date": "2025-02-01"
}
```

#### PUT `/api/dp-incidents/update-status`
Update DP incident status.

**Request Body**:
```json
{
  "incident_id": "uuid",
  "status": "resolved",
  "resolution_notes": "Description of resolution"
}
```

### Forecast Routes

#### GET `/api/forecast/list`
List all forecast reports.

**Authorization**: Authenticated user

**Query Parameters**:
- `limit` (optional): Max results (default: 50)
- `offset` (optional): Pagination offset

**Response**:
```json
{
  "forecasts": [
    {
      "id": "uuid",
      "vessel_id": "uuid",
      "forecast_date": "2025-02-01",
      "predictions": {...},
      "confidence": 0.95
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Cron Routes

#### POST `/api/cron/send-real-forecast`
Trigger forecast report generation (automated).

**Authorization**: Service role key or cron secret

**Request Body**:
```json
{
  "force": false
}
```

**Response**:
```json
{
  "success": true,
  "reports_sent": 5,
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Dev/Testing Routes

#### POST `/api/dev/test-forecast-with-mock`
Test forecast generation with mock data (development only).

**Environment**: Development only

**Response**:
```json
{
  "success": true,
  "mock_data": {...}
}
```

## 🚀 Supabase Edge Functions

Nautilus One includes 80+ Supabase Edge Functions for serverless compute.

### Key Edge Functions

#### `send-assistant-report`
Send daily AI assistant report via email.

**Invocation**:
```bash
curl -L -X POST 'https://[project-ref].supabase.co/functions/v1/send-assistant-report' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"force": true}'
```

#### `jobs-forecast`
Generate jobs forecast using AI.

**Parameters**:
```json
{
  "component_id": "uuid",
  "forecast_days": 30
}
```

#### `ai-chat`
AI chat assistant for maritime operations.

**Parameters**:
```json
{
  "message": "User message",
  "context": {
    "vessel_id": "uuid",
    "conversation_id": "uuid"
  }
}
```

#### `generate-checklist`
AI-generated operational checklists.

**Parameters**:
```json
{
  "operation_type": "pre_departure",
  "vessel_id": "uuid",
  "custom_requirements": [...]
}
```

#### `monitor-cron-health`
Monitor health of scheduled cron jobs.

**Response**:
```json
{
  "healthy": true,
  "last_run": "2025-01-01T00:00:00Z",
  "failed_jobs": []
}
```

#### `dp-intel-analyze`
Analyze DP incidents using AI.

**Parameters**:
```json
{
  "incident_id": "uuid",
  "analysis_type": "root_cause"
}
```

### Function Categories

**AI & Intelligence** (20+ functions)
- `ai-chat`, `assistant-query`, `generate-ai-report`
- `crew-ai-insights`, `peotram-ai-analysis`
- `smart-insights-generator`

**Document Management** (10+ functions)
- `generate-document`, `process-document`, `rewrite-document`
- `generate-template`, `summarize-document`

**Communication** (8 functions)
- `send-assistant-report`, `send-forecast-report`
- `send-restore-dashboard`, `send-chart-report`
- `send-alerts`, `intelligent-notifications`

**Analytics & BI** (12+ functions)
- `dashboard-analytics`, `restore-analytics`
- `bi-jobs-by-component`, `jobs-forecast-by-component`
- `performance-monitor`

**Maintenance & Operations** (10+ functions)
- `mmi-copilot`, `mmi-jobs-similar`, `mmi-os-create`
- `check-certificate-expiry`, `simulate-hours`

**Cron & Monitoring** (5 functions)
- `monitor-cron-health`, `cron-status`
- `resend_pending_plans`, `check-price`

**External Integrations** (10+ functions)
- `amadeus-search`, `maritime-weather`, `fleet-tracking`
- `mapbox-token`, `weather-integration`

See `supabase/functions/` directory for complete list.

## 📝 Usage Examples

### Fetching Audit Data

```typescript
import { supabase } from '@/integrations/supabase/client';

async function getAuditSummary() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/auditoria/resumo', {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit summary');
  }
  
  return response.json();
}
```

### Calling Supabase Edge Function

```typescript
import { supabase } from '@/integrations/supabase/client';

async function generateChecklist(vesselId: string) {
  const { data, error } = await supabase.functions.invoke('generate-checklist', {
    body: {
      operation_type: 'pre_departure',
      vessel_id: vesselId,
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/admin/metrics', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/auth';
    return;
  }
  
  if (response.status === 403) {
    // Forbidden - show access denied message
    toast.error('Access denied');
    return;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('API error:', error);
  // Handle error
}
```

### Rate Limiting

API routes are protected by Vercel's rate limiting:
- **Default**: 100 requests per minute per IP
- **Admin routes**: 50 requests per minute per IP
- **Cron routes**: No limit (authenticated via service key)

## 🔒 Security Considerations

1. **Never expose tokens**
   ```typescript
   // ❌ Bad
   const token = 'hardcoded_token';
   
   // ✅ Good
   const { data: { session } } = await supabase.auth.getSession();
   const token = session?.access_token;
   ```

2. **Handle errors gracefully**
   - Don't expose internal error details to clients
   - Log errors server-side for debugging
   - Return generic error messages

3. **Validate input**
   - Use Zod schemas for validation
   - Sanitize user input
   - Check for required fields

4. **Use HTTPS only**
   - All API calls must use HTTPS in production
   - No sensitive data in URL parameters

## 📊 Monitoring

### API Logs
- **Vercel Logs**: View in Vercel dashboard
- **Supabase Logs**: View in Supabase dashboard
- **Sentry**: Error tracking and performance monitoring

### Metrics to Monitor
- Response times
- Error rates
- Authentication failures
- Rate limit hits

## 🚀 Deployment

API routes are automatically deployed with the application:
- **Platform**: Vercel
- **Region**: Auto (globally distributed)
- **Cold starts**: < 100ms
- **Max duration**: 10s (hobby), 60s (pro)

Edge Functions deployment:
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy ai-chat
```

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Vercel API Routes](https://vercel.com/docs/functions/serverless-functions)
- [SECURITY.md](./SECURITY.md) - Authentication and authorization details
