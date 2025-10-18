# Live Compliance Module - Quick Reference

## 🚀 Quick Start

### Access Dashboard
```
URL: /admin/live-compliance
Auth: Requires authenticated admin user
```

### Process Single Incident (TypeScript)
```typescript
import { processNonConformity } from '@/services/compliance-engine';

const result = await processNonConformity({
  vessel_id: 'vessel-uuid',
  description: 'DP system power loss during operations',
  source_type: 'dp_incident',
  source_id: 'incident-uuid',
  severity: 'high',
  crew_id: 'user-uuid'
});

console.log(result);
// { success: true, non_conformity_id: 'uuid' }
```

### Calculate Compliance Score
```typescript
import { calculateComplianceScore } from '@/services/compliance-engine';

// Overall score
const overallScore = await calculateComplianceScore();

// Vessel-specific score
const vesselScore = await calculateComplianceScore('vessel-uuid');

console.log(vesselScore);
// {
//   score: 87.5,
//   total_non_conformities: 10,
//   open_non_conformities: 2,
//   resolved_non_conformities: 8,
//   automation_rate: 90.0
// }
```

### Get AI Status Explanation
```typescript
import { getComplianceStatusExplanation } from '@/services/compliance-engine';

const status = await getComplianceStatusExplanation();
console.log(status);
// "Compliance status is Good with 87.5/100 score..."
```

## 📊 Database Queries

### View All Non-Conformities
```sql
SELECT 
  nc.id,
  nc.description,
  nc.severity,
  nc.norm_type,
  nc.norm_clause,
  nc.status,
  nc.detected_at,
  v.name as vessel_name
FROM compliance_non_conformities nc
LEFT JOIN vessels v ON nc.vessel_id = v.id
ORDER BY nc.detected_at DESC;
```

### View Corrective Actions with Status
```sql
SELECT 
  ca.action_title,
  ca.priority,
  ca.status,
  ca.deadline,
  ca.responsible_role,
  ca.ai_generated,
  nc.description as non_conformity
FROM compliance_corrective_actions ca
JOIN compliance_non_conformities nc ON ca.non_conformity_id = nc.id
WHERE ca.status != 'completed'
ORDER BY ca.deadline ASC;
```

### Count by Severity
```sql
SELECT 
  severity,
  COUNT(*) as count
FROM compliance_non_conformities
WHERE status = 'open'
GROUP BY severity
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

### Evidence by Norm Type
```sql
SELECT 
  norm_type,
  norm_clause,
  COUNT(*) as evidence_count,
  COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_count
FROM compliance_evidence
GROUP BY norm_type, norm_clause
ORDER BY norm_type, norm_clause;
```

### Training Completion Rate
```sql
SELECT 
  v.name as vessel_name,
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN ta.status = 'completed' THEN 1 END) as completed,
  ROUND(
    COUNT(CASE WHEN ta.status = 'completed' THEN 1 END)::NUMERIC / 
    COUNT(*)::NUMERIC * 100, 
    2
  ) as completion_rate
FROM compliance_training_assignments ta
JOIN vessels v ON ta.vessel_id = v.id
GROUP BY v.id, v.name
ORDER BY completion_rate DESC;
```

### Overdue Actions
```sql
SELECT 
  ca.action_title,
  ca.deadline,
  ca.responsible_role,
  nc.description,
  nc.severity,
  EXTRACT(DAY FROM NOW() - ca.deadline) as days_overdue
FROM compliance_corrective_actions ca
JOIN compliance_non_conformities nc ON ca.non_conformity_id = nc.id
WHERE ca.status != 'completed'
  AND ca.deadline < NOW()
ORDER BY ca.deadline ASC;
```

### Compliance Score History (Last 30 Days)
```sql
SELECT 
  calculated_at::DATE as date,
  AVG(score) as avg_score,
  SUM(total_non_conformities) as total_nc,
  SUM(resolved_non_conformities) as resolved_nc,
  AVG(automation_rate) as avg_automation
FROM compliance_score_history
WHERE calculated_at >= NOW() - INTERVAL '30 days'
GROUP BY calculated_at::DATE
ORDER BY date DESC;
```

## 🔧 API Endpoints (Edge Functions)

### Trigger Compliance Engine Manually
```bash
curl -X POST https://your-project.supabase.co/functions/v1/run-compliance-engine \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "message": "Processed 5 items: 4 successful, 1 failed",
  "summary": {
    "execution_time": "2025-10-18T05:00:00Z",
    "total_processed": 5,
    "successful": 4,
    "failed": 1,
    "automation_rate": 80.0,
    "results": [...]
  }
}
```

## 📝 Common Tasks

### Create Manual Non-Conformity
```sql
INSERT INTO compliance_non_conformities (
  vessel_id,
  source_type,
  description,
  severity,
  norm_type,
  norm_clause,
  status
) VALUES (
  'vessel-uuid',
  'manual_report',
  'Fire extinguisher inspection overdue',
  'medium',
  'IMO',
  'SOLAS Chapter II-2 Reg 10',
  'open'
);
```

### Update Corrective Action Status
```sql
UPDATE compliance_corrective_actions
SET 
  status = 'completed',
  completed_at = NOW(),
  completion_notes = 'All fire extinguishers inspected and certified'
