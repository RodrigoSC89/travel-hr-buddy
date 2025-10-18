# SGSO AI Action Plan Generator - Visual Summary

## 🎨 User Interface Overview

### Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧠 SGSO Dashboard - Plano IA Tab                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🧠  Gerador de Plano de Ação com IA                      │ │
│  │      Análise inteligente baseada em padrões IMCA/IMO      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Dados do Incidente                                       │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │                                                           │ │
│  │  Descrição do Incidente *                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Descreva o incidente em detalhes...                 │ │ │
│  │  │                                                       │ │ │
│  │  │                                                       │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  Categoria SGSO *          Nível de Risco *             │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐    │ │
│  │  │ [Erro humano ▼]      │  │ [Alto ▼]             │    │ │
│  │  └──────────────────────┘  └──────────────────────┘    │ │
│  │                                                           │ │
│  │  Causa Raiz *                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Descreva a causa raiz identificada...               │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  [🧠 Gerar Plano de Ação com IA]  [⚡ Carregar Exemplo] │ │
│  │                                    [🗑️ Limpar]          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ⚡ Plano de Ação Gerado                                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ✅ Ação Corretiva Imediata                               │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  Treinar operador e revisar o plano da operação antes    │ │
│  │  de nova execução.                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🔁 Ação Preventiva                                       │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  Implementar checklist de dupla checagem em todas as     │ │
│  │  operações críticas.                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🧠 Recomendação da IA                                    │ │
│  │  ───────────────────────────────────────────────────────  │ │
│  │  [URGENTE] Adotar simulações periódicas para operadores  │ │
│  │  com IA embarcada. Notificar ANP...                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Navigation Flow

```
Dashboard
    │
    ├─► SGSO Dashboard
    │       │
    │       ├─► Visão Geral
    │       ├─► 17 Práticas
    │       ├─► Riscos
    │       ├─► Incidentes
    │       ├─► Emergência
    │       ├─► Auditorias
    │       ├─► Treinamentos
    │       ├─► NCs
    │       ├─► 🧠 Plano IA ◄── NEW!
    │       ├─► Métricas
    │       └─► Painel SGSO
```

## 🎨 Color Scheme

### Header Card
```
┌─────────────────────────────────────┐
│ Background: Purple-50 to Blue-50    │
│ Border: Purple-200                  │
│ Icon: Purple-600                    │
│ Text: Gray-900                      │
└─────────────────────────────────────┘
```

### Input Form
```
┌─────────────────────────────────────┐
│ Background: White                   │
│ Border: Gray-200                    │
│ Labels: Gray-700                    │
│ Inputs: Standard                    │
└─────────────────────────────────────┘
```

### Result Cards

#### Corrective Action (Red)
```
┌─────────────────────────────────────┐
│ Background: Red-50 to Red-100       │
│ Border: Red-200                     │
│ Title: Red-700                      │
│ Text: Gray-800                      │
└─────────────────────────────────────┘
```

#### Preventive Action (Blue)
```
┌─────────────────────────────────────┐
│ Background: Blue-50 to Blue-100     │
│ Border: Blue-200                    │
│ Title: Blue-700                     │
│ Text: Gray-800                      │
└─────────────────────────────────────┘
```

#### AI Recommendation (Purple)
```
┌─────────────────────────────────────┐
│ Background: Purple-50 to Purple-100 │
│ Border: Purple-200                  │
│ Title: Purple-700                   │
│ Text: Gray-800                      │
└─────────────────────────────────────┘
```

## 🔄 User Interaction Flow

### Step 1: Initial State
```
User opens "Plano IA" tab
    │
    ├─► Empty form displayed
    ├─► No results shown
    └─► All buttons enabled
```

### Step 2: Form Filling
```
User fills form
    │
    ├─► Description entered
    ├─► Category selected
    ├─► Risk level selected
    └─► Root cause entered
```

### Step 3: Generation
```
User clicks "Gerar Plano de Ação"
    │
    ├─► Validation runs
    │       ├─► Pass → Continue
    │       └─► Fail → Show toast error
    │
    ├─► Loading state activated
    │       ├─► Button shows spinner
    │       └─► Buttons disabled
    │
    ├─► API/Mock called
    │       ├─► Success → Display results
    │       └─► Error → Show error toast
    │
    └─► Loading state deactivated
```

### Step 4: Results Display
```
Results shown
    │
    ├─► Success toast
    ├─► Three cards displayed
    │       ├─► Corrective Action (Red)
    │       ├─► Preventive Action (Blue)
    │       └─► AI Recommendation (Purple)
    │
    └─► User can review or clear
```

## 📱 Responsive Design

### Desktop (≥1024px)
```
┌───────────────────────────────────────┐
│  Form: Full width                     │
│  Categories: Side by side (2 columns) │
│  Buttons: Horizontal layout           │
│  Results: Full width cards            │
└───────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌───────────────────────────────────────┐
│  Form: Full width                     │
│  Categories: Side by side (2 columns) │
│  Buttons: Wrap to multiple rows       │
│  Results: Full width cards            │
└───────────────────────────────────────┘
```

