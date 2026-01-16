-- Add AI analysis columns to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS ai_recommendations TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for risk_level filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_risk_level ON public.dp_incidents(risk_level);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_analyzed_at ON public.dp_incidents(analyzed_at);

-- Create checklists table for maritime checklist persistence
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  description TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT,
  inspector_id UUID,
  inspector_name TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'pending_review', 'approved', 'rejected', 'completed')),
  items JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  scheduled_for TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  compliance_score NUMERIC(5,2),
  ai_analysis JSONB,
  workflow JSONB,
  tags TEXT[],
  location JSONB,
  weather JSONB,
  template JSONB,
  parent_checklist_id UUID REFERENCES public.checklists(id),
  offline_data JSONB,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejection_reason TEXT
);

-- Enable RLS
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view checklists from their organization" 
ON public.checklists FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create checklists for their organization" 
ON public.checklists FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update checklists from their organization" 
ON public.checklists FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete checklists from their organization" 
ON public.checklists FOR DELETE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checklists_organization ON public.checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_checklists_vessel ON public.checklists(vessel_id);
CREATE INDEX IF NOT EXISTS idx_checklists_status ON public.checklists(status);
CREATE INDEX IF NOT EXISTS idx_checklists_type ON public.checklists(type);
CREATE INDEX IF NOT EXISTS idx_checklists_scheduled ON public.checklists(scheduled_for);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_checklists_updated_at ON public.checklists;
CREATE TRIGGER update_checklists_updated_at
BEFORE UPDATE ON public.checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_checklists_updated_at();