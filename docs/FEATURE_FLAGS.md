# 🚩 FEATURE FLAGS

> Flags de funcionalidade para features em implantação
> Gerado: 2026-02-09

## Princípio

Features que ainda não possuem backend real completo devem:
1. Estar protegidas por feature flag
2. Exibir estado visual "Em implantação" (claro e honesto)
3. **NUNCA** simular dados ou gerar toast de sucesso falso

---

## Flags Ativas

| Flag | Default (Prod) | Escopo | Motivo | UI Impact | Como Ativar |
|------|---------------|--------|--------|-----------|-------------|
| `FF_BRIDGELINK_LIVE_WS` | `false` | BridgeLink Live Watch | WebSocket real não implementado; polling como substituto | Badge "Live via polling (beta)" | Env var `VITE_FF_BRIDGELINK_LIVE_WS=true` |
| `FF_STARFIX_REAL_API` | `false` | StarFix Position Service | API real da Fugro não configurada | Estado "Integração não configurada" quando false | Env var `VITE_FF_STARFIX_REAL_API=true` + secret `STARFIX_API_KEY` |
| `FF_TERRASTAR_REAL_API` | `false` | Terrastar Ionosphere | API real da Hexagon não configurada | Estado "Integração não configurada" quando false | Env var `VITE_FF_TERRASTAR_REAL_API=true` + secret `TERRASTAR_API_KEY` |
| `FF_NAUTILUS_BRAIN_AI` | `false` | BridgeLink AI Analysis | Análise semântica via NautilusBrain | Badge "Em implantação" no card AI | Env var `VITE_FF_NAUTILUS_BRAIN_AI=true` |
| `FF_FMEA_SYSTEM` | `false` | BridgeLink FMEA | Sistema FMEA completo | Badge "Planejado" no card FMEA | Env var `VITE_FF_FMEA_SYSTEM=true` |

---

## Flags de Segurança

| Flag | Default (Prod) | Escopo | Motivo |
|------|---------------|--------|--------|
| `VITE_STRICT_PROD` | `true` | Global | Bloqueia mocks, dados fake, e simulações em produção |

---

## Como adicionar nova flag

1. Definir a variável de ambiente no `.env` (dev only)
2. Criar helper em `src/lib/feature-flags.ts`
3. Documentar neste arquivo
4. Implementar UI guard no componente afetado
5. **NUNCA** usar a flag para gerar dados falsos — apenas para habilitar/desabilitar funcionalidade
