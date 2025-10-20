# 🌐 BridgeLink Module - User Guide

## Overview

The BridgeLink module is a Python-based component for the Nautilus One system that enables secure transmission of operational reports to external SGSO (Sistema de Gestão de Segurança Operacional) servers.

## Features

- 🔐 **Secure Communication**: Bearer token authentication and HTTPS-only transmission
- 📊 **Multi-Report Support**: Automatically synchronizes FMEA, ASOG, FORECAST, and AUTO_REPORT
- ⏱️ **Timeout Protection**: 15-second request timeout prevents hanging connections
- 📝 **Comprehensive Logging**: Full audit trail of all transmission activities
- 🛡️ **Error Recovery**: Robust error handling with automatic retry logic
- ⚙️ **Configurable**: Easy configuration via JSON file

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Configure the endpoint and authentication token in `config.json`:

```json
{
  "endpoint": "https://api.sgso.nautilus.one/upload",
  "auth_token": "Bearer YOUR_ACTUAL_TOKEN"
}
```

### Usage

#### Interactive Mode (Recommended)

Run the Decision Core CLI:

```bash
python main.py
```

Select option 6: `🌐 Transmitir relatórios ao SGSO (BridgeLink)`

#### Programmatic Usage

```python
from modules.bridge_link import BridgeLink

# Initialize BridgeLink
bridge = BridgeLink()

# Synchronize all available reports
bridge.sincronizar()
```

## Report Types

The BridgeLink module transmits four types of reports:

| Report Type | File | Description |
|------------|------|-------------|
| **FMEA** | `relatorio_fmea_atual.json` | Failure Mode and Effects Analysis |
| **ASOG** | `asog_report.json` | Operational and Safety Audit |
| **FORECAST** | `forecast_risco.json` | Risk Prediction and Analysis |
| **AUTO_REPORT** | `nautilus_full_report.json` | Consolidated System Report |

## Configuration

### config.json

```json
{
  "endpoint": "https://api.sgso.nautilus.one/upload",
  "auth_token": "Bearer YOUR_TOKEN_HERE"
}
```

**Configuration Parameters:**

- `endpoint` (string): SGSO server API endpoint URL
- `auth_token` (string): Bearer authentication token

⚠️ **Security Note**: Never commit the `config.json` file with real tokens to version control.

## Logging

All BridgeLink activities are logged to `nautilus_system.log` with timestamps:

```
[2025-10-20 11:14:46] BridgeLink iniciado.
[2025-10-20 11:14:46] Relatório FMEA enviado com sucesso.
[2025-10-20 11:14:47] Relatório ASOG enviado com sucesso.
[2025-10-20 11:14:47] Relatório FORECAST enviado com sucesso.
[2025-10-20 11:14:48] Relatório AUTO_REPORT enviado com sucesso.
[2025-10-20 11:14:48] Transmissão concluída.
```

## Error Handling

BridgeLink handles various error scenarios gracefully:

- **File Not Found**: Skips missing report files and continues with others
- **Invalid JSON**: Logs error and continues processing remaining files
- **Connection Errors**: Logs error with retry information
- **HTTP Errors**: Captures and logs HTTP status codes
- **Timeout**: 15-second timeout prevents hanging connections

## Testing

Run the automated test suite:

```bash
python test_bridge_link.py
```

**Test Coverage:**

- ✅ Configuration loading (with and without config file)
- ✅ File loading (success, not found, invalid JSON)
- ✅ Report transmission (success, HTTP errors, connection errors)
- ✅ Multi-report synchronization
- ✅ Sample file validation

## Production Deployment

### Step 1: Update Configuration

Replace test values in `config.json`:

```json
{
  "endpoint": "https://production.sgso.nautilus.one/upload",
  "auth_token": "Bearer PRODUCTION_TOKEN"
}
```

### Step 2: Test Connection

Run a manual transmission test:

```bash
python main.py
# Select option 6
```

### Step 3: Automated Execution (Optional)

Set up a cron job for automated report transmission:

```bash
# Edit crontab
crontab -e

# Add scheduled job (e.g., daily at 2 AM)
0 2 * * * cd /path/to/nautilus-one && python -c "from modules.bridge_link import BridgeLink; BridgeLink().sincronizar()"
```

### Step 4: Monitor Logs

Regularly check `nautilus_system.log` for transmission status:

```bash
tail -f nautilus_system.log
```

## Security Best Practices

1. **Never Hardcode Tokens**: Always use `config.json` for credentials
2. **HTTPS Only**: Ensure endpoint uses HTTPS protocol
3. **Token Rotation**: Regularly update authentication tokens
4. **Log Monitoring**: Review logs for suspicious activity
5. **Access Control**: Restrict file permissions on `config.json`

```bash
chmod 600 config.json  # Read/write for owner only
```

## Troubleshooting

### Issue: "Config file not found"

**Solution**: Create `config.json` in the project root with required parameters.

### Issue: "Connection timeout"

**Possible Causes**:
- Network connectivity issues
- SGSO server down or unreachable
- Firewall blocking outbound HTTPS

**Solution**: Check network connectivity and verify SGSO server status.

### Issue: "Authentication failed (401)"

**Solution**: Verify the `auth_token` in `config.json` is valid and not expired.

### Issue: "File not found" for report files

**Solution**: Ensure all report JSON files exist in the project root directory.

## Support

For issues, questions, or contributions, please refer to the main Nautilus One documentation or contact the system administrator.

## Version History

- **v1.0.0** (2025-10-20): Initial release
  - Multi-report synchronization
  - Secure bearer token authentication
  - Comprehensive error handling
  - Full logging support
  - Automated test suite

## License

Part of the Nautilus One System. All rights reserved.
