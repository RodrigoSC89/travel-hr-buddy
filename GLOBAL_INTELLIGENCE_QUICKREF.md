# 🌍 Nautilus Global Intelligence - Quick Reference

**Phase 5**: Fleet-wide AI Learning System | **Version**: 1.0.0

## ⚡ Quick Start (30 seconds)

```bash
pip install -r modules/requirements.txt
python3 modules/global_intelligence/demo.py
```

## 📁 Module Structure

```
modules/global_intelligence/
├── gi_core.py           # Main orchestrator
├── gi_sync.py           # Data collection
├── gi_trainer.py        # ML training
├── gi_forecast.py       # Risk prediction
├── gi_dashboard.py      # Dashboard display
├── gi_alerts.py         # Alert system
├── fleet_profiles.json  # Fleet config
└── demo.py             # Demo script
```

## 🔧 Common Commands

### Run Complete Workflow
```bash
python3 modules/global_intelligence/demo.py
```

### Install Dependencies
```bash
pip install -r modules/requirements.txt
```

### Check Logs
```bash
cat nautilus_logs.txt
tail -f nautilus_logs.txt  # Follow in real-time
```

### Verify Model
```bash
ls -lh modules/global_intelligence/global_model.pkl
```

## 💻 Code Examples

### Basic Usage
```python
from modules.global_intelligence.gi_core import GlobalIntelligence

gi = GlobalIntelligence()
gi.executar()
```

### Step-by-Step Execution
```python
from modules.global_intelligence.gi_sync import FleetCollector
from modules.global_intelligence.gi_trainer import GlobalTrainer
from modules.global_intelligence.gi_forecast import GlobalForecaster

# Collect data
collector = FleetCollector()
dados = collector.coletar_dados()

# Train model
trainer = GlobalTrainer()
trainer.treinar(dados)

# Generate predictions
forecaster = GlobalForecaster()
previsoes = forecaster.prever(dados)
```

## 📊 Risk Classification

| Level | Range | Icon | Action |
|-------|-------|------|--------|
| **CRÍTICO** | 81-100% | 🚨 | Immediate action required |
| **ALTO** | 71-80% | 🔴 | High priority |
| **MODERADO** | 41-70% | 🟡 | Monitor closely |
| **BAIXO** | 0-40% | 🟢 | Normal operation |

## 📝 Fleet Data Format

```json
{
  "embarcacao": "Nautilus Explorer",
  "score_peodp": 85,
  "falhas_dp": 1,
  "tempo_dp": 200,
  "alertas_criticos": 0
}
```

**Fields**:
- `embarcacao`: Vessel name
- `score_peodp`: PEO-DP score (0-100)
- `falhas_dp`: DP failure count
- `tempo_dp`: DP operation hours
- `alertas_criticos`: Critical alert count

## 🔗 System Integration

| System | Purpose | Status |
|--------|---------|--------|
| BridgeLink | Fleet data source | ✅ Ready |
| PEO-DP | Compliance scores | ✅ Ready |
| MMI | Maintenance data | ✅ Ready |
| Vault IA | Model storage | 🔄 Planned |
| SGSO | Alert integration | 🔄 Planned |

## 🐛 Troubleshooting

### Missing Dependencies
```bash
pip install pandas numpy scikit-learn joblib requests
```

### Model Not Found
```bash
python3 -c "
from modules.global_intelligence.gi_trainer import GlobalTrainer
from modules.global_intelligence.gi_sync import FleetCollector
trainer = GlobalTrainer()
collector = FleetCollector()
trainer.treinar(collector.coletar_dados())
"
```

### API Timeout
System automatically falls back to local `fleet_profiles.json`

### Import Errors
```bash
# Verify Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python3 modules/global_intelligence/demo.py
```

## 📈 Expected Output

```
🌍 NAUTILUS GLOBAL INTELLIGENCE - DEMONSTRAÇÃO

📥 Carregando dados de exemplo...
✅ 3 embarcações carregadas

🤖 Treinando modelo global...
✅ Modelo global treinado com dados consolidados

📈 Painel Global de Risco e Conformidade:
 - Nautilus Explorer: risco 100.0% 🚨 CRÍTICO
 - Nautilus Endeavor: risco 0.0% 🟢 BAIXO
 - Nautilus Pioneer: risco 100.0% 🚨 CRÍTICO

🚨 ALERTA CRÍTICO: 2 embarcações com risco crítico global
✅ Demonstração concluída com sucesso!
```

## 🔑 Key Files

| File | Purpose | Auto-Generated |
|------|---------|----------------|
| `fleet_profiles.json` | Fleet configuration | No |
| `global_model.pkl` | Trained ML model | Yes |
| `nautilus_logs.txt` | System logs | Yes |

## 📚 Documentation Links

- **[Index](GLOBAL_INTELLIGENCE_INDEX.md)** - Documentation hub
- **[Implementation](GLOBAL_INTELLIGENCE_IMPLEMENTATION.md)** - Full guide
- **[Visual](GLOBAL_INTELLIGENCE_VISUAL_SUMMARY.md)** - Diagrams
- **[Integration](GLOBAL_INTELLIGENCE_INTEGRATION_GUIDE.md)** - TypeScript patterns
- **[Summary](PHASE_5_COMPLETION_SUMMARY.md)** - Project overview

## 🚀 Next Steps

1. Run demo script
2. Review generated logs
3. Examine model predictions
4. Integrate with TypeScript app
5. Configure BridgeLink API

## 📞 Support

- Check logs: `nautilus_logs.txt`
- Verify installation: `pip list | grep -E "(pandas|sklearn)"`
- Test imports: `python3 -c "import modules.global_intelligence.gi_core"`

---

**Quick Access**: [← Index](GLOBAL_INTELLIGENCE_INDEX.md) | [Full Guide →](GLOBAL_INTELLIGENCE_IMPLEMENTATION.md) | [Visual →](GLOBAL_INTELLIGENCE_VISUAL_SUMMARY.md)
