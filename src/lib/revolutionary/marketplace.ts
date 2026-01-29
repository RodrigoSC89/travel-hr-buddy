/**
 * 🏪 Integration Marketplace - Plugin Ecosystem
 * PATCH REVOLUTION v2.0
 * 
 * Loja de integrações e plugins de terceiros
 * Versão simplificada sem dependências de banco de dados
 */

import { logger } from "@/lib/logger";

export interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: AppCategory;
  developer: { id: string; name: string; verified: boolean };
  icon: string;
  pricing: AppPricing;
  rating: number;
  reviewCount: number;
  installCount: number;
  version: string;
  isVerified: boolean;
  isFeatured: boolean;
}

export type AppCategory = 
  | 'operations' | 'safety' | 'compliance' | 'hr' 
  | 'finance' | 'analytics' | 'navigation' | 'ai';

export interface AppPricing {
  type: 'free' | 'freemium' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly';
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
}

export interface InstalledApp {
  id: string;
  appId: string;
  organizationId: string;
  installedAt: Date;
  status: 'active' | 'disabled';
  configuration: Record<string, unknown>;
}

// Mock apps catalog
const MOCK_APPS: MarketplaceApp[] = [
  {
    id: 'port-analytics',
    name: 'Port Analytics Pro',
    slug: 'port-analytics-pro',
    description: 'Análise avançada de performance portuária com IA',
    category: 'analytics',
    developer: { id: 'dev1', name: 'Maritime Labs', verified: true },
    icon: '📊',
    pricing: { type: 'subscription', price: 299, currency: 'USD', billingPeriod: 'monthly' },
    rating: 4.8,
    reviewCount: 234,
    installCount: 1250,
    version: '2.4.1',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'crew-scheduler',
    name: 'Crew Scheduler AI',
    slug: 'crew-scheduler-ai',
    description: 'Otimização inteligente de escalas de tripulação',
    category: 'hr',
    developer: { id: 'dev2', name: 'CrewTech Solutions', verified: true },
    icon: '👥',
    pricing: { type: 'subscription', price: 199, currency: 'USD', billingPeriod: 'monthly' },
    rating: 4.6,
    reviewCount: 156,
    installCount: 890,
    version: '3.1.0',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'weather-routing',
    name: 'Weather Routing Plus',
    slug: 'weather-routing-plus',
    description: 'Otimização de rotas baseada em condições climáticas',
    category: 'navigation',
    developer: { id: 'dev3', name: 'NaviWeather', verified: true },
    icon: '🌤️',
    pricing: { type: 'subscription', price: 399, currency: 'USD', billingPeriod: 'monthly' },
    rating: 4.9,
    reviewCount: 312,
    installCount: 2100,
    version: '4.0.2',
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'compliance-checker',
    name: 'Compliance Checker',
    slug: 'compliance-checker',
    description: 'Verificação automática de conformidade regulatória',
    category: 'compliance',
    developer: { id: 'dev4', name: 'RegTech Maritime', verified: true },
    icon: '✅',
    pricing: { type: 'freemium' },
    rating: 4.5,
    reviewCount: 89,
    installCount: 650,
    version: '1.8.3',
    isVerified: true,
    isFeatured: false,
  },
  {
    id: 'fuel-optimizer',
    name: 'Fuel Optimizer',
    slug: 'fuel-optimizer',
    description: 'Otimização de consumo de combustível',
    category: 'operations',
    developer: { id: 'dev5', name: 'EcoMarine', verified: true },
    icon: '⛽',
    pricing: { type: 'subscription', price: 449, currency: 'USD', billingPeriod: 'monthly' },
    rating: 4.7,
    reviewCount: 178,
    installCount: 980,
    version: '2.2.0',
    isVerified: true,
    isFeatured: false,
  },
  {
    id: 'safety-inspector',
    name: 'Safety Inspector AI',
    slug: 'safety-inspector-ai',
    description: 'Inspeções de segurança com visão computacional',
    category: 'safety',
    developer: { id: 'dev6', name: 'SafetyFirst Tech', verified: true },
    icon: '🛡️',
    pricing: { type: 'paid', price: 2499, currency: 'USD' },
    rating: 4.4,
    reviewCount: 67,
    installCount: 320,
    version: '1.5.0',
    isVerified: true,
    isFeatured: false,
  },
];

