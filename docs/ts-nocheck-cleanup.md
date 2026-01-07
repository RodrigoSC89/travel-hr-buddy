# TypeScript @ts-nocheck Cleanup Plan

**Project:** Nautilus One  
**Created:** 2025-01-07  
**Status:** In Progress

## 🎯 Objective

Eliminate all `@ts-nocheck` directives from the codebase while maintaining type safety and preventing runtime errors.

## 📊 Inventory Summary

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Core AI/Engine Logic | ~20 | 🔴 Critical | In Progress |
| UI Components | ~40 | 🟡 High | Pending |
| Test Files | ~50 | 🟢 Medium | Pending |
| Edge Functions (Deno) | ~30 | 🔵 Low | Requires Deno types |

**Total Files:** ~140

## ✅ Completed Corrections

### Batch 1 - Schema Alignment (2025-01-07)

| File | Issue | Fix Applied |
|------|-------|-------------|
| `src/core/clones/cognitiveClone.ts` | Supabase schema mismatch | Added `CloneRegistryRow`, `AiMemoryRow` types |
| `src/core/prioritization/autoBalancer.ts` | Json casting errors | Added `PriorityShiftInsert`, safe `castJson()` |
| `src/pages/crew/index.tsx` | `name` vs `full_name` | Aligned with `crew_members.full_name` |
| `src/components/sgso/audits/ActionPlanTab.tsx` | Wrong column refs | Fixed to use `plan_id`, `action_title`, etc. |
| `src/lib/validation/schemas.ts` | Zod v3.25+ API | Changed `.errors` → `.issues` |
| `src/hooks/useTypedSupabase.ts` | Created typed hooks | New file with type-safe Supabase access |

## 🔧 Classification by Root Cause

### 1. Supabase Schema Mismatch
**Files affected:** ~25  
**Solution:** Use types from `@/types/supabase-aliases.ts`

```typescript
// Before
const crew: any = await supabase.from('crew_members').select('*');

// After
import { CrewMember } from '@/types/supabase-aliases';
const { data: crew } = await supabase
  .from('crew_members')
  .select('*')
  .returns<CrewMember[]>();
```

### 2. Json Column Handling
**Files affected:** ~15  
**Solution:** Use `castJson()` and `extractMetadata()` helpers

```typescript
import { castJson } from '@/types/supabase-aliases';

// Before
const config = row.metadata as any;

// After  
const config = castJson<{ enabled: boolean }>(row.metadata, { enabled: false });
```

### 3. Third-Party Library Types (jsPDF, Chart.js)
**Files affected:** ~10  
**Solution:** Use proper imports and `@types/*` packages

```typescript
// For jsPDF with autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type assertion for autoTable
(doc as any).autoTable({ ... });
```

### 4. Dynamic Query Results
**Files affected:** ~8  
**Solution:** Use Zod validation for runtime type safety

```typescript
import { z } from 'zod';

const rowSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
});

const validated = rowSchema.safeParse(queryResult);
if (validated.success) {
  // Type-safe access to validated.data
}
```

### 5. Deno Edge Functions
**Files affected:** ~30  
**Solution:** Create shared types in `supabase/functions/_shared/`

```typescript
// supabase/functions/_shared/types.ts
export interface EdgeFunctionRequest {
  method: string;
  headers: Headers;
  body: unknown;
}

export interface EdgeFunctionResponse {
  status: number;
  data?: unknown;
  error?: string;
}
```

### 6. Test Mocking Complexity
**Files affected:** ~50  
**Solution:** Create typed mock factories

```typescript
// tests/mocks/supabase.ts
import type { Vessel } from '@/types/supabase-aliases';

export function createMockVessel(overrides: Partial<Vessel> = {}): Vessel {
  return {
    id: 'test-id',
    name: 'Test Vessel',
    organization_id: null,
    status: 'active',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
```

## 📋 Correction Checklist

### Phase 1: Core Logic (This Week)
- [x] `cognitiveClone.ts`
- [x] `autoBalancer.ts`
- [ ] `multi-mission-engine.ts`
- [ ] `intervessel-sync.ts`
- [ ] `mission-coordinator.ts`

### Phase 2: UI Components (Next Week)
- [ ] `IncidentCards.tsx`
- [ ] `EnhancedChannelManager.tsx`
- [ ] `AnalyticsQueryBuilder.tsx`
- [ ] `MissionControlConsolidation.tsx`

### Phase 3: Module Files
- [ ] SGSO module files
- [ ] DP module files
- [ ] MLC module files
- [ ] PSC module files

### Phase 4: Tests (Low Priority)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Phase 5: Edge Functions (Separate Track)
- [ ] Create `_shared/types.ts`
- [ ] Update all edge functions

## 🛡️ Prevention Guidelines

### TypeScript Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Code Review Checklist
- [ ] No new `@ts-nocheck` added
- [ ] Uses types from `supabase-aliases.ts`
- [ ] Json columns use helper functions
- [ ] Zod validation for external data

### Pre-commit Hook (Recommended)
```bash
# .husky/pre-commit
grep -r "@ts-nocheck" src/ --include="*.ts" --include="*.tsx" && exit 1 || exit 0
```

## 📈 Progress Tracking

```
Total Files:  ████████████████████ 140
Corrected:    █░░░░░░░░░░░░░░░░░░░ 6 (4.3%)
Remaining:    ███████████████████░ 134 (95.7%)
```

---

**Owner:** Engineering Team  
**Review Cycle:** Weekly during standup
