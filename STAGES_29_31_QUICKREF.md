# Stages 29-31 Quick Reference Guide

## 🚀 Quick Access URLs

### Admin Pages
- **Simulations**: `/admin/simulations`
- **Cron Monitor**: `/admin/cron-monitor`
- **Training**: `/admin/training`

---

## 📊 Database Tables

### Stage 29: Simulation Exercises
```sql
simulation_exercises
├── id (uuid)
├── vessel_id (uuid)
├── type (DP, Blackout, Abandono, Incêndio, Man Overboard, Spill)
├── normative_reference (text)
├── frequency_days (integer)
├── last_simulation (date)
├── next_due (date) -- auto-calculated
├── crew_participants (text[])
├── notes (text)
├── attachments (text[])
└── status (scheduled, completed, overdue, cancelled)
```

### Stage 30: Cron Jobs
```sql
cron_jobs
├── id (uuid)
├── name (text, unique)
├── description (text)
├── schedule (text) -- cron expression
├── status (active, inactive, error)
├── last_run (timestamp)
├── next_run (timestamp)
├── execution_count (integer)
├── success_count (integer)
├── error_count (integer)
└── average_duration_ms (integer)

cron_job_executions
├── id (uuid)
├── job_id (uuid)
├── status (success, failed, running, cancelled)
├── started_at (timestamp)
├── completed_at (timestamp)
├── duration_ms (integer)
├── error_message (text)
├── logs (text)
└── metadata (jsonb)
```

### Stage 31: Crew Training Records
```sql
crew_training_records
├── id (uuid)
├── crew_id (uuid)
├── training_module_id (uuid)
├── date_completed (date)
├── result (text)
├── cert_url (text) -- PDF certificate
├── valid_until (date) -- auto-calculated
├── category (DP Operations, Emergency Response, etc.)
└── incident_id (uuid) -- link to failure
```

---

## 🔧 Database Functions

### Simulations
```sql
-- Get statistics
SELECT get_simulation_stats(vessel_id);
-- Returns: {total, completed, overdue, upcoming, completion_rate}

-- Get overdue simulations
SELECT * FROM get_overdue_simulations(vessel_id);
-- Returns: id, vessel_id, type, normative_reference, next_due, days_overdue
```

### Cron Jobs
```sql
-- Get statistics
SELECT get_cron_stats();
-- Returns: {total_jobs, active_jobs, inactive_jobs, error_jobs, 
--           total_executions_today, success_rate}
```

### Training
```sql
-- Get statistics
SELECT get_crew_training_stats(crew_id);
-- Returns: {total_trainings, active_certifications, expired_certifications,
--           upcoming_expirations, compliance_rate}

-- Get expired records
SELECT * FROM get_expired_training_records(crew_id);
-- Returns: id, crew_id, training_module_id, category, valid_until, days_expired

-- Get upcoming expirations
SELECT * FROM get_upcoming_training_expirations(30, crew_id);
-- Returns: id, crew_id, training_module_id, category, valid_until, 
--          days_until_expiration
```

---

## 🎨 UI Components Used

### Common Components
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Badge` - Color-coded status indicators
- `Button` - Actions and filters
- Icons from `lucide-react`

### Color Scheme
**Simulation Status:**
- 🟢 Green: `completed`
- 🔴 Red: `overdue`
- 🔵 Blue: `scheduled`
- ⚪ Gray: `cancelled`

**Cron Job Status:**
- 🟢 Green: `active`, `success`
- 🔴 Red: `error`, `failed`
- 🔵 Blue: `running`
- ⚪ Gray: `inactive`, `cancelled`

**Training Status:**
- 🟢 Green: Active certifications
- 🔴 Red: Expired certifications
- 🟡 Yellow: Expiring soon (< 30 days)

---

## 📝 Type Definitions

### Import Paths
```typescript
// Simulations
import type { 
  SimulationExercise, 
  SimulationStats, 
  SimulationType, 
  SimulationStatus 
} from '@/types/simulation';

// Cron Jobs
import type { 
  CronJob, 
  CronJobExecution, 
  CronJobStats, 
  CronJobStatus 
} from '@/types/cron';

