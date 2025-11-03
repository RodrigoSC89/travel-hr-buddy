# MLC Digital Inspection Module

## Overview

The MLC (Maritime Labour Convention) Digital Inspection Module is an intelligent system for conducting MLC 2006 compliance inspections with AI assistance. This module streamlines the inspection process, automates report generation, and helps prevent vessel detentions during Port State Control inspections.

## Features

### 🔍 Digital Inspection Checklist
- Interactive checklist based on MLC 2006 requirements (Titles 1-5)
- Real-time compliance tracking
- Severity classification (Critical, Major, Minor, Observation)
- AI-powered suggestions and explanations
- Evidence attachment capabilities

### 🤖 AI Assistant
- Intelligent chatbot with MLC 2006 knowledge base
- Instant answers about regulations and requirements
- Context-aware recommendations
- Multilingual support

### 📊 Automated Reporting
- AI-generated compliance reports
- Risk assessment and scoring
- Export to PDF, DOCX, and JSON formats
- Automatic translation support

### 📸 Evidence Management
- Upload documents, photos, and videos
- OCR text extraction
- AI-powered image analysis
- Evidence linking to specific findings

### 📈 Analytics & Insights
- Compliance score tracking
- Historical trend analysis
- Risk identification
- Preventive recommendations

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- Supabase account (for database)
- Access to the Travel HR Buddy application

### Installation

The MLC Inspection Module is integrated into the Travel HR Buddy platform. No separate installation is required.

### Database Setup

Run the migration to create the necessary tables:

```bash
# The migration file is located at:
# supabase/migrations/20251103000000_create_mlc_inspection_module.sql
```

This creates the following tables:
- `mlc_inspections` - Main inspection records
- `mlc_findings` - Individual checklist items and findings
- `mlc_evidences` - Uploaded evidence files
- `mlc_ai_reports` - AI-generated analysis reports

## Usage Guide

### Creating a New Inspection

1. Navigate to **MLC Inspection** in the main menu
2. Click **New Inspection** button
3. Fill in the required information:
   - Vessel ID
   - Inspector Name
   - Inspection Type (Initial, Renewal, Intermediate, Port State Control, Flag State)
   - Notes (optional)
4. Click **Create Inspection**

### Completing the Checklist

1. Select an inspection from the Overview tab
2. Navigate to the **Checklist** tab
3. For each MLC requirement:
   - Click **Inspect** to evaluate
   - Mark as Compliant or Non-Compliant
   - If non-compliant, select severity level
   - Add corrective action notes
   - Save the finding

### Using the AI Assistant

1. Navigate to the **AI Assistant** tab
2. Type your question about MLC regulations
3. Receive instant answers with references to specific MLC sections
4. Ask follow-up questions for clarification

### Uploading Evidence

1. Navigate to the **Evidence** tab
2. Select files to upload (images, PDFs, documents)
3. Add descriptions for context
4. Link evidence to specific findings

### Generating Reports

1. Complete the inspection checklist
2. Navigate to the **Reports** tab
3. Click **Generate Report**
4. Review the AI-generated summary
5. Export in your preferred format (PDF, DOCX, JSON)

## MLC 2006 Checklist Coverage

The module covers all five titles of the MLC 2006:

### Title 1: Minimum Requirements for Seafarers to Work on a Ship
- Regulation 1.1: Minimum age
- Regulation 1.2: Medical certification
- Regulation 1.3: Training and qualifications

### Title 2: Conditions of Employment
- Regulation 2.1: Seafarers' employment agreements
- Regulation 2.2: Wages
- Regulation 2.3: Hours of work and rest

### Title 3: Accommodation, Recreational Facilities, Food and Catering
- Regulation 3.1: Accommodation and recreational facilities
- Regulation 3.2: Food and catering

### Title 4: Health Protection, Medical Care, Welfare and Social Security Protection
- Regulation 4.1: Medical care on board ship and ashore
- Regulation 4.2: Shipowners' liability

### Title 5: Compliance and Enforcement
- Regulation 5.1: Flag State responsibilities
- Regulation 5.2: Port State responsibilities

## API Reference

### MLCInspectionService

#### Methods

**`getInspections(): Promise<MLCInspection[]>`**
- Retrieves all inspections for the current user
- Returns: Array of inspection objects

**`getInspectionById(id: string): Promise<MLCInspection>`**
- Retrieves a specific inspection by ID
- Parameters: `id` - Inspection UUID
- Returns: Inspection object

