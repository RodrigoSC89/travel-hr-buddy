# 🎯 Copilot Workflow API - Visual Implementation Guide

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Nautilus One Frontend                     │
│                    (React/TypeScript)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Workflow Management Component                      │    │
│  │                                                      │    │
│  │  import { useWorkflowSuggestions } from             │    │
│  │         '@/services/workflow-copilot'               │    │
│  │                                                      │    │
│  │  const { suggestion, getSuggestions } = ...         │    │
│  └──────────────────┬───────────────────────────────────┘    │
└────────────────────│────────────────────────────────────────┘
                     │
                     │ HTTP POST Request
                     │ + Auth Token
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Supabase Edge Functions (Deno)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /workflows-copilot-suggest                         │    │
│  │                                                      │    │
│  │  Input:                                             │    │
│  │    - workflow (required)                            │    │
│  │    - logs (optional)                                │    │
│  │    - falhas (optional)                              │    │
│  │    - atrasos (optional)                             │    │
│  │                                                      │    │
│  │  Process:                                           │    │
│  │    1. Validate input                                │    │
│  │    2. Build AI prompt                               │    │
│  │    3. Stream response from OpenAI                   │    │
│  └──────────────────┬───────────────────────────────────┘    │
└────────────────────│────────────────────────────────────────┘
                     │
                     │ OpenAI API Request
                     │ (GPT-4, stream: true)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI API                                │
│                    (GPT-4 Model)                             │
│                                                              │
│  System Prompt: "Você é uma IA que ajuda a gerenciar       │
│                  workflows operacionais..."                 │
│                                                              │
│  User Prompt: Context with workflow, logs, falhas, atrasos │
│                                                              │
│  Response: Structured suggestions (streamed)                │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
User Action
    │
    ├──> Click "Obter Sugestões" button
    │
    ├──> Component calls getSuggestions()
    │         {
    │           workflow: "Manutenção preventiva",
    │           logs: "Última execução: 2025-01-10",
    │           falhas: "Timeout em sensor",
    │           atrasos: "Etapa 2 atrasada 3 dias"
    │         }
    │
    ├──> Service sends POST to Supabase Edge Function
    │         Headers: Authorization Bearer Token
    │
    ├──> Edge Function builds AI prompt
    │         System: Workflow management assistant
    │         Context: All input data
    │         Instructions: Generate structured suggestions
    │
    ├──> OpenAI API processes request
    │         Model: GPT-4
    │         Mode: Streaming
    │
    ├──> Streaming response chunks
    │         Chunk 1: "Com base nas informações..."
    │         Chunk 2: "### Tarefas Sugeridas..."
    │         Chunk 3: "1. Verificar sensor..."
    │         ...
    │
    ├──> React hook updates state progressively
    │         setSuggestion(prev => prev + chunk)
    │
    └──> UI displays suggestions in real-time
            (User sees text appearing progressively)
```

## 📁 File Structure

```
travel-hr-buddy/
│
├── supabase/
│   └── functions/
│       └── workflows-copilot-suggest/
│           ├── index.ts              ← 🆕 Edge Function (150 lines)
│           └── README.md             ← 🆕 API Documentation (147 lines)
│
└── src/
    └── services/
        └── workflow-copilot.ts       ← 🆕 Frontend Service (144 lines)
```

## 🎨 Component Integration Example

```tsx
┌──────────────────────────────────────────────────────────┐
│  WorkflowCopilotPanel Component                          │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Input Fields                                     │    │
│  │ • Workflow name                                  │    │
│  │ • Recent logs                                    │    │
│  │ • Failures (falhas)                              │    │
│  │ • Delays (atrasos)                               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [Obter Sugestões da IA] Button                  │    │
│  │                                                  │    │
│  │ • Enabled: Ready to generate                    │    │
│  │ • Disabled: Loading... (isLoading=true)         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Suggestions Display Area                        │    │
│  │                                                  │    │
│  │ 📋 Tarefas a serem criadas:                     │    │
│  │   1. Verificar sensor de temperatura...         │    │
│  │   2. Atualizar documentação do processo...      │    │
│  │                                                  │    │
│  │ ⏰ Etapas com prazo a ajustar:                  │    │
│  │   • Etapa 2: Reduzir prazo em 1 dia             │    │
│  │                                                  │    │
│  │ 👤 Responsáveis sugeridos:                      │    │
│  │   • João Silva (Técnico Sênior)                 │    │
│  │                                                  │    │
│  │ 🔴 Criticidade: ALTA                            │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## 🔐 Security & Authentication

