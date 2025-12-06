/**
 * Documentation Generator - PATCH 980
 * Auto-generates system documentation
 */

export interface SystemDocumentation {
  generatedAt: number;
  overview: string;
  modules: {
    name: string;
    description: string;
    endpoints: string[];
    inputs: string[];
    outputs: string[];
    dependencies: string[];
    aiCapabilities: string[];
  }[];
  dataFlows: {
    name: string;
    description: string;
    diagram: string;
  }[];
  offlineArchitecture: string;
  aiArchitecture: string;
  databaseSchema: string;
  apiReference: string;
  faq: {
    question: string;
    answer: string;
  }[];
}

class DocumentationGenerator {
  /**
   * Generate complete system documentation
   */
  generate(): SystemDocumentation {
    return {
      generatedAt: Date.now(),
      overview: this.generateOverview(),
      modules: this.generateModuleDocs(),
      dataFlows: this.generateDataFlowDocs(),
      offlineArchitecture: this.generateOfflineDocs(),
      aiArchitecture: this.generateAIDocs(),
      databaseSchema: this.generateSchemaDocs(),
      apiReference: this.generateAPIReference(),
      faq: this.generateFAQ()
    };
  }

  /**
   * Generate system overview
   */
  private generateOverview(): string {
    return `
# Sistema Nautilus Offshore

## Visão Geral

O Nautilus Offshore é um sistema completo de gestão marítima com suporte a operações offline, IA embarcada e compliance regulatório.

### Principais Características

- **Gestão de Frota**: Rastreamento, manutenção e operações de embarcações
- **Compliance**: MLC 2006, SOLAS, ISM, OVID/OCIMF
- **IA Embarcada**: Análise preditiva, recomendações, automação
- **Modo Offline**: Operação completa sem internet por até 30+ dias
- **Relatórios**: Geração automática com insights de IA

### Tecnologias

- Frontend: React 18, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Offline: IndexedDB, Service Workers, Sync Queue
- IA: Lovable AI Gateway, Cache Semântico

### Arquitetura

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │Dashboard│  │ Módulos │  │   IA    │  │ Offline│ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘ │
│       └────────────┴───────────┬┴───────────┘      │
│                                │                    │
│  ┌─────────────────────────────┴─────────────────┐ │
│  │              State Management                  │ │
│  │         (TanStack Query + Context)            │ │
│  └─────────────────────────────┬─────────────────┘ │
│                                │                    │
│  ┌─────────────────────────────┴─────────────────┐ │
│  │              Offline Layer                     │ │
│  │      (IndexedDB + Sync Queue + Cache)         │ │
│  └─────────────────────────────┬─────────────────┘ │
└────────────────────────────────┼────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │        SUPABASE         │
                    │  ┌────┐ ┌────┐ ┌─────┐  │
                    │  │Auth│ │ DB │ │Store│  │
                    │  └────┘ └────┘ └─────┘  │
                    └─────────────────────────┘
\`\`\`
`;
  }

