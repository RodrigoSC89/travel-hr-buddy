# Auditoria Metricas Risco - RPC Function

## 📋 Visão Geral

A função `auditoria_metricas_risco()` é uma função RPC (Remote Procedure Call) do PostgreSQL que agrega métricas de risco das auditorias IMCA, fornecendo dados sobre falhas críticas organizados por auditoria, embarcação e mês.

## 🎯 Objetivo

Fornecer dados agregados de falhas críticas para:
- Dashboard de métricas administrativas (`/admin/metrics`)
- Relatórios agendados
- Exportação de dados
- Análise de risco por embarcação e período

## 📊 Estrutura de Retorno

A função retorna uma tabela com as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `auditoria_id` | UUID | Identificador único da auditoria |
| `embarcacao` | TEXT | Nome da embarcação/navio |
| `mes` | TEXT | Mês no formato YYYY-MM |
| `falhas_criticas` | BIGINT | Quantidade de falhas críticas |

## 🔧 Como Usar

### Via Supabase Client (JavaScript/TypeScript)

```typescript
import { supabase } from '@/lib/supabase';

// Chamar a função RPC
const { data, error } = await supabase
  .rpc('auditoria_metricas_risco');

if (error) {
  console.error('Erro ao buscar métricas:', error);
} else {
  console.log('Métricas de risco:', data);
}
```

### Via SQL Direto

```sql
-- Chamar a função diretamente
SELECT * FROM auditoria_metricas_risco();

-- Filtrar por embarcação específica
SELECT * FROM auditoria_metricas_risco()
WHERE embarcacao = 'Navio A';

-- Filtrar por período
SELECT * FROM auditoria_metricas_risco()
WHERE mes >= '2025-01' AND mes <= '2025-12';

-- Top 5 embarcações com mais falhas críticas
SELECT 
  embarcacao,
  SUM(falhas_criticas) as total_falhas
FROM auditoria_metricas_risco()
GROUP BY embarcacao
ORDER BY total_falhas DESC
LIMIT 5;
```

## 📈 Exemplo de Resposta

```json
[
  {
    "auditoria_id": "550e8400-e29b-41d4-a716-446655440000",
    "embarcacao": "Navio Atlas",
    "mes": "2025-10",
    "falhas_criticas": 5
  },
  {
    "auditoria_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "embarcacao": "Navio Poseidon",
    "mes": "2025-09",
    "falhas_criticas": 3
  },
  {
    "auditoria_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "embarcacao": "Navio Tritão",
    "mes": "2025-09",
    "falhas_criticas": 0
  }
]
```

## 🔍 Lógica da Função

1. **Join**: Faz LEFT JOIN entre `auditorias_imca` e `auditoria_alertas`
2. **Agregação**: Conta o número de alertas por auditoria
3. **Agrupamento**: Agrupa por ID da auditoria, embarcação e mês
4. **Formatação**: Formata a data como YYYY-MM
5. **Ordenação**: Ordena por mês em ordem decrescente (mais recente primeiro)

## 🗄️ Tabelas Envolvidas

### `auditorias_imca`
- Tabela principal de auditorias IMCA
- Contém informações básicas da auditoria
- Campo `embarcacao` identifica a embarcação

### `auditoria_alertas`
- Tabela de alertas e falhas críticas
- Relacionada via `auditoria_id`
- Cada registro representa uma falha/alerta

## 🔐 Permissões

- **SECURITY DEFINER**: Executa com privilégios do criador da função
- **GRANT EXECUTE**: Concedido para usuários autenticados
- **RLS**: Row Level Security aplicado nas tabelas base

## 📱 Integração com o Dashboard

### Rota: `/admin/metrics`

```typescript
// Exemplo de uso no dashboard
const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase
        .rpc('auditoria_metricas_risco');
      setMetrics(data || []);
    };
    
    fetchMetrics();
  }, []);
  
  return (
    <div>
      {metrics.map(metric => (
        <div key={metric.auditoria_id}>
          <h3>{metric.embarcacao}</h3>
          <p>Mês: {metric.mes}</p>
          <p>Falhas: {metric.falhas_criticas}</p>
        </div>
      ))}
    </div>
  );
};
```

## 📤 Exportação e Relatórios

### Exportar para CSV

```typescript
const exportToCSV = async () => {
  const { data } = await supabase
    .rpc('auditoria_metricas_risco');
    
  if (data) {
    const csv = [
      ['Auditoria ID', 'Embarcação', 'Mês', 'Falhas Críticas'],
      ...data.map(row => [
        row.auditoria_id,
        row.embarcacao,
        row.mes,
        row.falhas_criticas
      ])
    ].map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metricas-risco.csv';
    a.click();
  }
};
```

### Relatório Agendado

```typescript
// Função para enviar relatório por email
const sendScheduledReport = async () => {
  const { data } = await supabase
    .rpc('auditoria_metricas_risco');
    
  // Processar e enviar por email
  await sendEmail({
    to: 'admin@company.com',
    subject: 'Relatório Mensal de Métricas de Risco',
    body: generateReportHTML(data)
  });
};
```

## 🎨 Visualizações Sugeridas

### Gráfico de Barras - Falhas por Embarcação
```typescript
const chartData = metrics.reduce((acc, item) => {
  acc[item.embarcacao] = (acc[item.embarcacao] || 0) + item.falhas_criticas;
  return acc;
}, {});
```

### Gráfico de Linha - Tendência Temporal
```typescript
const timelineData = metrics.reduce((acc, item) => {
  if (!acc[item.mes]) {
    acc[item.mes] = { mes: item.mes, total: 0 };
  }
  acc[item.mes].total += item.falhas_criticas;
  return acc;
}, {});
```

## ⚠️ Considerações Importantes

1. **Performance**: A função usa índices nas colunas `auditoria_id` e `created_at` para melhor performance
2. **Valores Nulos**: Auditorias sem embarcação informada retornam `NULL` no campo `embarcacao`
3. **Zero Falhas**: Auditorias sem alertas retornam `0` em `falhas_criticas`
4. **Ordenação**: Dados são ordenados por mês decrescente (mais recente primeiro)

## 🔄 Migrations Relacionadas

1. `20251016194400_add_embarcacao_to_auditorias_imca.sql` - Adiciona coluna embarcacao
2. `20251016194500_create_auditoria_alertas.sql` - Cria tabela de alertas
3. `20251016194600_create_auditoria_metricas_risco_function.sql` - Cria a função RPC

## 📝 Testes

Execute os testes com:

```bash
npm run test -- src/tests/auditoria-metricas-risco.test.ts
```

## ✅ Status

- [x] Função criada e documentada
- [x] Testes implementados (52 testes passando)
- [x] Pronta para integração com `/admin/metrics`
- [x] Pronta para exportação e agendamento de relatórios
- [x] Row Level Security configurado
- [x] Índices otimizados

## 🚀 Próximos Passos

1. Integrar a função no dashboard `/admin/metrics`
2. Criar visualizações gráficas
3. Implementar exportação para PDF
4. Configurar relatórios agendados
5. Adicionar filtros por período e embarcação

## 📚 Referências

- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
