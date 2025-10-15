# Workflow Suggestion Templates

This module provides reusable workflow suggestion templates that can be used as starting points for new action plans and internal audits.

## Purpose

The workflow suggestion templates serve as historical best practices that can be:
- Reused as starting points for new workflows
- Used to learn from previous successful implementations
- Offered as contextual suggestions when creating new action plans
- Referenced during internal audits

## Structure

Each `WorkflowSuggestionTemplate` contains:

- **etapa**: Description of the workflow step
- **tipo_sugestao**: Type of suggestion (e.g., "Criar tarefa", "Ajustar prazo")
- **conteudo**: Detailed content of the suggestion
- **criticidade**: Priority level ("Alta", "Média", or "Baixa")
- **responsavel_sugerido**: Suggested responsible party
- **origem**: Origin of the template (e.g., "Template Histórico")

## Usage

### Importing the Templates

```typescript
import { 
  workflowSuggestionTemplates, 
  WorkflowSuggestionTemplate 
} from '@/lib/workflows/suggestionTemplates';
```

### Example Usage

```typescript
// Access all templates
const templates = workflowSuggestionTemplates;

// Filter by criticidade
const highPriorityTemplates = workflowSuggestionTemplates.filter(
  template => template.criticidade === "Alta"
);

// Filter by tipo_sugestao
const taskTemplates = workflowSuggestionTemplates.filter(
  template => template.tipo_sugestao === "Criar tarefa"
);
```

### Creating New Templates

You can extend the templates array by following the same structure:

```typescript
const newTemplate: WorkflowSuggestionTemplate = {
  etapa: "Your workflow step",
  tipo_sugestao: "Action type",
  conteudo: "Detailed description",
  criticidade: "Média",
  responsavel_sugerido: "Responsible party",
  origem: "Template Histórico",
};
```

## Current Templates

The module currently includes 3 historical templates:

1. **Verificar status de sensores redundantes** (Alta criticidade)
   - Type: Criar tarefa
   - Responsible: Oficial de Náutica
   - Focus: Backup sensor verification for position and heading

2. **Atualizar documento de FMEA embarcado** (Média criticidade)
   - Type: Criar tarefa
   - Responsible: Engenharia Onshore
   - Focus: FMEA document version verification

3. **Revisar checklists incompletos no último mês** (Alta criticidade)
   - Type: Ajustar prazo
   - Responsible: Supervisor de DP
   - Focus: Incomplete checklist review

## Testing

Tests are located at `src/tests/workflows/suggestionTemplates.test.ts` and cover:
- Template structure validation
- Data integrity checks
- Type safety verification
- Individual template property validation

Run tests with:
```bash
npm test src/tests/workflows/suggestionTemplates.test.ts
```

## Integration

These templates can be integrated with:
- Smart Workflow components
- PEOTRAM workflow manager
- Workflow automation systems
- AI-powered workflow suggestions

### Example Integration

See `exampleIntegration.ts` for practical examples of how to use these templates, including:
- Converting templates to workflow format
- Filtering by criticidade or responsible party
- Creating derived workflows from templates
- Generating summary statistics

Example usage:
```typescript
import { getHighPriorityTemplates, getTemplateSummary } from '@/lib/workflows/exampleIntegration';

// Get all high priority templates
const urgentTemplates = getHighPriorityTemplates();

// Get summary statistics
const stats = getTemplateSummary();
console.log(`Total: ${stats.total}, High: ${stats.alta}, Medium: ${stats.media}`);
```

## Files in this Module

- `suggestionTemplates.ts` - Core template definitions and types
- `exampleIntegration.ts` - Example integration functions
- `README.md` - This documentation file

## Future Enhancements

Potential future improvements:
- Database storage for dynamic templates
- User-defined template creation
- Template versioning
- Template usage analytics
- AI-generated template recommendations
