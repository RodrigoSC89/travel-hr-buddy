/**
 * Mini-Wiki Embedded AI System - PATCH 950
 * Local knowledge base with AI support
 */

import { hybridLLMEngine } from "@/lib/llm/hybrid-engine";

export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  relatedArticles: string[];
  lastUpdated: Date;
  views: number;
}

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  helpful: number;
  notHelpful: number;
}

export interface WikiSearchResult {
  article: WikiArticle | FAQEntry;
  relevance: number;
  matchedKeywords: string[];
}

// Built-in knowledge base
const KNOWLEDGE_BASE: WikiArticle[] = [
  {
    id: "sync-data",
    title: "Como sincronizar dados",
    content: `## Sincronização de Dados

### Sincronização Automática
O sistema sincroniza automaticamente quando há conexão com a internet. Você verá um ícone de sync na barra superior.

### Sincronização Manual
1. Acesse o menu principal
2. Clique em "Sincronizar Agora"
3. Aguarde a conclusão

### Resolver Conflitos
Se houver conflitos, o sistema mostrará uma tela de resolução onde você pode escolher qual versão manter.

### Modo Offline
Os dados são salvos localmente e sincronizados quando a conexão for restabelecida.`,
    category: "Sincronização",
    tags: ["sync", "dados", "offline"],
    keywords: ["sincronizar", "sincronização", "dados", "offline", "conflito", "manual"],
    relatedArticles: ["offline-mode", "data-backup"],
    lastUpdated: new Date(),
    views: 0
  },
  {
    id: "register-failure",
    title: "Como registrar uma falha",
    content: `## Registro de Falhas

### Passo a Passo
1. Acesse o módulo de Manutenção
2. Clique em "Nova Falha"
3. Preencha:
   - Equipamento afetado
   - Descrição do problema
   - Prioridade (Baixa/Média/Alta/Crítica)
   - Fotos (opcional)
4. Clique em "Registrar"

### Falha Crítica
Para falhas críticas, use o botão vermelho "Emergência" que notifica imediatamente a equipe responsável.

### Acompanhamento
Todas as falhas podem ser acompanhadas na aba "Meus Registros".`,
    category: "Manutenção",
    tags: ["falha", "manutenção", "registro"],
    keywords: ["falha", "registrar", "problema", "equipamento", "manutenção", "emergência"],
    relatedArticles: ["maintenance-types", "emergency-procedures"],
    lastUpdated: new Date(),
    views: 0
  },
  {
    id: "generate-report",
    title: "Como gerar relatórios",
    content: `## Geração de Relatórios

### Relatório Rápido
1. Acesse o módulo de Relatórios
2. Selecione o tipo de relatório
3. Defina o período
4. Clique em "Gerar"

### Tipos Disponíveis
- **Operacional**: Atividades diárias
- **Manutenção**: Status de equipamentos
- **Tripulação**: Escala e horas trabalhadas
- **Combustível**: Consumo e abastecimentos
- **ESG**: Indicadores ambientais

### Exportação
Relatórios podem ser exportados em PDF, Excel ou enviados por email.

### Relatórios Offline
Relatórios básicos podem ser gerados offline. A versão completa requer sincronização.`,
    category: "Relatórios",
    tags: ["relatório", "exportar", "pdf"],
    keywords: ["relatório", "gerar", "exportar", "pdf", "excel", "operacional", "manutenção"],
    relatedArticles: ["export-data", "scheduled-reports"],
    lastUpdated: new Date(),
    views: 0
  },
  {
    id: "error-codes",
    title: "Códigos de Erro",
    content: `## Códigos de Erro do Sistema

### Erros de Conexão
- **E001**: Sem conexão com internet
- **E002**: Timeout de servidor
- **E003**: Falha de autenticação

### Erros de Sincronização
- **E101**: Conflito de dados
- **E102**: Dados corrompidos
- **E103**: Fila de sync cheia

### Erros de LLM
- **E201**: Modelo não carregado
- **E202**: Memória insuficiente
- **E203**: Timeout de resposta

### Solução Geral
1. Tente novamente
2. Reinicie o aplicativo
3. Contate suporte se persistir`,
    category: "Suporte",
    tags: ["erro", "código", "suporte"],
    keywords: ["erro", "e001", "e101", "e201", "código", "problema", "solução"],
    relatedArticles: ["troubleshooting", "contact-support"],
    lastUpdated: new Date(),
    views: 0
  },
  {
    id: "offline-mode",
    title: "Modo Offline",
    content: `## Operação Offline

### O que funciona offline
- ✅ Visualizar dados salvos
- ✅ Criar novos registros
- ✅ Gerar relatórios básicos
- ✅ Consultar IA local
- ✅ Fotos e documentos

### O que requer internet
- ❌ Sincronização
- ❌ Relatórios avançados
- ❌ Comunicação em tempo real

### Indicador Visual
Um banner amarelo aparece quando você está offline.

### Dados Pendentes
Veja dados pendentes em Menu > Sincronização > Pendentes`,
    category: "Sincronização",
    tags: ["offline", "sem internet", "local"],
    keywords: ["offline", "internet", "local", "pendente", "sincronização"],
    relatedArticles: ["sync-data", "data-backup"],
    lastUpdated: new Date(),
    views: 0
  }
];

