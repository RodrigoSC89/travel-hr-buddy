# Decision Core - Technical Architecture

## System Overview

Decision Core is a modular Python application designed following clean architecture principles with clear separation of concerns, dependency injection, and extensibility as core design tenets.

## Architectural Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│         (main.py, CLI)                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       Application Layer                 │
│    (DecisionCore Controller)            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        Domain Layer                     │
│   (Business Logic Modules)              │
│   FMEA, ASOG, Forecast, etc.            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│     Infrastructure Layer                │
│  (Logger, PDF Export, SGSO)             │
└─────────────────────────────────────────┘
```

### 2. Dependency Injection

All modules accept dependencies through constructor injection:

```python
class DecisionCore:
    def __init__(self):
        self.logger = Logger()
        self.pdf_exporter = PDFExporter(logger=self.logger)
        self.fmea_auditor = FMEAAuditor(logger=self.logger)
        # ...
```

Benefits:
- Loose coupling between components
- Easy testing with mock objects
- Flexibility to swap implementations

### 3. Single Responsibility Principle

Each module has a single, well-defined responsibility:

- **Logger**: Event logging only
- **PDFExporter**: PDF generation only
- **SGSOConnector**: SGSO integration only
- **FMEAAuditor**: FMEA analysis only
- **ASOGReview**: ASOG assessment only
- **RiskForecast**: Risk prediction only
- **DecisionCore**: Orchestration only

## Component Architecture

### Core Components

#### 1. Logger (`core/logger.py`)

**Responsibility**: Event logging with timestamps

**Key Features**:
- File-based append-only logging
- Console output mirroring
- UTF-8 encoding support
- Timestamp formatting (ISO 8601)

**Design Decisions**:
- Simple text file format for easy parsing
- Append-only for audit trail integrity
- No log rotation (manual or external tool)

**API**:
```python
logger = Logger(log_file="nautilus_logs.txt")
logger.log("Event message")
logs = logger.get_logs()
```

#### 2. PDF Exporter (`core/pdf_exporter.py`)

**Responsibility**: Convert JSON reports to PDF

**Key Features**:
- JSON report parsing
- Text-based PDF generation
- Error handling for missing files
- Timestamp inclusion

**Design Decisions**:
- Simplified PDF generation (text-based)
- Could be extended to use libraries like ReportLab or WeasyPrint
- Current implementation prioritizes zero dependencies

**API**:
```python
exporter = PDFExporter(logger=logger)
pdf_path = exporter.export_report("report.json")
```

**Extension Points**:
```python
# Future: Use proper PDF library
from reportlab.pdfgen import canvas

def _generate_pdf_content(self, data):
    # Generate actual PDF with formatting, images, tables
    pass
```

#### 3. SGSO Connector (`core/sgso_connector.py`)

**Responsibility**: Integration with SGSO

**Key Features**:
- Connection management
- Log synchronization
- Connection state tracking
- Error handling

**Design Decisions**:
- Stateful connection management
- Simulated connection (stub for real implementation)
- Ready for actual SGSO API integration

**API**:
```python
connector = SGSOConnector(logger=logger)
connector.connect()
connector.sync_logs()
connector.disconnect()
```

**Extension Points**:
```python
# Future: Real SGSO integration
import requests

def connect(self):
    response = requests.post(
        "https://sgso.api/connect",
        auth=(username, password)
    )
    # Handle authentication, tokens, etc.
```

### Operational Modules

#### 1. FMEA Auditor (`modules/audit_fmea.py`)

**Responsibility**: Failure Mode and Effects Analysis

**Architecture**:
```
run_audit()
    ↓
_analyze_failure_modes()
    ↓
_generate_recommendations()
    ↓
Save JSON report
```

**Data Model**:
```python
{
    "id": int,
    "componente": str,
    "modo_falha": str,
    "efeito": str,
    "severidade": int (1-10),
    "ocorrencia": int (1-10),
    "deteccao": int (1-10),
    "rpn": int (calculated),
    "criticidade": str (Alta/Média/Baixa)
}
```

**RPN Calculation**:
```
RPN = Severidade × Ocorrência × Detecção
```

**Criticality Levels**:
- Alta (High): RPN ≥ 100
- Média (Medium): 50 ≤ RPN < 100
- Baixa (Low): RPN < 50

**Extension Points**:
- Add real component data integration
- Implement historical trend analysis
- Add machine learning for failure prediction

#### 2. ASOG Review (`modules/asog_review.py`)

**Responsibility**: Assessment of Operational Goals

**Architecture**:
```
run_review()
    ↓
_assess_operational_goals()
    ↓
_generate_asog_recommendations()
    ↓
