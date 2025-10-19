# Etapa 5 - Visual Interface Guide

## 📺 Page Preview: /admin/mmi/os

### Header Section
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  🔧 Ordens de Serviço (MMI)                                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Main Table Interface
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Descrição                                  │ Status      │ Criado em  │ Ações                    │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Manutenção preventiva do motor            │ ⬜ pendente │ 17/10/2025 │ [pendente] [executado]   │
│  principal - verificação de óleo e filtros  │             │            │ [atrasado]               │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Substituição de rolamentos do              │ ✅ executado│ 15/10/2025 │ [pendente] [executado]   │
│  gerador auxiliar                           │             │            │ [atrasado]               │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Inspeção do sistema de refrigeração -      │ 🔴 atrasado│ 10/10/2025 │ [pendente] [executado]   │
│  bomba d'água marinha                       │             │            │ [atrasado]               │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Calibração de sensores de temperatura      │ ⬜ pendente │ 18/10/2025 │ [pendente] [executado]   │
│  no sistema de exaustão                     │             │            │ [atrasado]               │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Limpeza e teste do sistema de             │ ✅ executado│ 12/10/2025 │ [pendente] [executado]   │
│  combate a incêndio                         │             │            │ [atrasado]               │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 🎨 UI Components

### Status Badges

#### Pendente (Pending)
```
┌──────────────┐
│ ⬜ pendente  │  ← Secondary variant (gray/neutral)
└──────────────┘
```

#### Executado (Executed)
```
┌──────────────┐
│ ✅ executado │  ← Default variant (primary color)
└──────────────┘
```

#### Atrasado (Late/Delayed)
```
┌──────────────┐
│ 🔴 atrasado  │  ← Destructive variant (red/warning)
└──────────────┘
```

### Action Buttons

```
┌───────────┐ ┌───────────┐ ┌───────────┐
│ pendente  │ │ executado │ │ atrasado  │  ← Outline variant, small size
└───────────┘ └───────────┘ └───────────┘
     ↑             ↑             ↑
  Click to     Click to      Click to
  mark as      mark as       mark as
  pending      executed      delayed
```

## 🖱️ User Interactions

### 1. Viewing Work Orders

**Initial State:**
- Page loads with "Carregando..." message
- Fetches data from `mmi_os` table
- Sorts by creation date (newest first)
- Displays in table format

**Loaded State:**
- All work orders visible
- Status shown with color-coded badges
- Dates formatted in Brazilian style (dd/MM/yyyy)
- Action buttons ready for interaction

### 2. Changing Status

**User Flow:**
```
1. User identifies work order in table
   │
   ↓
2. User clicks desired status button
   │  (pendente, executado, or atrasado)
   │
   ↓
3. Status updates in database
   │
   ↓
4. Table refreshes automatically
   │
   ↓
5. New status badge displayed
```

**Success Feedback:**
- Badge color changes immediately
- Table data refreshes
- New status visible

**Error Feedback:**
- Alert message: "Erro ao atualizar status"
- Console error logged
- Previous state maintained

### 3. Date Display

**Format:** dd/MM/yyyy (Brazilian standard)

**Examples:**
- 17/10/2025 (October 17, 2025)
- 15/10/2025 (October 15, 2025)
- 10/10/2025 (October 10, 2025)

## 📱 Responsive Design

### Desktop View (> 1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│                          Full Table                             │
│  All columns visible with comfortable spacing                   │
│  Action buttons displayed in a row                              │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet View (768px - 1024px)
```
┌───────────────────────────────────────────────┐
│            Slightly Condensed Table           │
│  All columns visible with reduced padding     │
│  Action buttons still in a row                │
└───────────────────────────────────────────────┘
```

### Mobile View (< 768px)
```
┌─────────────────────────────┐
│      Stacked Layout         │
│  May require horizontal     │
│  scrolling for full table   │
│  Or card-based alternative  │
└─────────────────────────────┘
```

## 🎯 Component Structure

```
OSPage
├── Header
│   └── h1: "🔧 Ordens de Serviço (MMI)"
│
├── Loading State (conditional)
│   └── p: "Carregando..."
│
└── Table (when loaded)
    ├── thead
    │   └── tr
    │       ├── th: "Descrição"
    │       ├── th: "Status"
    │       ├── th: "Criado em"
    │       └── th: "Ações"
    │
    └── tbody
        └── tr (for each OS)
            ├── td: {os.descricao}
            ├── td: <Badge variant={...}>{os.status}</Badge>
            ├── td: {format(created_at, 'dd/MM/yyyy')}
            └── td: 
                ├── <Button>pendente</Button>
                ├── <Button>executado</Button>
                └── <Button>atrasado</Button>
```

## 💡 Color Scheme

