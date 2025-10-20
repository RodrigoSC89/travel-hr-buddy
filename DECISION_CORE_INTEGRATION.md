# 🔗 Decision Core - Integration Guide

## Integração com Frontend React/TypeScript

O módulo Decision Core (Python) pode ser integrado ao frontend Nautilus One (React/TypeScript) de várias formas:

## 🎯 Opções de Integração

### Opção 1: Supabase Edge Functions (Recomendado)

Criar Edge Functions no Supabase para expor os módulos Python como endpoints REST.

**Vantagens:**
- Serverless (sem necessidade de servidor dedicado)
- Escalável automaticamente
- Integrado com autenticação do Supabase
- Deploy simplificado

**Implementação:**

1. **Criar Edge Function em Deno (TypeScript):**

```typescript
// supabase/functions/decision-core/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { module, action } = await req.json()
  
  // Executar módulo Python via subprocess ou API
  const result = await executePythonModule(module, action)
  
  return new Response(
    JSON.stringify(result),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

2. **Chamar do Frontend:**

```typescript
// src/services/decisionCore.ts
import { supabase } from '@/lib/supabase';

export async function runFMEAAudit() {
  const { data, error } = await supabase.functions.invoke('decision-core', {
    body: {
      module: 'audit_fmea',
      action: 'run'
    }
  });
  
  return data;
}
```

### Opção 2: API REST Separada

Criar uma API REST em Python usando FastAPI ou Flask.

**Implementação:**

1. **Criar API com FastAPI:**

```python
# api_server.py
from fastapi import FastAPI
from modules.decision_core import DecisionCore
from modules.audit_fmea import FMEAAuditor
from modules.forecast_risk import RiskForecast
from modules.asog_review import ASOGModule

app = FastAPI()

@app.post("/api/fmea/run")
async def run_fmea():
    auditor = FMEAAuditor()
    auditor.run()
    return {"status": "success", "data": auditor.audit_data}

@app.post("/api/forecast/analyze")
async def run_forecast():
    forecast = RiskForecast()
    forecast.analyze()
    return {"status": "success", "data": forecast.forecast_data}

@app.post("/api/asog/review")
async def run_asog():
    asog = ASOGModule()
    asog.start()
    return {"status": "success", "data": asog.review_items}
```

2. **Adicionar ao requirements.txt:**

```
fastapi>=0.104.0
uvicorn>=0.24.0
```

3. **Executar servidor:**

```bash
pip install -r requirements.txt
uvicorn api_server:app --reload --port 8000
```

4. **Chamar do Frontend:**

```typescript
// src/services/decisionCore.ts
const API_URL = import.meta.env.VITE_DECISION_CORE_API || 'http://localhost:8000';

