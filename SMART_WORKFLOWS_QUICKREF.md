# 🧠 Smart Workflows - Quick Reference

## 🔗 Access
```
List: /admin/workflows
Kanban: /admin/workflows/{id}
```

## 📋 Database Tables

### smart_workflows
```sql
id, title, description, status, created_at, updated_at, 
created_by, category, tags
```
**Status**: `ativo`, `pausado`, `concluido`

### smart_workflow_steps
```sql
id, workflow_id, title, description, status, assigned_to, 
due_date, position, created_at
```
**Status**: `pendente`, `em_progresso`, `concluido`

## 🎯 Quick Actions

### Create Workflow
1. Go to `/admin/workflows`
2. Type title in input
3. Press Enter or click "Criar"

### Create Task
1. Open workflow Kanban board
2. Click "+ Nova Tarefa"
3. Fill form and submit

### Move Task
1. Drag task card
2. Drop in target column
3. Status updates automatically

### Edit Task
Click ✏️ icon → Update → Save

### Delete Task
Click 🗑️ icon → Confirm

## 🎨 Kanban Columns

| Column | Status | Color |
|--------|--------|-------|
| Pendente | `pendente` | Gray |
| Em Progresso | `em_progresso` | Blue |
| Concluído | `concluido` | Green |

## 📦 Key Features

✅ Drag-and-drop between columns
✅ Create, edit, delete tasks
✅ Assign tasks to users
✅ Set due dates
✅ Real-time status updates
✅ Responsive design
✅ Toast notifications

## 🔧 Tech Stack

- **Frontend**: React + TypeScript
- **UI**: shadcn/ui components
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Drag & Drop**: HTML5 API

## 📁 Files

### Migrations
- `20251014173800_create_smart_workflows.sql`
- `20251014173801_create_smart_workflow_steps.sql`

### Pages
- `src/pages/admin/workflows/index.tsx` - List page
- `src/pages/admin/workflows/detail.tsx` - Kanban board

### Routes
```tsx
<Route path="/admin/workflows" element={<SmartWorkflows />} />
<Route path="/admin/workflows/:id" element={<WorkflowDetail />} />
```

## 🔒 Security (RLS)

**smart_workflows**:
- View: All authenticated users
- Create: All authenticated users
- Update/Delete: Workflow owner only

**smart_workflow_steps**:
- View: All authenticated users
- Create/Update/Delete: All authenticated users

## 🚀 Deploy

### Apply Migrations
```bash
supabase db push
```

### Build & Deploy
```bash
npm run build
npm run deploy
```

## 📊 Data Structure

```
Workflow
  ├── id (UUID)
  ├── title (required)
  ├── description
  ├── status (ativo/pausado/concluido)
  └── Steps []
       ├── id (UUID)
       ├── title (required)
       ├── description
       ├── status (pendente/em_progresso/concluido)
       ├── assigned_to (user_id)
       ├── due_date
       └── position (order in column)
```

## 🎯 Next Steps

The implementation is complete. Suggested enhancements:
- Add priority levels
- Add comments system
- Add file attachments
- Add notifications
- Add calendar view

## ✅ Status

**Build**: ✅ Passing
**Lint**: ✅ Passing
**Tests**: ✅ N/A (no test suite)
**Production**: ✅ Ready

---

**Version**: 1.0.0
**Last Updated**: October 14, 2025
