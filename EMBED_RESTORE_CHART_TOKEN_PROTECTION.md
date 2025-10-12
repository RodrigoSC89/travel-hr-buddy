# Embed Restore Chart - Token Protection Implementation

## 📋 Overview

This implementation adds token-based access protection to the `/embed/restore-chart` route and includes enhanced statistics display.

## 🔐 Token Protection

### Setup

1. **Add Token to Environment Variables**

Create or update your `.env` file with:

```bash
VITE_EMBED_ACCESS_TOKEN=your_secret_token_here
```

For production (Vercel), add this environment variable in your project settings.

2. **Access the Embed Route**

The embed route is accessible at:

```
https://your-domain.com/embed/restore-chart?token=your_secret_token_here&email=user@example.com
```

**URL Parameters:**
- `token` (required): Must match `VITE_EMBED_ACCESS_TOKEN`
- `email` (optional): Filter data by user email

### Security Features

- ✅ Token validation on component mount
- ✅ Automatic redirect to `/unauthorized` if token is invalid
- ✅ Route is outside SmartLayout (no auth/navigation overhead)
- ✅ Token is read from environment variable, not hardcoded

## 📊 Statistics Display

The embed page now displays 4 key statistics:

1. **📦 Total**: Total number of restorations
2. **📁 Documentos únicos**: Number of unique documents restored
3. **📊 Média/dia**: Average restorations per day
4. **🕒 Última execução**: Timestamp of the last restoration

### Data Source

Statistics are fetched from the Supabase SQL function:
- `get_restore_summary(email_input)` - Returns aggregated statistics
- `get_restore_count_by_day_with_email(email_input)` - Returns daily restoration counts for chart

## 🎨 Visual Design

- **Fixed dimensions**: 600px × 450px (including statistics)
- **Chart height**: 280px
- **Clean white background**
- **Grid layout** for statistics (2×2)
- **Blue bar chart** (#3b82f6)
- **Brazilian date format** (dd/MM)

## 🧪 Testing

All components are fully tested:

**RestoreChartEmbed Tests** (5 tests)
- Loading state
- Chart and statistics display
- Empty data handling
- Window.chartReady flag
- Token check on mount

**Unauthorized Tests** (4 tests)
- Message display
- Icon rendering
- Navigation functionality
- Error message display

Run tests with:
```bash
npm test -- RestoreChartEmbed
npm test -- Unauthorized
```

## 📁 Files Created

1. `/src/pages/embed/RestoreChartEmbed.tsx` - Main embed component
2. `/src/pages/Unauthorized.tsx` - Unauthorized access page
3. `/src/tests/pages/embed/RestoreChartEmbed.test.tsx` - Embed tests
4. `/src/tests/pages/Unauthorized.test.tsx` - Unauthorized tests

## 📝 Files Modified

1. `/src/App.tsx` - Added routes for embed and unauthorized pages
2. `.env.example` - Added `VITE_EMBED_ACCESS_TOKEN` configuration

## 🚀 Usage Examples

### Basic Usage (with token)
```
/embed/restore-chart?token=my_secret_token
```

### Filter by User Email
```
/embed/restore-chart?token=my_secret_token&email=user@example.com
```

### Embedding in iframe
```html
<iframe 
  src="https://your-domain.com/embed/restore-chart?token=my_secret_token"
  width="600"
  height="450"
  frameborder="0"
></iframe>
```

## 🔄 Differences from Original Problem Statement

The problem statement referenced Next.js components and APIs, but this is a **Vite + React** project. The implementation was adapted accordingly:

| Original (Next.js) | Adapted (Vite + React) |
|-------------------|------------------------|
| `useRouter` from next/navigation | `useNavigate` from react-router-dom |
| `useSearchParams` from next/navigation | `useSearchParams` from react-router-dom |
| `process.env.NEXT_PUBLIC_*` | `import.meta.env.VITE_*` |
| Next.js API routes | Supabase RPC functions |
| `"use client"` directive | Not needed (Vite/React) |

## ✅ Requirements Checklist

- [x] Add token-based protection to `/embed/restore-chart`
- [x] Implement redirect to `/unauthorized` on invalid token
- [x] Add statistics display (total, unique docs, avg/day, last execution)
- [x] Use existing `get_restore_summary` SQL function
- [x] Style statistics with grid layout
- [x] Create comprehensive tests
- [x] Update environment variable configuration

## 🐛 Troubleshooting

**Issue**: "Cannot access this page"
- **Solution**: Verify `VITE_EMBED_ACCESS_TOKEN` is set in your environment

**Issue**: Redirected to unauthorized page
- **Solution**: Check that the token in the URL matches the environment variable exactly

**Issue**: No data displayed
- **Solution**: Verify that `document_restore_logs` table has data and the SQL functions are deployed

**Issue**: Statistics show N/A or 0
- **Solution**: Ensure there are restore records in the database for the specified email filter

## 📚 Related Documentation

- [EMBED_CHART_IMPLEMENTATION.md](./EMBED_CHART_IMPLEMENTATION.md) - Original embed chart implementation
- [RESTORE_DASHBOARD_ARCHITECTURE.md](./RESTORE_DASHBOARD_ARCHITECTURE.md) - Restore dashboard architecture
- Supabase migrations: `/supabase/migrations/20251011172000_create_restore_dashboard_functions.sql`
