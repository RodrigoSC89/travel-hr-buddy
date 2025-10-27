# 🧪 PATCH 245 – Supabase Types + RLS Safety Check

## Module Information
- **Module**: `global-types`
- **Patch**: 245
- **Priority**: CRITICAL
- **Status**: 🟡 PENDING VALIDATION

---

## 📋 Objectives

### 1. Type Safety
- [ ] `src/integrations/supabase/types.ts` atualizado com todas as tabelas
- [ ] Zero @ts-nocheck em arquivos críticos
- [ ] Build passa sem erros de tipagem
- [ ] Autocomplete funciona para todas as tabelas

### 2. RLS Validation
- [ ] Todas as tabelas têm RLS habilitado
- [ ] Políticas criadas para SELECT, INSERT, UPDATE, DELETE
- [ ] Teste multi-usuário valida isolamento de dados
- [ ] Nenhuma tabela sensível sem RLS

### 3. Security Audit
- [ ] Nenhuma política permite acesso global sem filtro
- [ ] Foreign keys respeitam RLS
- [ ] Funções SECURITY DEFINER auditadas
- [ ] Storage buckets com políticas corretas

### 4. Code Quality
- [ ] Remoção de todos os @ts-nocheck
- [ ] Tipos explícitos em queries Supabase
- [ ] Validação de runtime com Zod (onde aplicável)
- [ ] Erros de TypeScript corrigidos

---

## 🗄️ Current Tables Requiring Types

### Existing Tables (from context)
- ✅ `organizations`
- ✅ `organization_users`
- ✅ `vessels`
- ✅ `crew_members`
- ✅ `profiles`
- ✅ `user_roles`
- ✅ `smart_workflows`
- ✅ `workflow_ai_suggestions`

### New Tables to Add
- ⚠️ `financial_transactions`
- ⚠️ `invoices`
- ⚠️ `expense_categories`
- ⚠️ `budgets`
- ⚠️ `voice_conversations`
- ⚠️ `voice_settings`
- ⚠️ `missions`
- ⚠️ `mission_resources`
- ⚠️ `mission_logs`
- ⚠️ `mission_ai_insights`
- ⚠️ `autonomous_decisions`
- ⚠️ `analytics_events`
- ⚠️ `kpi_metrics`
- ⚠️ `dashboard_widgets`

---

## 🔍 RLS Status Check

### Command to Check RLS Status
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Expected Results
| Table | RLS Enabled | Policies Count |
|-------|-------------|----------------|
| organizations | ✅ | 4+ |
| vessels | ✅ | 4+ |
| financial_transactions | ⚠️ | 0 (to implement) |
| missions | ⚠️ | 0 (to implement) |
| voice_conversations | ⚠️ | 0 (to implement) |
| analytics_events | ⚠️ | 0 (to implement) |

---

## 🛡️ RLS Policy Templates

### Template 1: Organization-Scoped Table
```sql
-- Enable RLS
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only their organization's data
CREATE POLICY "Users can view their organization's {table_name}"
  ON public.{table_name} FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- INSERT: Users create only for their organization
CREATE POLICY "Users can create {table_name} for their organization"
  ON public.{table_name} FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- UPDATE: Users update only their organization's data
CREATE POLICY "Users can update their organization's {table_name}"
  ON public.{table_name} FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- DELETE: Admins only
CREATE POLICY "Admins can delete their organization's {table_name}"
  ON public.{table_name} FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND status = 'active'
    )
  );
```

### Template 2: User-Owned Table
```sql
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own {table_name}"
  ON public.{table_name} FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own {table_name}"
  ON public.{table_name} FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own {table_name}"
  ON public.{table_name} FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own {table_name}"
  ON public.{table_name} FOR DELETE
  USING (user_id = auth.uid());
```

---

## ✅ Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| types.ts atualizado | ⏳ | Todas as tabelas incluídas |
| Zero @ts-nocheck em src/ | ⏳ | Exceto arquivos legacy documentados |
| Build sem erros TypeScript | ⏳ | `npm run build` passa |
| Todas as tabelas têm RLS | ⏳ | Via SQL query de verificação |
| Teste multi-user passa | ⏳ | User A não vê dados de User B (org diferente) |
| Políticas auditadas | ⏳ | Nenhuma política insegura detectada |

---

## 🧪 Test Scenarios

### Scenario 1: Type Safety Validation
1. Abrir qualquer arquivo TypeScript
2. Tentar fazer query sem tipagem explícita
3. Verificar se autocomplete sugere tabelas/colunas
4. Compilar projeto e verificar ausência de erros

