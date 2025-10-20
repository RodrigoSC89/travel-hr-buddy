# Nautilus One - Decision Core Module

## Overview

The **Decision Core** is the logical brain of Nautilus One - a Python-based backend system that provides intelligent decision-making capabilities for maritime, offshore, and industrial operations. This module interprets operator commands, executes analysis modules, and maintains complete traceability of all actions.

## Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│          Decision Engine Layer                   │
│  • Decision Core (Orchestration & Routing)      │
│  • State Management                             │
│  • Menu System                                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│        Analysis Modules Layer                    │
│  • FMEA Auditor                                 │
│  • ASOG Review                                  │
│  • Risk Forecast                                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Core Services Layer                      │
│  • Logger (Event Logging)                       │
│  • PDF Exporter (Report Generation)             │
│  • SGSO Connector (System Integration)          │
└─────────────────────────────────────────────────┘
```

## Key Features

### ✅ Zero Dependencies
- Uses only Python standard library
- No external packages required
- Production-ready out of the box

### ✅ Complete Traceability
- All actions logged with timestamps
- State persistence across sessions
- Full audit trail maintained

### ✅ Modular Design
- Easy to add new analysis modules
- Clean separation of concerns
- Extensible architecture

### ✅ 100% Tested
- Comprehensive test coverage
- Automated test suite
- All modules validated

## Quick Start

### Run the Interactive System
```bash
python3 main.py
```

### Run Automated Tests
```bash
python3 test_decision_core.py
```

### Monitor Logs
```bash
tail -f nautilus_logs.txt
```

### Check System State
```bash
cat nautilus_state.json
```

## Core Modules

### 1. Decision Core (`modules/decision_core.py`)

The main orchestrator that manages the entire system.

```python
from modules.decision_core import DecisionCore

nautilus = DecisionCore()
nautilus.processar_decisao()  # Start interactive menu
```

**Features:**
- Interactive menu with 5 operational modes
- State persistence in JSON format
- Route execution to analysis modules
- Complete audit trail
- Context restoration across sessions

### 2. FMEA Auditor (`modules/audit_fmea.py`)

Technical auditing using FMEA methodology.

```python
from modules.audit_fmea import FMEAAuditor

auditor = FMEAAuditor()
auditor.run()
```

**Capabilities:**
- Analyzes failure modes across 4 categories (Operational, Equipment, Human, Environmental)
- Calculates Risk Priority Number (RPN = Severity × Occurrence × Detection)
- Prioritizes risks from critical to low
- Generates actionable recommendations

**Output:** `relatorio_fmea_atual.json`

### 3. ASOG Review (`modules/asog_review.py`)

Operational safety analysis module.

```python
from modules.asog_review import ASOGModule

asog = ASOGModule()
asog.start()
```

**Capabilities:**
- Reviews 12 operational items
- Tracks compliance status (Conforme ✅ / Requer atenção ⚠️)
- Generates summary statistics
- Calculates compliance rates
- Identifies items requiring attention

**Output:** `relatorio_asog_atual.json`

### 4. Risk Forecast (`modules/forecast_risk.py`)

Predictive risk analysis module.

```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
forecast.analyze()
```

**Capabilities:**
- Analyzes 5 risk categories (Operational, Environmental, Equipment, Human, Regulatory)
- Predicts future risks over 30-day window
- Generates risk priority matrix
- Provides strategic recommendations
- Tracks risk trends

**Output:** `relatorio_forecast_atual.json`

## Support Services

### Logger (`core/logger.py`)

Event logging with timestamps.

```python
from core.logger import log_event

log_event("System initialized")
```

**Output:** `nautilus_logs.txt`

### PDF Exporter (`core/pdf_exporter.py`)

Report generation and export.

```python
from core.pdf_exporter import export_report

export_report("relatorio_fmea_atual.json")
```

**Output:** `relatorio_YYYYMMDD_HHMMSS.pdf`

### SGSO Connector (`core/sgso_connector.py`)

SGSO system integration.

```python
from core.sgso_connector import SGSOClient

sgso = SGSOClient()
sgso.connect()
```

## State Management

The system maintains state across sessions using JSON persistence:

```json
{
    "ultima_acao": "Rodar Auditoria FMEA",
    "timestamp": "2025-10-20T01:14:20.711113"
}
```

## API Reference

### DecisionCore Class

**Methods:**
- `carregar_estado()` - Load state from file
- `salvar_estado(acao: str)` - Save state to file
- `processar_decisao()` - Main decision processing loop
- `menu_modulos()` - Display module selection menu

### FMEAAuditor Class

**Methods:**
- `run()` - Execute FMEA audit

**Attributes:**
- `results` - List of failure mode analyses

### ASOGModule Class

**Methods:**
- `start()` - Execute ASOG review

**Attributes:**
- `items` - List of operational items reviewed

### RiskForecast Class

**Methods:**
- `analyze()` - Execute risk forecast

**Attributes:**
- `predictions` - List of risk predictions

## Testing

Run the comprehensive test suite:

```bash
python3 test_decision_core.py
```

**Test Coverage:**
- ✅ Logger functionality
- ✅ FMEA audit execution and RPN calculation
- ✅ ASOG review compliance checking
- ✅ Risk forecast prediction accuracy
- ✅ SGSO connection handling
- ✅ PDF export functionality
- ✅ Decision Core state management

## File Structure

```
travel-hr-buddy/
├── core/
│   ├── __init__.py
│   ├── logger.py              # Event logging
│   ├── pdf_exporter.py        # PDF report generation
│   └── sgso_connector.py      # SGSO integration
├── modules/
│   ├── __init__.py
│   ├── decision_core.py       # Main decision engine
│   ├── audit_fmea.py          # FMEA auditor
│   ├── asog_review.py         # ASOG review module
│   └── forecast_risk.py       # Risk forecast module
├── main.py                    # Application entry point
├── test_decision_core.py      # Comprehensive test suite
└── DECISION_CORE_README.md    # This file
```

## Requirements

- Python 3.12+
- No external dependencies

## Usage Examples

### Example 1: Run FMEA Audit

```bash
python3 main.py
# Select option 2: Iniciar módulo Auditoria Técnica FMEA
```

### Example 2: Run ASOG Review

```bash
python3 main.py
# Select option 4: Migrar para outro módulo
# Select option 1: ASOG Review
```

### Example 3: Export Report

```bash
python3 main.py
# Select option 1: Exportar parecer da IA como PDF
```

## Monitoring and Logs

All system actions are logged to `nautilus_logs.txt`:

```
[2025-10-20 01:14:20.711113] DecisionCore inicializado
[2025-10-20 01:14:25.523456] FMEAAuditor inicializado
[2025-10-20 01:14:30.789012] Auditoria FMEA concluída: 4 modos analisados
[2025-10-20 01:14:35.234567] Estado atualizado: Rodar Auditoria FMEA
```

## Integration

See `DECISION_CORE_INTEGRATION.md` for detailed integration guides with:
- Supabase Edge Functions
- REST API with FastAPI
- WebSocket for real-time updates

## Contributing

This module follows the Nautilus One architecture principles:
- Modular design
- Zero external dependencies
- Complete test coverage
- Comprehensive documentation

## License

Copyright © 2025 Nautilus One Project
