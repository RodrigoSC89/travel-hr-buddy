-- PATCH 256: Logistics Hub - Supply Chain & Inventory Management
-- Objetivo: Completar o módulo de logística, suprimentos e transporte

-- ============================================
-- Inventory Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('spare_parts', 'consumables', 'safety_equipment', 'tools', 'provisions', 'fuel', 'lubricants', 'other')),
  unit_of_measure text NOT NULL,
  current_stock numeric DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock numeric DEFAULT 0 CHECK (minimum_stock >= 0),
  maximum_stock numeric,
  reorder_point numeric DEFAULT 0,
  unit_cost numeric DEFAULT 0 CHECK (unit_cost >= 0),
  total_value numeric GENERATED ALWAYS AS (current_stock * unit_cost) STORED,
  location text,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  supplier_id uuid,
  last_restock_date timestamptz,
  expiry_date timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'low_stock', 'out_of_stock', 'discontinued', 'expired')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Inventory items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_vessel ON inventory_items(vessel_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock ON inventory_items(current_stock) WHERE current_stock <= minimum_stock;

-- ============================================
-- Suppliers Table
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('marine_equipment', 'food_provisions', 'fuel', 'maintenance', 'safety', 'general', 'other')),
  contact_person text,
  email text,
  phone text,
  address text,
  country text,
  payment_terms text,
  delivery_time_days integer,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted', 'preferred')),
  notes text,
  certifications jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating DESC);

-- Add foreign key for inventory_items to suppliers
ALTER TABLE inventory_items 
  ADD CONSTRAINT fk_inventory_items_supplier 
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- ============================================
-- Purchase Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  order_date timestamptz DEFAULT now(),
  expected_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'ordered', 'partially_received', 'received', 'cancelled', 'rejected')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  items jsonb DEFAULT '[]'::jsonb NOT NULL, -- Array of {item_id, quantity, unit_price, total}
  subtotal numeric DEFAULT 0 CHECK (subtotal >= 0),
  tax_amount numeric DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_cost numeric DEFAULT 0 CHECK (shipping_cost >= 0),
  total_amount numeric GENERATED ALWAYS AS (subtotal + tax_amount + shipping_cost) STORED,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_date timestamptz,
  delivery_address text,
  notes text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vessel ON purchase_orders(vessel_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);

-- ============================================
-- Shipments Table
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number text UNIQUE NOT NULL,
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  carrier text,
  tracking_number text,
  shipping_method text CHECK (shipping_method IN ('air', 'sea', 'road', 'rail', 'courier', 'other')),
  origin_port text,
  destination_port text,
  shipped_date timestamptz,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  status text DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'arrived_port', 'customs_clearance', 'out_for_delivery', 'delivered', 'delayed', 'cancelled', 'lost')),
  current_location text,
  last_location_update timestamptz,
  items jsonb DEFAULT '[]'::jsonb, -- Array of items being shipped
  total_weight_kg numeric,
  total_volume_m3 numeric,
  temperature_controlled boolean DEFAULT false,
  special_handling_requirements text,
  shipping_cost numeric DEFAULT 0,
  insurance_cost numeric DEFAULT 0,
  customs_value numeric,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_po ON shipments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_supplier ON shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_vessel ON shipments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_estimated_arrival ON shipments(estimated_arrival);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Inventory items policies
CREATE POLICY "Allow authenticated users to read inventory items"
  ON inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert inventory items"
  ON inventory_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update inventory items"
  ON inventory_items FOR UPDATE TO authenticated USING (true);

-- Suppliers policies
CREATE POLICY "Allow authenticated users to read suppliers"
  ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert suppliers"
  ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update suppliers"
  ON suppliers FOR UPDATE TO authenticated USING (true);

-- Purchase orders policies
CREATE POLICY "Allow authenticated users to read purchase orders"
  ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert purchase orders"
  ON purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update purchase orders"
  ON purchase_orders FOR UPDATE TO authenticated USING (true);

