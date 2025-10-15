# Workflow Suggestions - Quick Reference

## 🚀 Quick Start

When you create a new workflow, 8 AI suggestions are automatically added!

### For Users
1. Go to `/admin/workflows`
2. Create a workflow (enter title + click "Criar")
3. Open the workflow detail page
4. Scroll down to see "💡 Sugestões da IA"
5. Review the 8 automatic suggestions

### For Developers
```typescript
import { seedSuggestionsForWorkflow } from '@/lib/workflows/seedSuggestions';

// After creating a workflow
const success = await seedSuggestionsForWorkflow(workflowId);
```

## 📂 File Structure

```
src/
├── lib/
│   └── workflows/
│       ├── suggestionTemplates.ts    # 8 templates
│       └── seedSuggestions.ts        # Seeding function
├── pages/
│   └── admin/
│       └── workflows/
│           ├── index.tsx             # Modified: seeds on create
│           └── detail.tsx            # Modified: displays suggestions
└── tests/
    └── lib/
        └── workflows/
            └── seedSuggestions.test.ts  # 7 tests
```

## 🎯 8 Default Suggestions

| # | Etapa | Criticidade | Origem | Tipo |
|---|-------|------------|--------|------|
| 1 | Planejamento Inicial | Alta | Template Histórico | Criar tarefa |
| 2 | Revisão de Documentos | Alta | Checklists | Criar tarefa |
| 3 | Aprovação de Recursos | Média | MMI | Ajustar prazo |
| 4 | Execução | Média | Template Histórico | Criar tarefa |
| 5 | Validação de Qualidade | Alta | Audit Logs | Criar tarefa |
| 6 | Comunicação com Stakeholders | Média | Template Histórico | Criar tarefa |
| 7 | Documentação Final | Alta | Checklists | Criar tarefa |
| 8 | Análise de Riscos | Alta | MMI | Criar tarefa |

## 🎨 UI Components

### Color Coding
- 🔴 **Alta** (High): Red background, red border, triangle icon
- 🟡 **Média** (Medium): Yellow background, yellow border, circle icon
- 🔵 **Baixa** (Low): Blue background, blue border, info icon

### Badges
1. **Type**: `[Criar tarefa]`, `[Ajustar prazo]`
2. **Priority**: `[alta]`, `[média]`, `[baixa]`
3. **Source**: `[Template Histórico]`, `[Checklists]`, `[MMI]`, `[Audit Logs]`

## 🔍 Key Functions

### `seedSuggestionsForWorkflow(workflow_id: string): Promise<boolean>`
- **Purpose**: Seeds 8 suggestions for a new workflow
- **Location**: `src/lib/workflows/seedSuggestions.ts`
- **Returns**: `true` if successful, `false` on error
- **Usage**: Called automatically after workflow creation

### `fetchSuggestions()`
- **Purpose**: Fetches suggestions from database
- **Location**: `src/pages/admin/workflows/detail.tsx`
- **Called**: In `useEffect` when page loads

## 📊 Database

### Table: `workflow_ai_suggestions`
```sql
workflow_id              UUID (FK to smart_workflows)
etapa                    TEXT
tipo_sugestao            TEXT
conteudo                 TEXT
criticidade              TEXT
responsavel_sugerido     TEXT
origem                   TEXT
gerada_em                TIMESTAMP (default: now())
gerada_por               TEXT (default: 'IA')
```

## 🧪 Testing

**Run tests:**
```bash
npm test src/tests/lib/workflows/seedSuggestions.test.ts
```

**Test coverage:**
- ✅ Seeds suggestions with workflow_id
- ✅ Returns false on error
- ✅ Handles exceptions
- ✅ Validates template structure
- ✅ Validates field values

**Status:** All 363 tests passing (356 existing + 7 new)

## 🔧 Technical Stack

- **Framework**: React + TypeScript
- **UI**: shadcn/ui components
- **Database**: Supabase
- **Icons**: Lucide React
- **Testing**: Vitest

## 📝 Code Examples

### Creating a Workflow (Modified)
```typescript
// src/pages/admin/workflows/index.tsx
async function createWorkflow() {
  const { data: newWorkflow, error } = await supabase
    .from('smart_workflows')
    .insert({ title: newTitle, created_by: user?.id })
    .select()
    .single()
  
  if (error) throw error
  
  // NEW: Seed suggestions automatically
  if (newWorkflow?.id) {
    await seedSuggestionsForWorkflow(newWorkflow.id)
  }
}
```

### Displaying Suggestions (New)
```typescript
// src/pages/admin/workflows/detail.tsx
async function fetchSuggestions() {
  const { data, error } = await supabase
    .from("workflow_ai_suggestions")
    .select("*")
    .eq("workflow_id", id)
    .order("gerada_em", { ascending: false });
  
  setSuggestions(data || []);
}
```

## 🎯 Benefits

1. ✅ **Immediate Value**: Users see suggestions instantly
2. ✅ **Reduced Cognitive Load**: Pre-filled best practices
3. ✅ **Consistency**: All workflows start with proven templates
4. ✅ **Compliance**: Built-in critical step reminders
5. ✅ **Zero Breaking Changes**: Fully backward compatible

## 📚 Documentation

- **Implementation Guide**: `WORKFLOW_SUGGESTIONS_IMPLEMENTATION.md`
- **Visual Guide**: `WORKFLOW_SUGGESTIONS_VISUAL_GUIDE.md`
- **This Guide**: `WORKFLOW_SUGGESTIONS_QUICKREF.md`

## ✨ What's New

### Added
- 8 pre-defined suggestion templates
- Automatic seeding on workflow creation
- Visual suggestions panel in detail page
- 7 comprehensive tests
- Complete documentation

### Modified
- `index.tsx`: Seeds suggestions after workflow insert
- `detail.tsx`: Displays suggestions with color coding

### Zero Breaking Changes
- Existing workflows unaffected
- All existing tests still passing
- Backward compatible API

## 🎉 Status

✅ **PRODUCTION READY**
- Build successful
- All tests passing (363/363)
- No TypeScript errors
- No linter errors
- Fully documented

---

**Need help?** Check the full guides:
- `WORKFLOW_SUGGESTIONS_IMPLEMENTATION.md` for technical details
- `WORKFLOW_SUGGESTIONS_VISUAL_GUIDE.md` for UI reference
