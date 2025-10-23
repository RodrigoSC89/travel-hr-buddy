# Integration Guide - Nautilus One Travel HR Buddy

**Version**: 1.0  
**Last Updated**: 2025-01-24

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Monitoring Integration](#monitoring-integration)
3. [Module Integration](#module-integration)
4. [Third-Party Services](#third-party-services)
5. [CI/CD Integration](#cicd-integration)
6. [Authentication Integration](#authentication-integration)
7. [Database Integration](#database-integration)

---

## Overview

This guide covers integration patterns and procedures for connecting various components, services, and external systems within the Nautilus One application.

---

## Monitoring Integration

### Performance Monitoring

```typescript
// Initialize in main.tsx or App.tsx
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';

performanceMonitor.initialize();

// Subscribe to metrics
performanceMonitor.subscribe((metric) => {
  console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
});

// Get snapshot
const snapshot = performanceMonitor.getSnapshot();
```

### Error Tracking

```typescript
import { errorTracker } from '@/lib/monitoring/error-tracker';

// Initialize
errorTracker.initialize();

// Manual error capture
try {
  await riskyOperation();
} catch (error) {
  errorTracker.captureError(error, {
    component: 'UserProfile',
    action: 'update',
    userId: user.id
  });
}

// Subscribe to errors
errorTracker.subscribe((error) => {
  if (error.severity === 'critical') {
    notifyAdmins(error);
  }
});
```

### User Analytics

```typescript
import { userAnalytics } from '@/lib/monitoring/user-analytics';

// Initialize with user ID
userAnalytics.initialize(user?.id);

// Track events
userAnalytics.trackEvent('button_click', 'engagement', {
  button: 'submit_form',
  page: '/profile'
});

// Track feature usage
userAnalytics.trackFeatureUsage('export', 'click', {
  format: 'pdf'
});

// Get analytics summary
const summary = userAnalytics.getSummary();
```

### Dashboard Integration

```typescript
// Add to your dashboard page
import RealTimeMonitoringDashboard from '@/components/monitoring/RealTimeMonitoringDashboard';

export default function Dashboard() {
  return (
    <div>
      {/* Other dashboard components */}
      <RealTimeMonitoringDashboard />
    </div>
  );
}
```

---

## Module Integration

### Creating a New Module

```typescript
// 1. Create module structure
src/modules/my-module/
├── components/
│   └── MyComponent.tsx
├── hooks/
│   └── useMyFeature.ts
├── services/
│   └── myService.ts
├── types/
│   └── index.ts
└── index.ts

// 2. Export from index.ts
export { MyComponent } from './components/MyComponent';
export { useMyFeature } from './hooks/useMyFeature';
export * from './types';

// 3. Use in application
import { MyComponent, useMyFeature } from '@/modules/my-module';
```

### Module Communication

```typescript
// Using Context for cross-module state
import { createContext, useContext } from 'react';

const ModuleContext = createContext(null);

export function ModuleProvider({ children }) {
  const [state, setState] = useState();
  
  return (
    <ModuleContext.Provider value={{ state, setState }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModuleState() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModuleState must be used within ModuleProvider');
  }
  return context;
}
```

### Event Bus Pattern

```typescript
// lib/event-bus.ts
type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(
        event,
        callbacks.filter(cb => cb !== callback)
      );
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();

// Usage
eventBus.on('user:updated', (user) => {
  console.log('User updated:', user);
});

eventBus.emit('user:updated', updatedUser);
```

---

## Third-Party Services

### Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});

// Usage in components
try {
  await operation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'MyComponent' },
    extra: { userId: user.id }
  });
}
```

### Supabase Integration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Usage
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', userId);

if (error) {
  errorTracker.captureError(error, {
    table: 'table',
    operation: 'select'
  });
}
```

### React Query Integration

```typescript
// hooks/useData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const { data, error } = await supabase.from('table').select();
      if (error) throw error;
      return data;
    }
  });
}

export function useUpdateData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newData) => {
      const { data, error } = await supabase
        .from('table')
        .update(newData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
    }
  });
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Deployment Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: npm run build
        env:
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
          
      - name: Deploy to Production
        run: |
          # Deployment commands
```

---

## Authentication Integration

### Auth Context Setup

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Usage in router
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## Database Integration

### Type-Safe Queries

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          email: string;
        };
        Update: {
          email?: string;
        };
      };
    };
  };
}

// Usage
import { Database } from '@/types/database';

const supabase = createClient<Database>(url, key);

// Type-safe query
const { data } = await supabase
  .from('users')
  .select('*'); // data is typed as Database['public']['Tables']['users']['Row'][]
```

### Real-Time Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        console.log('Change received!', payload);
        // Update local state
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Row Level Security

```sql
-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own messages
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert own messages
CREATE POLICY "Users can insert own messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## Best Practices

### 1. Environment Variables

```typescript
// ✅ Good - Type-safe env vars
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
};

if (!config.supabaseUrl || !config.supabaseKey) {
  throw new Error('Missing required environment variables');
}
```

### 2. Error Boundaries

```typescript
// Wrap integrations in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <ThirdPartyComponent />
</ErrorBoundary>
```

### 3. Lazy Loading

```typescript
// Lazy load heavy integrations
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 4. Cleanup

```typescript
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase CORS settings
   - Verify API endpoint configuration

2. **Authentication Issues**
   - Clear localStorage/cookies
   - Check token expiration
   - Verify RLS policies

3. **Performance Issues**
   - Use React.memo for expensive components
   - Implement proper pagination
   - Optimize database queries

---

**Last Updated**: 2025-01-24  
**Maintainer**: Nautilus One Team
