# BridgeLink Module

Secure ship-to-shore communication bridge for automatic report transmission and critical event notification to SGSO Petrobras.

## Features

- **Secure HTTP Communication** - Bearer token authentication with HTTPS
- **Automatic Report Transmission** - PDF reports sent to SGSO Petrobras
- **Critical Event Notification** - Real-time alerts for DP loss, failures, ASOG alerts
- **Offline Synchronization** - SQLite-backed queue with automatic retry
- **REST API** - Local Flask API with JWT authentication and rate limiting
- **Background Sync** - Automatic transmission when connection restored

## Components

### bridge_core.py

Secure HTTP communication layer for transmitting reports and events to SGSO Petrobras.

**Key Methods:**
- `verificar_conexao()` - Test connection to SGSO endpoint
- `enviar_relatorio(pdf_path, metadata)` - Send PDF report with metadata
- `enviar_evento(event_type, event_data, priority)` - Send critical event
- `obter_status()` - Get system status from SGSO

**Example:**
```python
from bridge_link import BridgeCore

bridge = BridgeCore(
    endpoint="https://sgso.petrobras.com.br/api/v1",
    token="your_bearer_token"
)

# Test connection
status = bridge.verificar_conexao()
print(f"Connected: {status['connected']}, Latency: {status['latency_ms']}ms")

# Send report
result = bridge.enviar_relatorio(
    "audit_report.pdf",
    metadata={
        "vessel": "FPSO-123",
        "date": "2025-10-20",
        "audit_type": "PEO-DP"
    }
)
print(f"Success: {result['success']}, ID: {result.get('message_id')}")
```

### bridge_sync.py

Offline/online synchronization system with persistent message queue using SQLite.

**Key Methods:**
- `enqueue_message(type, payload, priority)` - Add message to queue
- `start()` - Start background sync thread
- `stop()` - Stop background sync thread
- `get_statistics()` - Get queue statistics
- `cleanup_old_messages(days)` - Clean old successfully sent messages

**Message Priorities:**
- `MessagePriority.LOW` - Normal operations
- `MessagePriority.MEDIUM` - Standard events
- `MessagePriority.HIGH` - Important alerts
- `MessagePriority.CRITICAL` - Emergency situations

**Example:**
```python
from bridge_link import BridgeCore, BridgeSync, MessagePriority

bridge = BridgeCore(endpoint=ENDPOINT, token=TOKEN)
sync = BridgeSync(bridge_core=bridge, db_path="bridge_sync.db")

# Start background sync
sync.start()

# Enqueue message (will sync automatically)
message_id = sync.enqueue_message(
    message_type="event",
    payload={
        'event_type': 'loss_dp',
        'data': {'vessel': 'FPSO-123', 'timestamp': '2025-10-20T12:00:00'},
        'priority': 'CRITICAL'
    },
    priority=MessagePriority.CRITICAL
)

# Get statistics
stats = sync.get_statistics()
print(f"Pending: {stats['status_counts'].get('pending', 0)}")

# Clean up old messages (30 days)
deleted = sync.cleanup_old_messages(days=30)
print(f"Cleaned up {deleted} old messages")

# Stop when done
sync.stop()
```

### bridge_api.py

Flask-based REST API with JWT authentication for local integration.

**Endpoints:**
- `GET /health` - Health check (no auth)
- `POST /auth/login` - Get JWT token
- `POST /reports` - Upload PDF report (requires JWT)
- `POST /events` - Send event (requires JWT)
- `GET /status` - Get system status (requires JWT)

**Rate Limits:**
- 200 requests per day per IP
- 50 requests per hour per IP

**Example:**
```python
from bridge_link import BridgeAPI, BridgeCore
import os

# Initialize
bridge = BridgeCore(endpoint=ENDPOINT, token=TOKEN)
api = BridgeAPI(
    secret_key=os.getenv('BRIDGE_SECRET_KEY', 'change_in_production'),
    bridge_core=bridge
)

# Run server
api.run(host='0.0.0.0', port=5000)
```

**API Usage:**
```bash
# Get JWT token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# Upload report
curl -X POST http://localhost:5000/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "report=@audit_report.pdf" \
  -F "metadata={\"vessel\":\"FPSO-123\"}"

# Send event
curl -X POST http://localhost:5000/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "loss_dp",
    "data": {"vessel": "FPSO-123"},
    "priority": "CRITICAL"
  }'
```

## Performance

- **Throughput:** ~1,000 messages/hour
- **Latency:** <100ms per transmission
- **Queue Capacity:** Unlimited (SQLite-backed)
- **Retry Strategy:** Exponential backoff up to 5 attempts
- **Rate Limiting:** 200 req/day, 50 req/hour

## Configuration

### Environment Variables

```bash
export BRIDGE_ENDPOINT="https://sgso.petrobras.com.br/api/v1"
export BRIDGE_TOKEN="your_bearer_token"
export BRIDGE_SECRET_KEY="your_jwt_secret"
export BRIDGE_TIMEOUT="30"
```

### Database

BridgeSync uses SQLite for persistent queue:
- Default location: `bridge_sync.db`
- Schema: messages table with id, type, priority, payload, status, attempts, timestamps
- Automatic cleanup of old sent messages

## Security

- **Bearer Token Authentication** for SGSO communication
- **JWT Authentication** for local API
- **Rate Limiting** to prevent abuse
- **Input Validation** on all endpoints
- **Comprehensive Audit Logging**
- **HTTPS Recommended** for production

## Dependencies

```txt
requests>=2.31.0
flask>=2.3.0
pyjwt>=2.8.0
```

## Installation

```bash
pip install -r ../requirements.txt
```

## Testing

```python
# Test connection
from bridge_link import BridgeCore

bridge = BridgeCore(endpoint=ENDPOINT, token=TOKEN)
status = bridge.verificar_conexao()
assert status['connected'], "Connection failed"
print("✓ Connection test passed")
```

## Production Deployment

See `PHASE3_INTEGRATION_GUIDE.md` for complete deployment instructions including:
- Systemd service configuration
- Gunicorn/WSGI deployment
- Nginx reverse proxy setup
- Monitoring and maintenance

## Troubleshooting

### Connection Issues

```python
status = bridge.verificar_conexao()
if not status['connected']:
    print(f"Error: {status['error']}")
    # Check endpoint URL, token, network connectivity
```

### Queue Not Draining

```python
stats = sync.get_statistics()
pending = stats['status_counts'].get('pending', 0)
if pending > 100:
    # Check connection, increase sync interval, or investigate errors
    pass
```

## License

MIT

## Version

1.0.0
