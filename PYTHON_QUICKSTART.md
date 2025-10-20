# 🐍 Python Risk Forecast Module - Quick Start

Standalone Python module for predictive risk analysis in maritime operations.

## ⚡ Quick Start (30 seconds)

```bash
# Option 1: Interactive menu
python3 decision_core.py

# Option 2: One-liner
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"

# Option 3: Standalone
python3 modules/forecast_risk.py
```

## 📦 What's Inside

- **Core Package** (`core/`) - Logging utilities
- **Modules Package** (`modules/`) - Risk forecast analysis
- **CLI Interface** (`decision_core.py`) - Interactive menu
- **Sample Data** - FMEA and ASOG maritime data
- **Documentation** - 4 comprehensive guides

## 🎯 Features

- ✅ FMEA analysis (8 critical maritime systems)
- ✅ ASOG compliance verification
- ✅ RPN calculation and risk classification
- ✅ JSON report generation
- ✅ Zero external dependencies (Python stdlib only)

## 📊 Example Output

```
📈 Tendência de risco: BAIXA
RPN médio: 73.50 | Variabilidade: 28.84
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.
```

## 🧪 Run Tests

```bash
python3 test_forecast_module.py
```

## 📚 Full Documentation

- **Complete Guide**: [PYTHON_MODULES_README.md](PYTHON_MODULES_README.md)
- **Quick Reference**: [FORECAST_QUICKREF.md](FORECAST_QUICKREF.md)
- **Technical Docs**: [modules/README.md](modules/README.md)
- **Implementation Summary**: [FORECAST_RISK_IMPLEMENTATION_SUMMARY.md](FORECAST_RISK_IMPLEMENTATION_SUMMARY.md)

## 🔧 Requirements

- Python 3.6+
- No external dependencies

## 📝 Programmatic Usage

```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
resultado = forecast.gerar_previsao()
print(f"Risco: {resultado['risco_previsto']}")
```

**Version**: 1.0.0 | **Status**: ✅ Production Ready