// Training
import type { 
  CrewTrainingRecord, 
  TrainingModuleExtended, 
  CrewTrainingStats, 
  TrainingCategory 
} from '@/types/training';
```

---

## 🔐 Access Control

### Role Permissions

**Simulations:**
- Read: All authenticated users
- Write: `admin`, `hr_manager`, `safety_officer`

**Cron Monitor:**
- Read: All authenticated users
- Write: `admin`, `hr_manager`
- Execute: System (automatic)

**Training:**
- Read: All authenticated users (own records)
- Read All: `admin`, `hr_manager`, `training_coordinator`
- Write: `admin`, `hr_manager`, `training_coordinator`

---

## 📦 Pre-configured Data

### Cron Jobs
1. **forecast-job**: Daily at 7 AM
2. **validate-sgso**: Mondays at 6 AM
3. **email-dp-alerts**: Daily at noon
4. **restore-reports**: Daily at 2 AM
5. **database-backup**: Daily at 3 AM

### Training Modules
1. **DP Operations - Basic Training**: 8h, 12 months validity
2. **Emergency Response - Fire Fighting**: 16h, 12 months validity
3. **Blackout Recovery Procedures**: 4h, 12 months validity

---

## 🚀 Quick Start

### 1. Apply Migrations
```bash
# In Supabase dashboard or CLI
supabase migration up
```

### 2. Access Pages
Navigate to:
- http://localhost:5173/admin/simulations
- http://localhost:5173/admin/cron-monitor
- http://localhost:5173/admin/training

### 3. Test Data Queries
```sql
-- Simulations
SELECT * FROM simulation_exercises;
SELECT get_simulation_stats();

-- Cron Jobs
SELECT * FROM cron_jobs;
SELECT get_cron_stats();

-- Training
SELECT * FROM crew_training_records;
SELECT get_crew_training_stats();
```

---

## 🔍 Common Use Cases

### Creating a Simulation Exercise
```typescript
const { data, error } = await supabase
  .from('simulation_exercises')
  .insert({
    type: 'DP',
    normative_reference: 'IMCA M220 4.3.1',
    frequency_days: 90,
    last_simulation: '2025-10-01',
    crew_participants: ['crew-1', 'crew-2'],
    notes: 'Quarterly DP drill'
  });
```

### Recording a Cron Execution
```typescript
const { data, error } = await supabase
  .from('cron_job_executions')
  .insert({
    job_id: 'job-uuid',
    status: 'success',
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    duration_ms: 1500
  });
```

### Adding a Training Record
```typescript
const { data, error } = await supabase
  .from('crew_training_records')
  .insert({
    crew_id: 'crew-uuid',
    training_module_id: 'module-uuid',
    date_completed: '2025-10-18',
    result: 'Passed with 95%',
    category: 'DP Operations'
  });
```

---

## ⚠️ Important Notes

1. **Automatic Calculations**: 
   - `next_due` is auto-calculated on insert/update
   - `valid_until` is auto-calculated based on expiration_months
   - Job statistics auto-update after executions

2. **Status Updates**:
   - Simulation status changes to `overdue` when next_due < today
   - Cron job status changes to `error` after failed execution

3. **Data Validation**:
   - Simulation types are constrained to 6 valid values
   - Training categories are constrained to 7 valid values
   - All dates are validated

4. **Performance**:
   - Use vessel_id or crew_id filters for large datasets
   - Limit pagination to 100 items
   - Statistics functions are optimized

---

## 📚 Related Standards

- **IMCA M220**: Dynamic Positioning Competence
- **MTS Guidelines**: Maritime Training Services
- **IBAMA SGSO**: Brazilian Safety Management System
- **ISM Code**: International Safety Management
- **STCW**: Standards of Training, Certification and Watchkeeping

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Issues
```bash
# Reset migrations (use with caution)
supabase migration down
supabase migration up
```

### Type Issues
```bash
# Regenerate Supabase types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

---

## 📞 Support

For issues or questions:
1. Check the full implementation summary: `STAGES_29_31_IMPLEMENTATION_SUMMARY.md`
2. Review database migrations in `supabase/migrations/`
3. Check component source code in `src/pages/admin/`
4. Review type definitions in `src/types/`

---

**Last Updated**: October 18, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
