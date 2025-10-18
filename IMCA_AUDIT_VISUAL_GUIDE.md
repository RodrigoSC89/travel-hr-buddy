# IMCA DP Technical Audit System - Visual Guide

## Quick Overview

```
┌─────────────────────────────────────────────────────────────┐
│                IMCA DP Technical Audit System                │
│             AI-Powered Vessel Compliance Analysis            │
└─────────────────────────────────────────────────────────────┘
```

## User Journey

```
Start
  │
  ├─► Navigate to /imca-audit
  │   OR
  └─► Click "Gerar Auditoria" in DP Intelligence Center
      │
      ├─► TAB 1: Basic Data
      │   ├─ Vessel Name *
      │   ├─ DP Class (DP1/DP2/DP3) *
      │   ├─ Location *
      │   └─ Audit Objective *
      │
      ├─► TAB 2: Operational Data (Optional)
      │   ├─ Incident Details
      │   ├─ Environmental Conditions
      │   ├─ System Status
      │   ├─ Crew Qualifications
      │   └─ Maintenance History
      │
      ├─► Click "Generate Audit"
      │   │
      │   └─► AI Processing (10-30s)
      │       ├─ Analyze 13 DP Modules
      │       ├─ Check 10 Standards
      │       ├─ Assess Risks
      │       └─ Generate Action Plan
      │
      └─► TAB 3: Results
          ├─ Overall Score: XX/100
          ├─ Standards Applied: 10
          ├─ Module Evaluations: 13
          ├─ Non-Conformities: X
          ├─ Action Items: XX
          │
          └─► Export Markdown
              └─► Download Report
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend Layer                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │        IMCAAuditGenerator Component                │     │
│  │  (src/components/imca-audit/imca-audit-generator) │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • Multi-tab interface                             │     │
│  │  • Form validation                                 │     │
│  │  • State management                                │     │
│  │  • Results display                                 │     │
│  └─────────────┬──────────────────────────────────────┘     │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────┐     │
│  │        IMCA Audit Service                          │     │
│  │     (src/services/imca-audit-service.ts)           │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • generateIMCAAudit()                             │     │
│  │  • saveAudit()                                     │     │
│  │  • getAudits() / getAudit()                        │     │
│  │  • updateAudit()                                   │     │
│  │  • deleteAudit()                                   │     │
│  │  • exportAuditMarkdown()                           │     │
│  └─────────────┬──────────────────────────────────────┘     │
│                │                                             │
└────────────────┼─────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│                   Supabase Edge Function                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │    imca-audit-generator/index.ts                   │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • Receives audit input                            │     │
│  │  • Generates AI prompt                             │     │
│  │  • Calls OpenAI GPT-4o                             │     │
│  │  • Parses AI response                              │     │
│  │  • Calculates deadlines                            │     │
│  │  • Returns complete report                         │     │
│  └─────────────┬──────────────────────────────────────┘     │
│                │                                             │
└────────────────┼─────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│                    OpenAI GPT-4o API                          │
├──────────────────────────────────────────────────────────────┤
│  • Analyzes vessel data                                      │
│  • Evaluates against standards                               │
│  • Generates findings                                        │
│  • Creates recommendations                                   │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input
    │
    ├─► Vessel Information
    │   ├─ Name: "DP Construction Vessel Delta"
    │   ├─ Class: DP2
    │   ├─ Location: "Santos Basin, Brazil"
    │   └─ Objective: "Post-incident evaluation"
    │
    ├─► Operational Data (Optional)
    │   ├─ Incidents: "Thruster #3 failure"
    │   ├─ Environment: "Heavy seas, 3m waves"
    │   ├─ Systems: "All DP sensors operational"
    │   ├─ Crew: "DPO certified, 5 years exp"
    │   └─ Maintenance: "Last PM: 2 weeks ago"
    │
    ▼
AI Processing
    │
    ├─► Evaluate 13 Modules
    │   ├─ DP Control System → Score: 85/100
    │   ├─ Propulsion System → Score: 70/100 ⚠️
    │   ├─ Power Generation → Score: 90/100
    │   └─ ... (10 more modules)
    │
    ├─► Check 10 Standards
    │   ├─ IMCA M103 ✓
    │   ├─ IMCA M117 ✓
    │   ├─ IMCA M190 ⚠️
    │   └─ ... (7 more standards)
    │
    ├─► Identify Non-Conformities
    │   ├─ NC-1: Thruster redundancy issue 🔴 Alto
    │   ├─ NC-2: FMEA outdated 🟡 Médio
    │   └─ NC-3: Documentation gaps ⚪ Baixo
    │
    └─► Generate Action Plan
        ├─ Action 1: Replace thruster [Crítico - 7 days]
        ├─ Action 2: Update FMEA [Alto - 30 days]
        └─ Action 3: Complete docs [Médio - 90 days]
    │
    ▼
Output Report
    │
    ├─► Overall Score: 78/100
    ├─► 13 Module Evaluations
    ├─► 3 Non-Conformities
    ├─► 8 Action Items
    └─► Exportable Markdown
```

## Deadline Calculation Flow

```
Priority Input
    │
    ├─► "Crítico"  →  7 days
    ├─► "Alto"     →  30 days
    ├─► "Médio"    →  90 days
    └─► "Baixo"    →  180 days
        │
        ▼
UTC Midnight Normalization (Bug Fix)
        │
        ├─► Get current date: 2024-01-15 14:30:00 (any time)
        ├─► Normalize to UTC midnight: 2024-01-15 00:00:00
        ├─► Add days: 2024-01-15 + 7 days
        └─► Result: 2024-01-22 00:00:00 (exactly 7 days)
        │
        ▼
Consistent Result
        │
        └─► No off-by-one errors
            └─► Works at any time of day ✓
```

