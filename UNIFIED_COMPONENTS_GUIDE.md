# Unified UI Components Documentation

This document describes the new unified UI components that consolidate previously duplicated components across the codebase.

## 📦 Available Components

### 1. Loading Component (`Loading.tsx`)

A unified loading component with multiple variants for different use cases.

**Variants:**
- `default` - Standard Loader2 spinner
- `spinner` - Plain border spinner
- `maritime` - Anchor icon with pulse animation
- `offshore` - Ship icon with waves animation and progress bar

**Usage:**

```tsx
import { Loading, LoadingOverlay, LoadingSkeleton } from '@/components/ui/Loading';

// Basic loading
<Loading message="Carregando dados..." />

// Maritime variant
<Loading variant="maritime" size="lg" message="Carregando frota..." />

// Offshore variant with full screen
<Loading variant="offshore" fullScreen />

// Loading overlay
<LoadingOverlay isLoading={isLoading} message="Salvando...">
  <YourContent />
</LoadingOverlay>

// Skeleton loaders
<LoadingSkeleton className="h-8 w-64" />
<LoadingCard variant="maritime" />
<LoadingDashboard />
```

**Props:**
- `message?: string` - Loading message to display
- `size?: 'sm' | 'md' | 'lg'` - Size of the loading indicator
- `variant?: 'default' | 'spinner' | 'maritime' | 'offshore'` - Visual variant
- `fullScreen?: boolean` - Display as full screen overlay
- `className?: string` - Additional CSS classes

**Backward Compatibility:**
- `LoadingState`, `LoadingSpinner`, `MaritimeLoading` all export the same component
- Old files re-export from the new unified component

---

### 2. EmptyState Component (`EmptyState.tsx`)

A unified empty state component for displaying no-data states with optional actions.

**Variants:**
- `default` - Large icon with shadow
- `compact` - Smaller, more compact layout

**Usage:**

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { FileX } from 'lucide-react';

<EmptyState
  icon={FileX}
  title="Nenhum documento encontrado"
  description="Comece criando seu primeiro documento"
  actionLabel="Criar Documento"
  onAction={() => createDocument()}
/>

// Compact variant
<EmptyState
  icon={FileX}
  title="Sem resultados"
  description="Tente ajustar os filtros"
  variant="compact"
/>
```

**Props:**
- `icon: LucideIcon | React.ReactNode` - Icon to display
- `title: string` - Main title
- `description: string` - Description text
- `actionLabel?: string` - Optional action button label
- `onAction?: () => void` - Action button callback
- `variant?: 'default' | 'compact'` - Layout variant
- `className?: string` - Additional CSS classes

---

### 3. StatusBadge & StatusIndicator (`StatusBadge.tsx`)

Unified status display components with semantic colors.

**Usage:**

```tsx
import { StatusBadge, StatusIndicator } from '@/components/ui/StatusBadge';

// Status badge
<StatusBadge status="active" type="default" />
<StatusBadge status="high" type="priority" />
<StatusBadge status="operational" type="vessel" />

// Status indicator with dot
<StatusIndicator 
  status="pending" 
  label="Em Processamento"
  showDot 
/>
```

**StatusBadge Props:**
- `status: string` - Status value
- `type?: 'default' | 'priority' | 'vessel'` - Status type for color mapping
- `variant?: 'default' | 'secondary' | 'outline' | 'destructive'` - Badge variant
- `className?: string` - Additional CSS classes

**StatusIndicator Props:**
- `status: string` - Status value
- `label?: string` - Display label (defaults to status)
- `showDot?: boolean` - Show colored dot indicator
- `type?: 'default' | 'priority' | 'vessel'` - Status type
- `className?: string` - Additional CSS classes

---

### 4. NotificationCenter Component (`NotificationCenter.tsx`)

A unified notification center component supporting multiple variants and real-time updates.

**Variants:**
- `default` - Standard notifications
- `maritime` - Maritime-specific notifications with alert subscriptions
- `fleet` - Fleet management notifications

**Usage:**

```tsx
import { NotificationCenter } from '@/components/ui/NotificationCenter';

// Default usage
<NotificationCenter userId={currentUser.id} />

// Maritime variant with auto-refresh
<NotificationCenter 
  userId={currentUser.id}
  variant="maritime"
  autoRefresh
  refreshInterval={30000}
/>

// Fleet variant without filters
<NotificationCenter 
  userId={currentUser.id}
  variant="fleet"
  showFilters={false}
/>
```

**Props:**
- `userId?: string` - User ID for filtering notifications
- `variant?: 'maritime' | 'fleet' | 'default'` - Visual and functional variant
- `showFilters?: boolean` - Show filter tabs (default: true)
- `autoRefresh?: boolean` - Auto-refresh notifications (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 30000)
- `className?: string` - Additional CSS classes

**Features:**
- Real-time Supabase subscriptions
- Mark as read/unread functionality
- Delete notifications
- Filter by status (all, unread, high priority)
- Variant-specific alert subscriptions (maritime/fleet)

---

### 5. MetricCard Component (`MetricCard.tsx`)

A unified metric/KPI/stats card component with multiple variants and trend indicators.

**Variants:**
- `default` - Standard card layout
- `ocean` - Maritime-themed gradient card
- `success` - Success-themed card
- `warning` - Warning-themed card
- `danger` - Danger-themed card

**Usage:**

```tsx
import { MetricCard, KPICard, StatsCard } from '@/components/ui/MetricCard';
import { Users, DollarSign, Ship } from 'lucide-react';

