# Smart Workflow Steps Implementation

## 📋 Overview

This implementation adds a complete workflow steps management system with a Kanban board interface for the Smart Workflows feature.

## ✅ Features Implemented

### 1. Database Schema (`smart_workflow_steps` table)

**File:** `supabase/migrations/20251014174200_create_smart_workflow_steps.sql`

The migration creates a `smart_workflow_steps` table with the following fields:

- `id` - UUID primary key
- `workflow_id` - Foreign key to `smart_workflows` (with CASCADE delete)
- `title` - Task title (required)
- `description` - Task description (optional)
- `status` - Task status: `'pendente'`, `'em_progresso'`, or `'concluido'`
- `position` - Integer for ordering steps
- `assigned_to` - UUID reference to user (optional)
- `due_date` - Timestamp (optional)
- `priority` - Priority level: `'low'`, `'medium'`, `'high'`, or `'urgent'`
- `created_at` - Timestamp (auto-generated)
- `updated_at` - Timestamp (auto-updated via trigger)
- `created_by` - UUID reference to user who created the step
- `tags` - Array of text tags
- `metadata` - JSONB for additional data

**RLS Policies:**
- All authenticated users can view, create, update, and delete workflow steps
- Policies can be refined later for more granular permissions

**Indexes:**
- `workflow_id` - For efficient filtering by workflow
- `status` - For filtering by status
- `(workflow_id, position)` - For ordering steps within workflows
- `assigned_to` - For filtering by assigned user

### 2. Supabase Edge Function for CRUD Operations

**File:** `supabase/functions/workflow-steps/index.ts`

The edge function supports all CRUD operations for workflow steps:

#### GET - List all steps for a workflow
```typescript
GET /functions/v1/workflow-steps/{workflow_id}
```
Returns all steps for the specified workflow, ordered by position.

#### POST - Create a new step
```typescript
POST /functions/v1/workflow-steps/{workflow_id}
Body: {
  title: string,
  description?: string,
  status?: string,
  position?: number,
  assigned_to?: string,
  due_date?: string,
  priority?: string,
  tags?: string[],
  metadata?: object
}
```

#### PATCH - Update a step
```typescript
PATCH /functions/v1/workflow-steps/{workflow_id}
Body: {
  id: string,
  values: {
    status?: string,
    title?: string,
    description?: string,
    // ... other fields to update
  }
}
```

#### DELETE - Delete a step
```typescript
DELETE /functions/v1/workflow-steps/{workflow_id}
Body: {
  id: string
}
```

**Authentication:**
- All requests require a valid Authorization header with Supabase session token
- Returns 401 if authentication fails

**Error Handling:**
- Returns appropriate HTTP status codes (400, 401, 405, 500)
- Returns JSON error messages

### 3. Kanban Board UI Implementation

**File:** `src/pages/admin/workflows/detail.tsx`

The workflow detail page now includes:

#### Features:
1. **Add Step Form**
   - Input field for new task title
   - Quick add button
   - Enter key support for quick submission

2. **Three-Column Kanban Board**
   - **Pendente (Pending)** - Yellow background
   - **Em Progresso (In Progress)** - Blue background
   - **Concluído (Completed)** - Green background

3. **Task Cards**
   - Display task title and description
   - Move buttons to transfer tasks between columns
   - Hover effects for better UX
   - Empty state message when no tasks in column

4. **Real-time Data**
   - Fetches workflow and steps on page load
   - Refreshes step list after any modification
   - Toast notifications for success/error states

#### State Management:
```typescript
const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null)
const [steps, setSteps] = useState<WorkflowStep[]>([])
const [newTitle, setNewTitle] = useState('')
const [isLoading, setIsLoading] = useState(true)
const [isCreating, setIsCreating] = useState(false)
```

#### Key Functions:
- `fetchWorkflow()` - Loads workflow details
- `fetchSteps()` - Loads all steps for the workflow
- `addStep()` - Creates a new step with status 'pendente'
- `updateStepStatus()` - Moves a step to a different column

