# PATCH 596 & 597 - Full System Sweep + Smart Scheduler

## Executive Summary

This implementation delivers two critical modules for Nautilus One system:

1. **PATCH 596 - Full System Sweep**: Comprehensive system auditing and stability monitoring
2. **PATCH 597 - Smart Scheduler**: AI-powered intelligent task scheduling and generation

## PATCH 596: Full System Sweep

### Overview
A complete system audit framework that performs deep scanning of the Nautilus One codebase to identify stability issues, performance bottlenecks, and potential problems before they impact production.

### Features

#### 1. Route Validation
- Detects broken routes and missing content
- Validates lazy loading with Suspense boundaries
- Checks for error boundary coverage
- Identifies routes without proper fallbacks

#### 2. Dependency Auditing
- Monitors for memory leaks from uncleaned timers
- Detects excessive event listeners
- Identifies potential circular dependencies
- Tracks cleanup function usage in useEffect hooks

#### 3. TypeScript Quality Checks
- Identifies files using `@ts-ignore` or `@ts-nocheck`
- Detects excessive use of `any` type
- Validates type safety across the codebase
- Suggests improvements for type coverage

#### 4. Performance Monitoring
- Tracks component render times (>2000ms threshold)
- Identifies slow-rendering components
- Monitors memory usage and heap size
- Detects excessive lazy loading on single routes

#### 5. Supabase Schema Validation
- Validates table references against actual schema
- Checks for missing tables referenced in code
- Monitors connection health and latency
- Ensures schema synchronization

#### 6. Console Error Tracking
- Captures and aggregates console errors
- Groups similar errors for analysis
- Tracks error frequency and patterns
- Provides actionable insights

### Architecture

```
src/modules/system-sweep/
├── index.ts                          # Module exports
├── types.ts                          # TypeScript definitions
├── services/
│   ├── SystemSweepEngine.ts          # Main orchestration engine
│   ├── RouteAuditor.ts              # Route validation
│   ├── DependencyAuditor.ts         # Memory leak detection
│   ├── TypeScriptAuditor.ts         # TS quality checks
│   ├── PerformanceAuditor.ts        # Performance monitoring
│   ├── SupabaseAuditor.ts           # Schema validation
│   └── ConsoleErrorAuditor.ts       # Error tracking
├── hooks/
│   └── useSweepAudit.ts             # React integration hook
└── components/
    └── SystemSweepDashboard.tsx      # UI component
```

### Usage

#### Basic Usage
```typescript
import { SystemSweepEngine } from '@/modules/system-sweep';

// Run full system sweep
const engine = SystemSweepEngine.getInstance();
const result = await engine.runFullSweep();

console.log(`Found ${result.totalIssues} issues`);
console.log(`Critical: ${result.criticalIssues}`);
```

#### Using React Hook
```typescript
import { useSweepAudit } from '@/modules/system-sweep';

function MyComponent() {
  const { isRunning, result, runSweep } = useSweepAudit();
  
  return (
    <button onClick={runSweep} disabled={isRunning}>
      Run System Sweep
    </button>
  );
}
```

#### Using Dashboard Component
```typescript
import { SystemSweepDashboard } from '@/modules/system-sweep';

function AdminPage() {
  return <SystemSweepDashboard />;
}
```

### Issue Categories

- **build**: Build and compilation errors
- **routing**: Route configuration and loading issues
- **syntax**: Code syntax and formatting problems
- **memory**: Memory leaks and resource cleanup
- **performance**: Slow renders and bottlenecks
- **dependencies**: Hook dependency issues
- **supabase**: Database schema mismatches
- **lazy_loading**: Excessive or problematic lazy loading
- **typescript**: Type safety issues
- **console_errors**: Runtime console errors

### Severity Levels

- **critical**: Requires immediate attention, blocks functionality
- **high**: Important issue that should be fixed soon
- **medium**: Should be addressed but not urgent
- **low**: Minor issue or optimization opportunity
- **info**: Informational, no action required

---

## PATCH 597: Smart Scheduler

### Overview
An AI-powered intelligent task scheduling and generation system that automatically creates preventive and corrective tasks based on inspection results, historical data, and predictive analysis.

