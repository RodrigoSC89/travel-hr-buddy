# 🔮 Forecast Global - AI-Powered Fleet Risk Prediction

Machine learning system for predicting compliance risks across entire vessel fleets, enabling proactive risk management and automated corrective actions.

## 📦 Components

### ForecastEngine
ML prediction engine using RandomForest or GradientBoosting models.

**Features:**
- 200-estimator ensemble models
- 5-fold cross-validation
- Risk prediction with 0-100% probability scores
- Risk classification (baixo/medio/alto/critico)
- Feature importance analysis
- Batch prediction support

**Usage:**
```python
from forecast_global import ForecastEngine

# Initialize
engine = ForecastEngine(model_type="random_forest")

# Train model
metrics = engine.treinar("fleet_data.csv")
print(f"Accuracy: {metrics['train_accuracy']:.4f}")

# Make prediction
prediction = engine.prever([2400, 3, 1, 85])
# Input: [horas_dp, falhas_mensais, eventos_asog, score_peodp]

print(f"Risk: {prediction['risco_percentual']}%")
print(f"Level: {prediction['nivel_risco']}")
print(f"Recommendation: {prediction['recomendacao']}")

# Batch predictions
predictions = engine.prever_lote([
    [2400, 3, 1, 85],
    [1800, 5, 2, 72]
])
```

**Model Types:**
- `random_forest`: RandomForestClassifier (200 estimators, max_depth=10)
- `gradient_boosting`: GradientBoostingClassifier (200 estimators, learning_rate=0.1)

### ForecastTrainer
Continuous learning system with automatic retraining.

**Features:**
- Incremental data addition
- Dataset consolidation and deduplication
- Automatic retraining triggers (data volume + time-based)
- Performance validation with threshold checking
- Automatic model backup and rollback

**Usage:**
```python
from forecast_global import ForecastEngine, ForecastTrainer

# Initialize
engine = ForecastEngine(model_type="random_forest")
trainer = ForecastTrainer(
    forecast_engine=engine,
    min_samples_for_retraining=50,
    min_days_between_retraining=7,
    accuracy_threshold=0.75
)

# Add new data
new_data = [
    {
        "horas_dp": 2400,
        "falhas_mensais": 3,
        "eventos_asog": 1,
        "score_peodp": 85,
        "risco_conformidade": 0,
        "embarcacao": "FPSO-123",
        "data_auditoria": "2024-01-15"
    }
]

result = trainer.adicionar_dados(new_data, auto_retrain=True)

# Check if retraining needed
if trainer.should_retrain():
    retrain_result = trainer.retreinar()
    
# Get training status
status = trainer.get_training_status()
```

**Retraining Triggers:**
- Minimum new samples threshold
- Minimum days since last training
- Manual trigger available

**Safety Features:**
- Automatic backup before retraining
- Performance validation (accuracy threshold)
- Automatic rollback if accuracy degrades >5%

### ForecastDashboard
Fleet monitoring with visualization and alerting.

**Features:**
- Aggregated fleet-wide metrics
- Per-vessel historical tracking
- Risk trend analysis (increasing/stable/decreasing)
- Vessel comparison tools
- Automatic alert generation (threshold-based)
- CSV report export
- Executive summary generation

**Usage:**
```python
from forecast_global import ForecastEngine, ForecastDashboard

# Initialize
engine = ForecastEngine(model_type="random_forest")
dashboard = ForecastDashboard(
    forecast_engine=engine,
    alert_threshold=60.0
)

# Register prediction
prediction = engine.prever([2400, 3, 1, 85])
result = dashboard.registrar_predicao("FPSO-123", prediction)

if result['alert_generated']:
    print(f"⚠️ Alert: {result['alert_details']}")

# Get fleet metrics
metrics = dashboard.obter_metricas_frota()
print(f"Fleet average risk: {metrics['risco_medio']:.2f}%")
print(f"High-risk vessels: {metrics['embarcacoes_alto_risco']}")

# Analyze vessel trend
trend = dashboard.analisar_tendencia("FPSO-123", janela=7)
print(f"Trend: {trend['tendencia']}")

# Compare vessels
comparison = dashboard.comparar_embarcacoes(["FPSO-123", "FPSO-124"])
print(f"Rankings: {comparison['ranking']}")

# Export report
dashboard.exportar_relatorio_csv("fleet_report.csv")

# Generate executive summary
summary = dashboard.gerar_sumario_executivo()
print(summary)
```

## 🔄 Integrated Workflow

Complete automated pipeline:

