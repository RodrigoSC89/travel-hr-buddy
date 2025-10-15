# MMI OS Learning - Quick Reference Card

## 🚀 Quick Start

### Import the Service
```typescript
import {
  createResolvedWorkOrder,
  getResolvedWorkOrdersByComponent,
  getAiLearningFeed,
} from '@/services/mmi/resolvedWorkOrdersService';
```

---

## 📝 Common Operations

### 1. Record a Resolved Work Order
```typescript
const { data, error } = await createResolvedWorkOrder({
  os_id: 'OS-123456',
  componente: 'Bomba Hidráulica #3',
  descricao_tecnica: 'Vazamento no selo mecânico',
  acao_realizada: 'Substituição do selo',
  causa_confirmada: 'Desgaste natural',
  efetiva: true,
  resolvido_em: new Date().toISOString(),
  duracao_execucao: '2 hours',
  evidencia_url: 'https://...',
  job_id: 'uuid-here' // optional
});
```

### 2. Query Component History
```typescript
// All work orders
const { data } = await getResolvedWorkOrdersByComponent('Bomba Hidráulica #3');

// Only effective ones
const { data } = await getResolvedWorkOrdersByComponent('Bomba Hidráulica #3', true);
```

### 3. Get AI Learning Data
```typescript
// All components
const { data } = await getAiLearningFeed();

// Specific component
const { data } = await getAiLearningFeed('Motor Principal');

// Limited results
const { data } = await getAiLearningFeed('Sistema Hidráulico', 50);
```

### 4. Get Statistics
```typescript
const { data } = await getResolvedWorkOrderStats('Bomba Hidráulica #3');

// Returns:
// {
//   total: 47,
//   effective: 43,
//   ineffective: 2,
//   pending: 2,
//   effectivenessRate: 91.5,
//   avgDurationMinutes: 135
// }
```

### 5. Update Effectiveness
```typescript
const { data } = await updateWorkOrderEffectiveness(
  'work-order-id',
  true, // effective
  'Desgaste confirmado após inspeção'
);
```

### 6. Analyze Common Causes
```typescript
const { data } = await getMostCommonCauses('Motor Principal', 5);

// Returns:
// [
//   { causa: 'Desgaste natural', count: 12 },
//   { causa: 'Falta de manutenção', count: 8 },
//   ...
// ]
```

### 7. Find Best Actions
```typescript
const { data } = await getMostEffectiveActions('Sistema Hidráulico', 5);

// Returns:
// [
//   { acao: 'Substituição completa', successRate: 95.2, count: 21 },
//   { acao: 'Reparo do selo', successRate: 87.5, count: 16 },
//   ...
// ]
```

---

## 🗄️ Database Tables

### mmi_jobs
Main jobs table - tracks maintenance work
- `job_id` (TEXT) - Unique job identifier
- `status` - pending | in_progress | completed | awaiting_parts | postponed
- `priority` - low | medium | high | critical

### mmi_os_resolvidas
Historical resolved work orders for AI learning
- `os_id` (TEXT) - Work order ID
- `componente` (TEXT) - Component name
- `efetiva` (BOOLEAN) - Was the action effective?
- `causa_confirmada` (TEXT) - Confirmed root cause

### mmi_os_ia_feed (VIEW)
Clean data for AI consumption
- Filters: `WHERE efetiva IS NOT NULL`
- Purpose: Machine learning and pattern recognition

---

## 🔑 TypeScript Types

```typescript
import { Database } from '@/integrations/supabase/types';

type MmiJob = Database['public']['Tables']['mmi_jobs']['Row'];
type MmiOsResolvidas = Database['public']['Tables']['mmi_os_resolvidas']['Row'];
type MmiOsIaFeed = Database['public']['Views']['mmi_os_ia_feed']['Row'];
```

---

## 🎯 Use Cases

