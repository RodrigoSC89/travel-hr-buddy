# Decision Core Module - User Guide

## Overview

The **Decision Core** is a Python-based intelligent command center for Nautilus One that orchestrates operational modules for maritime, offshore, and industrial operations. It acts as the "brain" of the system, interpreting operator commands and executing appropriate modules while maintaining state persistence and comprehensive logging.

## Architecture

```
Frontend (TypeScript/React) → Backend (Supabase) → Decision Core (Python) ✨
                                                           ↓
main.py → DecisionCore → [PDF Export | FMEA Auditor | SGSO Connector | Sub-Modules]
                                                                    ↓
                                                  [ASOG Review | Risk Forecast]
```

## Features

### 1. Interactive CLI Menu System

The Decision Core provides an intuitive command-line interface for operators:

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

### 2. State Persistence

The system maintains state across sessions via `nautilus_state.json`:

```json
{
  "ultima_acao": "Exportar PDF",
  "timestamp": "2025-10-20T14:03:41.492Z"
}
```

### 3. Event Logging

Comprehensive logging of all operations to `nautilus_logs.txt`:

```
[2025-10-20 14:03:41] Decision Core inicializado
[2025-10-20 14:03:41] Iniciando Auditoria Técnica FMEA...
[2025-10-20 14:03:41] Auditoria FMEA concluída: 12 modos de falha identificados
```

## Modules

### 📄 PDF Exporter

Exports IA reports and analyses as PDF documents:
- Automatic report detection and conversion
- UTF-8 encoding for international characters
- Support for multiple report types

### 🧠 FMEA Auditor

Performs Failure Mode and Effects Analysis for technical audits:
- Analyzes 12 critical system components
- Calculates RPN (Risk Priority Number) scores
- Classifies by criticality: High, Medium, Low
- Generates actionable recommendations

**Example Output:**
```
✅ Auditoria FMEA concluída:
   • Total de modos de falha: 12
   • Criticidade Alta: 2
   • Criticidade Média: 6
   • Criticidade Baixa: 4
```

### 🔗 SGSO Connector

Integrates with Sistema de Gestão de Segurança Operacional:
- Real-time log synchronization
- Connection state management
- Automatic reconnection handling

**Example Output:**
```
✅ Conectado ao SGSO com sucesso!
   • Logs sincronizados: 42
   • Registros atualizados: 15
```

### ✅ ASOG Review

Conducts Assessment of Operational Goals reviews:
- Evaluates 8 operational areas
- Calculates compliance percentages
- Identifies non-conforming areas
- Generates improvement recommendations

**Example Output:**
```
✅ ASOG Review concluída:
   • Total de áreas: 8
   • Conformidade média: 90%
   • Áreas conformes: 7
   • Áreas não conformes: 1
   • Status geral: Compliant
```

### 📊 Risk Forecast

Analyzes and predicts operational risks for next 30 days:
- Covers 7 risk categories
- Probability × Impact scoring
- Priority classification (High, Medium, Low)
- Generates prioritized recommendations

**Risk Categories:**
- Meteorológico (Weather)
- Técnico (Technical)
- Recursos Humanos (HR)
- Conformidade (Compliance)
- Logístico (Logistics)
- Segurança (Safety)
- Operacional (Operational)

**Example Output:**
```
✅ Risk Forecast concluído:
   • Total de riscos: 7
   • Prioridade Alta: 2
   • Prioridade Média: 3
   • Prioridade Baixa: 2
   • Score médio de risco: 5.43
```

## Installation

### Requirements

- Python 3.12+
- No external dependencies (uses Python standard library only)

### Setup

```bash
# Navigate to project directory
cd /path/to/travel-hr-buddy

# Verify Python version
python3 --version

# Run Decision Core
python3 main.py
```

## Usage

### Starting the System

```bash
python3 main.py
```

### Menu Navigation

1. **Export PDF Report** - Export available reports as PDF documents
2. **Run FMEA Audit** - Execute complete FMEA technical audit
3. **Connect to SGSO** - Establish connection and sync logs
4. **Access Sub-Modules** - Access ASOG Review and Risk Forecast
5. **Exit** - Safely shutdown the system

### Sub-Modules Menu

From the main menu, select option 4 to access:

1. **Risk Forecast** - 30-day risk analysis and predictions
2. **ASOG Review** - Operational goals assessment
3. **Return** - Back to main menu

## Generated Files

The Decision Core generates several files during operation:

