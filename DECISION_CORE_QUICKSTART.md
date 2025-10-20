# Decision Core - 5-Minute Quick Start Guide

## What is Decision Core?

Decision Core is a Python command center for Nautilus One that helps you:
- 🧠 Run FMEA audits to identify system failures
- ✅ Review operational goals (ASOG)
- 📊 Forecast operational risks
- 📄 Export reports as PDFs
- 🔗 Connect to SGSO systems

## Prerequisites

✅ Python 3.12 or higher installed
✅ No additional libraries needed (uses Python standard library)

Check your Python version:
```bash
python3 --version
```

## Installation (30 seconds)

```bash
# Navigate to the project directory
cd /path/to/travel-hr-buddy

# That's it! No pip install needed.
```

## First Run (1 minute)

### Start Decision Core

```bash
python3 main.py
```

### You'll see this menu:

```
🧭 NAUTILUS ONE - DECISION CORE
============================================================

🔧 Deseja seguir com:

1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
5. 🚪 Sair

============================================================

Escolha uma opção (1-5):
```

## Quick Tutorial (3 minutes)

### 1. Run Your First FMEA Audit

**Type:** `2` (press Enter)

**What happens:**
- System analyzes 12 critical components
- Identifies failure modes with RPN scores
- Generates recommendations
- Saves report to `relatorio_fmea_YYYYMMDD_HHMMSS.json`

**Sample Output:**
```
[2025-10-20 13:45:00] Iniciando Auditoria Técnica FMEA...
[2025-10-20 13:45:00] Auditoria FMEA concluída: 12 modos de falha identificados
[2025-10-20 13:45:00] Relatório salvo: relatorio_fmea_20251020_134500.json
```

### 2. Export the Report as PDF

**Type:** `1` (press Enter)

**What happens:**
- Finds the most recent report
- Converts to PDF format
- Saves as `relatorio_*.pdf`

**Sample Output:**
```
[2025-10-20 13:46:00] Exportando relatório: relatorio_fmea_20251020_134500.json
[2025-10-20 13:46:00] PDF exportado com sucesso
```

### 3. Check Operational Risks

**Type:** `4` (Sub-modules menu)
**Then type:** `1` (Risk Forecast)

**What happens:**
- Analyzes risks for next 30 days
- Categorizes by type (Weather, Technical, HR, etc.)
- Calculates probability × impact scores
- Generates prioritized recommendations
- Saves report to `relatorio_forecast_YYYYMMDD_HHMMSS.json`

**Sample Output:**
```
[2025-10-20 13:47:00] Iniciando Risk Forecast...
[2025-10-20 13:47:00] Risk Forecast concluído: 7 riscos identificados
```

### 4. Review Operational Goals

**Type:** `2` (in sub-modules menu)

**What happens:**
- Assesses 8 operational goal areas
- Calculates compliance percentage
- Identifies non-compliant areas
- Generates improvement recommendations
- Saves report to `relatorio_asog_YYYYMMDD_HHMMSS.json`

**Sample Output:**
```
[2025-10-20 13:48:00] Iniciando ASOG Review...
[2025-10-20 13:48:00] ASOG Review concluído: 85.0% de conformidade
```

### 5. Exit the System

**Type:** `3` (back to main menu)
**Then type:** `5` (Exit)

**Sample Output:**
```
👋 Encerrando Decision Core. Até logo!
[2025-10-20 13:49:00] Decision Core encerrado pelo usuário
```

## Generated Files

After running the tutorial, you'll have:

```
📁 Project Directory
├── 📄 nautilus_state.json          # System state
├── 📝 nautilus_logs.txt            # Event log
├── 📊 relatorio_fmea_*.json        # FMEA audit report
├── 📊 relatorio_forecast_*.json    # Risk forecast report
├── 📊 relatorio_asog_*.json        # ASOG review report
└── 📑 relatorio_*.pdf              # PDF exports
```

### View Your Results

**Check the log:**
```bash
cat nautilus_logs.txt
```

**View a JSON report:**
```bash
cat relatorio_fmea_*.json | head -50
```

**View system state:**
```bash
cat nautilus_state.json
```

## Common Use Cases

### Daily Operations Check

```bash
# Run all critical checks
python3 main.py

# Choose options in sequence:
# 2 - Run FMEA Audit
# 4, 1 - Run Risk Forecast  
# 4, 2 - Run ASOG Review
# 1 - Export PDF reports
# 5 - Exit
```

### Weekly Risk Analysis

```bash
# Focus on risk forecasting
python3 main.py

# Choose:
# 4, 1 - Risk Forecast
# 1 - Export PDF
# 5 - Exit
```

### Monthly Compliance Review

```bash
# Focus on ASOG compliance
python3 main.py

# Choose:
# 4, 2 - ASOG Review
# 1 - Export PDF
# 5 - Exit
```

### Emergency Audit

```bash
# Quick FMEA audit
python3 main.py

# Choose:
# 2 - FMEA Audit
# 1 - Export PDF
# 5 - Exit
```

## Understanding the Reports

### FMEA Report Structure

```json
{
  "tipo": "FMEA Audit",
  "timestamp": "2025-10-20T13:45:00",
  "total_modos_falha": 12,
  "criticidade_alta": 2,
  "criticidade_media": 6,
  "criticidade_baixa": 4,
  "modos_falha": [
    {
      "id": 1,
      "componente": "Sistema Hidráulico",
      "modo_falha": "Vazamento de óleo",
      "severidade": 8,
      "ocorrencia": 5,
      "deteccao": 6,
      "rpn": 240,
      "criticidade": "Alta"
    }
  ],
  "recomendacoes": [...]
}
```

