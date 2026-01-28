/**
 * Knowledge Base System - PROMPT 10
 * Sistema de base de conhecimento para suporte
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  article_count: number;
}

// Categorias padrão do sistema
export const KB_CATEGORIES: KBCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of Nauti One',
    icon: '🚀',
    article_count: 0
  },
  {
    id: 'crew-management',
    name: 'Crew Management',
    description: 'Managing crew members, contracts, and certifications',
    icon: '👥',
    article_count: 0
  },
  {
    id: 'vessel-operations',
    name: 'Vessel Operations',
    description: 'Vessel tracking, maintenance, and compliance',
    icon: '🚢',
    article_count: 0
  },
  {
    id: 'compliance',
    name: 'Compliance & Regulations',
    description: 'MLC 2006, STCW, ISM, ISPS compliance',
    icon: '📋',
    article_count: 0
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    description: 'Using AI assistants and automation',
    icon: '🤖',
    article_count: 0
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: '🔧',
    article_count: 0
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    description: 'Account security and data protection',
    icon: '🔒',
    article_count: 0
  },
  {
    id: 'billing',
    name: 'Billing & Subscriptions',
    description: 'Plans, payments, and invoices',
    icon: '💳',
    article_count: 0
  }
];

// Artigos base do sistema
export const DEFAULT_ARTICLES: Partial<KBArticle>[] = [
  {
    id: 'welcome',
    title: 'Welcome to Nauti One',
    category: 'getting-started',
    tags: ['welcome', 'introduction', 'overview'],
    content: `
# Welcome to Nauti One v4.0

Nauti One is a comprehensive Maritime HR Management platform designed to streamline crew management, vessel operations, and regulatory compliance.

## Key Features

- **Crew Management**: Track crew members, contracts, certifications, and training
- **Vessel Operations**: Monitor fleet status, maintenance schedules, and port calls
- **Compliance**: Automated MLC 2006, STCW, ISM, and ISPS compliance tracking
- **AI Assistants**: 16 specialized AI assistants for various operations
- **Offline Support**: Works on satellite connections and low-bandwidth environments

## Getting Started

1. Log in to your account
2. Complete the onboarding tour
3. Add your organization details
4. Start adding vessels and crew members

Need help? Contact support@nautione.com
    `
  },
  {
    id: 'crew-add',
    title: 'How to Add a Crew Member',
    category: 'crew-management',
    tags: ['crew', 'add', 'new member'],
    content: `
# Adding a Crew Member

## Step-by-Step Guide

1. Navigate to **Crew Management** > **Crew Members**
2. Click the **+ Add Crew** button
3. Fill in the required information:
   - Full name
   - Position/Rank
   - Nationality
   - Date of birth
   - Seaman's book number
4. Upload required documents
5. Click **Save**

## Required Documents

- Passport
- Seaman's Book
- Medical Certificate (ENG1/PEME)
- Relevant CoC/CoP certificates

## Tips

- Use the AI assistant to auto-fill information from scanned documents
- Set up certificate expiry alerts to stay compliant
    `
  },
  {
    id: 'offline-mode',
    title: 'Using Nauti One Offline',
    category: 'troubleshooting',
    tags: ['offline', 'satellite', 'connectivity'],
    content: `
# Offline Mode

Nauti One is designed to work in low-bandwidth and offline environments typical in maritime operations.

## How It Works

1. **Automatic Detection**: The app detects connection quality automatically
2. **Data Caching**: Critical data is cached locally for offline access
3. **Queue System**: Changes made offline are queued and synced when connected
4. **Conflict Resolution**: The system handles sync conflicts intelligently

## What Works Offline

- ✅ View crew lists and details
- ✅ View vessel information
- ✅ Access cached documents
- ✅ Create new records (synced later)
- ✅ AI suggestions (cached responses)

## What Requires Connection

- ❌ Real-time vessel tracking
- ❌ External API integrations
- ❌ Video calls
- ❌ Large file uploads

## Tips for Low Bandwidth

- Enable "Data Saver" mode in settings
- Pre-download critical documents before going offshore
- Use text-based communication instead of video
    `
  },
  {
    id: 'ai-assistant',
    title: 'Using AI Assistants',
    category: 'ai-features',
    tags: ['ai', 'assistant', 'automation'],
    content: `
# AI Assistants Guide

Nauti One includes 16 specialized AI assistants to help with various tasks.

## Available Assistants

1. **Crew AI**: Crew scheduling and optimization
2. **Compliance AI**: Regulatory compliance checking
3. **Document AI**: Document analysis and OCR
4. **Maintenance AI**: Predictive maintenance
5. **Safety AI**: Safety incident analysis
6. **Training AI**: Adaptive learning recommendations
7. And 10 more specialized assistants...

## How to Use

1. Look for the 🤖 icon in any module
2. Click to open the AI assistant
3. Type your question or request
4. Review the AI's response
5. Apply suggested actions if appropriate

## Best Practices

- Be specific in your questions
- Review AI suggestions before applying
- Provide feedback to improve responses
- Use natural language - no special syntax needed

## Privacy & Security

- All AI interactions are logged for audit
- Sensitive data is never sent to external AI providers
- AI decisions require human approval for critical actions
    `
  },
  {
    id: 'mlc-compliance',
    title: 'MLC 2006 Compliance',
    category: 'compliance',
    tags: ['mlc', 'compliance', 'regulations', 'maritime labour'],
    content: `
# MLC 2006 Compliance

The Maritime Labour Convention (MLC) 2006 is the "bill of rights" for seafarers.

## Key Requirements

### Title 1 - Minimum Requirements
- Minimum age (16 years, 18 for hazardous work)
- Medical certificates
- Training and qualifications
- Recruitment and placement

### Title 2 - Conditions of Employment
- Seafarers' employment agreements
- Wages
- Hours of work and rest
- Entitlement to leave
- Repatriation
- Compensation for loss or injury

### Title 3 - Accommodation
- Living quarters standards
- Food and catering
- Health protection and medical care

### Title 4 - Health and Social Security
- Medical care on board
- Shipowner liability
- Social security protection

### Title 5 - Compliance and Enforcement
- Flag State responsibilities
- Port State inspections

## How Nauti One Helps

- ✅ Automated certificate tracking
- ✅ SEA template generation
- ✅ Hours of work/rest monitoring
- ✅ Wage calculation compliance
- ✅ Repatriation planning
- ✅ Audit-ready reports

## Dashboard

View your MLC compliance status at **Compliance** > **MLC 2006**
    `
  }
];

// Classe de serviço para a base de conhecimento
export class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private searchIndex: Map<string, string[]> = new Map();

  private constructor() {
    this.buildSearchIndex();
  }

  static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }

  private buildSearchIndex(): void {
    DEFAULT_ARTICLES.forEach(article => {
      if (!article.id) return;
      
      const keywords = [
        ...(article.title?.toLowerCase().split(' ') || []),
        ...(article.tags || []),
        article.category || ''
      ];
      
      this.searchIndex.set(article.id, keywords);
    });
  }

  async getCategories(): Promise<KBCategory[]> {
    // Contar artigos por categoria
    const categoriesWithCounts = KB_CATEGORIES.map(cat => ({
      ...cat,
      article_count: DEFAULT_ARTICLES.filter(a => a.category === cat.id).length
    }));
    
    return categoriesWithCounts;
  }

  async getArticlesByCategory(categoryId: string): Promise<Partial<KBArticle>[]> {
    return DEFAULT_ARTICLES.filter(a => a.category === categoryId);
  }

  async getArticle(articleId: string): Promise<Partial<KBArticle> | null> {
    const article = DEFAULT_ARTICLES.find(a => a.id === articleId);
    if (article) {
      // Incrementar visualizações (em memória por enquanto)
      logger.info('Article viewed', { articleId });
    }
    return article || null;
  }

  async search(query: string): Promise<Partial<KBArticle>[]> {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 2);
    
    const results: { article: Partial<KBArticle>; score: number }[] = [];
    
    DEFAULT_ARTICLES.forEach(article => {
      if (!article.id) return;
      
      let score = 0;
      const keywords = this.searchIndex.get(article.id) || [];
      
      // Verificar match no título
      if (article.title?.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Verificar match nas tags
      queryWords.forEach(word => {
        if (article.tags?.some(tag => tag.includes(word))) {
          score += 5;
        }
        if (keywords.some(kw => kw.includes(word))) {
          score += 2;
        }
        if (article.content?.toLowerCase().includes(word)) {
          score += 1;
        }
      });
      
      if (score > 0) {
        results.push({ article, score });
      }
    });
    
    // Ordenar por relevância
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, 10).map(r => r.article);
  }

  async recordFeedback(articleId: string, helpful: boolean): Promise<void> {
    logger.info('Article feedback recorded', { articleId, helpful });
    // Em produção, salvar no banco de dados
  }

  async getPopularArticles(limit = 5): Promise<Partial<KBArticle>[]> {
    // Por enquanto, retornar os primeiros artigos
    return DEFAULT_ARTICLES.slice(0, limit);
  }

  async getRelatedArticles(articleId: string, limit = 3): Promise<Partial<KBArticle>[]> {
    const article = DEFAULT_ARTICLES.find(a => a.id === articleId);
    if (!article) return [];
    
    // Encontrar artigos com tags similares
    return DEFAULT_ARTICLES
      .filter(a => a.id !== articleId && a.category === article.category)
      .slice(0, limit);
  }
}

// Export singleton instance
export const knowledgeBase = KnowledgeBaseService.getInstance();
