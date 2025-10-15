# Incident AI Modal - Visual Summary

## 🎨 User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  PEOTRAM Incident Manager                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔴 Derramamento de Óleo no Convés                    │  │
│  │ ID: INC2024001                          [medium] [investigating] │
│  │                                                        │  │
│  │ Pequeno vazamento de óleo hidráulico...              │  │
│  │                                                        │  │
│  │ 📍 Convés Principal    👤 João Silva    📅 22/01/2024│  │
│  │                                                        │  │
│  │ ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │  │
│  │ │👁️ Ver      │ │✏️ Editar   │ │🧠 Analisar com IA│ ◄─── New!
│  │ │  Detalhes  │ │           │ │                  │  │  │
│  │ └────────────┘ └────────────┘ └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                        ↓ Click "Analisar com IA"

┌─────────────────────────────────────────────────────────────┐
│              Análise IA – Derramamento de Óleo               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pequeno vazamento de óleo hidráulico detectado durante     │
│  operação de guindaste                                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         🤖 Executar análise IA                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                        ↓ Processing with GPT-4o

┌─────────────────────────────────────────────────────────────┐
│              Análise IA – Derramamento de Óleo               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📊 ANÁLISE TÉCNICA                                    │  │
│  │                                                        │  │
│  │ O incidente apresenta características de falha       │  │
│  │ mecânica em sistema hidráulico, classificado como    │  │
│  │ incidente ambiental de média severidade...           │  │
│  │                                                        │  │
│  │ 🔍 CAUSA RAIZ PROVÁVEL                               │  │
│  │                                                        │  │
│  │ Baseado na metodologia 5 Porquês:                    │  │
│  │ 1. Desgaste de vedação hidráulica                    │  │
│  │ 2. Manutenção preventiva inadequada...               │  │
│  │                                                        │  │
│  │ 📋 NORMAS RELACIONADAS                               │  │
│  │                                                        │  │
│  │ • NR-26: Sinalização de segurança                    │  │
│  │ • MARPOL Anexo I: Prevenção de poluição por óleo    │  │
│  │ • ISM Code: Gestão de segurança...                   │  │
│  │                                                        │  │
│  │ ✅ AÇÕES SUGERIDAS                                   │  │
│  │                                                        │  │
│  │ Imediatas:                                            │  │
│  │ - Isolamento completo da área                        │  │
│  │ - Contenção e limpeza do óleo...                     │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         🔄 Executar nova análise                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌──────────────────┐
│  User clicks     │
│  "Analisar com   │
│   IA" button     │
└────────┬─────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  handleAnalyzeWithAI(incident)         │
│  ├─ Serialize incident data            │
│  ├─ Save to localStorage               │
│  └─ Dispatch storage event             │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  IncidentAiModal.tsx                   │
│  ├─ useEffect detects storage change   │
│  ├─ Parse incident data                │
│  ├─ Open dialog                        │
│  └─ Clear localStorage                 │
└────────┬───────────────────────────────┘
         │
         ↓ User clicks "Executar análise IA"
         │
┌────────────────────────────────────────┐
│  supabase.functions.invoke()           │
│  ├─ Method: dp-intel-analyze           │
│  ├─ Body: { incident }                 │
│  └─ Handle response/errors             │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  Supabase Edge Function                │
│  ├─ Validate request                   │
│  ├─ Build specialized prompt           │
│  └─ Call OpenAI API                    │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  OpenAI GPT-4o                         │
│  ├─ Process incident details           │
│  ├─ Apply maritime safety expertise    │
│  ├─ Generate comprehensive analysis    │
│  └─ Return structured response         │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  Edge Function Response                │
│  ├─ Parse OpenAI response              │
│  ├─ Optional: Save to database         │
│  └─ Return analysis to client          │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│  IncidentAiModal displays result       │
│  ├─ Show analysis in formatted box     │
│  ├─ Display success toast              │
│  └─ Enable "nova análise" button       │
└────────────────────────────────────────┘
```

## 📦 Component Structure

```
src/
├── components/
│   ├── dp/
│   │   └── IncidentAiModal.tsx ─────────┐
│   │       ├── useState (incident)       │
│   │       ├── useState (open)           │
│   │       ├── useState (analysis)       │ Modal Component
│   │       ├── useState (loading)        │
│   │       ├── useEffect (storage)       │
│   │       └── handleAnalyze()          ┘
│   │
│   └── peotram/
│       └── peotram-incident-manager.tsx ─┐
│           ├── Import IncidentAiModal    │
│           ├── handleAnalyzeWithAI()     │ Integration
│           ├── Button with Brain icon    │
│           └── <IncidentAiModal />      ┘
│
└── integrations/
    └── supabase/
        └── client.ts ──────────────────── Supabase client

