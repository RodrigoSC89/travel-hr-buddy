# 🚀 Phase 3 Integration Guide

Complete guide for integrating BridgeLink and Forecast Global modules into PEO-DP Inteligente system.

## 📋 Overview

Phase 3 adds two critical Python modules:
1. **BridgeLink** - Secure ship-to-shore communication
2. **Forecast Global** - AI-powered fleet risk prediction

These modules enable:
- Automatic report transmission to SGSO Petrobras
- Fleet-wide risk prediction and monitoring
- Proactive corrective action triggers
- Continuous learning from fleet data

## 🏗️ Architecture

```
┌─────────────────────┐
│  PEO-DP Inteligente │
│   (TypeScript/React)│
└──────────┬──────────┘
           │
           │ Audit Complete
           ▼
    ┌──────────────┐
    │  BridgeLink  │ ────────► SGSO Petrobras
    │   (Python)   │            (PDF Reports)
    └──────┬───────┘
           │
           │ Metrics
           ▼
  ┌─────────────────┐
  │ Forecast Global │
  │    (Python)     │
  └────────┬────────┘
           │
           │ Risk > 60%
           ▼
    ┌─────────────┐
    │Smart Workflow│ ──► Corrective Action
    │  (Automatic) │
    └──────────────┘
```

## 📦 Installation

### Step 1: Install Python Dependencies

```bash
cd /path/to/travel-hr-buddy
pip install -r requirements.txt
```

This installs:
- requests (HTTP communication)
- flask (REST API)
- pyjwt (JWT authentication)
- scikit-learn (Machine Learning)
- pandas (Data processing)
- numpy (Numerical operations)

### Step 2: Verify Installation

```bash
python -c "from bridge_link import BridgeCore; print('BridgeLink OK')"
python -c "from forecast_global import ForecastEngine; print('Forecast Global OK')"
```

### Step 3: Set Environment Variables

```bash
# BridgeLink Configuration
export SGSO_ENDPOINT="https://sgso.petrobras.com.br/api"
export SGSO_TOKEN="your-bearer-token-here"
export BRIDGE_SECRET_KEY="your-jwt-secret-key"

# Optional: Forecast Global Configuration
export FORECAST_MODEL_TYPE="random_forest"
export FORECAST_ALERT_THRESHOLD="60.0"
```

## 🔧 Configuration

### BridgeLink Setup

Create a configuration file `bridge_config.py`:

```python
import os

BRIDGE_CONFIG = {
    'endpoint': os.environ.get('SGSO_ENDPOINT'),
    'token': os.environ.get('SGSO_TOKEN'),
    'timeout': 30,
    'sync_interval': 60,
    'max_retries': 5
}
```

### Forecast Global Setup

Create a configuration file `forecast_config.py`:

```python
import os

FORECAST_CONFIG = {
    'model_type': os.environ.get('FORECAST_MODEL_TYPE', 'random_forest'),
    'alert_threshold': float(os.environ.get('FORECAST_ALERT_THRESHOLD', '60.0')),
    'min_samples_for_retraining': 50,
    'min_days_between_retraining': 7,
    'accuracy_threshold': 0.75
}
```

## 🚀 Integration Steps

### Step 1: Initialize Components

```python
from bridge_link import BridgeCore, BridgeSync, MessageType, MessagePriority
from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard
from bridge_config import BRIDGE_CONFIG
from forecast_config import FORECAST_CONFIG

# Initialize BridgeLink
bridge = BridgeCore(
    endpoint=BRIDGE_CONFIG['endpoint'],
    token=BRIDGE_CONFIG['token'],
    timeout=BRIDGE_CONFIG['timeout']
)

sync = BridgeSync(
    bridge_core=bridge,
    db_path="bridge_sync.db"
)

# Initialize Forecast Global
engine = ForecastEngine(
    model_type=FORECAST_CONFIG['model_type']
)

trainer = ForecastTrainer(
    forecast_engine=engine,
    min_samples_for_retraining=FORECAST_CONFIG['min_samples_for_retraining'],
    min_days_between_retraining=FORECAST_CONFIG['min_days_between_retraining'],
    accuracy_threshold=FORECAST_CONFIG['accuracy_threshold']
)

dashboard = ForecastDashboard(
    forecast_engine=engine,
    alert_threshold=FORECAST_CONFIG['alert_threshold']
)

# Start background sync
sync.start()
```

### Step 2: Train Initial Model

```python
# Prepare initial training data
# Create fleet_data.csv with historical audit data
# Columns: horas_dp, falhas_mensais, eventos_asog, score_peodp, risco_conformidade

# Train model
metrics = engine.treinar("fleet_data.csv")
print(f"Model trained with accuracy: {metrics['train_accuracy']:.4f}")
```

### Step 3: Integrate with PEO-DP Audit Completion

When a PEO-DP audit is completed, trigger the workflow:

