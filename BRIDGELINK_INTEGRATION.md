# 🔧 BridgeLink - Technical Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Nautilus One System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  TypeScript  │◄──►│   Supabase   │◄──►│    Python    │  │
│  │    React     │    │   Backend    │    │  BridgeLink  │  │
│  │  (Frontend)  │    │ (Database)   │    │   Module     │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                   │           │
└───────────────────────────────────────────────────┼──────────┘
                                                    │
                                                    ↓ HTTPS
                                          ┌─────────────────┐
                                          │   SGSO Server   │
                                          │  (External API) │
                                          └─────────────────┘
```

## Component Architecture

### BridgeLink Module Structure

```
nautilus-one/
├── core/
│   └── logger.py                    # Logging utility
├── modules/
│   └── bridge_link.py               # Main BridgeLink class
├── main.py                          # CLI interface
├── config.json                      # Configuration file
├── requirements.txt                 # Python dependencies
├── test_bridge_link.py             # Unit tests
├── relatorio_fmea_atual.json       # Sample FMEA report
├── asog_report.json                # Sample ASOG report
├── forecast_risco.json             # Sample FORECAST report
└── nautilus_full_report.json       # Sample AUTO_REPORT
```

## Core Components

### 1. Logger Module (`core/logger.py`)

**Purpose**: Provides centralized logging with timestamp and dual output.

**Key Functions**:

```python
def log_event(message: str) -> None:
    """
    Log an event with timestamp to both file and console
    
    Args:
        message (str): The message to log
    """
```

**Features**:
- UTC timestamp formatting
- Console output for real-time monitoring
- File output for audit trail
- UTF-8 encoding support
- Error handling for file write failures

**Log Format**:
```
[YYYY-MM-DD HH:MM:SS] Message text
```

### 2. BridgeLink Module (`modules/bridge_link.py`)

**Purpose**: Manages secure communication with SGSO server.

**Class Structure**:

```python
class BridgeLink:
    """
    Main BridgeLink class for SGSO report transmission
    """
    
    def __init__(self):
        """Initialize with config loading"""
        
    def load_config(self):
        """Load configuration from config.json"""
        
    def carregar_arquivo(self, path: str) -> dict:
        """Load JSON report file"""
        
    def enviar_relatorio(self, nome: str, dados: dict) -> bool:
        """Send report to SGSO server"""
        
    def sincronizar(self):
        """Synchronize all reports"""
```

**Attributes**:
- `endpoint` (str): SGSO API endpoint URL
- `headers` (dict): HTTP headers including authentication
- `files` (dict): Mapping of report names to file paths

### 3. Decision Core CLI (`main.py`)

**Purpose**: Interactive command-line interface for Nautilus One operations.

**Key Functions**:

```python
def exibir_menu() -> None:
    """Display the main menu"""
    
def executar_opcao(escolha: str) -> bool:
    """Execute selected menu option"""
    
def main() -> None:
    """Main function to run the CLI"""
```

**Menu Options**:
1. 📊 Executar análise FMEA
2. 🔍 Realizar auditoria ASOG
3. 📈 Gerar forecast de risco
4. 📄 Criar auto-relatório do sistema
5. 📋 Visualizar relatórios disponíveis
6. 🌐 Transmitir relatórios ao SGSO (BridgeLink)
0. 🚪 Sair

## API Communication Protocol

### Request Format

**Endpoint**: `POST {endpoint_url}`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Payload Structure**:
```json
{
  "report_name": "FMEA",
  "timestamp": "2025-10-20T11:00:00.000000",
  "data": {
    // Report-specific data
  }
}
```

### Response Handling

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Log success, continue |
| 401 | Unauthorized | Log error, check token |
| 403 | Forbidden | Log error, check permissions |
| 404 | Not Found | Log error, verify endpoint |
| 500 | Server Error | Log error, retry later |
| Timeout | No response | Log error, check connectivity |

### Error Handling Flow

```
┌─────────────────────┐
│  Load Report File   │
└──────────┬──────────┘
           │
           ↓
     ┌─────────┐
     │ Valid?  │──No──► Log Error ──► Continue to Next
     └────┬────┘
          │ Yes
          ↓
