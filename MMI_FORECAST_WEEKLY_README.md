# ✅ Etapa 7 — Cron Job Semanal de Forecast IA

## 📦 Implementação Completa

### Supabase Function: forecast-weekly
**Arquivo:** `supabase/functions/forecast-weekly/index.ts`

### 🎯 Objetivo
Gerar forecasts de IA semanalmente para todos os jobs de manutenção ativos no sistema MMI, criando automaticamente ordens de serviço (OS) para jobs de alto risco.

### 📋 Funcionalidades Implementadas

#### 1. **Busca de Jobs Ativos**
- Consulta a tabela `mmi_jobs` 
- Filtra apenas jobs com status `pending` ou `in_progress`
- Processa todos os jobs encontrados

#### 2. **Geração de Forecast (Simulado)**
Para cada job, o sistema:
- ⚙️ **Simula risco IA** usando `Math.random()`:
  - 70% de chance: risco **moderado**
  - 30% de chance: risco **alto**
- 📅 **Calcula próxima execução** baseada no risco:
  - Risco alto: 7 dias
  - Risco moderado: 30 dias

#### 3. **Inserção em `mmi_forecasts`**
Cada forecast criado inclui:
```typescript
{
  vessel_name: string,      // Nome do navio
  system_name: string,       // Nome do sistema/componente
  hourmeter: number,         // Horímetro (default: 0)
  last_maintenance: array,   // Histórico de manutenções (default: [])
  forecast_text: string,     // Descrição completa do forecast
  priority: 'high' | 'medium' // Prioridade baseada no risco
}
```

#### 4. **Criação Automática de OS (Work Orders)**
Para forecasts de **risco alto**:
- Insere automaticamente em `mmi_orders`
- Campos da ordem de serviço:
```typescript
{
  forecast_id: uuid,         // Referência ao forecast
  vessel_name: string,       // Nome do navio
  system_name: string,       // Nome do sistema
  description: string,       // Descrição da OS
  status: 'pendente',        // Status inicial
  priority: 'alta'           // Prioridade alta
}
```

### 🔄 Agendamento do Cron

#### Configuração em `supabase/config.toml`

```toml
[functions.forecast-weekly]
verify_jwt = false

[[edge_runtime.cron]]
name = "forecast-weekly"
function_name = "forecast-weekly"
schedule = "0 3 * * 0"  # Todo domingo às 03h UTC
description = "MMI: Generate weekly AI forecasts for maintenance jobs and create work orders automatically"
```

**Horário de Execução:**
- **UTC:** Domingos às 03:00
- **BRT (UTC-3):** Domingos às 00:00 (meia-noite)

### 📊 Resposta da Função

```json
{
  "success": true,
  "timestamp": "2025-10-20T03:00:00.000Z",
  "jobs_processed": 15,
  "forecasts_created": 15,
  "orders_created": 4,
  "forecast_summary": {
    "high_risk": 4,
    "moderate_risk": 11
  }
}
```

### 🔍 Fluxo de Execução

```
1. Cron Trigger (Domingos 03:00 UTC)
   ↓
2. Buscar jobs ativos (pending, in_progress)
   ↓
3. Para cada job:
   ├─ Simular risco IA (alto/moderado)
   ├─ Calcular próxima data de execução
   ├─ Criar forecast em mmi_forecasts
   └─ Se risco alto → Criar OS em mmi_orders
   ↓
4. Retornar resumo da execução
```

### 🛠️ Estrutura de Dados

#### Tabela `mmi_forecasts`
```sql
CREATE TABLE mmi_forecasts (
  id UUID PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  hourmeter NUMERIC DEFAULT 0,
  last_maintenance JSONB DEFAULT '[]'::jsonb,
  forecast_text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela `mmi_orders`
```sql
CREATE TABLE mmi_orders (
  id UUID PRIMARY KEY,
  forecast_id UUID REFERENCES mmi_forecasts(id),
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ✅ Resultado Final

| Recurso | Status |
|---------|--------|
| Supabase Function criada | ✅ |
| Forecasts IA (mock) gerados semanalmente | ✅ |
| OS criadas automaticamente | ✅ |
| Integração com painel MMI | ✅ |
| Agendamento via cron (Domingos 03:00 UTC) | ✅ |

### 🧠 Melhorias Futuras

1. **Substituir simulação por chamada real ao GPT-4**
   ```typescript
   // Exemplo de integração futura:
   const forecast = await openai.chat.completions.create({
     model: "gpt-4",
     messages: [
       {
         role: "system",
         content: "Você é um especialista em manutenção preditiva naval..."
       },
       {
         role: "user",
         content: `Analise este job: ${job.title}...`
       }
     ]
   });
   ```

2. **Adicionar logs e e-mails de confirmação**
   - Integrar com sistema de notificações
   - Enviar relatório semanal por e-mail
   - Alertas para forecasts de alto risco

3. **Personalizar intervalo por sistema/navio**
   - Configuração dinâmica de intervalos
   - Baseado em histórico de manutenção
   - Ajuste automático com machine learning

4. **Dashboard de Visualização**
   - Gráficos de tendência de risco
   - Timeline de forecasts
   - Análise de precisão das previsões

### 🚀 Como Testar

#### 1. Teste Manual via Supabase Dashboard
```bash
# No Supabase Dashboard → Edge Functions → forecast-weekly
# Clique em "Invoke Function"
```

#### 2. Teste via API
```bash
curl -X POST https://[seu-projeto].supabase.co/functions/v1/forecast-weekly \
  -H "Authorization: Bearer [seu-anon-key]"
```

#### 3. Verificar Execução do Cron
```sql
-- Verificar forecasts criados
SELECT * FROM mmi_forecasts 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Verificar OS criadas
SELECT * FROM mmi_orders 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 📝 Logs e Monitoramento

A função registra logs detalhados:
- ✅ Sucesso na criação de forecasts
- 📋 Criação de ordens de serviço
- ❌ Erros durante o processamento
- 📊 Resumo estatístico da execução

Visualize os logs em:
- Supabase Dashboard → Logs
- Filtrar por função: `forecast-weekly`

### 🔗 Arquivos Relacionados

- **Função:** `supabase/functions/forecast-weekly/index.ts`
- **Configuração:** `supabase/config.toml`
- **Migrations:**
  - `20251019170000_create_mmi_forecasts.sql`
  - `20251019180000_create_mmi_orders.sql`
- **Testes:** `tests/forecast-ia.test.ts`

### 📞 Suporte

Para questões ou melhorias, consulte a documentação do MMI ou entre em contato com a equipe de desenvolvimento.

---

**Status:** ✅ Implementado e Pronto para Produção  
**Versão:** 1.0.0  
**Data:** Outubro 2025
