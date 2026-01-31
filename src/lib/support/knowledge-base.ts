import { logger } from '@/lib/logger';

/**
 * Knowledge Base Service
 * Simple in-memory knowledge base for support articles
 */

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  article_count: number;
}

export const KB_CATEGORIES: KBCategory[] = [
  { id: 'getting-started', name: 'Getting Started', description: 'Basic guides', icon: '🚀', article_count: 3 },
  { id: 'crew', name: 'Crew Management', description: 'Crew-related help', icon: '👥', article_count: 5 },
  { id: 'compliance', name: 'Compliance', description: 'Regulatory guides', icon: '📋', article_count: 4 },
  { id: 'technical', name: 'Technical', description: 'Technical support', icon: '⚙️', article_count: 2 },
];

const ARTICLES: KBArticle[] = [
  { id: '1', title: 'Welcome to Nauti One', content: 'Getting started with the maritime management system.', category: 'getting-started', tags: ['intro', 'basics'] },
  { id: '2', title: 'Managing Crew', content: 'How to add and manage crew members.', category: 'crew', tags: ['crew', 'management'] },
  { id: '3', title: 'MLC Compliance', content: 'Understanding MLC 2006 requirements.', category: 'compliance', tags: ['mlc', 'regulations'] },
];

export const knowledgeBase = {
  async getCategories(): Promise<KBCategory[]> {
    return KB_CATEGORIES;
  },

  async getArticlesByCategory(categoryId: string): Promise<KBArticle[]> {
    return ARTICLES.filter(a => a.category === categoryId);
  },

  async search(query: string): Promise<KBArticle[]> {
    const q = query.toLowerCase();
    return ARTICLES.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.content.toLowerCase().includes(q)
    );
  },

  async recordFeedback(articleId: string, helpful: boolean): Promise<void> {
    // Feedback recording - could be persisted to DB
    logger.debug(`Feedback for ${articleId}: ${helpful ? 'helpful' : 'not helpful'}`);
  },
};
