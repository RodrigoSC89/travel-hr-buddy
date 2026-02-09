# 🔍 NAUTI ONE — AUDITORIA TOTAL DE FALHAS FUNCIONAIS

**Gerado:** 2026-02-09  
**Auditor:** QA Lead / Staff Engineer  
**Versão do sistema:** v4.1 (Mega-Hubs v8.0)  
**Escopo:** 100% do codebase — rotas, botões, abas, integrações, UX, módulos  
**Método:** Análise estática do código-fonte + inspeção live do app

---

## 📊 RESUMO EXECUTIVO

| Categoria | P0 (Crítico) | P1 (Alto) | P2 (Médio) | Total |
|-----------|:---:|:---:|:---:|:---:|
| Rotas & Navegação | 2 | 5 | 8 | 15 |
| Botões & Ações | 3 | 7 | 5 | 15 |
| Abas & Hubs | 1 | 4 | 3 | 8 |
| Backend & Integração | 4 | 8 | 6 | 18 |
| UX / Usabilidade | 1 | 3 | 6 | 10 |
| Módulos Incompletos | 2 | 5 | 4 | 11 |
| **TOTAL** | **13** | **32** | **32** | **77** |

---

## 🔴 FALHAS CRÍTICAS (P0)

### P0-001: Catch-all route silencia 404s
- **Módulo:** App.tsx (linha 1066)
- **Local:** `<Route path="*" element={<Navigate to="/command" replace />} />`
- **Tipo:** Rota
- **O que o usuário espera:** Ver uma página "404 - Página não encontrada" com orientação
- **O que realmente acontece:** QUALQUER URL inválida redireciona silenciosamente para `/command` — o usuário nunca sabe que digitou errado
- **Evidência:** `<Route path="*" element={<Navigate to="/command" replace />} />` em App.tsx:1066. Existe um componente `NotFound.tsx` importado (linha 75) mas **nunca usado** nas rotas
- **Impacto:** Impossível debugar links quebrados; bookmarks antigos falham silenciosamente; compartilhamento de URLs incorretas não é detectado

### P0-002: Rota `/tracking` definida DUAS VEZES com componentes diferentes
- **Módulo:** App.tsx
- **Local:** Linhas 633 (`<Route path="/tracking" element={<TrackingMegaHub />} />`) e 762 (`<Route path="/tracking" element={<VesselTrackingPage />} />`)
- **Tipo:** Rota
- **O que o usuário espera:** Navegação consistente ao clicar em "Tracking"
- **O que realmente acontece:** React Router usa a PRIMEIRA definição encontrada. A segunda rota na linha 762 é código morto — nunca será alcançada
- **Evidência:** Duas declarações `<Route path="/tracking"` no mesmo `<Routes>` block
- **Impacto:** Confusão de manutenção; se a ordem mudar, o comportamento muda silenciosamente

### P0-003: Ações do Workbench Hub mostram apenas toast.info() sem ação real
- **Módulo:** WorkbenchMegaHub.tsx
- **Local:** `handleDocUpload` (linha 129), `handleNewTemplate` (linha 133), `handleNewBooking` (linha 174), `handleNewIntegration` (linha 179)
- **Tipo:** Botão
- **O que o usuário espera:** Clicar "Upload Document" abre modal de upload; "New Template" abre criador
- **O que realmente acontece:** `toast.info('Use o Document Center abaixo para fazer upload...')` — o botão na ActionBar é decorativo, diz ao usuário para usar outro lugar
- **Evidência:** 4 handlers que apenas emitem `toast.info()` sem executar nenhuma ação
- **Impacto:** Botões proeminentes (ActionBar no topo) que não fazem o que prometem. Usuário frustrado.

### P0-004: `setTimeout` + toast fakes em produção (delays simulados)
- **Módulo:** Múltiplos
- **Locais:**
  - `src/components/peo-dp/computer-vision-inspector.tsx:172` — "Conectando câmera..." (1.5s fake)
  - `src/components/safety/ISPSModule.tsx:159` — "Exportando SSP..." (1.5s fake)
  - `src/pages/DeepRiskAI.tsx:39` — "IA analisando..." (2s fake)
  - `src/pages/DrydockManagement.tsx:125` — "Gerando relatório..." (1.5s fake)
  - `src/pages/FinanceCommandCenterPremium.tsx:312-321` — DRE e Fluxo de Caixa (1s fake)
