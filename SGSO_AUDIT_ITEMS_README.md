# SGSO Audit Items - Database Schema Documentation

## Overview

This document describes the database tables for tracking SGSO (Sistema de Gestão de Segurança Operacional) audit items, implementing the 17 mandatory requirements from ANP Resolution 43/2007.

## Tables

### sgso_audits

Enhanced existing table with the addition of `auditor_id` field.

**Key Fields:**
- `id`: UUID - Primary key
- `vessel_id`: UUID - References vessels table
- `auditor_id`: UUID - References auth.users (NEW)
- `audit_date`: TIMESTAMP - Date of audit
- `created_at`: TIMESTAMP - Record creation timestamp
- ... (other existing fields)

### sgso_audit_items (NEW)

Tracks individual requirement compliance for each audit.

**Schema:**
```sql
CREATE TABLE public.sgso_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  requirement_number INTEGER NOT NULL CHECK (requirement_number BETWEEN 1 AND 17),
  requirement_title TEXT,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'partial', 'non-compliant')),
  evidence TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Fields:**
- `id`: UUID - Primary key, auto-generated
- `audit_id`: UUID - Foreign key to sgso_audits, cascades on delete
- `requirement_number`: INTEGER - Requirement number (1-17), NOT NULL
- `requirement_title`: TEXT - Title/description of the requirement
- `compliance_status`: TEXT - Status: 'compliant', 'partial', or 'non-compliant'
- `evidence`: TEXT - Evidence supporting the compliance status
- `comment`: TEXT - Additional comments or observations
- `created_at`: TIMESTAMP - Record creation timestamp

## Logic

### Audit Process

1. **Create Audit**: A new record in `sgso_audits` represents a SGSO audit application for a vessel
2. **Add Items**: For each of the 17 requirements, create a record in `sgso_audit_items` linked to the audit
3. **Track Compliance**: Each item tracks compliance status, evidence, and comments

### Example Usage

```sql
-- Create a new audit
INSERT INTO sgso_audits (vessel_id, auditor_id, audit_date)
VALUES ('vessel-uuid', 'user-uuid', NOW())
RETURNING id;

-- Add audit items (example for requirement 1)
INSERT INTO sgso_audit_items (
  audit_id,
  requirement_number,
  requirement_title,
  compliance_status,
  evidence,
  comment
)
VALUES (
  'audit-uuid',
  1,
  'Liderança e Responsabilidade',
  'compliant',
  'Documented organizational structure with clear safety responsibilities',
  'All safety roles properly assigned and documented'
);

-- Query audit results
SELECT 
  a.audit_date,
  v.name as vessel_name,
  ai.requirement_number,
  ai.requirement_title,
  ai.compliance_status
FROM sgso_audits a
JOIN vessels v ON a.vessel_id = v.id
JOIN sgso_audit_items ai ON ai.audit_id = a.id
WHERE a.id = 'audit-uuid'
ORDER BY ai.requirement_number;
```

## Security

### Row Level Security (RLS)

Both tables have RLS enabled with policies that ensure:
- Users can only access data from their organization
- All operations (SELECT, INSERT, UPDATE, DELETE) are scoped to the user's organization
- Access is controlled through the profiles table organization_id

### Policies

**sgso_audit_items policies:**
- `Users can view audit items from their organization`
- `Users can insert audit items for their organization audits`
- `Users can update audit items from their organization`
- `Users can delete audit items from their organization`

All policies verify that the audit belongs to the user's organization before granting access.

## Indexes

Performance indexes have been created for:
- `idx_sgso_audit_items_audit_id` - Fast lookups by audit
- `idx_sgso_audit_items_requirement_number` - Fast lookups by requirement
- `idx_sgso_audit_items_compliance_status` - Fast filtering by status
- `idx_sgso_audits_auditor_id` - Fast lookups by auditor

## 17 SGSO Requirements (ANP Resolution 43/2007)

1. Liderança e Responsabilidade
2. Identificação de Perigos e Avaliação de Riscos
3. Controle de Riscos
4. Competência, Treinamento e Conscientização
5. Comunicação e Consulta
6. Documentação do SGSO
7. Controle Operacional
8. Preparação e Resposta a Emergências
9. Monitoramento e Medição
10. Avaliação de Conformidade
11. Investigação de Incidentes
12. Análise Crítica pela Direção
13. Gestão de Mudanças
14. Aquisição e Contratação
15. Projeto e Construção
16. Informações de Segurança de Processo
17. Integridade Mecânica

## Migration

The migration file `20251018215100_create_sgso_audit_items.sql` includes:
- Conditional addition of `auditor_id` to existing `sgso_audits` table
- Creation of `sgso_audit_items` table
- RLS policies
- Performance indexes
- Table and column documentation

## TypeScript Types

After deploying this migration to Supabase, you may need to regenerate the TypeScript types to include the new `sgso_audit_items` table and updated `sgso_audits` table.

```bash
# If Supabase CLI is available
npx supabase gen types typescript --project-id=<project-id> > src/integrations/supabase/types.ts
```

## Notes

- The `audit_id` foreign key uses `ON DELETE CASCADE` to automatically remove audit items when an audit is deleted
- The `requirement_number` field has a CHECK constraint to ensure values are between 1 and 17
- The `compliance_status` field has a CHECK constraint to ensure only valid values are used
- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- TypeScript types will need to be regenerated after migration deployment to reflect the new tables
