# Painel de Métricas de Risco - PainelMetricasRisco

## 📊 Visão Geral

O **PainelMetricasRisco** é um componente React que fornece visualização abrangente de métricas de risco para o Sistema de Gestão de Segurança Operacional (SGSO). Este componente integra-se perfeitamente com BI e sistemas de análise de dados.

## ✨ Características

- 🔍 **Filtro por Embarcação**: Permite filtrar dados por embarcação específica ou visualizar todos
- 📊 **Gráfico de Barras**: Mostra falhas críticas por auditoria individual
- 📈 **Gráfico de Linha**: Exibe evolução temporal das falhas críticas ao longo dos meses
- 🎨 **UI Moderna**: Utiliza componentes shadcn/ui para interface consistente
- 📱 **Responsivo**: Design adaptável para diferentes tamanhos de tela

## 🚀 Como Usar

### Importação

```typescript
import { PainelMetricasRisco } from "@/components/sgso/PainelMetricasRisco";
```

### Uso Básico

```tsx
<PainelMetricasRisco />
```

### Integração no Dashboard SGSO

O componente já está integrado no dashboard SGSO na aba "Métricas":

```tsx
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";

// No seu componente
<SgsoDashboard />
```

## 🔌 API Endpoint

O componente consome dados do endpoint:

```
GET /api/admin/metrics
```

### Formato de Resposta

```json
[
  {
    "auditoria_id": "abc12345",
    "embarcacao": "Navio Alpha",
    "falhas_criticas": 3,
    "mes": "out. de 2025",
    "data": "2025-10-15"
  }
]
```

## 📁 Estrutura de Arquivos

```
src/components/sgso/
├── PainelMetricasRisco.tsx    # Componente principal
└── SgsoDashboard.tsx           # Dashboard que integra o componente

pages/api/admin/
└── metrics.ts                  # API endpoint para dados de métricas
```

## 🎯 Funcionalidades Detalhadas

### 1. Filtro por Embarcação

- Dropdown com lista de todas as embarcações disponíveis
- Opção "Todos" para visualizar dados agregados
- Filtragem dinâmica sem necessidade de reload

### 2. Gráfico de Falhas Críticas

- **Tipo**: Gráfico de barras (BarChart)
- **Eixo X**: ID da auditoria
- **Eixo Y**: Número de falhas críticas
- **Cor**: Vermelho (#dc2626) para destacar criticidade

### 3. Evolução Temporal

- **Tipo**: Gráfico de linha (LineChart)
- **Eixo X**: Mês/Ano
- **Eixo Y**: Total de falhas críticas
- **Agregação**: Dados agrupados por mês
- **Cor**: Vermelho (#dc2626) para consistência visual

## 🔧 Requisitos Técnicos

### Dependências

- React 18+
- recharts 2.15+
- @/components/ui/card
- TypeScript

### Banco de Dados

O componente busca dados da tabela `auditorias_imca` com a seguinte estrutura:

```sql
CREATE TABLE auditorias_imca (
  id UUID PRIMARY KEY,
  title TEXT,
  metadata JSONB,  -- Contém embarcacao/nome_navio
  findings JSONB,  -- Contém falhas_criticas
  audit_date DATE,
  created_at TIMESTAMP
);
```

## 📊 Integração com BI

O componente é projetado para integração com sistemas de Business Intelligence:

- **Exportação de dados**: Os dados podem ser exportados via API
- **Visualizações customizáveis**: Fácil adaptação para diferentes necessidades
- **Métricas agregadas**: Suporte para análise temporal e por embarcação

## 🎨 Customização

### Cores

Para alterar as cores dos gráficos, modifique as propriedades `fill` e `stroke`:

```tsx
<Bar dataKey="falhas_criticas" fill="#sua-cor" name="Falhas Críticas" />
<Line dataKey="falhas_criticas" stroke="#sua-cor" name="Falhas Críticas" />
```

### Altura dos Gráficos

Ajuste a propriedade `height` no ResponsiveContainer:

```tsx
<ResponsiveContainer width="100%" height={600}>
```

## 🧪 Testes

Para testar o componente localmente:

1. Certifique-se de ter dados na tabela `auditorias_imca`
2. Acesse a página SGSO
3. Clique na aba "Métricas"
4. O Painel de Métricas de Risco será exibido

## 📝 Notas de Implementação

- O componente usa `"use client"` para funcionalidade do lado do cliente
- Dados são carregados via `useEffect` na montagem do componente
- Tratamento de erros implementado com try-catch
- Ordenação automática de dados temporais

## 🔒 Segurança

- API protegida por autenticação (requer role de admin)
- Row Level Security (RLS) implementado no Supabase
- Validação de dados no backend

## 📚 Referências

- [Recharts Documentation](https://recharts.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [ANP Resolução 43/2007](https://www.gov.br/anp)

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Crie uma branch feature
2. Faça suas alterações
3. Execute testes e lint: `npm run lint && npm run build`
4. Submeta um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Status**: ✅ Implementado e Integrado

**Última Atualização**: Outubro 2025