### Mobile (<768px)
```
┌───────────────────────────────────────┐
│  Form: Full width                     │
│  Categories: Stacked (1 column)       │
│  Buttons: Stacked (1 column)          │
│  Results: Full width cards            │
└───────────────────────────────────────┘
```

## 🔄 State Management

### Component States

```typescript
State Variables:
├─► loading: boolean         // API call in progress
├─► description: string      // Incident description
├─► category: string         // SGSO category
├─► rootCause: string        // Root cause analysis
├─► riskLevel: string        // Risk level
└─► actionPlan: object|null  // Generated plan
```

### State Transitions

```
Initial State
    │
    ├─► Form Editing
    │       │
    │       ├─► Validation
    │       │       │
    │       │       ├─► Invalid → Show Error
    │       │       └─► Valid → Loading
    │       │
    │       └─► Loading
    │               │
    │               ├─► Success → Results Displayed
    │               └─► Error → Show Error
    │
    ├─► Load Example
    │       │
    │       └─► Form Populated
    │
    └─► Clear
            │
            └─► Initial State
```

## 📊 Data Flow Architecture

```
User Input
    │
    ├─► Form Validation
    │       │
    │       └─► Valid?
    │           │
    │           ├─► No → Toast Error
    │           │
    │           └─► Yes → Continue
    │
    ├─► Generate Action Plan
    │       │
    │       ├─► Check API Key
    │       │       │
    │       │       ├─► Available → GPT-4 API
    │       │       │       │
    │       │       │       ├─► Success → Return Plan
    │       │       │       └─► Error → Return null
    │       │       │
    │       │       └─► Not Available → Mock Mode
    │       │               │
    │       │               └─► Return Mock Plan
    │       │
    │       └─► Display Results
    │           │
    │           ├─► Success → Show Cards + Toast
    │           └─► Error → Show Error Toast
    │
    └─► User Reviews Plan
```

## 🧪 Testing Coverage

```
Unit Tests (12)
    │
    ├─► Mock Mode (1)
    │   └─► Generates valid plan
    │
    ├─► Categories (7)
    │   ├─► Erro humano
    │   ├─► Falha de sistema
    │   ├─► Problema de comunicação
    │   ├─► Não conformidade
    │   ├─► Fator externo
    │   ├─► Falha organizacional
    │   └─► Ausência manutenção
    │
    ├─► Risk Levels (2)
    │   ├─► Critical/High → Urgent markers
    │   └─► Moderate/Low → Standard
    │
    └─► Edge Cases (2)
        ├─► Unknown category
        └─► Default response
```

## 🎭 Animation & Feedback

### Loading States
```
Button States:
├─► Idle: "🧠 Gerar Plano de Ação com IA"
└─► Loading: "⏳ Gerando Plano..." (spinner)
```

### Toast Notifications
```
Success:
├─► "Plano de ação gerado com sucesso"
└─► "A IA analisou o incidente..."

Error:
├─► "Erro ao gerar plano"
└─► "Não foi possível gerar..."

Info:
├─► "Exemplo carregado"
└─► "Formulário limpo"
```

## 📈 Performance Metrics

```
Operation Modes:
├─► Mock Mode
│   ├─► Response Time: < 100ms
│   ├─► API Calls: 0
│   └─► Cost: $0
│
└─► Production Mode
    ├─► Response Time: 2-5 seconds
    ├─► API Calls: 1 per generation
    └─► Cost: ~$0.01-0.05 per call
```

## 🎯 Accessibility Features

```
ARIA Labels:
├─► Form inputs properly labeled
├─► Select dropdowns accessible
├─► Button states announced
└─► Error messages read by screen readers

Keyboard Navigation:
├─► Tab order logical
├─► Enter submits form
├─► Escape closes dropdowns
└─► Arrow keys navigate options
```

## 🔐 Security Considerations

```
Data Security:
├─► API keys in environment variables
├─► No sensitive data in client
├─► Input validation on all fields
└─► Error messages sanitized

API Security:
├─► dangerouslyAllowBrowser (documented)
├─► Rate limiting (OpenAI side)
├─► Error handling prevents leaks
└─► Mock mode for development
```

## 📋 Quick Reference Icons

| Icon | Meaning |
|------|---------|
| 🧠 | AI/Intelligence |
| ✅ | Corrective Action |
| 🔁 | Preventive Action |
| ⚡ | Quick Action |
| 🗑️ | Delete/Clear |
| ⏳ | Loading |
| 🎯 | Target/Goal |
| 📊 | Data/Analytics |
| 🔒 | Security |
| ✓ | Success |
| ⚠️ | Warning |
| 🚨 | Urgent |

## 🎓 Example Scenarios

### Scenario 1: Human Error - High Risk
```
Input: DP coordinates error during maneuver
Category: Erro humano
Risk: Alto
Result: Immediate training + checklist implementation
```

### Scenario 2: System Failure - Critical
```
Input: DP system failure during critical operation
Category: Falha de sistema
Risk: Crítico
Result: System isolation + ANP notification
```

### Scenario 3: Communication Issue - Moderate
```
Input: Bridge-engine room communication failure
Category: Problema de comunicação
Risk: Moderado
Result: Team meeting + protocol standardization
```
