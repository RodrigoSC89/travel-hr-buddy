# SGSO (Safety Management System) Module Documentation

## Overview

The SGSO (Sistema de Gestão de Segurança Operacional / Operational Safety Management System) module provides comprehensive safety management, compliance tracking, and audit capabilities for maritime operations.

## Architecture

```
src/pages/
├── SGSO.tsx                    # Main SGSO page
├── SGSOReportPage.tsx          # SGSO reports
└── SGSOAuditPage.tsx           # SGSO audits

src/services/
└── imca-audit-service.ts       # IMCA audit service

src/components/
└── sgso/                       # SGSO components
```

## Core Features

### 1. Safety Audits

**Purpose:** Track and manage safety audits per IMCA standards

**Capabilities:**
- Create and schedule audits
- Assign auditors
- Track audit progress
- Generate compliance reports
- Monitor corrective actions

### 2. Incident Management

**Integration:** Links with `dp_incidents` table

**Features:**
- Record safety incidents
- Classify by severity
- Track investigation
- Monitor corrective actions
- Trend analysis

### 3. Compliance Tracking

**Standards Supported:**
- IMCA guidelines
- ISM Code
- ISO 9001/14001
- Custom compliance frameworks

### 4. Reporting

**Report Types:**
- Monthly safety reports
- Audit summaries
- Incident trends
- Compliance status
- KPI dashboards

## Supabase Integration

### sgso_audits Table

```typescript
{
  id: UUID
  audit_type: string           // 'internal', 'external', 'imca'
  vessel_id: UUID
  auditor_id: UUID
  scheduled_date: date
  completion_date: date
  status: string               // 'scheduled', 'in_progress', 'completed'
  findings: JSONB              // Array of findings
  compliance_score: decimal
  report_url: string
  metadata: JSONB
  created_at: timestamp
  updated_at: timestamp
}
```

### sgso_audit_items Table

```typescript
{
  id: UUID
  audit_id: UUID               // FK to sgso_audits
  item_number: string
  category: string             // 'critical', 'major', 'minor', 'observation'
  description: text
  evidence: JSONB
  status: string               // 'open', 'in_progress', 'closed'
  corrective_action: text
  responsible_person: UUID
  due_date: date
  completion_date: date
  verification_notes: text
  created_at: timestamp
  updated_at: timestamp
}
```

## Usage Examples

### Creating an Audit

```typescript
import { supabase } from '@/integrations/supabase/client';

const audit = await supabase
  .from('sgso_audits')
  .insert({
    audit_type: 'imca',
    vessel_id: vesselId,
    auditor_id: auditorId,
    scheduled_date: '2025-11-15',
    status: 'scheduled'
  })
  .select()
  .single();
```

### Adding Audit Items

```typescript
const item = await supabase
  .from('sgso_audit_items')
  .insert({
    audit_id: auditId,
    item_number: 'IMCA-01',
    category: 'critical',
    description: 'Emergency shutdown procedure not documented',
    status: 'open',
    due_date: '2025-12-01'
  });
```

### Generating Audit Report

```typescript
import { generateSGSOReport } from '@/services/imca-audit-service';

const report = await generateSGSOReport({
  auditId: auditId,
  format: 'pdf',
  includeEvidence: true
});
```

## AI Integration

### Automated Analysis

The AI module provides:
- Automatic finding classification
- Risk assessment
- Corrective action suggestions
- Trend prediction
- Compliance scoring

```typescript
import { incidentAnalyzer } from '@/ai/services/incidentAnalyzer';

const analysis = await incidentAnalyzer.analyze({
  findings: auditFindings,
  historicalData: true
});
```

## Components

### SGSO Dashboard

**Location:** `src/pages/SGSO.tsx`

**Features:**
- Overview of all audits
- Compliance status
- Open items tracking
- Upcoming audits calendar
- Key metrics

### Audit Page

**Location:** `src/pages/SGSOAuditPage.tsx`

**Features:**
- Audit details
- Item management
- Evidence upload
- Progress tracking
- Report generation

### Report Page

**Location:** `src/pages/SGSOReportPage.tsx`

**Features:**
- Report templates
- Custom reports
- Export to PDF
- Email distribution
- Historical reports

## Compliance Workflows

### 1. Internal Audit Workflow

```
Schedule Audit
    ↓
Assign Auditor
    ↓
Conduct Audit
    ↓
Record Findings
    ↓
Assign Corrective Actions
    ↓
Monitor Progress
    ↓
Verify Completion
    ↓
Close Audit
```

### 2. Incident Response Workflow

```
Incident Reported
    ↓
Initial Assessment
    ↓
Investigation
    ↓
Root Cause Analysis
    ↓
Corrective Actions
    ↓
Preventive Measures
    ↓
Follow-up Verification
```

## Metrics & KPIs

### Key Metrics Tracked

1. **Compliance Score:** Overall compliance percentage
2. **Audit Completion Rate:** Audits completed on time
3. **Open Items:** Number of pending corrective actions
4. **Incident Rate:** Safety incidents per time period
5. **Response Time:** Time to address critical findings

### Reporting Frequency

- **Daily:** Critical item status
- **Weekly:** Open items summary
- **Monthly:** Full compliance report
- **Quarterly:** Trend analysis
- **Annually:** Comprehensive review

## Integration Points

### With Other Modules

1. **Crew Module:** Training compliance
2. **Maintenance:** Equipment safety checks
3. **Documents:** Safety documentation
4. **Analytics:** Compliance analytics
5. **AI Module:** Predictive safety analytics

### External Systems

- IMCA databases
- Flag state systems
- Classification societies
- Insurance providers

## Permissions & Access Control

### Role-Based Access

- **Admin:** Full access
- **Safety Manager:** Audit management, reporting
- **Auditor:** Conduct audits, add findings
- **Crew:** View relevant audits, submit evidence
- **Viewer:** Read-only access to reports

## Testing

### Test Coverage

- Unit tests for SGSO services
- Integration tests with Supabase
- E2E tests for audit workflows
- Report generation tests

### Test Files

```
__tests__/
└── sgso/
    ├── audit-creation.test.ts
    ├── item-management.test.ts
    └── report-generation.test.ts
```

## Best Practices

1. **Document Everything:** All findings must have supporting evidence
2. **Follow Up:** Track corrective actions to completion
3. **Regular Reviews:** Monthly compliance reviews
4. **Training:** Keep team updated on standards
5. **Continuous Improvement:** Learn from incidents and audits

## Troubleshooting

### Common Issues

**Issue:** Audit items not saving
- Check user permissions
- Verify audit ID is valid
- Ensure required fields are filled

**Issue:** Reports not generating
- Check report template configuration
- Verify data completeness
- Review server logs

**Issue:** Compliance score incorrect
- Recalculate scores manually
- Check for duplicate entries
- Verify weighting factors

## Future Enhancements

- [ ] Mobile app for field audits
- [ ] Offline mode support
- [ ] Photo evidence with AI analysis
- [ ] Voice-to-text for findings
- [ ] Blockchain for audit trail
- [ ] Integration with wearable safety devices

## Related Documentation

- [AI Module](./ai.md)
- [Crew Module](./crew.md)
- [Templates Module](./templates.md)

## Support

For SGSO module support:
- Review audit logs in admin panel
- Check compliance reports
- Contact safety team