### Scenario 2: RLS Multi-User Test
```typescript
// User A (Org 1)
const userA = await supabase.auth.signIn({ email: 'userA@org1.com' });
const { data: dataA } = await supabase.from('financial_transactions').select('*');
console.log('User A sees:', dataA.length, 'transactions');

// User B (Org 2)
const userB = await supabase.auth.signIn({ email: 'userB@org2.com' });
const { data: dataB } = await supabase.from('financial_transactions').select('*');
console.log('User B sees:', dataB.length, 'transactions');

// Assert: dataA and dataB should have ZERO overlap
```

### Scenario 3: Storage RLS Test
1. User A faz upload de arquivo em voice-recordings
2. User B tenta acessar URL do arquivo de User A
3. Deve receber 403 Forbidden
4. User B pode acessar seus próprios arquivos

### Scenario 4: Security Definer Audit
```sql
-- Listar todas as funções SECURITY DEFINER
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prosecdef = true
  AND n.nspname = 'public';
```
Revisar cada função para garantir que não expõe dados sensíveis.

---

## 📁 Files to Audit

### Critical Files with @ts-nocheck (to fix)
- ✅ `src/components/crew/crew-rotation-schedule.tsx` (already fixed)
- ✅ `src/components/crew/crew-wellbeing-dashboard.tsx` (already fixed)
- ✅ `src/components/fleet/fleet-management-dashboard.tsx` (already fixed)
- ✅ `src/components/maritime/maritime-system-dashboard.tsx` (already fixed)
- ✅ `src/components/operations/operations-dashboard.tsx` (already fixed)
- ✅ `src/components/user-management/user-management-dashboard.tsx` (already fixed)

### Files Requiring Type Updates
- ⚠️ All files importing from `@/integrations/supabase/client`
- ⚠️ New components for Finance Hub
- ⚠️ New components for Voice Assistant
- ⚠️ New components for Mission Control
- ⚠️ New components for Analytics

---

## 🚀 Next Steps

### Phase 1: Generate Updated Types
1. **Executar todas as migrations** pendentes (PATCH 241-244)
2. **Regenerar types.ts** via Supabase CLI:
   ```bash
   npx supabase gen types typescript --project-id vnbptmixvwropvanyhdb > src/integrations/supabase/types.ts
   ```
3. **Verificar diff** do arquivo types.ts
4. **Testar autocomplete** em um arquivo de exemplo

### Phase 2: Remove @ts-nocheck
1. **Identificar todos os arquivos** com @ts-nocheck:
   ```bash
   grep -r "@ts-nocheck" src/
   ```
2. **Para cada arquivo**:
   - Remover @ts-nocheck
   - Corrigir erros de tipagem revelados
   - Adicionar tipos explícitos nas queries
3. **Rodar build** e verificar

### Phase 3: Validate RLS
1. **Executar query** de status RLS
2. **Identificar tabelas** sem RLS habilitado
3. **Criar políticas** para cada tabela
4. **Testar com múltiplos usuários** de orgs diferentes
5. **Documentar exceções** (se houver)

### Phase 4: Security Audit
1. **Listar SECURITY DEFINER** functions
2. **Revisar cada função** para garantir segurança
3. **Testar acesso indevido** a dados
4. **Validar Storage policies**
5. **Gerar relatório de segurança**

---

## 🎯 Validation Commands

### Check RLS Status
```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = pt.tablename) as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
ORDER BY tablename;
```

### List All Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Find Tables Without RLS
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT IN ('spatial_ref_sys'); -- PostGIS system table
```

### Test RLS as Different Users
```sql
-- Como admin
SET ROLE authenticated;
SET request.jwt.claim.sub = '{user_a_uuid}';
SELECT COUNT(*) FROM financial_transactions; -- Should see only Org A data

-- Como outro usuário
SET request.jwt.claim.sub = '{user_b_uuid}';
SELECT COUNT(*) FROM financial_transactions; -- Should see only Org B data
```

---

## 📊 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Tables with RLS | 100% | ⏳ |
| Files with @ts-nocheck | 0 | ⏳ |
| TypeScript errors | 0 | ⏳ |
| Build time | < 30s | ⏳ |
| Type coverage | > 95% | ⏳ |

---

## 🔐 Security Checklist

- [ ] Nenhuma tabela sensível sem RLS
- [ ] Todas as políticas filtram por org/user
- [ ] Storage buckets com políticas restritivas
- [ ] Funções SECURITY DEFINER auditadas
- [ ] Nenhuma exposição de auth.users
- [ ] Teste de acesso cruzado entre orgs PASSED
- [ ] Logs de auditoria implementados

---

**Status**: 🟡 Aguardando migrations e regeneração de types  
**Last Updated**: 2025-10-27  
**Validation Owner**: AI System  
**Next Action**: Execute migrations PATCH 241-244, then regenerate types.ts
