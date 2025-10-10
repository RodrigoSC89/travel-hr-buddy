# TODO & FIXME Tracker

This document tracks all TODO and FIXME comments in the codebase.

**Last Updated:** 2025-10-10  
**Total Items:** 32

---

## By Priority

### 🔴 High Priority (Implementation Required)

#### Authentication & Security
- **File:** `src/components/auth/protected-route.tsx:32`
  - **Line:** 32
  - **Context:** `// TODO: Add permission checking logic here if needed`
  - **Action:** Implement permission checking for protected routes

### 🟡 Medium Priority (Feature Enhancements)

#### Maritime & Checklists
- **File:** `src/pages/MaritimeChecklists.tsx:79`
  - **Line:** 79
  - **Context:** `criticalIssues: 0 // TODO: Calculate from checklist items`
  - **Action:** Implement critical issues calculation

- **File:** `src/components/maritime-checklists/maritime-checklist-system.tsx:32`
  - **Line:** 32
  - **Context:** `// TODO: Create new checklist from template`
  - **Action:** Implement checklist creation from template

- **File:** `src/components/maritime-checklists/maritime-checklist-system.tsx:36`
  - **Line:** 36
  - **Context:** `// TODO: Implement save to Supabase`
  - **Action:** Implement Supabase save functionality

- **File:** `src/components/maritime-checklists/maritime-checklist-system.tsx:40`
  - **Line:** 40
  - **Context:** `// TODO: Implement submit to Supabase`
  - **Action:** Implement Supabase submit functionality

- **File:** `src/components/maritime-checklists/machine-routine-checklist.tsx:721`
  - **Line:** 721
  - **Context:** `// TODO: Fetch IoT sensor data`
  - **Action:** Implement IoT sensor data fetching

- **File:** `src/components/maritime/hr-dashboard.tsx:318`
  - **Line:** 318
  - **Context:** `// TODO: Implement rotation planning dialog/page`
  - **Action:** Create rotation planning interface

#### AI & Copilot Features
- **File:** `src/components/ai/integrated-ai-assistant.tsx:437`
  - **Line:** 437
  - **Context:** `// TODO: Implement settings dialog with model selection, temperature, etc.`
  - **Action:** Create AI assistant settings dialog

- **File:** `src/components/ai/advanced-ai-insights.tsx:175`
  - **Line:** 175
  - **Context:** `// TODO: Open implementation workflow dialog`
  - **Action:** Implement workflow dialog

- **File:** `src/components/ai/nautilus-copilot-advanced.tsx:262`
  - **Line:** 262
  - **Context:** `// TODO: Open maintenance scheduling dialog`
  - **Action:** Create maintenance scheduling interface

- **File:** `src/components/ai/nautilus-copilot-advanced.tsx:270`
  - **Line:** 270
  - **Context:** `// TODO: Open report generation dialog`
  - **Action:** Implement report generation dialog

- **File:** `src/components/ai/nautilus-copilot-advanced.tsx:278`
  - **Line:** 278
  - **Context:** `// TODO: Open crew planning interface`
  - **Action:** Create crew planning interface

#### API Integration
- **File:** `src/components/integration/api-hub-nautilus.tsx:258`
  - **Line:** 258
  - **Context:** `// TODO: Open documentation page or modal`
  - **Action:** Implement documentation viewer

- **File:** `src/components/integration/api-hub-nautilus.tsx:266`
  - **Line:** 266
  - **Context:** `// TODO: Open API key generation dialog`
  - **Action:** Create API key generation interface

- **File:** `src/components/integration/api-hub-nautilus.tsx:274`
  - **Line:** 274
  - **Context:** `// TODO: Open API testing console`
  - **Action:** Implement API testing console

- **File:** `src/components/integration/api-hub-nautilus.tsx:282`
  - **Line:** 282
  - **Context:** `// TODO: Open API documentation modal`
  - **Action:** Create API documentation modal