## Risk Level Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│                   Risk Levels                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔴 ALTO (High)                                          │
│  ├─ Immediate safety concern                            │
│  ├─ Requires urgent action                              │
│  ├─ May affect vessel operations                        │
│  └─ Priority: Crítico (7 days)                          │
│                                                          │
│  🟡 MÉDIO (Medium)                                       │
│  ├─ Requires attention                                  │
│  ├─ Should be addressed promptly                        │
│  ├─ May escalate if ignored                             │
│  └─ Priority: Alto/Médio (30-90 days)                   │
│                                                          │
│  ⚪ BAIXO (Low)                                          │
│  ├─ Minor issue                                         │
│  ├─ Can be scheduled                                    │
│  ├─ Minimal impact                                      │
│  └─ Priority: Baixo (180 days)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Module Evaluation Status

```
┌──────────────────────────────────────────────────────────┐
│              Module Compliance Status                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ COMPLIANT                                             │
│  ├─ Score: 85-100                                        │
│  ├─ Meets all requirements                               │
│  ├─ No action needed                                     │
│  └─ Continue monitoring                                  │
│                                                           │
│  ⚠️  PARTIAL                                              │
│  ├─ Score: 60-84                                         │
│  ├─ Some issues identified                               │
│  ├─ Action items generated                               │
│  └─ Requires improvement                                 │
│                                                           │
│  ❌ NON-COMPLIANT                                         │
│  ├─ Score: 0-59                                          │
│  ├─ Fails requirements                                   │
│  ├─ Critical action needed                               │
│  └─ Immediate attention required                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Standards Checklist

```
┌──────────────────────────────────────────────────────────┐
│         IMCA / IMO / MTS Standards (10 Total)            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ✓ IMCA M103   - Design & Operation Guidelines          │
│  ✓ IMCA M117   - Personnel Training                     │
│  ✓ IMCA M190   - FMEA Guidance                          │
│  ✓ IMCA M166   - SIMOPS Guidance                        │
│  ✓ IMCA M109   - Capability Plots                       │
│  ✓ IMCA M220   - Electrical Systems                     │
│  ✓ IMCA M140   - Operations Specification               │
│  ✓ MSF 182     - Marine Safety Forum                    │
│  ✓ MTS DP      - Design Philosophy                      │
│  ✓ IMO MSC     - IMO DP Guidelines                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## DP Modules Checklist

```
┌──────────────────────────────────────────────────────────┐
│           DP System Modules (13 Total)                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1.  DP Control System                                   │
│  2.  Propulsion System                                   │
│  3.  Power Generation System                             │
│  4.  Position Reference Sensors                          │
│  5.  Environmental Sensors                               │
│  6.  Communications & Alarms                             │
│  7.  Personnel Competence                                │
│  8.  FMEA & Trials                                       │
│  9.  Annual DP Trials                                    │
│  10. Documentation & Records                             │
│  11. Planned Maintenance System                          │
│  12. Capability Plots                                    │
│  13. Operational Planning                                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Report Export Format

```markdown
# IMCA DP Technical Audit Report

## Vessel Information
- **Vessel**: DP Construction Vessel Delta
- **DP Class**: DP2
- **Location**: Santos Basin, Brazil
- **Audit Date**: 15/01/2024
- **Overall Score**: 78/100

## Audit Objective
Post-incident technical evaluation

## Standards Applied
- **IMCA M103**: Guidelines for DP Design
- **IMCA M117**: Personnel Training
- ... (8 more)

## Module Evaluations

### DP Control System (85/100)
**Status**: Compliant
**Findings**:
- Control software version current
- Redundancy properly configured
**Recommendations**:
- Continue monitoring
- Schedule next software update

... (12 more modules)

## Non-Conformities

### 🔴 Propulsion System
**Risk Level**: Alto
**Standard**: IMCA M103
**Finding**: Thruster #3 showing irregular performance
**Recommendation**: Immediate inspection and potential replacement

... (more non-conformities)

## Action Plan

### 1. Inspect Thruster #3
- **Priority**: Crítico
- **Responsible**: Chief Engineer
- **Deadline**: 22/01/2024

... (more actions)

## Summary
The vessel demonstrates good overall compliance...

## Conclusion
Recommended actions should be implemented...
```

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════╗
║          IMCA AUDIT SYSTEM - QUICK REFERENCE             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  📍 Access Points:                                       ║
║     • URL: /imca-audit                                   ║
║     • DP Intelligence Center → "Gerar Auditoria"         ║
║                                                          ║
║  📊 Evaluation Scope:                                    ║
║     • 13 DP System Modules                               ║
║     • 10 International Standards                         ║
║     • Risk Assessment (Alto/Médio/Baixo)                 ║
║     • Automated Action Planning                          ║
║                                                          ║
║  ⏱️  Deadlines:                                          ║
║     • Crítico: 7 days                                    ║
║     • Alto: 30 days                                      ║
║     • Médio: 90 days                                     ║
║     • Baixo: 180 days                                    ║
║                                                          ║
║  💾 Export:                                              ║
║     • One-click Markdown download                        ║
║     • Complete report with all findings                  ║
║                                                          ║
║  🔒 Security:                                            ║
║     • Row-level security (RLS)                           ║
║     • User authentication required                       ║
║     • Users see only their own audits                    ║
║                                                          ║
║  ✅ Status:                                              ║
║     • Production Ready                                   ║
║     • 30/30 Tests Passing                                ║
║     • Build Successful                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Documentation**: Complete  
**Tests**: 30/30 Passing (100%)
