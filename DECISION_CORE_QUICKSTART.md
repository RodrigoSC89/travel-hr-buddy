# Decision Core - 5-Minute Quick Start Guide

Get up and running with the Nautilus One Decision Core in under 5 minutes!

## Prerequisites

✅ Python 3.8 or higher  
✅ Terminal/Command Prompt access  
✅ No external dependencies needed!

## Installation

The Decision Core uses only Python's standard library - no pip install required!

### 1. Verify Python Installation

```bash
python3 --version
# Should output: Python 3.8.x or higher
```

### 2. Navigate to Project Directory

```bash
cd /path/to/travel-hr-buddy
```

### 3. Verify Files Are Present

```bash
ls -la main.py core/ modules/
# Should see:
# - main.py
# - core/ (with logger.py, pdf_exporter.py, sgso_connector.py)
# - modules/ (with decision_core.py, audit_fmea.py, asog_review.py, forecast_risk.py)
```

## Quick Test Run

### Run the Test Suite

Verify everything works:

```bash
python3 test_decision_core.py
```

Expected output:
```
Ran 14 tests in 0.003s
OK
```

✅ All tests passed? You're ready to go!

## First Interactive Session

### Start the Decision Core

```bash
python3 main.py
```

You'll see the welcome banner:

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║            NAUTILUS ONE - DECISION CORE SYSTEM                ║
    ║                                                               ║
    ║    Python Backend for Intelligent Decision-Making             ║
    ║    Maritime, Offshore & Industrial Operations                 ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝

🧭 NAUTILUS ONE - DECISION CORE
============================================================

🔧 Deseja seguir com:

1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
5. 🚪 Sair

Digite sua escolha (1-5):
```

### Try Each Module

#### Option 2: Run FMEA Audit

```
Digite sua escolha (1-5): 2
```

The system will:
- Analyze 12 critical system components
- Calculate Risk Priority Numbers (RPN)
- Classify risks: Critical, High, Medium, Low
- Generate recommendations
- Save results to `relatorio_fmea.json`

Output example:
```
🧠 Iniciando Auditoria Técnica FMEA...

Análise de Modos de Falha (FMEA):
- Total de modos identificados: 12
- Críticos: 2
- Altos: 6
- Médios: 4

Resultados salvos em: relatorio_fmea.json
```

#### Option 4: Risk Forecast

```
Digite sua escolha (1-5): 4
```

Then select:
```
Escolha um módulo:
1. 🔮 Forecast de Risco (30 dias)
2. ✅ ASOG Review

Sua escolha: 1
```

The system will:
- Analyze 7 risk categories
- Generate 30-day predictions
- Create risk matrix (Critical, High, Medium, Low)
- Provide strategic recommendations
- Save results to `relatorio_forecast.json`

Output example:
```
🔮 Gerando Forecast de Risco...

Previsão de Riscos (próximos 30 dias):
- Riscos Críticos: 2
- Riscos Altos: 3
- Riscos Médios: 5
- Riscos Baixos: 7

Resultados salvos em: relatorio_forecast.json
```

#### Option 4: ASOG Review

```
Digite sua escolha (1-5): 4
```

Then select:
```
Sua escolha: 2
```

The system will:
- Review 8 operational safety areas
- Calculate compliance percentages
- Identify non-conforming areas
- Generate improvement recommendations
- Save results to `relatorio_asog.json`

Output example:
```
✅ Realizando ASOG Review...

ASOG Review - Safety & Operational Goals:
- Taxa de Conformidade: 90%
- Áreas Conformes: 7
- Áreas que Requerem Atenção: 1