**Key Metrics:**
- **RPN**: Risk Priority Number (Severity × Occurrence × Detection)
- **Criticality**: High (RPN ≥ 100), Medium (50-99), Low (< 50)

### Risk Forecast Structure

```json
{
  "tipo": "Risk Forecast",
  "timestamp": "2025-10-20T13:47:00",
  "periodo_analise": "Próximos 30 dias",
  "total_riscos": 7,
  "riscos_criticos": 0,
  "riscos_altos": 2,
  "riscos_identificados": [
    {
      "id": 1,
      "categoria": "Meteorológico",
      "descricao": "Previsão de tempestade tropical",
      "probabilidade": 65,
      "impacto": 85,
      "nivel": "Alto",
      "data_prevista": "2025-10-25"
    }
  ],
  "recomendacoes": [...]
}
```

**Risk Levels:**
- **Crítico**: Probability × Impact ≥ 70%
- **Alto**: 50-69%
- **Médio**: 30-49%
- **Baixo**: < 30%

### ASOG Report Structure

```json
{
  "tipo": "ASOG Review",
  "timestamp": "2025-10-20T13:48:00",
  "conformidade_total": 85.0,
  "areas_conformes": 5,
  "areas_nao_conformes": 3,
  "areas_avaliadas": [
    {
      "area": "Segurança Operacional",
      "meta": "Zero acidentes com afastamento",
      "status_atual": "2 acidentes leves no trimestre",
      "conforme": false,
      "score": 75
    }
  ],
  "recomendacoes": [...]
}
```

**Compliance Score:**
- **Excellent**: ≥ 90%
- **Good**: 80-89%
- **Needs Improvement**: 70-79%
- **Critical**: < 70%

## Tips & Tricks

### 🎯 Best Practices

1. **Run regular audits**: Schedule weekly FMEA audits
2. **Monitor trends**: Compare reports over time
3. **Act on recommendations**: Prioritize high-criticality items
4. **Archive reports**: Keep historical data for analysis

### ⚡ Keyboard Shortcuts

- `Ctrl+C`: Force quit (not recommended - use option 5)
- `Ctrl+D`: EOF signal (exits cleanly)

### 📝 Log Management

**View recent logs:**
```bash
tail -20 nautilus_logs.txt
```

**Search logs:**
```bash
grep "FMEA" nautilus_logs.txt
```

**Archive old logs:**
```bash
mv nautilus_logs.txt nautilus_logs_$(date +%Y%m%d).txt
```

### 🧹 Cleanup

**Remove old reports (older than 90 days):**
```bash
find . -name "relatorio_*.json" -mtime +90 -delete
find . -name "relatorio_*.pdf" -mtime +90 -delete
```

**Reset state:**
```bash
rm nautilus_state.json
```

## Troubleshooting

### Issue: "Permission denied"

**Solution:**
```bash
chmod +x main.py
```

### Issue: "No module named 'core'"

**Solution:**
Make sure you're in the project root directory:
```bash
cd /path/to/travel-hr-buddy
python3 main.py
```

### Issue: Python version too old

**Check version:**
```bash
python3 --version
```

**Update Python:**
- Ubuntu/Debian: `sudo apt update && sudo apt install python3.12`
- macOS: `brew install python@3.12`
- Windows: Download from python.org

### Issue: Reports not generating

**Check permissions:**
```bash
ls -la
# Should show write permissions in current directory
```

**Check disk space:**
```bash
df -h .
```

## Next Steps

✅ **You're all set!** You now know how to:
- Start Decision Core
- Run FMEA audits
- Forecast risks
- Review operational goals
- Export reports

### Learn More

- **Full Documentation**: See `DECISION_CORE_README.md`
- **Architecture Details**: See `DECISION_CORE_ARCHITECTURE.md`
- **Implementation Summary**: See `DECISION_CORE_IMPLEMENTATION_SUMMARY.md`
- **Validation Report**: See `DECISION_CORE_VALIDATION.md`

### Advanced Topics

- **Extending modules**: Add your own analysis modules
- **API integration**: Connect to external systems
- **Automation**: Schedule regular reports with cron
- **Database integration**: Store reports in databases

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│    DECISION CORE - QUICK REFERENCE      │
├─────────────────────────────────────────┤
│ Start:     python3 main.py              │
│                                         │
│ Main Menu:                              │
│   1 - Export PDF                        │
│   2 - FMEA Audit                        │
│   3 - SGSO Connect                      │
│   4 - Sub-modules                       │
│   5 - Exit                              │
│                                         │
│ Sub-modules:                            │
│   1 - Risk Forecast                     │
│   2 - ASOG Review                       │
│   3 - Back                              │
│                                         │
│ Files:                                  │
│   nautilus_state.json - State           │
│   nautilus_logs.txt - Logs              │
│   relatorio_*.json - Reports            │
│   relatorio_*.pdf - PDFs                │
└─────────────────────────────────────────┘
```

## Support

Need help? Check:
1. Error messages in `nautilus_logs.txt`
2. Full README: `DECISION_CORE_README.md`
3. Architecture guide: `DECISION_CORE_ARCHITECTURE.md`

---

**Version**: 1.0.0  
**Last Updated**: October 20, 2025  
**Status**: ✅ Production Ready
