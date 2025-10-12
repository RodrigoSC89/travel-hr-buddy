# Embed Restore Chart - Complete Implementation Guide

## 📋 Overview

This guide provides comprehensive information about the Embed Restore Chart feature, a secure, embeddable dashboard page that displays aggregated statistics and visual analytics for document restoration logs.

## 🎯 Features

### Core Functionality
- **Token-Based Security**: Secure access via URL parameter authentication
- **Real-Time Data**: Fetches live data from Supabase
- **Interactive Charts**: Bar and Pie charts with tooltips
- **Summary Statistics**: Key metrics at a glance
- **Responsive Design**: Works on all screen sizes
- **Embeddable**: Can be embedded in iframes or used standalone

### Visual Components

#### 1. Summary Statistics Cards (4 Cards)
- **📦 Total Restorations**: Total number of document restorations
- **📁 Unique Documents**: Number of unique documents restored
- **📊 Average per Day**: Average restorations per day
- **🕒 Last Execution**: Timestamp of most recent report execution

#### 2. Bar Chart
- Shows restoration count by day for the last 7 days
- Interactive tooltips on hover
- Blue color scheme (#3b82f6)
- Responsive height and width

#### 3. Pie Chart
- Distribution by execution status:
  - 🟢 Success (Green)
  - 🔴 Error (Red)
  - 🟡 Pending (Amber)
- Shows count and percentage in tooltips
- Legend at bottom

## 🛠️ Technical Implementation

### File Structure

```
src/
├── pages/
│   ├── embed/
│   │   └── RestoreChartEmbed.tsx    # Main embed page
│   └── Unauthorized.tsx              # Unauthorized access page
└── App.tsx                           # Routes configuration
```

### Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "react-chartjs-2": "^5.3.0",
  "chart.js": "^4.5.0",
  "@supabase/supabase-js": "^2.57.4"
}
```

### Environment Variables

Add to your `.env` file:

```bash
# Embed Access Token - For protected embed routes
VITE_EMBED_ACCESS_TOKEN=your_secret_token_here
```

**Security Note**: Keep this token secret and rotate it regularly. Use strong, randomly generated tokens.

## 📊 Database Schema

### Tables Used

#### 1. `document_restore_logs`
```sql
CREATE TABLE document_restore_logs (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  version_id UUID REFERENCES document_versions(id),
  restored_by UUID REFERENCES auth.users(id),
  restored_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `restore_report_logs`
```sql
CREATE TABLE restore_report_logs (
  id UUID PRIMARY KEY,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  error_details TEXT,
  triggered_by TEXT DEFAULT 'automated'
);
```

### RPC Functions

#### 1. `get_restore_count_by_day_with_email`
Returns daily restoration counts filtered by email (optional).

```sql
-- Returns last 15 days of data
SELECT day, count
FROM get_restore_count_by_day_with_email('user@example.com');
```

#### 2. `get_restore_summary`
Returns summary statistics.

```sql
-- Returns total, unique_docs, avg_per_day
SELECT * FROM get_restore_summary('user@example.com');
```

## 🔒 Security

### Token Validation

The page validates tokens on mount:

```typescript
useEffect(() => {
  const allowedToken = import.meta.env.VITE_EMBED_ACCESS_TOKEN;
  const allowed = token === allowedToken;
  
  if (!allowed) {
    navigate("/unauthorized");
  }
}, [token, navigate]);
```

### Best Practices

1. **Token Management**
   - Use strong, randomly generated tokens (32+ characters)
   - Store in environment variables, never in code
   - Rotate tokens regularly (quarterly recommended)
   - Use different tokens for different environments

2. **HTTPS Required**
   - Always use HTTPS in production
   - Prevents token interception
   - Required for iframe embedding in secure sites

3. **Row Level Security (RLS)**
   - Database tables have RLS enabled
   - Queries respect user permissions
   - Admin-only access to report logs

## 🚀 Usage

### Basic Access

Direct URL access with token:
```
https://yourdomain.com/embed/restore-chart?token=YOUR_SECRET_TOKEN
```

### With Email Filter

Filter data by user email:
```
https://yourdomain.com/embed/restore-chart?token=YOUR_SECRET_TOKEN&email=user@example.com
```

### Embedding in iframe

```html
<iframe 
  src="https://yourdomain.com/embed/restore-chart?token=YOUR_TOKEN"
  width="1200"
  height="800"
  frameborder="0"
  allow="fullscreen"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
></iframe>
```

### Embedding in React

```jsx
import React from 'react';

function DashboardEmbed() {
  const token = process.env.REACT_APP_EMBED_TOKEN;
  
  return (
    <div style={{ width: '100%', height: '800px' }}>
      <iframe
        src={`https://yourdomain.com/embed/restore-chart?token=${token}`}
        width="100%"
        height="100%"
        frameBorder="0"
      />
    </div>
  );
}
```

## 📱 Responsive Design

### Breakpoints

- **Desktop (>1024px)**: 2-column grid layout
- **Tablet (768px-1024px)**: Stacked layout
- **Mobile (<768px)**: Stacked layout with adjusted padding

### CSS Grid

```css
/* Summary cards - responsive grid */
gridTemplateColumns: repeat(auto-fit, minmax(250px, 1fr))

