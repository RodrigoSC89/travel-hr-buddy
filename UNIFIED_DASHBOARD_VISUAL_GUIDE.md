# Unified Dashboard Visual Guide

## 🎯 Dashboard Overview

The unified admin dashboard provides a central hub for accessing all key administrative features with intelligent role-based access control and public sharing capabilities.

## 📱 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  👁️ 🚀 Painel Administrativo                               │
│  Central de controle e monitoramento — Nautilus One        │
├─────────────────────────────────────────────────────────────┤
│  🔒 Modo público somente leitura  (Public Mode Only)       │
├─────────────────────────────────────────────────────────────┤
│  ✅ Cron diário executado com sucesso nas últimas 24h      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ ✅       │  │ 📦       │  │ 🤖       │                 │
│  │Checklists│  │Restaur.  │  │Hist. IA  │                 │
│  │  ➜       │  │  ➜       │  │  ➜       │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  📊 Atividade de Restauração (Últimos 15 dias)             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        █                                            │   │
│  │      █ █     █                                      │   │
│  │    █ █ █   █ █     █                               │   │
│  │  █ █ █ █ █ █ █   █ █     █                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  📱 Compartilhar Dashboard Público (Auth Mode Only)         │
│  ┌─────────┐                                               │
│  │  ▓▓▓▓▓  │  URL Pública:                                │
│  │  ▓▓▓▓▓  │  https://domain.com/admin/dashboard?public=1 │
│  │  ▓▓▓▓▓  │                                               │
│  └─────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│  ⚡ Atalhos Rápidos                                         │
│  ┌─────────────────────┐  ┌────────────────────────┐      │
│  │ 📊 Dashboard Rest.  │  │ 📄 Logs Detalhados IA  │      │
│  └─────────────────────┘  └────────────────────────┘      │
│  ┌─────────────────────┐  ┌────────────────────────┐      │
│  │ 📊 Relatórios       │  │ 📺 Visualização TV     │      │
│  └─────────────────────┘  └────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Component Breakdown

### 1. Header Section
```
🚀 Painel Administrativo
Central de controle e monitoramento — Nautilus One
```
- **Public Mode**: Adds 👁️ Eye icon
- **Font**: 3xl (36px) bold
- **Color**: Default text color

### 2. Public Mode Indicator
```
🔒 Modo público somente leitura
```
- **Visibility**: Only in public mode (`?public=1`)
- **Style**: Blue badge with eye icon
- **Position**: Below header

### 3. Cron Status Badge
```
✅ Cron diário executado com sucesso nas últimas 24h
```
- **States**: 
  - `ok`: Green badge with ✅
  - `warning`: Yellow badge with ⚠️
- **Position**: Below public mode indicator

### 4. Navigation Cards (Role-Based)
```
┌────────────────┐
│ ✅ Checklists │
│ Progresso e    │
│ status por     │
│ equipe    ➜    │
└────────────────┘
```

**Card Features:**
- Colored left border (blue, purple, indigo)
- Icon at top (8x8 size)
- Arrow icon at top-right
- Title and description
- Hover effect: shadow + translate
- Click navigates to path

**Role-Based Visibility:**

| Card | Admin | HR Manager | Others | Public |
|------|-------|-----------|--------|--------|
| ✅ Checklists | ✅ | ✅ | ❌ | ✅ |
| 📦 Restaurações | ✅ | ✅ | ✅ | ✅ |
| 🤖 Histórico IA | ✅ | ✅ | ❌ | ✅ |

### 5. Restore Activity Chart
```
📊 Atividade de Restauração (Últimos 15 dias)
┌─────────────────────────────────┐
│        █                        │
│      █ █     █                  │
│    █ █ █   █ █     █            │
│  █ █ █ █ █ █ █   █ █     █      │
└─────────────────────────────────┘
```

