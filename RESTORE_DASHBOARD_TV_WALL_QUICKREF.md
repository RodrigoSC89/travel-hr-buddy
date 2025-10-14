# 🚀 Quick Reference - Restore Dashboard TV Wall Enhancements

## 📍 Navigation
- **Admin Mode:** `/admin/documents/restore-dashboard`
- **TV Wall Mode:** `/admin/documents/restore-dashboard?public=1`

## 🎯 Key Features

### 1️⃣ Monthly Department Chart
- **Location:** Below daily activity chart
- **Type:** Horizontal bar chart (green)
- **Data:** Current month restores by department
- **Condition:** Only visible when data exists

### 2️⃣ QR Code Section
- **Location:** After department chart
- **Visibility:** Hidden in public mode
- **Purpose:** TV Wall sharing
- **Size:** 128x128 pixels

### 3️⃣ Public Mode Indicator
- **Text:** "🔒 Modo público somente leitura (TV Wall Ativado)"
- **Color:** Yellow background
- **Location:** Bottom of page

## 🗄️ Database

### RPC Function
```sql
get_monthly_restore_summary_by_department()
```

**Returns:**
```typescript
{
  department: string;
  count: number;
}[]
```

## 🧩 Component Interface

### New State Variables
```typescript
const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([]);
const publicUrl = window.location.origin + '/admin/documents/restore-dashboard?public=1';
```

### New Type
```typescript
interface DepartmentSummary {
  department: string;
  count: number;
}
```

## 📦 Dependencies

```json
{
  "qrcode.react": "^4.1.0"
}
```

## 🔑 Key Code Snippets

### Fetching Department Data
```typescript
const { data: deptData, error: deptError } = await supabase
  .rpc("get_monthly_restore_summary_by_department");

if (!deptError && deptData) {
  setDepartmentSummary(deptData);
}
```

### QR Code Component
```tsx
import { QRCodeSVG } from "qrcode.react";

<QRCodeSVG value={publicUrl} size={128} level="H" />
```

### Conditional Rendering
```tsx
{departmentSummary.length > 0 && (
  <Card>
    {/* Department chart */}
  </Card>
)}

{!isPublicView && publicUrl && (
  <Card>
    {/* QR Code */}
  </Card>
)}
```

## 🧪 Testing

**Test File:** `src/tests/pages/admin/documents/restore-dashboard-enhancements.test.tsx`

**Run Tests:**
```bash
npm test -- restore-dashboard-enhancements.test.tsx
```

**Expected:** 6 tests passing

## 🎨 Visual Elements

### Department Chart Colors
- **Background:** `rgba(34, 197, 94, 0.8)` (green)
- **Border:** `rgba(34, 197, 94, 1)` (green)

### QR Code Container
- **Background:** White
- **Padding:** 4 units
- **Border Radius:** Rounded

### Public Mode Banner
- **Background:** `bg-yellow-50`
- **Border:** `border-yellow-200`
- **Text:** `text-yellow-800`

## 📊 Chart Configuration

### Department Chart
```typescript
{
  indexAxis: 'y',  // Horizontal bars
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}
```

## 🔒 Public Mode Differences

| Feature | Admin Mode | Public Mode |
|---------|-----------|-------------|
| Back Button | ✅ Visible | ❌ Hidden |
| Filters | ✅ Visible | ❌ Hidden |
| Export Buttons | ✅ Visible | ❌ Hidden |
| QR Code | ✅ Visible | ❌ Hidden |
| Charts | ✅ Visible | ✅ Visible |
| Summary Cards | ✅ Visible | ✅ Visible |
| Public Indicator | ❌ Hidden | ✅ Visible |

## 🚀 Deployment Checklist

- [x] Install dependencies (`npm install`)
- [x] Run database migration
- [x] Build project (`npm run build`)
- [x] Run tests (`npm test`)
- [x] Deploy to production

## 📱 TV Wall Setup

1. Open browser on TV
2. Navigate to: `/admin/documents/restore-dashboard?public=1`
3. Bookmark for quick access
4. Page auto-refreshes every 10 seconds

**OR**

1. Open admin dashboard
2. Scan QR code with TV browser
3. Bookmark the URL

## 🐛 Troubleshooting

### Department chart not showing
- ✅ Check if there's data for current month
- ✅ Verify RPC function exists in database
- ✅ Check browser console for errors

### QR code not displaying
- ✅ Ensure not in public mode (`?public=1`)
- ✅ Check if `qrcode.react` is installed
- ✅ Verify `publicUrl` is generated correctly

### Auto-refresh not working
- ✅ Check 10-second interval in useEffect
- ✅ Verify fetchStats function is being called
- ✅ Check for JavaScript errors

## 💡 Tips

- 🎯 Use department chart to identify which teams restore most
- 📱 Use QR code for instant TV Wall setup
- 🔄 Let auto-refresh handle updates (no manual refresh needed)
- 📊 Filter by email in admin mode for focused analysis
- 🖥️ Use `?public=1` for clean TV display

## 🔗 Related Files

- `src/pages/admin/documents/restore-dashboard.tsx` - Main component
- `supabase/migrations/20251014000000_*.sql` - Database function
- `src/tests/pages/admin/documents/restore-dashboard-enhancements.test.tsx` - Tests
- `package.json` - Dependencies

## 📞 Support

Check the comprehensive documentation:
- `ASSISTANT_LOGS_API_RESTORE_DASHBOARD_ENHANCEMENTS.md`

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-14  
**Status:** ✅ Production Ready
