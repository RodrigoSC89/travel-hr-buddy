# Nauti One API Reference
## OpenAPI 3.0 Specification Summary

**Version:** 4.0.0  
**Base URL:** `https://vnbptmixvwropvanyhdb.supabase.co`  
**Last Updated:** 2026-01-23

---

## Authentication

All API requests require authentication via Supabase JWT tokens.

```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
  apiKeyAuth:
    type: apiKey
    in: header
    name: apikey
```

### Headers Required
```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

---

## Core Endpoints

### 1. Crew Management

#### GET /rest/v1/crew_members
List all crew members with optional filtering.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| select | string | No | Columns to return |
| status | string | No | Filter by status (active, inactive, on_leave) |
| vessel_id | uuid | No | Filter by vessel |
| limit | integer | No | Max records (default: 100) |

**Response 200:**
```json
[
  {
    "id": "uuid",
    "full_name": "string",
    "rank": "string",
    "nationality": "string",
    "status": "active|inactive|on_leave",
    "vessel_id": "uuid",
    "created_at": "timestamp"
  }
]
```

#### POST /rest/v1/crew_members
Create a new crew member.

**Request Body:**
```json
{
  "full_name": "string (required)",
  "rank": "string (required)",
  "nationality": "string",
  "email": "string",
  "phone": "string",
  "vessel_id": "uuid"
}
```

---

### 2. Vessel Management

#### GET /rest/v1/vessels
List all vessels in the fleet.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "imo_number": "string",
    "vessel_type": "string",
    "flag_state": "string",
    "status": "operational|maintenance|drydock",
    "current_position": {
      "lat": "number",
      "lng": "number"
    }
  }
]
```

---

### 3. Voyage Planning

#### GET /rest/v1/voyage_routes
Get voyage routes with waypoints.

#### POST /rest/v1/voyage_routes
Create new voyage route.

**Request Body:**
```json
{
  "vessel_id": "uuid (required)",
  "departure_port_id": "uuid (required)",
  "arrival_port_id": "uuid (required)",
  "departure_date": "timestamp",
  "eta": "timestamp",
  "waypoints": [
    {
      "lat": "number",
      "lng": "number",
      "name": "string"
    }
  ]
}
```

---

### 4. Compliance & Audits

#### GET /rest/v1/compliance_audits
List compliance audits.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| audit_type | string | mlc, stcw, ism, isps |
| status | string | pending, passed, failed |
| vessel_id | uuid | Filter by vessel |

---

### 5. Notifications

#### GET /rest/v1/notifications
Get user notifications.

#### POST /rest/v1/notifications
Create notification.

**Request Body:**
```json
{
  "user_id": "uuid (required)",
  "title": "string (required)",
  "message": "string (required)",
  "type": "string",
  "priority": "low|medium|high|critical"
}
```

---

## Edge Functions

### AI Endpoints

#### POST /functions/v1/nauti-brain
Main AI assistant endpoint.

**Request:**
```json
{
  "prompt": "string",
  "context": "object",
  "model": "gpt-4o|claude-3.5|gemini-2.5"
}
```

#### POST /functions/v1/ai-crew-optimizer
Optimize crew assignments.

#### POST /functions/v1/document-ocr
Extract text from documents using vision AI.

#### POST /functions/v1/voice-to-text
Convert audio to text (Whisper).

---

### Communication

#### POST /functions/v1/notify-slack
Send Slack notification.

```json
{
  "webhookUrl": "string",
  "text": "string",
  "channel": "string (optional)"
}
```

#### POST /functions/v1/twilio-send-whatsapp
Send WhatsApp message.

```json
{
  "to": "string (phone)",
  "message": "string"
}
```

#### POST /functions/v1/sendgrid-email
Send email via SendGrid.

```json
{
  "to": "string (email)",
  "subject": "string",
  "html": "string"
}
```

---

### Weather & Tracking

#### GET /functions/v1/maritime-weather
Get maritime weather forecast.

#### GET /functions/v1/ais-tracking
Real-time AIS vessel tracking.

#### GET /functions/v1/port-api
Port information and schedules.

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable - Validation error |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Auth endpoints | 10/min |
| AI endpoints | 30/min |
| Standard API | 100/min |
| Bulk operations | 10/min |

---

## Webhooks

### Outgoing Webhooks

Configure webhooks in `system_settings`:

```json
{
  "slack_webhook_url": "https://hooks.slack.com/...",
  "whatsapp_phone_id": "...",
  "email_from": "noreply@nautione.com"
}
```

### Incoming Webhooks

#### POST /functions/v1/stripe-webhook-handler
Handle Stripe payment events.

#### POST /functions/v1/docusign-send
Handle DocuSign signature events.

---

## SDK Usage

### JavaScript/TypeScript
```typescript
import { supabase } from "@/integrations/supabase/client";

// Query with types
const { data, error } = await supabase
  .from("crew_members")
  .select("*")
  .eq("status", "active");

// Call edge function
const { data } = await supabase.functions.invoke("nauti-brain", {
  body: { prompt: "Analyze crew schedule" }
});
```

---

## Changelog

### v4.0.0 (2026-01-23)
- Added 289 Edge Functions
- Implemented 7 AI agents
- Added webhook manager
- Full RLS on 581 tables

### v3.2.0 (2026-01-15)
- Added real-time vessel tracking
- Implemented MLC compliance checker
- Added voice commands

---

*Full OpenAPI YAML available at `/docs/api/openapi.yaml`*
