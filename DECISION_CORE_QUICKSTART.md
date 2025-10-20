# ⚡ Decision Core - Quick Start Guide

Get up and running with Nautilus One Decision Core in 5 minutes!

## Prerequisites

✅ Python 3.12 or higher installed  
✅ Terminal/Command line access  
✅ Repository cloned locally

## Step 1: Verify Python Installation (30 seconds)

```bash
python3 --version
```

Expected output: `Python 3.12.x` or higher

## Step 2: Navigate to Repository (15 seconds)

```bash
cd /path/to/travel-hr-buddy
```

## Step 3: Run Decision Core (15 seconds)

```bash
python3 main.py
```

## Step 4: Use the Interactive Menu (2 minutes)

You'll see the main menu:

```
🧭 NAUTILUS ONE - DECISION CORE
============================================================

🔧 Deseja seguir com:

1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
5. 🚪 Sair
```

## Quick Test: Run FMEA Audit

1. Type `2` and press Enter
2. Wait for the audit to complete
3. Check the generated report file

Expected output:
```
✅ Auditoria FMEA concluída
📊 Resultados salvos em: relatorio_fmea_20251020_120530.json
⚠️  Modos de falha identificados: 12
🔴 Criticidade alta: 2
```

## Quick Test: Export PDF

1. Type `1` and press Enter
2. System generates PDF from the report
3. Check for the PDF file

Expected output:
```
✅ PDF exportado com sucesso: relatorio_export_20251020_120545.pdf
```

## Quick Test: Risk Forecast

1. Type `4` to access sub-modules
2. Type `1` for Risk Forecast
3. Review the risk analysis

Expected output:
```
✅ Análise de riscos concluída
📊 Resultados salvos em: relatorio_forecast_20251020_120600.json
⚠️  Índice de risco geral: Médio-Alto
🔴 Riscos identificados: 3
```

## Step 5: Check Generated Files (1 minute)

Look for these files in your directory:

```bash
ls -la | grep nautilus
ls -la | grep relatorio
```

You should see:
- `nautilus_state.json` - System state
- `nautilus_logs.txt` - Event log
- `relatorio_*.json` - Report files
- `relatorio_*.pdf` - Exported PDFs

## Step 6: Review Logs (1 minute)

```bash
cat nautilus_logs.txt
```

Example log output:
```
[2025-10-20 12:05:30] Decision Core inicializado
[2025-10-20 12:05:42] Iniciando Auditoria Técnica FMEA...
[2025-10-20 12:05:42] Auditoria FMEA concluída
[2025-10-20 12:05:42] Identificados 12 modos de falha
[2025-10-20 12:05:42] Estado atualizado: Auditoria FMEA
```

## Step 7: Review State (30 seconds)

```bash
cat nautilus_state.json
```

Example state:
```json
{
  "ultima_acao": "Auditoria FMEA",
  "timestamp": "2025-10-20T12:05:42.167Z"
}
```

## Common Operations

### Export a Report as PDF
```
Main Menu → 1 (Exportar PDF)
```

### Run FMEA Audit
```
Main Menu → 2 (FMEA Audit)
```

### Connect to SGSO
```
Main Menu → 3 (SGSO Connection)
```

### Run Risk Analysis
```
Main Menu → 4 (Sub-Modules) → 1 (Risk Forecast)
```

### Run ASOG Review
```
Main Menu → 4 (Sub-Modules) → 2 (ASOG Review)
```

### Exit System
```
Main Menu → 5 (Sair)
```

## File Outputs

| File | Description | When Created |
|------|-------------|--------------|
| `nautilus_state.json` | System state | After any operation |
| `nautilus_logs.txt` | Event log | Continuous |
| `relatorio_fmea_*.json` | FMEA audit results | Option 2 |
| `relatorio_forecast_*.json` | Risk forecast | Option 4→1 |
| `relatorio_asog_*.json` | ASOG review | Option 4→2 |
| `relatorio_export_*.pdf` | PDF exports | Option 1 |

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'core'"

**Solution**: Make sure you're in the repository root directory:
```bash
pwd  # Should show .../travel-hr-buddy
ls   # Should show core/ and modules/ directories
```

### Problem: "Permission denied" when creating files

**Solution**: Check directory permissions:
```bash
ls -la
chmod u+w .  # Add write permission if needed
```

### Problem: State file corrupted

**Solution**: Delete and restart:
```bash
rm nautilus_state.json
python3 main.py
```

## Next Steps

📖 **Read the full documentation**:
- `DECISION_CORE_README.md` - Complete user guide
- `DECISION_CORE_ARCHITECTURE.md` - Technical architecture

🔧 **Explore the code**:
- `main.py` - Entry point
- `modules/decision_core.py` - Main controller
- `core/` - Core utilities
- `modules/` - Operational modules

🚀 **Extend the system**:
- Add new modules
- Integrate with APIs
- Customize reports
- Enhance PDF export

## Tips for First-Time Users

1. **Start simple**: Run FMEA audit first (option 2)
2. **Check logs**: Always review `nautilus_logs.txt`
3. **Review outputs**: Open JSON files to see detailed results
4. **Sequential operations**: Complete one task before starting another
5. **State persistence**: System remembers your last action

## Integration with Nautilus One

The Decision Core works alongside:
- **Frontend**: TypeScript/React for UI
- **Backend**: Supabase for data
- **Decision Core**: Python for operations

This creates a powerful hybrid system combining the best of both worlds!

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│   NAUTILUS ONE - DECISION CORE          │
├─────────────────────────────────────────┤
│ START:    python3 main.py               │
│                                         │
│ OPTIONS:                                │
│   1 → PDF Export                        │
│   2 → FMEA Audit                        │
│   3 → SGSO Connect                      │
│   4 → Sub-Modules (Forecast/ASOG)       │
│   5 → Exit                              │
│                                         │
│ FILES:                                  │
│   nautilus_state.json - State           │
│   nautilus_logs.txt - Logs              │
│   relatorio_*.json - Reports            │
│   relatorio_*.pdf - PDF Exports         │
│                                         │
│ DOCS:                                   │
│   DECISION_CORE_README.md               │
│   DECISION_CORE_ARCHITECTURE.md         │
│   DECISION_CORE_QUICKSTART.md (this!)   │
└─────────────────────────────────────────┘
```

## Success Checklist

- [ ] Python 3.12+ installed
- [ ] Repository cloned
- [ ] Navigated to correct directory
- [ ] Run `python3 main.py` successfully
- [ ] Completed at least one operation
- [ ] Verified log file created
- [ ] Verified state file created
- [ ] Reviewed generated reports

## You're Ready! 🚀

You now have a working Decision Core installation. Explore the different modules, review the documentation, and customize it for your needs!

For more detailed information, see:
- `DECISION_CORE_README.md` - Full user guide
- `DECISION_CORE_ARCHITECTURE.md` - Technical details

Happy operating! ⚓
