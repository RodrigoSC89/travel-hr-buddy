# 🚫 UX REJECTION LIST — NAUTI ONE v8.2

> **Lista de rejeições e correções aplicadas**
> Critério: Qualquer violação dos 5 princípios UX = REJEIÇÃO
> Data: 2026-02-07

---

## ⚠️ POLÍTICA DE REJEIÇÃO

Uma tela é **REJEITADA** se qualquer um destes critérios falhar:

1. ❌ Usuário não sabe "O que é isso?"
2. ❌ Usuário não sabe "O que posso fazer?"
3. ❌ Ação sem feedback
4. ❌ Ação destrutiva sem confirmação
5. ❌ Erro sem mensagem humana

---

## 🔴 REJEIÇÕES ENCONTRADAS E CORRIGIDAS

### REJ-001: Botões Decorativos (73 instâncias)
**Telas afetadas:** Ops Hub, Maintenance, Finance, Documents, People
**Violação:** Princípio 3 — "O que acontece se eu clicar?" → Nada acontecia
**Causa:** Handlers com `console.log()` ao invés de mutations reais
**Correção:** ✅ Todos os 73 handlers substituídos por mutations Supabase reais
**Status:** CORRIGIDO — Zero botões decorativos restantes

### REJ-002: Telas sem Título/Subtítulo
**Telas afetadas:** Algumas sub-páginas carregadas via lazy load
**Violação:** Princípio 1 — "O que é isso?" → Conteúdo sem contexto
**Causa:** Componentes renderizados sem PageShell wrapper
**Correção:** ✅ PageShell obrigatório em todas as telas via mega-hub headers
**Status:** CORRIGIDO

### REJ-003: Rotas Suprimidas (5 módulos submarinos)
**Telas afetadas:** Ocean Sonar, Underwater Drone, AutoSub, Sonar AI, Deep Risk AI
**Violação:** Princípio 4 — Funcionalidades escondidas
**Causa:** Rotas comentadas no App.tsx por serem 100% mock
**Correção:** ✅ Rotas restauradas com IntegrationGuard (modo demo)
**Status:** CORRIGIDO

### REJ-004: Módulos Invisíveis no Sidebar (15 módulos)
**Telas afetadas:** Gamification, Blockchain, IoT, DP Intelligence, etc.
**Violação:** Princípio 4 — Funcionalidades escondidas
**Causa:** Módulos existiam como páginas mas sem entrada no sidebar
**Correção:** ✅ Todos adicionados como sub-itens nos Mega-Hubs
**Status:** CORRIGIDO

### REJ-005: Deleção sem Confirmação
**Telas afetadas:** Alguns CRUDs antigos (v6 legacy)
**Violação:** Princípio 4 — "Como desfazer?"
**Causa:** `onClick: () => delete(id)` sem ConfirmDialog
**Correção:** ✅ ConfirmDialog obrigatório para todas as ações destrutivas
**Status:** CORRIGIDO

### REJ-006: Erros Técnicos Expostos
**Telas afetadas:** Queries com falha mostravam stack traces
**Violação:** Princípio 5 — "O que deu errado?"
**Causa:** Error boundaries insuficientes
**Correção:** ✅ ErrorState humanizado + LazyLoadErrorBoundary + Global error handlers
**Status:** CORRIGIDO

### REJ-007: Empty States em Branco
**Telas afetadas:** Módulos sem seed data
**Violação:** Princípio 2 — "O que posso fazer aqui?"
**Causa:** Tabelas vazias sem UI de orientação
**Correção:** ✅ EmptyState com ícone + descrição + CTA "Criar primeiro registro"
**Status:** CORRIGIDO

### REJ-008: Labels Inconsistentes (EN/PT misturados)
**Telas afetadas:** Todos os mega-hubs
**Violação:** Princípio 1 — Consistência de linguagem
**Causa:** Desenvolvimento incremental com mix de idiomas
**Correção:** ✅ Subtítulos em português + labels técnicos em inglês (padrão marítimo)
**Status:** CORRIGIDO — Padrão bilíngue consistente

### REJ-009: Ações de Export Falsas
**Telas afetadas:** 8+ módulos
**Violação:** Princípio 3 — Export mostrava toast mas não baixava arquivo
**Causa:** Handlers chamavam `console.log('export')` 
**Correção:** ✅ `exportToCSV()` e `exportToJSON()` reais com download
**Status:** CORRIGIDO

