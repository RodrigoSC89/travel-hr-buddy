# Decision Core Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the Python Decision Core backend with your React/TypeScript frontend in Nautilus One.

## Integration Approaches

### Option 1: Supabase Edge Functions (Recommended)

Deploy Decision Core modules as Supabase Edge Functions for serverless execution.

#### Setup

1. **Create Edge Function**

```bash
supabase functions new decision-core
```

2. **Implement Function** (`supabase/functions/decision-core/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { module, action, params } = await req.json()

  // Route to appropriate Python module
  const command = new Deno.Command("python3", {
    args: ["-c", `
from modules import ${module}
result = ${module}.run()
import json
print(json.dumps(result))
    `],
  })

  const { stdout } = await command.output()
  const result = JSON.parse(new TextDecoder().decode(stdout))

  return new Response(
    JSON.stringify(result),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

3. **Deploy Function**

```bash
supabase functions deploy decision-core
```

#### Frontend Integration

```typescript
// src/lib/decisionCore.ts
import { supabase } from './supabase'

export async function runFMEAAudit() {
  const { data, error } = await supabase.functions.invoke('decision-core', {
    body: { module: 'audit_fmea', action: 'run' }
  })
  
  if (error) throw error
  return data
}

export async function runASOGReview() {
  const { data, error } = await supabase.functions.invoke('decision-core', {
    body: { module: 'asog_review', action: 'run' }
  })
  
  if (error) throw error
  return data
}

export async function runRiskForecast() {
  const { data, error } = await supabase.functions.invoke('decision-core', {
    body: { module: 'forecast_risk', action: 'run' }
  })
  
  if (error) throw error
  return data
}
```

#### React Component Example

```typescript
// src/components/DecisionCorePanel.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { runFMEAAudit, runASOGReview, runRiskForecast } from '@/lib/decisionCore'
import { toast } from 'sonner'

export function DecisionCorePanel() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFMEA = async () => {
    setLoading(true)
    try {
      const data = await runFMEAAudit()
      setResults(data)
      toast.success('FMEA Audit completed successfully')
    } catch (error) {
      toast.error('Failed to run FMEA audit')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleASOG = async () => {
    setLoading(true)
    try {
      const data = await runASOGReview()
      setResults(data)
      toast.success('ASOG Review completed successfully')
    } catch (error) {
      toast.error('Failed to run ASOG review')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleForecast = async () => {
    setLoading(true)
    try {
      const data = await runRiskForecast()
      setResults(data)
      toast.success('Risk Forecast completed successfully')
    } catch (error) {
      toast.error('Failed to run risk forecast')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nautilus One Decision Core</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleFMEA} disabled={loading}>
              Run FMEA Audit
            </Button>
            <Button onClick={handleASOG} disabled={loading}>
              Run ASOG Review
            </Button>
            <Button onClick={handleForecast} disabled={loading}>
              Run Risk Forecast
            </Button>
          </div>

          {results && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Option 2: REST API with FastAPI

Create a REST API wrapper around Decision Core modules.

#### Setup

1. **Install FastAPI** (if not using Docker)

```bash
pip install fastapi uvicorn
```

2. **Create API Server** (`api_server.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules import audit_fmea, asog_review, forecast_risk

app = FastAPI(title="Nautilus One Decision Core API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Nautilus One Decision Core API"}

@app.post("/api/fmea/run")
async def run_fmea():
    result = audit_fmea.run()
    return result

@app.post("/api/asog/run")
async def run_asog():
    result = asog_review.run()
    return result

@app.post("/api/forecast/run")
async def run_forecast():
    result = forecast_risk.run()
    return result

@app.get("/api/status")
async def get_status():
    from core.sgso_connector import SGSOClient
    sgso = SGSOClient()
    connected = sgso.connect()
    
    return {
        "status": "operational",
        "sgso_connected": connected
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

3. **Run Server**

```bash
python3 api_server.py
```

#### Frontend Integration

```typescript
// src/lib/api/decisionCore.ts
const API_URL = import.meta.env.VITE_DECISION_CORE_API_URL || 'http://localhost:8000'

export async function runFMEAAudit() {
  const response = await fetch(`${API_URL}/api/fmea/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to run FMEA audit')
  }
  
  return response.json()
}

export async function runASOGReview() {
  const response = await fetch(`${API_URL}/api/asog/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to run ASOG review')
  }
  
  return response.json()
}

export async function runRiskForecast() {
  const response = await fetch(`${API_URL}/api/forecast/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to run risk forecast')
  }
  
  return response.json()
}

export async function getSystemStatus() {
  const response = await fetch(`${API_URL}/api/status`)
  
  if (!response.ok) {
    throw new Error('Failed to get system status')
  }
  
  return response.json()
}
```

---

### Option 3: WebSocket for Real-time Updates

Enable real-time streaming of analysis results.

#### Setup

1. **Create WebSocket Server** (`ws_server.py`)

```python
import asyncio
import json
import websockets
from modules import audit_fmea, asog_review, forecast_risk

async def handle_client(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        module = data.get('module')
        action = data.get('action')
        
        if module == 'audit_fmea' and action == 'run':
            result = audit_fmea.run()
            await websocket.send(json.dumps(result))
        elif module == 'asog_review' and action == 'run':
            result = asog_review.run()
            await websocket.send(json.dumps(result))
        elif module == 'forecast_risk' and action == 'run':
            result = forecast_risk.run()
            await websocket.send(json.dumps(result))
        else:
            await websocket.send(json.dumps({
                'error': 'Unknown module or action'
            }))

async def main():
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
```

2. **Run WebSocket Server**

```bash
python3 ws_server.py
```

#### Frontend Integration

```typescript
// src/lib/ws/decisionCore.ts
export class DecisionCoreWS {
  private ws: WebSocket | null = null
  private url: string

  constructor(url: string = 'ws://localhost:8765') {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        console.log('Connected to Decision Core WebSocket')
        resolve()
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }
    })
  }

  send(module: string, action: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'))
        return
      }

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        this.ws?.removeEventListener('message', messageHandler)
        resolve(data)
      }

      this.ws.addEventListener('message', messageHandler)
      this.ws.send(JSON.stringify({ module, action }))
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Usage example
export async function runFMEAAuditWS() {
  const client = new DecisionCoreWS()
  await client.connect()
  const result = await client.send('audit_fmea', 'run')
  client.disconnect()
  return result
}
```

---

## Data Storage Integration

### Store Results in Supabase

```typescript
// src/lib/decisionCore/storage.ts
import { supabase } from '../supabase'

export async function saveFMEAResult(result: any) {
  const { data, error } = await supabase
    .from('fmea_audits')
    .insert({
      timestamp: result.timestamp,
      total_modos: result.total_modos,
      modos_falha: result.modos_falha,
      resumo: result.resumo,
    })
  
  if (error) throw error
  return data
}

export async function saveASOGResult(result: any) {
  const { data, error } = await supabase
    .from('asog_reviews')
    .insert({
      timestamp: result.timestamp,
      total_itens: result.total_itens,
      itens_revisados: result.itens_revisados,
      resumo: result.resumo,
    })
  
  if (error) throw error
  return data
}

export async function saveForecastResult(result: any) {
  const { data, error } = await supabase
    .from('risk_forecasts')
    .insert({
      timestamp: result.timestamp,
      previsoes: result.previsoes,
      matriz_risco: result.matriz_risco,
      recomendacoes: result.recomendacoes,
    })
  
  if (error) throw error
  return data
}
```

### Create Database Tables

```sql
-- FMEA Audits table
CREATE TABLE fmea_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL,
  total_modos INTEGER NOT NULL,
  modos_falha JSONB NOT NULL,
  resumo JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASOG Reviews table
CREATE TABLE asog_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL,
  total_itens INTEGER NOT NULL,
  itens_revisados JSONB NOT NULL,
  resumo JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Forecasts table
CREATE TABLE risk_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL,
  previsoes JSONB NOT NULL,
  matriz_risco JSONB NOT NULL,
  recomendacoes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables

Add to `.env`:

```bash
# Decision Core API Configuration
VITE_DECISION_CORE_API_URL=http://localhost:8000
VITE_DECISION_CORE_WS_URL=ws://localhost:8765

# Or for production
VITE_DECISION_CORE_API_URL=https://api.yourdomain.com
VITE_DECISION_CORE_WS_URL=wss://api.yourdomain.com/ws
```

---

## Deployment

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY core/ ./core/
COPY modules/ ./modules/
COPY api_server.py .

RUN pip install fastapi uvicorn

EXPOSE 8000

CMD ["python", "api_server.py"]
```

Build and run:

```bash
docker build -t nautilus-decision-core .
docker run -p 8000:8000 nautilus-decision-core
```

### Vercel Deployment

Deploy as serverless functions using Vercel's Python runtime.

---

## Testing Integration

```typescript
// __tests__/decisionCore.test.ts
import { describe, it, expect, vi } from 'vitest'
import { runFMEAAudit, runASOGReview, runRiskForecast } from '@/lib/decisionCore'

describe('Decision Core Integration', () => {
  it('should run FMEA audit', async () => {
    const result = await runFMEAAudit()
    expect(result).toHaveProperty('tipo', 'FMEA Audit')
    expect(result).toHaveProperty('modos_falha')
    expect(result.modos_falha.length).toBeGreaterThan(0)
  })

  it('should run ASOG review', async () => {
    const result = await runASOGReview()
    expect(result).toHaveProperty('tipo', 'ASOG Review')
    expect(result).toHaveProperty('resumo')
    expect(result.resumo).toHaveProperty('taxa_conformidade')
  })

  it('should run risk forecast', async () => {
    const result = await runRiskForecast()
    expect(result).toHaveProperty('tipo', 'Risk Forecast')
    expect(result).toHaveProperty('previsoes')
    expect(result.previsoes.length).toBeGreaterThan(0)
  })
})
```

---

## Next Steps

1. Choose your preferred integration approach
2. Set up the backend infrastructure
3. Implement frontend components
4. Create database tables for result storage
5. Test the integration thoroughly
6. Deploy to production

For more details, see:
- [DECISION_CORE_README.md](DECISION_CORE_README.md) - Technical documentation
- [DECISION_CORE_QUICKREF.md](DECISION_CORE_QUICKREF.md) - Quick reference guide
