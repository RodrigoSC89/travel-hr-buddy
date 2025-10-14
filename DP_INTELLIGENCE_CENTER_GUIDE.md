# DP Intelligence Center - Implementation Guide

## 📋 Overview

The DP Intelligence Center is a comprehensive incident management and AI-powered analysis system for Dynamic Positioning (DP) vessels. It provides structured analysis of DP incidents based on IMCA, IMO, and Petrobras (PEO-DP) standards.

## 🎯 Features Implemented

### 1. Database Structure (`dp_incidents` table)
- **Location**: `supabase/migrations/20251014210000_create_dp_incidents.sql`
- **Fields**:
  - Basic info: title, date, class_dp, vessel, location, summary
  - Analysis: root_cause, ai_analysis (JSONB)
  - Status tracking: status, severity
  - References: imca_reference
  - Audit fields: created_at, updated_at, created_by
- **Sample Data**: 4 realistic incidents included for testing

### 2. AI Analysis Edge Function
- **Location**: `supabase/functions/dp-intel-analyze/index.ts`
- **Model**: OpenAI GPT-4
- **Capabilities**:
  - Technical summary generation
  - IMCA/IMO/PEO-DP standards identification
  - Root cause analysis expansion
  - Preventive recommendations
  - Corrective actions suggestions
  - IMCA reference mapping (M190, M103, M166, M252, etc.)

### 3. Frontend Component
- **Location**: `src/components/dp-intelligence/dp-intelligence-center.tsx`
- **Features**:
  - **Incident Cards**: Visual display with severity badges, vessel info, location
  - **Filters**: By DP class, status, and search query
  - **Statistics Dashboard**: Total incidents, critical count, analyzed count, pending count
  - **AI Analysis Modal**: Tabbed interface with 5 sections:
    - ✅ Technical Summary
    - 📚 Related Standards
    - 📌 Additional Causes
    - 🧠 Preventive Recommendations
    - 📄 Corrective Actions

### 4. Routing
- **Route**: `/dp-intelligence`
- **Page**: `src/pages/DPIntelligence.tsx`
- **Integration**: Added to `App.tsx` routing

## 🚀 Usage

### Accessing the Module
1. Navigate to `/dp-intelligence` in the application
2. The module loads automatically with sample incidents

### Analyzing an Incident
1. Click on any incident card
2. Click "Analisar com IA" button
3. Wait for GPT-4 analysis (typically 3-5 seconds)
4. Explore analysis through tabbed interface
5. Analysis is automatically saved to database

### Filtering Incidents
- **DP Class Filter**: DP1, DP2, DP3, or all
- **Status Filter**: Pending, Analyzing, Analyzed, Reviewed, Closed
- **Search**: Search by title, vessel name, or location
- **Refresh**: Click "Atualizar" to reload data

## 🔧 Technical Architecture

### Database Schema
```sql
CREATE TABLE dp_incidents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  class_dp TEXT CHECK (class_dp IN ('DP1', 'DP2', 'DP3')),
  vessel TEXT NOT NULL,
  location TEXT NOT NULL,
  summary TEXT,
  root_cause TEXT,
  status TEXT DEFAULT 'pending',
  severity TEXT DEFAULT 'medium',
  imca_reference TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Analysis Response Structure
```typescript
interface AnalysisResult {
  resumo_tecnico: string;
  normas_relacionadas: string[];
  causas_adicionais: string[];
  recomendacoes_preventivas: string[];
  acoes_corretivas: string[];
  referencias_imca: string[];
}
```

### API Call Flow
1. Frontend invokes: `supabase.functions.invoke("dp-intel-analyze", { body: { incident } })`
2. Edge Function processes with GPT-4
3. Response stored in `ai_analysis` JSONB field
4. Frontend updates UI with structured analysis

## 🧪 Testing

### Test Suite
- **Location**: `src/tests/components/dp-intelligence/dp-intelligence-center.test.tsx`
- **Coverage**:
  - Component rendering
  - Incident loading
  - Statistics display
  - Filter functionality
  - Modal opening/closing
  - AI analysis flow

### Running Tests
```bash
npm run test -- src/tests/components/dp-intelligence/dp-intelligence-center.test.tsx
```

## 📊 Sample Data Included

1. **Incident 1**: Position loss during drilling (DP2, High severity)
2. **Incident 2**: Reference system redundancy failure (DP3, Medium severity)
3. **Incident 3**: Drive-off during ROV operation (DP2, Critical severity)
4. **Incident 4**: Partial blackout affecting DP system (DP2, High severity)

## 🔐 Security & Permissions

- **RLS Policies**: Enabled for authenticated users
- **Read Access**: All authenticated users
- **Write Access**: All authenticated users can create/update
- **API Key**: OpenAI API key required (`OPENAI_API_KEY` env var)

## 🎨 UI Components Used

- Shadcn/UI components (Card, Badge, Button, Dialog, Tabs, Select, Input)
- Lucide React icons
- Tailwind CSS for styling
- Sonner for toast notifications

## 📝 Environment Variables Required

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-key

# OpenAI (for Edge Function)
OPENAI_API_KEY=sk-proj-...

# Supabase Service Role (for Edge Function)
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 🚦 Status Indicators

### Severity Badges
- 🟢 **Low**: Minor issues, no operational impact
- 🟡 **Medium**: Moderate issues, some operational impact
- 🟠 **High**: Serious issues, significant operational impact
- 🔴 **Critical**: Severe issues, major operational impact

### Status Colors
- ⚪ **Pending**: Awaiting analysis
- 🔵 **Analyzing**: Currently being processed
- 🟣 **Analyzed**: AI analysis complete
- 🟢 **Reviewed**: Human review complete
- ⚫ **Closed**: Incident resolved and archived

## 🔄 Integration Points

### Existing Systems
- Works standalone, no dependencies on other modules
- Can be integrated with:
  - PEO-DP module for compliance tracking
  - SGSO for incident reporting workflow
  - Document management for evidence storage

### Future Enhancements
- IMCA data ingestion API
- PDF report generation
- Trend analysis dashboard
- Multi-language support
- Real-time incident notifications

## 📚 References

### IMCA Standards Covered
- **IMCA M 190**: Guidance on DP capability plots
- **IMCA M 103**: Guidelines for the design and operation of DP systems
- **IMCA M 166**: DP vessel design philosophy guidelines
- **IMCA M 252**: DP incidents analysis

### Compliance Frameworks
- IMO (International Maritime Organization)
- MTS (Marine Technology Society)
- PEO-DP (Petrobras DP Excellence Program)

## 🐛 Known Issues

- None at this time

## 📄 License

Part of the Nautilus One Travel HR Buddy system.

---

**Last Updated**: 2024-10-14
**Version**: 1.0.0
**Author**: GitHub Copilot Agent
