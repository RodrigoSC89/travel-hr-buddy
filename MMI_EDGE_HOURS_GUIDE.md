# 🔧 MMI Edge Hours - Implementation Guide

## Overview

The **MMI (Machinery Maintenance Intelligence) Edge Hours** system simulates and tracks hourly component usage for machinery maintenance monitoring. It automatically updates component hour meters and maintains a historical log of all hour consumption.

## Architecture

### Database Schema

#### Table: `mmi_components`
Stores component information and current hour metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Component name |
| `component_type` | TEXT | Type of component |
| `last_hours` | INT | Current total hours (updated by simulation) |
| `expected_daily` | INT | Expected daily hour consumption |
| `status` | TEXT | Component status (active, inactive, maintenance) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### Table: `mmi_hours`
Historical log of hour consumption for each component.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `component_id` | UUID | Foreign key to `mmi_components` |
| `added_hours` | INT | Hours added in this cycle |
| `total_hours` | INT | Total hours at this timestamp |
| `timestamp` | TIMESTAMP | When hours were added |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Edge Function

**Location:** `supabase/functions/simulate-hours/index.ts`

**Flow:**
1. Fetch active components from `mmi_components` (status='active', limit 100)
2. For each component:
   - Generate random hour consumption (1-5 hours)
   - Insert log entry into `mmi_hours` with timestamp
   - Update `last_hours` in `mmi_components`
3. Return summary with success/error counts

**Response Formats:**
- Success: `✅ Horímetros simulados: X sucessos, Y erros`
- No components: `✅ Nenhum componente ativo encontrado`
- Error: `Erro ao buscar componentes` (HTTP 500)

## Setup Instructions

### 1. Deploy Database Migration

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Deploy the migration
supabase db push
```

The migration creates:
- `mmi_components` table
- `mmi_hours` table
- Indexes for performance
- Row Level Security policies
- Trigger for `updated_at` timestamp

### 2. Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy simulate-hours

# Verify deployment
supabase functions list
```

### 3. Configure Cron Schedule (Optional)

The function is configured in `supabase/config.toml` to run hourly:

```toml
[functions.simulate-hours]
verify_jwt = false

[[edge_runtime.cron]]
name = "simulate-hours"
function_name = "simulate-hours"
schedule = "0 * * * *"  # Every hour
description = "Simulate hour consumption for MMI components"
```

After updating `config.toml`, redeploy the function to sync the cron schedule.

### 4. Test the Function

#### Manual Invocation

```bash
# Test via Supabase CLI
supabase functions invoke simulate-hours

# Test via curl
curl -X POST https://your-project.supabase.co/functions/v1/simulate-hours \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### Expected Response

```
✅ Horímetros simulados: 5 sucessos, 0 erros
```

## Usage Examples

### Add Sample Components

```sql
-- Insert sample components
INSERT INTO mmi_components (name, component_type, last_hours, expected_daily, status)
VALUES 
  ('Motor Principal A', 'motor', 100, 8, 'active'),
  ('Bomba Hidráulica 1', 'pump', 50, 6, 'active'),
  ('Gerador de Emergência', 'generator', 200, 2, 'active'),
  ('Compressor de Ar', 'compressor', 150, 10, 'active'),
  ('Motor Auxiliar B', 'motor', 75, 8, 'maintenance');
```

### Query Component Hours

```sql
-- Get all active components with current hours
SELECT id, name, last_hours, expected_daily, status, updated_at
FROM mmi_components
WHERE status = 'active'
ORDER BY last_hours DESC;
```

### Query Hour History

```sql
-- Get recent hour logs for a specific component
SELECT 
  h.timestamp,
  h.added_hours,
  h.total_hours,
  c.name as component_name
FROM mmi_hours h
JOIN mmi_components c ON c.id = h.component_id
WHERE h.component_id = 'your-component-uuid'
ORDER BY h.timestamp DESC
LIMIT 20;
```

### Component Usage Statistics

```sql
-- Get hourly consumption statistics by component
SELECT 
  c.name,
  c.component_type,
  COUNT(*) as simulation_runs,
  AVG(h.added_hours) as avg_hours_per_cycle,
  SUM(h.added_hours) as total_hours_added,
  MAX(h.total_hours) as current_hours
FROM mmi_components c
LEFT JOIN mmi_hours h ON h.component_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.component_type
ORDER BY total_hours_added DESC;
```

## Monitoring

### Check Recent Executions

```sql
-- View last 10 simulation runs
SELECT 
  component_id,
  added_hours,
  total_hours,
  timestamp
FROM mmi_hours
ORDER BY timestamp DESC
LIMIT 10;
```

### Component Health Dashboard

```sql
-- Components approaching maintenance threshold
SELECT 
  name,
  component_type,
  last_hours,
  expected_daily,
  CASE 
    WHEN last_hours > 1000 THEN '🔴 High'
    WHEN last_hours > 500 THEN '🟡 Medium'
    ELSE '🟢 Low'
  END as maintenance_priority
FROM mmi_components
WHERE status = 'active'
ORDER BY last_hours DESC;
```

## Configuration

### Environment Variables

The function requires:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

These are automatically available in Supabase Edge Functions.

### Cron Schedule

The default schedule is **hourly** (`0 * * * *`). You can adjust this in `supabase/config.toml`:

- Every hour: `0 * * * *`
- Every 2 hours: `0 */2 * * *`
- Every 6 hours: `0 */6 * * *`
- Daily at 8 AM: `0 8 * * *`

## Testing

### Run Unit Tests

```bash
npm test -- src/tests/simulate-hours.test.ts
```

The test suite includes:
- CORS header validation
- Environment variable checks
- Hour simulation logic
- Database operation structure
- Cron configuration validation

## Troubleshooting

### No Components Being Processed

**Issue:** Function returns "Nenhum componente ativo encontrado"

**Solution:**
1. Check if components exist: `SELECT COUNT(*) FROM mmi_components;`
2. Verify active status: `SELECT * FROM mmi_components WHERE status = 'active';`
3. Add sample components using the SQL above

### Function Timeout

**Issue:** Function times out with many components

**Solution:**
- The function processes up to 100 components per execution
- Consider splitting into multiple batches or running more frequently

### Database Connection Errors

**Issue:** "Erro ao buscar componentes"

**Solution:**
1. Verify Supabase service role key is configured
2. Check database migration was applied: `supabase db remote list`
3. Verify RLS policies allow service role access

## Best Practices

1. **Regular Monitoring:** Check execution logs in Supabase Dashboard
2. **Component Lifecycle:** Update status to 'inactive' when components are decommissioned
3. **Data Retention:** Consider archiving old `mmi_hours` records after 1 year
4. **Alerting:** Set up alerts for components exceeding maintenance thresholds
5. **Validation:** Periodically compare simulated vs. actual component usage

## Future Enhancements

- Real sensor integration for actual hour tracking
- Predictive maintenance alerts based on usage patterns
- Component lifecycle tracking and replacement recommendations
- Integration with maintenance scheduling system
- Dashboard UI for real-time component monitoring

## Related Documentation

- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)
- Monitor Cron Health: `MONITOR_CRON_HEALTH_GUIDE.md`
- Daily Assistant Report: `DAILY_ASSISTANT_REPORT_GUIDE.md`
