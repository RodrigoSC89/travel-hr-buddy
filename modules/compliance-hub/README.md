# Compliance Hub Module

**PATCH 92.0** - Unified Compliance Management System

## Overview

The Compliance Hub is a comprehensive, AI-powered compliance management system that consolidates audit management, checklist execution, risk assessment, and regulatory documentation into a single, unified interface.

### Consolidated Modules

This module replaces and unifies:
- ✅ `compliance/audit-center` - Audit management and inspections
- ✅ `features/checklists` - Smart checklist system
- ✅ `emergency/risk-management` - Risk assessment and monitoring
- ✅ `compliance/compliance-hub` - Basic compliance overview

## Features

### 📄 Documentation Section
- Upload and manage compliance documents (PDF, Word, Excel, images)
- AI-powered document analysis using `runAIContext("compliance-review")`
- Automatic categorization and tagging
- Document expiry tracking
- Support for regulations: ISM, ISPS, IMCA, FMEA, NORMAM

### ✅ Checklists Section
- Dynamic checklist templates (FMEA, ISM, ISPS, IMCA, NORMAM)
- Checklist execution with status tracking (ok, warning, fail, not_checked)
- Execution history and analytics
- AI-powered checklist evaluation
- Template management

### 📝 Audits Section
- Schedule and manage compliance audits
- Automatic audit logging with full traceability
- PDF report generation
- AI-powered compliance assessment
- Finding tracking and resolution
- Integration with checklist system

### ⚠️ Risks Section
- Real-time risk monitoring dashboard
- Risk scoring (likelihood × impact)
- AI-powered risk analysis and insights
- Risk categorization (critical, high, medium, low)
- Mitigation planning and tracking
- Risk trend visualization

## Architecture

```
modules/compliance-hub/
├── index.tsx                         # Main hub component with tabbed interface
├── types/
│   └── index.ts                      # Unified type definitions
├── utils/
│   └── config.ts                     # Configuration and helpers
├── services/
│   ├── ai-service.ts                 # AI integration with runAIContext
│   ├── document-service.ts           # Document upload and analysis
│   └── audit-log-service.ts          # Comprehensive audit logging
└── components/
    ├── ComplianceMetrics.tsx         # Dashboard metrics display
    ├── DocumentationSection.tsx      # Document upload & AI analysis
    ├── ChecklistsSection.tsx         # Dynamic checklists
    ├── AuditsSection.tsx             # Audit management
    └── RisksSection.tsx              # Risk dashboard
```

## Usage

### Accessing the Module

Navigate to: `/dashboard/compliance-hub`

Or use the module registry:
```typescript
import { getModule } from "@/modules/registry";

const complianceHub = getModule("compliance.hub");
```

### AI Integration

The module uses `runAIContext` for AI-powered features:

```typescript
import { runAIContext } from "@/ai/kernel";

const response = await runAIContext({
  module: "compliance-review",
  action: "document-analysis",
  context: {
    documentText: text,
    category: "ISM"
  }
});
```

### Document Upload

```typescript
import { handleDocumentUpload } from "./services/document-service";

const result = await handleDocumentUpload(
  file,
  {
    title: "Safety Management System",
    type: "regulation",
    category: "ISM"
  },
  userId,
  { analyzeWithAI: true }
);
```

### Risk Assessment

```typescript
import { calculateRiskSeverity } from "./utils/config";

const severity = calculateRiskSeverity(
  likelihood,  // 1-5
  impact      // 1-5
);
// Returns: "critical" | "high" | "medium" | "low"
```

## Configuration

### File Upload Limits

- **Max file size:** 10MB
- **Allowed formats:** PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Images (.jpg, .jpeg, .png)

### Compliance Thresholds

- **Excellent:** ≥ 95%
- **Good:** ≥ 85%
- **Acceptable:** ≥ 75%
- **Critical:** < 75%

### Risk Severity Thresholds

Based on `likelihood × impact`:
- **Critical:** ≥ 20
- **High:** ≥ 15
- **Medium:** ≥ 8
- **Low:** < 8

### Audit Frequencies

- **IMCA:** 90 days (Quarterly)
- **ISM:** 365 days (Annually)
- **ISPS:** 180 days (Semi-annually)
- **FMEA:** 180 days (Semi-annually)
- **NORMAM:** 365 days (Annually)

## Testing

Run module tests:
```bash
npm run test -- tests/modules/compliance-hub.test.ts
```

Current test coverage:
- ✅ 21 tests passing
- ✅ Configuration utilities
- ✅ AI service fallback
- ✅ Risk calculations
- ✅ Module exports
- ✅ Type definitions

## API Integration

### Supabase Storage

Documents are stored in the `compliance_documents` bucket:
```
compliance/
  ├── ISM/
  ├── ISPS/
  ├── IMCA/
  ├── FMEA/
  └── NORMAM/
```

### Audit Logs

All actions are logged to `compliance_audit_logs` table:
- Document uploads
- Checklist executions
- Audit completions
- Risk creations/mitigations

## Migration from Legacy Modules

If migrating from legacy modules:

1. **Data Migration:** No automatic migration - data preserved in legacy modules
2. **Routes:** Old routes marked as deprecated in registry
3. **Code References:** Update imports to new paths
4. **Legacy Access:** Old modules archived in `/legacy/compliance_modules/`

## Permissions

Module visibility controlled in registry:
```typescript
{
  id: 'compliance.hub',
  permissions: ['admin', 'compliance_officer'], // Example
  // ...
}
```

## Troubleshooting

### Module not loading
- Check module is active in `src/modules/registry.ts`
- Verify route is correct: `/dashboard/compliance-hub`
- Clear browser cache

### AI not responding
- Check `runAIContext` is available
- Verify AI kernel is initialized
- Falls back to rule-based evaluation if AI unavailable

### File upload failing
- Check file size (max 10MB)
- Verify file type is allowed
- Ensure Supabase storage bucket exists

## Future Enhancements

- [ ] Real-time collaboration on checklists
- [ ] Advanced PDF parsing and OCR
- [ ] Integration with external compliance APIs
- [ ] Mobile app support
- [ ] Automated compliance reporting
- [ ] ML-based risk prediction

## Support

For issues or questions:
- Check `/legacy/compliance_modules/README.md` for migration notes
- Review module registry: `src/modules/registry.ts`
- Run tests: `npm run test -- tests/modules/compliance-hub.test.ts`

## Version History

- **92.0** (2025-10-24) - Initial unified release
  - Consolidated 4 modules into 1
  - Added AI integration
  - Implemented comprehensive logging
  - Created full test suite
