# Restore Audit Dashboard - Quick Reference

## 🚀 Quick Start

### Admin Access
```
URL: /admin/documents/restore-dashboard
Auth: Required
```

### Public TV Display
```
URL: /admin/documents/restore-dashboard?public=1
Auth: Not Required
```

## 📊 Features at a Glance

### Admin View
- ✅ Interactive bar chart (last 15 days)
- ✅ Email filtering
- ✅ CSV export
- ✅ PDF export  
- ✅ Email reports
- ✅ Auto-refresh (10s)
- ✅ Summary statistics

### Public View
- ✅ Bar chart display
- ✅ Summary statistics
- ✅ Auto-refresh (10s)
- ❌ No admin controls
- ❌ No filtering
- ❌ No exports

## 📤 Export Functions

### CSV Export
**Button**: "Exportar CSV"  
**Format**: UTF-8 with BOM  
**Columns**: Data, Quantidade de Restaurações  
**Filename**: `restore-analytics.csv`

### PDF Export
**Button**: "Exportar PDF"  
**Format**: Professional table layout  
**Includes**: Statistics + daily data  
**Filename**: `restore-analytics-YYYY-MM-DD.pdf`

### Email Report
**Button**: "Enviar por E-mail"  
**Format**: HTML email  
**Includes**: Statistics + data table  
**Auth**: Required (session token)

## 🔍 Email Filter

```typescript
Input: "Filtrar por e-mail do restaurador"
Pattern: Case-insensitive partial match (ILIKE)
Example: "john" matches "john@example.com"
```

## 📈 Statistics Cards

| Card | Color | Metric |
|------|-------|--------|
| Total de Restaurações | Blue | Total count |
| Documentos únicos | Green | Unique documents |
| Média diária | Purple | Average per day |

## 🔄 Auto-Refresh

- **Interval**: 10 seconds
- **Applies to**: Chart + Statistics
- **Status**: Shows "Atualização automática a cada 10s"
- **Cleanup**: Stops when component unmounts

## 🛠️ Technical Stack

```typescript
// Dependencies
"chart.js": "^4.5.0"
"react-chartjs-2": "^5.3.0"
"jspdf": "^3.0.3"
"jspdf-autotable": "^5.0.2"
"date-fns": "^3.6.0"
```

## 🗄️ Database Functions

### get_restore_count_by_day_with_email
```sql
Parameters: email_input (text, nullable)
Returns: day (date), count (int)
Limit: 15 days
```

### get_restore_summary
```sql
Parameters: email_input (text, nullable)
Returns: total (int), unique_docs (int), avg_per_day (numeric)
```

## 🌐 Edge Function

### send-restore-dashboard
```typescript
Endpoint: /functions/v1/send-restore-dashboard
Method: POST
Auth: Bearer token (required)
Body: { summary, dailyData, filterEmail, generatedAt }
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 column stats)
- **Tablet**: 768px - 1024px (adjustable)
- **Desktop**: > 1024px (3 column stats)

## 🎨 Color Scheme

```css
Chart Bar: #3b82f6 (Blue)
Blue Card BG: bg-blue-50
Green Card BG: bg-green-50
Purple Card BG: bg-purple-50
```

## 📋 Component Props

```typescript
interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;  // ISO date
  count: number;
}
```

## 🔐 Security Notes

- Admin view requires authentication
- Session tokens validated on edge function
- Public view is read-only
- RLS policies always enforced
- Email filter uses safe ILIKE patterns

## 🐛 Troubleshooting

### Chart Not Showing
- Check browser console for errors
- Verify RPC functions exist
- Check data is being fetched

### Export Not Working
- Ensure data is loaded (dailyData.length > 0)
- Check browser allows downloads
- Verify jsPDF dependencies loaded

### Email Not Sending
- Edge function must be deployed
- Session token must be valid
- Check edge function logs

## 📍 File Locations

```
src/pages/admin/documents/restore-dashboard.tsx
supabase/functions/send-restore-dashboard/index.ts
supabase/functions/send-restore-dashboard/README.md
supabase/migrations/20251011172000_create_restore_dashboard_functions.sql
```

## 🎯 Use Cases

### 1. Daily Monitoring
Navigate to admin view, no filter needed

### 2. User Investigation
Apply email filter: "suspect@domain.com"

### 3. Report Generation
Export PDF for management review

### 4. TV Wall Display
Use public URL on display screens

### 5. Team Sharing
Send email report to stakeholders

## ⚡ Performance

- **Build Time**: ~42s
- **Bundle Size**: Lazy-loaded
- **Chart Render**: < 100ms
- **Data Fetch**: < 500ms
- **Auto-refresh**: Non-blocking

## 🚦 Status Indicators

```typescript
Loading: Spinning circle + "Carregando..."
No Data: "Nenhum dado disponível"
Error: Toast notification (destructive variant)
Success: Toast notification (default variant)
```

## 📞 Quick Commands

```bash
# Build project
npm run build

# Deploy edge function
supabase functions deploy send-restore-dashboard

# Run locally
npm run dev
```

---

**Last Updated**: October 13, 2025  
**Version**: 1.0.0  
**PR**: #443
