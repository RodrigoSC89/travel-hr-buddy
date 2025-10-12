# Restore Chart Embed - Quick Reference

## 🚀 Quick Start

### Setup Token
```bash
# .env
VITE_EMBED_ACCESS_TOKEN=your-secret-token
```

### Access URL
```
/embed/restore-chart?token=your-secret-token
```

## 📊 What It Shows

| Metric | Description |
|--------|-------------|
| 📦 Total | Total document restorations |
| 📁 Documentos únicos | Number of unique documents |
| 📊 Média/dia | Average restorations per day |
| 🕒 Última execução | Last report execution time |

## 📈 Charts

1. **Bar Chart** - Logs by day (last 7 days)
2. **Pie Chart** - Distribution by status

## 🔒 Security

- ✅ Token protected
- ✅ Auto-redirect on invalid token
- ✅ Environment variable configuration

## 📁 Key Files

```
src/pages/embed/RestoreChart.tsx    # Main component
src/pages/Unauthorized.tsx           # Unauthorized page
src/App.tsx                          # Routes
.env.example                         # Token configuration
```

## 🎯 Common Use Cases

### 1. Embed in Dashboard
```html
<iframe src="/embed/restore-chart?token=..." width="100%" height="600"></iframe>
```

### 2. Email Reports
Use with `/api/generate-chart-image`

### 3. TV Wall Display
Full-screen embed for monitoring

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Unauthorized error | Check token in .env |
| No data | Verify Supabase connection |
| Charts not rendering | Check recharts installation |
| Environment variable not working | Restart dev server |

## 📚 Related Pages

- `/admin/reports/logs` - Full admin logs page
- `/unauthorized` - Error page
- Static HTML: `/public/embed-restore-chart.html`

## 🔧 Customization

### Change Days Shown
```typescript
// In RestoreChart.tsx
.slice(0, 14)  // Show 14 days instead of 7
```

### Change Colors
```typescript
const COLORS = ["#3b82f6", ...];  // Modify color array
```

---

**Quick Docs** | [Full Implementation Guide](./EMBED_RESTORE_CHART_IMPLEMENTATION.md)