### Status Colors

| Status     | Badge Variant  | Primary Color | Usage                    |
|------------|---------------|---------------|--------------------------|
| pendente   | secondary     | Gray (#6B7280)| Neutral - awaiting action|
| executado  | default       | Blue (#3B82F6)| Success - completed work |
| atrasado   | destructive   | Red (#EF4444) | Warning - needs attention|

### UI Colors

- **Table Headers**: Muted background (#F3F4F6)
- **Table Borders**: Light gray (#E5E7EB)
- **Button Outline**: Primary color
- **Button Hover**: Subtle background change

## 🔄 State Management

### Component State

```typescript
// Loading state
const [loading, setLoading] = useState(true);

// Work orders data
const [osList, setOSList] = useState<OS[]>([]);

// States during lifecycle:
// 1. Initial: loading=true, osList=[]
// 2. Loading: loading=true, osList=[]
// 3. Loaded: loading=false, osList=[...data]
// 4. Updating: loading=false, osList=[...data] (no loading overlay)
// 5. Updated: loading=false, osList=[...refreshed data]
```

## 📊 Data Flow

```
┌─────────────┐
│  Component  │
│   Mounts    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  useEffect  │
│   Triggers  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  fetchOS()  │
└──────┬──────┘
       │
       ↓
┌─────────────┐     ┌──────────────┐
│  Supabase   │────→│   mmi_os     │
│   Query     │←────│   Table      │
└──────┬──────┘     └──────────────┘
       │
       ↓
┌─────────────┐
│  setOSList  │
│  (state)    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Render    │
│   Table     │
└─────────────┘
```

## 🎬 Animation & Transitions

- **Loading**: Smooth transition from loading to content
- **Button Hover**: Subtle background color change
- **Badge**: No animation (static display)
- **Table Rows**: No animation on update (instant refresh)

## 🧩 Integration Points

### Database Connection
```typescript
// Direct Supabase client usage
import { supabase } from "@/integrations/supabase/client";

// Query
const { data, error } = await supabase
  .from("mmi_os")
  .select("*")
  .order("created_at", { ascending: false });
```

### UI Components
```typescript
// shadcn/ui components used
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
```

### Utilities
```typescript
// Date formatting
import { format } from "date-fns";
format(new Date(os.created_at), "dd/MM/yyyy")
```

## 📏 Layout Specifications

### Container
- Max width: 1536px (6xl)
- Padding: 1.5rem (6)
- Margin: Auto-centered

### Table
- Width: 100%
- Border: 1px solid
- Text size: Small (0.875rem)

### Spacing
- Section gap: 1rem (4)
- Button spacing: 0.5rem (2)
- Cell padding: 0.5rem (2)

## ✨ User Experience Features

### 1. **Immediate Feedback**
   - Status change happens instantly
   - No loading spinners during update
   - Visual badge update confirms action

### 2. **Error Handling**
   - User-friendly error messages
   - Console logging for debugging
   - Graceful degradation

### 3. **Accessibility**
   - Semantic HTML table structure
   - Proper heading hierarchy
   - Button labels clear and descriptive

### 4. **Performance**
   - Lazy loaded component
   - Efficient database queries
   - Minimal re-renders

## 🎓 Usage Examples

### Example 1: Marking Work Order as Executed

```
Before:
┌────────────────────────────────────┐
│ Manutenção preventiva │ ⬜ pendente │
└────────────────────────────────────┘

User clicks: [executado]

After:
┌────────────────────────────────────┐
│ Manutenção preventiva │ ✅ executado│
└────────────────────────────────────┘
```

### Example 2: Marking Work Order as Delayed

```
Before:
┌────────────────────────────────────┐
│ Inspeção do sistema   │ ⬜ pendente │
└────────────────────────────────────┘

User clicks: [atrasado]

After:
┌────────────────────────────────────┐
│ Inspeção do sistema   │ 🔴 atrasado│
└────────────────────────────────────┘
```

## 🔮 Future Enhancement Ideas

### Planned Features (Not Yet Implemented)
1. **Export to PDF** - Generate printable work order reports
2. **Export to CSV** - Data export for spreadsheet analysis
3. **Search/Filter** - Find specific work orders
4. **Pagination** - Handle large datasets efficiently
5. **Bulk Actions** - Update multiple work orders at once
6. **Detail View** - Modal with complete work order information
7. **History Tracking** - View status change history
8. **Notifications** - Real-time alerts for status changes

### UI Enhancements
- Tooltips on hover
- Sorting by column headers
- Row highlighting on hover
- Skeleton loading states
- Success toast notifications

---

**Visual Guide Version**: 1.0.0  
**Last Updated**: 2025-10-19  
**Status**: Complete ✅

