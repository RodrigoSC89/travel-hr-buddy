# JobFormWithExamples Visual Guide

## 📊 Component Visual Overview

This guide provides visual layouts, user flow diagrams, UI specifications, responsive breakpoints, color schemes, and accessibility features for the JobFormWithExamples component.

## 🎨 Layout Structure

### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🧠 Criar Job com IA                                      [Sparkles] │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │  Crie um novo job de manutenção com sugestões inteligentes         │    │
│  │                                                                      │    │
│  │  Componente                                                          │    │
│  │  ┌────────────────────────────────────────────────────────────┐    │    │
│  │  │ Componente (ex: 603.0004.02)                               │    │    │
│  │  └────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  │  Descrição                                                           │    │
│  │  ┌────────────────────────────────────────────────────────────┐    │    │
│  │  │ Descreva o problema ou ação necessária...                  │    │    │
│  │  │                                                             │    │    │
│  │  │                                                             │    │    │
│  │  └────────────────────────────────────────────────────────────┘    │    │
│  │                                                                      │    │
│  │  ┌──────────────────┐                                              │    │
│  │  │ ✅ Criar Job     │                                              │    │
│  │  └──────────────────┘                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  💡 Exemplos Similares                                              │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │  Encontre casos históricos similares e use-os como base             │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────┐                          │    │
│  │  │ 🔍 Ver exemplos semelhantes          │                          │    │
│  │  └──────────────────────────────────────┘                          │    │
│  │                                                                      │    │
│  │  ┌────────────────────────────────────────────────────────────┐    │    │
│  │  │  📋 Similar Case #1                          Score: 0.95   │    │    │
│  │  │  Component: 603.0004.02                                    │    │    │
│  │  │  Date: 2024-01-15                                          │    │    │
│  │  │  Description: Example description...                       │    │    │
│  │  │  ┌─────────────────┐                                       │    │    │
│  │  │  │ Usar como base  │                                       │    │    │
│  │  │  └─────────────────┘                                       │    │    │
│  │  └────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (640px - 1024px)

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  🧠 Criar Job com IA         [Sparkles] │    │
│  │  ─────────────────────────────────────  │    │
│  │  Crie um novo job...                    │    │
│  │                                          │    │
│  │  Componente                              │    │
│  │  ┌────────────────────────────────┐     │    │
│  │  │ Componente (ex: 603.0004.02)   │     │    │
│  │  └────────────────────────────────┘     │    │
│  │                                          │    │
│  │  Descrição                               │    │
│  │  ┌────────────────────────────────┐     │    │
│  │  │ Descreva o problema...         │     │    │
│  │  │                                │     │    │
│  │  └────────────────────────────────┘     │    │
│  │                                          │    │
│  │  ┌──────────────────┐                   │    │
│  │  │ ✅ Criar Job     │                   │    │
│  │  └──────────────────┘                   │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  💡 Exemplos Similares                  │    │
│  │  ─────────────────────────────────────  │    │
│  │  Encontre casos históricos...           │    │
│  │                                          │    │
│  │  [Similar Examples List]                │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Mobile Layout (<640px)

```
┌─────────────────────────────┐
│                               │
│  ┌─────────────────────────┐ │
│  │ 🧠 Criar Job   [✨]     │ │
│  │ ─────────────────────   │ │
│  │ Sugestões inteligentes  │ │
│  │                         │ │
│  │ Componente              │ │
│  │ ┌─────────────────────┐ │ │
│  │ │ 603.0004.02         │ │ │
│  │ └─────────────────────┘ │ │
│  │                         │ │
│  │ Descrição               │ │
│  │ ┌─────────────────────┐ │ │
│  │ │ Problema...         │ │ │
│  │ │                     │ │ │
│  │ └─────────────────────┘ │ │
│  │                         │ │
│  │ ┌─────────────────────┐ │ │
│  │ │ ✅ Criar Job        │ │ │
│  │ └─────────────────────┘ │ │
│  └─────────────────────────┘ │
│                               │
│  ┌─────────────────────────┐ │
│  │ 💡 Exemplos             │ │
│  │ ─────────────────────   │ │
│  │ [Ver exemplos] 🔍       │ │
│  └─────────────────────────┘ │
│                               │
└─────────────────────────────┘
```

## 🔄 User Flow Diagram

### Step-by-Step User Journey

