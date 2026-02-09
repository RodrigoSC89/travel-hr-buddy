# 🚩 NAUTI ONE — Feature Flags Registry

> Todas as flags do sistema, escopo, impacto na UI, motivo e como ativar.
> Última atualização: 2026-02-09

---

## Production Safety

| Flag | Default | Env Var | Descrição |
|---|---|---|---|
| `STRICT_PROD` | `true` | `VITE_STRICT_PROD` | Bloqueia mocks e dados fake em produção |

## Integration Flags

| Flag | Default | Env Var | Descrição | Como Ativar |
|---|---|---|---|---|
| `FF_BRIDGELINK_LIVE_WS` | `false` | `VITE_FF_BRIDGELINK_LIVE_WS` | WebSocket real para BridgeLink | Config WS server + `=true` |
| `FF_STARFIX_REAL_API` | `false` | `VITE_FF_STARFIX_REAL_API` | API real StarFix | Secret `STARFIX_API_KEY` + `=true` |
| `FF_TERRASTAR_REAL_API` | `false` | `VITE_FF_TERRASTAR_REAL_API` | API real Terrastar | Secret `TERRASTAR_API_KEY` + `=true` |
| `FF_NAUTILUS_BRAIN_AI` | `false` | `VITE_FF_NAUTILUS_BRAIN_AI` | IA semântica BridgeLink | Deploy EF + `=true` |
| `FF_FMEA_SYSTEM` | `false` | `VITE_FF_FMEA_SYSTEM` | FMEA completo BridgeLink | Deploy módulo + `=true` |

## Module Flags (Env Var)

| Flag | Default | Env Var | UI Impact |
|---|---|---|---|
| `FF_IOT_ANALYTICS` | `false` | `VITE_FF_IOT_ANALYTICS` | Tab Analytics IoT → "Em implantação" |
| `FF_STCW_AI_TRAINING` | `false` | `VITE_FF_STCW_AI_TRAINING` | Tabs Crew/Training STCW → "Em implantação" |
| `FF_AUDIT_CALENDAR` | `false` | `VITE_FF_AUDIT_CALENDAR` | Tab Calendar Auditorias → "Em implantação" |
| `FF_DASHBOARD_ANALYTICS` | `false` | `VITE_FF_DASHBOARD_ANALYTICS` | Tab Analytics Dashboard → "Em implantação" |
| `FF_AI_CHECKLIST_GEN` | `false` | `VITE_FF_AI_CHECKLIST_GEN` | Geração IA checklists usa fallback local |

## Module Flags (localStorage)

Controladas via `nauti_feature_flags` em localStorage:

| Flag | Default | Descrição |
|---|---|---|
| `UNDERWATER_ENABLED` | `false` | Módulos sonar/drone submarino |
| `VRAR_ENABLED` | `true` | VR Training |
| `AI_AUTONOMY_ENABLED` | `true` | Autonomia IA |
| `BETA_MODULES_ENABLED` | `true` | Módulos beta |
| `BLOCKCHAIN_AUDIT_ENABLED` | `true` | Blockchain audit |
| `OCR_MULTIENGINE_ENABLED` | `true` | OCR multi-engine |
| `DIGITAL_TWIN_3D_ENABLED` | `true` | Digital Twin 3D |
| `PREDICTIVE_TELEMETRY_ENABLED` | `true` | Telemetria preditiva |

## Mock Control

| Env Var | Default (prod) | Descrição |
|---|---|---|
| `VITE_USE_MOCK_STARFIX` | `false` | Requer `=true` explícito + STRICT_PROD off |
| `VITE_USE_MOCK_TERRASTAR` | `false` | Requer `=true` explícito + STRICT_PROD off |