Save JSON report
```

**Data Model**:
```python
{
    "area": str,
    "meta": str,
    "status_atual": str,
    "conforme": bool,
    "score": int (0-100),
    "observacoes": str
}
```

**Compliance Calculation**:
```
Compliance % = Average of all area scores
```

**Assessment Areas** (8 categories):
1. Operational Safety
2. Fuel Efficiency
3. Equipment Availability
4. Environmental Compliance
5. Crew Training
6. Emergency Response Time
7. Preventive Maintenance
8. Operational Documentation

**Extension Points**:
- Connect to real operational data sources
- Add trend analysis over time
- Implement benchmarking against industry standards

#### 3. Risk Forecast (`modules/forecast_risk.py`)

**Responsibility**: Operational risk analysis and prediction

**Architecture**:
```
run_forecast()
    ↓
_analyze_risks()
    ↓
_generate_risk_recommendations()
    ↓
Save JSON report
```

**Data Model**:
```python
{
    "id": int,
    "categoria": str,
    "descricao": str,
    "probabilidade": int (0-100),
    "impacto": int (0-100),
    "nivel": str (Crítico/Alto/Médio/Baixo),
    "data_prevista": str (ISO date),
    "mitigacao_atual": str,
    "status": str
}
```

**Risk Level Calculation**:
```python
def calculate_risk_level(probability, impact):
    score = (probability * impact) / 100
    if score >= 70: return "Crítico"
    if score >= 50: return "Alto"
    if score >= 30: return "Médio"
    return "Baixo"
```

**Risk Categories** (7 types):
1. Meteorológico (Weather)
2. Operacional (Operational)
3. Técnico (Technical)
4. Recursos Humanos (HR)
5. Compliance
6. Logística (Logistics)
7. Segurança (Safety)

**Forecast Horizon**: 30 days (configurable)

**Extension Points**:
- Integrate weather API for real forecasts
- Add historical data analysis
- Implement Monte Carlo simulation for risk scenarios

### Controller

#### Decision Core (`modules/decision_core.py`)

**Responsibility**: Orchestration and coordination

**Architecture**:
```
DecisionCore
    ├── Component Management
    │   ├── Logger
    │   ├── PDFExporter
    │   ├── SGSOConnector
    │   ├── FMEAAuditor
    │   ├── ASOGReview
    │   └── RiskForecast
    ├── State Management
    │   ├── save_state()
    │   └── load_state()
    ├── Menu System
    │   ├── show_menu()
    │   └── show_submodule_menu()
    └── Module Execution
        ├── export_pdf()
        ├── run_fmea_audit()
        ├── connect_sgso()
        ├── run_asog_review()
        └── run_risk_forecast()
```

**State Management**:
- JSON-based persistence
- Atomic writes (replace entire file)
- Minimal state (last action + timestamp)

**Design Pattern**: Facade Pattern
- Provides simplified interface to complex subsystem
- Coordinates multiple modules
- Manages module lifecycle

## Data Flow

### Standard Operation Flow

```
User Input
    ↓
Menu Selection (main.py)
    ↓
DecisionCore Method Call
    ↓
Module Execution (FMEA/ASOG/Forecast)
    ↓
├── Log Events (Logger)
├── Generate Report (JSON)
├── Export PDF (PDFExporter)
└── Save State (DecisionCore)
    ↓
Return to Menu
```

### State Persistence Flow

```
Operation Completion
    ↓
DecisionCore.save_state()
    ↓
Create State Object
    {
        "ultima_acao": "Action Name",
        "timestamp": "ISO-8601"
    }
    ↓
Write to nautilus_state.json
    ↓
Log State Update
```

### Report Generation Flow

```
Module.run_*()
    ↓
Analyze Data
    ↓
Generate Results Object
    ↓
Save JSON Report
    {
        "tipo": "Report Type",
        "timestamp": "ISO-8601",
        "data": { ... },
        "recomendacoes": [ ... ]
    }
    ↓
Return Results
```

## File System Organization

```
project_root/
├── main.py                         # Entry point
├── requirements.txt                # Dependencies (empty - stdlib only)
├── .gitignore                      # Excludes Python cache & generated files
│
├── core/                           # Infrastructure layer
│   ├── __init__.py
│   ├── logger.py                   # ~50 lines
│   ├── pdf_exporter.py             # ~90 lines
│   └── sgso_connector.py           # ~80 lines
│
├── modules/                        # Domain layer
│   ├── __init__.py
│   ├── decision_core.py            # ~200 lines (controller)
│   ├── audit_fmea.py               # ~220 lines
│   ├── asog_review.py              # ~180 lines
│   └── forecast_risk.py            # ~200 lines
│
└── Generated Files (gitignored)
    ├── nautilus_state.json         # System state
    ├── nautilus_logs.txt           # Event log
    ├── relatorio_fmea_*.json       # FMEA reports
    ├── relatorio_asog_*.json       # ASOG reports
    ├── relatorio_forecast_*.json   # Forecast reports
    └── relatorio_*.pdf             # PDF exports
