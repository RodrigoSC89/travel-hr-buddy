-- PATCH 281: Logistics Hub - Supply Chain & Inventory Management
-- Tables: logistics_suppliers, logistics_inventory (enhancement), logistics_shipments

-- Create logistics_suppliers table
CREATE TABLE IF NOT EXISTS public.logistics_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  supplier_type TEXT CHECK (supplier_type IN ('parts', 'food', 'fuel', 'equipment', 'services', 'other')),
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create logistics_shipments table
CREATE TABLE IF NOT EXISTS public.logistics_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.logistics_suppliers(id) ON DELETE SET NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_transit', 'customs', 'arrived', 'delivered', 'cancelled')) DEFAULT 'pending',
  tracking_number TEXT,
  carrier TEXT,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  total_items INTEGER DEFAULT 0,
  total_weight NUMERIC,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create logistics_inventory_movements table for tracking entrada/saída
CREATE TABLE IF NOT EXISTS public.logistics_inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.logistics_inventory(id) ON DELETE CASCADE,
  movement_type TEXT CHECK (movement_type IN ('entrada', 'saida', 'ajuste', 'transferencia')) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_number TEXT,
  shipment_id UUID REFERENCES public.logistics_shipments(id) ON DELETE SET NULL,
  notes TEXT,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create low stock alerts table
CREATE TABLE IF NOT EXISTS public.logistics_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.logistics_inventory(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon')) NOT NULL,
  threshold_value INTEGER,
  current_value INTEGER,
  status TEXT CHECK (status IN ('active', 'acknowledged', 'resolved')) DEFAULT 'active',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_logistics_suppliers_active ON public.logistics_suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_logistics_suppliers_type ON public.logistics_suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_status ON public.logistics_shipments(status);
CREATE INDEX IF NOT EXISTS idx_logistics_shipments_supplier ON public.logistics_shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_logistics_inventory_movements_item ON public.logistics_inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_logistics_inventory_movements_type ON public.logistics_inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_logistics_stock_alerts_item ON public.logistics_stock_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_logistics_stock_alerts_status ON public.logistics_stock_alerts(status);

-- Enable Row Level Security
ALTER TABLE public.logistics_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for logistics_suppliers
CREATE POLICY "Users can view suppliers"
  ON public.logistics_suppliers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage suppliers"
  ON public.logistics_suppliers FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for logistics_shipments
CREATE POLICY "Users can view shipments"
  ON public.logistics_shipments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage shipments"
  ON public.logistics_shipments FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for logistics_inventory_movements
CREATE POLICY "Users can view inventory movements"
  ON public.logistics_inventory_movements FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create inventory movements"
  ON public.logistics_inventory_movements FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for logistics_stock_alerts
CREATE POLICY "Users can view stock alerts"
  ON public.logistics_stock_alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage stock alerts"
  ON public.logistics_stock_alerts FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Function to automatically create low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if quantity is below minimum and create alert if needed
  IF NEW.quantity <= NEW.minimum_quantity AND 
     (OLD.quantity IS NULL OR OLD.quantity > NEW.minimum_quantity) THEN
    INSERT INTO public.logistics_stock_alerts (
      item_id,
      alert_type,
      threshold_value,
      current_value,
      status
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.quantity = 0 THEN 'out_of_stock'
        ELSE 'low_stock'
      END,
      NEW.minimum_quantity,
      NEW.quantity,
      'active'
    );
  END IF;
  
  -- Resolve alert if quantity is restored
  IF NEW.quantity > NEW.minimum_quantity AND 
     (OLD.quantity IS NOT NULL AND OLD.quantity <= NEW.minimum_quantity) THEN
    UPDATE public.logistics_stock_alerts
    SET status = 'resolved', resolved_at = now()
    WHERE item_id = NEW.id AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check low stock alerts
DROP TRIGGER IF EXISTS trigger_check_low_stock ON public.logistics_inventory;
CREATE TRIGGER trigger_check_low_stock
  AFTER INSERT OR UPDATE OF quantity
  ON public.logistics_inventory
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock_alert();

-- Function to log inventory movements
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity THEN
    INSERT INTO public.logistics_inventory_movements (
      item_id,
      movement_type,
      quantity,
      previous_quantity,
      new_quantity,
      notes,
      performed_by
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.quantity > OLD.quantity THEN 'entrada'
        WHEN NEW.quantity < OLD.quantity THEN 'saida'
        ELSE 'ajuste'
      END,
      ABS(NEW.quantity - OLD.quantity),
      OLD.quantity,
      NEW.quantity,
      'Automatic movement log',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log inventory movements
DROP TRIGGER IF EXISTS trigger_log_inventory_movement ON public.logistics_inventory;
CREATE TRIGGER trigger_log_inventory_movement
  AFTER UPDATE OF quantity
  ON public.logistics_inventory
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_movement();

-- Function to update shipment items count
CREATE OR REPLACE FUNCTION update_shipment_items_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.logistics_shipments
    SET total_items = (
      SELECT COUNT(*)
      FROM public.logistics_inventory_movements
      WHERE shipment_id = NEW.shipment_id
    )
    WHERE id = NEW.shipment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update shipment items count
DROP TRIGGER IF EXISTS trigger_update_shipment_items ON public.logistics_inventory_movements;
CREATE TRIGGER trigger_update_shipment_items
  AFTER INSERT OR UPDATE
  ON public.logistics_inventory_movements
  FOR EACH ROW
  WHEN (NEW.shipment_id IS NOT NULL)
  EXECUTE FUNCTION update_shipment_items_count();

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS set_logistics_suppliers_updated_at ON public.logistics_suppliers;
CREATE TRIGGER set_logistics_suppliers_updated_at
  BEFORE UPDATE ON public.logistics_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_logistics_shipments_updated_at ON public.logistics_shipments;
CREATE TRIGGER set_logistics_shipments_updated_at
  BEFORE UPDATE ON public.logistics_shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
