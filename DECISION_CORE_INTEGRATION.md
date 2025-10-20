# Decision Core Integration Guide

## Overview

This guide shows how to integrate the Decision Core Python backend with your React/TypeScript frontend in the Nautilus One system.

## Integration Options

### Option 1: Supabase Edge Functions (Recommended)

Use Supabase Edge Functions to wrap the Python Decision Core and expose it via REST API.

#### Setup

1. **Create Edge Function:**

```bash
supabase functions new decision-core
```

2. **Implement Function (supabase/functions/decision-core/index.ts):**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { module, action, params } = await req.json()
    
    // Execute Python Decision Core
    const command = new Deno.Command("python3", {
      args: ["-c", `
from modules.decision_core import DecisionCore
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast
import json

if "${module}" == "fmea":
    results = run_fmea_audit()
elif "${module}" == "asog":
    results = run_asog_review()
elif "${module}" == "forecast":
    timeframe = ${params?.timeframe || 30}
    results = run_risk_forecast(timeframe)
else:
    results = {"error": "Unknown module"}

print(json.dumps(results))
      `],
      stdout: "piped"
    })
    
    const { code, stdout } = await command.output()
    
    if (code === 0) {
      const results = JSON.parse(new TextDecoder().decode(stdout))
      
      return new Response(
        JSON.stringify({ success: true, data: results }),
        { headers: { "Content-Type": "application/json" } }
      )
    } else {
      throw new Error("Python execution failed")
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

3. **Deploy Function:**

```bash
supabase functions deploy decision-core
```

#### Frontend Integration

```typescript
// src/hooks/useDecisionCore.ts
import { supabase } from '@/lib/supabase'

export const useDecisionCore = () => {
  const runFMEAAudit = async () => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: { module: 'fmea', action: 'run' }
    })
    
    if (error) throw error
    return data.data
  }
  
  const runASOGReview = async () => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: { module: 'asog', action: 'run' }
    })
    
    if (error) throw error
    return data.data
  }
  
  const runRiskForecast = async (timeframe: number = 30) => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: { module: 'forecast', action: 'run', params: { timeframe } }
    })
    
    if (error) throw error
    return data.data
  }
  
  return { runFMEAAudit, runASOGReview, runRiskForecast }
}
```

#### Usage in Components

```typescript
// src/pages/DecisionCore.tsx
import { useDecisionCore } from '@/hooks/useDecisionCore'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const DecisionCorePage = () => {
  const { runFMEAAudit, runASOGReview, runRiskForecast } = useDecisionCore()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleFMEAAudit = async () => {
    setLoading(true)
    try {
      const data = await runFMEAAudit()
      setResults(data)
    } catch (error) {
      console.error('FMEA Audit failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Decision Core</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Button onClick={handleFMEAAudit} disabled={loading}>
          Run FMEA Audit
        </Button>
        <Button onClick={() => runASOGReview()} disabled={loading}>
          Run ASOG Review
        </Button>
        <Button onClick={() => runRiskForecast(30)} disabled={loading}>
          Run Risk Forecast
        </Button>
      </div>
      
      {results && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <pre className="overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
```

### Option 2: REST API with FastAPI

Create a FastAPI backend that wraps the Decision Core.

#### Setup

1. **Create FastAPI app (api/main.py):**

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.append('..')

from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast

app = FastAPI(title="Nautilus Decision Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ForecastParams(BaseModel):
    timeframe: int = 30

@app.get("/")
def root():
    return {"message": "Nautilus Decision Core API", "version": "1.0.0"}

@app.post("/api/fmea/run")
def run_fmea():
    try:
        results = run_fmea_audit()
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/asog/run")
def run_asog():
    try:
        results = run_asog_review()
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forecast/run")
def run_forecast(params: ForecastParams):
    try:
        results = run_risk_forecast(params.timeframe)
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

2. **Install dependencies:**

```bash
pip install fastapi uvicorn
```

3. **Run server:**

```bash
python api/main.py
```

#### Frontend Integration

```typescript
// src/api/decisionCore.ts
const API_URL = import.meta.env.VITE_DECISION_CORE_API_URL || 'http://localhost:8000'

export const decisionCoreApi = {
  runFMEAAudit: async () => {
    const response = await fetch(`${API_URL}/api/fmea/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data
  },
  
  runASOGReview: async () => {
    const response = await fetch(`${API_URL}/api/asog/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data
  },
  
  runRiskForecast: async (timeframe: number = 30) => {
    const response = await fetch(`${API_URL}/api/forecast/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeframe })
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data
  }
}
```

### Option 3: WebSocket for Real-time Updates

For real-time monitoring and streaming results.

#### Backend (api/ws_server.py)

```python
import asyncio
import websockets
import json
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast

async def handle_client(websocket, path):
    async for message in websocket:
        try:
            data = json.loads(message)
            module = data.get('module')
            
            # Send progress updates
            await websocket.send(json.dumps({"status": "running", "module": module}))
            
            if module == 'fmea':
                results = run_fmea_audit()
            elif module == 'asog':
                results = run_asog_review()
            elif module == 'forecast':
                timeframe = data.get('timeframe', 30)
                results = run_risk_forecast(timeframe)
            else:
                results = {"error": "Unknown module"}
            
            await websocket.send(json.dumps({"status": "completed", "data": results}))
        except Exception as e:
            await websocket.send(json.dumps({"status": "error", "error": str(e)}))

async def main():
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
```

#### Frontend Integration

```typescript
// src/hooks/useDecisionCoreWs.ts
import { useEffect, useState } from 'react'

export const useDecisionCoreWs = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [results, setResults] = useState(null)
  
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8765')
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setStatus(data.status)
      if (data.data) setResults(data.data)
    }
    
    setWs(websocket)
    
    return () => websocket.close()
  }, [])
  
  const runModule = (module: string, params?: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ module, ...params }))
    }
  }
  
  return { runModule, status, results }
}
```

## Data Models

### FMEA Audit Response

```typescript
interface FMEAResults {
  timestamp: string
  audit_type: 'FMEA'
  total_modes: number
  failure_modes: FailureMode[]
  recommendations: string[]
  summary: {
    total: number
    critico: number
    alto: number
    medio: number
    baixo: number
    rpn_medio: number
  }
}

interface FailureMode {
  id: number
  category: string
  mode: string
  effect: string
  cause: string
  severity: number
  occurrence: number
  detection: number
  rpn: number
  priority: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'
}
```

### ASOG Review Response

```typescript
interface ASOGResults {
  timestamp: string
  review_type: 'ASOG'
  total_items: number
  items_status: ItemStatus[]
  compliance: {
    total_items: number
    conformes: number
    requer_atencao: number
    taxa_conformidade: number
    score_medio: number
  }
  attention_areas: string[]
  recommendations: string[]
}

interface ItemStatus {
  id: number
  item: string
  score: number
  status: string
  last_review: string
  notes: string
}
```

### Risk Forecast Response

```typescript
interface RiskForecastResults {
  timestamp: string
  forecast_type: 'Risk Prediction'
  timeframe_days: number
  historical_analysis: {
    period: string
    total_incidents: number
    by_category: Record<string, number>
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  predictions: RiskPrediction[]
  risk_matrix: {
    critico: string[]
    alto: string[]
    medio: string[]
    baixo: string[]
    summary: {
      total: number
      critico_count: number
      alto_count: number
      medio_count: number
      baixo_count: number
    }
  }
  recommendations: string[]
}

interface RiskPrediction {
  category: string
  probability: number
  impact: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'
  risk_score: number
  risk_level: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'
  color: string
  timeframe_days: number
  mitigation_priority: number
}
```

## Environment Variables

Add to your `.env` file:

```bash
# Decision Core API (if using FastAPI)
VITE_DECISION_CORE_API_URL=http://localhost:8000

# Decision Core WebSocket (if using WS)
VITE_DECISION_CORE_WS_URL=ws://localhost:8765
```

## Deployment

### Production Deployment

1. **Deploy Python Backend:**
   - Use Docker container with Python 3.12
   - Copy all `core/` and `modules/` files
   - Set up persistent storage for logs and state files

2. **Configure Environment:**
   - Set production API endpoints
   - Configure SGSO connection details
   - Set up monitoring and alerts

3. **Security:**
   - Add authentication to API endpoints
   - Use HTTPS/WSS in production
   - Implement rate limiting
   - Validate and sanitize all inputs

## Best Practices

1. **Error Handling:**
   ```typescript
   try {
     const results = await runFMEAAudit()
     // Handle success
   } catch (error) {
     console.error('FMEA Audit failed:', error)
     // Show user-friendly error message
   }
   ```

2. **Loading States:**
   ```typescript
   const [loading, setLoading] = useState(false)
   
   const handleAudit = async () => {
     setLoading(true)
     try {
       await runFMEAAudit()
     } finally {
       setLoading(false)
     }
   }
   ```

3. **Caching Results:**
   ```typescript
   const { data, isLoading, error } = useQuery({
     queryKey: ['fmea-audit'],
     queryFn: runFMEAAudit,
     staleTime: 5 * 60 * 1000 // 5 minutes
   })
   ```

## Testing Integration

```typescript
// src/__tests__/decisionCore.test.ts
import { describe, it, expect, vi } from 'vitest'
import { decisionCoreApi } from '@/api/decisionCore'

describe('Decision Core API', () => {
  it('runs FMEA audit successfully', async () => {
    const results = await decisionCoreApi.runFMEAAudit()
    
    expect(results).toHaveProperty('audit_type', 'FMEA')
    expect(results.failure_modes).toBeInstanceOf(Array)
    expect(results.total_modes).toBeGreaterThan(0)
  })
})
```

## Support

For issues or questions:
- Check logs in `nautilus_logs.txt`
- Verify state in `nautilus_state.json`
- Run tests with `python3 test_decision_core.py`
- Review documentation in `DECISION_CORE_README.md`
