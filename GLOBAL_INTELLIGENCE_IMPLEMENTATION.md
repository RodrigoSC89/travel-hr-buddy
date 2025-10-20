# 🌍 Nautilus Global Intelligence - Implementation Guide

**Phase 5 (2026-2027): "Um sistema que não apenas opera — ele aprende com o mar."**

## 📋 Executive Summary

The **Global Intelligence** module represents Phase 5 of the Nautilus One ecosystem. It provides fleet-wide AI learning, risk prediction, and automated alerting capabilities across all vessels.

### Key Capabilities

- ✅ **Fleet Data Aggregation** - Collects telemetry from all vessels via BridgeLink
- ✅ **Global ML Training** - Continuous learning from operational data
- ✅ **Risk Forecasting** - Predictive analytics for compliance and failure
- ✅ **Automated Alerting** - Proactive notification of critical patterns
- ✅ **Corporate Dashboard** - Unified view of fleet health and risk

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BridgeLink API                            │
│              (Fleet Data Aggregation)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Global Intelligence Core                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ gi_sync  │gi_trainer│gi_forecast│gi_dashboard│gi_alerts│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
    ┏━━━━━━━┓  ┏━━━━━━━┓  ┏━━━━━━━┓
    ┃PEO-DP ┃  ┃  MMI  ┃  ┃ Vault ┃
    ┃Intel. ┃  ┃ System┃  ┃  IA   ┃
    ┗━━━━━━━┛  ┗━━━━━━━┛  ┗━━━━━━━┛
```

## 📦 Module Structure

```
modules/
├── core/
│   ├── __init__.py          # Core package initialization
│   └── logger.py            # Centralized logging system
│
└── global_intelligence/
    ├── __init__.py          # Package initialization
    ├── gi_core.py           # Main orchestration & workflow
    ├── gi_sync.py           # Fleet data collection (BridgeLink)
    ├── gi_trainer.py        # ML model training & evaluation
    ├── gi_forecast.py       # Multi-vessel risk forecasting
    ├── gi_dashboard.py      # Corporate dashboard display
    ├── gi_alerts.py         # Systemic risk detection & alerting
    ├── fleet_profiles.json  # Fleet configuration & profiles
    ├── demo.py              # Demonstration script
    └── README.md            # Module documentation
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From project root
pip install -r modules/requirements.txt
```

### 2. Run Demo

```bash
# From project root
python3 modules/global_intelligence/demo.py
```

### 3. Basic Usage

```python
from modules.global_intelligence.gi_core import GlobalIntelligence

# Initialize and run complete workflow
gi = GlobalIntelligence()
gi.executar()
```

## 🔌 Integration Points

### 1. BridgeLink Integration

**Endpoint**: `https://bridge.nautilus/api/fleet_data`

**Expected Response Format**:
```json
[
  {
    "embarcacao": "Vessel Name",
    "score_peodp": 92.5,
    "falhas_dp": 2,
    "tempo_dp": 4320,
    "alertas_criticos": 1,
    "conformidade_ok": 1
  }
]
```

**Configuration**: Edit `fleet_profiles.json` → `integrations.bridge_link`

### 2. PEO-DP Intelligence

**Provides**:
- `score_peodp` - PEO-DP compliance score (0-100)
- `conformidade_ok` - Binary conformity flag (0/1)

### 3. MMI System

**Provides**:
- `falhas_dp` - Number of DP system failures
- `tempo_dp` - Cumulative DP operation time (minutes)

### 4. Vault IA

**Purpose**: Model storage and versioning
**Location**: `modules/global_intelligence/global_model.pkl`

## 📊 Data Flow

```
┌──────────────┐
│  BridgeLink  │ ──┐
└──────────────┘   │
                   │
┌──────────────┐   │   ┌──────────────┐
│   PEO-DP     │───┼──▶│  FleetData   │
└──────────────┘   │   └──────┬───────┘
                   │          │
┌──────────────┐   │          ▼
│     MMI      │ ──┘   ┌──────────────┐
└──────────────┘       │  gi_trainer  │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Trained Model│
                       └──────┬───────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
          ┌──────────────┐        ┌──────────────┐
          │ gi_forecast  │        │  gi_alerts   │
          └──────┬───────┘        └──────┬───────┘
                 │                       │
                 └───────────┬───────────┘
                             ▼
                     ┌──────────────┐
                     │gi_dashboard  │
                     └──────────────┘
```

## 🔧 Configuration

### Fleet Profiles (fleet_profiles.json)

