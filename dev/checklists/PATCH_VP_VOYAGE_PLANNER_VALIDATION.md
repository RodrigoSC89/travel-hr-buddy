# 🧭 Voyage Planner – Validation Checklist

**Module:** `voyage-planner`  
**Priority:** Critical (Tier 1)  
**Status:** ⚠️ Partially Implemented  
**Last Updated:** 2025-01-27

---

## ✅ Validation Checklist

### 1. Route Creation with Weather Forecast Integration
- [ ] **Rota criada com previsão meteorológica integrada**
  - UI permite criar nova rota com waypoints
  - Integração com API meteorológica (OpenWeatherMap/WeatherAPI)
  - Exibição de condições climáticas por segmento de rota
  - Dados persistidos em `voyage_plans` e `route_forecasts`

### 2. ETA Adjusted Based on Real Conditions
- [ ] **ETA ajustado com base em condições reais**
  - Cálculo dinâmico de ETA considerando:
    - Velocidade atual da embarcação
    - Condições meteorológicas
    - Correntes marítimas
    - Consumo de combustível
  - Atualização automática de ETA no UI

### 3. AI-Powered Economic Route Suggestion
- [ ] **Sugestão de rota econômica apresentada pela IA**
  - Algoritmo de otimização implementado
  - Comparação de rotas (custo, tempo, segurança)
  - UI exibe recomendações com justificativas
  - Dados salvos em `fuel_suggestions` / `route_optimizations`

### 4. Data Persistence
- [ ] **Dados persistidos: `voyage_plans`, `route_forecasts`, `fuel_suggestions` existentes e válidos**
  - Tabelas criadas no Supabase
  - CRUD completo funcionando
  - RLS policies implementadas
  - Dados reais (não mocks) em produção

---

## 📊 Database Schema Requirements

### Tables Needed:
```sql
-- Voyage Plans
CREATE TABLE voyage_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  departure_port TEXT NOT NULL,
  arrival_port TEXT NOT NULL,
  departure_date TIMESTAMPTZ NOT NULL,
  estimated_arrival TIMESTAMPTZ NOT NULL,
  actual_arrival TIMESTAMPTZ,
  route_waypoints JSONB NOT NULL,
  status TEXT DEFAULT 'planned',
  total_distance_nm DECIMAL(10,2),
  estimated_fuel_consumption DECIMAL(10,2),
  weather_risk_score INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Route Forecasts
CREATE TABLE route_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_plan_id UUID REFERENCES voyage_plans(id) ON DELETE CASCADE,
  waypoint_index INTEGER NOT NULL,
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  forecast_time TIMESTAMPTZ NOT NULL,
  wind_speed_kts DECIMAL(5,2),
  wind_direction INTEGER,
  wave_height_m DECIMAL(5,2),
  visibility_km DECIMAL(5,2),
  temperature_c DECIMAL(5,2),
  weather_condition TEXT,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fuel Suggestions
CREATE TABLE fuel_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_plan_id UUID REFERENCES voyage_plans(id) ON DELETE CASCADE,
  route_type TEXT NOT NULL, -- 'fastest', 'economical', 'safest'
  estimated_consumption DECIMAL(10,2) NOT NULL,
  estimated_cost DECIMAL(10,2),
  estimated_duration_hours INTEGER,
  co2_emissions_tons DECIMAL(10,2),
  route_waypoints JSONB NOT NULL,
  recommendation_score DECIMAL(5,2),
  ai_rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE voyage_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view voyage plans in their organization"
  ON voyage_plans FOR SELECT
  USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can create voyage plans"
  ON voyage_plans FOR INSERT
  WITH CHECK (auth.uid() = created_by);
```

---

## 🔧 Implementation Status

### ✅ Completed
- Basic voyage planner UI structure
- Route visualization on map (placeholder)

### 🚧 In Progress
- Weather API integration
- ETA calculation engine
- AI route optimization

### ❌ Not Started
- Real-time weather updates
- Multi-route comparison UI
- Fuel consumption tracking integration
- Historical voyage analytics

---

## 🎯 Next Steps

1. **Immediate (Sprint 1)**
   - Create database tables (`voyage_plans`, `route_forecasts`, `fuel_suggestions`)
   - Implement weather API integration (OpenWeatherMap)
   - Build ETA calculation logic

2. **Short-term (Sprint 2)**
   - Develop AI route optimization algorithm
   - Create multi-route comparison UI
   - Integrate fuel consumption data from Fleet Management

3. **Medium-term (Sprint 3)**
   - Add real-time weather tracking
   - Implement voyage deviation alerts
   - Build historical voyage analytics dashboard

---

## 🧪 Testing Criteria

- [ ] Create voyage plan with 5+ waypoints
- [ ] Verify weather data loads for each waypoint
- [ ] Test ETA updates when weather conditions change
- [ ] Compare AI-suggested routes (economical vs fastest)
- [ ] Validate fuel consumption calculations
- [ ] Check data persistence after page reload
- [ ] Test on mobile devices

---

## 📦 Dependencies

- **APIs:** OpenWeatherMap / WeatherAPI
- **Modules:** Fleet Management (fuel data), Maritime System (vessel data)
- **Database:** `vessels`, `organizations`, `auth.users`
- **External:** Map provider (Mapbox/Google Maps)

---

## 🚨 Known Issues

1. Mock weather data currently in use
2. ETA calculation not considering currents
3. AI recommendations placeholder logic
4. No integration with actual vessel telemetry
5. Route optimization limited to 2 alternatives

---

**Validation Owner:** Fleet Operations Team  
**Target Completion:** Week 4 (Tier 1 Priority)
