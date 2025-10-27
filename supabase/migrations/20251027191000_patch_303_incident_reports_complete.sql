-- PATCH 303: Complete Incident Reports v1
-- Expands schema with full incident management capabilities

-- 1. Create incident_reports table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT UNIQUE NOT NULL,
  
  -- Basic information
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL, -- 'equipment', 'safety', 'personnel', 'environmental', 'operational'
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_analysis', 'resolved', 'closed')),
  
  -- People involved
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Location and time
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT,
  vessel_id UUID,
  
  -- Impact assessment
  impact_level TEXT, -- 'minor', 'moderate', 'major', 'critical'
  affected_systems TEXT[],
  casualties_count INT DEFAULT 0,
  
  -- Root cause analysis
  root_cause TEXT,
  contributing_factors TEXT[],
  
  -- Corrective actions
  immediate_actions TEXT,
  preventive_measures TEXT,
  
  -- Metadata
  is_reportable_to_authority BOOLEAN DEFAULT false,
  authority_notification_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- 2. Create incident_followups table
CREATE TABLE IF NOT EXISTS public.incident_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  
  -- Follow-up details
  followup_type TEXT NOT NULL, -- 'investigation', 'update', 'resolution', 'comment'
  description TEXT NOT NULL,
  
  -- Author
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  
  -- Status changes
  previous_status TEXT,
  new_status TEXT,
  
  -- Attachments reference
  has_attachments BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create incident_attachments table
CREATE TABLE IF NOT EXISTS public.incident_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  followup_id UUID REFERENCES public.incident_followups(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT, -- 'image', 'document', 'video', 'audio'
  file_size_bytes BIGINT,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create incident_notifications table
CREATE TABLE IF NOT EXISTS public.incident_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  
  -- Notification details
  notification_type TEXT NOT NULL, -- 'new_incident', 'status_change', 'assignment', 'urgent'
  recipient_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_reported_by ON public.incident_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_incident_reports_assigned_to ON public.incident_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON public.incident_reports(incident_date DESC);

CREATE INDEX IF NOT EXISTS idx_incident_followups_incident ON public.incident_followups(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_followups_created ON public.incident_followups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident ON public.incident_attachments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_attachments_followup ON public.incident_attachments(followup_id);

CREATE INDEX IF NOT EXISTS idx_incident_notifications_recipient ON public.incident_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_incident_notifications_read ON public.incident_notifications(is_read);

-- Enable RLS
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incident_reports
CREATE POLICY "Users can view incidents they reported or are assigned to"
  ON public.incident_reports FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Authenticated users can create incidents"
  ON public.incident_reports FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can update their incidents or assigned incidents"
  ON public.incident_reports FOR UPDATE
  TO authenticated
  USING (
    reported_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for incident_followups
CREATE POLICY "Users can view follow-ups of incidents they have access to"
  ON public.incident_followups FOR SELECT
  TO authenticated
  USING (
    incident_id IN (
      SELECT id FROM public.incident_reports WHERE
        reported_by = auth.uid() OR
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
  );

CREATE POLICY "Users can create follow-ups"
  ON public.incident_followups FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for incident_attachments
CREATE POLICY "Users can view attachments of incidents they have access to"
  ON public.incident_attachments FOR SELECT
  TO authenticated
  USING (
    incident_id IN (
      SELECT id FROM public.incident_reports WHERE
        reported_by = auth.uid() OR
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
  );

CREATE POLICY "Users can upload attachments"
  ON public.incident_attachments FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for incident_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.incident_notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.incident_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.incident_notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- Update triggers
CREATE TRIGGER update_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-generate incident numbers
CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    NEW.incident_number := 'INC-' || TO_CHAR(NEW.incident_date, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('incident_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS incident_number_seq START 1;

CREATE TRIGGER generate_incident_number_trigger
  BEFORE INSERT ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_incident_number();

-- Function to notify assigned users
CREATE OR REPLACE FUNCTION public.notify_incident_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    INSERT INTO public.incident_notifications (
      incident_id,
      recipient_id,
      notification_type,
      message
    ) VALUES (
      NEW.id,
      NEW.assigned_to,
      'assignment',
      'You have been assigned to incident: ' || NEW.title
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_incident_assignment_trigger
  AFTER INSERT OR UPDATE OF assigned_to ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_incident_assignment();

-- Function to notify on status changes
CREATE OR REPLACE FUNCTION public.notify_incident_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify reporter
    IF NEW.reported_by IS NOT NULL THEN
      INSERT INTO public.incident_notifications (
        incident_id,
        recipient_id,
        notification_type,
        message
      ) VALUES (
        NEW.id,
        NEW.reported_by,
        'status_change',
        'Incident status changed to: ' || NEW.status
      );
    END IF;
    
    -- Notify assignee
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != NEW.reported_by THEN
      INSERT INTO public.incident_notifications (
        incident_id,
        recipient_id,
        notification_type,
        message
      ) VALUES (
        NEW.id,
        NEW.assigned_to,
        'status_change',
        'Incident status changed to: ' || NEW.status
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_incident_status_change_trigger
  AFTER UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_incident_status_change();

-- View for incident statistics
CREATE OR REPLACE VIEW public.incident_statistics AS
SELECT
  category,
  severity,
  status,
  COUNT(*) as incident_count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - incident_date))/3600) as avg_resolution_hours
FROM public.incident_reports
WHERE incident_date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY category, severity, status;
