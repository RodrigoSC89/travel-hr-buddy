# DP Intelligence Center - Visual Guide

## 🎨 UI Component Layouts

This document provides detailed visual descriptions of all UI components in the DP Intelligence Center.

---

## 📊 Statistics Dashboard

**Location:** Top of page, below header

**Layout:** 4-column grid (responsive: 2 columns on tablet, 1 column on mobile)

### Card 1: Total de Incidentes
```
┌─────────────────────────┐
│ Total de Incidentes     │
│                         │
│        4                │
│                         │
└─────────────────────────┘
```
- **Text:** Gray muted color
- **Number:** Large, bold, black
- **Purpose:** Shows total count of all incidents
- **Interactive:** No

### Card 2: Analisados
```
┌─────────────────────────┐
│ Analisados              │
│                         │
│   2        [Analisados] │
│             Green Badge │
└─────────────────────────┘
```
- **Text:** Gray muted color
- **Number:** Large, bold, black
- **Badge:** Green background, white text
- **Purpose:** Shows count of analyzed incidents
- **Interactive:** Yes (click to filter)
- **Hover:** Shadow appears

### Card 3: Pendentes
```
┌─────────────────────────┐
│ Pendentes               │
│                         │
│   2        [Pendentes]  │
│            Yellow Badge │
└─────────────────────────┘
```
- **Text:** Gray muted color
- **Number:** Large, bold, black
- **Badge:** Yellow background, white text
- **Purpose:** Shows count of pending incidents
- **Interactive:** Yes (click to filter)
- **Hover:** Shadow appears

### Card 4: Críticos
```
┌─────────────────────────┐
│ Críticos                │
│                         │
│   1        [Críticos]   │
│              Red Badge  │
└─────────────────────────┘
```
- **Text:** Gray muted color
- **Number:** Large, bold, black
- **Badge:** Red background, white text
- **Purpose:** Shows count of critical severity incidents
- **Interactive:** No

---

## 🔍 Search and Filter Section

**Layout:** Single card with search input and filter buttons

```
┌────────────────────────────────────────────────────────────┐
│  🔍 [Buscar por título, embarcação, local ou tags...    ] │
│                                                            │
│     [DP-1]  [DP-2]  [DP-3]  [🔽 Limpar]                  │
│                                                            │
│  Mostrando 2 de 4 incidentes (DP Class 2)                │
└────────────────────────────────────────────────────────────┘
```

### Components:
1. **Search Input**
   - Full width with search icon on left
   - Placeholder: "Buscar por título, embarcação, local ou tags..."
   - Real-time filtering

2. **Filter Buttons**
   - **DP-1:** Blue outline when inactive, solid blue when active
   - **DP-2:** Blue outline when inactive, solid blue when active
   - **DP-3:** Blue outline when inactive, solid blue when active
   - **Limpar:** Gray outline, appears only when filters active

3. **Filter Count**
   - Shows when search or filters active
   - Format: "Mostrando X de Y incidentes"
   - Includes active filter info in parentheses

---

## 🎴 Incident Card

**Layout:** 3-column grid on desktop, responsive

```
┌────────────────────────────────────────────────┐
│ Loss of Position Due to Gyro Drift  [critical]│
│                                      Red Badge │
│ [DP Class 2]  [Pendente]                      │
│  Yellow       Secondary                        │
│                                                │
│ 2025-09-12                                     │
│                                                │
│ The vessel experienced a gradual loss of      │
│ position due to undetected gyro drift...      │
│                                                │
│ Embarcação: DP Shuttle Tanker X               │
│ Local: Campos Basin                           │
│ Causa Raiz: Sensor drift not compensated      │
│                                                │
│ [gyro] [drive off] [sensor] [+1]              │
│                                                │
│ [📄 Relatório]  [🧠 Analisar IA]              │
└────────────────────────────────────────────────┘
```

### Card Components:

