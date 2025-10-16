# Auditorias Lista UI - Implementation Guide

## Overview
This implementation adds a complete UI for managing and viewing technical audits (auditorias) with IMCA standards compliance checking, including AI-powered explanations for non-conformities.

## Features Implemented

### 1. **ListaAuditoriasIMCA Component**
Location: `src/components/sgso/ListaAuditoriasIMCA.tsx`

A comprehensive React component that displays technical audits with:
- **Real-time filtering** by vessel (navio), standard (norma), item, or result
- **Color-coded badges** for audit results:
  - 🟢 Green: Conforme (Compliant)
  - 🔴 Red: Não Conforme (Non-compliant)
  - 🟡 Yellow: Observação (Observation)
- **Export capabilities**:
  - CSV export for data analysis
  - PDF export for reports
- **AI-powered explanations** for non-conformities using GPT-4

### 2. **API Endpoints**

#### Auditorias List API
Location: `supabase/functions/auditorias-list/index.ts`

- **Endpoint**: `GET /functions/v1/auditorias-list`
- **Purpose**: Fetches all technical audits from the database
- **Response**: Array of auditorias with fields:
  - `id`: Unique identifier
  - `navio`: Vessel name
  - `data`: Audit date
  - `norma`: IMCA standard applied (e.g., IMCA M-187, IMCA M-220)
  - `item_auditado`: Audited item
  - `resultado`: Result (Conforme, Não Conforme, Observação)
  - `comentarios`: Comments and observations

#### Auditorias Explain API
Location: `supabase/functions/auditorias-explain/index.ts`

- **Endpoint**: `POST /functions/v1/auditorias-explain`
- **Purpose**: Generates AI-powered explanations for non-conformities
- **Request Body**:
  ```json
  {
    "navio": "MV Atlantic",
    "item": "Safety equipment",
    "norma": "IMCA M-187"
  }
  ```
- **Response**:
  ```json
  {
    "resultado": "Technical explanation in Portuguese..."
  }
  ```
- **AI Model**: GPT-4 with IMCA expert system prompt

### 3. **Database Schema**

Migration: `supabase/migrations/20251017000000_add_auditorias_imca_technical_fields.sql`

Added fields to `auditorias_imca` table:
- `navio` (TEXT): Vessel name
- `norma` (TEXT): IMCA standard
- `item_auditado` (TEXT): Audited item
- `resultado` (TEXT): Audit result with CHECK constraint
- `comentarios` (TEXT): Comments
- `data` (DATE): Audit date

Indexes created for optimal query performance:
- `idx_auditorias_imca_navio`
- `idx_auditorias_imca_norma`
- `idx_auditorias_imca_resultado`
- `idx_auditorias_imca_data`

### 4. **Routing**

Added page: `src/pages/admin/auditorias-imca.tsx`

Access the feature at: `/admin/auditorias-imca`

## Usage

### For Users

1. **Navigate** to `/admin/auditorias-imca`
2. **Filter** audits using the search box (searches across vessel, standard, item, and result)
3. **View** audit details in card format with color-coded badges
4. **Export** data:
   - Click "Exportar CSV" for spreadsheet analysis
   - Click "Exportar PDF" for printable reports
5. **Get AI Explanations** (only for non-conformities):
   - Click "🧠 Explicar com IA" button
   - Wait for AI-generated technical explanation
   - View detailed analysis of the non-conformity

### For Developers

#### Adding New Audits

```typescript
// Example: Insert a new audit via Supabase client
const { data, error } = await supabase
  .from('auditorias_imca')
  .insert({
    user_id: userId,
    navio: 'MV Atlantic',
    norma: 'IMCA M-187',
    item_auditado: 'Safety equipment inspection',
    resultado: 'Não Conforme',
    comentarios: 'Life jackets expired',
    data: new Date().toISOString().split('T')[0]
  });
```

#### Customizing AI Prompts

Edit `supabase/functions/auditorias-explain/index.ts`:

```typescript
const prompt = `Como especialista em normas IMCA...
// Customize the prompt structure here
`;
```

## Environment Variables Required

Ensure these are set in your Supabase project:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key  # For AI explanations
```

## Testing

Three test suites have been created:

1. **API Tests**: `src/tests/auditorias-list-api.test.ts`
2. **AI Explain Tests**: `src/tests/auditorias-explain-api.test.ts`
3. **Component Tests**: `src/tests/lista-auditorias-imca.test.ts`

Run tests:
```bash
npm test -- src/tests/auditorias-list-api.test.ts
npm test -- src/tests/auditorias-explain-api.test.ts
npm test -- src/tests/lista-auditorias-imca.test.ts
```

## IMCA Standards Supported

The system is designed to work with common IMCA standards including:
- IMCA M-187: Competence Assurance
- IMCA M-220: Marine Operations
- IMCA D-045: Diving Operations
- IMCA M-203: Personnel Competence
- And other IMCA marine contractor standards

## Security Features

- **Row Level Security (RLS)**: Users can only see their own audits (unless admin)
- **Admin Access**: Admins can view and manage all audits
- **API Authentication**: All endpoints require valid Supabase authentication
- **CORS Enabled**: Proper CORS headers for cross-origin requests

## Future Enhancements

Potential improvements:
- Bulk import of audits via CSV
- Audit scheduling and reminders
- Dashboard with audit statistics
- Email notifications for non-conformities
- Multi-language support for AI explanations
- Integration with other maritime management systems

## Troubleshooting

### Audits not loading
- Check Supabase connection and environment variables
- Verify RLS policies allow access to auditorias_imca table
- Check browser console for API errors

### AI explanations failing
- Verify OPENAI_API_KEY is set in Supabase Edge Functions
- Check OpenAI API quota and billing
- Review function logs in Supabase dashboard

### Export not working
- Ensure html2pdf.js and file-saver are installed
- Check browser console for errors
- Verify PDF/CSV generation permissions

## Support

For issues or questions, please refer to:
- [IMCA Guidelines](https://www.imca-int.com/)
- [Supabase Documentation](https://supabase.io/docs)
- Project repository issues section
