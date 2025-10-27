# 🔵 PATCH 249 – Performance, Observabilidade e Logging

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** ALTA 🔵  
**Módulo:** Performance / Observability / Logging

---

## 📋 Objetivo

Tornar o sistema observável e performático, integrando ferramentas de error tracking, métricas de performance, logging centralizado e dashboard de performance.

---

## 🎯 Resultados Esperados

- ✅ Sentry integrado para error tracking
- ✅ Web Vitals monitoramento
- ✅ React Profiler configurado
- ✅ Logging central com Winston
- ✅ Dashboard de performance no Watchdog
- ✅ Performance budgets configurados
- ✅ Bundle size otimizado
- ✅ Lighthouse scores > 90

---

## 🔍 Sentry Integration

### Setup

**Arquivo:** `sentry.client.config.ts` (já existe)

```typescript
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% in dev, reduce in prod
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% on errors
  
  // Environment
  environment: import.meta.env.MODE,
  
  // Release tracking
  release: `travel-hr-buddy@${import.meta.env.VITE_APP_VERSION}`,
  
  // Additional context
  beforeSend(event, hint) {
    // Add custom context
    if (event.user) {
      event.user.organization = localStorage.getItem('org_id')
    }
    return event
  }
})
```

### Error Boundary with Sentry

**Arquivo:** `src/components/SentryErrorBoundary.tsx`

```typescript
import * as Sentry from '@sentry/react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h2 className="text-2xl font-bold">Something went wrong</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              We've been notified of this error and will fix it as soon as possible.
            </p>
            
            {import.meta.env.DEV && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {error.toString()}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button onClick={resetError}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )}
      beforeCapture={(scope) => {
        scope.setTag('location', 'error-boundary')
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
```

---

## 📊 Web Vitals Monitoring

**Arquivo:** `src/services/performance/webVitals.ts`

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import * as Sentry from '@sentry/react'

interface VitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function reportWebVitals() {
  function sendToAnalytics(metric: VitalMetric) {
    // Send to Sentry
    Sentry.captureMessage('Web Vital', {
      level: metric.rating === 'poor' ? 'warning' : 'info',
      tags: {
        metric: metric.name,
        rating: metric.rating
      },
      contexts: {
        performance: {
          value: metric.value,
          name: metric.name
        }
      }
    })
    
    // Send to Supabase analytics
    supabase.from('analytics_events').insert({
      event_type: 'performance',
      event_name: `web_vital_${metric.name}`,
      properties: {
        value: metric.value,
        rating: metric.rating
      }
    })
  }
  
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}

// Call in main.tsx
reportWebVitals()
```

---

## ⚡ React Profiler

**Arquivo:** `src/components/PerformanceProfiler.tsx`

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react'
import * as Sentry from '@sentry/react'

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  // Log slow renders (> 100ms)
  if (actualDuration > 100) {
    console.warn(`Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms`)
    
    // Send to Sentry in production
    if (import.meta.env.PROD) {
      Sentry.captureMessage('Slow Component Render', {
        level: 'warning',
        tags: {
          component: id,
          phase
        },
        contexts: {
          performance: {
            actualDuration,
            baseDuration,
            renderPhase: phase
          }
        }
      })
    }
  }
  
  // Send to analytics
  if (import.meta.env.PROD && Math.random() < 0.1) { // Sample 10%
    supabase.from('analytics_events').insert({
      event_type: 'performance',
      event_name: 'component_render',
      properties: {
        component: id,
        phase,
        actualDuration,
        baseDuration
      }
    })
  }
}

export function PerformanceProfiler({ 
  id, 
  children 
}: { 
  id: string
  children: React.ReactNode 
}) {
  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  )
}

// Usage
export function Dashboard() {
  return (
    <PerformanceProfiler id="Dashboard">
      <DashboardContent />
    </PerformanceProfiler>
  )
}
```

---

## 📝 Winston Logging

**Arquivo:** `src/services/logging/logger.ts`

```typescript
import winston from 'winston'

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create logger instance
export const logger = winston.createLogger({
  level: import.meta.env.DEV ? 'debug' : 'info',
  format: customFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Add Supabase transport for production
if (import.meta.env.PROD) {
  logger.add(
    new winston.transports.Stream({
      stream: {
        write: async (message: string) => {
          const log = JSON.parse(message)
          
          await supabase.from('application_logs').insert({
            level: log.level,
            message: log.message,
            metadata: log,
            timestamp: log.timestamp
          })
        }
      }
    })
  )
}

// Convenience methods
export const log = {
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
}

// Usage examples
log.info('User logged in', { userId: user.id })
log.error('API call failed', { endpoint: '/api/data', error })
```

**Arquivo:** `src/hooks/useLogger.ts`