┌─────────────────────┐
│  Build Payload      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Send POST Request  │
└──────────┬──────────┘
           │
           ↓
     ┌─────────┐
     │ 200 OK? │──No──► Log Error ──► Continue to Next
     └────┬────┘
          │ Yes
          ↓
┌─────────────────────┐
│  Log Success        │
└─────────────────────┘
```

## Configuration Management

### Configuration File (`config.json`)

**Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "endpoint": {
      "type": "string",
      "format": "uri",
      "pattern": "^https://"
    },
    "auth_token": {
      "type": "string",
      "pattern": "^Bearer "
    }
  },
  "required": ["endpoint", "auth_token"]
}
```

### Environment-Specific Configurations

**Development**:
```json
{
  "endpoint": "https://dev.api.sgso.nautilus.one/upload",
  "auth_token": "Bearer DEV-TOKEN"
}
```

**Staging**:
```json
{
  "endpoint": "https://staging.api.sgso.nautilus.one/upload",
  "auth_token": "Bearer STAGING-TOKEN"
}
```

**Production**:
```json
{
  "endpoint": "https://api.sgso.nautilus.one/upload",
  "auth_token": "Bearer PRODUCTION-TOKEN"
}
```

## Report Schema Specifications

### FMEA Report

```json
{
  "report_type": "FMEA",
  "version": "string",
  "generated_at": "ISO8601 timestamp",
  "system": "string",
  "analysis": {
    "title": "string",
    "scope": "string",
    "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "findings": [
      {
        "component": "string",
        "failure_mode": "string",
        "effects": "string",
        "severity": "number (1-10)",
        "occurrence": "number (1-10)",
        "detection": "number (1-10)",
        "rpn": "number (calculated)",
        "recommended_actions": ["string"]
      }
    ]
  }
}
```

### ASOG Report

```json
{
  "report_type": "ASOG",
  "version": "string",
  "generated_at": "ISO8601 timestamp",
  "system": "string",
  "audit": {
    "title": "string",
    "period": {
      "start": "date",
      "end": "date"
    },
    "compliance_score": "number (0-100)",
    "areas_audited": [
      {
        "area": "string",
        "status": "COMPLIANT|NEEDS_ATTENTION|NON_COMPLIANT",
        "score": "number (0-100)",
        "observations": ["string"],
        "recommendations": ["string"]
      }
    ]
  }
}
```

### FORECAST Report

```json
{
  "report_type": "FORECAST",
  "version": "string",
  "generated_at": "ISO8601 timestamp",
  "system": "string",
  "forecast": {
    "title": "string",
    "forecast_period": {
      "start": "date",
      "end": "date"
    },
    "overall_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "confidence_level": "number (0-1)",
    "risk_categories": [
      {
        "category": "string",
        "current_risk": "string",
        "predicted_risk": "string",
        "trend": "INCREASING|STABLE|DECREASING",
        "probability": "number (0-1)",
        "impact": "number (1-10)"
      }
    ]
  }
}
```

### AUTO_REPORT

```json
{
  "report_type": "AUTO_REPORT",
  "version": "string",
  "generated_at": "ISO8601 timestamp",
  "system": "string",
  "consolidated_report": {
    "title": "string",
    "reporting_period": {
      "start": "date",
      "end": "date"
    },
    "executive_summary": {
      "overall_status": "string",
      "system_health": "number (0-100)",
      "critical_alerts": "number",
      "warnings": "number"
    },
    "system_metrics": {},
    "operational_modules": {},
    "incidents_and_alerts": {}
  }
}
```

## Integration Patterns

### Pattern 1: Synchronous Transmission

```python
from modules.bridge_link import BridgeLink

def sync_reports():
    bridge = BridgeLink()
    bridge.sincronizar()
```

**Use Case**: Manual triggering, on-demand report transmission

### Pattern 2: Scheduled Transmission

```python
import schedule
import time
from modules.bridge_link import BridgeLink

def scheduled_sync():
    bridge = BridgeLink()
    bridge.sincronizar()

# Schedule daily at 2 AM
schedule.every().day.at("02:00").do(scheduled_sync)

while True:
    schedule.run_pending()
    time.sleep(60)
```

**Use Case**: Automated daily/weekly reports

### Pattern 3: Event-Driven Transmission

