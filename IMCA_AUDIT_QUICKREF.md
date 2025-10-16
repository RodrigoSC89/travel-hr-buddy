# IMCA DP Audit System - Quick Reference

## 🚀 Quick Start

### Access the System
1. Navigate to `/imca-audit` OR
2. Go to DP Intelligence Center → Click "Gerar Auditoria"

### Generate Your First Audit

**Step 1: Basic Data** (Required)
```
- Vessel Name: "DP Construction Vessel Delta"
- DP Class: DP2
- Location: "Santos Basin, Brazil"
- Objective: "Post-incident evaluation"
```

**Step 2: Operational Data** (Optional)
```
- Incident Details: "Thruster #3 failure"
- Environmental Conditions: "Sea state 3"
- System Status: "All systems operational except #3"
```

**Step 3: Generate**
- Click "Gerar Auditoria"
- Wait for AI analysis (30-60 seconds)
- Review results

**Step 4: Save/Export**
- Click "Salvar" to save to database
- Click "Exportar" to download Markdown

## 📊 Understanding Results

### Overall Score
```
85/100 → Green Badge → "Conforme"
65/100 → Yellow Badge → "Parcial"
45/100 → Red Badge → "Não Conforme"
```

### Risk Levels
- 🔴 **Alto** - Immediate action required
- 🟡 **Médio** - Plan corrective action
- ⚪ **Baixo** - Monitor and document

### Priority & Deadlines
- 🔴 **Crítico** → 7 days
- 🟠 **Alto** → 30 days
- 🔵 **Médio** → 90 days
- 🟢 **Baixo** → 180 days

## 🛠️ Code Examples

### 1. Generate Audit

```typescript
import { generateIMCAAudit } from "@/services/imca-audit-service";

const result = await generateIMCAAudit({
  vesselName: "My Vessel",
  dpClass: "DP2",
  location: "North Sea",
  auditObjective: "Annual compliance check"
});

console.log(result.overallScore); // 85
```

### 2. Save Audit

```typescript
import { saveIMCAAudit } from "@/services/imca-audit-service";

const saved = await saveIMCAAudit(result, "completed");
console.log(saved.id); // UUID
```

### 3. List All Audits

```typescript
import { getIMCAAudits } from "@/services/imca-audit-service";

const audits = await getIMCAAudits();
audits.forEach(audit => {
  console.log(audit.title, audit.score);
});
```

### 4. Get Specific Audit

```typescript
import { getIMCAAuditById } from "@/services/imca-audit-service";

const audit = await getIMCAAuditById("uuid-here");
console.log(audit.findings);
```

### 5. Update Audit

```typescript
import { updateIMCAAudit } from "@/services/imca-audit-service";

const updated = await updateIMCAAudit("uuid", {
  status: "approved",
  score: 90
});
```

### 6. Delete Audit

```typescript
import { deleteIMCAAudit } from "@/services/imca-audit-service";

await deleteIMCAAudit("uuid-here");
```

### 7. Export to Markdown

```typescript
import { exportIMCAAudit } from "@/services/imca-audit-service";

exportIMCAAudit(audit); // Downloads file
```

## 📋 Type Reference

### DPClass
```typescript
type DPClass = "DP1" | "DP2" | "DP3";
```

### RiskLevel
```typescript
type RiskLevel = "Alto" | "Médio" | "Baixo";
```

### PriorityLevel
```typescript
type PriorityLevel = "Crítico" | "Alto" | "Médio" | "Baixo";
```

### IMCAAuditRequest
```typescript
interface IMCAAuditRequest {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
}
```

### IMCAAuditReport
```typescript
interface IMCAAuditReport {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditDate: string;
  auditObjective: string;
  overallScore: number;
  maxScore: number;
  moduleEvaluations: ModuleEvaluation[];
  nonConformities: NonConformity[];
  actionPlan: ActionItem[];
  standardsCompliance: StandardCompliance[];
  summary: string;
  recommendations: string[];
  generatedAt: string;
  status: AuditStatus;
}
```

## 🔧 Helper Functions

### Validate DP Class
```typescript
import { isValidDPClass } from "@/types/imca-audit";

if (isValidDPClass(input)) {
  // Valid DP class
}
```

### Get Risk Color
```typescript
import { getRiskLevelColor } from "@/types/imca-audit";

const color = getRiskLevelColor("Alto"); // "bg-red-500"
```

### Get Priority Color
```typescript
import { getPriorityLevelColor } from "@/types/imca-audit";

const color = getPriorityLevelColor("Crítico"); // "bg-red-600"
```

### Calculate Deadline
```typescript
import { getDeadlineByPriority } from "@/types/imca-audit";

const deadline = getDeadlineByPriority("Alto"); // Date + 30 days
```

## 📚 DP Modules (12)

