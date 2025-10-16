# ExportarComentariosPDF Component

## Description
Component for exporting audit comments to PDF format using `html2pdf.js`.

## Features
- Exports audit comments to a professionally formatted PDF document
- Includes user information, timestamp, and comment content
- Automatic page break handling for long lists
- Disabled state when no comments are available
- Consistent styling with the application theme

## Usage

### Basic Usage

```tsx
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";

function AuditoriaPage() {
  const comentarios = [
    {
      user_id: "user-123",
      created_at: "2025-10-16T10:00:00Z",
      comentario: "First audit comment"
    },
    {
      user_id: "user-456",
      created_at: "2025-10-16T11:00:00Z",
      comentario: "Second audit comment"
    }
  ];

  return (
    <div>
      <h1>Audit Comments</h1>
      <ExportarComentariosPDF comentarios={comentarios} />
    </div>
  );
}
```

### With Supabase Integration

```tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";

interface Comentario {
  user_id: string;
  created_at: string;
  comentario: string;
}

function AuditoriaCommentsPage() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from("audit_comments")
        .select("user_id, created_at, comentario")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComentarios(data);
      }
      setLoading(false);
    }

    fetchComments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Audit Comments</h1>
      <div className="mb-4">
        <ExportarComentariosPDF comentarios={comentarios} />
      </div>
      {/* Display comments list here */}
    </div>
  );
}
```

## Props

### ExportarComentariosPDFProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| comentarios | Comentario[] | Yes | Array of audit comments to export |

### Comentario Interface

```typescript
interface Comentario {
  user_id: string;      // User ID who created the comment
  created_at: string;   // ISO 8601 timestamp
  comentario: string;   // Comment text
}
```

## PDF Output

The generated PDF includes:

- **Header**: Title "Comentários da Auditoria" with generation timestamp
- **Comment Cards**: Each comment displayed in a styled card with:
  - User ID
  - Formatted date/time (pt-BR locale)
  - Comment content
- **Footer**: Total number of comments
- **Formatting**: 
  - A4 portrait orientation
  - 10mm margins on all sides
  - Professional blue theme (#2563eb)
  - Automatic page breaks to avoid splitting comments

## Styling

The button uses Tailwind CSS classes and follows the application's design system:
- Background: `bg-slate-700` with `hover:bg-slate-800`
- Text: `text-white`
- Icon: FileDown from lucide-react
- Size: default

## Dependencies

- `html2pdf.js` - For PDF generation
- `@/components/ui/button` - Button component from shadcn/ui
- `lucide-react` - For the FileDown icon

## Notes

- The button is automatically disabled when the `comentarios` array is empty
- The component uses Portuguese (pt-BR) locale for date formatting
- PDF filename is fixed as `comentarios-auditoria.pdf`
- The component handles HTML escaping automatically through template literals

## Testing

The component includes comprehensive unit tests covering:
- Rendering with and without comments
- Button enabled/disabled states
- PDF generation on click
- Icon and styling verification

Run tests with:
```bash
npm test -- src/tests/components/sgso/ExportarComentariosPDF.test.tsx
```
