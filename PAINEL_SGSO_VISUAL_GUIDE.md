# Painel SGSO - Visual Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🧭 Painel SGSO - Risco Operacional por Embarcação  [Exportar CSV]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │
│  │ 🚢 PSV         │  │ 🚢 OSV         │  │ 🚢 AHTS        │           │
│  │   Atlântico    │  │   Pacífico     │  │   Brasileiro   │           │
│  │                │  │                │  │                │           │
│  │ Risco: BAIXO   │  │ Risco: MODERADO│  │ Risco: ALTO    │           │
│  │ (green badge)  │  │ (yellow badge) │  │ (red badge)    │           │
│  │                │  │                │  │                │           │
│  │ Falhas: 2      │  │ Falhas: 8      │  │ Falhas: 15     │           │
│  └────────────────┘  └────────────────┘  └────────────────┘           │
│                                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │
│  │ 🚢 PSV         │  │ 🚢 OSV         │  │ 🚢 AHTS        │           │
│  │   Navegante    │  │   Marítimo     │  │   Oceânico     │           │
│  └────────────────┘  └────────────────┘  └────────────────┘           │
│                                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 Comparativo Mensal de Falhas                                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │    Bar Chart showing monthly failures per vessel                 │   │
│  │    ▂▂▅▅▃▃▄▄▇▇▅▅▃▃▂▂▄▄▆▆▃▃▂▂▅▅▄▄▃▃▂▂                         │   │
│  │    Jan Feb Mar Abr Mai Jun (rotated -45°)                       │   │
│  │    Legend: Falhas Críticas (red bars)                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Risk Level Badges
- **BAIXO (Low)**: `bg-green-100 text-green-800` - Light green background
- **MODERADO (Moderate)**: `bg-yellow-100 text-yellow-800` - Light yellow background  
- **ALTO (High)**: `bg-red-100 text-red-800` - Light red background

### UI Elements
- **Title**: Text 2xl, bold, with compass emoji 🧭
- **Export Button**: Blue background (`bg-blue-600`), white text
- **Vessel Cards**: Shadow-md, white background, 4px padding
- **Chart Bars**: Red fill (`#ef4444`)

## Component Features

### 1. Header Section
```typescript
<div className="flex items-center justify-between">
  <h2>🧭 Painel SGSO - Risco Operacional por Embarcação</h2>
  <Button onClick={exportarCSV}>Exportar CSV</Button>
</div>
```
- Title on the left with emoji
- Export button aligned to the right
- Responsive flex layout

### 2. Vessel Risk Cards Grid
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  // 1 column on mobile, 3 columns on medium+ screens
</div>
```
Each card shows:
- Ship emoji 🚢 + vessel name
- Color-coded risk badge (uppercase)
- Critical failures count

### 3. Monthly Comparison Chart
```typescript
<BarChart data={flatMappedData}>
  <XAxis dataKey="mes" angle={-45} textAnchor="end" />
  <YAxis allowDecimals={false} />
  <Tooltip />
  <Legend />
  <Bar dataKey="falhas" fill="#ef4444" name="Falhas Críticas" />
</BarChart>
```
- Red bars representing failures
- Rotated month labels for readability
- Integer-only y-axis values
- Interactive tooltip on hover
- Legend showing "Falhas Críticas"

## CSV Export Format

When clicking "Exportar CSV", generates a file `relatorio_sgso.csv`:

```csv
Embarcação,Risco,Total de Falhas
PSV Atlântico,baixo,2
OSV Pacífico,moderado,8
AHTS Brasileiro,alto,15
PSV Navegante,baixo,3
OSV Marítimo,moderado,6
AHTS Oceânico,alto,12
```

## API Integration

### Endpoint
`GET /api/admin/sgso`

### Response Structure
```json
[
  {
    "embarcacao": "PSV Atlântico",
    "risco": "baixo",
    "total": 2,
    "por_mes": {
      "Jan": 0,
      "Fev": 0,
      "Mar": 1,
      "Abr": 0,
      "Mai": 0,
      "Jun": 1
    }
  }
]
```

### Data Flow
1. Component mounts → useEffect triggers
2. Fetch data from `/api/admin/sgso`
3. Set state with received data
4. Render cards and chart with data
5. Export button creates CSV from current state

## Navigation Path

To access the Painel SGSO:
1. Navigate to SGSO page (`/sgso`)
2. Look for the "Painel SGSO" tab in the dashboard
3. Click the tab to view the operational risk panel
4. Click "Exportar CSV" to download the report

## Responsive Behavior

### Mobile (< 768px)
- Cards stack vertically (1 column)
- Chart width adjusts to container
- Export button moves below title on very small screens

### Tablet (768px - 1024px)
- Cards display in 3 columns
- Full chart width maintained
- Header items stay side-by-side

### Desktop (> 1024px)
- Optimal 3-column card layout
- Chart displays at full 400px height
- All elements properly spaced

## Integration Points

### SGSO Dashboard Tabs
```
┌─────────────────────────────────────────────────────────────────┐
│ [Visão Geral] [17 Práticas] [Riscos] [Incidentes] [Emergência] │
│ [Auditorias] [Treinamentos] [NCs] [Métricas] [Painel SGSO] ◄── │
└─────────────────────────────────────────────────────────────────┘
```
The new "Painel SGSO" tab appears as the 10th tab in the SGSO dashboard.

## Technical Notes

- Uses React hooks (useState, useEffect)
- TypeScript for type safety
- Recharts for chart rendering
- file-saver for CSV download
- shadcn/ui components (Card, Button)
- Tailwind CSS for styling
- Responsive design with mobile-first approach
