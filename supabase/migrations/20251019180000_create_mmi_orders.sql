-- Create mmi_orders table for Work Orders generated from AI forecasts
-- This table stores work orders (Ordem de Serviço) created from maintenance forecasts

CREATE TABLE IF NOT EXISTS public.mmi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES public.mmi_forecasts(id) ON DELETE SET NULL,
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta', 'crítica')),
  technician_comment TEXT,
  pdf_path TEXT,
  ai_diagnosis TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mmi_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to view all orders
CREATE POLICY "Users can view mmi_orders"
  ON public.mmi_orders FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create orders
CREATE POLICY "Users can create mmi_orders"
  ON public.mmi_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update orders
CREATE POLICY "Users can update mmi_orders"
  ON public.mmi_orders FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete orders
CREATE POLICY "Users can delete mmi_orders"
  ON public.mmi_orders FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_mmi_orders_forecast_id ON public.mmi_orders(forecast_id);
CREATE INDEX idx_mmi_orders_vessel_name ON public.mmi_orders(vessel_name);
CREATE INDEX idx_mmi_orders_system_name ON public.mmi_orders(system_name);
CREATE INDEX idx_mmi_orders_status ON public.mmi_orders(status);
CREATE INDEX idx_mmi_orders_priority ON public.mmi_orders(priority);
CREATE INDEX idx_mmi_orders_created_by ON public.mmi_orders(created_by);
CREATE INDEX idx_mmi_orders_created_at ON public.mmi_orders(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_orders_updated_at
  BEFORE UPDATE ON public.mmi_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.mmi_orders IS 'Work orders (OS) generated from AI maintenance forecasts';
