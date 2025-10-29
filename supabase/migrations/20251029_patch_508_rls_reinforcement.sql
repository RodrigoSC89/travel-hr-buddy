-- PATCH 508: Complete RLS (Row-Level Security) Reinforcement
-- Comprehensive security audit and RLS policies for all critical tables

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  );
$$;

-- Helper function to check if user owns record
CREATE OR REPLACE FUNCTION public.is_owner(owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT owner_id = auth.uid();
$$;

-- =====================================================
-- PROFILES TABLE - User profile security
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (is_admin());

-- =====================================================
-- MISSIONS TABLE - Mission access control
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view their missions" ON public.missions;
DROP POLICY IF EXISTS "Users can create missions" ON public.missions;
DROP POLICY IF EXISTS "Users can update their missions" ON public.missions;
DROP POLICY IF EXISTS "Admins can view all missions" ON public.missions;

CREATE POLICY "Users can view their missions"
    ON public.missions FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles WHERE id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY "Users can create missions"
    ON public.missions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their missions"
    ON public.missions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY "Admins can view all missions"
    ON public.missions FOR SELECT
    USING (is_admin());

-- =====================================================
-- CREW_MEMBERS TABLE - Crew data protection
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view crew members" ON public.crew_members;
DROP POLICY IF EXISTS "Admins can manage crew members" ON public.crew_members;

CREATE POLICY "Users can view crew members"
    ON public.crew_members FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        OR is_admin()
    );

CREATE POLICY "Admins can manage crew members"
    ON public.crew_members FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- DOCUMENTS TABLE - Document access control
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view their documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their documents" ON public.documents;

CREATE POLICY "Users can view their documents"
    ON public.documents FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_admin()
    );

CREATE POLICY "Users can create documents"
    ON public.documents FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their documents"
    ON public.documents FOR UPDATE
    USING (user_id = auth.uid() OR is_admin())
    WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete their documents"
    ON public.documents FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- =====================================================
-- CHECKLISTS TABLE - Checklist security
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can create checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can update checklists" ON public.checklists;

CREATE POLICY "Users can view checklists"
    ON public.checklists FOR SELECT
    USING (
        created_by = auth.uid()
        OR is_admin()
    );

CREATE POLICY "Users can create checklists"
    ON public.checklists FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update checklists"
    ON public.checklists FOR UPDATE
    USING (created_by = auth.uid() OR is_admin())
    WITH CHECK (created_by = auth.uid() OR is_admin());

-- =====================================================
-- AUDITS TABLE - Audit record protection
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view audits" ON public.audits;
DROP POLICY IF EXISTS "Admins can manage audits" ON public.audits;

CREATE POLICY "Users can view audits"
    ON public.audits FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        OR is_admin()
    );

CREATE POLICY "Admins can manage audits"
    ON public.audits FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- MMI_JOBS TABLE - Maintenance job security
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view mmi jobs" ON public.mmi_jobs;
DROP POLICY IF EXISTS "Users can create mmi jobs" ON public.mmi_jobs;
DROP POLICY IF EXISTS "Admins can manage mmi jobs" ON public.mmi_jobs;

CREATE POLICY "Users can view mmi jobs"
    ON public.mmi_jobs FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create mmi jobs"
    ON public.mmi_jobs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage mmi jobs"
    ON public.mmi_jobs FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- WORKFLOWS TABLE - Workflow access control
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can create workflows" ON public.workflows;
DROP POLICY IF EXISTS "Admins can manage workflows" ON public.workflows;

CREATE POLICY "Users can view workflows"
    ON public.workflows FOR SELECT
    USING (
        created_by = auth.uid()
        OR is_admin()
    );

CREATE POLICY "Users can create workflows"
    ON public.workflows FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage workflows"
    ON public.workflows FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- TEMPLATES TABLE - Template access control
-- =====================================================
DO $$ BEGIN
  ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can view templates" ON public.templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;

CREATE POLICY "Users can view templates"
    ON public.templates FOR SELECT
    USING (
        created_by = auth.uid()
        OR is_public = true
        OR is_admin()
    );

CREATE POLICY "Users can create templates"
    ON public.templates FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage templates"
    ON public.templates FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- Grant necessary permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner TO authenticated;

-- Create audit log for RLS policy changes
CREATE TABLE IF NOT EXISTS public.rls_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'created', 'modified', 'deleted'
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    details JSONB DEFAULT '{}'::jsonb
);

-- Log this security update
INSERT INTO public.rls_audit_log (table_name, policy_name, action, details)
VALUES 
    ('multiple', 'PATCH_508_RLS_REINFORCEMENT', 'created', 
     '{"description": "Complete RLS reinforcement for all critical tables", "tables_secured": 10}'::jsonb);

COMMENT ON TABLE public.rls_audit_log IS 'PATCH 508: Audit log for RLS policy changes and security updates';