```

## Design Principles Applied

### 1. SOLID Principles

**Single Responsibility**: Each class has one reason to change
**Open/Closed**: Modules open for extension, closed for modification
**Liskov Substitution**: Not heavily applicable (limited inheritance)
**Interface Segregation**: Minimal, focused interfaces
**Dependency Inversion**: Depend on abstractions (logger interface)

### 2. DRY (Don't Repeat Yourself)

- Common logging pattern abstracted to Logger class
- Report generation follows consistent pattern
- State management centralized in DecisionCore

### 3. KISS (Keep It Simple, Stupid)

- No unnecessary complexity
- Standard library only (zero external dependencies)
- Clear, readable code structure
- Straightforward data formats (JSON)

### 4. YAGNI (You Aren't Gonna Need It)

- No premature optimization
- No unused features
- Simple implementations that work
- Extension points identified but not implemented

## Extension Patterns

### Adding New Operational Module

```python
# 1. Create new module file
# modules/new_analysis.py

class NewAnalysis:
    """New operational analysis module"""
    
    def __init__(self, logger=None):
        self.logger = logger
    
    def run_analysis(self):
        """Execute analysis"""
        if self.logger:
            self.logger.log("Starting new analysis...")
        
        # Analysis logic
        results = self._analyze()
        
        # Save report
        report_file = f"relatorio_new_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        return results
    
    def _analyze(self):
        """Implement analysis logic"""
        return {"tipo": "New Analysis", "data": {}}

# 2. Integrate in DecisionCore
# modules/decision_core.py

from modules.new_analysis import NewAnalysis

class DecisionCore:
    def __init__(self):
        # ... existing code ...
        self.new_analysis = NewAnalysis(logger=self.logger)
    
    def run_new_analysis(self):
        """Run new analysis module"""
        self.logger.log("=== Módulo: New Analysis ===")
        results = self.new_analysis.run_analysis()
        self.save_state("New Analysis")
        return results

# 3. Add menu option
# main.py or decision_core.py

def show_menu(self):
    # ... existing menu ...
    print("6. 🆕 Run New Analysis")
    # ...
```

### Adding External Dependencies

If external libraries become necessary:

```python
# requirements.txt
reportlab==4.0.0  # For advanced PDF generation
requests==2.31.0   # For SGSO API integration
pandas==2.1.0      # For data analysis

# Update installation instructions
pip install -r requirements.txt
```

### Database Integration

For persistent storage beyond JSON:

```python
# core/database.py

import sqlite3