```
┌──────────────────┐
│  User arrives    │
│  at form page    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Step 1: Enter Component      │
│ ┌──────────────────────────┐ │
│ │ Input: "603.0004.02"     │ │
│ └──────────────────────────┘ │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Step 2: Describe Problem     │
│ ┌──────────────────────────┐ │
│ │ Textarea: "Problema..."  │ │
│ └──────────────────────────┘ │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Step 3: View Examples        │
│ ┌──────────────────────────┐ │
│ │ Click: "Ver exemplos"    │ │
│ └──────────────────────────┘ │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Step 4: AI Processing        │
│   • Query embeddings         │
│   • Search historical data   │
│   • Calculate similarity     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Step 5: Display Results      │
│ ┌──────────────────────────┐ │
│ │ Similar Case #1  (0.95)  │ │
│ │ Similar Case #2  (0.89)  │ │
│ │ Similar Case #3  (0.85)  │ │
│ └──────────────────────────┘ │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Step 6: Select Example       │
│ ┌──────────────────────────┐ │
│ │ Click: "Usar como base"  │ │
│ └──────────────────────────┘ │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Auto-fill Description        │
│ ✅ Toast: "Exemplo aplicado"│
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Review & Edit (Optional)     │
│ User can modify text         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Submit Job                   │
│ ┌──────────────────────────┐ │
│ │ Click: "Criar Job"       │ │
│ └──────────────────────────┘ │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Success Notification         │
│ ✅ "Job criado com sucesso!" │
│ Form resets automatically    │
└──────────────────────────────┘
```

## 🎨 UI Specifications

### Color Scheme

#### Primary Colors
- **Primary**: `hsl(var(--primary))` - Main action buttons, icons
- **Primary Foreground**: `hsl(var(--primary-foreground))` - Text on primary backgrounds
- **Secondary**: `hsl(var(--secondary))` - Secondary elements
- **Muted**: `hsl(var(--muted))` - Disabled states, placeholders

#### Status Colors
- **Success**: `hsl(142, 76%, 36%)` - Success messages, checkmarks
- **Destructive**: `hsl(var(--destructive))` - Error states
- **Warning**: `hsl(38, 92%, 50%)` - Warning messages
- **Info**: `hsl(199, 89%, 48%)` - Info messages

#### Neutral Colors
- **Background**: `hsl(var(--background))` - Page background
- **Card**: `hsl(var(--card))` - Card backgrounds
- **Border**: `hsl(var(--border))` - Borders and dividers

### Typography

#### Font Families
- **Sans**: `Inter, system-ui, sans-serif` - Body text
- **Mono**: `JetBrains Mono, monospace` - Code snippets

#### Font Sizes
- **xs**: `0.75rem` (12px) - Labels, captions
- **sm**: `0.875rem` (14px) - Body text
- **base**: `1rem` (16px) - Default
- **lg**: `1.125rem` (18px) - Subheadings
- **xl**: `1.25rem` (20px) - Card titles
- **2xl**: `1.5rem` (24px) - Page titles

#### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Labels
- **Semibold**: 600 - Headings
- **Bold**: 700 - Emphasis

### Spacing

#### Padding
- **Card**: `p-6` (1.5rem) - Card content padding
- **Input**: `px-3 py-2` - Input field padding
- **Button**: `px-4 py-2` - Button padding

#### Margins
- **Section**: `space-y-6` (1.5rem) - Between sections
- **Field**: `space-y-2` (0.5rem) - Between label and input
- **Card**: `space-y-4` (1rem) - Within cards

### Border Radius
- **Input**: `rounded-md` (0.375rem)
- **Card**: `rounded-lg` (0.5rem)
- **Button**: `rounded-md` (0.375rem)

### Shadows
- **Card**: `shadow-sm` - Subtle elevation
- **Button Hover**: `shadow-md` - Hover state elevation
- **Modal**: `shadow-lg` - Maximum elevation

## 📱 Responsive Breakpoints

### Breakpoint Definitions

```typescript
const breakpoints = {
  mobile: '< 640px',
  tablet: '640px - 1024px',
  desktop: '> 1024px',
  ultrawide: '> 1920px'
};
```

### Layout Changes by Breakpoint

#### Mobile (< 640px)
- Single column layout
- Stacked cards
- Full-width inputs
- Compact button sizes
- Reduced padding: `p-4`
- Font size: `text-sm`

#### Tablet (640px - 1024px)
- Single column layout
- Standard card spacing
- Full-width inputs
- Standard button sizes
- Standard padding: `p-6`
- Font size: `text-base`

#### Desktop (> 1024px)
- Two-column option available
- Larger card widths
- Fixed input widths
- Standard button sizes
- Standard padding: `p-6`
- Font size: `text-base`

#### Ultra-wide (> 1920px)
- Centered layout with max-width
- Larger spacing between elements
- Increased padding: `p-8`
- Font size: `text-lg`

### Responsive Component Behavior

```typescript
// Mobile
<div className="grid grid-cols-1 gap-4">
  {/* Single column */}
</div>

// Tablet
<div className="grid sm:grid-cols-1 gap-6">
  {/* Single column with more spacing */}
</div>

// Desktop
<div className="grid lg:grid-cols-2 gap-8">
  {/* Optional two-column layout */}
</div>
```

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
- **Tab Order**: Sequential and logical
- **Enter Key**: Submits form
- **Escape Key**: Clears focus
- **Arrow Keys**: Navigate suggestions

