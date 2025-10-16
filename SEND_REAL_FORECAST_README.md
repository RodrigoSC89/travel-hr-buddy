# Send Real Forecast API Endpoint

## Overview
The `send-real-forecast.ts` API endpoint generates AI-powered maintenance forecasts and sends them via email. This endpoint is designed to be triggered by a cron job for automated reporting.

## Endpoint Details

**Path:** `/pages/api/cron/send-real-forecast.ts`

**Method:** Any (GET, POST, etc.)

**Response Format:** JSON

## What It Does

1. **Fetches Jobs**: Retrieves all jobs from the last 180 days from the `jobs` table
2. **Generates AI Forecast**: Uses GPT-4 to analyze the data and predict potential failures by component
3. **Saves to History**: Stores the forecast in the `forecast_history` table
4. **Sends Email**: Dispatches the forecast report via email using Resend API

## Requirements

### Environment Variables

```bash
# Required for API functionality
VITE_OPENAI_API_KEY=sk-proj-...          # OpenAI API key for GPT-4
RESEND_API_KEY=re_...                     # Resend API key for email
EMAIL_FROM=noreply@nautilus.system        # Optional: Default sender email

# Required for Supabase connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Database Setup

1. **Run the migration** to create the `forecast_history` table:
   ```bash
   # The migration is located at:
   # supabase/migrations/20251016022125_create_forecast_history.sql
   ```

2. **Table Schema:**
   ```sql
   CREATE TABLE public.forecast_history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     forecast_summary TEXT NOT NULL,
     source VARCHAR(100) DEFAULT 'manual',
     created_by VARCHAR(255) DEFAULT 'system',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

### Dependencies

All required packages are already installed:
- `openai` (v6.3.0) - For GPT-4 API access
- `@supabase/supabase-js` - For database operations
- `next` - For Next.js API types

## Usage

### Manual Trigger (for testing)

You can test the endpoint by making a request to it:

```bash
# Using curl
curl -X POST http://localhost:8080/api/cron/send-real-forecast

# Or in your browser
http://localhost:8080/api/cron/send-real-forecast
```

### Automated Cron Job

Set up a cron job or scheduled task to trigger this endpoint automatically:

#### Option 1: Vercel Cron (if deployed on Vercel)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-real-forecast",
      "schedule": "0 9 * * MON"
    }
  ]
}
```

#### Option 2: External Cron Service (cron-job.org, etc.)

Schedule a GET/POST request to:
```
https://your-domain.com/api/cron/send-real-forecast
```

#### Option 3: Supabase Edge Functions

You can also migrate this to a Supabase Edge Function for better integration.

## Response Format

### Success Response (200)

```json
{
  "ok": true,
  "count": 42,
  "message": "Forecast generated and sent successfully"
}
```

### Error Response (500)

```json
{
  "error": "Internal server error",
  "message": "Failed to generate forecast"
}
```

Or:

```json
{
  "error": "Erro ao buscar dados dos jobs."
}
```

## Email Configuration

The forecast email is sent to:
- **Recipient:** `engenharia@nautilus.system`
- **Subject:** `📊 Previsão de Falhas (Produção)`
- **Content:** AI-generated forecast text

To change the recipient, edit line 68 in `send-real-forecast.ts`:

```typescript
await resendEmail({
  to: "your-email@domain.com", // Change this
  subject: "📊 Previsão de Falhas (Produção)",
  text: summary,
});
```

## Modules Created

### 1. OpenAI Client (`lib/openai/index.ts`)

Exports an authenticated OpenAI client for server-side use:

```typescript
import { openai } from '@/lib/openai';

// Use in your API routes
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Your prompt' }],
});
```

### 2. Email Service (`lib/email/sendForecastEmail.ts`)

Provides `resendEmail` function for sending emails:

```typescript
import { resendEmail } from '@/lib/email/sendForecastEmail';

await resendEmail({
  to: 'recipient@example.com',
  subject: 'Subject Line',
  text: 'Email body text',
  html: '<p>Optional HTML body</p>', // Optional
});

// Multiple recipients
await resendEmail({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Subject',
  text: 'Message',
});
```

## Testing

Run the test suite:

```bash
npm run test src/tests/send-real-forecast.test.ts
```

All 25 tests should pass, covering:
- OpenAI client module
- Email service module
- API endpoint functionality
- AI prompt generation
- Database integration
- Error handling

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution:** Set the `VITE_OPENAI_API_KEY` environment variable

### Issue: "RESEND_API_KEY is not configured"
**Solution:** Set the `RESEND_API_KEY` environment variable

### Issue: "Erro ao buscar dados dos jobs"
**Solution:** Check Supabase connection and ensure the `jobs` table exists

### Issue: "Failed to save forecast history"
**Solution:** Verify the `forecast_history` table migration has been run

## Security Notes

- The endpoint has no authentication by default. Consider adding authentication middleware for production use.
- Environment variables are stored securely and not exposed to the client.
- RLS policies are enabled on the `forecast_history` table for data security.

## Future Improvements

Consider adding:
1. Authentication/Authorization checks
2. Rate limiting
3. Configurable time ranges (not just 180 days)
4. Multiple email templates
5. Webhook notifications
6. Scheduled report customization via admin panel

## Related Files

- API Endpoint: `pages/api/cron/send-real-forecast.ts`
- OpenAI Module: `lib/openai/index.ts`
- Email Module: `lib/email/sendForecastEmail.ts`
- Database Migration: `supabase/migrations/20251016022125_create_forecast_history.sql`
- TypeScript Types: `src/integrations/supabase/types.ts`
- Tests: `src/tests/send-real-forecast.test.ts`
