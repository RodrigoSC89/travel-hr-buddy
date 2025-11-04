# ISM Audit Intelligence Module

**PATCH 633** - ISM Audit Intelligence with LLM, Historical Tracking, and Comprehensive Reporting

## Overview

The ISM Audit Intelligence Module provides a comprehensive digital solution for conducting ISM Code audits with AI-powered assistance, automated checklists, and detailed reporting capabilities.

## Features

### ✅ Automated ISM Checklist
- Complete ISM Code checklist based on IMO Resolution A.1070(28)
- 27 checklist items covering all 12 ISM Code sections
- Compliance status tracking (Compliant, Observation, Non-Conformity, Major Non-Conformity)
- Evidence requirement flagging

### 🧠 LLM Integration
- AI-powered contextual explanations for each ISM requirement
- Vessel-specific guidance based on ship type, age, and operation area
- Practical examples and common pitfalls
- Verification tips for auditors
- Comprehensive audit analysis with risk assessment

### 🗂️ Historical Tracking
- Audit history by vessel, auditor, and result
- Trend analysis over time
- Score tracking per section
- Finding status management
- Next due date calculations

### 📥 Export Capabilities
- PDF reports with section scores and findings
- JSON export for data integration
- Detailed LLM analysis in reports
- Summary statistics and recommendations

### 📌 Evidence Management
- Upload and link evidence documents
- Multiple file type support (PDF, images, documents)
- Evidence tracking per section
- Integration with Evidence Ledger (Patch 630)

## Database Schema

### Tables
- `ism_audits` - Main audit records
- `ism_checklist_responses` - Checklist item responses
- `ism_findings` - Non-conformities and observations
- `ism_evidence` - Evidence file references
- `ism_llm_analysis` - AI-generated analysis

### Row Level Security (RLS)
- Vessel-based access control
- User ownership verification
- Secure evidence management

## ISM Code Sections

1. **Safety and Environmental Protection Policy** (ISM 2.0)
2. **Company Responsibilities and Authority** (ISM 3.0)
3. **Designated Person(s)** (ISM 4.0)
4. **Master's Responsibility and Authority** (ISM 5.0)
5. **Resources and Personnel** (ISM 6.0)
6. **Shipboard Operations** (ISM 7.0)
7. **Emergency Preparedness** (ISM 8.0)
8. **Reports and Analysis of Non-conformities** (ISM 9.0)
9. **Maintenance of Ship and Equipment** (ISM 10.0)
10. **Documentation** (ISM 11.0)
11. **Company Verification, Review and Evaluation** (ISM 12.0)
12. **Certification and Verification** (ISM 13.0)

## Usage

### Creating an Audit

```typescript
import { ISMAuditItem } from '@/modules/compliance/ism-audit/types';

const audit: ISMAuditItem = {
  vessel_id: "vessel-uuid",
  vessel_name: "MV Example",
  audit_date: "2025-11-04",
  auditor_name: "John Smith",
  audit_type: "internal",
  status: "in_progress",
  // ...
};
```

### Getting LLM Explanations

```typescript
import { getLLMExplanation } from '@/modules/compliance/ism-audit/llm-integration';

const result = await getLLMExplanation({
  item: checklistItem,
  vessel_context: {
    vessel_type: "DP2 PSV",
    vessel_age: 5,
    operation_area: "North Sea"
  }
});
```

### Exporting Reports

```typescript
import { exportISMAuditPDF } from '@/modules/compliance/ism-audit/export-service';

const { success, blob } = await exportISMAuditPDF(audit, checklist, findings);
if (success && blob) {
  downloadPDFReport(blob, `ISM-Audit-${audit.vessel_name}-${audit.audit_date}.pdf`);
}
```

## API Endpoints

### Required Environment Variables
```
VITE_OPENAI_API_KEY=your-openai-api-key
```

### Supabase Functions
- `calculate_ism_section_scores(audit_uuid)` - Calculate section scores
- `calculate_ism_overall_score(audit_uuid)` - Calculate overall audit score

## Integration

### Evidence Ledger (Patch 630)
- Links audit evidence to blockchain ledger
- Immutable evidence tracking
- Cryptographic verification

### System Watchdog
- Real-time compliance monitoring
- Alert generation for major non-conformities
- Audit due date tracking

### Nautilus Copilot
- Natural language audit queries
- AI-assisted finding analysis
- Contextual recommendations

## Compliance Score Calculation

```
Compliant: 100 points
Observation: 75 points
Non-Conformity: 25 points
Major Non-Conformity: 0 points
Not Verified: 0 points

Section Score = Average of all items in section
Overall Score = Average of all section scores
```

## Compliance Levels

- **90-100%**: Excellent - Full compliance
- **75-89%**: Good - Minor observations
- **60-74%**: Acceptable - Some non-conformities
- **0-59%**: Poor - Major non-conformities, immediate action required

## File Structure

```
src/modules/compliance/ism-audit/
├── types.ts              # Type definitions
├── checklist.ts          # Automated checklist items
├── llm-integration.ts    # AI/LLM services
├── export-service.ts     # PDF/JSON export
├── schema.sql            # Database schema
├── index.tsx             # Main component (to be created)
└── README.md             # This file
```

## Testing

```bash
# Run unit tests
npm run test -- ism-audit

# Run integration tests
npm run test:e2e -- ism-audit
```

## Security

- Row Level Security (RLS) enabled on all tables
- User-based access control
- Vessel ownership verification
- Audit trail for all changes
- Secure file upload handling

## Performance

- Indexed database queries
- Optimized LLM API calls
- Lazy loading for large audit lists
- Efficient PDF generation
- Caching for checklist data

## References

- IMO Resolution A.1070(28) - ISM Code
- IMO MSC-MEPC.7/Circ.6 - Guidance on ISM Code
- ISM Code 2018 Edition

## Support

For issues or questions, contact the development team or refer to the main Nautilus One documentation.

---

**Version**: 1.0.0  
**Patch**: 633  
**Status**: ✅ Implemented  
**Last Updated**: 2025-11-04
