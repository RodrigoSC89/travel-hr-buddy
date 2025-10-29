# Navigation Copilot Module

## Visão Geral

O Navigation Copilot é um assistente de navegação com IA que integra dados meteorológicos, rotas otimizadas e alertas de segurança para navegação marítima inteligente.

**Categoria**: AI / Navigation  
**Rota**: `/navigation-copilot`  
**Status**: Ativo  
**Versão**: 447.0

## Componentes Principais

### NavigationMap
- Mapa interativo com rota atual
- Weather overlay
- Traffic information
- Hazard warnings

### RouteOptimizer
- AI-powered route optimization
- Weather-aware routing
- Fuel efficiency calculation
- ETA prediction

### SafetyAdvisor
- Real-time safety alerts
- Collision avoidance
- Weather warnings
- Restricted area alerts

### AutoPilotAssist
- Autopilot recommendations
- Course corrections
- Speed adjustments
- Emergency procedures

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE navigation_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  route_name VARCHAR(255),
  origin_lat DECIMAL(10, 8),
  origin_lng DECIMAL(11, 8),
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  waypoints JSONB,
  optimized_route JSONB,
  estimated_duration INTEGER,
  estimated_fuel DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE navigation_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  acknowledged BOOLEAN DEFAULT FALSE,
  alert_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Route Management
- **GET /api/navigation/routes** - Lista rotas
- **POST /api/navigation/routes** - Cria rota
- **POST /api/navigation/optimize** - Otimiza rota
- **GET /api/navigation/eta** - Calcula ETA

### Safety
- **GET /api/navigation/alerts** - Lista alertas
- **POST /api/navigation/check-safety** - Verifica segurança
- **GET /api/navigation/traffic** - Traffic information

### Weather Integration
- **GET /api/navigation/weather** - Weather ao longo da rota
- **GET /api/navigation/forecast** - Forecast para rota

## Integrações

- **Weather Dashboard**: Dados meteorológicos
- **Route Planner**: Planejamento de rotas
- **Fleet Management**: Status de embarcações
- **Satellite Tracking**: Posição em tempo real

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 447.0  
**Features**: AI optimization, Weather integration
