# MMI Edge Hours - Quick Reference

## 🎯 Overview
**MMI (Machinery Maintenance Intelligence) Edge Hours** - Automated component hour tracking system

## 📁 Files Created

### 1. Database Migration
```
supabase/migrations/20251015000801_create_mmi_tables.sql
```
- Creates `mmi_components` table (component tracking)
- Creates `mmi_hours` table (historical logs)
- Adds indexes, RLS policies, and triggers

### 2. Edge Function
```
supabase/functions/simulate-hours/index.ts
```
- Simulates 1-5 hours consumption per component
- Updates `mmi_components.last_hours`
- Logs to `mmi_hours` with timestamp
- Returns success/error counts

### 3. Configuration
```
supabase/config.toml
```
- Function config: `verify_jwt = false`
- Cron schedule: `0 * * * *` (hourly)

### 4. Tests
```
src/tests/simulate-hours.test.ts
```
- 14 passing tests
- Covers CORS, environment, database, and logic

### 5. Documentation
```
MMI_EDGE_HOURS_GUIDE.md
```
- Complete setup guide
- Usage examples
- Monitoring queries

## ⚡ Quick Start

### Deploy
```bash
# 1. Deploy migration
supabase db push

# 2. Deploy function
supabase functions deploy simulate-hours

# 3. Test
supabase functions invoke simulate-hours
```

### Add Sample Data
```sql
INSERT INTO mmi_components (name, component_type, last_hours, expected_daily, status)
VALUES 
  ('Motor Principal A', 'motor', 100, 8, 'active'),
  ('Bomba Hidráulica 1', 'pump', 50, 6, 'active'),
  ('Gerador de Emergência', 'generator', 200, 2, 'active');
```

### Query Results
```sql
-- View recent simulations
SELECT 
  c.name,
  h.added_hours,
  h.total_hours,
  h.timestamp
FROM mmi_hours h
JOIN mmi_components c ON c.id = h.component_id
ORDER BY h.timestamp DESC
LIMIT 10;
```

## 🔧 Configuration

### Environment Variables
- `SUPABASE_URL` - Auto-configured ✅
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured ✅

### Cron Schedule Options
- Hourly: `0 * * * *` (default)
- Every 2 hours: `0 */2 * * *`
- Every 6 hours: `0 */6 * * *`

## 📊 Database Schema

### mmi_components
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Component name |
| component_type | TEXT | Type (motor, pump, etc) |
| last_hours | INT | Current total hours |
| expected_daily | INT | Expected daily hours |
| status | TEXT | active/inactive/maintenance |

### mmi_hours
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| component_id | UUID | FK to mmi_components |
| added_hours | INT | Hours added this cycle |
| total_hours | INT | Total at timestamp |
| timestamp | TIMESTAMP | When logged |

## 🎨 Response Formats

### Success
```
✅ Horímetros simulados: 5 sucessos, 0 erros
```

### No Components
```
✅ Nenhum componente ativo encontrado
```

### Error
```
Erro ao buscar componentes (HTTP 500)
```

## 🧪 Testing

### Run Tests
```bash
npm test -- src/tests/simulate-hours.test.ts
```

### Test Results
```
✓ 14 tests passing
  - CORS headers validation
  - Environment variables check
  - Hour simulation logic
  - Database operations
  - Integration logic
  - Cron configuration
```

## 📈 Monitoring

### Check Last 10 Executions
```sql
SELECT component_id, added_hours, total_hours, timestamp
FROM mmi_hours
ORDER BY timestamp DESC
LIMIT 10;
```

### Component Status
```sql
SELECT name, last_hours, status, updated_at
FROM mmi_components
WHERE status = 'active'
ORDER BY last_hours DESC;
```

### Usage Statistics
```sql
SELECT 
  c.name,
  COUNT(*) as runs,
  AVG(h.added_hours) as avg_hours,
  SUM(h.added_hours) as total_added
FROM mmi_components c
LEFT JOIN mmi_hours h ON h.component_id = c.id
GROUP BY c.id, c.name;
```

## 🔗 Related Documentation
- Full Guide: `MMI_EDGE_HOURS_GUIDE.md`
- Monitor Cron Health: `MONITOR_CRON_HEALTH_GUIDE.md`
- Daily Assistant Report: `DAILY_ASSISTANT_REPORT_GUIDE.md`

## ✅ Implementation Checklist
- [x] Database migration created
- [x] Edge function implemented
- [x] Cron schedule configured
- [x] Tests written (14 passing)
- [x] Documentation complete
- [x] All existing tests passing (315 total)