WHERE id = 'action-uuid';
```

### Mark Non-Conformity as Resolved
```sql
UPDATE compliance_non_conformities
SET 
  status = 'resolved',
  resolved_at = NOW()
WHERE id = 'nc-uuid';
```

### Assign Training to Crew
```sql
INSERT INTO compliance_training_assignments (
  non_conformity_id,
  training_module_id,
  crew_member_id,
  vessel_id,
  assigned_reason,
  priority,
  due_date,
  status
) VALUES (
  'nc-uuid',
  'training-uuid',
  'user-uuid',
  'vessel-uuid',
  'Reactive training for safety compliance',
  'high',
  NOW() + INTERVAL '14 days',
  'assigned'
);
```

### Add Evidence Document
```sql
INSERT INTO compliance_evidence (
  non_conformity_id,
  evidence_type,
  title,
  description,
  file_url,
  norm_type,
  norm_clause,
  verification_status
) VALUES (
  'nc-uuid',
  'document',
  'DP System Inspection Report',
  'Complete inspection report after power loss incident',
  'https://storage.example.com/reports/dp-inspection-2025.pdf',
  'IMCA',
  'M103 Section 4.2',
  'pending'
);
```

## 🎯 Severity Guidelines

### Critical
- Life-threatening situations
- Total system failures
- Immediate regulatory violations
- **Examples**: DP total blackout, fire, man overboard

### High
- Serious safety risks
- Major equipment failures
- Significant regulatory non-compliance
- **Examples**: DP redundancy loss, collision risk, major oil spill

### Medium
- Moderate safety concerns
- Equipment degradation
- Minor regulatory gaps
- **Examples**: Single sensor failure, delayed inspections, documentation gaps

### Low
- Minor issues
- Preventive maintenance items
- Administrative compliance
- **Examples**: Expired certificates, minor wear, routine updates

## 🔄 Workflow Status Transitions

### Non-Conformity Status Flow
```
open → in_progress → resolved
       ↓
   false_positive
```

### Corrective Action Status Flow
```
planned → in_progress → completed
          ↓
       overdue (auto-calculated based on deadline)
          ↓
       cancelled
```

### Training Assignment Status Flow
```
assigned → in_progress → completed
           ↓
        overdue (auto-calculated based on due_date)
           ↓
        cancelled
```

### Evidence Verification Flow
```
pending → verified
         ↓
      rejected
```

## 📊 Key Performance Indicators (KPIs)

### Compliance Score Formula
```
Base Score: 100
- Deduct 5 points per open non-conformity
- Deduct 10 points per overdue action
+ Bonus: Resolution rate (resolved / total × 100)
Final Score: Max(0, Min(100, calculated_score))
```

### Automation Rate
```
Automation Rate = (AI-generated actions / Total actions) × 100
Target: 80%+
```

### Response Time
```
Average Time to Process: 5-10 seconds per incident
Target: < 15 seconds
```

### Resolution Rate
```
Resolution Rate = (Resolved non-conformities / Total non-conformities) × 100
Target: 90%+
```

## 🛠️ Troubleshooting Commands

### Check Edge Function Logs
```bash
supabase functions logs run-compliance-engine --tail
```

### Test Database Connection
```sql
SELECT 
  COUNT(*) as total_non_conformities,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_items
FROM compliance_non_conformities;
```

### Verify RLS Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename LIKE 'compliance%';
```

### Check AI Processing Success Rate
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END) as ai_processed,
  ROUND(
    COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END)::NUMERIC / 
    COUNT(*)::NUMERIC * 100,
    2
  ) as ai_success_rate
FROM compliance_non_conformities
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 📚 Environment Variables

### Required for Client (`.env`)
```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Required for Edge Function (Supabase Secrets)
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🔗 Related Resources

- **Main Documentation**: `LIVE_COMPLIANCE_MODULE_README.md`
- **Visual Summary**: `LIVE_COMPLIANCE_VISUAL_SUMMARY.md`
- **Completion Report**: `ETAPA_33_COMPLETION_SUMMARY.md`
- **Dashboard**: `/admin/live-compliance`
- **Cron Config**: `supabase/functions/cron.yaml`
- **Service**: `src/services/compliance-engine.ts`
- **Edge Function**: `supabase/functions/run-compliance-engine/index.ts`
- **Migration**: `supabase/migrations/20251018174000_create_compliance_tables.sql`

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Dashboard blank | Check RLS policies, verify user permissions |
| AI not matching | Verify OpenAI API key, check confidence threshold |
| Cron not running | Check function deployment, review logs |
| Score not updating | Recalculate manually, check data in tables |
| Training not assigned | Verify training_modules table has data |

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0  
**Module**: ETAPA 33 - Live Compliance