Resultados salvos em: relatorio_asog.json
```

#### Option 1: Export to PDF

```
Digite sua escolha (1-5): 1
```

The system will:
- Detect available JSON reports
- Convert to text format
- Generate PDF (if tools available)
- Save to `relatorio_*.pdf`

#### Option 3: SGSO Connection

```
Digite sua escolha (1-5): 3
```

The system will:
- Establish connection to SGSO system
- Synchronize logs
- Display connection status

#### Option 5: Exit

```
Digite sua escolha (1-5): 5
```

Gracefully exits the system.

## Understanding Generated Files

After running modules, you'll find these files:

### Logs File
```bash
cat nautilus_logs.txt
```

Contains timestamped events:
```
[2025-10-20T14:03:41.492Z] [INFO] Decision Core initialized
[2025-10-20T14:03:42.123Z] [INFO] Executing FMEA audit
[2025-10-20T14:03:43.456Z] [INFO] FMEA audit completed: 12 failure modes identified
```

### State File
```bash
cat nautilus_state.json
```

Maintains system state:
```json
{
  "ultima_acao": "Auditoria FMEA",
  "timestamp": "2025-10-20T14:03:41.492Z"
}
```

### Report Files
```bash
ls -la relatorio_*.json
# relatorio_fmea.json - FMEA audit results
# relatorio_asog.json - ASOG review results
# relatorio_forecast.json - Risk forecast results
```

## Monitor Logs in Real-Time

Open a second terminal and watch logs as they happen:

```bash
tail -f nautilus_logs.txt
```

## Programmatic Usage

Instead of the interactive CLI, you can call modules directly in Python:

```python
#!/usr/bin/env python3

from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast

# Run FMEA audit
print("Running FMEA audit...")
fmea_results = run_fmea_audit()
print(f"Identified {fmea_results['summary']['total']} failure modes")
print(f"Critical risks: {fmea_results['summary']['critico']}")

# Run ASOG review
print("\nRunning ASOG review...")
asog_results = run_asog_review()
print(f"Compliance rate: {asog_results['compliance']['taxa_conformidade']:.1f}%")

# Run 30-day risk forecast
print("\nRunning risk forecast...")
forecast_results = run_risk_forecast(timeframe=30)
print(f"Critical risks: {len(forecast_results['risk_matrix']['critico'])}")
print(f"High risks: {len(forecast_results['risk_matrix']['alto'])}")
```

Save as `my_script.py` and run:
```bash
python3 my_script.py
```

## Common Workflows

### Daily Safety Check
```bash
python3 main.py
# Choose: 2 (FMEA Audit)
# Choose: 4 → 2 (ASOG Review)
# Choose: 1 (Export to PDF)
# Choose: 5 (Exit)
```

### Weekly Risk Assessment
```bash
python3 main.py
# Choose: 4 → 1 (Risk Forecast)
# Choose: 1 (Export to PDF)
# Choose: 5 (Exit)
```

### Monthly Report Generation
```bash
python3 main.py
# Choose: 2 (FMEA Audit)
# Choose: 4 → 2 (ASOG Review)
# Choose: 4 → 1 (Risk Forecast)
# Choose: 1 (Export all to PDF)
# Choose: 5 (Exit)
```

## Troubleshooting

### Problem: "ModuleNotFoundError"
**Solution**: Make sure you're in the correct directory
```bash
ls -la main.py
# Should show main.py in current directory
```

### Problem: "Permission denied"
**Solution**: Ensure write permissions
```bash
chmod +w .
```

### Problem: Tests failing
**Solution**: Check Python version
```bash
python3 --version
# Needs 3.8+
```

### Problem: Generated files not appearing
**Solution**: Check file permissions and disk space
```bash
ls -la relatorio_*.json
df -h .  # Check disk space
```

## Next Steps

✅ **Read the full documentation**: Check out `DECISION_CORE_README.md` for detailed API reference

✅ **Explore the architecture**: See `DECISION_CORE_ARCHITECTURE.md` for technical deep-dive

✅ **Review validation**: Check `DECISION_CORE_VALIDATION.md` for test coverage details

✅ **Check implementation**: See `DECISION_CORE_IMPLEMENTATION_SUMMARY.md` for complete overview

## Getting Help

- **Issue tracker**: Report bugs and request features
- **Documentation**: Read the comprehensive guides
- **Logs**: Check `nautilus_logs.txt` for error details
- **Test suite**: Run `test_decision_core.py` to verify system health

## Success Checklist

- [x] Python 3.8+ installed
- [x] Files present (main.py, core/, modules/)
- [x] Tests passing (14/14)
- [x] Interactive CLI working
- [x] Modules executing successfully
- [x] Reports generated
- [x] Logs created

🎉 **Congratulations!** You're now ready to use the Nautilus One Decision Core!

## Quick Reference

| Command | Purpose |
|---------|---------|
| `python3 main.py` | Start interactive CLI |
| `python3 test_decision_core.py` | Run test suite |
| `tail -f nautilus_logs.txt` | Monitor logs |
| `cat nautilus_state.json` | View system state |
| `ls relatorio_*.json` | List generated reports |

## License

MIT — © 2025 Nautilus One
