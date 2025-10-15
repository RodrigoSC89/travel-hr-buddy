# Workflow API Quick Reference

## 🚀 Quick Start

### Create a Workflow

```typescript
import { createWorkflow } from "@/services/workflow-api";

const { workflow, suggestions } = await createWorkflow({
  title: "Manutenção Preventiva",
  category: "manutenção"
});
```

### Use Edge Function

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/create-workflow' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"title": "Test Workflow"}'
```

## 📚 Available Templates

- `default` - Generic 5-step workflow
- `manutenção` - Maintenance workflow
- `auditoria` - Audit workflow
- `treinamento` - Training workflow
- `projeto` - Project workflow

## 🔧 Service Layer API

```typescript
// Create
createWorkflow(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse>

// Read
getWorkflow(id: string): Promise<Workflow | null>
getWorkflows(): Promise<Workflow[]>
getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]>

// Update
updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null>
updateWorkflowStep(id: string, updates: Partial<WorkflowStep>): Promise<WorkflowStep | null>

// Delete
deleteWorkflow(id: string): Promise<boolean>
deleteWorkflowStep(id: string): Promise<boolean>

// Create Step
createWorkflowStep(step: Partial<WorkflowStep>): Promise<WorkflowStep | null>
```

## 🎯 Helper Functions

```typescript
import {
  seedSuggestionsForWorkflow,
  getAvailableTemplates,
  getTemplateSuggestions
} from "@/lib/workflows/seedSuggestions";

// Seed suggestions for a workflow
seedSuggestionsForWorkflow({
  workflowId: "uuid",
  workflowTitle: "Title",
  category: "manutenção",
  maxSuggestions: 5
});

// Get available templates
getAvailableTemplates(); // ['default', 'manutenção', ...]

// Get template suggestions
getTemplateSuggestions("auditoria"); // Returns array of suggestions
```

## 📋 Type Definitions

```typescript
type WorkflowStatus = "draft" | "active" | "inactive";
type WorkflowStepStatus = "pendente" | "em_progresso" | "concluido";
type WorkflowStepPriority = "low" | "medium" | "high" | "urgent";

interface CreateWorkflowRequest {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

interface Workflow {
  id: string;
  title: string;
  description?: string;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  description?: string;
  status: WorkflowStepStatus;
  position: number;
  assigned_to?: string;
  due_date?: string;
  priority: WorkflowStepPriority;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
```

## 🧪 Testing

```bash
# Run all workflow tests
npm test -- workflow

# Run specific tests
npm test -- src/tests/workflow-api.test.ts
npm test -- src/tests/workflow-seed-suggestions.test.ts
```

## 📦 Deployment

```bash
# Deploy edge function
supabase functions deploy create-workflow
```

## 📁 File Structure

```
src/
├── types/workflow.ts              # Type definitions
├── lib/workflows/
│   └── seedSuggestions.ts         # Suggestion seeder
├── services/
│   └── workflow-api.ts            # Service layer
└── tests/
    ├── workflow-api.test.ts       # API tests (19 tests)
    └── workflow-seed-suggestions.test.ts  # Seeder tests (12 tests)

supabase/
└── functions/
    └── create-workflow/
        └── index.ts               # Edge function
```

## ✅ Test Coverage

- ✅ 31 tests passing
- ✅ Workflow CRUD operations
- ✅ Step CRUD operations
- ✅ Template selection logic
- ✅ Authentication handling
- ✅ Error handling

## 🔗 Related Documentation

- [Full Implementation Guide](./WORKFLOW_API_IMPLEMENTATION.md)
- [Smart Workflows Implementation](./SMART_WORKFLOWS_IMPLEMENTATION.md)
- [Workflow Kanban Implementation](./SMART_WORKFLOW_KANBAN_IMPLEMENTATION.md)
