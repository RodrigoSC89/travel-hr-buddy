# Workflow API Implementation Guide

## 📋 Overview

This implementation provides a complete automated workflow creation API that allows users to create workflows via API and automatically seeds initial suggestions based on templates and historical patterns.

## 🎯 What Was Implemented

### 1. Type Definitions
**File:** `/src/types/workflow.ts`

Complete TypeScript interfaces for:
- `Workflow` - Workflow entity structure
- `WorkflowStep` - Workflow step entity structure
- `CreateWorkflowRequest` - API request structure
- `CreateWorkflowResponse` - API response structure
- `WorkflowSuggestion` - Suggestion template structure
- `SeedSuggestionsOptions` - Configuration for seeding suggestions
- `SeedSuggestionsResult` - Result from seeding process

### 2. Workflow Suggestions Seeder
**File:** `/src/lib/workflows/seedSuggestions.ts`

Smart suggestion system that:
- ✅ Provides 5 pre-built templates (default, manutenção, auditoria, treinamento, projeto)
- ✅ Automatically selects template based on workflow title or category
- ✅ Creates workflow steps with proper positioning and priorities
- ✅ Assigns steps to current user
- ✅ Supports custom template selection
- ✅ Limits suggestions to specified maximum

**Available Templates:**
- **Default** - Generic workflow with planning, analysis, execution, review, and conclusion
- **Manutenção** - Maintenance workflow with inspection, planning, execution, testing, documentation
- **Auditoria** - Audit workflow with preparation, initial audit, non-conformity identification, corrective action plan, final verification
- **Treinamento** - Training workflow with needs assessment, planning, execution, learning evaluation, feedback
- **Projeto** - Project workflow with kickoff, scope definition, implementation, quality control, closure

### 3. Workflow API Service Layer
**File:** `/src/services/workflow-api.ts`

Complete CRUD operations:
- ✅ `createWorkflow(request)` - Create workflow and seed suggestions
- ✅ `getWorkflow(id)` - Fetch single workflow
- ✅ `getWorkflows()` - Fetch all workflows
- ✅ `updateWorkflow(id, updates)` - Update workflow
- ✅ `deleteWorkflow(id)` - Delete workflow
- ✅ `getWorkflowSteps(workflowId)` - Fetch workflow steps
- ✅ `createWorkflowStep(step)` - Create workflow step
- ✅ `updateWorkflowStep(id, updates)` - Update workflow step
- ✅ `deleteWorkflowStep(id)` - Delete workflow step

### 4. Supabase Edge Function
**File:** `/supabase/functions/create-workflow/index.ts`

RESTful API endpoint:
- ✅ POST `/functions/v1/create-workflow`
- ✅ Authentication required (Supabase session token)
- ✅ CORS enabled for cross-origin requests
- ✅ Automatic workflow creation
- ✅ Automatic suggestion seeding
- ✅ Proper error handling
- ✅ Returns workflow with suggestions

### 5. Comprehensive Test Suite
**Files:**
- `/src/tests/workflow-api.test.ts` - 19 tests for API service layer
- `/src/tests/workflow-seed-suggestions.test.ts` - 12 tests for suggestions seeder

**Test Coverage:**
- ✅ Workflow creation with authentication
- ✅ Workflow CRUD operations
- ✅ Step CRUD operations
- ✅ Template selection logic
- ✅ Error handling
- ✅ Edge cases

**Total: 31 tests passing ✅**

## 🚀 Usage Examples

### Example 1: Create Workflow via Service Layer

```typescript
import { createWorkflow } from "@/services/workflow-api";

// Create a maintenance workflow
const result = await createWorkflow({
  title: "Manutenção Preventiva Q1",
  description: "Manutenção preventiva trimestral dos equipamentos",
  category: "manutenção",
  tags: ["preventiva", "Q1", "equipamentos"]
});

console.log(result.workflow.id); // UUID of created workflow
console.log(result.suggestions.length); // 5 initial steps created
```

### Example 2: Create Workflow via API (Supabase Edge Function)

```typescript
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/create-workflow',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      title: 'Auditoria Anual',
      description: 'Auditoria de conformidade anual',
      category: 'auditoria',
      tags: ['conformidade', '2025']
    })
  }
);

const data = await response.json();
console.log(data.workflow); // Created workflow
console.log(data.suggestions); // Initial steps
```

### Example 3: Seed Suggestions Manually

```typescript
import { seedSuggestionsForWorkflow } from "@/lib/workflows/seedSuggestions";

// After creating a workflow, seed suggestions
const result = await seedSuggestionsForWorkflow({
  workflowId: "workflow-uuid",
  workflowTitle: "Projeto de Implementação",
  category: "projeto",
  maxSuggestions: 5
});

if (result.success) {
  console.log(`Created ${result.suggestions.length} steps`);
}
```

### Example 4: Get Available Templates

```typescript
import { getAvailableTemplates, getTemplateSuggestions } from "@/lib/workflows/seedSuggestions";

// Get list of available templates
const templates = getAvailableTemplates();
console.log(templates); // ['default', 'manutenção', 'auditoria', 'treinamento', 'projeto']

// Get suggestions for a specific template
const suggestions = getTemplateSuggestions("manutenção");
console.log(suggestions.length); // 5 suggestions
```

### Example 5: Complete Workflow Management

