# Jobs By Component Dashboard - Visual Guide

## 🎨 Component Preview

### Normal State (With Data)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   📊 Falhas por Componente + Tempo Médio                           │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │                                                             │ │
│   │  Motor Principal      ██████████████████ ████              │ │
│   │                       └─ 15 jobs (24.5h avg)               │ │
│   │                                                             │ │
│   │  Bomba Hidráulica     ████████████ ███                     │ │
│   │                       └─ 12 jobs (18.3h avg)               │ │
│   │                                                             │ │
│   │  Gerador              ████████ ██                          │ │
│   │                       └─ 8 jobs (12.1h avg)                │ │
│   │                                                             │ │
│   │  Compressor           ████ █                               │ │
│   │                       └─ 4 jobs (6.5h avg)                 │ │
│   │                                                             │ │
│   │                                                             │ │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │ │
│   │  Qtd Jobs / Horas (Empilhado)                              │ │
│   │                                                             │ │
│   │  Legend:  ▓ Jobs Finalizados   ▒ Tempo Médio (h)          │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   📊 Falhas por Componente + Tempo Médio                           │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │                                                             │ │
│   │   ████████████████████████████████████████████             │ │
│   │   ████████████████████████████████████████████             │ │
│   │   ████████████████████████████████████████████             │ │
│   │   ████████████████████████████████████████████             │ │
│   │   ████████████████████████████████████████████             │ │
│   │   ████████████████████████████████████████████             │ │
│   │                                                             │ │
│   │   Shimmer effect while loading data...                     │ │
│   │                                                             │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   📊 Falhas por Componente + Tempo Médio                           │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │                                                             │ │
│   │   ⚠️  Erro ao carregar dados: Erro ao buscar dados de BI  │ │
│   │       (shown in red text)                                   │ │
│   │                                                             │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Chart Elements

### Bar Chart Configuration

```tsx
Layout: Vertical (horizontal bars)
Height: 350px
Margin: { left: 40 }

Bars:
  1. Jobs Finalizados (count)
     - Color: #0f172a (Dark Slate)
     - Represents: Number of completed jobs
  
  2. Tempo Médio (avg_duration)
     - Color: #2563eb (Blue)
     - Represents: Average duration in hours
```

### Axis Configuration

```tsx
X-Axis:
  Type: number
  Label: "Qtd Jobs / Horas (Empilhado)"
  Position: insideBottomRight
  Offset: -5

Y-Axis:
  DataKey: component_id
  Type: category
```

## 🎯 Data Flow

```
┌─────────────┐
│  Database   │
│  mmi_jobs   │
│             │
│ - component │
│ - status    │
│ - created   │
│ - updated   │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  /jobs-by-component          │
│                              │
│  1. Query completed jobs     │
│  2. Group by component_id    │
│  3. Calculate avg duration   │
│  4. Sort by count desc       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Fetch API                   │
│  /api/bi/jobs-by-component   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  DashboardJobs Component     │
│                              │
│  useState: data, loading,    │
│            error             │
│                              │
│  useEffect: fetchStats()     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Recharts Rendering          │
│  - BarChart (vertical)       │
│  - Two Bars (stacked)        │
│  - Tooltip, Legend           │
└──────────────────────────────┘
```

## 🎨 Color Palette

```css
Component Colors:
├─ Card Background: White / Default
├─ Title: font-semibold (default text color)
├─ Error Text: text-red-600 (#dc2626)
├─ Jobs Bar: #0f172a (Dark Slate)
├─ Duration Bar: #2563eb (Blue)
├─ Skeleton: Default shimmer effect
└─ Tooltip: Default recharts styling
```

## 📐 Dimensions

```
Container:
├─ Card: Full width
├─ Padding: p-6 (1.5rem)
└─ Gap: mb-4 (1rem)

Chart:
├─ ResponsiveContainer: 100% width × 350px height
├─ Margin Left: 40px (for Y-axis labels)
└─ Bar Width: Auto (responsive)
```