```python
from modules.bridge_link import BridgeLink

def on_report_generated(report_type, report_path):
    bridge = BridgeLink()
    data = bridge.carregar_arquivo(report_path)
    if data:
        bridge.enviar_relatorio(report_type, data)
```

**Use Case**: Real-time transmission after report generation

### Pattern 4: Bulk Transmission with Retry

```python
from modules.bridge_link import BridgeLink
import time

def bulk_sync_with_retry(max_retries=3):
    bridge = BridgeLink()
    
    for attempt in range(max_retries):
        try:
            bridge.sincronizar()
            break
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(60 * (attempt + 1))  # Exponential backoff
            else:
                raise
```

**Use Case**: Critical transmissions with fault tolerance

## Testing Strategy

### Unit Tests

```python
# Test configuration loading
def test_load_config()

# Test file loading
def test_carregar_arquivo()

# Test report transmission
def test_enviar_relatorio()

# Test synchronization
def test_sincronizar()
```

### Integration Tests

```python
# Test end-to-end transmission
def test_e2e_transmission()

# Test error recovery
def test_error_recovery()

# Test sample files validation
def test_sample_files()
```

### Manual Testing Checklist

- [ ] Configuration file loading
- [ ] Report file validation
- [ ] Network connectivity
- [ ] Authentication token validity
- [ ] Error handling scenarios
- [ ] Log file generation
- [ ] CLI menu navigation
- [ ] Successful transmission

## Performance Considerations

### Timeout Settings

- **Default Timeout**: 15 seconds
- **Recommended Range**: 10-30 seconds
- **Large Reports**: Consider increasing timeout

### Concurrency

Current implementation is synchronous. For high-volume scenarios:

```python
from concurrent.futures import ThreadPoolExecutor
from modules.bridge_link import BridgeLink

def parallel_sync():
    bridge = BridgeLink()
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for nome, arquivo in bridge.files.items():
            dados = bridge.carregar_arquivo(arquivo)
            if dados:
                future = executor.submit(
                    bridge.enviar_relatorio, 
                    nome, 
                    dados
                )
                futures.append(future)
```

## Monitoring and Observability

### Key Metrics to Monitor

1. **Success Rate**: Percentage of successful transmissions
2. **Response Time**: Average time per transmission
3. **Error Rate**: Frequency and types of errors
4. **File Availability**: Presence of all required report files

### Log Analysis

```bash
# Count successful transmissions
grep "enviado com sucesso" nautilus_system.log | wc -l

# Count errors
grep "Erro" nautilus_system.log | wc -l

# Get latest transmissions
tail -n 100 nautilus_system.log | grep "BridgeLink"
```

## Security Considerations

### Authentication

- Use strong, regularly rotated bearer tokens
- Store tokens securely (never in code)
- Use environment-specific tokens

### Network Security

- HTTPS only (TLS 1.2+)
- Certificate validation enabled
- Firewall rules for outbound connections

### Data Security

- No sensitive data in logs
- Report data encrypted in transit
- Secure file permissions

## Troubleshooting Guide

### Common Issues and Solutions

**Issue**: ImportError when running tests
```bash
# Solution: Ensure Python path includes project root
export PYTHONPATH="${PYTHONPATH}:/path/to/nautilus-one"
```

**Issue**: Permission denied on log file
```bash
# Solution: Fix file permissions
chmod 644 nautilus_system.log
```

**Issue**: Connection refused
```bash
# Solution: Check network and firewall
ping api.sgso.nautilus.one
telnet api.sgso.nautilus.one 443
```

## Future Enhancements

1. **Async Support**: Implement async/await for better performance
2. **Queue System**: Add message queue for reliable delivery
3. **Webhooks**: Support webhook notifications for transmission status
4. **Batch Processing**: Optimize for large report volumes
5. **Compression**: Add gzip compression for large payloads
6. **Metrics Dashboard**: Real-time monitoring interface
7. **Multi-Endpoint**: Support multiple SGSO servers

## Version History

- **v1.0.0** (2025-10-20): Initial release

## References

- [Nautilus One Main Documentation](./README.md)
- [BridgeLink User Guide](./BRIDGELINK_README.md)
- [Python Requests Library](https://requests.readthedocs.io/)
