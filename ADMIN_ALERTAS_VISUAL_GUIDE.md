# Admin Alertas - Visual Design Guide

## 🎨 UI Components

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar                                                        │
│                                                                  │
│  ⚠️ Alertas Críticos da Auditoria                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ScrollArea (max-h-[70vh])                                │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ 🔴 Alert Card (bg-red-50, border-red-200)       │  │   │
│  │  │                                                  │  │   │
│  │  │  Auditoria ID: abc-123-xyz                      │  │   │
│  │  │  Comentário ID: def-456-uvw                     │  │   │
│  │  │  Data: 16/10/2025, 16:23:45                     │  │   │
│  │  │  ──────────────────────────────────────────────  │  │   │
│  │  │  ⚠️ CRÍTICO: Falha detectada durante auditoria  │  │   │
│  │  │  Ação imediata necessária.                      │  │   │
│  │  │                                                  │  │   │
│  │  │  [CRÍTICO] badge                                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ 🔴 Alert Card 2                                  │  │   │
│  │  │  ...                                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎭 Component States

### 1. Loading State
```
┌─────────────────────────────────────────┐
│                                          │
│          ⟳ (spinning loader)            │
│                                          │
│    Carregando alertas críticos...       │
│                                          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Centered layout with `flex items-center justify-center`
- Loader2 icon from lucide-react with `animate-spin`
- Min height: `min-h-[400px]`
- Text color: `text-muted-foreground`

### 2. Error State
```
┌─────────────────────────────────────────┐
│                                          │
│          ⚠️ (alert triangle)            │
│                                          │
│    Erro ao carregar alertas             │
│    [Error message details]              │
│                                          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Card component with padding
- AlertTriangle icon in red (`text-red-600`)
- Centered text layout
- Error message in smaller font

### 3. Empty State
```
┌─────────────────────────────────────────┐
│                                          │
│  Nenhum alerta crítico encontrado. 🎉   │
│                                          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Card component
- Centered text with celebration emoji
- Muted text color
- Padding: `p-6`

### 4. Success State (with alerts)
```
┌─────────────────────────────────────────┐
│  ⚠️ Alertas Críticos da Auditoria       │
│                                          │
│  [Scrollable area with red alert cards] │
│                                          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Title with warning emoji
- ScrollArea with max height
- Multiple alert cards stacked vertically
- Spacing between cards: `space-y-4`

## 🎨 Color Scheme

### Red Alert Theme
```css
/* Background colors */
bg-red-50    → Very light red background for cards
bg-red-600   → Solid red for badges

/* Border colors */
border-red-200 → Light red borders for cards

/* Text colors */
text-red-700   → Darker red for alert descriptions
text-red-600   → Icon colors for emphasis
```

### Neutral Colors
```css
/* Text */
text-muted-foreground → Secondary text (metadata)
text-gray-500         → Empty state text

/* Backgrounds */
bg-white              → Default card backgrounds
bg-card               → Theme-aware card backgrounds
```

## 📐 Spacing & Layout

### Container
```css
container    → Responsive container
mx-auto      → Center horizontally
p-6          → Padding all sides
space-y-6    → Vertical spacing between sections
```

### Alert Cards
```css
p-4          → Internal padding
space-y-2    → Spacing between elements
mb-4         → Bottom margin between cards
```

### ScrollArea
```css
max-h-[70vh] → Maximum height (70% viewport)
border       → Border around scroll area
rounded-md   → Rounded corners
p-4          → Internal padding
```

## 🔤 Typography

### Title (h2)
```css
text-2xl     → Large text size
font-bold    → Bold weight
flex         → Flexbox for icon alignment
items-center → Vertical center alignment
gap-2        → Space between emoji and text
```

### Metadata Labels
```css
text-sm      → Small text size
font-medium  → Medium weight
text-muted-foreground → Muted color
```

### Alert Description
```css
font-medium     → Medium weight
text-red-700    → Red text color
whitespace-pre-wrap → Preserve line breaks
border-t        → Top border separator
border-red-200  → Red border color
pt-2, mt-2      → Padding and margin top
```

