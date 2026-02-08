# 🔍 NAUTI ONE — AUDITORIA TOTAL DE FALHAS FUNCIONAIS
> **Versão:** v10 | **Data:** 2026-02-08
> **Auditor:** QA Automatizado + Análise Estática de Código
> **Método:** grep estático em 100% do código-fonte (`src/`)
> **Escopo:** Rotas, Botões, Backend, UX, Módulos Incompletos

---

## 📊 RESUMO EXECUTIVO

| Categoria | Total Issues | P0 (Crítico) | P1 (Alto) | P2 (Médio) |
|-----------|-------------|--------------|-----------|------------|
| **Mock Data / Dados Simulados** | 119 arquivos | 33 | 54 | 32 |
| **Botões "Em Desenvolvimento"** | 6 instâncias | 3 | 3 | 0 |
| **Módulos Placeholder** | 3 páginas | 3 | 0 | 0 |
| **Math.random() em Produção** | 33 páginas | 15 | 18 | 0 |
| **alert() em vez de toast()** | 2 arquivos | 0 | 2 | 0 |
| **Rotas Quebradas** | 0 | 0 | 0 | 0 |
| **onClick Vazio** | 0 | 0 | 0 | 0 |

**Conclusão:** A camada de **navegação e rotas está íntegra** (0 erros 404, 0 onClick vazio). O problema central está na **camada de dados**: 119 arquivos contêm mock data, dados simulados via `Math.random()`, ou stubs "em desenvolvimento" que se apresentam como funcionalidade real.

---

## 🔴 FALHAS CRÍTICAS (P0) — Impedem uso real

---

### P0-001: Módulo Telemetria360 — Placeholder Completo

| Campo | Valor |
|-------|-------|
| **Módulo** | Telemetria 360 |
| **Rota** | Não tem rota registrada no App.tsx (orfão) |
| **Arquivo** | `src/pages/Telemetria360.tsx` |
| **Tipo** | Módulo Placeholder |
| **O que o usuário espera** | Dashboard completo de telemetria com sensores, gráficos, alertas |
| **O que realmente acontece** | Página com Card único dizendo "Módulo de telemetria em desenvolvimento" |
| **Evidência** | Arquivo tem 28 linhas, sem queries, sem dados, sem interação |
| **Impacto** | Funcionalidade prometida inexistente |

---

### P0-002: VesselHistoryV2 — Busca OCR Stub

| Campo | Valor |
|-------|-------|
| **Módulo** | Vessel History V2 |
| **Rota** | `/vessel-history` |
| **Arquivo** | `src/pages/VesselHistoryV2.tsx:298-301` |
| **Tipo** | Feature não implementada |
| **O que o usuário espera** | Busca OCR em documentos digitalizados do navio |
| **O que realmente acontece** | Ícone + texto "Busca OCR em desenvolvimento" |
| **Evidência** | `<p>Busca OCR em desenvolvimento</p>` — sem input, sem handler, sem backend |
| **Impacto** | Feature prometida na UI não funciona |

---

### P0-003: PortCallOptimizationV2 — Mapa de Berços Stub

| Campo | Valor |
|-------|-------|
| **Módulo** | Port Call Optimization V2 |
| **Rota** | `/port-call` |
| **Arquivo** | `src/pages/PortCallOptimizationV2.tsx:372-375` |
| **Tipo** | Feature não implementada |
| **O que o usuário espera** | Mapa visual de berços portuários com ocupação |
| **O que realmente acontece** | Texto "Mapa de berços em desenvolvimento" |
| **Evidência** | `<p>Mapa de berços em desenvolvimento</p>` — placeholder puro |
| **Impacto** | Módulo incompleto para operações portuárias |

---

### P0-004: MedicalInfirmaryEnhanced — Dashboard com fallback decorativo

| Campo | Valor |
|-------|-------|
| **Módulo** | Medical Infirmary Enhanced |
| **Rota** | Componente de fallback lazy |
| **Arquivo** | `src/pages/MedicalInfirmaryEnhanced.tsx:22` |
| **Tipo** | Error boundary decorativo |
| **O que o usuário espera** | Dashboard médico funcional |
| **O que realmente acontece** | Se lazy load falha: "Dashboard em desenvolvimento" |
| **Evidência** | `.catch(() => ({ default: () => <div>Dashboard em desenvolvimento</div> }))` |
| **Impacto** | Falha silenciosa sem retry — usuário pensa que não existe |

---

### P0-005: Dados Simulados via Math.random() em 33 Páginas de Produção

| Campo | Valor |
|-------|-------|
| **Módulo** | Múltiplos (33 arquivos) |
| **Tipo** | Dados falsos apresentados como reais |
| **O que o usuário espera** | Métricas e dados operacionais reais |
| **O que realmente acontece** | Valores gerados por `Math.random()` mudam a cada re-render |

