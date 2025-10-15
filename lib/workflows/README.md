# Workflow Suggestion Templates

Historical workflow suggestions that can be reused as starting points for new action plans and internal audits.

## 📦 What's Included

- **suggestionTemplates.ts**: Core template definitions with TypeScript types
- **exampleIntegration.ts**: Helper functions for integrating templates
- **README.md**: This documentation file

## 🎯 Purpose

The workflow suggestion templates module provides:

- ✅ **Reusable Templates**: Historical suggestions ready for new workflows
- 🧠 **Learning from Best Practices**: Captures what worked well in the past
- ⚡ **Contextual Suggestions**: Relevant suggestions for action plans
- 🎯 **Structured Format**: Consistent TypeScript types
- 🧪 **Well-Tested**: Comprehensive test coverage

## 📋 Template Structure

```typescript
interface WorkflowSuggestionTemplate {
  etapa: string;                              // Workflow stage/step name
  tipo_sugestao: string;                      // Suggestion type
  conteudo: string;                           // Detailed content/description
  criticidade: 'Alta' | 'Média' | 'Baixa';   // Priority level
  responsavel_sugerido: string;               // Suggested responsible party
  origem: string;                             // Origin/source of template
}
```

## 📚 Available Templates

### 1. Redundant Sensor Status Verification
- **Priority**: Alta (High)
- **Type**: Criar tarefa (Create task)
- **Responsible**: Oficial de Náutica
- **Content**: Review backup position and heading sensor functionality per ASOG item 3.2.4

### 2. Onboard FMEA Document Update
- **Priority**: Média (Medium)
- **Type**: Criar tarefa (Create task)
- **Responsible**: Engenharia Onshore
- **Content**: Verify onboard FMEA has the latest manufacturer version

### 3. Incomplete Checklists Review
- **Priority**: Alta (High)
- **Type**: Ajustar prazo (Adjust deadline)
- **Responsible**: Supervisor de DP
- **Content**: Review 500m zone entry checklist completion (IPCLV below 90%)

## 🚀 Usage Examples

### Basic Usage

```typescript
import { workflowSuggestionTemplates } from '@/lib/workflows/suggestionTemplates';

// Get all templates
const allTemplates = workflowSuggestionTemplates;
console.log(`Total templates: ${allTemplates.length}`);

// Access specific template
const firstTemplate = allTemplates[0];
console.log(firstTemplate.etapa);
console.log(firstTemplate.criticidade);
```

### Using Integration Helpers

```typescript
import {
  getHighPriorityTemplates,
  getTemplatesByCriticidade,
  getTemplatesByResponsavel,
  getTemplateSummary,
  convertTemplateToWorkflowFormat
} from '@/lib/workflows/exampleIntegration';

// Get high priority templates only
const urgentTemplates = getHighPriorityTemplates();
console.log(`Found ${urgentTemplates.length} high priority templates`);

// Get templates by priority level
const mediumTemplates = getTemplatesByCriticidade('Média');

// Filter by responsible party
const nauticaTemplates = getTemplatesByResponsavel('Náutica');

// Get statistics
const stats = getTemplateSummary();
console.log(`Total: ${stats.total}, High: ${stats.alta}, Medium: ${stats.media}`);
// Output: Total: 3, High: 2, Medium: 1

// Convert template to SmartWorkflow format
const template = workflowSuggestionTemplates[0];
const workflow = convertTemplateToWorkflowFormat(template, {
  status: 'active',
  category: 'safety'
});
```

### Creating Workflows from Templates

```typescript
import { createWorkflowFromTemplate } from '@/lib/workflows/exampleIntegration';

// Create a new workflow from template 0
const newWorkflow = createWorkflowFromTemplate(0, {
  status: 'active',
  category: 'maintenance',
  tags: ['sensor', 'critical', 'DP']
});

if (newWorkflow) {
  console.log(`Created workflow: ${newWorkflow.name}`);
}
```

### Searching Templates

```typescript
import { searchTemplates } from '@/lib/workflows/exampleIntegration';

// Search by keyword
const sensorTemplates = searchTemplates('sensor');
const fmeaTemplates = searchTemplates('FMEA');

console.log(`Found ${sensorTemplates.length} templates about sensors`);
```

### UI Integration Example