### Features

#### 1. AI Task Generation
- Analyzes inspection results and generates relevant tasks
- Uses LLM to create intelligent recommendations
- Provides justification and risk scoring for each task
- Suggests appropriate priorities and deadlines

#### 2. Task Management
- Create, update, and track scheduled tasks
- Assign tasks to team members
- Monitor task status (pending, in progress, completed, overdue)
- Tag and categorize tasks by module and entity

#### 3. Calendar Integration
- Visual calendar view of scheduled tasks
- 30-day task preview
- Priority-based color coding
- Date-based task organization

#### 4. Smart Scheduling
- Automatic task generation based on patterns
- Predictive task recommendations
- Integration with inspection modules (PSC, MLC, LSA, OVID)
- Watchdog integration for overdue alerts

#### 5. Notification System
- Notify assignees of new tasks
- Alert on approaching deadlines
- Escalate overdue tasks
- Integration with notification center

### Architecture

```
src/modules/smart-scheduler/
├── index.ts                          # Module exports
├── types.ts                          # TypeScript definitions
├── services/
│   ├── SmartSchedulerEngine.ts      # Core scheduling logic
│   └── LLMTaskEngine.ts             # AI task generation
├── hooks/
│   └── useScheduler.ts              # React integration hook
└── components/
    ├── SmartSchedulerDashboard.tsx   # Main dashboard
    ├── CalendarView.tsx             # Calendar component
    └── AIGeneratedTaskPanel.tsx     # AI generation interface
```

### Database Schema

```sql
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY,
  module TEXT NOT NULL,
  related_entity UUID,
  title TEXT,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  created_by UUID,
  assigned_to UUID,
  ai_generated BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT DEFAULT 'manual',
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

### Usage

#### Generate AI Tasks
```typescript
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

const engine = SmartSchedulerEngine.getInstance();

// Generate tasks from inspection
const recommendations = await engine.generateTasksFromInspection({
  moduleName: 'PSC',
  vesselId: 'vessel-123',
  score: 65,
  findings: ['Equipment outdated', 'Documentation missing'],
  history: []
});

// Create tasks from recommendations
for (const rec of recommendations) {
  await engine.createTask(rec, 'user-id');
}
```

#### Using React Hook
```typescript
import { useScheduler } from '@/modules/smart-scheduler';

function TaskManager() {
  const { tasks, loading, generateTasks, createTask } = useScheduler();
  
  const handleGenerate = async () => {
    const recommendations = await generateTasks({
      moduleName: 'MLC',
      vesselId: 'vessel-456',
      score: 70
    });
    
    for (const rec of recommendations) {
      await createTask(rec);
    }
  };
  
  return (
    <div>
      <button onClick={handleGenerate}>Generate Tasks</button>
      <div>Total tasks: {tasks.length}</div>
    </div>
  );
}
```

#### Using Dashboard Component
```typescript
import { SmartSchedulerDashboard } from '@/modules/smart-scheduler';

function SchedulingPage() {
  return <SmartSchedulerDashboard />;
}
```

### Task Properties

#### Priority Levels
- **critical**: Urgent, requires immediate action
- **high**: Important, should be addressed soon
- **medium**: Normal priority
- **low**: Can be scheduled flexibly

#### Status Types
- **pending**: Not started, awaiting action
- **in_progress**: Currently being worked on
- **completed**: Task finished successfully
- **cancelled**: Task was cancelled
- **overdue**: Past due date, requires attention

#### Task Sources
- **manual**: Created by user
- **ai_generated**: Generated by AI engine
- **inspection**: Created from inspection results
- **watchdog**: Triggered by system watchdog
- **scheduled**: Automatically scheduled routine task

### LLM Integration

The LLM Task Engine uses AI to generate intelligent task recommendations:

```typescript
// Example AI prompt
const prompt = `
Based on the following inspection data for module "PSC", 
generate preventive and corrective operational tasks:

Vessel ID: vessel-123
Last Inspection: 2025-10-15
Current Score: 65
Recent Findings: Equipment outdated, Documentation missing

Generate tasks with:
- Title
- Priority (Critical, High, Medium, Low)
- Suggested Due Date (in days)
- Justification
- Risk Score (1-10)
`;

