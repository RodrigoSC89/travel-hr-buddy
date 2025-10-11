# Restore Report Logs Page - Visual Guide

## 🎨 Page Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  🕐 Logs de Relatórios de Restore                                    │
│  Visualize e gerencie logs de execução do relatório automático       │
│  diário de restore                                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  Filtros                                                               │
│  ┌────────────────────┬──────────────────┬──────────────────┐         │
│  │     Status         │  Data Inicial    │   Data Final     │         │
│  │  [____________]    │  [__/__/____]    │  [__/__/____]    │         │
│  └────────────────────┴──────────────────┴──────────────────┘         │
│                                                                        │
│  [📥 Exportar CSV]  [📥 Exportar PDF]                                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┐
│   Total de Logs      │      Sucessos        │       Erros          │
│                      │                      │                      │
│       ● 123          │       ✓ 120         │       ✗ 3           │
│                      │                      │                      │
└──────────────────────┴──────────────────────┴──────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  Registros de Execução                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  ✓ [Sucesso]  🕐 11/10/2025 18:51:16                           │ │
│  │  Relatório enviado com sucesso.                                 │ │
│  │  Acionado por: automated                                        │ │
│  │                                                                  │ │
│  ├──────────────────────────────────────────────────────────────────┤ │
│  │                                                                  │ │
│  │  ✗ [Erro]  🕐 11/10/2025 16:45:32                              │ │
│  │  Falha no envio do e-mail                                       │ │
│  │  ▶ Detalhes do Erro                                             │ │
│  │  Acionado por: automated                                        │ │
│  │                                                                  │ │
│  ├──────────────────────────────────────────────────────────────────┤ │
│  │                                                                  │ │
│  │  ⚠ [Crítico]  🕐 11/10/2025 14:20:15                           │ │
│  │  Erro crítico na função                                         │ │
│  │  ▼ Detalhes do Erro                                             │ │
│  │  ┌────────────────────────────────────────────────────────────┐ │ │
│  │  │ {"error": "Connection timeout",                            │ │ │
│  │  │  "code": "ETIMEDOUT",                                      │ │ │
│  │  │  "stack": "..."}                                           │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  │  Acionado por: automated                                        │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  Página 1 de 13 (123 registros)     [◀ Anterior]  [Próxima ▶]       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Breakdown

### 1. Header Section
```
┌────────────────────────────────────────┐
│ 🕐 Logs de Relatórios de Restore     │
│ Visualize e gerencie logs...          │
└────────────────────────────────────────┘
```
- **Icon**: Clock (🕐) - represents time-based logs
- **Title**: Main page heading
- **Description**: Brief explanation of purpose

### 2. Filters Card
```
┌────────────────────────────────────────┐
│ Filtros                                │
│ ┌──────┬──────┬──────┐                │
│ │Status│Start │ End  │                │
│ └──────┴──────┴──────┘                │
│ [CSV] [PDF]                            │
└────────────────────────────────────────┘
```
- **Status Filter**: Text input for status matching
- **Date Filters**: Date pickers for range selection
- **Export Buttons**: CSV and PDF download actions

### 3. Summary Cards (Metrics)
```
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Total: 123 │ │ Success:120│ │ Errors: 3  │
│     ●      │ │     ✓      │ │     ✗      │
└────────────┘ └────────────┘ └────────────┘
```
- **Total**: Blue icon, all logs count
- **Success**: Green checkmark, success count
- **Errors**: Red X, error + critical count

### 4. Log Entry Cards
```
┌────────────────────────────────────────┐
│ [Status Badge] 🕐 Timestamp            │
│ Message text here                      │
│ ▶ Detalhes do Erro (expandable)       │
│ Acionado por: automated                │
└────────────────────────────────────────┘
```
- **Status Badge**: Color-coded pill
- **Timestamp**: Formatted date/time
- **Message**: Human-readable text
- **Error Details**: Collapsible section
- **Trigger**: Who/what triggered execution