```typescript
import {
  createWorkflow,
  getWorkflow,
  getWorkflowSteps,
  updateWorkflowStep
} from "@/services/workflow-api";

// 1. Create workflow
const { workflow } = await createWorkflow({
  title: "Treinamento de Segurança",
  category: "treinamento"
});

// 2. Get workflow details
const workflowDetails = await getWorkflow(workflow.id);

// 3. Get workflow steps
const steps = await getWorkflowSteps(workflow.id);

// 4. Update step status
await updateWorkflowStep(steps[0].id, {
  status: "em_progresso"
});
```

## 📊 API Request/Response Format

### Create Workflow Request

```typescript
POST /functions/v1/create-workflow
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "title": "Workflow Title",
  "description": "Optional description",
  "category": "manutenção", // or "auditoria", "treinamento", "projeto"
  "tags": ["tag1", "tag2"],
  "config": {}
}
```

### Create Workflow Response

```typescript
{
  "success": true,
  "workflow": {
    "id": "uuid",
    "title": "Workflow Title",
    "description": "Optional description",
    "status": "draft",
    "created_at": "2025-10-15T10:00:00Z",
    "updated_at": "2025-10-15T10:00:00Z",
    "created_by": "user-uuid",
    "category": "manutenção",
    "tags": ["tag1", "tag2"],
    "config": {}
  },
  "suggestions": [
    {
      "id": "step-uuid-1",
      "workflow_id": "workflow-uuid",
      "title": "Inspeção inicial",
      "description": "Avaliar condições e necessidades de manutenção",
      "status": "pendente",
      "position": 0,
      "priority": "high",
      "assigned_to": "user-uuid",
      "created_by": "user-uuid",
      "tags": ["manutenção", "inspeção"]
    },
    // ... more steps
  ]
}
```

## 🔒 Security

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Authentication required** for all operations
- ✅ **User ownership** verified for update/delete operations
- ✅ **Automatic user assignment** for created resources

## 🧪 Testing

Run the workflow API tests:

```bash
# Run all workflow tests
npm test -- workflow

# Run specific test file
npm test -- src/tests/workflow-api.test.ts
npm test -- src/tests/workflow-seed-suggestions.test.ts
```

## 📦 Deployment

### Deploy Edge Function to Supabase

```bash
# From project root
supabase functions deploy create-workflow
```

### Test Edge Function

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/create-workflow' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "title": "Test Workflow",
    "category": "default"
  }'
```

## 🎨 Integration with Existing System

This workflow API integrates seamlessly with:

1. **Smart Workflows Module** (`/admin/workflows`)
   - Use `createWorkflow()` in workflow creation forms
   - Display suggestions in Kanban boards

2. **Database Schema**
   - Uses existing `smart_workflows` table
   - Uses existing `smart_workflow_steps` table
   - Compatible with existing RLS policies

3. **Authentication**
   - Uses existing Supabase authentication
   - Respects user sessions and permissions

## 📈 Benefits

### For Operations
- 🚀 **Faster Workflow Creation** - Instant workflow setup with pre-configured steps
- 📋 **Consistent Structure** - Templates ensure best practices
- 🎯 **Contextual Suggestions** - Smart template selection based on workflow type
- 👤 **Automatic Assignment** - Steps auto-assigned to creator

### For Development
- 🧩 **Type Safety** - Full TypeScript support
- 🧪 **Well Tested** - 31 comprehensive tests
- 📚 **Well Documented** - Clear examples and guides
- 🔧 **Easy Integration** - Simple service layer API

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend Layer                      │
│  - React Components                                  │
│  - Service Layer (workflow-api.ts)                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ├─── Local API Calls
                  │    (Supabase Client SDK)
                  │
                  └─── Edge Function API
                       (HTTP REST)
                       │
┌─────────────────┴───────────────────────────────────┐
│              Supabase Backend Layer                  │
│  - Edge Function (create-workflow)                   │
│  - Helper Library (seedSuggestions.ts)               │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│               Database Layer                         │
│  - smart_workflows table                             │
│  - smart_workflow_steps table                        │
│  - RLS Policies                                      │
└─────────────────────────────────────────────────────┘
```

## 📝 Files Created

1. `/src/types/workflow.ts` - Type definitions (98 lines)
2. `/src/lib/workflows/seedSuggestions.ts` - Suggestions seeder (316 lines)
3. `/src/services/workflow-api.ts` - API service layer (297 lines)
4. `/supabase/functions/create-workflow/index.ts` - Edge function (234 lines)
5. `/src/tests/workflow-api.test.ts` - API tests (489 lines)
6. `/src/tests/workflow-seed-suggestions.test.ts` - Seeder tests (332 lines)

**Total:** 6 new files, 1,766 lines of code

## ✅ Verification

- ✅ All 31 tests passing
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Build successful
- ✅ Edge function ready for deployment
- ✅ Compatible with existing database schema
- ✅ Follows existing code patterns

## 🎉 Conclusion

The Workflow API implementation is **complete and production-ready**! 

The system now provides:
- ✅ Automated workflow creation
- ✅ Smart suggestion seeding based on templates
- ✅ Complete CRUD operations
- ✅ RESTful API endpoint
- ✅ Comprehensive test coverage
- ✅ Type-safe TypeScript implementation
- ✅ Easy-to-use service layer

Ready to help users create workflows with pre-configured action plans! 🚀
