# 🔀 ROUTES LEGACY ALIASES

> Rotas canônicas + redirecionamentos legados
> Gerado: 2026-02-09

## Princípio

Nenhuma rota antiga é removida. Rotas duplicadas são resolvidas com:
1. **Rota canônica** — destino principal
2. **Rota legada** — redirect para canônica (preserva bookmarks, links externos)

---

## Mapeamento

| Rota Legada | Rota Canônica | Tipo | Status |
|-------------|--------------|------|--------|
| `/command` | `/central-comando` | Redirect | 🚧 |
| `/crew-wellbeing` | `/crew-wellness` | Redirect | 🚧 |
| `/esg-emissions` | `/maintenance?tab=esg` | Redirect | 🚧 |
| `/waste-management` | `/maintenance?tab=waste-marpol` | Redirect | 🚧 |
| `/voyage-simulator` | `/ops?tab=voyage` | Redirect | 🚧 |
| `/psc-readiness` | `/compliance-hub?tab=psc` | Redirect | 🚧 |
| `/sonar-ai` | `/subsea-operations` | Redirect | ✅ Existe |
| `/underwater-drone` | `/subsea-operations` | Redirect | ✅ Existe |
| `/incident-reports` | `/nautilus-documents` | Redirect | ✅ Existe |
| `/sustainability-score` (duplicado) | `/sustainability-score` (único) | Dedupe | 🚧 |
| `/tracking` (VesselTrackingPage) | `/tracking` (MegaHub) | Consolidar | 🚧 |
| `/fuel-manager` | `/finance-command` | Redirect | 🚧 |
| `/vessel-tracking` | `/tracking` | Redirect | 🚧 |
| `/executive-kpis` | `/executive-dashboard` | Redirect | 🚧 |
| `/iot-history` | `/telemetria` | Redirect | 🚧 |
| `/compliance` | `/compliance-hub` | Redirect | 🚧 |
| `/reports` | `/reports-command` | Redirect | 🚧 |
| `/crew-management` | `/crew` | Redirect | 🚧 |
| `/fleet` | `/fleet-command` | Redirect | 🚧 |
| `/maintenance` (duplicado) | `/maintenance` (MegaHub) | Consolidar | 🚧 |

---

## Notas

- Redirects implementados via `<Navigate to="..." replace />` no App.tsx
- Todas as rotas do `route-audit.ts` VALID_ROUTES são preservadas
- Command Palette (Ctrl+K) indexa ambas as rotas (legada + canônica)
