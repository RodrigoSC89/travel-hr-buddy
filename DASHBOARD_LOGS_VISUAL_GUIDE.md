# Dashboard Logs Page - Visual Guide

## 📸 Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Voltar          📄 Logs de Envio de Dashboard      [📤 Exportar] │
│                    Auditoria de execuções automáticas               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────┐ │
│  │ Status       │ Data Inicial │ Data Final   │                  │ │
│  │ [________]   │ [YYYY-MM-DD] │ [YYYY-MM-DD] │                  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘ │
│                                                                       │
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐ │
│  │ Total de Execuções│ │ Sucessos          │ │ Erros            │ │
│  │                   │ │                   │ │                  │ │
│  │      150          │ │      145          │ │       5          │ │
│  └───────────────────┘ └───────────────────┘ └──────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Histórico de Execuções                                          ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Data         │ Status  │ E-mail              │ Mensagem        ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ 14/10/25 9:30│ success │ user1@example.com   │ Report sent...  ││
│  │ 14/10/25 9:30│ success │ user2@example.com   │ Report sent...  ││
│  │ 14/10/25 9:30│ success │ user3@example.com   │ Report sent...  ││
│  │ 14/10/25 9:29│ error   │ invalid@example.com │ Failed to send..││
│  │ 13/10/25 8:00│ success │ user4@example.com   │ Report sent...  ││
│  │ 13/10/25 8:00│ success │ user5@example.com   │ Report sent...  ││
│  │              │         │                     │                 ││
│  │              │         │                     │     ▼ Scroll    ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Badges
- **Success**: Green background (#dcfce7), green text (#166534)
- **Error**: Red background (#fee2e2), red text (#991b1b)

### Summary Cards
- **Background**: White with subtle shadow
- **Text**: Gray for labels, bold black for numbers
- **Success count**: Green (#16a34a)
- **Error count**: Red (#dc2626)

## 📱 Responsive Behavior

### Desktop (> 768px)
- Filters displayed horizontally in a row
- Summary cards in 3 columns
- Table shows all columns
- Export button in header

### Mobile (< 768px)
- Filters stack vertically
- Summary cards stack (1 per row)
- Table scrolls horizontally
- Reduced padding for better fit

## 🖼️ Component States

### Loading State
```
┌─────────────────────────────────────┐
│                                     │
│          ⟳ (spinning)               │
│      Carregando logs...             │
│                                     │
└─────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────┐
│                                     │
│    📄 (icon)                        │
│    Nenhum log encontrado            │
│                                     │
└─────────────────────────────────────┘
```

### Error State (Toast)
```
┌─────────────────────────────────────┐
│ ❌ Erro ao carregar logs            │
└─────────────────────────────────────┘
```

### Success Export (Toast)
```
┌─────────────────────────────────────┐
│ ✅ CSV exportado com sucesso!       │
│    150 registros exportados         │
└─────────────────────────────────────┘
```

## 🎭 Interactive Elements

### Filter Inputs
- **Type**: Text input for status, date inputs for dates
- **Behavior**: Auto-submit on change (no submit button needed)
- **Validation**: None (filters apply regardless)

### Export Button
- **State**: Disabled when no logs
- **Action**: Downloads CSV file immediately
- **Filename**: `dashboard_logs_YYYY-MM-DD_HHmmss.csv`

### Table Rows
- **Hover**: Light gray background
- **Transition**: Smooth color change
- **Truncation**: Long messages truncated with "..." and title tooltip

### Back Button
- **Icon**: Left arrow
- **Action**: Navigate to /admin
- **Style**: Ghost variant (subtle appearance)

## 📊 Data Examples

### Success Log Entry
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "executed_at": "2025-10-14T09:30:00Z",
  "status": "success",
  "email": "user@example.com",
  "message": "Dashboard report sent successfully",
  "created_at": "2025-10-14T09:30:00Z"
}
```

### Error Log Entry
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "executed_at": "2025-10-14T09:29:00Z",
  "status": "error",
  "email": "invalid@example.com",
  "message": "Failed to send email: Invalid API key",
  "created_at": "2025-10-14T09:29:00Z"
}
```

## 🔄 User Flow Examples

### Flow 1: View All Logs
```
1. User navigates to /admin/reports/dashboard-logs
   ↓
2. Page loads, shows spinner
   ↓
3. Logs fetched from database (limit 100, descending by date)
   ↓
4. Table displays with summary cards
   ↓
5. User can scroll through logs
```

### Flow 2: Filter by Errors
```
1. User enters "error" in Status field
   ↓
2. Auto-fetch triggered
   ↓
3. Table updates to show only errors
   ↓
4. Summary cards update counts
   ↓
5. User reviews error messages
```

### Flow 3: Export CSV
```
1. User applies filters (optional)
   ↓
2. User clicks "Exportar CSV"
   ↓
3. CSV generated with current filtered data
   ↓
4. File downloads to browser
   ↓
5. Toast notification shows success
   ↓
6. User opens CSV in Excel/spreadsheet app
```

### Flow 4: Date Range Analysis
```
1. User sets start date: 2025-10-01
   ↓
2. User sets end date: 2025-10-14
   ↓
3. Auto-fetch triggered
   ↓
4. Table shows only logs in date range
   ↓
5. Summary cards show filtered counts
   ↓
6. User exports filtered data
```

## 🎯 Key Features Visual Summary

```
┌──────────────────────────────────────────────────────┐
│                    FEATURES                          │
├──────────────────────────────────────────────────────┤
│ ✅ Real-time filtering (auto-apply)                  │
│ ✅ Date range selection                              │
│ ✅ CSV export with UTF-8 BOM                         │
│ ✅ Summary statistics cards                          │
│ ✅ Scrollable table (500px height)                   │
│ ✅ Status color coding                               │
│ ✅ Toast notifications                               │
│ ✅ Loading states                                    │
│ ✅ Empty state handling                              │
│ ✅ Responsive design                                 │
│ ✅ Admin-only access (RLS)                           │
└──────────────────────────────────────────────────────┘
```

## 📐 Dimensions

- **Page width**: Max 6xl (1280px) container
- **Table height**: 500px scrollable area
- **Summary cards**: Equal width in grid
- **Filter inputs**: Flexible width with gap
- **Status badge**: Inline-flex with padding
- **Export button**: Auto width with icon

## 🎨 Accessibility

- **Labels**: All inputs have visible labels
- **Color contrast**: WCAG AA compliant
- **Hover states**: Clear visual feedback
- **Loading indicators**: Visible spinner
- **Empty states**: Helpful messages
- **Tooltips**: Full text on truncated cells

---

**Note**: This is a text-based visual representation. The actual implementation uses React with Tailwind CSS and shadcn/ui components for a polished, professional appearance.