```
┌──────────────────────────────────────────────────────────┐
│  Authentication Flow                                      │
│                                                           │
│  1. User logs in to Nautilus One                         │
│     └─> Supabase creates session                         │
│         └─> access_token stored in localStorage          │
│                                                           │
│  2. Frontend calls workflow-copilot service              │
│     └─> Service retrieves session                        │
│         └─> Extracts access_token                        │
│                                                           │
│  3. Request sent with Authorization header               │
│     └─> Authorization: Bearer {access_token}             │
│                                                           │
│  4. Edge Function validates token                        │
│     └─> Supabase automatically checks validity           │
│         └─> Returns 401 if invalid/expired               │
│                                                           │
│  5. If valid, process request                            │
│     └─> Call OpenAI API with OPENAI_API_KEY             │
│         └─> Stream response back to client               │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Checklist

```
┌──────────────────────────────────────────────────────────┐
│  Pre-Deployment                                          │
│  ☑ Code reviewed and tested                             │
│  ☑ Documentation complete                               │
│  ☑ Build passes successfully                            │
│                                                           │
│  Deployment Steps                                        │
│  1. Set environment variables                           │
│     $ supabase secrets set OPENAI_API_KEY=sk-...       │
│                                                           │
│  2. Deploy edge function                                │
│     $ supabase functions deploy                         │
│         workflows-copilot-suggest                       │
│                                                           │
│  3. Test endpoint                                        │
│     $ curl -X POST [URL] -H "Authorization: ..."       │
│                                                           │
│  Post-Deployment                                         │
│  ☐ Verify function is accessible                        │
│  ☐ Test with real workflow data                         │
│  ☐ Monitor logs for errors                              │
│  ☐ Update frontend to use production URL                │
└──────────────────────────────────────────────────────────┘
```

## 📊 Request/Response Example

```json
┌──────────────────────────────────────────────────────────┐
│  REQUEST                                                  │
│                                                           │
│  POST /functions/v1/workflows-copilot-suggest            │
│  Headers:                                                 │
│    Content-Type: application/json                        │
│    Authorization: Bearer eyJhbGc...                       │
│                                                           │
│  Body:                                                    │
│  {                                                        │
│    "workflow": "Manutenção preventiva de equipamentos",  │
│    "logs": "Última execução: 2025-01-10, 45min",        │
│    "falhas": "Etapa 3: timeout ao conectar sensor",     │
│    "atrasos": "Etapa 2 atrasada em 3 dias"              │
│  }                                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  RESPONSE (Streaming)                                     │
│                                                           │
│  Status: 200 OK                                           │
│  Content-Type: text/plain; charset=utf-8                 │
│                                                           │
│  Body (streamed chunks):                                  │
│                                                           │
│  Com base na análise do workflow de manutenção          │
│  preventiva, identificamos as seguintes sugestões:       │
│                                                           │
│  ### 📋 Tarefas a serem criadas:                        │
│                                                           │
│  1. **Verificar sensor de temperatura**                  │
│     - Criticidade: ALTA                                  │
│     - Responsável sugerido: Técnico de Manutenção       │
│     - Prazo: Imediato                                    │
│                                                           │
│  2. **Atualizar protocolo de timeout**                  │
│     - Criticidade: MÉDIA                                 │
│     - Responsável: Engenheiro de Sistema                │
│     - Prazo: 2 dias                                      │
│                                                           │
│  ### ⏰ Ajustes de prazo recomendados:                  │
│                                                           │
│  - Etapa 2: Reduzir prazo em 1 dia para compensar       │
│    atraso atual                                          │
│                                                           │
│  ### 👤 Responsáveis mais adequados:                    │
│                                                           │
│  - João Silva (Técnico Sênior) - Etapa 3                │
│  - Maria Santos (Especialista em Sensores) - Etapa 1    │
└──────────────────────────────────────────────────────────┘
```

## 🎯 Key Benefits

```
┌──────────────────────────────────────────────────────────┐
│  Business Value                                          │
│                                                           │
│  🚀 Faster Decision Making                              │
│     AI suggestions in seconds, not hours                 │
│                                                           │
│  📊 Data-Driven Insights                                │
│     Based on actual logs, failures, and delays           │
│                                                           │
│  🎯 Targeted Recommendations                            │
│     Contextual to specific workflows                     │
│                                                           │
│  ⚡ Real-time Feedback                                  │
│     Streaming shows progress immediately                 │
│                                                           │
│  💡 Intelligent Automation                              │
│     Reduces manual analysis time                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Technical Benefits                                      │
│                                                           │
│  🧩 Easy Integration                                    │
│     Simple React hook for any component                  │
│                                                           │
│  📝 Type Safety                                          │
│     Full TypeScript support                              │
│                                                           │
│  🔧 Reusable                                            │
│     Service works across multiple components             │
│                                                           │
│  📚 Well Documented                                     │
│     Complete examples and guides                         │
│                                                           │
│  ✅ Production Ready                                    │
│     Error handling, validation, CORS configured          │
└──────────────────────────────────────────────────────────┘
```

## 🔄 Integration Points

```
┌──────────────────────────────────────────────────────────┐
│  Nautilus One System Integration                         │
│                                                           │
│  1. Smart Workflows Module                               │
│     └─> Call from workflow management pages              │
│                                                           │
│  2. Audit System                                         │
│     └─> Feed failure and log data automatically          │
│                                                           │
│  3. Task Management                                      │
│     └─> Convert suggestions to actionable tasks          │
│                                                           │
│  4. Real-time Monitoring                                 │
│     └─> Display streaming suggestions in dashboards      │
│                                                           │
│  5. Notification System                                  │
│     └─> Alert users of critical suggestions              │
└──────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ Implementation Complete
**Files Created:** 4 (441 lines total)
**Ready for:** Production Deployment
**Next Step:** Deploy to Supabase and configure OpenAI API key

