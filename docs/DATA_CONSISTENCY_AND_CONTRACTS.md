# NAUTI ONE — Data Consistency & Contracts

## Zod Schemas (src/contracts/schemas.ts)

### Core Entity Schemas

| Entity | Schema | Input (Create) | Input (Update) |
|--------|--------|-----------------|-----------------|
| Vessel | `VesselSchema` | `CreateVesselInput` | `UpdateVesselInput` |
| CrewMember | `CrewMemberSchema` | `CreateCrewMemberInput` | `UpdateCrewMemberInput` |
| Document | `DocumentSchema` | `CreateDocumentInput` | — |
| Incident | `IncidentSchema` | `CreateIncidentInput` | `UpdateIncidentInput` |
| Audit | `AuditSchema` | — | — |
| ActionItem | `ActionItemSchema` | `CreateActionItemInput` | `UpdateActionItemInput` |

### Usage Example

```typescript
import { VesselSchema, safeParseArray } from '@/contracts';

const { data } = await supabase.from('vessels').select('*');
const vessels = safeParseArray(VesselSchema, data || []);
// vessels is typed and validated - invalid rows filtered out
```

### Error Normalization (src/contracts/error-normalization.ts)

Maps raw errors to `NormalizedError`:
```typescript
interface NormalizedError {
  message: string;     // PT-BR user message
  detail: string;      // Technical detail
  category: string;    // auth | network | validation | permission | ...
  statusCode: number;  // HTTP-like code
  retryable: boolean;  // Should UI offer retry?
}
```

### Standardized Hooks

**useSupabaseMutation** (src/hooks/shared/use-supabase-mutation.ts):
```typescript
const mutation = useSupabaseMutation({
  mutationFn: (data) => supabase.from('vessels').insert(data),
  invalidateKeys: [['vessels']],
  successMessage: 'Navio criado com sucesso!',
});
```

### React Query Standards
- `staleTime`: 5 minutes (default)
- `retry`: 1 attempt
- Mutations always invalidate related queries
- Errors always normalized and displayed via toast

## How to Debug Data Issues
1. Check browser console for `[DataContract] Validation failed` warnings
2. Check Sentry for `[Query] ... FAILED` breadcrumbs
3. Use `normalizeError()` to understand error category
4. Check Supabase logs for RLS/permission issues
