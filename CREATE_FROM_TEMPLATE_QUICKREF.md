# TipTap Editor Integration - Quick Reference

## 🚀 Quick Start

### Access the Feature
```
URL: /admin/documents/create-from-template
Demo: /admin/documents/create-from-template-demo
```

### Basic Usage
```typescript
import CreateFromTemplate from '@/pages/admin/documents/create-from-template';

const template = {
  title: "My Template",
  content: "<p>Hello {{name}}, your {{item}} is ready!</p>"
};

<CreateFromTemplate template={template} />
```

## 📚 API Reference

### Document Interface
```typescript
export interface Document {
  id?: string;
  title?: string;      // For ai_generated_documents
  content: string;     // Required
  prompt?: string;     // For ai_generated_documents
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
}
```

### createDocument()
```typescript
// Save to ai_generated_documents (with title)
await createDocument({
  title: "My Document",
  content: "<p>Content here</p>",
  prompt: "Generated from template"
});

// Save to documents (without title - backward compatible)
await createDocument({
  content: "<p>Content here</p>"
});
```

### updateDocument()
```typescript
// Update ai_generated_documents
await updateDocument(id, {
  title: "Updated Title",
  content: "<p>Updated content</p>"
});

// Update documents
await updateDocument(id, {
  content: "<p>Updated content</p>"
});
```

## 🎨 TipTap Editor Component

### Props
```typescript
interface TipTapEditorProps {
  content: string;              // HTML or plain text
  onChange?: (content: string) => void;  // Callback on change
  readOnly?: boolean;           // Default: false
  className?: string;           // Additional CSS
}
```

### Examples
```typescript
// Editable editor
<TipTapEditor 
  content={htmlContent}
  onChange={(newContent) => setContent(newContent)}
/>

// Read-only preview
<TipTapEditor 
  content={htmlContent}
  readOnly={true}
/>
```

## 📝 Template Variable System

### Variable Format
```
Use {{variableName}} in your templates
Example: "Hello {{firstName}} {{lastName}}"
```

### Automatic Extraction
```typescript
// Template content
const content = "<p>Employee: {{name}}, Dept: {{department}}</p>";

// Automatically extracts: ["name", "department"]
// Generates input fields for each
```

### Variable Substitution
```typescript
// Before: "Hello {{name}}, welcome to {{company}}"
// User fills: name="John", company="Acme"
// After: "Hello John, welcome to Acme"
```

## 🎯 User Workflow

### Step-by-Step
```
1. Load template with variables
   └─> Automatically extracts {{variables}}

2. Fill variable values in generated form
   └─> Each variable gets an input field

3. Click "Apply Variables"
   └─> Substitution happens
   └─> Variable form disappears

4. Edit content with TipTap rich text editor
   └─> Add formatting, modify text, etc.

5. Save or Export
   ├─> Save: Stores in ai_generated_documents
   └─> Export: Browser print dialog (PDF)
```

## 🗄️ Database Routing

### Automatic Table Selection
```typescript
// With title → ai_generated_documents
createDocument({ 
  title: "Doc", 
  content: "..." 
});

// Without title → documents
createDocument({ 
  content: "..." 
});
```

### Tables
```
ai_generated_documents
├─ id: UUID
├─ title: TEXT ✓
├─ content: TEXT ✓
├─ prompt: TEXT ✓
├─ generated_by: UUID
├─ created_at: TIMESTAMPTZ
└─ updated_at: TIMESTAMPTZ

documents (collaborative editing)
├─ id: UUID
├─ content: TEXT ✓
├─ updated_by: UUID
├─ created_at: TIMESTAMPTZ
└─ updated_at: TIMESTAMPTZ
```

## 🧪 Testing

### Run Tests
```bash
npm test src/tests/pages/admin/documents/create-from-template.test.tsx
```

### Test Coverage
```
✓ Component renders with template title
✓ Extracts and displays variable inputs
✓ Applies variables when button clicked
✓ Hides variable inputs after applying
✓ Saves document when save button clicked
✓ Handles templates without variables
✓ Allows editing document title
✓ Triggers print for PDF export
✓ Handles JSON template content
```

## 🛠️ Build & Deploy

### Development
```bash
npm run dev
# Visit: http://localhost:5173/admin/documents/create-from-template
```

