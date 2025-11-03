# LSA & FFA Inspections Module

## Overview

The LSA & FFA Inspections module provides comprehensive inspection management for Life-Saving Appliances (LSA) and Fire-Fighting Appliances (FFA) based on SOLAS (Safety of Life at Sea) regulations. This module integrates AI-powered recommendations, automated compliance scoring, and professional PDF report generation.

## Features

### ✅ Core Functionality
- **Dual Inspection Types**: Support for both LSA and FFA inspections with category-specific checklists
- **Dynamic Checklists**: Pre-configured inspection items based on SOLAS requirements
- **Issue Tracking**: Comprehensive deficiency management with severity levels
- **Compliance Scoring**: Automatic calculation of compliance scores (0-100%)
- **Digital Signatures**: Inspector signature capture and validation
- **PDF Export**: Professional SOLAS-compliant report generation

### 🤖 AI Integration
- **OpenAI GPT-4 Powered Insights**: Intelligent recommendations based on inspection results
- **Risk Assessment**: Automated risk analysis aligned with SOLAS standards
- **Next Actions**: AI-generated corrective action suggestions
- **Contextual Analysis**: Custom prompts for specific concerns

### 📊 Dashboard & Analytics
- **Statistics Overview**: Total inspections, average scores, critical issues
- **Compliance Status**: Real-time compliance level indicators
- **Recent Activity**: Timeline of latest inspections
- **Critical Alerts**: Immediate notification of high-risk conditions

### 🔒 Security
- **Row Level Security**: Supabase RLS policies for vessel-based access control
- **Signature Validation**: Cryptographic validation of inspection signatures
- **Audit Trail**: Complete tracking of inspection creation and modifications

## Technical Architecture

### Database Schema
```sql
Table: lsa_ffa_inspections
- id (UUID, primary key)
- vessel_id (UUID, foreign key to vessels)
- inspector (TEXT)
- date (TIMESTAMPTZ)
- type ('LSA' | 'FFA')
- checklist (JSONB)
- issues_found (JSONB)
- score (INTEGER, 0-100)
- ai_notes (TEXT)
- signature_data (TEXT)
- signature_validated (BOOLEAN)
- created_at, updated_at, created_by, reviewed_by, reviewed_at
```

### File Structure
```
src/modules/lsa-ffa-inspections/
├── index.tsx                  # Main dashboard component
├── LSAFFAForm.tsx            # Inspection form with tabs
├── LSAFFAInsightAI.tsx       # AI recommendations component
├── ReportGenerator.ts        # PDF export functionality
└── useLsaFfa.ts             # Custom React hook

src/services/
└── lsa-ffa-inspection.service.ts  # API service layer

src/lib/
├── scoreCalculator.ts        # Compliance scoring logic
└── signatureValidator.ts     # Signature validation

src/types/
└── lsa-ffa.ts               # TypeScript type definitions

supabase/migrations/
└── 20251103141300_create_lsa_ffa_inspections.sql  # Database schema

tests/e2e/
└── lsa-ffa.spec.ts          # End-to-end tests
```

## LSA Categories (SOLAS Chapter III)
1. Lifeboats
2. Life Rafts
3. Rescue Boats
4. Life Jackets
5. Immersion Suits
6. Thermal Protective Aids
7. Visual Signals
8. Sound Signals
9. Line-Throwing Appliances
10. Emergency Position-Indicating Radio Beacons (EPIRB)
11. Search and Rescue Transponders (SART)
12. Lifeboat Equipment
13. Davits and Launching Arrangements

## FFA Categories (SOLAS Chapter II-2)
1. Portable Fire Extinguishers
2. Fixed Fire Extinguishers
3. Fire Hoses and Nozzles
4. Fire Pumps
5. Fire Main System
6. Sprinkler Systems
7. Fire Detection Systems
8. Fire Alarm Systems
9. Emergency Fire Pumps
10. Fixed Gas Extinguishing Systems
11. Fixed Foam Systems
12. Fire Doors and Dampers
13. Firemen's Outfits
14. Breathing Apparatus
15. Emergency Escape Breathing Devices (EEBD)

