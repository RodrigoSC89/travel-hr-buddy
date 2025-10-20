# Decision Core - Quick Start Guide

Get up and running with Decision Core in 5 minutes! 🚀

## Prerequisites

- Python 3.12+ installed
- Terminal/Command prompt access
- Git (optional, for cloning)

## Step 1: Get the Code

```bash
# Option A: Clone the repository
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Option B: If you already have it
cd /path/to/travel-hr-buddy
```

## Step 2: Verify Python

```bash
# Check Python version
python3 --version

# Should output: Python 3.12.x or higher
```

## Step 3: Run Decision Core

```bash
# Start the system
python3 main.py
```

You should see:

```
🚀 Iniciando Decision Core...
⚙️  Carregando módulos operacionais...
✅ Decision Core inicializado com sucesso!

🧭 NAUTILUS ONE - DECISION CORE
============================================================

🔧 Deseja seguir com:

1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
5. 🚪 Sair
============================================================
```

## Step 4: Try Your First Command

### Option 1: Run FMEA Audit

Type `2` and press Enter:

```
👉 Escolha uma opção (1-5): 2

🧠 Executando Auditoria Técnica FMEA...

✅ Auditoria FMEA concluída:
   • Total de modos de falha: 12
   • Criticidade Alta: 2
   • Criticidade Média: 6
   • Criticidade Baixa: 4
```

### Option 2: Run Risk Forecast

Type `4` then `1`:

```
👉 Escolha uma opção (1-5): 4

🧾 SUB-MÓDULOS DISPONÍVEIS
============================================================

1. 📊 Risk Forecast (Previsão de Riscos - 30 dias)
2. ✅ ASOG Review (Avaliação de Objetivos Operacionais)
3. 🔙 Voltar ao menu principal
============================================================

👉 Escolha uma opção (1-3): 1

📊 Executando Risk Forecast...

✅ Risk Forecast concluído:
   • Total de riscos: 7
   • Prioridade Alta: 2
   • Prioridade Média: 3
   • Prioridade Baixa: 2
   • Score médio de risco: 5.43
```

## Step 5: Check Generated Files

```bash
# View generated files
ls -la *.json *.txt

# Expected output:
# nautilus_state.json      - System state
# nautilus_logs.txt        - Event logs
# relatorio_fmea_*.json    - FMEA reports
# relatorio_forecast_*.json - Forecast reports
```

### View State File

```bash
cat nautilus_state.json
```

Output:
```json
{
  "ultima_acao": "Risk Forecast",
  "timestamp": "2025-10-20T17:45:00.123Z"
}
```

### View Logs

```bash
tail -20 nautilus_logs.txt
```

Output:
```
[2025-10-20 17:44:30] Decision Core inicializado
[2025-10-20 17:44:45] Iniciando Auditoria Técnica FMEA...
[2025-10-20 17:44:45] Auditoria FMEA concluída: 12 modos de falha identificados
[2025-10-20 17:45:00] Iniciando Risk Forecast (próximos 30 dias)...
[2025-10-20 17:45:00] Risk Forecast concluído: 7 riscos identificados
```

## Step 6: Explore All Modules

### 📄 Export PDF

```
👉 Escolha uma opção (1-5): 1

📄 Exportando relatório como PDF...
✅ PDF exportado com sucesso: relatorio_20251020_174500.pdf
```

### 🔗 Connect to SGSO

```
👉 Escolha uma opção (1-5): 3

🔗 Conectando ao SGSO...
✅ Conectado ao SGSO com sucesso!
   • Logs sincronizados: 42
   • Registros atualizados: 15
```

### ✅ ASOG Review

```
👉 Escolha uma opção (1-5): 4
👉 Escolha uma opção (1-3): 2

✅ Executando ASOG Review...

✅ ASOG Review concluída:
   • Total de áreas: 8
   • Conformidade média: 90%
   • Áreas conformes: 7
   • Áreas não conformes: 1
   • Status geral: Compliant
```

## Step 7: Exit Safely

```
👉 Escolha uma opção (1-5): 5

👋 Encerrando Decision Core...
💾 Estado do sistema salvo com sucesso
🔒 Desconectando módulos...
✅ Sistema encerrado. Até logo!
```

## Common Tasks

### Check System Status

```python
python3 -c "
from modules.decision_core import DecisionCore
dc = DecisionCore()
state = dc.get_state()
print(f'Last action: {state.get(\"ultima_acao\", \"None\")}')
print(f'Timestamp: {state.get(\"timestamp\", \"None\")}')
"
```

### View Recent Logs

```python
python3 -c "
from modules.decision_core import DecisionCore
dc = DecisionCore()
logs = dc.get_logs(10)
for log in logs:
    print(log, end='')
"
```

