# Decision Core Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the Decision Core Python backend with your React/TypeScript frontend. Three integration approaches are documented with complete examples.

## Integration Options

### Option 1: Supabase Edge Functions (Recommended) ⭐

Best for: Serverless deployment, automatic scaling, integrated authentication

#### Backend Setup

1. **Create Edge Function**

```bash
supabase functions new decision-core
```

2. **Implement Edge Function** (`supabase/functions/decision-core/index.ts`)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { module, action, params } = await req.json()
  
  // Execute Python module via Deno subprocess
  const pythonCmd = new Deno.Command('python3', {
    args: ['-c', `
from modules.${module} import *
# Execute specific action
result = execute_${action}(${JSON.stringify(params)})
print(result)
    `],
    stdout: 'piped',
    stderr: 'piped',
  })
  
  const output = await pythonCmd.output()
  const result = new TextDecoder().decode(output.stdout)
  
  return new Response(
    JSON.stringify({ success: true, data: result }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

3. **Deploy Edge Function**

```bash
supabase functions deploy decision-core
```

#### Frontend Integration

```typescript
// src/hooks/useDecisionCore.ts
import { supabase } from '@/integrations/supabase/client'

export const useDecisionCore = () => {
  const executeFMEA = async () => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: {
        module: 'audit_fmea',
        action: 'run',
        params: {}
      }
    })
    
    if (error) throw error
    return data
  }
  
  const executeASOG = async () => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: {
        module: 'asog_review',
        action: 'start',
        params: {}
      }
    })
    
    if (error) throw error
    return data
  }
  
  const executeForecast = async () => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: {
        module: 'forecast_risk',
        action: 'analyze',
        params: {}
      }
    })
    
    if (error) throw error
    return data
  }
  
  const exportReport = async (reportFile: string) => {
    const { data, error } = await supabase.functions.invoke('decision-core', {
      body: {
        module: 'pdf_exporter',
        action: 'export',
        params: { reportFile }
      }
    })
    
    if (error) throw error
    return data
  }
  
  return {
    executeFMEA,
    executeASOG,
    executeForecast,
    exportReport
  }
}
```

#### React Component Example

```typescript
// src/components/DecisionCore/DecisionDashboard.tsx
import { useState } from 'react'
import { useDecisionCore } from '@/hooks/useDecisionCore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const DecisionDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { executeFMEA, executeASOG, executeForecast } = useDecisionCore()
  
  const handleFMEA = async () => {
    setLoading(true)
    try {
      const data = await executeFMEA()
      setResults(data)
    } catch (error) {
      console.error('FMEA execution failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleASOG = async () => {
    setLoading(true)
    try {
      const data = await executeASOG()
      setResults(data)
    } catch (error) {
      console.error('ASOG execution failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleForecast = async () => {
    setLoading(true)
    try {
      const data = await executeForecast()
      setResults(data)
    } catch (error) {
      console.error('Forecast execution failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🧭 Nautilus One - Decision Core</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleFMEA} disabled={loading}>
              🧠 Run FMEA Audit
            </Button>
            <Button onClick={handleASOG} disabled={loading}>
              📋 Run ASOG Review
            </Button>
            <Button onClick={handleForecast} disabled={loading}>
              🔮 Run Risk Forecast
            </Button>
          </div>
          
          {results && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(results, null, 2)}</pre>
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

Best for: Direct API control, custom endpoints, self-hosted deployment

#### Backend Setup

1. **Install FastAPI** (optional, if you want REST API)

```bash
pip install fastapi uvicorn
```

2. **Create API Server** (`api_server.py`)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from modules.audit_fmea import FMEAAuditor
from modules.asog_review import ASOGModule
from modules.forecast_risk import RiskForecast
from core.pdf_exporter import export_report
import json

app = FastAPI(title="Nautilus One Decision Core API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/fmea/run")
async def run_fmea():
    """Execute FMEA audit."""
    try:
        auditor = FMEAAuditor()
        auditor.run()
        
        with open("relatorio_fmea_atual.json", "r") as f:
            report = json.load(f)
        
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/asog/run")
async def run_asog():
    """Execute ASOG review."""
    try:
        asog = ASOGModule()
        asog.start()
        
        with open("relatorio_asog_atual.json", "r") as f:
            report = json.load(f)
        
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forecast/run")
async def run_forecast():
    """Execute risk forecast."""
    try:
        forecast = RiskForecast()
        forecast.analyze()
        
        with open("relatorio_forecast_atual.json", "r") as f:
            report = json.load(f)
        
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reports/export")
async def export_pdf(report_file: str):
    """Export report to PDF."""
    try:
        export_report(report_file)
        return {"success": True, "message": "Report exported"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

3. **Run API Server**

```bash
python3 api_server.py
```

#### Frontend Integration

```typescript
// src/services/decisionCoreApi.ts
const API_URL = process.env.VITE_DECISION_CORE_API_URL || 'http://localhost:8000'

export const decisionCoreApi = {
  async executeFMEA() {
    const response = await fetch(`${API_URL}/api/fmea/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) throw new Error('FMEA execution failed')
    return response.json()
  },
  
  async executeASOG() {
    const response = await fetch(`${API_URL}/api/asog/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) throw new Error('ASOG execution failed')
    return response.json()
  },
  
  async executeForecast() {
    const response = await fetch(`${API_URL}/api/forecast/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) throw new Error('Forecast execution failed')
    return response.json()
  },
  
  async exportReport(reportFile: string) {
    const response = await fetch(`${API_URL}/api/reports/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_file: reportFile })
    })
    
    if (!response.ok) throw new Error('Export failed')
    return response.json()
  }
}
```

---

### Option 3: WebSocket for Real-time Updates

Best for: Real-time monitoring, live updates, streaming results

#### Backend Setup

```python
# websocket_server.py
import asyncio
import websockets
import json
from modules.decision_core import DecisionCore