1. Sistema de Controle DP
2. Sistema de Propulsão
3. Sensores de Posicionamento
4. Rede e Comunicações
5. Pessoal DP
6. Logs e Históricos
7. FMEA
8. Testes Anuais
9. Documentação
10. Power Management System
11. Capability Plots
12. Planejamento Operacional

## 🌐 Standards (10)

1. IMCA M103 - Design and Operation
2. IMCA M117 - Personnel Training
3. IMCA M190 - Annual Trials
4. IMCA M166 - FMEA
5. IMCA M109 - Documentation
6. IMCA M220 - Activity Planning
7. IMCA M140 - Capability Plots
8. MSF 182 - Safe Operations
9. MTS DP Operations
10. IMO MSC.1/Circ.1580

## 🎨 UI Components

### Badge Colors

**Risk Levels:**
```typescript
"Alto"  → className="bg-red-500"
"Médio" → className="bg-yellow-500"
"Baixo" → className="bg-green-500"
```

**Priority Levels:**
```typescript
"Crítico" → className="bg-red-600"
"Alto"    → className="bg-orange-500"
"Médio"   → className="bg-blue-500"
"Baixo"   → className="bg-green-500"
```

**Status:**
```typescript
"compliant"     → variant="default"
"partial"       → variant="secondary"
"non-compliant" → variant="destructive"
```

## 🗄️ Database Schema

### Table: auditorias_imca

```sql
CREATE TABLE auditorias_imca (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'approved')),
  audit_date DATE,
  score NUMERIC(0-100),
  findings JSONB,
  recommendations TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Indexes
```sql
idx_auditorias_imca_user_id
idx_auditorias_imca_created_at
idx_auditorias_imca_audit_date
idx_auditorias_imca_status
```

## 🔐 Security

### Row-Level Security (RLS)

**User Policies:**
- ✅ See own audits
- ✅ Create own audits
- ✅ Update own audits
- ✅ Delete own audits

**Admin Policies:**
- ✅ See all audits
- ✅ Create audits for anyone
- ✅ Update any audit
- ✅ Delete any audit

### Check User Permissions
```typescript
// Check if user is admin
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();

const isAdmin = profile?.role === 'admin';
```

## ⚙️ Configuration

### Environment Variables

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# OpenAI (for edge function)
OPENAI_API_KEY=your_openai_key
```

### Edge Function Deployment

```bash
# Deploy to Supabase
supabase functions deploy imca-audit-generator

# Test locally
supabase functions serve imca-audit-generator
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test src/tests/components/imca-audit/imca-audit.test.ts
```

### Test Coverage
```bash
npm run test:coverage
```

### Expected Results
```
✅ 20/20 tests passing
✅ DP class validation
✅ Risk level colors
✅ Priority level colors
✅ Deadline calculation
✅ Module completeness (12)
✅ Standards completeness (10)
✅ Export format
```

## 🚨 Troubleshooting

### Error: "Failed to generate audit"
**Solution:** Check OpenAI API key in Supabase Edge Function settings

### Error: "User not authenticated"
**Solution:** Ensure user is logged in before calling service functions

### Error: "Audit not found"
**Solution:** Verify audit ID and user permissions (RLS)

### Error: "Invalid DP class"
**Solution:** Use only "DP1", "DP2", or "DP3"

### No data showing in results
**Solution:** Wait for AI generation to complete (30-60 seconds)

## 📱 Access Points

| Method | Path | Description |
|--------|------|-------------|
| Direct URL | `/imca-audit` | Main audit page |
| Quick Access | DP Intelligence → Button | Quick navigation |
| Navigation | SmartLayout Menu | Integrated menu |

## 🎯 Best Practices

### 1. Always Validate Input
```typescript
if (!vesselName || !dpClass || !location) {
  toast.error("Missing required fields");
  return;
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  const audit = await generateIMCAAudit(request);
} catch (error) {
  toast.error("Failed to generate audit");
  console.error(error);
}
```

### 3. Save Important Audits
```typescript
// Save immediately after generation
if (audit.overallScore < 60) {
  await saveIMCAAudit(audit, "completed");
  toast.success("Critical audit saved");
}
```

### 4. Export for Records
```typescript
// Always export critical audits
if (audit.nonConformities.some(nc => nc.riskLevel === "Alto")) {
  exportIMCAAudit(audit);
}
```

## 📞 Support

### Documentation
- Implementation Summary: `IMCA_AUDIT_IMPLEMENTATION_SUMMARY.md`
- Quick Reference: `IMCA_AUDIT_QUICKREF.md` (this file)
- Database Schema: `AUDITORIAS_IMCA_RLS_IMPLEMENTATION.md`

### Code Examples
- Tests: `src/tests/components/imca-audit/imca-audit.test.ts`
- Component: `src/components/imca-audit/imca-audit-generator.tsx`
- Service: `src/services/imca-audit-service.ts`

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-16  
**Quick Reference for:** IMCA DP Technical Audit System
