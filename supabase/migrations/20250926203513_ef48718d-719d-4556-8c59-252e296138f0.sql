-- Tabela para histórico de preços de passagens
CREATE TABLE public.flight_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_code TEXT NOT NULL, -- Ex: "GRU-SDU", "GIG-BSB"
  airline_code TEXT NOT NULL,
  flight_number TEXT,
  departure_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  booking_class TEXT NOT NULL DEFAULT 'economy',
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'amadeus', -- amadeus, mock, manual
  passenger_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para histórico de preços de hotéis
CREATE TABLE public.hotel_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'BR',
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  room_type TEXT,
  guest_count INTEGER DEFAULT 2,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'amadeus',
  rating DECIMAL(3,1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para análises preditivas
CREATE TABLE public.travel_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel')),
  route_or_destination TEXT NOT NULL, -- Para voos: "GRU-SDU", para hotéis: "Rio de Janeiro"
  prediction_date DATE NOT NULL,
  current_avg_price DECIMAL(10,2) NOT NULL,
  predicted_price DECIMAL(10,2) NOT NULL,
  price_trend TEXT NOT NULL CHECK (price_trend IN ('rising', 'falling', 'stable')),
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.0, -- 0.0 a 1.0
  best_booking_window_start DATE,
  best_booking_window_end DATE,
  seasonal_factor DECIMAL(3,2) DEFAULT 1.0,
  demand_level TEXT CHECK (demand_level IN ('low', 'medium', 'high', 'very_high')),
  recommendation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para alertas de preços
CREATE TABLE public.travel_price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel')),
  route_or_destination TEXT NOT NULL,
  target_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'optimal_time', 'price_rise_warning')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'expired')),
  travel_date DATE,
  passengers_or_guests INTEGER DEFAULT 1,
  notification_sent BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para recomendações personalizadas
CREATE TABLE public.travel_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'general')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('savings_opportunity', 'timing_advice', 'trend_alert', 'seasonal_insight')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  route_or_destination TEXT,
  estimated_savings DECIMAL(10,2),
  action_deadline DATE,
  is_read BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_flight_price_history_route_date ON public.flight_price_history(route_code, departure_date);
CREATE INDEX idx_hotel_price_history_city_date ON public.hotel_price_history(city, check_in_date);
CREATE INDEX idx_travel_predictions_type_route ON public.travel_predictions(type, route_or_destination);
CREATE INDEX idx_travel_price_alerts_user_status ON public.travel_price_alerts(user_id, status);
CREATE INDEX idx_travel_recommendations_user_active ON public.travel_recommendations(user_id, is_active);

-- RLS policies
ALTER TABLE public.flight_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização pública dos dados históricos (necessário para análises)
CREATE POLICY "Everyone can view flight price history" ON public.flight_price_history
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view hotel price history" ON public.hotel_price_history
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view travel predictions" ON public.travel_predictions
  FOR SELECT USING (true);

-- Sistema pode inserir dados históricos
CREATE POLICY "System can insert flight price history" ON public.flight_price_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert hotel price history" ON public.hotel_price_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can manage travel predictions" ON public.travel_predictions
  FOR ALL USING (true);

-- Usuários podem gerenciar seus próprios alertas
CREATE POLICY "Users can manage their own price alerts" ON public.travel_price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Usuários podem gerenciar suas próprias recomendações
CREATE POLICY "Users can manage their own recommendations" ON public.travel_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_predictions_updated_at
  BEFORE UPDATE ON public.travel_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_price_alerts_updated_at
  BEFORE UPDATE ON public.travel_price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_recommendations_updated_at
  BEFORE UPDATE ON public.travel_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();