# 🧠 Smart Workflows - Quick Reference Guide

## 🎯 Overview
Complete task management system with interactive Kanban board for workflow orchestration.

---

## 🚀 Quick Start

### Accessing Workflows
```
URL: /admin/workflows
URL: /admin/workflows/:id (detail page)
```

### Creating a Workflow
1. Navigate to `/admin/workflows`
2. Enter workflow title in input field
3. Press Enter or click "Criar" button
4. Click on workflow card to open detail view

### Managing Tasks
1. Open workflow detail page
2. Click "Nova Tarefa" button
3. Fill in task details (title, description, assignee, due date)
4. Click "Criar Tarefa"

---

## 📊 Kanban Board Features

### Task Columns
- **Pendente** (Yellow) - Tasks waiting to start
- **Em Progresso** (Blue) - Active tasks
- **Concluído** (Green) - Completed tasks

### Task Operations

#### Create Task
```
Button: "Nova Tarefa" (top-right)
Fields:
  - Title * (required)
  - Description
  - Status (Pendente/Em Progresso/Concluído)
  - Assigned To (user selector)
  - Due Date (date picker)
```

#### Edit Task
```
Icon: Pencil icon on task card
Action: Opens dialog with pre-filled values
Save: Updates task immediately
```

#### Delete Task
```
Icon: Trash icon on task card
Action: Confirmation prompt
Result: Permanent deletion
```

#### Move Task (Drag & Drop)
```
1. Click and hold task card (grip icon)
2. Drag to target column
3. Drop to move
4. Status updates automatically
```

---

## 🔧 Developer Reference

### Database Schema

**Table: `smart_workflow_steps`**
```sql
- id: UUID (Primary Key)
- workflow_id: UUID (Foreign Key -> smart_workflows)
- title: TEXT (required)
- description: TEXT
- status: TEXT (pendente|em_progresso|concluido)
- position: INTEGER
- assigned_to: UUID (Foreign Key -> profiles)
- due_date: TIMESTAMP
- priority: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- created_by: UUID
- tags: TEXT[]
- metadata: JSONB
```

### API Operations

#### Fetch Workflow Steps
```typescript
const { data, error } = await supabase
  .from('smart_workflow_steps')
  .select('*')
  .eq('workflow_id', workflowId)
  .order('position', { ascending: true })
```

#### Create Step
```typescript
const { error } = await supabase
  .from('smart_workflow_steps')
  .insert({
    workflow_id: id,
    title: formTitle,
    description: formDescription,
    status: formStatus,
    assigned_to: formAssignedTo,
    due_date: formDueDate,
    position: steps.length
  })
```

#### Update Step
```typescript
const { error } = await supabase
  .from('smart_workflow_steps')
  .update({
    title: formTitle,
    description: formDescription,
    status: formStatus,
    assigned_to: formAssignedTo,
    due_date: formDueDate
  })
  .eq('id', stepId)
```

#### Delete Step
```typescript
const { error } = await supabase
  .from('smart_workflow_steps')
  .delete()
  .eq('id', stepId)
```

#### Update Status (Drag & Drop)
```typescript
const { error } = await supabase
  .from('smart_workflow_steps')
  .update({ status: newStatus })
  .eq('id', stepId)
```

### State Management

```typescript
// Core state
const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null)
const [steps, setSteps] = useState<WorkflowStep[]>([])
const [profiles, setProfiles] = useState<Profile[]>([])

// Dialog state
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)

// Form state
const [formTitle, setFormTitle] = useState('')
const [formDescription, setFormDescription] = useState('')
const [formStatus, setFormStatus] = useState<WorkflowStep['status']>('pendente')
const [formAssignedTo, setFormAssignedTo] = useState<string>('')
const [formDueDate, setFormDueDate] = useState('')

// Drag & drop state
const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null)
```

---

## 🎨 UI Components

