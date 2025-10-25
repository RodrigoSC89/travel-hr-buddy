/**
 * Design System Usage Examples
 * Demonstrates how to use the new design system components
 * PATCH 126.0-130.0
 */

import React, { Suspense, lazy } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { ModuleLoader, CompactLoader, SkeletonLoader } from '@/components/ui/ModuleLoader';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/theme';
import { Moon, Sun, Monitor } from 'lucide-react';

// Example lazy-loaded component
const LazyExample = lazy(() => import('@/components/ui/AnimatedPage'));

/**
 * Example: Using AnimatedPage for smooth transitions
 */
export function AnimatedPageExample() {
  return (
    <AnimatedPage className="p-8">
      <h1 className="text-4xl font-heading font-bold mb-4">
        Welcome to Nautilus One
      </h1>
      <p className="text-lg text-muted-foreground">
        This page has smooth enter/exit animations
      </p>
    </AnimatedPage>
  );
}

/**
 * Example: Using ModuleLoader with Suspense
 */
export function SuspenseExample() {
  return (
    <Suspense fallback={<ModuleLoader message="Loading module..." />}>
      <LazyExample />
    </Suspense>
  );
}

/**
 * Example: Dark Mode Toggle
 */
export function ThemeToggleExample() {
  const { theme: currentTheme, isDark, setTheme, toggleTheme } = useTheme();

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Theme Control</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Toggle Theme
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            currentTheme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            currentTheme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            currentTheme === 'system' ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Current theme: {currentTheme} ({isDark ? 'dark' : 'light'} mode)
      </p>
    </div>
  );
}

/**
 * Example: Using Design Tokens
 */
export function DesignTokensExample() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-heading font-bold mb-2">Typography Tokens</h3>
        <div className="space-y-2">
          <p style={{ fontSize: theme.fontSize['5xl'], fontWeight: theme.fontWeight.bold }}>
            Heading 1
          </p>
          <p style={{ fontSize: theme.fontSize['2xl'], fontWeight: theme.fontWeight.semibold }}>
            Heading 2
          </p>
          <p style={{ fontSize: theme.fontSize.base }}>
            Body text with normal weight
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-heading font-bold mb-2">Spacing Tokens</h3>
        <div className="space-y-2">
          <div style={{ padding: theme.spacing[4] }} className="bg-primary/10 border">
            Padding: {theme.spacing[4]} (16px)
          </div>
          <div style={{ padding: theme.spacing[8] }} className="bg-primary/10 border">
            Padding: {theme.spacing[8]} (32px)
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-heading font-bold mb-2">Color Tokens</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(theme.colors.primary).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                style={{ backgroundColor: value }}
                className="h-16 rounded border"
              />
              <p className="text-xs mt-1">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Responsive Grid
 */
export function ResponsiveGridExample() {
  return (
    <div className="p-6">
      <h3 className="text-2xl font-heading font-bold mb-4">Responsive Grid</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-primary/20 p-4 rounded text-center">
            {i + 1}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Grid adjusts: 4 cols (mobile), 6 cols (sm), 8 cols (md), 12 cols (lg+)
      </p>
    </div>
  );
}

/**
 * Example: Different Loader Types
 */
export function LoaderVariantsExample() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h4 className="text-lg font-semibold mb-4">Full Screen Loader</h4>
        <div className="border rounded-lg h-64">
          <ModuleLoader message="Loading full module..." fullScreen={false} />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">Compact Loader</h4>
        <CompactLoader message="Loading data..." />
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4">Skeleton Loader</h4>
        <SkeletonLoader />
      </div>
    </div>
  );
}

/**
 * Complete Demo Page
 */
export default function DesignSystemDemo() {
  return (
    <AnimatedPage className="container mx-auto py-8 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading font-bold mb-4">
          Design System Demo
        </h1>
        <p className="text-xl text-muted-foreground">
          PATCH 126.0-130.0: Design System & UI Enhancements
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-3xl font-heading font-bold">Theme Management</h2>
        <ThemeToggleExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-heading font-bold">Design Tokens</h2>
        <DesignTokensExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-heading font-bold">Responsive Grid</h2>
        <ResponsiveGridExample />
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-heading font-bold">Loading States</h2>
        <LoaderVariantsExample />
      </section>
    </AnimatedPage>
  );
}
