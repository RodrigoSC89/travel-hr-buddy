# Fleet Management Module

## Visão Geral

O Fleet Management é o módulo central para gerenciamento de embarcações, incluindo tracking em tempo real, manutenção, performance e operações marítimas unificadas.

**Categoria**: Core / Operations  
**Rota**: `/fleet` ou `/maritime`  
**Status**: Ativo  
**Versão**: 191.0 (consolidado)

## Componentes Principais

### FleetOverview
- Lista de todas as embarcações
- Status em tempo real (active, maintenance, docked)
- Localização no mapa
- Quick stats (fuel, crew, next maintenance)

### VesselDetails
- Informações detalhadas da embarcação
- Especificações técnicas
- Histórico de manutenção
- Crew assignment
- Mission history

### VesselTracking
- Rastreamento GPS em tempo real
- AIS integration
- Route history
- Geofencing alerts

### MaintenancePlanner
- Scheduled maintenance
- Preventive maintenance tracking
- Maintenance history
- Spare parts inventory

### PerformanceMetrics
- Fuel consumption
- Speed and efficiency
- Operational hours
- Performance trends

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  imo_number VARCHAR(20) UNIQUE,
  flag VARCHAR(10),
  vessel_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  current_speed DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  last_update TIMESTAMP,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vessel_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  maintenance_type VARCHAR(100) NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR(20) DEFAULT 'scheduled',
  description TEXT,
  cost DECIMAL(10, 2),
  performed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vessel_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  recorded_at TIMESTAMP NOT NULL,
  source VARCHAR(50),
  metadata JSONB DEFAULT '{}'
);
```

## Requisições API Envolvidas

### Vessel Management
- **GET /api/vessels** - Lista embarcações
- **POST /api/vessels** - Adiciona embarcação
- **GET /api/vessels/:id** - Detalhes da embarcação
- **PUT /api/vessels/:id** - Atualiza embarcação
- **DELETE /api/vessels/:id** - Remove embarcação

### Tracking
- **GET /api/vessels/:id/tracking** - Histórico de posições
- **POST /api/vessels/:id/position** - Atualiza posição
- **GET /api/vessels/:id/current-position** - Posição atual
- **WebSocket /ws/vessels/tracking** - Stream de posições

### Maintenance
- **GET /api/vessels/:id/maintenance** - Manutenções da embarcação
- **POST /api/vessels/:id/maintenance** - Agenda manutenção
- **PUT /api/maintenance/:id** - Atualiza manutenção
- **PUT /api/maintenance/:id/complete** - Completa manutenção

### Performance
- **GET /api/vessels/:id/performance** - Métricas de performance
- **GET /api/vessels/:id/fuel-consumption** - Consumo de combustível
- **GET /api/vessels/:id/operational-hours** - Horas operacionais

## Integrações

### AIS Integration
- Automatic Identification System
- Real-time vessel tracking
- Collision avoidance
- Traffic monitoring

### Satellite Tracking
- Backup tracking via satellite
- Coverage em áreas remotas
- Integração com `/satellite-tracker`

### Mission Control
- Vessel assignment para missões
- Mission-based routing
- Resource allocation

### Crew Management
- Crew assignment para vessels
- Certification tracking
- Onboard crew status

### Weather Dashboard
- Weather overlay em tracking
- Weather-aware routing
- Safety alerts

## Recursos Avançados

### Geofencing
- Define geographic boundaries
- Entry/exit alerts
- Compliance monitoring
- Automatic notifications

### Route Optimization
- Fuel-efficient routing
- Weather-aware routing
- ETA calculation
- Multi-waypoint planning

### Predictive Maintenance
- AI-powered maintenance prediction
- Failure pattern recognition
- Cost optimization
- Downtime reduction

## Testes

Localização: 
- `tests/fleet-manager.spec.ts`
- `tests/fleet-ai.test.ts`

## Consolidação

**PATCH 191**: Consolidou módulos `maritime` e `maritime-supremo` em `fleet`

Redirects configurados:
- `/maritime` → `/fleet`
- `/maritime-supremo` → `/fleet`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 191.0  
**Status**: Consolidado e Ativo