1. **Header Section**
   - **Title:** Bold, 16px font
   - **Severity Badge:** Right-aligned, color-coded:
     - Critical: Red (bg-red-500)
     - High: Orange (bg-orange-500)
     - Medium: Blue (bg-blue-500)
     - Low: Green (bg-green-500)

2. **Badge Row**
   - **DP Class Badge:** Color-coded by class
     - DP-1: Blue
     - DP-2: Yellow
     - DP-3: Red
   - **Status Badge:** 
     - Analisado: Green
     - Pendente: Gray secondary

3. **Date**
   - Small gray text
   - Format: YYYY-MM-DD

4. **Summary**
   - 3-line clamp (truncated with ellipsis)
   - Regular text size

5. **Details Section**
   - **Embarcação:** Vessel name
   - **Local:** Location
   - **Causa Raiz:** Root cause
   - Small font, label in bold

6. **Tags**
   - Secondary badges
   - First 3 tags shown
   - "+N" badge for overflow

7. **Action Buttons**
   - **Relatório:** Outline style, file icon
   - **Analisar IA:** Primary style, brain icon
   - Equal width (flex-1)

---

## 💬 AI Analysis Modal

**Layout:** Full-screen modal with tabs

```
┌──────────────────────────────────────────────────────────────┐
│  Análise IA – Loss of Position Due to Gyro Drift         [X]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [📄 Resumo] [📚 Normas] [⚠️ Causas] [💡 Prevenção] [📋 Ações]│
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📄 Resumo Técnico                                   │    │
│  │                                                     │    │
│  │ This incident demonstrates the critical importance │    │
│  │ of continuous monitoring and validation of gyro    │    │
│  │ compass readings during DP operations...           │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Modal Components:

1. **Header**
   - Title: "Análise IA – [Incident Title]"
   - Close button (X) in top-right

2. **Tab Navigation**
   - 5 tabs with icons and labels
   - Active tab has blue underline
   - Grid layout: 5 equal columns

3. **Tab Content Panels**

   **📄 Resumo (Summary)**
   ```
   ┌────────────────────────────────────┐
   │ 📄 Resumo Técnico                  │
   │                                    │
   │ [AI-generated technical summary]   │
   │                                    │
   └────────────────────────────────────┘
   ```

   **📚 Normas (Standards)**
   ```
   ┌────────────────────────────────────┐
   │ 📚 Normas Relacionadas             │
   │     (IMCA/IMO/PEO-DP)             │
   │                                    │
   │ - IMCA M 103                       │
   │ - IMCA M 178                       │
   │ - IMO MSC Circ 645                 │
   │                                    │
   └────────────────────────────────────┘
   ```

   **⚠️ Causas (Causes)**
   ```
   ┌────────────────────────────────────┐
   │ ⚠️ Análise de Causas Raiz          │
   │                                    │
   │ Primary Cause: ...                 │
   │ Contributing Factors: ...          │
   │                                    │
   └────────────────────────────────────┘
   ```

   **💡 Prevenção (Prevention)**
   ```
   ┌────────────────────────────────────┐
   │ 💡 Recomendações de Prevenção      │
   │                                    │
   │ 1. Regular calibration checks      │
   │ 2. Enhanced monitoring systems     │
   │ 3. Crew training programs          │
   │                                    │
   └────────────────────────────────────┘
   ```

   **📋 Ações (Actions)**
   ```
   ┌────────────────────────────────────┐
   │ 📋 Ações Corretivas                │
   │                                    │
   │ Immediate: ...                     │
   │ Short-term: ...                    │
   │ Long-term: ...                     │
   │                                    │
   └────────────────────────────────────┘
   ```

---

## 🔄 Loading States

### Initial Page Load
```
┌──────────────────────────────────┐
│                                  │
│        ⟳ (spinning)              │
│                                  │
│   Carregando incidentes...       │
│                                  │
└──────────────────────────────────┘
```

### AI Analysis Loading
```
┌──────────────────────────────────┐
│  Análise IA – [Title]        [X] │
├──────────────────────────────────┤
│                                  │
│        ⟳ (spinning)              │
│                                  │
│   Analisando incidente com IA... │
│                                  │
└──────────────────────────────────┘
```

---

## 📭 Empty States

### No Incidents Found
```
┌────────────────────────────────────────┐
│                                        │
│          ⚠️ (large icon)              │
│                                        │
│    Nenhum incidente encontrado        │
│                                        │
│    Tente ajustar os filtros de busca  │
│                                        │
└────────────────────────────────────────┘
```

### No Results for Search
```
┌────────────────────────────────────────┐
│                                        │
│          ⚠️ (large icon)              │
│                                        │
│    Nenhum incidente encontrado        │
│                                        │
│    Tente ajustar os filtros de busca  │
│                                        │
└────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
- Statistics: 4 columns
- Incident cards: 3 columns
- Search: Full width with inline buttons
- Modal: 80% width, centered

