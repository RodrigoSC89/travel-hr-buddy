-- ============================================
-- CORREÇÃO EMERGENCIAL DE SEGURANÇA
-- Criação de RLS Policies para 4 tabelas críticas expostas
-- Data: 2025-01-07
-- Risco: CRÍTICO - Dados de billing e automação expostos
-- ============================================

-- ============================================
-- 1. AUTOMATED_REPORTS - Relatórios automatizados
-- ============================================
-- Apenas membros da organização podem ver seus próprios relatórios
CREATE POLICY "automated_reports_select" ON public.automated_reports
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Apenas admins e managers podem criar relatórios
CREATE POLICY "automated_reports_insert" ON public.automated_reports
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- Apenas admins e managers podem atualizar relatórios
CREATE POLICY "automated_reports_update" ON public.automated_reports
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = automated_reports.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- Apenas super admins podem deletar relatórios
CREATE POLICY "automated_reports_delete" ON public.automated_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ============================================
-- 2. AUTOMATION_EXECUTIONS - Execuções de automação
-- ============================================
-- Membros da organização podem ver execuções dos seus relatórios
CREATE POLICY "automation_executions_select" ON public.automation_executions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = (
                SELECT organization_id FROM automated_reports 
                WHERE id = automation_executions.report_id
            )
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Sistema e admins podem criar execuções
CREATE POLICY "automation_executions_insert" ON public.automation_executions
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role'
        OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = (
                SELECT organization_id FROM automated_reports 
                WHERE id = automation_executions.report_id
            )
            AND role IN ('admin', 'manager')
        )
    );

-- Criador ou admins podem atualizar execuções
CREATE POLICY "automation_executions_update" ON public.automation_executions
    FOR UPDATE USING (
        auth.uid() = created_by
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Apenas super admins podem deletar execuções
CREATE POLICY "automation_executions_delete" ON public.automation_executions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ============================================
-- 3. ORGANIZATION_BILLING - CRÍTICO! Dados de cobrança
-- ============================================
-- MÁXIMA SEGURANÇA: Apenas admins da organização ou super admins
CREATE POLICY "organization_billing_select" ON public.organization_billing
    FOR SELECT USING (
        -- Apenas admins da própria organização
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_billing.organization_id
            AND role = 'admin'
        )
        OR
        -- Ou super admins do sistema
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Apenas super admins e service_role podem criar registros de billing
CREATE POLICY "organization_billing_insert" ON public.organization_billing
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        auth.role() = 'service_role'
    );

-- Apenas super admins podem atualizar billing
CREATE POLICY "organization_billing_update" ON public.organization_billing
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- NUNCA deletar registros de billing (auditoria)
CREATE POLICY "organization_billing_delete" ON public.organization_billing
    FOR DELETE USING (
        FALSE
    );

-- ============================================
-- 4. ORGANIZATION_METRICS - Métricas organizacionais
-- ============================================
-- Membros da organização podem ver suas métricas
CREATE POLICY "organization_metrics_select" ON public.organization_metrics
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Sistema, admins e managers podem inserir métricas
CREATE POLICY "organization_metrics_insert" ON public.organization_metrics
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role'
        OR
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- Apenas admins podem atualizar métricas
CREATE POLICY "organization_metrics_update" ON public.organization_metrics
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = organization_metrics.organization_id
            AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Apenas super admins podem deletar métricas
CREATE POLICY "organization_metrics_delete" ON public.organization_metrics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ============================================
-- VALIDAÇÃO: Verificar que as políticas foram criadas
-- ============================================
DO $$
DECLARE
    table_count integer;
BEGIN
    SELECT COUNT(DISTINCT tablename) INTO table_count
    FROM pg_policies 
    WHERE tablename IN (
        'automated_reports',
        'automation_executions', 
        'organization_billing',
        'organization_metrics'
    );
    
    IF table_count = 4 THEN
        RAISE NOTICE '✅ SUCCESS: All 4 critical tables now have RLS policies';
    ELSE
        RAISE WARNING '⚠️ WARNING: Only % of 4 tables have policies', table_count;
    END IF;
END $$;

-- Mostrar relatório de políticas criadas
SELECT 
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies 
WHERE tablename IN (
    'automated_reports',
    'automation_executions',
    'organization_billing',
    'organization_metrics'
)
GROUP BY tablename
ORDER BY tablename;
