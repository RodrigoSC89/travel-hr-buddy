# Forecast Weekly - GPT-4 Powered Maintenance Forecasting

## Overview

The `forecast-weekly` Supabase Edge Function provides automated weekly maintenance forecasting using real GPT-4 intelligence. It analyzes historical maintenance execution data and generates intelligent predictions for upcoming maintenance needs.

## Features

✅ **Real GPT-4 Integration** - Uses OpenAI's GPT-4 model for intelligent analysis  
✅ **Historical Data Analysis** - Queries up to 5 previous executions from `mmi_logs`  
✅ **Risk Assessment** - Classifies forecasts as baixo, moderado, or alto risk  
✅ **Technical Justification** - Provides detailed reasoning in Portuguese  
✅ **Automated Work Orders** - Creates orders automatically for high-risk items  
✅ **Weekly Scheduling** - Runs every Sunday at 03:00 UTC via cron  

## How It Works

### 1. Query Historical Data

For each active maintenance job, the function queries execution history:

```typescript
const { data: historico } = await supabase
  .from('mmi_logs')
  .select('executado_em, status')
  .eq('job_id', job.id)
  .order('executado_em', { ascending: false })
  .limit(5);
```

### 2. Build Context for GPT-4

Creates a structured prompt with historical data:

```
Job: Inspeção da bomba de lastro
Últimas execuções:
- 2025-08-01 (executado)
- 2025-05-01 (executado)
- 2025-02-01 (executado)

Recomende a próxima execução e avalie o risco técnico com base no histórico.
```

### 3. Call GPT-4 API

```typescript
const gptPayload = {
  model: 'gpt-4',
  messages: [
    { 
      role: 'system', 
      content: 'Você é um engenheiro especialista em manutenção offshore.' 
    },
    { 
      role: 'user', 
      content: context 
    }
  ],
  temperature: 0.3
};
```

### 4. Parse Response

Extracts key information using regex:

- **Next Date**: `\d{4}-\d{2}-\d{2}`
- **Risk Level**: `risco:\s*(.+)`

### 5. Store Results

Saves forecasts to `mmi_forecasts` table and creates work orders for high-risk items.

## Environment Variables

Required environment variables in Supabase:

```
SUPABASE_URL              # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY # Service role key for database access
OPENAI_API_KEY            # OpenAI API key for GPT-4 access
```

## Cron Schedule

Configured in `supabase/config.toml`:

```toml
[functions.forecast-weekly]
  schedule = "0 3 * * 0"  # Every Sunday at 03:00 UTC
```

## Response Format

### Success Response

```json
{
  "success": true,
  "timestamp": "2025-10-20T03:00:00.000Z",
  "jobs_processed": 15,
  "forecasts_created": 15,
  "orders_created": 4,
  "forecast_summary": {
    "high_risk": 4,
    "moderate_risk": 10,
    "low_risk": 1
  },
  "forecasts": [
    {
      "job_id": "uuid-123",
      "job_title": "Inspeção da bomba de lastro",
      "risco_estimado": "alto",
      "proxima_execucao": "2025-11-01",
      "justificativa": "Intervalo se manteve constante...",
      "historico_analisado": 3
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-10-20T03:00:00.000Z"
}
```

## Database Tables

### Input Tables

- **mmi_jobs** - Source of active maintenance jobs
- **mmi_logs** - Historical execution data

### Output Tables

- **mmi_forecasts** - Stores generated forecasts
- **mmi_orders** - Stores automatically created work orders

## Testing

### Manual Invocation

```bash
supabase functions invoke forecast-weekly
```

### Testing with curl

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/forecast-weekly' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## Cost Estimation

- Per job: ~$0.01-0.03 (GPT-4 API cost)
- Weekly run (50 jobs): ~$0.50-1.50
- Annual cost: ~$25-75

## Deployment

1. **Deploy the function**:
   ```bash
   supabase functions deploy forecast-weekly
   ```

2. **Set environment variables** in Supabase Dashboard:
   - Go to Settings → Edge Functions → Secrets
   - Add `OPENAI_API_KEY`

3. **Verify cron schedule**:
   - Check Supabase Dashboard → Edge Functions → Crons

4. **Monitor execution**:
   - View logs in Supabase Dashboard → Edge Functions → Logs

## Troubleshooting

### No forecasts generated

- Check if there are active jobs in `mmi_jobs` with status `pending` or `in_progress`
- Verify `OPENAI_API_KEY` is set correctly
- Check function logs for specific errors

### GPT-4 API errors

- Verify API key is valid and has sufficient credits
- Check OpenAI API status
- Review rate limits

### Database errors

- Ensure `mmi_logs` table exists
- Verify RLS policies allow service role access
- Check database connection

## Related Functions

- **send-forecast-report** - Sends email reports with GPT-4 forecasts
- **send-real-forecast** - Alternative forecast distribution method

## Documentation

- [ETAPA_8_COMPLETE.md](../../../ETAPA_8_COMPLETE.md) - Complete implementation guide
- [MMI_FORECAST_GPT4_IMPLEMENTATION.md](../../../MMI_FORECAST_GPT4_IMPLEMENTATION.md) - Detailed implementation
- [MMI_FORECAST_WEEKLY_README.md](../../../MMI_FORECAST_WEEKLY_README.md) - Original documentation

## Support

For issues or questions, refer to the main project documentation or contact the development team.