- **File:** `src/components/integration/api-hub-nautilus.tsx:290`
  - **Line:** 290
  - **Context:** `// TODO: Download code examples`
  - **Action:** Implement code examples download

- **File:** `src/components/integration/api-hub-nautilus.tsx:298`
  - **Line:** 298
  - **Context:** `// TODO: Open integration configuration dialog`
  - **Action:** Create integration configuration interface

- **File:** `src/components/integration/api-hub-nautilus.tsx:306`
  - **Line:** 306
  - **Context:** `// TODO: Open logs viewer`
  - **Action:** Implement logs viewer

- **File:** `src/components/integration/api-hub-nautilus.tsx:314`
  - **Line:** 314
  - **Context:** `// TODO: Run integration test`
  - **Action:** Implement integration testing

- **File:** `src/components/integration/api-hub-nautilus.tsx:322`
  - **Line:** 322
  - **Context:** `// TODO: Download SDK package`
  - **Action:** Implement SDK package download

### 🟢 Low Priority (Data & Stats)

#### Admin & Organization Stats
- **File:** `src/components/admin/organization-stats-cards.tsx:16`
  - **Line:** 16
  - **Context:** `value: "0", // TODO: buscar dados reais`
  - **Action:** Fetch real data for stats

- **File:** `src/components/admin/organization-stats-cards.tsx:22`
  - **Line:** 22
  - **Context:** `value: "0", // TODO: buscar dados reais`
  - **Action:** Fetch real data for stats

- **File:** `src/components/admin/organization-stats-cards.tsx:28`
  - **Line:** 28
  - **Context:** `value: "0 GB", // TODO: buscar dados reais`
  - **Action:** Fetch real storage data

#### PEO-DP & PEOTRAM
- **File:** `src/components/peo-dp/peo-dp-manager.tsx:138`
  - **Line:** 138
  - **Context:** `// TODO: Create plan in database`
  - **Action:** Implement database integration for plan creation

- **File:** `src/components/peotram/peotram-audit-wizard.tsx:262`
  - **Line:** 262
  - **Context:** `// TODO: Implement file upload dialog`
  - **Action:** Create file upload interface

- **File:** `src/components/peotram/peotram-audit-wizard.tsx:270`
  - **Line:** 270
  - **Context:** `// TODO: Implement camera capture functionality`
  - **Action:** Implement camera integration

- **File:** `src/components/peotram/peotram-audit-wizard.tsx:278`
  - **Line:** 278
  - **Context:** `// TODO: Implement audio recording functionality`
  - **Action:** Implement audio recording

#### Hooks
- **File:** `src/hooks/use-maritime-checklists.ts:90`
  - **Line:** 90
  - **Context:** `// TODO: Implement template fetching from Supabase`
  - **Action:** Implement Supabase template fetching

- **File:** `src/hooks/use-maritime-checklists.ts:260`
  - **Line:** 260
  - **Context:** `// TODO: Create checklist items from template`
  - **Action:** Implement checklist item creation

#### SGSO (Safety Management)
- **File:** `src/components/sgso/RiskAssessmentMatrix.tsx:71`
  - **Line:** 71
  - **Context:** `// TODO: Open risk details dialog`
  - **Action:** Create risk details dialog

- **File:** `src/components/sgso/RiskAssessmentMatrix.tsx:79`
  - **Line:** 79
  - **Context:** `// TODO: Open new risk registration form`
  - **Action:** Implement risk registration form

---

## Summary by Category

| Category | Count |
|----------|-------|
| Maritime & Checklists | 7 |
| API Integration | 10 |
| AI & Copilot | 5 |
| Admin & Stats | 3 |
| PEO-DP & PEOTRAM | 4 |
| Authentication | 1 |
| SGSO | 2 |
| **Total** | **32** |

---

## Next Steps

1. Prioritize items marked as High Priority
2. Create GitHub issues for each TODO item
3. Assign ownership and timelines
4. Track progress in project board
5. Remove TODO comments as items are implemented

