# SGSO Effectiveness Monitoring - Quick Reference

## 🚀 Quick Access

**Dashboard URL:** `/admin/sgso` → Tab "Efetividade"

**API Endpoints:**
- `GET /api/sgso/effectiveness` - Overall metrics
- `GET /api/sgso/effectiveness?by_vessel=true` - Vessel-specific metrics

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251018000000_add_effectiveness_tracking_fields.sql` | Database schema & functions |
| `pages/api/sgso/effectiveness.ts` | API endpoint handler |
| `src/components/sgso/SGSOEffectivenessChart.tsx` | Main React component |
| `src/pages/admin/sgso.tsx` | Admin page integration |
| `src/tests/sgso-effectiveness-api.test.ts` | Test suite |

## 💾 Database Fields

### New Columns in `safety_incidents`

```sql
sgso_category         TEXT              -- Category of incident
action_plan_date      TIMESTAMP         -- When action plan created
resolved_at           TIMESTAMP         -- When incident resolved
repeated              BOOLEAN           -- Is this a repeat?
```

## 🔧 SQL Functions

### 1. Overall Effectiveness

```sql
SELECT * FROM calculate_sgso_effectiveness();
```

**Returns:**
```
category              | TEXT
incidents_total       | BIGINT
incidents_repeated    | BIGINT
effectiveness_percent | NUMERIC
avg_resolution_days   | NUMERIC
```

### 2. Effectiveness by Vessel

```sql
SELECT * FROM calculate_sgso_effectiveness_by_vessel();
```

**Returns:** Same as above + `vessel_name`

## 🎨 Component Usage

```tsx
import { SGSOEffectivenessChart } from "@/components/sgso/SGSOEffectivenessChart";

// Use in your component
<SGSOEffectivenessChart />
```

**Features:**
- Auto-fetches data on mount
- Loading state
- Error handling
- Three view modes (General, Vessel, Table)
- Responsive design

## 📊 Data Structure

### API Response (Overall)

```typescript
interface EffectivenessData {
  category: string;
  incidents_total: number;
  incidents_repeated: number;
  effectiveness_percent: number;
  avg_resolution_days: number | null;
}
```

### API Response (By Vessel)

```typescript
interface EffectivenessByVesselData extends EffectivenessData {
  vessel_name: string;
}
```

## 🎯 SGSO Categories

Standard categories to use:
- `"Erro humano"` - Human Error
- `"Falha técnica"` - Technical Failure
- `"Comunicação"` - Communication
- `"Falha organizacional"` - Organizational Failure

## 🔢 Calculation Formulas

### Effectiveness
```
Effectiveness (%) = 100 - (Repeated / Total × 100)
```

### Average Resolution
```
Avg Days = AVG(resolved_at - created_at) in days
```

## 🎨 Color Coding

| Range | Color | Label |
|-------|-------|-------|
| ≥ 90% | 🟢 Green | Excelente |
| 75-89% | 🟡 Yellow | Bom |
| 50-74% | 🟠 Orange | Moderado |
| < 50% | 🔴 Red | Crítico |

## 📝 Data Entry Checklist

When recording incidents:
- [ ] Set `sgso_category` (required for grouping)
- [ ] Set `action_plan_date` when plan is created
- [ ] Set `resolved_at` when incident is resolved
- [ ] Set `repeated = true` if this is a reincidence
- [ ] Set `status = 'resolved'` or `'closed'`
- [ ] Link to `vessel_id` for vessel-specific metrics

## 🧪 Testing

Run tests:
```bash
npm test -- src/tests/sgso-effectiveness-api.test.ts
```

Expected: 9/9 tests passing ✅

## 🚨 Troubleshooting

### No data showing?
- Check if incidents have `status = 'resolved'` or `'closed'`
- Verify `sgso_category` is populated
- Ensure `resolved_at` is set for resolved incidents

### API errors?
- Check Supabase connection
- Verify SQL functions exist
- Check user authentication

### Chart not rendering?
- Check browser console for errors
- Verify Recharts is installed
- Check data format matches expected structure

## 📈 Performance Tips

1. **Indexes are created** on key columns
2. **Use filters** when fetching large datasets
3. **Cache results** client-side for repeated views
4. **Paginate** if showing very large tables

## 🔐 Security Notes

- Functions use `SECURITY DEFINER`
- RLS policies apply to `safety_incidents`
- Only authenticated users can access
- No sensitive data exposed in responses

## 📚 Related Documentation

- [Full Implementation Guide](./SGSO_EFFECTIVENESS_GUIDE.md)
- [Visual Summary](./SGSO_EFFECTIVENESS_VISUAL_SUMMARY.md)
- [API Documentation](./API_ADMIN_SGSO.md)

## 🤝 Common Integration Patterns

### Fetch Data in React Hook

```tsx
const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/sgso/effectiveness');
    const result = await response.json();
    setData(result);
  };
  fetchData();
}, []);
```

### Format for Display

```tsx
const formatEffectiveness = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatDays = (value: number | null) => {
  return value !== null ? `${value.toFixed(1)} dias` : 'N/A';
};
```

### Color Coding Function

```tsx
const getEffectivenessColor = (percent: number) => {
  if (percent >= 90) return "#22c55e"; // green
  if (percent >= 75) return "#eab308"; // yellow
  if (percent >= 50) return "#f97316"; // orange
  return "#ef4444"; // red
};
```

## 💡 Best Practices

1. **Consistent Categorization**: Always use standard SGSO categories
2. **Timely Updates**: Update `resolved_at` promptly when incidents close
3. **Mark Repeats**: Flag repeated incidents for accurate effectiveness tracking
4. **Document Actions**: Record `action_plan_date` when plans are created
5. **Regular Reviews**: Check dashboard weekly for trends

## 🎓 Learning Resources

- [Recharts Documentation](https://recharts.org/)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 📞 Support

For issues or questions:
1. Check test suite for examples
2. Review SQL migration file
3. Examine component source code
4. Consult full documentation

---

**Quick Tip:** Use the table view to export data or perform custom analysis!
