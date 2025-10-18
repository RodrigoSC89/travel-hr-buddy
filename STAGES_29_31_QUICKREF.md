# Stages 29-31 Quick Reference

## 🚀 Quick Access

| Module | URL | Purpose |
|--------|-----|---------|
| Simulations | `/admin/simulations` | Manage onboard simulation exercises |
| Cron Monitor | `/admin/cron-monitor` | Monitor automated tasks |
| Training | `/admin/training` | Track crew training & certifications |

## 📊 Database Tables

### simulation_exercises
```sql
-- Schedule and track mandatory simulations
SELECT * FROM simulation_exercises WHERE status = 'overdue';
SELECT * FROM get_overdue_simulations();
SELECT * FROM get_upcoming_simulations();
```

### cron_jobs & cron_job_executions
```sql
-- Monitor automated tasks
SELECT * FROM cron_jobs WHERE status = 'FAILED';
SELECT * FROM get_cron_job_stats();
```

### training_modules & crew_training_records
```sql
-- Manage training
SELECT * FROM training_modules WHERE category = 'Safety';
SELECT * FROM get_expired_trainings();
SELECT * FROM get_crew_training_stats('crew-uuid');
```

## 🎨 Component Structure

### Simulations (`/src/components/admin/simulations/`)
- `SimulationExerciseList.tsx` - Main list view
- `SimulationStats.tsx` - Statistics cards
- `SimulationCalendar.tsx` - Calendar view (placeholder)
- `CreateSimulationDialog.tsx` - Create form

### Cron (`/src/components/admin/cron/`)
- `CronJobsPanel.tsx` - Jobs table
- `CronJobStats.tsx` - Statistics cards
- `CronJobExecutions.tsx` - Execution history

### Training (`/src/components/admin/training/`)
- `TrainingModuleList.tsx` - Available courses
- `CrewTrainingRecords.tsx` - Training records
- `TrainingStats.tsx` - Statistics cards
- `ExpiredTrainings.tsx` - Expired certifications
- `CreateTrainingDialog.tsx` - Record training form

## 📋 Simulation Types

- DP (Dynamic Positioning)
- Blackout
- Abandono (Abandonment)
- Incêndio (Fire)
- Man Overboard
- Derramamento (Spill)

## 👥 Access Roles

| Module | Roles |
|--------|-------|
| Simulations | admin, hr_manager, safety_officer |
| Cron Monitor | admin, hr_manager |
| Training | admin, hr_manager, training_coordinator |

## 🏷️ Training Categories

- Safety
- Technical
- DP Operations
- Emergency Response
- SGSO Compliance
- Equipment Operation
- Other

## 📅 Pre-configured Cron Jobs

1. **forecast-job** - Daily 7 AM
2. **validate-sgso** - Weekly Monday 6 AM
3. **email-dp-alerts** - Daily 12 PM
4. **daily-restore-report** - Daily 8 AM
5. **backup-database** - Daily 2 AM

## 📚 Pre-configured Training Modules

1. DP Operations Fundamentals (365 days validity)
2. Emergency Response Procedures (180 days)
3. Fire Fighting Level 1 (365 days)
4. Blackout Recovery (180 days)
5. Man Overboard Response (180 days)
6. SGSO Compliance Training (365 days)

## 🔍 Key Functions

### Simulations
```typescript
// Get overdue simulations
const { data } = useQuery({
  queryKey: ['overdue-simulations'],
  queryFn: async () => {
    const { data } = await supabase.rpc('get_overdue_simulations');
    return data;
  }
});
```

### Cron Jobs
```typescript
// Get job statistics
const { data } = useQuery({
  queryKey: ['cron-stats'],
  queryFn: async () => {
    const { data } = await supabase.rpc('get_cron_job_stats');
    return data[0];
  }
});
```

### Training
```typescript
// Get expired trainings
const { data } = useQuery({
  queryKey: ['expired-trainings'],
  queryFn: async () => {
    const { data } = await supabase.rpc('get_expired_trainings');
    return data;
  }
});
```

## 🎯 Status Values

### Simulation Status
- `scheduled` - Pending execution
- `completed` - Successfully completed
- `overdue` - Past due date
- `cancelled` - Cancelled

### Cron Job Status
- `OK` - Successful execution
- `FAILED` - Failed execution
- `RUNNING` - Currently executing
- `PENDING` - Scheduled, not yet run

### Training Status
- `scheduled` - Planned training
- `in_progress` - Currently in training
- `completed` - Training completed
- `failed` - Did not pass
- `expired` - Certification expired

## 📝 Common Queries

### Find overdue simulations for a vessel
```sql
SELECT * FROM simulation_exercises 
WHERE vessel_id = 'vessel-uuid' 
AND status = 'overdue'
ORDER BY next_due ASC;
```

### Find crew with expired training
```sql
SELECT * FROM get_expired_trainings()
WHERE crew_id = 'crew-uuid';
```

### Check cron job health
```sql
SELECT * FROM cron_jobs 
WHERE status = 'FAILED' 
OR (last_run < NOW() - INTERVAL '1 day' AND enabled = true);
```

## 🔗 Related Files

### Migrations
- `supabase/migrations/20251018144511_create_simulation_exercises.sql`
- `supabase/migrations/20251018144512_create_cron_jobs.sql`
- `supabase/migrations/20251018144513_create_training_modules.sql`

### Types
- `src/types/simulation.ts`
- `src/types/cron.ts`
- `src/types/training.ts`

### Pages
- `src/pages/admin/simulations.tsx`
- `src/pages/admin/cron-monitor.tsx`
- `src/pages/admin/training.tsx`

## 🔧 Troubleshooting

### Simulations not showing?
Check if vessels exist in database:
```sql
SELECT COUNT(*) FROM vessels;
```

### Training records empty?
Check if crew members exist:
```sql
SELECT COUNT(*) FROM crew_members;
```

### Cron jobs not updating?
Verify RPC permissions:
```sql
SELECT * FROM pg_proc WHERE proname LIKE '%cron%';
```

## 📖 Documentation

For detailed information, see:
- `STAGES_29_31_IMPLEMENTATION.md` - Full implementation details
- `README.md` - Project overview
- `API_ADMIN_SGSO.md` - SGSO API documentation

## ✅ Quick Validation

```bash
# Build project
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 🎉 Features Delivered

✅ Simulation control with compliance tracking
✅ Cron job monitoring dashboard
✅ Training and certification management
✅ Full database schema with triggers
✅ Role-based access control
✅ Statistics dashboards
✅ Create/edit dialogs
✅ Real-time data updates
✅ Type-safe TypeScript
✅ Responsive UI design
