# MMI Jobs Panel - Central de Jobs

## Visão Geral

O **MMI Jobs Panel** (Manutenção e Melhoria Industrial) é um sistema de gestão inteligente de jobs de manutenção com automação via Inteligência Artificial.

## Funcionalidades

### ✅ Automação Inteligente

1. **📩 Criar OS com 1 clique**: Gere ordens de serviço instantaneamente
2. **🧠 Postergar com IA**: Justificativa automatizada e inteligente para postergação
3. **👁️‍🗨️ Sugestões da IA**: Recomendações direto no card do job
4. **📄 Gerar Relatório PDF**: Relatório profissional com histórico de OS resolvidas

### 📊 Relatório Inteligente de Manutenção

O sistema agora oferece geração de relatórios PDF profissionais que incluem:

- **Cabeçalho do Relatório**: Data de geração e total de jobs
- **Detalhes Completos**: Informações completas de cada job (título, componente, equipamento, embarcação, status, prioridade, prazo)
- **Sugestões da IA**: Recomendações inteligentes quando disponíveis
- **📚 Histórico de OS Resolvidas**: Rastreamento completo das ordens de serviço anteriores por componente
- **Formatação Profissional**: Design limpo e organizado, ideal para documentação e auditorias

#### Exemplo de Histórico de OS

```
📚 Histórico de OS resolvidas:
• OS-2024-001 (Jan/2024): Troca de vedações - Concluída
• OS-2024-045 (Abr/2024): Manutenção preventiva - Concluída
• OS-2024-089 (Jul/2024): Ajuste de pressão - Concluída
```

#### Benefícios

- **Rastreabilidade Aprimorada**: Trilha de auditoria completa do trabalho de manutenção resolvido
- **Conformidade Baseada em Evidências**: Demonstra conformidade técnica através de dados históricos
- **Eficiência Melhorada**: Geração de relatório profissional com um único clique
- **Melhor Tomada de Decisões**: Contexto histórico ajuda a informar futuros cronogramas de manutenção
- **Saída Profissional**: PDF limpo e formatado adequado para documentação e auditorias

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
│       ├── ReportPDF.tsx         # Geração de relatórios PDF
│       └── README.md             # Esta documentação
├── services/
│   └── mmi/
│       └── jobsApi.ts            # Serviço de API para jobs
├── tests/
│   └── mmi-report-pdf.test.ts   # Testes do relatório PDF
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
  resolved_history?: string[];
}
```

### Métodos Disponíveis

#### `fetchJobs()`
Retorna a lista de jobs ativos.

#### `postponeJob(jobId: string)`
Postergação inteligente de um job com justificativa da IA.

#### `createWorkOrder(jobId: string)`
Cria uma Ordem de Serviço para o job especificado.

#### `generateMMIReport(jobs: Job[])`
Gera um relatório PDF profissional com histórico de OS resolvidas.

**Exemplo de uso:**
```typescript
import { generateMMIReport } from '@/components/mmi/ReportPDF';
import { fetchJobs } from '@/services/mmi/jobsApi';

const handleGenerateReport = async () => {
  const { jobs } = await fetchJobs();
  await generateMMIReport(jobs);
  // PDF será automaticamente baixado
};
```

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
- html2pdf.js (v0.12.1) - Geração de PDFs
- Sonner - Toast notifications
