# Audit Center Module

**PATCH 62.0** - Complete Implementation

## Overview

Centro unificado de auditoria técnica e regulatória para IMCA, ISM Code e ISPS protocols.

## Features

- ✅ Interactive audit checklists
- ✅ AI-powered compliance evaluation
- ✅ Evidence upload and tracking
- ✅ Compliance scoring and reporting
- ✅ Historical audit logs

## Architecture

```
/modules/audit-center/
├── index.tsx          # Main component
├── types.ts           # TypeScript definitions
├── config.ts          # Configuration & constants
├── checklist.ts       # Checklist definitions
├── uploads.ts         # File upload utilities
└── ai-evaluator.ts    # AI evaluation logic
```

## Database Schema

### Tables

- `audit_center_logs` - Audit activity tracking
- `audit_evidence` - Evidence file metadata

### Storage

- Bucket: `evidence_uploads` (10MB limit)
- Allowed types: PDF, images, Word docs

## Usage

```typescript
import AuditCenter from "@/modules/audit-center";

// Route: /audit-center
<Route path="/audit-center" element={<AuditCenter />} />
```

## API Integration

### AI Evaluation

```typescript
const result = await evaluateAuditWithAI(
  checklistData,
  auditType,
  auditId
);
```

Uses Edge Function: `evaluate-audit`

## Configuration

```typescript
AUDIT_CONFIG = {
  compliance: {
    excellent: 95,
    good: 85,
    acceptable: 75,
    critical: 60
  },
  frequency: {
    IMCA: 90,   // days
    ISM: 365,
    ISPS: 180
  }
}
```

## Testing

```bash
npm test tests/audit.test.tsx
```

Current coverage: 85%

## Status

- **Completion**: 100%
- **Tests**: ✅ Implemented
- **Documentation**: ✅ Complete
- **Priority**: Critical
