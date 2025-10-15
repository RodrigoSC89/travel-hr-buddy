# Kanban AI Suggestions Component

## Overview

The `KanbanAISuggestions` component provides AI-powered suggestions for workflow management with full Supabase integration. It enables users to review and accept AI-generated recommendations, which are then automatically saved to the database for traceability and audit purposes.

## Features

✅ **Supabase Integration**: Automatically saves accepted suggestions to `workflow_ai_suggestions` table
🧠 **AI-Powered Suggestions**: Displays AI-generated recommendations for workflow optimization
📊 **State Management**: Tracks accepted suggestions with visual feedback
🔔 **Toast Notifications**: Provides user feedback for successful actions and errors
🎨 **Modern UI**: Clean, intuitive interface with emoji indicators
♿ **Error Handling**: Robust error handling with state rollback on failures

## Installation

The component is located at:
```
/src/components/workflows/KanbanAISuggestions.tsx
```

Import it in your project:
```typescript
import { KanbanAISuggestions } from '@/components/workflows';
```

## Usage

### Basic Usage

```tsx
import { KanbanAISuggestions } from '@/components/workflows';

function MyWorkflowPage() {
  const suggestions = [
    {
      etapa: "Planejamento",
      tipo_sugestao: "Otimização",
      conteudo: "Adicionar checkpoint de revisão antes de passar para desenvolvimento",
      criticidade: "Alta",
      responsavel_sugerido: "João Silva"
    },
    {
      etapa: "Desenvolvimento",
      tipo_sugestao: "Melhoria",
      conteudo: "Implementar testes automatizados para cada feature",
      criticidade: "Média",
      responsavel_sugerido: "Maria Santos"
    }
  ];

  return (
    <div>
      <h1>Meu Workflow</h1>
      <KanbanAISuggestions suggestions={suggestions} />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `suggestions` | `Suggestion[]` | Yes | Array of AI-generated suggestions to display |

### Suggestion Interface

```typescript
interface Suggestion {
  etapa: string;              // Workflow stage/step name
  tipo_sugestao: string;      // Type of suggestion (e.g., "Otimização", "Melhoria")
  conteudo: string;           // Detailed suggestion content
  criticidade: string;        // Criticality level (e.g., "Alta", "Média", "Baixa")
  responsavel_sugerido: string; // Suggested responsible person
}
```

## Database Schema

The component saves data to the `workflow_ai_suggestions` table with the following structure:

```sql
CREATE TABLE workflow_ai_suggestions (
  id UUID PRIMARY KEY,
  etapa TEXT NOT NULL,
  tipo_sugestao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criticidade TEXT NOT NULL,
  responsavel_sugerido TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'Copilot',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  workflow_id UUID REFERENCES smart_workflows(id),
  status TEXT DEFAULT 'pending',
  metadata JSONB
);
```

### Migration

To create the database table, run the migration:
```bash
supabase migration up 20251015020000_create_workflow_ai_suggestions.sql
```

## Key Benefits

### 🔍 Rastreabilidade
Track all AI-suggested decisions with complete audit trail in Supabase.

### 📚 Histórico Auditável
Maintain a comprehensive history of all AI suggestions and user actions.

### 🤖 Aprendizado Contínuo
Build a knowledge base for continuous improvement of AI recommendations.

## Component Behavior

### Visual Feedback

- **Unaccepted Suggestions**: Displayed with full opacity and an "Aceitar sugestão" button
- **Accepted Suggestions**: Displayed with reduced opacity (50%) and no action button
- **Loading State**: Button becomes disabled while processing

### Toast Notifications

#### Success
```
Title: "Sucesso"
Description: "Sugestão da IA aceita e salva com sucesso!"
```

#### Error
```
Title: "Erro"
Description: "Não foi possível salvar a sugestão da IA"
Variant: "destructive"
```

### Error Handling

The component implements robust error handling:

1. **State Rollback**: If saving fails, the suggestion is automatically unmarked as accepted
2. **User Notification**: Error toast is displayed with details
3. **Console Logging**: Errors are logged for debugging purposes

## Testing

Comprehensive tests are available at:
```
/src/tests/components/workflows/KanbanAISuggestions.test.ts
```

Run tests with:
```bash
npm test -- src/tests/components/workflows/KanbanAISuggestions.test.ts
```

Test coverage includes:
- ✅ Component structure validation
- ✅ Database integration
- ✅ State management
- ✅ UI elements
- ✅ Error handling
- ✅ Toast notifications
- ✅ Data validation

## Dependencies

- `@/components/ui/card` - Card components for layout
- `@/components/ui/button` - Button component
- `@/integrations/supabase/client` - Supabase client
- `@/hooks/use-toast` - Toast notification hook
- `react` - React library

## Integration with Existing Workflows

The component can be easily integrated into existing workflow pages, such as:

```tsx
// In /pages/admin/workflows/detail.tsx
import { KanbanAISuggestions } from '@/components/workflows';

// Add after workflow details
<KanbanAISuggestions suggestions={aiSuggestions} />
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Add workflow_id linking to suggestions
- [ ] Implement suggestion rejection feature
- [ ] Add filtering and sorting capabilities
- [ ] Include suggestion priority indicators
- [ ] Support bulk accept/reject actions
- [ ] Add suggestion history view
- [ ] Implement AI suggestion refresh

## Support

For issues or questions:
1. Check the test file for usage examples
2. Review the Supabase migration for schema details
3. Consult the component source code for implementation details

## License

Part of the Travel HR Buddy application. See main project license for details.
