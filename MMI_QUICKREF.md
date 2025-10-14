# MMI Quick Reference

## 🚀 Quick Access

**URL**: `/mmi`

## 📊 Key Components

### 1. Central Jobs Dashboard
```typescript
import { MMICentralJobsDashboard } from '@/modules/mmi';
<MMICentralJobsDashboard />
```

### 2. Maintenance Copilot
```typescript
import { MMIMaintenanceCopilot } from '@/modules/mmi';
<MMIMaintenanceCopilot />
```

## 🔧 Services Quick Reference

### Jobs Service
```typescript
import { jobsService } from '@/modules/mmi';

// Get all jobs with filters
await jobsService.getAll({ status: ['pendente'], priority: ['crítica'] });

// Get pending jobs
await jobsService.getPending();

// Get overdue jobs
await jobsService.getOverdue();

// Create job
await jobsService.create({
  component_id: 'uuid',
  title: 'Oil change',
  status: 'pendente',
  priority: 'alta',
  due_date: '2025-10-20'
});

// Update job status
await jobsService.updateStatus(jobId, 'em_andamento');
```

### Dashboard Service
```typescript
import { dashboardService } from '@/modules/mmi';

// Get statistics
const stats = await dashboardService.getStats();
// Returns: { total_jobs, pending_jobs, critical_jobs, etc. }
```

### Assets Service
```typescript
import { assetsService } from '@/modules/mmi';

// Get critical assets
await assetsService.getCritical();

// Get assets by vessel
await assetsService.getByVessel('MV Atlantic Explorer');
```

## 📋 Database Tables

- `mmi_assets` - Fleet assets
- `mmi_components` - Technical components
- `mmi_jobs` - Maintenance jobs
- `mmi_os` - Service orders
- `mmi_history` - Technical history
- `mmi_hours` - Hour meters

## 🎨 Status & Priority

### Job Status
- `pendente` - Pending
- `em_andamento` - In progress
- `concluido` - Completed
- `postergado` - Postponed

### Job Priority
- `crítica` - Critical (Red)
- `alta` - High (Orange)
- `normal` - Normal (Blue)
- `baixa` - Low (Gray)

## 🎯 Features

✅ Central jobs management
✅ AI-powered copilot
✅ Service orders
✅ Technical history
✅ Hour meter tracking
✅ Predictive analysis (coming soon)

## 📚 Documentation

- Full docs: `src/modules/mmi/README.md`
- Types: `src/types/mmi/index.ts`
- Schema: `supabase/migrations/20251014214016_create_mmi_schema.sql`
- Summary: `MMI_IMPLEMENTATION_COMPLETE.md`

## 🔐 Security

All tables have RLS enabled. Only authenticated users can access.

## 🚦 Status

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Route**: `/mmi`
