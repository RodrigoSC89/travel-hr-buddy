-- Create maintenance_records table (missing)
CREATE TABLE public.maintenance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- hours
  actual_duration INTEGER, -- hours
  cost_estimate NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  assigned_technician TEXT,
  location TEXT,
  parts_required TEXT[],
  next_maintenance_date DATE,
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maritime_alerts table (missing)
CREATE TABLE public.maritime_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('safety', 'maintenance', 'operational', 'weather', 'fuel', 'crew', 'cargo')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  predicted_impact TEXT,
  ai_confidence INTEGER DEFAULT 0 CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  recommendations TEXT[],
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'false_positive')),
  auto_generated BOOLEAN DEFAULT false,
  related_data JSONB DEFAULT '{}',
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vessel_certificates table (missing)
CREATE TABLE public.vessel_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('vessel', 'crew', 'company')),
  category TEXT NOT NULL,
  certificate_name TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired', 'suspended', 'pending')),
  compliance_score INTEGER DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  file_url TEXT,
  renewal_cost NUMERIC(12,2),
  notes TEXT,
  last_inspection DATE,
  next_inspection DATE,
  regulatory_body TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on new tables
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage maintenance records from their organization"
ON public.maintenance_records FOR ALL
USING (
  vessel_id IN (
    SELECT id FROM public.vessels 
    WHERE organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Users can manage alerts for their organization vessels"
ON public.maritime_alerts FOR ALL
USING (
  vessel_id IN (
    SELECT id FROM public.vessels 
    WHERE organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Users can manage certificates for their organization"
ON public.vessel_certificates FOR ALL
USING (
  CASE 
    WHEN vessel_id IS NOT NULL THEN
      vessel_id IN (
        SELECT id FROM public.vessels 
        WHERE organization_id IN (
          SELECT organization_id FROM organization_users 
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    ELSE
      organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      )
  END
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_maintenance_records_updated_at 
  BEFORE UPDATE ON public.maintenance_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maritime_alerts_updated_at 
  BEFORE UPDATE ON public.maritime_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessel_certificates_updated_at 
  BEFORE UPDATE ON public.vessel_certificates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for new tables
ALTER TABLE public.maintenance_records REPLICA IDENTITY FULL;
ALTER TABLE public.maritime_alerts REPLICA IDENTITY FULL;  
ALTER TABLE public.vessel_certificates REPLICA IDENTITY FULL;

-- Add new tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maritime_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vessel_certificates;

-- Create indexes for better performance
CREATE INDEX idx_maintenance_vessel ON public.maintenance_records(vessel_id);
CREATE INDEX idx_maintenance_status ON public.maintenance_records(status);
CREATE INDEX idx_alerts_vessel_status ON public.maritime_alerts(vessel_id, status);
CREATE INDEX idx_certificates_vessel ON public.vessel_certificates(vessel_id);
CREATE INDEX idx_certificates_expiry ON public.vessel_certificates(expiry_date);