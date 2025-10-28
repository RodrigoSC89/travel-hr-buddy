-- ============================================
-- PATCHES 351-355: Complete Implementation
-- Document Templates, Logistics, Employee Portal, OCR/NLP, Project Timeline
-- ============================================

-- ============================================
-- PATCH 351: Document Templates Enhancements
-- ============================================

-- Template Versions Table
CREATE TABLE IF NOT EXISTS public.template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(template_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_template_versions_template ON public.template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_created ON public.template_versions(created_at DESC);

ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template versions"
  ON public.template_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_templates dt
      WHERE dt.id = template_versions.template_id
      AND (dt.user_id = auth.uid() OR dt.is_public = true)
    )
  );

-- Template Usage Log Table
CREATE TABLE IF NOT EXISTS public.template_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  version_number INTEGER,
  output_format TEXT CHECK (output_format IN ('pdf', 'docx', 'html')),
  variables_used JSONB DEFAULT '{}'::jsonb,
  generation_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_template_usage_log_template ON public.template_usage_log(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_log_user ON public.template_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_log_created ON public.template_usage_log(created_at DESC);

ALTER TABLE public.template_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their usage logs"
  ON public.template_usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create usage logs"
  ON public.template_usage_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PATCH 352: Logistics Hub Tables
-- ============================================

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock INTEGER DEFAULT 0 NOT NULL,
  min_stock INTEGER DEFAULT 0 NOT NULL,
  max_stock INTEGER,
  unit_cost DECIMAL(10,2),
  location TEXT,
  supplier TEXT,
  last_restock_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON public.inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON public.inventory_items(current_stock);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage inventory"
  ON public.inventory_items FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'in_transit', 'delivered', 'cancelled')),
  order_date DATE DEFAULT CURRENT_DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  total_amount DECIMAL(12,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON public.purchase_orders(order_date DESC);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view orders"
  ON public.purchase_orders FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create orders"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their orders"
  ON public.purchase_orders FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = approved_by);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order ON public.purchase_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_inventory ON public.purchase_order_items(inventory_item_id);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items"
  ON public.purchase_order_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Shipment Tracking Table
CREATE TABLE IF NOT EXISTS public.shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
  origin TEXT,
  destination TEXT,
  estimated_delivery DATE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  current_location TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipment_tracking_status ON public.shipment_tracking(status);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_order ON public.shipment_tracking(order_id);

ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view shipments"
  ON public.shipment_tracking FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Logistics Alerts Table
CREATE TABLE IF NOT EXISTS public.logistics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'delivery_delay', 'order_pending', 'quality_issue')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logistics_alerts_type ON public.logistics_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_severity ON public.logistics_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_resolved ON public.logistics_alerts(is_resolved);

ALTER TABLE public.logistics_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts"
  ON public.logistics_alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- PATCH 353: Employee Portal Tables
-- ============================================

