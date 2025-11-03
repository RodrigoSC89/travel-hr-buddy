# ISM Audits Module

## Overview
The ISM Audits module provides comprehensive International Safety Management (ISM) Code audit capabilities with AI-powered analysis, OCR extraction, and detailed reporting.

## Features

### 📥 PDF Upload & OCR
- Automatic extraction of ISM checklists from scanned PDFs
- Tesseract.js integration for optical character recognition
- Intelligent parsing of checklist items and categories
- Validation of extracted data quality

### ✅ Interactive Digital Checklist
- Dynamic form with predefined ISM templates
- Five core categories:
  - Safety Management System
  - Emergency Preparedness
  - Maintenance Management
  - Documentation and Records
  - Training and Competence
- Real-time compliance status tracking
- Notes and evidence attachment

### 🧠 AI-Powered Analysis
- Item-by-item compliance analysis
- Automated risk level assessment
- Confidence scoring for AI recommendations
- Executive summary generation
- Improvement suggestions based on findings

### 📊 Compliance Scoring
- Automated score calculation (0-100%)
- Letter grade assignment (A-F)
- Compliance rate tracking
- Non-conformity identification
- Trend analysis per vessel

### 📜 Reporting & Export
- Comprehensive PDF reports
- Executive summaries
- Detailed checklist breakdown
- Historical comparison reports
- Export with company branding

### 📈 Historical Analysis
- Complete audit history per vessel
- Trend analysis over time
- Comparison between audits
- Performance tracking by port
- Auditor performance metrics

## Architecture

### Core Components

#### ISMAuditDashboard
Main interface showing:
- Overview statistics
- Recent audits list
- Quick actions menu
- Compliance trends

#### ISMAuditForm
Interactive audit creation/editing:
- Basic information input
- Template loading
- Item-by-item assessment
- AI analysis integration
- Summary generation

#### ISMAuditUpload
PDF upload and OCR processing:
- File validation
- OCR extraction progress
- Quality validation
- Preview of extracted items
- Confirmation workflow

#### ISMAuditHistory
Historical data management:
- Advanced filtering (vessel, type, date)
- Sorting options
- Trend visualization
- Comparison tools
- Bulk operations

#### ISMAuditDetails
Detailed audit view:
- Full information display
- Category-based navigation
- AI analysis results
- PDF export functionality
- Edit capabilities

### Supporting Components

#### ISMChecklistCard
Reusable checklist item component with:
- Status selection
- Notes input
- AI analysis trigger
- Evidence attachment

#### NonConformityTag
Visual risk indicators:
- Color-coded by severity
- Count display
- Consistent styling

## Data Types

### ISMAudit
```typescript
{
  id: string;
  vesselId: string;
  vesselName: string;
  auditType: "internal" | "external";
  auditDate: string;
  auditor: string;
  port?: string;
  status: "draft" | "in-progress" | "completed" | "approved";
  items: ISMAuditItem[];
  complianceScore?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### ISMAuditItem
```typescript
{
  id: string;
  question: string;
  category: string;
  compliant: "compliant" | "non-compliant" | "not-applicable" | "pending";
  notes: string;
  evidence?: string[];
  aiAnalysis?: string;
  aiConfidence?: number;
  timestamp?: string;
}
```

## LLM Integration

### analyzeISMItem
Analyzes individual checklist items:
- Input: question, response, evidence, category
- Output: compliance status, explanation, recommendations, confidence, risk level
- Uses Nautilus LLM with safe mode

### generateAuditSummary
Creates executive summaries:
- Input: audit items, vessel name, audit type
- Output: professional summary with findings and recommendations
- Max 500 words, technical and objective

### suggestImprovements
Provides corrective action suggestions:
- Input: list of non-compliant items
- Output: prioritized list of 5 specific actions
- Formatted as actionable recommendations

## OCR Processing

### extractISMChecklistFromPDF
Main OCR workflow:
1. File validation (type, size)
2. Tesseract.js OCR extraction
3. Text parsing and structuring
4. Item categorization
5. Compliance marker detection
6. Quality validation

### Supported Markers
- ✓, ☑, [X] → Compliant
- ✗, ☒, [ ] → Non-compliant
- No marker → Pending

## Database Integration

### Tables Required
```sql
-- ism_audits table
CREATE TABLE ism_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  vessel_name TEXT NOT NULL,
  audit_type TEXT NOT NULL,
  audit_date DATE NOT NULL,
  auditor TEXT NOT NULL,
  port TEXT,
  status TEXT NOT NULL,
  compliance_score INTEGER,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- ism_audit_items table
