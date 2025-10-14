# 🧠 Smart Workflows - Quick Reference Guide

## 🚀 Quick Start

### Access the Feature
1. Navigate to **Admin** → **Smart Workflows** or go to `/admin/workflows`
2. Create a new workflow by typing a title and clicking **Criar**
3. Click **Ver etapas** on any workflow card to open the Kanban board

---

## 📋 Main Pages

### Workflows List (`/admin/workflows`)
- **View** all workflows in a grid layout
- **Create** new workflows with a quick input
- **Navigate** to Kanban boards by clicking "Ver etapas"
- **Status badges**: Active (green) or Rascunho (gray)

### Kanban Board (`/admin/workflows/:id`)
- **3 Columns**: Pendente → Em Progresso → Concluído
- **Drag & Drop**: Move tasks between columns
- **Create**: Click "➕ Nova Tarefa" button
- **Edit**: Click ✏️ icon on any task card
- **Delete**: Click 🗑️ icon on any task card

---

## 🎯 Task Management

### Creating a Task
1. Click **➕ Nova Tarefa** button
2. Fill in the form:
   - **Título** * (required)
   - **Descrição** (optional)
   - **Status** (Pendente/Em Progresso/Concluído)
   - **Atribuir a** (select user from dropdown)
   - **Data de Vencimento** (optional deadline)
3. Click **Criar Tarefa**

### Editing a Task
1. Click **✏️** icon on the task card
2. Modify any fields
3. Click **Salvar**

### Moving Tasks (Drag & Drop)
1. Hover over a task card
2. Click and drag the card to another column
3. Drop to update the status automatically

### Deleting a Task
1. Click **🗑️** icon on the task card
2. Confirm deletion in the dialog

---

## 💾 Database Tables

### `smart_workflows`
Main workflow definitions with metadata.

**Key Fields**:
- `id` (UUID)
- `title` (TEXT, required)
- `description` (TEXT, optional)
- `status` (draft/active/inactive)
- `created_by` (UUID → auth.users)

### `smart_workflow_steps`
Individual tasks/steps within a workflow.

**Key Fields**:
- `id` (UUID)
- `workflow_id` (UUID → smart_workflows)
- `title` (TEXT, required)
- `description` (TEXT, optional)
- `status` (pendente/em_progresso/concluido)
- `assigned_to` (UUID → profiles)
- `due_date` (TIMESTAMP, optional)
- `position` (INTEGER)

---

## 🔑 Key Features

### ✅ Implemented Features
- ✓ Create/edit/delete workflows
- ✓ Create/edit/delete tasks
- ✓ Drag & drop between columns
- ✓ Assign tasks to users
- ✓ Set due dates
- ✓ View task details (assignee, date)
- ✓ Responsive grid layout
- ✓ Real-time updates
- ✓ Toast notifications
- ✓ Empty states & loading states

### 🎨 UI Components Used
- **shadcn/ui**: Card, Button, Input, Dialog, Select, Textarea
- **Lucide Icons**: Workflow, Calendar, User, CheckSquare, Plus, Pencil, Trash2, GripVertical, ArrowLeft
- **Tailwind CSS**: For styling and responsive design

---

## 🔒 Security (RLS)

### Policies
- All **authenticated** users can view workflows and steps
- All **authenticated** users can create/update/delete steps
- Only **creators** can update/delete their workflows

### Authentication Required
Users must be logged in to access all Smart Workflows features.

---

## 🎨 Column Color Coding

| Column | Color | Status |
|--------|-------|--------|
| **Pendente** | Gray | Tasks not started |
| **Em Progresso** | Blue | Active tasks |
| **Concluído** | Green | Completed tasks |

---

## 📊 Status Workflow

```
Pendente ──drag──> Em Progresso ──drag──> Concluído
   ↑                     ↑                    ↑
   └─────────────────────┴────────────────────┘
           Can move back at any time
```

---

## 🛠️ Developer Notes

### Key Files
- `src/pages/admin/workflows/index.tsx` - List page
- `src/pages/admin/workflows/detail.tsx` - Kanban board
- `supabase/migrations/20251014171000_create_smart_workflows.sql` - Main table
- `supabase/migrations/20251014180000_create_smart_workflow_steps.sql` - Steps table
- `src/integrations/supabase/types.ts` - TypeScript types

### API Patterns
```typescript
// Fetch steps
await supabase
  .from('smart_workflow_steps')
  .select('*')
  .eq('workflow_id', id)
  .order('position')

// Update status (drag & drop)
await supabase
  .from('smart_workflow_steps')
  .update({ status: newStatus })
  .eq('id', stepId)
```

### State Management
- React hooks (useState, useEffect)
- Local state for drag operations
- Supabase client for data fetching

---

## 📱 Responsive Behavior

| Screen Size | Columns |
|-------------|---------|
| Mobile | 1 column (stacked) |
| Tablet | 1-2 columns |
| Desktop | 3 columns (side-by-side) |

---

## ⚡ Performance

### Optimizations
- Indexed queries (workflow_id, status, position)
- Efficient foreign key relationships
- Minimal re-renders with React hooks
- Cascade deletion (steps deleted with workflow)

---

## 🚨 Error Handling

All operations include:
- Try/catch blocks
- Toast notifications for success/error
- Console logging for debugging
- User-friendly error messages

---

## 🎯 Common Use Cases

### 1. Project Management
Create workflows for different projects, track tasks through completion.

### 2. HR Processes
Manage employee onboarding, approval workflows, document reviews.

### 3. Travel Approvals
Track travel request status from submission to approval.

### 4. Document Processing
Manage document review stages: draft → review → approved.

---

## 📚 Next Steps

After creating workflows and tasks:
1. **Assign** tasks to team members
2. **Set deadlines** for time-sensitive work
3. **Drag tasks** as work progresses
4. **Monitor** completion in the Concluído column

---

## 🔗 Related Features

- **Collaboration Module** - Comments and mentions (future)
- **AI Assistant** - Smart task suggestions (future)
- **Analytics** - Workflow metrics (future)
- **Templates** - Pre-built workflows (future)

---

## ⚙️ Configuration

### Default Values
- New tasks start as **Pendente**
- Position is auto-calculated (max + 1)
- Timestamps are auto-generated
- No user assignment by default

### Customization
Change defaults in the create/edit dialogs.

---

## 📞 Support

For issues or questions:
1. Check build logs: `npm run build`
2. Check database: Supabase dashboard
3. Check console: Browser DevTools
4. Review documentation: `SMART_WORKFLOWS_IMPLEMENTATION.md`

---

**Version**: 1.0.0  
**Last Updated**: October 14, 2025  
**Status**: ✅ Production Ready
