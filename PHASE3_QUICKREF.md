# ⚡ Phase 3 Quick Reference

Essential commands and code snippets for BridgeLink and Forecast Global modules.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export SGSO_ENDPOINT="https://sgso.petrobras.com.br/api"
export SGSO_TOKEN="your-bearer-token"
export BRIDGE_SECRET_KEY="your-jwt-secret"
```

## 🌉 BridgeLink

### Initialize & Connect
```python
from bridge_link import BridgeCore, BridgeSync, MessageType, MessagePriority

bridge = BridgeCore(endpoint=SGSO_ENDPOINT, token=SGSO_TOKEN)
sync = BridgeSync(bridge_core=bridge)
sync.start()
```

### Send Report
```python
result = bridge.enviar_relatorio(
    "relatorio.pdf",
    metadata={"vessel": "FPSO-123", "date": "2024-01-15"}
)
```

### Send Event
```python
result = bridge.enviar_evento({
    "tipo": "loss_dp",
    "descricao": "Event description",
    "severidade": "CRITICAL",
    "embarcacao": "FPSO-123"
})
```

### Queue Message
```python
sync.add_message(
    message_type=MessageType.EVENT,
    payload={"tipo": "test", "descricao": "Test event", "severidade": "LOW"},
    priority=MessagePriority.MEDIUM
)
```

### Get Status
```python
status = bridge.obter_status()
stats = sync.get_statistics()
```

## 🔮 Forecast Global

### Train Model
```python
from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard

engine = ForecastEngine(model_type="random_forest")
metrics = engine.treinar("fleet_data.csv")
```

### Make Prediction
```python
prediction = engine.prever([2400, 3, 1, 85])
# Input: [horas_dp, falhas_mensais, eventos_asog, score_peodp]

print(f"Risk: {prediction['risco_percentual']}%")
print(f"Level: {prediction['nivel_risco']}")
print(f"Recommendation: {prediction['recomendacao']}")
```

### Batch Predictions
```python
predictions = engine.prever_lote([
    [2400, 3, 1, 85],
    [1800, 5, 2, 72]
])
```

### Setup Dashboard
```python
dashboard = ForecastDashboard(engine, alert_threshold=60.0)
result = dashboard.registrar_predicao("FPSO-123", prediction)

if result['alert_generated']:
    print(f"⚠️ Alert: {result['alert_details']}")
```

### Get Fleet Metrics
```python
metrics = dashboard.obter_metricas_frota()
```

### Analyze Trend
```python
trend = dashboard.analisar_tendencia("FPSO-123", janela=7)
```

### Compare Vessels
```python
comparison = dashboard.comparar_embarcacoes(["FPSO-123", "FPSO-124"])
```

### Export Report
```python
dashboard.exportar_relatorio_csv("fleet_report.csv")
summary = dashboard.gerar_sumario_executivo()
```

## 🔄 Continuous Learning

### Setup Trainer
```python
trainer = ForecastTrainer(
    forecast_engine=engine,
    min_samples_for_retraining=50,
    min_days_between_retraining=7
)
```

### Add Data
```python
new_data = [{
    "horas_dp": 2400,
    "falhas_mensais": 3,
    "eventos_asog": 1,
    "score_peodp": 85,
    "risco_conformidade": 0,
    "embarcacao": "FPSO-123",
    "data_auditoria": "2024-01-15"
}]

result = trainer.adicionar_dados(new_data, auto_retrain=True)
```

### Manual Retrain
```python
if trainer.should_retrain():
    result = trainer.retreinar()
```

### Get Training Status
```python
status = trainer.get_training_status()
```

## 🔧 Complete Workflow

```python
def on_audit_complete(audit_data):
    # 1. Send report to SGSO
    bridge.enviar_relatorio(audit_data['pdf_path'], metadata={...})
    
    # 2. Get risk prediction
    prediction = engine.prever([...audit_data['metrics']])
    
    # 3. Register in dashboard
    result = dashboard.registrar_predicao(audit_data['vessel'], prediction)
    
    # 4. If risk > 60%, create corrective action
    if result['alert_generated']:
        create_corrective_action(result['alert_details'])
        bridge.enviar_evento({...})
    
    # 5. Add to training data
    trainer.adicionar_dados([{...}], auto_retrain=True)