const FAQ_ENTRIES: FAQEntry[] = [
  {
    id: "faq-1",
    question: "O que fazer quando o erro 103 aparece?",
    answer: "O erro 103 indica que a fila de sincronização está cheia. Tente: 1) Verificar sua conexão de internet, 2) Forçar sincronização manual em Menu > Sincronizar, 3) Se persistir, reinicie o aplicativo.",
    category: "Erros",
    keywords: ["erro", "103", "fila", "sync"],
    helpful: 15,
    notHelpful: 2
  },
  {
    id: "faq-2",
    question: "Como funciona a IA do sistema?",
    answer: "A IA opera localmente no seu dispositivo, permitindo uso offline. Ela ajuda com: previsão de manutenção, análise de dados, sugestões operacionais e suporte técnico. Basta digitar sua pergunta no assistente.",
    category: "IA",
    keywords: ["ia", "inteligência", "assistente", "offline"],
    helpful: 23,
    notHelpful: 1
  },
  {
    id: "faq-3",
    question: "Posso usar o sistema em tablets?",
    answer: "Sim! O sistema é otimizado para tablets e dispositivos móveis. A interface se adapta automaticamente. Recomendamos tablets com pelo menos 3GB de RAM para melhor performance.",
    category: "Dispositivos",
    keywords: ["tablet", "móvel", "celular", "dispositivo"],
    helpful: 18,
    notHelpful: 0
  },
  {
    id: "faq-4",
    question: "Como fazer backup dos dados?",
    answer: "Os dados são automaticamente sincronizados com o servidor quando há internet. Para backup local: Menu > Configurações > Backup > Exportar. Os dados são criptografados.",
    category: "Dados",
    keywords: ["backup", "exportar", "salvar", "dados"],
    helpful: 12,
    notHelpful: 1
  },
  {
    id: "faq-5",
    question: "Quanto espaço o sistema usa?",
    answer: "O app base usa ~100MB. Dados offline podem variar de 50MB a 500MB dependendo do uso. Você pode verificar em Menu > Configurações > Armazenamento.",
    category: "Sistema",
    keywords: ["espaço", "armazenamento", "memória", "tamanho"],
    helpful: 8,
    notHelpful: 0
  }
];

class MiniWikiEngine {
  private articles: WikiArticle[] = [...KNOWLEDGE_BASE];
  private faqs: FAQEntry[] = [...FAQ_ENTRIES];
  private searchHistory: string[] = [];

  /**
   * Search knowledge base
   */
  search(query: string): WikiSearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    // Track search
    this.searchHistory.push(normalizedQuery);
    if (this.searchHistory.length > 100) {
      this.searchHistory.shift();
    }

    const results: WikiSearchResult[] = [];

