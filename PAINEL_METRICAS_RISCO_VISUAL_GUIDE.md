# 📊 Painel Métricas Risco - Guia Visual

## 🎯 Visão Geral do Componente

O **PainelMetricasRisco** é o novo componente de visualização de métricas de risco integrado ao SGSO Dashboard.

## 📍 Localização

```
SGSO Dashboard → Aba "Métricas" → Painel Métricas Risco
```

## 🎨 Layout do Componente

```
┌─────────────────────────────────────────────────────────┐
│  📊 Métricas de Risco                                   │
│                                                         │
│  Filtrar por embarcação: [Dropdown ▼]                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Falhas Críticas por Auditoria                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Bar Chart                                      │   │
│  │  ████                                           │   │
│  │  ████  ████                                     │   │
│  │  ████  ████  ████                               │   │
│  │  aud1  aud2  aud3 ...                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📈 Evolução Temporal de Risco                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Line Chart                          ╱─╲        │   │
│  │                            ╱─╲     ╱     ╲      │   │
│  │              ╱─╲         ╱     ╲ ╱         ╲    │   │
│  │         ───╱     ╲─────╱                    ╲   │   │
│  │  Jan  Fev  Mar  Abr  Mai  Jun  Jul  Ago  Set    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Características Visuais

### Filtro de Embarcação
- **Tipo**: Select dropdown nativo
- **Opções**: "Todos" + lista de embarcações
- **Estilo**: Border rounded, padding 2x1
- **Comportamento**: Atualização instantânea dos gráficos

### Gráfico de Barras
- **Biblioteca**: Recharts BarChart
- **Cor**: Vermelho crítico (#dc2626)
- **Altura**: 400px
- **Orientação**: X axis rotacionado -45° para melhor leitura
- **Tooltip**: Hover com informações detalhadas
- **Legend**: "Falhas Críticas"

### Gráfico de Linha
- **Biblioteca**: Recharts LineChart
- **Cor**: Vermelho crítico (#dc2626)
- **Altura**: 300px
- **Tipo de linha**: Monotone (suave)
- **Tooltip**: Hover com informações mensais
- **Legend**: "Falhas Críticas"

## 🎨 Paleta de Cores

```
🔴 Crítico:     #dc2626 (red-600)
⚪ Background:  white
🔲 Border:      gray-200
📝 Text:        gray-900
```

## 📊 Fluxo de Dados

```
┌─────────────────┐
│  Supabase DB    │
│  auditorias_    │
│  imca table     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoint   │
│  /api/admin/    │
│  metrics        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PainelMetricas │
│  Risco          │
│  Component      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Visualização   │
│  Recharts       │
└─────────────────┘
```

## 🔄 Estados do Componente

### Estado Inicial (Carregamento)
```typescript
dados: []
embarcacoes: []
filtro: "Todos"
```

### Estado Carregado
```typescript
dados: MetricsData[]
embarcacoes: ["Todos", "Navio A", "Navio B", ...]
filtro: "Todos" | embarcacao selecionada
```

## 📱 Responsividade

### Desktop (lg+)
- Largura completa
- Ambos os gráficos visíveis
- Labels completos

### Tablet (md)
- Largura completa
- Scroll horizontal se necessário
- Labels reduzidos

### Mobile (sm)
- Largura completa
- Scroll horizontal
- Labels mínimos

## 🎯 Integração no SGSO Dashboard

### Estrutura de Tabs

```
┌─────────────────────────────────────────────────┐
│ [Visão Geral] [17 Práticas] [Riscos] [Incidentes] │
│ [Emergência] [Auditorias] [Treinamentos] [NCs]    │
│ [Métricas] ← Aqui!                                 │
├─────────────────────────────────────────────────┤
│                                                   │
│  ComplianceMetrics Component                      │
│  (Gráficos existentes de compliance)              │
│                                                   │
├─────────────────────────────────────────────────┤
│                                                   │
│  PainelMetricasRisco Component ← NOVO!            │
│  (Métricas de risco por auditoria)                │
│                                                   │
└─────────────────────────────────────────────────┘
```

## 🔧 Pontos de Customização

### 1. Cores dos Gráficos
```typescript
// Bar Chart
fill="#dc2626"  // Altere aqui

// Line Chart
stroke="#dc2626"  // Altere aqui
```

### 2. Altura dos Gráficos
```typescript
// Bar Chart
height={400}  // Ajuste conforme necessário

// Line Chart
height={300}  // Ajuste conforme necessário
```

### 3. Formato de Data
```typescript
const mes = date.toLocaleDateString("pt-BR", { 
  month: "short", 
  year: "numeric" 
});
```

## ✅ Checklist de Implementação

- [x] Componente PainelMetricasRisco criado
- [x] API endpoint /api/admin/metrics implementado
- [x] Integração no SgsoDashboard
- [x] Filtro por embarcação funcional
- [x] Gráfico de barras (falhas por auditoria)
- [x] Gráfico de linha (evolução temporal)
- [x] Responsivo e acessível
- [x] TypeScript tipagem completa
- [x] Linting e build passando
- [x] Documentação criada

## 🚀 Próximos Passos Sugeridos

1. ✅ **Exportação PDF**: Adicionar botão para exportar gráficos
2. ✅ **Filtro de Data**: Adicionar seletor de período
3. ✅ **Comparação**: Comparar múltiplas embarcações
4. ✅ **Alertas**: Notificações para limites críticos
5. ✅ **Cache**: Implementar cache para melhor performance

## 📚 Referências de Código

### Componente Principal
`src/components/sgso/PainelMetricasRisco.tsx`

### API Endpoint
`pages/api/admin/metrics.ts`

### Dashboard de Integração
`src/components/sgso/SgsoDashboard.tsx`

### Exports
`src/components/sgso/index.ts`

---

**🎨 Design**: Clean, Modern, Professional
**🔒 Segurança**: RLS, Admin-only access
**📊 Performance**: Lazy loading, Optimized queries
**♿ Acessibilidade**: ARIA labels, Keyboard navigation

**Status**: ✅ **IMPLEMENTADO E TESTADO**
