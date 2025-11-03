# Pre-Port State Control (Pre-PSC) Module

## Overview

The Pre-Port State Control (Pre-PSC) module is a comprehensive self-assessment tool designed to help vessels prepare for official Port State Control inspections. Built on IMO Resolution A.1185(33) and DNV PSC Quick Guide standards, this module provides a digital checklist system with AI-powered analysis and automated reporting.

## Objectives

- **Anticipate Deficiencies**: Identify potential non-conformities before official PSC inspections
- **Ensure Compliance**: Verify adherence to international maritime regulations (IMO, SOLAS, MARPOL, MLC)
- **Risk Assessment**: AI-powered evaluation of compliance risks and recommendations
- **Documentation**: Generate comprehensive PDF reports with digital signatures
- **Historical Tracking**: Compare inspections over time to track improvements

## Features

### ✅ Comprehensive Checklist

Based on PSC Quick Guide (DNV) and IMO Res. 1185(A.33), covering:

- Certificates & Documentation
- Fire Safety Equipment
- Life Saving Appliances
- Navigation Equipment
- MARPOL Compliance
- ISM Code Implementation
- Radio Communications (GMDSS)
- Structure & Loadline
- Accommodation Standards
- Security (ISPS/SSP)
- MLC 2006 Requirements

### 📷 Evidence Management

- Upload photos and documents for each checklist item
- Attach evidence to support compliance claims
- Store evidence securely in Supabase Storage

### 🤖 AI-Powered Analysis

- Automatic risk assessment for each item
- Contextual recommendations based on findings
- Priority-based action plans
- Compliance score calculation

### 📊 Real-Time Scoring

- Overall compliance percentage
- Score breakdown by category
- Risk level assessment (Low, Medium, High, Critical)
- Flagged items counter

### 📝 PDF Report Generation

- Complete inspection report with all findings
- Digital signature support
- Historical record keeping
- Export capability for regulatory bodies

### 🔁 Historical Comparison

- Track inspection trends over time
- Compare compliance scores across inspections
- Identify recurring issues
- Monitor improvement progress

## Technical Architecture

### Database Schema

#### pre_psc_inspections

