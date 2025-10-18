# SGSO Incidents Management - Visual Guide

## 🎨 Interface Overview

### Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ Painel Administrativo SGSO            [Compliance ANP 43/2007]│
│  Sistema de Gestão de Segurança Operacional - Métricas e Compliance│
├─────────────────────────────────────────────────────────────────┤
│  [Métricas] [Compliance] [⚠️ Incidentes] [Relatórios]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Gestão de Incidentes SGSO                    [➕ Novo Incidente]│
│  Visualizar, adicionar e gerenciar incidentes                  │
│                                                                 │
│  🔍 Filtros: [Tipo ▼] [Severidade ▼] [Status ▼]               │
│             [🧠 Analisar com IA 🔜] [📥 Exportar 🔜]           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ INC-1729276800123  [Acidente]           18/10/2025      │  │
│  │                                                          │  │
│  │ Falha no sistema hidráulico durante operação de içamento│  │
│  │ 📍 Local: Sala de Máquinas                              │  │
│  │ 🚢 Embarcação: Navio Atlântico                           │  │
│  │                                                          │  │
│  │ 🔴 Crítico                    Status: Investigando       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ INC-1729276800456  [Operacional]        17/10/2025      │  │
│  │                                                          │  │
│  │ Desvio no procedimento de segurança durante troca de turno│
│  │ 📍 Local: Convés Principal                               │  │
│  │ 🚢 Embarcação: Navio Pacífico                            │  │
│  │                                                          │  │
│  │ 🟠 Alto                       Status: Reportado          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 New Incident Form Modal

