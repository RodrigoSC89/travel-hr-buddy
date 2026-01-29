/**
 * 🏪 Integration Marketplace - Plugin Ecosystem
 * PATCH REVOLUTION v2.0
 * 
 * Loja de integrações e plugins de terceiros
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: AppCategory;
  developer: {
    id: string;
    name: string;
    website: string;
    verified: boolean;
  };
  
  // Visuals
  icon: string;
  screenshots: string[];
  
  // Pricing
  pricing: AppPricing;
  
  // Stats
  rating: number;
  reviewCount: number;
  installCount: number;
  
  // Technical
  version: string;
  lastUpdated: Date;
  permissions: string[];
  integrations: string[];
  
  // Status
  isVerified: boolean;
  isFeatured: boolean;
  isNew: boolean;
}

export type AppCategory = 
  | 'operations'
  | 'safety'
  | 'compliance'
  | 'hr'
  | 'finance'
  | 'analytics'
  | 'communication'
  | 'maintenance'
  | 'navigation'
  | 'iot'
  | 'ai'
  | 'other';

export interface AppPricing {
  type: 'free' | 'freemium' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly' | 'one_time';
  trialDays?: number;
  features?: string[];
}

export interface AppReview {
  id: string;
  appId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  helpful: number;
  response?: {
    content: string;
    respondedAt: Date;
  };
}

export interface InstalledApp {
  id: string;
  appId: string;
  organizationId: string;
  installedBy: string;
  installedAt: Date;
  status: 'active' | 'disabled' | 'pending_setup';
  configuration: Record<string, unknown>;
  subscription?: {
    plan: string;
    expiresAt: Date;
    autoRenew: boolean;
  };
}

export interface WebhookEndpoint {
  id: string;
  appId: string;
  organizationId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
}

// Featured marketplace apps (mock data - in production would come from DB)
const MARKETPLACE_APPS: MarketplaceApp[] = [
  {
    id: 'stormglass-weather',
    name: 'StormGlass Weather Pro',
    slug: 'stormglass-weather',
    description: 'Previsões meteorológicas precisas para rotas marítimas',
    longDescription: `
      Integre previsões meteorológicas de alta precisão diretamente em suas operações.
      - Previsões de 10 dias para qualquer coordenada
      - Dados de ondas, vento, temperatura e precipitação
      - Alertas automáticos de condições adversas
      - API de weather routing para otimização de rotas
    `,
    category: 'navigation',
    developer: {
      id: 'stormglass',
      name: 'Storm Glass AB',
      website: 'https://stormglass.io',
      verified: true,
    },
    icon: '🌊',
    screenshots: ['/screenshots/stormglass-1.png', '/screenshots/stormglass-2.png'],
    pricing: {
      type: 'freemium',
      price: 99,
      currency: 'USD',
      billingPeriod: 'monthly',
      trialDays: 14,
      features: ['500 API calls/day', 'Weather alerts', 'Route optimization'],
    },
    rating: 4.8,
    reviewCount: 127,
    installCount: 2450,
    version: '2.3.1',
    lastUpdated: new Date('2024-01-15'),
    permissions: ['read:vessels', 'read:voyages', 'write:alerts'],
    integrations: ['Voyage Planning', 'Fleet Tracking'],
    isVerified: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'marinetraffic-ais',
    name: 'MarineTraffic AIS',
    slug: 'marinetraffic-ais',
    description: 'Tracking AIS em tempo real para toda sua frota',
    longDescription: `
      Monitore a posição de todas as suas embarcações em tempo real.
      - Dados AIS atualizados a cada minuto
      - Histórico de posições por 12 meses
      - ETA automático baseado em velocidade
      - Detecção de desvios de rota
    `,
    category: 'operations',
    developer: {
      id: 'marinetraffic',
      name: 'MarineTraffic',
      website: 'https://marinetraffic.com',
      verified: true,
    },
    icon: '📡',
    screenshots: [],
    pricing: {
      type: 'subscription',
      price: 249,
      currency: 'USD',
      billingPeriod: 'monthly',
    },
    rating: 4.9,
    reviewCount: 312,
    installCount: 5200,
    version: '4.1.0',
    lastUpdated: new Date('2024-02-01'),
    permissions: ['read:vessels', 'write:positions', 'read:voyages'],
    integrations: ['Fleet Command', 'Digital Twin'],
    isVerified: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'dnv-compliance',
    name: 'DNV Compliance Suite',
    slug: 'dnv-compliance',
    description: 'Gestão automatizada de certificações e auditorias DNV',
    longDescription: `
      Mantenha todas as certificações DNV em conformidade.
      - Tracking de validade de certificados
      - Checklists de auditoria integrados
      - Notificações de renovação
      - Relatórios de conformidade
    `,
    category: 'compliance',
    developer: {
      id: 'dnv',
      name: 'DNV GL',
      website: 'https://dnv.com',
      verified: true,
    },
    icon: '✅',
    screenshots: [],
    pricing: {
      type: 'paid',
      price: 5000,
      currency: 'USD',
      billingPeriod: 'yearly',
    },
    rating: 4.7,
    reviewCount: 89,
    installCount: 890,
    version: '3.0.2',
    lastUpdated: new Date('2024-01-20'),
    permissions: ['read:vessels', 'read:certificates', 'write:audits'],
    integrations: ['PEOTRAM', 'Document Management'],
    isVerified: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'bunker-index',
    name: 'Bunker Index Pro',
    slug: 'bunker-index',
    description: 'Preços de bunker em tempo real de 400+ portos',
    longDescription: `
      Otimize seus custos de combustível com dados de mercado em tempo real.
      - Preços atualizados diariamente
      - Comparativo entre portos
      - Alertas de preço
      - Histórico e tendências
    `,
    category: 'operations',
    developer: {
      id: 'shipandbuker',
      name: 'Ship & Bunker',
      website: 'https://shipandbunker.com',
      verified: true,
    },
    icon: '⛽',
    screenshots: [],
    pricing: {
      type: 'subscription',
      price: 149,
      currency: 'USD',
      billingPeriod: 'monthly',
    },
    rating: 4.6,
    reviewCount: 156,
    installCount: 1890,
    version: '2.5.0',
    lastUpdated: new Date('2024-01-25'),
    permissions: ['read:vessels', 'read:voyages'],
    integrations: ['Bunker Planning', 'Market Oracle'],
    isVerified: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: 'crew-wellness-ai',
    name: 'Crew Wellness AI',
    slug: 'crew-wellness-ai',
    description: 'Monitoramento de bem-estar da tripulação com IA',
    longDescription: `
      Cuide da saúde mental e física da sua tripulação.
      - Análise de padrões de comportamento
      - Alertas de fadiga e estresse
      - Recomendações personalizadas
      - Integração com wearables
    `,
    category: 'hr',
    developer: {
      id: 'maritime-wellbeing',
      name: 'Maritime Wellbeing Co.',
      website: 'https://maritimewellbeing.com',
      verified: true,
    },
    icon: '💚',
    screenshots: [],
    pricing: {
      type: 'subscription',
      price: 5,
      currency: 'USD',
      billingPeriod: 'monthly',
      features: ['Per crew member pricing'],
    },
    rating: 4.8,
    reviewCount: 78,
    installCount: 670,
    version: '1.8.0',
    lastUpdated: new Date('2024-02-05'),
    permissions: ['read:crew', 'write:wellness', 'read:schedules'],
    integrations: ['Wellness Predictor', 'Gamification'],
    isVerified: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'carbon-credits',
    name: 'Carbon Credits Exchange',
    slug: 'carbon-credits',
    description: 'Compra e gestão de créditos de carbono',
    longDescription: `
      Compense suas emissões com créditos verificados.
      - Marketplace de créditos certificados
      - Cálculo automático de compensação
      - Certificados Verra e Gold Standard
      - Relatórios ESG automatizados
    `,
    category: 'compliance',
    developer: {
      id: 'green-maritime',
      name: 'Green Maritime Solutions',
      website: 'https://greenmaritime.io',
      verified: true,
    },
    icon: '🌱',
    screenshots: [],
    pricing: {
      type: 'free',
      features: ['Platform fee on transactions'],
    },
    rating: 4.4,
    reviewCount: 45,
    installCount: 320,
    version: '1.2.0',
    lastUpdated: new Date('2024-01-10'),
    permissions: ['read:vessels', 'read:emissions', 'write:offsets'],
    integrations: ['Carbon AI', 'ESG Reports'],
    isVerified: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: 'slack-integration',
    name: 'Slack Integration',
    slug: 'slack-integration',
    description: 'Notificações e comandos no Slack',
    longDescription: `
      Receba alertas e controle o sistema via Slack.
      - Notificações em tempo real
      - Comandos slash para consultas
      - Integração com canais específicos
      - Bot inteligente com IA
    `,
    category: 'communication',
    developer: {
      id: 'nauti-integrations',
      name: 'Nauti Integrations',
      website: 'https://nautione.com.br',
      verified: true,
    },
    icon: '💬',
    screenshots: [],
    pricing: {
      type: 'free',
    },
    rating: 4.5,
    reviewCount: 234,
    installCount: 3100,
    version: '2.0.0',
    lastUpdated: new Date('2024-02-10'),
    permissions: ['read:alerts', 'read:vessels', 'read:crew'],
    integrations: ['Notifications', 'Voice AI'],
    isVerified: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: 'predictive-maintenance',
    name: 'Predictive Maintenance AI',
    slug: 'predictive-maintenance',
    description: 'Previsão de falhas com machine learning',
    longDescription: `
      Antecipe problemas antes que aconteçam.
      - Modelos de ML treinados para equipamentos marítimos
      - Análise de sensores IoT
      - Recomendações de manutenção
      - ROI comprovado de 300%+
    `,
    category: 'maintenance',
    developer: {
      id: 'maritime-ai',
      name: 'Maritime AI Labs',
      website: 'https://maritimeai.com',
      verified: true,
    },
    icon: '🔧',
    screenshots: [],
    pricing: {
      type: 'subscription',
      price: 399,
      currency: 'USD',
      billingPeriod: 'monthly',
      trialDays: 30,
    },
    rating: 4.9,
    reviewCount: 67,
    installCount: 450,
    version: '3.1.0',
    lastUpdated: new Date('2024-02-08'),
    permissions: ['read:vessels', 'read:sensors', 'write:maintenance'],
    integrations: ['IoT Connector', 'Digital Twin'],
    isVerified: true,
    isFeatured: true,
    isNew: false,
  },
];

class MarketplaceEngine {
  
  // Get all apps
  getAllApps(): MarketplaceApp[] {
    return MARKETPLACE_APPS;
  }

  // Get featured apps
  getFeaturedApps(): MarketplaceApp[] {
    return MARKETPLACE_APPS.filter(app => app.isFeatured);
  }

  // Get new apps
  getNewApps(): MarketplaceApp[] {
    return MARKETPLACE_APPS.filter(app => app.isNew);
  }

  // Get apps by category
  getAppsByCategory(category: AppCategory): MarketplaceApp[] {
    return MARKETPLACE_APPS.filter(app => app.category === category);
  }

  // Search apps
  searchApps(query: string): MarketplaceApp[] {
    const q = query.toLowerCase();
    return MARKETPLACE_APPS.filter(app => 
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.category.includes(q) ||
      app.developer.name.toLowerCase().includes(q)
    );
  }

  // Get app by ID
  getAppById(appId: string): MarketplaceApp | undefined {
    return MARKETPLACE_APPS.find(app => app.id === appId);
  }

  // Get app by slug
  getAppBySlug(slug: string): MarketplaceApp | undefined {
    return MARKETPLACE_APPS.find(app => app.slug === slug);
  }

  // Install app
  async installApp(
    appId: string,
    organizationId: string,
    userId: string,
    configuration?: Record<string, unknown>
  ): Promise<InstalledApp> {
    const app = this.getAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    const installedApp: InstalledApp = {
      id: crypto.randomUUID(),
      appId,
      organizationId,
      installedBy: userId,
      installedAt: new Date(),
      status: 'pending_setup',
      configuration: configuration || {},
    };

    try {
      await supabase.from('installed_apps').insert({
        id: installedApp.id,
        app_id: appId,
        organization_id: organizationId,
        installed_by: userId,
        installed_at: installedApp.installedAt.toISOString(),
        status: installedApp.status,
        configuration: installedApp.configuration,
      });

      logger.info('App installed', { appId, organizationId });
    } catch (error) {
      logger.error('Failed to install app', error as Error);
      throw error;
    }

    return installedApp;
  }

  // Uninstall app
  async uninstallApp(
    appId: string,
    organizationId: string
  ): Promise<void> {
    try {
      await supabase
        .from('installed_apps')
        .delete()
        .eq('app_id', appId)
        .eq('organization_id', organizationId);

      // Also remove webhooks
      await supabase
        .from('app_webhooks')
        .delete()
        .eq('app_id', appId)
        .eq('organization_id', organizationId);

      logger.info('App uninstalled', { appId, organizationId });
    } catch (error) {
      logger.error('Failed to uninstall app', error as Error);
      throw error;
    }
  }

  // Get installed apps for organization
  async getInstalledApps(organizationId: string): Promise<InstalledApp[]> {
    const { data } = await supabase
      .from('installed_apps')
      .select('*')
      .eq('organization_id', organizationId);

    return (data || []).map(d => ({
      id: d.id,
      appId: d.app_id,
      organizationId: d.organization_id,
      installedBy: d.installed_by,
      installedAt: new Date(d.installed_at),
      status: d.status,
      configuration: d.configuration,
      subscription: d.subscription,
    }));
  }

  // Check if app is installed
  async isAppInstalled(appId: string, organizationId: string): Promise<boolean> {
    const { count } = await supabase
      .from('installed_apps')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId)
      .eq('organization_id', organizationId);

    return (count || 0) > 0;
  }

  // Update app configuration
  async updateAppConfiguration(
    appId: string,
    organizationId: string,
    configuration: Record<string, unknown>
  ): Promise<void> {
    await supabase
      .from('installed_apps')
      .update({
        configuration,
        status: 'active',
      })
      .eq('app_id', appId)
      .eq('organization_id', organizationId);
  }

  // Get app reviews
  async getAppReviews(appId: string): Promise<AppReview[]> {
    const { data } = await supabase
      .from('app_reviews')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    return (data || []).map(d => ({
      id: d.id,
      appId: d.app_id,
      userId: d.user_id,
      userName: d.user_name,
      rating: d.rating,
      title: d.title,
      content: d.content,
      createdAt: new Date(d.created_at),
      helpful: d.helpful,
      response: d.response,
    }));
  }

  // Submit review
  async submitReview(
    appId: string,
    userId: string,
    userName: string,
    rating: number,
    title: string,
    content: string
  ): Promise<AppReview> {
    const review: AppReview = {
      id: crypto.randomUUID(),
      appId,
      userId,
      userName,
      rating,
      title,
      content,
      createdAt: new Date(),
      helpful: 0,
    };

    await supabase.from('app_reviews').insert({
      id: review.id,
      app_id: appId,
      user_id: userId,
      user_name: userName,
      rating,
      title,
      content,
      created_at: review.createdAt.toISOString(),
      helpful: 0,
    });

    return review;
  }

  // Register webhook
  async registerWebhook(
    appId: string,
    organizationId: string,
    url: string,
    events: string[]
  ): Promise<WebhookEndpoint> {
    // Generate secret for HMAC signing
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secret = Array.from(secretBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const webhook: WebhookEndpoint = {
      id: crypto.randomUUID(),
      appId,
      organizationId,
      url,
      events,
      secret,
      isActive: true,
      failureCount: 0,
    };

    await supabase.from('app_webhooks').insert({
      id: webhook.id,
      app_id: appId,
      organization_id: organizationId,
      url,
      events,
      secret,
      is_active: true,
      failure_count: 0,
    });

    return webhook;
  }

  // Get available categories
  getCategories(): Array<{ id: AppCategory; name: string; icon: string; count: number }> {
    const categories: Array<{ id: AppCategory; name: string; icon: string }> = [
      { id: 'operations', name: 'Operações', icon: '⚓' },
      { id: 'safety', name: 'Segurança', icon: '🛡️' },
      { id: 'compliance', name: 'Compliance', icon: '✅' },
      { id: 'hr', name: 'RH & Tripulação', icon: '👥' },
      { id: 'finance', name: 'Financeiro', icon: '💰' },
      { id: 'analytics', name: 'Analytics', icon: '📊' },
      { id: 'communication', name: 'Comunicação', icon: '💬' },
      { id: 'maintenance', name: 'Manutenção', icon: '🔧' },
      { id: 'navigation', name: 'Navegação', icon: '🧭' },
      { id: 'iot', name: 'IoT & Sensores', icon: '📡' },
      { id: 'ai', name: 'Inteligência Artificial', icon: '🤖' },
      { id: 'other', name: 'Outros', icon: '📦' },
    ];

    return categories.map(cat => ({
      ...cat,
      count: MARKETPLACE_APPS.filter(app => app.category === cat.id).length,
    }));
  }

  // Get marketplace stats
  getMarketplaceStats(): {
    totalApps: number;
    totalInstalls: number;
    avgRating: number;
    verifiedApps: number;
    categories: number;
  } {
    const apps = MARKETPLACE_APPS;
    
    return {
      totalApps: apps.length,
      totalInstalls: apps.reduce((sum, app) => sum + app.installCount, 0),
      avgRating: apps.reduce((sum, app) => sum + app.rating, 0) / apps.length,
      verifiedApps: apps.filter(app => app.isVerified).length,
      categories: new Set(apps.map(app => app.category)).size,
    };
  }
}

export const marketplaceEngine = new MarketplaceEngine();