async def handle_client(websocket, path):
    """Handle WebSocket client connections."""
    async for message in websocket:
        data = json.loads(message)
        module = data.get('module')
        action = data.get('action')
        
        # Execute module
        if module == 'audit_fmea' and action == 'run':
            from modules.audit_fmea import FMEAAuditor
            auditor = FMEAAuditor()
            auditor.run()
            
            with open("relatorio_fmea_atual.json", "r") as f:
                result = json.load(f)
            
            await websocket.send(json.dumps({
                "type": "result",
                "module": module,
                "data": result
            }))

async def main():
    server = await websockets.serve(handle_client, "localhost", 8765)
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
```

#### Frontend Integration

```typescript
// src/hooks/useDecisionCoreWebSocket.ts
import { useEffect, useState } from 'react'

export const useDecisionCoreWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [results, setResults] = useState<any>(null)
  
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8765')
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setResults(data)
    }
    
    setWs(websocket)
    
    return () => {
      websocket.close()
    }
  }, [])
  
  const executeFMEA = () => {
    if (ws) {
      ws.send(JSON.stringify({
        module: 'audit_fmea',
        action: 'run'
      }))
    }
  }
  
  return { executeFMEA, results }
}
```

---

## Environment Variables

Add to `.env`:

```bash
# Option 1: Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Option 2: REST API
VITE_DECISION_CORE_API_URL=http://localhost:8000

# Option 3: WebSocket
VITE_DECISION_CORE_WS_URL=ws://localhost:8765
```

## Deployment

### Supabase Edge Functions
```bash
supabase functions deploy decision-core
```

### Docker (REST API)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install fastapi uvicorn
CMD ["python3", "api_server.py"]
```

### Vercel (Edge Functions)
See Vercel documentation for Python edge functions.

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during execution
3. **Result Caching**: Cache results to avoid redundant API calls
4. **Authentication**: Secure endpoints with JWT or API keys
5. **Rate Limiting**: Implement rate limiting for production

## Troubleshooting

**Issue**: Edge function timeout
**Solution**: Increase timeout in `supabase/functions/config.toml`

**Issue**: CORS errors
**Solution**: Configure CORS properly in backend

**Issue**: WebSocket disconnects
**Solution**: Implement reconnection logic

## Support

For integration support, see:
- `DECISION_CORE_README.md` - Module documentation
- `DECISION_CORE_QUICKREF.md` - Quick reference
- `DECISION_CORE_VISUAL_SUMMARY.md` - Visual guide
