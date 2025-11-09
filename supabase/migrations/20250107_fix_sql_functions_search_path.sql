-- ============================================
-- CORREÇÃO DE SEGURANÇA: SQL Functions
-- Adicionar SET search_path = public em 19 funções vulneráveis
-- Data: 2025-01-07
-- Risco: ALTO - Vulnerabilidade a SQL injection
-- ============================================

-- IMPORTANTE: Esta migration adiciona SET search_path = public em todas as funções
-- que estavam vulneráveis segundo relatório de segurança do Lovable

-- ============================================
-- REMOVER FUNÇÕES ANTIGAS (se existirem)
-- ============================================
DROP FUNCTION IF EXISTS public.cleanup_old_logs() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_branding() CASCADE;
DROP FUNCTION IF EXISTS public.create_session_token(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.detect_reservation_conflicts() CASCADE;
DROP FUNCTION IF EXISTS public.generate_crew_ai_recommendations(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_active_sessions() CASCADE;
DROP FUNCTION IF EXISTS public.get_reservation_stats(date, date) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.jobs_trend_by_month(integer) CASCADE;
DROP FUNCTION IF EXISTS public.match_mmi_jobs(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.revoke_session_token(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_audit_non_conformities_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_channel_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_context_snapshot_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS public.update_crew_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_maritime_certificate_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.validate_email_format() CASCADE;

-- ============================================
-- FUNÇÃO 1: cleanup_old_logs
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Limpar logs com mais de 90 dias
    DELETE FROM logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    RAISE NOTICE 'Old logs cleaned successfully';
END;
$$;

-- ============================================
-- FUNÇÃO 2: create_default_branding
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_branding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Criar branding padrão quando nova organização é criada
    INSERT INTO branding (
        organization_id,
        primary_color,
        secondary_color,
        logo_url
    ) VALUES (
        NEW.id,
        '#0066CC',
        '#00CCFF',
        NULL
    );
    
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 3: create_session_token
-- ============================================
CREATE OR REPLACE FUNCTION public.create_session_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_token text;
    v_expires_at timestamptz;
BEGIN
    -- Gerar token aleatório de 32 bytes
    v_token := encode(gen_random_bytes(32), 'hex');
    v_expires_at := NOW() + INTERVAL '7 days';
    
    -- Inserir token na tabela
    INSERT INTO session_tokens (user_id, token, expires_at)
    VALUES (p_user_id, v_token, v_expires_at);
    
    RETURN v_token;
END;
$$;

-- ============================================
-- FUNÇÃO 4: detect_reservation_conflicts
-- ============================================
CREATE OR REPLACE FUNCTION public.detect_reservation_conflicts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se existe conflito de reserva
    IF EXISTS (
        SELECT 1 
        FROM reservations 
        WHERE resource_id = NEW.resource_id 
        AND tsrange(start_time, end_time) && tsrange(NEW.start_time, NEW.end_time)
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status != 'cancelled'
    ) THEN
        RAISE EXCEPTION 'Reservation conflict detected for resource % between % and %', 
            NEW.resource_id, NEW.start_time, NEW.end_time;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 5: generate_crew_ai_recommendations
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_crew_ai_recommendations(p_vessel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_recommendations jsonb;
BEGIN
    -- Gerar recomendações baseadas em dados da tripulação
    SELECT jsonb_build_object(
        'vessel_id', p_vessel_id,
        'timestamp', NOW(),
        'recommendations', jsonb_agg(
            jsonb_build_object(
                'crew_member_id', cm.id,
                'name', cm.name,
                'position', cm.position,
                'certificates_expiring', (
                    SELECT COUNT(*) 
                    FROM maritime_certificates mc 
                    WHERE mc.crew_member_id = cm.id 
                    AND mc.expiry_date < NOW() + INTERVAL '60 days'
                )
            )
        )
    ) INTO v_recommendations
    FROM crew_members cm
    WHERE cm.vessel_id = p_vessel_id;
    
    RETURN COALESCE(v_recommendations, '{}'::jsonb);
END;
$$;

-- ============================================
-- FUNÇÃO 6: get_active_sessions
-- ============================================
CREATE OR REPLACE FUNCTION public.get_active_sessions()
RETURNS TABLE(
    session_id uuid, 
    user_id uuid, 
    created_at timestamptz,
    expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        st.id AS session_id,
        st.user_id,
        st.created_at,
        st.expires_at
    FROM session_tokens st
    WHERE st.expires_at > NOW()
    AND st.revoked = false
    ORDER BY st.created_at DESC;
END;
$$;

-- ============================================
-- FUNÇÃO 7: get_reservation_stats
-- ============================================
CREATE OR REPLACE FUNCTION public.get_reservation_stats(
    p_start_date date, 
    p_end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'total_reservations', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'by_resource', jsonb_agg(DISTINCT resource_id)
    ) INTO v_stats
    FROM reservations
    WHERE start_time::date BETWEEN p_start_date AND p_end_date;
    
    RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$;

-- ============================================
-- FUNÇÃO 8: handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Criar perfil do usuário
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'user',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 9: jobs_trend_by_month
-- ============================================
CREATE OR REPLACE FUNCTION public.jobs_trend_by_month(p_year integer)
RETURNS TABLE(
    month integer, 
    job_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(MONTH FROM created_at)::integer AS month,
        COUNT(*) AS job_count
    FROM jobs
    WHERE EXTRACT(YEAR FROM created_at) = p_year
    GROUP BY EXTRACT(MONTH FROM created_at)
    ORDER BY month;
END;
$$;

-- ============================================
-- FUNÇÃO 10: match_mmi_jobs
-- ============================================
CREATE OR REPLACE FUNCTION public.match_mmi_jobs(p_criteria jsonb)
RETURNS SETOF jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY 
    SELECT j.* 
    FROM jobs j
    WHERE j.metadata @> p_criteria
    OR j.title ILIKE '%' || (p_criteria->>'search_term') || '%'
    OR j.description ILIKE '%' || (p_criteria->>'search_term') || '%'
    ORDER BY j.created_at DESC
    LIMIT 100;
END;
$$;

-- ============================================
-- FUNÇÃO 11: revoke_session_token
-- ============================================
CREATE OR REPLACE FUNCTION public.revoke_session_token(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE session_tokens 
    SET 
        revoked = true,
        revoked_at = NOW()
    WHERE token = p_token;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Token not found: %', p_token;
    END IF;
END;
$$;

-- ============================================
-- FUNÇÃO 12: update_audit_non_conformities_count
-- ============================================
CREATE OR REPLACE FUNCTION public.update_audit_non_conformities_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar contador de não conformidades
    UPDATE audits 
    SET 
        non_conformities_count = (
            SELECT COUNT(*) 
            FROM audit_findings 
            WHERE audit_id = COALESCE(NEW.audit_id, OLD.audit_id)
            AND finding_type = 'non_conformity'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.audit_id, OLD.audit_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================
-- FUNÇÃO 13: update_channel_stats
-- ============================================
CREATE OR REPLACE FUNCTION public.update_channel_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar estatísticas do canal
    UPDATE channels 
    SET 
        message_count = message_count + 1,
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.channel_id;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 14: update_context_snapshot_timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_context_snapshot_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 15: update_conversation_last_message
-- ============================================
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 16: update_crew_updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_crew_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 17: update_maritime_certificate_status
-- ============================================
CREATE OR REPLACE FUNCTION public.update_maritime_certificate_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar status baseado na data de expiração
    IF NEW.expiry_date < NOW() THEN
        NEW.status = 'expired';
    ELSIF NEW.expiry_date < NOW() + INTERVAL '30 days' THEN
        NEW.status = 'expiring_soon';
    ELSIF NEW.expiry_date < NOW() + INTERVAL '60 days' THEN
        NEW.status = 'warning';
    ELSE
        NEW.status = 'valid';
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 18: update_updated_at_column (generic trigger function)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- FUNÇÃO 19: validate_email_format
-- ============================================
CREATE OR REPLACE FUNCTION public.validate_email_format()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar formato de email
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- VALIDAÇÃO: Verificar que todas as funções têm search_path
-- ============================================
DO $$
DECLARE
    v_function_count integer;
    v_secure_count integer;
BEGIN
    -- Contar funções totais no schema public
    SELECT COUNT(*) INTO v_function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    -- Contar funções com search_path
    SELECT COUNT(*) INTO v_secure_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proconfig @> ARRAY['search_path=public'];
    
    RAISE NOTICE '✅ Total functions in public schema: %', v_function_count;
    RAISE NOTICE '✅ Secure functions (with search_path): %', v_secure_count;
    RAISE NOTICE '⚠️  Functions without search_path: %', v_function_count - v_secure_count;
END $$;

-- Mostrar relatório das 19 funções corrigidas
SELECT 
    p.proname AS function_name,
    CASE 
        WHEN p.proconfig @> ARRAY['search_path=public'] THEN '✅ Secure'
        ELSE '❌ Vulnerable'
    END AS security_status,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'cleanup_old_logs',
    'create_default_branding',
    'create_session_token',
    'detect_reservation_conflicts',
    'generate_crew_ai_recommendations',
    'get_active_sessions',
    'get_reservation_stats',
    'handle_new_user',
    'jobs_trend_by_month',
    'match_mmi_jobs',
    'revoke_session_token',
    'update_audit_non_conformities_count',
    'update_channel_stats',
    'update_context_snapshot_timestamp',
    'update_conversation_last_message',
    'update_crew_updated_at',
    'update_maritime_certificate_status',
    'update_updated_at_column',
    'validate_email_format'
)
ORDER BY function_name;
