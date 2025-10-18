# Live Compliance Module - Quick Reference

## 🚀 Quick Start

### Access Dashboard
```
Navigate to: /admin/live-compliance
```

### Trigger Manual Processing
```typescript
import { processIncidentForCompliance } from '@/services/compliance-engine';

await processIncidentForCompliance({
  source_type: 'dp_incident',
  source_id: 'incident-uuid',
  vessel_id: 'vessel-uuid',
  vessel_name: 'Vessel Name',
  description: 'Detailed incident description',
  severity: 'high'
}, tenantId);
```

### Check Compliance Score
```typescript
import { calculateComplianceScore } from '@/services/compliance-engine';

const score = await calculateComplianceScore(tenantId);
console.log(`Compliance Score: ${score.score}/100`);
```

## 📊 Database Queries

### Get Recent Non-Conformities
```sql
SELECT * FROM compliance_non_conformities
WHERE tenant_id = 'your-tenant-id'
ORDER BY detected_at DESC
LIMIT 20;
```

### Get Overdue Actions
```sql
SELECT * FROM compliance_corrective_actions
WHERE tenant_id = 'your-tenant-id'
  AND status != 'completed'
  AND due_date < NOW()
ORDER BY due_date ASC;
```

### Get Score History
```sql
SELECT * FROM compliance_score_history
WHERE tenant_id = 'your-tenant-id'
ORDER BY calculated_at DESC
LIMIT 30;
```

### Get Training Assignments by Vessel
```sql
SELECT * FROM compliance_training_assignments
WHERE tenant_id = 'your-tenant-id'
  AND vessel_id = 'vessel-uuid'
  AND status IN ('assigned', 'in_progress')
ORDER BY due_date ASC;
```

### Get Evidence by Norm Type
```sql
SELECT 
  norm_reference,
  COUNT(*) as evidence_count,
  ARRAY_AGG(title) as evidence_titles
FROM compliance_evidence
WHERE tenant_id = 'your-tenant-id'
GROUP BY norm_reference
ORDER BY evidence_count DESC;
```

## 🔧 Common Operations

### Mark Non-Conformity as Resolved
```typescript
await supabase
  .from('compliance_non_conformities')
  .update({
    status: 'resolved',
    resolved_at: new Date().toISOString(),
    resolution_notes: 'Issue resolved by...'
  })
  .eq('id', nonConformityId);
```

### Complete Corrective Action
```typescript
await supabase
  .from('compliance_corrective_actions')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    completion_notes: 'Action completed...',
    actual_hours: 3.5
  })
  .eq('id', actionId);
```

### Complete Training Assignment
```typescript
await supabase
  .from('compliance_training_assignments')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    certificate_id: 'cert-uuid',
    certificate_issued_at: new Date().toISOString(),
    score: 95
  })
  .eq('id', trainingId);
```

### Add Evidence
```typescript
await supabase
  .from('compliance_evidence')
  .insert({
    non_conformity_id: 'nc-uuid',
    evidence_type: 'document',
    title: 'Corrective Action Report',
    description: 'Detailed report of actions taken',
    file_url: 'https://...',
    norm_reference: 'IMCA M 103 Rev. 2 - Section 4.2.1',
    tenant_id: tenantId
  });
```

## ⚙️ Environment Variables

### Client-side (.env)
```env
VITE_OPENAI_API_KEY=sk-...
```

### Edge Function (Supabase Secrets)
```bash
# Set secrets via Supabase CLI
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

## 🕐 Cron Schedule

Current schedule in `supabase/functions/cron.yaml`:
```yaml
run-compliance-engine:
  schedule: '0 5 * * *'  # 5:00 AM UTC daily
  endpoint: '/run-compliance-engine'
  method: GET
```

Change schedule format: `minute hour day month weekday`

Examples:
- `0 5 * * *` - Daily at 5:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 9 1 * *` - Monthly on 1st at 9:00 AM

## 🔍 Debugging

### Check Edge Function Logs
```bash
supabase functions logs run-compliance-engine --tail
```

### Test Edge Function Locally
```bash
supabase functions serve run-compliance-engine
```

### Trigger Manually
```bash
curl -X GET https://[project-ref].supabase.co/functions/v1/run-compliance-engine \
  -H "Authorization: Bearer [anon-key]"
```

### Check Database RLS
```sql
-- Test as service role
SELECT * FROM compliance_non_conformities LIMIT 1;

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-uuid';
SELECT * FROM compliance_non_conformities LIMIT 1;
```

## 📈 Metrics Dashboard

### Key Performance Indicators

1. **Compliance Score**: 0-100 (Target: >80)
2. **Automation Rate**: % of auto-processed incidents (Target: >80%)
3. **Average Resolution Time**: Days to resolve non-conformities (Target: <7 days)
4. **Overdue Actions**: Count of past-due actions (Target: 0)
5. **Open Non-Conformities**: Current open issues (Monitor trend)

### Score Thresholds
- **90-100**: Excellent compliance
- **80-89**: Good compliance
- **60-79**: Fair compliance (needs attention)
- **<60**: Poor compliance (urgent action required)

## 🎯 Best Practices

### 1. Regular Monitoring
- Check dashboard daily
- Review AI-generated status explanations
- Address critical items immediately

### 2. Action Management
- Set realistic due dates
- Assign actions to responsible parties
- Track estimated vs. actual hours
- Document completion notes

### 3. Training Coordination
- Link training to specific non-conformities
- Track certificate expiration dates
- Schedule renewals proactively

### 4. Evidence Management
- Add evidence as soon as available
- Reference specific norm clauses
- Include descriptive titles
- Organize by regulation type

### 5. Score Optimization
- Prioritize overdue actions (highest penalty)
- Close resolved non-conformities promptly
- Maintain evidence trail
- Review score history for trends

## 🐛 Common Issues

### Issue: Score Not Updating
**Solution**: Trigger recalculation manually:
```typescript
await calculateComplianceScore(tenantId);
```

### Issue: AI Not Generating Matches
**Check**:
1. VITE_OPENAI_API_KEY is set
2. API key has credits
3. Network connectivity
4. Browser console for errors

### Issue: Dashboard Loading Slowly
**Optimize**:
1. Add pagination to lists
2. Filter by date range
3. Limit query results
4. Use indexes on custom queries

### Issue: Missing Non-Conformities
**Verify**:
1. Cron job is running
2. Incidents have `compliance_processed = false`
3. Tenant ID is correct
4. RLS policies allow access

## 📞 Support Commands

### Reprocess Failed Incidents
```sql
-- Reset compliance_processed flag
UPDATE dp_incidents
SET compliance_processed = false
WHERE id IN ('incident-1', 'incident-2', ...);
```

### Manual Score History Entry
```sql
INSERT INTO compliance_score_history (
  tenant_id, score, total_non_conformities,
  open_non_conformities, resolved_non_conformities,
  overdue_actions, calculated_at
)
SELECT
  tenant_id,
  80.5 as score,
  COUNT(*) FILTER (WHERE status IS NOT NULL) as total,
  COUNT(*) FILTER (WHERE status = 'open') as open,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
  0 as overdue,
  NOW()
FROM compliance_non_conformities
WHERE tenant_id = 'your-tenant-id'
GROUP BY tenant_id;
```

### Bulk Update Action Status
```sql
-- Mark all pending actions for a non-conformity as in_progress
UPDATE compliance_corrective_actions
SET status = 'in_progress'
WHERE non_conformity_id = 'nc-uuid'
  AND status = 'pending';
```

## 🎓 Training Resources

### For Administrators
1. Review Live Compliance Module README
2. Practice using dashboard
3. Understand scoring algorithm
4. Learn to interpret AI summaries

### For Compliance Officers
1. Study maritime regulations (IMCA, ISO, ANP, etc.)
2. Learn evidence documentation
3. Master corrective action planning
4. Understand training assignment workflow

### For Technical Team
1. Database schema review
2. API integration patterns
3. Edge function deployment
4. Troubleshooting procedures

## 📄 Related Documentation

- `LIVE_COMPLIANCE_MODULE_README.md` - Complete technical guide
- `LIVE_COMPLIANCE_VISUAL_SUMMARY.md` - Visual diagrams and workflows
- `ETAPA_33_COMPLETION_SUMMARY.md` - Implementation summary
- Database migration: `supabase/migrations/20251018174000_create_compliance_tables.sql`
- Service layer: `src/services/compliance-engine.ts`
- Dashboard: `src/pages/admin/live-compliance.tsx`
- Edge function: `supabase/functions/run-compliance-engine/index.ts`

## 🔄 Version

- **Module**: ETAPA 33 - Live Compliance Module
- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: 2025-10-18
