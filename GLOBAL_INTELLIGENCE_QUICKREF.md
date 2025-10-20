# 🌍 Global Intelligence - Quick Reference

## 🚀 One-Liner Start

```bash
python3 modules/global_intelligence/demo.py
```

## 📦 Installation

```bash
pip install -r modules/requirements.txt
```

## 💻 Basic Usage

### Complete Workflow
```python
from modules.global_intelligence.gi_core import GlobalIntelligence
GlobalIntelligence().executar()
```

### Individual Components

```python
# 1. Collect data
from modules.global_intelligence.gi_sync import FleetCollector
dados = FleetCollector().coletar_dados()

# 2. Train model
from modules.global_intelligence.gi_trainer import GlobalTrainer
GlobalTrainer().treinar(dados)

# 3. Generate forecasts
from modules.global_intelligence.gi_forecast import GlobalForecaster
previsoes = GlobalForecaster().prever(dados)

# 4. Show dashboard
from modules.global_intelligence.gi_dashboard import GlobalDashboard
GlobalDashboard().mostrar(previsoes)

# 5. Analyze alerts
from modules.global_intelligence.gi_alerts import GlobalAlerts
GlobalAlerts().analisar_padroes(previsoes)
```

## 📊 Data Format

### Input
```json
{
  "embarcacao": "Vessel Name",
  "score_peodp": 92.5,
  "falhas_dp": 2,
  "tempo_dp": 4320,
  "alertas_criticos": 1,
  "conformidade_ok": 1
}
```

### Output
```json
{
  "embarcacao": "Vessel Name",
  "risco": 15.32
}
```

## 🎯 Risk Levels

| Icon | Level | Range | Action |
|------|-------|-------|--------|
| 🟢 | Low | 0-40% | Monitor |
| 🟡 | Moderate | 41-70% | Review |
| 🔴 | High | 71-80% | Act |
| 🚨 | Critical | 81-100% | Emergency |

## 🗂️ File Structure

```
modules/
├── core/
│   └── logger.py
└── global_intelligence/
    ├── gi_core.py          # Main orchestrator
    ├── gi_sync.py          # Data collection
    ├── gi_trainer.py       # Model training
    ├── gi_forecast.py      # Risk prediction
    ├── gi_dashboard.py     # Dashboard display
    ├── gi_alerts.py        # Alert system
    ├── fleet_profiles.json # Configuration
    └── demo.py             # Demo script
```

## 🔗 Integrations

- **BridgeLink** - Fleet data aggregation
- **PEO-DP** - Compliance scores
- **MMI** - Maintenance data
- **Vault IA** - Model storage

## 🔧 Configuration

Edit `fleet_profiles.json`:
- Add/remove vessels
- Configure BridgeLink endpoint
- Set sync intervals

## 📝 Logs

Location: `nautilus.log` (project root)

## 🧪 Testing

```bash
# Verify installation
python3 -c "import pandas, sklearn, requests; print('✅ OK')"

# Run demo
python3 modules/global_intelligence/demo.py
```

## 🚨 Troubleshooting

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError` | Run `pip install -r modules/requirements.txt` |
| `FileNotFoundError` | Run from project root |
| Bad predictions | Retrain model with quality data |

## 📚 Documentation

- Full Guide: `GLOBAL_INTELLIGENCE_IMPLEMENTATION.md`
- Module Docs: `modules/global_intelligence/README.md`

---

**Version**: 1.0.0 | **Updated**: Oct 2026
