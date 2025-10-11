# Document Feature - Code Structure

## Database Migration

File: `supabase/migrations/20251011043700_create_documents_table.sql`

```sql
-- Creates documents table with RLS policies
-- Allows authors and admins to edit documents
-- Includes automatic timestamp updates
```

## Document View Component

File: `src/pages/admin/documents/DocumentView.tsx`

### Key Features:
1. **Permission Check**
   - Checks if user is admin via `organization_users` table
   - Checks if user is document author via `user_id` comparison

2. **Display Logic**
   - Shows loading state while fetching
   - Shows "Document not found" if document doesn't exist
   - Shows document content with formatted date
   - Shows author email (admins only)

3. **Edit Mode**
   - Toggle between read and edit mode
   - Textarea for content editing
   - Save and Cancel buttons
   - Toast notifications

### Component Structure:
```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// State management
const [doc, setDoc] = useState<Document | null>(null);
const [loading, setLoading] = useState(true);
const [editing, setEditing] = useState(false);
const [newContent, setNewContent] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [authorEmail, setAuthorEmail] = useState<string | null>(null);

// Permission logic
const canEdit = isAdmin || user?.id === doc.user_id;
```

## Document List Component

File: `src/pages/admin/documents/DocumentList.tsx`

### Key Features:
1. **Document Grid Display**
   - Shows all accessible documents
   - Card-based layout
   - Preview of content (3 lines)
   - Creation date

2. **Create Document Dialog**
   - Modal form for creating new documents
   - Title and content fields
   - Creates document and navigates to view

3. **Navigation**
   - Clicking a card navigates to document view

### Component Structure:
```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// State management
const [documents, setDocuments] = useState<Document[]>([]);
const [loading, setLoading] = useState(true);
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [newDocument, setNewDocument] = useState({
  title: "",
  content: "",
});
```

## Routes

File: `src/App.tsx`

```typescript
// Document management routes
const DocumentView = React.lazy(() => import("./pages/admin/documents/DocumentView"));
const DocumentList = React.lazy(() => import("./pages/admin/documents/DocumentList"));

// In Routes component:
<Route path="/admin/documents" element={<DocumentList />} />
<Route path="/admin/documents/view/:id" element={<DocumentView />} />
```

## User Flow Diagrams

### View Document Flow:
```
User navigates to /admin/documents
  ↓
Sees grid of document cards
  ↓
Clicks on a document
  ↓
Navigates to /admin/documents/view/:id
  ↓
Component loads document from Supabase
  ↓
Checks if user is admin or author
  ↓
If authorized: Shows edit button
If not authorized: Shows read-only view
```

### Edit Document Flow:
```
User opens document (as author or admin)
  ↓
Clicks "Editar Documento" button
  ↓
Content displayed in textarea
  ↓
User modifies content
  ↓
User clicks "Salvar Alterações"
  ↓
Supabase updates document
  ↓
Success toast shown
  ↓
Edit mode closed, updated content displayed
```

## Security Flow

### Database Level (RLS):
```
User attempts to read/update document
  ↓
Supabase checks RLS policies
  ↓
Policy 1: Is user the author? (user_id = auth.uid())
Policy 2: Is user an admin? (check organization_users table)
  ↓
If YES to either: Allow operation
If NO to both: Deny operation
```

### Application Level:
```
Component loads
  ↓
Fetches user role from organization_users
  ↓
Fetches document from documents table
  ↓
Compares user.id with document.user_id
  ↓
Sets canEdit = isAdmin || isAuthor
  ↓
Shows/hides edit button based on canEdit
```

## Key Implementation Details

### Permission Check (Admin):
```typescript
const { data: orgUser } = await supabase
  .from("organization_users")
  .select("role")
  .eq("user_id", user.id)
  .eq("status", "active")
  .single();

const userIsAdmin = orgUser?.role === "admin" || orgUser?.role === "owner";
```

### Fetch Author Email (Admin View):
```typescript
const { data: author } = await supabase
  .from("profiles")
  .select("email")
  .eq("id", data.user_id)
  .single();

setAuthorEmail(author?.email || null);
```

### Save Document Changes:
```typescript
const { error } = await supabase
  .from("documents")
  .update({ content: newContent })
  .eq("id", id);
```

## Dependencies

- React Router DOM (routing)
- Supabase (database and auth)
- date-fns (date formatting)
- shadcn/ui components (UI)
- lucide-react (icons)
- Custom hooks:
  - useAuth (authentication)
  - useToast (notifications)

## File Structure

```
travel-hr-buddy/
├── src/
│   ├── pages/
│   │   └── admin/
│   │       └── documents/
│   │           ├── DocumentView.tsx    (View/Edit document)
│   │           └── DocumentList.tsx    (List/Create documents)
│   └── App.tsx                         (Routes)
└── supabase/
    └── migrations/
        └── 20251011043700_create_documents_table.sql
```