  /**
   * Generate module documentation
   */
  private generateModuleDocs(): SystemDocumentation['modules'] {
    return [
      {
        name: 'Dashboard',
        description: 'Painel central com KPIs, alertas e resumo executivo',
        endpoints: ['/api/dashboard/stats', '/api/dashboard/alerts'],
        inputs: ['Filtros de data', 'Seleção de embarcação'],
        outputs: ['KPIs agregados', 'Alertas priorizados', 'Resumo IA'],
        dependencies: ['fleet', 'maintenance', 'compliance'],
        aiCapabilities: ['Resumo executivo', 'Previsões', 'Alertas inteligentes']
      },
      {
        name: 'Frota',
        description: 'Gestão completa de embarcações e equipamentos',
        endpoints: ['/api/vessels', '/api/vessels/:id', '/api/vessels/:id/equipment'],
        inputs: ['Dados de embarcação', 'Telemetria', 'Localização GPS'],
        outputs: ['Status da frota', 'Histórico de operações', 'Previsões'],
        dependencies: ['maintenance', 'compliance', 'logistics'],
        aiCapabilities: ['Otimização de rotas', 'Previsão de consumo', 'Análise de eficiência']
      },
      {
        name: 'Manutenção',
        description: 'Ordens de serviço, manutenção preventiva e preditiva',
        endpoints: ['/api/maintenance/orders', '/api/maintenance/schedule', '/api/maintenance/history'],
        inputs: ['Dados de equipamento', 'Histórico de falhas', 'Telemetria'],
        outputs: ['Ordens de serviço', 'Cronograma', 'Relatórios'],
        dependencies: ['fleet', 'inventory', 'hr'],
        aiCapabilities: ['Previsão de falhas', 'Recomendações', 'Análise de padrões']
      },
      {
        name: 'Compliance',
        description: 'Gestão de conformidade regulatória',
        endpoints: ['/api/compliance/audits', '/api/compliance/certificates', '/api/compliance/regulations'],
        inputs: ['Dados de auditoria', 'Certificados', 'Documentos'],
        outputs: ['Status de conformidade', 'Alertas de vencimento', 'Relatórios'],
        dependencies: ['fleet', 'documents', 'hr'],
        aiCapabilities: ['Análise de conformidade', 'Alertas', 'Sugestões de correção']
      },
      {
        name: 'RH',
        description: 'Gestão de tripulação e certificações',
        endpoints: ['/api/crew', '/api/crew/:id', '/api/certifications'],
        inputs: ['Dados pessoais', 'Certificações', 'Histórico de embarque'],
        outputs: ['Perfil de tripulante', 'Status de certificações', 'Escalas'],
        dependencies: ['training', 'compliance'],
        aiCapabilities: ['Recomendações de treinamento', 'Análise de competências', 'Alertas']
      },
      {
        name: 'Documentos',
        description: 'Gestão documental com OCR e categorização',
        endpoints: ['/api/documents', '/api/documents/upload', '/api/documents/search'],
        inputs: ['Arquivos', 'Metadados', 'Texto de busca'],
        outputs: ['Documentos indexados', 'Resultados de busca', 'Extrações OCR'],
        dependencies: ['compliance', 'fleet', 'hr'],
        aiCapabilities: ['OCR inteligente', 'Categorização automática', 'Busca semântica']
      },
      {
        name: 'Relatórios',
        description: 'Geração e exportação de relatórios',
        endpoints: ['/api/reports', '/api/reports/generate', '/api/reports/templates'],
        inputs: ['Parâmetros', 'Período', 'Módulos selecionados'],
        outputs: ['Relatórios PDF/Excel', 'Resumos', 'Gráficos'],
        dependencies: ['Todos os módulos'],
        aiCapabilities: ['Geração automática', 'Resumo executivo', 'Análise de tendências']
      },
      {
        name: 'Estoque',
        description: 'Controle de inventário e suprimentos',
        endpoints: ['/api/inventory', '/api/inventory/items', '/api/inventory/orders'],
        inputs: ['Movimentações', 'Pedidos', 'Fornecedores'],
        outputs: ['Níveis de estoque', 'Alertas', 'Previsões'],
        dependencies: ['maintenance', 'logistics'],
        aiCapabilities: ['Previsão de demanda', 'Otimização de compras', 'Alertas']
      }
    ];
  }

