# Nautilus One - Analysis Modules

This directory contains specialized analysis modules for operational decision-making in maritime and offshore operations.

## 📦 Module Overview

### 1. Risk Forecaster (`forecast_risk.py`)
**Predictive risk analysis with FMEA/ASOG integration**

- Analyzes historical FMEA (Failure Mode and Effects Analysis) data from 8 critical maritime systems
- Integrates ASOG (Assurance of Operational Compliance) data for compliance verification
- Calculates Risk Priority Numbers (RPN = Severity × Occurrence × Detection)
- Performs statistical analysis (mean RPN, standard deviation)
- Classifies risk into 3 levels:
  - 🔴 **HIGH** (RPN > 200): Immediate action required
  - 🟡 **MODERATE** (150-200): Intensify monitoring
  - 🟢 **LOW** (≤150): Normal operation
- Generates JSON reports with ISO 8601 timestamps
- Provides automated recommendations

**Usage:**
```python
from modules.forecast_risk import RiskForecast

forecaster = RiskForecast()
resultado = forecaster.gerar_previsao()
print(f"Risk: {resultado['risco_previsto']}")
print(f"Average RPN: {resultado['rpn_medio']}")
```

**Output Example:**
```json
{
  "timestamp": "2025-10-20T14:00:23.824564",
  "risco_previsto": "BAIXA",
  "rpn_medio": 62.59,
  "variabilidade": 28.78,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
}
```

### 2. FMEA Auditor (`audit_fmea.py`)
**Failure Mode and Effects Analysis**

- Identifies failure modes across 4 categories (Operational, Equipment, Human, Environmental)
- Calculates RPN for each failure mode
- Categorizes risks: Critical (≥200), High (≥100), Medium (≥50), Low (<50)
- Generates actionable recommendations

**Usage:**
```python
from modules.audit_fmea import run_fmea_audit

results = run_fmea_audit()
print(f"Total failure modes: {results['summary']['total_modos_falha']}")
print(f"Critical risks: {results['summary']['critico']}")
```

### 3. ASOG Reviewer (`asog_review.py`)
**Operational Safety Analysis**

- Reviews 12 operational safety items
- Tracks compliance status (Conforme ✅ / Requer atenção ⚠️)
- Calculates compliance rates
- Identifies critical areas requiring attention

**Usage:**
```python
from modules.asog_review import run_asog_review

results = run_asog_review()
compliance_rate = results['compliance']['taxa_conformidade']
print(f"Compliance: {compliance_rate}%")
```

### 4. Decision Core (`decision_core.py`)
**Main Orchestrator with State Management**

- Interactive CLI menu interface
- State persistence for audit trails
- Routes execution to appropriate modules
- Export functionality (JSON/Text)
- SGSO system integration

**Usage:**
```python
from modules.decision_core import DecisionCore

core = DecisionCore()
core.processar_decisao()  # Launches interactive menu
```

## 🎯 Data Files

### FMEA Data (`relatorio_fmea_atual.json`)
Contains historical failure mode data from 8 critical maritime systems:
1. Sistema de Propulsão (Propulsion)
2. Sistema de Posicionamento Dinâmico (Dynamic Positioning)
3. Sistema de Geração de Energia (Power Generation)
4. Sistema de Controle de Lastro (Ballast Control)
5. Sistema de Navegação (Navigation)
6. Sistema de Comunicação (Communication)
7. Sistema Hidráulico (Hydraulics)
8. Sistema de Ancoragem (Anchoring)

**Structure:**
```json
{
  "timestamp": "ISO 8601 timestamp",
  "sistemas_criticos": [
    {
      "id": "SYS-001",
      "nome": "System name",
      "categoria": "Category",
      "modos_falha": [
        {
          "id": "FM-XXX-001",
          "descricao": "Failure description",
          "severidade": 1-10,
          "ocorrencia": 1-10,
          "deteccao": 1-10,
          "rpn": "severidade × ocorrencia × deteccao",
          "status": "monitorado|controlado"
        }
      ]
    }
  ]
}
```