**`createInspection(data: Partial<MLCInspection>): Promise<MLCInspection>`**
- Creates a new inspection
- Parameters: `data` - Inspection data object
- Returns: Created inspection object

**`updateInspection(id: string, updates: Partial<MLCInspection>): Promise<MLCInspection>`**
- Updates an existing inspection
- Parameters: `id` - Inspection UUID, `updates` - Fields to update
- Returns: Updated inspection object

**`getFindings(inspectionId: string): Promise<MLCFinding[]>`**
- Retrieves all findings for an inspection
- Parameters: `inspectionId` - Inspection UUID
- Returns: Array of finding objects

**`createFinding(data: Partial<MLCFinding>): Promise<MLCFinding>`**
- Creates a new finding
- Parameters: `data` - Finding data object
- Returns: Created finding object

**`generateAIReport(inspectionId: string): Promise<MLCAIReport>`**
- Generates an AI-powered analysis report
- Parameters: `inspectionId` - Inspection UUID
- Returns: AI report object with summary and recommendations

**`getInspectionStats(): Promise<InspectionStats>`**
- Calculates statistics across all inspections
- Returns: Statistics object with totals, averages, and counts

## Testing

### Unit Tests

Run unit tests for the service layer:

```bash
npm run test:unit tests/mlc-inspection.test.ts
```

Test coverage includes:
- Inspection CRUD operations
- Findings management
- AI report generation
- Compliance calculation
- Statistics generation

### E2E Tests

Run end-to-end tests with Playwright:

```bash
npm run test:e2e e2e/mlc-inspection.spec.ts
```

Test scenarios cover:
- Dashboard rendering
- Inspection creation workflow
- Checklist navigation
- AI chatbot interaction
- Evidence upload
- Form validation

## Architecture

### Frontend Components

```
src/modules/compliance/mlc-inspection/
├── MLCInspectionDashboard.tsx    # Main dashboard component
├── components/
│   ├── InspectionsList.tsx       # List of inspections
│   ├── CreateInspectionDialog.tsx # New inspection form
│   ├── ChecklistInterface.tsx    # MLC checklist UI
│   ├── EvidenceUploader.tsx      # File upload component
│   └── InspectorChatbot.tsx      # AI assistant chatbot
└── index.ts                       # Module exports
```

### Backend Services

```
src/services/
└── mlc-inspection.service.ts     # Service layer for API calls
```

### Database Schema

```
supabase/migrations/
└── 20251103000000_create_mlc_inspection_module.sql
```

## Security

### Row-Level Security (RLS)

The module implements RLS policies to ensure data privacy:

- Users can only view inspections for their vessels or if they are the inspector
- Users can only modify their own inspections
- Draft inspections can be deleted by the creator
- AI reports follow the same access patterns as inspections

### Authentication

All API calls require valid Supabase authentication. The module integrates with the existing Travel HR Buddy authentication system.

## Troubleshooting

### Common Issues

**Issue: "Cannot create inspection"**
- Ensure you are authenticated
- Verify vessel_id is valid
- Check inspector permissions

**Issue: "AI report generation failed"**
- Ensure inspection has findings
- Check Supabase connection
- Verify RLS policies are correctly configured

**Issue: "Evidence upload not working"**
- Check file size limits
- Verify Supabase Storage is configured
- Ensure proper permissions

## Future Enhancements

Planned features for future releases:

- [ ] Real-time collaboration between inspectors
- [ ] Advanced OCR with handwriting recognition
- [ ] Integration with vessel management systems
- [ ] Automated PSC deficiency predictions
- [ ] Mobile app for offline inspections
- [ ] Multi-language UI support
- [ ] Custom checklist templates
- [ ] Integration with certification authorities
- [ ] Blockchain-based certificate verification

## Support

For issues, questions, or feature requests:
- GitHub Issues: [travel-hr-buddy/issues](https://github.com/RodrigoSC89/travel-hr-buddy/issues)
- Documentation: See inline component documentation
- Tests: Refer to test files for usage examples

## License

This module is part of the Travel HR Buddy platform and follows the same license terms.

## Credits

Developed as part of the Travel HR Buddy maritime compliance platform.

**MLC 2006 Reference:**
- [ILO Maritime Labour Convention, 2006](https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm)
- Lloyd's Register MLC Inspection Guidelines
- Paris MoU PSC Inspection Procedures

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Production Ready
