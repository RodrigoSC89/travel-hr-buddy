# ⚡ Edge Functions - Documentação Técnica

> **Última Atualização:** 2025-12-09  
> **Total de Funções:** 140+  

---

## 📋 Índice por Categoria

### Core
- [nautilus-brain](#nautilus-brain)
- [nautilus-ai](#nautilus-ai)
- [system-health](#system-health)
- [api-gateway](#api-gateway)

### Tripulação
- [crew-ai-analysis](#crew-ai-analysis)
- [crew-ai-copilot](#crew-ai-copilot)
- [crew-gamification](#crew-gamification)

### Manutenção
- [mmi-copilot](#mmi-copilot)
- [mmi-os-create](#mmi-os-create)
- [ai-predictive-maintenance](#ai-predictive-maintenance)

### Viagem
- [voyage-ai-copilot](#voyage-ai-copilot)
- [weather-integration](#weather-integration)

### Documentos
- [generate-document](#generate-document)
- [process-document](#process-document)
- [summarize-document](#summarize-document)

---

## 🧠 Core Functions

### nautilus-brain
**Endpoint:** `/functions/v1/nautilus-brain`  
**Método:** POST  
**Autenticação:** JWT Required

**Descrição:**  
Cérebro central do sistema Nautilus. Processa comandos de linguagem natural e coordena ações entre módulos.

**Request:**
```typescript
interface NautilusBrainRequest {
  command: string;
  context?: {
    module?: string;
    userId?: string;
    vesselId?: string;
  };
  options?: {
    stream?: boolean;
    maxTokens?: number;
  };
}
```

**Response:**
```typescript
interface NautilusBrainResponse {
  success: boolean;
  response: string;
  actions?: ActionItem[];
  suggestions?: string[];
  metadata?: {
    processingTime: number;
    tokensUsed: number;
    model: string;
  };
}
```

**Exemplo de Uso:**
```typescript
const { data } = await supabase.functions.invoke('nautilus-brain', {
  body: {
    command: "Quais tripulantes têm certificados vencendo este mês?",
    context: { module: 'crew-management' }
  }
});
```

---

### nautilus-ai
**Endpoint:** `/functions/v1/nautilus-ai`  
**Método:** POST  
**Autenticação:** JWT Required

**Descrição:**  
Processamento de IA para análise de dados e geração de insights.

**Secrets Necessários:**
- `OPENAI_API_KEY`

---

### system-health
**Endpoint:** `/functions/v1/system-health`  
**Método:** GET  
**Autenticação:** Pública

**Descrição:**  
Verifica a saúde do sistema e status dos serviços.

**Response:**
```typescript
interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    storage: boolean;
    edge_functions: boolean;
    ai_services: boolean;
  };
  uptime: number;
  version: string;
}
```

---

## 👥 Crew Functions

### crew-ai-analysis
**Endpoint:** `/functions/v1/crew-ai-analysis`  
**Método:** POST

**Descrição:**  
Análise de tripulação com IA - certificações, performance, recomendações.

**Request:**
```typescript
interface CrewAnalysisRequest {
  analysisType: 'certifications' | 'performance' | 'recommendations';
  vesselId?: string;
  crewMemberId?: string;
}
```

---

### crew-gamification
**Endpoint:** `/functions/v1/crew-gamification`  
**Método:** POST

**Descrição:**  
Sistema de gamificação para engajamento da tripulação.

**Features:**
- Badges e conquistas
- Pontuação de performance
- Leaderboards
- Desafios e missões

---

## 🔧 Maintenance Functions

### mmi-copilot
**Endpoint:** `/functions/v1/mmi-copilot`  
**Método:** POST

**Descrição:**  
Copiloto de manutenção industrial com IA. Sugere ações, diagnósticos e ordens de serviço.

**Request:**
```typescript
interface MMICopilotRequest {
  query: string;
  componentId?: string;
  vesselId?: string;
  includeHistory?: boolean;
}
```

---

### mmi-os-create
**Endpoint:** `/functions/v1/mmi-os-create`  
**Método:** POST

**Descrição:**  
Cria ordens de serviço de manutenção automaticamente.

**Request:**
```typescript
interface CreateOSRequest {
  title: string;
  description: string;
  componentId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate?: string;
  assignedTo?: string;
}
```

---

### ai-predictive-maintenance
**Endpoint:** `/functions/v1/ai-predictive-maintenance`  
**Método:** POST

**Descrição:**  
Manutenção preditiva com análise de padrões e previsão de falhas.

**Features:**
- Análise de histórico de falhas
- Previsão de próximas manutenções
- Recomendações de peças
- Estimativa de custos

---

## 🚢 Voyage Functions

### voyage-ai-copilot
**Endpoint:** `/functions/v1/voyage-ai-copilot`  
**Método:** POST

**Descrição:**  
Assistente de viagem com IA para planejamento e otimização.

**Features:**
- Otimização de rotas
- Previsão de consumo de combustível
- Análise meteorológica
- ETA dinâmico

---

### weather-integration
**Endpoint:** `/functions/v1/weather-integration`  
**Método:** GET/POST

**Descrição:**  
Integração com serviços meteorológicos para dados em tempo real.

**Secrets Necessários:**
- `WEATHER_API_KEY` (opcional)

---

## 📄 Document Functions

### generate-document
**Endpoint:** `/functions/v1/generate-document`  
**Método:** POST

**Descrição:**  
Gera documentos a partir de templates com dados dinâmicos.

**Request:**
```typescript
interface GenerateDocRequest {
  templateId: string;
  data: Record<string, any>;
  format: 'pdf' | 'docx' | 'markdown';
}
```

---

### process-document
**Endpoint:** `/functions/v1/process-document`  
**Método:** POST

**Descrição:**  
Processa documentos com OCR e extração de dados.

**Features:**
- OCR para imagens e PDFs
- Extração de campos estruturados
- Classificação automática
- Validação de documentos

---

## 🔐 Autenticação e CORS

### Headers Padrão
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Handler OPTIONS
```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### Verificação de Auth
```typescript
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
);

const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: corsHeaders
  });
}
```

---

## 📊 Monitoramento

### Logs
Todas as funções registram logs estruturados:
```typescript
console.log(JSON.stringify({
  level: 'info',
  function: 'function-name',
  action: 'action-type',
  userId: user?.id,
  duration: processingTime,
  metadata: { ... }
}));
```

### Métricas
- Tempo de resposta médio
- Taxa de sucesso/erro
- Uso de tokens (para funções AI)

---

*Documentação gerada automaticamente das Edge Functions.*
