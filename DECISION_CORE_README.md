# Decision Core - Nautilus One Command Center

## Overview

Decision Core is a Python-based intelligent command center for Nautilus One that orchestrates operational modules for maritime, offshore, and industrial operations. It acts as the "brain" of the system, interpreting operator commands and executing appropriate modules while maintaining state persistence and comprehensive logging.

## Features

### 🎯 Core Capabilities

- **Interactive CLI Menu System**: Intuitive command-line interface for operators
- **State Persistence**: Maintains system state across sessions via JSON
- **Event Logging**: Comprehensive audit trail of all operations
- **Modular Architecture**: Clean separation of concerns for easy extension

### 📊 Operational Modules

1. **PDF Exporter** 📄
   - Exports IA reports and analyses as PDF documents
   - Automatic report detection and conversion
   - Timestamp-based file naming

2. **FMEA Auditor** 🧠
   - Performs Failure Mode and Effects Analysis
   - Identifies critical failure modes
   - Generates recommendations based on RPN scores
   - Risk prioritization (Critical/High/Medium/Low)

3. **SGSO Connector** 🔗
   - Integrates with Sistema de Gestão de Segurança Operacional
   - Real-time log synchronization
   - Connection status monitoring

4. **ASOG Review** ✅
   - Assessment of Operational Goals reviews
   - Compliance tracking across operational areas
   - Performance scoring and gap analysis

5. **Risk Forecast** 📊
   - Analyzes and predicts operational risks
   - Multi-category risk assessment (Weather, Technical, HR, Compliance, etc.)
   - Recommendation generation with priority levels

## Installation

### Prerequisites

- Python 3.12 or higher
- No external dependencies (uses Python standard library only)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-hr-buddy
```

2. Verify Python version:
```bash
python3 --version
```

3. The module is ready to use! No pip install required.

## Usage

### Starting the Decision Core

```bash
python3 main.py
```

### Main Menu

When you start Decision Core, you'll see an interactive menu:

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

### Menu Options

#### 1. Export PDF Report 📄

Exports the most recent operational report as a PDF document.

**What it does:**
- Searches for recent report files
- Converts JSON reports to PDF format
- Saves with timestamped filename
- Logs the operation

**Output:** `relatorio_*.pdf`

#### 2. Run FMEA Audit 🧠

Performs a comprehensive Failure Mode and Effects Analysis.

**What it does:**
- Analyzes 12 critical system components
- Calculates RPN (Risk Priority Number) for each failure mode
- Identifies high-criticality items
- Generates actionable recommendations

**Output:** `relatorio_fmea_YYYYMMDD_HHMMSS.json`

**Sample Output:**
```json
{
  "tipo": "FMEA Audit",
  "total_modos_falha": 12,
  "criticidade_alta": 2,
  "criticidade_media": 6,
  "criticidade_baixa": 4,
  "recomendacoes": [...]
}
```

#### 3. Connect to SGSO 🔗

Establishes connection with SGSO and synchronizes logs.

**What it does:**
- Initiates SGSO connection
- Validates connection status
- Synchronizes operational logs
- Maintains connection state

**Use case:** Ensures compliance and operational data synchronization

#### 4. Sub-Modules (Forecast/ASOG) 🧾

Access to specialized analysis modules:

##### Risk Forecast 📊

**What it does:**
- Analyzes operational risks for the next 30 days
- Categorizes risks by type (Weather, Technical, HR, Compliance, etc.)
- Calculates probability and impact scores
- Generates prioritized recommendations

**Output:** `relatorio_forecast_YYYYMMDD_HHMMSS.json`

**Risk Categories:**
- Meteorológico (Weather)
- Operacional (Operational)
- Técnico (Technical)
- Recursos Humanos (Human Resources)
- Compliance
- Logística (Logistics)
- Segurança (Safety)

##### ASOG Review ✅

**What it does:**
- Assesses 8 operational goal areas
- Tracks compliance status
- Calculates overall compliance percentage
- Identifies non-compliant areas
- Generates improvement recommendations

**Output:** `relatorio_asog_YYYYMMDD_HHMMSS.json`

**Assessment Areas:**
- Segurança Operacional (Operational Safety)
- Eficiência de Combustível (Fuel Efficiency)
- Disponibilidade de Equipamentos (Equipment Availability)
- Conformidade Ambiental (Environmental Compliance)
- Treinamento de Tripulação (Crew Training)
- Tempo de Resposta a Emergências (Emergency Response Time)
- Manutenção Preventiva (Preventive Maintenance)
- Documentação Operacional (Operational Documentation)

#### 5. Exit 🚪

Gracefully shuts down the Decision Core system.

## Generated Files

### State File

**File:** `nautilus_state.json`

Stores the current system state:
```json
{
  "ultima_acao": "Exportar PDF",
  "timestamp": "2025-10-20T01:05:42.167Z"
}
```

### Log File

**File:** `nautilus_logs.txt`

Comprehensive event log with timestamps:
```
[2025-10-20 01:05:42] Decision Core inicializado
[2025-10-20 01:05:42] Exportando relatório: relatorio_fmea_atual.json
[2025-10-20 01:05:42] PDF exportado com sucesso
[2025-10-20 01:05:42] Estado atualizado: Exportar PDF
```

### Report Files

**FMEA Reports:** `relatorio_fmea_YYYYMMDD_HHMMSS.json`
**ASOG Reports:** `relatorio_asog_YYYYMMDD_HHMMSS.json`
**Forecast Reports:** `relatorio_forecast_YYYYMMDD_HHMMSS.json`
**PDF Exports:** `relatorio_*.pdf`

## Architecture

```
main.py → DecisionCore → [PDF Export | FMEA Auditor | SGSO Connector | Sub-Modules]
                                                                    ↓
                                                  [ASOG Review | Risk Forecast]
