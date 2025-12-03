# Nautilus One - Guia de Limpeza de Código

**Objetivo:** Reduzir o tamanho do bundle e melhorar performance

---

## 📊 Análise Atual

| Área | Quantidade | Status |
|------|------------|--------|
| Módulos (src/modules) | 83 pastas | ⚠️ Muitos duplicados |
| Páginas (src/pages) | 180+ arquivos | ⚠️ Fragmentado |
| Componentes (src/components) | 100+ pastas | ⚠️ Revisar |
| Registry ativo | ~70 módulos | ✅ OK |

---

## 🗑️ Módulos para REMOVER (Duplicados/Não Utilizados)

### Alta Prioridade (Duplicados confirmados)

```bash
# Estes módulos são duplicados e podem ser removidos:

rm -rf src/modules/finance-hub          # Duplicado de finance
rm -rf src/modules/task-automation      # Duplicado de automation  
rm -rf src/modules/vault_ai             # Duplicado de documents
rm -rf src/modules/voice-assistant      # Duplicado de assistants/voice-assistant
rm -rf src/modules/weather-dashboard    # Duplicado de forecast
rm -rf src/modules/travel-intelligence  # Duplicado de travel
rm -rf src/modules/travel-search        # Duplicado de travel
rm -rf src/modules/travel-system        # Duplicado de travel
rm -rf src/modules/risk-audit           # Duplicado de compliance
rm -rf src/modules/risk-analysis        # Duplicado de compliance
rm -rf src/modules/risk-operations      # Duplicado de operations
```

### Média Prioridade (Não registrados)

```bash
# Módulos que existem mas não têm registro ativo:

rm -rf src/modules/reflective-core
rm -rf src/modules/regression
rm -rf src/modules/release-notes
rm -rf src/modules/remote-audits
rm -rf src/modules/reporting-engine
rm -rf src/modules/resilience-tracker
rm -rf src/modules/security-validation
rm -rf src/modules/self-diagnosis
rm -rf src/modules/signal-collector
rm -rf src/modules/situational-awareness
rm -rf src/modules/smart-drills
rm -rf src/modules/smart-scheduler
rm -rf src/modules/sociocognitive
rm -rf src/modules/strategic-consensus
rm -rf src/modules/stress-test
rm -rf src/modules/surface-bot
rm -rf src/modules/system-status
rm -rf src/modules/system-sweep
rm -rf src/modules/tactical-response
rm -rf src/modules/testing
rm -rf src/modules/theme-manager
rm -rf src/modules/trust-analysis
rm -rf src/modules/watchdog
rm -rf src/modules/workspace
```

### Baixa Prioridade (Verificar uso)

```bash
# Verificar se são usados antes de remover:

src/modules/reaction-mapper
src/modules/sensors
src/modules/sensors-hub
src/modules/satcom
src/modules/satellite
```

---

## 📄 Páginas Duplicadas para REMOVER

```bash
# Páginas que são duplicadas ou não utilizadas:

rm src/pages/AIAssistant.tsx                    # Usa /assistant/voice
rm src/pages/Voice.tsx                          # Usa /assistant/voice
rm src/pages/ChecklistsInteligentes.tsx         # Usa /admin/checklists
rm src/pages/NotificationCenter.tsx             # Usa NotificationsCenter
rm src/pages/NotificationCenterPage.tsx         # Usa NotificationsCenter
rm src/pages/SmartWorkflow.tsx                  # Usa Workflow
rm src/pages/MobileOptimization.tsx             # Usa Optimization
rm src/pages/Portal.tsx                         # Usa TrainingAcademy
rm src/pages/CrewWellbeing.tsx                  # Não registrado
rm src/pages/BusinessIntelligence.tsx           # Não registrado
rm src/pages/RealTimeAnalytics.tsx              # Não registrado
rm src/pages/AdvancedSystemMonitor.tsx          # Não registrado
rm src/pages/Patch66Dashboard.tsx               # Debug/Teste
rm src/pages/DesignSystemDemo.tsx               # Debug/Teste
rm src/pages/DropdownTests.tsx                  # Debug/Teste
rm src/pages/FABDemo.tsx                        # Debug/Teste
rm src/pages/HealthMonitorDemo.tsx              # Debug/Teste
rm src/pages/SmartLayoutDemo.tsx                # Debug/Teste
rm src/pages/TemplateEditorDemo.tsx             # Debug/Teste
rm src/pages/ContrastDemo.tsx                   # Debug/Teste
rm src/pages/i18n-demo.tsx                      # Debug/Teste
```

---

## 🔧 Componentes de Sidebar (Consolidar)

**Problema:** Existem múltiplas implementações de sidebar

**Arquivos:**
- `src/components/layout/SmartSidebar.tsx` ← MANTER
- `src/components/layout/app-sidebar.tsx` ← CONSOLIDAR

**Ação:** Manter apenas SmartSidebar.tsx e migrar features úteis de app-sidebar.tsx

---

## 📦 Dependências a Revisar

```bash
# Verificar se estas dependências são necessárias:

npm ls @mediapipe/camera_utils    # Camera/AR - remover se não usar
npm ls @mediapipe/hands           # Gesture detection - remover se não usar
npm ls @tensorflow-models/coco-ssd # Object detection - remover se não usar
npm ls @tensorflow/tfjs           # Machine learning - verificar uso
npm ls @react-three/drei          # 3D graphics - remover se não usar
npm ls @react-three/fiber         # 3D graphics - remover se não usar
npm ls three                      # 3D graphics - remover se não usar
npm ls mapbox-gl                  # Maps - verificar uso
npm ls webxr-polyfill             # WebXR - remover se não usar AR/VR
npm ls tesseract.js               # OCR - verificar uso
npm ls onnxruntime-web            # AI runtime - verificar uso
```

---

## 🚀 Otimizações de Bundle

### 1. Vite Config Otimizado

```typescript
// vite.config.ts - Adicionar:
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
        'vendor-query': ['@tanstack/react-query'],
      }
    }
  },
  chunkSizeWarningLimit: 500,
}
```

### 2. Lazy Loading Agressivo

```typescript
// Em vez de imports diretos, usar:
const Component = React.lazy(() => import('./Component'));
```

### 3. Tree Shaking

```typescript
// Importar apenas o necessário:
// ❌ import * as _ from 'lodash';
// ✅ import { debounce } from 'lodash';
```

---

## ✅ Checklist de Limpeza

- [ ] Remover módulos duplicados listados acima
- [ ] Remover páginas de demo/teste
- [ ] Consolidar sidebars
- [ ] Revisar e remover dependências não utilizadas
- [ ] Otimizar Vite config
- [ ] Rodar `npm run build` e verificar bundle size
- [ ] Testar todas as rotas após limpeza

---

## 📈 Meta de Performance

| Métrica | Atual (estimado) | Meta |
|---------|------------------|------|
| Bundle size | ~5MB+ | < 2MB |
| First Load | ~8s | < 3s |
| Módulos | 83 | ~40 |
| Páginas | 180+ | ~60 |

---

## 🔍 Comandos de Análise

```bash
# Analisar código não utilizado
npx knip

# Verificar bundle size
npm run build -- --analyze

# Encontrar imports não utilizados
npx eslint --rule 'no-unused-vars: error' src/

# Verificar dependências não utilizadas
npx depcheck
```

---

*Documento criado em 2025-12-03*
