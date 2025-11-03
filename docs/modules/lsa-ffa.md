# LSA/FFA Inspection Module

## Overview

The LSA/FFA (Life Saving Appliances / Fire Fighting Appliances) Inspection Module is a comprehensive digital inspection system designed to comply with SOLAS Chapter III Regulation 20 and MSC Circulars 1093 and 1206.

## Features

### 🛟 LSA Inspections
- Lifeboat and launching appliance inspections
- Liferaft and davit system checks
- Immersion suits and lifejacket verification
- Emergency equipment validation
- EPIRB and SART testing

### 🔥 FFA Inspections
- Fire extinguisher inspections
- Fire hose and nozzle checks
- Fire pump operation tests
- Fire detection system validation
- Fixed fire fighting systems
- Breathing apparatus checks

### 🤖 AI-Powered Analysis
- Automated compliance scoring
- Risk rating assessment (Low, Medium, High, Critical)
- Predictive failure analysis
- Maintenance priority recommendations
- Contextual suggestions based on SOLAS requirements

### 📊 Dashboard & Analytics
- Real-time compliance metrics
- Historical inspection trends
- Critical issues tracking
- Overdue corrective actions monitoring
- Equipment defect analytics

### 📄 Automated Reporting
- PDF report generation with SOLAS references
- Executive summaries
- Detailed checklist results
- Issue tracking and corrective actions
- Equipment condition reports

## Database Schema

### Tables

#### 1. `lsa_ffa_inspections`
Main inspection records with checklist results and AI analysis.

**Key Fields:**
- `vessel_id`: Reference to vessel
- `inspector`: Inspector name
- `type`: LSA or FFA
- `frequency`: weekly, monthly, annual, ad_hoc
- `checklist`: JSONB array of checklist items
- `issues_found`: JSONB array of non-conformities
- `score`: Compliance score (0-100)
- `ai_notes`: AI-generated analysis
- `ai_risk_rating`: Risk assessment (low, medium, high, critical)

#### 2. `lsa_ffa_equipment`
Individual equipment items tracked during inspections.

**Key Fields:**
- `inspection_id`: Reference to inspection
- `equipment_type`: Type of equipment (lifeboat, fire_extinguisher, etc.)
- `condition`: good, fair, poor, defective
- `compliant`: Boolean compliance status
- `ai_maintenance_priority`: AI-predicted maintenance priority

#### 3. `lsa_ffa_checklist_templates`
Pre-configured checklists based on SOLAS requirements.

**Default Templates:**
- LSA Weekly Inspection (SOLAS III/20.6.1)
- LSA Monthly Inspection (SOLAS III/20.6.2)
- FFA Weekly Inspection (SOLAS II-2/14.2.1)
- FFA Monthly Inspection (SOLAS II-2/14.2.2)

#### 4. `lsa_ffa_reports`
Generated PDF reports and AI summaries.

#### 5. `lsa_ffa_compliance_stats`
Aggregated statistics for dashboard analytics.

## Inspection Flow

### 1. Create Inspection
```typescript
// Select vessel
// Choose inspection type (LSA or FFA)
// Select frequency (weekly, monthly, annual, ad_hoc)
// Load appropriate checklist template
```

### 2. Complete Checklist
```typescript
// Mark each item as checked/unchecked
// Add notes for failed items
// Document issues and non-conformities
// Specify severity (minor, major, critical)
```

### 3. Score Calculation
```typescript
score = (checkedItems / totalItems) * 100
// Automatic calculation on save
```

### 4. AI Analysis
```typescript
// Click "Analyze Inspection"
// AI generates:
// - Executive summary
// - Risk rating
// - Compliance recommendations
// - Predicted issues
```

### 5. Generate Report
```typescript
// PDF report includes:
// - Vessel information
// - Inspection details
// - Checklist results
// - Issues and corrective actions
// - AI analysis
// - SOLAS references
```

## Score Calculation

The compliance score is automatically calculated based on checklist completion:

```typescript
const totalItems = checklist.length;
const checkedItems = checklist.filter(item => item.checked).length;
const score = Math.round((checkedItems / totalItems) * 100);
```

