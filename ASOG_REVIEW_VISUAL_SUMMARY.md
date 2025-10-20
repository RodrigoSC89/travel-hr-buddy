# 🎨 ASOG Review Module - Visual Summary

## 📱 User Interface Overview

The ASOG Review module provides a comprehensive, modern UI for auditing Dynamic Positioning (DP) operations.

---

## 🖼️ Page Structure

```
┌────────────────────────────────────────────────────────────────┐
│  🧭 ASOG Review                                                │
│  Sistema de Auditoria de Diretrizes Operacionais de DP        │
│                                                                 │
│  [🛡️ Compliance ASOG] [🌬️ Monitoramento Ambiental]           │
│  [⚙️ Status de Thrusters] [🎯 Validação Automática]           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  ⚙️ Painel de Controle                                         │
│  Inicie a auditoria ASOG ou exporte relatórios                │
│                                                                 │
│  [▶️ Executar ASOG Review] [💾 Baixar Relatório] [🔄 Resetar] │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  🎯 Limites ASOG Configurados                                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 🌬️ Vento    │  │ ⚙️ Thrusters │  │ 🛡️ Status DP │        │
│  │              │  │              │  │              │        │
│  │   35 nós     │  │      1       │  │    Green     │        │
│  │ Máx permitido│  │ Tolerância   │  │  Requerido   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  📈 Dados Operacionais Coletados                               │
│  Coletado em: 20/10/2025, 01:00:00                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Vento        │  │ Thrusters    │  │ Status DP    │        │
│  │              │  │              │  │              │        │
│  │   28 nós     │  │     3/4      │  │    Green     │        │
│  │ ✅ Conforme  │  │ ✅ Conforme  │  │ ✅ Conforme  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  ✅ Resultado da Validação                                     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ✅ Operação Conforme ao ASOG                          │   │
│  │  Todos os parâmetros estão dentro dos limites          │   │
│  │  operacionais.                                          │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  📄 Relatório JSON                                             │
│  Visualização do relatório gerado                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ {                                                       │   │
│  │   "timestamp": "2025-10-20T01:00:00.000Z",            │   │
│  │   "dados_operacionais": {                              │   │
│  │     "wind_speed": 28,                                  │   │
│  │     "thrusters_operacionais": 3,                       │   │
│  │     "dp_status": "Green",                              │   │
│  │     "timestamp": "2025-10-20T01:00:00.000Z"           │   │
│  │   },                                                    │   │
│  │   "resultado": {                                        │   │
│  │     "conformidade": true,                              │   │
│  │     "alertas": []                                       │   │
│  │   }                                                     │   │
│  │ }                                                       │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

                    [🎯 Floating Action Menu]
```

---

## 🎨 Color Scheme

### Status Colors

#### ✅ Conforme (Compliant)
```css
background: green-50 (light) / green-950 (dark)
text: green-700 / green-400
border: green-200 / green-800
```

#### ❌ Não Conforme (Non-Compliant)
```css
background: red-50 (light) / red-950 (dark)
text: red-700 / red-400
border: red-200 / red-800
```

### Parameter Cards
```css
Wind Speed:    blue-50 / blue-950
Thrusters:     green-50 / green-950
DP Status:     purple-50 / purple-950
Data Display:  slate-50 / slate-900
```

### JSON Preview
```css
background: slate-900
text: green-400 (terminal-style)
```

---

## 🎯 Interactive Elements

### Buttons

#### Primary Action
```
┌──────────────────────────┐
│ ▶️ Executar ASOG Review │
└──────────────────────────┘
- Blue background
- White text
- Loading state support
```

#### Secondary Actions
```
┌───────────────────┐  ┌──────────┐
│ 💾 Baixar Relatório│  │ 🔄 Resetar│
└───────────────────┘  └──────────┘
- Outlined style
- Grey border
- Icon + text
```

### Badges

#### Status Badges
```
[✅ Dentro do Limite]  - Green
[❌ Acima do Limite]   - Red
[✅ Conforme]          - Green
[❌ Não Conforme]      - Red
```

#### Module Badges
```
[🛡️ Compliance ASOG]
[🌬️ Monitoramento Ambiental]
[⚙️ Status de Thrusters]
[🎯 Validação Automática]
```

---

## 📊 Data Visualization

### Parameter Display Cards

Each parameter is shown in a dedicated card with:
1. **Icon** - Visual identifier (Wind, Gear, Shield)
2. **Label** - Parameter name
3. **Value** - Large, bold display
4. **Status Badge** - Color-coded compliance status

