# 🎯 Decision Core - Usage Examples

## Basic Usage

### Starting the Interactive Menu

```bash
python3 main.py
```

This will launch the interactive Decision Core menu:

```
🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)

Sua escolha: 
```

## Programmatic Usage

### Example 1: Using Decision Core Directly

```python
from modules.decision_core import DecisionCore

# Initialize the Decision Core
nautilus = DecisionCore()

# Check current state
print(f"Last action: {nautilus.state['ultima_acao']}")
print(f"Timestamp: {nautilus.state['timestamp']}")

# Save a new state
nautilus.salvar_estado("Custom Action")
```

### Example 2: Using Individual Modules

```python
# FMEA Audit
from modules.audit_fmea import FMEAAuditor

auditor = FMEAAuditor()
auditor.run()
```

```python
# ASOG Review
from modules.asog_review import ASOGModule

asog = ASOGModule()
asog.start()
```

```python
# Risk Forecast
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
forecast.analyze()
```

### Example 3: Using Core Services

```python
# Logging
from core.logger import log_event

log_event("System started")
log_event("Module loaded successfully")
```

```python
# PDF Export
from core.pdf_exporter import export_report

export_report("audit_report_2025.json")
```

```python
# SGSO Connection
from core.sgso_connector import SGSOClient

client = SGSOClient()
client.connect()
```

## Advanced Usage

### Custom Workflow

```python
from modules.decision_core import DecisionCore
from modules.audit_fmea import FMEAAuditor
from core.logger import log_event
from core.pdf_exporter import export_report

# Initialize
nautilus = DecisionCore()
log_event("Starting custom workflow")

# Run audit
auditor = FMEAAuditor()
auditor.run()
nautilus.salvar_estado("FMEA Audit Completed")

# Export report
export_report("fmea_results.json")
nautilus.salvar_estado("Report Exported")

log_event("Custom workflow completed")
```

### State Management

```python
import json
from modules.decision_core import DecisionCore

# Load current state
nautilus = DecisionCore()

# View state
with open("nautilus_state.json", "r") as f:
    state = json.load(f)
    print(json.dumps(state, indent=2))

# Update state
nautilus.salvar_estado("New Action")
```

### Reading Logs

```python
# Read all logs
with open("nautilus_logs.txt", "r") as f:
    logs = f.readlines()
    for log in logs:
        print(log.strip())

# Read last N logs
with open("nautilus_logs.txt", "r") as f:
    logs = f.readlines()
    last_10 = logs[-10:]
    for log in last_10:
        print(log.strip())
```

## Integration Examples

### Integration with Web API

```python
from flask import Flask, jsonify
from modules.decision_core import DecisionCore

app = Flask(__name__)

@app.route('/api/state')
def get_state():
    nautilus = DecisionCore()
    return jsonify(nautilus.state)

@app.route('/api/audit')
def run_audit():
    from modules.audit_fmea import FMEAAuditor
    auditor = FMEAAuditor()
    auditor.run()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
```

### Integration with Cron Job

```bash
# Add to crontab for daily execution
# Run FMEA audit every day at 2 AM
0 2 * * * cd /path/to/nautilus && python3 -c "from modules.audit_fmea import FMEAAuditor; FMEAAuditor().run()"

# Export reports every Monday at 9 AM
0 9 * * 1 cd /path/to/nautilus && python3 -c "from core.pdf_exporter import export_report; export_report('weekly_report.json')"
```

### Integration with CI/CD

```yaml
# GitHub Actions example
name: Run Nautilus Audit

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      
      - name: Run FMEA Audit
        run: |
          python3 -c "from modules.audit_fmea import FMEAAuditor; FMEAAuditor().run()"
      
      - name: Upload State
        uses: actions/upload-artifact@v2
        with:
          name: nautilus-state
          path: nautilus_state.json
```

## Error Handling

```python
from modules.decision_core import DecisionCore
from core.logger import log_event

try:
    nautilus = DecisionCore()
    nautilus.processar_decisao()
except Exception as e:
    log_event(f"Error occurred: {str(e)}")
    print(f"❌ Error: {e}")
```

## Testing

```python
import unittest
from modules.decision_core import DecisionCore
from core.logger import log_event

class TestDecisionCore(unittest.TestCase):
    
    def test_initialization(self):
        nautilus = DecisionCore()
        self.assertIsNotNone(nautilus.state)
    
    def test_state_save(self):
        nautilus = DecisionCore()
        nautilus.salvar_estado("Test Action")
        self.assertEqual(nautilus.state['ultima_acao'], "Test Action")
    
    def test_logger(self):
        log_event("Test log")
        with open("nautilus_logs.txt", "r") as f:
            content = f.read()
            self.assertIn("Test log", content)

if __name__ == '__main__':
    unittest.main()
```

## Tips & Best Practices

1. **Always log important actions**
   ```python
   from core.logger import log_event
   log_event(f"Starting process: {process_name}")
   ```

2. **Save state after significant operations**
   ```python
   nautilus.salvar_estado("Operation completed successfully")
   ```

3. **Clean up generated files in production**
   ```python
   import os
   if os.path.exists("nautilus_logs.txt"):
       # Archive or delete old logs
       os.rename("nautilus_logs.txt", f"logs/nautilus_{date}.txt")
   ```

4. **Use context managers for file operations**
   ```python
   with open("nautilus_state.json", "r") as f:
       state = json.load(f)
   ```

5. **Handle exceptions gracefully**
   ```python
   try:
       auditor.run()
   except Exception as e:
       log_event(f"Audit failed: {e}")
       raise
   ```
