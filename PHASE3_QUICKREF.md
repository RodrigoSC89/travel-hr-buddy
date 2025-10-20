# 🚀 Phase 3 - Quick Reference Card

## 📦 Installation

```bash
cd modules
./setup.sh
```

## ⚙️ Configuration

```bash
# .env file
BRIDGE_ENDPOINT=https://sgso.petrobras.com.br/api
BRIDGE_TOKEN=your_token
FORECAST_MODEL_TYPE=random_forest
```

## 🌉 BridgeLink - Quick Examples

### Send Report
```python
from bridge_link import BridgeCore

bridge = BridgeCore(endpoint="...", token="...")
bridge.enviar_relatorio("report.pdf", metadata={...})
```

### Send Event
```python
bridge.enviar_evento({
    "tipo": "loss_dp",
    "embarcacao": "FPSO-123",
    "severidade": "critica"
})
```

### Offline Queue
```python
from bridge_link import BridgeSync, MessageType

sync = BridgeSync(bridge)
sync.add_to_queue(MessageType.EVENT, data={...})
sync.start()  # Auto-sync in background
```

## 🔮 Forecast Global - Quick Examples

### Train Model
```python
from forecast_global import ForecastEngine

engine = ForecastEngine()
engine.treinar("dataset.csv")
```

### Predict Risk
```python
# [horas_dp, falhas_mensais, eventos_asog, score_peodp]
result = engine.prever([2400, 3, 1, 85])
print(f"Risk: {result['risco_percentual']}%")
```

### Dashboard Metrics
```python
from forecast_global import ForecastDashboard

dashboard = ForecastDashboard(engine)
metrics = dashboard.get_metricas_frota()
print(f"Fleet risk: {metrics['risco_medio']}%")
```

### Continuous Learning
```python
from forecast_global import ForecastTrainer

trainer = ForecastTrainer(engine)
trainer.adicionar_dados_de_relatorio(report_data)
trainer.retreinar_modelo()  # Auto-retrain
```

## 🔄 Integration Workflow

```python
# 1. Initialize
from bridge_link import BridgeCore, BridgeSync
from forecast_global import ForecastEngine, ForecastDashboard

bridge = BridgeCore(...)
engine = ForecastEngine()
dashboard = ForecastDashboard(engine)

# 2. Process audit
bridge.enviar_relatorio("audit.pdf")
prediction = engine.prever([...])
dashboard.registrar_predicao("FPSO-123", prediction)

# 3. Auto-alert if risk > 60%
if prediction['risco_percentual'] > 60:
    # Create corrective action in Smart Workflow
    pass
```

## 📊 Common Commands

```bash
# Check queue status
>>> sync.get_statistics()
{'pending': 5, 'processed': 120, 'failed': 2}

# Get model info
>>> engine.get_model_info()
{'version': '1.0.0', 'accuracy': 0.85, ...}

# Fleet report
>>> dashboard.gerar_relatorio_resumo()
{'risco_medio': 45.2, 'embarcacoes_em_risco': 3, ...}
```

## 🐛 Troubleshooting

```python
# Connection issue?
if not bridge.verificar_conexao():
    print("Check: endpoint, token, network")

# Model not trained?
engine.treinar("dataset.csv")

# Queue growing?
sync.cleanup_old_messages(days=7)
```

## 📚 Full Documentation

- **Setup:** `modules/README.md`
- **BridgeLink:** `modules/bridge_link/README.md`
- **Forecast:** `modules/forecast_global/README.md`
- **Integration:** `modules/PHASE3_INTEGRATION_GUIDE.md`
- **Summary:** `PHASE3_IMPLEMENTATION_SUMMARY.md`

## 🎯 Key Features

**BridgeLink:**
- ✅ Secure HTTP communication
- ✅ JWT-authenticated REST API
- ✅ Offline queue with SQLite
- ✅ Auto-retry with backoff
- ✅ Rate limiting

**Forecast Global:**
- ✅ RandomForest & GradientBoosting
- ✅ Cross-validation training
- ✅ Continuous learning
- ✅ Auto-retraining scheduler
- ✅ Fleet dashboard
- ✅ Automatic alerts (risk > 60%)

## 🔐 Security Checklist

- [ ] Set strong `BRIDGE_TOKEN`
- [ ] Change default API password
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Review logs regularly

---

**Phase 3 Complete** ✅  
*Questions? See full docs in `modules/` directory*