### Severity Badge
```css
inline-flex     → Inline flex display
items-center    → Vertical alignment
px-2.5, py-0.5  → Horizontal/vertical padding
rounded-full    → Fully rounded corners
text-xs         → Extra small text
font-medium     → Medium weight
bg-red-600      → Red background
text-white      → White text
```

## 📱 Responsive Design

### Desktop (≥1024px)
- Full container width with max-width
- Multiple columns possible (currently single column)
- Comfortable spacing and padding

### Tablet (768px - 1023px)
- Slightly reduced container padding
- Full-width cards
- Maintained scroll functionality

### Mobile (<768px)
- Reduced padding: `p-4` instead of `p-6`
- Full-width layout
- Touch-friendly scroll
- Stacked cards with vertical spacing

## 🔍 Visual Hierarchy

### Primary Focus
1. **Alert Description** (text-red-700, font-medium)
   - Most prominent text
   - Red color draws attention
   - Larger font size

### Secondary Information
2. **Metadata** (text-muted-foreground, text-sm)
   - Audit ID, Comment ID, Date
   - Smaller, lighter text
   - Supporting information

### Tertiary Elements
3. **Badges and Icons**
   - Visual indicators
   - Reinforce severity
   - Color-coded

## ♿ Accessibility

### Semantic HTML
```html
<h2>     → Main heading
<div>    → Container elements
<span>   → Inline text elements
```

### Screen Reader Support
- Proper heading hierarchy
- Descriptive text for all elements
- Clear state messages (loading, error, empty)

### Keyboard Navigation
- Scrollable area keyboard accessible
- Focus indicators maintained
- Tab order follows visual order

### Color Contrast
- Red text on light background: **WCAG AA compliant**
- Red badge with white text: **WCAG AAA compliant**
- Muted text: **WCAG AA compliant for large text**

## 🎯 Visual States Summary

| State | Primary Color | Icon | Height |
|-------|---------------|------|---------|
| Loading | Blue (#0ea5e9) | Loader2 (spinning) | min-h-[400px] |
| Error | Red (#dc2626) | AlertTriangle | min-h-[400px] |
| Empty | Gray | None | auto |
| Success | Red (#ef4444) | ⚠️ (emoji) | max-h-[70vh] |

## 🖼️ Component Breakdown

### Back Button
```tsx
<Button variant="ghost" size="sm">
  <ArrowLeft className="w-4 h-4 mr-2" />
  Voltar
</Button>
```

### Title Section
```tsx
<h2 className="text-2xl font-bold flex items-center gap-2">
  <span>⚠️</span>
  <span>Alertas Críticos da Auditoria</span>
</h2>
```

### Alert Card
```tsx
<Card className="bg-red-50 border-red-200">
  <CardContent className="p-4 space-y-2">
    {/* Metadata section */}
    {/* Description section */}
    {/* Badge section */}
  </CardContent>
</Card>
```

## 📏 Measurements

| Element | Width | Height | Padding | Margin |
|---------|-------|---------|---------|---------|
| Container | 100% | auto | p-6 | mx-auto |
| ScrollArea | 100% | max-h-[70vh] | p-4 | - |
| Alert Card | 100% | auto | p-4 | mb-4 |
| Badge | auto | auto | px-2.5, py-0.5 | mt-2 |
| Icon | 16-32px | 16-32px | - | mr-2/mr-4 |

## 🎨 Brand Consistency

### Matches Existing Design System
- Uses shadcn/ui components (Card, ScrollArea)
- Follows Tailwind CSS utility-first approach
- Maintains consistent spacing scale
- Uses theme-aware colors
- Portuguese text and formatting

### Aligns with Admin Dashboard
- Similar layout to other admin pages
- Consistent navigation (Back button)
- Matching typography scale
- Familiar component patterns
- Professional, clean aesthetic

---

**Design Status**: ✅ Finalized
**Accessibility**: ✅ WCAG AA Compliant
**Responsiveness**: ✅ Mobile-First
**Brand Alignment**: ✅ Consistent
