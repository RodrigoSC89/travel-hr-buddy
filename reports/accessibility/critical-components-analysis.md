# 🎯 Análise de Componentes Críticos
## Nautilus One - Travel HR Buddy

**Data:** $(date +"%d/%m/%Y %H:%M:%S")
**Objetivo:** Identificar componentes mais usados que precisam de melhorias de acessibilidade

---

## 📊 TOP 20 COMPONENTES MAIS IMPORTADOS

- **1132 imports:** `@/components/ui/card`
- **1000 imports:** `@/components/ui/badge`
- **991 imports:** `@/components/ui/button`
- **448 imports:** `@/components/ui/tabs`
- **447 imports:** `@/components/ui/input`
- **333 imports:** `@/components/ui/progress`
- **282 imports:** `@/components/ui/select`
- **269 imports:** `@/components/ui/label`
- **223 imports:** `@/components/ui/scroll-area`
- **194 imports:** `@/components/ui/textarea`
- **191 imports:** `@/components/ui/dialog`
- **88 imports:** `@/components/ui/checkbox`
- **78 imports:** `@/components/ui/switch`
- **69 imports:** `@/components/ui/alert`
- **62 imports:** `@/components/ui/separator`
- **61 imports:** `@/components/ui/module-page-wrapper`
- **55 imports:** `@/components/ui/module-header`
- **45 imports:** `@/components/unified/Skeletons.unified`
- **39 imports:** `@/components/ui/dropdown-menu`
- **34 imports:** `@/components/ui/table`

---

## 🔴 COMPONENTES COM PROBLEMAS DE ACESSIBILIDADE

### Componentes com onClick sem teclado:

- `src/components/legacy/notification_NotificationCenterProfessional.tsx` - 37 ocorrências
- `src/components/channel-manager/ChannelManagerProfessional.tsx` - 37 ocorrências
- `src/components/mentor-dp/MentorDPProfessional.tsx` - 30 ocorrências
- `src/components/documents/advanced-document-center.tsx` - 22 ocorrências
- `src/components/peotram/enhanced-peotram-manager.tsx` - 19 ocorrências
- `src/components/admin/UserManagementHub.tsx` - 18 ocorrências
- `src/components/peotram/peotram-audit-wizard.tsx` - 14 ocorrências
- `src/components/imca-audit/IMCAAuditManager.tsx` - 14 ocorrências
- `src/components/unified/NotificationCenter.unified.tsx` - 13 ocorrências
- `src/components/templates/template-manager.tsx` - 13 ocorrências
- `src/components/templates/TemplateEditor.tsx` - 13 ocorrências
- `src/components/peotram/peotram-checklist-version-manager.tsx` - 13 ocorrências
- `src/components/imca-audit/IMCADPAuditDashboard.tsx` - 13 ocorrências
- `src/components/documents/intelligent-document-manager.tsx` - 13 ocorrências
- `src/components/sgso/TrainingCompliance.tsx` - 12 ocorrências

### Componentes com imagens sem alt:

- `src/components/dashboard/professional-header.tsx` - 1 imagens sem alt
- `src/components/dashboard/enhanced-unified-dashboard.tsx` - 1 imagens sem alt
- `src/components/peotram/peotram-document-manager.tsx` - 1 imagens sem alt
- `src/components/peotram/peotram-ocr-processor.tsx` - 1 imagens sem alt
- `src/components/inspection/ImageRecognition.tsx` - 1 imagens sem alt
- `src/components/documents/enhanced-document-scanner.tsx` - 3 imagens sem alt
- `src/components/auth/login-form.tsx` - 1 imagens sem alt
- `src/components/performance/AdaptiveImage.tsx` - 1 imagens sem alt
- `src/components/performance/OptimizedImage.tsx` - 2 imagens sem alt
- `src/components/hr/certificate-manager.tsx` - 1 imagens sem alt

### Componentes sem ARIA labels:


---

## 🎯 COMPONENTES PRIORITÁRIOS PARA CORREÇÃO

### 1. Layout Components (CRÍTICO)
- **Header/AppBar** - Usado em todas as páginas
- **Navigation/Sidebar** - Usado em todas as páginas
- **Footer** - Ausente! Precisa ser implementado
- **Prioridade:** 🔴 ALTA

### 2. Form Components (CRÍTICO)
- `LanguageSelector.tsx`
- `PlanStatusSelect.tsx`
- `IncidentFormModal.tsx`
- `AuditSubmissionForm.tsx`
- `CopilotJobFormExample.tsx`
- `JobFormWithExamples.tsx`
- `BetaFeedbackForm.tsx`
- `ExpenseForm.tsx`

### 3. Interactive Components (SÉRIO)
- `IncidentFormModal.tsx`
- `IncidentAiModal.tsx`
- `ApplyTemplateModal.tsx`
- `IncidentAIClassificationModal.tsx`
- `EmergencyLocationsDialog.tsx`
- `EmergencyReportDialog.tsx`
- `ScheduleDrillDialog.tsx`
- `NewEmergencyPlanDialog.tsx`
- `DrillSimulationDialog.tsx`
- `ViewPlanDialog.tsx`

### 4. Data Display Components (MODERADO)
- `IncidentCards.tsx`
- `AuditsList.tsx`
- `SGSOHistoryTable.tsx`
- `SkeletonCard.tsx`
- `VirtualizedList.tsx`
- `AnimatedCard.tsx`
- `ProfessionalCard.tsx`
- `EnhancedCard.tsx`
- `InfoCard.tsx`
- `MetricCard.tsx`

---

## 📋 PLANO DE CORREÇÃO

### Fase 1: Layout & Navigation (Sprint Atual)
1. ✅ **SmartLayout.tsx** - Adicionar landmarks semânticos
2. ✅ **Header/AppBar** - ARIA labels e keyboard navigation
3. ✅ **Navigation/Sidebar** - Roles e keyboard shortcuts
4. ✅ **Criar Footer** - Elemento \<footer\> ausente

### Fase 2: Forms & Inputs (Sprint Atual)
1. ✅ **Input components** - Associar labels
2. ✅ **Form components** - Validação acessível
3. ✅ **Select/Dropdown** - Keyboard navigation
4. ✅ **Buttons** - ARIA labels

### Fase 3: Interactive Components (Próxima Sprint)
1. ⏳ **Modals/Dialogs** - Focus trap, Esc para fechar
2. ⏳ **Tooltips** - Acessíveis por teclado
3. ⏳ **Dropdowns** - ARIA expanded/selected
4. ⏳ **Tabs** - ARIA tablist/tab/tabpanel

### Fase 4: Data Display (Próxima Sprint)
1. ⏳ **Tables** - Caption, scope, headers
2. ⏳ **Cards** - Semântica apropriada
3. ⏳ **Lists** - Roles apropriados

---

**Gerado por:** DeepAgent - Abacus.AI
**Versão:** FASE 3.2.0

