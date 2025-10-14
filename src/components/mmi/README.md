# MMI Jobs Panel - Central de Jobs

## Visão Geral

O **MMI Jobs Panel** (Manutenção e Melhoria Industrial) é um sistema de gestão inteligente de jobs de manutenção com automação via Inteligência Artificial.

## Funcionalidades

### ✅ Automação Inteligente

1. **📩 Criar OS com 1 clique**: Gere ordens de serviço instantaneamente
2. **🧠 Postergar com IA**: Justificativa automatizada e inteligente para postergação
3. **👁️‍🗨️ Sugestões da IA**: Recomendações direto no card do job

### 🎯 Recursos dos Cards

Cada card de job exibe:
- **Título** do job
- **Data de vencimento**
- **Componente** e **Embarcação** associados
- **Badges** de prioridade e status
- **Sugestão da IA** (quando disponível)
- **Indicador de postergação** (quando permitido)

### 🔘 Ações Disponíveis

- **Criar OS**: Cria uma Ordem de Serviço para o job
- **Postergar com IA**: Postergação inteligente com justificativa automatizada (apenas para jobs elegíveis)

## Estrutura de Arquivos

```
src/
├── components/
│   └── mmi/
│       ├── JobCards.tsx          # Componente principal de cards de jobs
│       └── README.md             # Esta documentação
├── services/
│   └── mmi/
│       └── jobsApi.ts            # Serviço de API para jobs
└── pages/
    └── MMIJobsPanel.tsx          # Página principal do painel MMI
```

## Uso

### Acessar o Painel

Navegue para `/mmi/jobs` para visualizar o painel completo.

### Componente JobCards

```tsx
import JobCards from '@/components/mmi/JobCards';

function MyPage() {
  return <JobCards />;
}
```

## API

### Interface Job

```typescript
interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  component: {
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
  suggestion_ia?: string;
  can_postpone?: boolean;
}
```

### Métodos Disponíveis

#### `fetchJobs()`
Retorna a lista de jobs ativos.

#### `postponeJob(jobId: string)`
Postergação inteligente de um job com justificativa da IA.

#### `createWorkOrder(jobId: string)`
Cria uma Ordem de Serviço para o job especificado.

## Implementação Atual

A implementação atual utiliza dados mock para demonstração. Em produção, os métodos da API devem ser conectados a endpoints reais do backend.

## Próximos Passos

- [ ] Integrar com backend real
- [ ] Adicionar filtros e busca
- [ ] Implementar paginação
- [ ] Adicionar visualização em lista/grid
- [ ] Histórico de ações
- [ ] Notificações em tempo real
- [ ] Dashboard de analytics

## Tecnologias Utilizadas

- React + TypeScript
- Shadcn/ui (Card, Badge, Button)
- Lucide React (Icons)
- React Hooks (useState, useEffect)