**Score Ranges:**
- 90-100%: Excellent compliance (Low risk)
- 70-89%: Good compliance (Medium risk)
- 50-69%: Needs improvement (High risk)
- 0-49%: Critical deficiencies (Critical risk)

## AI Validation

The AI analysis component provides:

### Risk Assessment
Based on:
- Compliance score
- Number of critical issues
- Failed checklist items
- Historical vessel data

### Recommendations
- SOLAS-compliant corrective actions
- Maintenance scheduling suggestions
- Crew training recommendations
- Equipment replacement priorities

### Predictive Analysis
- Failure date predictions for equipment
- Maintenance priority ranking
- Trend analysis across inspections

## SOLAS Compliance References

### LSA Requirements
- **SOLAS III/20.6.1**: Weekly inspections of lifeboats and launching appliances
- **SOLAS III/20.6.2**: Monthly operational tests
- **SOLAS III/20.7**: Annual thorough examination
- **MSC/Circ.1093**: Revised Guidelines for Maintenance and Inspection Plans

### FFA Requirements
- **SOLAS II-2/14.2.1**: Weekly fire safety equipment inspections
- **SOLAS II-2/14.2.2**: Monthly fire fighting system tests
- **MSC/Circ.1432**: Fire protection systems maintenance guidelines

## API Usage

### Fetch Inspections
```typescript
const { inspections, loading } = useLsaFfa(vesselId);
```

### Create Inspection
```typescript
const { createInspection } = useLsaFfa(vesselId);

await createInspection({
  vessel_id: vesselId,
  inspector: 'John Doe',
  type: 'LSA',
  frequency: 'weekly',
  checklist: [...],
  issues_found: [...],
});
```

### Generate PDF Report
```typescript
import { ReportGenerator } from './ReportGenerator';

await ReportGenerator.downloadPDF(inspection, vessel, equipment);
```

## Dashboard Metrics

The dashboard provides key performance indicators:

### Total Inspections
Count of all LSA and FFA inspections for the vessel.

### Average Compliance Score
Mean score across all inspections with trend indicator.

### Critical Issues
Count of critical severity issues requiring immediate action.

### Overdue Actions
Corrective actions past their deadline.

### Most Defective Equipment
Equipment types with highest non-compliance rates.

## Testing

Run the test suite:
```bash
npm test tests/modules/lsa-ffa.spec.ts
```

**Test Coverage:**
- Inspection data management
- Score calculation
- Risk assessment
- SOLAS compliance validation
- Report generation
- AI analysis simulation
- Data validation
- Integration workflows

## Security

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only view inspections for their vessels
- Inspectors can manage their own inspections
- Draft inspections can be deleted by creator
- Admins can manage templates

### Data Validation
- Required field validation
- Enum type constraints
- Score range validation (0-100)
- Date consistency checks

## Exports

The module supports:
- PDF reports (single inspection)
- PDF summary reports (multiple inspections)
- CSV data export (planned)
- Excel workbook export (planned)

## Integration Points

### Supabase Tables
- `vessels`: Vessel master data
- `lsa_ffa_inspections`: Main inspection records
- `lsa_ffa_equipment`: Equipment tracking
- `lsa_ffa_checklist_templates`: SOLAS-based templates
- `lsa_ffa_reports`: Generated reports
- `lsa_ffa_compliance_stats`: Dashboard statistics

### External Services
- AI/LLM API for analysis (configurable)
- Email notification service (planned)
- SMS alerts for critical issues (planned)

## Future Enhancements

### Phase 2
- Real-time collaboration during inspections
- Mobile app for offline inspections
- Photo/video evidence attachment
- OCR for equipment serial numbers
- Signature capture for sign-offs

### Phase 3
- Advanced analytics dashboard with charts
- Predictive maintenance scheduling
- Fleet-wide compliance comparison
- Automated regulatory reporting
- Integration with vessel management systems

## Support

For questions or issues:
1. Check this documentation
2. Review test cases in `tests/modules/lsa-ffa.spec.ts`
3. Examine component source code
4. Contact development team

## Changelog

### Version 1.0.0 (PATCH 595)
- Initial release
- Complete LSA/FFA inspection module
- SOLAS-compliant checklists
- AI-powered analysis
- PDF report generation
- Dashboard with compliance metrics
- Comprehensive test coverage
