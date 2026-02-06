# 🔴 FUNCIONALIDADES SUPRIMIDAS — PLANO DE RECUPERAÇÃO

> **Gerado: 2026-02-06**
> **Objetivo: Identificar e restaurar 100% das funcionalidades suprimidas**

---

## 📊 RESUMO

| Categoria | Suprimidas | Recuperáveis | Plano |
|-----------|-----------|--------------|-------|
| Rotas comentadas (App.tsx) | 5 | 5 | Restaurar com flag |
| Módulos sem rota no sidebar | ~15 | 15 | Adicionar ao sidebar |
| Funcionalidades mock-only | ~125 | 125 | Conectar ao backend |
| Edge Functions não deployadas | 300+ | Todas | Deploy progressivo |
| Tabelas vazias sem UI | ~750 | N/A | Seed data + UIs |

---

## 1️⃣ ROTAS EXPLICITAMENTE SUPRIMIDAS (Comentadas no App.tsx)

### Operações Submarinas (linhas 649-656 do App.tsx)

```tsx
// DESABILITADO (100% mockado)
// <Route path="/ocean-sonar" element={<OceanSonar />} />
// <Route path="/underwater-drone" element={<UnderwaterDrone />} />
// <Route path="/auto-sub" element={<AutoSub />} />
// <Route path="/sonar-ai" element={<SonarAI />} />
// <Route path="/deep-risk-ai" element={<DeepRiskAI />} />
```

| Módulo | Página | Motivo da Supressão | Plano de Restauração |
|--------|--------|---------------------|---------------------|
| Ocean Sonar | `src/pages/OceanSonar.tsx` | 100% mock data | Restaurar rota + IntegrationGuard |
| Underwater Drone | `src/pages/UnderwaterDrone.tsx` | 100% mock data | Restaurar rota + IntegrationGuard |
| AutoSub | `src/pages/AutoSub.tsx` | 100% mock data | Restaurar rota + IntegrationGuard |
| Sonar AI | `src/pages/SonarAI.tsx` | 100% mock data | Restaurar rota + IntegrationGuard |
| Deep Risk AI | `src/pages/DeepRiskAI.tsx` | 100% mock data | Restaurar rota + IntegrationGuard |

**Estratégia:** Restaurar as rotas com um `IntegrationGuard` que exibe status "MODO DEMO — Aguardando integração com hardware submarino" em vez de remover a funcionalidade.

---

## 2️⃣ MÓDULOS EXISTENTES SEM ENTRADA NO SIDEBAR

Os seguintes módulos existem como páginas mas NÃO aparecem diretamente no sidebar:

| # | Módulo | Rota | Existe | No Sidebar |
|---|--------|------|--------|------------|
| 1 | Incident Simulator | `/simulador` | ✅ | ❌ |
| 2 | Gamification | `/gamification` | ✅ | ❌ |
| 3 | Blockchain Compliance | `/blockchain-compliance` | ✅ | ❌ |
| 4 | MLC Scheduling | `/mlc-scheduling` | ✅ | ❌ |
| 5 | Task Management | `/task-management` | ✅ | ❌ |
| 6 | SOLAS/ISPS Training | `/solas-isps-training` | ✅ | ❌ |
| 7 | Nautilus Academy | `/nautilus-academy` | ✅ | ❌ |
| 8 | DP Intelligence | `/dp-intelligence` | ✅ | ❌ |
| 9 | Mentor DP | `/mentor-dp` | ✅ | ❌ |
| 10 | Knowledge Hub | `/knowledge-hub` | ✅ | ❌ |
| 11 | Sustainability Score | `/sustainability-score` | ✅ | ❌ |
| 12 | Operational Calendar | `/operational-calendar` | ✅ | ❌ |
| 13 | Weather Maritime | `/weather-maritime` | ✅ | ❌ |
| 14 | IoT Dashboard | `/iot-dashboard` | ✅ | ❌ |
| 15 | Collaboration | `/collaboration` | ✅ | ❌ |

**Estratégia:** Estes módulos são acessíveis via Command Palette (Ctrl+K) e via rotas diretas, mas devem ser visíveis como sub-itens nos Mega-Hubs relevantes.

---

## 3️⃣ FUNCIONALIDADES QUE PERDERAM COMPORTAMENTO EM FUSÕES

### Fusões que Causaram Perda Funcional

| Fusão | O que Tinha | O que Ficou | Perda |
|-------|-------------|-------------|-------|
| Crew Management → Maritime Command | Página dedicada com CRUD | Tab em Maritime | ⚠️ CRUD menos visível |
| Maritime Checklists → Maritime Command | Página dedicada | Sub-componente | ⚠️ Menos acessível |
| AI Journaling → Documents | Página dedicada com AI logging | Redirect para Documents | ❌ Funcionalidade AI perdida |
| Mentor DP → People Hub tab | Página dedicada | Redirect para tab | ⚠️ Deep link quebrado |

