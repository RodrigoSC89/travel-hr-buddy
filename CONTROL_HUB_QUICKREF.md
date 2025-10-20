# Control Hub - Quick Reference Guide

## Overview
The Nautilus Control Hub is a centralized control system for embedded maritime operations, providing real-time monitoring, intelligent synchronization, and continuous operation even without internet connectivity.

## Quick Start

```typescript
import { controlHub } from '@/modules/control_hub';

// Initialize the Control Hub
await controlHub.iniciar();

// Get current state
const state = controlHub.getState();

// Trigger synchronization
const result = await controlHub.sincronizar();

// Check system health
const health = await controlHub.getHealth();
```

## Core Components

### 1. Hub Core (`hub_core.ts`)
Main orchestration engine coordinating all subsystems.

**Methods:**
- `iniciar()` - Initialize Control Hub
- `parar()` - Stop Control Hub
- `getState()` - Get current system state
- `sincronizar()` - Manual sync
- `getHealth()` - Health check
- `addToCache()` - Add data to offline cache

### 2. Hub Monitor (`hub_monitor.ts`)
Real-time status tracking for all modules:
- MMI (Manutenção Inteligente)
- PEO-DP (Auditoria e Conformidade)
- DP Intelligence (Forecast & Analytics)
- BridgeLink (Conectividade)
- SGSO (Sistema de Gestão)

### 3. Hub Sync (`hub_sync.ts`)
Intelligent synchronization with:
- Automatic sync every 5 minutes
- Manual sync on-demand
- Exponential backoff retry (3 attempts)
- Store-and-forward for offline operation

### 4. Hub Cache (`hub_cache.ts`)
Offline storage management:
- 100 MB capacity using localStorage
- Automatic cleanup of synchronized entries
- Full/pending tracking

### 5. Hub Bridge (`hub_bridge.ts`)
BridgeLink integration:
- Connection monitoring
- Token-based authentication
- Configurable timeout (30s)
- Retry logic with exponential backoff

## API Endpoints

### GET /api/control-hub/status
Returns full system status including modules, cache, and sync info.

### POST /api/control-hub/sync
Triggers manual synchronization.

### GET /api/control-hub/health
Health check endpoint (returns 200 for healthy, 503 for critical).

## UI Components

Access the dashboard at `/control-hub`:
- Overall system status alerts
- Individual module status cards
- BridgeLink connectivity display
- Cache and sync information
- Auto-refresh every 30 seconds

## Configuration

Edit `hub_config.json` to customize:
- Module check intervals
- Cache size limits
- Sync intervals and retry logic
- BridgeLink endpoints and timeouts

## Key Features

✅ **Offline Operation**: Store-and-forward cache persists data locally when offline  
✅ **Real-time Monitoring**: Continuous status tracking of all 5 operational modules  
✅ **Intelligent Sync**: Automatic synchronization with retry logic and backoff  
✅ **Unified Dashboard**: Single pane of glass for all operations  
✅ **Health Checks**: System health API for external monitoring  
✅ **Auto Recovery**: Automatic retry and recovery mechanisms  

## Performance Targets

- Initial load: < 500ms
- Dashboard render: < 100ms
- Status refresh: < 200ms
- Sync operation: < 2000ms
- Cache operations: < 50ms
