# ApplyTemplateModal Implementation

## Overview
The `ApplyTemplateModal` component provides a reusable modal interface for selecting and applying document templates with dynamic variable replacement. This component enhances the Templates with AI module by allowing users to easily apply pre-existing templates to documents.

## Features

### 📂 Template Selection Modal
- **Dialog-based UI**: Clean modal interface using Radix UI Dialog components
- **Template Listing**: Fetches and displays all user templates from Supabase `ai_document_templates` table
- **Sorted by Creation Date**: Templates are ordered by `created_at` in descending order
- **Real-time Search**: Instant filtering of templates by title with emoji search icon (🔍)
- **Accessibility**: Includes proper ARIA labels with `DialogTitle` and `DialogDescription` for screen readers

### 🔄 Dynamic Variable Replacement
The component automatically detects and replaces template variables using the `{{variable}}` syntax:

**Example:**
```typescript
// Template content example:
"Olá {{nome}}, este documento trata de {{assunto}}."

// System prompts user to fill each variable:
// - "Preencha o campo: nome"
// - "Preencha o campo: assunto"

// Final result with user inputs (João Silva, Férias):
"Olá João Silva, este documento trata de Férias."
```

### 🎯 Integration with AI Document Editor
The component is integrated into the `/admin/documents/ai-editor` page with seamless content application:

- Appears as "📂 Aplicar Template" button in the editor toolbar
- Uses callback pattern via `onApply` prop for flexible content handling
- Automatically populates TipTap editor with processed template content
- Shows toast notification on successful template application

## Usage

### Basic Integration

```typescript
import ApplyTemplateModal from "@/components/templates/ApplyTemplateModal";

function DocumentEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Initial content...</p>",
  });

  const handleApplyTemplate = (content: string) => {
    if (editor) {
      editor.commands.setContent(content);
    }
  };

  return (
    <ApplyTemplateModal onApply={handleApplyTemplate} />
  );
}
```

### Props Interface

```typescript
interface ApplyTemplateModalProps {
  onApply: (content: string) => void;
}
```

- **onApply**: Callback function that receives the processed template content after variable replacement

## Technical Details

### TypeScript
Fully typed with interfaces for:
- `ApplyTemplateModalProps`: Component props
- `Template`: Template structure matching database schema

### State Management
Uses React hooks for:
- `open`: Modal open/close state
- `templates`: Fetched templates array
- `search`: Search filter string

### Database Integration
- **Table**: `ai_document_templates`
- **Columns Used**: `id`, `title`, `content`, `created_at`
- **Query**: Direct Supabase queries with proper error handling
- **Ordering**: By `created_at` descending

### Variable Detection & Replacement
- **Regex Pattern**: `/{{(.*?)}}/g` for reliable variable detection
- **User Input**: Browser `prompt()` API for dynamic variable filling
- **Unique Variables**: Handles duplicate variables correctly by extracting unique names
- **Cancellation Handling**: Preserves original variable syntax if user cancels input

### UI Components
Built with shadcn/ui components:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogTrigger`
- `Button` with variant options
- `Input` for search functionality
- `FileText` icon from lucide-react

## Files Created

1. **Component**: `src/components/templates/ApplyTemplateModal.tsx`
   - Main component implementation
   - ~150 lines of TypeScript/React code

2. **Tests**: `src/tests/components/templates/ApplyTemplateModal.test.tsx`
   - Comprehensive test suite with 11 unit tests
   - Tests cover all major functionality and edge cases

3. **Documentation**: `APPLY_TEMPLATE_MODAL_IMPLEMENTATION.md`
   - Complete usage documentation
   - Technical details and examples

4. **Modified**: `src/pages/admin/documents/ai-editor.tsx`
   - Integration of ApplyTemplateModal component
   - Added import and component usage in toolbar

## Test Coverage

The test suite includes 11 comprehensive tests:

1. ✅ Render trigger button
2. ✅ Open modal on button click
3. ✅ Fetch templates when modal opens
4. ✅ Display templates in the list
5. ✅ Filter templates based on search input
6. ✅ Show message when no templates match search
7. ✅ Apply template without variables directly
8. ✅ Detect and replace single variable
9. ✅ Detect and replace multiple variables
10. ✅ Handle user canceling variable input
11. ✅ Handle fetch error gracefully

All tests use vitest and @testing-library/react for reliable testing.

## Error Handling

The component handles several error scenarios:
- **Network Errors**: Shows toast notification if template fetch fails
- **Empty State**: Displays appropriate message when no templates exist
- **Search No Results**: Shows "Nenhum template encontrado" message
- **User Cancellation**: Preserves variable syntax when user cancels prompt

## Accessibility Features

- Semantic HTML structure
- Proper ARIA labels on dialog components
- Keyboard navigation support (inherited from Radix UI Dialog)
- Focus management when modal opens/closes
- Screen reader friendly descriptions

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Radix UI Dialog component requirements

## Future Enhancements

Potential improvements for future iterations:
- Replace `prompt()` with custom modal for better UX
- Add variable preview before applying template
- Support for default variable values
- Variable type validation (email, date, etc.)
- Template favorites and recent templates
- Bulk variable editing interface

## Related Modules

This component is part of the "Templates with AI" module:
- ✅ Endpoint GET/POST `/api/templates`
- ✅ Endpoint PUT/DELETE `[id].ts`
- ✅ Página `/admin/templates` (UI)
- ✅ Geração com GPT-4
- ✅ Aplicação com variáveis (this implementation)

## Validation Checklist

- [x] TypeScript compilation clean
- [x] Linting passed
- [x] All tests passing (11/11)
- [x] Component renders correctly
- [x] Variable replacement works
- [x] Search filtering works
- [x] Error handling implemented
- [x] Accessibility standards met
- [x] Documentation complete
- [x] Production-ready

## Summary

The ApplyTemplateModal component successfully implements a user-friendly interface for applying templates with dynamic variable replacement. It integrates seamlessly with the existing AI document editor and follows best practices for TypeScript, React, and accessibility. The comprehensive test suite ensures reliability and maintainability.
