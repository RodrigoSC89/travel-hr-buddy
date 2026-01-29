-- Create maritime_communications table
CREATE TABLE public.maritime_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    vessel_id UUID REFERENCES public.vessels(id),
    vessel_name TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('emergency', 'general', 'weather_alert', 'maintenance', 'navigation', 'port_authority')),
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'acknowledged', 'resolved')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    latitude NUMERIC,
    longitude NUMERIC,
    sender_role TEXT,
    sender_id UUID,
    response_required BOOLEAN DEFAULT false,
    response_text TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.maritime_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view communications" ON public.maritime_communications
    FOR SELECT USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "Users can insert communications" ON public.maritime_communications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Users can update communications" ON public.maritime_communications
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_maritime_communications_updated_at
    BEFORE UPDATE ON public.maritime_communications
    FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();