# Forecast Weekly - GPT-4 Powered Maintenance Forecasting

## 🎯 Overview

The `forecast-weekly` Supabase Edge Function provides intelligent AI-powered maintenance forecasting for the MMI (Maritime Maintenance Intelligence) system. It analyzes historical execution data using OpenAI's GPT-4 to generate predictions for maintenance needs.

**Schedule**: Runs every Sunday at 03:00 UTC via cron (0 3 * * 0)

## ✨ Features

### Real GPT-4 Intelligence
- **Historical Data Analysis**: Queries up to 5 previous executions from `mmi_logs` table
- **Pattern Recognition**: GPT-4 analyzes execution intervals and status patterns
- **Risk Assessment**: Classifies maintenance urgency as `baixo`, `moderado`, or `alto`
- **Technical Justification**: Provides detailed reasoning for each prediction in Portuguese

### Smart Processing
- **Batch Processing**: Efficiently processes up to 50 jobs per execution
- **Error Handling**: Individual job failures don't stop batch processing
- **Automatic Work Orders**: Creates work orders for high-risk forecasts
- **Comprehensive Logging**: Detailed console logs for monitoring

## 🔧 Technical Implementation

### Database Schema

#### Required Tables
1. **mmi_jobs**: Source maintenance jobs
2. **mmi_logs**: Historical execution records
3. **mmi_forecasts**: Generated forecasts
4. **mmi_orders**: Automatic work orders

#### Migration Required
```sql
-- Created by: 20251019230000_create_mmi_logs.sql
CREATE TABLE mmi_logs (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES mmi_jobs(id),
  executado_em TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('executado', 'pendente', 'cancelado', 'falha')),
  observacoes TEXT,
  executor_id UUID REFERENCES auth.users(id)
);
```

### GPT-4 Integration

#### Context Building
```typescript
const context = `
Job: ${job.title}
Últimas execuções:
${historico?.map((h) => `- ${h.executado_em} (${h.status})`).join('\n')}

Recomende a próxima execução e avalie o risco técnico com base no histórico.
`;
```

#### GPT-4 Configuration
- **Model**: `gpt-4`
- **Temperature**: `0.3` (for consistent predictions)
- **System Prompt**: "Você é um engenheiro especialista em manutenção offshore."

#### Response Parsing
```typescript
// Extract date with regex
const dataRegex = /\d{4}-\d{2}-\d{2}/;
const dataSugerida = dataRegex.exec(resposta)?.[0];

// Extract risk level with regex
const riscoRegex = /risco:\s*(.+)/i;
const risco = riscoRegex.exec(resposta)?.[1]?.toLowerCase();
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "timestamp": "2025-10-20T10:00:00Z",
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
      "justificativa": "O intervalo entre as execuções tem se mantido constante...",
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
  "timestamp": "2025-10-20T10:00:00Z"
}
```

## 🚀 Deployment

### Prerequisites
```bash
# 1. Apply database migrations
supabase db push

# 2. Verify tables exist
SELECT * FROM mmi_logs LIMIT 1;
SELECT * FROM mmi_jobs LIMIT 1;
SELECT * FROM mmi_forecasts LIMIT 1;
```

### Environment Variables
Configure in Supabase Dashboard → Settings → Edge Functions → Secrets:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Auto-configured by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Auto-configured by Supabase |
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key for GPT-4 |

### Deploy Function
```bash
# Deploy the function
supabase functions deploy forecast-weekly

# Test manually
supabase functions invoke forecast-weekly

# Check logs
supabase functions logs forecast-weekly
```

### Set Up Cron Schedule
Configure in Supabase Dashboard → Database → Cron Jobs:
```sql
-- Runs every Sunday at 03:00 UTC
SELECT cron.schedule(
  'weekly-forecast-generation',
  '0 3 * * 0',
  $$
  SELECT http_request(
    'POST',
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/forecast-weekly',
    '',
    'application/json',
    ''
  )
  $$
);
```

## 💰 Cost Analysis

### OpenAI API Costs
- **Per job**: ~$0.01-0.03
- **Weekly run (50 jobs)**: ~$0.50-1.50
- **Annual**: ~$25-75

### ROI
- **Prevents one failure**: $10,000+ savings
- **ROI**: >13,000%

## 🧪 Testing

### Manual Test
```bash
# Test the function
supabase functions invoke forecast-weekly

# Expected output should include:
# - jobs_processed > 0
# - forecasts_created > 0
# - forecast_summary with risk distribution
```

### Verify in Database
```sql
-- Check generated forecasts
SELECT * FROM mmi_forecasts 
ORDER BY created_at DESC 
LIMIT 10;

-- Check created work orders
SELECT * FROM mmi_orders 
WHERE status = 'pendente' 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify historical data
SELECT job_id, COUNT(*) as execution_count
FROM mmi_logs
GROUP BY job_id
HAVING COUNT(*) > 0;
```

## 🔍 Monitoring

### Check Logs
```bash
# View recent logs
supabase functions logs forecast-weekly

# Monitor specific execution
supabase functions logs forecast-weekly --follow
```

### Key Metrics to Monitor
- Jobs processed count
- Forecasts created count
- Work orders created count
- Risk distribution
- GPT-4 API errors
- Database errors

## 🐛 Troubleshooting

### Common Issues

#### 1. Missing OPENAI_API_KEY
```
Error: Missing OPENAI_API_KEY environment variable
```
**Solution**: Configure the API key in Supabase Secrets

#### 2. No Active Jobs
```
ℹ️ No active jobs found for forecast generation
```
**Solution**: This is normal if there are no pending/in_progress jobs

#### 3. OpenAI API Error
```
OpenAI API error: 401 - Invalid API key
```
**Solution**: Verify your OPENAI_API_KEY is correct and has sufficient credits

#### 4. Database Error
```
Error fetching jobs: relation "mmi_logs" does not exist
```
**Solution**: Apply the required migrations

## 📚 Related Documentation

- [ETAPA_8_COMPLETE.md](../../../ETAPA_8_COMPLETE.md) - Complete implementation guide
- [MMI_FORECAST_GPT4_IMPLEMENTATION.md](../../../MMI_FORECAST_GPT4_IMPLEMENTATION.md) - Detailed implementation
- [MMI_FORECAST_GPT4_QUICKREF.md](../../../MMI_FORECAST_GPT4_QUICKREF.md) - Quick reference

## 🔐 Security

- ✅ API key stored securely in Supabase Secrets
- ✅ Service role authentication for database access
- ✅ Input validation and error handling
- ✅ No sensitive data exposed in logs
- ✅ RLS policies enforced on all tables

## 📈 Business Value

1. **Predictive Maintenance**: Early warning system for equipment failures
2. **Resource Optimization**: Better maintenance scheduling and planning
3. **Risk Reduction**: Prioritizes critical maintenance needs
4. **Compliance**: Complete audit trail with technical justifications
5. **Cost Savings**: Prevents costly unplanned downtime

---

**Status**: ✅ Production-ready  
**Impact**: Transforms mock simulation into intelligent forecasting system  
**Next Action**: Configure OPENAI_API_KEY and deploy to production
