# Decision Core - Quick Reference Card

## 🚀 Quick Start

```bash
# Run interactive system
python3 main.py

# Run tests
python3 test_decision_core.py

# Monitor logs
tail -f nautilus_logs.txt

# Check state
cat nautilus_state.json
```

## 📁 File Structure

```
core/
├── logger.py          # Event logging
├── pdf_exporter.py    # Report generation
└── sgso_connector.py  # SGSO integration

modules/
├── decision_core.py   # Main orchestrator
├── audit_fmea.py      # FMEA auditor
├── asog_review.py     # ASOG review
└── forecast_risk.py   # Risk forecast

main.py                # Entry point
test_decision_core.py  # Test suite
```

## 🧩 Core Modules

### Decision Core
```python
from modules.decision_core import DecisionCore

nautilus = DecisionCore()
nautilus.processar_decisao()  # Interactive menu
```

**Menu Options:**
1. 📄 Export PDF
2. 🧠 Run FMEA Audit
3. 🔗 Connect SGSO
4. 🧾 Access other modules
5. 🚪 Exit

### FMEA Auditor
```python
from modules.audit_fmea import FMEAAuditor

auditor = FMEAAuditor()
auditor.run()
```

**Output:** `relatorio_fmea_atual.json`

**RPN Formula:** `Severity × Occurrence × Detection`

**Priority Levels:**
- 🔴 CRÍTICO (RPN ≥ 200)
- 🟠 ALTO (RPN ≥ 100)
- 🟡 MÉDIO (RPN ≥ 50)
- 🟢 BAIXO (RPN < 50)

### ASOG Review
```python
from modules.asog_review import ASOGModule

asog = ASOGModule()
asog.start()
```

**Output:** `relatorio_asog_atual.json`

**Reviews:** 12 operational items

**Status:**
- ✅ Conforme
- ⚠️ Requer atenção

### Risk Forecast
```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
forecast.analyze()
```

**Output:** `relatorio_forecast_atual.json`

**Analyzes:** 5 risk categories over 30 days

**Trends:**
- 📈 CRESCENTE
- 📉 DECRESCENTE
- ➡️ ESTÁVEL

## 🛠️ Support Services

### Logger
```python
from core.logger import log_event

log_event("Your message here")
```

**Output:** `nautilus_logs.txt`

**Format:** `[timestamp] message`

### PDF Exporter
```python
from core.pdf_exporter import export_report

export_report("relatorio_fmea_atual.json")
```

**Output:** `relatorio_YYYYMMDD_HHMMSS.pdf`

### SGSO Connector
```python
from core.sgso_connector import SGSOClient

sgso = SGSOClient()
sgso.connect()      # Connect
sgso.disconnect()   # Disconnect
```

## 💾 State Management

**State File:** `nautilus_state.json`

```json
{
    "ultima_acao": "action_name",
    "timestamp": "2025-10-20T01:14:20.711113"
}
```

**Methods:**
```python
core.carregar_estado()      # Load state
core.salvar_estado("action") # Save state
```

## 📊 Report Structure

### FMEA Report
```json
{
    "tipo": "FMEA Audit",
    "timestamp": "...",
    "modos_falha": [
        {
            "categoria": "...",
            "modo_falha": "...",
            "severidade": 8,
            "ocorrencia": 4,
            "deteccao": 6,
            "rpn": 192,
            "prioridade": "..."
        }
    ],
    "resumo": {
        "total_analisado": 4,
        "criticos": 1,
        "altos": 2
    }
}
```

### ASOG Report
```json
{
    "tipo": "ASOG Review",
    "timestamp": "...",
    "itens": [
        {
            "item": "...",
            "status": "Conforme",
            "detalhes": "..."
        }
    ],
    "resumo": {
        "total": 12,
        "conformes": 9,
        "requer_atencao": 3,
        "taxa_conformidade": 75.0
    }
}
```

