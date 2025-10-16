# Painel de Métricas SGSO - Implementação Completa

## 📋 Visão Geral

Sistema completo de métricas para auditorias IMCA integrado ao SGSO (Sistema de Gestão de Segurança Operacional), incluindo APIs REST, funções RPC Supabase e componentes React para visualização.

## ✅ Funcionalidades Implementadas

### 1. 🔍 Filtro por Embarcação
- Dropdown selector para filtrar métricas por vessel específico
- Opção "Todas as Embarcações" para visão geral
- Filtro aplicado em tempo real nas tabelas de métricas

### 2. 📈 Gráfico de Evolução Mensal
- Line chart mostrando tendência de falhas críticas nos últimos 12 meses
- Comparativo entre total de auditorias e falhas críticas
- Visualização mês a mês com scores médios

### 3. 📊 Comparativo entre Auditorias por Risco
- Pie chart com distribuição por nível de risco
- Categorias: Crítico, Alto, Médio, Baixo, Negligível
- Cores diferenciadas por severidade

### 4. 📁 Exportação de Dados
- ✅ **CSV** - Implementado e funcional
- 🔧 **PDF** - Estrutura preparada, implementação futura
- 📧 **Email Automático** - Estrutura preparada, requer configuração de cron jobs

## 🗄️ Estrutura do Banco de Dados

### Tabela: `auditorias_imca`

```sql
-- Campos adicionados para métricas
ALTER TABLE public.auditorias_imca ADD COLUMN nome_navio TEXT;
ALTER TABLE public.auditorias_imca ADD COLUMN risco_nivel TEXT CHECK (risco_nivel IN ('critico', 'alto', 'medio', 'baixo', 'negligivel'));
ALTER TABLE public.auditorias_imca ADD COLUMN falhas_criticas INTEGER DEFAULT 0;
```

## 🔌 APIs REST Criadas

### 1. `/api/admin/metrics` (GET)
Retorna métricas agregadas por nível de risco.

**Response:**
```json
[
  {
    "risco_nivel": "critico",
    "total_auditorias": 15,
    "total_falhas_criticas": 42,
    "embarcacoes": ["Navio A", "Navio B"],
    "media_score": 65.5
  }
]
```

### 2. `/api/admin/metrics/evolucao-mensal` (GET)
Retorna evolução mensal de auditorias e falhas críticas.

**Response:**
```json
[
  {
    "mes": "10",
    "ano": 2024,
    "total_auditorias": 8,
    "total_falhas_criticas": 12,
    "media_score": 72.3
  }
]
```

### 3. `/api/admin/metrics/por-embarcacao` (GET)
Retorna métricas detalhadas por embarcação.

**Response:**
```json
[
  {
    "nome_navio": "Navio Alpha",
    "total_auditorias": 5,
    "total_falhas_criticas": 8,
    "media_score": 68.2,
    "ultima_auditoria": "2024-10-15T10:30:00Z"
  }
]
```

## 🔧 Funções RPC Supabase

### 1. `auditoria_metricas_risco()`
Agrega métricas por nível de risco com informações de embarcações e scores.

```sql
SELECT * FROM auditoria_metricas_risco();
```

### 2. `auditoria_evolucao_mensal()`
Retorna evolução temporal dos últimos 12 meses.

```sql
SELECT * FROM auditoria_evolucao_mensal();
```

### 3. `auditoria_metricas_por_embarcacao()`
Agrega métricas por vessel individual ordenado por falhas críticas.

```sql
SELECT * FROM auditoria_metricas_por_embarcacao();
```

## 📱 Componentes React

### `MetricasPanel.tsx`
Componente principal do painel de métricas com:
- Cards de resumo (Total Auditorias, Falhas Críticas, Score Médio, Embarcações)
- Filtro por embarcação
- Gráfico de pizza (distribuição por risco)
- Gráfico de linha (evolução mensal)
- Tabelas detalhadas
- Botão de exportação CSV

### `AdminSgso.tsx`
Página administrativa com:
- Tabs para diferentes visualizações
- Integração com ComplianceMetrics
- Links diretos para APIs
- Informações sobre integração e exportação

## 🚀 Como Usar

### Acessar o Dashboard
Navegue para: `/admin/sgso`

### Testar as APIs
```bash
# Métricas por risco
curl http://localhost:5173/api/admin/metrics

# Evolução mensal
curl http://localhost:5173/api/admin/metrics/evolucao-mensal

# Métricas por embarcação
curl http://localhost:5173/api/admin/metrics/por-embarcacao
```

### Exportar Dados
1. Acesse `/admin/sgso`
2. Navegue para aba "Métricas Operacionais"
3. Clique em "Exportar CSV"
4. Arquivo será baixado automaticamente

## 🔄 Integração com SGSO

O painel de métricas está integrado na página administrativa SGSO (`/admin/sgso`) com:
- ✅ Acesso direto via menu
- ✅ Dados agregados do banco via RPC
- ✅ Visualizações interativas
- ✅ Exportação de dados
- 🔧 Preparado para integração com BI externo

## 📧 Envio Automático de Relatórios (Futuro)

### Configuração com Vercel Cron
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-monthly-metrics",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

### Configuração com Supabase Edge Functions
```typescript
// supabase/functions/send-monthly-metrics/index.ts
import { serve } from "std/http/server.ts";

serve(async (req) => {
  // Buscar métricas
  const metrics = await supabase.rpc('auditoria_metricas_risco');
  
  // Enviar email
  await sendMetricsEmail(metrics);
  
  return new Response(JSON.stringify({ success: true }));
});
```

## 📊 Próximos Passos

- [ ] Implementar exportação PDF com jsPDF
- [ ] Configurar cron job para envio automático mensal
- [ ] Adicionar filtros de data personalizados
- [ ] Integração com sistema de notificações
- [ ] Dashboard em tempo real com WebSockets
- [ ] Exportação para Power BI / Tableau

## 🛠️ Arquivos Criados

### Migrations
- `supabase/migrations/20251016194300_add_metrics_fields_and_rpc.sql`

### APIs
- `pages/api/admin/metrics.ts`
- `pages/api/admin/metrics/evolucao-mensal.ts`
- `pages/api/admin/metrics/por-embarcacao.ts`

### Componentes
- `src/components/sgso/MetricasPanel.tsx`
- `src/pages/admin/sgso.tsx`

### Rotas
- Atualizado `src/App.tsx` com rota `/admin/sgso`

## 📝 Notas de Desenvolvimento

1. **Segurança**: Todas as APIs usam `SUPABASE_SERVICE_ROLE_KEY` para acesso administrativo
2. **Performance**: Índices criados em `nome_navio` e `risco_nivel` para queries otimizadas
3. **RLS**: Row Level Security habilitado com políticas para admins e usuários regulares
4. **Escalabilidade**: RPC functions otimizadas para grandes volumes de dados

## 🎯 Conclusão

✅ **O painel de métricas está completo e pronto para integração com SGSO ou BI!**

Todas as funcionalidades solicitadas no problema foram implementadas:
- ✅ Filtro por embarcação
- ✅ Gráfico de linha com evolução mensal das falhas críticas
- ✅ Comparativo entre auditorias por risco
- ✅ Pronto para integrar com SGSO (já integrado em `/admin/sgso`)
- ✅ Exportar os dados para CSV
- 🔧 Estrutura preparada para exportação PDF e email automático
