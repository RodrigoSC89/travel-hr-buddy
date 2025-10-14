# Templates Module with AI - Implementation Guide

## 📦 Overview

The Templates module provides a complete template management system with AI integration for the Nautilus One platform. Users can create, edit, manage, and apply document templates with intelligent assistance from OpenAI GPT-4.

## 🎯 Features Implemented

### 1. Database Layer
- **Table**: `templates` with the following columns:
  - `id` (UUID): Primary key
  - `title` (TEXT): Template title
  - `content` (TEXT): Template content (HTML or plain text)
  - `created_by` (UUID): Foreign key to auth.users
  - `created_at` (TIMESTAMPTZ): Creation timestamp
  - `updated_at` (TIMESTAMPTZ): Last update timestamp
  - `is_favorite` (BOOLEAN): Mark as favorite
  - `is_private` (BOOLEAN): Private visibility flag

- **Row Level Security (RLS)**:
  - Users can view their own templates and public templates
  - Only the author can edit/delete their templates
  - All authenticated users can create templates

### 2. Page Route
- **URL**: `/admin/templates`
- **Access**: Authenticated users (protected by SmartLayout)

### 3. User Interface

#### Create/Edit Tab
- Title input with AI suggestion button
- Optional prompt field for AI generation
- Generate with AI button
- Rewrite content button
- Large content textarea for template body
- Save/Update button with loading states
- Cancel editing button

#### List Tab
- Search bar with real-time filtering
- Filter buttons for:
  - Favorites only
  - Private templates only
- Responsive card grid layout (3 columns on large screens)
- Each template card shows:
  - Title
  - Content preview (first 100 characters)
  - Creation date
  - Favorite and Private badges
  - Action buttons:
    - Edit
    - Duplicate
    - Apply (to documents-ai)
    - Toggle Favorite
    - Toggle Private
    - Export PDF
    - Delete (with confirmation dialog)

### 4. AI Features

#### Generate Content
- Uses the **specialized** `generate-template` edge function
- Takes the title and optional purpose/context
- Generates complete template content optimized for reusability with GPT-4o-mini
- Automatically includes variable fields in `[VARIABLE_NAME]` format
- Maritime/technical context awareness
- Includes common fields: `[NOME_TECNICO]`, `[DATA]`, `[EMBARCACAO]`, `[EMPRESA]`, etc.
- Automatically populates the content field

#### Enhance Content (formerly "Rewrite")
- Uses the **specialized** `enhance-template` edge function
- Takes existing content
- Improves clarity, grammar, and professionalism
- **CRITICAL**: Preserves ALL variable fields `[VARIABLE_NAME]`
- Maintains template structure and organization
- Updates the content field with the enhanced version

#### Suggest Title
- Uses the `generate-document` edge function
- Analyzes the content (first 500 characters)
- Generates a concise, descriptive title
- Automatically fills the title field

### 5. Template Operations

#### Create
- Fill in title and content (manually or with AI)
- Click "Salvar Template"
- Template saved with current user as creator
- Automatically reloads template list

#### Update
- Click "Edit" on any template
- Modify title and/or content
- Click "Atualizar Template"
- Changes saved to database

#### Delete
- Click "Delete" button
- Confirmation dialog appears
- Confirm to permanently delete

#### Duplicate
- Click "Duplicate" button
- Loads template with " (Cópia)" suffix
- Edit as needed and save as new template

#### Apply to Documents
- Click "Apply" button
- Template data stored in sessionStorage
- Redirects to `/admin/documents/ai`
- Template automatically loaded in documents-ai page

#### Export PDF
- Click "PDF" button
- Generates PDF using jsPDF
- Includes title and content with proper formatting
- Downloads automatically

#### Toggle Favorite
- Click favorite button
- Updates is_favorite flag
- Shows/hides star badge

#### Toggle Private
- Click private button
- Updates is_private flag
- Shows/hides lock badge
- Controls visibility to other users

### 6. Integration with Documents AI

The templates page integrates seamlessly with the documents-ai page:

1. When "Apply" is clicked on a template:
   - Template data is stored in sessionStorage
   - User is redirected to `/admin/documents/ai`

2. On documents-ai page load:
   - Checks for applied template in sessionStorage
   - Loads title and content
   - Clears sessionStorage
   - Shows success toast

This allows users to quickly use templates as starting points for AI-generated documents.

