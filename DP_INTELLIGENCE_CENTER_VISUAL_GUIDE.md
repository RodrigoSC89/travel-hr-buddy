# DP Intelligence Center - Visual Guide

## 🎨 UI Layout Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Centro de Inteligência DP                        │
│         Análise de incidentes de Posicionamento Dinâmico com IA    │
│                                                          [Ingerir IMCA]│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  🔍 [Buscar incidentes...]  [▼ Classe DP]  [▼ Status]  [🔄 Atualizar]│
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total de     │   Críticos   │  Analisados  │  Pendentes   │
│ Incidentes   │              │              │              │
│     4        │      1       │      2       │      2       │
│  ⚠️ △       │   🔴 ●       │   ✅ ✓       │   🧠 ○       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌───────────────────────┬───────────────────────┬───────────────────────┐
│                       │                       │                       │
│  🔴 CRITICAL          │  🟠 HIGH              │  🟡 MEDIUM            │
│  [pending]            │  [analyzing]          │  [reviewed]           │
│                       │                       │                       │
│  Drive-off durante    │  Perda temporária de  │  Falha de redundância │
│  operação de ROV      │  posição durante      │  em sistema de        │
│                       │  drilling             │  referência           │
│  🚢 DSV Deep Ocean    │  🚢 Drillship Ocean   │  🚢 FPSO Petrobras    │
│  📍 Bacia Espírito    │  📍 Bacia de Santos   │  📍 Bacia de Campos   │
│  📅 22/08/2024        │  📅 01/10/2024        │  📅 15/09/2024        │
│                       │                       │                       │
│  Durante operação...  │  Durante operação...  │  Durante operações... │
│                       │                       │                       │
│  [🧠 Analisar com IA] │  [🧠 Analisar com IA] │  [👁️ Ver Análise IA] │
│                       │                       │                       │
└───────────────────────┴───────────────────────┴───────────────────────┘
```

## 🔍 AI Analysis Modal Layout

When clicking "Analisar com IA" or "Ver Análise IA":

```
┌─────────────────────────────────────────────────────────────────────┐
│  Análise IA - Incidente DP                                     [✕]  │
│  Drive-off durante operação de ROV                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Resumo] [Normas] [Causas] [Prevenção] [Ações]  ◄── Tabs          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ✅ Resumo Técnico                                          │   │
│  │                                                            │   │
│  │ O incidente envolveu uma perda súbita de posição durante  │   │
│  │ operações críticas de ROV em águas profundas...           │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

[Normas Tab View]
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Normas Relacionadas                                              │
│  • IMCA M 103 - Guidelines for the design and operation of DP...   │
│  • IMCA M 190 - Guidance on DP capability plots                     │
│  • IMO MSC.1/Circ.1580 - Guidelines for vessels with DP systems    │
│                                                                      │
│  🔗 Referências IMCA                                                 │
│  • IMCA M 103 - Section 4.2.3 - Zona de exclusão e alertas         │
│  • IMCA M 252 - Incident database and analysis procedures          │
└─────────────────────────────────────────────────────────────────────┘

[Causas Tab View]
┌─────────────────────────────────────────────────────────────────────┐
│  📌 Possíveis Causas Adicionais                                      │
│  • Fadiga operacional durante turno estendido                       │
│  • Falta de checklist duplo durante mudança de turno                │
│  • Ausência de alarme audível para zona de exclusão                 │
│  • Treinamento insuficiente em procedimentos críticos               │
└─────────────────────────────────────────────────────────────────────┘

[Prevenção Tab View]
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 Recomendações Preventivas                                        │
│  • Implementar sistema de dupla verificação em operações críticas   │
│  • Revisar matriz de autoridade e competência para DPOs             │
│  • Estabelecer alarmes redundantes para zonas de exclusão           │
│  • Conduzir simulações de cenários críticos mensalmente             │
└─────────────────────────────────────────────────────────────────────┘

[Ações Tab View]
┌─────────────────────────────────────────────────────────────────────┐
│  📄 Ações Corretivas Possíveis                                       │
│  • Revisar e atualizar procedimento de handover entre turnos        │
│  • Implementar checklist obrigatório pre-operação crítica           │
│  • Adicionar alarme visual e audível para zona de exclusão          │
│  • Realizar análise FMEA específica para operações de ROV           │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Severity Colors:
- 🟢 **LOW**: Green background (#dcfce7), Green text (#166534)
- 🟡 **MEDIUM**: Yellow background (#fef3c7), Yellow text (#854d0e)
- 🟠 **HIGH**: Orange background (#fed7aa), Orange text (#9a3412)
- 🔴 **CRITICAL**: Red background (#fee2e2), Red text (#991b1b)

### Status Colors:
- ⚪ **PENDING**: Gray background (#f3f4f6), Gray text (#1f2937)
- 🔵 **ANALYZING**: Blue background (#dbeafe), Blue text (#1e40af)
- 🟣 **ANALYZED**: Purple background (#f3e8ff), Purple text (#6b21a8)
- 🟢 **REVIEWED**: Green background (#dcfce7), Green text (#166534)
- ⚫ **CLOSED**: Slate background (#f1f5f9), Slate text (#334155)

### Analysis Sections Colors:
- **Resumo**: Blue theme (#dbeafe / #1e3a8a)
- **Normas**: Purple theme (#f3e8ff / #581c87)
- **Referências**: Indigo theme (#e0e7ff / #3730a3)
- **Causas**: Orange theme (#fed7aa / #7c2d12)
- **Prevenção**: Green theme (#dcfce7 / #166534)
- **Ações**: Red theme (#fee2e2 / #7f1d1d)

## 📱 Responsive Behavior

### Desktop (lg):
- 3 columns for incident cards
- Full width statistics cards in row
- Side-by-side filter controls

### Tablet (md):
- 2 columns for incident cards
- 2x2 grid for statistics
- Filter controls wrap to 2 rows

### Mobile (default):
- 1 column for incident cards
- Stacked statistics cards
- Full width filter controls

## 🎭 Interactive Elements

### Hover Effects:
- Incident cards: Shadow elevation on hover
- Buttons: Background color change
- Filter dropdowns: Border color change

### Loading States:
- Initial load: Centered spinner with "Carregando..."
- AI analysis: Modal spinner with "Processando análise com GPT-4..."

### Empty States:
- No incidents: Alert icon with "Nenhum incidente encontrado"
- No analysis: Brain icon with "Nenhuma análise disponível ainda"

## 🔔 Notifications

### Success Toast:
- ✅ "Análise IA concluída com sucesso" (green)

### Error Toast:
- ❌ "Erro ao carregar incidentes" (red)
- ❌ "Erro ao analisar incidente com IA" (red)

---

**Note**: This is a text-based representation. The actual UI uses Shadcn/UI components with Tailwind CSS for a modern, polished appearance.