  /**
   * Generate data flow documentation
   */
  private generateDataFlowDocs(): SystemDocumentation['dataFlows'] {
    return [
      {
        name: 'Fluxo de Manutenção',
        description: 'Desde a detecção de falha até a conclusão da ordem de serviço',
        diagram: `
1. Sensor detecta anomalia → 2. Sistema gera alerta
3. IA analisa padrão → 4. Recomendação de ação
5. Criação de OS → 6. Verificação de estoque
7. Execução → 8. Validação → 9. Fechamento
`
      },
      {
        name: 'Fluxo de Compliance',
        description: 'Monitoramento contínuo de conformidade regulatória',
        diagram: `
1. Cadastro de requisitos → 2. Monitoramento contínuo
3. Detecção de não-conformidade → 4. Alerta automático
5. Sugestão de correção (IA) → 6. Ação corretiva
7. Evidência documentada → 8. Auditoria → 9. Certificação
`
      },
      {
        name: 'Fluxo Offline',
        description: 'Operação sem conectividade e sincronização',
        diagram: `
1. Operação normal → 2. Perda de conexão detectada
3. Modo offline ativado → 4. Dados em IndexedDB
5. Ações na Sync Queue → 6. Conexão restaurada
7. Sincronização em blocos → 8. Resolução de conflitos
9. Confirmação de sync
`
      }
    ];
  }

  /**
   * Generate offline architecture documentation
   */
  private generateOfflineDocs(): string {
    return `
## Arquitetura Offline

### Componentes

1. **IndexedDB**: Banco de dados local para armazenamento persistente
2. **Service Worker**: Cache de assets e interceptação de requests
3. **Sync Queue**: Fila de ações pendentes de sincronização
4. **Conflict Resolution**: Estratégias para resolver conflitos de dados

### Estratégias de Sincronização

- **Chunking**: Dados divididos em blocos de 20-50KB
- **Priorização**: Dados críticos primeiro
- **Backoff Exponencial**: Retry com delays crescentes
- **Compressão**: LZ-string para redução de tamanho

### Fluxo de Dados Offline

\`\`\`
Usuário → Ação → Cache Local → Sync Queue → [Quando Online] → API → Banco
\`\`\`

### Resolução de Conflitos

1. **Last-Write-Wins**: Versão mais recente prevalece
2. **Merge**: Combina mudanças não conflitantes
3. **Manual**: Usuário decide em caso de conflito real
`;
  }

  /**
   * Generate AI architecture documentation
   */
  private generateAIDocs(): string {
    return `
## Arquitetura de IA

### Componentes

1. **Lovable AI Gateway**: API para acesso aos modelos de IA
2. **Cache Semântico**: Respostas cacheadas por similaridade
3. **Templates**: Respostas pré-definidas para perguntas frequentes
4. **Context Manager**: Gerenciamento de contexto local

### Fluxo de Processamento

\`\`\`
Pergunta → Template Match? → [Sim] → Resposta Rápida
                          → [Não] → Cache Hit? → [Sim] → Resposta Cached
                                              → [Não] → API Call → Cache → Resposta
\`\`\`

### Capacidades por Módulo

| Módulo | Capacidades |
|--------|-------------|
| Dashboard | Resumos, Alertas, Previsões |
| Manutenção | Previsão de falhas, Recomendações |
| Frota | Otimização de rotas, Eficiência |
| Compliance | Análise, Sugestões |
| RH | Treinamentos, Competências |

### Performance

- Tempo médio de resposta: 150ms (cache hit) / 800ms (API call)
- Taxa de cache hit: ~70%
- Suporte offline: Templates + Cache local
`;
  }

  /**
   * Generate database schema documentation
   */
  private generateSchemaDocs(): string {
    return `
## Estrutura do Banco de Dados

### Principais Tabelas

- **vessels**: Cadastro de embarcações
- **equipment**: Equipamentos por embarcação
- **maintenance_orders**: Ordens de serviço
- **crew_members**: Tripulação
- **certifications**: Certificações de tripulantes
- **documents**: Documentos do sistema
- **compliance_audits**: Auditorias de conformidade
- **inventory_items**: Itens de estoque
- **ai_logs**: Logs de interações com IA

### Políticas de Segurança (RLS)

- Dados isolados por organização
- Acesso baseado em perfil de usuário
- Auditoria de todas as operações

### Índices

- Índices em campos de busca frequente
- Índices compostos para queries complexas
- Índices de texto para busca semântica
`;
  }