### Used Components
- `Dialog` - Task creation/editing modals
- `Select` - Status and user selection
- `Input` - Text and date inputs
- `Textarea` - Description field
- `Card` - Layout structure
- `Button` - All actions
- `Label` - Form labels

### Icons (Lucide React)
- `Workflow` - Workflow icon
- `CheckSquare` - Board icon
- `Plus` - Add task
- `Pencil` - Edit task
- `Trash2` - Delete task
- `GripVertical` - Drag handle
- `User` - Assigned user
- `Calendar` - Due date
- `ArrowLeft` - Back navigation

---

## 🔐 Security

### RLS Policies
- ✅ Authenticated users can view all workflow steps
- ✅ Authenticated users can create workflow steps
- ✅ Authenticated users can update workflow steps
- ✅ Authenticated users can delete workflow steps

### Data Validation
- Client-side validation for required fields
- Server-side validation via CHECK constraints
- Foreign key constraints for data integrity
- Automatic timestamp management

---

## 📱 Responsive Design

### Breakpoints
- **Mobile** (< 768px): 1 column layout
- **Tablet** (768px - 1024px): 3 column layout (scrollable)
- **Desktop** (> 1024px): 3 column layout (full width)

### Mobile Optimizations
- Touch-friendly drag & drop
- Larger tap targets for buttons
- Condensed card information
- Responsive dialog sizing

---

## 🚨 Error Handling

### Toast Notifications
```typescript
// Success
toast({
  title: 'Sucesso',
  description: 'Tarefa criada com sucesso!'
})

// Error
toast({
  title: 'Erro',
  description: 'Não foi possível criar a tarefa',
  variant: 'destructive'
})
```

### Common Errors
- **Missing workflow**: Returns to list page
- **Database error**: Shows toast with error message
- **Empty title**: Button disabled, validation prevents submit
- **No user selected**: Allowed (optional field)

---

## 🎯 Best Practices

### Task Management
1. Use descriptive titles for tasks
2. Add descriptions for complex tasks
3. Assign tasks to specific users when possible
4. Set realistic due dates
5. Keep tasks granular and actionable

### Workflow Organization
1. Use clear workflow titles
2. Set workflow status (Active/Draft)
3. Keep number of tasks manageable
4. Review and update regularly
5. Archive completed workflows

### Performance Tips
1. Limit tasks per workflow (< 50 recommended)
2. Use pagination if needed
3. Clean up old completed tasks
4. Optimize database queries
5. Monitor RLS policy performance

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Create workflow
- [ ] Create task with all fields
- [ ] Create task with minimal fields
- [ ] Edit task
- [ ] Delete task
- [ ] Drag task between columns
- [ ] Assign user to task
- [ ] Set due date
- [ ] View task details on card

### UI Testing
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Dialog animations
- [ ] Drag visual feedback
- [ ] Empty state display
- [ ] Loading states
- [ ] Error toast display

### Security Testing
- [ ] RLS policies work correctly
- [ ] Only authenticated users can access
- [ ] Foreign keys prevent orphaned data
- [ ] Timestamps auto-update

---

## 📚 Related Documentation
- `SMART_WORKFLOWS_IMPLEMENTATION.md` - Complete technical guide
- `SMART_WORKFLOWS_VISUAL_SUMMARY.md` - Visual documentation with diagrams
- `SMART_WORKFLOWS_PR506_COMPLETE.md` - Implementation completion summary

---

## 🆘 Troubleshooting

### Issue: Tasks not appearing
**Solution**: Check RLS policies, verify user authentication

### Issue: Drag & drop not working
**Solution**: Ensure using modern browser (Chrome, Firefox, Safari), check console for errors

### Issue: User list empty
**Solution**: Verify profiles table has data, check database connection

### Issue: Date picker not showing
**Solution**: Use browser that supports HTML5 date input, check input type

### Issue: Changes not saving
**Solution**: Check network tab for errors, verify Supabase connection, check RLS policies

---

**Last Updated**: 2025-10-14
**Version**: 1.0
**Status**: Production Ready ✅