### Tablet (768-1023px)
- Statistics: 2 columns (2 rows)
- Incident cards: 2 columns
- Search: Full width with inline buttons
- Modal: 90% width, centered

### Mobile (<768px)
- Statistics: 1 column (4 rows)
- Incident cards: 1 column
- Search: Stacked (input above buttons)
- Modal: Full width

---

## 🎨 Color Palette

### Severity Colors
- **Critical:** `bg-red-500` (#EF4444)
- **High:** `bg-orange-500` (#F97316)
- **Medium:** `bg-blue-500` (#3B82F6)
- **Low:** `bg-green-500` (#10B981)

### DP Class Colors
- **DP-1:** `bg-blue-500` (#3B82F6)
- **DP-2:** `bg-yellow-500` (#EAB308)
- **DP-3:** `bg-red-500` (#EF4444)

### Status Colors
- **Analyzed:** Green badge (`bg-green-500`)
- **Pending:** Yellow badge (`bg-yellow-500`)

### UI Colors
- **Background:** White / Dark gray (dark mode)
- **Card background:** Gray-50 / Gray-900 (dark mode)
- **Text primary:** Black / White
- **Text secondary:** Gray-600 / Gray-400
- **Borders:** Gray-200 / Gray-700

---

## 🖱️ Interactive Elements

### Hover Effects
- **Cards:** Shadow increases on hover
- **Buttons:** Slight opacity change
- **Stat cards:** Shadow appears when clickable

### Click Actions
- **Stat cards:** Toggle status filter
- **DP-1/2/3 buttons:** Toggle class filter
- **Limpar button:** Clear all filters
- **Relatório button:** Open IMCA report in new tab
- **Analisar IA button:** Open AI analysis modal
- **Modal close (X):** Close modal
- **Tab buttons:** Switch tab content

### Focus States
- All interactive elements have focus ring for accessibility
- Tab navigation supported throughout

---

## ♿ Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modal
- Arrow keys for tab navigation

### Screen Reader Support
- Semantic HTML elements
- ARIA labels on icons
- Role attributes on interactive elements
- Focus management in modal

### Visual Indicators
- High contrast colors
- Clear focus indicators
- Loading states with text
- Error messages visible

---

## 📐 Layout Specifications

### Spacing
- Container padding: 24px (p-6)
- Card gap: 16px (gap-4)
- Internal card padding: 16-24px
- Button gap: 8px (gap-2)

### Typography
- Title: 24px, bold (text-2xl font-bold)
- Card title: 16px, bold (text-base font-semibold)
- Body text: 14px (text-sm)
- Labels: 12px (text-xs)
- Numbers: 24px, bold (text-2xl font-bold)

### Borders
- Card radius: 8px (rounded-lg)
- Badge radius: 9999px (rounded-full)
- Button radius: 6px (rounded-md)

---

**Version:** 2.0.0  
**Created:** October 15, 2025  
**Updated:** Based on implemented component