**Chart Configuration:**
- **Type**: Bar Chart
- **Data**: Last 15 days from database
- **X-Axis**: Date (DD/MM format)
- **Y-Axis**: Count (integer)
- **Color**: Blue (#8884d8)
- **Height**: 300px
- **Width**: 100% (responsive)
- **Library**: Recharts

**Data Source:**
```sql
get_restore_count_by_day_with_email(email_input)
```

### 6. QR Code Section (Authenticated Only)
```
📱 Compartilhar Dashboard Público
┌─────────┐
│ ▓▓▓▓▓▓▓ │  URL Pública:
│ ▓▓▓▓▓▓▓ │  https://domain.com/admin/dashboard?public=1
│ ▓▓▓▓▓▓▓ │  
└─────────┘
```

**Features:**
- QR Code: 128x128 SVG
- Public URL displayed below
- Clickable URL link
- Hidden in public mode

### 7. Quick Links Section
```
⚡ Atalhos Rápidos
┌──────────────────────┐
│ 📊 Dashboard Rest.   │
│ 📄 Logs Detalhados   │
│ 📊 Relatórios        │
│ 📺 Visualização TV   │
└──────────────────────┘
```

**Features:**
- 2-column grid on desktop
- 1-column on mobile
- Outlined buttons
- Icon + text layout
- Maintains public mode in links

## 🔄 Mode Comparison

### Authenticated Mode
```
✅ Shows all cards based on role
✅ Shows cron status badge
✅ Shows restore activity chart
✅ Shows QR code section
✅ Shows quick links
❌ No public mode indicator
❌ No eye icon in title
```

### Public Mode
```
✅ Shows all navigation cards
✅ Shows cron status badge
✅ Shows restore activity chart
✅ Shows quick links
✅ Shows public mode indicator
✅ Shows eye icon in title
❌ No QR code section
```

## 📐 Responsive Design

### Desktop (md and up)
- Navigation cards: 3 columns
- Quick links: 2 columns
- Chart: Full width

### Mobile
- Navigation cards: 1 column
- Quick links: 1 column
- Chart: Full width (responsive container)

## 🎨 Color Scheme

### Navigation Cards
- **Blue Card**: Checklists (#3B82F6 / blue-500)
- **Purple Card**: Restaurações (#A855F7 / purple-500)
- **Indigo Card**: Histórico IA (#6366F1 / indigo-500)

### Status Badges
- **Success**: Green (#22C55E / green-500)
- **Warning**: Yellow (#EAB308 / yellow-500)
- **Public Mode**: Blue (#3B82F6 / blue-500)

### Chart
- **Bars**: Blue (#8884d8)
- **Grid**: Light gray (default)
- **Text**: Muted foreground

## 🔗 Navigation Flow

```
Dashboard (/)
├── Authenticated Mode
│   ├── Checklists → /admin/checklists/dashboard
│   ├── Restaurações → /admin/restore/personal
│   ├── Histórico IA → /admin/assistant/history
│   └── Quick Links
│       ├── Dashboard Rest. → /admin/documents/restore-dashboard
│       ├── Logs IA → /admin/assistant/logs
│       ├── Relatórios → /admin/reports/restore-analytics
│       └── TV Panel → /tv/logs
│
└── Public Mode (?public=1)
    ├── Checklists → /admin/checklists/dashboard?public=1
    ├── Restaurações → /admin/restore/personal?public=1
    ├── Histórico IA → /admin/assistant/history?public=1
    └── Quick Links (all maintain ?public=1)
```

## 🧪 Visual States

### Loading States
- **Trend Chart**: Shows "Carregando dados..." message
- **Role Loading**: Cards may not appear until role is loaded

### Empty States
- **No Trend Data**: Chart section not rendered
- **No Cron Status**: Badge not shown

### Error States
- **Cron Error**: Shows warning badge with error message
- **Trend Error**: Logged to console, no visual error shown

## 📱 Use Cases

### 1. TV Display Mode
```
URL: /admin/dashboard?public=1
Purpose: Monitor dashboard on office displays
Features: All cards visible, no QR code clutter
```

### 2. Admin Management
```
URL: /admin/dashboard
Purpose: Full access to admin features
Features: Role-based cards, QR code, trend data
```

### 3. Mobile Sharing
```
URL: Scan QR code or click public link
Purpose: Share dashboard with stakeholders
Features: Read-only, all information visible
```

### 4. Quick Navigation
```
Purpose: Fast access to commonly used features
Features: One-click navigation to 7 key areas
```

## ✅ Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus states on interactive elements
- ARIA labels where needed
- Color contrast compliance
- Responsive font sizing

## 🎯 Performance

- Lazy loading of trend data
- Efficient role-based filtering
- Optimized re-renders
- Responsive images (SVG QR code)
- Minimal dependencies

## 📊 Analytics Potential

Future tracking opportunities:
- Card click tracking
- QR code scan tracking
- Public vs. authenticated usage
- Most accessed quick links
- Average time on dashboard