### 5. Pagination Controls
```
┌────────────────────────────────────────┐
│ Página 1 de 13 (123 registros)        │
│         [◀ Anterior]  [Próxima ▶]     │
└────────────────────────────────────────┘
```
- **Page Info**: Current page / total pages
- **Record Count**: Total filtered records
- **Navigation**: Previous/Next buttons

---

## 🎨 Color Scheme

### Status Badges

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| **Sucesso** | `bg-green-600` | White | None |
| **Erro** | `bg-red-600` | White | None |
| **Crítico** | `bg-red-700` | White | None |
| **Other** | `bg-gray-500` | White | None |

### Icons

| Icon | Color | Usage |
|------|-------|-------|
| ✓ CheckCircle | Green (`text-green-600`) | Success status |
| ✗ XCircle | Red (`text-red-600`) | Error status |
| ⚠ AlertTriangle | Dark Red (`text-red-700`) | Critical status |
| ● Activity | Gray (`text-gray-600`) | Unknown status |
| 🕐 Clock | Gray | Timestamps |
| 📥 Download | Default | Export buttons |
| ⏳ Loader2 | Primary | Loading spinner |

---

## 📱 Responsive Design

### Desktop (>768px)
```
[Filter 1] [Filter 2] [Filter 3]
[Card 1]   [Card 2]   [Card 3]
[Log entries in full width]
```

### Mobile (<768px)
```
[Filter 1]
[Filter 2]
[Filter 3]
[Card 1]
[Card 2]
[Card 3]
[Log entries]
```

---

## 🔄 State Indicators

### Loading State
```
┌────────────────────────────────────────┐
│                                        │
│         ⏳ Loading...                  │
│                                        │
└────────────────────────────────────────┘
```

### Empty State
```
┌────────────────────────────────────────┐
│                                        │
│  Nenhum log encontrado com os         │
│  filtros aplicados.                    │
│                                        │
└────────────────────────────────────────┘
```

### Exporting State
```
┌────────────────────────┐
│ ⏳ Exportando...       │
└────────────────────────┘
```

---

## 🎬 User Interactions

### 1. Filter by Status
```
User Action:
┌────────────┐
│ [error__]  │ ← Types "error"
└────────────┘

Result:
┌────────────────────────┐
│ ✗ Erro - Log 1         │
│ ⚠ Crítico - Log 2      │
└────────────────────────┘
```

### 2. Export to CSV
```
User Action:
┌────────────────────┐
│ [📥 Exportar CSV]  │ ← Clicks
└────────────────────┘

Result:
1. Toast notification: "Exportação concluída"
2. File downloads: "restore_report_logs_2025-10-11_18-51-16.csv"
```

### 3. View Error Details
```
User Action:
┌─────────────────────────┐
│ ▶ Detalhes do Erro      │ ← Clicks
└─────────────────────────┘

Expands to:
┌─────────────────────────┐
│ ▼ Detalhes do Erro      │
│ ┌─────────────────────┐ │
│ │ Error stack trace   │ │
│ │ JSON details        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 4. Navigate Pages
```
User Action:
┌─────────────┐
│ [Próxima ▶] │ ← Clicks
└─────────────┘

Result:
- Page increments: 1 → 2
- New logs load
- Scroll resets to top
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│  React App   │
└──────┬───────┘
       │
       │ 1. Fetch logs
       ▼
┌──────────────┐
│  Supabase    │
│   Client     │
└──────┬───────┘
       │
       │ 2. Query
       ▼
┌──────────────────────┐
│  restore_report_logs │
│     (Database)       │
└──────┬───────────────┘
       │
       │ 3. Return data
       ▼
┌──────────────┐
│   UI State   │
│  (useState)  │
└──────┬───────┘
       │
       │ 4. Render
       ▼
┌──────────────┐
│  DOM/Screen  │
└──────────────┘
```

---

## 🔍 Filter Logic Flow

```
All Logs (123)
     │
     ▼
