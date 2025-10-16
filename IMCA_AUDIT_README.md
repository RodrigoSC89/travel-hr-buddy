# IMCA DP Technical Audit System

## Overview

The IMCA DP Technical Audit System is a comprehensive solution for conducting technical audits of Dynamic Positioning (DP) vessels following international standards from IMCA (International Marine Contractors Association), IMO (International Maritime Organization), and MTS (Marine Technology Society).

## Features

### 1. AI-Powered Audit Generation
- **GPT-4o Integration**: Uses OpenAI's GPT-4o model for intelligent audit generation
- **Comprehensive Analysis**: Evaluates 12 key DP system modules
- **Standards-Based**: Applies 10 major international standards
- **Portuguese Language**: Full support for Brazilian Portuguese technical terminology

### 2. Standards Coverage

The system applies the following international standards:

| Code | Name | Category |
|------|------|----------|
| IMCA M103 | Design & Operation | Design |
| IMCA M117 | Personnel Training | Training |
| IMCA M190 | Annual Trials | Testing |
| IMCA M166 | FMEA | Design |
| IMCA M109 | Documentation | Documentation |
| IMCA M220 | Operations Planning | Planning |
| IMCA M140 | Capability Plots | Design |
| MSF 182 | OSV Operations | Operation |
| MTS DP Operations | Guidance | Operation |
| IMO MSC.1/Circ.1580 | Regulations | Design |

### 3. Audit Modules

The system evaluates the following modules:

1. **Sistema de Controle DP** - DP Control System
2. **Sistema de Propulsão** - Propulsion System
3. **Sensores de Posicionamento** - Positioning Sensors
4. **Rede e Comunicações** - Network and Communications
5. **Pessoal DP** - DP Personnel
6. **Logs e Históricos** - Logs and History
7. **FMEA** - Failure Modes and Effects Analysis
8. **Testes Anuais** - Annual Trials
9. **Documentação** - Documentation
10. **Power Management System** - PMS
11. **Capability Plots** - Performance charts
12. **Planejamento Operacional** - Operational Planning

### 4. Audit Report Structure

Each audit report includes:

- **Context**: Background and scenario description
- **Non-Conformities**: Detailed findings with:
  - Module affected
  - Standard violated
  - Risk level (High/Medium/Low)
  - Probable causes
  - Corrective actions
  - Verification requirements
- **Action Plan**: Prioritized list of actions with:
  - Priority level (Critical/High/Medium/Low)
  - Recommended deadline
  - Responsible party
  - Verification method
- **Summary**: Executive summary
- **Recommendations**: Next steps and final recommendations

### 5. Export Capabilities

- **Markdown Format**: Export to Markdown for easy conversion to PDF
- **Structured Data**: Save to database for historical tracking
- **Full-Text Search**: Portuguese-language search capabilities

## Technical Architecture

### Components

```
src/
├── types/
│   └── imca-audit.ts              # Type definitions
├── services/
│   └── imca-audit-service.ts      # Business logic and API calls
├── components/
│   └── imca-audit/
│       └── imca-audit-generator.tsx  # UI component
└── pages/
    └── IMCAAudit.tsx              # Page wrapper

supabase/
├── migrations/
│   └── 20251016031500_create_imca_audits_table.sql  # Database schema
└── functions/
    └── imca-audit-generator/
        └── index.ts               # Edge function for AI generation
```

### Database Schema

**Table: `imca_audits`**

```sql
CREATE TABLE public.imca_audits (
  id UUID PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  operation_type TEXT CHECK (operation_type IN ('navio', 'terra')),
  location TEXT,
  dp_class TEXT CHECK (dp_class IN ('DP1', 'DP2', 'DP3')),
  audit_objective TEXT,
  audit_date DATE,
  audit_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('draft', 'completed', 'reviewed')),
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**View: `imca_audit_statistics`**

Provides aggregated statistics:
- Total audits
- Audits by DP class (DP1/DP2/DP3)
- Audits by status (draft/completed/reviewed)
- Average non-conformities
- Critical issues count

### Security

- **Row-Level Security (RLS)**: Enabled on all tables
- **Authentication Required**: Only authenticated users can access audits
- **User Ownership**: Users can only update their own audits
- **CORS Support**: Configured for Edge Functions

## Usage Guide

### 1. Accessing the System

Navigate to: `/imca-audit`

### 2. Creating an Audit

#### Step 1: Basic Data

Fill in the required information:
- **Vessel/Operation Name**: Name of the vessel or operation
- **Operation Type**: Ship (navio) or Land (terra)
- **Location**: Geographic location
- **DP Class**: DP1, DP2, or DP3
- **Audit Date**: Date of the audit
- **Audit Objective**: Purpose and scope of the audit

#### Step 2: Operational Data (Optional)

If the audit is related to a specific incident, provide:
- Incident description
- Environmental conditions
- System status
- Operator actions
- TAM activation status
- Log completeness
- Additional notes

#### Step 3: Generate Audit

Click "Gerar Auditoria" to generate the AI-powered audit report.

### 3. Reviewing Results

The Results tab shows:
- Full audit context
- Standards applied
- Non-conformities with risk levels
- Prioritized action plan
- Summary and recommendations

### 4. Exporting

- **Save to Database**: Click "Salvar Auditoria" to store in the system
- **Export Markdown**: Click "Exportar Markdown" to download as .md file

## API Reference

### Service Functions

```typescript
// Generate audit using AI
generateAudit(request: AuditGenerationRequest): Promise<IMCAAuditReport>

