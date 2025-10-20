# 🔱 BridgeLink Integration Guide - Nautilus One

## Overview

This document describes the integration of the **BridgeLink** Python module with the Nautilus One system. BridgeLink enables secure transmission of critical operational reports to external SGSO (Sistema de Gestão de Segurança Operacional) systems.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    NAUTILUS ONE SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TypeScript/  │  │   Supabase   │  │    Python    │      │
│  │   React      │  │     Edge     │  │  BridgeLink  │      │
│  │   Frontend   │  │   Functions  │  │    Module    │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   SGSO Server   │
                   │  (External API) │
                   └─────────────────┘
```

## Module Structure

### Python Components

```
.
├── main.py                           # CLI Entry Point (Decision Core)
├── requirements.txt                  # Python Dependencies
├── config.json                       # Configuration (endpoint, auth)
├── core/
│   ├── __init__.py
│   └── logger.py                     # System Logging Utility
├── modules/
│   ├── __init__.py
│   └── bridge_link.py               # BridgeLink Main Module
└── reports/                          # Report Files (JSON)
    ├── relatorio_fmea_atual.json    # FMEA Analysis
    ├── asog_report.json             # Operational Audit
    ├── forecast_risco.json          # Risk Forecast
    └── nautilus_full_report.json    # Consolidated Report
```

## Integration with Decision Core

### Menu System (main.py)

The BridgeLink module is integrated into the main CLI menu system:

```python
# main.py - Option 6
elif escolha == "6":
    print("\n🌐 Iniciando transmissão BridgeLink...")
    log_event("BridgeLink solicitado")
    try:
        from modules.bridge_link import BridgeLink
        bridge = BridgeLink()
        bridge.sincronizar()
    except Exception as e:
        print(f"❌ Erro ao executar BridgeLink: {e}")
        log_event(f"Erro no BridgeLink: {e}")
```

### Menu Display

```
============================================================
🔱 NAUTILUS ONE - DECISION CORE
============================================================
1. 🔍 FMEA Auditor - Diagnóstico e análise de falhas
2. ✅ ASOG Review - Verificação operacional
3. 📊 Forecast de Risco - Previsão preditiva
4. 📝 Auto-Report - Consolidação e geração de relatório
5. 🎯 Executar todos os módulos
6. 🌐 Transmitir relatórios ao SGSO (BridgeLink)  ← NEW
0. ❌ Sair
============================================================
```

## Report Types

### 1. FMEA (Failure Mode and Effects Analysis)
**File:** `relatorio_fmea_atual.json`

Analyzes potential failure modes and their effects on system operations.

```json
{
  "tipo": "FMEA",
  "componentes_criticos": [...],
  "resumo": {
    "total_componentes_analisados": 25,
    "componentes_alto_risco": 2,
    "componentes_medio_risco": 8
  }
}
```

### 2. ASOG (Auditoria de Segurança Operacional Geral)
**File:** `asog_report.json`

Comprehensive operational safety audit results.

```json
{
  "tipo": "ASOG",
  "auditoria_operacional": {
    "seguranca_pessoal": { "conformidade": 95 },
    "procedimentos_operacionais": { "conformidade": 92 },
    "equipamentos_seguranca": { "conformidade": 98 }
  },
  "pontuacao_geral": 95
}
```

### 3. FORECAST (Risk Forecast)
**File:** `forecast_risco.json`

AI-powered predictive risk analysis.

```json
{
  "tipo": "FORECAST",
  "previsao_risco": {
    "meteorologia": { "nivel_risco": "medio" },
    "manutencao_equipamentos": { "nivel_risco": "baixo" },
    "operacional": { "nivel_risco": "baixo" }
  },
  "nivel_risco_geral": "baixo"
}
```

### 4. AUTO_REPORT (Consolidated Report)
**File:** `nautilus_full_report.json`

Complete system status and consolidated metrics.

```json
{
  "tipo": "AUTO_REPORT",
  "status_geral": "operacional",
  "saude_sistema": 94,
  "modulos_ativos": ["FMEA", "ASOG", "Forecast", "BridgeLink"],
  "metricas_operacionais": {...}
}
```

## Configuration

### config.json

```json
{
  "endpoint": "https://api.sgso.nautilus.one/upload",
  "auth_token": "Bearer YOUR_REAL_TOKEN_HERE"
}
```

### Environment Variables (Alternative)

For production deployments, consider using environment variables:

```bash
export SGSO_ENDPOINT="https://api.sgso.nautilus.one/upload"
export SGSO_AUTH_TOKEN="Bearer YOUR_TOKEN"
```

## Usage Examples

### 1. Interactive CLI

```bash
python main.py
# Select option 6
```

### 2. Programmatic Usage

```python
from modules.bridge_link import BridgeLink

