# Restore Audit Dashboard - Quick Reference

## 🎯 Quick Access

### URLs
```
# Admin View (Full Features)
/admin/documents/restore-dashboard

# Public View (Read-Only)
/admin/documents/restore-dashboard?public=1
```

## 🚀 Features at a Glance

| Feature | Icon | Action | Availability |
|---------|------|--------|--------------|
| Email Filter | 🔍 | Filter data by user email | Admin only |
| Search | 🔍 | Refresh data with filter | Admin only |
| CSV Export | 📤 | Download data as CSV | Admin only |
| PDF Export | 📄 | Generate PDF report | Admin only |
| Email Report | ✉️ | Send report via email | Admin only |
| Chart View | 📊 | Bar chart visualization | All users |
| Statistics | 📈 | Summary metrics | All users |

## 📊 Data Displayed

### Summary Statistics
- **Total de restaurações**: Total count of all restores
- **Documentos únicos**: Count of unique documents restored
- **Média por dia**: Average restorations per day

### Chart
- **Type**: Bar Chart
- **X-axis**: Date (dd/MM format)
- **Y-axis**: Restoration count
- **Period**: Last 15 days
- **Color**: Blue (#3b82f6)

## 📤 Export Formats

### CSV Export
```
Data,Contagem
2025-10-13,12
2025-10-12,8
```
- **Filename**: `restore-analytics.csv`
- **Encoding**: UTF-8
- **Excel Compatible**: Yes

### PDF Export
```
Relatório de Restaurações

Data        Contagem
13/10/2025  12
12/10/2025  8
```
- **Filename**: `restore-analytics.pdf`
- **Format**: Table with headers
- **Library**: jsPDF + autoTable

## ✉️ Email Report

### Trigger
Click the "✉️ Enviar por e-mail" button

### Requirements
- User must be authenticated
- Valid session token required

### Endpoint
```
POST /functions/v1/send-restore-dashboard
Authorization: Bearer <token>
```

### Success Message
```
📧 Relatório enviado com sucesso!
```

## 🌐 Public View Mode

### Activation
Add `?public=1` to URL

### Features
- ✅ Chart visualization
- ✅ Summary statistics
- ✅ Auto-refresh (10s)
- ❌ Email filter
- ❌ Export buttons
- ❌ Email sending
- ❌ Authentication required

### Use Cases
- TV wall displays
- Public dashboards
- Embedded views
- External sharing

## 🔍 Filtering

### Email Filter
1. Enter email or partial email in the input field
2. Click "🔍 Buscar" button
3. Data updates immediately
4. Case-insensitive matching

### Examples
```
Filter: "john"
Matches: john@example.com, johnny@test.com

Filter: "@gmail.com"
Matches: user@gmail.com, test@gmail.com

Filter: "" (empty)
Shows: All data
```

## 🔄 Auto-Refresh

- **Interval**: 10 seconds
- **Scope**: Statistics and chart data
- **Behavior**: Automatic in background
- **Stop**: Leave page or close tab

## 🛠️ Technical Details

### Dependencies
- react-chartjs-2 (v5.3.0)
- chart.js (v4.5.0)
- jspdf (v3.0.3)
- jspdf-autotable (v5.0.2)
- date-fns (v3.6.0)

### Database Functions
```sql
-- Get summary statistics
get_restore_summary(email_input text)

-- Get daily count
get_restore_count_by_day_with_email(email_input text)
```

### State Management
```typescript
const [filterEmail, setFilterEmail] = useState("");
const [summary, setSummary] = useState<RestoreSummary | null>(null);
const [dailyData, setDailyData] = useState<DailyData[]>([]);
const [session, setSession] = useState<any>(null);
```

## 🐛 Troubleshooting

### Chart not displaying
- Check if data is loading (dailyData array)
- Verify RPC functions exist in database
- Check browser console for errors

### Export not working
- Verify user has clicked on data (not just loaded page)
- Check if dailyData has values
- Verify browser allows downloads

### Email sending fails
- Confirm user is authenticated
- Check session token validity
- Verify edge function is deployed
- Review edge function logs

### Public view shows buttons
- Verify URL has `?public=1` parameter
- Check useSearchParams hook is working
- Clear browser cache

## 📱 Responsive Design

### Desktop
- Full layout with all features
- Wide chart display
- Horizontal button layout

### Mobile
- Stacked button layout
- Responsive chart
- Touch-friendly controls

## 🔒 Security

### Admin View
- ✅ Requires authentication
- ✅ Session token validation
- ✅ RLS policies enforced

### Public View
- ⚠️ No authentication required
- ⚠️ Read-only access
- ✅ RLS policies still enforced
- ✅ No sensitive actions available

## 📚 Related Documentation

- [RESTORE_AUDIT_DASHBOARD_COMPLETE.md](./RESTORE_AUDIT_DASHBOARD_COMPLETE.md) - Full implementation guide
- [RESTORE_DASHBOARD_IMPLEMENTATION.md](./RESTORE_DASHBOARD_IMPLEMENTATION.md) - Original implementation
- [DAILY_RESTORE_REPORT_INDEX.md](./DAILY_RESTORE_REPORT_INDEX.md) - Email reporting

## 🎨 UI Components

```
┌─────────────────────────────────────────┐
│ 📊 Painel de Auditoria - Restaurações │
├─────────────────────────────────────────┤
│ [Email Filter] [🔍] [📤] [📄] [✉️]     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📈 Estatísticas                     │ │
│ │ 🔢 Total: 150                       │ │
│ │ 📄 Únicos: 45                       │ │
│ │ 📆 Média: 10.00                     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📅 Gráfico de Restaurações          │ │
│ │                                     │ │
│ │     ▄                               │ │
│ │   ▄ █ ▄   ▄                         │ │
│ │ ▄ █ █ █ ▄ █ ▄                       │ │
│ │ █ █ █ █ █ █ █                       │ │
│ │ ─────────────────                   │ │
│ │ 11 12 13 14 15 16 17               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🎯 Best Practices

1. **Regular Monitoring**: Check dashboard daily for anomalies
2. **Filter Usage**: Use email filter to investigate specific users
3. **Export Data**: Regular CSV exports for record-keeping
4. **Public Sharing**: Use public view for stakeholder visibility
5. **Email Reports**: Send periodic reports to team members

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify database migrations are applied
3. Confirm edge functions are deployed
4. Review Supabase logs
5. Contact system administrator
