# 🚀 Smart Workflows Kanban - Quick Reference

## 📝 Quick Add Task
```
1. Type task title in top input
2. Press Enter or click "Adicionar"
3. Task appears in Pendente column
```

## ➕ Create Full Task
```
1. Click "Nova Tarefa" button
2. Fill form (Title required)
3. Click "Criar"
```

## ✏️ Edit Task
```
1. Click edit icon (pencil) on task card
2. Modify fields in dialog
3. Click "Atualizar"
```

## 🗑️ Delete Task
```
1. Click trash icon on task card
2. Confirm in dialog
3. Task deleted
```

## 🖱️ Drag & Drop
```
1. Click and hold grip icon
2. Drag to target column
3. Release to drop
4. Status updates automatically
```

## ⚡ Status Transitions

### From Pendente
- Click "Iniciar" → Em Progresso

### From Em Progresso
- Click "Voltar" → Pendente
- Click "Concluir" → Concluído

### From Concluído
- Click "Reabrir" → Em Progresso

## 🎯 Task Fields

| Field | Required | Description |
|-------|----------|-------------|
| Title | ✅ Yes | Task name |
| Description | ❌ No | Task details |
| Status | ✅ Yes | Pendente / Em Progresso / Concluído |
| Priority | ❌ No | Baixa / Média / Alta / Urgente |
| Assigned To | ❌ No | Select from users |
| Due Date | ❌ No | Deadline date |

## 🎨 Status Colors

- 🟡 **Pendente** - Yellow background
- 🔵 **Em Progresso** - Blue background
- 🟢 **Concluído** - Green background

## 🔔 Toast Notifications

### Success Messages
- ✅ "Tarefa adicionada com sucesso!"
- ✅ "Tarefa criada com sucesso!"
- ✅ "Tarefa atualizada com sucesso!"
- ✅ "Tarefa excluída com sucesso!"
- ✅ "Status atualizado com sucesso!"
- ✅ "Tarefa movida para [status]!"

### Error Messages
- ❌ "Não foi possível adicionar a tarefa"
- ❌ "Não foi possível salvar a tarefa"
- ❌ "Não foi possível atualizar o status"
- ❌ "Não foi possível excluir a tarefa"
- ❌ "Não foi possível mover a tarefa"

## 🎮 Keyboard Shortcuts

- **Enter** in quick add input → Creates task
- **Escape** in dialogs → Closes dialog

## 📱 Responsive Breakpoints

- **Mobile** (< 768px): 1 column
- **Tablet** (≥ 768px): 2 columns
- **Desktop** (≥ 1024px): 3 columns

## 🔍 Task Card Elements

### Icons
- **GripVertical** - Drag handle
- **User** - Assigned person
- **Calendar** - Due date
- **AlertCircle** - Priority indicator
- **Edit2** - Edit button
- **Trash2** - Delete button

### Badges
- **Task Count** - Number in each column
- **User Badge** - Shows assigned user name
- **Date Badge** - Shows due date
- **Priority Badge** - Color-coded by level

## 🎯 Priority Colors

- **Baixa** - Secondary badge (gray)
- **Média** - No special badge (default)
- **Alta** - Destructive badge (red)
- **Urgente** - Destructive badge (red)

## 🔗 Database Tables

- **smart_workflows** - Workflow metadata
- **smart_workflow_steps** - Task data
- **profiles** - User information

## 💡 Pro Tips

1. **Quick Tasks** - Use quick add for simple tasks
2. **Detailed Tasks** - Use dialog for tasks with descriptions, priorities, etc.
3. **Drag for Speed** - Drag & drop is fastest for status changes
4. **Buttons for Precision** - Use buttons if drag is difficult
5. **Auto-Assignment** - Quick add auto-assigns you as owner
6. **Empty States** - Show helpful hints when columns are empty

## 🚨 Common Issues

### Task not saving?
- ✅ Check title is not empty
- ✅ Check internet connection
- ✅ Check browser console for errors

### Drag not working?
- ✅ Click and hold grip icon
- ✅ Ensure mouse/touch is supported
- ✅ Use status buttons as alternative

### User not in dropdown?
- ✅ Ensure user has profile in database
- ✅ Refresh page to reload users
- ✅ Check profiles table has data

## 📊 Implementation Stats

- **File:** `src/pages/admin/workflows/detail.tsx`
- **Lines:** 841 lines
- **Build Time:** ~47s
- **Bundle Size:** ~6.5 KB gzipped
- **Dependencies:** React, Supabase, shadcn/ui

## 🎯 Feature Completeness

| Feature | Status |
|---------|--------|
| Create Task (Quick) | ✅ |
| Create Task (Full) | ✅ |
| Edit Task | ✅ |
| Delete Task | ✅ |
| Drag & Drop | ✅ |
| Status Buttons | ✅ |
| User Assignment | ✅ |
| Due Dates | ✅ |
| Priorities | ✅ |
| Descriptions | ✅ |
| Toast Notifications | ✅ |
| Error Handling | ✅ |
| Responsive Design | ✅ |
| Type Safety | ✅ |

---

**Version:** 1.0.0  
**Last Updated:** October 14, 2025  
**Status:** Production Ready ✅
