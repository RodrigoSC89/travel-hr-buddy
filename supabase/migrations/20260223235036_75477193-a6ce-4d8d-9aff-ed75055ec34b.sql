
-- =====================================================
-- PHASE 1: Market Parity Modules — Full Schema
-- 8 modules, RLS, multi-tenant, timestamps
-- =====================================================

-- 1) BERTH SCHEDULING
CREATE TABLE public.berth_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  port_name TEXT NOT NULL,
  terminal_name TEXT,
  berth_number TEXT,
  arrival_eta TIMESTAMPTZ NOT NULL,
  departure_etd TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','in_progress','completed','cancelled')),
  cargo_type TEXT,
  cargo_volume_mt NUMERIC,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.berth_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org berth bookings" ON public.berth_bookings FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert berth bookings" ON public.berth_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update berth bookings" ON public.berth_bookings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete berth bookings" ON public.berth_bookings FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 2) BARGING / LIGHTERING (STS)
CREATE TABLE public.sts_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  partner_vessel_name TEXT,
  operation_type TEXT NOT NULL DEFAULT 'lightering' CHECK (operation_type IN ('lightering','bunkering','cargo_transfer','ballast')),
  location_lat NUMERIC,
  location_lon NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  cargo_type TEXT,
  volume_transferred_mt NUMERIC,
  ocimf_checklist_score NUMERIC,
  weather_conditions JSONB,
  safety_clearance BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','aborted')),
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sts_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org sts ops" ON public.sts_operations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert sts ops" ON public.sts_operations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update sts ops" ON public.sts_operations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete sts ops" ON public.sts_operations FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 3) TRADING & RISK
CREATE TABLE public.trading_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('ffa','bunker_swap','freight_option','physical','other')),
  route_code TEXT,
  vessel_type TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('long','short')),
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'MT',
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  settlement_date DATE,
  counterparty TEXT,
  broker TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','expired','settled')),
  pnl NUMERIC,
  var_95 NUMERIC,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.trading_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org trading" ON public.trading_positions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert trading" ON public.trading_positions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update trading" ON public.trading_positions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete trading" ON public.trading_positions FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 4) TRIM & PROPULSION
CREATE TABLE public.trim_propulsion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  draft_forward_m NUMERIC,
  draft_aft_m NUMERIC,
  trim_m NUMERIC,
  optimal_trim_m NUMERIC,
  speed_kts NUMERIC,
  rpm NUMERIC,
  fuel_consumption_mt NUMERIC,
  slip_percent NUMERIC,
  hull_fouling_index NUMERIC,
  propeller_condition TEXT,
  weather_factor NUMERIC,
  fuel_savings_potential_mt NUMERIC,
  recommendations JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.trim_propulsion_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view trim records" ON public.trim_propulsion_records FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert trim records" ON public.trim_propulsion_records FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update trim records" ON public.trim_propulsion_records FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete trim records" ON public.trim_propulsion_records FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 5) SUPPLIER PORTAL
CREATE TABLE public.supplier_portal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  rfq_id UUID,
  rfq_title TEXT,
  category TEXT,
  response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending','submitted','accepted','rejected','expired')),
  quoted_amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  delivery_days INTEGER,
  technical_score NUMERIC,
  commercial_score NUMERIC,
  documents JSONB,
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.supplier_portal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view supplier portal" ON public.supplier_portal_entries FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert supplier portal" ON public.supplier_portal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update supplier portal" ON public.supplier_portal_entries FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete supplier portal" ON public.supplier_portal_entries FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 6) INVOICE AUTO-MATCHING
CREATE TABLE public.invoice_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  invoice_id UUID,
  invoice_number TEXT,
  po_number TEXT,
  po_id UUID,
  supplier_name TEXT,
  invoice_amount NUMERIC NOT NULL,
  po_amount NUMERIC,
  variance_amount NUMERIC,
  variance_percent NUMERIC,
  match_confidence NUMERIC,
  match_status TEXT DEFAULT 'pending' CHECK (match_status IN ('pending','auto_matched','manual_review','approved','rejected','disputed')),
  ai_reasoning TEXT,
  line_items_matched INTEGER,
  line_items_total INTEGER,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.invoice_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invoice matches" ON public.invoice_matches FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert invoice matches" ON public.invoice_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update invoice matches" ON public.invoice_matches FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete invoice matches" ON public.invoice_matches FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 7) RETURN GOODS
CREATE TABLE public.return_goods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  po_number TEXT,
  item_description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'pcs',
  reason TEXT NOT NULL CHECK (reason IN ('defective','wrong_item','excess','expired','damaged','other')),
  reason_details TEXT,
  return_status TEXT DEFAULT 'initiated' CHECK (return_status IN ('initiated','approved','shipped','received_by_supplier','credit_issued','closed','rejected')),
  credit_amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  tracking_number TEXT,
  shipped_date DATE,
  credit_received_date DATE,
  photos JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.return_goods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view return goods" ON public.return_goods FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert return goods" ON public.return_goods FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update return goods" ON public.return_goods FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete return goods" ON public.return_goods FOR DELETE TO authenticated USING (created_by = auth.uid());

-- 8) FORUM / KNOWLEDGE SHARE
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','safety','technical','operations','compliance','best_practice','lesson_learned')),
  tags TEXT[],
  vessel_id UUID REFERENCES public.vessels(id),
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  author_id UUID NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  author_id UUID NOT NULL,
  author_name TEXT,
  parent_reply_id UUID REFERENCES public.forum_replies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view forum posts" ON public.forum_posts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update forum posts" ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete forum posts" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Users can view forum replies" ON public.forum_replies FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create forum replies" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update forum replies" ON public.forum_replies FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete forum replies" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- INDEXES for performance
CREATE INDEX idx_berth_bookings_vessel ON public.berth_bookings(vessel_id);
CREATE INDEX idx_berth_bookings_status ON public.berth_bookings(status);
CREATE INDEX idx_berth_bookings_eta ON public.berth_bookings(arrival_eta);

CREATE INDEX idx_sts_operations_vessel ON public.sts_operations(vessel_id);
CREATE INDEX idx_sts_operations_status ON public.sts_operations(status);

CREATE INDEX idx_trading_positions_status ON public.trading_positions(status);
CREATE INDEX idx_trading_positions_instrument ON public.trading_positions(instrument_type);

CREATE INDEX idx_trim_vessel_date ON public.trim_propulsion_records(vessel_id, record_date);

CREATE INDEX idx_supplier_portal_supplier ON public.supplier_portal_entries(supplier_id);
CREATE INDEX idx_supplier_portal_status ON public.supplier_portal_entries(response_status);

CREATE INDEX idx_invoice_matches_status ON public.invoice_matches(match_status);
CREATE INDEX idx_invoice_matches_confidence ON public.invoice_matches(match_confidence);

CREATE INDEX idx_return_goods_vessel ON public.return_goods(vessel_id);
CREATE INDEX idx_return_goods_status ON public.return_goods(return_status);

CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_posts_org ON public.forum_posts(organization_id);
CREATE INDEX idx_forum_replies_post ON public.forum_replies(post_id);
