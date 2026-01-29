-- Create smart_contracts table
CREATE TABLE public.smart_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    contract_hash TEXT UNIQUE NOT NULL,
    owner_name TEXT NOT NULL,
    charterer_name TEXT NOT NULL,
    vessel_id UUID REFERENCES public.vessels(id),
    vessel_name TEXT NOT NULL,
    charter_type TEXT NOT NULL CHECK (charter_type IN ('time', 'voyage', 'bareboat', 'coa')),
    start_date DATE NOT NULL,
    end_date DATE,
    rate_value NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    conditions JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'active', 'paused', 'completed', 'terminated', 'disputed')),
    signed_by_owner BOOLEAN DEFAULT false,
    signed_by_charterer BOOLEAN DEFAULT false,
    total_paid NUMERIC DEFAULT 0,
    total_due NUMERIC DEFAULT 0,
    blockchain_tx_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sgso_risk_assessments table
CREATE TABLE public.sgso_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    vessel_id UUID REFERENCES public.vessels(id),
    vessel_name TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('critico', 'alto', 'medio', 'baixo')),
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assessor_id UUID,
    assessor_name TEXT,
    total_failures INTEGER DEFAULT 0,
    failures_by_month JSONB DEFAULT '{}',
    categories JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'under_review')),
    next_review_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create safety_drills table
CREATE TABLE public.safety_drills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    vessel_id UUID REFERENCES public.vessels(id),
    drill_type TEXT NOT NULL CHECK (drill_type IN ('fire', 'abandon_ship', 'man_overboard', 'oil_spill', 'security', 'medical', 'damage_control', 'enclosed_space')),
    scenario TEXT,
    scheduled_date TIMESTAMPTZ NOT NULL,
    conducted_date TIMESTAMPTZ,
    participants JSONB DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    score NUMERIC,
    musters_time_minutes INTEGER,
    deficiencies JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    competencies JSONB DEFAULT '[]',
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    conducted_by UUID,
    reviewed_by UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    vessel_id UUID REFERENCES public.vessels(id),
    item_id UUID NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'transfer', 'adjustment', 'return', 'disposal')),
    quantity NUMERIC NOT NULL,
    reference_number TEXT,
    work_order_id UUID,
    purchase_order_id UUID,
    reason TEXT,
    performed_by UUID,
    performed_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    vessel_id UUID REFERENCES public.vessels(id),
    po_number TEXT UNIQUE NOT NULL,
    supplier_id UUID,
    supplier_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'shipped', 'received', 'cancelled')),
    delivery_port TEXT,
    delivery_date DATE,
    total_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view contracts" ON public.smart_contracts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage contracts" ON public.smart_contracts FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view SGSO" ON public.sgso_risk_assessments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage SGSO" ON public.sgso_risk_assessments FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view drills" ON public.safety_drills FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage drills" ON public.safety_drills FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view inv transactions" ON public.inventory_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert inv transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view POs" ON public.purchase_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage POs" ON public.purchase_orders FOR ALL USING (auth.uid() IS NOT NULL);

-- Triggers
CREATE TRIGGER update_smart_contracts_updated_at BEFORE UPDATE ON public.smart_contracts FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();
CREATE TRIGGER update_sgso_risk_assessments_updated_at BEFORE UPDATE ON public.sgso_risk_assessments FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();
CREATE TRIGGER update_safety_drills_updated_at BEFORE UPDATE ON public.safety_drills FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();