// AI Response (parsed automatically)
[
  {
    title: "Replace outdated safety equipment",
    priority: "High",
    dueDays: 7,
    justification: "Current equipment fails inspection standards",
    riskScore: 8
  }
]
```

---

## Integration Points

### 1. System Watchdog Integration
Both modules integrate with the existing System Watchdog:
- System Sweep reports issues to watchdog
- Smart Scheduler alerts on overdue tasks
- Shared error tracking and reporting

### 2. Dashboard Integration
Add to admin dashboard or control center:
```typescript
import { SystemSweepDashboard } from '@/modules/system-sweep';
import { SmartSchedulerDashboard } from '@/modules/smart-scheduler';

// In admin routes
<Route path="/admin/system-sweep" element={<SystemSweepDashboard />} />
<Route path="/admin/scheduler" element={<SmartSchedulerDashboard />} />
```

### 3. Module Integration
Connect with existing inspection modules:
```typescript
// After completing an inspection
import { SmartSchedulerEngine } from '@/modules/smart-scheduler';

async function handleInspectionComplete(inspectionData) {
  const scheduler = SmartSchedulerEngine.getInstance();
  
  // Generate follow-up tasks
  await scheduler.generateTasksFromInspection({
    moduleName: 'PSC',
    vesselId: inspectionData.vesselId,
    score: inspectionData.score,
    findings: inspectionData.findings
  });
}
```

---

## Configuration

### System Sweep Configuration
```typescript
// No additional configuration needed
// Runs on-demand via dashboard or API
```

### Smart Scheduler Configuration
```typescript
const engine = SmartSchedulerEngine.getInstance();

engine.updateConfig({
  autoGenerateTasks: true,      // Enable automatic task generation
  notifyAssignees: true,         // Send notifications to assignees
  integrateWatchdog: true,       // Connect with system watchdog
  enablePredictive: true,        // Enable predictive task generation
  defaultPriority: 'medium',     // Default task priority
  defaultDueDays: 7              // Default days until due
});

// Start automatic task generation (checks every hour)
engine.startAutoGeneration(3600000);
```

---

## Validation & Testing

### Run Build Validation
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

### Run Linting
```bash
npm run lint
```

### Check TypeScript
```bash
npm run type-check
```

---

## Security Considerations

1. **RLS Policies**: All database operations respect Row Level Security
2. **Authentication**: Task operations require authenticated users
3. **Authorization**: Task updates limited to assignees and creators
4. **Data Validation**: Input validation on all task properties
5. **XSS Protection**: All user inputs sanitized in UI components

---

## Performance Optimization

1. **Lazy Loading**: Modules use React.lazy for code splitting
2. **Memoization**: Expensive calculations cached with useMemo
3. **Pagination**: Large task lists paginated for performance
4. **Indexing**: Database indexes on frequently queried columns
5. **Parallel Execution**: Auditors run in parallel for faster sweeps

---

## Future Enhancements

### System Sweep
- [ ] Build-time static analysis integration
- [ ] Automated fix generation for common issues
- [ ] Integration with CI/CD pipeline
- [ ] Historical trend analysis
- [ ] Performance regression detection

### Smart Scheduler
- [ ] Machine learning for task prioritization
- [ ] Natural language task creation
- [ ] Recurring task templates
- [ ] Task dependencies and workflows
- [ ] Mobile notifications via Capacitor

---

## Commit Message Template
```
PATCH 596 & 597 - Full System Sweep and Smart Scheduler

- Implemented comprehensive system auditing framework
- Added AI-powered task generation and scheduling
- Created 6 specialized auditors for different concerns
- Built React UI components for both modules
- Added Supabase schema for scheduled tasks
- Integrated with existing watchdog and notification systems

Validations:
✅ Build passes
✅ TypeScript compilation successful
✅ All modules properly structured
⏳ Tests pending
⏳ Integration with dashboard pending
```

---

## Support & Documentation

For questions or issues:
1. Check this README
2. Review module source code comments
3. Consult Supabase schema documentation
4. Contact development team

---

## License
Part of Nautilus One System - Proprietary
