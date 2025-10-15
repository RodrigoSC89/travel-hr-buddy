# MMI OS Learning - AI Learning from Resolved Work Orders

## Overview

This feature implements a database structure to store and analyze resolved work orders (OS - Ordem de Serviço) for AI-powered learning and recommendations in the MMI (Marine Machinery Intelligence) system.

## Database Structure

### Tables

#### 1. `mmi_jobs` (Job Management)
Primary table for managing maintenance jobs and work orders.

**Fields:**
- `id` (UUID): Primary key
- `job_id` (TEXT): Unique job identifier
- `title` (TEXT): Job title
- `status` (TEXT): Job status (pending, in_progress, completed, awaiting_parts, postponed)
- `priority` (TEXT): Priority level (low, medium, high, critical)
- `due_date` (TIMESTAMP): Due date
- `component_name` (TEXT): Component being serviced
- `asset_name` (TEXT): Asset name
- `vessel_name` (TEXT): Vessel name
- `suggestion_ia` (TEXT): AI-generated suggestions
- `can_postpone` (BOOLEAN): Whether job can be postponed
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp
- `created_by` (UUID): User who created the job

**Indexes:**
- `idx_mmi_jobs_job_id`: On job_id field
- `idx_mmi_jobs_status`: On status field
- `idx_mmi_jobs_priority`: On priority field
- `idx_mmi_jobs_due_date`: On due_date field
- `idx_mmi_jobs_created_at`: On created_at field (descending)

#### 2. `mmi_os_resolvidas` (Resolved Work Orders)
Historical record of resolved work orders for AI learning.

**Fields:**
- `id` (UUID): Primary key
- `job_id` (UUID): Foreign key to mmi_jobs table
- `os_id` (TEXT): Work order ID
- `componente` (TEXT): Component that was serviced
- `descricao_tecnica` (TEXT): Technical description
- `acao_realizada` (TEXT): Action performed
- `resolvido_em` (TIMESTAMP): Resolution timestamp
- `duracao_execucao` (INTERVAL): Execution duration
- `efetiva` (BOOLEAN): Whether the action was effective
- `causa_confirmada` (TEXT): Confirmed root cause
- `evidencia_url` (TEXT): URL to evidence/documentation
- `created_at` (TIMESTAMP): Record creation timestamp

**Indexes:**
- `idx_os_resolvidas_componente`: On componente field (for efficient component searches)
- `idx_os_resolvidas_job_id`: On job_id field
- `idx_os_resolvidas_os_id`: On os_id field
- `idx_os_resolvidas_efetiva`: On efetiva field
- `idx_os_resolvidas_resolvido_em`: On resolvido_em field (descending)

### Views

#### `mmi_os_ia_feed` (AI Learning Feed)
Clean, filtered view of resolved work orders for AI consumption.

**Purpose:** Provides sanitized data to AI systems for:
- Learning patterns from resolved issues
- Generating predictive maintenance recommendations
- Identifying common failure modes
- Optimizing maintenance schedules

**Fields:**
- `job_id`: Related job ID
- `componente`: Component name
- `descricao_tecnica`: Technical description
- `acao_realizada`: Action taken
- `causa_confirmada`: Confirmed cause
- `efetiva`: Effectiveness flag
- `resolvido_em`: Resolution timestamp
- `duracao_execucao`: Execution duration

**Filter:** Only includes records where `efetiva IS NOT NULL` (completed and evaluated actions)

## Security (RLS Policies)

Both tables implement Row Level Security with the following policies:
- **SELECT**: All authenticated users can view records
- **INSERT**: All authenticated users can create records
- **UPDATE**: All authenticated users can update records
- **DELETE**: All authenticated users can delete records

The view `mmi_os_ia_feed` is accessible to all authenticated users via `GRANT SELECT`.

## Use Cases

### 1. AI Learning
The system can analyze patterns from `mmi_os_ia_feed` to:
- Predict which components are likely to fail
- Recommend preventive maintenance schedules
- Suggest optimal actions based on historical data
- Identify recurring issues

### 2. Performance Tracking
Track maintenance team performance:
- Average resolution time by component
- Success rate of different actions
- Most common failure causes

### 3. Knowledge Base
Build organizational knowledge:
- Document what works and what doesn't
- Create best practices from effective solutions
- Train new technicians with proven methods

## Integration with Frontend

TypeScript types are available in `src/integrations/supabase/types.ts`:
- `Database['public']['Tables']['mmi_jobs']`
- `Database['public']['Tables']['mmi_os_resolvidas']`
- `Database['public']['Views']['mmi_os_ia_feed']`

## Example Queries

### Insert a Resolved Work Order
```typescript
const { data, error } = await supabase
  .from('mmi_os_resolvidas')
  .insert({
    os_id: 'OS-123456',
    componente: 'Bomba Hidráulica #3',
    descricao_tecnica: 'Vazamento detectado no selo mecânico',
    acao_realizada: 'Substituição completa do selo mecânico',
    causa_confirmada: 'Desgaste por tempo de uso excessivo',
    efetiva: true,
    resolvido_em: new Date().toISOString(),
    duracao_execucao: '2 hours'
  });
```

### Query AI Feed for Learning
```typescript
const { data, error } = await supabase
  .from('mmi_os_ia_feed')
  .select('*')
  .eq('componente', 'Bomba Hidráulica #3')
  .order('resolvido_em', { ascending: false });
```

### Get Component History
```typescript
const { data, error } = await supabase
  .from('mmi_os_resolvidas')
  .select('*')
  .eq('componente', 'Sistema Hidráulico Principal')
  .eq('efetiva', true)
  .order('resolvido_em', { ascending: false });
```

## Migration Files

- `20251015000000_create_mmi_jobs.sql` - Creates the mmi_jobs table
- `20251015000001_create_mmi_os_resolvidas.sql` - Creates the mmi_os_resolvidas table and view

## Future Enhancements

1. **AI Integration**: Connect to OpenAI or similar services to analyze patterns
2. **Predictive Analytics**: Use machine learning to predict maintenance needs
3. **Automated Suggestions**: Generate suggestions based on historical data
4. **Performance Dashboards**: Visualize maintenance effectiveness
5. **Component Lifecycle**: Track component history from installation to replacement

## Related Files

- `/supabase/migrations/20251015000000_create_mmi_jobs.sql`
- `/supabase/migrations/20251015000001_create_mmi_os_resolvidas.sql`
- `/src/integrations/supabase/types.ts`
- `/src/services/mmi/jobsApi.ts`
- `/src/pages/MMIJobsPanel.tsx`
- `/src/components/mmi/JobCards.tsx`
