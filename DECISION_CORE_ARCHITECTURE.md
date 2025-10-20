# Decision Core - Technical Architecture

## System Overview

The Decision Core is a Python-based command center that orchestrates operational modules for Nautilus One. It acts as the "brain" of the system, interpreting operator commands and executing appropriate modules while maintaining state persistence and comprehensive logging.

## Architecture Layers

### 1. Presentation Layer (CLI)

**main.py** - Interactive command-line interface
- ASCII art banner with system branding
- Menu-driven navigation (6 operational modes)
- Error handling with graceful degradation
- User interruption handling (Ctrl+C)

### 2. Orchestration Layer

**modules/decision_core.py** - DecisionCore class
- Central controller for all operations
- State management via JSON persistence
- Event logging integration
- Module routing and execution
- Context restoration across sessions

Key responsibilities:
- Present interactive menu to operators
- Route requests to appropriate modules
- Maintain audit trail of all actions
- Persist system state (`nautilus_state.json`)
- Enable PDF/TXT export workflows

### 3. Core Services Layer

Reusable utilities shared across all modules:

#### Logger (`core/logger.py`)
```python
class Logger:
    - ISO 8601 timestamp formatting
    - UTF-8 encoding support
    - Append-only log file (nautilus_logs.txt)
    - Multiple severity levels (INFO, WARNING, ERROR, DEBUG)
```

#### PDF Exporter (`core/pdf_exporter.py`)
```python
class PDFExporter:
    - JSON report detection and parsing
    - Automatic format conversion (JSON → TXT → PDF)
    - UTF-8 encoding for international characters
    - Configurable output paths
```

#### SGSO Connector (`core/sgso_connector.py`)
```python
class SGSOConnector:
    - Connection state management
    - Real-time log synchronization
    - Data send/receive operations
    - Session lifecycle management
```

### 4. Analysis Modules Layer

Specialized modules for operational decision-making:

#### FMEA Auditor (`modules/audit_fmea.py`)
```python
def run_fmea_audit() -> dict:
    """
    Failure Mode and Effects Analysis
    
    Analyzes: 12 critical system components
    Categories: Operational, Equipment, Human, Environmental
    Formula: RPN = Severity × Occurrence × Detection (scale 1-10)
    
    Risk Classification:
    - Critical: RPN ≥ 200 (immediate action required)
    - High: RPN ≥ 100 (action within 24h)
    - Medium: RPN ≥ 50 (action within 1 week)
    - Low: RPN < 50 (monitor)
    
    Output:
    {
        "failure_modes": [...],
        "summary": {
            "total": 12,
            "critico": 2,
            "alto": 6,
            "medio": 4
        },
        "recommendations": [...]
    }
    """
```

#### ASOG Reviewer (`modules/asog_review.py`)
```python
def run_asog_review() -> dict:
    """
    Assessment of Safety and Operational Goals
    
    Evaluates: 8 operational areas
    - Emergency procedures
    - Safety protocols
    - Training programs
    - PPE compliance
    - Equipment inspections
    - Documentation
    - Maintenance schedules
    - Regulatory compliance
    
    Scoring: 0-10 per area
    Status: Conforme ✅ / Requer atenção ⚠️
    
    Output:
    {
        "items": [...],
        "compliance": {
            "taxa_conformidade": 90.0,  # percentage
            "areas_conforme": 7,
            "areas_atencao": 1
        },
        "recommendations": [...]
    }
    """
```

#### Risk Forecaster (`modules/forecast_risk.py`)
```python
def run_risk_forecast(timeframe: int = 30) -> dict:
    """
    Predictive Risk Analysis
    
    Analyzes: 7 risk categories
    - Weather conditions
    - Technical failures
    - Human resources
    - Compliance issues
    - Logistics challenges
    - Safety incidents
    - Operational disruptions
    
    Timeframe: Configurable (default 30 days)
    Calculation: Probability × Impact (scale 1-5)
    
    Risk Matrix:
    🔴 Critical: Score ≥ 20
    🟠 High: Score ≥ 12
    🟡 Medium: Score ≥ 6
    🟢 Low: Score < 6
    
    Output:
    {
        "risk_categories": [...],
        "risk_matrix": {
            "critico": [...],
            "alto": [...],
            "medio": [...],
            "baixo": [...]
        },
        "recommendations": [...]
    }
    """
```

## Data Flow

```
Operator Input (CLI)
        ↓
   main.py
        ↓
DecisionCore.processar_decisao()
        ↓
    ┌───┴────┬────────┬───────────┐
    ↓        ↓        ↓           ↓
  FMEA     ASOG    Forecast    Export
  Audit    Review             to PDF
    ↓        ↓        ↓           ↓
  Results  Results  Results    File
    ↓        ↓        ↓           ↓
    └────────┴────────┴───────────┘
              ↓
      State Persistence
    (nautilus_state.json)
              ↓
         Event Log
    (nautilus_logs.txt)
```

## State Management

### State File Structure
```json
{
  "ultima_acao": "Exportar PDF",
  "timestamp": "2025-10-20T14:03:41.492Z",
  "modulo_anterior": "FMEA Audit",
  "sessao_id": "uuid-string"
}
```