supabase/
└── functions/
    └── dp-intel-analyze/
        └── index.ts ───────────────────┐
            ├── Interface definitions   │
            ├── CORS headers            │
            ├── OpenAI integration      │ Edge Function
            ├── Specialized prompts     │
            ├── Error handling          │
            └── Database storage        ┘
```

## 🎯 Key Features Highlighted

### 1. Seamless Integration
```typescript
// In any component
<Button onClick={() => handleAnalyzeWithAI(incident)}>
  <Brain className="w-3 h-3 mr-1" />
  Analisar com IA
</Button>
<IncidentAiModal />
```

### 2. Smart Detection
```typescript
useEffect(() => {
  const checkForIncident = () => {
    const data = localStorage.getItem('incident_to_analyze');
    if (data) {
      setIncident(JSON.parse(data));
      setOpen(true);
      localStorage.removeItem('incident_to_analyze');
    }
  };
  // Check on mount and on storage events
}, []);
```

### 3. Robust API Call
```typescript
const { data, error } = await supabase.functions.invoke('dp-intel-analyze', {
  body: { incident }
});
```

### 4. Expert AI Prompt
```typescript
const prompt = `
Você é um especialista em análise de incidentes de segurança marítima...
- Análise técnica considerando NRs, ISM, STCW, MARPOL
- Causa raiz usando 5 Porquês e Ishikawa
- Normas relacionadas
- Ações sugeridas priorizadas
- Riscos adicionais
- Plano de implementação
`;
```

## 🔐 Security & Best Practices

✅ **Authentication**: Via Supabase JWT
✅ **Validation**: TypeScript interfaces
✅ **Error Handling**: Try-catch + toast notifications
✅ **CORS**: Properly configured
✅ **Environment Variables**: Secure storage
✅ **Logging**: Console logs for debugging
✅ **User Feedback**: Loading states + toasts

## 📊 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| UI Components | Shadcn/ui (Dialog, Button) |
| State Management | React Hooks (useState, useEffect) |
| API Client | Supabase JS Client |
| Backend | Supabase Edge Functions (Deno) |
| AI Model | OpenAI GPT-4o |
| Notifications | Sonner (toast) |
| Icons | Lucide React |

## 🎬 Usage Example

```typescript
// 1. User sees incident card
<Card>
  <CardTitle>Derramamento de Óleo</CardTitle>
  <Button onClick={() => handleAnalyzeWithAI(incident)}>
    🧠 Analisar com IA
  </Button>
</Card>

// 2. Handler stores data
const handleAnalyzeWithAI = (incident) => {
  localStorage.setItem('incident_to_analyze', JSON.stringify(incident));
  window.dispatchEvent(new Event('storage'));
};

// 3. Modal opens automatically
// 4. User clicks "Executar análise IA"
// 5. GPT-4o processes and returns analysis
// 6. Result displayed in modal
```

## ✨ Benefits

1. **Zero Navigation**: Modal opens in place
2. **Context Preserved**: User stays on same page
3. **Quick Analysis**: 10-30 seconds turnaround
4. **Expert Insights**: Maritime safety specialist perspective
5. **Actionable Results**: Specific recommendations
6. **Regulatory Compliance**: NR and convention references
7. **Reusable**: Works with any incident management component

---

**Created**: 2025-10-14  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
