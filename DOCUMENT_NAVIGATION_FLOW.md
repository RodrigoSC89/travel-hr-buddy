# Document Management System - Navigation Flow

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  /admin/documents/ai                        │
│              📄 Documentos com IA                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  [Meus Documentos] button                          │     │
│  │         ↓                                           │     │
│  │  - Title input                                      │     │
│  │  - Prompt textarea                                  │     │
│  │  - [Gerar com IA] button                           │     │
│  │                                                     │     │
│  │  Generated Document Display:                       │     │
│  │  - Content preview                                 │     │
│  │  - [Salvar no Supabase] button                    │     │
│  │  - [Exportar em PDF] button                       │     │
│  │  - [Resumir com IA] button                        │     │
│  │  - [Reformular IA] button                         │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Click [Meus Documentos]
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               /admin/documents/list                         │
│              📂 Meus Documentos                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Grid of saved documents (2 columns)               │     │
│  │                                                     │     │
│  │  ┌──────────────────┐  ┌──────────────────┐      │     │
│  │  │ 📄 Document 1    │  │ 📄 Document 2    │      │     │
│  │  │ Created: date    │  │ Created: date    │      │     │
│  │  │ [Visualizar]     │  │ [Visualizar]     │      │     │
│  │  └──────────────────┘  └──────────────────┘      │     │
│  │                                                     │     │
│  │  ┌──────────────────┐  ┌──────────────────┐      │     │
│  │  │ 📄 Document 3    │  │ 📄 Document 4    │      │     │
│  │  │ Created: date    │  │ Created: date    │      │     │
│  │  │ [Visualizar]     │  │ [Visualizar]     │      │     │
│  │  └──────────────────┘  └──────────────────┘      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Click [Visualizar]
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           /admin/documents/view/:id                         │
│  [← Voltar]                          [Exportar PDF]         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  📄 Document Title                                  │     │
│  │  Criado em: dd/MM/yyyy às HH:mm                   │     │
│  │                                                     │     │
│  │  Conteúdo:                                         │     │
│  │  ┌──────────────────────────────────────────┐    │     │
│  │  │ Full document content displayed here     │    │     │
│  │  │ with whitespace preserved                │    │     │
│  │  └──────────────────────────────────────────┘    │     │
│  │                                                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Click [← Voltar]
                         ↓
              Back to /admin/documents/list
```

## File Mapping

### Component Files
- **AI Generation Page**: `src/pages/admin/documents-ai.tsx`
  - Route: `/admin/documents/ai`
  - Features: Generate, save, export, summarize, rewrite documents
  
- **Document List Page**: `src/pages/admin/documents-list.tsx` ⭐ NEW
  - Route: `/admin/documents/list`
  - Features: View all saved documents, navigate to individual documents
  
- **Document View Page**: `src/pages/admin/documents/DocumentView.tsx` (from main/PR #218)
  - Route: `/admin/documents/view/:id`
  - Features: View document details, export to PDF

### Test Files
- `src/tests/pages/admin/documents-ai.test.tsx` (existing, 7 tests)
- `src/tests/pages/admin/documents-list.test.tsx` ⭐ NEW (5 tests)
- Document view tests exist for the DocumentView component

### Routing Configuration
All routes defined in `src/App.tsx`:
```typescript
const DocumentsAI = React.lazy(() => import("./pages/admin/documents-ai"));
const DocumentsList = React.lazy(() => import("./pages/admin/documents-list"));
const DocumentView = React.lazy(() => import("./pages/admin/documents/DocumentView"));

// Routes:
<Route path="/admin/documents/ai" element={<DocumentsAI />} />
<Route path="/admin/documents/list" element={<DocumentsList />} />
<Route path="/admin/documents/view/:id" element={<DocumentView />} />
```

## Navigation Links

### From AI Page → List Page
```tsx
// In documents-ai.tsx
<Link to="/admin/documents/list">
  <Button variant="outline" size="sm">
    <List className="w-4 h-4 mr-2" />
    Meus Documentos
  </Button>
</Link>
```

### From List Page → View Page
```tsx
// In documents-list.tsx
<Link to={`/admin/documents/view/${doc.id}`}>
  <Button variant="outline" size="sm">
    Visualizar
  </Button>
</Link>
```

### From View Page → List Page
```tsx
// In DocumentView.tsx (already exists)
<Link to="/admin/documents/list">
  <Button variant="outline" size="sm">
    <ArrowLeft className="w-4 h-4 mr-2" />
    Voltar
  </Button>
</Link>
```

## Data Flow

```
User Authentication (Supabase Auth)
         ↓
   User ID obtained
         ↓
Generate Document (AI Generation Page)
         ↓
Save to Database (ai_generated_documents table)
    - id: UUID
    - title: TEXT
    - content: TEXT
    - prompt: TEXT
    - generated_by: UUID (user_id)
    - created_at: TIMESTAMP
         ↓
Query User's Documents (Document List Page)
    SELECT id, title, created_at
    WHERE generated_by = user.id
    ORDER BY created_at DESC
         ↓
View Individual Document (Document View Page)
    SELECT *
    WHERE id = :id
```

## Security
- **Row Level Security (RLS)**: Users can only view their own documents
- **Authentication**: Supabase Auth used throughout
- **User Filtering**: All queries filter by `generated_by = user.id`

## Features Comparison

| Feature | AI Generation | Document List | Document View |
|---------|--------------|---------------|---------------|
| Generate new docs | ✅ | ❌ | ❌ |
| Save to DB | ✅ | ❌ | ❌ |
| View all docs | ❌ | ✅ | ❌ |
| View single doc | ✅ (generated) | ❌ | ✅ (saved) |
| Export PDF | ✅ | ❌ | ✅ |
| Summarize | ✅ | ❌ | ❌ |
| Rewrite | ✅ | ❌ | ❌ |
| Navigate to list | ✅ | - | ✅ |

## Conflict Resolution Notes

**Original PR #217 wanted to add:**
- ✅ documents-list.tsx → Added
- ❌ documents-view.tsx → NOT added (duplicate of existing DocumentView.tsx)
- ✅ Navigation button → Added
- ✅ Route for list → Added
- ❌ Route for view → Already exists from PR #218

**Result:**
- Merged functionality from PR #217 (document list)
- Reused existing functionality from main/PR #218 (document view)
- No code duplication
- Complete user workflow maintained
