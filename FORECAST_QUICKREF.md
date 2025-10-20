# Risk Forecast Module - Quick Reference

## 🚀 Quick Start

### Standalone Execution
```bash
python3 modules/forecast_risk.py
```

### Programmatic Usage
```python
from modules.forecast_risk import RiskForecast

forecaster = RiskForecast()
forecast = forecaster.gerar_previsao()
print(f"Risk: {forecast['risco_previsto']}")
```

### Legacy Compatibility
```python
from modules.forecast_risk import run_risk_forecast

results = run_risk_forecast(timeframe=30)
```

## 📊 Risk Classification

| Level | RPN Range | Emoji | Action |
|-------|-----------|-------|--------|
| HIGH | > 200 | 🔴 | Immediate action required |
| MODERATE | 150-200 | 🟡 | Intensify monitoring |
| LOW | ≤ 150 | 🟢 | Normal operation |

## 🎯 RPN Calculation

```
RPN = Severity × Occurrence × Detection
```

Where each factor is rated 1-10:
- **Severity**: Impact of failure (1=minimal, 10=catastrophic)
- **Occurrence**: Frequency of failure (1=rare, 10=frequent)
- **Detection**: Ability to detect before impact (1=certain, 10=impossible)

## 📁 Data Files

### FMEA Data (`relatorio_fmea_atual.json`)
8 critical maritime systems:
1. Propulsion System
2. Dynamic Positioning
3. Power Generation
4. Ballast Control
5. Navigation
6. Communication
7. Hydraulics
8. Anchoring

### ASOG Data (`asog_report.json`)
12 operational parameters:
- Temperature monitoring
- Pressure levels
- Vibration analysis
- Electrical parameters
- Positioning accuracy
- Fuel levels

## 🔧 Core Functions

### RiskForecast Class

```python
forecaster = RiskForecast(
    fmea_file="relatorio_fmea_atual.json",
    asog_file="asog_report.json"
)

# Load data
forecaster.carregar_dados_fmea()
forecaster.carregar_dados_asog()

# Calculate metrics
rpn_medio = forecaster.calcular_rpn_medio()
variabilidade = forecaster.calcular_variabilidade()

# Classify risk
nivel, emoji, desc = forecaster.classificar_risco(rpn_medio)

# Check compliance
status, desc = forecaster.verificar_conformidade_asog()

# Generate forecast
forecast = forecaster.gerar_previsao()

# Save report
forecaster.salvar_relatorio(forecast, "my_report.json")
```

## 📈 Output Format

```json
{
  "timestamp": "2025-10-20T14:00:23.824564",
  "risco_previsto": "BAIXA",
  "rpn_medio": 62.59,
  "variabilidade": 28.78,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento.",
  "detalhes": {
    "descricao_risco": "Operação normal",
    "descricao_asog": "Todos os parâmetros dentro dos limites",
    "total_sistemas": 8,
    "total_modos_falha": 17
  }
}
```

## 🧪 Testing

Run comprehensive test suite:
```bash
python3 test_forecast_module.py
```

Run interactive demo:
```bash
python3 demo_forecast.py
```

## 🔗 Integration

### CLI Menu
```bash
python3 main.py
# Select option 3: Execute Risk Forecast
```

### Decision Core
```python
from modules.decision_core import DecisionCore

core = DecisionCore()
core._run_forecast()  # Executes risk forecast
```

## ⚠️ Error Handling

The module handles:
- Missing FMEA/ASOG files
- Invalid JSON format
- Empty data structures
- Missing required fields

Returns error dict when data unavailable:
```json
{
  "erro": "Dados FMEA não disponíveis",
  "timestamp": "2025-10-20T14:00:23.824564"
}
```

## 📊 ASOG Compliance Status

| Status | Description | Action |
|--------|-------------|--------|
| conforme | 100% compliance | Maintain monitoring |
| atencao | 90-99% compliance | Review parameters |
| fora_limites | <90% compliance | Immediate action |
| sem_dados | No data available | Check data files |

## 🎨 Console Output

```
🔮 Iniciando análise preditiva de risco...
[2025-10-20 14:00:23] Carregando dados históricos FMEA/ASOG...
[2025-10-20 14:00:23] Calculando tendência de RPN...
[2025-10-20 14:00:23] Gerando relatório preditivo...

📈 Tendência de risco: BAIXA
RPN médio: 62.59 | Variabilidade: 28.78
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.

📊 Forecast de Risco salvo como: forecast_risco.json
```

## 💡 Tips

1. **Customize Data Files**: Edit `relatorio_fmea_atual.json` and `asog_report.json` with your actual operational data

2. **Adjust Thresholds**: Modify risk classification thresholds in `classificar_risco()` method if needed

3. **Periodic Analysis**: Run forecasts regularly (e.g., daily) to track trends

4. **Integration**: The module is designed for easy integration with:
   - REST APIs (FastAPI/Flask)
   - Cron jobs
   - Email/SMS alerts
   - Web dashboards

5. **Historical Data**: Keep historical forecasts for trend analysis

## 📝 Version Info

**Version:** 1.0.0  
**Python:** 3.6+  
**Dependencies:** None (stdlib only)  
**Status:** Production Ready

## 📚 More Documentation

- `modules/README.md` - Comprehensive module documentation
- `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md` - Technical details
- `PYTHON_QUICKSTART.md` - Python backend guide
- `PYTHON_MODULES_README.md` - Complete system overview

## 🆘 Common Issues

### Issue: "Arquivo FMEA não encontrado"
**Solution:** Ensure `relatorio_fmea_atual.json` exists in the working directory

### Issue: "Dados FMEA não disponíveis"
**Solution:** Check JSON file format and structure

### Issue: Test failures
**Solution:** Run `python3 test_forecast_module.py` for detailed diagnostics

## 🤝 Support

For questions or issues:
1. Check this quick reference
2. Review `modules/README.md`
3. Run `python3 demo_forecast.py` for interactive examples
4. Consult test suite for usage examples