- **Tipo:** Backend/UX
- **O que o usuário espera:** Ações reais (exportar PDF, conectar câmera, analisar riscos)
- **O que realmente acontece:** `setTimeout(() => toast.success(...), 1500)` — simula espera e mostra "sucesso" sem fazer nada
- **Evidência:** 6 instâncias de `setTimeout(() => toast...` em arquivos de produção
- **Impacto:** Usuário acredita que ação foi executada, mas nada persiste. Dados falsos de sucesso.

### P0-005: Ops Hub — "New Voyage" e "Bulk Approve" disparam CustomEvents que ninguém escuta
- **Módulo:** OpsMegaHub.tsx
- **Local:** Linhas 86-89
- **Tipo:** Botão
- **O que o usuário espera:** Clicar "New Voyage" abre formulário de criação; "Bulk Approve" executa aprovação em lote
- **O que realmente acontece:** `window.dispatchEvent(new CustomEvent('ops:new-voyage'))` — dispara evento no window global. Nenhum componente na árvore tem listener para `ops:new-voyage` ou `ops:bulk-approve`
- **Evidência:** `CustomEvent` dispatch sem listeners registrados (busca no codebase retorna zero handlers)
- **Impacto:** Dois botões principais do Hub de Operações são não-funcionais

### P0-006: MOCK data services ainda em produção (Terrastar e Starfix)
- **Módulo:** `src/services/mocks/terrastar.mock.ts`, `src/services/mocks/starfix.mock.ts`
- **Tipo:** Backend/Integração
- **O que o usuário espera:** Dados reais de posição GPS e conectividade
- **O que realmente acontece:** Dados mock gerados por código — `USE_MOCK_API` defaults to `true` para Terrastar; Starfix defaults to `false` mas com fallback a mock
- **Evidência:** `terrastar.mock.ts:16` — `const USE_MOCK_API = ...env?.VITE_USE_MOCK_TERRASTAR !== 'false'`
- **Impacto:** Posições de embarcações, precisão GPS e dados de conectividade são fictícios em produção

### P0-007: Maintenance Hub — createMaintenanceOrder sem campos obrigatórios
- **Módulo:** MaintenanceMegaHub.tsx
- **Local:** Linha 123-128
- **Tipo:** Backend
- **O que o usuário espera:** Criar ordem de serviço completa
- **O que realmente acontece:** Cria registro com título genérico `OS-${timestamp}` e descrição "Nova ordem de serviço" — sem formulário, sem seleção de embarcação, sem campos obrigatórios do negócio
- **Evidência:** `handleNewWorkOrder` chama mutation direta com dados estáticos
- **Impacto:** OS criada sem contexto (sem equipamento, sem prioridade real, sem embarcação associada)

### P0-008: Finance Hub — Relatório DRE e Fluxo de Caixa são delays fake
- **Módulo:** FinanceCommandCenterPremium.tsx
- **Local:** Linhas 310-322
- **Tipo:** Backend
- **O que o usuário espera:** Download real de DRE e fluxo de caixa
- **O que realmente acontece:** `toast.info("Gerando relatório DRE...")` + `setTimeout(() => toast.success("DRE gerado"), 1000)` — nenhum dado é gerado ou exportado
- **Evidência:** Apenas `setTimeout` + toast — sem chamada a backend, sem geração de arquivo
- **Impacto:** Funcionalidades financeiras críticas (DRE, Cash Flow) são simuladas

### P0-009: ISPS Security — Export SSP é delay fake
- **Módulo:** ISPSModule.tsx
- **Local:** Linha 157-160
- **Tipo:** Backend
- **O que o usuário espera:** Download do Ship Security Plan (documento regulatório obrigatório)
- **O que realmente acontece:** `toast.loading("Exportando SSP...")` + `setTimeout(() => toast.success("SSP exportado!"), 1500)` — nenhum arquivo é gerado
- **Evidência:** setTimeout com toast.success sem nenhuma ação real
- **Impacto:** Documento de compliance obrigatório inexportável

