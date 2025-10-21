# AI Incident Response & Resilience Integration - Quick Reference

## 📋 Summary
Patch 18 adds automated incident detection and response to Nautilus One Control Hub.

## 🎯 Key Features
- ✅ Automated incident detection via AI Compliance Engine
- ✅ Real-time incident reporting (Supabase + MQTT)
- ✅ Visual incident dashboard in Control Hub
- ✅ Compliance auditing (ISM, ISPS, ASOG, FMEA)
- ✅ AI-generated remediation recommendations

## 📁 Files Created
```
src/
├── lib/
│   ├── compliance/
│   │   └── ai-compliance-engine.ts          (Compliance auditing)
│   └── incidents/
│       └── ai-incident-response.ts          (Incident handling)
└── components/
    └── resilience/
        ├── IncidentResponsePanel.tsx        (UI: Incident list)
        ├── ResilienceMonitor.tsx            (UI: System status)
        └── ComplianceDashboard.tsx          (UI: Compliance metrics)
```

## 📝 Files Modified
```
src/pages/ControlHub.tsx                     (Added 3 new components)
```

## 🗄️ Database Requirements
```sql
-- Create incident_reports table in Supabase
create table incident_reports (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null,
  type text,
  description text,
  level text,
  score float,
  recommendation text
);
```

## 🔧 Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MQTT_URL=wss://broker.emqx.io:8084/mqtt  # Optional
```

## 💻 Usage

### Report an Incident
```typescript
import { handleIncident } from "@/lib/incidents/ai-incident-response";

await handleIncident({
  type: "DP Loss",
  description: "GPS reference lost",
  data: { dpLoss: true }
});
```

### Run Compliance Audit
```typescript
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

const result = await runComplianceAudit({
  dpLoss: true,
  sensorMisalignment: false
});
// Returns: { complianceLevel, score, issues, recommendations }
```

## 🎨 UI Components

### Control Hub Layout
```
┌────────────────────────────────────────┐
│      Control Hub - Observability       │
├──────────────────┬─────────────────────┤
│ ControlHubPanel  │   SystemAlerts      │
├──────────────────┼─────────────────────┤
│ ResilienceMonitor│ ComplianceDashboard │
├──────────────────┴─────────────────────┤
│      IncidentResponsePanel             │
├────────────────────────────────────────┤
│         AIInsightReporter              │
└────────────────────────────────────────┘
```

### Incident Panel Features
- 🔴 Red: "Não Conforme" (Critical)
- 🟡 Yellow: "Risco" (Warning)
- 🟢 Green: "Conforme" (OK)
- 📊 Real-time compliance score
- 💡 AI recommendations

## 🔄 Real-time Updates

### Supabase Subscription
```typescript
// Automatic in IncidentResponsePanel
supabase
  .channel("incident_watch")
  .on("postgres_changes", { 
    event: "INSERT", 
    table: "incident_reports" 
  }, callback)
  .subscribe();
```

### MQTT Publishing
```typescript
// Automatic in handleIncident()
Topic: "nautilus/incidents/alert"
Payload: JSON incident report
```

## 📊 Compliance Levels

| Level | Score Range | Color | Action |
|-------|-------------|-------|--------|
| Conforme | 0.8 - 1.0 | 🟢 Green | Monitor |
| Risco | 0.5 - 0.79 | 🟡 Yellow | Review |
| Não Conforme | 0.0 - 0.49 | 🔴 Red | Immediate |

## 🔍 Detected Incidents

- **DP Loss**: Dynamic positioning system failures
- **Sensor Misalignment**: Calibration issues
- **ISM Non-Compliance**: Safety management violations
- **ISPS Non-Compliance**: Security protocol violations
- **ASOG Deviation**: Operational guide deviations
- **FMEA Deviation**: Failure analysis discrepancies

## 🧪 Testing

### Build Test
```bash
npm run build
```

### Type Check
```bash
npx tsc --noEmit
```

### Manual Test
1. Navigate to `/control-hub`
2. Verify 3 new panels appear
3. Test incident creation (see Usage above)
4. Confirm real-time updates

## 🚀 Next Steps

1. ✅ Create `incident_reports` table in Supabase
2. ✅ Configure environment variables
3. ✅ Deploy application
4. ✅ Test incident reporting
5. ✅ Configure MQTT broker (optional)
6. ✅ Set up monitoring and alerts

## 📚 Documentation

- 📖 [Implementation Guide](./AI_INCIDENT_RESPONSE_IMPLEMENTATION_GUIDE.md)
- 🗄️ [Database Schema](./AI_INCIDENT_RESPONSE_DATABASE_SCHEMA.md)

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint
```

## 🐛 Common Issues

**Issue**: Incidents not appearing
**Fix**: Check Supabase table exists and RLS policies

**Issue**: MQTT not working
**Fix**: Verify VITE_MQTT_URL is set (or skip - it's optional)

**Issue**: Build errors
**Fix**: Run `npm install` and check for unrelated pre-existing errors

## 📞 Support

- Check documentation files
- Review code comments
- Check repository issues

---

**Version**: 1.3.0 (Patch 18)  
**Status**: ✅ Ready for deployment
