-- PATCH 264: Incident Reports - Complete Management System
-- Expands incident management with workflow stages, investigations, and actions

-- 1. Incident Status Table
CREATE TABLE IF NOT EXISTS public.incident_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('reported', 'investigating', 'action_required', 'resolved', 'closed')),
    notes TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Incident Investigations Table
CREATE TABLE IF NOT EXISTS public.incident_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    
    -- Investigation details
    lead_investigator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    investigation_team UUID[],
    
    -- Findings
    root_cause TEXT,
    contributing_factors TEXT[],
    findings JSONB DEFAULT '[]'::jsonb,
    
    -- Timeline
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Evidence
    evidence_collected TEXT[],
    witness_statements JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'on_hold')),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Incident Actions (Corrective/Preventive)
CREATE TABLE IF NOT EXISTS public.incident_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    investigation_id UUID REFERENCES public.incident_investigations(id) ON DELETE CASCADE,
    
    -- Action details
    action_type TEXT NOT NULL CHECK (action_type IN ('corrective', 'preventive', 'immediate')),
    description TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Timeline
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    
    -- Verification
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Effectiveness
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    effectiveness_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Incident Evidence Table
CREATE TABLE IF NOT EXISTS public.incident_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    investigation_id UUID REFERENCES public.incident_investigations(id) ON DELETE CASCADE,
    
    -- Evidence details
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'video', 'document', 'log', 'testimony', 'physical', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    
    -- File information
    file_url TEXT,
    file_name TEXT,
    file_size_bytes INTEGER,
    file_type TEXT,
    
    -- Metadata
    collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    location TEXT,
    
    -- Chain of custody
    custody_log JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Enhanced Incidents Table (if not exists, otherwise add columns)
DO $$ 
BEGIN
    -- Add severity and categorization if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incidents') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'incidents' 
                      AND column_name = 'severity') THEN
            ALTER TABLE public.incidents 
            ADD COLUMN severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'));
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'incidents' 
                      AND column_name = 'category') THEN
            ALTER TABLE public.incidents 
            ADD COLUMN category TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'incidents' 
                      AND column_name = 'subcategory') THEN
            ALTER TABLE public.incidents 
            ADD COLUMN subcategory TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'incidents' 
                      AND column_name = 'impact_level') THEN
            ALTER TABLE public.incidents 
            ADD COLUMN impact_level TEXT CHECK (impact_level IN ('none', 'minor', 'moderate', 'major', 'catastrophic'));
        END IF;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.incident_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view incident_status"
    ON public.incident_status FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can add incident_status"
    ON public.incident_status FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view incident_investigations"
    ON public.incident_investigations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Investigators can manage investigations"
    ON public.incident_investigations FOR ALL
    TO authenticated
    USING (lead_investigator_id = auth.uid() OR auth.uid() = ANY(investigation_team));

CREATE POLICY "Users can view incident_actions"
    ON public.incident_actions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Assigned users can update actions"
    ON public.incident_actions FOR UPDATE
    TO authenticated
    USING (assigned_to = auth.uid());

CREATE POLICY "Users can view incident_evidence"
    ON public.incident_evidence FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can add incident_evidence"
    ON public.incident_evidence FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_incident_status_incident_id ON public.incident_status(incident_id);
CREATE INDEX idx_incident_status_changed_at ON public.incident_status(changed_at DESC);

CREATE INDEX idx_incident_investigations_incident_id ON public.incident_investigations(incident_id);
CREATE INDEX idx_incident_investigations_investigator ON public.incident_investigations(lead_investigator_id);
CREATE INDEX idx_incident_investigations_status ON public.incident_investigations(status);

CREATE INDEX idx_incident_actions_incident_id ON public.incident_actions(incident_id);
CREATE INDEX idx_incident_actions_assigned_to ON public.incident_actions(assigned_to);
CREATE INDEX idx_incident_actions_status ON public.incident_actions(status);
CREATE INDEX idx_incident_actions_due_date ON public.incident_actions(due_date);

CREATE INDEX idx_incident_evidence_incident_id ON public.incident_evidence(incident_id);
CREATE INDEX idx_incident_evidence_investigation_id ON public.incident_evidence(investigation_id);

-- Create update triggers
CREATE TRIGGER update_incident_investigations_updated_at
    BEFORE UPDATE ON public.incident_investigations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incident_actions_updated_at
    BEFORE UPDATE ON public.incident_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check overdue actions
CREATE OR REPLACE FUNCTION public.check_overdue_actions()
RETURNS void AS $$
BEGIN
    UPDATE public.incident_actions
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE
    AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
