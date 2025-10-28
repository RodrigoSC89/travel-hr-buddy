# Mission Engine Module

## 📋 Overview

**Category**: Operations  
**Route**: `/mission-engine`  
**Status**: Active (PATCHES 426-430)

Unified mission control, execution, and logging system consolidating previous mission-control, mission-logs, and missions modules.

## 🎯 Objectives

- **PATCH 426**: Complete mission engine with AI orchestration
- **PATCH 430**: Consolidate mission modules into unified structure
- Coordinate mission execution with AI agents
- Track mission logs and execution history
- Provide tactical execution simulation
- Integrate with Coordination AI, Agent Swarm, and Forecast modules

## 🏗️ Architecture

### Component Structure
```
mission-engine/
├── index.tsx                    # Main mission engine interface
├── components/
│   ├── MissionDashboard.tsx    # Overview of missions and modules
│   ├── MissionLogs.tsx         # Detailed log viewing
│   ├── MissionExecutor.tsx     # Tactical execution interface
│   └── MissionCreator.tsx      # Create new missions
├── services/
│   └── mission-service.ts      # Mission & log management service
├── types/
│   └── index.ts                # TypeScript types
└── README.md                    # This file
```

## 💾 Database Schema

### missions
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
```

### mission_logs
```sql
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
```

### mission_alerts
```sql
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

## 🔌 Key Functions

### Mission Management
```typescript
// Create new mission
const mission = await missionEngineService.createMission({
  code: "M-001",
  name: "Operation Alpha",
  type: "tactical",
  status: "planned",
  priority: "high",
  startTime: new Date().toISOString()
});

// Update mission status
await missionEngineService.updateMission(mission.id, {
  status: "in-progress"
});

// Get missions with filters
const missions = await missionEngineService.getMissions({
  status: "in-progress",
  priority: "high"
});
```

### Mission Execution
```typescript
// Start tactical execution
const execution = await missionEngineService.startMissionExecution(
  missionId,
  simulationMode: false
);
```

### Logging
```typescript
// Create mission log
await missionEngineService.createLog({
  missionId: "mission-uuid",
  logType: "info",
  severity: "medium",
  title: "Checkpoint Reached",
  message: "Mission reached waypoint Alpha",
  category: "Navigation",
  sourceModule: "Mission Engine",
  eventTimestamp: new Date().toISOString()
});
```

## 🚀 Features

### Dashboard Tab
- Overview of active and planned missions
- Connected module status (Coordination AI, Agent Swarm, Forecast)
- System health monitoring
- Real-time alerts

### Missions Tab
- Full mission list with filtering
- Quick status view
- Direct mission execution
- Mission details

### Logs Tab
- Comprehensive mission logs
- Filter by type, severity, category
- Search functionality
- Real-time log streaming

### Execute Tab
- Tactical execution simulator
- Simulation mode toggle
- Mission phase workflow
- Safe pre-deployment testing

## 🔗 Module Integrations

### Coordination AI
- AI-powered mission planning
- Resource allocation optimization
- Risk assessment

### Agent Swarm
- Multi-agent task distribution
- Autonomous execution
- Agent status monitoring

### Forecast Module
- Weather and condition prediction
- Mission viability analysis
- Timeline optimization

### Satellite Tracking
- Real-time vessel tracking
- Communication status
- Position updates

## 📚 Related Documentation

- [Coordination AI README](../coordination-ai/README.md)
- [Agent Swarm README](../agent-swarm/README.md)
- [Forecast README](../forecast/README.md)
- [Module Overview](/dev/docs/MODULES_OVERVIEW.md)

---

**Last Updated**: 2025-10-28  
**Status**: Active - Consolidation Complete (PATCHES 426-430)