```typescript
import { getAllTemplatesFormatted } from '@/lib/workflows/exampleIntegration';

// Get formatted data for UI display
const formattedTemplates = getAllTemplatesFormatted();

formattedTemplates.forEach(template => {
  console.log(`
    ID: ${template.id}
    Title: ${template.title}
    Priority: ${template.priority}
    Responsible: ${template.responsible}
  `);
});
```

## 🔌 Integration with SmartWorkflow

The templates are designed to integrate seamlessly with the SmartWorkflow component:

```typescript
import { SmartWorkflow } from '@/components/automation/smart-workflow-automation';
import { convertTemplateToWorkflowFormat } from '@/lib/workflows/exampleIntegration';
import { workflowSuggestionTemplates } from '@/lib/workflows/suggestionTemplates';

function useTemplateInWorkflow() {
  const template = workflowSuggestionTemplates[0];
  const smartWorkflow: SmartWorkflow = convertTemplateToWorkflowFormat(template, {
    status: 'draft',
    steps: [
      {
        id: '1',
        type: 'action',
        title: template.etapa,
        description: template.conteudo,
        config: {},
        position: { x: 100, y: 100 },
        connections: []
      }
    ]
  });
  
  return smartWorkflow;
}
```

## 📊 Template Statistics

```typescript
import { getTemplateSummary } from '@/lib/workflows/exampleIntegration';

const summary = getTemplateSummary();
/*
{
  total: 3,
  alta: 2,
  media: 1,
  baixa: 0,
  byResponsavel: {
    'Oficial de Náutica': 1,
    'Engenharia Onshore': 1,
    'Supervisor de DP': 1
  },
  byTipo: {
    'Criar tarefa': 2,
    'Ajustar prazo': 1
  }
}
*/
```

## 🧪 Testing

All functions are comprehensively tested. Run tests with:

```bash
npm test -- src/tests/workflows/
```

Expected output:
- ✅ 10 tests for core templates (suggestionTemplates.test.ts)
- ✅ 16 tests for integration helpers (exampleIntegration.test.ts)
- ✅ 26 total workflow template tests

## 🔄 Extending Templates

To add new templates, edit `suggestionTemplates.ts`:

```typescript
export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  // ... existing templates ...
  {
    etapa: 'Nova etapa de exemplo',
    tipo_sugestao: 'Criar tarefa',
    conteudo: 'Descrição da nova tarefa sugerida',
    criticidade: 'Média',
    responsavel_sugerido: 'Nome do Responsável',
    origem: 'Template Histórico',
  },
];
```

## 🎨 UI Components

These templates can be displayed using existing components:

- `KanbanAISuggestions`: Display suggestions in Kanban view
- `SmartWorkflowAutomation`: Integrate with workflow automation
- Custom components can consume the formatted data

## 📝 Notes

- Templates are static and immutable by design
- For dynamic suggestions, use the Copilot AI API
- Templates focus on proven historical best practices
- All templates include Portuguese content for maritime operations

## 🔗 Related Files

- `/src/components/workflows/KanbanAISuggestions.tsx`: AI suggestions UI
- `/src/components/automation/smart-workflow-automation.tsx`: Workflow system
- `/src/services/workflow-copilot.ts`: Copilot AI integration
- `/src/tests/components/workflows/KanbanAISuggestions.test.ts`: Component tests

## 🚀 Quick Start

```typescript
// 1. Import what you need
import { workflowSuggestionTemplates } from '@/lib/workflows/suggestionTemplates';
import { getHighPriorityTemplates } from '@/lib/workflows/exampleIntegration';

// 2. Use templates in your component
const urgentTasks = getHighPriorityTemplates();

// 3. Display or process templates
urgentTasks.forEach(template => {
  console.log(`⚠️ ${template.etapa}: ${template.conteudo}`);
});
```

## 💡 Best Practices

1. **Use helper functions**: Leverage the integration helpers instead of filtering manually
2. **Type safety**: Always use the TypeScript interfaces provided
3. **Immutable**: Don't modify template objects directly; create copies if needed
4. **Performance**: Templates are in-memory and fast to access
5. **Localization**: Templates are in Portuguese for maritime domain accuracy

## 📄 License

Part of the Travel HR Buddy project. For internal use only.
