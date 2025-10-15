# Workflow Suggestion Templates Module

## Overview

The Workflow Suggestion Templates module provides a collection of **historical workflow suggestions** that can be reused as starting points for new action plans and internal audits. These templates capture best practices from past implementations and provide contextual suggestions for workflow creation.

## Features

- ✨ **Reusable Templates**: Historical templates ready for new workflows
- 🧠 **Learning from History**: Captures best practices from past implementations
- ⚡ **Contextual Suggestions**: Provides relevant suggestions for action plans
- 🎯 **Structured Format**: Consistent format with proper TypeScript types
- 🔍 **Filtering & Search**: Helper functions for filtering and searching templates
- 🔄 **Format Conversion**: Convert templates to SmartWorkflow format
- 📊 **Statistics**: Get summary statistics and insights

## File Structure

```
lib/workflows/
├── suggestionTemplates.ts      # Core templates and type definitions
├── exampleIntegration.ts       # Integration helper functions
└── README.md                   # This documentation file
```

## Core Types

### WorkflowSuggestionTemplate

```typescript
interface WorkflowSuggestionTemplate {
  etapa: string;                              // Stage/step name
  tipo_sugestao: string;                      // Suggestion type
  conteudo: string;                           // Content/description
  criticidade: 'Alta' | 'Média' | 'Baixa';   // Criticality level
  responsavel_sugerido: string;               // Suggested responsible party
  origem: string;                             // Origin/source
}
```

## Available Templates

The module includes 3 historical templates:

### 1. Verificar status de sensores redundantes (Alta criticidade)
- **Type**: Criar tarefa
- **Responsible**: Oficial de Náutica
- **Content**: Review backup position and heading sensor functionality per ASOG item 3.2.4

### 2. Atualizar documento de FMEA embarcado (Média criticidade)
- **Type**: Criar tarefa
- **Responsible**: Engenharia Onshore
- **Content**: Verify onboard FMEA has the latest manufacturer version

### 3. Revisar checklists incompletos no último mês (Alta criticidade)
- **Type**: Ajustar prazo
- **Responsible**: Supervisor de DP
- **Content**: Review 500m zone entry checklist completion (IPCLV below 90%)

## Integration Functions

### Filtering Functions

#### `getTemplatesByCriticidade(criticidade?)`
Filter templates by criticality level.

```typescript
import { getTemplatesByCriticidade } from '@/lib/workflows/exampleIntegration';

// Get all templates
const allTemplates = getTemplatesByCriticidade();

// Get only high priority
const highPriority = getTemplatesByCriticidade('Alta');

// Get medium priority
const mediumPriority = getTemplatesByCriticidade('Média');
```

#### `getHighPriorityTemplates()`
Get only Alta criticidade templates.

```typescript
import { getHighPriorityTemplates } from '@/lib/workflows/exampleIntegration';

const urgentTemplates = getHighPriorityTemplates();
// Returns: 2 templates with Alta criticidade
```

#### `getTemplatesByResponsavel(responsavel)`
Filter templates by responsible party.

```typescript
import { getTemplatesByResponsavel } from '@/lib/workflows/exampleIntegration';

const nauticaTemplates = getTemplatesByResponsavel('Náutica');
// Returns templates assigned to Oficial de Náutica
```

#### `getTemplatesBySuggestionType(tipo)`
Filter templates by suggestion type.

```typescript
import { getTemplatesBySuggestionType } from '@/lib/workflows/exampleIntegration';

const taskTemplates = getTemplatesBySuggestionType('Criar tarefa');
// Returns templates with "Criar tarefa" type
```

#### `searchTemplates(keyword)`
Search templates by keyword in etapa or conteudo.

```typescript
import { searchTemplates } from '@/lib/workflows/exampleIntegration';

const sensorTemplates = searchTemplates('sensor');
// Returns templates containing "sensor" in title or content
```

### Conversion Functions

#### `convertTemplateToWorkflowFormat(template, overrides?)`
Convert a template to SmartWorkflow format.

```typescript
import { 
  workflowSuggestionTemplates 
} from '@/lib/workflows/suggestionTemplates';
import { 
  convertTemplateToWorkflowFormat 
} from '@/lib/workflows/exampleIntegration';

const template = workflowSuggestionTemplates[0];
const workflow = convertTemplateToWorkflowFormat(template, {
  status: 'active',
  category: 'safety',
});

// Result:
// {
//   name: "Verificar status de sensores redundantes",
//   description: "Revisar o funcionamento dos sensores...",
//   status: "active",
//   category: "safety",
//   tags: ["Oficial de Náutica", "Alta", "Template Histórico"],
//   ...
// }
```

#### `createWorkflowFromTemplate(templateId, customProperties?)`
Create a workflow from a template by index.

```typescript
import { createWorkflowFromTemplate } from '@/lib/workflows/exampleIntegration';

const workflow = createWorkflowFromTemplate(0, {
  status: 'active',
  executions: 10,
  successRate: 95.5,
});

// Returns SmartWorkflow object or null if template not found
```

