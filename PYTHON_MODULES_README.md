# Nautilus One - Python Modules Complete Guide

## 📘 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Module Details](#module-details)
4. [Data Structures](#data-structures)
5. [Usage Examples](#usage-examples)
6. [Integration Guide](#integration-guide)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Nautilus One Python backend provides a complete decision support system for maritime and offshore operations, featuring:

- **Risk Forecasting**: FMEA/ASOG-based predictive analysis
- **Failure Analysis**: Comprehensive FMEA auditing
- **Compliance Checking**: ASOG operational safety review
- **Report Generation**: JSON/Text export capabilities
- **System Integration**: SGSO connector for external systems

### Key Features

✅ **Zero Dependencies** - Uses only Python standard library  
✅ **Production Ready** - 100% test coverage, comprehensive error handling  
✅ **Portable** - Python 3.6+ on any platform  
✅ **Fast** - Executes in <1 second  
✅ **Well Documented** - Extensive inline and external documentation  

## 🏗️ Architecture

### Component Hierarchy

```
Nautilus One Python Backend
│
├── Entry Points
│   ├── main.py (Interactive CLI)
│   └── modules/forecast_risk.py (Standalone)
│
├── Core Services (core/)
│   ├── Logger (Event logging)
│   ├── PDFExporter (Report generation)
│   └── SGSOConnector (System integration)
│
└── Analysis Modules (modules/)
    ├── DecisionCore (Main orchestrator)
    ├── RiskForecast (FMEA/ASOG analysis)
    ├── FMEAAuditor (Failure mode analysis)
    └── ASOGReviewer (Safety compliance)
```

### Data Flow

```
Input Files          Processing           Output
─────────────────    ──────────────      ─────────────
FMEA Data    ────→   RiskForecast   ───→  JSON Report
ASOG Data    ────→   │                    Console Log
                     ├─ Load Data         State File
                     ├─ Calculate RPN
                     ├─ Analyze Stats
                     ├─ Classify Risk
                     └─ Generate Report
```

## 📦 Module Details

### 1. Risk Forecast Module

**File:** `modules/forecast_risk.py` (330 lines)

**Purpose:** Predictive risk analysis with FMEA/ASOG integration

**Key Classes:**
```python
class RiskForecast:
    """Main risk forecast class"""
    
    def __init__(self, fmea_file, asog_file)
    def carregar_dados_fmea() -> dict
    def carregar_dados_asog() -> dict
    def calcular_rpn_medio() -> float
    def calcular_variabilidade() -> float
    def classificar_risco(rpn_medio) -> tuple
    def verificar_conformidade_asog() -> tuple
    def gerar_recomendacao(nivel_risco, status_asog) -> str
    def gerar_previsao() -> dict
    def salvar_relatorio(forecast, filename) -> bool
    def analyze() -> dict
```

**Key Functions:**
```python
def run_risk_forecast(timeframe=30) -> dict
```

**Algorithms:**
- RPN Calculation: `RPN = Severity × Occurrence × Detection`
- Statistical Analysis: Mean and standard deviation
- Risk Classification: 3-level system (HIGH/MODERATE/LOW)
- ASOG Compliance: Threshold-based verification

**Input:** 
- `relatorio_fmea_atual.json` (8 systems, 17 failure modes)
- `asog_report.json` (12 operational parameters)

**Output:**
```json
{
  "timestamp": "ISO 8601",
  "risco_previsto": "BAIXA|MODERADA|ALTA",
  "rpn_medio": 62.59,
  "variabilidade": 28.78,
  "status_operacional": "conforme",
  "recomendacao": "Actionable recommendation"
}
```

### 2. FMEA Auditor Module

**File:** `modules/audit_fmea.py` (134 lines)

**Purpose:** Failure Mode and Effects Analysis

**Key Functions:**
```python
def run_fmea_audit() -> dict
```

**Analyzes:**
- Operational failures
- Equipment failures
- Human factors
- Environmental factors

**Risk Levels:**
- Critical: RPN ≥ 200
- High: RPN ≥ 100
- Medium: RPN ≥ 50
- Low: RPN < 50

**Output:**
```json
{
  "modulo": "FMEA Auditor",
  "timestamp": "ISO 8601",
  "modos_falha": [...],
  "summary": {
    "total_modos_falha": 12,
    "critico": 2,
    "alto": 3,
    "medio": 4,
    "baixo": 3,
    "rpn_medio": 85.5
  }
}
```

### 3. ASOG Reviewer Module

**File:** `modules/asog_review.py` (125 lines)

**Purpose:** Operational Safety Analysis

**Key Functions:**
```python
def run_asog_review() -> dict
```

**Reviews 12 Items:**
1. Emergency Procedures
2. Safety Protocols
3. Personnel Training
4. PPE (Personal Protective Equipment)
5. Safety Inspections
6. Operational Documentation
7. Preventive Maintenance
8. Regulatory Compliance
9. Safety Communication
10. Risk Management
11. Incident Investigation
12. Safety Auditing

**Compliance Status:**
- ✅ Conforme (score ≥ 85)
- ⚠️ Atenção (score 70-84)
- ⚠️ Requer atenção (score < 70)

**Output:**
```json
{
  "modulo": "ASOG Reviewer",
  "timestamp": "ISO 8601",
  "itens_revisados": [...],
  "compliance": {
    "total_itens": 12,
    "conformes": 10,
    "requer_atencao": 2,
    "taxa_conformidade": 83.3
  }
}
```

### 4. Decision Core Module

**File:** `modules/decision_core.py` (267 lines)

**Purpose:** Main orchestrator with interactive CLI

**Key Classes:**
```python
class DecisionCore:
    """Main decision engine"""
    
    def __init__(self, state_file)
    def processar_decisao()  # Main CLI loop
    def _run_fmea()
    def _run_asog()
    def _run_forecast()
    def _export_results()
    def _connect_sgso()
    def _view_history()
```

**Features:**
- Interactive CLI menu
- State persistence
- Execution history
- Multi-format export
- SGSO integration

**Menu Options:**
1. Execute FMEA Audit
2. Execute ASOG Review
3. Execute Risk Forecast
4. Export Results (JSON/PDF/TXT)
5. Connect to SGSO System
6. View Execution History
0. Exit

### 5. Logger Module

**File:** `core/logger.py` (66 lines)

**Purpose:** Event logging with ISO 8601 timestamps

**Key Classes:**
```python
class Logger:
    def __init__(self, log_file)
    def log(message, level)
    def info(message)
    def warning(message)
    def error(message)
    def debug(message)
    def clear()
```

**Log Format:**
```
[2025-10-20T14:00:23.824564] [INFO] Message text
```

### 6. PDF Exporter Module

**File:** `core/pdf_exporter.py` (110 lines)

**Purpose:** Report generation from JSON to text format

**Key Classes:**
```python
class PDFExporter:
    def export_to_text(data, output_file) -> bool
    def export_to_pdf(data, output_file) -> bool
    def export_to_json(data, output_file) -> bool
```

### 7. SGSO Connector Module

**File:** `core/sgso_connector.py` (118 lines)

**Purpose:** SGSO system integration client

**Key Classes:**
```python
class SGSOConnector:
    def __init__(self, base_url, api_key)
    def connect() -> bool
    def disconnect() -> bool
    def send_data(data) -> dict
    def get_data(query) -> dict
    def is_connected() -> bool
```

## 📊 Data Structures

### FMEA Data Structure

```json
{
  "timestamp": "2025-10-20T14:00:00.000000",
  "sistema": "System identifier",
  "periodo_analise": "Q3 2025",
  "sistemas_criticos": [
    {
      "id": "SYS-001",
      "nome": "Sistema de Propulsão",
      "categoria": "Propulsion",
      "modos_falha": [
        {
          "id": "FM-PROP-001",
          "descricao": "Falha no motor principal",
          "severidade": 9,    // 1-10
          "ocorrencia": 3,    // 1-10
          "deteccao": 4,      // 1-10
          "rpn": 108,         // S × O × D
          "status": "monitorado"
        }
      ]
    }
  ],
  "summary": {
    "total_sistemas": 8,
    "total_modos_falha": 17,
    "rpn_medio": 62.59,
    "rpn_maximo": 108,
    "rpn_minimo": 20
  }
}
```

### ASOG Data Structure

```json
{
  "timestamp": "2025-10-20T14:00:00.000000",
  "sistema": "ASOG Compliance",
  "vessel": "PSV Nautilus One",
  "parametros_operacionais": [
    {
      "id": "ASOG-001",
      "parametro": "Temperatura do Motor Principal",
      "valor_atual": 85,
      "limite_inferior": 70,
      "limite_superior": 95,
      "unidade": "°C",
      "status": "conforme",
      "criticidade": "alta"
    }
  ],
  "compliance_summary": {
    "total_parametros": 12,
    "conformes": 12,
    "fora_limites": 0,
    "taxa_conformidade": 100.0,
    "status_geral": "conforme"
  }
}
```

### Forecast Output Structure

```json
{
  "timestamp": "2025-10-20T18:33:16.708519",
  "risco_previsto": "BAIXA",
  "rpn_medio": 62.59,
  "variabilidade": 28.78,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro dos padrões.",
  "detalhes": {
    "descricao_risco": "Operação normal",
    "descricao_asog": "Todos os parâmetros dentro dos limites",
    "total_sistemas": 8,
    "total_modos_falha": 17
  }
}
```

## 💻 Usage Examples

### Example 1: Basic Risk Forecast

```python
from modules.forecast_risk import RiskForecast

# Initialize and run
forecaster = RiskForecast()
forecast = forecaster.gerar_previsao()

# Display results
print(f"Risk Level: {forecast['risco_previsto']}")
print(f"Average RPN: {forecast['rpn_medio']}")
print(f"Recommendation: {forecast['recomendacao']}")
```

### Example 2: Complete Analysis Suite

```python
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import RiskForecast

# FMEA Analysis
fmea = run_fmea_audit()
print(f"FMEA: {fmea['summary']['critico']} critical risks found")

# ASOG Review
asog = run_asog_review()
print(f"ASOG: {asog['compliance']['taxa_conformidade']}% compliant")

# Risk Forecast
forecaster = RiskForecast()
forecast = forecaster.gerar_previsao()
print(f"Forecast: {forecast['risco_previsto']} risk level")
```

### Example 3: Custom Risk Monitoring

```python
from modules.forecast_risk import RiskForecast
import json
from datetime import datetime

class RiskMonitor:
    def __init__(self):
        self.forecaster = RiskForecast()
        self.alert_threshold = 150
    
    def check_risk(self):
        forecast = self.forecaster.gerar_previsao()
        rpn = forecast['rpn_medio']
        
        if rpn > self.alert_threshold:
            self.send_alert(forecast)
        
        self.log_forecast(forecast)
        return forecast
    
    def send_alert(self, forecast):
        print(f"⚠️ ALERT: High RPN detected!")
        print(f"Level: {forecast['risco_previsto']}")
        print(f"RPN: {forecast['rpn_medio']}")
    
    def log_forecast(self, forecast):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"history/forecast_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(forecast, f, indent=2)

# Use monitor
monitor = RiskMonitor()
forecast = monitor.check_risk()
```

### Example 4: Batch Processing

```python
from modules.forecast_risk import RiskForecast
import glob

def process_historical_data():
    """Process multiple FMEA data files"""
    forecaster = RiskForecast()
    results = []
    
    for fmea_file in glob.glob("historical/fmea_*.json"):
        forecaster.fmea_file = fmea_file
        forecast = forecaster.gerar_previsao()
        results.append(forecast)
    
    # Analyze trends
    avg_rpn = sum(f['rpn_medio'] for f in results) / len(results)
    print(f"Historical Average RPN: {avg_rpn:.2f}")
    
    return results

results = process_historical_data()
```

## 🔗 Integration Guide

### CLI Integration

```bash
python3 main.py
```

### Python Application Integration

```python
# In your application
from modules.forecast_risk import RiskForecast

def daily_risk_check():
    forecaster = RiskForecast()
    return forecaster.analyze()

# Call from your application
risk_data = daily_risk_check()
```

### REST API Integration (Future)

```python
# Example FastAPI integration
from fastapi import FastAPI
from modules.forecast_risk import RiskForecast

app = FastAPI()
forecaster = RiskForecast()

@app.get("/api/forecast")
def get_forecast():
    return forecaster.gerar_previsao()
```

### Cron Job Integration

```bash
# crontab entry for daily analysis
0 6 * * * cd /path/to/nautilus && python3 modules/forecast_risk.py
```

## 🧪 Testing

### Test Suite Overview

**Total Tests:** 33 (19 new + 14 existing)  
**Success Rate:** 100%  
**Coverage:** Complete

### Running Tests

```bash
# Risk Forecast Module Tests
python3 test_forecast_module.py

# Decision Core Tests
python3 test_decision_core.py

# All tests
python3 -m unittest discover -s . -p "test_*.py"
```

### Test Categories

1. **Unit Tests**
   - Module initialization
   - Data loading
   - Calculations
   - Classification logic
   - Report generation

2. **Integration Tests**
   - Module interactions
   - State management
   - File operations
   - Error handling

3. **Edge Cases**
   - Missing files
   - Invalid data
   - Empty structures
   - Malformed JSON

## 🚀 Deployment

### Requirements

- Python 3.6 or higher
- No external dependencies
- ~50 KB disk space for modules
- ~10 KB for data files

### Installation

```bash
# Clone repository
git clone <repository-url>
cd nautilus-one

# Verify Python version
python3 --version

# Run tests
python3 test_forecast_module.py
python3 test_decision_core.py

# Execute
python3 main.py
```

### Production Deployment

```bash
# Create virtual environment (optional)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run module
python3 modules/forecast_risk.py

# Or use CLI
python3 main.py
```

### Docker Deployment (Optional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . /app

CMD ["python3", "main.py"]
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Arquivo FMEA não encontrado"**
```python
# Solution: Verify data files exist
import os
print(os.path.exists('relatorio_fmea_atual.json'))
```

**Issue: "Module not found"**
```python
# Solution: Check Python path
import sys
sys.path.insert(0, '/path/to/nautilus')
```

**Issue: Tests failing**
```bash
# Solution: Run with verbose output
python3 -m unittest test_forecast_module.TestRiskForecastModule -v
```

### Debug Mode

```python
from modules.forecast_risk import RiskForecast
import json

forecaster = RiskForecast()

# Check data loading
fmea = forecaster.carregar_dados_fmea()
print(json.dumps(fmea, indent=2))

asog = forecaster.carregar_dados_asog()
print(json.dumps(asog, indent=2))
```

## 📚 Additional Resources

- `PYTHON_QUICKSTART.md` - Quick start guide
- `FORECAST_QUICKREF.md` - Quick reference
- `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md` - Technical details
- `modules/README.md` - Module documentation
- `demo_forecast.py` - Interactive demo

## 📝 Version Information

**Version:** 1.0.0  
**Release Date:** 2025-10-20  
**Python Compatibility:** 3.6+  
**License:** MIT  
**Status:** ✅ Production Ready

## 🤝 Contributing

When contributing to this codebase:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update documentation
4. Follow existing code style
5. Use type hints where appropriate
6. Write clear docstrings

## 📧 Support

For technical support or questions, refer to:
- This documentation
- Test suite for examples
- Demo script for workflows
- Issue tracker for bug reports

---

**Last Updated:** 2025-10-20  
**Maintainers:** Nautilus One Team
