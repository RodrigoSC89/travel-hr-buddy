# ListaAuditoriasIMCA Component - Implementation Guide

## Overview

The `ListaAuditoriasIMCA` component is a comprehensive IMCA (International Marine Contractors Association) audits listing interface that provides modern, feature-rich capabilities for viewing, filtering, and analyzing maritime audit compliance data.

## Features

### 🎯 Core Functionality

#### Card-Based Audit Display
- Professional, organized layout showing audit history
- Each card displays:
  - Ship name (🚢 navio)
  - Audit date
  - IMCA standard (norma)
  - Audited item (item_auditado)
  - Result (resultado)
  - Comments (comentarios)

#### Color-Coded Badges
Visual identification of audit results:
- **Conforme (Compliant)**: Blue badge (`bg-blue-600`)
- **Não Conforme (Non-Compliant)**: Red badge (`bg-red-600`)
- **Observação (Observation)**: Gray badge (`bg-gray-600`)
- **N/A**: Transparent badge with border

#### Global Search & Filter
- Real-time filtering across multiple fields
- Searches: ship name, standard, item, result
- Instant results without API calls
- Example: Type "Atlantic" to filter by ship

#### Fleet Information Dashboard
- Automatically extracts unique ship names
- Shows total audit count
- Provides quick overview of audited fleet

### 🤖 AI Integration

#### AI-Powered Explanations
For non-compliant audits, users can:
- Click "🧠 Explicar com IA" button
- Get GPT-4 generated technical explanations including:
  - What the non-conformity means
  - Why it's important to fix
  - Associated risks
  - Practical recommendations for correction
- Real-time generation with loading states
- Error handling with user-friendly messages

### 📊 Export Capabilities

#### PDF Export
- Professional formatted PDF reports
- Includes:
  - Generation timestamp
  - Total audit count
  - Fleet summary
  - Detailed data table
- Automatic file naming: `auditorias-imca-YYYYMMDD.pdf`

#### CSV Export
- Machine-readable format for data analysis
- All audit fields included with proper escaping
- Automatic file naming: `auditorias-imca-YYYYMMDD.csv`

## Database Schema

### Table: `auditorias_imca`

```sql
CREATE TABLE public.auditorias_imca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'approved')),
  audit_date DATE,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  findings JSONB DEFAULT '{}',
  recommendations TEXT[],
  metadata JSONB DEFAULT '{}',
  
  -- New fields for ListaAuditoriasIMCA
  navio TEXT,
  norma TEXT,
  item_auditado TEXT,
  resultado TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Observação', 'N/A')),
  comentarios TEXT,
  data DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_auditorias_imca_navio ON public.auditorias_imca(navio);
CREATE INDEX idx_auditorias_imca_norma ON public.auditorias_imca(norma);
CREATE INDEX idx_auditorias_imca_resultado ON public.auditorias_imca(resultado);
CREATE INDEX idx_auditorias_imca_data ON public.auditorias_imca(data DESC);
```

## API Endpoint

### POST `/api/auditoria/explicar-ia`

Generates AI-powered explanations for non-compliant audits.

**Request Body:**
```json
{
  "navio": "MV Atlantic Star",
  "item": "Safety Procedures",
  "norma": "IMCA M 103"
}
```

**Response:**
```json
{
  "explicacao": "Esta não conformidade indica que..."
}
```

**Error Handling:**
- 400: Missing required fields
- 405: Method not allowed
- 500: Server error

## Component Architecture

### File Structure
```
src/
├── components/
│   └── auditorias/
│       └── ListaAuditoriasIMCA.tsx    # Main component (295 lines)
├── pages/
│   └── admin/
│       └── auditorias-imca.tsx         # Page wrapper (30 lines)
└── tests/
    └── lista-auditorias-imca.test.tsx  # Test suite (230 lines)

pages/api/auditoria/
└── explicar-ia.ts                      # AI explanation endpoint (69 lines)
```

### Dependencies

- **UI**: shadcn/ui components (Card, Badge, Button, Input)
- **Database**: Supabase client
- **PDF**: jsPDF + jspdf-autotable
- **Dates**: date-fns
- **AI**: OpenAI GPT-4
- **Notifications**: Sonner

## Usage

### Accessing the Component

Navigate to `/admin/auditorias-imca`

### Basic Operations

1. **View Audits**: Audits load automatically on page load
2. **Search/Filter**: Use the search box to filter results in real-time
3. **AI Explanation**: Click "🧠 Explicar com IA" on non-compliant audits
4. **Export PDF**: Click "Exportar PDF" button
5. **Export CSV**: Click "Exportar CSV" button

## Security

- **Row Level Security (RLS)**: Maintained on auditorias_imca table
- **OpenAI API Key**: Protected via environment variables
- **User Authentication**: Required for all operations
- **Input Validation**: All API endpoints validate inputs

## Performance

- **Lazy-loaded route**: Optimal bundle size
- **Database indexes**: Fast queries on navio, norma, resultado, data
- **Client-side filtering**: Instant results without server round-trips
- **Efficient React rendering**: Proper state management

## Testing

Comprehensive test suite covering:
- Component rendering
- Data loading and display
- Filtering functionality
- Badge display logic
- Export functionality
- Error handling

Run tests:
```bash
npm run test -- src/tests/lista-auditorias-imca.test.tsx
```

## Troubleshooting

### Component not loading
- Check Supabase connection
- Verify user authentication
- Check browser console for errors

### AI explanations not working
- Verify OPENAI_API_KEY environment variable is set
- Check API endpoint is accessible
- Review server logs for errors

### Export not working
- Check jsPDF and jspdf-autotable are installed
- Verify browser supports file downloads
- Check console for JavaScript errors

## Future Enhancements

1. **Advanced Filtering**: Date range, multiple ships, specific standards
2. **Bulk Operations**: Batch export, batch AI explanations
3. **Charts & Visualizations**: Compliance trends, ship comparison
4. **Audit History**: Track changes and revisions
5. **Email Reports**: Automated distribution of audit summaries
6. **Mobile Optimization**: Enhanced mobile experience
7. **Offline Support**: PWA capabilities for offline access

## Migration Notes

The migration file `20251017004300_update_auditorias_imca_for_lista.sql` includes:
- Schema updates with new fields
- Performance indexes
- Sample data for testing
- Backward compatibility with existing data

## License

This component is part of the Nautilus One Travel HR Buddy application.