-- Shipments policies
CREATE POLICY "Allow authenticated users to read shipments"
  ON shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert shipments"
  ON shipments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update shipments"
  ON shipments FOR UPDATE TO authenticated USING (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Inventory Status Update Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.minimum_stock THEN
    NEW.status = 'low_stock';
  ELSIF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < now() THEN
    NEW.status = 'expired';
  ELSE
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_status_update BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_status();

-- ============================================
-- Functions for Inventory Management
-- ============================================

-- Function to get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items()
RETURNS TABLE (
  id uuid,
  item_code text,
  name text,
  current_stock numeric,
  minimum_stock numeric,
  vessel_name text,
  supplier_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.item_code,
    i.name,
    i.current_stock,
    i.minimum_stock,
    v.name as vessel_name,
    s.name as supplier_name
  FROM inventory_items i
  LEFT JOIN vessels v ON i.vessel_id = v.id
  LEFT JOIN suppliers s ON i.supplier_id = s.id
  WHERE i.current_stock <= i.minimum_stock
    AND i.status IN ('active', 'low_stock')
  ORDER BY (i.current_stock / NULLIF(i.minimum_stock, 0)) ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to track shipment status
CREATE OR REPLACE FUNCTION update_shipment_location(
  p_shipment_id uuid,
  p_location text,
  p_status text
)
RETURNS void AS $$
BEGIN
  UPDATE shipments
  SET 
    current_location = p_location,
    status = p_status,
    last_location_update = now()
  WHERE id = p_shipment_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample suppliers
INSERT INTO suppliers (supplier_code, name, category, contact_person, email, phone, country, payment_terms, delivery_time_days, rating, status)
VALUES
  ('SUP001', 'Marine Parts International', 'marine_equipment', 'John Smith', 'john@marinepartsintl.com', '+1-555-0001', 'USA', 'Net 30', 14, 4.5, 'preferred'),
  ('SUP002', 'Global Ship Provisions', 'food_provisions', 'Maria Garcia', 'maria@globalshipprov.com', '+34-555-0002', 'Spain', 'Net 45', 7, 4.2, 'active'),
  ('SUP003', 'Fuel & Lubricants Ltd', 'fuel', 'Ahmed Hassan', 'ahmed@fuellube.com', '+971-555-0003', 'UAE', 'Prepaid', 3, 4.8, 'preferred'),
  ('SUP004', 'Safety Equipment Co', 'safety', 'Lisa Wong', 'lisa@safetyequip.com', '+65-555-0004', 'Singapore', 'Net 30', 10, 4.3, 'active')
ON CONFLICT (supplier_code) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_items (item_code, name, description, category, unit_of_measure, current_stock, minimum_stock, maximum_stock, reorder_point, unit_cost, location, supplier_id)
SELECT 
  'PART001', 'Main Engine Fuel Filter', 'High-performance fuel filter for main engine', 'spare_parts', 'piece', 5, 10, 50, 15, 250.00, 'Engine Room - Shelf A', s.id
FROM suppliers s WHERE s.supplier_code = 'SUP001'
UNION ALL
SELECT 
  'CONS001', 'Engine Oil 15W-40', 'Marine grade engine lubricant', 'lubricants', 'liter', 150, 200, 1000, 300, 12.50, 'Engine Room - Tank 1', s.id
FROM suppliers s WHERE s.supplier_code = 'SUP003'
UNION ALL
SELECT 
  'SAFE001', 'Life Jacket Type I', 'SOLAS approved life jacket', 'safety_equipment', 'piece', 35, 50, 100, 60, 45.00, 'Safety Locker', s.id
FROM suppliers s WHERE s.supplier_code = 'SUP004'
UNION ALL
SELECT 
  'PROV001', 'Frozen Meat', 'Premium quality frozen meat', 'provisions', 'kg', 200, 300, 800, 400, 8.50, 'Freezer 1', s.id
FROM suppliers s WHERE s.supplier_code = 'SUP002'
ON CONFLICT (item_code) DO NOTHING;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE inventory_items IS 'Inventory management for vessel supplies and equipment';
COMMENT ON TABLE suppliers IS 'Supplier registry for procurement management';
COMMENT ON TABLE purchase_orders IS 'Purchase order tracking and management';
COMMENT ON TABLE shipments IS 'Shipment tracking with real-time status updates';
