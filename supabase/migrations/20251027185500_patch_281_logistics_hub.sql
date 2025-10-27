-- PATCH 281: Logistics Hub - Supply Chain + Inventory Management
-- Comprehensive logistics management with suppliers, shipments, and inventory tracking

-- ============================================
-- Logistics Suppliers Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('parts', 'food', 'fuel', 'equipment', 'services', 'other')),
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  country text,
  postal_code text,
  payment_terms text,
  lead_time_days integer,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_logistics_suppliers_status ON logistics_suppliers(status);
CREATE INDEX IF NOT EXISTS idx_logistics_suppliers_category ON logistics_suppliers(category);
CREATE INDEX IF NOT EXISTS idx_logistics_suppliers_rating ON logistics_suppliers(rating DESC);

-- ============================================
-- Logistics Shipments Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES logistics_suppliers(id) ON DELETE SET NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'delayed', 'cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  estimated_departure timestamptz,
  actual_departure timestamptz,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  tracking_number text,
  carrier text,
  shipping_method text,
  items jsonb DEFAULT '[]'::jsonb, -- Array of {item_id, quantity, description}
  total_weight numeric,
  total_volume numeric,
  shipping_cost numeric DEFAULT 0,
  customs_status text,
  customs_clearance_date timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_logistics_shipments_status ON logistics_shipments(status);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_supplier ON logistics_shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_vessel ON logistics_shipments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_arrival ON logistics_shipments(estimated_arrival);

-- ============================================
-- Logistics Inventory Movements Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'transfer', 'adjustment', 'return', 'consumption')),
  quantity numeric NOT NULL,
  unit_cost numeric DEFAULT 0,
  total_value numeric GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  from_location text,
  to_location text,
  shipment_id uuid REFERENCES logistics_shipments(id) ON DELETE SET NULL,
  reference_number text,
  movement_date timestamptz DEFAULT now(),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_logistics_inventory_movements_item ON logistics_inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_logistics_inventory_movements_type ON logistics_inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_logistics_inventory_movements_date ON logistics_inventory_movements(movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_logistics_inventory_movements_shipment ON logistics_inventory_movements(shipment_id);

-- ============================================
-- Logistics Stock Alerts Table
-- ============================================
CREATE TABLE IF NOT EXISTS logistics_stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  current_quantity numeric,
  threshold_quantity numeric,
  message text NOT NULL,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logistics_stock_alerts_item ON logistics_stock_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_logistics_stock_alerts_type ON logistics_stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_logistics_stock_alerts_severity ON logistics_stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_logistics_stock_alerts_unresolved ON logistics_stock_alerts(resolved) WHERE resolved = false;

-- ============================================
-- Trigger: Automatic Stock Alerts
-- ============================================
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for low stock
  IF NEW.current_stock <= NEW.minimum_stock AND NEW.current_stock > 0 THEN
    INSERT INTO logistics_stock_alerts (item_id, alert_type, severity, current_quantity, threshold_quantity, message)
    VALUES (
      NEW.id,
      'low_stock',
      CASE 
        WHEN NEW.current_stock <= NEW.minimum_stock * 0.5 THEN 'high'
        ELSE 'medium'
      END,
      NEW.current_stock,
      NEW.minimum_stock,
      format('Item "%s" is running low. Current stock: %s, Minimum: %s', NEW.name, NEW.current_stock, NEW.minimum_stock)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check for out of stock
  IF NEW.current_stock = 0 THEN
    INSERT INTO logistics_stock_alerts (item_id, alert_type, severity, current_quantity, threshold_quantity, message)
    VALUES (
      NEW.id,
      'out_of_stock',
      'critical',
      0,
      NEW.minimum_stock,
      format('Item "%s" is out of stock!', NEW.name)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Update item status based on stock level
  IF NEW.current_stock = 0 THEN
    NEW.status := 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.minimum_stock THEN
    NEW.status := 'low_stock';
  ELSE
    NEW.status := 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_stock_levels
  BEFORE UPDATE OF current_stock ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_levels();

-- ============================================
-- Trigger: Log Inventory Movement
-- ============================================
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- When inventory is updated, log the movement
  IF OLD.current_stock IS DISTINCT FROM NEW.current_stock THEN
    INSERT INTO logistics_inventory_movements (
      item_id,
      movement_type,
      quantity,
      unit_cost,
      from_location,
      to_location,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      'adjustment',
      NEW.current_stock - OLD.current_stock,
      NEW.unit_cost,
      NEW.location,
      NEW.location,
      'Automatic adjustment',
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_inventory_movement
  AFTER UPDATE OF current_stock ON inventory_items
  FOR EACH ROW
  WHEN (OLD.current_stock IS DISTINCT FROM NEW.current_stock)
  EXECUTE FUNCTION log_inventory_movement();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE logistics_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY "Users can view suppliers"
  ON logistics_suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage suppliers"
  ON logistics_suppliers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Shipments policies
CREATE POLICY "Users can view shipments"
  ON logistics_shipments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage shipments"
  ON logistics_shipments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inventory movements policies
CREATE POLICY "Users can view inventory movements"
  ON logistics_inventory_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create inventory movements"
  ON logistics_inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Stock alerts policies
CREATE POLICY "Users can view stock alerts"
  ON logistics_stock_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can acknowledge alerts"
  ON logistics_stock_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON logistics_suppliers TO authenticated;
GRANT ALL ON logistics_shipments TO authenticated;
GRANT ALL ON logistics_inventory_movements TO authenticated;
GRANT ALL ON logistics_stock_alerts TO authenticated;

COMMENT ON TABLE logistics_suppliers IS 'PATCH 281: Supplier management for logistics operations';
COMMENT ON TABLE logistics_shipments IS 'PATCH 281: Shipment tracking for deliveries';
COMMENT ON TABLE logistics_inventory_movements IS 'PATCH 281: Log of all inventory movements';
COMMENT ON TABLE logistics_stock_alerts IS 'PATCH 281: Automatic alerts for stock levels';