1. **PEO-DP Inteligente** completes compliance audit
2. **BridgeLink** sends PDF report to SGSO Petrobras
3. **BridgeLink** transmits audit metrics to Forecast Global
4. **Forecast Global** analyzes risk using ML models
5. **If risk > 60%**, system automatically creates corrective action via Smart Workflow
6. **Forecast Global** updates model with new data (continuous learning)

## 📊 Performance

**ForecastEngine:**
- Training time: ~5 seconds for 1,000 records
- Prediction latency: <10ms per record
- Batch processing: ~500 predictions/second
- Typical accuracy: 80-90% on test data

**Memory Usage:**
- Model size: ~5-10 MB
- Dataset: ~1 MB per 10,000 records
- History file: ~500 KB per 1,000 predictions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare Training Data
Create `fleet_data.csv` with columns:
- `horas_dp`: Hours in DP operations
- `falhas_mensais`: Monthly failure count
- `eventos_asog`: ASOG events count
- `score_peodp`: PEO-DP audit score
- `risco_conformidade`: Risk label (0=low, 1=high)
- `embarcacao`: Vessel identifier (optional)
- `data_auditoria`: Audit date (optional)

### 3. Train Model
```python
from forecast_global import ForecastEngine

engine = ForecastEngine(model_type="random_forest")
metrics = engine.treinar("fleet_data.csv")
print(f"Model trained with accuracy: {metrics['train_accuracy']:.4f}")
```

### 4. Make Predictions
```python
prediction = engine.prever([2400, 3, 1, 85])
print(f"Risk: {prediction['risco_percentual']}% - {prediction['nivel_risco']}")
```

### 5. Setup Dashboard
```python
from forecast_global import ForecastDashboard

dashboard = ForecastDashboard(engine, alert_threshold=60.0)
result = dashboard.registrar_predicao("FPSO-123", prediction)
```

## 📈 Risk Classification

- **Baixo (0-30%)**: Manter monitoramento de rotina
- **Médio (30-60%)**: Aumentar frequência de inspeções
- **Alto (60-80%)**: Ação corretiva recomendada
- **Crítico (80-100%)**: Ação corretiva urgente necessária

## 🔧 Configuration

### ForecastEngine
- `model_type`: "random_forest" or "gradient_boosting"
- `model_path`: Path to save/load model (default: "forecast_model.pkl")
- `scaler_path`: Path to save/load scaler (default: "forecast_scaler.pkl")

### ForecastTrainer
- `min_samples_for_retraining`: Minimum new samples before retrain (default: 50)
- `min_days_between_retraining`: Minimum days between retraining (default: 7)
- `accuracy_threshold`: Minimum acceptable accuracy (default: 0.75)

### ForecastDashboard
- `alert_threshold`: Risk percentage for alerts (default: 60.0)
- `history_file`: CSV file for predictions (default: "forecast_history.csv")

## 📝 Compliance

- **NORMAM-101** - Normas da Autoridade Marítima
- **IMCA M 117** - Guidelines for Design and Operation of DP Vessels
- Machine learning best practices
- PEP 8 style guidelines

## 🔒 Data Privacy

- All data stored locally (SQLite/CSV)
- No external data transmission (except via BridgeLink)
- Model files are portable and self-contained
- History files can be encrypted at rest

## 📚 Advanced Usage

### Custom Model Parameters
```python
from sklearn.ensemble import RandomForestClassifier

# Create custom model
custom_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=10
)

# Use with engine (requires modification)
```

### Manual Retraining Control
```python
# Disable auto-retrain
result = trainer.adicionar_dados(new_data, auto_retrain=False)

# Manual retrain when ready
if trainer.should_retrain():
    retrain_result = trainer.retreinar()
```

### Alert Integration
```python
# Get active alerts
alerts = dashboard.obter_alertas_ativos()

for alert in alerts:
    if alert['severidade'] == 'CRITICAL':
        # Trigger Smart Workflow action
        create_corrective_action(alert)
```

## 🐛 Troubleshooting

**Model not training:**
- Check CSV file format and required columns
- Ensure sufficient samples (minimum 20-30 for training)
- Verify no missing values in critical columns

**Poor accuracy:**
- Increase training data volume
- Check data quality and labels
- Try different model type
- Adjust model hyperparameters

**Alerts not generating:**
- Verify alert_threshold setting
- Check if predictions exceed threshold
- Ensure auto_alert=True in registrar_predicao

## 📖 Examples

See example usage in each module's `__main__` section:
- `forecast_engine.py` - Training and prediction examples
- `forecast_trainer.py` - Continuous learning examples
- `forecast_dashboard.py` - Dashboard and alerting examples
