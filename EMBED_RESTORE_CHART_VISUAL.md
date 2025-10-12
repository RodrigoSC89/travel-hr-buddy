# Embed Restore Chart - Visual Guide

## 📐 Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  📊 Dashboard de Restaurações                                 │
│  Estatísticas e análises visuais de logs de restauração       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────┐│
│  │ 📦 Total     │  │ 📁 Docs      │  │ 📊 Média     │  │ 🕒 │
│  │ Restaurações │  │ Únicos       │  │ por Dia      │  │ Últ│
│  │              │  │              │  │              │  │ Exe│
│  │    245       │  │     89       │  │    12.3      │  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────┘│
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐ │
│  │ 📈 Restaurações por Dia     │  │ 🎯 Distribuição Status  │ │
│  │                             │  │                         │ │
│  │     ███                     │  │        ┌─────┐          │ │
│  │     ███        ███          │  │       /       \         │ │
│  │ ███ ███    ███ ███      ███ │  │      │ Success │        │ │
│  │ ███ ███ ██ ███ ███ ███  ███ │  │      │  Error  │        │ │
│  │ ███ ███ ██ ███ ███ ███  ███ │  │       \ Pend. /         │ │
│  │                             │  │        └─────┘          │ │
│  │ 01  02  03  04  05  06  07  │  │   ■ Success  ■ Error   │ │
│  │                             │  │   ■ Pending            │ │
│  └─────────────────────────────┘  └─────────────────────────┘ │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Atualizado em tempo real • Dashboard de Restaurações         │
└────────────────────────────────────────────────────────────────┘
```

## 🎨 Visual Hierarchy

### Header Section
```
┌────────────────────────────────────────────┐
│ 📊 Dashboard de Restaurações              │  ← 28px, Bold, #111827
│ Estatísticas e análises visuais...        │  ← 14px, Regular, #6b7280
└────────────────────────────────────────────┘
```

### Statistics Cards (4 Cards)
```
┌─────────────────────────────┐
│ 📦 Total de Restaurações    │  ← 13px, Medium, #6b7280
│                             │
│         245                 │  ← 32px, Bold, #111827
│                             │
└─────────────────────────────┘
  ↑ Background: #f9fafb
  ↑ Border: 1px solid #e5e7eb
  ↑ Border Radius: 8px
  ↑ Padding: 20px
```

### Chart Containers
```
┌──────────────────────────────────────────┐
│ 📈 Restaurações por Dia (Últimos 7 Dias)│  ← 18px, Semibold
│                                          │
│  [Chart Area - 320px height]            │
│                                          │
│                                          │
└──────────────────────────────────────────┘
  ↑ Background: #ffffff
  ↑ Border: 1px solid #e5e7eb
  ↑ Border Radius: 12px
  ↑ Box Shadow: 0 1px 3px rgba(0,0,0,0.1)
  ↑ Padding: 24px
```

## 📏 Dimensions & Spacing

### Desktop Layout (>1024px)
```
Total Width: 1200px (max-width)
Main Padding: 32px 24px

┌─Header──────────────────────────────────┐
│ Height: auto                             │
│ Margin-bottom: 32px                      │
└──────────────────────────────────────────┘

┌─Statistics Cards────────────────────────┐
│ Grid: 4 columns                          │
│ Gap: 16px                                │
│ Min-width per card: 250px                │
│ Margin-bottom: 32px                      │
└──────────────────────────────────────────┘

┌─Charts Grid─────────────────────────────┐
│ Grid: 2 columns                          │
│ Gap: 24px                                │
│ Min-width per chart: 480px               │
│ Chart height: 320px                      │
└──────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
Total Width: 100% (fluid)
Main Padding: 24px 16px

┌─Statistics Cards────────────────────────┐
│ Grid: 1 column (stacked)                 │
│ Gap: 12px                                │
└──────────────────────────────────────────┘

┌─Charts Grid─────────────────────────────┐
│ Grid: 1 column (stacked)                 │
│ Gap: 16px                                │
│ Chart height: 280px                      │
└──────────────────────────────────────────┘
```

## 🎨 Color Specifications

### Text Colors
```css
Primary Heading:    #111827  (Gray-900)
Secondary Text:     #6b7280  (Gray-600)
Muted Text:         #9ca3af  (Gray-400)
```

### Background Colors
```css
Page Background:    #ffffff  (White)
Card Background:    #f9fafb  (Gray-50)
Border Color:       #e5e7eb  (Gray-200)
```

### Chart Colors
```css
/* Bar Chart */
Primary Blue:       #3b82f6  (Blue-500)

/* Pie Chart */
Success Green:      #10b981  (Emerald-500)
Error Red:          #ef4444  (Red-500)
Pending Amber:      #f59e0b  (Amber-500)
```

### Interactive States
```css
/* Hover States */
Card Hover:         box-shadow: 0 4px 6px rgba(0,0,0,0.1)