**Arquivos afetados (Top 15 mais críticos):**

| # | Arquivo | O que é simulado |
|---|---------|-----------------|
| 1 | `src/pages/SystemHub.tsx` | Métricas CPU/memória/disco flutuam aleatoriamente |
| 2 | `src/pages/FuelOptimizerPage.tsx` | Condições climáticas e economia de combustível |
| 3 | `src/pages/OceanSonar.tsx` | Número de detecções sonar |
| 4 | `src/pages/emerging/EdgeComputingPage.tsx` | Latência e throughput de edge |
| 5 | `src/pages/enterprise/OCRCenterPage.tsx` | Confidence scores de OCR engines |
| 6 | `src/pages/ProcurementCommandCenter.tsx` | savingsOpportunity aleatório |
| 7 | `src/pages/advanced/VRTrainingPage.tsx` | Score final de treinamento VR |
| 8 | `src/pages/ai/AIProcessingHub.tsx` | GPU/memória/throughput |
| 9 | `src/pages/enterprise/ContractAnalysisPage.tsx` | Dados de análise de contrato |
| 10 | `src/pages/optimization/UnifiedOptimizationDashboard.tsx` | Status de módulos de otimização |
| 11 | `src/pages/IntegrationsCenter.tsx` | Simulação de teste Slack |
| 12 | `src/pages/admin/Patch512Satcom.tsx` | Failover simulado (random > 0.95) |
| 13 | `src/pages/admin/Patch503DroneSimulation.tsx` | Validação de drone simulada |
| 14 | `src/pages/FleetManagement.tsx` | Dados de frota simulados |
| 15 | `src/pages/Forecast.tsx` | Previsões com valores aleatórios |

**Impacto:** Usuário vê números que mudam sozinhos — destrói confiança operacional.

---

### P0-006: Mock Data Estático em 119 Arquivos

| Campo | Valor |
|-------|-------|
| **Tipo** | Dados falsos hardcoded |
| **Quantidade** | 1.803 ocorrências em 119 arquivos |
| **Padrão** | `mockData`, `MOCK_`, `mockVessels`, `mockSurveys`, `mockCrew`, `sampleData`, `DEMO_` |

**Arquivos mais críticos (não-test):**

| # | Arquivo | Mock usado |
|---|---------|-----------|
| 1 | `src/modules/people-hub/components/CrewTrainingMatrix.tsx` | `mockCrew[]` com 2+ tripulantes hardcoded |
| 2 | `src/components/monitoring/advanced-system-monitor.tsx` | `generateMockMetrics()` para CPU/RAM/Disk |
| 3 | `src/components/security/advanced-security-center.tsx` | `mockAlerts[]`, `mockMetrics[]`, `mockVulnerabilities[]` |
| 4 | `src/components/executive/ExecutiveDashboard.tsx` | Métricas executivas simuladas |
| 5 | `src/components/fleet/FleetMapBox.tsx` | Posições de navios (anteriormente random, agora determinísticas mas falsas) |

**Nota:** Arquivos em `src/tests/` com mock data são **aceitáveis** (teste unitário).

---

## 🟠 FALHAS ALTAS (P1) — Quebram fluxo ou causam frustração

---

### P1-001: Botões "Em Desenvolvimento" com Toast Placeholder

| # | Arquivo | Botão | Toast |
|---|---------|-------|-------|
| 1 | `src/components/world-class/documents/DocumentVersionControl.tsx:283` | Preview de versão | `toast.info('Preview em desenvolvimento')` |
| 2 | `src/components/world-class/documents/DocumentVersionControl.tsx:286` | Download de versão | `toast.info('Download em desenvolvimento')` |
| 3 | `src/components/contracts/BROAGeneratorCard.tsx:473` | Assinar documento | `toast.info('Funcionalidade de assinatura em desenvolvimento')` |
| 4 | `src/components/peo-dp/fleet-operations-center.tsx:149` | Relatório | `toast.info("Relatório será gerado em breve")` |
| 5 | `src/components/people/CrewTrainingTab.tsx:237` | Novo Curso | `toast.info("Criar curso em desenvolvimento")` |
| 6 | `src/components/compliance/advanced/TraceabilityMatrix.tsx:408` | Exportar Matriz | `toast.success('Exportando matriz...')` — sem download real |

**Impacto:** Botão visível, clicável, mas não faz nada útil. Usuário frustrado.

---

### P1-002: Payroll — eSocial Export Desabilitado