```
┌─────────────────────────────────────────────────────────┐
│  Registrar Novo Incidente                          [✕]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tipo de Incidente *                                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Selecione o tipo                              ▼  │ │
│  └───────────────────────────────────────────────────┘ │
│    • Acidente                                           │
│    • Quase Acidente                                     │
│    • Ambiental                                          │
│    • Segurança                                          │
│    • Operacional                                        │
│    • Outro                                              │
│                                                         │
│  Descrição *                                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │ Descreva o incidente de forma detalhada...       │ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Severidade *                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Selecione a severidade                        ▼  │ │
│  └───────────────────────────────────────────────────┘ │
│    • Crítico                                            │
│    • Alto                                               │
│    • Médio                                              │
│    • Baixo                                              │
│    • Negligenciável                                     │
│                                                         │
│  Data do Incidente *                                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 18/10/2025                                    📅 │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Local                                                  │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Ex: Sala de Máquinas, Convés Principal...        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │           Salvar Incidente                        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Color Coding

### Severity Indicators
```
🔴 Crítico (Critical)        - Red (#DC2626)
🟠 Alto (High)              - Orange (#EA580C)
🟡 Médio (Medium)           - Yellow (#CA8A04)
🟢 Baixo (Low)              - Green (#16A34A)
🟢 Negligenciável (Negligible) - Green (#16A34A)
```

### Type Badges
```
[Acidente]        - Outline badge
[Quase Acidente]  - Outline badge
[Ambiental]       - Outline badge
[Segurança]       - Outline badge
[Operacional]     - Outline badge
[Outro]           - Outline badge
```

## 🔍 Filter Options

### Type Filter
```
┌─────────────────────┐
│ Tipo            ▼  │
└─────────────────────┘
  • Todos os tipos
  • Acidente
  • Quase Acidente
  • Ambiental
  • Segurança
  • Operacional
  • Outro
```

### Severity Filter
```
┌─────────────────────┐
│ Severidade      ▼  │
└─────────────────────┘
  • Todas severidades
  • Crítico
  • Alto
  • Médio
  • Baixo
  • Negligenciável
```

### Status Filter
```
┌─────────────────────┐
│ Status          ▼  │
└─────────────────────┘
  • Todos status
  • Reportado
  • Investigando
  • Resolvido
  • Fechado
```

## 🎯 Empty State

```
┌─────────────────────────────────────────────┐
│                                             │
│              ⚠️                             │
│                                             │
│      Nenhum incidente encontrado            │
│                                             │
└─────────────────────────────────────────────┘
```

## ⏳ Loading State

```
┌─────────────────────────────────────────────┐
│                                             │
│      Carregando incidentes...               │
│                                             │
└─────────────────────────────────────────────┘
```

## 🚀 Future Features (Disabled)

```
┌────────────────────────────────────────────┐
│ [🧠 Analisar com IA] [Em Breve]           │
└────────────────────────────────────────────┘
  - AI-powered incident analysis
  - Automatic root cause detection
  - Similar incident suggestions
  - Risk assessment

┌────────────────────────────────────────────┐
│ [📥 Exportar] [Em Breve]                   │
└────────────────────────────────────────────┘
  - Export to PDF
  - Export to CSV
  - Custom date ranges
  - Monthly/quarterly reports
```

## 📱 Responsive Design

### Desktop View (>1024px)
- Filters displayed in a row
- Cards in single column
- Modal centered with max-width

### Tablet View (768px - 1024px)
- Filters start to wrap
- Cards maintain single column
- Modal adapts to screen width

### Mobile View (<768px)
- Filters stack vertically
- Cards full width
- Modal takes full screen
- Touch-optimized controls

## 🎨 Design Tokens

### Spacing
```
Gap between cards:     1rem (16px)
Card padding:          1rem (16px)
Modal padding:         1.5rem (24px)
Filter gap:            0.75rem (12px)
```

### Typography
```
Page title:            text-3xl (30px)
Card title:            text-lg (18px)
Body text:             text-sm (14px)
Badge text:            text-xs (12px)
```

### Border Radius
```
Cards:                 0.5rem (8px)
Inputs:                0.375rem (6px)
Badges:                9999px (fully rounded)
```

### Shadows
```
Card:                  shadow-sm
Card hover:            shadow-md
Modal:                 shadow-xl
```

## 🔔 User Feedback

### Success States
```
✅ Incident created successfully
   → Form resets
   → Modal closes
   → List refreshes automatically
```

### Error States
```
❌ Required field missing
   → Field highlighted in red
   → Error message displayed

❌ Network error
   → Error toast notification
   → Retry option available
```

### Loading States
```
⏳ Creating incident...
   → Button shows "Salvando..."
   → Button disabled
   → Loading spinner

⏳ Loading incidents...
   → Text displayed in center
   → Skeleton loader (optional)
```

## 🎭 Interactions

### Card Hover
```
Default:  shadow-sm
Hover:    shadow-md + scale(1.01)
Active:   shadow-sm + scale(0.99)
```

### Button States
```
Default:   bg-primary text-white
Hover:     bg-primary-dark
Active:    bg-primary-darker
Disabled:  bg-gray-300 text-gray-500 cursor-not-allowed
```

### Filter Dropdowns
```
Closed:    border-gray-300
Open:      border-primary shadow-lg
Selected:  bg-primary-light
```

## 📊 Data Display Patterns

### Incident Card Structure
```
┌────────────────────────────────────────┐
│ [Header]                               │
│   - Incident Number (left)             │
│   - Type Badge (left)                  │
│   - Date (right)                       │
├────────────────────────────────────────┤
│ [Body]                                 │
│   - Description (full width)           │
│   - Location icon + text               │
│   - Vessel icon + text                 │
├────────────────────────────────────────┤
│ [Footer]                               │
│   - Severity (left, colored)           │
│   - Status (right)                     │
└────────────────────────────────────────┘
```

## 🎨 Accessibility Features

### Keyboard Navigation
```
Tab:         Navigate between fields
Enter:       Submit form / Open dropdown
Escape:      Close modal / Close dropdown
Arrow keys:  Navigate dropdown options
```

### Screen Reader Support
```
- Semantic HTML elements
- ARIA labels on interactive elements
- Status announcements for actions
- Form field labels properly associated
```

### Focus Indicators
```
All interactive elements show clear focus ring
Focus order follows logical flow
Skip links available for main content
```

## 🌐 Internationalization

### Current Language: Portuguese (BR)
```
Button labels:    "Novo Incidente", "Salvar", etc.
Field labels:     "Tipo", "Descrição", "Severidade"
Status messages:  "Carregando...", "Nenhum encontrado"
Date format:      dd/MM/yyyy
```

### Ready for i18n
```
All strings can be externalized to i18n files
Date formatting uses date-fns (locale-aware)
Number formatting follows locale conventions
```

---

## 💡 Pro Tips

1. **Filtering Performance**: Filters run client-side for instant results
2. **Auto-refresh**: List automatically refreshes after creating/updating
3. **Validation**: Form validates before submission
4. **Type Safety**: Full TypeScript support prevents runtime errors
5. **Extensible**: Easy to add new fields or features
6. **Mobile First**: Touch-optimized for mobile devices
7. **Dark Mode Ready**: Uses theme-aware color variables

