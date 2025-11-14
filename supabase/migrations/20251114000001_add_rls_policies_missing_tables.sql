-- ============================================
-- FIX RLS POLICIES - 8 TABELAS SEM POLICIES
-- Data: 2025-11-14
-- Propósito: Adicionar policies para tabelas com RLS habilitado mas sem policies
-- Ref: Supabase Linter Warnings - RLS enabled without policies
-- ============================================

-- ============================================
-- 1. AUTOMATED_REPORTS
-- Reports gerados automaticamente pelo sistema
-- ============================================
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

-- ============================================
-- 2. AUTOMATION_EXECUTIONS
-- Execuções de automações (histórico)
-- ============================================
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

-- Executions são read-only após criação (não permitem UPDATE/DELETE)

-- ============================================
-- 3. ORGANIZATION_BILLING
-- Faturamento - RESTRITO a admins
-- ============================================
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

-- ============================================
-- 4. ORGANIZATION_METRICS
-- Métricas organizacionais
-- ============================================
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

-- ============================================
-- NOTA: 4 tabelas restantes não identificadas pelo linter
-- Verificar manualmente quais tabelas têm RLS sem policies:
-- 
-- SELECT schemaname, tablename 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename NOT IN (
--   SELECT DISTINCT tablename 
--   FROM pg_policies 
--   WHERE schemaname = 'public'
-- )
-- AND EXISTS (
--   SELECT 1 FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' 
--   AND c.relname = tablename
--   AND c.relrowsecurity = true
-- );
-- ============================================

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "automated_reports_select" ON automated_reports 
    IS 'Membros da organização podem visualizar reports automáticos';
COMMENT ON POLICY "automated_reports_insert" ON automated_reports 
    IS 'Apenas admins/managers podem criar reports automáticos';

COMMENT ON POLICY "automation_executions_select" ON automation_executions 
    IS 'Membros podem visualizar execuções de automação';
COMMENT ON POLICY "automation_executions_insert" ON automation_executions 
    IS 'Sistema pode registrar execuções';

COMMENT ON POLICY "organization_billing_select" ON organization_billing 
    IS 'RESTRITO: Apenas admins podem ver faturamento';
COMMENT ON POLICY "organization_billing_insert" ON organization_billing 
    IS 'RESTRITO: Apenas admins podem criar registros de faturamento';

COMMENT ON POLICY "organization_metrics_select" ON organization_metrics 
    IS 'Membros podem visualizar métricas organizacionais';
COMMENT ON POLICY "organization_metrics_insert" ON organization_metrics 
    IS 'Admins/managers podem criar métricas';
