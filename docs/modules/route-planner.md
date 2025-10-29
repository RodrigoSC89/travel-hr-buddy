# Route Planner Module

## Visão Geral

O Route Planner v2 é o módulo avançado de planejamento de rotas marítimas com cálculo dinâmico de ETA, integração meteorológica e otimização de combustível.

**Categoria**: Specialized / Navigation  
**Rota**: `/route-planner`  
**Status**: Ativo  
**Versão**: 449.0

## Componentes Principais

### RouteMap
- Interactive map with route visualization
- Multiple route options display
- Real-time vessel position
- Weather overlay
- Traffic information

### RouteOptimizer
- Fuel-efficient routing
- Time-optimized routing
- Weather-aware routing
- Multi-waypoint optimization
- Cost comparison

### ETACalculator
- Dynamic ETA calculation
- Real-time updates
- Weather impact consideration
- Speed profile optimization
- Arrival window prediction

### WeatherIntegration
- Weather forecast along route
- Storm avoidance
- Sea state prediction
- Wind and current analysis
- Safe passage windows

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE planned_routes (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  route_name VARCHAR(255),
  origin GEOGRAPHY(POINT),
  destination GEOGRAPHY(POINT),
  waypoints JSONB,
  distance_nm DECIMAL(10, 2),
  estimated_duration INTEGER,
  estimated_fuel DECIMAL(10, 2),
  optimization_type VARCHAR(50),
  weather_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Route Planning
- **POST /api/routes/plan** - Plan new route
- **POST /api/routes/optimize** - Optimize existing route
- **GET /api/routes/:id/eta** - Calculate ETA
- **POST /api/routes/compare** - Compare multiple routes

### Weather Integration
- **GET /api/routes/:id/weather** - Weather forecast for route
- **GET /api/routes/safe-passage** - Safe passage windows
- **POST /api/routes/weather-reroute** - Weather-based rerouting

## Integrações

- **Navigation Copilot**: AI-assisted navigation
- **Weather Dashboard**: Weather data
- **Fleet Management**: Vessel data
- **Satellite Tracking**: Real-time position

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 449.0  
**Features**: Dynamic ETA, Weather integration, Route optimization