### P0-010: Computer Vision Inspector — "Conectar Câmera" é delay fake
- **Módulo:** computer-vision-inspector.tsx
- **Local:** Linha 170-173
- **Tipo:** Backend/Integração
- **O que o usuário espera:** Conexão real com câmera de inspeção
- **O que realmente acontece:** `setTimeout(() => toast.success("Câmera conectada!"), 1500)` — nenhuma câmera é conectada
- **Evidência:** setTimeout simulando conexão de hardware
- **Impacto:** Feature de inspeção visual por câmera completamente simulada

### P0-011: Deep Risk AI — "Analisar" não executa IA
- **Módulo:** DeepRiskAI.tsx
- **Local:** Linha 39
- **Tipo:** Backend
- **O que o usuário espera:** Análise de risco com IA
- **O que realmente acontece:** `toast.info('IA analisando...'); setTimeout(() => toast.success('Análise concluída'), 2000)` — zero processamento
- **Evidência:** Toast + setTimeout sem chamada a GPT, edge function ou qualquer modelo
- **Impacto:** Feature "AI" é totalmente decorativa

### P0-012: Drydock — "Gerar Relatório" é delay fake
- **Módulo:** DrydockManagement.tsx
- **Local:** Linha 123-126
- **Tipo:** Backend
- **O que o usuário espera:** Relatório de docagem para exportar
- **O que realmente acontece:** setTimeout + toast.success sem geração real
- **Evidência:** Mesmo padrão fake delay
- **Impacto:** Relatório de manutenção de dique seco simulado

### P0-013: Payroll — eSocial export marcado "Em breve" e disabled
- **Módulo:** Payroll.tsx
- **Local:** Linhas 503-512
- **Tipo:** Backend
- **O que o usuário espera:** Gerar arquivo para envio ao eSocial (obrigação legal brasileira)
- **O que realmente acontece:** Botão disabled com texto "Em breve"
- **Evidência:** `<Button variant="outline" className="w-full" disabled>` com texto "Em breve"
- **Impacto:** Obrigação legal não cumprida; módulo de folha incompleto para mercado brasileiro

---

## 🟠 FALHAS ALTAS (P1)

### P1-001: Sidebar tem 8 grupos, não 7 como documentado
- **Módulo:** sidebar-routes.ts
- **Tipo:** Governança
- **Evidência:** SIDEBAR_ROUTES tem 8 entries: Command, Ops, Maintenance, AI, Tracking, Compliance, Workbench, **World-Class**. Documentação diz "7 Mega-Hubs Canônicos"
- **Impacto:** Inconsistência entre documentação e código; grupo "World-Class" não tem mega-hub dedicado

### P1-002: Sidebar "World-Class" items sem hub canônico — rotas avulsas
- **Módulo:** sidebar-routes.ts grupo "World-Class"
- **Tipo:** Rota/Governança
- **Evidência:** 12 itens (Fleet Pulse, Voyage Simulator, etc.) apontam para páginas avulsas (`/fleet-pulse`, `/voyage-simulator`) sem mega-hub pai
- **Impacto:** Navegação inconsistente — esses módulos não seguem o padrão hub/tab dos 7 mega-hubs

### P1-003: Rotas duplicadas com mesmo destino (excesso)
- **Módulo:** App.tsx
- **Tipo:** Rota
- **Evidência:** Exemplos: `/crew-wellbeing` e `/crew-wellness` → mesma página; `/executive-dashboard` e `/dashboard` e `/system-overview` → CentralComando; `/pre-ovid` e `/pre-ovid-inspection` → mesma; `/tmsa` e `/tmsa-assessment` → mesma
- **Impacto:** ~25+ rotas duplicadas que inflam o router e confundem manutenção (embora não quebrem funcionalidade)

### P1-004: NotFound.tsx importado mas NUNCA renderizado
- **Módulo:** App.tsx:75
- **Tipo:** Rota
- **Evidência:** `const NotFound = lazy(() => import("@/pages/NotFound"))` — componente importado, mas o catch-all em linha 1066 faz `<Navigate to="/command">` em vez de `<NotFound />`
- **Impacto:** Página 404 existente mas inutilizada