class Database:
    def __init__(self, db_file="nautilus.db"):
        self.db_file = db_file
        self.conn = None
    
    def connect(self):
        self.conn = sqlite3.connect(self.db_file)
        self._init_schema()
    
    def _init_schema(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY,
                type TEXT,
                timestamp TEXT,
                data TEXT
            )
        """)
        self.conn.commit()
    
    def save_report(self, report_type, data):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO reports (type, timestamp, data) VALUES (?, ?, ?)",
            (report_type, datetime.now().isoformat(), json.dumps(data))
        )
        self.conn.commit()
```

## Performance Considerations

### Current Performance Characteristics

- **Startup Time**: < 1 second (Python interpreter + module loading)
- **Module Execution**: < 5 seconds (mostly I/O bound - file writes)
- **Memory Usage**: < 50 MB (minimal data structures)
- **Disk I/O**: Minimal (small JSON files)

### Optimization Opportunities

1. **Lazy Loading**: Load modules only when needed
2. **Async I/O**: Use `asyncio` for concurrent operations
3. **Caching**: Cache frequently accessed data
4. **Batch Processing**: Process multiple reports in one operation

### Scalability Considerations

Current design is suitable for:
- ✅ Single-user, local execution
- ✅ Moderate report volume (< 1000/day)
- ✅ Small to medium data sets

For enterprise scale, consider:
- Database backend instead of JSON files
- REST API for remote access
- Message queue for async processing
- Docker containerization

## Security Architecture

### Current Security Measures

1. **File Permissions**: Relies on OS file permissions
2. **Input Validation**: Minimal (trusted operator input)
3. **Error Handling**: Prevents stack traces in logs
4. **Data Encoding**: UTF-8 throughout

### Security Enhancements

For production deployment:

```python
# 1. Add authentication
class DecisionCore:
    def __init__(self, user_credentials):
        if not self._authenticate(user_credentials):
            raise PermissionError("Authentication failed")

# 2. Encrypt sensitive data
import cryptography
from cryptography.fernet import Fernet

def save_report(self, data, encrypt=True):
    if encrypt:
        cipher = Fernet(encryption_key)
        data = cipher.encrypt(json.dumps(data).encode())

# 3. Add audit logging
def audit_log(self, user, action, result):
    log_entry = {
        "user": user,
        "action": action,
        "result": result,
        "timestamp": datetime.now().isoformat(),
        "ip_address": get_client_ip()
    }
    # Write to secure audit log

# 4. Rate limiting
from functools import wraps
import time

def rate_limit(max_calls, period):
    def decorator(func):
        calls = []
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            calls[:] = [c for c in calls if c > now - period]
            if len(calls) >= max_calls:
                raise Exception("Rate limit exceeded")
            calls.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

## Testing Strategy

### Unit Testing

```python
# tests/test_logger.py

import unittest
from core.logger import Logger

class TestLogger(unittest.TestCase):
    def setUp(self):
        self.logger = Logger(log_file="test_logs.txt")
    
    def tearDown(self):
        os.remove("test_logs.txt")
    
    def test_log_message(self):
        self.logger.log("Test message")
        logs = self.logger.get_logs()
        self.assertIn("Test message", logs)
```

### Integration Testing

```python
# tests/test_decision_core.py

class TestDecisionCore(unittest.TestCase):
    def test_fmea_audit_generates_report(self):
        dc = DecisionCore()
        result = dc.run_fmea_audit()
        self.assertIsNotNone(result)
        self.assertEqual(result["tipo"], "FMEA Audit")
```

### End-to-End Testing

```python
# tests/test_e2e.py

def test_full_workflow():
    # Start Decision Core
    dc = DecisionCore()
    
    # Run FMEA
    fmea_result = dc.run_fmea_audit()
    assert fmea_result is not None
    
    # Export PDF
    pdf_success = dc.export_pdf()
    assert pdf_success is True
    
    # Verify state
    state = dc.load_state()
    assert state["ultima_acao"] == "Exportar PDF"
```

## Deployment Architecture

### Local Deployment

```bash
# Simple execution
python3 main.py

# Background execution
nohup python3 main.py &

# Scheduled execution (cron)
# Run FMEA audit daily at 2 AM
0 2 * * * cd /path/to/decision-core && python3 -c "from modules.decision_core import DecisionCore; DecisionCore().run_fmea_audit()"
```

### Container Deployment

```dockerfile
# Dockerfile

FROM python:3.12-slim

WORKDIR /app

COPY . /app

CMD ["python3", "main.py"]
```

```bash
# Build and run
docker build -t decision-core .
docker run -it decision-core
```

### Service Deployment

```ini
# decision-core.service (systemd)

[Unit]
Description=Nautilus One Decision Core
After=network.target

[Service]
Type=simple
User=nautilus
WorkingDirectory=/opt/decision-core
ExecStart=/usr/bin/python3 /opt/decision-core/main.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Monitoring and Observability

### Logging Levels

Enhance logger with levels:

```python
class Logger:
    LEVELS = {"DEBUG": 0, "INFO": 1, "WARNING": 2, "ERROR": 3}
    
    def __init__(self, log_file, level="INFO"):
        self.level = self.LEVELS[level]
    
    def log(self, message, level="INFO"):
        if self.LEVELS[level] >= self.level:
            # Log message
            pass
```

### Metrics Collection

```python
# core/metrics.py

class Metrics:
    def __init__(self):
        self.counters = {}
        self.timers = {}
    
    def increment(self, metric):
        self.counters[metric] = self.counters.get(metric, 0) + 1
    
    def time(self, metric):
        # Context manager for timing operations
        pass
    
    def report(self):
        return {
            "counters": self.counters,
            "timers": self.timers
        }
```

## Version History

### Version 1.0.0 (Current)

- Initial release
- Core modules: FMEA, ASOG, Forecast
- CLI interface
- State persistence
- Event logging
- Zero external dependencies

### Future Versions

**v1.1.0** (Planned)
- Web API interface (Flask/FastAPI)
- Database backend
- User authentication
- Advanced PDF generation

**v1.2.0** (Planned)
- Real-time dashboards
- WebSocket support
- Multi-user support
- Role-based access control

**v2.0.0** (Future)
- Machine learning integration
- Predictive analytics
- Mobile app support
- Cloud deployment

## Conclusion

Decision Core follows modern software architecture principles while maintaining simplicity and extensibility. The modular design, clear separation of concerns, and well-defined interfaces make it easy to understand, extend, and maintain.

The architecture is production-ready for local deployment and provides clear extension points for future enhancements such as database integration, API interfaces, and advanced analytics capabilities.