```sql
CREATE TABLE pre_psc_inspections (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  inspector_id UUID REFERENCES profiles(id),
  inspector_name TEXT NOT NULL,
  inspection_date TIMESTAMPTZ DEFAULT now(),
  port_country TEXT,
  inspection_type TEXT DEFAULT 'self-assessment',
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  
  -- AI Analysis & Scoring
  ai_summary TEXT,
  ai_risk_level TEXT CHECK (ai_risk_level IN ('low', 'medium', 'high', 'critical')),
  total_score INTEGER,
  conformity_percentage DECIMAL(5,2),
  flagged_items INTEGER,
  
  -- Findings & Recommendations
  findings JSONB,
  recommendations JSONB,
  corrective_actions JSONB,
  
  -- Digital Signature
  signed_by TEXT,
  signature_hash TEXT,
  signature_date TIMESTAMPTZ,
  
  -- PDF Report
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

#### pre_psc_checklist_items

```sql
CREATE TABLE pre_psc_checklist_items (
  id UUID PRIMARY KEY,
  inspection_id UUID REFERENCES pre_psc_inspections(id),
  
  -- Item Classification
  category TEXT NOT NULL,
  subcategory TEXT,
  item_code TEXT,
  question TEXT NOT NULL,
  reference_regulation TEXT,
  
  -- Response & Assessment
  response TEXT,
  conformity BOOLEAN,
  status TEXT CHECK (status IN ('pending', 'compliant', 'non_compliant', 'not_applicable', 'requires_action')),
  
  -- Evidence
  evidence_urls TEXT[],
  evidence_notes TEXT,
  
  -- AI Risk Assessment
  ai_risk_assessment TEXT,
  ai_confidence_score DECIMAL(3,2),
  ai_suggested_action TEXT,
  
  -- Corrective Actions
  corrective_action TEXT,
  action_priority TEXT CHECK (action_priority IN ('low', 'medium', 'high', 'critical')),
  action_deadline TIMESTAMPTZ,
  action_status TEXT CHECK (action_status IN ('pending', 'in_progress', 'completed', 'overdue')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  inspector_comments TEXT
);
```

### Key Components

#### 1. PrePSCDashboard.tsx
Main dashboard showing:
- Statistics cards (total inspections, average score, critical items, readiness status)
- Tab navigation (Overview, Form, History)
- Inspection creation and management

#### 2. PrePSCForm.tsx
Interactive checklist form with:
- Inspector information fields
- Progress tracking
- Categorized checklist items
- Status selection (Compliant, Non-Compliant, etc.)
- Priority assignment for non-compliant items
- Inspector comments
- Save draft and submit functionality

#### 3. pre-psc.service.ts
Service layer handling:
- CRUD operations for inspections
- Checklist item management
- Score calculation
- Statistics retrieval
- Supabase integration

#### 4. psc-score-calculator.ts
Utility functions for:
- Overall score calculation
- Category-wise breakdown
- Risk assessment
- Default checklist template

### Security

#### Row Level Security (RLS) Policies

```sql
-- Inspections: Read access for authenticated users
CREATE POLICY "Enable read for authenticated users" ON pre_psc_inspections
  FOR SELECT USING (auth.role() = 'authenticated');

-- Inspections: Insert access for authenticated users
CREATE POLICY "Enable insert for authenticated users" ON pre_psc_inspections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Inspections: Update access for creators
CREATE POLICY "Enable update for inspection creators" ON pre_psc_inspections
  FOR UPDATE USING (auth.uid() = inspector_id OR auth.role() = 'authenticated');

-- Similar policies for pre_psc_checklist_items
```

## User Workflow

### 1. Start New Inspection

1. Navigate to `/compliance/pre-psc`
2. Click "New Inspection" button
3. Fill in inspector details:
   - Inspector Name (required)
   - Port/Country (optional)
   - Inspection Date (defaults to today)

### 2. Complete Checklist

1. Review each category of the checklist
2. For each item:
   - Select status (Compliant, Non-Compliant, Requires Action, Not Applicable)
   - If non-compliant: assign priority (Low, Medium, High, Critical)
   - Add inspector comments and observations
   - Attach evidence (photos/documents) if available

### 3. Save or Submit

- **Save Draft**: Save progress and continue later (status = 'draft')
- **Submit Inspection**: Complete and submit (requires 100% completion)

### 4. View Results

- Review overall compliance score
- Check risk assessment
- View recommendations
- Generate PDF report

## API Integration

### AI Risk Assessment (Planned)

```typescript
// Example AI prompt for risk assessment
const prompt = `
You are a maritime technical auditor. Evaluate the following PSC checklist item:
Question: "${item.question}"
Inspector Response: "${item.response}"
Status: "${item.status}"

Based on ISM Code, MARPOL, and SOLAS regulations:
1. Assess the compliance risk (low/medium/high/critical)
2. Provide specific corrective actions if needed
3. Reference relevant regulations

Be concise and technical.
`;
```

### PDF Generation

Uses `jspdf` library to generate:
- Header with vessel and inspection details
- Checklist items grouped by category
- Compliance scores and charts
- AI summary and recommendations
- Digital signature

## Testing

### E2E Tests (Playwright)

Located in `e2e/pre-psc.spec.ts`:

- Dashboard display
- New inspection creation
- Form validation
- Checklist item updates
- Tab navigation
- Accessibility tests

Run tests:
```bash
npm run test:e2e
```

### Unit Tests (Vitest)

Service layer tests:
- CRUD operations
- Score calculation
- Risk assessment logic

Run tests:
```bash
npm run test
```

## Deployment

### Prerequisites

1. Supabase project with tables created
2. Environment variables configured:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Database Setup

Run migration:
```sql
-- Execute supabase/migrations/20251103140000_create_pre_psc_module.sql
```

### Build and Deploy

```bash
npm run build
npm run start
```

## Roadmap

### Phase 1: Core Features (Current)
- ✅ Checklist system
- ✅ Scoring algorithm
- ✅ Dashboard and forms
- ✅ Database integration

### Phase 2: AI Integration (Next)
- AI risk assessment API
- Natural language analysis
- Automated recommendations
- Smart evidence validation

### Phase 3: Advanced Features
- PDF report generation
- Digital signature integration
- Email notifications
- Mobile app support

### Phase 4: Analytics
- Historical trend analysis
- Multi-vessel comparison
- Predictive analytics
- Regulatory change alerts

## Support

For issues or questions:
- Check documentation: `/docs/modules/pre-psc.md`
- Review code: `/src/modules/compliance/pre-psc/`
- Test suite: `/e2e/pre-psc.spec.ts`

## Compliance Standards

This module is based on:
- **IMO Resolution A.1185(33)**: Procedures for Port State Control, 2013
- **SOLAS**: International Convention for the Safety of Life at Sea
- **MARPOL**: International Convention for the Prevention of Pollution from Ships
- **MLC 2006**: Maritime Labour Convention
- **ISM Code**: International Safety Management Code
- **ISPS Code**: International Ship and Port Facility Security Code

## License

Part of Nautilus One maritime operations platform.
