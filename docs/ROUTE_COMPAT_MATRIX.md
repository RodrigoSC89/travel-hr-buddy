# 🔄 ROUTE COMPATIBILITY MATRIX - NAUTI ONE

> **Versão:** v5.0 FUSÃO TOTAL  
> **Status:** ✅ 100% COMPATÍVEL

---

## 📋 MATRIZ COMPLETA DE REDIRECTS

Todas as rotas antigas continuam funcionando via redirect automático.

### GROUP A: Operations Command

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/maritime-command` | `/operations-command?tab=maritime` | Maritime |
| `/fleet-command` | `/operations-command?tab=fleet` | Fleet |
| `/voyage-command` | `/operations-command?tab=voyage` | Voyage |
| `/mission-command` | `/operations-command?tab=mission` | Mission |
| `/logistics-command` | `/operations-command?tab=logistics` | Logistics |
| `/route-optimizer` | `/operations-command?tab=voyage` | Voyage |
| `/bridge-link` | `/operations-command?tab=maritime` | Maritime |
| `/drydock-management` | `/operations-command?tab=fleet` | Fleet |
| `/vessel-history` | `/operations-command?tab=fleet` | Fleet |
| `/digital-twin` | `/operations-command?tab=fleet` | Fleet |

### GROUP B: AI Control Tower

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/ai-modules-hub` | `/ai-control-tower?tab=hub` | Hub |
| `/ai-hub` | `/ai-control-tower?tab=hub` | Hub |
| `/ai-command` | `/ai-control-tower?tab=chat` | Chat |
| `/revolutionary-ai` | `/ai-control-tower?tab=chat` | Chat |
| `/autonomous-command` | `/ai-control-tower?tab=agents` | Agents |
| `/agent-orchestration` | `/ai-control-tower?tab=agents` | Agents |
| `/ai-analytics` | `/ai-control-tower?tab=analytics` | Analytics |
| `/ai-observability` | `/ai-control-tower?tab=observability` | Observability |
| `/ai-audit` | `/ai-control-tower?tab=audit` | Audit |
| `/workflow-command` | `/ai-control-tower?tab=workflows` | Workflows |
| `/ai-journaling` | `/ai-control-tower?tab=journaling` | Journaling |
| `/ai-ops/logs` | `/ai-control-tower?tab=audit` | Audit |

### GROUP C: Tracking & Telemetry

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/telemetria` | `/tracking-telemetry?tab=overview` | Overview |
| `/telemetria-command` | `/tracking-telemetry?tab=overview` | Overview |
| `/predictive-telemetry` | `/tracking-telemetry?tab=predictive` | Predictive |
| `/tracking` | `/tracking-telemetry?tab=realtime` | Realtime |
| `/tracking/gnss-live` | `/tracking-telemetry?tab=realtime` | Realtime |
| `/tracking/alerts` | `/tracking-telemetry?tab=alerts` | Alerts |

### GROUP D: Document Center

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/reports-command` | `/document-center?tab=reports` | Reports |
| `/reports` | `/document-center?tab=reports` | Reports |
| `/documents` | `/document-center?tab=documents` | Documents |
| `/documentation` | `/document-center?tab=documents` | Documents |
| `/templates` | `/document-center?tab=templates` | Templates |
| `/admin/checklists` | `/document-center?tab=checklists` | Checklists |
| `/document-workflow` | `/document-center?tab=workflow` | Workflow |
| `/export-center` | `/document-center?tab=export` | Export |
| `/advanced-search` | `/document-center?tab=search` | Search |