### 1. Log Resolution After Job Complete
```typescript
// After completing a maintenance job
await createResolvedWorkOrder({
  os_id: jobData.os_id,
  componente: jobData.component_name,
  descricao_tecnica: 'Issue description',
  acao_realizada: 'What was done',
  resolvido_em: new Date().toISOString(),
  duracao_execucao: '3 hours',
  efetiva: null, // To be evaluated later
});
```

### 2. Evaluate Effectiveness Later
```typescript
// After verifying the fix works
await updateWorkOrderEffectiveness(
  workOrderId,
  true,
  'Fix confirmed after 48h operation'
);
```

### 3. Get Recommendations Before Work
```typescript
// Check what worked before for this component
const history = await getResolvedWorkOrdersByComponent(component, true);
const actions = await getMostEffectiveActions(component);

// Show suggestions to technician
console.log('Recommended actions:', actions);
```

### 4. Generate Reports
```typescript
// Monthly maintenance report
const stats = await getResolvedWorkOrderStats();
const causes = await getMostCommonCauses('All Components', 10);

// Generate insights for management
const report = {
  successRate: stats.effectivenessRate,
  avgResolutionTime: stats.avgDurationMinutes,
  topIssues: causes,
};
```

---

## 🔍 Query Examples

### Direct Supabase Queries
```typescript
import { supabase } from '@/integrations/supabase/client';

// Get all work orders from last month
const { data } = await supabase
  .from('mmi_os_resolvidas')
  .select('*')
  .gte('resolvido_em', '2025-09-01')
  .order('resolvido_em', { ascending: false });

// Get AI feed for specific vessel
const { data } = await supabase
  .from('mmi_os_ia_feed')
  .select('*')
  .ilike('componente', '%Oceanic Explorer%')
  .limit(100);
```

---

## 📊 Statistics Formulas

```typescript
// Effectiveness Rate
effectivenessRate = (effective / total) * 100

// Average Duration (in minutes)
avgDuration = sum(durations) / count(items_with_duration)

// Success Rate per Action
successRate = (successful / total_attempts) * 100
```

---

## 🚨 Error Handling

```typescript
const { data, error } = await createResolvedWorkOrder({...});

if (error) {
  console.error('Failed to create work order:', error);
  // Handle error appropriately
} else {
  console.log('Work order created:', data);
}
```

---

## 📚 Documentation Files

- **Full Documentation:** `MMI_OS_LEARNING_README.md`
- **Visual Summary:** `MMI_OS_LEARNING_VISUAL_SUMMARY.md`
- **This Quick Ref:** `MMI_OS_LEARNING_QUICKREF.md`

---

## ✅ Testing

Run tests:
```bash
npm test src/tests/mmi-resolved-work-orders-service.test.ts
```

All tests:
```bash
npm test
```

---

## 🔗 Related Files

- Service: `src/services/mmi/resolvedWorkOrdersService.ts`
- Types: `src/integrations/supabase/types.ts`
- Tests: `src/tests/mmi-resolved-work-orders-service.test.ts`
- Migration 1: `supabase/migrations/20251015000000_create_mmi_jobs.sql`
- Migration 2: `supabase/migrations/20251015000001_create_mmi_os_resolvidas.sql`

---

## 💡 Tips

1. **Always set efetiva after verification** - Don't mark as effective immediately
2. **Use descriptive causa_confirmada** - Helps AI learn patterns
3. **Include evidence_url when possible** - Links to photos, reports, etc.
4. **Calculate durations accurately** - Important for time estimation
5. **Query AI feed regularly** - Keep learning data fresh

---

## 🎓 Best Practices

✅ **DO:**
- Log all completed work orders
- Update effectiveness after verification
- Include detailed technical descriptions
- Track actual duration times
- Link evidence when available

❌ **DON'T:**
- Mark as effective without verification
- Leave causa_confirmada empty for completed work
- Use generic descriptions
- Forget to update job_id reference

---

**Need Help?** Check the full documentation in `MMI_OS_LEARNING_README.md`

**Status:** ✅ Production Ready | All Tests Passing | TypeScript Enabled
