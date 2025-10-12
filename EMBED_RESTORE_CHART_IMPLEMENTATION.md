# Restore Chart Embed Page - Implementation Guide

## 📋 Overview

This document describes the implementation of the `/embed/restore-chart` page - a token-protected embedded dashboard that displays aggregated statistics and charts for document restoration logs.

## 🎯 Features

### ✅ Token-Based Access Protection
- URL parameter-based authentication (`?token=YOUR_TOKEN`)
- Automatic redirect to `/unauthorized` for invalid tokens
- Environment variable configuration via `VITE_EMBED_ACCESS_TOKEN`

### 📊 Aggregated Statistics
The page displays the following summary metrics:
1. **Total** - Total number of document restorations
2. **Documentos únicos** - Number of unique documents restored
3. **Média/dia** - Average restorations per day
4. **Última execução** - Timestamp of last report execution

### 📈 Visual Analytics
1. **Bar Chart (Logs por Dia)** - Shows restoration count by day (last 7 days)
2. **Pie Chart (Por Status)** - Distribution of restoration report statuses (success, error, etc.)

## 🚀 Usage

### Accessing the Page

```
/embed/restore-chart?token=YOUR_SECRET_TOKEN
```

**Example:**
```
https://yourdomain.com/embed/restore-chart?token=abc123xyz
```

### Setting Up the Token

1. Add to your `.env` file:
```bash
VITE_EMBED_ACCESS_TOKEN=your-secret-token-here
```

2. In production (Vercel/hosting platform):
   - Add the environment variable in your hosting platform's dashboard
   - Restart your application after adding the variable

### Embedding in External Systems

#### iFrame Embed
```html
<iframe 
  src="https://yourdomain.com/embed/restore-chart?token=YOUR_TOKEN"
  width="1200"
  height="800"
  frameborder="0"
  style="border: none;"
></iframe>
```

#### For Email Reports
Use the `/api/generate-chart-image` endpoint to capture a screenshot:
```bash
curl https://yourdomain.com/api/generate-chart-image > chart.png
```

## 🗄️ Data Sources

The page queries two Supabase tables:

### 1. `document_restore_logs`
Tracks individual document restoration actions:
- `id` - Unique log identifier
- `document_id` - Document being restored
- `version_id` - Version being restored
- `restored_by` - User who performed the restoration
- `restored_at` - Timestamp of restoration

### 2. `restore_report_logs`
Tracks automated report executions:
- `id` - Unique log identifier
- `executed_at` - Timestamp of execution
- `status` - Execution status (success, error, critical)
- `message` - Execution message
- `error_details` - Error information (if any)
- `triggered_by` - How the report was triggered

## 🔧 Technical Details

### Component Structure

**File:** `/src/pages/embed/RestoreChart.tsx`

Key technologies:
- React with hooks (useState, useEffect)
- React Router (useNavigate, useSearchParams)
- Recharts (BarChart, PieChart)
- Supabase client for data fetching
- date-fns for date formatting

### Data Processing

1. **Fetch Data** - Queries both tables on component mount
2. **Calculate Summary** - Computes totals, unique counts, and averages
3. **Group by Day** - Aggregates restoration counts by day (DD/MM format)
4. **Group by Status** - Aggregates report execution statuses
5. **Format Data** - Transforms for chart consumption

### Security Considerations

- Token validation happens client-side (suitable for internal/trusted use)
- For production, consider server-side validation
- Use HTTPS in production to prevent token interception
- Rotate tokens regularly
- Keep tokens in environment variables, never commit to source control

## 📝 Files Created/Modified

### New Files
1. `/src/pages/embed/RestoreChart.tsx` - Main embed page component
2. `/src/pages/Unauthorized.tsx` - Unauthorized access page

### Modified Files
1. `/src/App.tsx` - Added routes for embed and unauthorized pages
2. `.env.example` - Added `VITE_EMBED_ACCESS_TOKEN` example

## 🎨 Customization

### Changing Chart Colors

Edit the `COLORS` array in `RestoreChart.tsx`:
```typescript
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
```

### Adjusting Date Range

Modify the slice parameter to show more/fewer days:
```typescript
// Show last 14 days instead of 7
.slice(0, 14)
```

### Customizing Summary Metrics

Add or modify metrics in the summary section:
```tsx
<div>
  🎯 <strong>New Metric:</strong> {yourCalculation}
</div>
```

## 🧪 Testing

### Local Testing

1. Set environment variable:
```bash
echo "VITE_EMBED_ACCESS_TOKEN=test123" >> .env
```

2. Start dev server:
```bash
npm run dev
```

3. Access the page:
```
http://localhost:8080/embed/restore-chart?token=test123
```

### Test Cases

✅ **Valid Token** - Should display charts and data
```
/embed/restore-chart?token=test123
```

❌ **Invalid Token** - Should redirect to /unauthorized
```
/embed/restore-chart?token=wrong
```

❌ **No Token** - Should redirect to /unauthorized
```
/embed/restore-chart
```

## 🐛 Troubleshooting

### Issue: "Unauthorized" even with correct token
- Verify environment variable is set correctly
- Check if you're using `VITE_` prefix (required for Vite)
- Restart dev server after changing .env

### Issue: No data displayed
- Check Supabase connection
- Verify RLS policies allow data access
- Check browser console for errors
- Ensure tables have data

### Issue: Charts not rendering
- Verify recharts is installed: `npm install recharts`
- Check for JavaScript errors in console
- Ensure data is in correct format

## 📚 Related Documentation

- [Restore Report Logs Implementation](/RESTORE_REPORT_LOGS_IMPLEMENTATION.md)
- [Daily Restore Report Architecture](/DAILY_RESTORE_REPORT_ARCHITECTURE.md)
- [Chart Image API](/CHART_IMAGE_API.md)
- [Embed Restore Chart (Static)](/public/embed-restore-chart.html)

## 🔐 Security Best Practices

1. **Token Management**
   - Use strong, random tokens (e.g., UUID v4)
   - Rotate tokens periodically
   - Use different tokens for different environments

2. **Access Control**
   - Implement rate limiting if exposed publicly
   - Consider IP whitelisting for sensitive data
   - Use HTTPS in production

3. **Data Privacy**
   - Ensure RLS policies are properly configured
   - Audit access logs regularly
   - Implement data anonymization if needed

## 🚢 Deployment

### Vercel
1. Add environment variable in Vercel dashboard
2. Redeploy application
3. Test with production URL

### Other Platforms
Follow platform-specific instructions for setting environment variables.

## 📞 Support

For issues or questions:
- Check existing documentation
- Review Supabase logs
- Check application console for errors
- Contact development team

---

**Last Updated:** 2025-10-12  
**Version:** 1.0.0  
**Author:** Copilot Agent