| Campo | Valor |
|-------|-------|
| **Módulo** | Payroll (Folha de Pagamento) |
| **Rota** | `/payroll` |
| **Arquivo** | `src/pages/Payroll.tsx:503-512` |
| **Tipo** | Feature desabilitada sem alternativa |
| **O que acontece** | Botão eSocial está `disabled` com texto "Em breve" |
| **Impacto** | Feature regulatória importante sem funcionalidade |

---

### P1-003: alert() em Vez de toast() (UX Inconsistente)

| # | Arquivo | Uso |
|---|---------|-----|
| 1 | `src/pages/admin/assistant-logs.tsx` | 10x `alert()` para confirmações/erros de e-mail |
| 2 | `src/pages/admin/restore/personal.tsx` | 6x `alert()` para feedback de exportação |

**Impacto:** Bloqueia UI com modal nativo do browser — rompe padrão UX do sistema.

---

### P1-004: IntegrationsCenter — Teste de Integração Simulado

| Campo | Valor |
|-------|-------|
| **Módulo** | Integrations Center |
| **Rota** | `/integrations` |
| **Arquivo** | `src/pages/IntegrationsCenter.tsx:74-78` |
| **Tipo** | Integração fake |
| **O que acontece** | Botão "Testar Slack" faz `setTimeout(1500)` e retorna "Sucesso" sem chamar API |
| **Impacto** | Usuário acredita que Slack está integrado — falsa confiança |

---

### P1-005: Modules com Simulação Temporal (setTimeout como backend)

Múltiplos módulos usam `setTimeout` + `setInterval` para simular processamento backend:

| # | Arquivo | Simulação |
|---|---------|-----------|
| 1 | `src/pages/enterprise/OCRCenterPage.tsx` | OCR engines (Tesseract/Azure/Google) simulados com setTimeout |
| 2 | `src/pages/optimization/UnifiedOptimizationDashboard.tsx` | Execução de módulos de otimização via setTimeout |
| 3 | `src/pages/admin/Patch511SatelliteTracker.tsx` | Posições de satélite simuladas com setInterval |
| 4 | `src/pages/admin/Patch512Satcom.tsx` | Failover SATCOM simulado |
| 5 | `src/pages/admin/Patch503DroneSimulation.tsx` | Validação de drone simulada |

---

### P1-006: CrewTrainingMatrix — Mock Data Hardcoded

| Campo | Valor |
|-------|-------|
| **Módulo** | People Hub > Crew Training |
| **Arquivo** | `src/modules/people-hub/components/CrewTrainingMatrix.tsx:83-247` |
| **Tipo** | Mock data hardcoded em componente de produção |
| **O que acontece** | `mockCrew[]` com nomes fictícios, sem query ao Supabase |
| **Impacto** | Tripulação e treinamentos exibidos são 100% falsos |

---

### P1-007: SecurityCenter — Alertas e Vulnerabilidades Simulados

| Campo | Valor |
|-------|-------|
| **Módulo** | Advanced Security Center |
| **Arquivo** | `src/components/security/advanced-security-center.tsx:71-148` |
| **Tipo** | Mock data completo |
| **O que acontece** | `generateSecurityData()` cria alertas, métricas e vulnerabilidades fictícias |
| **Impacto** | Painel de segurança mostra status falso — risco operacional |

---

## 🟡 FALHAS MÉDIAS (P2) — Prejudicam UX ou clareza

---

