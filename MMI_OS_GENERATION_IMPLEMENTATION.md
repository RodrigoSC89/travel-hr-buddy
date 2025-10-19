# Etapa 4 — Geração de Ordem de Serviço (OS) a partir do Forecast

## 📋 Visão Geral

Esta implementação permite a criação automática de Ordens de Serviço (OS) diretamente a partir dos forecasts de IA gerados pelo sistema MMI (Manutenção e Manutenibilidade Industrial).

## ✅ Status da Implementação

| Recurso | Status |
|---------|--------|
| Forecast IA por GPT-4 | ✅ Implementado |
| Forecast salvo no Supabase | ✅ Implementado |
| Painel /admin/mmi/forecast | ✅ Implementado |
| Geração manual de OS via botão | ✅ Implementado |
| Tabela mmi_os com referência ao forecast | ✅ Implementado |
| Função createOSFromForecast() | ✅ Implementado |
| Testes unitários | ✅ Implementado |

## 🗄️ Estrutura do Banco de Dados

### Tabela `mmi_os`

```sql
create table mmi_os (
  id uuid primary key default gen_random_uuid(),
  forecast_id uuid references mmi_forecasts(id) on delete set null,
  job_id uuid references mmi_jobs(id) on delete cascade,
  status text default 'pendente' check (status in ('open', 'in_progress', 'completed', 'cancelled', 'pendente')),
  descricao text,
  notes text,
  opened_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Campos Principais

- **forecast_id**: Referência ao forecast que originou a OS (opcional)
- **job_id**: Referência ao job relacionado (opcional)
- **status**: Status da ordem de serviço
  - `pendente` - Aguardando execução
  - `open` - Aberta
  - `in_progress` - Em andamento
  - `completed` - Concluída
  - `cancelled` - Cancelada
- **descricao**: Descrição detalhada da OS
- **created_by**: Usuário que criou a OS

## 🔧 Implementação

### 1. Função `createOSFromForecast()`

Localização: `/src/services/mmi/ordersService.ts`

```typescript
export async function createOSFromForecast(
  forecastId: string,
  jobId: string | null,
  descricao: string
): Promise<boolean>
```

**Parâmetros:**
- `forecastId` (string): UUID do forecast de origem
- `jobId` (string | null): UUID do job relacionado (opcional)
- `descricao` (string): Descrição da ordem de serviço

**Retorno:**
- `Promise<boolean>`: `true` se a OS foi criada com sucesso, `false` caso contrário

**Exemplo de uso:**

```typescript
import { createOSFromForecast } from "@/services/mmi/ordersService";

const success = await createOSFromForecast(
  "forecast-uuid-123",
  null, // sem job relacionado
  "Gerado automaticamente com base no forecast IA de risco \"alta\""
);

if (success) {
  console.log("✅ OS criada com sucesso!");
}
```

### 2. Integração no Painel de Forecasts

Localização: `/src/pages/admin/mmi/forecast/ForecastHistory.tsx`

O botão "➕ Gerar OS" foi integrado ao painel de histórico de forecasts:

```tsx
<Button 
  variant="default"
  onClick={() => handleGenerateOrder(forecast)}
  disabled={generatingOrderId === forecast.id}
>
  {generatingOrderId === forecast.id ? "⏳ Gerando..." : "➕ Gerar OS"}
</Button>
```

### 3. Handler de Geração

```typescript
const handleGenerateOrder = async (forecast: Forecast) => {
  setGeneratingOrderId(forecast.id);
  
  try {
    const priority = getPriorityLabel(forecast.priority);
    const descricao = `Gerado automaticamente com base no forecast IA de risco "${priority.value}" - ${forecast.forecast_text}`;
    
    const success = await createOSFromForecast(forecast.id, null, descricao);

    if (success) {
      toast({
        title: "✅ Ordem de Serviço criada com sucesso!",
        description: `OS criada para ${forecast.system_name} - ${forecast.vessel_name}`,
      });
    }
  } catch (error) {
    toast({
      title: "❌ Erro ao gerar OS",
      description: "Não foi possível conectar ao servidor",
      variant: "destructive",
    });
  } finally {
    setGeneratingOrderId(null);
  }
};
```

## 🧪 Testes

Localização: `/src/tests/mmi-create-os-from-forecast.test.ts`

### Cobertura de Testes

1. **Validação de Assinatura da Função**
   - Aceita parâmetros corretos (forecast_id, job_id, descricao)
   - Aceita job_id nulo

2. **Estrutura de Dados**
   - Cria OS com estrutura correta
   - Inclui referência ao forecast
   - Define status como "pendente" por padrão

3. **Formatação de Descrição**
   - Inclui nível de risco na descrição
   - Aceita descrições customizadas

4. **Integração com Banco de Dados**
   - Referencia tabela mmi_forecasts via forecast_id
   - Referencia tabela mmi_jobs via job_id (opcional)
   - Rastreia criador via created_by

### Executar Testes

```bash
npm run test -- src/tests/mmi-create-os-from-forecast.test.ts
```

## 📊 Fluxo de Dados

```
┌─────────────────┐
│ Forecast IA     │
│ (GPT-4)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ mmi_forecasts   │
│ - id            │
│ - vessel_name   │
│ - system_name   │
│ - forecast_text │
│ - priority      │
└────────┬────────┘
         │ Clique no botão
         │ "➕ Gerar OS"
         ▼
┌─────────────────┐
│ createOSFromForecast()
│ - forecastId    │
│ - jobId = null  │
│ - descricao     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ mmi_os          │
│ - id            │
│ - forecast_id   │
│ - job_id        │
│ - descricao     │
│ - status        │
│ - created_by    │
└─────────────────┘
```

## 🔐 Segurança

- **Autenticação**: Apenas usuários autenticados podem criar OS
- **RLS (Row Level Security)**: Políticas de segurança no Supabase
- **Validação**: Validação de dados no cliente e servidor

## 📝 Migrações

A migração `20251019220000_add_forecast_fields_to_mmi_os.sql` adiciona:

1. Coluna `forecast_id` para referenciar forecasts
2. Coluna `descricao` para descrição detalhada
3. Coluna `created_by` (complementar ao `opened_by`)
4. Torna `job_id` opcional (nullable)
5. Adiciona status `pendente`
6. Cria índice para `forecast_id`

## 🚀 Como Usar

### 1. Acessar o Painel de Forecasts

Navegue até: `/admin/mmi/forecast/history`

### 2. Visualizar Forecasts Salvos

A página exibe todos os forecasts gerados com:
- Nome da embarcação
- Sistema
- Horímetro
- Prioridade
- Texto do forecast

### 3. Gerar Ordem de Serviço

Clique no botão **"➕ Gerar OS"** ao lado do forecast desejado.

### 4. Confirmação

Um toast confirmará a criação da OS:
```
✅ Ordem de Serviço criada com sucesso!
OS criada para [Sistema] - [Embarcação]
```

## 🔄 Integrações Futuras

- [ ] Notificação por email quando OS é criada
- [ ] Dashboard de visualização de OS criadas
- [ ] Vinculação automática com jobs existentes
- [ ] Sugestão de técnicos para atribuição
- [ ] Integração com sistema de inventário de peças

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [MMI Dashboard Implementation](./MMI_DASHBOARD_IMPLEMENTATION.md)
- [MMI Forecast Implementation](./MMI_FORECAST_IMPLEMENTATION_SUMMARY.md)

## 🏆 Conclusão

A funcionalidade de geração de OS a partir de forecasts está **100% implementada** e testada, pronta para uso em produção.
