# ListaAuditoriasIMCA Component - Implementation Guide

## Overview

The **ListaAuditoriasIMCA** component is a comprehensive audit management interface for IMCA (International Marine Contractors Association) compliance tracking. It provides a modern, feature-rich UI for viewing, filtering, and analyzing maritime audit data.

## Features

### 1. **Card-Based Audit Display**
- Each audit is displayed in a clean, organized card layout
- Shows key information: ship name, audit date, standard, item audited, and result
- Color-coded badges for quick visual identification of audit results

### 2. **Global Search & Filter**
- Real-time filtering across multiple fields:
  - Ship name (navio)
  - IMCA standard (norma)
  - Audited item (item_auditado)
  - Result (resultado)

### 3. **Fleet Information Dashboard**
- Automatically extracts and displays unique ship names from audit history
- Shows total audit count
- Provides quick overview of audited fleet

### 4. **AI-Powered Explanations**
- For audits marked as "Não Conforme" (Non-Compliant)
- Click "🧠 Explicar com IA" button to get technical explanation
- Uses GPT-4 to provide:
  - What the non-conformity means
  - Why it's important to fix
  - Associated risks
  - Practical recommendations

### 5. **Export Capabilities**

#### PDF Export
- Professional formatted PDF report
- Includes:
  - Generation date and time
  - Total audit count
  - Fleet summary
  - Detailed table with all audit data

#### CSV Export
- Machine-readable format for data analysis
- Includes all audit fields
- Properly escaped for Excel/spreadsheet compatibility

### 6. **Color-Coded Results**
- **Conforme** (Compliant): Default badge (blue)
- **Não Conforme** (Non-Compliant): Destructive badge (red)
- **Observação** (Observation): Secondary badge (gray)
- **N/A**: Outline badge (transparent)

## Database Schema

### New Fields Added to `auditorias_imca` Table

```sql
- navio TEXT                    -- Ship name
- norma TEXT                    -- IMCA standard (e.g., "IMCA M 182")
- item_auditado TEXT            -- Audited item
- resultado TEXT                -- Result: 'Conforme', 'Não Conforme', 'Observação', 'N/A'
- comentarios TEXT              -- Additional comments
- data DATE                     -- Audit date
```

### Indexes for Performance
```sql
- idx_auditorias_imca_navio
- idx_auditorias_imca_norma
- idx_auditorias_imca_resultado
- idx_auditorias_imca_data
```

## API Endpoints

### AI Explanation Endpoint

**POST** `/api/auditoria/explicar-ia`

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
  "explicacao": "Esta não conformidade indica que os procedimentos de segurança não estão sendo seguidos conforme as diretrizes da IMCA M 103..."
}
```

## Usage

### 1. Access the Component

Navigate to: `/admin/auditorias-imca`

### 2. View Audits

- Audits are automatically loaded on page load
- Displayed in reverse chronological order (newest first)
- Each card shows complete audit information

### 3. Filter Audits

Type in the search box to filter by any visible field:
```
Example: "Atlantic" -> Shows all audits for Atlantic Star
Example: "Não Conforme" -> Shows only non-compliant audits
Example: "IMCA M 182" -> Shows audits for that specific standard
```

### 4. Get AI Explanation

For any audit marked as "Não Conforme":
1. Click the "🧠 Explicar com IA" button
2. Wait for AI to generate explanation (typically 2-3 seconds)
3. View the detailed technical explanation below the button

### 5. Export Data

**PDF Export:**
- Click the "PDF" button in the top-right corner
- PDF will be generated and automatically downloaded
- Filename format: `auditorias-imca-YYYYMMDD.pdf`

**CSV Export:**
- Click the "CSV" button in the top-right corner
- CSV file will be generated and automatically downloaded
- Filename format: `auditorias-imca-YYYYMMDD.csv`

## Component Architecture

### File Structure
```
src/
├── components/
│   └── auditorias/
│       └── ListaAuditoriasIMCA.tsx    # Main component
├── pages/
│   └── AuditoriasIMCA.tsx             # Page wrapper
└── tests/
    └── lista-auditorias-imca.test.ts  # Test suite

pages/
└── api/
    └── auditoria/
        └── explicar-ia.ts              # AI explanation API

supabase/
└── migrations/
    ├── 20251016214815_add_auditorias_imca_fields.sql
    └── 20251016215000_insert_sample_auditorias_imca.sql
```

### Dependencies
- **UI Components**: shadcn/ui (Card, Badge, Button, Input)
- **Database**: Supabase client
- **PDF Generation**: jsPDF + jspdf-autotable
- **Date Formatting**: date-fns
- **AI**: OpenAI GPT-4
- **Notifications**: Sonner

## Sample Data

The implementation includes 6 sample audits covering:
- 3 different ships (MV Atlantic Star, MV Pacific Explorer, MV Indian Ocean)
- 6 different IMCA standards
- Mix of compliant, non-compliant, and observation results

## Testing

Run tests with:
```bash
npm test lista-auditorias-imca
```

**Test Coverage:**
- Database integration (3 tests)
- Filtering functionality (1 test)
- Badge variant logic (1 test)
- Export formatting (1 test)
- API structure (3 tests)

**Total: 9 passing tests**

## Performance Considerations

1. **Lazy Loading**: Page is lazy-loaded for optimal initial bundle size
2. **Database Indexes**: All filterable fields are indexed
3. **Real-time Updates**: Component uses Supabase real-time capabilities
4. **Efficient Filtering**: Client-side filtering for instant results
5. **Memoization**: Filter results are only recalculated when necessary

## Security

1. **Row Level Security (RLS)**: Enabled on auditorias_imca table
2. **API Key Protection**: OpenAI API key stored in environment variables
3. **User Authentication**: Required for viewing and creating audits
4. **Input Validation**: All API inputs are validated

## Future Enhancements

Potential improvements for future versions:
1. Real-time collaborative editing
2. Audit scheduling and reminders
3. Advanced analytics dashboard
4. Integration with vessel management systems
5. Multi-language support
6. Mobile app integration
7. Automated compliance reporting
8. Trend analysis and predictions

## Troubleshooting

### AI Explanation Not Working
- Check that `VITE_OPENAI_API_KEY` is set in environment variables
- Verify internet connectivity
- Check browser console for detailed error messages

### PDF Export Issues
- Ensure browser allows downloads
- Check that data is loaded before exporting
- Verify jsPDF library is properly installed

### No Audits Showing
- Verify database connection
- Check that user has proper permissions
- Ensure migrations have been applied
- Check browser console for errors

## Support

For issues, questions, or contributions:
1. Check the test suite for examples
2. Review the implementation in `ListaAuditoriasIMCA.tsx`
3. Consult the database migrations for schema details

## License

This component is part of the Travel HR Buddy project and follows the same license terms.
