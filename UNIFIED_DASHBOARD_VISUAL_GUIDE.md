# Unified Dashboard - Visual Guide

## Dashboard Layout

The unified dashboard consists of the following sections:

### 1. Navigation Cards Grid
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │ ✅ Checklists │  │ 📦 Restaurações│ │ 🤖 Histórico  │      │
│  │               │  │    Pessoais    │  │    de IA      │      │
│  │ Progresso e   │  │ Seu painel    │  │ Consultas     │      │
│  │ status por    │  │ diário com    │  │ recentes e    │      │
│  │ equipe        │  │ gráfico       │  │ exportações   │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Trend Chart (if data available)
```
┌─────────────────────────────────────────────────────────────────┐
│ 📈 Restaurações (últimos 15 dias)                              │
│                                                                 │
│     │                                                           │
│  10 │     ▄▄▄                                                   │
│   8 │   ▄▄███▄▄                                                 │
│   6 │  ▄██████▄▄                                                │
│   4 │ ▄████████▄                                                │
│   2 │▄████████████▄                                             │
│   0 └─────────────────────────────────────────────────         │
│       12/10  13/10  14/10  15/10  ...                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. QR Code Section (Normal Mode Only)
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔗 Link público com QR Code                                     │
│                                                                 │
│ Compartilhe este painel com acesso de leitura:                 │
│                                                                 │
│ http://localhost:3000/admin/dashboard?public=1                 │
│                                                                 │
│   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                            │
│   █ ▄▄▄▄▄ █ █▀█ █                                              │
│   █ █   █ █▄  ▀▄█                                              │
│   █ █▄▄▄█ █ ▀ ▀ █                                              │
│   █▄▄▄▄▄▄▄█▄█▄█▄█                                              │
│   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Public Mode Indicator (Public Mode Only)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│               🔒 Modo público somente leitura                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Role-Based Card Visibility

### Admin Role
- ✅ Checklists (shown)
- ✅ Restaurações Pessoais (shown)
- ✅ Histórico de IA (shown)

### User Role
- ❌ Checklists (hidden)
- ✅ Restaurações Pessoais (shown)
- ❌ Histórico de IA (hidden)

### Gestor Role
- ✅ Checklists (shown)
- ✅ Restaurações Pessoais (shown)
- ✅ Histórico de IA (shown)

### Public Mode (No Authentication)
- ✅ Checklists (shown)
- ✅ Restaurações Pessoais (shown)
- ✅ Histórico de IA (shown)
- ⚠️ Read-only indicator displayed
- ❌ QR Code section hidden

## URL Patterns

### Normal Access
```
http://localhost:3000/admin/dashboard
```
- Requires authentication
- Shows cards based on user role
- Displays QR code section
- Full interactive access

### Public Access
```
http://localhost:3000/admin/dashboard?public=1
```
- No authentication required
- Shows all cards
- Hides QR code section
- Read-only indicator displayed
- Navigation links include ?public=1 parameter

## Responsive Design

### Mobile (< 768px)
- Cards stack vertically (1 column)
- Full width cards
- Chart adjusts to container

### Tablet (768px - 1280px)
- Cards in 2 columns
- Responsive spacing

### Desktop (> 1280px)
- Cards in 3 columns
- Maximum layout width
- Optimal spacing

## Color Scheme

- Navigation Cards: White background with hover shadow
- Chart Bars: Indigo (#4f46e5)
- Public URL: Blue (#2563eb)
- QR Code: Black & White
- Public Mode Text: Muted foreground color

## Interactions

### Card Hover Effect
- Increases shadow on hover
- Smooth transition
- Cursor changes to pointer

### Navigation
- Click on card to navigate
- Maintains public mode if applicable
- Uses React Router navigation

### Chart
- Hover over bars to see tooltip
- Displays day and count
- Interactive X/Y axes

## Data Flow

```
User visits /admin/dashboard
           ↓
    Check URL params
           ↓
    Set public mode (if ?public=1)
           ↓
    Fetch user role (if not public)
           ↓
    Fetch trend data from Supabase
           ↓
    Render cards based on role
           ↓
    Render chart if data exists
           ↓
    Render QR code (if not public)
```

## Error Handling

Currently minimal error handling:
- Missing data returns empty array
- Failed RPC calls are silent
- Default role is 'user' if not found

## Performance Considerations

- Components render efficiently
- Supabase RPC calls on mount
- Chart only renders if data exists
- QR code generation is lightweight
- No unnecessary re-renders
