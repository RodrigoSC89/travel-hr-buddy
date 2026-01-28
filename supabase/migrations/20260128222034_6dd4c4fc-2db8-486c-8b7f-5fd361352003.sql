-- PATCH: Criar tabelas faltantes para módulo de incidentes

-- 1. Tabela incident_signatures (assinaturas de incidentes)
CREATE TABLE IF NOT EXISTS public.incident_signatures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID NOT NULL,
    signer_name TEXT NOT NULL,
    signer_role TEXT,
    signature_data TEXT, -- Base64 signature image
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT,
    verified BOOLEAN DEFAULT false,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela incident_actions (ações corretivas de incidentes)
CREATE TABLE IF NOT EXISTS public.incident_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID NOT NULL,
    action_type TEXT NOT NULL DEFAULT 'corrective',
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID,
    assigned_to_name TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    evidence_files JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    organization_id UUID REFERENCES public.organizations(id),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incident_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incident_signatures
CREATE POLICY "Users can view incident signatures in their org" 
ON public.incident_signatures FOR SELECT 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert incident signatures" 
ON public.incident_signatures FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for incident_actions
CREATE POLICY "Users can view incident actions in their org" 
ON public.incident_actions FOR SELECT 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can manage incident actions in their org" 
ON public.incident_actions FOR ALL 
USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incident_signatures_incident ON public.incident_signatures(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_actions_incident ON public.incident_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_actions_status ON public.incident_actions(status);
CREATE INDEX IF NOT EXISTS idx_incident_actions_due ON public.incident_actions(due_date);