```

### Module Structure

```
.
├── main.py                      # System entry point
├── core/                        # Core utilities
│   ├── __init__.py
│   ├── logger.py                # Event logging
│   ├── pdf_exporter.py          # PDF generation
│   └── sgso_connector.py        # SGSO integration
├── modules/                     # Operational modules
│   ├── __init__.py
│   ├── decision_core.py         # Main controller
│   ├── audit_fmea.py            # FMEA auditor
│   ├── asog_review.py           # ASOG review
│   └── forecast_risk.py         # Risk forecasting
└── requirements.txt             # Dependencies (stdlib only)
```

## Integration with Nautilus One

Decision Core integrates seamlessly with the existing Nautilus One architecture:

```
Frontend (TypeScript/React) → Backend (Supabase) → Decision Core (Python) ✨
```

This creates a powerful hybrid architecture that leverages:
- **Frontend**: TypeScript/React (Vite) for user interfaces
- **Backend**: Supabase for data persistence
- **Decision Core**: Python for operational command and control

## Extension Guide

### Adding a New Module

1. Create a new file in `modules/`:
```python
# modules/new_module.py
class NewModule:
    def __init__(self, logger=None):
        self.logger = logger
    
    def run(self):
        # Your module logic here
        pass
```

2. Import in `decision_core.py`:
```python
from modules.new_module import NewModule
```

3. Add to DecisionCore class:
```python
self.new_module = NewModule(logger=self.logger)
```

4. Add menu option in `show_menu()` or `show_submodule_menu()`

5. Add execution logic in main loop

## Best Practices

### Logging
- All modules should accept a logger instance
- Log important operations and errors
- Use descriptive log messages

### Error Handling
- Wrap risky operations in try-except blocks
- Log errors comprehensively
- Provide user-friendly error messages

### State Management
- Update state after each significant operation
- Use ISO format for timestamps
- Keep state file minimal and JSON-serializable

### File Naming
- Use timestamps for uniqueness: `YYYYMMDD_HHMMSS`
- Use descriptive prefixes: `relatorio_`, `audit_`, etc.
- Maintain consistent encoding: UTF-8

## Troubleshooting

### Common Issues

**Issue:** Permission denied when running main.py
```bash
chmod +x main.py
```

**Issue:** Python version too old
```bash
python3 --version  # Should be 3.12+
```

**Issue:** Generated files not found
- Check current working directory
- Verify write permissions
- Check `.gitignore` for exclusions

### Debug Mode

To enable verbose logging, modify the logger initialization in `decision_core.py`:
```python
self.logger = Logger(log_file="nautilus_logs_debug.txt")
```

## Performance

- **Startup Time**: < 1 second
- **Module Execution**: < 5 seconds per module
- **Memory Usage**: < 50 MB
- **Dependencies**: Zero external dependencies

## Security Considerations

- Generated files contain operational data - ensure proper access controls
- Log files may contain sensitive information - rotate and archive appropriately
- State files should be protected from unauthorized modification
- Consider encryption for sensitive reports

## Maintenance

### Log Rotation

Logs can grow large over time. Implement rotation:
```bash
# Rotate logs older than 30 days
find . -name "nautilus_logs.txt" -mtime +30 -exec mv {} nautilus_logs_archive.txt \;
```

### Cleanup

Remove old generated files:
```bash
# Remove reports older than 90 days
find . -name "relatorio_*.json" -mtime +90 -delete
find . -name "relatorio_*.pdf" -mtime +90 -delete
```

## Support

For issues, questions, or contributions:
- Check the documentation in `DECISION_CORE_ARCHITECTURE.md`
- Review the quick start guide in `DECISION_CORE_QUICKSTART.md`
- See implementation details in `DECISION_CORE_IMPLEMENTATION_SUMMARY.md`

## Version

- **Version**: 1.0.0
- **Python**: 3.12+
- **Status**: ✅ Production Ready
- **Last Updated**: October 20, 2025

## License

See repository LICENSE file for details.