### P2-001: Dupla Definição de Componentes Lazy (ESG)

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/App.tsx:317-318` |
| **Evidência** | `ESGEmissionsPage` e `ESGEmissionsPremium` apontam para mesmo arquivo |
| **Impacto** | Confusão de manutenção, sem impacto ao usuário |

---

### P2-002: Rotas Legacy com Excesso de Aliases

| Quantidade | Tipo |
|------------|------|
| 180+ aliases | Rotas antigas redireccionando para novos hubs |

**Exemplos de redundância:**
- `/compliance-dashboard` → ComplianceRoadmapPage
- `/compliance-alerts` → ComplianceRoadmapPage (mesmo destino)
- `/compliance-scoring` → ComplianceRoadmapPage (mesmo destino)
- `/nc-workflow` → ComplianceRoadmapPage (mesmo destino)
- `/predictive-compliance` → ComplianceRoadmapPage (mesmo destino)

**Impacto:** 5 rotas apontam para o mesmo componente — dificulta manutenção.

---

### P2-003: Módulo Innovation — Quase Vazio

| Campo | Valor |
|-------|-------|
| **Rota** | Não registrada explicitamente (orfã) |
| **Arquivo** | `src/pages/Innovation.tsx:64-67` |
| **Evidência** | "Iniciativas em desenvolvimento" como texto informativo |
| **Impacto** | Página com pouco valor prático |

---

### P2-004: Roadmap Page — Status Informativo Desatualizado

| Campo | Valor |
|-------|-------|
| **Rota** | `/roadmap` |
| **Arquivo** | `src/pages/Roadmap.tsx:449-453` |
| **Evidência** | "Testes E2E Playwright em desenvolvimento", "IA de voz em beta testing" |
| **Impacto** | Status podem estar desatualizados — confusão do usuário |

---

### P2-005: FuelOptimizerPage — Condições Climáticas 100% Fake

| Campo | Valor |
|-------|-------|
| **Rota** | Acessível via sub-componentes |
| **Arquivo** | `src/pages/FuelOptimizerPage.tsx:186-196` |
| **Evidência** | `generateWeatherConditions()` retorna vento/ondas/temp aleatórios |
| **Impacto** | Otimização de combustível baseada em dados inventados |

---

### P2-006: SystemHub — Métricas de Sistema Auto-Flutuantes

| Campo | Valor |
|-------|-------|
| **Rota** | `/system-hub` |
| **Arquivo** | `src/pages/SystemHub.tsx:187-191` |
| **Evidência** | `Math.random() - 0.5) * 10` aplicado a cada métrica |
| **Impacto** | CPU/RAM/Disco parecem "ao vivo" mas são ruído aleatório |

---

## ✅ O QUE FUNCIONA BEM

| Categoria | Status | Evidência |
|-----------|--------|-----------|
| **Rotas (App.tsx)** | ✅ 210+ rotas, 0 broken | Análise de App.tsx completa |
| **7 Mega-Hubs** | ✅ Navegação funcional | Tabs, queries reais no Supabase |
| **onClick Handlers** | ✅ 0 vazios | grep `onClick={() => {}}` = 0 |
| **console.log Handlers** | ✅ 0 encontrados | grep `onClick console.log` = 0 |
| **Export CSV nos Hubs** | ✅ Funcional nos 7 mega-hubs | `exportToCSV()` com dados reais |
| **Refresh/Invalidação** | ✅ Funcional nos mega-hubs | `queryClient.invalidateQueries()` |
| **Create Operations** | ✅ Funcional (audits, alerts, agents) | `supabase.from().insert()` |
| **Auth Flow** | ✅ ProtectedRoute + AuthProvider | Redirect para `/auth` |
| **Error Boundaries** | ✅ LazyLoadErrorBoundary | Captura erros de chunk |
| **Mobile Nav** | ✅ Paths corretos | Deep-links para mega-hubs |
| **Command Palette** | ✅ Ctrl+K funcional | Indexa todos os módulos |
| **Sidebar** | ✅ Todos items linkados | Verificado em análise anterior |

---

## 📋 BACKLOG TÉCNICO PRIORITIZADO

### PRIORIDADE IMEDIATA (P0)
1. Substituir `Math.random()` por dados reais ou `Math.sin(Date.now())` determinístico em 33 páginas
2. Implementar Telemetria360 com dados reais dos sensores IoT
3. Conectar CrewTrainingMatrix ao Supabase (tabelas `academy_courses`, `academy_progress`)
4. Implementar OCR real ou marcar com IntegrationGuard
5. Implementar busca OCR no VesselHistoryV2 ou remover botão

### PRIORIDADE ALTA (P1)
6. Substituir 6 botões "em desenvolvimento" por handlers reais ou IntegrationGuard
7. Substituir `alert()` por `toast()` em 2 arquivos admin
8. Implementar eSocial export no Payroll ou marcar com feature flag claro
9. Remover simulação de teste Slack e usar API real ou IntegrationGuard
10. Substituir `generateSecurityData()` por leitura real de `ai_access_anomalies`

### PRIORIDADE MÉDIA (P2)
11. Limpar aliases redundantes de compliance (5→1)
12. Remover dupla definição ESGEmissions
13. Atualizar textos do Roadmap
14. Conectar FuelOptimizer a API meteorológica real ou IntegrationGuard

---

## 🔢 CONTAGEM FINAL

| Métrica | Valor |
|---------|-------|
| Total rotas registradas | 210+ |
| Rotas 404 | **0** |
| onClick vazios | **0** |
| console.log-only handlers | **0** |
| Arquivos com mock data | **119** (excl. testes) |
| Páginas com Math.random() | **33** |
| Botões "em desenvolvimento" | **6** |
| Módulos placeholder puros | **3** |
| Mega-hubs funcionais | **7/7** |
| Exports CSV funcionais | **7/7** mega-hubs |
| CRUD real nos mega-hubs | **5/7** (Command, Tracking, Maintenance, Compliance, AI) |

---

*Relatório gerado por auditoria automatizada de código-fonte.*
*Nenhuma correção foi aplicada. Este documento serve como backlog técnico acionável.*
