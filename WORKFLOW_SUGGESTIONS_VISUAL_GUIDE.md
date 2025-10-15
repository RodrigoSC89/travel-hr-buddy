# Workflow Suggestions Visual Guide

## 🎨 User Interface Overview

This guide shows exactly what the user will see when the automatic suggestions feature is active.

## 📍 Location in Application

**Path**: `/admin/workflows/:id` (Workflow Detail Page)

**Position**: Between the "Kanban Board" and "Informações" sections

## 🖼️ Visual Structure

### Workflow List Page (`/admin/workflows`)

```
┌──────────────────────────────────────────────────────────┐
│  🧠 Smart Workflows                                      │
│  Gerencie fluxos de trabalho inteligentes e automatizados│
├──────────────────────────────────────────────────────────┤
│  [Input: New Workflow Title] [Criar Button]             │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ Workflow 1 │ │ Workflow 2 │ │ Workflow 3 │           │
│  │  [Ativo]   │ │ [Rascunho] │ │  [Ativo]   │           │
│  │ 15/10/2025 │ │ 14/10/2025 │ │ 13/10/2025 │           │
│  │[Ver etapas]│ │[Ver etapas]│ │[Ver etapas]│           │
│  └────────────┘ └────────────┘ └────────────┘           │
└──────────────────────────────────────────────────────────┘

When user clicks "Criar" →
  1. Workflow is created in database
  2. seedSuggestionsForWorkflow() is called automatically
  3. 8 suggestions are inserted into workflow_ai_suggestions table
  4. User is redirected to workflow detail page
```

### Workflow Detail Page (`/admin/workflows/:id`)

```
┌──────────────────────────────────────────────────────────┐
│  [← Voltar] Meu Novo Workflow                   [Ativo]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🧱 Etapas do Workflow                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [Pendente] [Em Progresso] [Concluído]             │  │
│  │   (Kanban Board with Tasks)                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 💡 Sugestões da IA                              │    │
│  ├──────────────────────────────────────────────────┤    │
│  │                                                   │    │
│  │ ┌──────────────────────────────────────────────┐ │    │
│  │ │ ⚠️ Planejamento Inicial                      │ │    │
│  │ │ [Criar tarefa] [alta] [Template Histórico]   │ │    │
│  │ │ Recomenda-se definir objetivos claros e      │ │    │
│  │ │ mensuráveis para o workflow                   │ │    │
│  │ │ 👤 Sugerido para: Gestor do Projeto          │ │    │
│  │ └──────────────────────────────────────────────┘ │    │
│  │                                                   │    │
│  │ ┌──────────────────────────────────────────────┐ │    │
│  │ │ ⚠️ Revisão de Documentos                     │ │    │
│  │ │ [Criar tarefa] [alta] [Checklists]           │ │    │
│  │ │ Recomenda-se criar uma tarefa de validação   │ │    │
│  │ │ dos documentos técnicos e regulamentares     │ │    │
│  │ │ 👤 Sugerido para: Compliance Officer         │ │    │
│  │ └──────────────────────────────────────────────┘ │    │
│  │                                                   │    │
│  │ ┌──────────────────────────────────────────────┐ │    │
│  │ │ ⚠️ Aprovação de Recursos                     │ │    │
│  │ │ [Ajustar prazo] [média] [MMI]                │ │    │
│  │ │ Processos de aprovação financeira tipicamente│ │    │
│  │ │ requerem 3-5 dias úteis                      │ │    │
│  │ │ 👤 Sugerido para: Gerente Financeiro         │ │    │
│  │ └──────────────────────────────────────────────┘ │    │
│  │                                                   │    │
│  │ ... (5 more suggestions) ...                     │    │
│  │                                                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Informações                                      │    │
│  │ Status: Rascunho                                 │    │
│  │ Data de Criação: 15/10/2025 04:00:00            │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## 🎨 Visual Elements

### Color Coding by Criticidade

#### High Priority (alta) 🔴
```
┌────────────────────────────────────────┐
│ ⚠️ [Suggestion Title]                 │ ← Red border-left (4px)
│ [Type] [alta] [Source]                │ ← Red background (bg-red-50)
│ Suggestion content...                  │ ← Red triangle icon
│ 👤 Suggested for: Person Name         │
└────────────────────────────────────────┘
```

#### Medium Priority (média) 🟡
```
┌────────────────────────────────────────┐
│ ⚠️ [Suggestion Title]                 │ ← Yellow border-left (4px)
│ [Type] [média] [Source]               │ ← Yellow background (bg-yellow-50)
│ Suggestion content...                  │ ← Yellow circle icon
│ 👤 Suggested for: Person Name         │
└────────────────────────────────────────┘
```

#### Low Priority (baixa) 🔵
```
┌────────────────────────────────────────┐
│ ℹ️ [Suggestion Title]                 │ ← Blue border-left (4px)
│ [Type] [baixa] [Source]               │ ← Blue background (bg-blue-50)
│ Suggestion content...                  │ ← Blue info icon
│ 👤 Suggested for: Person Name         │
└────────────────────────────────────────┘
```

## 🏷️ Badge System

Each suggestion card displays 3 badges:

1. **Type Badge** (Outline)
   - `[Criar tarefa]`
   - `[Ajustar prazo]`
   - `[Trocar responsável]`

2. **Criticidade Badge** (Colored)
   - `[alta]` - Red destructive variant
   - `[média]` - Gray secondary variant
   - `[baixa]` - Gray secondary variant

3. **Source Badge** (Outline)
   - `[Template Histórico]`
   - `[Checklists]`
   - `[MMI]`
   - `[Audit Logs]`

## 📊 All 8 Default Suggestions

### 1. Planejamento Inicial
- **Icon**: ⚠️ (Red triangle)
- **Type**: Criar tarefa
- **Priority**: Alta
- **Source**: Template Histórico
- **Content**: Recomenda-se definir objetivos claros e mensuráveis para o workflow
- **Suggested For**: Gestor do Projeto

### 2. Revisão de Documentos
- **Icon**: ⚠️ (Red triangle)
- **Type**: Criar tarefa
- **Priority**: Alta
- **Source**: Checklists
- **Content**: Recomenda-se criar uma tarefa de validação dos documentos técnicos e regulamentares
- **Suggested For**: Compliance Officer

### 3. Aprovação de Recursos
- **Icon**: ⚠️ (Yellow circle)
- **Type**: Ajustar prazo
- **Priority**: Média
- **Source**: MMI
- **Content**: Processos de aprovação financeira tipicamente requerem 3-5 dias úteis
- **Suggested For**: Gerente Financeiro

### 4. Execução
- **Icon**: ⚠️ (Yellow circle)
- **Type**: Criar tarefa
- **Priority**: Média
- **Source**: Template Histórico
- **Content**: Recomenda-se estabelecer pontos de controle (checkpoints) semanais para acompanhamento
- **Suggested For**: Coordenador de Projeto

### 5. Validação de Qualidade
- **Icon**: ⚠️ (Red triangle)
- **Type**: Criar tarefa
- **Priority**: Alta
- **Source**: Audit Logs
- **Content**: Implementar revisão de qualidade antes da finalização do workflow
- **Suggested For**: Analista de Qualidade

### 6. Comunicação com Stakeholders
- **Icon**: ⚠️ (Yellow circle)
- **Type**: Criar tarefa
- **Priority**: Média
- **Source**: Template Histórico
- **Content**: Manter comunicação regular com todas as partes interessadas para transparência
- **Suggested For**: Gerente de Comunicação

### 7. Documentação Final
- **Icon**: ⚠️ (Red triangle)
- **Type**: Criar tarefa
- **Priority**: Alta
- **Source**: Checklists
- **Content**: Garantir que toda a documentação esteja completa e arquivada adequadamente
- **Suggested For**: Especialista em Documentação

### 8. Análise de Riscos
- **Icon**: ⚠️ (Red triangle)
- **Type**: Criar tarefa
- **Priority**: Alta
- **Source**: MMI
- **Content**: Identificar e mitigar riscos potenciais no início do workflow
- **Suggested For**: Analista de Riscos

## 🎯 User Flow

```
Step 1: User creates workflow
   ↓