### State Lifecycle
1. **Initialization**: Load existing state or create new
2. **Execution**: Update state after each action
3. **Persistence**: Write state to JSON file
4. **Restoration**: Read state on next session start

## Logging Strategy

### Log Format
```
[ISO8601_TIMESTAMP] [LEVEL] Message
```

Example:
```
[2025-10-20T14:03:41.492Z] [INFO] Decision Core initialized
[2025-10-20T14:03:42.123Z] [INFO] Executing FMEA audit
[2025-10-20T14:03:43.456Z] [INFO] FMEA audit completed: 12 failure modes identified
```

### Log Levels
- **INFO**: Normal operations (module execution, state changes)
- **WARNING**: Potential issues (missing files, deprecated features)
- **ERROR**: Failures (module errors, file I/O issues)
- **DEBUG**: Development information (variable states, execution paths)

## Integration Points

### Frontend Integration
The Decision Core can be integrated with the TypeScript/React frontend via:

1. **REST API Wrapper**: Create FastAPI endpoints that call Decision Core modules
2. **Subprocess Execution**: Execute main.py via child_process from Node.js
3. **WebSocket Communication**: Real-time bidirectional communication
4. **File-based Integration**: Frontend reads generated JSON/PDF reports

### Database Integration
State and results can be persisted to Supabase:

1. **State Table**: Store `nautilus_state.json` data
2. **Logs Table**: Store `nautilus_logs.txt` entries
3. **Reports Table**: Store generated reports with metadata
4. **Audit Trail**: Complete traceability of all operations

## Security Considerations

### Input Validation
- All user inputs sanitized before module execution
- Path traversal prevention in file operations
- SQL injection prevention (when integrated with DB)

### File System Access
- Restricted to designated output directories
- No arbitrary file read/write operations
- Generated files use predictable naming patterns

### Error Handling
- Exceptions caught and logged
- Graceful degradation on module failures
- No sensitive data in error messages

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Startup Time | < 1 second | Cold start |
| Memory Usage | ~30 MB | All modules loaded |
| FMEA Execution | < 2 seconds | 12 failure modes |
| ASOG Execution | < 1 second | 8 operational areas |
| Forecast Execution | < 3 seconds | 30-day prediction |
| State Write | < 10 ms | JSON serialization |
| Log Append | < 5 ms | Single line write |

## Extensibility

### Adding New Modules

1. Create module file in `modules/`:
```python
# modules/new_module.py

def run_new_analysis() -> dict:
    """Your analysis logic"""
    return {"results": "data"}
```

2. Import in `decision_core.py`:
```python
from modules.new_module import run_new_analysis
```

3. Add menu option in `DecisionCore.processar_decisao()`:
```python
print("6. 🆕 New Analysis Module")
# ... handle user selection
```

4. Create unit tests in `test_decision_core.py`:
```python
class TestNewModule(unittest.TestCase):
    def test_execution(self):
        result = run_new_analysis()
        self.assertIn("results", result)
```

## Design Patterns

### Singleton Pattern
- Logger instance shared across modules
- Single source of truth for event logging

### Factory Pattern
- Module creation based on user selection
- Dynamic routing to appropriate analysis function

### Strategy Pattern
- Different analysis strategies (FMEA, ASOG, Forecast)
- Interchangeable algorithms with common interface

### Observer Pattern
- State changes logged automatically
- Audit trail maintained transparently

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Python | 3.12+ |
| Stdlib | json, datetime, os, pathlib | Built-in |
| Testing | unittest | Built-in |
| CLI | input(), print() | Built-in |
| Encoding | UTF-8 | Universal |

## Production Deployment

### Requirements
- Python 3.8+ installed
- Write access to working directory
- ~100MB disk space for logs/reports

### Environment Variables
```bash
# Optional configuration
export NAUTILUS_LOG_LEVEL=INFO
export NAUTILUS_LOG_FILE=nautilus_logs.txt
export NAUTILUS_STATE_FILE=nautilus_state.json
```

### System Service (systemd)
```ini
[Unit]
Description=Nautilus One Decision Core
After=network.target

[Service]
Type=simple
User=nautilus
WorkingDirectory=/opt/nautilus-one
ExecStart=/usr/bin/python3 /opt/nautilus-one/main.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Docker Deployment
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
CMD ["python3", "main.py"]
```

## Monitoring

### Health Checks
- Verify `nautilus_logs.txt` is being updated
- Check `nautilus_state.json` timestamp
- Monitor disk space for generated reports

### Metrics to Track
- Module execution count
- Average execution time per module
- Error rate
- State persistence failures
- Log file size growth

## Future Enhancements

1. **Web UI**: Replace CLI with web-based dashboard
2. **Real-time Analytics**: Stream analysis results to frontend
3. **Machine Learning**: Predictive models for risk forecasting
4. **Multi-language Support**: i18n for international operations
5. **Cloud Storage**: Store reports in S3/Azure Blob
6. **Email Notifications**: Alert stakeholders of critical findings
7. **Mobile App**: iOS/Android interface for Decision Core
8. **API Gateway**: RESTful API with authentication/authorization

## License

MIT — © 2025 Nautilus One
