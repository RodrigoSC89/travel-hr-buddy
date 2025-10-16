# API Admin SGSO - Implementation Summary

## Overview
Endpoint criado: `/api/admin/sgso`

Este endpoint fornece métricas de risco do SGSO (Sistema de Gestão de Segurança Operacional) agrupadas por embarcação com dados mensais.

## Funcionalidades Implementadas

### 📍 Endpoint
- **Rota**: `/api/admin/sgso`
- **Método**: `GET`
- **Arquivo**: `pages/api/admin/sgso.ts`

### 🔧 Funcionalidades

1. **RPC Function Call**
   - Chama a função RPC `auditoria_metricas_risco` no Supabase
   - Retorna dados de falhas críticas por embarcação e mês

2. **Agregação de Dados**
   - Agrupa dados por embarcação
   - Calcula total de falhas críticas por embarcação
   - Mantém histórico mensal de falhas

3. **Formato de Resposta**
   ```json
   [
     {
       "embarcacao": "Navio A",
       "total": 10,
       "por_mes": {
         "2025-01": 4,
         "2025-02": 3,
         "2025-03": 3
       }
     }
   ]
   ```

### 📊 Estrutura de Dados

#### Input (RPC Function)
```typescript
interface RiskMetric {
  embarcacao: string;
  mes: string;
  falhas_criticas: number;
}
```

#### Output (API Response)
```typescript
interface AggregatedData {
  embarcacao: string;
  total: number;
  por_mes: Record<string, number>;
}
```

### ✅ Testes
- **Arquivo**: `src/tests/admin-sgso-api.test.ts`
- **Total de testes**: 46 testes
- **Status**: ✅ Todos passando

#### Cobertura de Testes
- Request handling (GET/POST)
- RPC function calls
- Data aggregation logic
- Response formatting
- Error handling
- Edge cases
- TypeScript integration
- NextJS API integration

### 🎯 Casos de Uso

1. **Dashboard SGSO**
   - Visualização de métricas de risco por embarcação
   - Análise de tendências mensais
   - Identificação de embarcações críticas

2. **Relatórios ANP**
   - Dados para compliance com Resolução ANP 43/2007
   - Histórico de falhas críticas
   - Métricas para as 17 práticas obrigatórias

3. **Gestão de Riscos**
   - Monitoramento de falhas críticas
   - Análise temporal de riscos
   - Planejamento de ações corretivas

### 🔒 Segurança
- Usa `SUPABASE_SERVICE_ROLE_KEY` para acesso privilegiado
- Validação de método HTTP (apenas GET)
- Tratamento de erros apropriado
- Mensagens de erro em português

### 📝 Implementação

**Lógica de Agregação**:
```typescript
const agrupado = data.reduce((acc: Record<string, AggregatedData>, item: RiskMetric) => {
  const { embarcacao, mes, falhas_criticas } = item;
  if (!acc[embarcacao]) {
    acc[embarcacao] = { embarcacao, total: 0, por_mes: {} };
  }
  acc[embarcacao].total += falhas_criticas;
  acc[embarcacao].por_mes[mes] = falhas_criticas;
  return acc;
}, {});
```

### 🚀 Como Usar

**Requisição**:
```bash
GET /api/admin/sgso
```

**Resposta de Sucesso (200)**:
```json
[
  {
    "embarcacao": "Navio A",
    "total": 5,
    "por_mes": {
      "2025-01": 3,
      "2025-02": 2
    }
  }
]
```

**Resposta de Erro (405)**:
```json
{
  "error": "Método não permitido."
}
```

**Resposta de Erro (500)**:
```json
{
  "error": "Erro ao buscar métricas de risco."
}
```

## 📂 Arquivos Criados

1. `pages/api/admin/sgso.ts` - Implementação do endpoint
2. `src/tests/admin-sgso-api.test.ts` - Suite de testes completa

## ✨ Características

- ✅ TypeScript com tipos bem definidos
- ✅ Sem erros de linting
- ✅ 46 testes passando
- ✅ Tratamento de erros robusto
- ✅ Documentação em português
- ✅ Seguindo padrões do repositório

## 🎯 Próximos Passos (Opcional)

1. Criar a função RPC `auditoria_metricas_risco` no Supabase se ainda não existe
2. Integrar endpoint com o dashboard SGSO existente
3. Adicionar filtros por período (opcional)
4. Implementar cache para melhor performance (opcional)