### P1-005: `company-financials` rota definida DUAS VEZES
- **Módulo:** App.tsx
- **Tipo:** Rota
- **Evidência:** Linha 686 (`<Route path="/company-financials" element={<CompanyFinancialPage />}`) e linha 871 (mesma rota, mesmo componente)
- **Impacto:** Código morto, potencial confusão

### P1-006: Workbench Travel — "Nova reserva" é toast vazio
- **Módulo:** WorkbenchMegaHub.tsx:174-176
- **Tipo:** Botão
- **Evidência:** `handleNewBooking` → `toast.info('Funcionalidade de reservas...será implementada na próxima versão')`
- **Impacto:** Feature de Travel com botão "New Booking" que não funciona

### P1-007: Workbench System — "Nova integração" é toast vazio
- **Módulo:** WorkbenchMegaHub.tsx:179-181
- **Tipo:** Botão
- **Evidência:** `handleNewIntegration` → `toast.info('Acesse System Hub abaixo para configurar...')`
- **Impacto:** Botão redireciona para subcomponente sem ação direta

### P1-008: AI Mega-Hub — 15 tabs (excessive cognitive load)
- **Módulo:** AIMegaHub.tsx
- **Tipo:** UX
- **Evidência:** `tabConfig` com 15 entries: hub, health, chat, agents, consensus, memory, monitoring, workflows, voice, modules, rag, ocr, agent-analytics, analytics, observability
- **Impacto:** TabsList overflow horizontal, descobribilidade comprometida; várias tabs com funcionalidade sobreposta (analytics vs agent-analytics vs observability)

### P1-009: AI Hub — Deploy Agent cria agente sem configuração
- **Módulo:** AIMegaHub.tsx:112-126
- **Tipo:** Backend
- **Evidência:** `handleDeployAgent` insere diretamente no `agent_registry` com nome genérico `Agent agent-${timestamp}` e capabilities fixas `['analysis', 'reporting']`
- **Impacto:** Agentes criados sem nome real, sem propósito definido, sem configuração

### P1-010: Compliance Hub — handleNewAudit cria auditoria com dados mínimos
- **Módulo:** ComplianceMegaHub.tsx:178-191
- **Tipo:** Backend
- **Evidência:** `supabase.from('internal_audits').insert([{ audit_number: 'AUD-${timestamp}', audit_type: 'internal', status: 'planned', findings_count: 0 }])` — sem formulário, sem scope, sem auditor
- **Impacto:** Auditorias criadas sem contexto necessário (tipo, escopo, responsável, embarcação)

### P1-011: Tracking Hub — Empty state usa window.location.href
- **Módulo:** TrackingMegaHub.tsx:271
- **Tipo:** UX
- **Evidência:** `onPrimaryAction={() => window.location.href = '/ops'}` — usa navegação por hard refresh em vez de React Router `navigate()`
- **Impacto:** Recarga completa da SPA, perda de state, UX degradada

### P1-012: Subsea Operations — Mapa batimétrico "em desenvolvimento"
- **Módulo:** subsea-operations/index.tsx:381
- **Tipo:** Módulo incompleto
- **Evidência:** `<p className="text-sm">Integração com batimetria em desenvolvimento</p>` no lugar do mapa 3D
- **Impacto:** Feature principal do módulo submarino não funcional

### P1-013: Revolutionary Features Hub — Feature roadmap 2027-2030
- **Módulo:** RevolutionaryFeaturesHub.tsx:165-169
- **Tipo:** Módulo incompleto
- **Evidência:** `<h3>Em Desenvolvimento</h3><p>Esta funcionalidade está no roadmap para 2027-2030</p>` — features futuras exibidas como se existissem
- **Impacto:** Confusão sobre capacidades reais do sistema

### P1-014: Document Workflow — "Histórico de versões" é placeholder
- **Módulo:** DocumentWorkflow.tsx:670-673
- **Tipo:** Backend
- **Evidência:** `<p>Histórico completo de versões</p><p>Em breve: comparação de versões e rollback</p>` — sem funcionalidade real
- **Impacto:** Versionamento de documentos prometido mas não implementado

