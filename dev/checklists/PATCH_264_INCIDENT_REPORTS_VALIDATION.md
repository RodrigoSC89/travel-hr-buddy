# 🧪 PATCH 264 – Incident Reports Validation

## 📋 Objective
Validar fluxo completo de gestão de incidentes com investigação e resolução.

---

## ✅ Validation Checklist

### 1️⃣ Incident Creation
- [ ] Incidente pode ser criado com dados completos?
- [ ] Campos obrigatórios são validados?
- [ ] Categoria e severidade são selecionáveis?
- [ ] Localização e timestamp são capturados?
- [ ] Múltiplos envolvidos podem ser atribuídos?

### 2️⃣ Evidence Management
- [ ] Uploads de fotos funcionam?
- [ ] Uploads de vídeos funcionam?
- [ ] Uploads de documentos funcionam?
- [ ] Evidências são armazenadas no Supabase Storage?
- [ ] URLs de evidências são persistidas corretamente?

### 3️⃣ Investigation Workflow
- [ ] Status pode ser atualizado (reported → investigating → resolved)?
- [ ] Investigador pode ser atribuído?
- [ ] Notas de investigação são salvas?
- [ ] Timeline de eventos é registrada?
- [ ] Causa raiz pode ser documentada?

### 4️⃣ Audit Trail
- [ ] Logs de auditoria são criados automaticamente?
- [ ] Mudanças de status são registradas?
- [ ] Mudanças de atribuição são logadas?
- [ ] Timestamp e usuário são capturados?
- [ ] Histórico completo é visível?

### 5️⃣ Reporting & Export
- [ ] Relatório pode ser exportado como PDF?
- [ ] Relatório pode ser exportado como CSV?
- [ ] Relatório inclui evidências?
- [ ] Filtros funcionam (severidade, categoria, data)?
- [ ] Estatísticas agregadas são precisas?

---

## 🗄️ Required Database Schema

### Table: `incidents`
```sql
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('safety', 'security', 'operational', 'environmental', 'health', 'equipment', 'human_error', 'other')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT CHECK (status IN ('reported', 'investigating', 'resolved', 'closed', 'reopened')) DEFAULT 'reported',
  location TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  involved_personnel UUID[] DEFAULT ARRAY[]::UUID[],
  witnesses UUID[] DEFAULT ARRAY[]::UUID[],
  immediate_actions_taken TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  is_reportable_to_authorities BOOLEAN DEFAULT false,
  reported_to_authorities_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_category ON public.incidents(category);
CREATE INDEX idx_incidents_occurred ON public.incidents(occurred_at);
CREATE INDEX idx_incidents_reported_by ON public.incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON public.incidents(assigned_to);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view incidents"
  ON public.incidents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Assigned users can update incidents"
  ON public.incidents FOR UPDATE
  USING (auth.uid() = assigned_to OR auth.uid() = reported_by);
```

### Table: `incident_evidence`
```sql
CREATE TABLE IF NOT EXISTS public.incident_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  evidence_type TEXT CHECK (evidence_type IN ('photo', 'video', 'document', 'audio', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  description TEXT,
  captured_at TIMESTAMP WITH TIME ZONE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_incident_evidence_incident ON public.incident_evidence(incident_id);

ALTER TABLE public.incident_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence for visible incidents"
  ON public.incident_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_evidence.incident_id
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can upload evidence"
  ON public.incident_evidence FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);
```

### Table: `incident_audit_log`
```sql
CREATE TABLE IF NOT EXISTS public.incident_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_log_incident ON public.incident_audit_log(incident_id);
CREATE INDEX idx_audit_log_created ON public.incident_audit_log(created_at);

ALTER TABLE public.incident_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for visible incidents"
  ON public.incident_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_audit_log.incident_id
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "System can create audit logs"
  ON public.incident_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `incident_comments`
```sql
CREATE TABLE IF NOT EXISTS public.incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_incident_comments_incident ON public.incident_comments(incident_id);

ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on visible incidents"
  ON public.incident_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_comments.incident_id
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "Users can create comments"
  ON public.incident_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Storage Bucket: `incident-evidence`
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-evidence', 'incident-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'incident-evidence' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can view evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'incident-evidence'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'incident-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Basic structure may exist

### ⚠️ Partial
- Incident form may be incomplete
- File upload may not be implemented

### ❌ Missing
- Complete incident management UI
- Evidence upload system
- Investigation workflow
- Audit logging
- Report export functionality

---

## 🧪 Test Scenarios

### Scenario 1: Create Incident
1. Navigate to Incidents module
2. Click "Report Incident"
3. Fill in:
   - Title: "Spilled fuel on deck"
   - Category: safety
   - Severity: high
   - Description: detailed description
   - Occurred at: yesterday 14:30
4. Add witness
5. Submit
6. **Expected**: 
   - Incident created with unique number
   - Status: "reported"
   - Audit log entry created

### Scenario 2: Upload Evidence
1. Open incident
2. Click "Add Evidence"
3. Upload photo
4. Add description
5. **Expected**:
   - File uploaded to `incident-evidence` bucket
   - URL saved in `incident_evidence` table
   - Thumbnail displayed in incident

### Scenario 3: Investigate Incident
1. Assign incident to investigator
2. Change status to "investigating"
3. Add investigation notes
4. Document root cause
5. Add corrective actions
6. Change status to "resolved"
7. **Expected**:
   - All changes logged in audit trail
   - Timestamps recorded
   - Notifications sent

### Scenario 4: Export Report
1. Filter incidents by severity="high"
2. Click "Export to PDF"
3. **Expected**:
   - PDF generated with:
     - Incident details
     - Timeline
     - Evidence thumbnails
     - Investigation findings

### Scenario 5: Audit Trail Verification
1. View incident
2. Click "View History"
3. **Expected**:
   - All status changes listed
   - All field modifications shown
   - User and timestamp for each change
   - Clear chronological order

---

## 📊 Incident Categories

| Category | Examples | Severity Range |
|----------|----------|----------------|
| **Safety** | Injuries, near-misses | Medium-Critical |
| **Security** | Unauthorized access, theft | Low-Critical |
| **Operational** | Equipment failure, delays | Low-High |
| **Environmental** | Spills, emissions | Medium-Critical |
| **Health** | Illness, contamination | Medium-Critical |
| **Equipment** | Damage, malfunction | Low-High |

---

## 🚀 Next Steps

1. **UI Development**
   - Create incident form
   - Build investigation interface
   - Add timeline view
   - Implement filtering

2. **File Upload**
   - Integrate Supabase Storage
   - Add image preview
   - Support multiple file types
   - Implement file validation

3. **Workflow Engine**
   - Implement status transitions
   - Add notification triggers
   - Create assignment logic
   - Support escalation rules

4. **Audit System**
   - Auto-log all changes
   - Track field modifications
   - Record user actions
   - Generate audit reports

5. **Export Functionality**
   - PDF generation with jsPDF
   - CSV export
   - Include evidence in reports
   - Support batch export

6. **Testing**
   - Test full incident lifecycle
   - Validate file uploads
   - Test export formats
   - Verify audit trail

---

**Status**: 🔴 Not Implemented  
**Priority**: 🔴 High  
**Estimated Completion**: 10-14 hours