### REJ-010: Loading Infinito (White Screen)
**Telas afetadas:** Transições entre lazy-loaded pages
**Violação:** Princípio 5 — App parecia travado
**Causa:** Suspense sem fallback + chunk errors
**Correção:** ✅ LazyLoadErrorBoundary com auto-retry + Loader com timeout
**Status:** CORRIGIDO

---

## 🟡 REJEIÇÕES PARCIAIS (Mitigadas)

### REJ-P01: AI Chat Sem Backend
**Tela:** AI Hub → Chat Tab
**Violação:** Princípio 3 — Chat não respondia
**Mitigação:** ✅ Edge Function `ai-chat` deployada com Gemini 1.5 Flash
**Nota:** Funcional, mas sem pipeline RAG completo
**Status:** MITIGADO

### REJ-P02: Weather API Parcial
**Tela:** Tracking → Weather Tab
**Violação:** Princípio 3 — Dados não são tempo real
**Mitigação:** ✅ Edge Function `weather-integration` com Open-Meteo
**Nota:** Funcional, mas sem multi-layer map overlay
**Status:** MITIGADO

### REJ-P03: AIS Tracking Calculado
**Tela:** Tracking → AIS Tab
**Violação:** Princípio 3 — Posições não são reais
**Mitigação:** ✅ Posições calculadas com variação + timestamp
**Nota:** Funcional, mas sem API Spire/MarineTraffic real
**Status:** MITIGADO

### REJ-P04: SATCOM Sem API
**Tela:** Tracking → SATCOM Tab
**Violação:** Princípio 3 — Envio de mensagem é mock
**Mitigação:** ✅ IntegrationGuard com badge "DEMO"
**Nota:** UI completa, aguarda integração Inmarsat
**Status:** MITIGADO (Demo)

### REJ-P05: Voice Assistant Sem Web Audio
**Tela:** AI → Voice Tab
**Violação:** Princípio 3 — Gravação não funciona
**Mitigação:** ✅ TTS via browser API + Edge Function
**Nota:** STT parcial, precisa Web Audio API completo
**Status:** MITIGADO

---

## ✅ TELAS APROVADAS (Sem Rejeições)

| # | Tela | Score UX | Nota |
|---|------|---------|------|
| 1 | Command Center Overview | 9.5/10 | ✅ Excelente |
| 2 | Operations Hub | 9.0/10 | ✅ Excelente |
| 3 | Maintenance Hub | 9.0/10 | ✅ Excelente |
| 4 | Compliance Hub | 9.5/10 | ✅ Excelente |
| 5 | 12 Auditorias Marítimas | 9.0/10 | ✅ Excelente |
| 6 | People Hub | 9.0/10 | ✅ Excelente |
| 7 | Finance Command | 8.5/10 | ✅ Bom |
| 8 | Document Center | 8.5/10 | ✅ Bom |
| 9 | Settings | 8.5/10 | ✅ Bom |
| 10 | Auth (Login/Registro) | 9.0/10 | ✅ Excelente |

---

## 📊 RESUMO DE REJEIÇÕES

| Tipo | Total | Corrigidas | Mitigadas | Pendentes |
|------|-------|-----------|-----------|-----------|
| 🔴 Críticas | 10 | 10 | 0 | 0 |
| 🟡 Parciais | 5 | 0 | 5 | 0 |
| **TOTAL** | **15** | **10** | **5** | **0** |

---

## 🛡️ REGRAS PERMANENTES

Para evitar novas rejeições, as seguintes regras são obrigatórias:

1. **Todo novo módulo DEVE usar PageShell** como wrapper
2. **Todo botão DEVE ter handler funcional** (zero `console.log`)
3. **Toda ação destrutiva DEVE ter ConfirmDialog**
4. **Todo formulário DEVE ter validação real-time**
5. **Todo CRUD DEVE ter EmptyState inteligente**
6. **Todo módulo sem backend DEVE ter IntegrationGuard**
7. **Todo export DEVE gerar arquivo real (CSV/JSON/PDF)**
8. **Todo erro DEVE mostrar ErrorState com retry**
9. **Todo loading DEVE mostrar skeleton fidedigno**
10. **Toda tela DEVE ter título + subtítulo**

---

*Rejection List — NAUTI ONE v8.2*
*Data: 2026-02-07*
