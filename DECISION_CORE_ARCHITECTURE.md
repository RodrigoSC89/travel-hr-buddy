# 🏗️ Decision Core Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Nautilus One System                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          TypeScript/React Frontend (src/)             │  │
│  │  • Dashboard  • Documents  • Checklists  • SGSO      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ├─────────────────────┐           │
│                           │                     │           │
│  ┌────────────────────────▼──────┐  ┌──────────▼────────┐  │
│  │  Supabase Backend (API)       │  │  Python Backend   │  │
│  │  • PostgreSQL                 │  │  • Decision Core  │  │
│  │  • Auth/RLS                   │  │  • FMEA Auditor   │  │
│  │  • Edge Functions             │  │  • Risk Forecast  │  │
│  └───────────────────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Python Module Structure

```
Decision Core System
│
├── main.py                          [Entry Point]
│   └── Initializes DecisionCore
│       └── Presents Menu Interface
│
├── modules/
│   ├── decision_core.py             [Core Controller]
│   │   ├── State Management
│   │   ├── Menu Processing
│   │   └── Module Orchestration
│   │
│   ├── audit_fmea.py                [FMEA Auditor]
│   │   └── Failure Mode Analysis
│   │
│   ├── asog_review.py               [ASOG Review]
│   │   └── Operational Goals Assessment
│   │
│   └── forecast_risk.py             [Risk Forecast]
│       └── Risk Analysis & Prediction
│
└── core/
    ├── logger.py                    [Event Logging]
    │   └── Centralized logging to file
    │
    ├── pdf_exporter.py              [PDF Generation]
    │   └── Report export functionality
    │
    └── sgso_connector.py            [SGSO Integration]
        └── Safety Management System connector
```

## Module Flow Diagram

```
                    ┌───────────┐
                    │  main.py  │
                    └─────┬─────┘
                          │
                    ┌─────▼──────┐
                    │ Decision   │
                    │   Core     │
                    └─────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │  Option │      │  Option │      │  Option │
   │    1-3  │      │    4    │      │  Logger │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │ Direct  │      │  Menu   │      │  State  │
   │ Action  │      │ Modules │      │  Save   │
   └─────────┘      └────┬────┘      └─────────┘
                         │
               ┌─────────┴─────────┐
               │                   │
          ┌────▼────┐         ┌────▼────┐
          │  ASOG   │         │  Risk   │
          │ Review  │         │Forecast │
          └─────────┘         └─────────┘
```

## Data Flow

```
┌──────────────┐
│ User Input   │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│ Decision     │─────▶│ Logger       │─────▶ nautilus_logs.txt
│ Core         │      │ (Event Log)  │
└──────┬───────┘      └──────────────┘
       │
       ▼
┌──────────────┐
│ Execute      │
│ Module       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Save State   │─────────────────────▶ nautilus_state.json
└──────────────┘
```

## State Persistence Model

```json
{
  "ultima_acao": "string",      // Last action performed
  "timestamp": "ISO-8601"        // When it was performed
}
```

## Event Logging Format

```
[YYYY-MM-DD HH:MM:SS.ffffff] Event description
```

## Module Responsibilities

### DecisionCore (`modules/decision_core.py`)
- 🎯 Central command & control
- 📊 State management
- 🔀 Module routing
- 📝 Action logging

### FMEAAuditor (`modules/audit_fmea.py`)
- 🔍 Technical audits
- ⚠️ Failure mode analysis
- ✅ Compliance checking

### ASOGModule (`modules/asog_review.py`)
- 📋 ASOG review process
- 🎯 Operational goals assessment
- 📈 Performance evaluation

### RiskForecast (`modules/forecast_risk.py`)
- 📊 Risk analysis
- 🔮 Predictive modeling
- ⚡ Risk forecasting

### Logger (`core/logger.py`)
- 📝 Event tracking
- 🕒 Timestamp recording
- 📂 File-based persistence

### PDFExporter (`core/pdf_exporter.py`)
- 📄 PDF generation
- 📋 Report formatting
- 💾 Export functionality

### SGSOClient (`core/sgso_connector.py`)
- 🔗 SGSO integration
- 📡 Data synchronization
- 🔐 Secure connections

## Extension Points

### Adding New Modules

1. Create module file in `modules/`
2. Import in `decision_core.py`
3. Add menu option
4. Implement logging
5. Test integration

### Example Template

```python
from core.logger import log_event

class NewModule:
    def execute(self):
        log_event("Starting NewModule")
        # Your logic here
        print("✅ Module completed")
        log_event("NewModule completed")
```

## Security Considerations

- ✅ No hardcoded credentials
- ✅ State file is JSON (human-readable)
- ✅ Logs are append-only
- ✅ No external dependencies currently
- ✅ .gitignore excludes sensitive files

## Performance Characteristics

- ⚡ Fast startup (<100ms)
- 💾 Minimal memory footprint
- 📁 Small state files (<1KB)
- 🔄 Efficient file I/O
- 🎯 Single-threaded (appropriate for use case)

## Integration Points

### With TypeScript/React Frontend
- Could expose REST API
- Could provide CLI commands
- State files readable by Node.js

### With Supabase Backend
- Can integrate with PostgreSQL
- Can call Edge Functions
- Can read/write data

## Future Enhancements

- [ ] REST API wrapper
- [ ] WebSocket support for real-time updates
- [ ] Database integration
- [ ] Advanced PDF generation
- [ ] Email notifications
- [ ] Scheduled tasks (cron)
- [ ] Multi-user support
- [ ] Audit trail with user tracking
