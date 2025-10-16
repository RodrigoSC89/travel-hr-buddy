# API de Resumo de Auditorias

## 📋 Visão Geral

Endpoint REST que fornece um resumo de auditorias IMCA agrupadas por navio, com suporte para filtros por data e usuário.

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

O endpoint consulta a tabela `auditorias_imca` no Supabase, selecionando os campos:
- `nome_navio`: Nome do navio auditado
- `created_at`: Data de criação da auditoria
- `user_id`: UUID do usuário que criou a auditoria

## 🔧 Implementação Técnica

### Tecnologias Utilizadas

- **Next.js API Routes**: Framework para API endpoints
- **Supabase**: Banco de dados PostgreSQL
- **TypeScript**: Tipagem estática

### Lógica de Agregação

O endpoint:
1. Consulta a tabela `auditorias_imca` com os filtros fornecidos
2. Agrupa os resultados por `nome_navio`
3. Conta o número de auditorias para cada navio
4. Retorna um array com o resumo

### Tratamento de Erros

- Valida o método HTTP (apenas GET é permitido)
- Captura e loga erros de banco de dados
- Retorna mensagens de erro apropriadas

## 📊 Performance

- **Filtros otimizados**: Uso de índices no banco de dados para `created_at` e `user_id`
- **Agregação eficiente**: Processamento em memória de resultados agrupados
- **Resposta rápida**: Queries otimizadas com seleção específica de campos

## 🧪 Testes

O endpoint possui 48 testes automatizados que cobrem:
- Validação de métodos HTTP
- Parâmetros de query
- Filtros e combinações
- Formato de resposta
- Tratamento de erros
- Agregação de dados

Execute os testes com:

```bash
npm test src/tests/auditoria-resumo-api.test.ts
```

## 📝 Notas

- Os filtros são opcionais; se nenhum for fornecido, retorna todas as auditorias
- Os filtros de data (`start` e `end`) devem ser usados em conjunto
- O formato de data esperado é ISO 8601 (YYYY-MM-DD)
- O campo `user_id` deve ser um UUID válido

## 🔗 Recursos Relacionados

- [Documentação do Supabase](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Testes com Vitest](https://vitest.dev/)

## ✅ Status

**Status**: ✅ Pronto para produção  
**Versão**: 1.0.0  
**Data de implementação**: 2025-10-16  
**Testes**: 48 testes passando
