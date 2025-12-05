# Nautica Platform - Developer Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Git
- Supabase CLI (optional)

### Installation
```bash
git clone <repository-url>
cd nautica
npm install
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture Overview

### Folder Structure
```
src/
├── components/     # React components
│   ├── ui/        # Base UI (shadcn)
│   ├── layout/    # Layout components
│   ├── performance/ # Performance optimizations
│   └── pwa/       # PWA components
├── hooks/         # Custom hooks
├── lib/           # Utilities
│   ├── api/       # API client
│   ├── performance/ # Performance utilities
│   ├── pwa/       # PWA utilities
│   ├── realtime/  # Realtime subscriptions
│   ├── analytics/ # Analytics
│   └── error-tracking/ # Error tracking
├── pages/         # Page components
└── styles/        # CSS files
```

## Performance Optimizations

### Low Bandwidth Support (2 Mbps+)
The system automatically adapts to network conditions:

```tsx
import { useBandwidthOptimizer } from '@/hooks';

function MyComponent() {
  const { 
    connectionType,    // '4g' | '3g' | '2g' | 'slow-2g' | 'offline'
    isLowBandwidth,    // true for 2g/slow-2g/offline
    shouldLoadImages,  // false for very slow connections
    shouldAnimate,     // false for slow connections
    imageQuality,      // 30-85 based on connection
  } = useBandwidthOptimizer();

  return (
    <div>
      {shouldLoadImages && <img src="/image.jpg" />}
      {isLowBandwidth && <p>Modo de economia de dados ativo</p>}
    </div>
  );
}
```

### Skeleton Loaders
Use skeleton components for perceived performance:

```tsx
import { 
  CardSkeleton, 
  TableSkeleton, 
  ListSkeleton,
  DashboardSkeleton 
} from '@/components/ui/skeleton-loaders';

// Or use DataLoader for automatic handling
import { DataLoader } from '@/components/performance';

<DataLoader 
  isLoading={loading} 
  error={error} 
  isEmpty={data.length === 0}
  skeleton="table"
  tableRows={5}
  tableColumns={4}
>
  <MyTable data={data} />
</DataLoader>
```

### Optimized Images
```tsx
import { OptimizedImage } from '@/components/performance/OptimizedImage';

<OptimizedImage
  src="/photo.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false}       // Lazy load by default
  placeholder="skeleton" // 'blur' | 'skeleton' | 'none'
/>
```

### Request Optimization
```tsx
import { useOptimizedFetch } from '@/hooks';

const { fetch, status, cancelAll } = useOptimizedFetch();

// Prioritized fetch with automatic retry and caching
const response = await fetch('/api/data', {}, {
  priority: 'high',  // 'high' | 'normal' | 'low'
  cache: true,
  retries: 3,
});
```

## Key Hooks

### Data Fetching
```tsx
import { useAPI, useSupabaseQuery, useCachedFetch } from '@/hooks';

// Generic API
const { data, loading, error, refresh } = useAPI('/endpoint');

// Supabase query
const { data, execute } = useSupabaseQuery('table_name', {
  select: 'id,name',
  filter: { status: 'active' },
  limit: 10,
});
```

### Realtime Subscriptions
```tsx
import { useRealtimeSubscription } from '@/hooks';

const payload = useRealtimeSubscription(
  { table: 'notifications', event: 'INSERT' },
  (data) => console.log('New:', data)
);
```

### Analytics
```tsx
import { useAnalytics } from '@/hooks';

const { track, pageView, error } = useAnalytics();

track('button_click', { button_id: 'submit' });
error('api_error', new Error('Failed'), { endpoint: '/api' });
```

### Error Tracking
```tsx
import { useErrorTracking } from '@/hooks';

const { trackError, trackWarning } = useErrorTracking('ComponentName');

try {
  // risky operation
} catch (e) {
  trackError(e, { action: 'save_data' });
}
```

### PWA
```tsx
import { usePWA } from '@/hooks';

const { 
  isInstalled,
  isInstallable,
  isOffline,
  hasUpdate,
  install,
  updateApp 
} = usePWA();
```

## Performance Wrapper
Wrap your app with PerformanceWrapper for automatic optimizations:

```tsx
import { PerformanceWrapper } from '@/components/performance';

function App() {
  return (
    <PerformanceWrapper
      showConnectionIndicator={true}
      showPWAPrompts={true}
      showOfflineIndicator={true}
      enableAnalytics={true}
      enableErrorTracking={true}
      enableWebVitals={true}
    >
      <YourApp />
    </PerformanceWrapper>
  );
}
```

## Edge Functions

### Creating a New Function
1. Create `supabase/functions/[name]/index.ts`
2. Add to `supabase/config.toml`

### Template
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Your logic

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Testing

### Health Check
```bash
curl https://[project-id].supabase.co/functions/v1/system-health
```

### Performance Monitoring
Press `Ctrl+Shift+P` in development to toggle the performance monitor.

## Best Practices

### Performance
1. Always use skeleton loaders for data fetching
2. Use `priority` prop on above-fold images
3. Check `isLowBandwidth` before loading heavy content
4. Use `DataLoader` component for consistent loading states

### Code Quality
1. Use TypeScript strict mode
2. Follow ESLint configuration
3. Use semantic tokens from design system
4. Keep components small and focused

### Accessibility
1. Use semantic HTML elements
2. Include alt text on images
3. Maintain proper contrast ratios
4. Support keyboard navigation

## Deployment

### Frontend
Push to main branch, then click "Update" in publish dialog.

### Backend (Edge Functions)
Edge functions deploy automatically on push.

## Support
- Check `docs/TECHNICAL_DOCUMENTATION.md` for detailed technical info
- Review code comments for implementation details
