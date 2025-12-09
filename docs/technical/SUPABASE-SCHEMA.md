# 📊 Estrutura de Tabelas do Supabase - Nautilus One

> **Última Atualização:** 2025-12-09  
> **Project ID:** vnbptmixvwropvanyhdb  

---

## 📋 Índice de Tabelas

### Core
- [organizations](#organizations)
- [organization_users](#organization_users)
- [user_roles](#user_roles)
- [profiles](#profiles)

### Operações Marítimas
- [vessels](#vessels)
- [crew_members](#crew_members)
- [voyages](#voyages)
- [maintenance_jobs](#maintenance_jobs)

### IA e Analytics
- [ai_commands](#ai_commands)
- [ai_insights](#ai_insights)
- [ai_logs](#ai_logs)
- [analytics_events](#analytics_events)

### Compliance
- [audit_logs](#audit_logs)
- [peotram_audits](#peotram_audits)
- [peotram_non_conformities](#peotram_non_conformities)

---

## 📦 Tabelas Detalhadas

### organizations
```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  max_users INTEGER DEFAULT 50,
  max_vessels INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**
- `Users can view their own organization` - SELECT
- `Admins can update organization` - UPDATE
- `Admins can insert organization` - INSERT

---

### organization_users
```sql
CREATE TABLE public.organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Funções Relacionadas:**
- `user_belongs_to_organization(org_id, user_uuid)`
- `get_user_organization_role(org_id, user_uuid)`
- `check_organization_limits(org_id, limit_type)`

---

### vessels
```sql
CREATE TABLE public.vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  imo_number TEXT,
  type TEXT,
  flag_state TEXT,
  gross_tonnage NUMERIC,
  status TEXT DEFAULT 'active',
  current_position JSONB,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### crew_members
```sql
CREATE TABLE public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vessel_id UUID REFERENCES vessels(id),
  name TEXT NOT NULL,
  rank TEXT,
  nationality TEXT,
  passport_number TEXT,
  seaman_book TEXT,
  certifications JSONB DEFAULT '[]',
  contract_start DATE,
  contract_end DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### ai_commands
```sql
CREATE TABLE public.ai_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  mission_id UUID,
  command_type TEXT NOT NULL,
  command_text TEXT NOT NULL,
  command_hash TEXT NOT NULL,
  parameters JSONB,
  result JSONB,
  execution_status TEXT NOT NULL,
  execution_time_ms INTEGER,
  source_module TEXT NOT NULL,
  error_details TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### ai_insights
```sql
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  confidence NUMERIC DEFAULT 0.8,
  actionable BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new',
  impact_value TEXT,
  related_module TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### maintenance_jobs (mmi_maintenance_jobs)
```sql
CREATE TABLE public.mmi_maintenance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  vessel_id UUID REFERENCES vessels(id),
  title TEXT NOT NULL,
  description TEXT,
  component_id TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  assigned_to UUID,
  work_hours NUMERIC,
  parts_used JSONB DEFAULT '[]',
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Funções Relacionadas:**
- `match_mmi_jobs(query_embedding, match_threshold, match_count)`
- `jobs_trend_by_month()`

---

### peotram_audits
```sql
CREATE TABLE public.peotram_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  audit_period TEXT NOT NULL,
  audit_date DATE NOT NULL,
  audit_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  auditor_name TEXT,
  compliance_score NUMERIC,
  non_conformities_count INTEGER DEFAULT 0,
  created_by UUID,
  shore_location TEXT,
  vessel_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 Funções de Segurança

### Verificação de Permissões
```sql
-- Verifica role do usuário
get_user_role(user_uuid UUID) RETURNS user_role

-- Verifica permissão específica
has_permission(permission_name TEXT, permission_type TEXT, user_uuid UUID) RETURNS BOOLEAN

-- Verifica acesso a dados de funcionário
can_access_employee_data(target_employee_id TEXT, user_uuid UUID) RETURNS BOOLEAN
```

### Validação de Organização
```sql
-- Verifica se usuário pertence à organização
user_belongs_to_organization(org_id UUID, user_uuid UUID) RETURNS BOOLEAN

-- Obtém role do usuário na organização
get_user_organization_role(org_id UUID, user_uuid UUID) RETURNS TEXT

-- Verifica limites da organização
check_organization_limits(org_id UUID, limit_type TEXT) RETURNS BOOLEAN
```

---

## 📊 Índices Importantes

```sql
-- Busca vetorial para manutenção
CREATE INDEX idx_mmi_jobs_embedding ON mmi_maintenance_jobs 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Performance em logs
CREATE INDEX idx_access_logs_user_timestamp ON access_logs(user_id, timestamp);

-- Busca em auditorias
CREATE INDEX idx_peotram_audits_org ON peotram_audits(organization_id, audit_date);
```

---

## 🔄 Triggers Ativos

| Tabela | Trigger | Função | Evento |
|--------|---------|--------|--------|
| organization_users | update_updated_at | set_updated_at() | UPDATE |
| vessels | update_vessel_updated_at | set_updated_at() | UPDATE |
| ai_commands | update_ai_commands_updated_at | update_ai_commands_updated_at() | UPDATE |
| reservations | detect_conflicts | detect_reservation_conflicts() | INSERT/UPDATE |

---

*Documentação gerada automaticamente do schema Supabase.*