```typescript
import { useCallback } from 'react'
import { log } from '@/services/logging/logger'
import { useUser } from '@/hooks/useUser'

export function useLogger() {
  const { data: user } = useUser()
  
  const logEvent = useCallback((
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    meta?: any
  ) => {
    log[level](message, {
      ...meta,
      userId: user?.id,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.pathname
    })
  }, [user])
  
  return {
    debug: (msg: string, meta?: any) => logEvent('debug', msg, meta),
    info: (msg: string, meta?: any) => logEvent('info', msg, meta),
    warn: (msg: string, meta?: any) => logEvent('warn', msg, meta),
    error: (msg: string, meta?: any) => logEvent('error', msg, meta),
  }
}
```

---

## 📊 Performance Dashboard

**Arquivo:** `src/modules/watchdog/components/PerformanceDashboard.tsx`

```typescript
export function PerformanceDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const last24h = subHours(new Date(), 24)
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'performance')
        .gte('timestamp', last24h.toISOString())
      
      if (error) throw error
      return data
    },
    refetchInterval: 60000
  })
  
  const webVitals = useMemo(() => {
    return {
      lcp: calculateAverage(metrics, 'web_vital_LCP'),
      fid: calculateAverage(metrics, 'web_vital_FID'),
      cls: calculateAverage(metrics, 'web_vital_CLS'),
      fcp: calculateAverage(metrics, 'web_vital_FCP'),
      ttfb: calculateAverage(metrics, 'web_vital_TTFB'),
    }
  }, [metrics])
  
  const slowComponents = useMemo(() => {
    return metrics
      ?.filter(m => m.event_name === 'component_render' && m.properties.actualDuration > 100)
      .sort((a, b) => b.properties.actualDuration - a.properties.actualDuration)
      .slice(0, 10)
  }, [metrics])
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Performance Dashboard</h2>
      
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="LCP"
          value={`${webVitals.lcp.toFixed(0)}ms`}
          status={getVitalStatus(webVitals.lcp, 2500, 4000)}
          description="Largest Contentful Paint"
        />
        <MetricCard
          title="FID"
          value={`${webVitals.fid.toFixed(0)}ms`}
          status={getVitalStatus(webVitals.fid, 100, 300)}
          description="First Input Delay"
        />
        <MetricCard
          title="CLS"
          value={webVitals.cls.toFixed(3)}
          status={getVitalStatus(webVitals.cls, 0.1, 0.25)}
          description="Cumulative Layout Shift"
        />
        <MetricCard
          title="FCP"
          value={`${webVitals.fcp.toFixed(0)}ms`}
          status={getVitalStatus(webVitals.fcp, 1800, 3000)}
          description="First Contentful Paint"
        />
        <MetricCard
          title="TTFB"
          value={`${webVitals.ttfb.toFixed(0)}ms`}
          status={getVitalStatus(webVitals.ttfb, 800, 1800)}
          description="Time to First Byte"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Slow Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slowComponents?.map((comp, i) => (
                <TableRow key={i}>
                  <TableCell>{comp.properties.component}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {comp.properties.actualDuration.toFixed(2)}ms
                    </Badge>
                  </TableCell>
                  <TableCell>{comp.properties.phase}</TableCell>
                  <TableCell>
                    {format(new Date(comp.timestamp), 'HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart metrics={metrics} />
        </CardContent>
      </Card>
    </div>
  )
}

function getVitalStatus(value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}
```

---

## 🎯 Performance Budgets

**Arquivo:** `vite.config.ts` (atualizar)

```typescript
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 500, // KB
  },
  
  // Performance plugin
  plugins: [
    react(),
    {
      name: 'bundle-size-monitor',
      closeBundle() {
        // Monitor bundle sizes
        const fs = require('fs')
        const path = require('path')
        
        const distPath = path.resolve(__dirname, 'dist/assets')
        const files = fs.readdirSync(distPath)
        
        files.forEach((file: string) => {
          const filePath = path.join(distPath, file)
          const stats = fs.statSync(filePath)
          const sizeInKB = stats.size / 1024
          
          if (sizeInKB > 500) {
            console.warn(`⚠️  Large bundle detected: ${file} (${sizeInKB.toFixed(2)} KB)`)
          }
        })
      }
    }
  ]
})
```

---

## ✅ Checklist de Validação

### Error Tracking
- [ ] Sentry integrado e funcionando
- [ ] Error boundaries implementadas
- [ ] Errors sendo capturados
- [ ] Context adicional nos errors
- [ ] Session replay configurado

### Performance Monitoring
- [ ] Web Vitals coletados
- [ ] React Profiler ativo
- [ ] Slow renders detectados
- [ ] Métricas enviadas para analytics

### Logging
- [ ] Winston configurado
- [ ] Logs estruturados
- [ ] Log levels apropriados
- [ ] Logs persistidos no Supabase

### Dashboard
- [ ] Performance dashboard funcional
- [ ] Métricas em tempo real
- [ ] Visualizações úteis
- [ ] Alertas configurados

### Optimization
- [ ] Bundle size < 500KB por chunk
- [ ] Code splitting implementado
- [ ] Lazy loading configurado
- [ ] Performance budgets definidos

---

**STATUS:** 🔵 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 250 – Trust Compliance com ML