## 🔧 Technical Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **UI Components**: ShadCN UI (Card, Button, Input, Textarea, Badge, Tabs, AlertDialog)
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: OpenAI GPT-4 (via Supabase Edge Functions)
- **PDF Export**: jsPDF
- **Routing**: React Router v6
- **Toast Notifications**: Custom hook

## 📁 Files Created/Modified

### Created
1. `supabase/migrations/20251014191200_create_templates_table.sql`
   - Database migration for templates table
   - RLS policies
   - Indexes for performance
   - Auto-update trigger for updated_at

2. `src/pages/admin/templates.tsx`
   - Main templates management page
   - 890+ lines of TypeScript/React code
   - Complete CRUD operations
   - AI integration
   - PDF export
   - Template application

### Modified
1. `src/App.tsx`
   - Added Templates lazy import
   - Added `/admin/templates` route

2. `src/integrations/supabase/types.ts`
   - Added templates table TypeScript types
   - Row, Insert, Update interfaces
   - Relationships definition

3. `src/pages/admin/documents-ai.tsx`
   - Added useEffect import
   - Added sessionStorage integration
   - Loads applied templates on page load

## 🎨 UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Tab Navigation**: Clean separation between create/edit and list views
- **Real-time Search**: Instant filtering as you type
- **Loading States**: Visual feedback for all async operations
- **Toast Notifications**: User feedback for all actions
- **Confirmation Dialogs**: Prevent accidental deletions
- **Badge Indicators**: Visual cues for favorites and private templates
- **Card Layout**: Easy scanning of template collection
- **Smooth Scrolling**: Automatic scroll to top when editing

## 🔒 Security

- **Authentication Required**: All operations require authenticated user
- **Row Level Security**: Database enforces access control
- **Private Templates**: Can only be seen by creator
- **Owner-only Editing**: Only template creator can modify/delete
- **SQL Injection Protection**: Supabase client handles escaping
- **XSS Protection**: React escapes content by default

## 🧪 Testing Recommendations

1. **Create Template**
   - Manually enter content
   - Use AI to generate content
   - Verify it saves correctly

2. **Edit Template**
   - Click edit on existing template
   - Modify content
   - Verify updates save

3. **AI Features**
   - Generate content from title
   - Rewrite existing content
   - Suggest title from content

4. **Filtering**
   - Search by title/content
   - Filter by favorites
   - Filter by private

5. **Template Actions**
   - Toggle favorite status
   - Toggle private status
   - Export to PDF
   - Duplicate template
   - Delete template

6. **Apply to Documents**
   - Apply template from list
   - Verify redirect to documents-ai
   - Verify content loads correctly

7. **Responsiveness**
   - Test on mobile viewport
   - Test on tablet viewport
   - Test on desktop viewport

## 📝 Usage Examples

### Create a Template with AI
1. Go to `/admin/templates`
2. Enter title: "Employee Onboarding Checklist"
3. Click "Gerar com IA"
4. Review generated content
5. Click "Salvar Template"

### Use Template in Document Generation
1. Find template in list
2. Click "Aplicar"
3. Redirected to documents-ai page
4. Content loaded automatically
5. Use AI to further refine
6. Save as document

### Export Template as PDF
1. Find template in list
2. Click "PDF" button
3. PDF downloads automatically

## 🚀 Future Enhancements

Potential improvements mentioned in the problem statement:
- [ ] Template marketplace (share across organizations)
- [ ] Template versioning
- [ ] Conditional logic in templates
- [ ] Template analytics (usage tracking)
- [ ] Multi-language support
- [ ] Template approval workflow
- [ ] Template inheritance/cloning
- [ ] Rich text editor (TipTap integration)
- [ ] Variable placeholders
- [ ] Template categories/tags

## 📊 Performance Considerations

- **Indexes**: Created on frequently queried columns (created_by, created_at, title)
- **Lazy Loading**: Templates page lazy loaded with React.lazy
- **Debouncing**: Search filtering happens client-side (instant)
- **Pagination**: Could be added for large template collections
- **Image Optimization**: N/A (text-only templates currently)

## 🔗 Related Modules

- **Documents AI** (`/admin/documents/ai`): Apply templates for AI document generation
- **Document Editor** (`/admin/documents/editor`): Could integrate template loading
- **Assistant Module**: Could suggest templates based on context
- **Workflows**: Could use templates in automated workflows

## 📚 Documentation

This guide serves as the primary documentation for the Templates module. For database schema details, see the migration file. For API integration, see the Supabase types file.

---

**Status**: ✅ Fully Implemented and Build-Tested
**Version**: 1.0.0
**Last Updated**: 2025-10-14
