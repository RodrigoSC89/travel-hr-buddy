# Python Backend - Quick Start Guide

## 🐍 Overview

The Nautilus One Python backend provides standalone risk analysis capabilities for maritime and offshore operations, featuring FMEA analysis, ASOG compliance checking, and predictive risk forecasting.

## 📦 What's Included

### Core Modules (`core/`)
- **Logger** (`logger.py`): Event logging with ISO 8601 timestamps
- **PDF Exporter** (`pdf_exporter.py`): Report generation
- **SGSO Connector** (`sgso_connector.py`): SGSO system integration

### Analysis Modules (`modules/`)
- **Risk Forecaster** (`forecast_risk.py`): FMEA/ASOG predictive analysis
- **FMEA Auditor** (`audit_fmea.py`): Failure mode analysis
- **ASOG Reviewer** (`asog_review.py`): Operational safety review
- **Decision Core** (`decision_core.py`): Main orchestrator with CLI

### Data Files
- `relatorio_fmea_atual.json`: Sample FMEA data (8 systems)
- `asog_report.json`: Sample ASOG compliance data (12 parameters)

## 🚀 Quick Start

### 1. Check Python Version
```bash
python3 --version
# Requires Python 3.6+
```

### 2. Run Interactive CLI
```bash
python3 main.py
```

This launches the interactive menu:
```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║            NAUTILUS ONE - DECISION CORE SYSTEM                ║
║                                                               ║
║    Python Backend for Intelligent Decision-Making             ║
║    Maritime, Offshore & Industrial Operations                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

================================================================================
NAUTILUS ONE - DECISION CORE
================================================================================
1. Executar Auditoria FMEA
2. Executar Revisão ASOG
3. Executar Forecast de Riscos
4. Exportar Resultados (JSON/PDF/TXT)
5. Conectar ao Sistema SGSO
6. Ver Histórico de Execuções
0. Sair
================================================================================
```

### 3. Run Standalone Risk Forecast
```bash
python3 modules/forecast_risk.py
```

Output:
```
================================================================================
NAUTILUS ONE - RISK FORECAST MODULE
================================================================================

🔮 Iniciando análise preditiva de risco...
[2025-10-20 14:00:23] Carregando dados históricos FMEA/ASOG...
[2025-10-20 14:00:23] Calculando tendência de RPN...
[2025-10-20 14:00:23] Gerando relatório preditivo...

📈 Tendência de risco: BAIXA
RPN médio: 62.59 | Variabilidade: 28.78
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.

📊 Forecast de Risco salvo como: forecast_risco.json

================================================================================
Análise concluída com sucesso!
================================================================================
```

### 4. Run Interactive Demo
```bash
python3 demo_forecast.py
```

This provides a step-by-step walkthrough of all module capabilities.

### 5. Run Tests
```bash
# Test Risk Forecast module
python3 test_forecast_module.py

# Test entire Decision Core system
python3 test_decision_core.py
```

## 💻 Programmatic Usage

### Basic Risk Forecast
```python
from modules.forecast_risk import RiskForecast

# Initialize
forecaster = RiskForecast()

# Generate forecast
forecast = forecaster.gerar_previsao()

# Access results
print(f"Risk Level: {forecast['risco_previsto']}")
print(f"Average RPN: {forecast['rpn_medio']}")
print(f"Recommendation: {forecast['recomendacao']}")

# Save custom report
forecaster.salvar_relatorio(forecast, "my_custom_report.json")
```

### Advanced Usage
```python
from modules.forecast_risk import RiskForecast

# Initialize with custom data files
forecaster = RiskForecast(
    fmea_file="custom_fmea.json",
    asog_file="custom_asog.json"
)

# Load data
fmea_data = forecaster.carregar_dados_fmea()
asog_data = forecaster.carregar_dados_asog()

# Calculate metrics
rpn_medio = forecaster.calcular_rpn_medio()
variabilidade = forecaster.calcular_variabilidade()

# Classify risk
nivel, emoji, descricao = forecaster.classificar_risco(rpn_medio)
print(f"{emoji} Risk Level: {nivel}")
print(f"Description: {descricao}")

# Check ASOG compliance
status, desc = forecaster.verificar_conformidade_asog()
print(f"ASOG Status: {status}")
print(f"Details: {desc}")

# Generate complete forecast
forecast = forecaster.gerar_previsao()
```

