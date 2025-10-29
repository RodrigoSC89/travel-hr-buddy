# Mission Control Module

## Visão Geral

O Mission Control (implementado como Mission Engine) é o módulo unificado para planejamento, execução e monitoramento de missões operacionais, com integração de IA para otimização e coordenação autônoma.

**Categoria**: Core / Operations  
**Rota**: `/mission-control` ou `/mission-engine`  
**Status**: Ativo  
**Versão**: 2.0 (PATCHES 426-430)

## Componentes Principais

### MissionDashboard
- Overview de todas as missões (planejadas, ativas, concluídas)
- Status de módulos conectados (Coordination AI, Agent Swarm, Forecast)
- Alertas em tempo real
- Health check do sistema

### MissionList
- Lista completa de missões com filtros avançados
- Filtros por status, prioridade, tipo
- Quick actions (start, pause, stop)
- Visualização em grid ou lista

### MissionExecutor
- Interface de execução tática
- Simulation mode para testes
- Phase-based workflow
- Progress tracking em tempo real

### MissionLogs
- Logs detalhados de execução
- Filtros por tipo, severidade, categoria
- Busca full-text
- Export de logs

### MissionCreator
- Criação de novas missões
- Form wizard com validação
- Template system
- AI-assisted planning

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'planned',
  priority VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  assigned_vessel_id UUID REFERENCES vessels(id),
  assigned_agents TEXT[],
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mission_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id),
  log_type VARCHAR(20) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100),
  source_module VARCHAR(100),
  event_timestamp TIMESTAMP NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mission_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id),
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Mission Management
- **GET /api/missions** - Lista missões com filtros
- **POST /api/missions** - Cria nova missão
- **GET /api/missions/:id** - Detalhes da missão
- **PUT /api/missions/:id** - Atualiza missão
- **DELETE /api/missions/:id** - Remove missão
- **POST /api/missions/:id/start** - Inicia execução
- **POST /api/missions/:id/pause** - Pausa execução
- **POST /api/missions/:id/complete** - Finaliza missão

### Mission Logs
- **GET /api/missions/:id/logs** - Logs da missão
- **POST /api/missions/:id/logs** - Adiciona log
- **GET /api/logs/mission** - Todos os logs de missões

### Mission Alerts
- **GET /api/missions/:id/alerts** - Alertas da missão
- **POST /api/missions/:id/alerts** - Cria alerta
- **PUT /api/alerts/:id/acknowledge** - Reconhece alerta

### Execution
- **POST /api/missions/:id/execute** - Execução tática
- **GET /api/missions/:id/status** - Status de execução
- **WebSocket /ws/missions/:id** - Updates em tempo real

## Integrações

### Coordination AI
- AI-powered mission planning
- Resource allocation optimization
- Risk assessment and mitigation
- Rota: `/coordination-ai`

### Agent Swarm
- Multi-agent task distribution
- Autonomous execution
- Agent status monitoring
- Rota: `/agent-swarm`

### Forecast Module
- Weather and condition prediction
- Mission viability analysis
- Timeline optimization
- Rota: `/forecast`

### Satellite Tracking
- Real-time vessel tracking
- Communication status
- Position updates
- Rota: `/satellite-tracker`

### Fleet Management
- Vessel assignment
- Resource availability
- Crew allocation

## Recursos Avançados

### Tactical Execution Simulator
- Safe pre-deployment testing
- Simulation mode com rollback
- Phase-based workflow (Planning → Briefing → Execution → Debrief → Completion)
- Real-time monitoring

### AI-Assisted Planning
- Automatic resource optimization
- Weather-aware scheduling
- Risk-based prioritization
- Learning from past missions

### Mission Templates
- Template system para missões comuns
- Quick start com pre-filled data
- Custom template creation

## Testes

Localização: 
- `tests/mission-control.test.ts`
- `e2e/mission-creation.spec.ts`

## Subpáginas

- `/mission-control/insight-dashboard` - Dashboard de insights
- `/mission-control/autonomy` - Console de autonomia
- `/mission-control/ai-command` - Centro de comando AI
- `/mission-control/workflows` - Engine de workflows
- `/mission-control/llm` - Nautilus LLM interface
- `/mission-control/thought-chain` - Thought chain visualization

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Consolidação**: PATCHES 426-430
