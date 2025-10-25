# 🚀 Design System Quick Reference

## PATCH 126.0-130.0 - Quick Start Guide

### 📦 Import What You Need

```typescript
// Theme tokens
import { theme } from '@/theme';
import { colors, spacing, fontSize, breakpoints } from '@/theme';

// Components
import AnimatedPage from '@/components/ui/AnimatedPage';
import { ModuleLoader, CompactLoader, SkeletonLoader } from '@/components/ui/ModuleLoader';

// Theme management
import { useTheme } from '@/hooks/useTheme';
import { initializeTheme, toggleTheme, setTheme } from '@/lib/theme/theme-utils';
```

---

## 🎨 Common Patterns

### Page with Transitions
```tsx
import AnimatedPage from '@/components/ui/AnimatedPage';

export default function MyPage() {
  return (
    <AnimatedPage>
      {/* Your content */}
    </AnimatedPage>
  );
}
```

### Dark Mode Toggle
```tsx
import { useTheme } from '@/hooks/useTheme';

function Header() {
  const { toggleTheme, isDark } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

### Lazy Loading Module
```tsx
import { lazy, Suspense } from 'react';
import { ModuleLoader } from '@/components/ui/ModuleLoader';

const HeavyModule = lazy(() => import('./HeavyModule'));

export function MyComponent() {
  return (
    <Suspense fallback={<ModuleLoader message="Loading..." />}>
      <HeavyModule />
    </Suspense>
  );
}
```

### Responsive Layout
```tsx
// 12-column responsive grid
<div className="container mx-auto">
  <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
    <div className="col-span-4">Sidebar</div>
    <div className="col-span-8">Main Content</div>
  </div>
</div>

// Responsive padding
<div className="px-4 md:px-6 lg:px-8">Content</div>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">Heading</h1>
```

### Loading States
```tsx
import { ModuleLoader, CompactLoader, SkeletonLoader } from '@/components/ui/ModuleLoader';

// Full screen
<ModuleLoader message="Loading..." />

// Inline
<CompactLoader message="Loading data..." />

// Content placeholder
<SkeletonLoader />
```

---

## 🎯 Design Tokens Reference

### Colors
```tsx
// Usage in styles
style={{ color: theme.colors.primary[500] }}
style={{ backgroundColor: theme.colors.maritime.ocean[500] }}

// Tailwind classes
className="bg-primary-500 text-white"
className="dark:bg-gray-900 dark:text-white"
```

### Spacing
```tsx
// Direct usage
style={{ padding: theme.spacing[4] }}   // 16px
style={{ margin: theme.spacing[8] }}    // 32px

// Tailwind classes
className="p-4 m-8 gap-6"
className="px-4 md:px-8 lg:px-12"
```

### Typography
```tsx
// Font sizes
style={{ fontSize: theme.fontSize.base }}    // 1rem
style={{ fontSize: theme.fontSize['2xl'] }}  // 1.5rem

// Tailwind classes
className="text-base md:text-lg lg:text-xl"
className="font-heading font-bold"
```

### Breakpoints
```tsx
import { matchesBreakpoint, mediaQuery } from '@/theme';

// Check in JS
if (matchesBreakpoint('lg')) {
  // Desktop layout
}

// Media query string
const query = mediaQuery('md'); // "@media (min-width: 768px)"
```

---

## 🌓 Theme Values

### Available Themes
- `'light'` - Force light mode
- `'dark'` - Force dark mode
- `'system'` - Follow system preference (default)

### Theme Hook API
```tsx
const {
  theme,           // 'light' | 'dark' | 'system'
  effectiveTheme,  // 'light' | 'dark' (resolved)
  isDark,          // boolean
  setTheme,        // (theme) => void
  toggleTheme,     // () => void
} = useTheme();
```

---

## 🎬 Animation Presets

```tsx
import { AnimatedPageWithPreset } from '@/components/ui/AnimatedPage';

// Available presets
<AnimatedPageWithPreset preset="fade">...</AnimatedPageWithPreset>
<AnimatedPageWithPreset preset="slideRight">...</AnimatedPageWithPreset>
<AnimatedPageWithPreset preset="slideLeft">...</AnimatedPageWithPreset>
<AnimatedPageWithPreset preset="scale">...</AnimatedPageWithPreset>
<AnimatedPageWithPreset preset="slideUp">...</AnimatedPageWithPreset>
```

---

## 📐 Grid Columns by Breakpoint

| Breakpoint | Screen Width | Columns |
|------------|--------------|---------|
| xs         | 320px+       | 4       |
| sm         | 640px+       | 6       |
| md         | 768px+       | 8       |
| lg         | 1024px+      | 12      |
| xl         | 1280px+      | 12      |
| 2xl        | 1536px+      | 12      |

---

## 🎨 Tailwind Utilities

### Container
```tsx
// Centered with responsive padding
<div className="container mx-auto">...</div>
```

### Dark Mode
```tsx
// Apply dark mode styles
<div className="bg-white dark:bg-gray-900">
  <p className="text-black dark:text-white">Text</p>
</div>
```

### Responsive Display
```tsx
// Show/hide at breakpoints
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive columns */}
</div>
```

---

## 🔧 Common Recipes

### Card with Dark Mode
```tsx
<div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300">
    Card content
  </p>
</div>
```

### Button with Animation
```tsx
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg 
                   hover:bg-primary/90 transition-colors duration-200">
  Click Me
</button>
```

### Form Input Dark Mode
```tsx
<input 
  type="text"
  className="w-full px-4 py-2 border rounded-lg
             bg-white dark:bg-gray-800
             border-gray-300 dark:border-gray-600
             text-gray-900 dark:text-white
             focus:ring-2 focus:ring-primary"
/>
```

### Modal with Animation
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md"
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 📱 Responsive Patterns

### Mobile-First Approach
```tsx
// Start with mobile, add larger screens
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="flex flex-col md:flex-row gap-4">
  {/* Stack on mobile, row on desktop */}
</div>
```

### Responsive Spacing
```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  Responsive padding
</div>

<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Responsive vertical spacing */}
</div>
```

---

## 🎓 Best Practices

### ✅ DO
- Use theme tokens for consistency
- Wrap pages with `AnimatedPage`
- Lazy load heavy modules
- Use dark mode classes
- Follow mobile-first approach
- Add ARIA labels for accessibility

### ❌ DON'T
- Hardcode colors or spacing
- Skip loading states
- Ignore dark mode
- Forget responsive breakpoints
- Skip accessibility attributes

---

## 📚 Full Documentation

For complete documentation, see:
- **Full Guide**: `DESIGN_SYSTEM_DOCUMENTATION.md`
- **Demo Page**: Navigate to `/design-system-demo`
- **Source Code**: `src/theme/`, `src/components/ui/`, `src/hooks/`

---

## 🆘 Troubleshooting

### Theme not persisting?
```typescript
// Ensure theme is initialized in main.tsx
import { initializeTheme } from '@/lib/theme/theme-utils';
initializeTheme();
```

### Animations not working?
```typescript
// Check Framer Motion is imported
import { motion } from 'framer-motion';
```

### Lazy loading fails?
```typescript
// Use Suspense boundary
import { Suspense } from 'react';
<Suspense fallback={<ModuleLoader />}>
  <LazyComponent />
</Suspense>
```

### Dark mode not applying?
```typescript
// Check Tailwind config has darkMode
darkMode: ["class"]
```

---

**Quick Reference Version**: 1.0  
**Created**: PATCH 126.0-130.0  
**Updated**: 2025
