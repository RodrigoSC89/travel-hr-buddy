# Module: ism-audit

## 📌 Objetivo
Registrar e gerenciar auditorias internas e externas conforme o ISM Code (International Safety Management).

## Status

- **Active**: ✅ Yes
- **Components**: 7 Components + 3 Pages
- **Has Tests**: ✅ Yes (Playwright)
- **Has Documentation**: ✅ Yes
- **AI Integration**: ✅ Yes
- **LLM Prompts**: ✅ Registered

## 🧩 Funcionalidades
- Registro de auditorias por tipo e data
- Upload de relatórios e certificados
- Registro de não conformidades
- Checklists com validação automática
- IA para revisar conformidade e sugerir melhorias
- Integração com SGSO e compliance

## Module Structure

```
ism-audits/
├── index.tsx                  # Main module entry
├── components/                # UI components
│   ├── ISMAuditDashboard.tsx
│   ├── ISMAuditDetails.tsx
│   ├── ISMAuditForm.tsx
│   ├── ISMAuditHistory.tsx
│   └── ISMAuditUpload.tsx
```

## Key Features

- ISM Code compliance tracking
- Audit scheduling and management
- Finding and corrective action tracking
- Integration with Supabase
- Real-time updates
- Responsive UI

## 🗃️ Tabelas Supabase

- `ism_audits` - Auditorias ISM
- `ism_findings` - Não conformidades
- `ism_checklists` - Checklists de auditoria
- `ism_certificates` - Certificados e documentos

## UI Pages

- `/audits/ism` - Dashboard de auditorias ISM
- `/audits/ism/findings` - Gestão de não conformidades
- `/audits/ism/checklists` - Checklists de auditoria

## 🔧 Database Schema

### ism_audits Table
```typescript
{
  id: UUID
  audit_type: string             // 'internal', 'external', 'certification', 'surveillance'
  vessel_id: UUID
  auditor: string
  audit_date: date
  completion_date: date
  status: string                 // 'scheduled', 'in_progress', 'completed', 'closed'
  scope: text
  findings_count: integer
  compliance_score: decimal
  certificate_issued: boolean
  certificate_expiry: date
  report_url: string
  metadata: JSONB
  created_at: timestamp
  updated_at: timestamp
}
```

### ism_findings Table
```typescript
{
  id: UUID
  audit_id: UUID                 // FK to ism_audits
  finding_number: string
  category: string               // 'major', 'minor', 'observation', 'positive'
  ism_element: string           // ISM Code element (1.1, 1.2, etc.)
  description: text
  evidence: JSONB
  root_cause: text
  corrective_action: text
  responsible_person: UUID
  due_date: date
  completion_date: date
  status: string                 // 'open', 'in_progress', 'pending_verification', 'closed'
  verification_notes: text
  ai_suggestions: JSONB
  created_at: timestamp
  updated_at: timestamp
}
```

### ism_checklists Table
```typescript
{
  id: UUID
  audit_id: UUID
  checklist_type: string
  items: JSONB                   // Array of checklist items
  completion_percentage: decimal
  completed_by: UUID
  completed_at: timestamp
  created_at: timestamp
}
```

## 🚀 Usage Examples

### Create ISM Audit
```typescript
import { supabase } from '@/integrations/supabase/client';

const audit = await supabase
  .from('ism_audits')
  .insert({
    audit_type: 'internal',
    vessel_id: vesselId,
    auditor: 'John Smith - Lead Auditor',
    audit_date: '2025-11-15',
    status: 'scheduled',
    scope: 'Full ISM Code compliance audit'
  })
  .select()
  .single();
```

### Record Finding
```typescript
const finding = await supabase
  .from('ism_findings')
  .insert({
    audit_id: auditId,
    finding_number: 'ISM-2025-001',
    category: 'major',
    ism_element: '6.3',
    description: 'Emergency procedures not updated',
    status: 'open',
    due_date: '2025-12-15'
  });
```

### Query Overdue Findings
```typescript
const { data: overdueFindings } = await supabase
  .from('ism_findings')
  .select('*, ism_audits(*)')
  .eq('status', 'open')
  .lt('due_date', new Date().toISOString())
  .order('due_date', { ascending: true });
```

## 🤖 LLM Prompts

### Activation Prompt
```
"Ative o módulo de auditorias ISM. Preciso registrar auditorias, gerenciar não conformidades e manter certificações em dia."
```

### Query Prompts
- "Listar auditorias ISM vencidas"
- "Mostrar não conformidades abertas críticas"
- "Quando expira o certificado ISM?"
- "Gerar relatório de conformidade ISM"
- "Sugerir ações corretivas para finding X"

## 📊 Dashboard Components

### Status Cards
- Auditorias programadas
- Não conformidades abertas
- Taxa de conformidade
- Certificação válida até

### Findings Table
- Filtros por categoria, status, elemento ISM
- Ações rápidas
- Status visual
- Alertas de vencimento

### Compliance Chart
- Distribuição de findings por elemento ISM
- Trend de conformidade
- Comparativo entre auditorias

## 🔐 Permissions

### Role-Based Access
- **Admin**: Full access
- **Safety Manager**: Manage audits, assign actions
- **Auditor**: Conduct audits, record findings
- **Department Head**: View findings, implement actions
- **Viewer**: Read-only access

## Usage

```typescript
import { IsmAudits } from '@/modules/ism-audits';

function App() {
  return <IsmAudits />;
}
```

## Database Integration

This module integrates with Supabase for data persistence.

### Tables Used
- (Automatically detected from code)

## API Integration

### Endpoints
- REST API endpoints are defined in the services layer
- Real-time subscriptions for live updates

## Development

### Running Locally
```bash
npm run dev
```

### Testing
```bash
npm run test ism-audits
```

## Contributing

When contributing to this module:

1. Follow the existing code structure
2. Add tests for new features
3. Update this documentation
4. Ensure TypeScript compilation passes

## Module Files

```
ISMAuditDashboard.tsx
ISMAuditDetails.tsx
ISMAuditForm.tsx
ISMAuditHistory.tsx
ISMAuditUpload.tsx
index.ts
index.tsx
```

---

*Generated on: 2025-11-04T00:00:21.102Z*
*Generator: PATCH 622 Documentation System*

## 🧪 Testing

Test file: `tests/ism-audit.spec.ts`

```bash
npm run test:e2e -- tests/ism-audit.spec.ts
```

### Test Cases
1. Audit creation and scheduling
2. Finding registration
3. Corrective action tracking
4. Certificate management
5. Compliance reporting

## 📈 KPIs Tracked

1. **Compliance Score**: Overall ISM compliance percentage
2. **Open Findings**: Number of open non-conformities
3. **Average Closure Time**: Time to close findings
4. **Audit Frequency**: Audits per year
5. **Certification Status**: Days until certificate expiry

## 🔄 Integration with Other Modules

- **SGSO**: Safety management system
- **Documents**: Audit reports and certificates
- **Crew Management**: Training records
- **Maintenance**: Equipment compliance
- **AI Assistant**: Automated compliance analysis

## 🎯 Best Practices

1. Conduct internal audits before external audits
2. Address major findings immediately
3. Document root causes and preventive actions
4. Regular compliance training for all personnel
5. Keep audit trail complete and accessible
6. Use AI suggestions to improve processes

## Contributing

When contributing to this module:

1. Follow the existing code structure
2. Add tests for new features
3. Update this documentation
4. Ensure TypeScript compilation passes

---

*Module: ism-audit*  
*Status: Active*  
*Last Updated: 2025-11-04*  
*Version: 1.0*  
*PATCH: 653*