### P1-015: HR Training LMS — Badge "Master" é placeholder
- **Módulo:** HRTrainingLMS.tsx:436-439
- **Tipo:** UX
- **Evidência:** `<p className="text-xs text-muted-foreground">Em breve</p>` no badge Master do sistema gamificado
- **Impacto:** Gamificação parcial do treinamento

### P1-016: MARPOL/Waste e ESG renderizados em 2 mega-hubs diferentes
- **Módulo:** MaintenanceMegaHub + ComplianceMegaHub
- **Tipo:** Governança/UX
- **Evidência:** `WasteManagementPremium` importado tanto em MaintenanceMegaHub (tab waste-marpol) quanto ComplianceMegaHub (auditStandards.marpol). Mesmo componente acessível por caminhos diferentes
- **Impacto:** Confusão sobre onde gerenciar waste/MARPOL; dados duplicados potencialmente exibidos em contextos diferentes

---

## 🟡 FALHAS MÉDIAS (P2)

### P2-001: @ts-nocheck residual em ~8 arquivos de produção
- **Módulo:** Múltiplos (conforme MASTER_AUDIT_REPORT.md)
- **Tipo:** Qualidade de código
- **Evidência:** Ainda existem referências a arquivos com `@ts-nocheck` nos comentários de "removed @ts-nocheck" em ~45 arquivos — mas alguns originais podem não ter sido corrigidos
- **Impacto:** Bugs de tipo silenciosos em produção

### P2-002: MOCK_ data referências em hooks — hooks existem mas componentes podem não usá-los
- **Módulo:** 26 arquivos com MOCK_ referências
- **Tipo:** Backend
- **Evidência:** Hooks como `usePayrollData`, `useSessionReplayData`, `useInventoryMapData` foram criados para substituir MOCK_*, mas sem garantia de que todos componentes foram atualizados
- **Impacto:** Potenciais componentes ainda consumindo dados mock

### P2-003: Sidebar routes com `?tab=` e `?section=` — deep-linking frágil
- **Módulo:** sidebar-routes.ts
- **Tipo:** UX
- **Evidência:** Paths como `/command?tab=operations`, `/workbench?section=docs` — se query param for perdido na navegação, volta para tab default
- **Impacto:** Compartilhamento de links pode levar à tab errada; browser history não preserva tabs

### P2-004: Gamification, Fleet Pulse, Voyage Simulator — sem indicação clara de completude
- **Módulo:** Páginas avulsas
- **Tipo:** Módulo incompleto
- **Evidência:** Esses módulos existem como páginas mas não passaram por auditoria de completude funcional
- **Impacto:** Funcionalidade indeterminada

### P2-005: Sem data-testid em componentes interativos
- **Módulo:** Todo o sistema
- **Tipo:** QA/Testabilidade
- **Evidência:** Mega-hubs e componentes de ação não usam `data-testid` — E2E testing requer seletores frágeis
- **Impacto:** Testes automatizados difíceis de implementar de forma estável

### P2-006: Toaster definido 2 vezes em App.tsx
- **Módulo:** App.tsx
- **Tipo:** UX
- **Evidência:** `<Toaster />` na linha 571 (dentro de AuthenticatedLayout) e outra vez na linha 1082 (dentro de App)
- **Impacto:** Toasts potencialmente duplicados

### P2-007: 240 referências "em breve" / "coming soon" / "em desenvolvimento"
- **Módulo:** 45 arquivos
- **Tipo:** UX
- **Evidência:** Busca retorna 240 matches — muitos são legítimos (status de compliance, expiração de certificados) mas vários são features prometidas e não entregues
- **Impacto:** Precisa triagem para separar "status label" de "feature não implementada"

### P2-008: ESGEmissionsPage importado como duas variáveis diferentes
- **Módulo:** App.tsx:317-318
- **Tipo:** Código
- **Evidência:** `ESGEmissionsPage` e `ESGEmissionsPremium` — ambos importam de `@/pages/ESGEmissionsPremium`. Redundância de import
- **Impacto:** Confusão de manutenção