### Risk Forecast Report
```json
{
    "tipo": "Risk Forecast",
    "timestamp": "...",
    "periodo_previsao": "30 dias",
    "previsoes": [
        {
            "categoria": "...",
            "risco_atual": "MÉDIO",
            "tendencia": "ESTÁVEL",
            "probabilidade_30d": 45,
            "impacto_potencial": "MÉDIO",
            "recomendacao": "..."
        }
    ],
    "analise": {
        "probabilidade_media": 36.4,
        "categorias_alto_risco": 1,
        "total_categorias": 5
    }
}
```

## 🧪 Testing

### Run All Tests
```bash
python3 test_decision_core.py
```

### Test Classes
- `TestLogger` - Logger functionality
- `TestFMEAAuditor` - FMEA execution & RPN
- `TestASOGReview` - ASOG review & compliance
- `TestRiskForecast` - Risk predictions
- `TestSGSOConnector` - SGSO connections
- `TestPDFExporter` - PDF export
- `TestDecisionCore` - State management

**Coverage:** 100% (7/7 modules)

## 🔌 Integration Examples

### Supabase Edge Function
```typescript
const { data } = await supabase.functions.invoke('decision-core', {
  body: { module: 'audit_fmea', action: 'run' }
})
```

### REST API
```typescript
const response = await fetch(`${API_URL}/api/fmea/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
```

### WebSocket
```typescript
ws.send(JSON.stringify({
  module: 'audit_fmea',
  action: 'run'
}))
```

## 📝 Common Tasks

### Task: Run FMEA and Export PDF
```bash
python3 main.py
# Choose: 2 → Run FMEA
# Then: 1 → Export PDF
```

### Task: Check Last Action
```bash
cat nautilus_state.json
```

### Task: View Recent Logs
```bash
tail -20 nautilus_logs.txt
```

### Task: Clear Logs
```bash
rm nautilus_logs.txt
```

### Task: Reset State
```bash
rm nautilus_state.json
```

## 🔧 Configuration

**No configuration needed!** Uses Python stdlib only.

**Optional:** Set environment variables for integration
```bash
export VITE_DECISION_CORE_API_URL=http://localhost:8000
export VITE_DECISION_CORE_WS_URL=ws://localhost:8765
```

## ⚠️ Error Handling

All modules include error handling:
- File not found errors
- JSON decode errors
- Connection errors
- State management errors

Errors are:
- Logged to `nautilus_logs.txt`
- Displayed to user with ❌ symbol
- Handled gracefully without crashes

## 📦 Requirements

- **Python:** 3.12+
- **Dependencies:** None (stdlib only)
- **OS:** Linux, macOS, Windows

## 🎯 Key Features

✅ Zero dependencies
✅ 100% test coverage
✅ Complete traceability
✅ State persistence
✅ Modular design
✅ Production ready

## 📚 Documentation

- `DECISION_CORE_README.md` - Full documentation
- `DECISION_CORE_INTEGRATION.md` - Integration guide
- `DECISION_CORE_VISUAL_SUMMARY.md` - Visual architecture
- `DECISION_CORE_QUICKREF.md` - This file
- `DECISION_CORE_TREE.txt` - File structure tree

## 🆘 Troubleshooting

**Issue:** Module not found
```bash
# Ensure you're in project root
cd /path/to/travel-hr-buddy
python3 main.py
```

**Issue:** Permission denied
```bash
chmod +x main.py
```

**Issue:** Python version
```bash
python3 --version  # Should be 3.12+
```

## 🚀 Production Deployment

1. Copy files to server
2. Ensure Python 3.12+ installed
3. Run: `python3 main.py`
4. Monitor: `tail -f nautilus_logs.txt`

**No build step required!**

## 💡 Tips

- Use state persistence to resume work
- Monitor logs for debugging
- Run tests before deployment
- Export reports regularly
- Back up JSON reports

## 🔗 Quick Links

- Main Documentation: `DECISION_CORE_README.md`
- Integration Guide: `DECISION_CORE_INTEGRATION.md`
- Visual Guide: `DECISION_CORE_VISUAL_SUMMARY.md`
- File Tree: `DECISION_CORE_TREE.txt`

---

**Version:** 1.0.0  
**Updated:** 2025-10-20  
**Status:** ✅ Production Ready