# Initialize and sync
bridge = BridgeLink()
bridge.sincronizar()
```

### 3. Custom Integration

```python
from modules.bridge_link import BridgeLink

# Create instance
bridge = BridgeLink()

# Send specific report
dados_fmea = bridge.carregar_arquivo("relatorio_fmea_atual.json")
if dados_fmea:
    bridge.enviar_relatorio("FMEA", dados_fmea)
```

## Logging

### Log Format

```
[2025-10-20 00:05:44] BridgeLink iniciado.
[2025-10-20 00:05:44] Relatório FMEA enviado com sucesso.
[2025-10-20 00:05:45] Relatório ASOG enviado com sucesso.
[2025-10-20 00:05:45] Relatório FORECAST enviado com sucesso.
[2025-10-20 00:05:46] Relatório AUTO_REPORT enviado com sucesso.
[2025-10-20 00:05:46] Transmissão concluída.
```

### Log Locations

- **File:** `nautilus_system.log` (persistent)
- **Console:** Real-time output with emojis

## Error Handling

The module handles multiple error scenarios:

| Error Type | Handling |
|------------|----------|
| File Not Found | Logs warning, continues with other files |
| Invalid JSON | Logs error, skips file |
| Connection Timeout | Retries with 15s timeout, then fails gracefully |
| HTTP Errors | Logs status code, marks as failed |
| Network Errors | Logs error, continues with other reports |

## Security Features

- ✅ Bearer Token authentication
- ✅ HTTPS-only communication
- ✅ Request timeout (15 seconds)
- ✅ No credentials in code (config file)
- ✅ Comprehensive error logging
- ✅ Safe file handling (encoding specified)

## Integration with Existing System

### TypeScript Application

The Python BridgeLink module complements the existing TypeScript/React application:

1. **Frontend (React/TypeScript):** User interface and data visualization
2. **Supabase Edge Functions:** Database operations and cloud functions
3. **Python BridgeLink:** External API communication and report transmission

### Potential Future Integration

```typescript
// Example: Trigger BridgeLink from TypeScript
async function triggerBridgeLink() {
  const response = await fetch('/api/bridge-link/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
```

## Testing

### Manual Test

```bash
# Run test script
python test_bridge_link.py
```

### Expected Output

```
============================================================
🧪 Testing BridgeLink Module
============================================================

✅ Test 1: Module imported successfully
✅ Test 2: BridgeLink instance created
✅ Test 3: Configuration loaded
   Endpoint: https://api.sgso.nautilus.one/upload
   Files to sync: 4

✅ Test 4: Testing file loading...
   ✓ FMEA: relatorio_fmea_atual.json (loaded)
   ✓ ASOG: asog_report.json (loaded)
   ✓ FORECAST: forecast_risco.json (loaded)
   ✓ AUTO_REPORT: nautilus_full_report.json (loaded)

============================================================
✅ All tests completed!
============================================================
```

## Deployment

### Production Checklist

- [ ] Update `config.json` with real endpoint and token
- [ ] Test connectivity to SGSO server
- [ ] Verify all report files are generated correctly
- [ ] Set up automated schedule (cron job)
- [ ] Configure monitoring and alerts
- [ ] Set up log rotation for `nautilus_system.log`

### Automated Execution (Cron)

```bash
# Run daily at 02:00 AM
0 2 * * * cd /path/to/nautilus-one && echo "6" | python3 main.py >> /var/log/bridgelink.log 2>&1
```

## Monitoring

### Health Checks

```python
# Check if BridgeLink is operational
from modules.bridge_link import BridgeLink

bridge = BridgeLink()
# Check connectivity (add health check endpoint to SGSO)
```

### Metrics to Monitor

- Report transmission success rate
- Average transmission time
- File loading errors
- API response codes
- Network timeouts

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Module not found` | Install dependencies: `pip install -r requirements.txt` |
| `File not found` | Ensure report JSON files exist in root directory |
| `Connection refused` | Check endpoint URL in config.json |
| `401 Unauthorized` | Verify auth_token in config.json |
| `Timeout` | Check network connectivity and increase timeout if needed |

## Support

For issues or questions:
1. Check `nautilus_system.log` for detailed errors
2. Verify `config.json` settings
3. Test network connectivity to SGSO endpoint
4. Review documentation in `BRIDGELINK_README.md`

## License

MIT — © 2025 Nautilus One
