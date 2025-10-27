-- PATCH 286-290: Additional tables for Document Templates, Channel Manager, and Employee Portal

-- Enhance document templates table with PDF export support
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_document_templates' AND column_name='template_type') THEN
    ALTER TABLE public.ai_document_templates ADD COLUMN template_type TEXT DEFAULT 'document' CHECK (template_type IN ('contract', 'report', 'letter', 'certificate', 'document'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_document_templates' AND column_name='variables') THEN
    ALTER TABLE public.ai_document_templates ADD COLUMN variables JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_document_templates' AND column_name='pdf_settings') THEN
    ALTER TABLE public.ai_document_templates ADD COLUMN pdf_settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- PATCH 288: Channel Manager - Status Logs
CREATE TABLE IF NOT EXISTS public.channel_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'connecting', 'error', 'maintenance')),
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add channel permissions table
CREATE TABLE IF NOT EXISTS public.channel_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'member' CHECK (permission_level IN ('admin', 'moderator', 'member', 'read_only')),
  can_send BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_manage_members BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- PATCH 290: Employee Portal - Self-Service Requests
CREATE TABLE IF NOT EXISTS public.employee_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'travel', 'certificate', 'document', 'training', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  approver_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee notifications table
CREATE TABLE IF NOT EXISTS public.employee_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'reminder')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'request', 'training', 'compliance', 'document')),
  is_read BOOLEAN DEFAULT false,
  link_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.channel_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channel_status_logs
CREATE POLICY "Users can view channel status logs for their channels"
  ON public.channel_status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = channel_status_logs.channel_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can create status logs"
  ON public.channel_status_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = channel_status_logs.channel_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for channel_permissions
CREATE POLICY "Users can view permissions for their channels"
  ON public.channel_permissions FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = channel_permissions.channel_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Channel admins can manage permissions"
  ON public.channel_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = channel_permissions.channel_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for employee_requests
CREATE POLICY "Employees can view their own requests"
  ON public.employee_requests FOR SELECT
  USING (employee_id = auth.uid() OR approver_id = auth.uid());

CREATE POLICY "Employees can create their own requests"
  ON public.employee_requests FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their own pending requests"
  ON public.employee_requests FOR UPDATE
  USING (employee_id = auth.uid() AND status = 'pending');

CREATE POLICY "Approvers can update requests"
  ON public.employee_requests FOR UPDATE
  USING (approver_id = auth.uid());

-- RLS Policies for employee_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.employee_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
  ON public.employee_notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.employee_notifications FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_channel_status_logs_channel_id ON public.channel_status_logs(channel_id, created_at DESC);
CREATE INDEX idx_channel_permissions_channel_id ON public.channel_permissions(channel_id);
CREATE INDEX idx_channel_permissions_user_id ON public.channel_permissions(user_id);
CREATE INDEX idx_employee_requests_employee_id ON public.employee_requests(employee_id, status);
CREATE INDEX idx_employee_requests_approver_id ON public.employee_requests(approver_id, status);
CREATE INDEX idx_employee_requests_status ON public.employee_requests(status, created_at DESC);
CREATE INDEX idx_employee_notifications_user_id ON public.employee_notifications(user_id, is_read, created_at DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_employee_requests_updated_at 
  BEFORE UPDATE ON public.employee_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification when request status changes
CREATE OR REPLACE FUNCTION notify_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.employee_notifications (user_id, title, message, type, category, metadata)
    VALUES (
      NEW.employee_id,
      'Request Status Update',
      'Your ' || NEW.request_type || ' request has been ' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
        ELSE 'info'
      END,
      'request',
      jsonb_build_object('request_id', NEW.id, 'request_type', NEW.request_type, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_request_status_change
  AFTER UPDATE ON public.employee_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_request_status_change();
