# DP Incidents Action Plan - Visual Guide

## 📸 UI Changes Overview

This document provides a visual description of the UI changes for the DP Incidents Action Plan feature.

## Before Implementation

### Original Incident Card
```
┌─────────────────────────────────────────────┐
│ Loss of Position Due to Gyro Drift   [CRIT]│
│ [DP Class 2] [Pendente]                     │
│ 2025-09-12                                   │
│                                              │
│ The vessel experienced a gradual loss...    │
│                                              │
│ Embarcação: DP Shuttle Tanker X            │
│ Local: Campos Basin                         │
│ Causa Raiz: Sensor drift not compensated   │
│                                              │
│ [gyro] [drive off] [sensor] [+1]           │
│                                              │
│ [📄 Relatório]  [🧠 Analisar IA]           │
└─────────────────────────────────────────────┘
```

## After Implementation

### Enhanced Incident Card (Collapsed)
```
┌─────────────────────────────────────────────┐
│ Loss of Position Due to Gyro Drift   [CRIT]│
│ [DP Class 2] [Pendente]                     │
│ 2025-09-12                                   │
│                                              │
│ The vessel experienced a gradual loss...    │
│                                              │
│ Embarcação: DP Shuttle Tanker X            │
│ Local: Campos Basin                         │
│ Causa Raiz: Sensor drift not compensated   │
│                                              │
│ [gyro] [drive off] [sensor] [+1]           │
│                                              │
│ [📄 Relatório] [🔧 Plano Ação] [🧠 Analisar]│
└─────────────────────────────────────────────┘
```

### Enhanced Incident Card (With Generated Action Plan)
```
┌─────────────────────────────────────────────┐
│ Loss of Position Due to Gyro Drift   [CRIT]│
│ [DP Class 2] [Analisado]                    │
│ 2025-09-12                                   │
│                                              │
│ The vessel experienced a gradual loss...    │
│                                              │
│ Embarcação: DP Shuttle Tanker X            │
│ Local: Campos Basin                         │
│ Causa Raiz: Sensor drift not compensated   │
│                                              │
│ [gyro] [drive off] [sensor] [+1]           │
│                                              │
│ [📄 Relatório] [🔧 Plano Ação] [🧠 Analisar]│
│                                              │
│ ▼ 📋 Plano de Ação Gerado                  │
│ ┌─────────────────────────────────────────┐ │
│ │ 🧠 Diagnóstico Técnico:                 │ │
│ │ O incidente foi causado por deriva não  │ │
│ │ compensada do giroscópio durante...     │ │
│ │                                          │ │
│ │ 🛠️ Causa Raiz Provável:                │ │
│ │ Falha na detecção automática de deriva  │ │
│ │ do sensor, combinada com...             │ │
│ │                                          │ │
│ │ ✅ Ações Corretivas:                    │ │
│ │ • Implementar sistema de monitoramento  │ │
│ │ • Calibrar sensores regularmente        │ │
│ │ • Treinar operadores em detecção        │ │
│ │                                          │ │
│ │ 🔄 Ações Preventivas:                   │ │
│ │ • Estabelecer protocolo de verificação  │ │
│ │ • Implementar alertas automáticos       │ │
│ │ • Realizar testes mensais               │ │
│ │                                          │ │
│ │ 📌 Responsável: │ ⏱️ Prazo:            │ │
│ │ DPO / Supervisor  │ 30 dias              │ │
│ │                                          │ │
│ │ 🔗 Normas Referenciadas:                │ │
│ │ [IMCA M103] [IMCA M117] [IMO MSC.645]  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Button States

### 1. Normal State
```
┌──────────────────┐
│ 🔧 Plano de Ação │
└──────────────────┘
```

### 2. Loading State (During Generation)
```
┌──────────────────┐
│ 🔧 Gerando...    │  [disabled, grayed out]
└──────────────────┘
```

### 3. After Generation
```
┌──────────────────┐
│ 🔧 Plano de Ação │  [returns to normal]
└──────────────────┘

[Action plan appears below in collapsible section]
```

## Color Scheme

### Severity Badges
- **Critical**: Red background (`bg-red-500`)
- **High**: Orange background (`bg-orange-500`)
- **Medium**: Blue background (`bg-blue-500`)
- **Low**: Green background (`bg-green-500`)

### Status Badges
- **Analisado**: Default variant (blue-ish)
- **Pendente**: Secondary variant (gray)

### DP Class Badges
- **DP-1**: Blue (`bg-blue-500`)
- **DP-2**: Yellow (`bg-yellow-500`)
- **DP-3**: Red (`bg-red-500`)

### Action Plan Display
- Background: Light slate (`bg-slate-100` in light mode, `bg-slate-800` in dark mode)
- Summary text: Blue accent (`text-blue-600` in light mode, `text-blue-400` in dark mode)
- Content: Regular text with semantic spacing

## Responsive Behavior

### Desktop (3 columns)
```
┌────────┐ ┌────────┐ ┌────────┐
│Incident│ │Incident│ │Incident│
│  Card  │ │  Card  │ │  Card  │
└────────┘ └────────┘ └────────┘
```

### Tablet (2 columns)
```
┌────────┐ ┌────────┐
│Incident│ │Incident│
│  Card  │ │  Card  │
└────────┘ └────────┘
```

### Mobile (1 column)
```
┌────────┐
│Incident│
│  Card  │
└────────┘
```

## User Interaction Flow

### Step 1: View Incident
User sees incident card with basic information and three buttons.

### Step 2: Click "Plano de Ação"
1. Button shows "Gerando..." text
2. Button becomes disabled (grayed out)
3. User cannot click other buttons during generation

### Step 3: Generation Complete
1. Button returns to normal "Plano de Ação" text
2. Status badge changes from "Pendente" to "Analisado"
3. Collapsible section appears below buttons

### Step 4: View Action Plan
1. User clicks the summary line "📋 Plano de Ação Gerado"
2. Details expand to show full structured action plan
3. User can collapse by clicking summary again

## Toast Notifications

### Success
```
┌─────────────────────────────────────┐
│ ✓ Plano de ação gerado com sucesso │
└─────────────────────────────────────┘
```

### Error
```
┌──────────────────────────────────────┐
│ ✗ Erro ao gerar plano de ação       │
│   Tente novamente mais tarde        │
└──────────────────────────────────────┘
```

## Accessibility Features

- **Semantic HTML**: Uses `<details>` and `<summary>` for collapsible content
- **Loading States**: Clear visual feedback during operations
- **Disabled States**: Prevents duplicate submissions
- **Color Contrast**: All text meets WCAG AA standards
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader**: Descriptive labels for all actions

## Dark Mode Support

All components automatically adapt to dark mode:
- Background colors use appropriate dark variants
- Text colors adjust for readability
- Badge colors maintain contrast
- Action plan display uses dark slate background

## Animation & Transitions

- Button hover effects
- Smooth card shadows on hover
- Collapsible section expands/collapses smoothly
- Toast notifications slide in from the side

## Grid Layout

Incidents are displayed in a responsive grid:
- **Large screens (lg)**: 3 columns
- **Medium screens (md)**: 2 columns
- **Small screens (default)**: 1 column

Each card has consistent spacing and hover effects for better UX.