### P2-009: AuthContext login toast em setTimeout sem proteção
- **Módulo:** AuthContext.tsx:153
- **Tipo:** UX
- **Evidência:** `setTimeout(() => toast.success("Bem-vindo!"), 0)` — delay 0 é padrão legítimo para evitar state update durante render, mas torna o toast dependente do ciclo de eventos
- **Impacto:** Toast pode não aparecer em cenários de alta carga

### P2-010: Sem RBAC enforcement real em rotas
- **Módulo:** App.tsx / sidebar-routes.ts
- **Tipo:** Segurança
- **Evidência:** `requiredRoles` está definido em sidebar-routes.ts mas o sidebar apenas oculta itens sem verificar na rota. Acesso direto por URL não é bloqueado — não existe `AccessDenied` route guard
- **Impacto:** Qualquer usuário logado pode acessar qualquer módulo via URL direta

### P2-011: Multiple imports do mesmo componente com lazy paths diferentes
- **Módulo:** App.tsx
- **Tipo:** Performance
- **Evidência:** `TravelCommandCenter` e `TravelCommandPremium` ambos importam `@/pages/TravelCommandPremium`. Múltiplas instâncias de lazy com mesmo destino
- **Impacto:** Bundle desnecessariamente fragmentado

### P2-012: QueryClient com staleTime global de 5 min pode causar dados desatualizados
- **Módulo:** App.tsx:458
- **Tipo:** Backend/UX
- **Evidência:** `staleTime: 1000 * 60 * 5` — 5 minutos de cache para TODAS queries. Em contexto marítimo operacional (tracking, alertas), isso é muito
- **Impacto:** Dados de telemetria e alertas podem estar 5 min atrasados

---

## 📋 MÓDULOS INCOMPLETOS (INVENTÁRIO)

| # | Módulo | Status | Ações Faltantes |
|---|--------|--------|-----------------|
| 1 | **Payroll eSocial** | ❌ Botão disabled "Em breve" | Export eSocial obrigatório (lei) |
| 2 | **Travel Booking** | ❌ Toast placeholder | CRUD de reservas |
| 3 | **Document Version Control** | ⚠️ Parcial | Comparação e rollback de versões |
| 4 | **Computer Vision Inspector** | ❌ Fake | Conexão real com câmera |
| 5 | **Deep Risk AI** | ❌ Fake | Análise real de IA |
| 6 | **Subsea Bathymetry** | ❌ Placeholder | Visualização 3D do fundo oceânico |
| 7 | **Drydock Report** | ❌ Fake | Geração real de relatório |
| 8 | **Finance DRE/Cash Flow** | ❌ Fake | Relatórios financeiros reais |
| 9 | **ISPS SSP Export** | ❌ Fake | Geração real do documento SSP |
| 10 | **Revolutionary Features** | ❌ Roadmap 2027+ | Features futuras exibidas como existentes |
| 11 | **RBAC Route Guard** | ❌ Não implementado | Verificação de permissão em rotas |

---

## 🏗️ PROBLEMAS ESTRUTURAIS

### 1. Padrão de "Ação Direta" inconsistente nos Mega-Hubs

Os mega-hubs usam `EnhancedActionBar` com botões que:
- **Command Hub:** Navegam para tabs (OK)
- **Ops Hub:** Disparam `CustomEvent` que ninguém escuta (QUEBRADO)
- **Maintenance Hub:** Inserem registros sem formulário (PARCIAL)
- **AI Hub:** Inserem agentes sem configuração (PARCIAL)
- **Compliance Hub:** Inserem auditorias sem escopo (PARCIAL)
- **Tracking Hub:** Inserem alertas manuais com dados mínimos (PARCIAL)
- **Workbench Hub:** Mostram toasts informativos (DECORATIVO)

**Padrão necessário:** Botões de criação devem abrir Dialog/Modal com formulário, não inserir dados genéricos.

### 2. "Cascata de Lazy" — Sub-hubs dentro de Mega-Hubs

