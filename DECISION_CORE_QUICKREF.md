# 🚀 Decision Core - Quick Reference

## 📦 Installation & Setup

```bash
# Clone repository
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Run Decision Core (no dependencies needed)
python3 main.py
```

## 🎯 Quick Commands

| Command | Description |
|---------|-------------|
| `python3 main.py` | Start interactive Decision Core |
| `python3 test_decision_core.py` | Run all tests |
| `cat nautilus_state.json` | View system state |
| `tail -f nautilus_logs.txt` | Monitor logs in real-time |

## 🧩 Module Overview

### Core Services (`core/`)

| Module | Purpose | Key Function |
|--------|---------|--------------|
| `logger.py` | Event logging | `log_event(msg)` |
| `pdf_exporter.py` | PDF generation | `export_report(json_file)` |
| `sgso_connector.py` | SGSO integration | `SGSOClient().connect()` |

### Analysis Modules (`modules/`)

| Module | Purpose | Key Class |
|--------|---------|-----------|
| `audit_fmea.py` | FMEA auditing | `FMEAAuditor()` |
| `asog_review.py` | Safety review | `ASOGModule()` |
| `forecast_risk.py` | Risk forecast | `RiskForecast()` |
| `decision_core.py` | Main engine | `DecisionCore()` |

## 💻 Code Examples

### 1. Using Logger

```python
from core.logger import log_event

log_event("System initialized")
log_event("Processing request")
```

### 2. Running FMEA Audit

```python
from modules.audit_fmea import FMEAAuditor

auditor = FMEAAuditor()
auditor.run()  # Executes full FMEA analysis
```

### 3. Risk Forecast

```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
forecast.analyze()  # Generates risk predictions
```

### 4. ASOG Review

```python
from modules.asog_review import ASOGModule

asog = ASOGModule()
asog.start()  # Performs safety review
```

### 5. SGSO Connection

```python
from core.sgso_connector import SGSOClient

sgso = SGSOClient()
sgso.connect()  # Connects to SGSO system
sgso.disconnect()  # Closes connection
```

### 6. PDF Export

```python
from core.pdf_exporter import export_report

export_report("relatorio_fmea_atual.json")
```

### 7. Decision Core

```python
from modules.decision_core import DecisionCore

nautilus = DecisionCore()
nautilus.processar_decisao()  # Interactive menu
```

## 🎮 Interactive Menu Options

```
1. 📄 Exportar parecer da IA como PDF
   → Exports AI analysis to PDF

2. 🧠 Iniciar módulo Auditoria Técnica FMEA
   → Runs FMEA technical audit

3. 🔗 Conectar com SGSO/Logs
   → Connects to SGSO system

4. 🧾 Migrar para outro módulo
   → Opens submenu:
      4.1 ASOG Review
      4.2 Risk Forecast

5. 🚪 Sair
   → Exit system
```

## 📊 Output Files

| File | Description | Format |
|------|-------------|--------|
| `nautilus_state.json` | System state | JSON |
| `nautilus_logs.txt` | Event logs | Text |
| `relatorio_*.txt` | Export reports | Text |

## 🔧 State Management

### Check Current State
```python
from modules.decision_core import DecisionCore

core = DecisionCore()
print(core.state)
# {'ultima_acao': 'Rodar Auditoria FMEA', 'timestamp': '2025-10-20T01:14:20'}
```

### Save State
```python
core.salvar_estado("New Action")
```

## 🧪 Testing

### Run All Tests
```bash
python3 test_decision_core.py
```

### Test Individual Module
```python
from modules.audit_fmea import FMEAAuditor

def test_fmea():
    auditor = FMEAAuditor()
    auditor.run()
    assert len(auditor.audit_data) > 0

test_fmea()
```

## 🔗 Frontend Integration

### Supabase Edge Function (Recommended)

```typescript
// Call from React component
const { data } = await supabase.functions.invoke('decision-core', {
  body: { module: 'audit_fmea', action: 'run' }
});
```

### REST API

```typescript
// Call via fetch
const response = await fetch('http://localhost:8000/api/fmea/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
```

### React Hook

```typescript
import { useDecisionCore } from '@/hooks/useDecisionCore';

function MyComponent() {
  const { runModule, loading, error } = useDecisionCore();
  
  const handleRun = async () => {
    const result = await runModule('audit_fmea', 'run');
    console.log(result);
  };
  
  return <button onClick={handleRun}>Run FMEA</button>;
}
```

## 📈 FMEA Metrics

```python
# RPN Calculation
RPN = Severity × Occurrence × Detection

# Severity Scale (1-10)
# 10 = Catastrophic
# 1 = Negligible

# Occurrence Scale (1-10)
# 10 = Very frequent
# 1 = Rare

# Detection Scale (1-10)
# 10 = Very difficult to detect
# 1 = Easily detected
```

## 🎯 Risk Forecast Categories

| Category | Description |
|----------|-------------|
| Operacional | Operational risks |
| Ambiental | Environmental hazards |
| Equipamento | Equipment failures |
| Humano | Human factors |
| Regulatório | Regulatory compliance |

## 🚨 Priority Levels

| Icon | Level | Criteria |
|------|-------|----------|
| 🔴 | Crítica | Probability >70% + High/Critical Impact |
| 🟡 | Alta | Probability >50% + Med/High Impact |
| 🟢 | Média | Probability >30% |
| ⚪ | Baixa | Probability <30% |

## 🔐 Environment Variables (Future)

```bash
# For production deployment
DECISION_CORE_API_URL=https://api.example.com
DECISION_CORE_API_KEY=your-api-key
SGSO_API_URL=https://sgso.example.com
SGSO_API_KEY=your-sgso-key
```

## 📚 Documentation Links

- [Complete README](./DECISION_CORE_README.md)
- [Integration Guide](./DECISION_CORE_INTEGRATION.md)
- [Visual Summary](./DECISION_CORE_VISUAL_SUMMARY.md)
- [Quick Reference](./DECISION_CORE_QUICKREF.md) (this file)

## 🆘 Troubleshooting

### Import Errors
```bash
# Ensure you're in the correct directory
cd /path/to/travel-hr-buddy
python3 main.py
```

### State File Issues
```bash
# Delete state file to reset
rm nautilus_state.json
```

### Log File Too Large
```bash
# Clear logs
> nautilus_logs.txt
# or delete
rm nautilus_logs.txt
```

### Module Not Found
```python
# Use absolute imports from project root
from modules.decision_core import DecisionCore
from core.logger import log_event
```

## ⚡ Performance Tips

1. **Logging**: Logs are appended, consider log rotation for production
2. **State**: State file is overwritten on each save
3. **PDF Export**: Uses text format, add reportlab for real PDFs
4. **Memory**: All modules are lightweight, no heavy dependencies

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-20 | Initial release |

## 📞 Support

- **Repository**: https://github.com/RodrigoSC89/travel-hr-buddy
- **Issues**: https://github.com/RodrigoSC89/travel-hr-buddy/issues

---

**Quick Start:** `python3 main.py` → Select option → Follow prompts → Done! 🎉
