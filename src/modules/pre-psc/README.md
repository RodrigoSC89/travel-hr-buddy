# Pre-Port State Control (Pre-PSC) Module

## Overview

The Pre-PSC module provides vessels with a comprehensive internal audit system based on Port State Control guidelines. It enables crews to conduct thorough inspections before official PSC visits, identifying and addressing potential deficiencies proactively.

## Features

### ✅ Core Functionality

- **Digital PSC Checklist**: Comprehensive inspection checklist based on Tokyo MOU and Paris MOU guidelines
- **AI-Powered Assistant**: Real-time guidance and explanations for PSC requirements
- **Automatic Scoring**: Weighted compliance scoring with severity-based calculations
- **Risk Assessment**: Automatic classification of risk levels (Low, Medium, High, Critical)
- **Digital Signatures**: SHA-256 hash-based verification for report integrity
- **PDF Export**: Professional inspection reports with jsPDF
- **System Watchdog Integration**: Automatic alerts for critical non-compliance
- **Compliance Hub Integration**: Centralized compliance dashboard access
- **Vessel History**: Track inspection history per vessel

### 🔐 Security Features

- **Digital Signature Validation**: RSA-like hash verification for tamper detection
- **Row Level Security**: Supabase RLS policies for vessel-based data access
- **Audit Trail**: Complete inspection history with timestamps

### 📊 Scoring System

The module uses a weighted scoring system:
- **Critical severity**: 10x weight
- **High severity**: 4x weight
- **Medium severity**: 2x weight
- **Low severity**: 1x weight

Risk levels are determined by:
- **Critical**: Any critical findings OR score < 60%
- **High**: Score 60-74%
- **Medium**: Score 75-89%
- **Low**: Score ≥ 90%

## Module Structure

```
src/modules/pre-psc/
├── index.tsx                    # Main dashboard
├── PrePSCForm.tsx              # Inspection checklist form
├── PSCAIAssistant.tsx          # AI assistant interface
├── PSCScoreCalculator.ts       # Scoring logic
└── PSCAlertTrigger.ts          # Watchdog integration

src/lib/psc/
├── PSCReportGenerator.ts       # PDF generation
└── PSCSignatureValidator.ts    # Digital signatures

supabase/migrations/
└── 20250103_pre_psc_inspections.sql  # Database schema

tests/
├── pre-psc.test.tsx            # Integration tests
└── score-validation.test.ts    # Scoring unit tests
```

## Database Schema

### Table: `pre_psc_inspections`

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique inspection identifier |
| vessel_id | UUID | Reference to vessel |
| inspector_name | TEXT | Inspector conducting audit |
| inspection_date | TIMESTAMPTZ | Date/time of inspection |
| findings | JSONB | Array of inspection findings |
| recommendations | JSONB | Array of recommendations |
| score | INTEGER | Compliance score (0-100) |
| signed_by | TEXT | Digital signature author |
| signature_hash | TEXT | SHA-256 verification hash |
| risk_flag | BOOLEAN | High/critical risk indicator |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### RLS Policies

- Users can view/edit inspections for their assigned vessel
- Admins can view all inspections
- Automatic timestamp updates via triggers

## PSC Checklist Categories

The inspection covers 8 major categories with 50+ items:

1. **Certificates & Documentation**
   - Load Line Certificate, IOPP, ISM, etc.
   
2. **Life-Saving Appliances**
   - Lifeboats, liferafts, lifejackets, etc.
   
3. **Fire Safety**
   - Detection systems, extinguishers, drills
   
4. **Navigation Equipment**
   - Gyro, radar, ECDIS, AIS, GMDSS
   
5. **Structural Condition**
   - Hull, watertight integrity, tanks
   
6. **Propulsion & Machinery**
   - Main engine, steering, fuel systems
   
7. **Pollution Prevention**
   - OWS, ballast water, sewage treatment
   
8. **Working & Living Conditions**
   - Accommodation, medical facilities, hours of rest

## Usage

### Starting a New Inspection

```typescript
// Navigate to Pre-PSC module
navigate('/pre-psc');

// Or from Compliance Hub
<ComplianceHub /> // Click "Pre-PSC Inspection" card
```

### Conducting an Inspection

1. Enter inspector name
2. For each checklist item:
   - Select status: Compliant / Non-Compliant / Observation / N/A
   - If non-compliant, select severity: Low / Medium / High / Critical
   - Add description/notes
3. Add general recommendations
4. Submit inspection

### Viewing Results

Results automatically display:
- Overall compliance score
- Risk level classification
- Critical findings count
- Category-wise scores
- AI-generated recommendations
- Digital signature verification

### Exporting Reports

Click "Export PDF" to download a professional report including:
- Inspection details
- Compliance scoring
- Detailed findings table
- Recommendations
- Digital signature

## AI Assistant Usage

The AI Assistant provides:
- PSC regulation explanations
- Best practice guidance
- Deficiency resolution advice
- Real-time Q&A support

Example queries:
- "What documents are required for ISM certification?"
- "How should I prepare for a PSC inspection?"
- "What are the requirements for lifeboat maintenance?"

## System Watchdog Integration

When an inspection detects:
- Critical findings (any quantity)
- High risk level
- Score < 75%

The system automatically:
1. Triggers System Watchdog alert
2. Logs event details
3. Notifies shore management (if configured)

## Testing

```bash
# Run all Pre-PSC tests
npm test tests/pre-psc.test.tsx
npm test tests/score-validation.test.ts

# Run with coverage
npm run test:coverage
```

**Test Coverage:**
- ✅ 16 score calculation tests
- ✅ 10 integration tests
- ✅ All core functionality validated

## API Integration

### Creating an Inspection

```typescript
const inspection = {
  id: `PSC-${Date.now()}`,
  vessel_id: vesselId,
  inspector_name: 'John Smith',
  inspection_date: new Date().toISOString(),
  findings: [...],
  recommendations: [...],
  score: 85,
  signed_by: 'John Smith',
  signature_hash: '...',
  risk_flag: false,
};

const { error } = await supabase
  .from('pre_psc_inspections')
  .insert(inspection);
```

### Querying History

```typescript
const { data } = await supabase
  .from('pre_psc_inspections')
  .select('*')
  .eq('vessel_id', vesselId)
  .order('inspection_date', { ascending: false });
```

## Dependencies

- **jsPDF**: PDF report generation
- **jsPDF-AutoTable**: Table formatting in PDFs
- **@ai/kernel**: AI assistant backend
- **Supabase**: Data persistence and RLS
- **React**: UI framework
- **Shadcn/UI**: Component library

## Future Enhancements

Planned features (from requirements):
- ⏳ Automated inspection scheduling
- ⏳ Country-specific PSC risk analysis
- ⏳ AI-powered deficiency explanations for training
- ⏳ Integration with external PSC databases
- ⏳ Multi-language support for international crews

## Support

For issues or questions:
1. Check System Watchdog logs
2. Review inspection history
3. Consult AI Assistant
4. Contact shore management

## Version

Current: v1.0.0 (Initial Release)
Status: ✅ Fully Operational

Last Updated: November 3, 2025