    // Search articles
    this.articles.forEach(article => {
      const matchedKeywords: string[] = [];
      let relevance = 0;

      // Title match (highest weight)
      if (article.title.toLowerCase().includes(normalizedQuery)) {
        relevance += 10;
      }

      // Keyword match
      article.keywords.forEach(keyword => {
        if (queryWords.some(qw => keyword.includes(qw) || qw.includes(keyword))) {
          matchedKeywords.push(keyword);
          relevance += 3;
        }
      });

      // Tag match
      article.tags.forEach(tag => {
        if (queryWords.includes(tag)) {
          relevance += 2;
        }
      });

      // Content match
      const contentLower = article.content.toLowerCase();
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          relevance += 1;
        }
      });

      if (relevance > 0) {
        results.push({ article, relevance, matchedKeywords });
      }
    });

    // Search FAQs
    this.faqs.forEach(faq => {
      const matchedKeywords: string[] = [];
      let relevance = 0;

      // Question match (highest weight)
      if (faq.question.toLowerCase().includes(normalizedQuery)) {
        relevance += 10;
      }

      // Keyword match
      faq.keywords.forEach(keyword => {
        if (queryWords.some(qw => keyword.includes(qw) || qw.includes(keyword))) {
          matchedKeywords.push(keyword);
          relevance += 3;
        }
      });

      // Answer match
      if (faq.answer.toLowerCase().includes(normalizedQuery)) {
        relevance += 2;
      }

      // Boost by helpfulness
      relevance += (faq.helpful / (faq.helpful + faq.notHelpful + 1)) * 2;

      if (relevance > 0) {
        results.push({ article: faq, relevance, matchedKeywords });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get article by ID
   */
  getArticle(id: string): WikiArticle | undefined {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.views++;
    }
    return article;
  }

  /**
   * Get FAQ by ID
   */
  getFAQ(id: string): FAQEntry | undefined {
    return this.faqs.find(f => f.id === id);
  }

  /**
   * Ask AI with wiki context
   */
  async askAI(question: string): Promise<string> {
    // Search for relevant context
    const searchResults = this.search(question);
    const topResults = searchResults.slice(0, 3);

    // Build context from search results
    let context = "";
    topResults.forEach(result => {
      if ("content" in result.article) {
        context += `\n\n${result.article.title}:\n${result.article.content}`;
      } else {
        context += `\n\nPergunta: ${result.article.question}\nResposta: ${result.article.answer}`;
      }
    });

    // If we have good matches, use them
    if (topResults.length > 0 && topResults[0].relevance > 5) {
      const bestMatch = topResults[0].article;
      if ("answer" in bestMatch) {
        return bestMatch.answer;
      }
      // Use LLM to summarize article content based on question
      try {
        const result = await hybridLLMEngine.query(
          `Com base no seguinte contexto, responda de forma clara e direta: "${question}"\n\nContexto: ${context}`
        );
        return result.response;
      } catch {
        // Fallback to article content
        if ("content" in bestMatch) {
          return `📚 ${bestMatch.title}\n\n${bestMatch.content.slice(0, 500)}...`;
        }
      }
    }

    // No good match - use general LLM response
    try {
      const result = await hybridLLMEngine.query(
        `Você é um assistente técnico para um sistema marítimo. Responda de forma clara e objetiva: ${question}`
      );
      return result.response;
    } catch {
      return "Desculpe, não encontrei informações sobre essa pergunta. Tente reformular ou consulte o suporte técnico.";
    }
  }

  /**
   * Add custom article
   */
  addArticle(article: Omit<WikiArticle, "views" | "lastUpdated">): void {
    this.articles.push({
      ...article,
      views: 0,
      lastUpdated: new Date()
    });
  }

  /**
   * Add custom FAQ
   */
  addFAQ(faq: Omit<FAQEntry, "helpful" | "notHelpful">): void {
    this.faqs.push({
      ...faq,
      helpful: 0,
      notHelpful: 0
    });
  }

  /**
   * Rate FAQ
   */
  rateFAQ(id: string, helpful: boolean): void {
    const faq = this.faqs.find(f => f.id === id);
    if (faq) {
      if (helpful) {
        faq.helpful++;
      } else {
        faq.notHelpful++;
      }
    }
  }

  /**
   * Get popular articles
   */
  getPopularArticles(limit: number = 5): WikiArticle[] {
    return [...this.articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * Get categories
   */
  getCategories(): string[] {
    const articleCategories = this.articles.map(a => a.category);
    const faqCategories = this.faqs.map(f => f.category);
    return [...new Set([...articleCategories, ...faqCategories])];
  }

  /**
   * Get articles by category
   */
  getArticlesByCategory(category: string): WikiArticle[] {
    return this.articles.filter(a => a.category === category);
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(category: string): FAQEntry[] {
    return this.faqs.filter(f => f.category === category);
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): string[] {
    return [...this.searchHistory].reverse().slice(0, 10);
  }

  /**
   * Export knowledge base
   */
  exportKnowledgeBase(): { articles: WikiArticle[]; faqs: FAQEntry[] } {
    return {
      articles: this.articles,
      faqs: this.faqs
    };
  }

  /**
   * Import knowledge base
   */
  importKnowledgeBase(data: { articles?: WikiArticle[]; faqs?: FAQEntry[] }): void {
    if (data.articles) {
      this.articles = [...KNOWLEDGE_BASE, ...data.articles];
    }
    if (data.faqs) {
      this.faqs = [...FAQ_ENTRIES, ...data.faqs];
    }
  }
}

export const miniWikiEngine = new MiniWikiEngine();