### GROUP E: Comms & Alerts

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/communication-command` | `/comms-alerts?tab=comms` | Comms |
| `/alerts-command` | `/comms-alerts?tab=alerts` | Alerts |
| `/emergency-mode` | `/comms-alerts?tab=alerts` | Alerts |
| `/real-time-workspace` | `/comms-alerts?tab=workspace` | Workspace |
| `/maritime-connectivity` | `/comms-alerts?tab=connectivity` | Connectivity |

### GROUP F: People Hub

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/nautilus-people` | `/people-hub?tab=overview` | Overview |
| `/hr-dashboard` | `/people-hub?tab=performance` | Performance |
| `/hr/dashboard` | `/people-hub?tab=overview` | Overview |
| `/recruitment` | `/people-hub?tab=talent` | Talent |
| `/hr-turnover` | `/people-hub?tab=talent` | Talent |
| `/crew-wellness` | `/people-hub?tab=wellness` | Wellness |
| `/crew-wellbeing` | `/people-hub?tab=wellness` | Wellness |
| `/medical-infirmary` | `/people-hub?tab=wellness` | Wellness |
| `/hr-payroll` | `/people-hub?tab=overview` | Overview |
| `/payroll` | `/people-hub?tab=overview` | Overview |
| `/hr-time-tracking` | `/people-hub?tab=overview` | Overview |
| `/time-tracking` | `/people-hub?tab=overview` | Overview |
| `/hr-chatbot` | `/people-hub?tab=overview` | Overview |
| `/people-analytics` | `/people-hub?tab=analytics` | Analytics |

### GROUP G: Compliance Hub

| Rota Antiga | Rota Nova | Tab Alvo |
|-------------|-----------|----------|
| `/compliance-hub` | `/compliance-unified?tab=dashboard` | Dashboard |
| `/compliance-one` | `/compliance-unified?tab=dashboard` | Dashboard |
| `/compliance-dashboard` | `/compliance-unified?tab=dashboard` | Dashboard |
| `/compliance-executive` | `/compliance-unified?tab=dashboard` | Dashboard |
| `/audit-agents` | `/compliance-unified?tab=agents` | Agents |
| `/audit-ai-chat` | `/compliance-unified?tab=agents` | Agents |
| `/peo-dp` | `/compliance-unified?tab=audits` | Audits |
| `/peotram` | `/compliance-unified?tab=audits` | Audits |
| `/sgso` | `/compliance-unified?tab=audits` | Audits |
| `/imca-audit` | `/compliance-unified?tab=audits` | Audits |
| `/pre-ovid` | `/compliance-unified?tab=audits` | Audits |
| `/mlc-inspection` | `/compliance-unified?tab=audits` | Audits |
| `/psc-package` | `/compliance-unified?tab=certificates` | Certificates |
| `/diagnostic-certificates` | `/compliance-unified?tab=certificates` | Certificates |
| `/diagnostic-ncs` | `/compliance-unified?tab=ncs` | NCs |
| `/nc-workflow` | `/compliance-unified?tab=ncs` | NCs |
| `/regulations` | `/compliance-unified?tab=regulations` | Regulations |
| `/risk-matrix` | `/compliance-unified?tab=risks` | Risks |
| `/safety-human-factors` | `/compliance-unified?tab=risks` | Risks |
| `/diagnostic-reports` | `/compliance-unified?tab=reports` | Reports |

---

## 🔧 IMPLEMENTAÇÃO

Os redirects são implementados em `src/routes/legacy-redirects.tsx`:

```tsx
export const LEGACY_ROUTES: Record<string, string> = {
  // Operations Command
  "/maritime-command": "/operations-command?tab=maritime",
  "/fleet-command": "/operations-command?tab=fleet",
  // ... (todas as rotas acima)
};
```

### Uso no Router:

```tsx
{Object.keys(LEGACY_ROUTES).map(path => (
  <Route 
    key={path} 
    path={path} 
    element={<LegacyRedirect from={path} />} 
  />
))}
```

---

## ✅ VALIDAÇÃO

- [x] Todas as rotas antigas testadas
- [x] Query params preservados
- [x] Deep links funcionando
- [x] Hash fragments preservados
- [x] Zero 404 em rotas conhecidas

---

*Gerado automaticamente em Fevereiro 2026*
