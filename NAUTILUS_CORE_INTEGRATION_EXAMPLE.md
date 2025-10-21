# 🔧 Nautilus Core Alpha - Integration Examples

This document provides practical examples of integrating Nautilus Core Alpha components into your modules.

## Table of Contents

1. [Using BridgeLink for Inter-Module Communication](#1-using-bridgelink-for-inter-module-communication)
2. [Implementing Safe Lazy Loading](#2-implementing-safe-lazy-loading)
3. [Integrating NautilusAI Analysis](#3-integrating-nautilusai-analysis)
4. [Monitoring Events in ControlHub](#4-monitoring-events-in-controlhub)
5. [Complete Module Example](#5-complete-module-example)

---

## 1. Using BridgeLink for Inter-Module Communication

### Basic Event Emission

```typescript
import { BridgeLink } from '@/core/BridgeLink';

// In your MMI module, emit a forecast update
export function updateForecast(forecastData: ForecastData) {
  // Your business logic here
  const forecast = calculateForecast(forecastData);
  
  // Emit event so other modules can react
  BridgeLink.emit('mmi:forecast:update', 'MMIModule', {
    forecastId: forecast.id,
    equipmentId: forecast.equipmentId,
    predictedDate: forecast.date,
    confidence: forecast.confidence
  });
  
  return forecast;
}
```

### Subscribing to Events

```typescript
import { BridgeLink } from '@/core/BridgeLink';
import { useEffect } from 'react';

export function DPIntelligenceModule() {
  useEffect(() => {
    // Subscribe to MMI forecast updates
    const unsubscribe = BridgeLink.on('mmi:forecast:update', (event) => {
      console.log('Received forecast update from:', event.source);
      console.log('Forecast data:', event.data);
      
      // Trigger DP intelligence analysis based on forecast
      analyzeEquipmentRisk(event.data);
    });

    // Subscribe to DP incidents
    const unsubscribeIncidents = BridgeLink.on('dp:incident:reported', (event) => {
      console.log('DP Incident reported:', event.data);
      
      // Cross-reference with maintenance forecast
      checkMaintenanceCorrelation(event.data);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe();
      unsubscribeIncidents();
    };
  }, []);

  return (
    <div>DP Intelligence Module</div>
  );
}
```

### Multi-Module Communication Example

```typescript
// In MaintenanceModule.tsx
import { BridgeLink } from '@/core/BridgeLink';

export function MaintenanceModule() {
  const handleJobCreation = (jobData: JobData) => {
    // Create the job
    const job = createMaintenanceJob(jobData);
    
    // Notify all modules about new job
    BridgeLink.emit('mmi:job:created', 'MaintenanceModule', {
      jobId: job.id,
      equipmentId: job.equipmentId,
      priority: job.priority,
      scheduledDate: job.date
    });
  };

  return <div>{/* Your UI */}</div>;
}

// In DPIntelligenceModule.tsx
import { BridgeLink } from '@/core/BridgeLink';

export function DPIntelligenceModule() {
  useEffect(() => {
    const unsubscribe = BridgeLink.on('mmi:job:created', (event) => {
      // Automatically analyze impact on DP operations
      if (event.data.priority === 'critical') {
        BridgeLink.emit('dp:intelligence:alert', 'DPIntelligence', {
          type: 'maintenance_scheduled',
          equipmentId: event.data.equipmentId,
          message: `Critical maintenance scheduled for ${event.data.scheduledDate}`
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return <div>{/* Your UI */}</div>;
}
```

---

## 2. Implementing Safe Lazy Loading

### Basic Usage in App.tsx

```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

// Replace React.lazy with safeLazyImport
const MyPage = safeLazyImport(
  () => import('@/pages/MyPage'),
  'My Page' // Human-readable name for logging
);

// In your routes
<Route path="/my-page" element={<MyPage />} />
```

### With Custom Retry Configuration

```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

// 5 retry attempts for critical modules
const CriticalModule = safeLazyImport(
  () => import('@/pages/CriticalModule'),
  'Critical Module',
  5 // Custom retry count
);
```

### Migration from React.lazy

**Before (standard React.lazy)**:
```typescript
import React from 'react';

const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
```

**After (with safeLazyImport)**:
```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

const Dashboard = safeLazyImport(
  () => import('@/pages/Dashboard'),
  'Dashboard'
);
```

Benefits:
- ✅ Automatic retry on network failures
- ✅ User-friendly error messages
- ✅ Reload button on failure
- ✅ Better debugging with named modules

---

## 3. Integrating NautilusAI Analysis

### Analyzing Maintenance Logs

```typescript
import { NautilusAI } from '@/ai/nautilus-core';
import { BridgeLink } from '@/core/BridgeLink';

export async function analyzeMaintenanceLogs(logs: string[]) {
  // Combine logs
  const combinedLogs = logs.join('\n');
  
  // Analyze with NautilusAI
  const analysis = await NautilusAI.analyze(combinedLogs);
  
  console.log('Analysis:', analysis.analysis);
  console.log('Confidence:', analysis.confidence);
  console.log('Suggestions:', analysis.suggestions);
  
  // Emit results for other modules
  BridgeLink.emit('ai:analysis:complete', 'NautilusAI', {
    type: 'maintenance_logs',
    analysis: analysis.analysis,
    confidence: analysis.confidence,
    timestamp: analysis.timestamp
  });
  
  return analysis;
}
```

### Classifying Incidents

```typescript
import { NautilusAI } from '@/ai/nautilus-core';

export async function classifyIncident(incidentDescription: string) {
  const classification = await NautilusAI.classify(incidentDescription);
  
  console.log('Category:', classification.category);
  console.log('Confidence:', classification.confidence);
  console.log('Alternatives:', classification.alternatives);
  
  // Use classification for routing
  switch (classification.category) {
    case 'safety':
      routeToSafetyTeam(incidentDescription);
      break;
    case 'operational':
      routeToOperationsTeam(incidentDescription);
      break;
    default:
      routeToGeneralQueue(incidentDescription);
  }
  
  return classification;
}
```

### Predictive Analysis

```typescript
import { NautilusAI } from '@/ai/nautilus-core';

export async function predictMaintenanceNeeds(historicalData: MaintenanceRecord[]) {
  const prediction = await NautilusAI.predict(historicalData);
  
  console.log('Prediction:', prediction.prediction);
  console.log('Confidence:', prediction.confidence);
  console.log('Influencing Factors:');
  prediction.factors.forEach(factor => {
    console.log(`  - ${factor.factor}: ${(factor.weight * 100).toFixed(0)}%`);
  });
  
  return prediction;
}
```

### React Component Integration

```typescript
import { useState } from 'react';
import { NautilusAI } from '@/ai/nautilus-core';
import { Button } from '@/components/ui/button';

export function MaintenanceAnalyzer() {
  const [logs, setLogs] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await NautilusAI.analyze(logs);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={logs}
        onChange={(e) => setLogs(e.target.value)}
        placeholder="Enter maintenance logs..."
        className="w-full h-32 p-2 border rounded"
      />
      
      <Button onClick={handleAnalyze} disabled={analyzing}>
        {analyzing ? 'Analyzing...' : 'Analyze with AI'}
      </Button>
      
      {analysis && (
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-bold">Analysis Results</h3>
          <p>{analysis.analysis}</p>
          <p className="text-sm text-gray-600">
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
          </p>
          <ul className="mt-2">
            {analysis.suggestions.map((suggestion: string, i: number) => (
              <li key={i}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Monitoring Events in ControlHub

### Accessing ControlHub

Navigate to: `http://localhost:8080/control-hub`

### Generating Test Events

```typescript
import { BridgeLink } from '@/core/BridgeLink';

// Test event generation function
export function generateTestEvents() {
  // Emit various event types to see them in ControlHub
  
  BridgeLink.emit('mmi:forecast:update', 'TestModule', {
    message: 'Test forecast update',
    timestamp: Date.now()
  });
  
  BridgeLink.emit('dp:incident:reported', 'TestModule', {
    severity: 'high',
    description: 'Test DP incident',
    timestamp: Date.now()
  });
  
  BridgeLink.emit('ai:analysis:complete', 'TestModule', {
    type: 'test',
    confidence: 0.95,
    timestamp: Date.now()
  });
}
```

### Viewing Real-Time Events

The ControlHub dashboard will automatically display:
- ✅ All emitted events in real-time
- ✅ Color-coded by event type
- ✅ Timestamps with millisecond precision
- ✅ Event source information
- ✅ Event data in JSON format
- ✅ System statistics (total events, active listeners)

---

## 5. Complete Module Example

Here's a complete example of a module that uses all Nautilus Core features:

```typescript
// src/pages/SmartMaintenanceModule.tsx
import { useEffect, useState } from 'react';
import { BridgeLink, BridgeLinkEvent } from '@/core/BridgeLink';
import { NautilusAI } from '@/ai/nautilus-core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MaintenanceJob {
  id: string;
  equipment: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function SmartMaintenanceModule() {
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [events, setEvents] = useState<BridgeLinkEvent[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // Announce module loading
    BridgeLink.emit('system:module:loaded', 'SmartMaintenanceModule', {
      timestamp: Date.now(),
      version: '1.0.0'
    });

    // Subscribe to DP incidents to coordinate maintenance
    const unsubscribeDP = BridgeLink.on('dp:incident:reported', (event) => {
      console.log('DP Incident detected:', event.data);
      setEvents(prev => [event, ...prev].slice(0, 10));
      
      // Automatically create maintenance job for critical incidents
      if (event.data.severity === 'critical') {
        createMaintenanceJob({
          equipment: event.data.equipmentId || 'Unknown',
          description: `Auto-generated from DP incident: ${event.data.description}`,
          status: 'pending'
        });
      }
    });

    // Subscribe to forecast updates
    const unsubscribeForecast = BridgeLink.on('mmi:forecast:update', (event) => {
      console.log('Forecast updated:', event.data);
      setEvents(prev => [event, ...prev].slice(0, 10));
    });

    return () => {
      unsubscribeDP();
      unsubscribeForecast();
    };
  }, []);

  const createMaintenanceJob = (jobData: Omit<MaintenanceJob, 'id'>) => {
    const newJob: MaintenanceJob = {
      ...jobData,
      id: `job-${Date.now()}`
    };
    
    setJobs(prev => [...prev, newJob]);
    
    // Emit event for other modules
    BridgeLink.emit('mmi:job:created', 'SmartMaintenanceModule', {
      jobId: newJob.id,
      equipment: newJob.equipment,
      priority: 'normal',
      timestamp: Date.now()
    });
  };

  const analyzeJobs = async () => {
    setAnalyzing(true);
    try {
      const jobDescriptions = jobs.map(j => 
        `${j.equipment}: ${j.description} (${j.status})`
      ).join('\n');
      
      const analysis = await NautilusAI.analyze(jobDescriptions);
      setAiInsights(analysis.analysis);
      
      BridgeLink.emit('ai:analysis:complete', 'SmartMaintenanceModule', {
        type: 'maintenance_analysis',
        jobCount: jobs.length,
        confidence: analysis.confidence,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Smart Maintenance Module</h1>
        <p className="text-muted-foreground">
          Powered by Nautilus Core Alpha
        </p>
      </div>

      {/* Maintenance Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Maintenance Jobs</span>
            <Button onClick={analyzeJobs} disabled={analyzing || jobs.length === 0}>
              {analyzing ? 'Analyzing...' : '🧠 Analyze with AI'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground">No maintenance jobs</p>
          ) : (
            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{job.equipment}</p>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  </div>
                  <Badge>{job.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle>🧠 AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded">
              <p className="whitespace-pre-line">{aiInsights}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>📡 Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events received</p>
          ) : (
            <div className="space-y-2">
              {events.map(event => (
                <div key={event.id} className="p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{event.type}</Badge>
                    <span className="text-muted-foreground">
                      from {event.source}
                    </span>
                  </div>
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Adding to App.tsx

```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

const SmartMaintenanceModule = safeLazyImport(
  () => import('@/pages/SmartMaintenanceModule'),
  'Smart Maintenance Module'
);

// In routes
<Route path="/smart-maintenance" element={<SmartMaintenanceModule />} />
```

---

## Best Practices

### BridgeLink

1. **Always unsubscribe**: Use the cleanup function in useEffect
2. **Use specific event types**: Don't overload generic events
3. **Include source information**: Always identify the emitting module
4. **Keep data lean**: Don't emit large objects frequently

### SafeLazyImport

1. **Use descriptive names**: Helps with debugging in error messages
2. **Keep retry count reasonable**: Default 3 is usually sufficient
3. **Don't nest**: Don't wrap safeLazyImport inside safeLazyImport

### NautilusAI

1. **Handle async properly**: Always use try/catch
2. **Check confidence scores**: Low confidence may need human review
3. **Stub awareness**: Current implementation is a stub - responses are simulated

---

## Troubleshooting

### Events not appearing in ControlHub

1. Verify event type is in the BridgeLinkEventType union
2. Check that ControlHub is subscribed to that event type
3. Ensure event is being emitted correctly with all required fields

### SafeLazyImport failing repeatedly

1. Check network connectivity
2. Verify the module path is correct
3. Check browser console for specific error messages
4. Try clearing browser cache

### NautilusAI not working

1. Current implementation is a stub - it returns simulated responses
2. For production, integrate ONNX Runtime or GGML
3. Check console for any error messages

---

## Next Steps

Ready to integrate? Start with:

1. ✅ Add BridgeLink event emission to one module
2. ✅ Subscribe to events in another module
3. ✅ Replace React.lazy with safeLazyImport
4. ✅ Test NautilusAI analysis with sample data
5. ✅ Monitor everything in ControlHub at `/control-hub`

For more information, see [NAUTILUS_CORE_ALPHA_README.md](./NAUTILUS_CORE_ALPHA_README.md).