### State File
- **File:** `nautilus_state.json`
- **Purpose:** Maintains system state across sessions
- **Size:** ~80 bytes

### Log File
- **File:** `nautilus_logs.txt`
- **Purpose:** Comprehensive event logging
- **Format:** `[timestamp] message`

### Report Files
- **FMEA Reports:** `relatorio_fmea_YYYYMMDD_HHMMSS.json`
- **ASOG Reports:** `relatorio_asog_YYYYMMDD_HHMMSS.json`
- **Forecast Reports:** `relatorio_forecast_YYYYMMDD_HHMMSS.json`
- **PDF Exports:** `relatorio_*.pdf`

## Examples

### Example 1: Running FMEA Audit

```bash
$ python3 main.py

🧭 NAUTILUS ONE - DECISION CORE
============================================================

🔧 Deseja seguir com:
...
👉 Escolha uma opção (1-5): 2

🧠 Executando Auditoria Técnica FMEA...

✅ Auditoria FMEA concluída:
   • Total de modos de falha: 12
   • Criticidade Alta: 2
   • Criticidade Média: 6
   • Criticidade Baixa: 4
```

### Example 2: Connecting to SGSO

```bash
👉 Escolha uma opção (1-5): 3

🔗 Conectando ao SGSO...
✅ Conectado ao SGSO com sucesso!
   • Logs sincronizados: 42
   • Registros atualizados: 15
```

### Example 3: Risk Forecast

```bash
👉 Escolha uma opção (1-5): 4

🧾 SUB-MÓDULOS DISPONÍVEIS
============================================================
...
👉 Escolha uma opção (1-3): 1

📊 Executando Risk Forecast...

✅ Risk Forecast concluído:
   • Total de riscos: 7
   • Prioridade Alta: 2
   • Prioridade Média: 3
   • Prioridade Baixa: 2
   • Score médio de risco: 5.43
```

## Programmatic Usage

You can also use the Decision Core programmatically:

```python
from modules.decision_core import DecisionCore

# Initialize Decision Core
dc = DecisionCore()

# Run FMEA Audit
audit_result = dc.run_fmea_audit()
print(f"Total failure modes: {audit_result['statistics']['total_modes']}")

# Run Risk Forecast
forecast_result = dc.run_risk_forecast(30)
print(f"Total risks: {forecast_result['total_risks']}")

# Export PDF
pdf_file = dc.export_pdf_report()
print(f"PDF exported: {pdf_file}")

# Get system state
state = dc.get_state()
print(f"Last action: {state['ultima_acao']}")

# Get recent logs
logs = dc.get_logs(10)
for log in logs:
    print(log, end='')
```

## Troubleshooting

### Python Version Issues

If you encounter version-related errors:

```bash
# Check Python version
python3 --version

# Should be Python 3.12 or higher
# If not, install the latest version
```

### Import Errors

If you encounter import errors:

```bash
# Ensure you're in the correct directory
cd /path/to/travel-hr-buddy

# Verify file structure
ls -la core/
ls -la modules/
```

### Permission Issues

If you encounter permission errors:

```bash
# Make main.py executable
chmod +x main.py

# Run with python3
python3 main.py
```

## Best Practices

1. **Regular Monitoring** - Check logs frequently for system health
2. **State Persistence** - The system automatically saves state after each operation
3. **Report Management** - Regularly export and archive reports
4. **SGSO Sync** - Maintain regular synchronization with SGSO
5. **Risk Reviews** - Run forecasts regularly for proactive risk management

## Performance

- **Module Execution Time:** < 5 seconds per module
- **Memory Usage:** ~30 MB
- **Log File Growth:** ~1-2 KB per session
- **State File Size:** ~80 bytes

## Security

- **No External Dependencies** - Reduces attack surface
- **Local File Operations** - All data stored locally
- **UTF-8 Encoding** - Proper character handling
- **Error Handling** - Comprehensive exception management

## Support

For issues or questions:
1. Check the logs: `nautilus_logs.txt`
2. Review state: `nautilus_state.json`
3. Consult architecture documentation
4. Contact system administrator

## Version History

- **v1.0.0** (2025-10-20) - Initial release
  - Complete FMEA auditor
  - ASOG review module
  - Risk forecasting
  - PDF export capabilities
  - SGSO integration
  - Interactive CLI menu
  - State persistence
  - Comprehensive logging

## License

Part of Nautilus One - MIT License © 2025