#### Screen Reader Support
- **ARIA Labels**: All inputs properly labeled
- **ARIA Descriptions**: Contextual help text
- **ARIA Live Regions**: Dynamic content announcements
- **ARIA Invalid**: Error state announcements

#### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: 3:1 minimum
- **Status Messages**: High contrast for visibility

### Accessibility Implementation

```tsx
// Input with ARIA
<Input
  id="component"
  aria-label="Component code"
  aria-describedby="component-hint"
  aria-required="true"
  aria-invalid={hasError}
/>

// Textarea with ARIA
<Textarea
  id="description"
  aria-label="Job description"
  aria-describedby="description-hint"
  aria-required="true"
  rows={4}
/>

// Button with state
<Button
  disabled={!isValid}
  aria-disabled={!isValid}
  aria-label="Create maintenance job"
>
  ✅ Criar Job
</Button>
```

### Focus Management

#### Focus Indicators
- **Visible**: Clear outline on focus
- **High Contrast**: Blue ring with 2px width
- **Consistent**: Same style across all elements

#### Focus Styles
```css
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Error Handling

#### Visual Indicators
- Red border on invalid inputs
- Error icon next to field
- Error message below field
- Toast notification for form errors

#### Screen Reader Announcements
```tsx
<span role="alert" aria-live="assertive">
  {errorMessage}
</span>
```

## 🎭 Interactive States

### Button States

#### Default
- Background: Primary color
- Text: Primary foreground
- Cursor: Pointer

#### Hover
```css
:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

#### Active
```css
:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### Disabled
```css
:disabled {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  cursor: not-allowed;
  opacity: 0.5;
}
```

### Input States

#### Default
- Border: Neutral gray
- Background: White/Card
- Placeholder: Muted text

#### Focus
```css
:focus {
  border-color: hsl(var(--ring));
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

#### Error
```css
.error {
  border-color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 0.05);
}
```

#### Success
```css
.success {
  border-color: hsl(142, 76%, 36%);
}
```

## 🎬 Animation Specifications

### Transitions

#### Duration
- **Fast**: 150ms - Hover effects
- **Standard**: 200ms - State changes
- **Slow**: 300ms - Complex animations

#### Easing
- **Ease-in-out**: Default for most transitions
- **Ease-out**: For appearing elements
- **Ease-in**: For disappearing elements

### Animation Examples

#### Button Hover
```css
transition: all 0.15s ease-in-out;
```

#### Card Appearance
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

animation: fadeIn 0.3s ease-out;
```

#### Toast Notification
```css
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

animation: slideIn 0.2s ease-out;
```

## 📐 Grid System

### Layout Grid

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

/* Form takes 12 columns on mobile, 8 on desktop */
.form-section {
  grid-column: span 12;
}

@media (min-width: 1024px) {
  .form-section {
    grid-column: span 8;
  }
}
```

## 🔍 Component Variants

### Form Variants

#### Compact
- Reduced padding
- Smaller font sizes
- Minimal spacing

#### Standard (Default)
- Normal padding
- Standard font sizes
- Comfortable spacing

#### Spacious
- Increased padding
- Larger font sizes
- Extra spacing

## 📊 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load SimilarExamples only when needed
2. **Debouncing**: Search queries debounced to 300ms
3. **Memoization**: Expensive computations cached
4. **Virtual Scrolling**: For long lists of examples

### Bundle Size

- **JobFormWithExamples**: ~8KB (gzipped)
- **SimilarExamples**: ~6KB (gzipped)
- **Total Dependencies**: ~15KB (gzipped)

## 🎨 Theme Support

### Light Theme
- Background: White
- Text: Dark gray
- Cards: Light gray
- Borders: Light gray

### Dark Theme
- Background: Dark gray
- Text: White
- Cards: Darker gray
- Borders: Gray

### Theme Implementation
```tsx
// Automatically adapts to system theme
className="bg-background text-foreground"
```

## 📱 Touch Target Sizes

### Minimum Sizes (WCAG 2.1 AA)

- **Buttons**: 44x44px minimum
- **Input Fields**: 44px height minimum
- **Clickable Areas**: 48x48px recommended
- **Spacing**: 8px minimum between targets

### Implementation
```tsx
<Button className="min-h-[44px] min-w-[44px]">
  Submit
</Button>
```

## 🎯 Z-Index Layers

```typescript
const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  overlay: 1030,
  modal: 1040,
  popover: 1050,
  toast: 1060,
  tooltip: 1070
};
```

## 📏 Component Measurements

### Card Dimensions
- **Min Height**: 200px
- **Max Width**: 800px (form), 600px (examples)
- **Padding**: 24px (desktop), 16px (mobile)

### Input Dimensions
- **Height**: 40px
- **Min Width**: 200px
- **Max Width**: 100%

### Button Dimensions
- **Height**: 40px
- **Min Width**: 100px
- **Padding**: 16px horizontal, 8px vertical

---

**Last Updated**: October 2024  
**Version**: 1.0.0  
**Maintainer**: Travel HR Buddy Team
