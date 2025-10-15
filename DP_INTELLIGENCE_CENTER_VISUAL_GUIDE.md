# DP Intelligence Center - Visual Guide

## 🎨 UI Components Overview

### 1. Statistics Dashboard (Top Section)
```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Statistics Dashboard                                             │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│ 📄 Total     │ 🚨 Critical  │ ✅ Analyzed  │ ⏰ Pending          │
│    4         │    1         │    2         │    2                 │
│ Registros    │ Alta priorid.│ Análise      │ Aguardando análise  │
└──────────────┴──────────────┴──────────────┴──────────────────────┘
```

### 2. Filters and Search Bar
```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Filtros e Busca                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  🔎 [Buscar por título, embarcação, local, tags...]                │
│                                                                      │
│  [Todas as Classes ▼]  [Todos os Status ▼]                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Incident Cards
```
┌─────────────────────────────────────────────────────────────────────┐
│ │ Perda de posição durante operação de perfuração     [High]       │
│ │ 15/09/2024                                                        │
│ │                                                                   │
│ │ Embarcação perdeu posicionamento durante operação crítica...     │
│ │                                                                   │
│ │ [🛡️ DP3] [Drillship Alpha] [Golfo do México]                     │
│ │ [propulsion] [critical] [weather]                                │
│ │                                                                   │
│ │ Causa Raiz: Falha no sistema de propulsão principal              │
│ │                                                                   │
│ │ [📄 Relatório]  [📈 Analisar com IA]                             │
└─────────────────────────────────────────────────────────────────────┘
```
*Border color: Red for Critical, Orange for High, Blue for Medium*

### 4. AI Analysis Modal (Tabbed Interface)
```
┌─────────────────────────────────────────────────────────────────────┐
│  📈 Análise IA – Perda de posição durante operação de perfuração    │
├─────────────────────────────────────────────────────────────────────┤
│  [📄 Resumo] [📚 Normas] [⚠️ Causas] [💡 Prevenção] [📋 Ações]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Resumo Técnico                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  A análise do incidente indica que a perda de posicionamento...     │
│  [AI-generated analysis content here]                               │
│                                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎭 Modal Tabs Breakdown

### Tab 1: 📄 Resumo (Summary)
- Technical overview of the incident
- Key findings from AI analysis
- Immediate observations

### Tab 2: 📚 Normas (Standards)
- Related IMCA guidelines (M103, M166, M190, M252)
- IMO regulations
- PEO-DP standards
- Brazilian maritime regulations (NRs)

### Tab 3: ⚠️ Causas (Causes)
- Root cause analysis
- Contributing factors
- Chain of events analysis
- 5 Whys methodology results

### Tab 4: 💡 Prevenção (Prevention)
- Preventive recommendations
- Best practices to avoid recurrence
- Training requirements
- System improvements
- Procedural changes

### Tab 5: 📋 Ações (Actions)
- Corrective actions to implement
- Priority ranking
- Responsible parties
- Implementation timeline
- Verification methods

## 🎨 Color Scheme

### Severity Indicators
- 🔴 **Critical**: Red border (`border-red-500`), Red badge
- 🟠 **High**: Orange border (`border-orange-500`), Orange badge
- 🔵 **Medium**: Blue border (`border-blue-500`), Yellow badge
- 🟢 **Low**: Blue border, Green badge

### Status Colors
- ✅ **Analyzed**: Green text and icon
- ⏰ **Pending**: Orange text and icon
- 📊 **Total**: Blue text and icon
- 🚨 **Critical**: Red text and icon

## 📱 Responsive Design

### Desktop (>1024px)
- 4-column statistics grid
- 2-column incident cards grid
- Full-width search and filters
- Large modal (max-width: 4xl)

### Tablet (768px - 1024px)
- 2-column statistics grid
- 1-column incident cards grid
- Stacked filters

### Mobile (<768px)
- 1-column layout throughout
- Scrollable modal content
- Touch-friendly buttons
- Simplified navigation

## 🔄 User Flow

### Viewing Incidents
1. User navigates to `/dp-intelligence`
2. Statistics dashboard loads immediately
3. Incidents display in grid (or load mock data if DB unavailable)
4. User can scroll through incident cards

### Filtering
1. User types in search box → Real-time filtering
2. User selects DP class → Cards update instantly
3. User selects status → Cards update instantly
4. Combinations work together (AND logic)
5. Empty state shows if no matches

### AI Analysis
1. User clicks "Analisar com IA" button
2. Modal opens with loading spinner
3. API call to `dp-intel-analyze` Edge Function
4. GPT-4 generates structured analysis (3-5 seconds)
5. Results populate 5 tabs
6. User navigates tabs to view different aspects
7. Success toast notification appears
8. Incidents refresh to show updated analysis status

## 🎯 Interactive Elements

### Buttons
- **"Relatório"**: Opens external link in new tab
- **"Analisar com IA"**: Triggers AI analysis flow
- **"Ver Análise IA"**: Opens modal with existing analysis

### Filters
- **Search Input**: Live search with debouncing
- **Class Dropdown**: Instant filter on change
- **Status Dropdown**: Instant filter on change

### Statistics Cards
- Display real-time counts
- Update when filters change
- Color-coded for quick scanning

## 🏗️ Component Structure

```
DPIntelligenceCenter
├── Statistics Dashboard
│   ├── Total Card
│   ├── Critical Card
│   ├── Analyzed Card
│   └── Pending Card
├── Filters Section
│   ├── Search Input
│   ├── DP Class Dropdown
│   └── Status Dropdown
├── Incidents Grid
│   └── Incident Cards (map)
│       ├── Header (title, date, severity badge)
│       ├── Summary text
│       ├── Badges (class, vessel, location, tags)
│       ├── Root cause
│       └── Action buttons
├── AI Analysis Modal
│   ├── Dialog Header
│   ├── Tabs Navigation
│   └── Tab Content Panels
│       ├── Summary Tab
│       ├── Standards Tab
│       ├── Causes Tab
│       ├── Prevention Tab
│       └── Actions Tab
└── Empty State (conditional)
```

## 💡 Best Practices Implemented

### UX
- ✅ Loading states with spinners
- ✅ Error messages with toast notifications
- ✅ Empty states with helpful messages
- ✅ Responsive design for all devices
- ✅ Accessible with keyboard navigation
- ✅ Color-coded visual hierarchy
- ✅ Clear call-to-action buttons

### Performance
- ✅ Lazy loading of page
- ✅ Code splitting via dynamic imports
- ✅ Efficient filtering algorithms
- ✅ Memoization where appropriate
- ✅ Optimized re-renders

### Accessibility
- ✅ Semantic HTML elements
- ✅ ARIA labels on interactive elements
- ✅ Keyboard-friendly navigation
- ✅ High contrast ratios
- ✅ Screen reader compatible

## 🎬 Animation States

### Loading State
```
┌─────────────────────────────────────────┐
│                                          │
│           ⚙️ (spinning)                  │
│     Analisando incidente com IA...      │
│                                          │
└─────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────┐
│  ✅ Análise concluída com sucesso       │
└─────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────┐
│  ❌ Erro ao analisar incidente          │
│     Tente novamente mais tarde          │
└─────────────────────────────────────────┘
```

## 📊 Data Flow Visualization

```
┌──────────┐
│  User    │
│  Action  │
└────┬─────┘
     │
     ├─── View Page ────────────► Load Incidents
     │                                    │
     ├─── Search/Filter ────────► Update View
     │                                    │
     └─── Click "Analisar" ────► Edge Function
                                          │
                                   ┌──────▼──────┐
                                   │  GPT-4 API  │
                                   └──────┬──────┘
                                          │
                                   ┌──────▼──────┐
                                   │  Analysis   │
                                   │  Result     │
                                   └──────┬──────┘
                                          │
                                   Display in Modal
                                          │
                                   Update DB (optional)
                                          │
                                   Refresh View
```

---

**Visual Design Version**: 1.0  
**Last Updated**: October 15, 2025  
**Status**: Production Ready ✅
