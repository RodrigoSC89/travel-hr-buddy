# 🔄 REDIRECTS COMPATIBILITY MAP

> **Mapa de Redirects para Compatibilidade**
> Data: Janeiro 2026

---

## 📋 TABELA DE REDIRECTS

### GRUPO A: Operations Command

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/maritime-command` | `/operations-command?tab=maritime` | - |
| `/fleet-command` | `/operations-command?tab=fleet` | - |
| `/voyage-command` | `/operations-command?tab=voyage` | - |
| `/mission-command` | `/operations-command?tab=mission` | - |
| `/logistics-command` | `/operations-command?tab=logistics` | - |
| `/route-optimizer` | `/operations-command?tab=voyage&section=optimization` | - |
| `/bridge-link` | `/operations-command?tab=maritime&section=bridge` | - |
| `/drydock-management` | `/operations-command?tab=fleet&section=drydock` | - |
| `/vessel-history` | `/operations-command?tab=fleet&section=history` | - |
| `/digital-twin` | `/operations-command?tab=fleet&section=twin` | - |

---

### GRUPO B: Cargo & Port

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/cargo-management` | `/cargo-port-operations?tab=cargo` | - |
| `/port-call` | `/cargo-port-operations?tab=port` | - |

---

### GRUPO C: Vessel Contracts

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/vessel-contracts` | `/vessel-contracts-hub?tab=contracts` | - |
| `/charter-party` | `/vessel-contracts-hub?tab=charter` | - |

---

### GRUPO D: Crew Operations

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/vessel-cts` | `/crew-operations?tab=cts` | - |
| `/crew-management` | `/crew-operations?tab=management` | - |
| `/mlc-scheduling` | `/crew-operations?tab=mlc` | - |

---

### GRUPO E: AI Control Tower

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/ai-modules-hub` | `/ai-control-tower?tab=hub` | - |
| `/ai-hub` | `/ai-control-tower?tab=hub` | - |
| `/ai-command` | `/ai-control-tower?tab=command` | - |
| `/autonomous-command` | `/ai-control-tower?tab=autonomous` | - |
| `/agent-orchestration` | `/ai-control-tower?tab=agents` | - |
| `/ai-analytics` | `/ai-control-tower?tab=analytics` | - |
| `/ai-observability` | `/ai-control-tower?tab=observability` | - |
| `/ai-audit` | `/ai-control-tower?tab=audit` | - |
| `/workflow-command` | `/ai-control-tower?tab=workflows` | - |
| `/ai-journaling` | `/ai-control-tower?tab=journaling` | - |
| `/ai-ops/logs` | `/ai-control-tower?tab=logs` | - |

---

### GRUPO F: Voice & Assistant

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/voice-assistant` | `/voice-assistant-hub?tab=assistant` | - |
| `/assistant/voice` | `/voice-assistant-hub?tab=assistant` | - |
| `/voice-transcriber` | `/voice-assistant-hub?tab=transcriber` | - |

---

### GRUPO G: Tracking & Telemetry

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/telemetria` | `/tracking-telemetry?tab=overview` | - |
| `/predictive-telemetry` | `/tracking-telemetry?tab=predictive` | - |
| `/tracking` | `/tracking-telemetry?tab=tracking` | - |
| `/tracking/gnss-live` | `/tracking-telemetry?tab=gnss` | - |
| `/tracking/alerts` | `/tracking-telemetry?tab=alerts` | - |

---

### GRUPO H: Document Center

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/reports-command` | `/document-center?tab=reports` | - |
| `/documents` | `/document-center?tab=documents` | - |
| `/templates` | `/document-center?tab=templates` | - |
| `/admin/checklists` | `/document-center?tab=checklists` | - |
| `/document-workflow` | `/document-center?tab=workflow` | - |
| `/export-center` | `/document-center?tab=export` | - |
| `/advanced-search` | `/document-center?tab=search` | - |

---

