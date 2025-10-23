# SGSO Module

## Purpose / Description

The SGSO (Sistema de Gestão de Saúde e Segurança Ocupacional / Health and Safety Management System) module manages **occupational health, safety, and compliance** according to maritime and organizational safety standards.

**Key Use Cases:**
- Manage safety procedures and protocols
- Track incidents and near-misses
- Conduct safety audits and inspections
- Monitor safety compliance
- Manage safety training and certifications
- Risk assessment and hazard identification
- Emergency response planning
- Safety reporting and analytics

## Folder Structure

```bash
src/modules/sgso/
├── components/      # Safety UI components (IncidentCard, SafetyChecklist, RiskMatrix)
├── pages/           # Safety management pages (Incidents, Audits, Training)
├── hooks/           # Hooks for safety operations
├── services/        # Safety services and compliance tracking
├── types/           # TypeScript types for incidents, audits, risks
└── utils/           # Safety utilities and calculations
```

## Main Components / Files

- **IncidentCard.tsx** — Display and report safety incidents
- **SafetyChecklist.tsx** — Safety inspection checklists
- **RiskMatrix.tsx** — Risk assessment visualization
- **AuditForm.tsx** — Safety audit interface
- **TrainingTracker.tsx** — Safety training management
- **sgsoService.ts** — Safety operations service
- **riskCalculator.ts** — Risk assessment calculations

## External Integrations

- **Supabase** — Safety data storage
- **Sistema Marítimo Module** — Maritime safety integration
- **Checklists Inteligentes** — Safety checklist integration
- **PEOTRAM Module** — Operational excellence integration

## Status

🟢 **Functional** — Safety management system operational

## TODOs / Improvements

- [ ] Add predictive analytics for incident prevention
- [ ] Implement mobile app for field safety reporting
- [ ] Add photo/video evidence for incidents
- [ ] Create safety KPI dashboard
- [ ] Implement automated safety alerts
- [ ] Add regulatory compliance tracking
- [ ] Create safety culture metrics
