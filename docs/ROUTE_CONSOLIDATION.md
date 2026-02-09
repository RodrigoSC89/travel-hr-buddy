# 🗺️ Route Consolidation Report
> 7 Mega-Hubs Canônicos + Aliases

## Mega-Hubs (Rotas Primárias)

| Hub | Rota | Tabs |
|-----|------|------|
| Command | `/command` | Overview |
| Ops | `/ops` | Overview, Maritime, Fleet, Voyage, Missions, Logistics, Contracts |
| Maintenance | `/maintenance` | Overview, Planning, Surveys, Predictive, Drydock, Fuel, Digital Twin, MARPOL, ESG |
| AI | `/ai` | Hub, Agents, Chat & Voice, Swarm Ops, Workflows, 11 Modules, Intelligence, Analytics |
| Tracking | `/tracking` | Overview, Live Map, Satellite, Telemetry, Alerts |
| Compliance | `/compliance` | Overview, ISM, ISPS, MLC, SGSO, MARPOL, PSC, Cert, NC, Security |
| Workbench | `/workbench` | Docs, Doc Control, People, Crew Schedule, Finance, Approvals, Travel, System |

## Aliases (Redirects)

| Legacy Route | Redirects To |
|-------------|-------------|
| `/dashboard` | `/command` |
| `/executive-dashboard` | `/command` |
| `/system-overview` | `/command` |
| `/crew-wellbeing` | `/workbench?section=people` (standalone route also exists) |
| `/maintenance-command` | `/maintenance` (standalone also exists) |
| `/ai-hub` | `/ai` (standalone also exists) |
| `/compliance-unified` | `/compliance` (standalone also exists) |

## Deep-Link Pattern
All hubs use `?tab=<value>` via `useSearchParams()` for tab navigation.
AI Hub additionally supports sub-tab migration for backward compatibility (e.g., `?tab=voice` → `chat-voice` tab with voice sub-tab).
