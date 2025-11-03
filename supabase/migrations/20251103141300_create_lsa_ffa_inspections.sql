-- LSA & FFA Inspections Module
-- Creates tables for Life-Saving Appliances (LSA) and Fire-Fighting Appliances (FFA) inspections
-- Based on SOLAS regulations and official manuals

-- 1. LSA/FFA Inspections Table
CREATE TABLE IF NOT EXISTS public.lsa_ffa_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vessel and Inspector Information
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    inspector TEXT NOT NULL,
    
    -- Inspection Details
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL CHECK (type IN ('LSA', 'FFA')),
    
    -- Checklist and Issues (stored as JSONB for flexibility)
    checklist JSONB NOT NULL DEFAULT '{}',
    issues_found JSONB DEFAULT '[]',
    
    -- Compliance Score (0-100)
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    
    -- AI-Generated Notes
    ai_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    -- Signature validation
    signature_data TEXT,
    signature_validated BOOLEAN DEFAULT false,
    signature_validated_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_vessel_id ON public.lsa_ffa_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_type ON public.lsa_ffa_inspections(type);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_date ON public.lsa_ffa_inspections(date DESC);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_score ON public.lsa_ffa_inspections(score);

-- Enable Row Level Security
ALTER TABLE public.lsa_ffa_inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view inspections for their assigned vessels
CREATE POLICY "Users can view lsa_ffa_inspections for their vessels"
    ON public.lsa_ffa_inspections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_vessels
            WHERE user_vessels.user_id = auth.uid()
            AND user_vessels.vessel_id = lsa_ffa_inspections.vessel_id
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'manager', 'inspector')
        )
    );

-- Users can create inspections for their assigned vessels
CREATE POLICY "Users can create lsa_ffa_inspections"
    ON public.lsa_ffa_inspections FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_vessels
            WHERE user_vessels.user_id = auth.uid()
            AND user_vessels.vessel_id = lsa_ffa_inspections.vessel_id
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'manager', 'inspector')
        )
    );

-- Users can update inspections they created or for their vessels
CREATE POLICY "Users can update lsa_ffa_inspections"
    ON public.lsa_ffa_inspections FOR UPDATE
    USING (
        created_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.user_vessels
            WHERE user_vessels.user_id = auth.uid()
            AND user_vessels.vessel_id = lsa_ffa_inspections.vessel_id
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'manager')
        )
    );

-- Only admins can delete inspections
CREATE POLICY "Admins can delete lsa_ffa_inspections"
    ON public.lsa_ffa_inspections FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lsa_ffa_inspections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_lsa_ffa_inspections_updated_at
    BEFORE UPDATE ON public.lsa_ffa_inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_lsa_ffa_inspections_updated_at();

-- Function to calculate inspection score based on checklist compliance
CREATE OR REPLACE FUNCTION calculate_lsa_ffa_score(checklist_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    total_items INTEGER;
    passed_items INTEGER;
    score INTEGER;
BEGIN
    -- Count total items and passed items from checklist
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE (value->>'status')::TEXT IN ('pass', 'compliant', 'ok'))
    INTO total_items, passed_items
    FROM jsonb_each(checklist_data);
    
    -- Calculate score (0-100)
    IF total_items = 0 THEN
        RETURN 0;
    END IF;
    
    score := ROUND((passed_items::DECIMAL / total_items::DECIMAL) * 100);
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE public.lsa_ffa_inspections IS 'Stores LSA (Life-Saving Appliances) and FFA (Fire-Fighting Appliances) inspection records';
COMMENT ON COLUMN public.lsa_ffa_inspections.type IS 'Type of inspection: LSA or FFA';
COMMENT ON COLUMN public.lsa_ffa_inspections.checklist IS 'JSONB structure containing inspection checklist items with status';
COMMENT ON COLUMN public.lsa_ffa_inspections.issues_found IS 'Array of issues discovered during inspection';
COMMENT ON COLUMN public.lsa_ffa_inspections.score IS 'Calculated compliance score from 0 to 100';
COMMENT ON COLUMN public.lsa_ffa_inspections.ai_notes IS 'AI-generated recommendations and analysis';
