# PATCH 596 & 597 - Quick Reference Guide

## 🚀 Quick Start

### System Sweep (PATCH 596)

**Import and use**:
```typescript
import { SystemSweepDashboard, useSweepAudit } from '@/modules/system-sweep';

// Option 1: Use the dashboard component
<SystemSweepDashboard />

// Option 2: Use the hook
const { runSweep, result, isRunning } = useSweepAudit();
await runSweep();
```

**Direct API**:
```typescript
import { SystemSweepEngine } from '@/modules/system-sweep';

const engine = SystemSweepEngine.getInstance();
const result = await engine.runFullSweep();
console.log(`Found ${result.totalIssues} issues`);
```

---

### Smart Scheduler (PATCH 597)

**Import and use**:
```typescript
import { SmartSchedulerDashboard, useScheduler } from '@/modules/smart-scheduler';

// Option 1: Use the dashboard component
<SmartSchedulerDashboard />

// Option 2: Use the hook
const { generateTasks, createTask, tasks } = useScheduler();

// Generate AI tasks
const recommendations = await generateTasks({
  moduleName: 'PSC',
  vesselId: 'vessel-123',
  score: 65
});

// Create a task
await createTask(recommendations[0]);
```

**Direct API**:
```typescript
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const engine = SmartSchedulerEngine.getInstance();
const tasks = await engine.getTasks({ status: 'pending' });
```

---

## 📦 Module Structure

### System Sweep
```
src/modules/system-sweep/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript types
├── services/
│   ├── SystemSweepEngine.ts   # Main engine
│   ├── RouteAuditor.ts        # Route checks
│   ├── DependencyAuditor.ts   # Memory checks
│   ├── TypeScriptAuditor.ts   # TS checks
│   ├── PerformanceAuditor.ts  # Performance
│   ├── SupabaseAuditor.ts     # Schema checks
│   └── ConsoleErrorAuditor.ts # Error tracking
├── hooks/
│   └── useSweepAudit.ts       # React hook
└── components/
    └── SystemSweepDashboard.tsx # UI
```

### Smart Scheduler
```
src/modules/smart-scheduler/
├── index.ts                         # Main exports
├── types.ts                         # TypeScript types
├── services/
│   ├── SmartSchedulerEngine.ts     # Main engine
│   └── LLMTaskEngine.ts            # AI generation
├── hooks/
│   └── useScheduler.ts             # React hook
└── components/
    ├── SmartSchedulerDashboard.tsx  # Main UI
    ├── CalendarView.tsx            # Calendar
    └── AIGeneratedTaskPanel.tsx    # AI interface
```

---

## 🎯 Common Use Cases

### 1. Run System Health Check
```typescript
import { SystemSweepEngine } from '@/modules/system-sweep';

const checkSystemHealth = async () => {
  const engine = SystemSweepEngine.getInstance();
  const result = await engine.runFullSweep();
  
  if (result.criticalIssues > 0) {
    console.error('Critical issues found!', result.criticalIssues);
  }
  
  return result;
};
```

### 2. Generate Tasks After Inspection
```typescript
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const handleInspectionComplete = async (inspectionData) => {
  const scheduler = SmartSchedulerEngine.getInstance();
  
  const recommendations = await scheduler.generateTasksFromInspection({
    moduleName: inspectionData.module,
    vesselId: inspectionData.vesselId,
    score: inspectionData.score,
    findings: inspectionData.findings
  });
  
  // Auto-create high priority tasks
  for (const rec of recommendations) {
    if (rec.priority === 'critical' || rec.priority === 'high') {
      await scheduler.createTask(rec, inspectionData.assignedTo);
    }
  }
};
```

### 3. Get Overdue Tasks
```typescript
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const getOverdueTasks = async () => {
  const scheduler = SmartSchedulerEngine.getInstance();
  const tasks = await scheduler.getTasks({ status: 'overdue' });
  return tasks;
};
```

