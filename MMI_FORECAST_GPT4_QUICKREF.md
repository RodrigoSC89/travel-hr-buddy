# MMI Forecast GPT-4 - Quick Reference

## 🚀 Quick Start

### Environment Variables
```bash
OPENAI_API_KEY=sk-...              # Required: GPT-4 API access
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
FORECAST_REPORT_EMAILS=eng@nautilus.system,admin@nautilus.system
EMAIL_FROM=noreply@nautilus.system
```

### Database Tables

**mmi_logs** - Execution history:
```sql
job_id | executado_em | status | observacoes
-------|--------------|--------|-------------
uuid   | 2025-08-01   | executado | "OK"
```

**mmi_forecasts** - AI predictions:
```sql
vessel_name | system_name | forecast_text | priority
------------|-------------|---------------|----------
"Navio A"   | "Bomba X"   | "Reasoning"   | high
```

## 🧠 GPT-4 Prompt Template

```typescript
Job: ${job.title}
Últimas execuções:
${historico?.map((h) => `- ${h.executado_em} (${h.status})`).join('\n')}

Recomende a próxima execução e avalie o risco técnico com base no histórico.
```

## 📊 Response Format

GPT-4 returns text with:
- Date: `2025-11-01` (extracted via regex: `/\d{4}-\d{2}-\d{2}/`)
- Risk: `risco: alto` (extracted via regex: `/risco:\s*(.+)/i`)
- Reasoning: Full text explanation

## 🔄 Workflow

1. **Fetch** active jobs from `mmi_jobs` (status: pending/in_progress)
2. **Query** last 5 executions from `mmi_logs` per job
3. **Send** context to GPT-4 with structured prompt
4. **Parse** response to extract date, risk, reasoning
5. **Save** forecast to `mmi_forecasts` table
6. **Email** HTML report to recipients

## 📧 Email Output

```html
🔮 Previsão Semanal de Manutenção - GPT-4

Job: Inspeção da bomba de lastro
📆 Próxima execução: 2025-11-01
⚠️ Risco: ALTO
🧠 Justificativa: Sistema reportou falha...
```

## 🧪 Testing

Run tests:
```bash
npm test -- send-forecast-report
```

Expected: ✅ 22 tests passing

## 📅 Cron Schedule

**Weekly execution**: Every Monday at 06:00 UTC
```yaml
schedule: "0 6 * * 1"
```

## 🔍 Manual Testing

Invoke function via Supabase dashboard or curl:
```bash
curl -X POST https://xxx.supabase.co/functions/v1/send-forecast-report \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251019230000_create_mmi_logs.sql` | Create logs table |
| `supabase/migrations/20251019230001_seed_mmi_logs.sql` | Seed sample data |
| `supabase/functions/send-forecast-report/index.ts` | Main function |
| `src/tests/send-forecast-report.test.ts` | Test suite |
| `MMI_FORECAST_GPT4_IMPLEMENTATION.md` | Full docs |

## ⚠️ Common Issues

**Issue**: No forecasts generated
- **Fix**: Check if mmi_jobs table has active jobs (pending/in_progress status)

**Issue**: "OPENAI_API_KEY is not configured"
- **Fix**: Set environment variable in Supabase Edge Function settings

**Issue**: No execution history
- **Fix**: Ensure mmi_logs table exists and has data linked to mmi_jobs

**Issue**: Email not sent
- **Fix**: Verify RESEND_API_KEY and EMAIL_FROM are configured

## 🎯 Production Checklist

- [ ] Deploy migrations: `20251019230000_create_mmi_logs.sql`
- [ ] Deploy migrations: `20251019230001_seed_mmi_logs.sql`
- [ ] Configure `OPENAI_API_KEY` in Supabase
- [ ] Configure `RESEND_API_KEY` in Supabase
- [ ] Set `FORECAST_REPORT_EMAILS`
- [ ] Test function manually
- [ ] Verify mmi_jobs has data
- [ ] Verify mmi_logs has history
- [ ] Enable cron schedule
- [ ] Monitor first execution in logs

## 📊 Success Metrics

Check `cron_execution_logs` table for:
- Status: `success`
- Metadata: `jobs_count`, `forecasts_generated`, `forecasts_saved`
- Duration: < 60 seconds for 50 jobs

## 🔗 Integration Points

**Frontend**: `/admin/mmi` dashboard can display forecasts from `mmi_forecasts` table

**API**: Other services can query `mmi_forecasts` for predictions

**Automation**: High-risk forecasts can trigger automatic work order creation

## 💡 Quick Tips

1. **Start small**: Test with 5-10 jobs before full deployment
2. **Monitor costs**: GPT-4 API calls have associated costs
3. **Review forecasts**: Check AI predictions for accuracy
4. **Adjust prompt**: Fine-tune system role for better results
5. **Track accuracy**: Compare predictions vs actual maintenance dates

## 🆘 Support

For issues or questions:
1. Check test suite results
2. Review cron_execution_logs table
3. Verify environment variables
4. Check Supabase function logs
5. Refer to full documentation in `MMI_FORECAST_GPT4_IMPLEMENTATION.md`

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: 2025-10-19