-- Employee Benefits Table
CREATE TABLE IF NOT EXISTS public.employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  benefit_type TEXT NOT NULL CHECK (benefit_type IN ('health_insurance', 'dental', 'vision', 'life_insurance', 'retirement', 'vacation', 'sick_leave', 'other')),
  benefit_name TEXT NOT NULL,
  provider TEXT,
  coverage_amount DECIMAL(10,2),
  premium_amount DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'cancelled')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employee_benefits_employee ON public.employee_benefits(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_type ON public.employee_benefits(benefit_type);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_status ON public.employee_benefits(status);

ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their benefits"
  ON public.employee_benefits FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "HR can manage all benefits"
  ON public.employee_benefits FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Payroll Records Table
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  gross_salary DECIMAL(12,2) NOT NULL,
  deductions DECIMAL(12,2) DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
  payslip_url TEXT,
  breakdown JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payroll_records_employee ON public.payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_date ON public.payroll_records(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_records_status ON public.payroll_records(status);

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their payroll"
  ON public.payroll_records FOR SELECT
  USING (auth.uid() = employee_id);

-- Employee Feedback Table
CREATE TABLE IF NOT EXISTS public.employee_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('performance_review', 'peer_review', 'manager_feedback', 'self_assessment', 'suggestion', 'complaint')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_period_start DATE,
  review_period_end DATE,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'acknowledged', 'archived')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'manager', 'hr', 'public')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employee_feedback_employee ON public.employee_feedback(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_feedback_type ON public.employee_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_employee_feedback_status ON public.employee_feedback(status);

ALTER TABLE public.employee_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their feedback"
  ON public.employee_feedback FOR SELECT
  USING (auth.uid() = employee_id OR auth.uid() = reviewer_id);

CREATE POLICY "Employees can create feedback"
  ON public.employee_feedback FOR INSERT
  WITH CHECK (auth.uid() = employee_id OR auth.uid() = reviewer_id);

-- Employee Personal Documents Table
CREATE TABLE IF NOT EXISTS public.employee_personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'passport', 'drivers_license', 'birth_certificate', 'social_security', 'work_permit', 'contract', 'certificate', 'diploma', 'other')),
  document_name TEXT NOT NULL,
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired', 'pending_verification', 'rejected')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employee_personal_docs_employee ON public.employee_personal_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_personal_docs_type ON public.employee_personal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_employee_personal_docs_status ON public.employee_personal_documents(status);
CREATE INDEX IF NOT EXISTS idx_employee_personal_docs_expiry ON public.employee_personal_documents(expiry_date);

ALTER TABLE public.employee_personal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their documents"
  ON public.employee_personal_documents FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can upload documents"
  ON public.employee_personal_documents FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can update their documents"
  ON public.employee_personal_documents FOR UPDATE
  USING (auth.uid() = employee_id);

-- ============================================
-- PATCH 355: Project Timeline Enhancements
-- ============================================

-- Project Tasks Table (if not exists)
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  team TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON public.project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON public.project_tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_dates ON public.project_tasks(start_date, end_date);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks"
  ON public.project_tasks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tasks"
  ON public.project_tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tasks"
  ON public.project_tasks FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Task Dependencies Table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE NOT NULL,
  dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(task_id, depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends ON public.task_dependencies(depends_on_task_id);

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dependencies"
  ON public.task_dependencies FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage dependencies"
  ON public.task_dependencies FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Task Collaboration Table
CREATE TABLE IF NOT EXISTS public.task_collaboration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('comment', 'status_change', 'assignment', 'update', 'file_upload')),
  content TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_collaboration_task ON public.task_collaboration(task_id);
CREATE INDEX IF NOT EXISTS idx_task_collaboration_user ON public.task_collaboration(user_id);
CREATE INDEX IF NOT EXISTS idx_task_collaboration_created ON public.task_collaboration(created_at DESC);

ALTER TABLE public.task_collaboration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task collaboration"
  ON public.task_collaboration FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can add collaboration entries"
  ON public.task_collaboration FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM (VALUES
      ('inventory_items'),
      ('purchase_orders'),
      ('shipment_tracking'),
      ('employee_benefits'),
      ('payroll_records'),
      ('employee_feedback'),
      ('employee_personal_documents'),
      ('project_tasks')
    ) AS tables(table_name)
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trigger_update_%I_updated_at ON public.%I;
      CREATE TRIGGER trigger_update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- Function to check low stock and create alerts
