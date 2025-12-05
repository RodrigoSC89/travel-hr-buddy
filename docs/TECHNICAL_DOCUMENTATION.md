# Nautica Platform - Technical Documentation

## Overview

Nautica is a comprehensive maritime operations management platform built with React, TypeScript, and Supabase. This document provides technical guidance for developers working on the project.

## Architecture

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query, React Context
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Realtime**: Supabase Realtime subscriptions
- **PWA**: Service Worker, Web App Manifest

### Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Base UI components (shadcn)
│   ├── layout/          # Layout components
│   ├── performance/     # Performance optimization components
│   └── [feature]/       # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api/            # API client and utilities
│   ├── performance/    # Performance utilities
│   ├── pwa/            # PWA utilities
│   ├── realtime/       # Realtime subscription management
│   ├── system/         # System configuration
│   ├── analytics/      # Analytics tracking
│   └── error-tracking/ # Error tracking
├── contexts/           # React contexts
├── pages/              # Page components
├── integrations/       # External service integrations
└── types/              # TypeScript type definitions

supabase/
├── functions/          # Edge Functions
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

## Key Systems

### 1. Performance Optimization

The platform includes comprehensive performance optimization:

```typescript
// Import from centralized exports
import { 
  useWebVitals,
  useOfflineSync,
  useOptimisticUpdate,
  useCachedFetch 
} from '@/hooks';

// Web Vitals monitoring
const { metrics, score } = useWebVitals();

// Offline-first data sync
const { sync, isPending } = useOfflineSync('tableName');

// Optimistic updates
const { mutate } = useOptimisticUpdate({
  queryKey: ['items'],
  mutationFn: updateItem,
});
```

### 2. API Integration

Unified API client with caching and offline support:

```typescript
import { apiClient, useAPI } from '@/lib/api';

// Direct API calls
const response = await apiClient.request('/endpoint', {
  method: 'GET',
  cache: true,
  retry: 3,
});

// React hook
const { data, loading, refresh } = useAPI('/endpoint');
```

### 3. Realtime Subscriptions

Centralized realtime subscription management:

```typescript
import { useRealtimeSubscription } from '@/lib/realtime';

// Subscribe to table changes
const payload = useRealtimeSubscription(
  { table: 'notifications', event: 'INSERT' },
  (data) => console.log('New notification:', data)
);
```

### 4. PWA Support

Progressive Web App capabilities:

```typescript
import { usePWA } from '@/lib/pwa';

const { 
  isInstallable, 
  isOffline, 
  hasUpdate, 
  install, 
  updateApp 
} = usePWA();
```

### 5. Analytics

Client-side analytics with batching:

```typescript
import { useAnalytics, analytics } from '@/lib/analytics';

// React hook
const { track, pageView, error } = useAnalytics();
track('button_clicked', { button_id: 'submit' });

// Direct usage
analytics.track('custom_event', { data: 'value' });
```

### 6. Error Tracking

Comprehensive error tracking:

```typescript
import { errorTracker, useErrorTracking } from '@/lib/error-tracking';

// Initialize on app start
errorTracker.init();

// React hook
const { trackError, trackWarning } = useErrorTracking('ComponentName');

// Capture errors
trackError(new Error('Something went wrong'), { action: 'save' });
```

## Edge Functions

### Creating Edge Functions

1. Create function in `supabase/functions/[function-name]/index.ts`
2. Add configuration in `supabase/config.toml`
3. Functions deploy automatically with builds

### Standard Template

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Your logic here

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Database

### RLS Policies

All tables must have RLS enabled with appropriate policies:

```sql
-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- User-specific data
CREATE POLICY "Users can view own data"
ON public.my_table FOR SELECT
USING (auth.uid() = user_id);
```

### Realtime

Enable realtime for tables:

```sql
ALTER TABLE public.my_table REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.my_table;
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use semantic tokens from design system
- Prefer hooks over class components
- Keep components focused and small

### Performance

- Use React.memo for expensive components
- Implement virtualization for large lists
- Enable code splitting for routes
- Cache API responses appropriately
- Monitor Web Vitals

### Testing

- Write unit tests for utilities
- Integration tests for critical flows
- E2E tests for user journeys

## Deployment

### Frontend

1. Push to main branch
2. Build runs automatically
3. Click "Update" in publish dialog

### Backend (Edge Functions)

Edge functions deploy automatically when code is pushed.

## Monitoring

### Health Check

```bash
curl https://[project-id].supabase.co/functions/v1/system-health
```

### Logs

- Edge function logs in Supabase dashboard
- Client-side errors tracked automatically
- Analytics events in `analytics_events` table

## Security

- All tables have RLS enabled
- JWT verification on protected endpoints
- Input validation on all forms
- CORS properly configured
- Secrets managed via Supabase secrets

## Support

For questions or issues:
1. Check existing documentation
2. Review code comments
3. Contact the development team