## Usage

### Creating a New Inspection

```typescript
import { useLsaFfa } from '@/modules/lsa-ffa-inspections/useLsaFfa';

function MyComponent() {
  const { createInspection } = useLsaFfa({ vesselId: 'vessel-123' });

  const handleCreate = async () => {
    await createInspection({
      vessel_id: 'vessel-123',
      inspector: 'John Doe',
      date: new Date().toISOString(),
      type: 'LSA',
      checklist: {},
      issues_found: [],
      score: 0,
    });
  };
}
```

### Calculating Compliance Score

```typescript
import { calculateInspectionScore } from '@/lib/scoreCalculator';

const scoreData = calculateInspectionScore(checklist, issues);
// Returns: { overallScore, checklistScore, issuesPenalty, categoryScores, complianceLevel, recommendation }
```

### Generating PDF Report

```typescript
import { downloadInspectionReport } from '@/modules/lsa-ffa-inspections/ReportGenerator';

await downloadInspectionReport(inspection, vesselName, {
  format: 'pdf',
  includeEvidence: false,
  includeAINotes: true,
  includeSignature: true,
  language: 'en',
});
```

## Compliance Levels

| Score Range | Level | Color | Description |
|------------|-------|-------|-------------|
| 90-100% | Excellent | Green | Exceeds SOLAS requirements |
| 75-89% | High | Blue | Fully compliant |
| 60-74% | Medium | Yellow | Conditionally compliant |
| 40-59% | Low | Orange | Non-compliant, action required |
| 0-39% | Critical | Red | Serious deficiencies |

## Issue Severity Levels

| Severity | Penalty | Description |
|----------|---------|-------------|
| Critical | -15 points | Immediate safety risk |
| Major | -10 points | Significant compliance issue |
| Minor | -5 points | Minor deficiency |
| Observation | 0 points | Informational note |

## API Endpoints (via Supabase)

All data operations are performed through the Supabase client with Row Level Security:

- `GET /lsa_ffa_inspections` - List inspections
- `POST /lsa_ffa_inspections` - Create inspection
- `PATCH /lsa_ffa_inspections/:id` - Update inspection
- `DELETE /lsa_ffa_inspections/:id` - Delete inspection (admin only)

## Environment Variables

```env
VITE_OPENAI_API_KEY=your_openai_api_key  # Required for AI insights
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Specific Module Tests
```bash
npm run test:e2e -- tests/e2e/lsa-ffa.spec.ts
```

## Integration with Compliance Hub

The module automatically integrates with the Compliance Hub dashboard:
- Inspection statistics appear in compliance metrics
- Critical issues trigger System Watchdog alerts
- Scores contribute to overall vessel compliance rating

## Future Enhancements

### Planned Features
- ✅ Checklist semanal/mensal/anual (pré-definido)
- ✅ Recomendador de peças sobressalentes
- ✅ Integração com agendamento global
- 📅 Automated inspection scheduling
- 📅 Predictive maintenance recommendations
- 📅 Multi-vessel fleet-wide analytics
- 📅 Mobile offline inspection support

## Troubleshooting

### Common Issues

**1. AI Insights Not Working**
- Ensure `VITE_OPENAI_API_KEY` is set in environment variables
- Check OpenAI API quota and billing status

**2. Database Connection Errors**
- Verify Supabase credentials in environment
- Check RLS policies for user permissions

**3. Signature Not Saving**
- Ensure signature canvas is not empty
- Check file size limits (signatures converted to base64)

## Support

For issues or feature requests, please refer to the project's issue tracker or documentation.

## License

This module is part of the Travel HR Buddy maritime management system.

---

**Version**: 1.0.0  
**Last Updated**: November 3, 2025  
**SOLAS Compliance**: Chapter II-2 (FFA), Chapter III (LSA)
