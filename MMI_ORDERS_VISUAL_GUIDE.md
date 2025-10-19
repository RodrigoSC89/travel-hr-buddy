# MMI Orders Management - Visual Guide

## 📱 Page Layout: `/admin/mmi/orders`

```
┌────────────────────────────────────────────────────────────────┐
│ 🛠️ Ordens de Serviço (MMI)                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Embarcação: Navio Alpha                                    │ │
│ │ Sistema: Sistema Hidráulico                                │ │
│ │ Prioridade: alta (orange color)                            │ │
│ │ Status: pendente (gray color)                              │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ Verificação de vazamento no sistema hidráulico         │ │ │
│ │ │ principal. Necessário inspeção completa dos selos      │ │ │
│ │ │ e válvulas.                                            │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ │                                                            │ │
│ │ [✅ Concluir] [🚧 Em Andamento] [📄 Exportar PDF]         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Embarcação: Navio Beta                                     │ │
│ │ Sistema: Motor Diesel                                      │ │
│ │ Prioridade: crítica (red color, bold)                      │ │
│ │ Status: em andamento (blue color, bold)                    │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ Manutenção preventiva do motor principal. Troca de     │ │ │
│ │ │ filtros, verificação de injetores e análise de óleo.   │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ │                                                            │ │
│ │ [✅ Concluir] [🚧 Em Andamento] (disabled) [📄 Exportar]  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Embarcação: Navio Gamma                                    │ │
│ │ Sistema: Sistema Elétrico                                  │ │
│ │ Prioridade: média (yellow color)                           │ │
│ │ Status: pendente (gray color)                              │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ Substituição de painéis elétricos obsoletos. Inclui    │ │ │
│ │ │ atualização do sistema de controle.                    │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ │                                                            │ │
│ │ [✅ Concluir] [🚧 Em Andamento] [📄 Exportar PDF]         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Embarcação: Navio Alpha                                    │ │
│ │ Sistema: Bomba de Água                                     │ │
│ │ Prioridade: baixa (green color)                            │ │
│ │ Status: concluída (green color, bold)                      │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ Revisão geral da bomba de água doce. Todos os          │ │ │
│ │ │ componentes verificados e aprovados.                   │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ │                                                            │ │
│ │ [✅ Concluir] (disabled) [🚧 Em Andamento] [📄 Exportar]  │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Coding

### Priority Colors
- **Crítica**: 🔴 Red (text-red-600 font-bold)
- **Alta**: 🟠 Orange (text-orange-600 font-semibold)
- **Média**: 🟡 Yellow (text-yellow-600)
- **Baixa**: 🟢 Green (text-green-600)

### Status Colors
- **Concluída**: 🟢 Green (text-green-600 font-semibold)
- **Em andamento**: 🔵 Blue (text-blue-600 font-semibold)
- **Pendente**: ⚪ Gray (text-gray-600)
- **Cancelada**: 🔴 Red (text-red-600)

## 🔘 Button States

### ✅ Concluir (Complete)
- **Enabled**: When status is NOT "concluída"
- **Disabled**: When status is "concluída"
- **Action**: Updates status to "concluída", sets completed_at timestamp
- **Style**: variant="success", size="sm"

### 🚧 Em Andamento (In Progress)
- **Enabled**: When status is NOT "em andamento"
- **Disabled**: When status is "em andamento"
- **Action**: Updates status to "em andamento"
- **Style**: variant="warning", size="sm"

### 📄 Exportar PDF (Export PDF)
- **Always Enabled**
- **Action**: Downloads order details as text file
- **Style**: variant="secondary", size="sm"

## 📄 Export Format

When clicking "Exportar PDF", a text file is downloaded with this content:

```
ORDEM DE SERVIÇO (MMI)

Embarcação: Navio Alpha
Sistema: Sistema Hidráulico
Prioridade: alta
Status: pendente
Criada em: 19/10/2025

Descrição:
Verificação de vazamento no sistema hidráulico principal.
Necessário inspeção completa dos selos e válvulas.
```

## 🔄 User Workflow

1. **View Orders**: User navigates to `/admin/mmi/orders`
2. **See Details**: All orders are displayed with color-coded priorities and statuses
3. **Update Status**:
   - Click "🚧 Em Andamento" to mark order as in progress
   - Click "✅ Concluir" to mark order as completed
   - Button becomes disabled after clicking to prevent duplicate updates
4. **Export**: Click "📄 Exportar PDF" to download order details

## 📱 Responsive Design

- Cards stack vertically on all screen sizes
- Buttons wrap on smaller screens
- Text remains readable with appropriate spacing
- Padding adjusts for mobile devices

## 🎯 Key Features

1. **Real-time Updates**: Status changes reflect immediately in the UI
2. **Button Management**: Buttons disable automatically based on current status
3. **Visual Feedback**: Color coding helps quickly identify priority and status
4. **Error Handling**: Graceful error messages if API calls fail
5. **Loading State**: Shows "Carregando..." while fetching data
6. **Empty State**: Shows helpful message when no orders exist

## 🚀 Performance

- Lazy-loaded route for faster initial page load
- Efficient state management with React hooks
- Optimized database queries with indexes
- Minimal re-renders with proper state updates
