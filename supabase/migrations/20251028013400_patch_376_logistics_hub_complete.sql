-- ============================================
-- PATCH 376: Logistics Hub - Inventory & Routes Complete
-- Objective: Complete logistics module with suppliers, routes, and shipments
-- ============================================

-- ============================================
-- 1. Suppliers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  rating NUMERIC CHECK (rating BETWEEN 0 AND 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  payment_terms TEXT,
  delivery_time_days INTEGER,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON public.suppliers(rating DESC);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suppliers"
  ON public.suppliers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage suppliers"
  ON public.suppliers FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 2. Shipments Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  origin TEXT NOT NULL,
  origin_coordinates JSONB,
  destination TEXT NOT NULL,
  destination_coordinates JSONB,
  carrier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'in_transit', 'customs', 'delivered', 'delayed', 'cancelled')),
  scheduled_departure TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  route_geometry JSONB, -- GeoJSON for map visualization
  current_location JSONB, -- Current GPS coordinates
  total_weight NUMERIC,
  total_volume NUMERIC,
  cost DECIMAL(12,2),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_supplier ON public.shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_arrival ON public.shipments(estimated_arrival);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view shipments"
  ON public.shipments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage shipments"
  ON public.shipments FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 3. Shipment Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.shipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  weight NUMERIC,
  volume NUMERIC,
  handling_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON public.shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_inventory ON public.shipment_items(inventory_item_id);

ALTER TABLE public.shipment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view shipment items"
  ON public.shipment_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage shipment items"
  ON public.shipment_items FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. Route Waypoints Table (for detailed route planning)
-- ============================================
CREATE TABLE IF NOT EXISTS public.route_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  location_name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  waypoint_type TEXT DEFAULT 'waypoint' CHECK (waypoint_type IN ('origin', 'waypoint', 'destination', 'rest_stop', 'customs')),
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_route_waypoints_route ON public.route_waypoints(route_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_shipment ON public.route_waypoints(shipment_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_sequence ON public.route_waypoints(sequence_order);

ALTER TABLE public.route_waypoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view waypoints"
  ON public.route_waypoints FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage waypoints"
  ON public.route_waypoints FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. Inventory Alerts Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstocked', 'expiring', 'reorder_needed')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  threshold_value INTEGER,
  current_value INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item ON public.inventory_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON public.inventory_alerts(is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_severity ON public.inventory_alerts(severity);

ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts"
  ON public.inventory_alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage alerts"
  ON public.inventory_alerts FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 6. Functions
-- ============================================

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all new tables
CREATE TRIGGER set_suppliers_updated_at 
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_shipments_updated_at 
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check inventory and create alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS void AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN 
    SELECT * FROM public.inventory_items WHERE status = 'active'
  LOOP
    -- Check for low stock
    IF v_item.current_stock <= v_item.min_stock AND v_item.current_stock > 0 THEN
      INSERT INTO public.inventory_alerts (
        inventory_item_id, alert_type, severity, message, 
        threshold_value, current_value
      ) VALUES (
        v_item.id, 'low_stock', 'high',
        format('Low stock alert: %s has only %s %s remaining', v_item.name, v_item.current_stock, v_item.unit),
        v_item.min_stock, v_item.current_stock
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Check for out of stock
    IF v_item.current_stock = 0 THEN
      INSERT INTO public.inventory_alerts (
        inventory_item_id, alert_type, severity, message,
        threshold_value, current_value
      ) VALUES (
        v_item.id, 'out_of_stock', 'critical',
        format('Out of stock: %s needs immediate reorder', v_item.name),
        v_item.min_stock, 0
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Sample Data
-- ============================================

-- Insert sample suppliers
INSERT INTO public.suppliers (name, code, contact_person, email, phone, country, rating, payment_terms, delivery_time_days) VALUES
  ('Global Maritime Supplies', 'GMS-001', 'John Smith', 'john@globalmaritime.com', '+1-555-0100', 'USA', 4.5, 'Net 30', 7),
  ('Ocean Equipment Co', 'OEC-002', 'Maria Garcia', 'maria@oceanequip.com', '+44-555-0200', 'UK', 4.8, 'Net 45', 14),
  ('Marine Parts International', 'MPI-003', 'Liu Wei', 'liu@marineparts.cn', '+86-555-0300', 'China', 4.2, 'Net 60', 21)
ON CONFLICT (code) DO NOTHING;

-- Update existing inventory items with supplier references
UPDATE public.inventory_items
SET supplier = (SELECT name FROM public.suppliers WHERE code = 'GMS-001' LIMIT 1)
WHERE supplier IS NULL
  AND category IN ('Safety Equipment', 'Fuel')
LIMIT 5;

COMMENT ON TABLE public.suppliers IS 'PATCH 376: Suppliers management for logistics';
COMMENT ON TABLE public.shipments IS 'PATCH 376: Shipment tracking with route visualization';
COMMENT ON TABLE public.route_waypoints IS 'PATCH 376: Detailed route planning with waypoints';
COMMENT ON TABLE public.inventory_alerts IS 'PATCH 376: Automatic inventory alerts system';
