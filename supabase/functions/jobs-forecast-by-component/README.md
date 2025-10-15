# Jobs Forecast By Component API

## Overview

This Supabase Edge Function provides AI-powered forecasting for maintenance jobs grouped by component. It analyzes historical completion data and generates predictions for the next two months, identifying critical components that require attention.

## Endpoint

`POST /functions/v1/jobs-forecast-by-component`

## Functionality

The endpoint performs the following operations:

1. **Historical Data Collection**: Queries the `mmi_jobs` table for all completed jobs from the last 180 days
2. **Data Aggregation**: Groups jobs by `component_id` and extracts monthly completion trends (YYYY-MM format)
3. **AI-Powered Forecasting**: Sends aggregated data to OpenAI GPT-4 with specialized Portuguese prompts for maintenance analysis
4. **Critical Component Identification**: Returns forecasts highlighting components requiring immediate attention

## Technical Stack

- **Runtime**: Deno (Supabase Edge Functions)
- **Database**: Supabase PostgreSQL (`mmi_jobs` table)
- **AI Model**: OpenAI GPT-4 with temperature 0.4 for consistent, focused predictions
- **Language**: Portuguese (Brazilian) for domain-specific maintenance terminology

## Request

The endpoint doesn't require a request body. It automatically fetches and processes all completed jobs from the last 180 days.

```bash
curl -X POST https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/jobs-forecast-by-component \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Response

### Success Response (200)

```json
{
  "forecast": "Baseado nos dados históricos, prevê-se para os próximos dois meses:\n\n**Componente A**: Alta criticidade - aumento de 15% em falhas previsto...\n**Componente B**: Criticidade média - manutenção preventiva recomendada..."
}
```

### No Data Response (200)

```json
{
  "forecast": "Não há dados históricos suficientes para gerar uma previsão. Nenhum job foi completado nos últimos 180 dias."
}
```

### Error Response (500)

```json
{
  "error": "Error message",
  "timestamp": "2025-10-15T22:00:00.000Z"
}
```

## Environment Variables

Required environment variables (set via `supabase secrets set KEY=value`):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for database access
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 access

## Database Schema Requirements

The function expects the `mmi_jobs` table to have the following structure:

```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY,
  component_id UUID,
  status TEXT,
  completed_date DATE,
  -- other fields...
);
```

## Key Features

✅ Comprehensive error handling with detailed logging
✅ CORS support for cross-origin requests
✅ Schema-aware implementation (uses `completed_date` field per actual database schema)
✅ Follows existing project patterns for consistency
✅ Environment variable configuration for API keys and Supabase credentials
✅ Graceful handling when no historical data is available

## Integration

This endpoint complements the existing BI dashboard functionality, specifically the `bi-jobs-by-component` endpoint, by adding predictive analytics capabilities to the maintenance management system.

## Notes

- The implementation adapts the problem statement to match the project's Supabase Edge Functions architecture (vs Next.js API routes)
- Database field names corrected to match actual schema (`completed_date` instead of `completed_at`)
- Compatible with existing Supabase client patterns and authentication flow
- Uses GPT-4 with temperature 0.4 for more deterministic and focused predictions
- All prompts and responses are in Brazilian Portuguese for domain-specific maintenance terminology