### FMEA Audit
```python
from modules.audit_fmea import run_fmea_audit

results = run_fmea_audit()
print(f"Total failure modes: {results['summary']['total_modos_falha']}")
print(f"Critical risks: {results['summary']['critico']}")
print(f"High risks: {results['summary']['alto']}")

# Access individual failure modes
for modo in results['modos_falha']:
    print(f"{modo['id']}: RPN = {modo['rpn']} ({modo['nivel_risco']})")
```

### ASOG Review
```python
from modules.asog_review import run_asog_review

results = run_asog_review()
compliance = results['compliance']

print(f"Compliance Rate: {compliance['taxa_conformidade']}%")
print(f"Items Compliant: {compliance['conformes']}/{compliance['total_itens']}")
print(f"Critical Areas: {len(results['areas_criticas'])}")
```

### Decision Core Integration
```python
from modules.decision_core import DecisionCore

# Initialize
core = DecisionCore()

# Programmatically execute modules
core._run_fmea()
core._run_asog()
core._run_forecast()

# View execution history
core._view_history()

# Export results
core._export_results()
```

## 📊 Working with Results

### Read Generated Reports
```python
import json

# Load forecast report
with open('forecast_risco.json', 'r', encoding='utf-8') as f:
    forecast = json.load(f)

print(f"Timestamp: {forecast['timestamp']}")
print(f"Risk: {forecast['risco_previsto']}")
print(f"Average RPN: {forecast['rpn_medio']}")
print(f"Variability: {forecast['variabilidade']}")
print(f"ASOG Status: {forecast['status_operacional']}")
print(f"Recommendation: {forecast['recomendacao']}")

# Access detailed information
detalhes = forecast['detalhes']
print(f"Systems Analyzed: {detalhes['total_sistemas']}")
print(f"Failure Modes: {detalhes['total_modos_falha']}")
```

### Process Multiple Forecasts
```python
from modules.forecast_risk import RiskForecast
import json
from datetime import datetime

forecaster = RiskForecast()

# Generate daily forecasts
for day in range(7):
    forecast = forecaster.gerar_previsao()
    filename = f"forecast_{datetime.now().strftime('%Y%m%d')}.json"
    forecaster.salvar_relatorio(forecast, filename)
    print(f"✅ Forecast saved: {filename}")
```

## 🎯 Common Use Cases

### 1. Daily Risk Assessment
```python
from modules.forecast_risk import RiskForecast

def daily_risk_check():
    forecaster = RiskForecast()
    forecast = forecaster.gerar_previsao()
    
    risk = forecast['risco_previsto']
    if risk == "ALTA":
        # Send alert
        print("🚨 HIGH RISK ALERT!")
        send_emergency_alert(forecast)
    elif risk == "MODERADA":
        # Intensify monitoring
        print("⚠️ Moderate risk - intensify monitoring")
        increase_monitoring_frequency()
    else:
        print("✅ Normal operations")
    
    return forecast

# Run daily
forecast = daily_risk_check()
```

### 2. Batch Analysis
```python
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import RiskForecast

def comprehensive_analysis():
    """Run complete analysis suite"""
    
    # FMEA Audit
    print("Running FMEA audit...")
    fmea = run_fmea_audit()
    
    # ASOG Review
    print("Running ASOG review...")
    asog = run_asog_review()
    
    # Risk Forecast
    print("Generating risk forecast...")
    forecaster = RiskForecast()
    forecast = forecaster.gerar_previsao()
    
    # Combine results
    return {
        "fmea": fmea,
        "asog": asog,
        "forecast": forecast
    }

results = comprehensive_analysis()
```

