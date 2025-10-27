-- PATCH 296: Logistics Hub v1 - Complete Implementation
-- Objective: Complete supply chain and inventory module implementation

-- ============================================
-- Supply Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS supply_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  mission_id uuid REFERENCES missions(id) ON DELETE SET NULL,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'rejected', 'cancelled')),
  requested_date timestamptz DEFAULT now(),
  required_by_date timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  items jsonb DEFAULT '[]'::jsonb NOT NULL, -- Array of {inventory_item_id, quantity, notes}
  justification text,
  estimated_cost numeric DEFAULT 0 CHECK (estimated_cost >= 0),
  actual_cost numeric DEFAULT 0 CHECK (actual_cost >= 0),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL,
  delivery_location text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Supply requests indexes
CREATE INDEX IF NOT EXISTS idx_supply_requests_vessel ON supply_requests(vessel_id);
CREATE INDEX IF NOT EXISTS idx_supply_requests_mission ON supply_requests(mission_id);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_supply_requests_priority ON supply_requests(priority);
CREATE INDEX IF NOT EXISTS idx_supply_requests_requested_by ON supply_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_supply_requests_required_date ON supply_requests(required_by_date);

-- ============================================
-- Logistics Alerts Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'shipment_delayed', 'delivery_due', 'expiry_warning', 'critical_shortage')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  related_entity_type text CHECK (related_entity_type IN ('inventory_item', 'shipment', 'supply_request', 'purchase_order')),
  related_entity_id uuid,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  auto_generated boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Logistics alerts indexes
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_type ON logistics_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_severity ON logistics_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_vessel ON logistics_alerts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_acknowledged ON logistics_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_entity ON logistics_alerts(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_logistics_alerts_created ON logistics_alerts(created_at DESC);

-- ============================================
-- Logistics Documents Table (for invoices, receipts, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL CHECK (document_type IN ('invoice', 'receipt', 'bill_of_lading', 'packing_list', 'customs_declaration', 'delivery_note', 'certificate', 'other')),
  document_number text,
  title text NOT NULL,
  description text,
  file_path text NOT NULL, -- Path in Supabase Storage
  file_name text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  related_entity_type text CHECK (related_entity_type IN ('shipment', 'purchase_order', 'supply_request', 'inventory_item')),
  related_entity_id uuid,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  upload_date timestamptz DEFAULT now(),
  document_date timestamptz,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Logistics documents indexes
CREATE INDEX IF NOT EXISTS idx_logistics_documents_type ON logistics_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_entity ON logistics_documents(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_vessel ON logistics_documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_supplier ON logistics_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_uploaded_by ON logistics_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_logistics_documents_document_date ON logistics_documents(document_date DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_documents ENABLE ROW LEVEL SECURITY;

-- Supply requests policies
CREATE POLICY "Allow authenticated users to read supply requests"
  ON supply_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert supply requests"
  ON supply_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update supply requests"
  ON supply_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete supply requests"
  ON supply_requests FOR DELETE TO authenticated USING (true);

-- Logistics alerts policies
CREATE POLICY "Allow authenticated users to read logistics alerts"
  ON logistics_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert logistics alerts"
  ON logistics_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update logistics alerts"
  ON logistics_alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete logistics alerts"
  ON logistics_alerts FOR DELETE TO authenticated USING (true);

-- Logistics documents policies
CREATE POLICY "Allow authenticated users to read logistics documents"
  ON logistics_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert logistics documents"
  ON logistics_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update logistics documents"
  ON logistics_documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete logistics documents"
  ON logistics_documents FOR DELETE TO authenticated USING (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_supply_requests_updated_at BEFORE UPDATE ON supply_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Functions
-- ============================================

-- Function to create low stock alerts automatically
CREATE OR REPLACE FUNCTION create_low_stock_alerts()
RETURNS void AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN 
    SELECT id, name, current_stock, minimum_stock, vessel_id
    FROM inventory_items
    WHERE current_stock <= minimum_stock
      AND status IN ('active', 'low_stock')
      AND NOT EXISTS (
        SELECT 1 FROM logistics_alerts
        WHERE related_entity_type = 'inventory_item'
          AND related_entity_id = inventory_items.id
          AND acknowledged = false
          AND created_at > now() - interval '7 days'
      )
  LOOP
    INSERT INTO logistics_alerts (
      alert_type,
      severity,
      title,
      message,
      related_entity_type,
      related_entity_id,
      vessel_id,
      metadata
    ) VALUES (
      CASE 
        WHEN item.current_stock = 0 THEN 'out_of_stock'
        ELSE 'low_stock'
      END,
      CASE 
        WHEN item.current_stock = 0 THEN 'critical'
        WHEN item.current_stock <= item.minimum_stock * 0.5 THEN 'high'
        ELSE 'medium'
      END,
      'Low Stock Alert: ' || item.name,
      'Current stock (' || item.current_stock || ') is below minimum threshold (' || item.minimum_stock || ')',
      'inventory_item',
      item.id,
      item.vessel_id,
      jsonb_build_object(
        'current_stock', item.current_stock,
        'minimum_stock', item.minimum_stock
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate supply request number
CREATE OR REPLACE FUNCTION generate_supply_request_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter int;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM supply_requests 
  WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', now());
  
  new_number := 'SR-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(counter::text, 5, '0');
  
  RETURN new_number;
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

CREATE TRIGGER supply_requests_set_number BEFORE INSERT ON supply_requests
  FOR EACH ROW EXECUTE FUNCTION set_supply_request_number();

-- ============================================
-- Views for Logistics Dashboard
-- ============================================

-- Active shipments view
CREATE OR REPLACE VIEW v_active_shipments AS
SELECT 
  s.*,
  v.name as vessel_name,
  sup.name as supplier_name,
  po.po_number,
  po.total_amount as order_total
FROM shipments s
LEFT JOIN vessels v ON s.vessel_id = v.id
LEFT JOIN suppliers sup ON s.supplier_id = sup.id
LEFT JOIN purchase_orders po ON s.purchase_order_id = po.id
WHERE s.status NOT IN ('delivered', 'cancelled', 'lost')
ORDER BY s.estimated_arrival ASC;

-- Pending supply requests view
CREATE OR REPLACE VIEW v_pending_supply_requests AS
SELECT 
  sr.*,
  v.name as vessel_name,
  u.raw_user_meta_data->>'full_name' as requested_by_name,
  m.mission_name,
  COUNT(DISTINCT jsonb_array_elements(sr.items)) as item_count
FROM supply_requests sr
LEFT JOIN vessels v ON sr.vessel_id = v.id
LEFT JOIN auth.users u ON sr.requested_by = u.id
LEFT JOIN missions m ON sr.mission_id = m.id
WHERE sr.status IN ('pending', 'approved')
GROUP BY sr.id, v.name, u.raw_user_meta_data, m.mission_name
ORDER BY 
  CASE sr.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END,
  sr.required_by_date ASC NULLS LAST;

-- Critical inventory items view
CREATE OR REPLACE VIEW v_critical_inventory AS
SELECT 
  i.*,
  v.name as vessel_name,
  s.name as supplier_name,
  (i.minimum_stock - i.current_stock) as shortage_qty,
  (i.minimum_stock - i.current_stock) * i.unit_cost as shortage_value
FROM inventory_items i
LEFT JOIN vessels v ON i.vessel_id = v.id
LEFT JOIN suppliers s ON i.supplier_id = s.id
WHERE i.current_stock <= i.minimum_stock
  AND i.status IN ('active', 'low_stock', 'out_of_stock')
ORDER BY 
  CASE i.status
    WHEN 'out_of_stock' THEN 1
    WHEN 'low_stock' THEN 2
    ELSE 3
  END,
  (i.current_stock::float / NULLIF(i.minimum_stock, 0)) ASC;

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample supply requests
INSERT INTO supply_requests (
  request_number,
  vessel_id,
  requested_by,
  priority,
  status,
  required_by_date,
  items,
  justification,
  estimated_cost,
  delivery_location
)
SELECT
  'SR-2025-00001',
  v.id,
  (SELECT id FROM auth.users LIMIT 1),
  'high',
  'pending',
  now() + interval '10 days',
  '[{"item_code": "PART001", "quantity": 10, "notes": "Urgent replacement needed"}]'::jsonb,
  'Main engine maintenance scheduled',
  2500.00,
  'Port of Singapore'
FROM vessels v
WHERE v.imo_code = 'IMO9234567'
LIMIT 1
ON CONFLICT (request_number) DO NOTHING;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE supply_requests IS 'Supply requests from vessels and missions';
COMMENT ON TABLE logistics_alerts IS 'Automated and manual alerts for logistics management';
COMMENT ON TABLE logistics_documents IS 'Documents related to logistics operations (invoices, receipts, etc.)';
COMMENT ON VIEW v_active_shipments IS 'View of all active shipments with vessel and supplier details';
COMMENT ON VIEW v_pending_supply_requests IS 'View of pending supply requests with requester details';
COMMENT ON VIEW v_critical_inventory IS 'View of inventory items below minimum stock levels';
