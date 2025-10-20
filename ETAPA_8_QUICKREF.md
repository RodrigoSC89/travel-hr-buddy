# Etapa 8 - Quick Reference Guide

## 🚀 Quick Start

### 1. Deploy Database Migration
```bash
supabase db push
```

### 2. Deploy Edge Function
```bash
supabase functions deploy forecast-weekly
```

### 3. Configure API Key
```bash
# Supabase Dashboard > Settings > Edge Functions > Secrets
OPENAI_API_KEY=sk-...
```

### 4. Test Function
```bash
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/forecast-weekly \
  -H "Authorization: Bearer <anon-key>"
```

## 📋 Tables

### mmi_logs
```sql
job_id            UUID      -- Reference to mmi_jobs
executado_em      TIMESTAMP -- When executed
status            TEXT      -- executado, falha, adiado, cancelado
observacoes       TEXT      -- Technical notes
duracao_minutos   INTEGER   -- Duration in minutes
```

### Query Example
```sql
-- Get job history
SELECT * FROM mmi_logs 
WHERE job_id = 'your-job-id'
ORDER BY executado_em DESC
LIMIT 5;
```

## 🤖 GPT-4 Configuration

```typescript
{
  model: 'gpt-4',
  temperature: 0.3,
  messages: [
    { 
      role: 'system', 
      content: 'Você é um engenheiro especialista em manutenção offshore.'
    },
    { 
      role: 'user', 
      content: context // Job + history
    }
  ]
}
```

## 📊 Response Format

```json
{
  "success": true,
  "forecasts": [
    {
      "job_id": "uuid",
      "job_nome": "Inspeção da bomba",
      "data_sugerida": "2025-11-01",
      "risco": "alto",
      "justificativa": "Análise técnica...",
      "historico_analisado": 3
    }
  ],
  "summary": {
    "jobs_processed": 10,
    "forecasts_generated": 10,
    "errors": 0
  }
}
```

## 🔍 Risk Levels

| Level | Portuguese | When to Use |
|-------|-----------|-------------|
| Low | `baixo` | Normal schedule, no concerns |
| Medium | `moderado` | Monitor closely, standard priority |
| High | `alto` | Urgent, potential failure risk |

## ⚙️ Scheduling

### Weekly Cron (Monday 6 AM UTC)
```sql
SELECT cron.schedule(
  'forecast-weekly',
  '0 6 * * 1',
  $$
    SELECT net.http_post(
      url:='https://<ref>.supabase.co/functions/v1/forecast-weekly',
      headers:='{"Authorization": "Bearer <key>"}'::jsonb
    );
  $$
);
```

## 📝 Monitoring

### Check Logs
```sql
SELECT * FROM cron_execution_logs 
WHERE function_name = 'forecast-weekly'
ORDER BY created_at DESC;
```

### Performance Metrics
- **Jobs per execution**: Up to 50
- **History per job**: Up to 5 records
- **Execution time**: 2-5 minutes
- **Cost per job**: ~$0.01-0.03

## 🧪 Testing

```bash
# Run tests
npm test -- forecast-weekly

# Expected: 9/9 passing ✓
```

## 🔗 Integration Snippets

### Create Work Order
```typescript
await supabase.from('mmi_os').insert({
  job_id: forecast.job_id,
  scheduled_date: forecast.data_sugerida,
  priority: forecast.risco === 'alto' ? 'high' : 'medium',
  notes: forecast.justificativa
});
```

### Get High Risk
```typescript
const { forecasts } = await response.json();
const highRisk = forecasts.filter(f => f.risco === 'alto');
```

### Send Alert
```typescript
if (forecast.risco === 'alto') {
  await sendEmail({
    to: 'team@company.com',
    subject: `⚠️ ${forecast.job_nome}`,
    body: forecast.justificativa
  });
}
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `OPENAI_API_KEY not configured` | Add key in Supabase Secrets |
| `No active jobs found` | Check mmi_jobs table has pending jobs |
| `OpenAI API error: 429` | Rate limit reached, wait or upgrade plan |
| `No forecasts generated` | Check mmi_logs has historical data |

## 📚 Documentation

- Full docs: `ETAPA_8_IMPLEMENTATION_COMPLETE.md`
- Function README: `supabase/functions/forecast-weekly/README.md`
- Tests: `tests/forecast-weekly.test.ts`

## ✅ Checklist

- [ ] Database migration applied
- [ ] Edge function deployed
- [ ] OPENAI_API_KEY configured
- [ ] Test data inserted in mmi_logs
- [ ] Function tested manually
- [ ] Cron schedule configured
- [ ] Monitoring dashboard set up
- [ ] Team notified

## 🎯 Key Features

✅ Real GPT-4 analysis
✅ Historical pattern detection
✅ Risk assessment
✅ Technical justifications
✅ Automated scheduling
✅ Complete logging
✅ Error handling
✅ Batch processing

---

**Need Help?** See full documentation in `ETAPA_8_IMPLEMENTATION_COMPLETE.md`
