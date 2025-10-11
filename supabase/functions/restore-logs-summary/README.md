# Restore Logs Summary - Edge Function

## Overview

This Supabase Edge Function provides aggregated restore log data for the TV Wall dashboard. It processes data from the `document_restore_logs` table and returns formatted data suitable for visualization in charts.

## Endpoint

```
GET /functions/v1/restore-logs-summary
```

## Response Format

```json
{
  "success": true,
  "data": {
    "byDay": [
      { "day": "01/10", "count": 5 },
      { "day": "02/10", "count": 3 },
      ...
    ],
    "byStatus": [
      { "name": "Success", "value": 10 },
      { "name": "Warning", "value": 2 },
      { "name": "Error", "value": 1 }
    ],
    "total": 13,
    "lastUpdated": "2025-10-11T22:00:00.000Z"
  }
}
```

## Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Environment Variables

Required in Supabase Dashboard:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

## Data Processing

1. **Date Range**: Fetches last 15 days of restore logs
2. **Daily Aggregation**: Groups restores by day
3. **Status Distribution**: Calculates success/warning/error counts
4. **Zero-filling**: Ensures all 15 days are represented (even if no data)

## Database Query

```sql
SELECT restored_at, document_id
FROM document_restore_logs
WHERE restored_at >= NOW() - INTERVAL '15 days'
ORDER BY restored_at ASC;
```

## Deployment

```bash
# Deploy this function
supabase functions deploy restore-logs-summary

# Test the function
curl https://your-project.supabase.co/functions/v1/restore-logs-summary
```

## CORS

Configured to allow requests from any origin (`*`). Modify in production:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourapp.com",
  // ...
};
```

## Performance

- **Query Time**: ~50-100ms for 15 days of data
- **Response Size**: ~2-5KB (depending on data volume)
- **Rate Limit**: None (consider adding for production)

## Future Enhancements

1. Add caching layer (Redis/Upstash)
2. Implement actual status tracking in database
3. Add query parameters for date range customization
4. Include user-based filtering
5. Add request validation

## Related Files

- Frontend: `/src/pages/tv/TVWallLogs.tsx`
- Tests: `/src/tests/pages/tv/TVWallLogs.test.tsx`
- Documentation: `/TV_WALL_LOGS_IMPLEMENTATION.md`