CREATE OR REPLACE FUNCTION check_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if stock is below minimum
  IF NEW.current_stock <= NEW.min_stock AND NEW.current_stock > 0 THEN
    INSERT INTO logistics_alerts (
      alert_type,
      severity,
      item_id,
      message
    ) VALUES (
      'low_stock',
      CASE
        WHEN NEW.current_stock <= NEW.min_stock * 0.5 THEN 'high'
        ELSE 'medium'
      END,
      NEW.id,
      format('Item "%s" is running low (current: %s, minimum: %s)', NEW.name, NEW.current_stock, NEW.min_stock)
    );
  END IF;
  
  -- Check if out of stock
  IF NEW.current_stock = 0 THEN
    INSERT INTO logistics_alerts (
      alert_type,
      severity,
      item_id,
      message
    ) VALUES (
      'out_of_stock',
      'critical',
      NEW.id,
      format('Item "%s" is out of stock', NEW.name)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_inventory_stock
  AFTER UPDATE ON public.inventory_items
  FOR EACH ROW
  WHEN (OLD.current_stock IS DISTINCT FROM NEW.current_stock)
  EXECUTE FUNCTION check_inventory_stock();

-- Function to check delivery delays
CREATE OR REPLACE FUNCTION check_delivery_delays()
RETURNS void AS $$
BEGIN
  INSERT INTO logistics_alerts (
    alert_type,
    severity,
    order_id,
    message
  )
  SELECT
    'delivery_delay',
    'high',
    id,
    format('Order %s is delayed (expected: %s)', order_number, expected_delivery_date)
  FROM purchase_orders
  WHERE status IN ('ordered', 'in_transit')
    AND expected_delivery_date < CURRENT_DATE
    AND id NOT IN (
      SELECT order_id FROM logistics_alerts
      WHERE alert_type = 'delivery_delay'
        AND is_resolved = false
        AND order_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check expiring documents
CREATE OR REPLACE FUNCTION check_expiring_documents()
RETURNS void AS $$
BEGIN
  UPDATE employee_personal_documents
  SET status = 'expiring_soon'
  WHERE expiry_date IS NOT NULL
    AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiry_date > CURRENT_DATE
    AND status = 'valid';
    
  UPDATE employee_personal_documents
  SET status = 'expired'
  WHERE expiry_date IS NOT NULL
    AND expiry_date < CURRENT_DATE
    AND status IN ('valid', 'expiring_soon');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data (for testing)
-- ============================================

-- Insert sample inventory items
INSERT INTO public.inventory_items (item_code, name, category, unit, current_stock, min_stock, max_stock, unit_cost, location)
VALUES
  ('SAFE-001', 'Safety Helmet', 'safety', 'unit', 50, 20, 100, 45.00, 'Warehouse A'),
  ('SAFE-002', 'Safety Vest', 'safety', 'unit', 15, 25, 150, 32.00, 'Warehouse A'),
  ('TOOL-001', 'Wrench Set', 'tools', 'set', 30, 10, 50, 120.00, 'Warehouse B'),
  ('ELEC-001', 'Cable 10m', 'electrical', 'unit', 100, 50, 200, 25.00, 'Warehouse C')
ON CONFLICT (item_code) DO NOTHING;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Additional indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_tags ON public.document_templates USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON public.inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_project_tasks_team ON public.project_tasks(team);
CREATE INDEX IF NOT EXISTS idx_project_tasks_tags ON public.project_tasks USING gin(tags);

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE public.template_versions IS 'Stores version history for document templates';
COMMENT ON TABLE public.template_usage_log IS 'Logs template usage for analytics';
COMMENT ON TABLE public.inventory_items IS 'PATCH 352: Inventory management for logistics hub';
COMMENT ON TABLE public.purchase_orders IS 'PATCH 352: Purchase order tracking';
COMMENT ON TABLE public.shipment_tracking IS 'PATCH 352: Shipment and delivery tracking';
COMMENT ON TABLE public.logistics_alerts IS 'PATCH 352: Automated alerts for logistics operations';
COMMENT ON TABLE public.employee_benefits IS 'PATCH 353: Employee benefits management';
COMMENT ON TABLE public.payroll_records IS 'PATCH 353: Employee payroll and payslip records';
COMMENT ON TABLE public.employee_feedback IS 'PATCH 353: Performance reviews and feedback';
COMMENT ON TABLE public.employee_personal_documents IS 'PATCH 353: Personal document management';
COMMENT ON TABLE public.project_tasks IS 'PATCH 355: Project tasks for timeline/Gantt view';
COMMENT ON TABLE public.task_dependencies IS 'PATCH 355: Task dependencies for Gantt chart';
COMMENT ON TABLE public.task_collaboration IS 'PATCH 355: Real-time collaboration on tasks';