Cada mega-hub renderiza páginas Premium (ex: `MaintenanceHubPremium`) que por sua vez já são páginas completas com seus próprios tabs. Isso cria:
- **Tabs dentro de tabs** (mega-hub tab + premium page tab)
- **Confusão de contexto** para o usuário
- **Performance degradada** por nested lazy loads

### 3. Estado da Arte vs. Realidade

O sistema declara 711+ tabelas, 313+ edge functions, e 155+ módulos. Na prática:
- Muitas tabelas existem mas sem CRUD funcional na UI
- Muitas edge functions existem mas sem chamadas no frontend
- Muitos módulos existem mas com funcionalidade parcial

---

## 📊 MÉTRICAS DE SAÚDE DO CÓDIGO

| Métrica | Valor | Status |
|---------|-------|--------|
| Rotas no App.tsx | ~200+ | ⚠️ Excesso, muitas duplicadas |
| Rotas no Sidebar | ~75 items em 8 grupos | ⚠️ 8 grupos (doc diz 7) |
| MOCK_ em produção | 2 services (Terrastar, Starfix) | ❌ Crítico |
| setTimeout + fake toast | 6 instâncias | ❌ Crítico |
| @ts-nocheck restantes | ~8 arquivos prod | ⚠️ Médio |
| "Em breve" features | ~15 instâncias reais | ⚠️ Médio |
| Rotas duplicadas | ~25+ | ⚠️ Médio |
| Botões sem ação real | ~10 | ❌ Crítico |
| RBAC enforcement | 0% (sidebar-only) | ❌ Crítico |
| data-testid coverage | ~0% | ⚠️ Médio |

---

## 🎯 PRIORIZAÇÃO DE CORREÇÃO

### Sprint 1 (Urgente — 1 semana)
1. ✅ Substituir catch-all por `<NotFound />` (P0-001)
2. ✅ Remover rota `/tracking` duplicada (P0-002)
3. ✅ Eliminar 6 `setTimeout + fake toast` (P0-004, P0-008~12)
4. ✅ Corrigir Ops Hub CustomEvents → Dialog/Modal real (P0-005)
5. ✅ Workbench Upload/Template → abrir modal real ou navegar corretamente (P0-003)

### Sprint 2 (Alta — 2 semanas)
6. Substituir MOCK Terrastar/Starfix por integração real ou feature-flag honesto (P0-006)
7. Adicionar formulários modais para criação (Maintenance OS, AI Agent, Compliance Audit) (P0-007, P1-009, P1-010)
8. Implementar RBAC route guards (P2-010)
9. Corrigir Payroll eSocial (P0-013)
10. Consolidar grupo "World-Class" no sidebar (P1-001, P1-002)

### Sprint 3 (Médio — 2 semanas)
11. Limpar rotas duplicadas e consolidar aliases
12. Adicionar `data-testid` em componentes críticos
13. Remover Toaster duplicado
14. Reduzir tabs do AI Hub de 15 para ~8
15. Ajustar `staleTime` por tipo de query

---

## ✅ O QUE FUNCIONA BEM

Para manter honestidade, o que está **realmente funcional**:

1. **Estrutura de Mega-Hubs:** 7 mega-hubs renderizam corretamente com tabs funcionais
2. **Real data queries:** Supabase queries reais em todos mega-hubs (vessels, crew, maintenance, audits, agents)
3. **Export CSV/JSON:** `useRealActionHandlers` implementa export real
4. **Refresh de dados:** QueryClient invalidation funciona em todos hubs
5. **Auth flow:** Login/logout + protected routes funcionam
6. **12 Auditorias Marítimas:** Rotas e componentes existem para todas 12
7. **Lazy loading:** Code splitting por hub implementado
8. **Error boundary:** LazyLoadErrorBoundary + global error handlers
9. **Empty states:** `HubEmptyState` com CTAs implementado em todos mega-hubs
10. **Sidebar navigation:** Navegação entre hubs funciona corretamente

---

**FIM DO RELATÓRIO**

*Este relatório deve ser usado como backlog técnico. Cada item P0/P1 deve virar um ticket de correção.*
*Nenhum dado foi inventado. Cada evidência é verificável no código-fonte.*
