# Decision Core Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the Decision Core Python backend with your React/TypeScript frontend.

## Integration Options

The Decision Core module supports three integration approaches:

### Option 1: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function to call the Python backend:

```typescript
// supabase/functions/decision-core/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { module, action, params } = await req.json()
  
  // Call Python backend
  const process = Deno.run({
    cmd: ["python3", "main.py", module, action, JSON.stringify(params)],
    stdout: "piped"
  })
  
  const output = await process.output()
  const result = new TextDecoder().decode(output)
  
  return new Response(JSON.stringify(JSON.parse(result)), {
    headers: { "Content-Type": "application/json" }
  })
})
```

**Frontend Usage:**
```typescript
const { data } = await supabase.functions.invoke('decision-core', {
  body: { module: 'fmea', action: 'run' }
})
```

### Option 2: REST API with FastAPI

Create a FastAPI wrapper around the Decision Core:

```python
# api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/fmea/run")
async def run_fmea():
    results = run_fmea_audit()
    return results

@app.post("/api/asog/run")
async def run_asog():
    results = run_asog_review()
    return results

@app.post("/api/forecast/run")
async def run_forecast(timeframe: int = 30):
    results = run_risk_forecast(timeframe)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Frontend Usage:**
```typescript
const response = await fetch(`${API_URL}/api/fmea/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
const data = await response.json()
```

### Option 3: WebSocket for Real-time Updates

Create a WebSocket server for real-time updates:

```python
# websocket_server.py
import asyncio
import websockets
import json
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast

async def handler(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        module = data.get('module')
        
        if module == 'fmea':
            results = run_fmea_audit()
        elif module == 'asog':
            results = run_asog_review()
        elif module == 'forecast':
            results = run_risk_forecast()
        else:
            results = {'error': 'Unknown module'}
        
        await websocket.send(json.dumps(results))

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
```

**Frontend Usage:**
```typescript
const ws = new WebSocket('ws://localhost:8765')

ws.onopen = () => {
  ws.send(JSON.stringify({ module: 'fmea' }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Results:', data)
}
```

## TypeScript Data Models

### FMEA Audit Results
```typescript
interface FMEAFailureMode {
  id: string
  categoria: string
  modo_falha: string
  severidade: number
  ocorrencia: number
  deteccao: number
  rpn: number
  nivel_risco: "Crítico" | "Alto" | "Médio" | "Baixo"
  recomendacao: string
}

interface FMEAResults {
  modulo: "FMEA Auditor"
  timestamp: string
  modos_falha: FMEAFailureMode[]
  summary: {
    total_modos_falha: number
    critico: number
    alto: number
    medio: number
    baixo: number
    rpn_medio: number
  }
  status: string
}
```

### ASOG Review Results
```typescript
interface ASOGItem {
  item: string
  pontuacao: number
  status: string
  acao_recomendada: string
  prioridade: number
}

interface ASOGResults {
  modulo: "ASOG Reviewer"
  timestamp: string
  itens_revisados: ASOGItem[]
  compliance: {
    total_itens: number
    conformes: number
    requer_atencao: number
    taxa_conformidade: number
    pontuacao_media: number
  }
  areas_criticas: ASOGItem[]
  status: string
}
```

### Risk Forecast Results
```typescript
interface RiskPrediction {
  categoria: string
  probabilidade: number
  impacto: number
  score_risco: number
  nivel_risco: string
  recomendacao: string
  prioridade_mitigacao: number
}

interface RiskForecastResults {
  modulo: "Risk Forecaster"
  timestamp: string
  historico: Array<{ data: string; incidentes: number }>
  previsoes: RiskPrediction[]
  risk_matrix: {
    critico: string[]
    alto: string[]
    medio: string[]
    baixo: string[]
  }
  summary: {
    periodo_analise: string
    periodo_forecast: string
    tendencia: string
    total_incidentes_recentes: number
    riscos_criticos: number
    riscos_altos: number
    riscos_medios: number
    riscos_baixos: number
  }
  status: string
}
```

## React Components Examples

### FMEA Audit Component
```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function FMEAAudit() {
  const [results, setResults] = useState<FMEAResults | null>(null)
  const [loading, setLoading] = useState(false)

  const runAudit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/fmea/run', { method: 'POST' })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error running FMEA audit:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={runAudit} disabled={loading}>
        {loading ? 'Running...' : 'Run FMEA Audit'}
      </Button>
      
      {results && (
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-2">FMEA Audit Results</h3>
          <p>Total Failure Modes: {results.summary.total_modos_falha}</p>
          <p>Critical Risks: {results.summary.critico}</p>
          <p>High Risks: {results.summary.alto}</p>
        </Card>
      )}
    </div>
  )
}
```

### ASOG Review Component
```typescript
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function ASOGReview() {
  const [results, setResults] = useState<ASOGResults | null>(null)

  const runReview = async () => {
    const response = await fetch('/api/asog/run', { method: 'POST' })
    const data = await response.json()
    setResults(data)
  }

  return (
    <div>
      <button onClick={runReview}>Run ASOG Review</button>
      
      {results && (
        <div>
          <p>Compliance Rate: {results.compliance.taxa_conformidade.toFixed(1)}%</p>
          {results.itens_revisados.map((item) => (
            <div key={item.item}>
              <span>{item.item}</span>
              <Badge>{item.status}</Badge>
              <span>Score: {item.pontuacao}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Risk Forecast Component
```typescript
import { useState } from 'react'

export function RiskForecast() {
  const [results, setResults] = useState<RiskForecastResults | null>(null)
  const [timeframe, setTimeframe] = useState(30)

  const runForecast = async () => {
    const response = await fetch(`/api/forecast/run?timeframe=${timeframe}`, {
      method: 'POST'
    })
    const data = await response.json()
    setResults(data)
  }

  return (
    <div>
      <input
        type="number"
        value={timeframe}
        onChange={(e) => setTimeframe(Number(e.target.value))}
      />
      <button onClick={runForecast}>Run Forecast</button>
      
      {results && (
        <div>
          <p>Trend: {results.summary.tendencia}</p>
          <p>Critical Risks: {results.summary.riscos_criticos}</p>
          <p>High Risks: {results.summary.riscos_altos}</p>
        </div>
      )}
    </div>
  )
}
```

## Deployment Considerations

### Local Development
```bash
# Start Python backend
python3 main.py

# Or with FastAPI
pip install fastapi uvicorn
python3 api.py
```

### Production Deployment
1. **Containerize** the Python backend with Docker
2. **Deploy** to a cloud service (AWS Lambda, Google Cloud Functions, etc.)
3. **Configure** CORS and authentication
4. **Set up** monitoring and logging

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during API calls
3. **Caching**: Cache results when appropriate to reduce API calls
4. **Type Safety**: Use TypeScript interfaces for all API responses
5. **Authentication**: Implement proper authentication for production use

## Support

For questions or issues, please refer to:
- Technical Documentation: `DECISION_CORE_README.md`
- Quick Reference: `DECISION_CORE_QUICKREF.md`
- Visual Summary: `DECISION_CORE_VISUAL_SUMMARY.md`
