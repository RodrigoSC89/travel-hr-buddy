# Phase 3 Quick Reference Card

## BridgeLink - Secure Ship-to-Shore Communication

### Quick Start

```python
from bridge_link import BridgeCore, BridgeSync, MessagePriority

# Initialize
bridge = BridgeCore(endpoint=SGSO_URL, token=AUTH_TOKEN)

# Test connection
status = bridge.verificar_conexao()

# Send report
bridge.enviar_relatorio("report.pdf", metadata={...})

# Send event
bridge.enviar_evento("loss_dp", event_data={...}, priority="CRITICAL")

# Enable offline sync
sync = BridgeSync(bridge_core=bridge)
sync.start()
```

### BridgeCore Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `verificar_conexao()` | Test SGSO connection | Connection status dict |
| `enviar_relatorio(pdf_path, metadata)` | Send PDF report | Transmission result |
| `enviar_evento(type, data, priority)` | Send critical event | Transmission result |
| `obter_status()` | Get system status | Status dict |
| `close()` | Close HTTP session | None |

### BridgeSync Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `enqueue_message(type, payload, priority)` | Add message to queue | Message ID |
| `start()` | Start background sync | None |
| `stop()` | Stop background sync | None |
| `get_statistics()` | Get queue stats | Statistics dict |
| `cleanup_old_messages(days)` | Clean old messages | Count deleted |

### Message Priorities

- `MessagePriority.LOW` - Normal operations
- `MessagePriority.MEDIUM` - Standard events
- `MessagePriority.HIGH` - Important alerts
- `MessagePriority.CRITICAL` - Emergency situations

### BridgeAPI Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/health` | GET | Health check | No |
| `/auth/login` | POST | Get JWT token | No |
| `/reports` | POST | Upload report | Yes |
| `/events` | POST | Send event | Yes |
| `/status` | GET | Get status | Yes |

### Rate Limits

- **Daily:** 200 requests/day per IP
- **Hourly:** 50 requests/hour per IP

---

## Forecast Global - AI Fleet Risk Prediction

### Quick Start

```python
from forecast_global import ForecastEngine, ForecastDashboard

# Initialize and train
engine = ForecastEngine(model_type="random_forest")
engine.treinar("fleet_data.csv")

# Make prediction
prediction = engine.prever([2400, 3, 1, 85])
# Returns: {'risk_probability': 65.2, 'risk_class': 'medio', ...}

# Setup dashboard
dashboard = ForecastDashboard(engine, alert_threshold=60.0)
dashboard.registrar_predicao("FPSO-123", prediction)
```

### ForecastEngine Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `treinar(csv_path)` | Train model on data | Training results |
| `prever(features)` | Predict risk | Prediction dict |
| `prever_lote(features_list)` | Batch predictions | List of predictions |
| `obter_importancia_features()` | Get feature importance | Feature scores |
| `salvar_modelo(path)` | Save trained model | None |
| `carregar_modelo(path)` | Load trained model | None |

### ForecastTrainer Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `adicionar_dados_auditoria(data)` | Add audit data | Addition result |
| `consolidar_dataset(paths)` | Merge datasets | Consolidation result |
| `avaliar_necessidade_retreinamento()` | Check if retraining needed | Evaluation dict |
| `retreinar_modelo(min_accuracy)` | Retrain model | Training result |
| `agendar_retreinamento_automatico()` | Auto retrain if needed | Automatic result |

### ForecastDashboard Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `registrar_predicao(vessel_id, prediction)` | Record prediction | Registration result |
| `obter_metricas_frota(days)` | Get fleet metrics | Metrics dict |
| `obter_historico_embarcacao(vessel_id, days)` | Get vessel history | History list |
| `analisar_tendencia(vessel_id, days)` | Analyze trend | Trend analysis |
| `comparar_embarcacoes(vessel_ids, days)` | Compare vessels | Comparison dict |
| `exportar_relatorio_csv(path, days)` | Export to CSV | Export result |
| `gerar_resumo_executivo(days)` | Generate summary | Formatted text |

### Risk Classifications