### 4. Monitor Specific Module
```typescript
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const getModuleTasks = async (module: string) => {
  const scheduler = SmartSchedulerEngine.getInstance();
  const tasks = await scheduler.getTasks({ 
    module,
    status: 'pending'
  });
  return tasks;
};
```

---

## 🔧 Configuration

### System Sweep
No configuration needed - runs on demand.

### Smart Scheduler
```typescript
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const engine = SmartSchedulerEngine.getInstance();

// Update configuration
engine.updateConfig({
  autoGenerateTasks: true,
  notifyAssignees: true,
  integrateWatchdog: true,
  enablePredictive: true,
  defaultPriority: 'medium',
  defaultDueDays: 7
});

// Start auto-generation (every hour)
engine.startAutoGeneration(3600000);
```

---

## 📊 Type Definitions

### System Sweep
```typescript
interface SweepIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
  autoFixable: boolean;
  timestamp: Date;
}

type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";
type IssueCategory = 
  | "build" | "routing" | "syntax" | "memory" 
  | "performance" | "dependencies" | "supabase" 
  | "lazy_loading" | "typescript" | "console_errors";
```

### Smart Scheduler
```typescript
interface ScheduledTask {
  id: string;
  module: string;
  relatedEntity?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date;
  assignedTo?: string;
  aiGenerated: boolean;
  status: TaskStatus;
  source: TaskSource;
  metadata?: Record<string, any>;
  createdAt: Date;
}

type TaskPriority = "critical" | "high" | "medium" | "low";
type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled" | "overdue";
type TaskSource = "manual" | "ai_generated" | "inspection" | "watchdog" | "scheduled";
```

---

## 🔗 Integration Examples

### Add to Admin Dashboard
```typescript
import { SystemSweepDashboard } from '@/modules/system-sweep';
import { SmartSchedulerDashboard } from '@/modules/smart-scheduler';

// In your router
<Route path="/admin/system-sweep" element={<SystemSweepDashboard />} />
<Route path="/admin/scheduler" element={<SmartSchedulerDashboard />} />
```

### Use in Existing Module
```typescript
// In your inspection module
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const MyInspectionComponent = () => {
  const handleSubmit = async (data) => {
    // ... save inspection ...
    
    // Generate follow-up tasks
    const scheduler = SmartSchedulerEngine.getInstance();
    await scheduler.generateTasksFromInspection({
      moduleName: 'PSC',
      vesselId: data.vesselId,
      score: data.score,
      findings: data.findings
    });
  };
};
```

---

## 🗄️ Database Queries

### Get tasks by priority
```typescript
const tasks = await scheduler.getTasks({ priority: 'critical' });
```

### Get tasks by user
```typescript
const tasks = await scheduler.getTasks({ assignedTo: userId });
```

### Get tasks by module
```typescript
const tasks = await scheduler.getTasks({ module: 'PSC' });
```

### Update task status
```typescript
await scheduler.updateTaskStatus(taskId, 'completed');
```

---

## ⚠️ Important Notes

1. **System Sweep**: Runs on-demand, not continuously
2. **Task Generation**: Requires AI service configuration
3. **Database**: Migration must be run before using scheduler
4. **Permissions**: RLS policies control data access
5. **Performance**: Large sweeps can take 5-10 seconds

---

## 🐛 Troubleshooting

### System Sweep not finding issues
- Check console for errors
- Ensure page is fully loaded
- Try running sweep multiple times

### Tasks not saving
- Verify Supabase migration is applied
- Check RLS policies
- Confirm user is authenticated

### AI generation failing
- Check AI service configuration
- Verify API keys
- Review AI service logs

---

## 📚 Additional Resources

- Full documentation: `PATCHES_596_597_IMPLEMENTATION_COMPLETE.md`
- Implementation summary: `PATCHES_596_597_SUMMARY.md`
- Database migration: `supabase/migrations/20251103150000_create_scheduled_tasks_table.sql`

---

**Last Updated**: November 3, 2025
**Version**: 1.0.0
**Status**: Production Ready (Pending Integration)
