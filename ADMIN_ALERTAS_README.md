# Admin Alertas - Critical Alerts Panel

## Overview

This implementation provides a complete Critical Alerts Panel (Painel de Alertas Críticos da Auditoria) that allows administrators to view and monitor critical alerts generated from IMCA audits.

## Features

### 🔐 Security
- **Authentication**: All requests require valid JWT tokens
- **Authorization**: Admin role verification at API level
- **RLS Policies**: Database-level security preventing unauthorized access
- **Input Validation**: Proper error handling for malformed data

### 🎨 UI Component
- **Visual Emphasis**: Red cards (`bg-red-50`) with red borders for critical alerts
- **Complete Information**: Displays Audit ID, Comment ID, creation date, and full description
- **Smart States**: Loading spinner, error messages, and empty state handling
- **Responsive Design**: Scrollable area with `max-h-[70vh]` for optimal viewing
- **Multi-line Support**: Descriptions preserve formatting with `whitespace-pre-wrap`
- **Severity Badges**: Visual indicators for alert severity levels
- **Portuguese Formatting**: Dates formatted with `toLocaleString('pt-BR')`

### 🔄 User Experience
- ✅ Automatic data loading on page mount
- ✅ Clear visual hierarchy with emoji indicators
- ✅ Accessible design with proper semantic HTML
- ✅ Responsive layout for all screen sizes
- ✅ Error recovery with helpful messages

## Getting Started

### Prerequisites

1. Supabase project configured
2. Database migration applied (creates `auditoria_alertas` table)
3. Edge function deployed

### Deployment

#### 1. Apply Database Migration

The migration file already exists at:
```
supabase/migrations/20251016162500_create_auditoria_alertas.sql
```

Apply it using:
```bash
supabase db push
```

#### 2. Deploy Edge Function

```bash
supabase functions deploy admin-alertas
```

#### 3. Access the Panel

Navigate to `/admin/alerts` as an admin user in your application.

## File Structure

```
src/
├── components/
│   └── admin/
│       └── PainelAlertasCriticos.tsx    # Main alert panel component
├── pages/
│   └── admin/
│       └── alerts.tsx                    # Page wrapper for the alert panel
└── App.tsx                               # Added route for /admin/alerts

supabase/
├── functions/
│   └── admin-alertas/
│       └── index.ts                      # API endpoint for fetching alerts
└── migrations/
    └── 20251016162500_create_auditoria_alertas.sql  # Database schema
```

## API Endpoint

### GET `/functions/v1/admin-alertas`

Returns critical alerts for admin users.

**Headers:**
- `Authorization`: Bearer token (Supabase JWT)
- `Content-Type`: application/json

**Response:**
```json
{
  "success": true,
  "alertas": [
    {
      "id": "uuid",
      "auditoria_id": "uuid",
      "comentario_id": "uuid",
      "tipo": "Falha Crítica",
      "descricao": "Alert description",
      "criado_em": "2025-10-16T16:23:45.000Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Component Usage

### PainelAlertasCriticos

The main component for displaying critical alerts:

```tsx
import { PainelAlertasCriticos } from "@/components/admin/PainelAlertasCriticos";

function MyPage() {
  return (
    <div>
      <PainelAlertasCriticos />
    </div>
  );
}
```

### Features:
- Automatic loading on mount
- Loading state with spinner
- Error state with error message
- Empty state when no alerts
- Red-highlighted cards for critical alerts
- Scrollable area for many alerts

## Testing

### 1. Manual Testing

1. Ensure you're logged in as an admin user
2. Navigate to `/admin/alerts`
3. Verify alerts are displayed correctly
4. Check loading and error states

### 2. Adding Test Data

Use the SQL script from the migration to insert test data:

```sql
-- Insert test audit
INSERT INTO public.auditorias_imca (user_id, nome_navio, data_auditoria)
VALUES (auth.uid(), 'Test Ship', now());

-- Insert AI comment (triggers alert creation automatically)
INSERT INTO public.auditoria_comentarios (auditoria_id, user_id, comentario)
VALUES (
  (SELECT id FROM public.auditorias_imca ORDER BY created_at DESC LIMIT 1),
  'ia-auto-responder',
  '⚠️ Atenção: Falha crítica detectada durante auditoria. Ação imediata necessária.'
);
```

## Troubleshooting

### Issue: "Missing authorization header"
**Solution**: Ensure you're logged in and the JWT token is being sent.

### Issue: "Forbidden - Admin access required"
**Solution**: Verify your user has the 'admin' role in the profiles table.

### Issue: "Edge function not found"
**Solution**: Deploy the edge function using `supabase functions deploy admin-alertas`

### Issue: No alerts showing
**Solution**: Check if there are any alerts in the database. Insert test data if needed.

## Security Notes

- Only admin users can access this endpoint
- All database queries use Row Level Security (RLS)
- JWT tokens are validated on every request
- CORS is configured for the edge function

## Future Enhancements

- [ ] Filter alerts by date range
- [ ] Mark alerts as resolved
- [ ] Export alerts to PDF/CSV
- [ ] Real-time updates using Supabase subscriptions
- [ ] Alert severity filtering
- [ ] Pagination for large alert lists

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
