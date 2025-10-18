# Live Compliance Module - Quick Reference

## 🚀 Quick Start

### Access Dashboard
```
URL: /admin/live-compliance
```

### Check Compliance Score
```typescript
import { calculateComplianceScore } from '@/services/compliance-engine';
const score = await calculateComplianceScore();
console.log(`Score: ${score.score}/100`);
```

### Process Non-Conformity Manually
```typescript
import { processNonConformity } from '@/services/compliance-engine';

await processNonConformity({
  source_type: 'incident',
  description: 'Your incident description',
  severity: 'high',
  vessel_id: 'vessel-id',
  crew_id: 'crew-id'
});
```

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `compliance_non_conformities` | Detected issues |
| `compliance_corrective_actions` | Action plans |
| `compliance_evidence` | Audit trail |
| `compliance_training_assignments` | Training links |
| `compliance_score_history` | Score tracking |

## 🔄 Automation

**Cron Schedule:** Daily at 5:00 AM UTC (2:00 AM BRT)

**What it does:**
1. Scans new incidents (last 24h)
2. Matches to norms (AI)
3. Creates actions
4. Assigns trainings
5. Stores evidence

## 🎯 Key Functions

### `processNonConformity(log)`
Main workflow orchestrator
```typescript
Returns: {
  success: boolean,
  non_conformity_id?: string,
  actions_created?: number,
  trainings_assigned?: number,
  evidence_stored?: number
}
```

### `matchLogToNorm(log)`
AI norm matching
```typescript
Returns: {
  norm_type: string,      // 'IMCA', 'ISO', 'ANP', etc.
  norm_reference: string, // 'IMCA M 103'
  norm_clause?: string,   // 'Section 4.2'
  description?: string
}
```

### `generateCorrectivePlanFromGap(description, norm)`
AI action plan generation
```typescript
Returns: {
  title: string,
  description: string,
  action_type: 'immediate' | 'corrective' | 'preventive' | 'training',
  priority: 'critical' | 'high' | 'medium' | 'low',
  planned_completion_days: number
}
```

### `calculateComplianceScore(orgId?, vesselId?)`
Score calculation (0-100)
```typescript
Returns: {
  score: number,
  breakdown: {
    total_non_conformities: number,
    total_conformities: number,
    open_actions: number,
    closed_actions: number,
    overdue_actions: number
  }
}
```

### `generateComplianceStatusExplanation(orgId?, vesselId?)`
AI status report
```typescript
Returns: {
  overall_status: string,
  critical_items: string[],
  items_in_correction: string[],
  human_actions_needed: string[],
  summary: string
}
```

## 🎨 Dashboard Features

### Main Views

1. **Score Card**
   - Real-time score (0-100)
   - Color-coded (Green ≥90, Yellow 70-89, Red <70)
   - Breakdown metrics

2. **AI Status**
   - Overall status
   - Critical items
   - Auto-corrections
   - Human actions

3. **Timeline**
   - Chronological non-conformities
   - Severity/status badges
   - Norm references

4. **Evidence by Norm**
   - Grouped by regulation
   - Verification status
   - Upload timestamps

5. **Trainings by Vessel**
   - Training assignments
   - Certificate status
   - Due dates

6. **Corrective Actions**
   - All actions
   - Priority/status
   - Completion dates

## 🔐 Security

- RLS enabled on all tables
- Authenticated users can view/insert
- Service role for cron automation
- Admin users have elevated access

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Score shows 0 | Check if non-conformities exist in DB |
| AI not matching | Verify `VITE_OPENAI_API_KEY` is set |
| Cron not running | Check Supabase Edge Functions deployed |
| Training not assigned | Verify crew_member_id exists |

## 📋 Severity Levels

- **Critical**: Immediate danger, requires urgent action
- **High**: Significant risk, priority action needed
- **Medium**: Moderate risk, scheduled action
- **Low**: Minor issue, routine correction

## 🎯 Status Workflow

```
detected → analyzing → action_planned → in_progress → resolved → closed
```

## 🔄 Action Types

- **Immediate**: Fix right now
- **Corrective**: Fix the current issue
- **Preventive**: Prevent future occurrences
- **Training**: Education needed

## 📊 Score Calculation

```
Base = 100
If non-conformities:
  Score = (Resolved / Total) × 100
  Penalty = (Overdue / Open) × 20
  Final = Score - Penalty
```

## 🎓 Training Workflow

```
Non-Conformity → Find Related Training → Assign to Crew → 
Complete → Quiz → Certificate → HR Dossier → Evidence
```

## 📅 Cron Configuration

File: `supabase/functions/cron.yaml`
```yaml
run-compliance-engine:
  schedule: '0 5 * * *'
  endpoint: '/run-compliance-engine'
  method: POST
```

## 🌐 API Endpoints

**Edge Function:**
```
POST /run-compliance-engine
Response: {
  success: boolean,
  stats: {
    incidents_scanned: number,
    safety_incidents_scanned: number,
    total_processed: number,
    successful: number,
    failed: number
  }
}
```

## 📦 Dependencies

- **OpenAI**: `gpt-4o-mini` model
- **Supabase**: Database + Edge Functions
- **React**: Dashboard UI
- **Shadcn/ui**: UI components

## 🔗 Integration Points

| System | Table | Integration |
|--------|-------|-------------|
| DP Incidents | `dp_incidents` | Auto-scan new incidents |
| Safety | `safety_incidents` | SGSO compliance |
| Training | `sgso_training_records` | Assignment |
| Crew | `crew_members` | Training targets |
| Audits | `auditorias_imca` | Evidence links |

## 📝 Quick Commands

### Deploy Supabase Function
```bash
supabase functions deploy run-compliance-engine
```

### Test Locally
```bash
supabase functions serve run-compliance-engine
curl -X POST http://localhost:54321/functions/v1/run-compliance-engine
```

### Check Logs
```sql
SELECT * FROM cron_execution_logs 
WHERE job_name = 'run-compliance-engine' 
ORDER BY created_at DESC 
LIMIT 10;
```

### View Recent Non-Conformities
```sql
SELECT * FROM compliance_non_conformities 
ORDER BY detected_at DESC 
LIMIT 20;
```

### Check Compliance Score
```sql
SELECT * FROM compliance_score_history 
ORDER BY recorded_at DESC 
LIMIT 1;
```

## 🎯 Success Metrics

- **Response Time**: < 2s for dashboard load
- **Automation Rate**: > 80% auto-processed
- **Score Accuracy**: ±5% variance
- **Evidence Coverage**: 100% for closed actions

## 📞 Support

**Module Code:** ETAPA 33  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

For issues or questions:
1. Check troubleshooting section
2. Review logs in `cron_execution_logs`
3. Verify environment variables
4. Check database RLS policies

---

**Last Updated:** October 18, 2025
