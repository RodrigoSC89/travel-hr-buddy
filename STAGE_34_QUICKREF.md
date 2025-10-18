# Stage 34 - Quick Reference Guide

## 🚀 Quick Start

### Access Dashboard
```
URL: /admin/risk-audit
```

### Generate Risk Predictions
1. Navigate to "Riscos Táticos" tab
2. Select vessel (or "All vessels")
3. Click "Gerar Previsões"
4. Wait for AI analysis (~5 seconds)

### Simulate Audit
1. Navigate to "Simulador de Auditoria" tab
2. Select vessel and audit type
3. Click "Simular Auditoria"
4. Review results

## 📊 Database Tables

### tactical_risks
```sql
-- Key columns
vessel_id: UUID
system: TEXT (DP, Energia, SGSO, Comunicações, etc.)
predicted_risk: TEXT (Failure, Intermittency, Delay, etc.)
risk_score: INTEGER (0-100)
risk_level: TEXT (Critical, High, Medium, Low) -- auto-generated
status: TEXT (pending, in_progress, resolved, dismissed)
valid_until: TIMESTAMP (default: now + 15 days)
```

### audit_predictions
```sql
-- Key columns
vessel_id: UUID
audit_type: TEXT (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)
expected_score: INTEGER (0-100)
probability: TEXT (Alta, Média, Baixa)
weaknesses: TEXT[] (array of weakness descriptions)
recommendations: TEXT[] (array of action items)
valid_until: TIMESTAMP (default: now + 30 days)
```

## 🔌 API Endpoints

### POST /api/ai/forecast-risks
```json
// Request
{
  "vessel_id": "uuid",     // optional
  "all_vessels": true      // process all
}

// Response
{
  "success": true,
  "results": [...]
}
```

### POST /api/audit/score-predict
```json
// Request
{
  "vessel_id": "uuid",
  "audit_type": "IMCA"     // IMCA, SGSO, ISM, ISO, Petrobras, IBAMA
}

// Response
{
  "success": true,
  "prediction": {
    "expected_score": 75,
    "probability": "Média",
    "weaknesses": [...],
    "recommendations": [...]
  }
}
```

## 🔄 Cron Jobs

### forecast-risks-cron
- **Schedule:** Daily at 06:00 UTC (03:00 BRT)
- **Function:** Generates risk predictions for all active vessels
- **Location:** `supabase/functions/forecast-risks-cron/`

## 🎨 Frontend Components

### TacticalRiskPanel
- **Path:** `src/components/admin/risk-audit/TacticalRiskPanel.tsx`
- **Purpose:** Display and manage tactical risks
- **Features:** Risk cards, filtering, on-demand generation

### AuditSimulator
- **Path:** `src/components/admin/risk-audit/AuditSimulator.tsx`
- **Purpose:** Simulate audit outcomes
- **Features:** Vessel/type selection, score display, recommendations

### RecommendedActions
- **Path:** `src/components/admin/risk-audit/RecommendedActions.tsx`
- **Purpose:** Manage actions from risks and audits
- **Features:** User assignment, status tracking, prioritization

### NormativeScores
- **Path:** `src/components/admin/risk-audit/NormativeScores.tsx`
- **Purpose:** Display compliance scores by standard
- **Features:** Progress bars, probability distribution, overall summary

## 🔒 Security

- **RLS Enabled:** All tables have Row Level Security
- **Auth Required:** Only authenticated users can access
- **Service Role:** Backend operations use service role key

## ⚡ Performance Metrics

- **AI Response:** <5s
- **Fallback Response:** <1s
- **Query Time:** <100ms
- **Supported Vessels:** 100+

## 🔧 Environment Variables

```bash
OPENAI_API_KEY=sk-...                # Required for AI features
NEXT_PUBLIC_SUPABASE_URL=https://... # Required
SUPABASE_SERVICE_ROLE_KEY=...        # Required for backend
```

## 📝 Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 80-100 | Critical | Immediate action required |
| 60-79 | High | Action required within 48h |
| 30-59 | Medium | Schedule action within 7 days |
| 0-29 | Low | Monitor |

## 🎯 Audit Probability

| Probability | Score Range | Meaning |
|------------|-------------|---------|
| Alta | 75-100 | High chance of passing |
| Média | 50-74 | Moderate chance |
| Baixa | 0-49 | Low chance, action needed |

## 🛠️ Common Commands

### Deploy Edge Function
```bash
supabase functions deploy forecast-risks-cron
```

### Test API Locally
```bash
# Risk forecast
curl -X POST http://localhost:3000/api/ai/forecast-risks \
  -H "Content-Type: application/json" \
  -d '{"all_vessels": true}'

# Audit prediction
curl -X POST http://localhost:3000/api/audit/score-predict \
  -H "Content-Type: application/json" \
  -d '{"vessel_id": "uuid", "audit_type": "IMCA"}'
```

### Query Database
```sql
-- Get all pending risks
SELECT * FROM tactical_risks 
WHERE status = 'pending' 
AND valid_until > NOW();

-- Get latest audit predictions
SELECT * FROM get_latest_audit_predictions();

-- Get vessel risk summary
SELECT * FROM get_vessel_risk_summary();
```

## 🐛 Troubleshooting

### No risks appearing?
- Check if vessels have operational data (dp_incidents, sgso_practices)
- Verify vessels are marked as "active"
- Ensure data exists within 60-day window

### AI not working?
- Verify OPENAI_API_KEY is set
- System automatically uses fallback logic
- Check API key balance/limits

### Cron not running?
- Check Edge Function deployment
- Verify cron.yaml configuration
- Check Supabase logs

## 📞 Quick Links

- **Dashboard:** `/admin/risk-audit`
- **API Tester:** `/admin/api-tester`
- **Supabase:** Dashboard → Edge Functions
- **Full Guide:** `STAGE_34_IMPLEMENTATION_GUIDE.md`

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-18