### 3. Custom Thresholds
```python
from modules.forecast_risk import RiskForecast

class CustomForecast(RiskForecast):
    def classificar_risco(self, rpn_medio):
        """Custom risk classification with different thresholds"""
        if rpn_medio > 150:  # Lower threshold
            return ("ALTA", "🔴", "Immediate action required")
        elif rpn_medio > 100:
            return ("MODERADA", "🟡", "Intensify monitoring")
        else:
            return ("BAIXA", "🟢", "Normal operation")

forecaster = CustomForecast()
forecast = forecaster.gerar_previsao()
```

## 🔧 Configuration

### Custom Data Files
```python
forecaster = RiskForecast(
    fmea_file="/path/to/my_fmea_data.json",
    asog_file="/path/to/my_asog_data.json"
)
```

### Custom Output Location
```python
forecast = forecaster.gerar_previsao()
forecaster.salvar_relatorio(
    forecast, 
    "/path/to/reports/forecast_2025.json"
)
```

### Logging Configuration
```python
from core.logger import Logger

# Custom log file
logger = Logger(log_file="/path/to/custom_logs.txt")
logger.info("Custom log message")
```

## 📁 File Structure

```
nautilus-one/
├── core/
│   ├── __init__.py
│   ├── logger.py
│   ├── pdf_exporter.py
│   └── sgso_connector.py
├── modules/
│   ├── __init__.py
│   ├── audit_fmea.py
│   ├── asog_review.py
│   ├── forecast_risk.py
│   ├── decision_core.py
│   └── README.md
├── main.py
├── demo_forecast.py
├── test_forecast_module.py
├── test_decision_core.py
├── relatorio_fmea_atual.json
├── asog_report.json
└── Documentation files (.md)
```

## 🧪 Testing

### Run All Tests
```bash
# Risk Forecast tests (19 tests)
python3 test_forecast_module.py

# Decision Core tests (14 tests)
python3 test_decision_core.py
```

### Test Individual Components
```python
import unittest
from test_forecast_module import TestRiskForecastModule

# Run specific test
suite = unittest.TestLoader().loadTestsFromName(
    'test_forecast_module.TestRiskForecastModule.test_generate_forecast'
)
unittest.TextTestRunner(verbosity=2).run(suite)
```

## 🐛 Troubleshooting

### Issue: Module not found
```bash
# Ensure you're in the correct directory
cd /path/to/nautilus-one
python3 modules/forecast_risk.py
```

### Issue: Data files not found
```python
import os
print(os.path.exists('relatorio_fmea_atual.json'))  # Should be True
print(os.path.exists('asog_report.json'))  # Should be True
```

### Issue: Import errors
```python
# Check Python path
import sys
print(sys.path)

# Add current directory if needed
sys.path.insert(0, '/path/to/nautilus-one')
```

## 📚 Next Steps

1. **Explore Documentation**
   - `modules/README.md` - Detailed module documentation
   - `FORECAST_QUICKREF.md` - Quick reference guide
   - `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md` - Technical details

2. **Run Interactive Demo**
   ```bash
   python3 demo_forecast.py
   ```

3. **Customize Data Files**
   - Edit `relatorio_fmea_atual.json` with your FMEA data
   - Edit `asog_report.json` with your ASOG parameters

4. **Integrate with Your Application**
   - Use programmatic API
   - Schedule periodic analyses
   - Set up alerts based on risk levels

## 💡 Tips

- Start with the demo script to understand workflow
- Use test suite as usage examples
- Keep historical forecasts for trend analysis
- Customize risk thresholds for your operations
- Integrate with monitoring systems
- Schedule regular analyses (daily/weekly)

## 🆘 Getting Help

1. Check this quickstart guide
2. Review module README files
3. Run demo_forecast.py for examples
4. Examine test suite for usage patterns
5. Read implementation summary for technical details

## 📝 Version

**Python Backend Version:** 1.0.0  
**Python Required:** 3.6+  
**Dependencies:** None (stdlib only)  
**Status:** Production Ready

---

Happy analyzing! 🚀
