# 🔌 Edge Functions API Reference

> Complete API documentation for all Supabase Edge Functions

---

## 📋 Overview

Nauti One v4.0 includes 300+ Edge Functions organized by domain:

| Category | Functions | Description |
|----------|-----------|-------------|
| AI | 16+ | AI chat, analysis, predictions |
| CRUD | 100+ | Create, Read, Update, Delete |
| Analytics | 40+ | Reports, metrics, dashboards |
| Integrations | 50+ | External APIs, webhooks |
| Utilities | 100+ | Helpers, validators, formatters |

---

## 🤖 AI Functions

### nauti-brain

Main AI orchestrator with multi-provider support.

**Endpoint:** `POST /functions/v1/nauti-brain`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Qual é o status da frota?" }
  ],
  "context": {
    "module": "fleet",
    "vesselId": "uuid"
  }
}
```

**Response:**
```json
{
  "response": "A frota está operando normalmente...",
  "confidence": 0.95,
  "sources": ["fleet_data", "weather_api"],
  "tokens": { "input": 150, "output": 200 }
}
```

**Features:**
- Multi-LLM consensus (OpenAI + Claude + Gemini)
- Rate limiting: 10 req/min
- Audit logging to `ai_audit_logs`

---

### peotram-ai-chat

PEOTRAM audit specialist assistant.

**Endpoint:** `POST /functions/v1/peotram-ai-chat`

**Request:**
```json
{
  "message": "Gerar evidência para elemento 1.1",
  "auditId": "uuid",
  "element": "1.1"
}
```

**Response:**
```json
{
  "evidence": "Baseado na análise...",
  "recommendations": ["Ação 1", "Ação 2"],
  "complianceScore": 85
}
```

---

### crew-ai-copilot

Crew management AI assistant.

**Endpoint:** `POST /functions/v1/crew-ai-copilot`

**Request:**
```json
{
  "query": "Quais tripulantes têm certificados expirando?",
  "vesselId": "uuid"
}
```

---

### voyage-ai

Route optimization and voyage planning.

**Endpoint:** `POST /functions/v1/voyage-ai`

**Request:**
```json
{
  "origin": { "lat": -23.5, "lng": -46.6 },
  "destination": { "lat": 51.5, "lng": -0.1 },
  "vesselType": "tanker"
}
```

---

## 📦 CRUD Functions

### Generic Pattern

All CRUD functions follow this pattern:

**Create:** `POST /functions/v1/{resource}`
```json
{
  "data": { "field1": "value1", "field2": "value2" }
}
```

**Read:** `GET /functions/v1/{resource}?id={id}`

**Update:** `PUT /functions/v1/{resource}`
```json
{
  "id": "uuid",
  "data": { "field1": "new_value" }
}
```

**Delete:** `DELETE /functions/v1/{resource}?id={id}`

### Available Resources

| Resource | Endpoint | Operations |
|----------|----------|------------|
| crews | `/functions/v1/crews` | CRUD |
| vessels | `/functions/v1/vessels` | CRUD |
| documents | `/functions/v1/documents` | CRUD |
| audits | `/functions/v1/audits` | CRUD |
| maintenance | `/functions/v1/maintenance` | CRUD |
| payroll | `/functions/v1/payroll` | CRUD |

---

## 📊 Analytics Functions

### generate-report

Generate PDF/Excel reports.

**Endpoint:** `POST /functions/v1/generate-report`

**Request:**
```json
{
  "reportType": "crew_status",
  "format": "pdf",
  "filters": {
    "vesselId": "uuid",
    "dateRange": { "start": "2025-01-01", "end": "2025-01-31" }
  }
}
```

---

### dashboard-metrics

Get dashboard KPIs.

**Endpoint:** `GET /functions/v1/dashboard-metrics`

**Response:**
```json
{
  "fleet": { "total": 15, "active": 12, "maintenance": 3 },
  "crew": { "total": 450, "onboard": 380, "onshore": 70 },
  "compliance": { "score": 94, "pendingItems": 12 }
}
```

---

## 🔒 Authentication

All Edge Functions require authentication:

```typescript
const { data } = await supabase.functions.invoke('function-name', {
  body: { /* request body */ },
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
});
```

---

## ⚡ Rate Limiting

| Function Type | Limit | Window |
|---------------|-------|--------|
| AI Functions | 10 req | 1 min |
| CRUD | 100 req | 1 min |
| Analytics | 20 req | 1 min |
| Reports | 5 req | 1 min |

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Error - Server error |

**Error Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait 60 seconds.",
    "retryAfter": 60
  }
}
```

---

## 📝 Audit Logging

All AI functions log to `ai_audit_logs`:

```sql
SELECT * FROM ai_audit_logs
WHERE user_id = 'uuid'
ORDER BY created_at DESC
LIMIT 100;
```

Fields logged:
- `user_input` - User's query
- `ai_response` - AI's response
- `tokens_input` / `tokens_output`
- `response_time_ms`
- `model_provider`
- `confidence_score`

---

*Last Updated: January 2026*