## 💡 Interactive Elements

### Tooltip Behavior

When hovering over a bar:
```
┌─────────────────────────┐
│  Motor Principal        │
├─────────────────────────┤
│  Jobs Finalizados: 15   │
│  Tempo Médio (h): 24.5  │
└─────────────────────────┘
```

### Legend Interaction

- Click on legend items to show/hide bars
- Hover for highlighting effect

## 📱 Responsive Behavior

```
Desktop (> 1024px):
└─ Full width chart with all components visible

Tablet (768px - 1024px):
└─ Chart scales proportionally

Mobile (< 768px):
└─ Chart maintains height, scrolls horizontally if needed
```

## 🔗 Integration Example

### In a Grid Layout

```tsx
<div className="grid grid-cols-2 gap-4">
  <DashboardJobs />
  <OtherDashboardComponent />
</div>
```

### In a Tab System

```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="jobs">Jobs by Component</TabsTrigger>
  </TabsList>
  <TabsContent value="jobs">
    <DashboardJobs />
  </TabsContent>
</Tabs>
```

### Standalone Page

```tsx
// src/pages/admin/bi-jobs.tsx
export default function BiJobsDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1>Jobs By Component BI Dashboard</h1>
      <DashboardJobs />
    </div>
  );
}
```

## 🎭 State Transitions

```
Initial State (mounted)
    │
    ├─ loading: true
    ├─ data: []
    └─ error: null
    │
    ▼
Fetching Data
    │
    ├─ Shows Skeleton
    └─ Calls fetch()
    │
    ▼
Success Path          Error Path
    │                     │
    ├─ loading: false     ├─ loading: false
    ├─ data: [...]        ├─ data: []
    └─ error: null        └─ error: "message"
    │                     │
    ▼                     ▼
Renders Chart         Shows Error UI
```

## 📊 Data Example

```json
// Response from /api/bi/jobs-by-component
[
  {
    "component_id": "Motor Principal",
    "count": 15,
    "avg_duration": 24.5
  },
  {
    "component_id": "Bomba Hidráulica",
    "count": 12,
    "avg_duration": 18.3
  },
  {
    "component_id": "Gerador",
    "count": 8,
    "avg_duration": 12.1
  },
  {
    "component_id": "Compressor",
    "count": 4,
    "avg_duration": 6.5
  }
]
```

## 🎯 Key Features Visualization

### 1. Dual Metrics Display
```
Component A:  ████████████ ████  ← Jobs count + Avg duration
              └──────┬─────┘ └┬┘
                     │        │
                 Jobs (15)  Duration (24.5h)
```

### 2. Sorted by Priority
```
Most Jobs    ████████████████████  Motor (15)
             ████████████  Bomba (12)
             ████████  Gerador (8)
Least Jobs   ████  Compressor (4)
```

### 3. Clear Labeling
```
X-Axis Label: "Qtd Jobs / Horas (Empilhado)"
              └─ Explains the stacked metric visualization

Legend:
  ▓ Jobs Finalizados  ← Dark bar
  ▒ Tempo Médio (h)   ← Blue bar
```

## 🚀 Performance Characteristics

```
Initial Load: 
├─ Fetch call initiated
├─ Skeleton shown immediately
└─ ~500ms typical load time

Data Update:
├─ Smooth transition from skeleton to chart
└─ No flickering or layout shift

Interactivity:
├─ Instant hover feedback
└─ Smooth tooltip animations
```

## ✨ Visual Polish

1. **Shadow & Borders**: Card component with subtle shadow
2. **Typography**: Clear hierarchy (h2 title, chart labels)
3. **Spacing**: Consistent padding and margins
4. **Colors**: Professional color scheme (dark slate + blue)
5. **Animations**: Smooth transitions and hover effects
6. **Error Feedback**: Clear red error messages
7. **Loading State**: Professional skeleton animation

This visual guide demonstrates the complete user experience of the Jobs By Component Dashboard component.
