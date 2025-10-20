# 🔗 Global Intelligence - Integration Guide

**Integrating Python Global Intelligence with TypeScript/React Application**

## 🎯 Overview

This guide explains how to integrate the Python-based Global Intelligence module with the existing TypeScript/React Nautilus One application.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              TypeScript/React Frontend                       │
│         (Vite + React + Supabase Client)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Future)                              │
│         Express/Fastify + Python Bridge                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Python Subprocess / HTTP
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Python Global Intelligence Module                    │
│    (gi_core, gi_sync, gi_trainer, gi_forecast)              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Integration Options

### Option 1: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function that calls the Python module.

**Benefits:**
- Serverless execution
- Integrated with existing Supabase infrastructure
- Built-in authentication and RLS

**Implementation:**
```typescript
// supabase/functions/global-intelligence/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // Call Python module via subprocess or HTTP
    const command = new Deno.Command("python3", {
      args: ["modules/global_intelligence/demo.py"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, stderr } = await command.output();
    const output = new TextDecoder().decode(stdout);

    return new Response(JSON.stringify({ data: output }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

### Option 2: Node.js Child Process

Execute Python scripts from Node.js backend.

**Example:**
```typescript
// scripts/run-global-intelligence.ts
import { spawn } from 'child_process';
import path from 'path';

export async function runGlobalIntelligence(): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../modules/global_intelligence/demo.py');
    const pythonProcess = spawn('python3', [pythonScript]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, error });
      }
    });
  });
}

// Usage
const result = await runGlobalIntelligence();
console.log(result.output);
```

### Option 3: Python FastAPI Backend

Create a separate Python API service.

**Example:**
```python
# modules/global_intelligence/api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.global_intelligence.gi_core import GlobalIntelligence
from modules.global_intelligence.gi_forecast import GlobalForecaster
import json

app = FastAPI(title="Nautilus Global Intelligence API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/gi/status")
async def get_status():
    return {"status": "online", "version": "1.0.0"}

@app.post("/api/gi/execute")
async def execute_intelligence():
    gi = GlobalIntelligence()
    gi.executar()
    return {"success": True}

@app.post("/api/gi/forecast")
async def get_forecast(data: dict):
    forecaster = GlobalForecaster()
    predictions = forecaster.prever(data.get("vessels", []))
    return {"predictions": predictions}

# Run with: uvicorn modules.global_intelligence.api:app --reload
```

### Option 4: Cron Job Integration

Schedule periodic execution via cron.

**Example Cron Setup:**
```bash
# Add to crontab: crontab -e
# Run Global Intelligence every 15 minutes
*/15 * * * * cd /path/to/project && python3 modules/global_intelligence/demo.py >> logs/gi.log 2>&1

# Daily model retraining at 2 AM
0 2 * * * cd /path/to/project && python3 -c "from modules.global_intelligence.gi_trainer import GlobalTrainer; import json; data = json.load(open('modules/global_intelligence/fleet_profiles.json'))['vessels']; GlobalTrainer().treinar(data)"
```

## 📦 Database Integration

### Storing Results in Supabase

```typescript
// src/integrations/supabase/globalIntelligence.ts
import { supabase } from './client';

export interface FleetRiskPrediction {
  embarcacao: string;
  risco: number;
  timestamp: string;
}

export async function saveRiskPredictions(predictions: FleetRiskPrediction[]) {
  const { data, error } = await supabase
    .from('global_intelligence_predictions')
    .insert(predictions);

  if (error) throw error;
  return data;
}

export async function getLatestPredictions() {
  const { data, error } = await supabase
    .from('global_intelligence_predictions')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}
```

### Database Schema

```sql
-- Create table for storing predictions
CREATE TABLE global_intelligence_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  embarcacao TEXT NOT NULL,
  risco NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_gi_predictions_timestamp ON global_intelligence_predictions(timestamp DESC);
CREATE INDEX idx_gi_predictions_embarcacao ON global_intelligence_predictions(embarcacao);

-- Enable RLS
ALTER TABLE global_intelligence_predictions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow read for authenticated users" ON global_intelligence_predictions
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

