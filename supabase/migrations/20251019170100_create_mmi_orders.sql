-- Create mmi_orders table for storing work orders generated from forecasts
-- This table links forecasts to work orders (OS - Ordem de Serviço)

CREATE TABLE IF NOT EXISTS public.mmi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES public.mmi_forecasts(id) ON DELETE SET NULL,
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta', 'critica')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_mmi_orders_forecast ON public.mmi_orders (forecast_id);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_vessel ON public.mmi_orders (vessel_name);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_system ON public.mmi_orders (system_name);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_status ON public.mmi_orders (status);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_priority ON public.mmi_orders (priority);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_created_at ON public.mmi_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_created_by ON public.mmi_orders (created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mmi_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read orders
CREATE POLICY "Allow authenticated users to read mmi_orders"
  ON public.mmi_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert orders
CREATE POLICY "Allow authenticated users to insert mmi_orders"
  ON public.mmi_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update their own orders
CREATE POLICY "Allow authenticated users to update mmi_orders"
  ON public.mmi_orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access to mmi_orders"
  ON public.mmi_orders
  FOR ALL
  TO service_role
  USING (true);

-- Add comments to table and columns
COMMENT ON TABLE public.mmi_orders IS 'Work orders (OS) generated from maintenance forecasts';
COMMENT ON COLUMN public.mmi_orders.forecast_id IS 'Reference to the forecast that generated this order';
COMMENT ON COLUMN public.mmi_orders.description IS 'Detailed description of the work order';
COMMENT ON COLUMN public.mmi_orders.status IS 'Current status of the work order';
COMMENT ON COLUMN public.mmi_orders.priority IS 'Priority level of the work order';
