# API de Resumo de Auditorias

## 📋 Visão Geral

Endpoint REST que fornece um resumo de auditorias PEOTRAM agrupadas por navio, com suporte para filtros por data e usuário. Utiliza o sistema de auditorias PEOTRAM com relacionamentos adequados com a tabela de navios.

## 🔗 Endpoint

```
GET /api/auditoria/resumo
```

## 📥 Parâmetros de Query (Opcionais)

| Parâmetro | Tipo   | Descrição | Exemplo |
|-----------|--------|-----------|---------|
| `start`   | string | Data inicial do filtro (formato ISO: YYYY-MM-DD) | `2025-10-01` |
| `end`     | string | Data final do filtro (formato ISO: YYYY-MM-DD) | `2025-10-31` |
| `user_id` | string | UUID do usuário para filtrar auditorias | `123e4567-e89b-12d3-a456-426614174000` |

## 📤 Resposta

### Sucesso (200)

```json
[
  {
    "nome_navio": "MV Atlantic Explorer",
    "total": 5
  },
  {
    "nome_navio": "MV Pacific Voyager",
    "total": 3
  },
  {
    "nome_navio": "MV Ocean Navigator",
    "total": 2
  }
]
```

**Nota**: Os resultados são ordenados por total de auditorias em ordem decrescente.

### Erro (500)

```json
{
  "error": "Erro ao gerar resumo."
}
```

### Método não permitido (405)

```json
{
  "error": "Method not allowed"
}
```

## 🎯 Exemplos de Uso

### 1. Todas as auditorias (sem filtros)

```bash
curl -X GET https://seu-dominio.com/api/auditoria/resumo
```

### 2. Filtrar por período

```bash
curl -X GET "https://seu-dominio.com/api/auditoria/resumo?start=2025-10-01&end=2025-10-31"
```

### 3. Filtrar por usuário

```bash
curl -X GET "https://seu-dominio.com/api/auditoria/resumo?user_id=123e4567-e89b-12d3-a456-426614174000"
```

### 4. Filtros combinados (data + usuário)

```bash
curl -X GET "https://seu-dominio.com/api/auditoria/resumo?start=2025-10-01&end=2025-10-31&user_id=123e4567-e89b-12d3-a456-426614174000"
```

## 💡 Casos de Uso

### Dashboard de Auditorias

```typescript
import { useState, useEffect } from 'react';

function AuditSummaryDashboard() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await fetch(
        '/api/auditoria/resumo?start=2025-10-01&end=2025-10-31'
      );
      const data = await response.json();
      setSummary(data);
      setLoading(false);
    };
    
    fetchSummary();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Resumo de Auditorias por Navio</h2>
      {summary.map(item => (
        <div key={item.nome_navio}>
          {item.nome_navio}: {item.total} auditorias
        </div>
      ))}
    </div>
  );
}
```

### Relatório de Auditorias por Usuário

```typescript
async function getUserAuditReport(userId: string) {
  const response = await fetch(
    `/api/auditoria/resumo?user_id=${userId}`
  );
  
  if (!response.ok) {
    throw new Error('Erro ao carregar relatório');
  }
  
  return await response.json();
}
```

### Análise de Período Específico

```typescript
async function getMonthlyAuditSummary(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const response = await fetch(
    `/api/auditoria/resumo?start=${start}&end=${end}`
  );
  
  return await response.json();
}
```

## 🔒 Autenticação

Este endpoint requer autenticação via Supabase Service Role Key, configurada através das variáveis de ambiente:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key para acesso administrativo

## 🗄️ Fonte de Dados

O endpoint consulta a tabela `peotram_audits` no Supabase com join à tabela `vessels`, selecionando os campos:
- `audit_date`: Data da auditoria
- `created_by`: UUID do usuário que criou a auditoria
- `vessel_id`: UUID do navio auditado
- `vessels.name`: Nome do navio (via inner join)

### Relacionamentos

```sql
peotram_audits.vessel_id → vessels.id
```

O endpoint utiliza `inner join` para garantir que apenas auditorias com navios válidos sejam retornadas. Navios sem nome são listados como "Unknown".

## 🔧 Implementação Técnica

### Tecnologias Utilizadas

- **Next.js API Routes**: Framework para API endpoints
- **Supabase**: Banco de dados PostgreSQL
- **TypeScript**: Tipagem estática com interfaces definidas

### Lógica de Agregação

O endpoint:
1. Consulta a tabela `peotram_audits` com inner join em `vessels`
2. Aplica filtros de data em `audit_date` e usuário em `created_by`
3. Agrupa os resultados por nome do navio
4. Conta o número de auditorias para cada navio
5. Ordena por total de auditorias (decrescente)
6. Retorna um array com o resumo

### Tratamento de Erros

- Valida o método HTTP (apenas GET é permitido)
- Captura e loga erros de banco de dados
- Retorna mensagens de erro apropriadas
- Trata navios sem nome com fallback para "Unknown"

### Type Safety

```typescript
interface PeotramAudit {
  audit_date: string;
  created_by: string;
  vessel_id: string;
  vessels: {
    name: string;
  } | null;
}
```

## 📊 Performance

- **Filtros otimizados**: Uso de índices no banco de dados para `audit_date` e `created_by`
- **Inner join eficiente**: Relacionamento direto com tabela de navios
- **Agregação eficiente**: Processamento em memória de resultados agrupados
- **Resposta rápida**: Queries otimizadas com seleção específica de campos
- **Ordenação**: Resultados pré-ordenados por relevância (total decrescente)

## 🧪 Testes

O endpoint possui 51 testes automatizados que cobrem:
- Validação de métodos HTTP
- Parâmetros de query
- Filtros e combinações
- Formato de resposta
- Tratamento de erros
- Agregação de dados
- Joins com tabela de navios
- Ordenação de resultados
- Tratamento de navios sem nome

Execute os testes com:

```bash
npm test src/tests/auditoria-resumo-api.test.ts
```

## 📝 Notas

- Os filtros são opcionais; se nenhum for fornecido, retorna todas as auditorias
- Os filtros de data (`start` e `end`) devem ser usados em conjunto
- O formato de data esperado é ISO 8601 (YYYY-MM-DD)
- O campo `user_id` deve ser um UUID válido
- Resultados são ordenados automaticamente por total de auditorias
- Navios sem nome aparecem como "Unknown"

## 🔄 Mudanças na v2.0.0

### Migração de auditorias_imca para peotram_audits

- **Tabela**: `auditorias_imca` → `peotram_audits`
- **Campo de data**: `created_at` → `audit_date`
- **Campo de usuário**: `user_id` → `created_by`
- **Novo**: Inner join com tabela `vessels` para garantir integridade referencial
- **Novo**: Ordenação automática por total de auditorias
- **Novo**: Type safety com interfaces TypeScript

### Compatibilidade

O formato de resposta permanece o mesmo, garantindo compatibilidade com código existente.

## 🔗 Recursos Relacionados

- [Documentação do Supabase](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Testes com Vitest](https://vitest.dev/)
- [Sistema PEOTRAM](./PEOTRAM_SYSTEM.md)

## ✅ Status

**Status**: ✅ Pronto para produção  
**Versão**: 2.0.0  
**Data de atualização**: 2025-10-16  
**Testes**: 51 testes passando (1332 total no projeto)  
**Breaking Changes**: Nenhum (compatibilidade mantida na API)
