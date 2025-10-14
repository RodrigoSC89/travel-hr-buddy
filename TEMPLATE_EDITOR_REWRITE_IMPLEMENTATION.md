# Template Editor With Rewrite - Implementation Guide

## Overview

This implementation adds a TipTap editor component with an AI-powered "Rewrite Selection" button that allows users to select text and have it rewritten using GPT-4o-mini.

## Components Created

### 1. Supabase Edge Function: `rewrite-selection`

**Location:** `supabase/functions/rewrite-selection/index.ts`

**Purpose:** Rewrite selected text using OpenAI's GPT-4o-mini model

**Endpoint:** `POST /functions/v1/rewrite-selection`

**Request Body:**
```json
{
  "input": "Text to be rewritten"
}
```

**Response (Success):**
```json
{
  "result": "Rewritten text",
  "timestamp": "2025-10-14T19:30:00.000Z"
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "timestamp": "2025-10-14T19:30:00.000Z"
}
```

**Features:**
- Model: GPT-4o-mini for cost-effectiveness
- Temperature: 0.7 for creative reformulation
- Max Tokens: 1000
- Retry logic with exponential backoff (3 attempts)
- 30-second timeout per request
- CORS enabled
- Input validation (minimum 3 characters)

### 2. React Component: `TemplateEditorWithRewrite`

**Location:** `src/components/templates/template-editor-with-rewrite.tsx`

**Features:**
- TipTap rich text editor with StarterKit extensions
- "Reescrever seleção com IA" button
- Text selection validation (minimum 3 characters)
- Loading state during rewrite operation
- Toast notifications for success and errors
- Automatic text replacement in the editor

**Usage:**
```tsx
import TemplateEditorWithRewrite from "@/components/templates/template-editor-with-rewrite";

function MyPage() {
  return <TemplateEditorWithRewrite />;
}
```

### 3. Tests

**Location:** `src/tests/components/templates/template-editor-with-rewrite.test.tsx`

**Test Coverage:**
- ✅ Renders the editor
- ✅ Renders the rewrite button
- ✅ Shows loading state when rewriting
- ✅ Calls Supabase function with correct parameters
- ✅ Shows success toast on successful rewrite
- ✅ Shows error toast on failure

## How It Works

1. **User Interaction:**
   - User types or pastes text into the TipTap editor
   - User selects a portion of text they want to rewrite
   - User clicks the "Reescrever seleção com IA" button

2. **Validation:**
   - Component validates that text is selected
   - Component checks that selection is at least 3 characters

3. **API Call:**
   - Component calls the `rewrite-selection` Supabase Edge Function
   - Function sends the selected text to OpenAI's GPT-4o-mini
   - AI rewrites the text while maintaining meaning

4. **Text Replacement:**
   - Rewritten text is received from the API
   - Component replaces the selected text with the AI-generated version
   - Success toast notification is shown

## Environment Variables

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key (set in Supabase project settings)

## Dependencies

**Already Installed:**
- `@tiptap/react`: ^2.26.3
- `@tiptap/starter-kit`: ^2.26.3
- `lucide-react`: ^0.462.0

**No additional dependencies needed!**

## API Endpoint Compatibility

The problem statement mentioned using `/api/templates/rewrite`, but since this is a Vite app (not Next.js), we use Supabase Edge Functions instead. The component has been adapted to use:

```typescript
await supabase.functions.invoke("rewrite-selection", {
  body: { input: selectedText },
});
```

This provides the same functionality as the Next.js API route pattern shown in the problem statement.

## Example Integration

To integrate this component into an existing page:

```tsx
import TemplateEditorWithRewrite from "@/components/templates/template-editor-with-rewrite";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Document Editor</h1>
      <TemplateEditorWithRewrite />
    </div>
  );
}
```

## Styling

The editor uses Tailwind CSS with the following classes:
- `prose` classes for rich text styling
- `border`, `rounded`, `p-4` for editor container
- `bg-white` for editor background
- `space-y-4` for spacing between editor and button

The component is fully responsive and follows the existing design system.

## Testing

Run tests with:
```bash
npm test -- src/tests/components/templates/template-editor-with-rewrite.test.tsx
```

## Troubleshooting

**Editor not rendering:**
- Ensure TipTap dependencies are installed
- Check that StarterKit is properly imported

**Rewrite not working:**
- Verify `OPENAI_API_KEY` is set in Supabase project
- Check browser console for errors
- Ensure Supabase Edge Function is deployed

**Selection not detected:**
- Make sure text is selected before clicking the button
- Selection must be at least 3 characters long

## Future Enhancements

Possible improvements:
- Add support for multiple rewrite styles (formal, casual, technical)
- Allow users to undo/redo rewrites
- Add keyboard shortcuts (e.g., Ctrl+Shift+R)
- Support for rewriting entire document
- History of rewrites for comparison
- Export rewritten text in various formats
