# 🏗️ Decision Core - Technical Architecture

## System Overview

The Decision Core is designed as a modular, extensible Python-based command center for Nautilus One. It follows a clean architecture pattern with clear separation of concerns and dependency injection.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         main.py                              │
│                    (Entry Point)                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    DecisionCore                              │
│                 (Main Controller)                            │
│  - State Management                                          │
│  - Module Orchestration                                      │
│  - Interactive Menu                                          │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐
│Logger│  │ PDF  │  │SGSO  │  │FMEA  │  │Sub-Modules│
│      │  │Export│  │Conn. │  │Audit │  │          │
└──────┘  └──────┘  └──────┘  └──────┘  └─┬────┬───┘
                                           │    │
                                           ▼    ▼
                                        ┌────┐┌────┐
                                        │ASOG││Risk│
                                        │Rev.││Fcst│
                                        └────┘└────┘
```

## Design Patterns

### 1. Dependency Injection
All modules receive the logger instance as a dependency, allowing for centralized logging and easy testing.

```python
class Module:
    def __init__(self, logger=None):
        self.logger = logger
```

### 2. Single Responsibility Principle
Each module has a single, well-defined responsibility:
- **Logger**: Event logging only
- **PDFExporter**: PDF generation only
- **SGSOConnector**: SGSO integration only
- etc.

### 3. Open/Closed Principle
The system is open for extension but closed for modification. New modules can be added without changing existing code.

### 4. Strategy Pattern
Different operational strategies (FMEA, ASOG, Risk Forecast) can be selected and executed through the DecisionCore controller.

## Core Components

### 1. Entry Point (main.py)

**Responsibilities:**
- Initialize the Decision Core
- Start the main loop
- Handle graceful shutdown

**Design Decisions:**
- Simple, minimal entry point
- No business logic
- Easy to test and replace

### 2. Decision Core (modules/decision_core.py)

**Responsibilities:**
- Module orchestration
- State management
- User interaction (menu system)
- Operation routing

**Key Methods:**
- `show_menu()`: Display interactive menu
- `run()`: Main execution loop
- `save_state()`: Persist system state
- `load_state()`: Restore previous state

**Design Decisions:**
- Centralized control
- Loose coupling with modules
- State persistence for continuity
- Clear separation of concerns

### 3. Logger (core/logger.py)

**Responsibilities:**
- Event logging with timestamps
- File-based persistence
- Console output

**Features:**
- Automatic timestamp generation
- UTF-8 encoding support
- Append-only operation
- Simple, straightforward API

**Design Decisions:**
- Simple file-based logging
- No external dependencies
- Easily replaceable with more sophisticated solutions

### 4. PDF Exporter (core/pdf_exporter.py)

**Responsibilities:**
- Export reports to PDF format
- Handle JSON report parsing
- Generate timestamped filenames

**Design Decisions:**
- Currently uses text-based placeholder
- Designed for easy upgrade to proper PDF library
- Error handling for missing files
- JSON decoding error handling

**Future Enhancement:**
```python
# Can be upgraded to use reportlab or fpdf2
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
```

### 5. SGSO Connector (core/sgso_connector.py)

**Responsibilities:**
- Connect to SGSO systems
- Synchronize operational logs
- Maintain connection state

**Design Decisions:**
- Connection state management
- Graceful connection/disconnection
- Error handling for disconnected state
- Ready for real API integration

**Future Enhancement:**
```python
# Can be upgraded to use requests for real API calls
import requests

def connect(self, api_url, api_key):
    response = requests.post(f"{api_url}/connect", 
                            headers={"Authorization": f"Bearer {api_key}"})
    return response.status_code == 200
```

### 6. FMEA Auditor (modules/audit_fmea.py)

**Responsibilities:**
- Perform FMEA technical audits
- Identify failure modes
- Categorize by criticality
- Generate recommendations

**Output Structure:**
```python
{
    "tipo": "FMEA",
    "componentes_analisados": [...],
    "modos_falha_identificados": int,
    "criticidade_alta": int,
    "criticidade_media": int,
    "criticidade_baixa": int,
    "recomendacoes": [...],
    "status": str
}
```

### 7. ASOG Reviewer (modules/asog_review.py)

**Responsibilities:**
- Conduct operational goal assessments
- Evaluate compliance
- Identify non-conformities
- Generate action plans

**Output Structure:**
```python
{
    "tipo": "ASOG",
    "objetivos_avaliados": [...],
    "conformidade_geral": str,
    "areas_conformes": int,
    "areas_nao_conformes": int,
    "plano_acao_requerido": bool,
    "prazo_regularizacao": str,
    "observacoes": [...],
    "status": str
}
```

### 8. Risk Forecaster (modules/forecast_risk.py)

**Responsibilities:**
- Analyze operational risks
- Predict future scenarios
- Categorize risks
- Generate recommendations

**Output Structure:**
```python
{
    "tipo": "Forecast de Riscos",
    "periodo_analise": str,
    "riscos_identificados": [
        {
            "categoria": str,
            "risco": str,
            "probabilidade": str,
            "impacto": str,
            "nivel_risco": str
        }
    ],
    "recomendacoes": [...],
    "indice_risco_geral": str,
    "acao_imediata_requerida": bool,
    "status": str
}
```

## Data Flow

### 1. Startup Flow
```
main.py
  ↓
DecisionCore.__init__()
  ↓
Initialize all modules (Logger, PDFExporter, etc.)
  ↓