### Layout Grid
```
Desktop:  3 columns (side-by-side)
Tablet:   2 columns
Mobile:   1 column (stacked)
```

---

## 🚨 Alert Display

### Non-Compliance Alerts

When validation fails, alerts are shown in dedicated cards:

```
┌────────────────────────────────────────────────┐
│ ⚠️ Velocidade do vento acima do limite ASOG.  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ ⚠️ Número de thrusters inoperantes excede     │
│    limite ASOG.                                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ ⚠️ Sistema DP fora do nível de alerta ASOG.   │
└────────────────────────────────────────────────┘
```

Style:
- Red icon (AlertTriangle)
- White background with red border
- Left-aligned text
- Stacked vertically

---

## 🎭 States

### Initial State
- Only control panel and ASOG limits visible
- "Executar ASOG Review" button enabled
- Other buttons hidden

### Processing State
- Button shows "Processando..."
- Button disabled
- Loading indicator

### Results State (Conforme)
- All sections visible
- Green checkmark icon
- "✅ Operação Conforme" message
- No alerts section
- Download and Reset buttons available

### Results State (Não Conforme)
- All sections visible
- Red warning icon
- "❌ Operação Não Conforme" message
- Alerts listed with details
- Download and Reset buttons available

---

## 📱 Responsive Design

### Desktop (1280px+)
- 3-column grid for parameters
- Full-width cards
- Floating action menu bottom-right

### Tablet (768px - 1279px)
- 2-column grid for parameters
- Adjusted card spacing
- Floating action menu visible

### Mobile (<768px)
- Single column layout
- Stacked cards
- Full-width buttons
- Touch-optimized spacing

---

## 🌙 Dark Mode Support

All components adapt to dark mode:
- Inverted background colors
- Adjusted text contrast
- Border color variations
- Maintained readability

---

## 🎯 Accessibility

### Features
- ✅ Semantic HTML structure
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Color contrast compliance
- ✅ Screen reader friendly
- ✅ Focus indicators

### Icons
All icons from Lucide React:
- Consistent size (h-4 w-4 or h-5 w-5)
- Proper spacing
- Semantic meaning

---

## 🔔 Toast Notifications

### Success
```
┌───────────────────────────┐
│ ✅ Operação Conforme      │
│ A operação está dentro    │
│ dos parâmetros ASOG.      │
└───────────────────────────┘
```

### Error
```
┌───────────────────────────┐
│ ⚠️ Operação Não Conforme  │
│ 2 alerta(s) identificado(s)│
└───────────────────────────┘
```

### Info
```
┌───────────────────────────┐
│ 📄 Relatório Baixado      │
│ O relatório ASOG foi      │
│ baixado com sucesso.      │
└───────────────────────────┘
```

---

## 🎬 User Flow

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ View ASOG Page  │
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│ Click Execute Review │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────┐
│ Processing...       │
│ - Collect Data      │
│ - Validate          │
│ - Generate Report   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Show Results        │
│ ✅ or ❌            │
└──────┬──────────────┘
       │
       ├──────┬──────────┬─────────┐
       │      │          │         │
       ▼      ▼          ▼         ▼
   Download  View     Reset    New Review
   Report    JSON      Data
```

---

## 🎉 Visual Highlights

### Module Header
- Large anchor icon (🧭)
- Gradient background (indigo)
- 4 capability badges
- Professional typography

### Card Design
- Rounded corners (lg)
- Subtle shadows
- Consistent padding
- Clear hierarchy

### Parameter Cards
- Large numeric values
- Color-coded backgrounds
- Icon integration
- Status badges

### JSON Display
- Monospace font
- Terminal-style colors
- Scrollable container
- Copy-friendly format

---

## 📸 Component Breakdown

### ModulePageWrapper
- Gradient blue background
- Full-height layout
- Responsive padding

### ModuleHeader
- Icon + Title + Description
- Badge array display
- Gradient overlay

### Card Components
- Header with title/description
- Content area with custom layout
- Consistent styling

### ModuleActionButton
- Floating position
- Action menu
- Quick actions
- Keyboard shortcuts (F5)

---

## ✨ Animation & Transitions

- Smooth button hover states
- Card hover effects
- Fade-in for results
- Loading indicators
- Toast slide-in animations

---

**Visual Design**: Modern, Clean, Professional  
**Component Library**: shadcn/ui  
**Icons**: Lucide React  
**Styling**: Tailwind CSS  
**Dark Mode**: ✅ Full Support  
**Responsive**: ✅ Mobile-First
