# PATCH 94.0 - Logs Center Quick Reference

## 🚀 Quick Start

### Access the Module
```
URL: /dashboard/logs-center
Icon: FileText
Category: Core
```

### Basic Usage
1. Navigate to `/dashboard/logs-center`
2. View logs in filterable table
3. Use filters to narrow results
4. Click row to expand details
5. Export to PDF or run AI diagnostic

## 📝 Logging API

### Simple Log
```typescript
import { supabase } from '@/integrations/supabase/client';

await supabase.from('logs').insert({
  level: 'info',
  origin: 'my-module',
  message: 'Operation completed'
});
```

### Log with Details
```typescript
await supabase.from('logs').insert({
  level: 'error',
  origin: 'payment-module',
  message: 'Payment failed',
  details: {
    transaction_id: 'TXN123',
    error_code: 'TIMEOUT',
    amount: 1500
  }
});
```

### Bulk Logging
```typescript
const logs = events.map(e => ({
  level: e.severity,
  origin: e.source,
  message: e.description,
  details: e.data
}));

await supabase.from('logs').insert(logs);
```

## 🔍 Filtering

### By Level
- `info` - Informational messages
- `warn` - Warning messages
- `error` - Error messages

### By Origin
- Module name (e.g., `system-watchdog`)
- Component name (e.g., `payment-processor`)
- Function name (e.g., `validateUser`)

### Search
- Full-text search across message and origin
- Case-insensitive
- Real-time filtering

## 📊 AI Diagnostic

### Trigger
Click "Executar Diagnóstico com IA" button

### Analysis
- Error rate calculation
- Warning rate calculation
- Origin pattern detection
- Trend analysis

### Response Types
- **RISK** (>20% errors) - Immediate action required
- **RECOMMENDATION** (>10% errors) - Monitor closely
- **SUGGESTION** (>30% warnings) - Preventive review
- **DIAGNOSIS** (normal) - System healthy

### Example Output
```
"Taxa de erros elevada (23.5%). 
Recomenda-se análise técnica imediata. 
47 erros em 200 registros. 
Erros concentrados em: payment-processor."

Confidence: 92.0%
```

## 📄 PDF Export

### Generate PDF
Click "Exportar PDF" button

### PDF Contents
- Export date and time
- Total log count
- Statistics by level
- Complete log table
- QR verification code

### File Name
`logs-export-YYYY-MM-DD.pdf`

## 🎯 Common Patterns

### Error Logging
```typescript
try {
  // risky operation
} catch (error) {
  await supabase.from('logs').insert({
    level: 'error',
    origin: 'module-name',
    message: error.message,
    details: { stack: error.stack }
  });
}
```

### Warning Logging
```typescript
if (usage > threshold) {
  await supabase.from('logs').insert({
    level: 'warn',
    origin: 'resource-monitor',
    message: 'Resource usage above threshold',
    details: { usage, threshold, resource: 'memory' }
  });
}
```

### Info Logging
```typescript
await supabase.from('logs').insert({
  level: 'info',
  origin: 'user-service',
  message: 'User logged in',
  details: { user_id, ip_address }
});
```

## 🔧 Maintenance

### View Recent Logs
```sql
SELECT * FROM logs 
ORDER BY timestamp DESC 
LIMIT 100;
```

### Count by Level
```sql
SELECT level, COUNT(*) as count
FROM logs
GROUP BY level;
```

### Delete Old Logs
```sql
DELETE FROM logs
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Find Error Patterns
```sql
SELECT origin, COUNT(*) as error_count
FROM logs
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY origin
ORDER BY error_count DESC;
```

## 📦 Module Info

| Property | Value |
|----------|-------|
| **ID** | `core.logs-center` |
| **Name** | Logs Center |
| **Category** | core |
| **Version** | 94.0 |
| **Route** | `/dashboard/logs-center` |
| **Icon** | FileText |
| **Status** | active |

## 🗃️ Database Schema

```sql
Table: logs
- id: uuid (PK)
- timestamp: timestamptz (indexed)
- level: text (indexed, CHECK: info|warn|error)
- origin: text (indexed)
- message: text
- details: jsonb
- user_id: uuid (FK to auth.users)
- created_at: timestamptz (indexed)
```

## 🔐 Security

### RLS Policies
- Read: Authenticated users only
- Write: Authenticated users only

### Best Practices
- Never log sensitive data (passwords, tokens)
- Use details field for structured data
- Include user_id when relevant
- Keep messages concise and descriptive

## 🎨 UI Components

### Icons
- `AlertCircle` - Error logs (red)
- `AlertTriangle` - Warning logs (amber)
- `Info` - Info logs (blue)

### Badges
- Destructive - Error level
- Secondary - Warning level
- Default - Info level

### Actions
- `Download` - Export PDF
- `Brain` - AI Diagnostic
- `Filter` - Clear filters
- `ChevronDown` - Expand details

## 📞 Support

### Common Issues

**No logs showing**
- Check filters are not too restrictive
- Verify database connection
- Check RLS policies

**PDF export fails**
- Check browser allows downloads
- Verify log data is valid
- Check console for errors

**AI diagnostic not working**
- Verify logs exist to analyze
- Check AI kernel is loaded
- See console for error details

## 🔗 Related Modules

- **System Watchdog** (`/dashboard/system-watchdog`)
- **Compliance Hub** (`/dashboard/compliance-hub`)
- **Document Hub** (`/dashboard/document-hub`)

## 📚 Resources

- **README**: `src/modules/logs-center/README.md`
- **Types**: `src/modules/logs-center/types.ts`
- **Component**: `src/modules/logs-center/LogsCenter.tsx`
- **PDF Export**: `src/lib/logger/exportToPDF.ts`
- **Migration**: `supabase/migrations/20251024185700_create_logs_table.sql`

---

**Version**: 94.0  
**Last Updated**: 2025-10-24  
**Status**: ✅ Production Ready
