-- Create mmi_orders table for Work Order (OS - Ordem de Serviço) Management
-- This table stores comprehensive work order information for the MMI system

CREATE TABLE IF NOT EXISTS public.mmi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em andamento', 'concluída', 'cancelada')),
  priority TEXT DEFAULT 'média' CHECK (priority IN ('baixa', 'média', 'alta', 'crítica')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.mmi_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all orders
CREATE POLICY "Users can view all mmi_orders"
  ON public.mmi_orders
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create orders
CREATE POLICY "Authenticated users can create mmi_orders"
  ON public.mmi_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update orders
CREATE POLICY "Authenticated users can update mmi_orders"
  ON public.mmi_orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete orders
CREATE POLICY "Authenticated users can delete mmi_orders"
  ON public.mmi_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mmi_orders_vessel_name ON public.mmi_orders(vessel_name);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_status ON public.mmi_orders(status);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_priority ON public.mmi_orders(priority);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_created_at ON public.mmi_orders(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_mmi_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mmi_orders_updated_at
  BEFORE UPDATE ON public.mmi_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_orders_updated_at();

-- Insert some sample data for testing
INSERT INTO public.mmi_orders (vessel_name, system_name, status, priority, description) VALUES
  ('Navio Alpha', 'Sistema Hidráulico', 'pendente', 'alta', 'Verificação de vazamento no sistema hidráulico principal. Necessário inspeção completa dos selos e válvulas.'),
  ('Navio Beta', 'Motor Diesel', 'em andamento', 'crítica', 'Manutenção preventiva do motor principal. Troca de filtros, verificação de injetores e análise de óleo.'),
  ('Navio Gamma', 'Sistema Elétrico', 'pendente', 'média', 'Substituição de painéis elétricos obsoletos. Inclui atualização do sistema de controle.'),
  ('Navio Alpha', 'Bomba de Água', 'concluída', 'baixa', 'Revisão geral da bomba de água doce. Todos os componentes verificados e aprovados.');
