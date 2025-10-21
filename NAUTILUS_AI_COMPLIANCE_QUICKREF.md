# AI Compliance & Audit Engine - Quick Reference

## 🚀 Quick Commands

### View Dashboard
```
http://localhost:5173/control-hub
```

### Run Development Server
```bash
npm run dev
```

### Run Audit Programmatically
```typescript
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

const result = await runComplianceAudit([0.9, 0.85, 0.78, 0.92, 0.8]);
```

---

## 📁 File Locations

```
src/lib/compliance/ai-compliance-engine.ts           # Core engine
src/components/compliance/ComplianceDashboard.tsx    # UI component
src/pages/ControlHub.tsx                              # Integration
supabase/migrations/20251021175100_*.sql             # Database schema
```

---

## 🗄️ Database Queries

### Latest Audits
```sql
SELECT * FROM compliance_audit_logs 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Compliance Summary (24h)
```sql
SELECT level, COUNT(*) as count
FROM compliance_audit_logs 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY level;
```

### Average Score Trend
```sql
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(score) as avg_score,
  COUNT(*) as audits
FROM compliance_audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

---

## 🎯 Compliance Levels

| Level | Score | Indicator | Action |
|-------|-------|-----------|--------|
| Conforme | >85% | 🟢 | Continue monitoring |
| Risco | 65-85% | 🟡 | Review and improve |
| Não Conforme | <65% | 🔴 | Immediate action |

---

## 📊 Standards & Weights

| Standard | Weight | Description |
|----------|--------|-------------|
| IMCA_M103 | 8% | Marine Operations |
| IMCA_M109 | 6% | DP Vessel Design |
| IMCA_M117 | 10% | DP Operations |
| IMCA_M140 | 7% | DP FMEA |
| IMCA_M166 | 7% | DP Incident Reporting |
| IMCA_M190 | 5% | ASOG |
| IMCA_M206 | 6% | DP Annual Trials |
| IMCA_M216 | 8% | DP Operations Record |
| IMCA_M254 | 5% | DP Capability Plots |
| MSF_182 | 4% | Marine Safety Forum |
| IMO_GUIDE | 6% | IMO Guidelines |
| MTS_GUIDE | 6% | MTS Recommendations |
| ISM_CODE | 6% | International Safety Mgmt |
| ISPS_CODE | 8% | Ship/Port Security |
| NORMAM_101 | 8% | Brazilian Standards |

**Total:** 100%

---

## 🔌 MQTT Integration

### Subscribe to Alerts
```bash
# HiveMQ Public Broker
mosquitto_sub -h broker.hivemq.com -p 8884 \
  -t "nautilus/compliance/alerts" -v
```

### Alert Payload
```json
{
  "level": "Conforme",
  "score": 0.872
}
```

---

## ⚙️ Configuration

### Environment Variables
```env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

### ONNX Model Path
```
public/models/nautilus_compliance.onnx
```

---

## 🐛 Troubleshooting

### Issue: Dashboard shows "Carregando..."
**Solution:** Check ONNX model exists and console errors

### Issue: Database errors
**Solution:** Run migration: `supabase db push`

### Issue: MQTT not working
**Solution:** Verify `VITE_MQTT_URL` environment variable

---

## 📖 Full Documentation

- **Technical Guide:** `NAUTILUS_AI_COMPLIANCE_ENGINE_README.md`
- **Visual Summary:** `NAUTILUS_AI_COMPLIANCE_VISUAL_SUMMARY.md`

---

## ✅ Implementation Checklist

- [x] Compliance engine created
- [x] Dashboard component created
- [x] ControlHub integration
- [x] Database migration created
- [x] Documentation complete
- [ ] ONNX model deployed
- [ ] Supabase migration applied
- [ ] Manual testing
- [ ] Production deployment

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0  
**Patch:** #17