---

## 4️⃣ EDGE FUNCTIONS NÃO DEPLOYADAS

**Situação:** 300+ Edge Functions existem no código mas 0 estão deployadas no ambiente de produção.

### Edge Functions Críticas para Deploy Imediato (P0)

| Edge Function | Módulo | Impacto |
|--------------|--------|---------|
| `ai-hub-chat` | AI Chat | Chat com IA não funciona |
| `ai-hub-voice` | Voice Assistant | TTS não funciona |
| `health-check` | System | Monitoramento não real |
| `ai-copilot-stream` | AI Streaming | Streaming de respostas |
| `peodp-ai-chat` | PEO-DP | Auditoria AI não funciona |
| `peotram-ai-chat` | PEOTRAM | Auditoria AI não funciona |
| `sgso-assistant` | SGSO | Auditoria AI não funciona |
| `fleet-tracking` | Tracking | Tracking não real |
| `weather-integration` | Weather | Previsão não funciona |
| `document-ocr` | Documents | OCR não funciona |

### Edge Functions de Alta Prioridade (P1)

| Edge Function | Módulo | Impacto |
|--------------|--------|---------|
| `create-maintenance-task` | Maintenance | CRUD manutenção |
| `create-voyage` | Voyages | CRUD viagens |
| `create-crew` | People | CRUD tripulação |
| `export-data` | Export | Exportação universal |
| `pdf-generator` | Reports | Geração de PDFs |
| `send-email-notification` | Notifications | Alertas por email |
| `blockchain-compliance` | Compliance | Audit trail blockchain |
| `iot-sensor-processing` | IoT | Processamento de sensores |

---

## 5️⃣ FUNCIONALIDADES DECORATIVAS (Botões/Ações sem Backend)

### Módulos com Ações Decorativas Conhecidas

| Módulo | Ação | Status Atual | Correção |
|--------|------|-------------|----------|
| SATCOM | Enviar Mensagem | Mock | Aguarda API Inmarsat |
| AIS Tracker | Configurar Alerta de Geofence | Modal incompleto | Implementar modal completo |
| Voice Assistant | Gravar Audio | Web Audio faltando | Implementar Web Audio API |
| Weather Intelligence | Fetch API | Mock data | Conectar Open-Meteo/Stormglass |
| VR Training | Iniciar Simulação | UI decorativa | Aguarda integração WebXR |
| Bunker Optimization | Calcular Otimização | Mock results | Implementar algoritmo |

---

## 6️⃣ PLANO DE RESTAURAÇÃO PRIORIZADO

### SPRINT 1 (Imediato) — Restaurar Rotas Suprimidas
1. ✅ Descomentar rotas de Operações Submarinas em App.tsx
2. ✅ Adicionar IntegrationGuard para módulos sem backend
3. ✅ Adicionar módulos ocultos ao sidebar (via sub-items)
4. ✅ Restaurar funcionalidade AI Journaling

### SPRINT 2 (Semana 1) — Deploy Edge Functions Críticas
1. Deploy `ai-hub-chat`, `ai-hub-voice`, `health-check`
2. Deploy `peodp-ai-chat`, `peotram-ai-chat`, `sgso-assistant`
3. Deploy `fleet-tracking`, `weather-integration`
4. Deploy `document-ocr`, `export-data`, `pdf-generator`

### SPRINT 3 (Semana 2) — Eliminar Mock Data
1. Seed data para 20 tabelas core
2. Substituir mock data em ~125 arquivos
3. Conectar todos CRUDs ao Supabase
4. Implementar feedback UX completo

### SPRINT 4 (Semana 3-4) — Completar Funcionalidades
1. Voice Assistant com Web Audio API
2. Weather com API real
3. AIS Tracking com API real
4. SATCOM com status de integração
5. Completar ações decorativas restantes

---

## 7️⃣ CRITÉRIOS DE ACEITE

Uma funcionalidade só é considerada **RESTAURADA** quando:

1. ✅ Rota funcional (sem 404)
2. ✅ Visível no sidebar ou Command Palette
3. ✅ UI renderiza sem erros
4. ✅ Ações executam operações reais (ou IntegrationGuard visível)
5. ✅ Feedback UX completo (loading/error/empty/success)
6. ✅ Export funcional (quando aplicável)
7. ✅ Dados reais ou IntegrationGuard com mensagem clara

---

*Relatório de Recuperação — NAUTI ONE v8.0*
*Data: 2026-02-06*