const MOCK_INSTALLED: InstalledApp[] = [
  {
    id: 'inst-1',
    appId: 'port-analytics',
    organizationId: 'org-1',
    installedAt: new Date('2024-01-15'),
    status: 'active',
    configuration: {},
  },
  {
    id: 'inst-2',
    appId: 'weather-routing',
    organizationId: 'org-1',
    installedAt: new Date('2024-02-20'),
    status: 'active',
    configuration: {},
  },
];

class MarketplaceEngine {
  // Search apps
  async searchApps(query: string): Promise<MarketplaceApp[]> {
    const lowerQuery = query.toLowerCase();
    return MOCK_APPS.filter(
      app => 
        app.name.toLowerCase().includes(lowerQuery) ||
        app.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Get apps by category
  async getAppsByCategory(category: AppCategory): Promise<MarketplaceApp[]> {
    return MOCK_APPS.filter(app => app.category === category);
  }

  // Get featured apps
  async getFeaturedApps(): Promise<MarketplaceApp[]> {
    return MOCK_APPS.filter(app => app.isFeatured);
  }

  // Get all apps
  async getAllApps(): Promise<MarketplaceApp[]> {
    return MOCK_APPS;
  }

  // Get app by ID
  async getAppById(appId: string): Promise<MarketplaceApp | null> {
    return MOCK_APPS.find(app => app.id === appId) || null;
  }

  // Get installed apps
  async getInstalledApps(): Promise<InstalledApp[]> {
    return MOCK_INSTALLED;
  }

  // Install app
  async installApp(appId: string): Promise<InstalledApp> {
    const app = MOCK_APPS.find(a => a.id === appId);
    if (!app) throw new Error('App not found');

    const installed: InstalledApp = {
      id: `inst-${Date.now()}`,
      appId,
      organizationId: 'org-1',
      installedAt: new Date(),
      status: 'active',
      configuration: {},
    };

    MOCK_INSTALLED.push(installed);
    logger.info('App installed', { appId });
    return installed;
  }

  // Uninstall app
  async uninstallApp(installedAppId: string): Promise<void> {
    const index = MOCK_INSTALLED.findIndex(a => a.id === installedAppId);
    if (index >= 0) {
      MOCK_INSTALLED.splice(index, 1);
      logger.info('App uninstalled', { installedAppId });
    }
  }

  // Get categories
  getCategories(): Array<{ id: AppCategory; name: string; icon: string }> {
    return [
      { id: 'operations', name: 'Operações', icon: '⚙️' },
      { id: 'safety', name: 'Segurança', icon: '🛡️' },
      { id: 'compliance', name: 'Compliance', icon: '✅' },
      { id: 'hr', name: 'RH', icon: '👥' },
      { id: 'finance', name: 'Financeiro', icon: '💰' },
      { id: 'analytics', name: 'Analytics', icon: '📊' },
      { id: 'navigation', name: 'Navegação', icon: '🧭' },
      { id: 'ai', name: 'IA', icon: '🤖' },
    ];
  }

  // Get app statistics
  async getMarketplaceStats(): Promise<{
    totalApps: number;
    totalInstalls: number;
    categories: number;
    avgRating: number;
  }> {
    const totalApps = MOCK_APPS.length;
    const totalInstalls = MOCK_APPS.reduce((sum, app) => sum + app.installCount, 0);
    const avgRating = MOCK_APPS.reduce((sum, app) => sum + app.rating, 0) / totalApps;

    return {
      totalApps,
      totalInstalls,
      categories: 8,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }
}

export const marketplaceEngine = new MarketplaceEngine();
