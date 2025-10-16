# Auditoria IMCA Form Component

## Overview

The `AuditoriaIMCAForm` component provides an interface for creating IMCA (International Marine Contractors Association) technical audits. This component allows users to record audit details including vessel information, IMCA standards, audit results, and corrective actions.

## Features

- 📋 Comprehensive form for IMCA technical audits
- 🚢 Vessel selection dropdown
- 📅 Date picker for audit date
- 📊 IMCA standards selection (M103, M117, M140, M190, M166, MSF182, M206, M216, M220)
- ✅ Result classification (Conforme, Não Conforme, Observação)
- 📝 Comments and corrective actions text area
- 🔐 User authentication integration
- 💾 Database persistence via API

## Component Location

- **Component**: `/src/components/auditorias/AuditoriaIMCAForm.tsx`
- **Page**: `/src/pages/AuditoriaIMCA.tsx`
- **Route**: `/auditoria-imca`

## Usage

### Basic Usage

```tsx
import { AuditoriaIMCAForm } from "@/components/auditorias/AuditoriaIMCAForm"

function AuditoriaPage() {
  return (
    <div className="container mx-auto p-4">
      <AuditoriaIMCAForm />
    </div>
  )
}
```

### Accessing the Form

Navigate to `/auditoria-imca` in your application to access the audit form.

## Form Fields

### Required Fields (*)

1. **Navio** (Vessel)
   - Type: Select dropdown
   - Options: DP Vessels Alpha, DP Vessels Beta, DP Vessels Gamma
   - Description: The vessel being audited

2. **Data** (Date)
   - Type: Date picker
   - Description: Date when the audit was performed

3. **Norma IMCA** (IMCA Standard)
   - Type: Select dropdown
   - Default: IMCA M103
   - Options: IMCA M103, M117, M140, M190, M166, MSF182, M206, M216, M220
   - Description: The IMCA standard being audited against

4. **Item Auditado** (Audited Item)
   - Type: Text input
   - Description: Specific item or area being audited

5. **Resultado** (Result)
   - Type: Select dropdown
   - Options:
     - ✅ Conforme (Compliant)
     - ❌ Não Conforme (Non-compliant)
     - ⚠️ Observação (Observation)
   - Description: Audit result classification

### Optional Fields

6. **Comentários / Ações Corretivas** (Comments / Corrective Actions)
   - Type: Textarea
   - Description: Additional comments, observations, or corrective actions needed

## API Integration

### Endpoint

- **URL**: `/api/auditorias/create`
- **Method**: POST
- **Content-Type**: application/json

### Request Payload

```json
{
  "navio": "DP Vessels Alpha",
  "data": "2024-10-16",
  "norma": "IMCA M103",
  "itemAuditado": "DP System Testing",
  "resultado": "Conforme",
  "comentarios": "All systems operational",
  "userId": "user-uuid"
}
```

### Response

Success (201):
```json
{
  "success": true,
  "message": "Auditoria registrada com sucesso!",
  "data": { /* audit record */ }
}
```

Error (400/500):
```json
{
  "error": "Error message"
}
```

## Database Schema

### Table: `auditorias_imca`

The form saves data to the `auditorias_imca` table with the following structure:

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `title`: TEXT (Auto-generated from norma + navio)
- `description`: TEXT (Auto-generated from itemAuditado)
- `navio`: TEXT
- `data`: DATE
- `norma`: TEXT
- `item_auditado`: TEXT
- `resultado`: TEXT (CHECK: 'Conforme', 'Não Conforme', 'Observação')
- `comentarios`: TEXT
- `status`: TEXT (Default: 'completed')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Row Level Security (RLS)

The table implements Row Level Security policies:
- Users can only view, create, update, and delete their own audits
- Admin users have full access to all audits

## Testing

Tests are located at `/src/tests/auditoria-imca-form.test.tsx`

Run tests with:
```bash
npm test -- auditoria-imca-form
```

## Dependencies

- React hooks: `useState`
- UI Components: Button, Input, Textarea, Card, Label (from shadcn/ui)
- Auth: `useAuth` from AuthContext
- Notifications: `toast` from sonner

## Authentication

The component requires user authentication. It uses the `useAuth` hook to:
- Get the current user's ID for associating audits with users
- Validate that the user is authenticated before submission

## Error Handling

The component handles the following error scenarios:
- Missing required fields (client-side validation)
- User not authenticated
- API request failures
- Network errors

All errors are displayed using toast notifications.

## Future Enhancements

Potential improvements for future versions:
- Add file attachment support for audit evidence
- Implement audit editing capabilities
- Add audit history and versioning
- Include photo/signature capture
- Add offline support with sync capabilities
- Implement audit report generation (PDF/Excel)
- Add audit templates for different vessel types
- Include audit scheduling and reminders

## Migration

Database migration file: `/supabase/migrations/20251016200800_add_imca_audit_fields.sql`

Apply the migration to your Supabase database before using this component.

## License

This component is part of the Travel HR Buddy application.
