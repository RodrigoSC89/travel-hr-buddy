# 🚀 Decision Core - Quick Start Guide

## What is Decision Core?

Decision Core is the **intelligent brain** of Nautilus One - a Python-based command center that orchestrates different operational modules for maritime, offshore, and industrial operations.

## 5-Minute Setup

### Prerequisites
```bash
# Check Python version (3.12+ required)
python3 --version
```

### Run the System
```bash
# Navigate to project directory
cd travel-hr-buddy

# Run Decision Core
python3 main.py
```

## Quick Demo

### Example Session
```
🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)

Sua escolha: 1

📄 Exportando relatório PDF de relatorio_fmea_atual.json...
✅ PDF exportado com sucesso!
```

## Module Overview

| Option | Module | Function |
|--------|--------|----------|
| 1 | PDF Exporter | Export IA reports as PDF |
| 2 | FMEA Auditor | Technical failure analysis |
| 3 | SGSO Connector | Connect to safety system |
| 4.1 | ASOG Review | Operational goals assessment |
| 4.2 | Risk Forecast | Risk prediction & analysis |

## What Happens Behind the Scenes?

### 1. State Tracking
Every action is saved to `nautilus_state.json`:
```json
{
    "ultima_acao": "Exportar PDF",
    "timestamp": "2025-10-20T01:05:42.167Z"
}
```

### 2. Event Logging
All events are logged to `nautilus_logs.txt`:
```
[2025-10-20 01:05:42] Exportando relatório: relatorio_fmea_atual.json
[2025-10-20 01:05:42] PDF exportado com sucesso
[2025-10-20 01:05:42] Estado atualizado: Exportar PDF
```

### 3. Module Execution
Each module performs its specific task and returns control to Decision Core.

## Common Use Cases

### Use Case 1: Generate Reports
```bash
# Run Decision Core
python3 main.py

# Select option 1
1

# PDF generated automatically
```

### Use Case 2: Run Technical Audit
```bash
# Run Decision Core
python3 main.py

# Select option 2
2

# FMEA audit runs and completes
```

### Use Case 3: Risk Analysis
```bash
# Run Decision Core
python3 main.py

# Select option 4 (modules menu)
4

# Select option 2 (Risk Forecast)
2

# Risk analysis runs
```

## File Structure

```
travel-hr-buddy/
├── main.py                    # Start here
├── core/                      # Core utilities
│   ├── logger.py
│   ├── pdf_exporter.py
│   └── sgso_connector.py
└── modules/                   # Functional modules
    ├── decision_core.py       # Main controller
    ├── audit_fmea.py
    ├── asog_review.py
    └── forecast_risk.py
```

## Generated Files (Auto-created)

| File | Purpose | Tracked in Git? |
|------|---------|-----------------|
| `nautilus_state.json` | System state | ❌ No |
| `nautilus_logs.txt` | Event logs | ❌ No |

## Troubleshooting

### Issue: "No module named 'core'"
**Solution:** Make sure you're running from the project root directory:
```bash
cd /home/runner/work/travel-hr-buddy/travel-hr-buddy
python3 main.py
```

### Issue: Permission denied
**Solution:** Check file permissions:
```bash
chmod +x main.py
```

### Issue: Python version error
**Solution:** Use Python 3.12+:
```bash
python3 --version  # Should show 3.12 or higher
```

## Next Steps

1. ✅ **Run the demo** - Execute `python3 main.py` and try all options
2. 📖 **Read the docs** - Check `DECISION_CORE_README.md` for detailed info
3. 🏗️ **Understand architecture** - Review `DECISION_CORE_ARCHITECTURE.md`
4. 🔧 **Extend modules** - Add your own modules to the system

## Integration with Nautilus One

Decision Core works **alongside** the main TypeScript/React application:

```
Nautilus One Ecosystem
├── Frontend: TypeScript/React (Vite)
├── Backend: Supabase (PostgreSQL)
└── Decision Core: Python (This module) ⭐
```

## Key Features

✅ **Interactive CLI** - Easy-to-use menu system  
✅ **State Persistence** - Resume from where you left off  
✅ **Full Logging** - Track every action  
✅ **Modular Design** - Easy to extend  
✅ **No Dependencies** - Uses Python standard library  

## Testing

Run all modules to verify installation:
```bash
# Test 1: PDF Export
echo "1" | python3 main.py

# Test 2: FMEA Auditor
echo "2" | python3 main.py

# Test 3: SGSO Connection
echo "3" | python3 main.py

# Test 4: ASOG Module
printf "4\n1\n" | python3 main.py

# Test 5: Risk Forecast
printf "4\n2\n" | python3 main.py
```

All tests should show ✅ success messages.

## Support

For issues or questions:
1. Check `DECISION_CORE_README.md` for detailed documentation
2. Review `DECISION_CORE_ARCHITECTURE.md` for technical details
3. Check the logs in `nautilus_logs.txt` for debugging

---

**Ready to start?** Run `python3 main.py` now! 🚀