```

## 🎯 Key Thresholds

| Metric | Value | Description |
|--------|-------|-------------|
| Alert Threshold | 60% | Risk percentage for alerts |
| Low Risk | 0-30% | Routine monitoring |
| Medium Risk | 30-60% | Increased inspections |
| High Risk | 60-80% | Corrective action recommended |
| Critical Risk | 80-100% | Urgent corrective action |

## 📊 Performance

| Component | Metric |
|-----------|--------|
| BridgeLink Throughput | ~1,000 msg/hour |
| BridgeLink Latency | <100ms |
| Forecast Training | ~5s / 1,000 records |
| Forecast Prediction | <10ms / record |
| Batch Prediction | ~500 pred/second |

## 🔒 Environment Variables

```bash
# Required
SGSO_ENDPOINT="https://sgso.petrobras.com.br/api"
SGSO_TOKEN="your-bearer-token"
BRIDGE_SECRET_KEY="your-jwt-secret"

# Optional
FORECAST_MODEL_TYPE="random_forest"  # or "gradient_boosting"
FORECAST_ALERT_THRESHOLD="60.0"
```

## 📝 Data Format

### Fleet Data CSV
```csv
horas_dp,falhas_mensais,eventos_asog,score_peodp,risco_conformidade,embarcacao,data_auditoria
2400,3,1,85,0,FPSO-123,2024-01-15
1800,5,2,72,1,FPSO-124,2024-01-16
```

### Event Payload
```json
{
  "tipo": "loss_dp",
  "descricao": "Event description",
  "severidade": "CRITICAL",
  "embarcacao": "FPSO-123",
  "dados_adicionais": {...}
}
```

### Report Metadata
```json
{
  "vessel": "FPSO-123",
  "audit_type": "PEO-DP",
  "date": "2024-01-15",
  "score": 85
}
```

## 🐛 Common Issues

### BridgeLink
```python
# Check connection
if not bridge.verificar_conexao():
    print("Connection failed")

# Check queue
stats = sync.get_statistics()
if stats['status'].get('pending', 0) > 100:
    print("High queue backlog")

# Cleanup old messages
sync.cleanup_old_messages(days=30)
```

### Forecast Global
```python
# Check model status
info = engine.get_model_info()
if info['status'] == 'not_trained':
    engine.treinar("fleet_data.csv")

# Validate accuracy
metrics = engine.training_metrics
if metrics['train_accuracy'] < 0.75:
    print("Low accuracy - need more training data")

# Consolidate dataset
stats = trainer.consolidar_dataset()
```

## 📚 Quick Links

- **Full Documentation**: [PHASE3_INTEGRATION_GUIDE.md](PHASE3_INTEGRATION_GUIDE.md)
- **BridgeLink README**: [modules/bridge_link/README.md](modules/bridge_link/README.md)
- **Forecast Global README**: [modules/forecast_global/README.md](modules/forecast_global/README.md)
- **Modules Overview**: [modules/README.md](modules/README.md)

## 🧪 Testing

```python
# Test BridgeCore
python -m bridge_link.bridge_core

# Test ForecastEngine
python -m forecast_global.forecast_engine

# Test complete workflow
python test_phase3_integration.py
```

## 🚀 Deployment

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set environment variables
export SGSO_ENDPOINT="..."
export SGSO_TOKEN="..."

# 3. Train initial model
python -c "from forecast_global import ForecastEngine; \
           e = ForecastEngine(); e.treinar('fleet_data.csv')"

# 4. Start services
python start_phase3_services.py
```

## 📈 Monitoring

```python
# BridgeLink status
bridge_status = bridge.obter_status()
queue_stats = sync.get_statistics()

# Forecast Global status
training_status = trainer.get_training_status()
fleet_metrics = dashboard.obter_metricas_frota()
active_alerts = dashboard.obter_alertas_ativos()
```

## 🔧 Configuration Tips

1. **Production**: Use HTTPS endpoints, rotate tokens regularly
2. **Performance**: Adjust `sync_interval` based on traffic
3. **Accuracy**: Retrain model weekly or after 50+ new samples
4. **Alerts**: Tune `alert_threshold` based on fleet risk tolerance
5. **Storage**: Cleanup old queue messages and predictions regularly

## 💡 Pro Tips

- Use `prever_lote()` for batch predictions (faster)
- Enable background sync: `sync.start()`
- Monitor queue depth: `sync.get_statistics()`
- Export reports regularly: `dashboard.exportar_relatorio_csv()`
- Check model info: `engine.get_model_info()`
- Consolidate dataset monthly: `trainer.consolidar_dataset()`
