-- PATCH 296: Logistics Hub Complete
-- Supply chain logistics with approval workflow and vessel/mission linking

-- ============================================
-- Supply Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS supply_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  mission_id uuid REFERENCES missions(id) ON DELETE SET NULL,
  requested_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category text NOT NULL CHECK (category IN ('parts', 'food', 'fuel', 'equipment', 'services', 'other')),
  items jsonb DEFAULT '[]'::jsonb, -- Array of {item_name, quantity, unit, description}
  total_estimated_cost numeric DEFAULT 0,
  justification text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supply_requests_vessel ON supply_requests(vessel_id);
CREATE INDEX IF NOT EXISTS idx_supply_requests_mission ON supply_requests(mission_id);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_supply_requests_priority ON supply_requests(priority);

-- Function to generate supply request number
CREATE OR REPLACE FUNCTION generate_supply_request_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  request_num text;
BEGIN
  SELECT COUNT(*) + 1 INTO next_num FROM supply_requests;
  request_num := 'SR-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(next_num::text, 4, '0');
  RETURN request_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate request number
CREATE OR REPLACE FUNCTION set_supply_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := generate_supply_request_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_supply_request_number
  BEFORE INSERT ON supply_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_supply_request_number();

-- ============================================
-- Logistics Alerts Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'shipment_delayed', 'supply_request', 'urgent_need', 'system')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES logistics_shipments(id) ON DELETE CASCADE,
  supply_request_id uuid REFERENCES supply_requests(id) ON DELETE CASCADE,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logistics_alerts_type ON logistics_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_severity ON logistics_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_unresolved ON logistics_alerts(resolved) WHERE resolved = false;

-- Function to create low stock alerts
CREATE OR REPLACE FUNCTION create_low_stock_alerts()
RETURNS void AS $$
BEGIN
  INSERT INTO logistics_alerts (
    alert_type,
    severity,
    title,
    message,
    item_id
  )
  SELECT
    'low_stock',
    CASE 
      WHEN i.current_stock = 0 THEN 'critical'
      WHEN i.current_stock <= i.minimum_stock * 0.5 THEN 'high'
      ELSE 'medium'
    END,
    'Low Stock Alert: ' || i.name,
    format('Item "%s" is running low. Current stock: %s, Minimum: %s', i.name, i.current_stock, i.minimum_stock),
    i.id
  FROM inventory_items i
  WHERE i.current_stock <= i.minimum_stock
    AND NOT EXISTS (
      SELECT 1 FROM logistics_alerts la
      WHERE la.item_id = i.id
        AND la.alert_type = 'low_stock'
        AND la.resolved = false
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Logistics Documents Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL CHECK (document_type IN ('invoice', 'receipt', 'packing_list', 'bill_of_lading', 'customs_declaration', 'certificate', 'other')),
  name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  supply_request_id uuid REFERENCES supply_requests(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES logistics_shipments(id) ON DELETE CASCADE,
  storage_path text,
  uploaded_by uuid REFERENCES auth.users(id),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logistics_documents_type ON logistics_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_supply_request ON logistics_documents(supply_request_id);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_shipment ON logistics_documents(shipment_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_documents ENABLE ROW LEVEL SECURITY;

-- Supply requests policies
CREATE POLICY "Users can view supply requests"
  ON supply_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create supply requests"
  ON supply_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own supply requests"
  ON supply_requests FOR UPDATE
  TO authenticated
  USING (requested_by = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager')
  ))
  WITH CHECK (true);

-- Logistics alerts policies
CREATE POLICY "Users can view logistics alerts"
  ON logistics_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can acknowledge alerts"
  ON logistics_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Logistics documents policies
CREATE POLICY "Users can view logistics documents"
  ON logistics_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload logistics documents"
  ON logistics_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON supply_requests TO authenticated;
GRANT ALL ON logistics_alerts TO authenticated;
GRANT ALL ON logistics_documents TO authenticated;

COMMENT ON TABLE supply_requests IS 'PATCH 296: Supply request management with approval workflow';
COMMENT ON TABLE logistics_alerts IS 'PATCH 296: Auto-generated logistics alerts and notifications';
COMMENT ON TABLE logistics_documents IS 'PATCH 296: Document storage for invoices and receipts';
