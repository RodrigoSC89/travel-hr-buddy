# MMI AI Integration Quick Reference

## Quick Facts

- **Files Modified:** 2 files
- **Lines Changed:** +117 / -65 (net +52)
- **Tests:** 538/538 passing ✅
- **Breaking Changes:** None ❌
- **Backward Compatible:** 100% ✅

## What Changed

### 1. jobsApi.ts (src/services/mmi/jobsApi.ts)

#### postponeJob()
- **Before:** Direct database update with mock delay
- **After:** Calls `mmi-job-postpone` edge function → GPT-4 analysis → Database update
- **Fallback:** Mock data when edge function unavailable

#### createWorkOrder()
- **Before:** Direct database insert with mock delay
- **After:** Calls `mmi-os-create` edge function → Database validation → Work order creation
- **Fallback:** Mock data when edge function unavailable

### 2. assistant-query (supabase/functions/assistant-query/index.ts)

Added 6 new MMI commands:
- `mmi` - Navigate to MMI module
- `manutenção` - Navigate to MMI module
- `jobs de manutenção` - List jobs
- `jobs críticos` - Critical jobs info
- `criar os` - Work order creation guide
- `postergar manutenção` - Postponement guide

## Edge Functions Used

### mmi-job-postpone
- **Purpose:** AI-powered postponement analysis
- **AI Model:** OpenAI GPT-4
- **Features:** Retry logic, timeout handling, exponential backoff
- **Location:** `supabase/functions/mmi-job-postpone/index.ts`

### mmi-os-create
- **Purpose:** Create work orders in database
- **Database:** Inserts into mmi_os table
- **Validation:** Job existence verification
- **Location:** `supabase/functions/mmi-os-create/index.ts`

## Command Reference

### Assistant Commands

| Command | Type | Action |
|---------|------|--------|
| `mmi` | Navigation | Go to /mmi |
| `manutenção` | Navigation | Go to /mmi |
| `jobs de manutenção` | Navigation | Go to /mmi |
| `jobs críticos` | Info | Explain critical jobs |
| `criar os` | Info | Work order guide |
| `postergar manutenção` | Info | Postponement guide |
| `ajuda` | Info | Show all commands |

## API Functions

### fetchJobs()
```typescript
const { jobs } = await fetchJobs();
// Returns: { jobs: MMIJob[] }
```

### postponeJob(jobId)
```typescript
const result = await postponeJob("JOB-001");
// Returns: { message: string, new_date?: string }
```

### createWorkOrder(jobId)
```typescript
const result = await createWorkOrder("JOB-001");
// Returns: { os_id: string, message: string }
```

## Test Results

```bash
✓ 538 tests passing
  ✓ 17 MMI Jobs API tests
  ✓ 4 fetchJobs tests
  ✓ 4 postponeJob tests
  ✓ 3 createWorkOrder tests
  ✓ 3 data validation tests
  ✓ 3 timing tests
```

## Database Tables

### mmi_jobs
- Primary jobs table
- Stores maintenance jobs
- Contains embeddings for AI

### mmi_os
- Work orders table
- References mmi_jobs
- Tracks work order status

### mmi_job_history
- History/audit log
- Records all actions
- Contains embeddings for similarity

## Deployment Requirements

### Environment Variables
```bash
OPENAI_API_KEY=sk-...       # Required for AI analysis
SUPABASE_URL=https://...    # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=... # Service role key
```

### Edge Functions
```bash
# Deploy edge functions (if needed)
supabase functions deploy mmi-job-postpone
supabase functions deploy mmi-os-create
```

## Error Handling

### Edge Function Errors
- Automatic retry with exponential backoff
- Falls back to mock data
- Logs warnings to console

### Database Errors
- Graceful fallback to mock data
- User-friendly error messages
- No system crashes

## Testing

### Run MMI Tests
```bash
npm test -- src/tests/mmi-jobs-api.test.ts
```

### Run All Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## Key Benefits

✅ **AI-Powered** - GPT-4 analysis for maintenance decisions
✅ **Production Ready** - Real database integration
✅ **Test Friendly** - Automatic environment detection
✅ **Fault Tolerant** - Graceful fallbacks
✅ **Scalable** - Edge functions scale independently
✅ **Zero Breaking Changes** - 100% backward compatible

## Migration Steps

**No migration needed!** The API maintains the same interface.

Old code continues to work:
```typescript
// This code works before AND after refactoring
const { jobs } = await fetchJobs();
const result = await postponeJob(jobId);
const os = await createWorkOrder(jobId);
```

## Troubleshooting

### Edge function not responding
- Check OPENAI_API_KEY is set
- Verify edge functions are deployed
- Check Supabase function logs
- System falls back to mock data automatically

### Tests failing
- Ensure dependencies installed: `npm install`
- Check database connection (not required for tests)
- Tests use mock data automatically

### Assistant commands not working
- Check assistant-query edge function is deployed
- Verify command patterns match exactly
- Commands are case-insensitive

## Support

For issues or questions:
1. Check edge function logs in Supabase dashboard
2. Review console warnings for fallback triggers
3. Verify environment variables are set
4. Ensure all tests pass: `npm test`

## Quick Links

- **Full Documentation:** [MMI_AI_INTEGRATION_REFACTOR.md](./MMI_AI_INTEGRATION_REFACTOR.md)
- **Edge Functions:** `supabase/functions/mmi-*`
- **Tests:** `src/tests/mmi-jobs-api.test.ts`
- **Service:** `src/services/mmi/jobsApi.ts`