/* Loading Spinner */
Spinner Border:     #e5e7eb  (Gray-200)
Spinner Active:     #3b82f6  (Blue-500)
```

## 📊 Chart Specifications

### Bar Chart (Restoration by Day)

**Type**: Vertical Bar Chart
**Data Points**: 7 (last 7 days)
**X-Axis**: Dates (DD/MM format)
**Y-Axis**: Count (integer, starts at 0)

**Visual Properties**:
```javascript
{
  backgroundColor: "#3b82f6",
  borderRadius: 4,
  barThickness: "auto",
  maxBarThickness: 60
}
```

**Tooltip Format**:
```
Restaurações: [count]
```

### Pie Chart (Status Distribution)

**Type**: Doughnut/Pie Chart
**Segments**: 3 (Success, Error, Pending)
**Legend Position**: Bottom
**Colors**:
- Success: #10b981 (Green)
- Error: #ef4444 (Red)
- Pending: #f59e0b (Amber)

**Tooltip Format**:
```
[Label]: [count] ([percentage]%)
Example: Success: 45 (75.0%)
```

## 🔤 Typography

### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 
             'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Font Sizes & Weights
```css
/* Headings */
h1 (Dashboard Title):    28px / 700
h2 (Chart Titles):       18px / 600

/* Statistics */
Stat Label:              13px / 500
Stat Value (large):      32px / 700
Stat Value (small):      16px / 600

/* Body Text */
Description:             14px / 400
Footer:                  12px / 400
```

## 📱 Responsive Grid Layouts

### Statistics Cards Grid
```css
/* Desktop: 4 columns */
@media (min-width: 1024px) {
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Tablet: 2 columns */
@media (min-width: 768px) and (max-width: 1023px) {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Mobile: 1 column */
@media (max-width: 767px) {
  grid-template-columns: 1fr;
  gap: 12px;
}
```

### Charts Grid
```css
/* Desktop: 2 columns */
@media (min-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* Tablet & Mobile: 1 column */
@media (max-width: 1023px) {
  grid-template-columns: 1fr;
  gap: 16px;
}
```

## 🎭 Component States

### Loading State
```
┌────────────────────────────────────┐
│                                    │
│         ◐ (spinning)               │  ← 48px diameter
│                                    │     Blue (#3b82f6)
│    Carregando dados...             │  ← 14px, #666
│                                    │
└────────────────────────────────────┘
```

### Empty State (No Data)
```
┌────────────────────────────────────┐
│                                    │
│                                    │
│   Nenhum dado disponível           │  ← 14px, #9ca3af
│                                    │     Centered
│                                    │
└────────────────────────────────────┘
```

### Error State (Unauthorized)
```
┌────────────────────────────────────┐
│          🛡️                         │  ← 64px icon
│                                    │
│      Acesso Negado                 │  ← 24px, Bold
│                                    │
│   O token de acesso fornecido...  │  ← 14px, Regular
│                                    │
│   [Voltar para página inicial]    │  ← Button
│                                    │
└────────────────────────────────────┘
```

## 🖼️ Visual Examples

### Example 1: Desktop View (1200px)
```
├─ Header (full width)
├─ 4 Cards in row
│  ├─ Total: 245
│  ├─ Unique: 89
│  ├─ Avg: 12.3
│  └─ Last: 12/10/2025
├─ 2 Charts side-by-side
│  ├─ Bar Chart (600px)
│  └─ Pie Chart (600px)
└─ Footer (full width)
```

### Example 2: Mobile View (375px)
```
├─ Header (full width)
├─ 4 Cards stacked
│  ├─ Total: 245
│  ├─ Unique: 89
│  ├─ Avg: 12.3
│  └─ Last: 12/10/2025
├─ 2 Charts stacked
│  ├─ Bar Chart (100%)
│  └─ Pie Chart (100%)
└─ Footer (full width)
```

## 🎯 Accessibility

### Color Contrast
- Text on white background: WCAG AAA compliant
- Chart colors: Distinguishable for colorblind users

### Semantic HTML
```html
<div role="main">
  <h1>Dashboard Title</h1>
  <section aria-label="Statistics">...</section>
  <section aria-label="Charts">...</section>
</div>
```

### Interactive Elements
- Charts have hover tooltips
- All interactive elements keyboard accessible
- Loading states announced to screen readers

## 📐 Spacing Scale

```css
--spacing-xs:   4px
--spacing-sm:   8px
--spacing-md:   12px
--spacing-lg:   16px
--spacing-xl:   20px
--spacing-2xl:  24px
--spacing-3xl:  32px
```

## 🎨 Design Tokens

```javascript
const tokens = {
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  transition: {
    default: 'all 0.2s ease-in-out',
  }
};
```

## 🖥️ Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📏 Print Layout

When printed, the dashboard:
- Uses white background
- Charts scale to fit page
- Footer shows URL and date
- Removes interactive tooltips