```json
{
  "fleet_config": {
    "version": "1.0.0",
    "total_vessels": 3
  },
  "vessels": [
    {
      "id": "NAU-001",
      "embarcacao": "Vessel Name",
      "tipo": "PSV|AHTS|OSV",
      "dp_class": "DP1|DP2|DP3",
      "score_peodp": 0-100,
      "falhas_dp": 0+,
      "tempo_dp": 0+,
      "alertas_criticos": 0+,
      "conformidade_ok": 0|1
    }
  ],
  "integrations": {
    "bridge_link": {
      "enabled": true,
      "endpoint": "API_ENDPOINT",
      "sync_interval_minutes": 15
    }
  }
}
```

## 📈 Risk Assessment

### Risk Levels

| Level | Range | Status | Action |
|-------|-------|--------|--------|
| 🟢 Low | 0-40% | Normal operation | Monitor |
| 🟡 Moderate | 41-70% | Attention recommended | Review |
| 🔴 High | 71-80% | Intervention needed | Act |
| 🚨 Critical | 81-100% | Immediate action | Emergency |

### Monitored Metrics

1. **score_peodp** - PEO-DP compliance score
2. **falhas_dp** - DP system failure count
3. **tempo_dp** - Cumulative DP operation time
4. **alertas_criticos** - Active critical alerts

## 🧪 Testing

### Unit Testing

```bash
# Test individual components
python3 -c "
from modules.global_intelligence.gi_sync import FleetCollector
collector = FleetCollector()
print('✅ FleetCollector initialized')
"
```

### Integration Testing

```bash
# Run full demo with sample data
python3 modules/global_intelligence/demo.py
```

### Validation Checklist

- [ ] Dependencies installed successfully
- [ ] Fleet data collection working
- [ ] Model training completes without errors
- [ ] Predictions generated correctly
- [ ] Dashboard displays properly
- [ ] Alerts triggered for high-risk vessels
- [ ] Logs written to nautilus.log

## 🔐 Security Considerations

1. **Data Encryption**
   - All BridgeLink communications use HTTPS
   - API endpoints require authentication

2. **Model Security**
   - Trained models are versioned and auditable
   - Access controlled via file permissions

3. **Logging**
   - All operations logged to `nautilus.log`
   - Sensitive data excluded from logs

4. **Access Control**
   - Integration with Supabase RLS
   - Role-based permissions enforced

## 📝 Operational Guidelines

### Daily Operations

1. **Automated Sync** (Every 15 minutes)
   - BridgeLink collects fleet data
   - Global Intelligence processes updates
   - Alerts generated for critical issues

2. **Model Retraining** (Daily at 02:00 UTC)
   - Accumulate previous day's data
   - Retrain global model
   - Deploy updated predictions

3. **Reporting** (Weekly)
   - Fleet compliance summary
   - Risk trend analysis
   - Anomaly detection report

### Manual Operations

```bash
# Force data collection
python3 -c "
from modules.global_intelligence.gi_sync import FleetCollector
FleetCollector().coletar_dados()
"

# Retrain model on-demand
python3 -c "
from modules.global_intelligence.gi_trainer import GlobalTrainer
import json
with open('modules/global_intelligence/fleet_profiles.json') as f:
    data = json.load(f)['vessels']
GlobalTrainer().treinar(data)
"

# Generate forecast report
python3 -c "
from modules.global_intelligence.gi_forecast import GlobalForecaster
import json
with open('modules/global_intelligence/fleet_profiles.json') as f:
    data = json.load(f)['vessels']
print(GlobalForecaster().prever(data))
"
```

## 🚧 Roadmap

### Phase 5.1 (Q1 2027)
- [ ] REST API for external integrations
- [ ] WebSocket support for real-time updates
- [ ] Enhanced dashboard with charts and graphs

### Phase 5.2 (Q2 2027)
- [ ] Time-series forecasting (LSTM/Transformer)
- [ ] Root cause analysis (RCA) automation
- [ ] Multi-model ensemble predictions

### Phase 5.3 (Q3 2027)
- [ ] Integration with third-party systems
- [ ] Mobile app for fleet managers
- [ ] Advanced anomaly detection

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'sklearn'`
**Solution**: Run `pip install -r modules/requirements.txt`

**Issue**: `FileNotFoundError: fleet_profiles.json`
**Solution**: Ensure you're running from project root

**Issue**: Model predictions seem incorrect
**Solution**: Verify training data quality and retrain model

### Getting Help

- 📧 Email: nautilus-dev@example.com
- 📝 Documentation: See `modules/global_intelligence/README.md`
- 🐛 Issues: GitHub Issues tab

## 📄 License

Proprietary - Nautilus Marine Systems © 2026-2027

---

**Last Updated**: October 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