export async function runFMEAAudit() {
  const response = await fetch(`${API_URL}/api/fmea/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return await response.json();
}
```

### Opção 3: WebSockets para Real-time

Para operações longas, usar WebSockets para comunicação real-time.

**Implementação:**

```python
# websocket_server.py
from fastapi import FastAPI, WebSocket
from modules.decision_core import DecisionCore

app = FastAPI()

@app.websocket("/ws/decision-core")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        data = await websocket.receive_json()
        
        # Processar comando
        result = await process_command(data)
        
        # Enviar resultado
        await websocket.send_json(result)
```

## 📦 Componentes React Sugeridos

### 1. Hook para Decision Core

```typescript
// src/hooks/useDecisionCore.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useDecisionCore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function runModule(module: string, action: string) {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: funcError } = await supabase.functions.invoke('decision-core', {
        body: { module, action }
      });
      
      if (funcError) throw funcError;
      return data;
      
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { runModule, loading, error };
}
```

### 2. Componente FMEA Dashboard

```typescript
// src/components/DecisionCore/FMEADashboard.tsx
import { useState } from 'react';
import { useDecisionCore } from '@/hooks/useDecisionCore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function FMEADashboard() {
  const { runModule, loading } = useDecisionCore();
  const [results, setResults] = useState(null);

  async function handleRunAudit() {
    const data = await runModule('audit_fmea', 'run');
    setResults(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 FMEA - Auditoria Técnica</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleRunAudit} disabled={loading}>
          {loading ? 'Executando...' : 'Executar Auditoria'}
        </Button>
        
        {results && (
          <div className="mt-4">
            {/* Renderizar resultados */}
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Página Decision Core

```typescript
// src/pages/DecisionCorePage.tsx
import { FMEADashboard } from '@/components/DecisionCore/FMEADashboard';
import { ASOGDashboard } from '@/components/DecisionCore/ASOGDashboard';
import { ForecastDashboard } from '@/components/DecisionCore/ForecastDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DecisionCorePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧭 Decision Core</h1>
      
      <Tabs defaultValue="fmea">
        <TabsList>
          <TabsTrigger value="fmea">FMEA Audit</TabsTrigger>
          <TabsTrigger value="asog">ASOG Review</TabsTrigger>
          <TabsTrigger value="forecast">Risk Forecast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fmea">
          <FMEADashboard />
        </TabsContent>
        
        <TabsContent value="asog">
          <ASOGDashboard />
        </TabsContent>
        
        <TabsContent value="forecast">
          <ForecastDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 🔧 Variáveis de Ambiente

Adicionar ao `.env.production`:

```bash
# Decision Core API
VITE_DECISION_CORE_API=https://your-api.com
VITE_DECISION_CORE_WS=wss://your-api.com/ws

# Supabase Edge Function (alternativa)
# Já configurado via VITE_SUPABASE_URL
```

## 📝 Roteamento

Adicionar ao `src/App.tsx` ou router:

```typescript
import { DecisionCorePage } from '@/pages/DecisionCorePage';

// Adicionar rota
{
  path: '/decision-core',
  element: <DecisionCorePage />
}
```

## 🔐 Autenticação

Proteger endpoints com autenticação Supabase:

```typescript
// Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

// Verificar autenticação
const authHeader = req.headers.get('Authorization')!
const token = authHeader.replace('Bearer ', '')
const { data: { user } } = await supabase.auth.getUser(token)

if (!user) {
  return new Response('Unauthorized', { status: 401 })
}
```

## 📊 Persistência de Estado

Salvar estado no Supabase em vez de arquivo local:

```typescript
// Frontend
async function saveState(action: string) {
  await supabase
    .from('nautilus_state')
    .insert({
      user_id: user.id,
      action: action,
      timestamp: new Date().toISOString()
    });
}
```

```sql
-- Migration SQL
create table nautilus_state (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  action text not null,
  timestamp timestamptz not null,
  created_at timestamptz default now()
);

-- RLS
alter table nautilus_state enable row level security;

create policy "Users can insert their own state"
  on nautilus_state for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own state"
  on nautilus_state for select
  using (auth.uid() = user_id);
```

## 🚀 Deploy

### Deploy da API REST (Opção 2)

**Railway / Render / Heroku:**

1. Criar `Procfile`:
```
web: uvicorn api_server:app --host 0.0.0.0 --port $PORT
```

2. Deploy:
```bash
git push heroku main
```

### Deploy Edge Functions (Opção 1)

```bash
supabase functions deploy decision-core
```

## 📈 Monitoramento

Integrar com Sentry (já configurado no projeto):

```python
# api_server.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production"
)
```

## 🧪 Testes de Integração

```typescript
// __tests__/decisionCore.test.ts
import { describe, it, expect } from 'vitest';
import { runFMEAAudit } from '@/services/decisionCore';

describe('Decision Core Integration', () => {
  it('should run FMEA audit', async () => {
    const result = await runFMEAAudit();
    
    expect(result).toHaveProperty('status', 'success');
    expect(result).toHaveProperty('data');
  });
});
```

## 📚 Próximos Passos

1. **Escolher opção de integração** (recomendado: Supabase Edge Functions)
2. **Criar Edge Functions ou API REST**
3. **Implementar componentes React**
4. **Adicionar roteamento**
5. **Configurar autenticação**
6. **Deploy em produção**
7. **Monitoramento e logs**

---

**Nota:** Este guia fornece múltiplas opções de integração. Escolha a que melhor se adapta à arquitetura e requisitos do seu projeto.
