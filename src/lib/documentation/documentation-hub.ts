/**
 * Documentation Hub - Central de Documentação
 * Prompt 9: Documentation completo
 */

export interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: DocCategory;
  content: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  version: string;
  views: number;
  helpful_votes: number;
  related_articles: string[];
}

export type DocCategory = 
  | 'getting_started'
  | 'user_guide'
  | 'admin_guide'
  | 'developer_guide'
  | 'api_reference'
  | 'troubleshooting'
  | 'faq'
  | 'changelog'
  | 'best_practices';

export interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: DocArticle[];
  order: number;
}

export interface SearchResult {
  article: DocArticle;
  score: number;
  highlights: { field: string; snippet: string }[];
}

export interface DocFeedback {
  article_id: string;
  helpful: boolean;
  comment?: string;
  user_id?: string;
  created_at: string;
}

// Documentation content
const DOCUMENTATION_CONTENT: Record<DocCategory, DocArticle[]> = {
  getting_started: [
    {
      id: 'gs-1',
      title: 'Bem-vindo ao Nauti One',
      slug: 'welcome',
      category: 'getting_started',
      content: `
# Bem-vindo ao Nauti One

O Nauti One é a plataforma mais avançada de gestão marítima, combinando IA de ponta com compliance rigoroso.

## Primeiros Passos

1. **Acesse o sistema** - Use suas credenciais fornecidas pelo administrador
2. **Configure seu perfil** - Complete suas informações pessoais
3. **Explore o dashboard** - Familiarize-se com as métricas principais
4. **Configure notificações** - Defina alertas importantes

## Módulos Principais

- **Crew Management** - Gestão completa de tripulação
- **Fleet Operations** - Controle de frota e viagens
- **Compliance Center** - MLC 2006 e STCW automático
- **AI Insights** - Análises preditivas e recomendações

## Precisa de Ajuda?

- 📚 Consulte nossa [Base de Conhecimento](/docs/knowledge-base)
- 💬 Use o chat de suporte no canto inferior direito
- 📧 Envie email para support@nautione.com
      `,
      tags: ['início', 'tutorial', 'onboarding'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 15420,
      helpful_votes: 892,
      related_articles: ['gs-2', 'gs-3']
    },
    {
      id: 'gs-2',
      title: 'Configuração Inicial',
      slug: 'initial-setup',
      category: 'getting_started',
      content: `
# Configuração Inicial

Complete estes passos para configurar seu ambiente Nauti One.

## 1. Configurar Organização

\`\`\`
Configurações > Organização > Dados da Empresa
\`\`\`

Preencha:
- Nome da empresa
- CNPJ/Registro
- Endereço
- Logo

## 2. Adicionar Embarcações

\`\`\`
Frota > Embarcações > Nova Embarcação
\`\`\`

Informações necessárias:
- Nome e IMO
- Tipo de embarcação
- Bandeira
- Certificados

## 3. Cadastrar Tripulação

\`\`\`
Crew > Tripulantes > Novo Tripulante
\`\`\`

## 4. Configurar Integrações

Conecte sistemas externos:
- AIS tracking
- Port systems
- Flag state APIs
      `,
      tags: ['configuração', 'setup', 'organização'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 8930,
      helpful_votes: 456,
      related_articles: ['gs-1', 'ug-1']
    }
  ],
  user_guide: [
    {
      id: 'ug-1',
      title: 'Guia do Usuário - Dashboard',
      slug: 'user-guide-dashboard',
      category: 'user_guide',
      content: `
# Dashboard - Visão Geral

O Dashboard é sua central de comando para monitorar todas as operações.

## Widgets Disponíveis

### KPIs Principais
- Tripulantes ativos
- Embarcações em operação
- Certificados vencendo
- Alertas pendentes

### Gráficos
- Tendência de custos
- Performance da frota
- Compliance status

## Personalização

Arraste widgets para reorganizar ou clique em ⚙️ para configurar.

## Filtros

Use os filtros no topo para:
- Período (7d, 30d, 90d, custom)
- Embarcação específica
- Departamento
      `,
      tags: ['dashboard', 'métricas', 'KPI'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 12340,
      helpful_votes: 678,
      related_articles: ['ug-2', 'ug-3']
    }
  ],
  admin_guide: [
    {
      id: 'ag-1',
      title: 'Guia do Administrador',
      slug: 'admin-guide',
      category: 'admin_guide',
      content: `
# Guia do Administrador

Gerencie usuários, permissões e configurações do sistema.

## Gestão de Usuários

### Criar Usuário
1. Acesse Configurações > Usuários
2. Clique em "Novo Usuário"
3. Preencha dados e selecione perfil

### Perfis Disponíveis
- **Admin** - Acesso total
- **HR Manager** - Gestão de tripulação
- **Fleet Manager** - Gestão de frota
- **Viewer** - Apenas visualização

## Segurança

### Políticas de Senha
- Mínimo 12 caracteres
- Letras, números e símbolos
- Expiração a cada 90 dias

### Autenticação
- MFA obrigatório para admins
- SSO disponível (SAML 2.0)

## Auditoria

Todos os acessos são registrados em:
\`\`\`
Admin > Logs > Access Logs
\`\`\`
      `,
      tags: ['admin', 'usuários', 'segurança'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 5670,
      helpful_votes: 234,
      related_articles: ['ag-2', 'security-1']
    }
  ],
  developer_guide: [
    {
      id: 'dg-1',
      title: 'Guia do Desenvolvedor - API',
      slug: 'developer-guide-api',
      category: 'developer_guide',
      content: `
# Guia do Desenvolvedor

Integre o Nauti One com seus sistemas usando nossa API.

## Autenticação

### API Key
\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.nautione.com/v1/vessels
\`\`\`

### OAuth 2.0
Para aplicações de terceiros, use OAuth 2.0:

\`\`\`bash
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
\`\`\`

## Rate Limits

| Plano | Requests/min | Requests/dia |
|-------|--------------|--------------|
| Basic | 60 | 10,000 |
| Pro | 300 | 100,000 |
| Enterprise | 1000 | Unlimited |

## SDKs

- JavaScript/TypeScript: \`npm install @nautione/sdk\`
- Python: \`pip install nautione\`
- Go: \`go get github.com/nautione/go-sdk\`
      `,
      tags: ['API', 'SDK', 'integração'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 8920,
      helpful_votes: 567,
      related_articles: ['api-1', 'api-2']
    }
  ],
  api_reference: [
    {
      id: 'api-1',
      title: 'API Reference - Vessels',
      slug: 'api-vessels',
      category: 'api_reference',
      content: `
# API Reference - Vessels

## Endpoints

### List Vessels
\`\`\`
GET /api/v1/vessels
\`\`\`

**Parameters:**
- \`page\` (int): Página atual
- \`limit\` (int): Itens por página (max 100)
- \`status\` (string): Filter by status

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "name": "MV Atlantic Star",
      "imo": "9123456",
      "type": "container",
      "flag": "BR",
      "status": "operational"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
\`\`\`

### Get Vessel
\`\`\`
GET /api/v1/vessels/:id
\`\`\`

### Create Vessel
\`\`\`
POST /api/v1/vessels
\`\`\`

### Update Vessel
\`\`\`
PATCH /api/v1/vessels/:id
\`\`\`
      `,
      tags: ['API', 'vessels', 'endpoints'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 6780,
      helpful_votes: 345,
      related_articles: ['api-2', 'dg-1']
    }
  ],
  troubleshooting: [
    {
      id: 'ts-1',
      title: 'Problemas Comuns',
      slug: 'common-issues',
      category: 'troubleshooting',
      content: `
# Troubleshooting - Problemas Comuns

## Erro de Login

### "Credenciais inválidas"
1. Verifique caps lock
2. Tente "Esqueci minha senha"
3. Contate o administrador

### "Sessão expirada"
- Faça login novamente
- Verifique se o navegador permite cookies

## Performance Lenta

### Causas comuns:
1. Conexão de internet instável
2. Cache do navegador cheio
3. Muitas abas abertas

### Soluções:
\`\`\`
1. Limpar cache (Ctrl+Shift+Delete)
2. Usar modo anônimo para teste
3. Verificar extensões do navegador
\`\`\`

## Dados não Sincronizando

Se os dados não atualizam:
1. Verifique conexão
2. Aguarde 30 segundos
3. Force refresh (Ctrl+F5)
4. Contate suporte se persistir
      `,
      tags: ['problemas', 'erro', 'solução'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 23450,
      helpful_votes: 1234,
      related_articles: ['ts-2', 'faq-1']
    }
  ],
  faq: [
    {
      id: 'faq-1',
      title: 'Perguntas Frequentes',
      slug: 'faq',
      category: 'faq',
      content: `
# Perguntas Frequentes (FAQ)

## Geral

**Q: O Nauti One funciona offline?**
A: Sim! O PWA permite trabalhar offline. Dados sincronizam automaticamente quando reconectar.

**Q: Quais navegadores são suportados?**
A: Chrome, Firefox, Safari, Edge (versões recentes).

**Q: Posso acessar pelo celular?**
A: Sim, o sistema é responsivo e tem app PWA instalável.

## Segurança

**Q: Meus dados estão seguros?**
A: Sim. Usamos criptografia AES-256, certificações SOC2 e ISO 27001.

**Q: Como funciona o backup?**
A: Backups automáticos a cada hora, com retenção de 90 dias.

## Faturamento

**Q: Quais planos estão disponíveis?**
A: Starter (até 50 tripulantes), Pro (até 500), Enterprise (ilimitado).

**Q: Posso cancelar a qualquer momento?**
A: Sim, sem multas. Seus dados ficam disponíveis por 30 dias após cancelamento.
      `,
      tags: ['FAQ', 'perguntas', 'dúvidas'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 34560,
      helpful_votes: 2345,
      related_articles: ['gs-1', 'ts-1']
    }
  ],
  changelog: [
    {
      id: 'cl-1',
      title: 'Changelog - v4.0',
      slug: 'changelog-v4',
      category: 'changelog',
      content: `
# Changelog v4.0

## 🚀 Novidades

### AI Autônomo
- Multi-Agent Orchestrator com 8 agentes especializados
- Digital Twin para simulações what-if
- Predição de manutenção com ONNX

### Performance
- 60% mais rápido no carregamento
- Suporte offline aprimorado
- Cache inteligente multi-camada

### Compliance
- MLC 2006 Amendment 2024
- STCW automático
- Auditoria blockchain

## 🐛 Correções

- Fix: Sync de documentos em conexões lentas
- Fix: Cálculo de horas de descanso
- Fix: Export de relatórios PDF

## 📝 Breaking Changes

- API v0 descontinuada (usar v1)
- Removido suporte IE11

## 📅 Timeline

- v4.0.0: 2026-01-15
- v4.0.1: 2026-01-22 (hotfix)
- v4.0.2: 2026-01-28 (current)
      `,
      tags: ['changelog', 'versão', 'atualizações'],
      author: 'Nauti One Team',
      created_at: '2026-01-15',
      updated_at: '2026-01-28',
      version: '4.0.2',
      views: 8920,
      helpful_votes: 456,
      related_articles: ['cl-0', 'gs-1']
    }
  ],
  best_practices: [
    {
      id: 'bp-1',
      title: 'Melhores Práticas',
      slug: 'best-practices',
      category: 'best_practices',
      content: `
# Melhores Práticas

## Gestão de Tripulação

### Documentação
- Digitalize todos os documentos
- Configure alertas 90 dias antes do vencimento
- Use checklist de embarque

### Wellness
- Monitore scores de bem-estar semanalmente
- Aja em alertas críticos em 24h
- Documente todas as intervenções

## Compliance

### MLC 2006
- Revise horas de descanso diariamente
- Mantenha evidências de pagamento
- Atualize contratos anualmente

### STCW
- Valide certificados antes do embarque
- Programe treinamentos com antecedência
- Use o AI para prever necessidades

## Segurança de Dados

### Acessos
- Use MFA sempre que possível
- Revise permissões mensalmente
- Remova acessos de ex-funcionários imediatamente

### Backups
- Teste restauração trimestralmente
- Mantenha cópia offline crítica
      `,
      tags: ['práticas', 'dicas', 'recomendações'],
      author: 'Nauti One Team',
      created_at: '2025-01-01',
      updated_at: '2026-01-28',
      version: '4.0',
      views: 11230,
      helpful_votes: 789,
      related_articles: ['ug-1', 'ag-1']
    }
  ]
};

class DocumentationHub {
  private articles: Map<string, DocArticle> = new Map();
  private sections: DocSection[] = [];

  constructor() {
    this.initializeContent();
  }

  private initializeContent(): void {
    // Flatten all articles into map
    Object.values(DOCUMENTATION_CONTENT).flat().forEach(article => {
      this.articles.set(article.id, article);
    });

    // Create sections
    this.sections = [
      {
        id: 'getting-started',
        title: 'Primeiros Passos',
        description: 'Comece aqui para configurar e entender o Nauti One',
        icon: '🚀',
        articles: DOCUMENTATION_CONTENT.getting_started,
        order: 1
      },
      {
        id: 'user-guide',
        title: 'Guia do Usuário',
        description: 'Aprenda a usar todas as funcionalidades',
        icon: '📖',
        articles: DOCUMENTATION_CONTENT.user_guide,
        order: 2
      },
      {
        id: 'admin-guide',
        title: 'Guia do Administrador',
        description: 'Configure usuários, permissões e sistema',
        icon: '⚙️',
        articles: DOCUMENTATION_CONTENT.admin_guide,
        order: 3
      },
      {
        id: 'developer-guide',
        title: 'Guia do Desenvolvedor',
        description: 'Integre com APIs e SDKs',
        icon: '💻',
        articles: DOCUMENTATION_CONTENT.developer_guide,
        order: 4
      },
      {
        id: 'api-reference',
        title: 'Referência da API',
        description: 'Documentação completa dos endpoints',
        icon: '🔌',
        articles: DOCUMENTATION_CONTENT.api_reference,
        order: 5
      },
      {
        id: 'troubleshooting',
        title: 'Solução de Problemas',
        description: 'Resolva problemas comuns',
        icon: '🔧',
        articles: DOCUMENTATION_CONTENT.troubleshooting,
        order: 6
      },
      {
        id: 'faq',
        title: 'FAQ',
        description: 'Perguntas frequentes',
        icon: '❓',
        articles: DOCUMENTATION_CONTENT.faq,
        order: 7
      },
      {
        id: 'changelog',
        title: 'Changelog',
        description: 'Histórico de versões e atualizações',
        icon: '📝',
        articles: DOCUMENTATION_CONTENT.changelog,
        order: 8
      },
      {
        id: 'best-practices',
        title: 'Melhores Práticas',
        description: 'Dicas e recomendações de uso',
        icon: '✨',
        articles: DOCUMENTATION_CONTENT.best_practices,
        order: 9
      }
    ];
  }

  /**
   * Get all documentation sections
   */
  getSections(): DocSection[] {
    return this.sections.sort((a, b) => a.order - b.order);
  }

  /**
   * Get article by ID
   */
  getArticle(id: string): DocArticle | undefined {
    return this.articles.get(id);
  }

  /**
   * Get article by slug
   */
  getArticleBySlug(slug: string): DocArticle | undefined {
    return Array.from(this.articles.values()).find(a => a.slug === slug);
  }

  /**
   * Search documentation
   */
  search(query: string, limit: number = 10): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    this.articles.forEach(article => {
      let score = 0;
      const highlights: { field: string; snippet: string }[] = [];

      // Title match (highest weight)
      if (article.title.toLowerCase().includes(queryLower)) {
        score += 100;
        highlights.push({
          field: 'title',
          snippet: this.highlightText(article.title, query)
        });
      }

      // Tags match
      article.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 50;
          highlights.push({ field: 'tags', snippet: tag });
        }
      });

      // Content match
      if (article.content.toLowerCase().includes(queryLower)) {
        score += 25;
        const snippet = this.extractSnippet(article.content, query);
        highlights.push({ field: 'content', snippet });
      }

      if (score > 0) {
        results.push({ article, score, highlights });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get related articles
   */
  getRelatedArticles(articleId: string): DocArticle[] {
    const article = this.articles.get(articleId);
    if (!article) return [];

    return article.related_articles
      .map(id => this.articles.get(id))
      .filter((a): a is DocArticle => a !== undefined);
  }

  /**
   * Get popular articles
   */
  getPopularArticles(limit: number = 5): DocArticle[] {
    return Array.from(this.articles.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * Record article view
   */
  recordView(articleId: string): void {
    const article = this.articles.get(articleId);
    if (article) {
      article.views++;
    }
  }

  /**
   * Submit feedback
   */
  submitFeedback(feedback: DocFeedback): void {
    const article = this.articles.get(feedback.article_id);
    if (article && feedback.helpful) {
      article.helpful_votes++;
    }
    // In production, would store to database
    console.log('Feedback submitted:', feedback);
  }

  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '**$1**');
  }

  private extractSnippet(content: string, query: string, length: number = 150): string {
    const lowerContent = content.toLowerCase();
    const queryLower = query.toLowerCase();
    const index = lowerContent.indexOf(queryLower);
    
    if (index === -1) return content.slice(0, length) + '...';

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);
    let snippet = content.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return this.highlightText(snippet, query);
  }
}

export const documentationHub = new DocumentationHub();