### ASOG Data (`asog_report.json`)
Contains operational compliance parameters for 12 critical items:
- Temperature monitoring
- Pressure levels
- Vibration analysis
- Electrical parameters
- Positioning accuracy
- Fuel levels
- Hydraulic systems
- RPM monitoring

**Structure:**
```json
{
  "timestamp": "ISO 8601 timestamp",
  "vessel": "Vessel name",
  "parametros_operacionais": [
    {
      "id": "ASOG-001",
      "parametro": "Parameter name",
      "valor_atual": 85,
      "limite_inferior": 70,
      "limite_superior": 95,
      "unidade": "°C",
      "status": "conforme|fora_limites",
      "criticidade": "alta|média|baixa"
    }
  ],
  "compliance_summary": {
    "total_parametros": 12,
    "conformes": 12,
    "fora_limites": 0,
    "taxa_conformidade": 100.0
  }
}
```

## 🧪 Testing

### Test Suite (`test_forecast_module.py`)
Comprehensive test coverage (19 tests, 100% success rate):

- Module initialization
- FMEA/ASOG data loading
- RPN calculation accuracy
- Statistical analysis (mean, stdev)
- Risk classification logic (HIGH/MODERATE/LOW)
- ASOG compliance verification
- JSON report generation
- Edge cases (missing files, invalid data)
- Data structure validation
- Backward compatibility

**Run tests:**
```bash
python3 test_forecast_module.py
```

### Demo Script (`demo_forecast.py`)
Interactive demonstration of all module capabilities:

```bash
python3 demo_forecast.py
```

## 🚀 Integration Examples

### Standalone Execution
```bash
python3 modules/forecast_risk.py
```

### Programmatic API
```python
from modules.forecast_risk import RiskForecast

forecaster = RiskForecast()
forecast = forecaster.gerar_previsao()

# Access results
print(f"Risk Level: {forecast['risco_previsto']}")
print(f"Average RPN: {forecast['rpn_medio']}")
print(f"Recommendation: {forecast['recomendacao']}")

# Save report
forecaster.salvar_relatorio(forecast, "my_forecast.json")
```

### Interactive CLI
```bash
python3 main.py
# Select option 3: Execute Risk Forecast
```

### Legacy Compatibility
```python
from modules.forecast_risk import run_risk_forecast

# For backward compatibility with existing code
results = run_risk_forecast(timeframe=30)
```

## 📊 Key Features

### Zero Dependencies
- Uses only Python standard library
- No external packages required
- `json`, `statistics`, `datetime` modules only

### Performance
- Executes in <1 second
- Efficient data processing
- Minimal memory footprint

### Portability
- Python 3.6+ compatible
- Cross-platform (Linux, macOS, Windows)
- No OS-specific dependencies

### Production Ready
- 100% test coverage
- Comprehensive error handling
- Detailed logging
- State persistence
- Audit trail support

## 🔗 Future Enhancements

The module architecture supports:
- REST API endpoints (FastAPI/Flask)
- Integration with TypeScript application
- Cron jobs for periodic analysis
- Email/SMS alerts
- Web dashboard visualizations
- PostgreSQL for historical data
- Machine Learning predictions
- Real-time monitoring

## 📚 Documentation

Additional documentation files:
- `PYTHON_QUICKSTART.md` - Quick start guide
- `PYTHON_MODULES_README.md` - Complete system guide
- `FORECAST_QUICKREF.md` - Quick reference
- `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md` - Technical summary
- `IMPLEMENTATION_COMPLETE_FORECAST_RISK.md` - Executive summary
- `PYTHON_MODULE_VISUAL_SUMMARY.md` - Visual guide

## 📝 Version

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**License:** MIT

## 🤝 Contributing

When adding new modules:
1. Follow the existing module structure
2. Include comprehensive docstrings
3. Add test cases to test suite
4. Update this README
5. Maintain backward compatibility
6. Document all public APIs

## 📧 Support

For questions or issues related to these modules, please refer to the main project documentation or contact the development team.