Step 2: System seeds 8 suggestions automatically
   ↓
Step 3: User navigates to workflow detail page
   ↓
Step 4: System fetches and displays suggestions
   ↓
Step 5: User sees "💡 Sugestões da IA" section
   ↓
Step 6: User reviews suggestions
   ↓
Step 7: User uses suggestions as guidance to:
   - Create tasks
   - Assign responsibilities
   - Set deadlines
   - Plan workflow stages
```

## 🔄 Conditional Display

The suggestions panel only appears when:
```typescript
{suggestions.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>💡 Sugestões da IA</CardTitle>
    </CardHeader>
    ...
  </Card>
)}
```

If no suggestions exist, the section is hidden (no empty state shown).

## 🎨 Design Details

### Typography
- **Section Title**: Large, bold with Lightbulb icon
- **Suggestion Title**: Small, semibold (etapa)
- **Badges**: Extra small text (xs)
- **Content**: Small text with muted foreground
- **Responsible**: Extra small text with muted foreground

### Spacing
- **Card Padding**: p-4
- **Border Left**: border-l-4 (color-coded)
- **Gap Between Cards**: space-y-3
- **Icon-Content Gap**: gap-3
- **Badge Gap**: gap-1

### Icons
- **Lightbulb** (💡): Yellow, 20px (w-5 h-5)
- **AlertTriangle** (⚠️): Red, 20px - for high priority
- **AlertCircle** (⚠️): Yellow, 20px - for medium priority
- **Info** (ℹ️): Blue, 20px - for low priority
- **User** (👤): Gray, 12px (w-3 h-3)

## 📱 Responsive Behavior

The suggestions panel is fully responsive:
- **Desktop**: Full-width cards with all information
- **Tablet**: Stacked cards with wrapped badges
- **Mobile**: Compressed layout with preserved readability

## ✨ Accessibility

- Semantic HTML with proper heading hierarchy
- Color-coded with icons for color-blind users
- Proper contrast ratios for text and backgrounds
- Keyboard navigable (though not interactive yet)
- Screen reader friendly with descriptive labels

## 🎉 Summary

The UI provides an immediate, visually appealing way to see AI-powered suggestions. The color-coding helps users quickly identify priority items, while the badge system provides context about the suggestion type and source. The design is consistent with the rest of the application's design system using shadcn/ui components.
