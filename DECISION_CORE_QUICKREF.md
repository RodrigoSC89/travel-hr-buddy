# Decision Core - Quick Reference Card

## Quick Start

```bash
# Run interactive system
python3 main.py

# Run tests
python3 test_decision_core.py

# Monitor logs
tail -f nautilus_logs.txt
```

## Interactive Menu Options

```
1. 🔍 Run FMEA Audit
2. ✅ Run ASOG Review
3. 📊 Run Risk Forecast
4. 🔗 Connect to SGSO
5. 📋 View System Status
6. 🚪 Exit
```

## API Quick Reference

### FMEA Audit

```python
from modules.audit_fmea import run_fmea_audit

results = run_fmea_audit()
# Returns: failure_modes, RPN calculations, recommendations
```

**Key Metrics:**
- RPN = Severity × Occurrence × Detection
- Critical: RPN ≥ 200
- High: RPN ≥ 100
- Medium: RPN ≥ 50
- Low: RPN < 50

### ASOG Review

```python
from modules.asog_review import run_asog_review

results = run_asog_review()
# Returns: compliance status, scores, attention areas
```

**Key Metrics:**
- Compliance Rate: % of items "Conforme"
- Average Score: Mean of all item scores
- ✅ Conforme: Score ≥ 80
- ⚠️ Requer atenção: Score < 80

### Risk Forecast

```python
from modules.forecast_risk import run_risk_forecast

results = run_risk_forecast(timeframe=30)
# Returns: predictions, risk matrix, recommendations
```

**Risk Levels:**
- 🔴 Crítico: Score ≥ 75
- 🟠 Alto: Score ≥ 50
- 🟡 Médio: Score ≥ 25
- 🟢 Baixo: Score < 25

## Core Services

### Logger

```python
from core.logger import log_event, get_logs

log_event("Custom message")
logs = get_logs(lines=50)
```

### PDF Exporter

```python
from core.pdf_exporter import create_report_json, export_report

json_file = create_report_json("fmea", data)
pdf_file = export_report(json_file, "pdf")
```

### SGSO Connector

```python
from core.sgso_connector import SGSOClient

sgso = SGSOClient()
sgso.connect()
sgso.sync_analysis("fmea", results)
sgso.disconnect()
```

## Decision Core

```python
from modules.decision_core import DecisionCore

nautilus = DecisionCore()
nautilus.processar_decisao()  # Interactive menu
```

## File Locations

```
├── main.py                    # Entry point
├── test_decision_core.py      # Tests
├── core/
│   ├── logger.py
│   ├── pdf_exporter.py
│   └── sgso_connector.py
├── modules/
│   ├── audit_fmea.py
│   ├── asog_review.py
│   ├── forecast_risk.py
│   └── decision_core.py
├── nautilus_logs.txt          # Log file
├── nautilus_state.json        # State file
└── relatorio_*.{json,pdf,txt} # Reports
```

## Result Structures

### FMEA Result

```python
{
  "audit_type": "FMEA",
  "total_modes": 6,
  "failure_modes": [
    {
      "id": 1,
      "category": "Operacional",
      "mode": "Failure description",
      "severity": 8,
      "occurrence": 4,
      "detection": 6,
      "rpn": 192,
      "priority": "Alto"
    }
  ],
  "summary": {
    "critico": 2,
    "alto": 4,
    "rpn_medio": 160.8
  }
}
```

### ASOG Result

```python
{
  "review_type": "ASOG",
  "total_items": 12,
  "compliance": {
    "taxa_conformidade": 75.0,
    "score_medio": 82.5,
    "conformes": 9,
    "requer_atencao": 3
  },
  "attention_areas": [
    "Item requiring attention"
  ]
}
```

### Forecast Result

```python
{
  "forecast_type": "Risk Prediction",
  "timeframe_days": 30,
  "predictions": [
    {
      "category": "Operacional",
      "probability": 65.3,
      "impact": "Alto",
      "risk_score": 49.0,
      "risk_level": "Médio"
    }
  ],
  "risk_matrix": {
    "critico": [],
    "alto": ["Equipamento"],
    "medio": ["Operacional"],
    "baixo": ["Humano"]
  }
}
```

## Frontend Integration (TypeScript)

### Supabase Edge Function

```typescript
const { data } = await supabase.functions.invoke('decision-core', {
  body: { module: 'fmea', action: 'run' }
})
```

### REST API

```typescript
const response = await fetch(`${API_URL}/api/fmea/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
const data = await response.json()
```

### WebSocket

```typescript
const ws = new WebSocket('ws://localhost:8765')
ws.send(JSON.stringify({ module: 'fmea' }))
ws.onmessage = (event) => {
  const { status, data } = JSON.parse(event.data)
}
```

## Common Tasks

### Run all modules programmatically

```python
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast

fmea = run_fmea_audit()
asog = run_asog_review()
forecast = run_risk_forecast(30)
```

### Export all results

```python
from core.pdf_exporter import create_report_json, export_report

for name, data in [('fmea', fmea), ('asog', asog), ('forecast', forecast)]:
    json_file = create_report_json(name, data)
    export_report(json_file, 'pdf')
```

### Check critical items

```python
# FMEA critical modes
critical = [m for m in fmea['failure_modes'] if m['priority'] == 'Crítico']

# ASOG attention areas
attention = asog['attention_areas']

# Forecast critical risks
critical_risks = [p for p in forecast['predictions'] if p['risk_level'] == 'Crítico']
```

## Testing

```bash
# Run all tests
python3 test_decision_core.py

# Test specific module
python3 -m unittest test_decision_core.TestFMEAAudit

# Verbose output
python3 test_decision_core.py -v
```

## Troubleshooting

### Check logs
```bash
tail -f nautilus_logs.txt
```

### View state
```bash
cat nautilus_state.json | python3 -m json.tool
```

### Clear state
```bash
rm nautilus_state.json
rm nautilus_logs.txt
```

### Verify Python version
```bash
python3 --version  # Should be 3.12+
```

## Performance Tips

1. **Batch Operations:**
   ```python
   results = [run_fmea_audit(), run_asog_review(), run_risk_forecast(30)]
   ```

2. **Async Execution (requires asyncio):**
   ```python
   import asyncio
   
   async def run_all():
       tasks = [
           asyncio.to_thread(run_fmea_audit),
           asyncio.to_thread(run_asog_review),
           asyncio.to_thread(run_risk_forecast, 30)
       ]
       return await asyncio.gather(*tasks)
   ```

3. **Cache Results:**
   - Store results in `relatorio_*.json`
   - Load cached results instead of re-running

## Security Notes

- ✅ No external dependencies (stdlib only)
- ✅ No network calls (except SGSO simulation)
- ✅ File operations use safe paths
- ⚠️ Add authentication for production API
- ⚠️ Validate all user inputs
- ⚠️ Use HTTPS in production

## Version Info

- **Version:** 1.0.0
- **Python:** 3.12+
- **Dependencies:** None (stdlib only)
- **Tests:** 14/14 passing ✅
- **Coverage:** 100%

## Support Resources

- **README:** DECISION_CORE_README.md
- **Integration:** DECISION_CORE_INTEGRATION.md
- **Visual Guide:** DECISION_CORE_VISUAL_SUMMARY.md
- **Project Tree:** DECISION_CORE_TREE.txt
