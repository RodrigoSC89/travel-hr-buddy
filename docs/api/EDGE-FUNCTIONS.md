# 🔌 Nautilus One - Edge Functions API Reference

> Auto-generated documentation for Supabase Edge Functions

## Overview

Nautilus One uses Supabase Edge Functions for serverless backend operations including AI processing, external API integrations, and real-time data processing.

**Base URL:** `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1`

---

## 🤖 AI & Machine Learning

### `nautilus-predict`
AI-powered predictions for maintenance, crew scheduling, and risk analysis.

**Method:** `POST`

**Request:**
```json
{
  "type": "maintenance" | "crew" | "risk" | "weather",
  "data": {
    "vesselId": "string",
    "timeframe": "7d" | "30d" | "90d"
  }
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [...],
  "confidence": 0.85,
  "model": "gpt-4o"
}
```

---

### `voice-to-text`
Transcribes audio to text using AssemblyAI.

**Method:** `POST`

**Request:** `multipart/form-data` with audio file

**Response:**
```json
{
  "success": true,
  "text": "Transcribed content...",
  "language": "pt-BR"
}
```

---

### `process-document`
AI-powered document analysis and extraction.

**Method:** `POST`

**Request:**
```json
{
  "documentUrl": "string",
  "type": "certificate" | "contract" | "invoice"
}
```

**Response:**
```json
{
  "success": true,
  "extracted": {
    "fields": {...},
    "entities": [...],
    "summary": "..."
  }
}
```

---

## 🌊 Maritime & Weather

### `stormglass-weather`
Marine weather, tides, waves, and oceanographic data.

**Method:** `POST`

**Request:**
```json
{
  "action": "weather" | "tide" | "astronomy" | "bio",
  "lat": -23.55,
  "lng": -46.63,
  "start": "2025-01-01",
  "end": "2025-01-07"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hours": [...],
    "meta": {...}
  },
  "source": "stormglass"
}
```

---

### `noaa-earthquake`
Earthquake and seismic data from USGS.

**Method:** `POST`

**Request:**
```json
{
  "type": "all_day" | "significant_week" | "significant_month",
  "minMagnitude": 4.0
}
```

**Response:**
```json
{
  "success": true,
  "earthquakes": [...],
  "count": 42
}
```

---

### `windy-forecast`
Windy weather forecasts for maritime operations.

**Method:** `POST`

**Request:**
```json
{
  "lat": -23.55,
  "lng": -46.63,
  "model": "gfs" | "ecmwf"
}
```

---

## ✈️ Travel & Logistics

### `amadeus-search`
Flight and hotel search via Amadeus API.

**Method:** `POST`

**Request:**
```json
{
  "action": "flight-search" | "hotel-search",
  "origin": "GRU",
  "destination": "MIA",
  "departureDate": "2025-03-15",
  "adults": 1
}
```

**Response:**
```json
{
  "success": true,
  "offers": [...],
  "currency": "USD"
}
```

---

## 📧 Communication

### `send-email`
Send emails via Resend.

**Method:** `POST`

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Notification",
  "html": "<p>Email content</p>",
  "template": "crew-notification" // optional
}
```

---

### `send-notification`
Multi-channel notifications (email, push, SMS).

**Method:** `POST`

**Request:**
```json
{
  "userId": "uuid",
  "channel": "email" | "push" | "sms",
  "title": "Alert",
  "body": "Message content"
}
```

---

## 📊 Analytics & Monitoring

### `monitor-cron-health`
Monitors scheduled tasks and alerts on failures.

**Method:** `POST` (typically called by scheduler)

---

### `daily-risk-analysis`
Scheduled risk analysis for all vessels.

**Method:** `POST`

---

## 🔐 Authentication

Most endpoints require authentication via:
- `Authorization: Bearer <supabase-jwt>`
- `apikey: <anon-key>`

Public endpoints (marked `verify_jwt = false`):
- `stormglass-weather`
- `noaa-earthquake`

---

## 📋 Common Response Format

All endpoints follow this structure:

```typescript
interface BaseResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}
```

---

## 🔧 CORS Headers

All functions include:
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}
```

---

## 📈 Rate Limiting

- Default: 10 requests/minute per IP
- Authenticated users: 100 requests/minute
- AI endpoints: 20 requests/minute

---

*Last updated: 2025-12-28*