### GRUPO I: Comms & Alerts

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/communication-command` | `/comms-alerts?tab=comms` | - |
| `/alerts-command` | `/comms-alerts?tab=alerts` | - |
| `/real-time-workspace` | `/comms-alerts?tab=workspace` | - |
| `/maritime-connectivity` | `/comms-alerts?tab=connectivity` | - |

---

### GRUPO J: People Hub

| Rota Antiga | Nova Rota | Params |
|-------------|-----------|--------|
| `/nautilus-people` | `/people-hub?tab=overview` | - |
| `/hr-dashboard` | `/people-hub?tab=dashboard` | - |
| `/recruitment` | `/people-hub?tab=talent` | - |
| `/hr-turnover` | `/people-hub?tab=talent` | - |
| `/crew-wellness` | `/people-hub?tab=wellness` | - |
| `/crew-wellbeing` | `/people-hub?tab=wellness` | - |
| `/hr-payroll` | `/people-hub?tab=payroll` | - |
| `/hr-time-tracking` | `/people-hub?tab=time` | - |
| `/hr-chatbot` | `/people-hub?tab=chatbot` | - |
| `/hr-ocr` | `/people-hub?tab=documents` | - |

---

## 🛠️ IMPLEMENTAÇÃO

### React Router Config

```typescript
// src/routes/legacy-redirects.tsx
import { Navigate, useSearchParams } from 'react-router-dom';

const LEGACY_ROUTES: Record<string, string> = {
  '/maritime-command': '/operations-command?tab=maritime',
  '/fleet-command': '/operations-command?tab=fleet',
  '/voyage-command': '/operations-command?tab=voyage',
  // ... todos os redirects acima
};

export function LegacyRedirect({ from }: { from: string }) {
  const [searchParams] = useSearchParams();
  const to = LEGACY_ROUTES[from];
  
  if (!to) return <Navigate to="/404" replace />;
  
  // Preservar query params existentes
  const existingParams = searchParams.toString();
  const finalUrl = existingParams 
    ? `${to}&${existingParams}` 
    : to;
  
  return <Navigate to={finalUrl} replace />;
}

// App.tsx
{Object.keys(LEGACY_ROUTES).map(path => (
  <Route 
    key={path} 
    path={path} 
    element={<LegacyRedirect from={path} />} 
  />
))}
```

### Preservação de Deep Links

```typescript
// Exemplo: /maritime-command?vessel=123&tab=certifications
// → /operations-command?tab=maritime&vessel=123&section=certifications

function preserveDeepLinks(from: string, searchParams: URLSearchParams): string {
  const baseRedirect = LEGACY_ROUTES[from];
  const additionalParams = searchParams.toString();
  
  // Mapear params antigos para novos
  const paramMapping: Record<string, string> = {
    'tab': 'section', // tab interno vira section no novo hub
    'id': 'id',       // IDs preservados
    'filter': 'filter',
  };
  
  // Construir URL final
  return `${baseRedirect}&${additionalParams}`;
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Para cada redirect:

```markdown
[ ] Rota antiga redireciona corretamente
[ ] Query params preservados
[ ] Deep links funcionam
[ ] Bookmarks antigos funcionam
[ ] Analytics/tracking atualizado
[ ] Sem loops de redirect
[ ] HTTP 301 (permanente) configurado
```

---

## 📊 TESTES E2E

```typescript
// e2e/redirects.spec.ts
import { test, expect } from '@playwright/test';

const redirectTests = [
  { from: '/maritime-command', to: '/operations-command', tab: 'maritime' },
  { from: '/fleet-command', to: '/operations-command', tab: 'fleet' },
  // ... todos os redirects
];

for (const { from, to, tab } of redirectTests) {
  test(`redirect ${from} → ${to}?tab=${tab}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${to}.*tab=${tab}`));
    await expect(page.locator(`[data-tab="${tab}"]`)).toBeVisible();
  });
}
```

---

*Documento gerado em Janeiro 2026*
