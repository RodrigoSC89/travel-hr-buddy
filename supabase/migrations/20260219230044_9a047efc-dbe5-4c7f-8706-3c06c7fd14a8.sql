
-- ═══════════════════════════════════════════════════════════
-- NAUTI ONE — Internal Travel Logistics Engine
-- Passagens aéreas, hotéis e transfers sem APIs externas
-- ═══════════════════════════════════════════════════════════

-- 1) Catálogo de Rotas Aéreas Frequentes
CREATE TABLE public.travel_flight_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_city TEXT NOT NULL,
  origin_iata TEXT,
  destination_city TEXT NOT NULL,
  destination_iata TEXT,
  preferred_airlines TEXT[] DEFAULT '{}',
  avg_price_usd NUMERIC(10,2),
  min_price_usd NUMERIC(10,2),
  max_price_usd NUMERIC(10,2),
  avg_duration_hours NUMERIC(5,1),
  frequency TEXT DEFAULT 'daily', -- daily, weekly, 2x_week
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Hotéis Homologados
CREATE TABLE public.travel_approved_hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  port_name TEXT, -- porto mais próximo
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  daily_rate_usd NUMERIC(10,2),
  max_daily_rate_usd NUMERIC(10,2), -- teto por política
  breakfast_included BOOLEAN DEFAULT false,
  airport_shuttle BOOLEAN DEFAULT false,
  port_distance_km NUMERIC(6,1),
  airport_distance_km NUMERIC(6,1),
  internal_rating NUMERIC(3,1) DEFAULT 0, -- 0-10 avaliação interna
  total_reviews INTEGER DEFAULT 0,
  contract_valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  rank_policy JSONB DEFAULT '{}', -- ex: {"officer": 150, "rating": 80, "master": 200}
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Empresas de Transfer
CREATE TABLE public.travel_transfer_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  port_name TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  vehicle_types TEXT[] DEFAULT '{}', -- sedan, van, minibus, bus
  base_rate_usd NUMERIC(10,2),
  rate_per_km_usd NUMERIC(6,2),
  airport_to_port_rate_usd NUMERIC(10,2),
  hotel_to_port_rate_usd NUMERIC(10,2),
  availability TEXT DEFAULT '24/7',
  internal_rating NUMERIC(3,1) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) Rotas de Transfer pré-definidas
CREATE TABLE public.travel_transfer_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.travel_transfer_providers(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL, -- ex: "GRU → Porto de Santos"
  origin_type TEXT NOT NULL, -- airport, hotel, port, terminal
  origin_name TEXT NOT NULL,
  destination_type TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  fixed_price_usd NUMERIC(10,2),
  estimated_duration_min INTEGER,
  distance_km NUMERIC(6,1),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Solicitações de Cotação (RFQ)
CREATE TABLE public.travel_quotation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL,
  request_type TEXT NOT NULL, -- flight, hotel, transfer, package
  crew_member_id UUID REFERENCES public.crew_members(id),
  crew_member_name TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  -- Flight details
  origin_city TEXT,
  destination_city TEXT,
  departure_date DATE,
  return_date DATE,
  is_one_way BOOLEAN DEFAULT false,
  passengers INTEGER DEFAULT 1,
  cabin_class TEXT DEFAULT 'economy', -- economy, business, first
  -- Hotel details
  hotel_city TEXT,
  check_in_date DATE,
  check_out_date DATE,
  rooms_needed INTEGER DEFAULT 1,
  -- Transfer details
  transfer_city TEXT,
  transfer_date DATE,
  transfer_origin TEXT,
  transfer_destination TEXT,
  -- Budget & approval
  max_budget_usd NUMERIC(10,2),
  urgency TEXT DEFAULT 'normal', -- urgent, normal, flexible
  status TEXT DEFAULT 'open', -- open, quoted, evaluating, approved, booked, cancelled
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Respostas de Cotação (de agências/fornecedores)
CREATE TABLE public.travel_quotation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.travel_quotation_requests(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  supplier_phone TEXT,
  -- Detalhes da oferta
  price_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  airline TEXT,
  flight_number TEXT,
  hotel_name TEXT,
  transfer_company TEXT,
  departure_time TEXT,
  arrival_time TEXT,
  duration_hours NUMERIC(5,1),
  includes_baggage BOOLEAN DEFAULT true,
  includes_meals BOOLEAN DEFAULT false,
  cancellation_policy TEXT,
  valid_until DATE,
  -- Scoring automático
  ai_score NUMERIC(4,1), -- 0-100 score calculado pelo algoritmo
  price_score NUMERIC(4,1),
  convenience_score NUMERIC(4,1),
  reliability_score NUMERIC(4,1),
  is_recommended BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT false,
  selected_at TIMESTAMPTZ,
  selected_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7) Reservas Confirmadas
CREATE TABLE public.travel_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_number TEXT NOT NULL,
  booking_type TEXT NOT NULL, -- flight, hotel, transfer
  quotation_response_id UUID REFERENCES public.travel_quotation_responses(id),
  quotation_request_id UUID REFERENCES public.travel_quotation_requests(id),
  crew_member_id UUID REFERENCES public.crew_members(id),
  vessel_id UUID REFERENCES public.vessels(id),
  supplier_name TEXT NOT NULL,
  -- Detalhes
  description TEXT,
  total_price_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  confirmation_number TEXT,
  status TEXT DEFAULT 'confirmed', -- confirmed, checked_in, completed, cancelled, no_show
  cancellation_reason TEXT,
  -- Avaliação pós-viagem
  post_rating INTEGER CHECK (post_rating BETWEEN 1 AND 5),
  post_feedback TEXT,
  -- Metadata
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.travel_flight_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_approved_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_transfer_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_transfer_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_quotation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can read, managers+ can write)
CREATE POLICY "Authenticated read flight routes" ON public.travel_flight_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage flight routes" ON public.travel_flight_routes FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Authenticated read approved hotels" ON public.travel_approved_hotels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage approved hotels" ON public.travel_approved_hotels FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Authenticated read transfer providers" ON public.travel_transfer_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage transfer providers" ON public.travel_transfer_providers FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Authenticated read transfer routes" ON public.travel_transfer_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage transfer routes" ON public.travel_transfer_routes FOR ALL TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Authenticated read quotation requests" ON public.travel_quotation_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create quotation requests" ON public.travel_quotation_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Managers manage quotation requests" ON public.travel_quotation_requests FOR UPDATE TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Authenticated read quotation responses" ON public.travel_quotation_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated create quotation responses" ON public.travel_quotation_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Managers manage quotation responses" ON public.travel_quotation_responses FOR UPDATE TO authenticated USING (public.is_manager_or_above());