## 🎨 UI Components Used

- `Card` - Container components
- `Button` - Action buttons with variants
- `Input` - Text input for new tasks
- `lucide-react` icons - Plus, ArrowLeft, Workflow, Calendar, CheckSquare
- `useToast` - Toast notifications for feedback
- `MultiTenantWrapper` - Multi-tenant context
- `ModulePageWrapper` - Page layout wrapper
- `ModuleHeader` - Consistent page header

## 🔄 User Flow

1. **Navigate to Workflow**
   - From `/admin/workflows`, click "Ver etapas" on any workflow
   - Redirects to `/admin/workflows/{id}`

2. **View Kanban Board**
   - See three columns: Pendente, Em Progresso, Concluído
   - Tasks are displayed in their respective columns
   - Empty columns show "Nenhuma tarefa" message

3. **Add New Task**
   - Type task title in input field
   - Click "Adicionar" button or press Enter
   - Task appears in "Pendente" column
   - Toast notification confirms creation

4. **Move Task Between Columns**
   - Click "Mover para {status}" button on task card
   - Task moves to target column
   - Toast notification confirms update
   - Board refreshes automatically

## 🔐 Security

- All operations require valid Supabase authentication
- RLS policies enforce data access at database level
- User ID automatically captured for `created_by` field
- Supabase client handles session management

## 🚀 Future Enhancements

As mentioned in the problem statement, the following features can be added:

- [ ] ✏️ Inline editing of title and description
- [ ] 👤 Assign tasks to specific users
- [ ] 📅 Date filters and due date tracking
- [ ] 🤖 AI-powered task suggestions (via OpenAI)
- [ ] 🔁 Automated triggers and actions
- [ ] 🎨 Drag-and-drop between columns (DnD Kit integration)
- [ ] 🏷️ Tag management and filtering
- [ ] 📊 Progress tracking and metrics
- [ ] 📤 Export workflow steps
- [ ] 🔔 Notifications for task updates

## 📱 Responsive Design

The Kanban board adapts to different screen sizes:
- **Mobile (< 768px):** Single column layout
- **Tablet (768px - 1280px):** 1-3 columns
- **Desktop (> 1280px):** Full 3-column layout

## 🧪 Testing

The implementation has been:
- ✅ Built successfully with TypeScript
- ✅ Linted (no errors)
- ✅ Type-checked (all interfaces defined)
- ⏳ Manual testing recommended after deployment

## 📚 API Usage Examples

### Client-side usage (already implemented in detail.tsx):

```typescript
// Fetch steps
const { data, error } = await supabase
  .from('smart_workflow_steps')
  .select('*')
  .eq('workflow_id', workflowId)
  .order('position', { ascending: true })

// Add step
const { error } = await supabase
  .from('smart_workflow_steps')
  .insert({
    workflow_id: workflowId,
    title: 'New Task',
    status: 'pendente',
    position: 0,
    created_by: user.id
  })

// Update step status
const { error } = await supabase
  .from('smart_workflow_steps')
  .update({ status: 'em_progresso' })
  .eq('id', stepId)
```

## 🔗 Related Files

- Migration: `supabase/migrations/20251014174200_create_smart_workflow_steps.sql`
- Edge Function: `supabase/functions/workflow-steps/index.ts`
- UI Component: `src/pages/admin/workflows/detail.tsx`
- Parent Workflow List: `src/pages/admin/workflows/index.tsx`

## 📝 Notes

- The implementation uses direct Supabase client calls instead of the Edge Function for simplicity
- Edge Function remains available for external API integrations
- Status values match the problem statement: `'pendente'`, `'em_progresso'`, `'concluido'`
- All text is in Portuguese (pt-BR) to match the existing codebase
- The implementation is minimal and focused, following the project's coding guidelines