## 🎨 Frontend Integration

### React Component Example

```typescript
// src/components/GlobalIntelligence/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskPrediction {
  embarcacao: string;
  risco: number;
}

export function GlobalIntelligenceDashboard() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['global-intelligence'],
    queryFn: async () => {
      const response = await fetch('/api/gi/forecast');
      return response.json() as Promise<RiskPrediction[]>;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        🌍 Global Intelligence Dashboard
      </h2>
      <div className="space-y-2">
        {predictions?.map((pred) => (
          <div key={pred.embarcacao} className="flex justify-between items-center p-3 border rounded">
            <span className="font-medium">{pred.embarcacao}</span>
            <div className="flex items-center gap-2">
              <span>{pred.risco}%</span>
              <Badge variant={getRiskBadgeVariant(pred.risco)}>
                {getRiskLevel(pred.risco)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function getRiskLevel(risco: number): string {
  if (risco > 80) return '🚨 CRÍTICO';
  if (risco > 70) return '🔴 ALTO';
  if (risco > 40) return '🟡 MODERADO';
  return '✅ BAIXO';
}

function getRiskBadgeVariant(risco: number): "destructive" | "warning" | "success" {
  if (risco > 70) return "destructive";
  if (risco > 40) return "warning";
  return "success";
}
```

## 🔄 Real-time Updates

### Using Supabase Realtime

```typescript
// src/hooks/useGlobalIntelligence.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGlobalIntelligence() {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial data
    const fetchPredictions = async () => {
      const { data } = await supabase
        .from('global_intelligence_predictions')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (data) setPredictions(data);
    };

    fetchPredictions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('gi_predictions')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'global_intelligence_predictions' },
        (payload) => {
          setPredictions((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { predictions };
}
```

## 📊 Monitoring & Logging

### Integration with Sentry

```python
# modules/global_intelligence/gi_core.py (enhanced)
import sentry_sdk

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    environment="production",
)

class GlobalIntelligence:
    def executar(self):
        try:
            print("\n🌍 Iniciando IA Global da Frota Nautilus...")
            dados = self.collector.coletar_dados()
            self.trainer.treinar(dados)
            previsoes = self.forecaster.prever(dados)
            self.dashboard.mostrar(previsoes)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            raise
```

## 🧪 Testing Integration

### End-to-End Test Example

```typescript
// __tests__/global-intelligence.e2e.test.ts
import { test, expect } from '@playwright/test';

test('Global Intelligence Dashboard loads and displays data', async ({ page }) => {
  await page.goto('/global-intelligence');
  
  // Wait for dashboard to load
  await expect(page.locator('h2')).toContainText('Global Intelligence Dashboard');
  
  // Check that predictions are displayed
  const predictions = page.locator('[data-testid="prediction-item"]');
  await expect(predictions).toHaveCount.greaterThan(0);
  
  // Verify risk levels are shown
  await expect(page.locator('[data-testid="risk-badge"]')).toBeVisible();
});
```

## 🚀 Deployment Considerations

### Docker Container (Optional)

```dockerfile
# Dockerfile.gi
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY modules/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY modules/ ./modules/

# Run application
CMD ["python3", "modules/global_intelligence/demo.py"]
```

### Environment Variables

```bash
# .env for Python service
GI_BRIDGELINK_ENDPOINT=https://bridge.nautilus/api/fleet_data
GI_MODEL_PATH=modules/global_intelligence/global_model.pkl
GI_LOG_LEVEL=INFO
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## 📝 Best Practices

1. **Error Handling**: Always wrap Python calls in try-catch blocks
2. **Timeouts**: Set appropriate timeouts for Python execution
3. **Caching**: Cache predictions to reduce computation
4. **Logging**: Log all integration points for debugging
5. **Monitoring**: Use Sentry or similar for error tracking
6. **Testing**: Test integration thoroughly before deployment

## 🔗 Additional Resources

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [Python subprocess](https://docs.python.org/3/library/subprocess.html)

---

**Last Updated**: October 2026  
**Status**: 📋 Integration Guide
