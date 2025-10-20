# 🧭 Decision Core - Nautilus One

## Overview

The Decision Core is the intelligent command center for Nautilus One - a Python-based module that orchestrates operational modules for maritime, offshore, and industrial operations. It acts as the "brain" of the system, interpreting operator commands and executing appropriate modules while maintaining state persistence and comprehensive logging.

## Architecture

```
main.py → DecisionCore → [PDF Export | FMEA Auditor | SGSO Connector | Sub-Modules]
                                                                    ↓
                                                  [ASOG Review | Risk Forecast]
```

## Key Features

### 1. 📄 PDF Export
- Exports IA reports and analyses as PDF documents
- Supports custom output filenames
- Automatic timestamping
- Comprehensive logging of export operations

### 2. 🧠 FMEA Auditor
- Performs Failure Mode and Effects Analysis
- Identifies critical failure modes
- Categorizes risks by severity
- Generates detailed audit reports
- Provides actionable recommendations

### 3. 🔗 SGSO Connector
- Integrates with Sistema de Gestão de Segurança Operacional
- Synchronizes operational logs
- Maintains connection state
- Real-time data exchange

### 4. 📊 Risk Forecast
- Analyzes operational risks
- Predicts future risk scenarios
- Categorizes risks by type and severity
- Provides mitigation recommendations
- Generates comprehensive forecast reports

### 5. 📋 ASOG Review
- Conducts Assessment of Operational Goals
- Evaluates compliance levels
- Identifies non-conformities
- Generates action plans
- Tracks review status

## Installation

### Prerequisites
- Python 3.12+ (uses standard library only)
- No external dependencies required

### Setup
1. Ensure Python 3.12+ is installed:
   ```bash
   python3 --version
   ```

2. Clone the repository (if not already done):
   ```bash
   git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
   cd travel-hr-buddy
   ```

3. The Decision Core is ready to run - no additional installation needed!

## Usage

### Starting the Decision Core

```bash
python3 main.py
```

### Interactive Menu

The system presents an intuitive command-line interface:

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

### Example Workflow

#### 1. Export PDF Report
```bash
# Select option 1
1

# System will:
# - Create or use existing report file
# - Generate PDF export
# - Log the operation
# - Save system state
```

#### 2. Run FMEA Audit
```bash
# Select option 2
2

# System will:
# - Execute FMEA analysis
# - Identify failure modes
# - Generate audit report
# - Save results to JSON file
```

#### 3. Connect to SGSO
```bash
# Select option 3
3

# System will:
# - Establish SGSO connection
# - Synchronize logs
# - Update connection status
```

#### 4. Run Sub-Modules
```bash
# Select option 4
4

# Then choose:
# 1 - Risk Forecast
# 2 - ASOG Review
```

## File Structure

```
.
├── main.py                      # System entry point
├── core/                        # Core utilities
│   ├── __init__.py
│   ├── logger.py               # Event logging
│   ├── pdf_exporter.py         # PDF generation
│   └── sgso_connector.py       # SGSO integration
├── modules/                     # Operational modules
│   ├── __init__.py
│   ├── decision_core.py        # Main controller
│   ├── audit_fmea.py          # FMEA auditor
│   ├── asog_review.py         # ASOG review
│   └── forecast_risk.py       # Risk forecasting
└── requirements.txt            # Python dependencies
```

## Generated Files

### State Persistence
- **nautilus_state.json**: Maintains system state across sessions
  ```json
  {
    "ultima_acao": "Exportar PDF",
    "timestamp": "2025-10-20T01:05:42.167Z"
  }
  ```

### Event Logs
- **nautilus_logs.txt**: Comprehensive audit trail
  ```
  [2025-10-20 01:05:42] Exportando relatório: relatorio_fmea_atual.json
  [2025-10-20 01:05:42] PDF exportado com sucesso
  [2025-10-20 01:05:42] Estado atualizado: Exportar PDF
  ```

### Report Files
- **relatorio_fmea_*.json**: FMEA audit results
- **relatorio_forecast_*.json**: Risk forecast analysis
- **relatorio_asog_*.json**: ASOG review results
- **relatorio_export_*.pdf**: Exported PDF reports

## Integration with Nautilus One

The Decision Core works alongside the existing TypeScript/React frontend:

- **Frontend**: TypeScript/React (Vite) for user interfaces
- **Backend**: Supabase for data persistence
- **Decision Core**: Python for operational command and control

This hybrid architecture leverages the strengths of both ecosystems.

## State Management

The Decision Core maintains state persistence through JSON files:

- Automatic state saving after each operation
- State restoration on startup
- Timestamp tracking for all operations
- Action history maintenance

## Logging

All operations are logged with timestamps:

- Operation start/end logging
- Success/failure tracking
- Error reporting
- Audit trail maintenance

## Extending the System

To add new operational modules:

1. Create a new module file in `modules/`
2. Implement the module class with appropriate methods
3. Import and integrate in `decision_core.py`
4. Add menu option in `show_menu()` or `show_sub_modules()`
5. Implement logging using the NautilusLogger

### Example: Adding a New Module

```python
# modules/my_new_module.py
class MyNewModule:
    def __init__(self, logger=None):
        self.logger = logger
    
    def execute(self):
        if self.logger:
            self.logger.log("Executing my new module...")
        # Implementation here
        return results
```

Then integrate in `decision_core.py`:

```python
from modules.my_new_module import MyNewModule

class DecisionCore:
    def __init__(self, state_file="nautilus_state.json"):
        # ... existing code ...
        self.my_new_module = MyNewModule(self.logger)
```

## Technical Details

- **Language**: Python 3.12+
- **Dependencies**: None (uses Python standard library only)
- **Architecture**: Modular, extensible design
- **State Management**: JSON-based persistence
- **Logging**: File-based append-only logs
- **Character Encoding**: UTF-8 for international support

## Best Practices

1. **Always check logs**: Review `nautilus_logs.txt` for operation history
2. **Monitor state file**: Track system state via `nautilus_state.json`
3. **Review reports**: Analyze generated JSON reports regularly
4. **Backup data**: Keep backups of important report files
5. **Sequential operations**: Complete one operation before starting another

## Troubleshooting

### Common Issues

**Issue**: Module not found error
```bash
ModuleNotFoundError: No module named 'core'
```
**Solution**: Ensure you're running from the repository root directory

**Issue**: Permission denied when writing files
```bash
PermissionError: [Errno 13] Permission denied
```
**Solution**: Check write permissions in the current directory

**Issue**: State file corrupted
```bash
json.JSONDecodeError: Expecting value
```
**Solution**: Delete `nautilus_state.json` and restart the system

## Support

For issues, questions, or contributions, please refer to:
- Repository: https://github.com/RodrigoSC89/travel-hr-buddy
- Documentation: See additional guides in the repository
- Architecture: See `DECISION_CORE_ARCHITECTURE.md`
- Quick Start: See `DECISION_CORE_QUICKSTART.md`

## License

This module is part of the Nautilus One project. See the main repository for license information.