/* Charts grid - responsive 2 columns */
gridTemplateColumns: repeat(auto-fit, minmax(480px, 1fr))
```

## 🎨 Styling

### Color Palette

```css
/* Primary Colors */
--blue-500: #3b82f6;      /* Bar chart, accents */
--green-500: #10b981;     /* Success status */
--red-500: #ef4444;       /* Error status */
--amber-500: #f59e0b;     /* Pending status */

/* Neutral Colors */
--gray-50: #f9fafb;       /* Card backgrounds */
--gray-100: #f3f4f6;      /* Page background */
--gray-200: #e5e7eb;      /* Borders */
--gray-600: #6b7280;      /* Secondary text */
--gray-900: #111827;      /* Primary text */
```

### Typography

```css
/* Headings */
--font-heading: system-ui, -apple-system, sans-serif;
--heading-xl: 28px / 700;
--heading-lg: 18px / 600;

/* Body */
--font-body: system-ui, -apple-system, sans-serif;
--body-lg: 16px / 600;
--body-md: 14px / 400;
--body-sm: 13px / 500;
--body-xs: 12px / 400;
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Token validation works (redirects to /unauthorized with invalid token)
- [ ] Data loads correctly from Supabase
- [ ] Bar chart displays last 7 days
- [ ] Pie chart shows status distribution
- [ ] Summary statistics are accurate
- [ ] Loading state displays properly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Charts are interactive (tooltips work)
- [ ] Email filter parameter works (optional)

### Test URLs

```bash
# Valid token
http://localhost:5173/embed/restore-chart?token=YOUR_TOKEN

# Invalid token (should redirect)
http://localhost:5173/embed/restore-chart?token=invalid

# With email filter
http://localhost:5173/embed/restore-chart?token=YOUR_TOKEN&email=test@example.com
```

## 📈 Performance

### Optimization Strategies

1. **Data Limiting**
   - Bar chart limited to last 7 days
   - Pie chart uses last 100 report logs
   - RPC functions use efficient queries

2. **Loading States**
   - Displays spinner during data fetch
   - Prevents layout shift

3. **Chart Configuration**
   - Responsive sizing
   - Optimized re-renders
   - Efficient data transformation

## 🔄 Data Flow

```
User Access
    ↓
Token Validation
    ↓
Fetch Data from Supabase
    ├── get_restore_count_by_day_with_email()
    ├── get_restore_summary()
    └── Query restore_report_logs
    ↓
Process & Transform Data
    ↓
Render Charts & Statistics
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Token Not Working
**Problem**: Redirects to /unauthorized even with correct token
**Solution**: 
- Check `.env` file has `VITE_EMBED_ACCESS_TOKEN` set
- Restart dev server after changing `.env`
- Ensure no trailing spaces in token

#### 2. No Data Showing
**Problem**: Charts show "Nenhum dado disponível"
**Solution**:
- Verify Supabase connection
- Check RLS policies allow data access
- Verify data exists in tables
- Check browser console for errors

#### 3. Charts Not Rendering
**Problem**: Blank space where charts should be
**Solution**:
- Check Chart.js is properly registered
- Verify data format matches chart expectations
- Check browser console for errors

#### 4. Styles Not Applied
**Problem**: Page looks unstyled
**Solution**:
- Check inline styles are correct
- Verify no CSS conflicts
- Clear browser cache

## 🚢 Deployment

### Vercel

1. Set environment variable:
   ```bash
   vercel env add VITE_EMBED_ACCESS_TOKEN
   ```

2. Deploy:
   ```bash
   npm run deploy:vercel
   ```

### Netlify

1. Add to `netlify.toml`:
   ```toml
   [build.environment]
     VITE_EMBED_ACCESS_TOKEN = "your_token_here"
   ```

2. Or set in Netlify UI: Site settings → Environment variables

## 📚 Related Documentation

- [EMBED_RESTORE_CHART_QUICKREF.md](./EMBED_RESTORE_CHART_QUICKREF.md) - Quick reference guide
- [EMBED_RESTORE_CHART_VISUAL.md](./EMBED_RESTORE_CHART_VISUAL.md) - Visual guide
- [RESTORE_LOGS_PAGE_SUMMARY.md](./RESTORE_LOGS_PAGE_SUMMARY.md) - Feature summary
- [IMPLEMENTATION_VERIFICATION.md](./IMPLEMENTATION_VERIFICATION.md) - Verification checklist

## 💡 Tips

1. **Use Strong Tokens**: Generate with `openssl rand -base64 32`
2. **Monitor Usage**: Track access patterns in server logs
3. **Update Regularly**: Keep dependencies updated for security
4. **Test Thoroughly**: Test in all target environments
5. **Document Changes**: Keep this guide updated with any modifications
