# Phase 3 Integration Guide: BridgeLink & Forecast Global

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [BridgeLink Integration](#bridgelink-integration)
5. [Forecast Global Integration](#forecast-global-integration)
6. [Complete Workflow](#complete-workflow)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

This guide provides step-by-step instructions for integrating Phase 3 modules (BridgeLink and Forecast Global) with the existing PEO-DP Inteligente system.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PEO-DP Inteligente                          │
│                   (Compliance Audits)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BridgeLink                                 │
│           (Secure Ship-to-Shore Communication)                  │
├─────────────────────────────────────────────────────────────────┤
│  • bridge_core: HTTPS communication                             │
│  • bridge_api: Local REST API                                   │
│  • bridge_sync: Offline queue                                   │
└────────────┬─────────────────────────────┬──────────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌───────────────────────────────────┐
│   SGSO Petrobras       │    │      Forecast Global              │
│   (Shore System)       │    │   (AI Risk Prediction)            │
└────────────────────────┘    ├───────────────────────────────────┤
                              │  • forecast_engine: ML models     │
                              │  • forecast_trainer: Learning     │
                              │  • forecast_dashboard: Analytics  │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Smart Workflow               │
                              │   (Corrective Actions)            │
                              └───────────────────────────────────┘
```

---

## Prerequisites

### System Requirements
- Python 3.8 or higher
- 500 MB free disk space
- Network connectivity for SGSO communication
- SQLite support (built-in with Python)

### Python Dependencies
```bash
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
joblib>=1.3.0
requests>=2.31.0
flask>=2.3.0
pyjwt>=2.8.0
reportlab>=4.0.0
```

### Credentials Required
- SGSO Petrobras API endpoint URL
- SGSO Bearer authentication token
- JWT secret key for local API (generate securely)

---

## Installation

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd /home/runner/work/travel-hr-buddy/travel-hr-buddy

# Install Python dependencies
pip install -r modules/requirements.txt

# Verify installation
python3 -c "
from bridge_link import BridgeCore, BridgeSync
from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard
print('✓ All modules installed successfully')
"
```

### Step 2: Configure Environment

Create a `.env.phase3` configuration file:

```bash
# BridgeLink Configuration
BRIDGE_ENDPOINT=https://sgso.petrobras.com.br/api/v1
BRIDGE_TOKEN=your_bearer_token_here
BRIDGE_SECRET_KEY=your_jwt_secret_key_here
BRIDGE_TIMEOUT=30

# Forecast Global Configuration
FORECAST_DATA_PATH=/data/fleet_training.csv
FORECAST_MODEL_PATH=/data/forecast_model.pkl
FORECAST_ALERT_THRESHOLD=60.0
FORECAST_MIN_TRAINING_RECORDS=100
FORECAST_RETRAIN_INTERVAL_DAYS=7

# Sync Configuration
SYNC_DB_PATH=/data/bridge_sync.db
SYNC_CHECK_INTERVAL=30

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/phase3.log
```

### Step 3: Initialize Directories

```bash
# Create data directories
mkdir -p /data
mkdir -p /var/log

# Set permissions
chmod 755 /data
chmod 755 /var/log
```

---

## BridgeLink Integration

### Basic Integration

```python
import os
from bridge_link import BridgeCore, BridgeSync, MessagePriority

# Load configuration
SGSO_ENDPOINT = os.getenv('BRIDGE_ENDPOINT')
AUTH_TOKEN = os.getenv('BRIDGE_TOKEN')

# Initialize BridgeCore
bridge = BridgeCore(
    endpoint=SGSO_ENDPOINT,
    token=AUTH_TOKEN,
    timeout=30
)

# Verify connection
status = bridge.verificar_conexao()
if not status['connected']:
    print(f"Connection failed: {status['error']}")
    exit(1)

print(f"✓ Connected to SGSO (latency: {status['latency_ms']}ms)")
```

### Integrating with PEO-DP Audits

```python
def integrar_peo_dp_com_bridge(audit_result, report_pdf_path):
    """
    Integrate PEO-DP audit with BridgeLink transmission.
    
    Args:
        audit_result: Dict with audit results
        report_pdf_path: Path to generated PDF report
    """
    # Prepare metadata
    metadata = {
        'vessel_id': audit_result.get('vessel_id'),
        'audit_date': audit_result.get('audit_date'),
        'audit_type': 'PEO-DP',
        'operator': audit_result.get('operator'),
        'rpn_medio': audit_result.get('rpn_medio'),
        'conformidade': audit_result.get('taxa_conformidade')
    }
    
    # Send report to SGSO
    result = bridge.enviar_relatorio(report_pdf_path, metadata)
    
    if result['success']:
        print(f"✓ Report transmitted: {result['message_id']}")
        
        # Also send event notification
        event_result = bridge.enviar_evento(
            event_type='audit_completed',
            event_data={
                'vessel_id': metadata['vessel_id'],
                'rpn_medio': metadata['rpn_medio'],
                'conformidade': metadata['conformidade']
            },
            priority='MEDIUM'
        )
        
        return result
    else:
        print(f"✗ Transmission failed: {result['error']}")
        return result

# Usage
audit_result = peo_dp.executar_auditoria()
report_path = peo_dp.gerar_relatorio_pdf(audit_result)
integrar_peo_dp_com_bridge(audit_result, report_path)
```

### Enabling Offline Sync

```python
from bridge_link import BridgeSync

# Initialize sync with offline capability
sync = BridgeSync(
    bridge_core=bridge,
    db_path='/data/bridge_sync.db'
)

# Start background sync
sync.start()
print("✓ Background sync started")

# Now messages will queue automatically when offline
# and sync when connection is restored

# Later: Stop sync gracefully
# sync.stop()
```

### Setting Up REST API

```python
from bridge_link import BridgeAPI

# Initialize API
api = BridgeAPI(
    secret_key=os.getenv('BRIDGE_SECRET_KEY'),
    bridge_core=bridge
)

# Run API server (in production, use proper WSGI server)
if __name__ == '__main__':
    api.run(host='0.0.0.0', port=5000, debug=False)
```

---

## Forecast Global Integration

### Initialize ML Engine

```python
from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard

# Initialize engine
engine = ForecastEngine(
    model_type="random_forest",
    n_estimators=200
)

# Check if pre-trained model exists
model_path = '/data/forecast_model.pkl'
if os.path.exists(model_path):
    engine.carregar_modelo(model_path)
    print("✓ Loaded existing model")
else:
    print("⚠ No model found - training required")
```

### Initial Training

```python
def treinar_modelo_inicial():
    """
    Perform initial model training with historical data.
    """
    # Prepare training data from historical audits
    # Expected columns: horas_dp, falhas, eventos_criticos, 
    #                   score_conformidade, risk_level
    
    training_data = preparar_dados_historicos()
    training_data.to_csv('/data/fleet_training.csv', index=False)
    
    # Train model
    result = engine.treinar('/data/fleet_training.csv')
    
    if result['success']:
        print(f"✓ Model trained: {result['training_accuracy']:.2%} accuracy")
        
        # Save model
        engine.salvar_modelo('/data/forecast_model.pkl')
        print("✓ Model saved")
        
        return True
    else:
        print(f"✗ Training failed: {result['error']}")
        return False

def preparar_dados_historicos():
    """
    Prepare historical audit data for training.
    """
    import pandas as pd
    
    # Load historical audits
    audits = carregar_auditorias_historicas()
    
    # Extract features and labels
    data = []
    for audit in audits:
        features = {
            'horas_dp': audit['horas_operacao_dp'],
            'falhas': audit['total_falhas'],
            'eventos_criticos': audit['eventos_criticos'],
            'score_conformidade': audit['taxa_conformidade'],
            'risk_level': calcular_nivel_risco(audit)  # 0-3
        }
        data.append(features)
    
    return pd.DataFrame(data)

# Perform initial training
if not os.path.exists('/data/forecast_model.pkl'):
    treinar_modelo_inicial()
```

### Integrating Predictions with Audits

```python
def prever_risco_pos_auditoria(audit_result):
    """
    Predict risk after completing an audit.
    
    Args:
        audit_result: Dict with audit results
        
    Returns:
        Prediction result with risk assessment
    """
    # Extract features from audit
    features = [
        audit_result.get('horas_operacao_dp', 0),
        audit_result.get('total_falhas', 0),
        audit_result.get('eventos_criticos', 0),
        audit_result.get('taxa_conformidade', 100)
    ]
    
    # Make prediction
    prediction = engine.prever(features)
    
    if prediction['success']:
        print(f"Risk Prediction:")
        print(f"  Class: {prediction['risk_class']}")
        print(f"  Probability: {prediction['risk_probability']:.1f}%")
        print(f"  Confidence: {prediction['confidence']:.1f}%")
        
        return prediction
    else:
        print(f"Prediction failed: {prediction['error']}")
        return None

# Usage
audit_result = peo_dp.executar_auditoria()
prediction = prever_risco_pos_auditoria(audit_result)
```

### Setting Up Dashboard and Alerts

```python
# Initialize dashboard
dashboard = ForecastDashboard(
    engine=engine,
    alert_threshold=float(os.getenv('FORECAST_ALERT_THRESHOLD', 60.0)),
    history_path='/data/forecast_history.csv'
)

def processar_predicao_com_alertas(vessel_id, prediction, audit_result):
    """
    Process prediction and generate alerts if needed.
    """
    # Register prediction
    result = dashboard.registrar_predicao(
        vessel_id=vessel_id,
        prediction=prediction,
        metadata={
            'horas_dp': audit_result.get('horas_operacao_dp'),
            'falhas': audit_result.get('total_falhas'),
            'operator': audit_result.get('operator')
        }
    )
    
    # Check if alert was generated
    if result['alert_generated']:
        print("⚠️ HIGH RISK ALERT GENERATED")
        print(result['alert_message'])
        
        # Trigger corrective action workflow
        trigger_smart_workflow(vessel_id, prediction, audit_result)
    
    return result

def trigger_smart_workflow(vessel_id, prediction, audit_result):
    """
    Trigger Smart Workflow corrective action for high risk.
    """
    workflow_data = {
        'vessel_id': vessel_id,
        'risk_level': prediction['risk_class'],
        'risk_probability': prediction['risk_probability'],
        'audit_date': audit_result.get('audit_date'),
        'action_type': 'corrective',
        'priority': 'high',
        'description': f"Automatic corrective action triggered due to high risk ({prediction['risk_probability']:.1f}%)"
    }
    
    # Call Smart Workflow API
    # smart_workflow.criar_acao(workflow_data)
    print(f"✓ Smart Workflow action created for {vessel_id}")
```

### Continuous Learning Setup

```python
from forecast_global import ForecastTrainer

# Initialize trainer
trainer = ForecastTrainer(
    data_path='/data/fleet_training.csv',
    engine=engine,
    min_records_for_retrain=int(os.getenv('FORECAST_MIN_TRAINING_RECORDS', 100)),
    retrain_interval_days=int(os.getenv('FORECAST_RETRAIN_INTERVAL_DAYS', 7))
)

def adicionar_auditoria_ao_dataset(audit_result, prediction):
    """
    Add completed audit to training dataset for continuous learning.
    """
    # Prepare training record
    training_record = {
        'horas_dp': audit_result.get('horas_operacao_dp'),
        'falhas': audit_result.get('total_falhas'),
        'eventos_criticos': audit_result.get('eventos_criticos'),
        'score_conformidade': audit_result.get('taxa_conformidade'),
        'risk_level': mapear_risco_para_nivel(prediction['risk_class'])
    }
    
    # Add to dataset
    result = trainer.adicionar_dados_auditoria(training_record)
    print(f"✓ Added to training dataset: {result['total_records']} total records")
    
    # Check if retraining is needed
    evaluation = trainer.avaliar_necessidade_retreinamento()
    if evaluation['should_retrain']:
        print(f"⚠ Retraining recommended: {', '.join(evaluation['reasons'])}")

def mapear_risco_para_nivel(risk_class):
    """Map risk class to numeric level."""
    mapping = {'baixo': 0, 'medio': 1, 'alto': 2, 'critico': 3}
    return mapping.get(risk_class, 1)
```

---

## Complete Workflow

### End-to-End Integration

```python
def executar_workflow_completo(vessel_id):
    """
    Execute complete Phase 3 workflow:
    1. Audit
    2. Transmit to SGSO
    3. Predict risk
    4. Alert and workflow
    5. Continuous learning
    """
    print(f"\n{'='*60}")
    print(f"Starting complete workflow for {vessel_id}")
    print(f"{'='*60}\n")
    
    # Step 1: Execute PEO-DP Audit
    print("Step 1: Executing PEO-DP audit...")
    audit_result = peo_dp.executar_auditoria()
    print(f"✓ Audit complete: RPN={audit_result['rpn_medio']:.2f}")
    
    # Step 2: Generate and transmit report via BridgeLink
    print("\nStep 2: Transmitting report to SGSO...")
    report_path = peo_dp.gerar_relatorio_pdf(audit_result)
    transmission = integrar_peo_dp_com_bridge(audit_result, report_path)
    
    if not transmission['success']:
        print("⚠ Report transmission failed - queued for retry")
    
    # Step 3: Predict risk with Forecast Global
    print("\nStep 3: Predicting fleet risk...")
    prediction = prever_risco_pos_auditoria(audit_result)
    
    if not prediction:
        print("⚠ Risk prediction failed")
        return
    
    # Step 4: Register prediction and check alerts
    print("\nStep 4: Processing prediction and alerts...")
    alert_result = processar_predicao_com_alertas(
        vessel_id, prediction, audit_result
    )
    
    # Step 5: Add to training dataset
    print("\nStep 5: Adding to training dataset...")
    adicionar_auditoria_ao_dataset(audit_result, prediction)
    
    # Step 6: Check and perform automatic retraining
    print("\nStep 6: Evaluating retraining need...")
    retrain_result = trainer.agendar_retreinamento_automatico()
    
    if retrain_result['retrained']:
        print("✓ Model retrained automatically")
        # Reload model
        engine.carregar_modelo('/data/forecast_model.pkl')
    else:
        print("  No retraining needed at this time")
    
    print(f"\n{'='*60}")
    print("Workflow complete")
    print(f"{'='*60}\n")
    
    return {
        'audit': audit_result,
        'transmission': transmission,
        'prediction': prediction,
        'alert': alert_result,
        'retrained': retrain_result.get('retrained', False)
    }

# Execute workflow
resultado = executar_workflow_completo('FPSO-123')
```

---

## Production Deployment

### Systemd Service (Linux)

Create `/etc/systemd/system/phase3-sync.service`:

```ini
[Unit]
Description=Phase 3 BridgeLink Sync Service
After=network.target

[Service]
Type=simple
User=nautilus
WorkingDirectory=/home/nautilus/travel-hr-buddy
Environment="BRIDGE_ENDPOINT=https://sgso.petrobras.com.br/api/v1"
Environment="BRIDGE_TOKEN=your_token"
ExecStart=/usr/bin/python3 -m bridge_link.sync_daemon
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable phase3-sync
sudo systemctl start phase3-sync
sudo systemctl status phase3-sync
```

### Flask API with Gunicorn

Create `wsgi.py`:

```python
from bridge_link import BridgeAPI, BridgeCore
import os

bridge = BridgeCore(
    endpoint=os.getenv('BRIDGE_ENDPOINT'),
    token=os.getenv('BRIDGE_TOKEN')
)

api = BridgeAPI(
    secret_key=os.getenv('BRIDGE_SECRET_KEY'),
    bridge_core=bridge
)

application = api.app

if __name__ == '__main__':
    application.run()
```

Run with Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:application
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name bridge.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Monitoring & Maintenance

### Health Checks

```python
def verificar_saude_sistema():
    """Check health of all Phase 3 components."""
    
    health = {
        'bridge_connection': False,
        'sync_queue_size': 0,
        'model_loaded': False,
        'recent_predictions': 0
    }
    
    # Check BridgeLink connection
    status = bridge.verificar_conexao()
    health['bridge_connection'] = status['connected']
    
    # Check sync queue
    stats = sync.get_statistics()
    health['sync_queue_size'] = stats['status_counts'].get('pending', 0)
    
    # Check model status
    health['model_loaded'] = engine.trained
    
    # Check recent predictions
    metrics = dashboard.obter_metricas_frota(days=1)
    if metrics['success']:
        health['recent_predictions'] = metrics['metrics']['total_predictions']
    
    return health

# Run health check
saude = verificar_saude_sistema()
print(json.dumps(saude, indent=2))
```

### Scheduled Maintenance

```python
import schedule
import time

def manutencao_diaria():
    """Daily maintenance tasks."""
    print("Running daily maintenance...")
    
    # Clean old sync messages
    deleted = sync.cleanup_old_messages(days=30)
    print(f"  Cleaned {deleted} old messages")
    
    # Backup model
    if os.path.exists('/data/forecast_model.pkl'):
        backup_path = f'/data/backups/model_{datetime.now().strftime("%Y%m%d")}.pkl'
        shutil.copy('/data/forecast_model.pkl', backup_path)
        print(f"  Model backed up to {backup_path}")
    
    # Export fleet report
    dashboard.exportar_relatorio_csv(
        f'/data/reports/fleet_{datetime.now().strftime("%Y%m%d")}.csv',
        days=7
    )
    print("  Fleet report exported")

# Schedule daily at 2 AM
schedule.every().day.at("02:00").do(manutencao_diaria)

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## Troubleshooting

See `PHASE3_QUICKREF.md` for common issues and solutions.

---

**Version:** 1.0.0  
**Last Updated:** October 20, 2025  
**For Support:** Contact development team