// Save audit to database
saveAudit(audit: IMCAAuditReport, userId?: string): Promise<string>

// Load audit from database
loadAudit(auditId: string): Promise<IMCAAuditReport>

// List all audits
listAudits(limit?: number, offset?: number): Promise<IMCAAuditReport[]>

// Get statistics
getAuditStatistics(): Promise<AuditStatistics>

// Export to Markdown
exportAuditToMarkdown(audit: IMCAAuditReport): string

// Download Markdown file
downloadAuditMarkdown(audit: IMCAAuditReport): void
```

### Edge Function Endpoint

**Endpoint**: `/functions/v1/imca-audit-generator`

**Method**: POST

**Request Body**:
```json
{
  "basicData": {
    "vesselName": "Aurora Explorer",
    "operationType": "navio",
    "location": "Santos - SP, Brasil",
    "dpClass": "DP2",
    "auditObjective": "Auditoria de verificação...",
    "auditDate": "2025-10-16"
  },
  "operationalData": {
    "incidentDescription": "Falha parcial do sensor GNSS...",
    "environmentalConditions": "Vento moderado de 15 nós...",
    "systemStatus": "TAM ativado automaticamente...",
    "operatorActions": "Operador reconheceu alarme...",
    "tamActivation": true,
    "logCompleteness": "Logs parcialmente completos..."
  },
  "includeAllModules": true
}
```

**Response**:
```json
{
  "basicData": { ... },
  "operationalData": { ... },
  "context": "...",
  "modulesAudited": [...],
  "standardsApplied": [...],
  "nonConformities": [...],
  "actionPlan": [...],
  "summary": "...",
  "recommendations": "...",
  "status": "draft",
  "generatedAt": "2025-10-16T15:42:13.775Z"
}
```

## Environment Variables

Required environment variables:

```bash
# OpenAI API Key for audit generation
OPENAI_API_KEY=sk-...

# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Testing the Edge Function

```bash
# Using Supabase CLI
supabase functions serve imca-audit-generator

# Test with curl
curl -X POST http://localhost:54321/functions/v1/imca-audit-generator \
  -H "Content-Type: application/json" \
  -d @test-audit-request.json
```

### Database Migrations

```bash
# Apply migration
supabase db push

# Reset and reapply
supabase db reset
```

## Best Practices

### Audit Generation

1. **Be Specific**: Provide detailed incident descriptions for better analysis
2. **Complete Data**: Fill all available fields for comprehensive audits
3. **Context Matters**: Include environmental conditions and system status
4. **Review Carefully**: Always review generated audits before finalizing

### Data Management

1. **Regular Backups**: Export important audits to Markdown
2. **Status Tracking**: Update audit status as work progresses
3. **Review Process**: Assign reviewers for completed audits
4. **Archival**: Keep historical audits for trend analysis

### Security

1. **Access Control**: Only share audits with authorized personnel
2. **Sensitive Data**: Be careful with vessel-specific information
3. **Data Privacy**: Follow company policies for audit storage
4. **Audit Trail**: Track who generates and reviews audits

## Future Enhancements

### Planned Features

- [ ] Scheduled periodic audits
- [ ] Approval workflow system
- [ ] Trends dashboard
- [ ] Native PDF export
- [ ] Email notifications for deadlines
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Template library
- [ ] Audit comparison tools
- [ ] Advanced analytics

## Support

For issues or questions:
1. Check the existing documentation
2. Review the type definitions in `src/types/imca-audit.ts`
3. Consult the service implementation in `src/services/imca-audit-service.ts`
4. Contact the development team

## License

This system is part of the Travel HR Buddy platform and follows the same license terms.

## Changelog

### Version 1.0.0 (2025-10-16)
- Initial release
- AI-powered audit generation
- 10 international standards support
- 12 module evaluation
- Markdown export
- Database storage with RLS
- Full-text search in Portuguese
- Statistics view

---

**Developed with ❤️ for the maritime industry**
