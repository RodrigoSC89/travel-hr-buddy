# ComentariosAuditoria Component

## Description

The `ComentariosAuditoria` component provides a user interface for viewing and adding comments to audit records (auditorias). It features a scrollable list of existing comments and a form to submit new comments.

## Features

- **Display Comments**: Shows all comments for a specific audit in chronological order
- **Add Comments**: Allows users to add new comments with real-time validation
- **Scrollable Interface**: Comments are displayed in a scrollable area with a maximum height
- **Loading States**: Disables the submit button while sending comments
- **Input Validation**: Prevents submission of empty or whitespace-only comments

## Usage

```tsx
import { ComentariosAuditoria } from "@/components/auditoria";

function AuditoriaDetailPage() {
  const auditoriaId = "123"; // Get from route params or props

  return (
    <div>
      <h1>Audit Details</h1>
      <ComentariosAuditoria auditoriaId={auditoriaId} />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `auditoriaId` | `string` | Yes | The unique identifier of the audit to display comments for |

## API Endpoints

The component interacts with the following API endpoints:

### GET `/api/auditoria/[auditoriaId]/comentarios`

Fetches all comments for a specific audit.

**Response:**
```json
[
  {
    "id": "1",
    "comentario": "Comment text",
    "user_id": "user-uuid",
    "created_at": "2025-10-16T12:00:00Z"
  }
]
```

### POST `/api/auditoria/[auditoriaId]/comentarios`

Creates a new comment for a specific audit.

**Request Body:**
```json
{
  "comentario": "New comment text"
}
```

**Response:**
```json
{
  "id": "2",
  "comentario": "New comment text",
  "user_id": "user-uuid",
  "created_at": "2025-10-16T13:00:00Z",
  "auditoria_id": "123"
}
```

## Database Schema

The component expects the following table structure in Supabase:

```sql
CREATE TABLE auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auditoria_id TEXT NOT NULL,
  comentario TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_auditoria_comentarios_auditoria_id 
ON auditoria_comentarios(auditoria_id);
```

## UI Components

The component uses the following shadcn/ui components:

- `Textarea`: For comment input
- `Button`: For submitting comments
- `ScrollArea`: For displaying comments list

## Styling

The component uses Tailwind CSS classes for styling:

- Container: `space-y-4`
- Scroll area: `max-h-64 border p-2 rounded-md`
- Comments: `text-sm border-b py-2`
- Timestamp: `text-muted-foreground text-xs mb-1`

## Example Integration

Here's a complete example of integrating the component into a page:

```tsx
import { useState, useEffect } from "react";
import { ComentariosAuditoria } from "@/components/auditoria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AuditoriaPage() {
  const [auditoria, setAuditoria] = useState(null);
  const auditoriaId = "audit-123"; // From route params

  useEffect(() => {
    // Fetch audit details
    fetchAuditoriaDetails(auditoriaId).then(setAuditoria);
  }, [auditoriaId]);

  if (!auditoria) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Auditoria: {auditoria.nome_navio}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Audit details here */}
          <div className="mt-6">
            <ComentariosAuditoria auditoriaId={auditoriaId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Testing

Comprehensive tests are available in:
- Component tests: `src/tests/components/auditoria/ComentariosAuditoria.test.tsx`
- API tests: `src/tests/api/auditoria-comentarios-api.test.ts`

Run tests with:
```bash
npm test -- src/tests/components/auditoria/ComentariosAuditoria.test.tsx
npm test -- src/tests/api/auditoria-comentarios-api.test.ts
```

## Notes

- The component automatically loads comments when mounted
- After submitting a comment, the list is automatically refreshed
- The textarea is cleared after successful submission
- User identification is currently done via the `Authorization` header
- Comments are displayed in chronological order (oldest first)
