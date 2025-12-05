# 📚 API Reference

## Overview

Complete API documentation for Nautilus One.

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:54321/functions/v1` |
| Staging | `https://staging-api.nautilus.app/functions/v1` |
| Production | `https://api.nautilus.app/functions/v1` |

## Authentication

All API requests require authentication via JWT token.

```typescript
// Header format
Authorization: Bearer <jwt_token>
```

## Edge Functions

### AI Engine

**POST** `/ai-engine`

Process AI requests for document analysis, insights, etc.

```typescript
// Request
{
  "type": "analyze" | "summarize" | "extract",
  "content": string,
  "context": object
}

// Response
{
  "success": boolean,
  "result": object,
  "tokens_used": number
}
```

### Compliance Analyzer

**POST** `/compliance-analyzer`

Analyze compliance status for vessels/crew.

```typescript
// Request
{
  "vessel_id": string,
  "check_types": string[]
}

// Response
{
  "compliant": boolean,
  "issues": Issue[],
  "recommendations": string[]
}
```

### Send Email

**POST** `/send-email`

Send transactional emails.

```typescript
// Request
{
  "to": string,
  "subject": string,
  "template": string,
  "data": object
}

// Response
{
  "success": boolean,
  "message_id": string
}
```

## REST Endpoints

### Crew Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crew` | List all crew |
| GET | `/crew/:id` | Get crew member |
| POST | `/crew` | Create crew member |
| PUT | `/crew/:id` | Update crew member |
| DELETE | `/crew/:id` | Delete crew member |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents` | List documents |
| GET | `/documents/:id` | Get document |
| POST | `/documents` | Upload document |
| DELETE | `/documents/:id` | Delete document |

### Vessels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vessels` | List vessels |
| GET | `/vessels/:id` | Get vessel |
| POST | `/vessels` | Create vessel |
| PUT | `/vessels/:id` | Update vessel |

## Error Handling

```typescript
// Error response format
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": object
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input |
| `RATE_LIMITED` | Too many requests |

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| General API | 100/min |
| AI Endpoints | 30/min |
| Auth | 10/min |
| Upload | 20/min |

## Webhooks

Configure webhooks in Settings → Integrations.

### Events

- `crew.created`
- `crew.updated`
- `document.uploaded`
- `compliance.alert`

### Payload Format

```typescript
{
  "event": string,
  "timestamp": string,
  "data": object,
  "signature": string
}
```