  /**
   * Generate API reference
   */
  private generateAPIReference(): string {
    return `
## Referência de API

### Autenticação

Todas as requisições requerem header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Endpoints Principais

#### Vessels
- \`GET /api/vessels\` - Lista embarcações
- \`POST /api/vessels\` - Cria embarcação
- \`GET /api/vessels/:id\` - Detalhes
- \`PUT /api/vessels/:id\` - Atualiza
- \`DELETE /api/vessels/:id\` - Remove

#### Maintenance
- \`GET /api/maintenance/orders\` - Lista ordens
- \`POST /api/maintenance/orders\` - Cria ordem
- \`PATCH /api/maintenance/orders/:id/status\` - Atualiza status

#### AI
- \`POST /api/ai/chat\` - Chat com IA
- \`POST /api/ai/analyze\` - Análise de dados
- \`GET /api/ai/insights\` - Insights automáticos

### Códigos de Resposta

- 200: Sucesso
- 201: Criado
- 400: Requisição inválida
- 401: Não autorizado
- 404: Não encontrado
- 500: Erro interno
`;
  }

  /**
   * Generate FAQ
   */
  private generateFAQ(): SystemDocumentation['faq'] {
    return [
      {
        question: 'Como funciona o modo offline?',
        answer: 'O sistema armazena dados localmente no IndexedDB e mantém uma fila de sincronização. Ao reconectar, os dados são sincronizados automaticamente com resolução de conflitos.'
      },
      {
        question: 'A IA funciona offline?',
        answer: 'Sim. Utilizamos cache semântico e templates pré-definidos para responder perguntas frequentes mesmo sem conexão. Perguntas mais complexas são enfileiradas para processamento quando online.'
      },
      {
        question: 'Como é garantida a segurança dos dados?',
        answer: 'Utilizamos Row Level Security (RLS) do Supabase, criptografia em trânsito (HTTPS) e em repouso, além de auditoria completa de acessos.'
      },
      {
        question: 'Como gerar relatórios?',
        answer: 'Acesse o módulo de Relatórios, selecione o tipo desejado, defina os parâmetros e clique em Gerar. A IA pode gerar resumos executivos automaticamente.'
      },
      {
        question: 'O que acontece se houver conflito de dados?',
        answer: 'O sistema resolve automaticamente usando a estratégia configurada (last-write-wins por padrão). Conflitos críticos são sinalizados para revisão manual.'
      },
      {
        question: 'Como a IA aprende com o uso?',
        answer: 'A IA mantém um cache semântico de respostas aprovadas e ajusta recomendações com base em feedback e padrões de uso histórico.'
      }
    ];
  }

  /**
   * Export as Markdown
   */
  exportAsMarkdown(): string {
    const doc = this.generate();
    
    let md = doc.overview + '\n\n';
    
    md += '# Módulos\n\n';
    for (const module of doc.modules) {
      md += `## ${module.name}\n\n`;
      md += `${module.description}\n\n`;
      md += `**Endpoints:** ${module.endpoints.join(', ')}\n\n`;
      md += `**Entradas:** ${module.inputs.join(', ')}\n\n`;
      md += `**Saídas:** ${module.outputs.join(', ')}\n\n`;
      md += `**Dependências:** ${module.dependencies.join(', ')}\n\n`;
      md += `**IA:** ${module.aiCapabilities.join(', ')}\n\n`;
    }
    
    md += doc.offlineArchitecture + '\n\n';
    md += doc.aiArchitecture + '\n\n';
    md += doc.databaseSchema + '\n\n';
    md += doc.apiReference + '\n\n';
    
    md += '# FAQ\n\n';
    for (const item of doc.faq) {
      md += `## ${item.question}\n\n${item.answer}\n\n`;
    }
    
    return md;
  }
}

export const documentationGenerator = new DocumentationGenerator();
