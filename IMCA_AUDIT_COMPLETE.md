# IMCA DP Technical Audit System - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technical Implementation](#technical-implementation)
4. [User Guide](#user-guide)
5. [Developer Guide](#developer-guide)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Overview

The IMCA DP Technical Audit System is an AI-powered solution for conducting comprehensive technical audits of Dynamic Positioning (DP) vessels. It follows international standards from IMCA (International Marine Contractors Association), IMO (International Maritime Organization), and MTS (Marine Technology Society).

### Key Benefits

- **Standards Compliance**: Evaluates against 10 international standards
- **Comprehensive Analysis**: Covers 13 critical DP system modules
- **AI-Powered**: Uses GPT-4o for intelligent analysis
- **Risk Assessment**: Classifies non-conformities by risk level
- **Action Planning**: Generates prioritized action items with deadlines
- **Portuguese Support**: Fully localized for Brazilian operations
- **Export Ready**: One-click Markdown export

## Features

### 1. Multi-Tab Interface

#### Basic Data Tab
- Vessel name
- DP class selection (DP1/DP2/DP3)
- Location
- Audit objective

#### Operational Data Tab (Optional)
- Incident details
- Environmental conditions
- System status
- Crew qualifications
- Maintenance history

#### Results Tab
- Overall compliance score (0-100)
- Standards applied
- Module evaluations
- Non-conformities with risk levels
- Prioritized action plan

### 2. Intelligent Analysis

The system evaluates **13 DP System Modules**:
1. DP Control System
2. Propulsion System
3. Power Generation System
4. Position Reference Sensors
5. Environmental Sensors
6. Communications & Alarms
7. Personnel Competence
8. FMEA & Trials
9. Annual DP Trials
10. Documentation & Records
11. Planned Maintenance System
12. Capability Plots
13. Operational Planning

### 3. Standards Compliance

Evaluates against **10 International Standards**:
- IMCA M103: Design and Operation Guidelines
- IMCA M117: Personnel Training and Experience
- IMCA M190: FMEA Guidance
- IMCA M166: SIMOPS Guidance
- IMCA M109: Capability Plots Specification
- IMCA M220: Electrical Systems Guidance
- IMCA M140: Operations Specification
- MSF 182: Marine Safety Forum DP Operations
- MTS DP: Design Philosophy Guidelines
- IMO MSC.1/Circ.1580: IMO DP Guidelines

### 4. Risk Classification

Non-conformities are classified as:
- **Alto** (High): Immediate safety concern 🔴
- **Médio** (Medium): Requires attention 🟡
- **Baixo** (Low): Minor issue ⚪

### 5. Action Plan Priorities

Automatic deadline calculation based on priority:
- **Crítico**: 7 days
- **Alto**: 30 days
- **Médio**: 90 days
- **Baixo**: 180 days

## Technical Implementation

### Architecture Overview

```
Frontend (React/TypeScript)
├── UI Components (imca-audit-generator.tsx)
├── Service Layer (imca-audit-service.ts)
├── Type Definitions (imca-audit.ts)
└── Page Route (IMCAAudit.tsx)

Backend (Supabase Edge Functions)
└── AI Integration (imca-audit-generator/index.ts)

Database (PostgreSQL)
└── auditorias_imca table with RLS
```

### Type System

```typescript
// Core Types
type DPClass = "DP1" | "DP2" | "DP3";
type RiskLevel = "Alto" | "Médio" | "Baixo";
type Priority = "Crítico" | "Alto" | "Médio" | "Baixo";

// Input Structure
interface IMCAAuditInput {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  operationalData?: OperationalData;
}

// Output Structure
interface IMCAAuditReport {
  id: string;
  vesselName: string;
  dpClass: DPClass;
  overallScore: number;
  standards: StandardReference[];
  moduleEvaluations: ModuleEvaluation[];
  nonConformities: NonConformity[];
  actionPlan: ActionItem[];
  summary: string;
  conclusion: string;
}
```

### Deadline Calculation Fix

The critical bug fix for deadline calculations ensures timezone-independent results:

```typescript
export function getDeadlineFromPriority(priority: Priority): Date {
  const daysMap: Record<Priority, number> = {
    Crítico: 7,
    Alto: 30,
    Médio: 90,
    Baixo: 180,
  };

  const days = daysMap[priority] ?? 30;

  // Use UTC midnight to avoid timezone offsets
  const now = new Date();
  const utcMidnightToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const utcMidnightDeadline = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + days
  );

  return new Date(utcMidnightDeadline);
}
```

This fixes the off-by-one error that occurred when calculating deadlines at different times of day.

### Service Layer

The service layer provides 7 main functions:

```typescript
// Generate new audit with AI
await generateIMCAAudit(input);

// Save audit to database
await saveAudit(report);

// Retrieve audits
await getAudits();
await getAudit(id);

// Update audit
await updateAudit(id, report);

// Delete audit
await deleteAudit(id);

// Export as Markdown
downloadAuditMarkdown(report);
```

## User Guide

### Creating an Audit

1. **Navigate to IMCA Audit**
   - Use the direct URL: `/imca-audit`
   - Or click "Gerar Auditoria IMCA" in DP Intelligence Center

2. **Fill Basic Data** (Required)
   - Enter vessel name
   - Select DP class (DP1, DP2, or DP3)
   - Enter location
   - Describe audit objective

3. **Add Operational Data** (Optional)
   - Provide incident details if applicable
   - Add environmental conditions
   - Describe system status
   - Include crew qualification information
   - Add maintenance history

4. **Generate Report**
   - Click "Generate Audit" button
   - Wait for AI analysis (typically 10-30 seconds)
   - Review results in the Results tab

5. **Export Report**
   - Click "Export Markdown" to download
   - Report includes all findings and recommendations

### Interpreting Results

#### Overall Score
- **90-100**: Excellent compliance
- **75-89**: Good compliance, minor issues
- **60-74**: Acceptable, requires attention
- **<60**: Significant issues, immediate action required

#### Module Status
- **Compliant**: Meets all requirements ✅
- **Partial**: Some issues identified ⚠️
- **Non-Compliant**: Fails requirements ❌

#### Action Items
Prioritized by deadline:
- Review critical items first (7-day deadline)
- Plan resources for high-priority items (30 days)
- Schedule medium items (90 days)
- Track low-priority improvements (180 days)

## Developer Guide

### Adding New Standards

Edit `src/types/imca-audit.ts`:

```typescript
export const IMCA_STANDARDS: StandardReference[] = [
  // ... existing standards
  {
    code: "NEW_CODE",
    name: "Standard Name",
    description: "Standard description"
  }
];
```

### Adding New Modules

Edit `src/types/imca-audit.ts`:

```typescript
export const DP_MODULES = [
  // ... existing modules
  "New Module Name"
] as const;
```

### Customizing AI Prompt

Edit `supabase/functions/imca-audit-generator/index.ts`:

```typescript
function generatePrompt(input: any): string {
  // Customize prompt structure
  return `Your custom prompt...`;
}
```

### Styling Risk Levels

Edit color mappings in `src/types/imca-audit.ts`:

```typescript
export function getRiskLevelColor(level: RiskLevel): string {
  const colorMap: Record<RiskLevel, string> = {
    Alto: "text-red-600",    // Change these
    Médio: "text-yellow-600",
    Baixo: "text-gray-600",
  };
  return colorMap[level];
}
```

## Testing

### Running Tests

```bash
# Run all IMCA audit tests
npm test src/tests/components/imca-audit/

# Run specific test
npm test src/tests/components/imca-audit/imca-audit.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

The test suite includes 30 tests covering:
- DP class validation ✅
- Standards completeness (10 standards) ✅
- Modules completeness (13 modules) ✅
- Risk level color mapping ✅
- Priority color mapping ✅
- Deadline calculations (all priorities) ✅
- Markdown export structure ✅
- Input validation ✅
- Data structure validation ✅

### Writing New Tests

```typescript
import { describe, it, expect } from "vitest";
import { getDeadlineFromPriority } from "@/types/imca-audit";

describe("New Feature", () => {
  it("should do something", () => {
    // Your test
    expect(result).toBe(expected);
  });
});
```

## Deployment

### Prerequisites

1. **Environment Variables**
   ```env
   OPENAI_API_KEY=your_openai_key
   ```

2. **Database Setup**
   - Table `auditorias_imca` must exist
   - RLS policies must be configured

3. **Supabase Functions**
   ```bash
   supabase functions deploy imca-audit-generator
   ```

### Build and Deploy

```bash
# Build application
npm run build

# Deploy to production
npm run deploy:vercel
# or
npm run deploy:netlify
```

### Verification

1. Navigate to `/imca-audit`
2. Fill out a test audit
3. Generate report
4. Verify all data displays correctly
5. Test export functionality

## Troubleshooting

### Common Issues

**Issue**: Deadline calculations off by one day
**Solution**: Ensure using the fixed `getDeadlineFromPriority` function with UTC midnight normalization

**Issue**: AI generation fails
**Solution**: Check OPENAI_API_KEY environment variable is set correctly

**Issue**: Can't save audit
**Solution**: Verify user is authenticated and RLS policies allow access

**Issue**: Export not working
**Solution**: Check browser allows downloads and pop-ups

### Support

For issues or questions:
1. Check test suite for examples
2. Review implementation summary
3. Consult IMCA standards documentation
4. Contact technical support

## Future Enhancements

Potential improvements:
- [ ] PDF export option
- [ ] Email report distribution
- [ ] Scheduled audit reminders
- [ ] Audit history comparison
- [ ] Multi-language support (English, Spanish)
- [ ] Custom template support
- [ ] Integration with vessel management systems
- [ ] Offline mode support

## Conclusion

The IMCA DP Technical Audit System provides a comprehensive, AI-powered solution for maritime safety compliance. With automatic deadline calculations, risk assessment, and export functionality, it streamlines the audit process while ensuring adherence to international standards.

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: October 2024
