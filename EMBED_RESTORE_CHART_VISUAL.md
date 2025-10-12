# Embed Restore Chart - Visual Guide

## 📸 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Restore Report Summary                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────┬───────────────────────────────────┐  │
│  │ 📦 Total: 145        │ 📁 Documentos únicos: 89         │  │
│  ├───────────────────────┼───────────────────────────────────┤  │
│  │ 📊 Média/dia: 7.3    │ 🕒 Última execução: 12/10 14:30  │  │
│  └───────────────────────┴───────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────┬───────────────────────────┐   │
│  │  📆 Logs por Dia            │  📊 Por Status            │   │
│  │  ┌────────────────────┐     │  ┌──────────────────┐    │   │
│  │  │   Bar Chart        │     │  │   Pie Chart      │    │   │
│  │  │                    │     │  │                  │    │   │
│  │  │  ▄▄                │     │  │     ╱────╲       │    │   │
│  │  │  ██  ▄▄            │     │  │    │      │      │    │   │
│  │  │  ██  ██  ▄▄  ▄▄   │     │  │     ╲────╱       │    │   │
│  │  │  ██  ██  ██  ██   │     │  │                  │    │   │
│  │  │────────────────────│     │  │  Success: 85%    │    │   │
│  │  │ 06  07  08  09 ... │     │  │  Error: 15%      │    │   │
│  │  └────────────────────┘     │  └──────────────────┘    │   │
│  └─────────────────────────────┴───────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Colors
- 🔵 **Blue (#3b82f6)** - Success/Primary
- 🟢 **Green (#10b981)** - Success alternative
- 🟡 **Orange (#f59e0b)** - Warning
- 🔴 **Red (#ef4444)** - Error/Critical
- 🟣 **Purple (#8b5cf6)** - Additional status

### Background
- White (#ffffff) - Main background
- Gray-700 (#374151) - Text color

## 📊 Chart Details

### Bar Chart (Logs por Dia)
```
Features:
✓ Shows last 7 days of data
✓ Date format: DD/MM
✓ Y-axis: Count of restorations
✓ X-axis: Days
✓ Tooltip on hover
✓ Blue bars (#3b82f6)
```

### Pie Chart (Por Status)
```
Features:
✓ Distribution by status
✓ Multi-color segments
✓ Labels with percentages
✓ Tooltip with values
✓ Legend showing status names
```

## 🔒 Access Flow

```
┌──────────────────────────────────────────────────┐
│  User accesses:                                   │
│  /embed/restore-chart?token=abc123               │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Token Valid?  │
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        │                 │
     YES│                 │NO
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Show Charts  │  │ Redirect to  │
│ & Data       │  │ /unauthorized│
└──────────────┘  └──────────────┘
```

## 📱 Responsive Design

### Desktop View (>768px)
```
┌─────────────────────────────────────────┐
│  Summary Stats (2 columns)              │
├──────────────────┬──────────────────────┤
│  Bar Chart       │  Pie Chart          │
│  (50% width)     │  (50% width)        │
└──────────────────┴──────────────────────┘
```

### Mobile View (<768px)
```
┌─────────────────────────┐
│  Summary Stats (stacked)│
├─────────────────────────┤
│  Bar Chart              │
│  (100% width)           │
├─────────────────────────┤
│  Pie Chart              │
│  (100% width)           │
└─────────────────────────┘
```

## 🎯 Use Case Examples

### 1. **Email Report Embed**
```
┌────────────────────────────────────┐
│  Subject: Daily Restore Report      │
├────────────────────────────────────┤
│  Hi Team,                           │
│                                     │
│  Here's your daily restore summary:│
│                                     │
│  [Chart Image]                      │
│                                     │
│  View full report:                  │
│  https://app.com/embed/restore-...  │
└────────────────────────────────────┘
```

### 2. **Dashboard iFrame**
```html
<div class="dashboard-widget">
  <h3>Restore Metrics</h3>
  <iframe 
    src="/embed/restore-chart?token=..."
    width="100%" 
    height="600px"
  ></iframe>
</div>
```

### 3. **TV Wall Display**
```
Full-screen kiosk mode:
- No navigation
- Auto-refresh every 5 minutes
- High contrast for visibility
```

## 🔧 Component Structure

```
RestoreChart
├── Token Validation
│   └── Redirect if invalid
├── Data Fetching
│   ├── document_restore_logs
│   └── restore_report_logs
├── Data Processing
│   ├── Calculate summary
│   ├── Group by day
│   └── Group by status
└── Rendering
    ├── Header
    ├── Summary Grid (2x2)
    ├── Charts Container
    │   ├── Bar Chart
    │   └── Pie Chart
    └── Loading State
```

## 📐 Dimensions

### Default Sizing
- **Container**: Full viewport (100vw x 100vh)
- **Padding**: 24px (p-6)
- **Chart Height**: 300px
- **Summary Grid**: 2 columns on desktop

### Recommended iFrame Sizes
```
Compact:  800 x 600
Standard: 1200 x 800
Large:    1600 x 900
Full:     100% x 600
```

## 💡 Key Features Highlighted

### 🔒 Security
- Token-based authentication
- Environment variable configuration
- Automatic unauthorized redirect

### 📊 Analytics
- Real-time data from Supabase
- Aggregated statistics
- Multi-dimensional visualization

### 🎨 Design
- Clean, minimal interface
- Responsive layout
- Professional color scheme
- Emoji icons for visual appeal

### ⚡ Performance
- Direct Supabase queries
- Client-side rendering
- Efficient data processing
- Loading states

## 🚦 Status Indicators

The page shows different states:

### ✅ Success State
```
Charts loaded with data
All metrics displayed
Normal operation
```

### ⏳ Loading State
```
┌─────────────────────┐
│   ⟳ Loading...      │
│   (Spinner)         │
└─────────────────────┘
```

### ❌ Error State
```
If token invalid:
→ Redirect to /unauthorized

If data fetch fails:
→ Console error logged
→ Empty charts shown
```

## 📝 Summary Statistics Breakdown

```
┌─────────────────────────────────────────────┐
│ 📦 Total: 145                               │
│    └─ Count of all restoration records      │
│                                             │
│ 📁 Documentos únicos: 89                    │
│    └─ Unique document_id count              │
│                                             │
│ 📊 Média/dia: 7.3                           │
│    └─ Total / Days with data                │
│                                             │
│ 🕒 Última execução: 12/10/2025 14:30       │
│    └─ Most recent restore_report_logs entry │
└─────────────────────────────────────────────┘
```

## 🎬 Animation & Interaction

### On Load
1. Token validation (instant)
2. Data fetch (async)
3. Charts render with animation
4. Tooltips available on hover

### User Interactions
- **Hover over bars**: Show exact count
- **Hover over pie slices**: Show percentage
- **Responsive**: Works on all screen sizes

---

**Visual Guide** | [Implementation Guide](./EMBED_RESTORE_CHART_IMPLEMENTATION.md) | [Quick Reference](./EMBED_RESTORE_CHART_QUICKREF.md)