### Build
```bash
npm run build
# ✓ Build passes with zero errors
```

### Lint
```bash
npm run lint
# ✓ No linting errors in new files
```

## 📦 Dependencies

### Required (Already Installed)
```json
{
  "@tiptap/react": "^2.26.3",
  "@tiptap/starter-kit": "^2.26.3",
  "@supabase/supabase-js": "^2.57.4",
  "sonner": "^1.7.4",
  "react": "^18.3.1"
}
```

### No New Dependencies Added ✓

## 🔒 Security

### Authentication
```typescript
// All operations require authenticated user
const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;  // Rejected
```

### Row-Level Security
```sql
-- RLS policies active on both tables
-- Users can only access their own documents
```

## 🐛 Common Issues

### Issue: TipTap not loading
```typescript
// Solution: Component already uses direct import
import TipTapEditor from '@/components/editor/tiptap';
// ✓ No SSR issues (not using Next.js)
```

### Issue: Variables not detected
```typescript
// Ensure proper format
"Hello {{name}}"        // ✓ Correct
"Hello {{ name }}"      // ✓ Also works (trimmed)
"Hello {name}"          // ✗ Wrong (needs double braces)
```

### Issue: Save not working
```typescript
// Check user authentication
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // User must be logged in
}
```

## 📊 Performance

### Metrics
```
Build time: ~1 minute
Test runtime: ~1.5 seconds
Bundle impact: Minimal (TipTap already in deps)
Code splitting: Automatic (React lazy loading)
```

## 🎁 Features Summary

| Feature | Status |
|---------|--------|
| Variable Extraction | ✅ Automatic |
| Variable Substitution | ✅ Working |
| Rich Text Editing | ✅ Full TipTap |
| Title Editing | ✅ Supported |
| Document Saving | ✅ Smart routing |
| PDF Export | ✅ Via print |
| Test Coverage | ✅ 9/9 passing |
| TypeScript | ✅ Fully typed |
| Backward Compatible | ✅ 100% |
| Production Ready | ✅ Yes |

## 🔗 Related Files

```
src/
├── components/
│   └── editor/
│       ├── tiptap.tsx                    # NEW: Reusable editor
│       └── tiptap-preview.tsx            # Existing preview
├── lib/
│   └── documents/
│       └── api.ts                        # MODIFIED: Enhanced API
├── pages/
│   └── admin/
│       └── documents/
│           ├── create-from-template.tsx      # NEW: Main feature
│           ├── create-from-template-demo.tsx # NEW: Demo page
│           └── apply-template.tsx            # Existing (unchanged)
└── tests/
    └── pages/
        └── admin/
            └── documents/
                └── create-from-template.test.tsx  # NEW: Tests

Documentation:
├── CREATE_FROM_TEMPLATE_IMPLEMENTATION_COMPLETE.md
├── CREATE_FROM_TEMPLATE_VISUAL_COMPARISON.md
└── CREATE_FROM_TEMPLATE_QUICKREF.md (this file)
```

## 💡 Tips

1. **Testing Variables**: Use the demo page for quick testing
2. **Custom Templates**: Create templates in the templates management system
3. **Reusable Editor**: Import `TipTapEditor` component anywhere in the app
4. **Backward Compatibility**: Existing code continues to work unchanged
5. **Error Handling**: All API functions return null on error (check logs)

## 🎓 Example Templates

### Travel Report
```typescript
{
  title: "Travel Report",
  content: `
    <h1>Travel Report for {{employee_name}}</h1>
    <p><strong>Destination:</strong> {{destination}}</p>
    <p><strong>Date:</strong> {{travel_date}}</p>
  `
}
```

### Meeting Minutes
```typescript
{
  title: "Meeting Minutes",
  content: `
    <h1>{{meeting_title}}</h1>
    <p><strong>Date:</strong> {{date}}</p>
    <p><strong>Attendees:</strong> {{attendees}}</p>
    <h2>Discussion</h2>
    <p>{{discussion}}</p>
  `
}
```

### Email Template
```typescript
{
  title: "Email Template",
  content: `
    <p>Dear {{recipient_name}},</p>
    <p>{{message_body}}</p>
    <p>Best regards,<br>{{sender_name}}</p>
  `
}
```

---

**Ready to use!** Visit `/admin/documents/create-from-template` to get started.
