-- Create mmi_orders table for service orders management
CREATE TABLE IF NOT EXISTS public.mmi_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    vessel_name TEXT NOT NULL,
    system_name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    technician_comment TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    pdf_path TEXT,
    ai_diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.mmi_orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read orders
CREATE POLICY "Users can view mmi_orders"
    ON public.mmi_orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create orders
CREATE POLICY "Users can create mmi_orders"
    ON public.mmi_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update orders
CREATE POLICY "Users can update mmi_orders"
    ON public.mmi_orders
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete orders
CREATE POLICY "Users can delete mmi_orders"
    ON public.mmi_orders
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_orders_updated_at
    BEFORE UPDATE ON public.mmi_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_mmi_orders_order_number ON public.mmi_orders(order_number);
CREATE INDEX idx_mmi_orders_status ON public.mmi_orders(status);
CREATE INDEX idx_mmi_orders_priority ON public.mmi_orders(priority);
CREATE INDEX idx_mmi_orders_vessel_name ON public.mmi_orders(vessel_name);
CREATE INDEX idx_mmi_orders_created_at ON public.mmi_orders(created_at DESC);