Status Filter (if provided)
     │
     ├─── Matches → Continue
     └─── No match → Exclude
     │
     ▼
Date Range Filter (if provided)
     │
     ├─── In range → Include
     └─── Out of range → Exclude
     │
     ▼
Filtered Logs (15)
     │
     ▼
Pagination (10 per page)
     │
     ├─── Page 1: Logs 1-10
     └─── Page 2: Logs 11-15
```

---

## 📤 Export Flow

### CSV Export Flow
```
[User clicks Export CSV]
           │
           ▼
[Check if logs exist]
           │
     ┌─────┴─────┐
     │           │
   Empty      Has Logs
     │           │
     ▼           ▼
  [Error]   [Generate CSV]
  Toast          │
                 ▼
         [Create Blob]
                 │
                 ▼
         [Download File]
                 │
                 ▼
         [Success Toast]
```

### PDF Export Flow
```
[User clicks Export PDF]
           │
           ▼
[Check if logs exist]
           │
     ┌─────┴─────┐
     │           │
   Empty      Has Logs
     │           │
     ▼           ▼
  [Error]   [Create jsPDF]
  Toast          │
                 ▼
         [Add title & date]
                 │
                 ▼
         [Loop through logs]
                 │
                 ▼
         [Add page breaks]
                 │
                 ▼
         [Save PDF file]
                 │
                 ▼
         [Success Toast]
```

---

## 🎯 Component Hierarchy

```
RestoreReportLogsPage
├── Header Section
│   ├── Title (h1)
│   ├── Clock Icon
│   └── Description
├── Filters Card
│   ├── Card Header
│   │   └── "Filtros" Title
│   └── Card Content
│       ├── Status Input
│       ├── Start Date Input
│       ├── End Date Input
│       ├── Date Error Message
│       ├── Export CSV Button
│       └── Export PDF Button
├── Summary Cards Row
│   ├── Total Logs Card
│   │   ├── Count
│   │   └── Activity Icon
│   ├── Success Card
│   │   ├── Count
│   │   └── CheckCircle Icon
│   └── Errors Card
│       ├── Count
│       └── XCircle Icon
└── Logs List Card
    ├── Card Header
    │   └── "Registros de Execução" Title
    └── Card Content
        ├── Loading State (if loading)
        ├── Empty State (if no logs)
        └── Logs View (if has logs)
            ├── ScrollArea
            │   └── Log Cards (map)
            │       ├── Status Icon
            │       ├── Status Badge
            │       ├── Timestamp
            │       ├── Message
            │       ├── Error Details (expandable)
            │       └── Triggered By
            └── Pagination Controls
                ├── Page Info
                ├── Previous Button
                └── Next Button
```

---

## 🚀 Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Component loaded only when route accessed
2. **Pagination**: Only 10 logs rendered at a time
3. **Filtered Rendering**: Only matching logs processed
4. **Memo**: Could be added for expensive operations
5. **ScrollArea**: Virtual scrolling for large lists

### Load Times
- **Initial Load**: < 1s (depends on log count)
- **Filter Change**: Instant (client-side)
- **Page Navigation**: Instant (client-side)
- **Export**: 1-3s (depends on log count)

---

## ✅ Accessibility

- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Color contrast meets WCAG standards
- ✅ Screen reader friendly
- ✅ Focus indicators on buttons
- ✅ Error messages announced

---

## 🎉 Key Highlights

1. **Clean Design**: Card-based layout for clarity
2. **Intuitive Filters**: Easy to understand and use
3. **Visual Feedback**: Colors and icons convey status
4. **Export Options**: Multiple formats for flexibility
5. **Responsive**: Works on all screen sizes
6. **Performance**: Pagination keeps page fast
7. **Debug Friendly**: Expandable error details
8. **Consistent**: Matches existing admin UI

---

**Created**: October 11, 2025  
**Version**: 1.0  
**Status**: ✅ Complete