CREATE TABLE ism_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES ism_audits(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  compliant TEXT NOT NULL,
  notes TEXT,
  ai_analysis TEXT,
  ai_confidence DECIMAL(3,2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### GET /api/ism-audits
List all audits with filters

### POST /api/ism-audits
Create new audit

### GET /api/ism-audits/:id
Get audit details

### PUT /api/ism-audits/:id
Update audit

### DELETE /api/ism-audits/:id
Delete audit

### POST /api/ism-audits/upload
Upload and process PDF

### POST /api/ism-audits/:id/analyze
Trigger AI analysis

### GET /api/ism-audits/:id/export
Export audit as PDF

## Testing

### Unit Tests
- `lib/llm/ismAssistant.test.ts` - LLM functions
- `lib/ocr/pdfToISMChecklist.test.ts` - OCR extraction
- `types/ism-audit.test.ts` - Score calculation

### E2E Tests
- `e2e/ism-audit-upload.spec.ts` - Upload workflow
- `e2e/ism-audit-form.spec.ts` - Form interactions
- `e2e/ism-audit-analysis.spec.ts` - AI analysis

### Test Fixtures
- `tests/fixtures/ISMChecklistSample.pdf` - Sample checklist
- `tests/fixtures/ism-audit-mock-data.ts` - Mock audits

## Usage Examples

### Creating a New Audit
```typescript
import { ISMAuditForm } from "@/modules/ism-audits/ISMAuditForm";

<ISMAuditForm
  onSave={(audit) => console.log("Saved:", audit)}
  onCancel={() => console.log("Cancelled")}
/>
```

### Uploading a PDF
```typescript
import { ISMAuditUpload } from "@/modules/ism-audits/ISMAuditUpload";

<ISMAuditUpload
  onItemsExtracted={(items) => console.log("Extracted:", items)}
  onCancel={() => console.log("Cancelled")}
/>
```

### Viewing History
```typescript
import { ISMAuditHistory } from "@/modules/ism-audits/ISMAuditHistory";

<ISMAuditHistory
  audits={audits}
  onViewDetails={(audit) => console.log("View:", audit)}
  onBack={() => console.log("Back")}
/>
```

## Integration with Other Modules

### Watchdog
- Trigger alerts for critical non-conformities
- Monitor audit completion rates
- Track overdue audits

### Fleet Management
- Link audits to vessel records
- Display audit history in vessel profiles
- Track fleet-wide compliance

### Document Hub
- Store audit reports
- Version control for checklists
- Template management

## Configuration

### Environment Variables
```bash
# LLM Configuration
VITE_NAUTILUS_LLM_ENABLED=true
VITE_LLM_MODEL=gpt-4

# OCR Configuration
VITE_OCR_LANGUAGE=eng
VITE_OCR_MAX_FILE_SIZE=10485760 # 10MB

# Feature Flags
VITE_ISM_AUDITS_ENABLED=true
VITE_ISM_AI_ANALYSIS_ENABLED=true
```

## Performance Considerations

### OCR Processing
- Large PDFs can take 30-60 seconds
- Show progress indicators
- Process in background if possible
- Cache results

### AI Analysis
- Each item analysis ~2-3 seconds
- Batch requests when possible
- Show loading states
- Allow cancellation

### PDF Export
- Large reports ~5-10 seconds
- Use web workers for generation
- Compress images
- Optimize table rendering

## Future Enhancements

- [ ] Multi-language support for checklists
- [ ] Photo evidence attachment
- [ ] Digital signatures
- [ ] Offline mode support
- [ ] Mobile app integration
- [ ] Automated scheduling
- [ ] Email notifications
- [ ] Integration with external audit systems
- [ ] Advanced analytics dashboard
- [ ] Predictive compliance scoring

## Support

For issues or questions:
- Check documentation at `/docs/modules/ism-audits.md`
- Review code examples in `/src/modules/ism-audits/`
- Contact technical support

## Changelog

### v1.0.0 (PATCH-609)
- Initial implementation
- Core audit management
- PDF upload with OCR
- AI-powered analysis
- Historical tracking
- PDF export functionality