```python
def on_audit_complete(audit_data):
    """
    Called when PEO-DP Inteligente completes an audit.
    
    Args:
        audit_data: Dictionary with audit information
            {
                'vessel': 'FPSO-123',
                'date': '2024-01-15',
                'pdf_path': 'relatorio_peodp_fpso123.pdf',
                'metrics': {
                    'horas_dp': 2400,
                    'falhas_mensais': 3,
                    'eventos_asog': 1,
                    'score_peodp': 85
                }
            }
    """
    
    # Step 1: Send report to SGSO via BridgeLink
    report_result = bridge.enviar_relatorio(
        audit_data['pdf_path'],
        metadata={
            'vessel': audit_data['vessel'],
            'audit_type': 'PEO-DP',
            'date': audit_data['date']
        }
    )
    
    if not report_result['success']:
        # Queue for later transmission
        sync.add_message(
            message_type=MessageType.REPORT,
            payload={
                'file_path': audit_data['pdf_path'],
                'metadata': {
                    'vessel': audit_data['vessel'],
                    'date': audit_data['date']
                }
            },
            priority=MessagePriority.HIGH
        )
    
    # Step 2: Get risk prediction from Forecast Global
    metrics = audit_data['metrics']
    prediction = engine.prever([
        metrics['horas_dp'],
        metrics['falhas_mensais'],
        metrics['eventos_asog'],
        metrics['score_peodp']
    ])
    
    # Step 3: Register prediction in dashboard
    result = dashboard.registrar_predicao(
        audit_data['vessel'],
        prediction,
        auto_alert=True
    )
    
    # Step 4: If risk > 60%, trigger corrective action
    if result['alert_generated']:
        alert = result['alert_details']
        
        # Create Smart Workflow corrective action
        create_corrective_action({
            'vessel': audit_data['vessel'],
            'risk_percentage': alert['risco_percentual'],
            'risk_level': alert['nivel_risco'],
            'recommendation': alert['recomendacao'],
            'severity': alert['severidade']
        })
        
        # Send critical event to SGSO
        bridge.enviar_evento({
            'tipo': 'high_risk_prediction',
            'descricao': f"Risco elevado detectado: {alert['risco_percentual']}%",
            'severidade': alert['severidade'],
            'embarcacao': audit_data['vessel'],
            'dados_adicionais': alert
        })
    
    # Step 5: Add data for continuous learning
    trainer.adicionar_dados([{
        'horas_dp': metrics['horas_dp'],
        'falhas_mensais': metrics['falhas_mensais'],
        'eventos_asog': metrics['eventos_asog'],
        'score_peodp': metrics['score_peodp'],
        'risco_conformidade': 1 if prediction['risco_percentual'] > 60 else 0,
        'embarcacao': audit_data['vessel'],
        'data_auditoria': audit_data['date']
    }], auto_retrain=True)
    
    return {
        'report_sent': report_result['success'],
        'prediction': prediction,
        'alert_generated': result['alert_generated']
    }
```

### Step 4: Create Corrective Action Function

```python
def create_corrective_action(alert_data):
    """
    Create corrective action in Smart Workflow system.
    
    Args:
        alert_data: Dictionary with alert information
    """
    # This would integrate with your existing Smart Workflow system
    # Example implementation:
    
    action = {
        'title': f"Ação Corretiva - {alert_data['vessel']}",
        'description': f"Risco de conformidade elevado: {alert_data['risk_percentage']}%",
        'priority': alert_data['severity'],
        'vessel': alert_data['vessel'],
        'recommendation': alert_data['recommendation'],
        'due_date': calculate_due_date(alert_data['severity']),
        'assigned_to': get_vessel_manager(alert_data['vessel'])
    }
    
    # Create action in your workflow system
    # workflow_api.create_action(action)
    
    print(f"✅ Corrective action created for {alert_data['vessel']}")
```

## 📊 Monitoring and Dashboards

### Flask API Endpoints

Create API endpoints for frontend integration:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/fleet-metrics', methods=['GET'])
def get_fleet_metrics():
    """Get aggregated fleet metrics."""
    metrics = dashboard.obter_metricas_frota()
    return jsonify(metrics)

@app.route('/api/vessel-history/<vessel_id>', methods=['GET'])
def get_vessel_history(vessel_id):
    """Get historical predictions for a vessel."""
    days = request.args.get('days', default=30, type=int)
    history = dashboard.obter_historico_embarcacao(vessel_id, dias=days)
    return jsonify(history)

@app.route('/api/vessel-trend/<vessel_id>', methods=['GET'])
def get_vessel_trend(vessel_id):
    """Get risk trend analysis for a vessel."""
    window = request.args.get('window', default=7, type=int)
    trend = dashboard.analisar_tendencia(vessel_id, janela=window)
    return jsonify(trend)

@app.route('/api/active-alerts', methods=['GET'])
def get_active_alerts():
    """Get active alerts."""
    alerts = dashboard.obter_alertas_ativos()
    return jsonify(alerts)