// Basic metric card
<MetricCard
  title="Total Users"
  value={150}
  icon={Users}
  description="Active users this month"
/>

// With trend indicator
<MetricCard
  title="Revenue"
  value="$52,430"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true, period: "last month" }}
/>

// Ocean variant (maritime style)
<MetricCard
  title="Fleet Status"
  value={24}
  icon={Ship}
  variant="ocean"
  trend={{ value: 8, isPositive: true }}
/>

// Using aliases (same component)
<KPICard title="Sales" value="1,234" icon={DollarSign} />
<StatsCard title="Growth" value="+15%" icon={TrendingUp} variant="success" />
```

**Props:**
- `title: string` - Metric title
- `value: string | number` - Metric value
- `icon: LucideIcon` - Icon component
- `description?: string` - Optional description
- `trend?: object` - Trend indicator
  - `value: number` - Trend percentage
  - `isPositive: boolean` - Positive/negative trend
  - `period?: string` - Time period (e.g., "last month")
  - `type?: 'increase' | 'decrease'` - Explicit trend type
- `variant?: 'default' | 'ocean' | 'success' | 'warning' | 'danger'` - Visual variant
- `className?: string` - Additional CSS classes
- `iconClassName?: string` - Icon-specific CSS classes

**Aliases:**
- `KPICard` - Same as MetricCard
- `StatsCard` - Same as MetricCard

---

### 6. InfoCard Component (`InfoCard.tsx`)

A unified information card component with variant styling and status badge support.

**Variants:**
- `default` - Standard card
- `success` - Success-themed card
- `warning` - Warning-themed card
- `error` - Error-themed card
- `info` - Info-themed card

**Usage:**

```tsx
import { InfoCard } from '@/components/ui/InfoCard';

// Basic info card
<InfoCard
  title="System Status"
  description="All systems operational"
  variant="success"
>
  <p>Additional details here...</p>
</InfoCard>

// With status badge
<InfoCard
  title="Maintenance Required"
  description="Schedule maintenance soon"
  variant="warning"
  status="pending"
/>

// Error variant
<InfoCard
  title="Connection Failed"
  description="Could not connect to server"
  variant="error"
/>
```

**Props:**
- `title: string` - Card title
- `description?: string` - Optional description
- `status?: string` - Status badge to display
- `children?: React.ReactNode` - Card content
- `variant?: 'default' | 'success' | 'warning' | 'error' | 'info'` - Visual variant
- `className?: string` - Additional CSS classes

---

## 🔄 Migration Guide

### From Old Components

**Loading Components:**
```tsx
// Old
import { LoadingState } from '@/components/ui/loading-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MaritimeLoading } from '@/components/ui/maritime-loading';

// New (all the same component now)
import { Loading } from '@/components/ui/Loading';
// Or continue using old imports (they re-export the new component)
```

**Empty State:**
```tsx
// Old
import { EmptyState } from '@/components/ui/empty-state';

// New (same import, improved component)
import { EmptyState } from '@/components/ui/EmptyState';
```

**Status Components:**
```tsx
// Old
import { StatusBadge } from '@/components/ui/enhanced-status-components';

// New
import { StatusBadge } from '@/components/ui/StatusBadge';
```

**Notifications:**
```tsx
// Old
import { NotificationCenter } from '@/components/maritime/notification-center';
import { NotificationCenter } from '@/components/fleet/notification-center';

// New (unified with variant support)
import { NotificationCenter } from '@/components/ui/NotificationCenter';
```

**Metric/KPI Cards:**
```tsx
// Old
import { KPICard } from '@/components/dashboard/kpi-cards';
import { StatsCard } from '@/components/ui/stats-card';

// New (unified component)
import { MetricCard, KPICard, StatsCard } from '@/components/ui/MetricCard';
```

---

## 📝 Best Practices

1. **Use the unified components** from `@/components/ui/` for new code
2. **Old imports still work** - backward compatibility is maintained
3. **Prefer importing from one location** - use `@/lib/integrations` for centralized imports
4. **Use TypeScript types** - all components export their prop types
5. **Customize with variants** - use built-in variants before custom styling
6. **Pass className props** - for additional styling when needed

---

## 🎨 Component Showcase

You can import all unified components from a single location:

```tsx
import {
  // Loading
  Loading,
  LoadingOverlay,
  LoadingSkeleton,
  
  // Display
  EmptyState,
  StatusBadge,
  StatusIndicator,
  
  // Cards
  MetricCard,
  InfoCard,
  
  // Features
  NotificationCenter
} from '@/lib/integrations';
```

---

## 🔍 Component Benefits

1. **Reduced Code Duplication** - Single source of truth for each pattern
2. **Consistent UI/UX** - Unified styling and behavior across modules
3. **Easier Maintenance** - Update once, affect all usages
4. **Better TypeScript Support** - Centralized type definitions
5. **Improved Performance** - Shared components reduce bundle size
6. **Backward Compatible** - Old imports continue to work

---

## 🚀 Future Enhancements

- [ ] Add Storybook for visual component documentation
- [ ] Create interactive examples page
- [ ] Add unit tests for each component
- [ ] Add accessibility tests
- [ ] Create theme customization guide
- [ ] Add animation variants

---

## 📚 Related Files

- **Component Exports**: `src/lib/integrations.ts`
- **Component Directory**: `src/components/ui/`
- **Legacy Components**: Deprecated files that re-export new components