### Run Single Module

```python
# FMEA Audit
python3 -c "
from modules.decision_core import DecisionCore
dc = DecisionCore()
result = dc.run_fmea_audit()
print(f'Total modes: {result[\"statistics\"][\"total_modes\"]}')
"

# Risk Forecast
python3 -c "
from modules.decision_core import DecisionCore
dc = DecisionCore()
result = dc.run_risk_forecast(30)
print(f'Total risks: {result[\"total_risks\"]}')
"

# ASOG Review
python3 -c "
from modules.decision_core import DecisionCore
dc = DecisionCore()
result = dc.run_asog_review()
print(f'Compliance: {result[\"statistics\"][\"compliance_percentage\"]}%')
"
```

## Troubleshooting

### Issue: "Command not found: python3"

**Solution:** Try `python` instead:
```bash
python --version
python main.py
```

### Issue: "ModuleNotFoundError"

**Solution:** Ensure you're in the correct directory:
```bash
pwd
ls -la core/ modules/
```

### Issue: "Permission denied"

**Solution:** Make main.py executable:
```bash
chmod +x main.py
./main.py
```

### Issue: Files not being created

**Solution:** Check write permissions:
```bash
# Test write access
touch test_file.txt && rm test_file.txt
# If this works, Decision Core should work too
```

## Tips & Tricks

### 1. Keyboard Shortcuts

- **Ctrl+C:** Safely exit at any time
- **Enter:** Continue after viewing results

### 2. Running in Background

```bash
# Run and log output
nohup python3 main.py > decision_core.log 2>&1 &
```

### 3. Automated Execution

Create a script for automated runs:

```bash
#!/bin/bash
# run_fmea.sh

cd /path/to/travel-hr-buddy
python3 -c "
from modules.decision_core import DecisionCore
dc = DecisionCore()
result = dc.run_fmea_audit()
print('FMEA completed:', result['status'])
"
```

Make it executable:
```bash
chmod +x run_fmea.sh
./run_fmea.sh
```

### 4. Scheduling with Cron

```bash
# Edit crontab
crontab -e

# Add daily FMEA audit at 2 AM
0 2 * * * cd /path/to/travel-hr-buddy && python3 -c "from modules.decision_core import DecisionCore; DecisionCore().run_fmea_audit()"
```

## Next Steps

Now that you've completed the quick start:

1. **Read the Full Documentation:** See `DECISION_CORE_README.md`
2. **Explore Architecture:** See `DECISION_CORE_ARCHITECTURE.md`
3. **Review Implementation:** See `DECISION_CORE_IMPLEMENTATION_SUMMARY.md`
4. **Check Validation:** See `DECISION_CORE_VALIDATION.md`
5. **Integrate with Frontend:** Connect Decision Core to your React app

## Quick Reference

### File Locations

```
travel-hr-buddy/
├── main.py                    # Start here
├── core/                      # Core utilities
│   ├── logger.py
│   ├── pdf_exporter.py
│   └── sgso_connector.py
├── modules/                   # Operational modules
│   ├── decision_core.py
│   ├── audit_fmea.py
│   ├── asog_review.py
│   └── forecast_risk.py
└── Generated files:
    ├── nautilus_state.json    # System state
    ├── nautilus_logs.txt      # Event logs
    └── relatorio_*.json       # Reports
```

### Command Summary

| Action | Command |
|--------|---------|
| Start system | `python3 main.py` |
| Run FMEA | Select option `2` |
| Connect SGSO | Select option `3` |
| Risk Forecast | Select option `4` then `1` |
| ASOG Review | Select option `4` then `2` |
| Export PDF | Select option `1` |
| Exit | Select option `5` |

### Module Outputs

| Module | Generated File | Format |
|--------|---------------|--------|
| FMEA Audit | `relatorio_fmea_*.json` | JSON |
| ASOG Review | `relatorio_asog_*.json` | JSON |
| Risk Forecast | `relatorio_forecast_*.json` | JSON |
| PDF Export | `relatorio_*.pdf` | PDF-like |
| State | `nautilus_state.json` | JSON |
| Logs | `nautilus_logs.txt` | Text |

## Success! 🎉

You've successfully:
- ✅ Installed and started Decision Core
- ✅ Executed your first modules
- ✅ Generated reports
- ✅ Viewed logs and state
- ✅ Learned basic operations

**Welcome to Nautilus One Decision Core!** 🧭

For detailed documentation, see:
- `DECISION_CORE_README.md` - Complete user guide
- `DECISION_CORE_ARCHITECTURE.md` - Technical details
- `DECISION_CORE_IMPLEMENTATION_SUMMARY.md` - Implementation overview

Need help? Check the logs: `cat nautilus_logs.txt`