@app.route('/api/bridge-status', methods=['GET'])
def get_bridge_status():
    """Get BridgeLink connection status."""
    status = bridge.obter_status()
    queue_stats = sync.get_statistics()
    return jsonify({
        'bridge': status,
        'queue': queue_stats
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
```

### Frontend Integration

Example React component:

```typescript
// FleetDashboard.tsx
import React, { useEffect, useState } from 'react';

interface FleetMetrics {
  total_embarcacoes: number;
  risco_medio: number;
  embarcacoes_alto_risco: number;
  alertas_gerados: number;
}

export const FleetDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/fleet-metrics')
      .then(res => res.json())
      .then(data => setMetrics(data));
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="fleet-dashboard">
      <h2>Fleet Risk Dashboard</h2>
      <div className="metrics-grid">
        <MetricCard 
          title="Total Vessels" 
          value={metrics.total_embarcacoes} 
        />
        <MetricCard 
          title="Average Risk" 
          value={`${metrics.risco_medio.toFixed(1)}%`} 
        />
        <MetricCard 
          title="High Risk Vessels" 
          value={metrics.embarcacoes_alto_risco}
          alert={metrics.embarcacoes_alto_risco > 0}
        />
        <MetricCard 
          title="Alerts Generated" 
          value={metrics.alertas_gerados} 
        />
      </div>
    </div>
  );
};
```

## 🧪 Testing

### Unit Tests

```python
import unittest
from bridge_link import BridgeCore
from forecast_global import ForecastEngine

class TestPhase3Integration(unittest.TestCase):
    
    def setUp(self):
        self.bridge = BridgeCore(
            endpoint="https://test.example.com/api",
            token="test-token"
        )
        self.engine = ForecastEngine(model_type="random_forest")
    
    def test_bridge_connection(self):
        """Test BridgeLink connectivity."""
        # Mock connection test
        status = self.bridge.obter_status()
        self.assertIsNotNone(status)
    
    def test_forecast_prediction(self):
        """Test Forecast Global prediction."""
        # Train on sample data
        # self.engine.treinar("test_data.csv")
        
        # Make prediction
        prediction = self.engine.prever([2400, 3, 1, 85])
        
        self.assertIn('risco_percentual', prediction)
        self.assertIn('nivel_risco', prediction)
        self.assertGreaterEqual(prediction['risco_percentual'], 0)
        self.assertLessEqual(prediction['risco_percentual'], 100)

if __name__ == '__main__':
    unittest.main()
```

### Integration Test

```python
def test_complete_workflow():
    """Test complete audit workflow."""
    
    # Simulate audit completion
    audit_data = {
        'vessel': 'TEST-FPSO',
        'date': '2024-01-15',
        'pdf_path': 'test_report.pdf',
        'metrics': {
            'horas_dp': 2400,
            'falhas_mensais': 3,
            'eventos_asog': 1,
            'score_peodp': 85
        }
    }
    
    # Run workflow
    result = on_audit_complete(audit_data)
    
    # Verify results
    assert 'prediction' in result
    assert 'alert_generated' in result
    
    print("✅ Complete workflow test passed")

if __name__ == '__main__':
    test_complete_workflow()
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit credentials to version control
2. **HTTPS**: Use HTTPS for all production API endpoints
3. **Token Rotation**: Implement regular bearer token rotation
4. **Access Control**: Restrict API access to authorized IPs
5. **Logging**: Monitor all transmission attempts and failures
6. **Encryption**: Consider encrypting sensitive data at rest

## 📈 Performance Optimization

1. **Batch Processing**: Use `prever_lote()` for multiple predictions
2. **Async Operations**: Run BridgeSync in background thread
3. **Caching**: Cache frequently accessed predictions
4. **Database Indexing**: Ensure proper SQLite indexes
5. **Model Optimization**: Tune model hyperparameters for speed/accuracy balance

## 🐛 Troubleshooting

### BridgeLink Issues

**Problem**: Reports not transmitting
- Check SGSO endpoint availability
- Verify bearer token validity
- Check network connectivity
- Review sync queue status: `sync.get_statistics()`

**Problem**: High queue backlog
- Increase sync interval
- Check transmission success rate
- Verify SGSO API rate limits

### Forecast Global Issues

**Problem**: Low model accuracy
- Increase training dataset size
- Check data quality and labeling
- Try different model type (gradient_boosting)
- Review feature importance

**Problem**: Alerts not generating
- Verify alert threshold setting
- Check prediction values
- Ensure `auto_alert=True`

## 📚 Additional Resources

- **BridgeLink Documentation**: [modules/bridge_link/README.md](modules/bridge_link/README.md)
- **Forecast Global Documentation**: [modules/forecast_global/README.md](modules/forecast_global/README.md)
- **Quick Reference**: [PHASE3_QUICKREF.md](PHASE3_QUICKREF.md)
- **API Documentation**: See Flask API endpoints section

## 🎯 Next Steps

After Phase 3 integration:
1. Monitor system performance
2. Collect fleet data for model improvement
3. Fine-tune alert thresholds
4. Implement Phase 3.4: Control Hub web interface
5. Add advanced analytics and reporting
6. Integrate with additional SGSO endpoints

## 📞 Support

For integration issues or questions:
- Review module-specific READMEs
- Check example code in `__main__` sections
- Run unit tests to verify setup
- Check logs for detailed error information