| Class | Probability | Action |
|-------|-------------|--------|
| **baixo** | 0-40% | Normal monitoring |
| **medio** | 40-60% | Increased attention |
| **alto** | 60-80% | Immediate action |
| **critico** | 80-100% | Emergency response |

### Model Types

- `"random_forest"` - RandomForest ensemble (recommended)
- `"gradient_boosting"` - GradientBoosting ensemble (alternative)

---

## Configuration

### Environment Variables

```bash
# BridgeLink
export BRIDGE_ENDPOINT="https://sgso.petrobras.com.br/api/v1"
export BRIDGE_TOKEN="your_bearer_token"
export BRIDGE_SECRET_KEY="your_jwt_secret"

# Forecast Global
export FORECAST_DATA_PATH="/data/fleet_training.csv"
export FORECAST_ALERT_THRESHOLD="60.0"
```

### File Paths

```bash
# BridgeLink
bridge_sync.db              # SQLite queue database
bridge_sync.db-journal      # SQLite journal file

# Forecast Global
fleet_training_data.csv     # Training dataset
forecast_history.csv        # Prediction history
*_state.json               # Trainer state files
*.pkl                      # Trained models
```

---

## Common Patterns

### Pattern 1: Full Audit Workflow

```python
# 1. Complete audit with PEO-DP
audit_result = peo_dp.executar_auditoria()

# 2. Send report to SGSO
bridge.enviar_relatorio("audit_report.pdf", metadata=audit_result)

# 3. Predict risk
features = extract_features(audit_result)
prediction = engine.prever(features)

# 4. Register and alert if needed
dashboard.registrar_predicao(vessel_id, prediction)

# 5. If high risk, trigger workflow
if prediction['risk_probability'] > 60:
    workflow.criar_acao_corretiva(prediction)
```

### Pattern 2: Continuous Learning

```python
# Add new audit data incrementally
for audit in new_audits:
    trainer.adicionar_dados_auditoria(audit)

# Check and retrain automatically
result = trainer.agendar_retreinamento_automatico()

if result['retrained']:
    # Reload model in engine
    engine.carregar_modelo(model_path)
```

### Pattern 3: Fleet Monitoring

```python
# Get current fleet status
metrics = dashboard.obter_metricas_frota(days=7)

# Identify high-risk vessels
for vessel_id in fleet_vessels:
    history = dashboard.obter_historico_embarcacao(vessel_id, days=30)
    trend = dashboard.analisar_tendencia(vessel_id, days=30)
    
    if trend['trend'] == 'increasing':
        print(f"⚠️ {vessel_id} showing increasing risk trend")

# Generate executive report
summary = dashboard.gerar_resumo_executivo(days=7)
print(summary)
```

---

## Performance Tips

### BridgeLink
- Use `BridgeSync` for offline reliability
- Batch reports when possible
- Monitor queue size with `get_statistics()`
- Clean old messages with `cleanup_old_messages()`

### Forecast Global
- Train with at least 100 records for accuracy
- Retrain every 7 days or after 100 new records
- Use batch predictions for multiple vessels
- Export and backup models regularly

---

## Troubleshooting

### BridgeLink Issues

**Connection Failed**
```python
# Check connection
status = bridge.verificar_conexao()
if not status['connected']:
    print(f"Error: {status['error']}")
```

**Messages Not Sending**
```python
# Check queue statistics
stats = sync.get_statistics()
print(f"Pending: {stats['status_counts'].get('pending', 0)}")
```

### Forecast Global Issues

**Low Accuracy**
```python
# Check training results
result = engine.treinar(csv_path)
if result['training_accuracy'] < 0.75:
    print("Need more training data")
```

**Prediction Errors**
```python
# Verify feature count matches training
importance = engine.obter_importancia_features()
print(f"Expected features: {len(importance)}")
```

---

## Quick Install

```bash
# Install dependencies
pip install -r modules/requirements.txt

# Verify installation
python3 -c "
from bridge_link import BridgeCore, BridgeSync
from forecast_global import ForecastEngine
print('✓ Phase 3 modules ready')
"
```

---

**Version:** 1.0.0  
**Last Updated:** October 20, 2025  
**Documentation:** See `modules/README.md` and `PHASE3_IMPLEMENTATION_SUMMARY.md`