CREATE POLICY "Authenticated read bookings" ON public.travel_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers manage bookings" ON public.travel_bookings FOR ALL TO authenticated USING (public.is_manager_or_above());

-- Indexes
CREATE INDEX idx_flight_routes_cities ON public.travel_flight_routes(origin_city, destination_city);
CREATE INDEX idx_approved_hotels_city ON public.travel_approved_hotels(city, is_active);
CREATE INDEX idx_transfer_providers_city ON public.travel_transfer_providers(city, is_active);
CREATE INDEX idx_quotation_requests_status ON public.travel_quotation_requests(status);
CREATE INDEX idx_quotation_requests_crew ON public.travel_quotation_requests(crew_member_id);
CREATE INDEX idx_bookings_crew ON public.travel_bookings(crew_member_id);
CREATE INDEX idx_bookings_status ON public.travel_bookings(status);

-- Triggers para updated_at
CREATE TRIGGER update_flight_routes_updated_at BEFORE UPDATE ON public.travel_flight_routes FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_approved_hotels_updated_at BEFORE UPDATE ON public.travel_approved_hotels FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_transfer_providers_updated_at BEFORE UPDATE ON public.travel_transfer_providers FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_quotation_requests_updated_at BEFORE UPDATE ON public.travel_quotation_requests FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.travel_bookings FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

-- Sequence para request_number
CREATE OR REPLACE FUNCTION public.generate_travel_request_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 'TRQ-' || v_year || '-(\d+)') AS INTEGER)), 0) + 1
  INTO v_seq FROM public.travel_quotation_requests WHERE request_number LIKE 'TRQ-' || v_year || '-%';
  NEW.request_number := 'TRQ-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_travel_request_number_trigger BEFORE INSERT ON public.travel_quotation_requests FOR EACH ROW EXECUTE FUNCTION public.generate_travel_request_number();

-- Sequence para booking_number
CREATE OR REPLACE FUNCTION public.generate_travel_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 'TBK-' || v_year || '-(\d+)') AS INTEGER)), 0) + 1
  INTO v_seq FROM public.travel_bookings WHERE booking_number LIKE 'TBK-' || v_year || '-%';
  NEW.booking_number := 'TBK-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_travel_booking_number_trigger BEFORE INSERT ON public.travel_bookings FOR EACH ROW EXECUTE FUNCTION public.generate_travel_booking_number();