Load previous state (if exists)
  ↓
Display menu
```

### 2. Operation Flow
```
User selects option
  ↓
DecisionCore routes to appropriate method
  ↓
Method executes module
  ↓
Module logs operations
  ↓
Results saved to JSON file
  ↓
State updated and persisted
  ↓
Return to menu
```

### 3. State Persistence Flow
```
Operation completes
  ↓
save_state() called with action description
  ↓
State dictionary created with timestamp
  ↓
Written to nautilus_state.json
  ↓
Logger records state update
```

## State Management

### State File Structure
```json
{
  "ultima_acao": "Action description",
  "timestamp": "2025-10-20T01:05:42.167Z"
}
```

### State Operations
- **Save**: After every successful operation
- **Load**: At system startup
- **Format**: JSON for easy parsing and readability

## Logging Strategy

### Log Format
```
[YYYY-MM-DD HH:MM:SS] Message
```

### Log Levels
Currently uses single-level logging. Can be extended to:
- DEBUG
- INFO
- WARNING
- ERROR
- CRITICAL

### Log Destinations
- File: `nautilus_logs.txt` (persistent)
- Console: stdout (immediate feedback)

## Error Handling

### Current Approach
- Try-catch blocks for file operations
- Graceful degradation
- User-friendly error messages
- Logging of all errors

### Future Enhancements
- Custom exception classes
- Error recovery mechanisms
- Retry logic for transient failures
- Error notification system

## Extensibility Points

### Adding New Modules

1. **Create Module File**
```python
# modules/new_module.py
class NewModule:
    def __init__(self, logger=None):
        self.logger = logger
    
    def execute(self):
        # Implementation
        pass
```

2. **Import in DecisionCore**
```python
from modules.new_module import NewModule
```

3. **Initialize in __init__**
```python
self.new_module = NewModule(self.logger)
```

4. **Add Menu Option**
```python
print("6. 🆕 New Module")
```

5. **Implement Handler**
```python
def run_new_module(self):
    # Implementation
    pass
```

### Adding New Core Services

1. Create service in `core/` directory
2. Implement service class
3. Inject logger if needed
4. Import in DecisionCore
5. Initialize in __init__

## Performance Considerations

### Current State
- Synchronous operations
- File-based I/O
- Single-threaded execution
- Minimal memory footprint

### Optimization Opportunities
1. **Async Operations**: Use asyncio for concurrent operations
2. **Caching**: Cache frequently accessed data
3. **Batch Processing**: Process multiple operations together
4. **Database Integration**: Replace JSON files with database

## Security Considerations

### Current Implementation
- Local file system access only
- No network operations (placeholder for SGSO)
- No authentication/authorization
- UTF-8 encoding for internationalization

### Production Considerations
1. **Authentication**: Add user authentication
2. **Authorization**: Role-based access control
3. **Encryption**: Encrypt sensitive data
4. **Audit Trail**: Enhanced logging for compliance
5. **Input Validation**: Sanitize all user inputs

## Testing Strategy

### Unit Testing
```python
import unittest
from core.logger import NautilusLogger

class TestLogger(unittest.TestCase):
    def test_log_creation(self):
        logger = NautilusLogger("test.log")
        logger.log("Test message")
        # Assert log file exists and contains message
```

### Integration Testing
Test interaction between DecisionCore and modules

### End-to-End Testing
Test complete workflows through the menu system

## Future Enhancements

### Planned Features
1. **API Layer**: RESTful API for remote access
2. **Database Integration**: Replace JSON with proper database
3. **Real-time Updates**: WebSocket support for live updates
4. **Advanced PDF**: Full-featured PDF generation with charts
5. **Authentication**: User management and access control
6. **Scheduling**: Automated task scheduling
7. **Notifications**: Email/SMS alerts for critical events
8. **Dashboards**: Web-based monitoring dashboard

### Technology Upgrades
1. **PDF Generation**: reportlab or fpdf2
2. **Database**: SQLite, PostgreSQL, or MongoDB
3. **API Framework**: FastAPI or Flask
4. **Testing**: pytest with coverage reports
5. **Documentation**: Sphinx for auto-generated docs

## Integration with Nautilus One

### Current Architecture
```
Frontend (TypeScript/React)
    ↓
Backend (Supabase)
    ↓
Decision Core (Python) ← You are here
```

### Integration Points
1. **Data Exchange**: JSON files (current) → API calls (future)
2. **Authentication**: Shared auth system
3. **Logging**: Unified logging infrastructure
4. **State**: Shared state management

### API Integration Example (Future)
```python
# Potential API endpoint
@app.post("/api/decision-core/fmea-audit")
async def run_fmea_audit():
    core = DecisionCore()
    results = core.run_fmea_audit()
    return JSONResponse(content=results)
```

## Deployment Considerations

### Development
```bash
python3 main.py
```

### Production Options
1. **Systemd Service**: Run as background service
2. **Docker Container**: Containerized deployment
3. **Kubernetes**: Orchestrated deployment
4. **AWS Lambda**: Serverless execution

### Example Systemd Service
```ini
[Unit]
Description=Nautilus One Decision Core
After=network.target

[Service]
Type=simple
User=nautilus
WorkingDirectory=/opt/nautilus-one
ExecStart=/usr/bin/python3 main.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Conclusion

The Decision Core is designed as a robust, modular, and extensible system that can grow with the needs of Nautilus One. Its clean architecture and clear separation of concerns make it easy to understand, maintain, and extend.
