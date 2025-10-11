# TV Wall Logs - Quick Reference

## 🚀 Quick Start

**Access**: Navigate to `/tv/logs`

**Purpose**: Real-time dashboard for monitoring document restore activity on TV displays

## 📊 Dashboard Features

### Auto-Refresh
- Updates every **60 seconds**
- Last update timestamp displayed
- Total restore count shown

### Charts

#### Bar Chart (Left)
- **Title**: 📆 Restaurações por Dia (Últimos 15 Dias)
- **Shows**: Daily restore counts for last 15 days
- **Color**: Cyan (#22d3ee)

#### Pie Chart (Right)
- **Title**: 📊 Por Status
- **Categories**:
  - 🟢 Success (Green)
  - 🟡 Warning (Yellow)
  - 🔴 Error (Red)

## 🔧 Technical Stack

### Frontend
- **Component**: `/src/pages/tv/TVWallLogs.tsx`
- **Library**: Recharts
- **Framework**: React + TypeScript

### Backend
- **Edge Function**: `/supabase/functions/restore-logs-summary`
- **Database**: Supabase (PostgreSQL)
- **Table**: `document_restore_logs`

## 🎯 URL Structure

```
Production: https://yourapp.com/tv/logs
Development: http://localhost:8080/tv/logs
```

## 💻 Environment Setup

### Required Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url

# Supabase (Dashboard > Settings > Edge Functions)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🖥️ TV Display Setup

### Browser Kiosk Mode

**Chrome (Linux)**:
```bash
chromium-browser --kiosk --app=https://yourapp.com/tv/logs
```

**Chrome (Windows)**:
```bash
chrome.exe --kiosk --app=https://yourapp.com/tv/logs
```

**Firefox**:
```bash
firefox --kiosk https://yourapp.com/tv/logs
```

### Fullscreen Shortcut
Press **F11** to toggle fullscreen in any browser

## 🧪 Testing

### Run Tests
```bash
# Single test file
npm test -- src/tests/pages/tv/TVWallLogs.test.tsx

# All tests
npm test
```

### Test Coverage
- ✅ 6 tests total
- ✅ 100% passing
- ✅ Covers: Rendering, API calls, error handling, empty states

## 📦 Deployment

### Deploy Edge Function
```bash
supabase functions deploy restore-logs-summary
```

### Build Frontend
```bash
npm run build
```

## 🎨 Customization Cheat Sheet

### Change Refresh Interval
```typescript
// In TVWallLogs.tsx
setInterval(fetchData, 60000); // Change 60000 to desired ms
```

### Change Colors
```typescript
// In TVWallLogs.tsx
const COLORS = ["#4ade80", "#facc15", "#f87171"];
// [Success, Warning, Error]
```

### Change Date Range
```typescript
// In index.ts (edge function)
fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
// Change 15 to desired number of days
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "VITE_SUPABASE_URL not configured" | Add to `.env` file |
| No data showing | Check database has records |
| Charts not rendering | Run `npm install recharts` |
| Stale data | Clear browser cache |

## 📱 Recommended Display Settings

| Setting | Recommended Value |
|---------|------------------|
| Resolution | 1920x1080 or higher |
| Browser | Chrome or Firefox |
| Mode | Kiosk/Fullscreen |
| Refresh | Auto (built-in) |

## 🔗 Related Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Deploy edge function
supabase functions deploy restore-logs-summary
```

## 📄 Related Files

- `src/pages/tv/TVWallLogs.tsx` - Component
- `src/tests/pages/tv/TVWallLogs.test.tsx` - Tests
- `supabase/functions/restore-logs-summary/index.ts` - API
- `TV_WALL_LOGS_IMPLEMENTATION.md` - Full documentation

## 🔐 Security Notes

- Currently publicly accessible
- No sensitive data exposed (only counts)
- Add authentication if needed
- Consider rate limiting for production

## 📞 Support

Check documentation: `TV_WALL_LOGS_IMPLEMENTATION.md`

---

**Version**: 1.0  
**Status**: ✅ Production Ready
