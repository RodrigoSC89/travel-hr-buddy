# Workflow AI Extension

## Overview

This module extends the workflow system with AI-powered adaptive intelligence capabilities. It provides a structured way to store and query AI-generated suggestions for workflow improvements.

## Database Schema

### Table: `workflow_ai_suggestions`

Stores AI-generated suggestions for workflows.

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `workflow_id` | UUID | Foreign key reference to `smart_workflows(id)` |
| `etapa` | TEXT | Workflow stage where the suggestion applies |
| `tipo_sugestao` | TEXT | Type of suggestion (e.g., 'Criar tarefa', 'Ajustar prazo', 'Trocar responsável') |
| `conteudo` | TEXT | Detailed content of the suggestion |
| `gerada_em` | TIMESTAMP WITH TIME ZONE | When the suggestion was generated (default: now) |
| `gerada_por` | TEXT | Identifier of who/what generated the suggestion (default: 'IA') |
| `criticidade` | TEXT | Criticality level of the suggestion |
| `responsavel_sugerido` | TEXT | Suggested responsible party |
| `origem` | TEXT | Origin of suggestion (e.g., 'MMI', 'Logs', 'Checklists', 'Manual') |

#### Features

- **Foreign Key Constraint**: References `smart_workflows(id)` with CASCADE delete
- **Row Level Security (RLS)**: Enabled with policies for authenticated users
- **Indexes**: Optimized for common query patterns
  - `workflow_id` - For filtering by workflow
  - `gerada_em` - For time-based queries (DESC order)
  - `tipo_sugestao` - For filtering by suggestion type
  - `criticidade` - For filtering by criticality
  - `origem` - For filtering by source

### View: `workflow_ai_recent`

Provides quick access to recent AI suggestions from the last 30 days.

#### Query
```sql
SELECT * FROM workflow_ai_recent;
```

Returns all suggestions generated in the last 30 days, ordered by `gerada_em` DESC.

## Usage Examples

### Creating a Suggestion

```sql
INSERT INTO workflow_ai_suggestions (
    workflow_id,
    etapa,
    tipo_sugestao,
    conteudo,
    criticidade,
    responsavel_sugerido,
    origem
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'Revisão de Documentos',
    'Criar tarefa',
    'Recomenda-se criar uma tarefa de validação dos documentos técnicos',
    'alta',
    'João Silva',
    'Checklists'
);
```

### Querying Recent Suggestions

```sql
-- Get all recent suggestions
SELECT * FROM workflow_ai_recent;

-- Get suggestions by workflow
SELECT * FROM workflow_ai_suggestions 
WHERE workflow_id = '123e4567-e89b-12d3-a456-426614174000';

-- Get high criticality suggestions
SELECT * FROM workflow_ai_suggestions 
WHERE criticidade = 'alta' 
ORDER BY gerada_em DESC;

-- Get suggestions by origin
SELECT * FROM workflow_ai_suggestions 
WHERE origem = 'MMI' 
AND gerada_em > now() - INTERVAL '7 days';
```

## Suggestion Types

Common values for `tipo_sugestao`:
- `Criar tarefa` - Create a new task
- `Ajustar prazo` - Adjust deadline
- `Trocar responsável` - Change responsible party
- `Adicionar recurso` - Add resource
- `Revisar prioridade` - Review priority

## Suggestion Origins

Common values for `origem`:
- `MMI` - Maritime Management Insights
- `Logs` - System logs analysis
- `Checklists` - Checklist analysis
- `Audit Logs` - Audit trail analysis
- `Relatório MMI` - MMI report analysis
- `Manual` - Manually created suggestion

## Security

All operations require authentication. The following policies are in place:

- **SELECT**: All authenticated users can view suggestions
- **INSERT**: All authenticated users can create suggestions
- **UPDATE**: All authenticated users can update suggestions
- **DELETE**: All authenticated users can delete suggestions

## Integration with Copilot IA

This table serves as input for GitHub Copilot and other AI assistants to:
- Analyze workflow patterns
- Suggest improvements
- Identify bottlenecks
- Recommend task assignments
- Optimize workflow efficiency

## Migration File

- **File**: `supabase/migrations/20251015014110_create_workflow_ai_extension.sql`
- **Created**: 2025-10-15
- **Description**: Creates the workflow_ai_suggestions table and workflow_ai_recent view

## Next Steps

After deploying this migration:

1. **Regenerate TypeScript Types**: Run Supabase type generation to update `src/integrations/supabase/types.ts`
2. **Create API Endpoints**: Implement REST/GraphQL endpoints for CRUD operations
3. **Build UI Components**: Create React components for displaying and managing suggestions
4. **Implement AI Logic**: Develop the AI analysis logic to generate suggestions automatically
5. **Add Notifications**: Notify users when new high-criticality suggestions are created

## Testing

To test the migration locally:

```bash
# Apply migration (requires Supabase CLI and local instance)
supabase db reset
supabase migration up

# Or apply to remote database
supabase db push
```

## Support

For issues or questions about the Workflow AI Extension, please refer to the main project documentation or create an issue in the repository.
