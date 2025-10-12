# Embed Restore Chart - Quick Reference

## 🚀 Quick Start

### 1. Set Environment Variable
```bash
# .env
VITE_EMBED_ACCESS_TOKEN=your_secret_token_here
```

### 2. Access URL
```
https://yourdomain.com/embed/restore-chart?token=YOUR_SECRET_TOKEN
```

### 3. Embed in iframe
```html
<iframe 
  src="https://yourdomain.com/embed/restore-chart?token=YOUR_TOKEN"
  width="1200"
  height="800"
  frameborder="0"
></iframe>
```

## 📋 URL Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `token` | ✅ Yes | Access token for authentication | `?token=abc123...` |
| `email` | ❌ No | Filter data by user email | `&email=user@example.com` |

## 📊 Dashboard Components

### Summary Statistics (4 Cards)
- 📦 **Total Restorations**: Total count of all restorations
- 📁 **Unique Documents**: Number of distinct documents restored
- 📊 **Average per Day**: Daily average restoration rate
- 🕒 **Last Execution**: Most recent report execution timestamp

### Charts (2 Visualizations)
1. **Bar Chart**: Restoration count by day (last 7 days)
2. **Pie Chart**: Status distribution (Success/Error/Pending)

## 🎨 Visual Specifications

### Dimensions
- **Minimum Width**: 480px per chart
- **Recommended Width**: 1200px (full dashboard)
- **Minimum Height**: 800px
- **Card Minimum Width**: 250px

### Colors
- **Primary Blue**: `#3b82f6` (Bar chart)
- **Success Green**: `#10b981` (Status pie)
- **Error Red**: `#ef4444` (Status pie)
- **Pending Amber**: `#f59e0b` (Status pie)

## 🔒 Security

### Token Generation
```bash
# Generate secure token (Unix/Mac)
openssl rand -base64 32

# Generate secure token (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Token Validation Flow
```
Access URL → Token Check → Valid? → Show Dashboard
                              ↓
                           Invalid → Redirect to /unauthorized
```

## 📱 Responsive Breakpoints

| Screen Size | Layout | Grid Columns |
|-------------|--------|--------------|
| Desktop (>1024px) | Side-by-side | 2 columns |
| Tablet (768-1024px) | Stacked | 1 column |
| Mobile (<768px) | Stacked | 1 column |

## 🗄️ Database Tables

### Primary Tables
- `document_restore_logs` - Restoration history
- `restore_report_logs` - Report execution logs

### RPC Functions
- `get_restore_count_by_day_with_email(email_input)` - Daily counts
- `get_restore_summary(email_input)` - Summary statistics

## 🔧 Common Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Test with valid token (replace YOUR_TOKEN)
curl http://localhost:5173/embed/restore-chart?token=YOUR_TOKEN

# Test with invalid token (should return 302 redirect)
curl -I http://localhost:5173/embed/restore-chart?token=invalid
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 🔴 Redirects to /unauthorized | Check token in .env file matches URL parameter |
| 🔴 No data showing | Verify Supabase connection and data exists |
| 🔴 Charts not rendering | Check Chart.js registration and browser console |
| 🔴 Styles broken | Clear cache and check inline styles |

## 📂 File Locations

```
src/
├── pages/
│   ├── embed/
│   │   └── RestoreChartEmbed.tsx    # Main page
│   └── Unauthorized.tsx              # Error page
└── App.tsx                           # Routes
```

## 🎯 Use Cases

### 1. Internal Dashboard Embed
```html
<!-- Admin panel -->
<div class="dashboard-section">
  <h2>Restore Analytics</h2>
  <iframe src="/embed/restore-chart?token=TOKEN" ...></iframe>
</div>
```

### 2. Email Reports
```html
<!-- Generate screenshot for email -->
<script>
  const url = '/embed/restore-chart?token=TOKEN';
  // Use puppeteer/playwright to capture screenshot
</script>
```

### 3. TV Wall Display
```html
<!-- Full screen display -->
<iframe 
  src="/embed/restore-chart?token=TOKEN"
  style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;"
></iframe>
```

### 4. External Partner Access
```html
<!-- Share with partner (use separate token) -->
<iframe src="https://yourdomain.com/embed/restore-chart?token=PARTNER_TOKEN"></iframe>
```

## 📊 Data Refresh

- **Real-time**: Data fetches on page load
- **Auto-refresh**: Not implemented (manually refresh page)
- **Cache**: No client-side caching

## 🚀 Performance Tips

1. **Limit data range**: Bar chart shows only last 7 days
2. **Efficient queries**: RPC functions use indexed columns
3. **Loading states**: Shows spinner during fetch
4. **Responsive images**: Charts resize automatically

## 📝 Quick Configuration

### Update Token
```bash
# 1. Generate new token
openssl rand -base64 32

# 2. Update .env
VITE_EMBED_ACCESS_TOKEN=new_token_here

# 3. Restart dev server
npm run dev

# 4. Update all embed URLs
```

### Change Styling
```typescript
// In RestoreChartEmbed.tsx
// Update inline styles or add CSS classes
<div style={{ 
  backgroundColor: "white",  // Change background
  padding: "32px 24px",      // Adjust spacing
  // ... other styles
}}>
```

## 🔗 Related Links

- [Full Implementation Guide](./EMBED_RESTORE_CHART_IMPLEMENTATION.md)
- [Visual Guide](./EMBED_RESTORE_CHART_VISUAL.md)
- [Feature Summary](./RESTORE_LOGS_PAGE_SUMMARY.md)
- [Verification Checklist](./IMPLEMENTATION_VERIFICATION.md)

## 💬 Support

**Need help?**
- Check [Troubleshooting Guide](./EMBED_RESTORE_CHART_IMPLEMENTATION.md#troubleshooting)
- Review browser console for errors
- Verify Supabase connection
- Check environment variables

## 📌 Remember

- ✅ Always use HTTPS in production
- ✅ Keep tokens secret and rotate regularly
- ✅ Test in all target browsers/devices
- ✅ Monitor access logs for unusual activity
- ✅ Document any custom modifications
