# Logs Center - PATCH 94.0

## Overview
Centralized technical logs module with filtering, AI-powered audit, and PDF export capabilities.

## Features

### ✅ Implemented Features

1. **Filterable Logs Table**
   - Filter by level (info, warn, error)
   - Filter by origin (module, component, function)
   - Search by message content
   - Real-time filtering

2. **Expandable Details**
   - Click to expand log details
   - View JSON details in formatted view
   - See user ID and creation timestamp

3. **Supabase Integration**
   - Connected to `logs` table
   - Real-time log fetching
   - Support for pagination (limited to 100 recent logs)
   - RLS policies for authenticated users

4. **PDF Export**
   - Header with export metadata
   - Grouped logs by level
   - Statistics summary
   - QR code for verification
   - Color-coded levels in table
   - Professional formatting

5. **AI Diagnostic**
   - Integration with `runAIContext("log-audit")`
   - Analyzes error rates and patterns
   - Provides insights and suggestions
   - Confidence score display
   - Detects problematic origins

## Usage

### Accessing the Module
Navigate to `/dashboard/logs-center` to access the Logs Center.

### Filtering Logs
- Use the search bar to find logs by message or origin
- Select log level from dropdown (All, Info, Warn, Error)
- Enter origin name to filter by specific module/component
- Click filter icon to clear all filters

### Exporting Logs
1. Apply desired filters
2. Click "Exportar PDF" button
3. PDF will be generated and downloaded automatically
4. PDF includes QR code for verification

### AI Diagnostic
1. Select logs you want to analyze (use filters)
2. Click "Executar Diagnóstico com IA" button
3. AI will analyze error patterns and rates
4. Results shown in toast notification with insights

## Database Schema

```sql
CREATE TABLE logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  origin text NOT NULL,
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## API Integration

### Adding Logs Programmatically

```typescript
import { supabase } from '@/integrations/supabase/client';

await supabase.from('logs').insert({
  level: 'info',
  origin: 'my-module',
  message: 'Operation completed successfully',
  details: { operation: 'sync', duration: 1250 }
});
```

### Querying Logs

```typescript
const { data, error } = await supabase
  .from('logs')
  .select('*')
  .eq('level', 'error')
  .order('timestamp', { ascending: false })
  .limit(10);
```

## AI Audit Patterns

The AI diagnostic analyzes:
- **Error Rate**: Percentage of errors vs total logs
- **Warning Rate**: Percentage of warnings vs total logs  
- **Origin Patterns**: Identifies problematic modules/components
- **Recent Trends**: Focuses on recent error patterns

Response types:
- `risk` - High error rate (>20%)
- `recommendation` - Moderate error rate (>10%)
- `suggestion` - High warning rate (>30%)
- `diagnosis` - Normal operation

## Files

### Core Module Files
- `src/modules/logs-center/LogsCenter.tsx` - Main component
- `src/modules/logs-center/types.ts` - Type definitions
- `src/modules/logs-center/index.ts` - Module exports

### Utilities
- `src/lib/logger/exportToPDF.ts` - PDF export functionality

### Database
- `supabase/migrations/20251024185700_create_logs_table.sql` - Database schema

### Configuration
- Module registered in `src/modules/registry.ts`
- Route added to `src/AppRouter.tsx`
- AI pattern added to `src/ai/kernel.ts`

## Statistics Display

Real-time statistics shown above the table:
- **Total**: Total number of filtered logs
- **Info**: Count of info-level logs
- **Warn**: Count of warning-level logs  
- **Error**: Count of error-level logs

## Integration Points

### System Watchdog
- System Watchdog can send logs to this module
- Logs Center provides audit trail for watchdog events

### Compliance Hub
- Compliance audits can be logged here
- Provides evidence trail for compliance

### Document Hub
- Document operations can be logged
- Track document access and modifications

## Future Enhancements

Potential improvements for future versions:
- [ ] Real-time log streaming with WebSocket
- [ ] Advanced filtering (date range picker)
- [ ] Log retention policies
- [ ] Automated alerts based on error thresholds
- [ ] Export to CSV/Excel
- [ ] Log aggregation and analytics dashboard
- [ ] Integration with external logging services (e.g., Sentry, LogRocket)
