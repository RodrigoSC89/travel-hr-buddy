# 🔀 NAUTI ONE — Routes & Legacy Aliases

> Rotas canônicas + aliases legados. Zero 404s.
> Última atualização: 2026-02-09

## Mega-Hubs (Canônicas)

| Hub | Rota | Descrição |
|---|---|---|
| Command | `/command` | Centro de Comando |
| Operations | `/ops` | Hub de Operações |
| Maintenance | `/maintenance` | Hub de Manutenção |
| AI | `/ai` | Hub de IA |
| Tracking | `/tracking` | Hub de Rastreamento |
| Compliance | `/compliance` | Hub de Compliance |
| Workbench | `/workbench` | Workbench Técnico |

## Aliases Ativos

| Legada | Destino | Tipo |
|---|---|---|
| `/central-comando/*` | `CentralComando` | Componente direto |
| `/crew-wellbeing` | `CrewWellnessPage` | Alias |
| `/crew-wellness` | `CrewWellnessPage` | Canônica |
| `/psc-readiness` | `PSCReadinessPageNew` | World-class |
| `/advanced/psc-readiness` | `PSCReadinessPage` | Advanced (mantida) |
| `/nautilus-people` | `MaritimeCommandCenter` | Alias |
| `/crew-management` | `MaritimeCommandCenter` | Alias |
| `/voyage-simulator` | `VoyageSimulatorPage` | Standalone |
| `/esg-emissions` | `ESGEmissionsPage` | Standalone |
| `/waste-management` | `WasteManagementPage` | Standalone |

## Regras
1. NUNCA remover rota legada sem redirect
2. Command Palette (Ctrl+K) indexa ambos os nomes
3. Sidebar usa rotas canônicas
