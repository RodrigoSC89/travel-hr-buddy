# Send Forecast Report - Quick Reference

## 🚀 Quick Start

### What is it?
Weekly AI-powered maintenance forecast report that analyzes completed jobs and predicts maintenance needs.

### When does it run?
Every **Monday at 06:00 UTC** (03:00 BRT)

### What does it do?
1. Fetches completed maintenance jobs (last 6 months)
2. Groups by component and month
3. Asks GPT-4 to predict next 2 months
4. Emails forecast to engineering team

---

## 📋 Setup Checklist

### Environment Variables (Supabase Dashboard)
```bash
✅ SUPABASE_URL                 # Auto-configured
✅ SUPABASE_SERVICE_ROLE_KEY    # Auto-configured
✅ RESEND_API_KEY               # Required - Get from resend.com
✅ OPENAI_API_KEY               # Required - Get from openai.com
✅ EMAIL_FROM                   # Optional - Default: noreply@nautilus.system
✅ FORECAST_REPORT_EMAILS       # Optional - Default: engenharia@nautilus.system
```

### File Locations
```
Edge Function:  supabase/functions/send-forecast-report/index.ts
Configuration:  supabase/config.toml (lines 25-26, 70-73)
Tests:          src/tests/send-forecast-report.test.ts
Documentation:  SEND_FORECAST_REPORT_IMPLEMENTATION.md
```

---

## 🧪 Testing

```bash
# Run tests
npm test -- src/tests/send-forecast-report.test.ts

# Manual invoke (local)
supabase functions serve send-forecast-report
curl -X POST http://localhost:54321/functions/v1/send-forecast-report

# Check logs
# Query cron_execution_logs table where function_name = 'send-forecast-report'
```

---

## 📊 Monitoring

### Check Last Execution
```sql
SELECT * FROM cron_execution_logs
WHERE function_name = 'send-forecast-report'
ORDER BY created_at DESC
LIMIT 1;
```

### Check Success Rate
```sql
SELECT 
  status,
  COUNT(*) as count
FROM cron_execution_logs
WHERE function_name = 'send-forecast-report'
GROUP BY status;
```

### Check Recent Errors
```sql
SELECT 
  created_at,
  message,
  error_details
FROM cron_execution_logs
WHERE function_name = 'send-forecast-report'
  AND status IN ('error', 'critical')
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🔧 Configuration

### Change Schedule
Edit `supabase/config.toml`:
```toml
schedule = "0 6 * * 1"  # Monday at 06:00 UTC
```

Cron format: `minute hour day month weekday`
- `0 6 * * 1` = Monday at 06:00
- `0 8 * * *` = Every day at 08:00
- `0 6 * * 5` = Friday at 06:00

### Change Recipients
Set environment variable:
```env
FORECAST_REPORT_EMAILS=eng1@company.com,eng2@company.com,manager@company.com
```

### Change AI Model
Edit function, line ~77:
```typescript
model: "gpt-4"  // Change to "gpt-3.5-turbo" for faster/cheaper
```

---

## 📧 Email Content

### Subject
```
🔧 Previsão Semanal de Manutenção por Componente
```

### Recipients
- Primary: Engineering team (configured via env var)
- CC: None
- BCC: None

### Format
- HTML email with styled forecast
- AI-generated text in code block
- Responsive design

---

## 🐛 Troubleshooting

### Email not received?
1. Check `cron_execution_logs` for errors
2. Verify `RESEND_API_KEY` is valid
3. Check recipient email in `FORECAST_REPORT_EMAILS`
4. Verify Resend domain is verified

### Forecast quality issues?
1. Check if enough data (need jobs from last 6 months)
2. Review AI prompt in function (lines 62-70)
3. Consider adjusting temperature (line 86)
4. Verify `OPENAI_API_KEY` has sufficient quota

### Function not running?
1. Check cron schedule in `config.toml`
2. Verify function is deployed
3. Check Supabase dashboard for cron status
4. Review function logs in Supabase

### No data in forecast?
1. Verify `mmi_jobs` table has completed jobs
2. Check `completed_at` field is populated
3. Verify jobs are within last 6 months
4. Review SQL query in function (lines 160-165)

---

## 📈 Performance

### Execution Time
- Typical: 2-5 seconds
- With OpenAI: 3-8 seconds
- Network dependent

### Resource Usage
- Memory: ~50MB
- CPU: Minimal
- Network: ~100KB request + ~50KB response

### Cost Estimate (per execution)
- Supabase: Free (within limits)
- Resend: Free (within 100 emails/day)
- OpenAI: ~$0.02-0.05 per forecast (GPT-4)

**Weekly cost:** ~$0.08-0.20  
**Monthly cost:** ~$0.35-0.85

---

## 🔐 Security

- ✅ JWT verification disabled (for cron)
- ✅ Uses service role key (secure)
- ✅ No user data exposed
- ✅ CORS headers configured
- ✅ Error messages sanitized

---

## 📝 Data Schema

### Input (mmi_jobs)
```typescript
{
  component_id: string,    // UUID reference to mmi_components
  completed_at: string,    // ISO timestamp
  status: 'completed'      // Filter value
}
```

### Grouped Data
```typescript
{
  "component-uuid-1": ["2025-08", "2025-09", "2025-10"],
  "component-uuid-2": ["2025-09", "2025-10"]
}
```

### Output (cron_execution_logs)
```typescript
{
  function_name: 'send-forecast-report',
  status: 'success' | 'error' | 'warning' | 'critical',
  message: string,
  metadata: {
    jobs_count: number,
    components_count: number,
    recipients: string[]
  },
  execution_duration_ms: number
}
```

---

## 🎓 Tips & Best Practices

1. **Monitor weekly** - Check logs after each execution
2. **Adjust prompt** - Refine AI instructions based on output quality
3. **Review forecasts** - Validate AI predictions with actual maintenance
4. **Keep data clean** - Ensure `completed_at` is properly set on jobs
5. **Budget monitoring** - Track OpenAI usage and costs
6. **Alert setup** - Create alerts for critical failures
7. **Backup emails** - Add multiple recipients for redundancy

---

## 📞 Support

### Need Help?
1. Check logs: `cron_execution_logs` table
2. Review documentation: `SEND_FORECAST_REPORT_IMPLEMENTATION.md`
3. Run tests: `npm test -- src/tests/send-forecast-report.test.ts`
4. Check function code: `supabase/functions/send-forecast-report/index.ts`

### Common Questions

**Q: Can I change the day of the week?**  
A: Yes, edit `schedule` in `config.toml` (0=Sunday, 1=Monday, etc.)

**Q: Can I get reports more frequently?**  
A: Yes, but daily reports may be redundant. Consider bi-weekly or monthly.

**Q: Can I customize the AI prompt?**  
A: Yes, edit the prompt in the function (lines 62-70)

**Q: Can I add attachments?**  
A: Yes, modify the Resend call to include attachments (see send-assistant-report for examples)

**Q: Can I use a different AI model?**  
A: Yes, change the `model` parameter (OpenAI compatible APIs also work)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
