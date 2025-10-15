# JobsForecastReport Component

## Descrição

Componente React que exibe previsões baseadas em IA para jobs nos próximos 2 meses, com recomendações preventivas baseadas em dados históricos de tendências.

## Funcionalidades

- 🔮 **Previsão IA de jobs para os próximos 2 meses**
- 🧠 **Recomendações preventivas com base nos dados reais**
- 📥 **Gatilho automático se os dados de tendência estiverem disponíveis**
- 📊 **Análise de tendências e padrões sazonais**
- ⚡ **Loading states e feedback visual**

## Uso

```tsx
import JobsForecastReport from "@/components/bi/JobsForecastReport";

// Dados de exemplo de tendência
const trendData = [
  { date: "2024-10-01", value: 120, count: 15 },
  { date: "2024-10-02", value: 135, count: 18 },
  { date: "2024-10-03", value: 142, count: 20 },
  // ... mais dados
];

function MyDashboard() {
  return (
    <div>
      <h1>Dashboard de BI</h1>
      <JobsForecastReport trend={trendData} />
    </div>
  );
}
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `trend` | `TrendDataPoint[]` | Sim | Array de dados de tendência com informações históricas |

### TrendDataPoint Interface

```typescript
interface TrendDataPoint {
  date?: string;      // Data do ponto de dados
  value?: number;     // Valor numérico
  count?: number;     // Contagem de jobs
  total?: number;     // Total acumulado
  [key: string]: string | number | undefined;
}
```

## Comportamento

1. **Carregamento Automático**: Se `trend` contém dados (length > 0), a previsão é gerada automaticamente ao montar o componente.

2. **Carregamento Manual**: Se não houver dados de tendência iniciais, um botão "Gerar Previsão" é exibido para trigger manual.

3. **Estados Visuais**:
   - Loading: Exibe skeleton enquanto aguarda resposta da IA
   - Success: Mostra previsão formatada em texto
   - Error: Toast notification com mensagem de erro

## API Endpoint

O componente utiliza o Supabase Edge Function `bi-jobs-forecast` que:

- Analisa os dados de tendência fornecidos
- Calcula estatísticas (min, max, média, tendência)
- Utiliza OpenAI GPT-4o-mini para gerar previsões contextuais
- Retorna previsão formatada em português brasileiro

### Exemplo de Resposta

```json
{
  "success": true,
  "forecast": "📊 PREVISÃO PARA OS PRÓXIMOS 2 MESES:\n\n...",
  "generatedAt": "2024-10-15T19:00:00Z"
}
```

## Estilos

O componente usa Tailwind CSS e componentes do shadcn/ui:
- Card para container principal
- Skeleton para loading state
- Button para ação manual
- Toast para feedback de erro

## Dependências

- React 18+
- @supabase/supabase-js
- shadcn/ui components (Card, Button, Skeleton)
- Tailwind CSS

## Variáveis de Ambiente

O Supabase Edge Function requer:

```bash
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testes

Testes unitários disponíveis em `src/tests/components/bi/JobsForecastReport.test.tsx`.

Para executar:

```bash
npm test JobsForecastReport.test.tsx
```

## Exemplo Completo

```tsx
import { useState, useEffect } from "react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

function JobsAnalyticsDashboard() {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    // Buscar dados históricos de jobs
    async function loadTrendData() {
      // ... lógica para buscar dados
      const data = await fetchJobsHistory();
      setTrendData(data);
    }
    
    loadTrendData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Análise de Jobs - BI
      </h1>
      
      <div className="grid gap-6">
        {/* Outros componentes de dashboard */}
        
        <JobsForecastReport trend={trendData} />
      </div>
    </div>
  );
}
```

## Notas Importantes

- A previsão é gerada usando IA e pode variar em cada execução
- Recomenda-se ter pelo menos 7-10 pontos de dados para previsões mais precisas
- O componente trata erros gracefully com toast notifications
- A previsão considera sazonalidade e padrões de tendência nos dados fornecidos
