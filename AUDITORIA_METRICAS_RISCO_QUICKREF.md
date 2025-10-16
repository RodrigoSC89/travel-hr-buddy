# Auditoria Metricas Risco - Quick Reference

## 🚀 Quick Start

### Call the Function
```typescript
const { data, error } = await supabase.rpc('auditoria_metricas_risco');
```

### Response Structure
```typescript
{
  auditoria_id: string,    // UUID of the audit
  embarcacao: string,      // Vessel name
  mes: string,             // Month (YYYY-MM)
  falhas_criticas: number  // Count of critical failures
}[]
```

## 📊 Common Queries

### Get All Metrics
```typescript
const { data } = await supabase.rpc('auditoria_metricas_risco');
```

### Filter by Vessel
```typescript
const { data } = await supabase
  .rpc('auditoria_metricas_risco')
  .filter('embarcacao', 'eq', 'Navio A');
```

### Filter by Month
```typescript
const { data } = await supabase
  .rpc('auditoria_metricas_risco')
  .filter('mes', 'gte', '2025-01')
  .filter('mes', 'lte', '2025-12');
```

### Top Vessels by Critical Failures
```typescript
const { data } = await supabase.rpc('auditoria_metricas_risco');

const aggregated = data.reduce((acc, item) => {
  acc[item.embarcacao] = (acc[item.embarcacao] || 0) + item.falhas_criticas;
  return acc;
}, {});

const top5 = Object.entries(aggregated)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
```

## 🎨 Dashboard Integration

### Basic Display
```tsx
const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    supabase.rpc('auditoria_metricas_risco')
      .then(({ data }) => setMetrics(data || []));
  }, []);
  
  return (
    <div>
      {metrics.map(m => (
        <div key={m.auditoria_id}>
          {m.embarcacao}: {m.falhas_criticas} falhas em {m.mes}
        </div>
      ))}
    </div>
  );
};
```

### With Charts
```tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const MetricsChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    supabase.rpc('auditoria_metricas_risco').then(({ data }) => {
      const aggregated = data.reduce((acc, item) => {
        const existing = acc.find(i => i.embarcacao === item.embarcacao);
        if (existing) {
          existing.total += item.falhas_criticas;
        } else {
          acc.push({ embarcacao: item.embarcacao, total: item.falhas_criticas });
        }
        return acc;
      }, []);
      setData(aggregated);
    });
  }, []);
  
  return (
    <BarChart data={data}>
      <XAxis dataKey="embarcacao" />
      <YAxis />
      <Bar dataKey="total" fill="#0ea5e9" />
    </BarChart>
  );
};
```

## 📤 Export Functions

### Export to CSV
```typescript
const exportToCSV = async () => {
  const { data } = await supabase.rpc('auditoria_metricas_risco');
  
  const csv = [
    'Auditoria ID,Embarcação,Mês,Falhas Críticas',
    ...data.map(r => `${r.auditoria_id},${r.embarcacao},${r.mes},${r.falhas_criticas}`)
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'metricas-risco.csv';
  a.click();
};
```

### Export to JSON
```typescript
const exportToJSON = async () => {
  const { data } = await supabase.rpc('auditoria_metricas_risco');
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'metricas-risco.json';
  a.click();
};
```

## 📧 Scheduled Reports

### Daily Summary Email
```typescript
// Edge Function: send-daily-metrics-report
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data } = await supabase.rpc('auditoria_metricas_risco');
  
  // Send email with metrics
  await sendEmail({
    to: 'admin@company.com',
    subject: 'Daily Risk Metrics Report',
    html: generateReportHTML(data)
  });
  
  return new Response('Report sent', { status: 200 });
});
```

## 🔍 SQL Queries

### Direct SQL Call
```sql
SELECT * FROM auditoria_metricas_risco();
```

### With Aggregation
```sql
SELECT 
  embarcacao,
  SUM(falhas_criticas) as total_falhas,
  COUNT(*) as num_auditorias,
  AVG(falhas_criticas) as media_falhas
FROM auditoria_metricas_risco()
GROUP BY embarcacao
ORDER BY total_falhas DESC;
```

### Monthly Trend
```sql
SELECT 
  mes,
  SUM(falhas_criticas) as total_falhas_mes
FROM auditoria_metricas_risco()
GROUP BY mes
ORDER BY mes DESC;
```

## 📱 API Routes

### Next.js API Route
```typescript
// pages/api/metrics/risk.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase.rpc('auditoria_metricas_risco');
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  return res.status(200).json(data);
}
```

## 🧪 Testing

### Run Tests
```bash
npm run test -- src/tests/auditoria-metricas-risco.test.ts
```

### Check Coverage
```bash
npm run test:coverage
```

## 📚 Related Files

- **Migrations:**
  - `supabase/migrations/20251016194400_add_embarcacao_to_auditorias_imca.sql`
  - `supabase/migrations/20251016194500_create_auditoria_alertas.sql`
  - `supabase/migrations/20251016194600_create_auditoria_metricas_risco_function.sql`

- **Tests:**
  - `src/tests/auditoria-metricas-risco.test.ts`

- **Documentation:**
  - `AUDITORIA_METRICAS_RISCO_README.md`
  - `AUDITORIA_METRICAS_RISCO_VISUAL_SUMMARY.md`

## 🔗 Integration Points

- Dashboard: `/admin/metrics`
- API Endpoint: Can be created at `/api/metrics/risk`
- Scheduled Reports: Via Edge Functions or Cron Jobs
- Export: CSV, JSON, PDF

## ⚡ Performance Tips

1. Use indexes on `auditoria_id` and `created_at`
2. Filter results in application layer when possible
3. Cache results for read-heavy operations
4. Consider materialized views for large datasets

## 🛠️ Troubleshooting

### Function not found
```typescript
// Ensure migrations are run
// Check database for function existence
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'auditoria_metricas_risco';
```

### RLS blocking results
```typescript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// For admin access, ensure profile.role = 'admin'
```

### No data returned
```typescript
// Check if audits exist
const { data: audits } = await supabase
  .from('auditorias_imca')
  .select('*');
console.log('Audits:', audits);

// Check if alerts exist
const { data: alerts } = await supabase
  .from('auditoria_alertas')
  .select('*');
console.log('Alerts:', alerts);
```

## 📞 Support

- Check README: `AUDITORIA_METRICAS_RISCO_README.md`
- Run tests: `npm run test`
- Check migrations: Review SQL files in `supabase/migrations/`

---

**Quick Start Complete! 🎉**

For full documentation, see `AUDITORIA_METRICAS_RISCO_README.md`
