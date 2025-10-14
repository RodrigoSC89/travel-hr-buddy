# Unified Dashboard Quick Reference

## 🚀 Quick Start

### Access URLs
```
Authenticated: /admin/dashboard
Public Mode:   /admin/dashboard?public=1
```

## 📋 Features Checklist

- [x] Role-based navigation cards
- [x] Public sharing mode
- [x] QR code generation
- [x] Restore activity trend chart
- [x] Cron status monitoring
- [x] Quick links navigation

## 🎯 Key Components

### Navigation Cards (3)
1. **✅ Checklists** - Admin/HR Manager only
2. **📦 Restaurações Pessoais** - All roles
3. **🤖 Histórico de IA** - Admin/HR Manager only

### Quick Links (4)
1. Dashboard de Restaurações Completo
2. Logs Detalhados de IA
3. Relatórios e Analytics
4. Visualização TV Panel

## 🔐 Role Access Matrix

| Feature | Admin | HR Manager | Others |
|---------|-------|-----------|--------|
| Checklists | ✅ | ✅ | ❌ |
| Restaurações | ✅ | ✅ | ✅ |
| Histórico IA | ✅ | ✅ | ❌ |
| QR Code | ✅ | ✅ | ✅ |
| Trend Chart | ✅ | ✅ | ✅ |

## 📱 Public Mode

### What's Shown
- ✅ All navigation cards
- ✅ Trend chart
- ✅ Quick links
- ✅ Public mode badge
- ✅ Eye icon in title

### What's Hidden
- ❌ QR code section
- ❌ User-specific features

## 📊 Trend Chart

### Configuration
- **Data Source**: `get_restore_count_by_day_with_email`
- **Period**: Last 15 days
- **Type**: Bar chart
- **Height**: 300px
- **Library**: Recharts

## 🔧 Technical Details

### Dependencies
```json
{
  "qrcode.react": "^4.2.0",
  "@types/qrcode.react": "latest",
  "recharts": "^2.15.4"
}
```

### Key Imports
```typescript
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
```

### State Variables
```typescript
const [cronStatus, setCronStatus] = useState<"ok" | "warning" | null>(null);
const [cronMessage, setCronMessage] = useState("");
const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
const [loadingTrend, setLoadingTrend] = useState(false);
```

### Public Mode Detection
```typescript
const isPublic = searchParams.get("public") === "1";
```

## 🎨 Styling

### Card Colors
- Blue: `border-l-blue-500`
- Purple: `border-l-purple-500`
- Indigo: `border-l-indigo-500`

### Status Badges
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Public: `bg-blue-100 text-blue-800`

## 🧪 Testing

### Build
```bash
npm run build  # ✅ Passes
```

### Lint
```bash
npm run lint   # ✅ No errors
```

### Tests
```bash
npm run test   # ✅ 245 tests passing
```

## 📝 Code Quality

- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors
- ✅ No `any` types
- ✅ Proper interfaces

## 🔄 Navigation Behavior

### Authenticated Mode
```typescript
onClick={() => navigate("/admin/restore/personal")}
```

### Public Mode
```typescript
onClick={() => navigate("/admin/restore/personal?public=1")}
```

## 📈 Performance

- Efficient role-based filtering
- Lazy data loading
- Optimized re-renders
- Minimal bundle impact

## 🛠️ Maintenance

### Update Trend Period
```typescript
// In SQL function
LIMIT 15  // Change to desired number of days
```

### Add New Card
```typescript
{
  title: "New Feature",
  description: "Description here",
  icon: NewIcon,
  color: "blue",
  path: "/path/to/feature",
  roles: ["admin", "hr_manager"],
}
```

### Modify QR Code Size
```typescript
<QRCodeSVG value={publicUrl} size={128} />  // Change size value
```

## 🐛 Troubleshooting

### Cards Not Showing
- Check user role in database
- Verify `usePermissions()` hook is working
- Check role array in card definition

### Trend Chart Empty
- Verify database function exists
- Check user has restore data
- Verify Supabase connection

### QR Code Not Generating
- Check `qrcode.react` is installed
- Verify `publicUrl` is valid
- Ensure not in public mode

### Public Mode Not Working
- Check URL has `?public=1`
- Verify `useSearchParams()` import
- Check conditional rendering logic

## 📚 Related Files

```
src/pages/admin/dashboard.tsx           # Main implementation
src/hooks/use-permissions.ts            # Role checking
src/contexts/AuthContext.tsx            # User authentication
supabase/migrations/..._create_restore_dashboard_functions.sql  # Database function
```

## 🚀 Deployment

### Pre-deployment Checklist
- [x] Build passes
- [x] Tests pass
- [x] Lint passes
- [x] Database functions exist
- [x] Dependencies installed
- [x] Documentation complete

### Post-deployment Verification
1. Access `/admin/dashboard`
2. Verify cards show based on role
3. Check QR code generates
4. Test public mode with `?public=1`
5. Verify trend chart loads
6. Test all quick links

## 🎯 Success Metrics

- All 3 navigation cards functional
- Public mode works correctly
- QR code generates and scans
- Trend chart displays data
- Role-based access works
- All links navigate correctly

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review full implementation doc
3. Check visual guide
4. Review test results
5. Check database logs

## 🔗 Useful Links

- [Implementation Doc](UNIFIED_DASHBOARD_IMPLEMENTATION.md)
- [Visual Guide](UNIFIED_DASHBOARD_VISUAL_GUIDE.md)
- [Recharts Docs](https://recharts.org/)
- [QRCode.react Docs](https://github.com/zpao/qrcode.react)
- [React Router Docs](https://reactrouter.com/)