### Formatting Functions

#### `getAllTemplatesFormatted()`
Get all templates formatted for UI display.

```typescript
import { getAllTemplatesFormatted } from '@/lib/workflows/exampleIntegration';

const formattedTemplates = getAllTemplatesFormatted();

// Returns:
// [
//   {
//     id: 0,
//     title: "Verificar status de sensores redundantes",
//     description: "Revisar o funcionamento dos sensores...",
//     priority: "Alta",
//     responsible: "Oficial de Náutica",
//     type: "Criar tarefa",
//     source: "Template Histórico"
//   },
//   ...
// ]
```

#### `getTemplateSummary()`
Get template summary statistics.

```typescript
import { getTemplateSummary } from '@/lib/workflows/exampleIntegration';

const summary = getTemplateSummary();

// Returns:
// {
//   total: 3,
//   alta: 2,
//   media: 1,
//   baixa: 0
// }
```

## Usage Examples

### Example 1: Display All Templates
```typescript
import { workflowSuggestionTemplates } from '@/lib/workflows/suggestionTemplates';

function TemplateList() {
  return (
    <div>
      <h2>Workflow Templates ({workflowSuggestionTemplates.length})</h2>
      {workflowSuggestionTemplates.map((template, index) => (
        <div key={index}>
          <h3>{template.etapa}</h3>
          <p>{template.conteudo}</p>
          <span>Priority: {template.criticidade}</span>
          <span>Responsible: {template.responsavel_sugerido}</span>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Get High Priority Workflows
```typescript
import { getHighPriorityTemplates } from '@/lib/workflows/exampleIntegration';

function UrgentWorkflows() {
  const urgentTemplates = getHighPriorityTemplates();
  
  return (
    <div>
      <h2>Urgent Workflows ({urgentTemplates.length})</h2>
      {urgentTemplates.map((template, index) => (
        <div key={index} className="urgent">
          <h3>{template.etapa}</h3>
          <p>{template.conteudo}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Create Workflow from Template
```typescript
import { createWorkflowFromTemplate } from '@/lib/workflows/exampleIntegration';

function handleCreateWorkflow(templateId: number) {
  const workflow = createWorkflowFromTemplate(templateId, {
    status: 'active',
    category: 'safety',
  });
  
  if (workflow) {
    // Save workflow to database or state
    console.log('Created workflow:', workflow);
  }
}
```

### Example 4: Search and Filter
```typescript
import { 
  searchTemplates,
  getTemplatesByResponsavel 
} from '@/lib/workflows/exampleIntegration';

function SearchableTemplates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [responsavel, setResponsavel] = useState('');
  
  const filteredTemplates = useMemo(() => {
    let templates = workflowSuggestionTemplates;
    
    if (searchTerm) {
      templates = searchTemplates(searchTerm);
    }
    
    if (responsavel) {
      templates = templates.filter(t => 
        getTemplatesByResponsavel(responsavel).includes(t)
      );
    }
    
    return templates;
  }, [searchTerm, responsavel]);
  
  return (
    <div>
      <input 
        placeholder="Search templates..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select onChange={(e) => setResponsavel(e.target.value)}>
        <option value="">All Responsible Parties</option>
        <option value="Náutica">Oficial de Náutica</option>
        <option value="Engenharia">Engenharia Onshore</option>
        <option value="Supervisor">Supervisor de DP</option>
      </select>
      
      {filteredTemplates.map((template, index) => (
        <TemplateCard key={index} template={template} />
      ))}
    </div>
  );
}
```

## Integration Points

This module is designed to integrate with:

- **SmartWorkflow Component**: `/src/components/automation/smart-workflow-automation.tsx`
- **KanbanAISuggestions**: `/src/components/workflows/KanbanAISuggestions.tsx`
- **Workflow Copilot API**: `/src/services/workflow-copilot.ts`
- **PeotramWorkflowManager**: Future integration point
- **AI-powered suggestion engines**: Compatible with existing AI services

## Benefits

- ✨ **Reusable**: Historical templates ready for new workflows
- 🧠 **Learning**: Captures best practices from past implementations
- ⚡ **Contextual**: Provides relevant suggestions for action plans
- 🎯 **Structured**: Consistent format with proper TypeScript types
- 🧪 **Tested**: Comprehensive test coverage ensuring reliability
- 📚 **Documented**: Complete documentation with examples
- 🔒 **Type-Safe**: Full TypeScript interface definitions

## Testing

The module includes comprehensive test coverage:

- Core template structure validation
- Integration function testing
- Type safety verification
- Edge case handling
- Filter and search functionality
- Format conversion tests

See test files:
- `src/tests/workflows/suggestionTemplates.test.ts`
- `src/tests/workflows/exampleIntegration.test.ts`

## Contributing

To add new templates:

1. Add the template to the `workflowSuggestionTemplates` array in `suggestionTemplates.ts`
2. Ensure it follows the `WorkflowSuggestionTemplate` interface
3. Update tests to include the new template
4. Update this README with the new template information

## License

This module is part of the Nautilus One project.
