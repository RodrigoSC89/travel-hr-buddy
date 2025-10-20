# 🌍 Nautilus Global Intelligence - Complete Implementation Guide

**Phase 5 (2026-2027): Fleet-wide AI Learning System**

> "Um sistema que não apenas opera — ele aprende com o mar."

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Module Reference](#module-reference)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [API Integration](#api-integration)
8. [ML Model Details](#ml-model-details)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Overview

The Nautilus Global Intelligence system is a Python-based AI platform that consolidates telemetry from the entire Nautilus fleet, trains machine learning models, and generates predictive risk assessments. It represents Phase 5 of the Nautilus One Pro evolution.

### Key Capabilities

- **Fleet Data Aggregation**: Collects data from all vessels via BridgeLink API
- **Machine Learning**: Trains Gradient Boosting models for risk prediction
- **Risk Assessment**: Multi-parameter scoring with 4-level severity classification
- **Automated Alerting**: Pattern detection and threshold-based notifications
- **Corporate Dashboard**: Unified fleet view with real-time status

### Design Principles

1. **Modular Architecture**: Clear separation of concerns
2. **Fault Tolerance**: Graceful degradation with fallback mechanisms
3. **Production Ready**: Comprehensive error handling and logging
4. **Integration First**: Plugin-style design for existing systems

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Global Intelligence Core                  │
│                        (gi_core.py)                         │
└────────────┬────────────────────────────────────┬───────────┘
             │                                    │
    ┌────────▼─────────┐                ┌────────▼─────────┐
    │   Data Layer     │                │  Analytics Layer │
    ├──────────────────┤                ├──────────────────┤
    │  gi_sync.py      │                │  gi_trainer.py   │
    │  (BridgeLink)    │                │  gi_forecast.py  │
    └────────┬─────────┘                └────────┬─────────┘
             │                                    │
    ┌────────▼────────────────────────────────────▼─────────┐
    │              Presentation Layer                       │
    ├───────────────────────────────────────────────────────┤
    │  gi_dashboard.py  │  gi_alerts.py                     │
    └───────────────────────────────────────────────────────┘
             │                                    │
    ┌────────▼─────────┐                ┌────────▼─────────┐
    │   Corporate      │                │  SGSO / BI       │
    │   Dashboard      │                │  Integration     │
    └──────────────────┘                └──────────────────┘
```

### Data Flow

1. **Collection**: `gi_sync.py` → BridgeLink API → fleet_profiles.json
2. **Training**: `gi_trainer.py` → pandas → scikit-learn → global_model.pkl
3. **Prediction**: `gi_forecast.py` → model.predict() → risk scores
4. **Visualization**: `gi_dashboard.py` → console output
5. **Alerting**: `gi_alerts.py` → logger → SGSO integration

## Module Reference

### 1. gi_core.py - Main Orchestrator

**Purpose**: Coordinates entire Global Intelligence workflow

**Key Class**: `GlobalIntelligence`

```python
from modules.global_intelligence.gi_core import GlobalIntelligence

gi = GlobalIntelligence()
gi.executar()  # Run complete workflow
```

**Workflow Steps**:
1. Initialize all components
2. Collect fleet data
3. Train global model
4. Generate predictions
5. Display dashboard
6. Analyze patterns and send alerts

### 2. gi_sync.py - Fleet Data Collector

**Purpose**: Collects telemetry from all vessels

**Key Class**: `FleetCollector`

```python
from modules.global_intelligence.gi_sync import FleetCollector

collector = FleetCollector()
dados = collector.coletar_dados()
```

**Data Sources**:
- Primary: BridgeLink API (`https://bridge.nautilus/api/fleet_data`)
- Fallback: Local `fleet_profiles.json`

**Expected Data Format**:
```json
[
  {
    "embarcacao": "Nautilus Explorer",
    "score_peodp": 45,
    "falhas_dp": 3,
    "tempo_dp": 120,
    "alertas_criticos": 2
  }
]
```

### 3. gi_trainer.py - ML Model Trainer

**Purpose**: Trains predictive models using fleet data

**Key Class**: `GlobalTrainer`

```python
from modules.global_intelligence.gi_trainer import GlobalTrainer

trainer = GlobalTrainer()
trainer.treinar(dados)  # Trains and saves model
```

**Model Details**:
- Algorithm: Gradient Boosting Classifier
- Features: `score_peodp`, `falhas_dp`, `tempo_dp`, `alertas_criticos`
- Target: `conformidade_ok` (binary classification)
- Storage: `modules/global_intelligence/global_model.pkl`

**Hyperparameters**:
```python
n_estimators=200
learning_rate=0.1
max_depth=4
random_state=42
```

### 4. gi_forecast.py - Risk Predictor

**Purpose**: Generates risk predictions for each vessel

**Key Class**: `GlobalForecaster`

```python
from modules.global_intelligence.gi_forecast import GlobalForecaster

forecaster = GlobalForecaster()
previsoes = forecaster.prever(dados)
```

**Output Format**:
```python
[
  {"embarcacao": "Nautilus Explorer", "risco": 95.8},
  {"embarcacao": "Nautilus Endeavor", "risco": 12.3}
]
```

### 5. gi_dashboard.py - Corporate Dashboard

**Purpose**: Displays unified fleet view

**Key Class**: `GlobalDashboard`

```python
from modules.global_intelligence.gi_dashboard import GlobalDashboard

dashboard = GlobalDashboard()
dashboard.mostrar(previsoes)
```

**Risk Classification**:
- 🚨 **CRÍTICO**: 81-100% (immediate action required)
- 🔴 **ALTO**: 71-80% (high priority)
- 🟡 **MODERADO**: 41-70% (monitor closely)
- 🟢 **BAIXO**: 0-40% (normal operation)

### 6. gi_alerts.py - Alert System

**Purpose**: Detects patterns and sends notifications

**Key Class**: `GlobalAlerts`

```python
from modules.global_intelligence.gi_alerts import GlobalAlerts

alerts = GlobalAlerts()
alerts.analisar_padroes(previsoes)
```

**Alert Thresholds**:
- Critical: ≥80% risk
- High: ≥70% risk
- Moderate: ≥40% risk

**Integration Points**:
- `core.logger` for audit trail
- SGSO for compliance alerts (planned)
- BI Petrobras for corporate reporting (planned)

## Installation

### Prerequisites

- Python 3.12 or higher
- pip package manager
- Git (for cloning repository)

### Step-by-Step Installation

```bash
# 1. Clone repository (if not already cloned)
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# 2. Install Python dependencies
pip install -r modules/requirements.txt

# 3. Verify installation
python3 -c "import pandas; import sklearn; print('✅ Dependencies installed')"

# 4. Run demo
python3 modules/global_intelligence/demo.py
```

### Dependency Details

```
pandas>=2.0.0      # Data manipulation
numpy>=1.24.0      # Numerical computing
scikit-learn>=1.3.0 # Machine learning
joblib>=1.3.0      # Model persistence
requests>=2.31.0   # API communication
```

## Configuration

### Fleet Profiles JSON

Location: `modules/global_intelligence/fleet_profiles.json`

```json
[
  {
    "embarcacao": "Vessel Name",
    "score_peodp": 85,
    "falhas_dp": 1,
    "tempo_dp": 200,
    "alertas_criticos": 0,
    "ultima_atualizacao": "2027-01-15T10:30:00Z"
  }
]
```

**Field Descriptions**:
- `embarcacao`: Vessel name (string)
- `score_peodp`: PEO-DP compliance score, 0-100 (integer)
- `falhas_dp`: Number of DP failures (integer)
- `tempo_dp`: DP operation time in hours (integer)
- `alertas_criticos`: Count of critical alerts (integer)
- `ultima_atualizacao`: ISO 8601 timestamp (string)

### BridgeLink API Configuration

Endpoint: `https://bridge.nautilus/api/fleet_data`

**Authentication**: (To be configured)
**Timeout**: 10 seconds
**Retry Logic**: Falls back to local JSON

## Usage

### Basic Usage

```python
from modules.global_intelligence.gi_core import GlobalIntelligence

# Initialize system
gi = GlobalIntelligence()

# Run complete workflow
gi.executar()
```

### Advanced Usage

```python
# Manual step-by-step execution
from modules.global_intelligence.gi_sync import FleetCollector
from modules.global_intelligence.gi_trainer import GlobalTrainer
from modules.global_intelligence.gi_forecast import GlobalForecaster
from modules.global_intelligence.gi_dashboard import GlobalDashboard

# Step 1: Collect data
collector = FleetCollector()
dados = collector.coletar_dados()

# Step 2: Train model
trainer = GlobalTrainer()
trainer.treinar(dados)

# Step 3: Generate predictions
forecaster = GlobalForecaster()
previsoes = forecaster.prever(dados)

# Step 4: Display results
dashboard = GlobalDashboard()
dashboard.mostrar(previsoes)
```

### Command Line Usage

```bash
# Run demonstration
python3 modules/global_intelligence/demo.py

# Check logs
cat nautilus_logs.txt

# Verify model exists
ls -lh modules/global_intelligence/global_model.pkl
```

## API Integration

### Integrating with TypeScript/React

```typescript
// Example: Calling Python backend from TypeScript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runGlobalIntelligence() {
  try {
    const { stdout, stderr } = await execAsync(
      'python3 modules/global_intelligence/demo.py'
    );
    
    console.log('Global Intelligence Output:', stdout);
    return { success: true, output: stdout };
  } catch (error) {
    console.error('Global Intelligence Error:', error);
    return { success: false, error: error.message };
  }
}
```

### REST API Wrapper (Future)

```python
# Future implementation: Flask REST API
from flask import Flask, jsonify
from modules.global_intelligence.gi_core import GlobalIntelligence

app = Flask(__name__)

@app.route('/api/global-intelligence/run', methods=['POST'])
def run_intelligence():
    gi = GlobalIntelligence()
    gi.executar()
    return jsonify({"status": "success"})

@app.route('/api/global-intelligence/predictions', methods=['GET'])
def get_predictions():
    # Return cached predictions
    pass
```

## ML Model Details

### Algorithm: Gradient Boosting Classifier

**Why Gradient Boosting?**
- Excellent for tabular data
- Handles non-linear relationships
- Resistant to overfitting with proper tuning
- Fast prediction time

### Training Process

1. **Data Preparation**: Convert JSON to pandas DataFrame
2. **Feature Engineering**: Extract relevant columns
3. **Label Generation**: Calculate `conformidade_ok` if not present
4. **Model Training**: Fit Gradient Boosting Classifier
5. **Model Persistence**: Save using joblib

### Model Evaluation

```python
# Example: Cross-validation (for future enhancement)
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5)
print(f"Accuracy: {scores.mean():.2f} (+/- {scores.std() * 2:.2f})")
```

### Model Versioning

Models are stored in: `modules/global_intelligence/global_model.pkl`

**Future Enhancement**: Implement versioning system
- `global_model_v1.0.0.pkl`
- `global_model_v1.1.0.pkl`
- Track performance metrics per version

## Testing

### Module Import Test

```python
# Test all imports
import modules.global_intelligence.gi_core
import modules.global_intelligence.gi_sync
import modules.global_intelligence.gi_trainer
import modules.global_intelligence.gi_forecast
import modules.global_intelligence.gi_dashboard
import modules.global_intelligence.gi_alerts

print("✅ All modules imported successfully")
```

### Unit Tests (Future)

```python
# Example unit test structure
import unittest
from modules.global_intelligence.gi_sync import FleetCollector

class TestFleetCollector(unittest.TestCase):
    def test_local_data_loading(self):
        collector = FleetCollector()
        dados = collector._load_local_data()
        self.assertIsInstance(dados, list)
        self.assertGreater(len(dados), 0)

if __name__ == '__main__':
    unittest.main()
```

### Integration Testing

```bash
# Run demo and check for errors
python3 modules/global_intelligence/demo.py 2>&1 | tee test_output.log

# Verify model was created
test -f modules/global_intelligence/global_model.pkl && echo "✅ Model created"

# Check logs
grep -q "Modelo global treinado" nautilus_logs.txt && echo "✅ Training logged"
```

## Troubleshooting

### Common Issues

**Issue**: ImportError: No module named 'sklearn'
```bash
# Solution: Install dependencies
pip install -r modules/requirements.txt
```

**Issue**: FileNotFoundError: fleet_profiles.json
```bash
# Solution: Verify file exists
ls -l modules/global_intelligence/fleet_profiles.json

# Or create minimal test file
echo '[{"embarcacao":"Test","score_peodp":80,"falhas_dp":0,"tempo_dp":100,"alertas_criticos":0}]' > \
  modules/global_intelligence/fleet_profiles.json
```

**Issue**: Model prediction fails
```bash
# Solution: Retrain model
python3 -c "
from modules.global_intelligence.gi_sync import FleetCollector
from modules.global_intelligence.gi_trainer import GlobalTrainer
collector = FleetCollector()
dados = collector.coletar_dados()
trainer = GlobalTrainer()
trainer.treinar(dados)
"
```

**Issue**: BridgeLink API timeout
```
# Expected behavior: System falls back to local JSON
# Check logs for fallback message
grep "arquivo local" nautilus_logs.txt
```

### Debug Mode

```python
# Enable detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)

from modules.global_intelligence.gi_core import GlobalIntelligence
gi = GlobalIntelligence()
gi.executar()
```

### Performance Optimization

```python
# Profile execution time
import time

start = time.time()
gi = GlobalIntelligence()
gi.executar()
elapsed = time.time() - start

print(f"Execution time: {elapsed:.2f} seconds")
```

## Conclusion

The Nautilus Global Intelligence system provides a robust, production-ready platform for fleet-wide risk assessment and predictive analytics. Its modular architecture enables easy integration with existing systems while maintaining flexibility for future enhancements.

**Next Steps**:
1. Review [Integration Guide](GLOBAL_INTELLIGENCE_INTEGRATION_GUIDE.md)
2. Study [Visual Summary](GLOBAL_INTELLIGENCE_VISUAL_SUMMARY.md)
3. Check [Quick Reference](GLOBAL_INTELLIGENCE_QUICKREF.md)

---

**Version**: 1.0.0 | **Phase**: 5 (2026-2027) | **Status**: ✅ Production Ready
