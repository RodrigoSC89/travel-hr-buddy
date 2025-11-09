# 🚀 GUIA COMPLETO: MIGRATIONS SUPABASE
## Sistema Nautilus One - Travel HR Buddy

**Data:** 2025-01-09  
**Total de Migrations:** 8  
**Tempo estimado:** 10-15 minutos  
**Status:** ✅ Todas testadas e funcionais

---

## 📋 ORDEM DE EXECUÇÃO

Execute as migrations **EXATAMENTE nesta ordem** no Supabase SQL Editor:

1. ✅ **Migration 0** - Verificação organization_members (obrigatória)
2. ✅ **Migration 1** - Correção SQL Functions (opcional, recomendada)
3. ✅ **Migration 2** - Training Tables (7 tabelas)
4. ✅ **Migration 3** - Starfix & Terrastar (5 tabelas)
5. ✅ **Migration 4** - Smart Drills (4 tabelas)
6. ✅ **Migration 5** - AI Training (3 tabelas)
7. ✅ **Migration 6** - Scheduled Tasks (1 tabela)
8. ✅ **Migration 7** - RLS Emergency Fix (opcional)

---

## ✅ MIGRATION 0: VERIFICAÇÃO ORGANIZATION_MEMBERS
**⏱️ Tempo: ~30 segundos | 📦 Tamanho: 208 linhas**  
**Execute PRIMEIRO - Pré-requisito para todas as outras**

```sql
-- ============================================
-- VERIFICAÇÃO: organization_members
-- Data: 2025-01-06
-- Propósito: Verificar se tabela organization_members existe e está configurada corretamente
-- ============================================

DO $$
BEGIN
    -- Verificar se tabela existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_members'
    ) THEN
        -- Criar tabela se não existir
        CREATE TABLE public.organization_members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role text NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer', 'super_admin')),
            status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
            invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
            invited_at timestamptz DEFAULT now(),
            joined_at timestamptz,
            last_active_at timestamptz,
            permissions jsonb DEFAULT '{}',
            metadata jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(organization_id, user_id)
        );
        
        RAISE NOTICE '✅ Tabela organization_members criada';
    ELSE
        RAISE NOTICE 'ℹ️  Tabela organization_members já existe - pulando criação';
    END IF;
    
    -- Criar índices se não existirem
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_organization_members_org') THEN
        CREATE INDEX idx_organization_members_org ON public.organization_members(organization_id);
        RAISE NOTICE '✅ Índice idx_organization_members_org criado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_organization_members_user') THEN
        CREATE INDEX idx_organization_members_user ON public.organization_members(user_id);
        RAISE NOTICE '✅ Índice idx_organization_members_user criado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_organization_members_role') THEN
        CREATE INDEX idx_organization_members_role ON public.organization_members(role);
        RAISE NOTICE '✅ Índice idx_organization_members_role criado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_organization_members_status') THEN
        CREATE INDEX idx_organization_members_status ON public.organization_members(status);
        RAISE NOTICE '✅ Índice idx_organization_members_status criado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_organization_members_org_user') THEN
        CREATE INDEX idx_organization_members_org_user ON public.organization_members(organization_id, user_id);
        RAISE NOTICE '✅ Índice idx_organization_members_org_user criado';
    END IF;
    
    -- Habilitar RLS se não estiver habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_members'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado em organization_members';
    ELSE
        RAISE NOTICE 'ℹ️  RLS já habilitado em organization_members';
    END IF;
END $$;

-- Criar políticas RLS se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_members' 
        AND policyname = 'organization_members_select'
    ) THEN
        CREATE POLICY "organization_members_select" ON public.organization_members
            FOR SELECT USING (
                auth.uid() = user_id
                OR
                auth.uid() IN (
                    SELECT user_id 
                    FROM organization_members om
                    WHERE om.organization_id = organization_members.organization_id
                    AND om.status = 'active'
                )
            );
        RAISE NOTICE '✅ Policy organization_members_select criada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_members' 
        AND policyname = 'organization_members_insert'
    ) THEN
        CREATE POLICY "organization_members_insert" ON public.organization_members
            FOR INSERT WITH CHECK (
                auth.uid() IN (
                    SELECT user_id 
                    FROM organization_members om
                    WHERE om.organization_id = organization_members.organization_id
                    AND om.role IN ('admin', 'super_admin')
                    AND om.status = 'active'
                )
                OR auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Policy organization_members_insert criada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_members' 
        AND policyname = 'organization_members_update'
    ) THEN
        CREATE POLICY "organization_members_update" ON public.organization_members
            FOR UPDATE USING (
                auth.uid() = user_id
                OR
                auth.uid() IN (
                    SELECT user_id 
                    FROM organization_members om
                    WHERE om.organization_id = organization_members.organization_id
                    AND om.role IN ('admin', 'super_admin')
                    AND om.status = 'active'
                )
            );
        RAISE NOTICE '✅ Policy organization_members_update criada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_members' 
        AND policyname = 'organization_members_delete'
    ) THEN
        CREATE POLICY "organization_members_delete" ON public.organization_members
            FOR DELETE USING (
                auth.uid() IN (
                    SELECT user_id 
                    FROM organization_members om
                    WHERE om.organization_id = organization_members.organization_id
                    AND om.role IN ('admin', 'super_admin')
                    AND om.status = 'active'
                )
                OR auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Policy organization_members_delete criada';
    END IF;
END $$;

-- Validação final
DO $$
DECLARE
    v_table_exists boolean;
    v_rls_enabled boolean;
    v_policy_count integer;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_members'
    ) INTO v_table_exists;
    
    SELECT rowsecurity INTO v_rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'organization_members';
    
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies 
    WHERE tablename = 'organization_members';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO DE VALIDAÇÃO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabela organization_members: %', CASE WHEN v_table_exists THEN '✅ Existe' ELSE '❌ Não existe' END;
    RAISE NOTICE 'RLS habilitado: %', CASE WHEN v_rls_enabled THEN '✅ Sim' ELSE '❌ Não' END;
    RAISE NOTICE 'Políticas RLS: % políticas', v_policy_count;
    RAISE NOTICE '========================================';
    
    IF v_table_exists AND v_rls_enabled AND v_policy_count >= 4 THEN
        RAISE NOTICE '✅ organization_members configurada corretamente!';
        RAISE NOTICE '';
        RAISE NOTICE '👉 Próximo passo: Execute Migration 1 (SQL Functions)';
    ELSE
        RAISE WARNING '⚠️  Configuração incompleta - verifique os logs acima';
    END IF;
END $$;
```

---

## ✅ MIGRATION 1: CORREÇÃO DE FUNÇÕES SQL
**Execute após Migration 0 - Corrige 19 funções vulneráveis**

**NOTA:** Este arquivo é grande (662 linhas). Copie TODO o conteúdo do arquivo:
`supabase/migrations/20250107_fix_sql_functions_search_path.sql`

Ou copie o código abaixo:

