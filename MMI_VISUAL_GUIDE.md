# MMI Jobs Panel - Visual Guide

## Component Preview

The MMI Jobs Panel displays maintenance job cards in a clean, responsive grid layout.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 MMI - Manutenção e Melhoria de Instalações                 │
│     Central de Jobs e Manutenção Inteligente                    │
└─────────────────────────────────────────────────────────────────┘

┌────────────── Central de Jobs Ativos ──────────────────────────┐
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ 🟡 Job Card 1            │  │ 🟡 Job Card 2            │   │
│  │                          │  │                          │   │
│  │ Title: Inspeção Sistema  │  │ Title: Manutenção        │   │
│  │        Hidráulico         │  │        Preventiva        │   │
│  │ Due: 2025-10-20          │  │ Due: 2025-10-25          │   │
│  │                          │  │                          │   │
│  │ Componente: Bomba        │  │ Componente: Motor        │   │
│  │ Embarcação: MV-Atlas     │  │ Embarcação: MV-Neptune   │   │
│  │                          │  │                          │   │
│  │ [Prioridade: Alta]       │  │ [Prioridade: Média]      │   │
│  │ [Status: Em andamento]   │  │ [Status: Agendado]       │   │
│  │ [💡 Sugestão IA]         │  │ [💡 Sugestão IA]         │   │
│  │                          │  │                          │   │
│  │ 📝 AI Recommendation:    │  │ 📝 AI Recommendation:    │   │
│  │ Verificar níveis de      │  │ Troca de filtros e       │   │
│  │ pressão...               │  │ verificação...           │   │
│  │                          │  │                          │   │
│  │ [Ver detalhes] [Executar]│  │ [Ver detalhes] [Executar]│   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ 🟡 Job Card 3            │  │ 🟡 Job Card 4            │   │
│  │                          │  │                          │   │
│  │ Title: Reparo Urgente    │  │ Title: Inspeção          │   │
│  │ Due: 2025-10-16          │  │ Due: 2025-11-05          │   │
│  │                          │  │                          │   │
│  │ Componente: Gerador #2   │  │ Componente: Combate      │   │
│  │ Embarcação: MV-Poseidon  │  │ Embarcação: MV-Titan     │   │
│  │                          │  │                          │   │
│  │ [Prioridade: Crítica]    │  │ [Prioridade: Baixa]      │   │
│  │ [Status: Aguardando]     │  │ [Status: Planejado]      │   │
│  │ [💡 Sugestão IA]         │  │                          │   │
│  │                          │  │                          │   │
│  │ 📝 IA detectou anomalia  │  │                          │   │
│  │ no sistema...            │  │                          │   │
│  │                          │  │                          │   │
│  │ [Ver detalhes] [Executar]│  │ [Ver detalhes] [Executar]│   │
│  └──────────────────────────┘  └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Color Scheme

- **Border**: Yellow accent (border-l-4 border-yellow-500) on left side of each card
- **Title**: Yellow-900 text for high contrast
- **Badges**: Outline style for Priority and Status, Secondary style for AI badge
- **Background**: Light gray (gray-50) for AI suggestion boxes
- **Shadows**: Subtle shadow-sm for card depth

## Responsive Behavior

### Desktop (md and up)
```
┌──────────────┐ ┌──────────────┐
│   Job Card   │ │   Job Card   │
└──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│   Job Card   │ │   Job Card   │
└──────────────┘ └──────────────┘
```
**2-column grid layout**

### Mobile
```
┌──────────────────┐
│    Job Card      │
└──────────────────┘
┌──────────────────┐
│    Job Card      │
└──────────────────┘
┌──────────────────┐
│    Job Card      │
└──────────────────┘
```
**Single column stack**

## Interactive Elements

### Buttons
- **"Ver detalhes"** - Primary button (blue background, white text)
- **"Executar Job"** - Outline button (white background, blue border)
- Both buttons have hover effects and scale transitions

### Badges
- **Priority Badge**: Shows Alta, Média, Baixa, or Crítica
- **Status Badge**: Shows Em andamento, Agendado, Aguardando, or Planejado
- **AI Badge**: 💡 icon with "Sugestão IA" text, only shown when AI suggestion exists

## Job Card Anatomy

```
┌─────────────────────────────────────┐
│ 🟡 (yellow left border)            │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Title (h3, semibold)   Due Date ││
│ │                                  ││
│ │ Componente: [Name]               ││
│ │ Embarcação: [Vessel]             ││
│ │                                  ││
│ │ [Priority] [Status] [AI Badge]  ││
│ │                                  ││
│ │ ┌────────────────────────────┐  ││
│ │ │ AI Suggestion Text         │  ││ (conditional)
│ │ └────────────────────────────┘  ││
│ │                                  ││
│ │ [Button 1]  [Button 2]          ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Sample Data Structure

```typescript
{
  id: "1",
  title: "Inspeção do Sistema Hidráulico",
  status: "Em andamento",
  priority: "Alta",
  due_date: "2025-10-20",
  component: {
    name: "Bomba Hidráulica Principal",
    asset: {
      name: "Sistema de Propulsão",
      vessel: "MV-Atlas"
    }
  },
  suggestion_ia: "Recomenda-se verificar níveis..."
}
```

## Key Features Visualization

### 1. Priority Levels
- 🔴 **Crítica** - Red urgency
- 🟠 **Alta** - High priority
- 🟡 **Média** - Medium priority
- 🟢 **Baixa** - Low priority

### 2. Status Types
- ⚡ **Em andamento** - Currently active
- 📅 **Agendado** - Scheduled
- ⏸️ **Aguardando** - Waiting
- 📋 **Planejado** - Planned

### 3. AI Integration
- 💡 Badge indicates AI-powered suggestions
- Recommendations displayed in highlighted box
- Helps prioritize and optimize maintenance tasks

## Access Information

**URL**: `/mmi`  
**Page Title**: MMI - Manutenção e Melhoria de Instalações  
**Component**: JobCards  
**Layout**: SmartLayout with sidebar and header

---

**Design System**: Tailwind CSS  
**Framework**: React + TypeScript  
**UI Library**: Radix UI (shadcn/ui)
