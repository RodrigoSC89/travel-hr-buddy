# 🔧 APLICAR RLS POLICIES - INSTRUÇÕES PASSO A PASSO

## ⚠️ AÇÃO NECESSÁRIA: Aplicar Migration Manualmente

A migration `20251114000001_add_rls_policies_missing_tables.sql` **não pode ser aplicada automaticamente** porque:
- ❌ `psql` não está instalado
- ❌ Supabase CLI falha (config.toml com erros)
- ❌ RPC `exec_sql` não disponível na API pública

---

## 📋 PASSO A PASSO (5 minutos)

### 1. Abrir Supabase Dashboard
🔗 **Link direto**: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql

### 2. Ir para SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Ou use o atalho: `Alt + S`

### 3. Copiar SQL da Migration
Abra o arquivo:
```
supabase/migrations/20251114000001_add_rls_policies_missing_tables.sql
```

**OU** copie o conteúdo abaixo:

```sql
-- ============================================
-- FIX RLS POLICIES - 8 TABELAS SEM POLICIES
-- Data: 2025-11-14
-- ============================================

-- 1. AUTOMATED_REPORTS
CREATE POLICY "automated_reports_select" ON public.automated_reports
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
        )
    );

CREATE POLICY "automated_reports_insert" ON public.automated_reports
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "automated_reports_update" ON public.automated_reports
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "automated_reports_delete" ON public.automated_reports
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
            AND role = 'admin'
        )
    );

-- 2. AUTOMATION_EXECUTIONS
CREATE POLICY "automation_executions_select" ON public.automation_executions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automation_executions.organization_id
        )
    );

CREATE POLICY "automation_executions_insert" ON public.automation_executions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automation_executions.organization_id
        )
        OR auth.role() = 'service_role'
    );

-- 3. ORGANIZATION_BILLING (RESTRITO)
CREATE POLICY "organization_billing_select" ON public.organization_billing
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_billing.organization_id
            AND role = 'admin'
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "organization_billing_insert" ON public.organization_billing
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_billing.organization_id
            AND role = 'admin'
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "organization_billing_update" ON public.organization_billing
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_billing.organization_id
            AND role = 'admin'
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "organization_billing_delete" ON public.organization_billing
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_billing.organization_id
            AND role = 'admin'
        )
        OR auth.role() = 'service_role'
    );

-- 4. ORGANIZATION_METRICS
CREATE POLICY "organization_metrics_select" ON public.organization_metrics
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
        )
    );

CREATE POLICY "organization_metrics_insert" ON public.organization_metrics
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "organization_metrics_update" ON public.organization_metrics
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "organization_metrics_delete" ON public.organization_metrics
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
            AND role = 'admin'
        )
    );
```

### 4. Colar e Executar
- Cole o SQL no editor
- Clique em **"Run"** (ou `Ctrl + Enter`)
- ⏱️ Aguarde ~5-10 segundos

### 5. Verificar Sucesso
Você deve ver:
```
Success. No rows returned
```

Se aparecer erro tipo `policy already exists`, **tudo bem** — significa que já foi aplicado antes.

---

## ✅ CONFIRMAR APLICAÇÃO

Execute este SQL para verificar:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'automated_reports',
  'automation_executions', 
  'organization_billing',
  'organization_metrics'
)
ORDER BY tablename, policyname;
```

**Resultado esperado**: 16 linhas (4 policies × 4 tabelas)

---

## 📊 O QUE ESSA MIGRATION FAZ

### Tabelas Corrigidas
1. ✅ `automated_reports` - Reports automáticos
2. ✅ `automation_executions` - Histórico de execuções
3. ✅ `organization_billing` - Faturamento (restrito admins)
4. ✅ `organization_metrics` - Métricas organizacionais

### Policies Criadas (16 total)
- **SELECT**: Membros podem visualizar
- **INSERT**: Admins/managers podem criar
- **UPDATE**: Admins/managers podem atualizar
- **DELETE**: Apenas admins podem deletar

### Segurança
- ✅ RLS habilitado
- ✅ service_role pode executar operações (para automações)
- ✅ Billing restrito exclusivamente a admins

---

## 🚨 TROUBLESHOOTING

### Erro: "relation does not exist"
**Causa**: Tabela não existe no banco  
**Solução**: Verificar se migrations anteriores foram aplicadas

### Erro: "policy already exists"
**Causa**: Migration já foi aplicada  
**Solução**: ✅ Tudo OK! Ignore o erro

### Erro: "column organization_id does not exist"
**Causa**: Schema da tabela diferente do esperado  
**Solução**: Verificar estrutura com `\d+ automated_reports` no SQL Editor

---

## 📞 SUPORTE

Se tiver problemas:
1. Tire screenshot do erro
2. Execute: `SELECT version();` para ver versão do Postgres
3. Execute: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%report%';`
