# Auditoria Métricas Risco - Quick Reference

## 🚀 Quick Start

### Database Setup
The migration is automatically applied with file:
```
supabase/migrations/20251016194700_create_auditoria_metricas_risco.sql
```

### API Endpoints

#### 1. Get SGSO Risk Data
```bash
GET /api/admin/sgso
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_embarcacoes": 10,
    "embarcacoes_alto_risco": 3,
    "total_falhas_criticas": 45
  },
  "risco_operacional": [...]
}
```

#### 2. Export Metrics (CSV/PDF)
```bash
GET https://[project].supabase.co/functions/v1/exportar-metricas
```

**Response:**
```json
{
  "success": true,
  "csv": "...",
  "html": "...",
  "data": [...]
}
```

#### 3. Send Monthly Report
```bash
POST https://[project].supabase.co/functions/v1/send-auditoria-report
Content-Type: application/json

{
  "recipients": ["compliance@empresa.com"]
}
```

## 📊 Database Schema

### Tables
- **auditorias_imca**: Added `embarcacao TEXT` field
- **auditoria_alertas**: New table for critical alerts

### RPC Function
```sql
SELECT * FROM auditoria_metricas_risco();
```

Returns:
- `auditoria_id` (UUID)
- `embarcacao` (TEXT)
- `mes` (TEXT: 'YYYY-MM')
- `falhas_criticas` (BIGINT)

## 🎯 Risk Levels

| Level | Avg Failures/Month |
|-------|-------------------|
| Baixo | < 1 |
| Médio | 1-3 |
| Alto | 3-5 |
| Crítico | > 5 |

## ⏰ Automation

### Cron Schedule
- **Frequency:** Monthly (day 01)
- **Time:** 09:00 UTC (06:00 BRT)
- **Config:** `supabase/functions/cron.yaml`

```yaml
send-auditoria-report:
  schedule: '0 9 1 * *'
  endpoint: '/send-auditoria-report'
  method: POST
```

## 🔐 Security

### RLS Policies
- Users see only their own audit alerts
- Admins have full access to all alerts
- Service role key required for Edge Functions

## 📧 Email Report

### Content Includes
1. Executive summary with key metrics
2. High-risk vessel alerts (>3 failures/month)
3. Top 10 recent audits table
4. Link to interactive dashboard
5. CSV attachment with full data

### Recipients
Default: `compliance@nautilus.system`, `seguranca@nautilus.system`

Can be customized via API call body

## 🧪 Testing

### Run Tests
```bash
npm test -- src/tests/admin-sgso-api.test.ts
```

### Manual Testing
```bash
# Test RPC function
psql -c "SELECT * FROM auditoria_metricas_risco();"

# Test SGSO API
curl http://localhost:3000/api/admin/sgso

# Test export function
curl https://[project].supabase.co/functions/v1/exportar-metricas

# Test email (manual trigger)
curl -X POST https://[project].supabase.co/functions/v1/send-auditoria-report \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["test@example.com"]}'
```

## 🔧 Environment Variables

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
APP_URL=https://app.nautilus.system
EMAIL_FROM=noreply@nautilus.system
```

## 📁 File Structure

```
/supabase
  /migrations
    └── 20251016194700_create_auditoria_metricas_risco.sql
  /functions
    /exportar-metricas
      └── index.ts
    /send-auditoria-report
      └── index.ts
    └── cron.yaml

/pages/api
  /admin
    └── sgso.ts

/src/tests
  └── admin-sgso-api.test.ts

/AUDITORIA_METRICAS_RISCO_README.md
```

## 💡 Usage Examples

### Frontend Integration

#### Display SGSO Risk Map
```typescript
const { data } = await fetch('/api/admin/sgso').then(r => r.json());

// Render risk map
data.risco_operacional.forEach(vessel => {
  if (vessel.nivel_risco === 'critico') {
    // Highlight critical vessels in red
  }
});
```

#### Export Report
```typescript
const response = await fetch(
  'https://[project].supabase.co/functions/v1/exportar-metricas'
);
const { csv } = await response.json();

// Download CSV
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'metricas-risco.csv';
a.click();
```

#### Trigger Manual Email
```typescript
await fetch(
  'https://[project].supabase.co/functions/v1/send-auditoria-report',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipients: ['compliance@empresa.com']
    })
  }
);
```

## 🎨 Integration with SGSO Panel

### Data Structure for Risk Mapping
```typescript
interface RiscoOperacionalEmbarcacao {
  embarcacao: string;
  total_falhas_criticas: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
  ultimas_auditorias: number;
  meses_com_alertas: string[];
}
```

### Visual Indicators
- 🟢 **Baixo**: Green indicator
- 🟡 **Médio**: Yellow indicator  
- 🟠 **Alto**: Orange indicator (highlight)
- 🔴 **Crítico**: Red indicator (urgent action required)

## 📈 Metrics Tracked

- Total audits by vessel and month
- Critical failures count per vessel
- Average failures per month
- High-risk vessel identification (>3 alerts/month)
- Monthly trend analysis

## ✅ Implementation Checklist

- [x] Database migration with tables and RPC function
- [x] Edge Function for CSV/PDF export
- [x] Admin API for SGSO integration
- [x] Edge Function for automated emails
- [x] Cron job configuration
- [x] Comprehensive tests
- [x] Documentation (README + QuickRef)
- [ ] Frontend dashboard integration (future)
- [ ] Push notifications for critical alerts (future)

## 🐛 Troubleshooting

### Common Issues

**Email not sending:**
- Check `RESEND_API_KEY` is configured
- Verify recipients are valid email addresses
- Check Supabase logs for error details

**RPC function not found:**
- Ensure migration has been applied
- Check `SUPABASE_SERVICE_ROLE_KEY` permissions

**No data returned:**
- Verify `auditoria_alertas` table has records
- Check `embarcacao` field is populated in auditorias_imca

## 📚 Related Documentation

- [Full README](./AUDITORIA_METRICAS_RISCO_README.md)
- [SGSO System](./supabase/migrations/20251007000001_sgso_system_complete.sql)
- [Auditorias IMCA RLS](./supabase/migrations/20251016154800_create_auditorias_imca_rls.sql)
