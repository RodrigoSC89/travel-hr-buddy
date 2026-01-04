/**
 * Nautilus One Pricing Tiers
 * All prices in BRL (centavos)
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceId: string;
  productId: string;
  priceMonthly: number; // in cents
  features: string[];
  vesselLimit: number | null; // null = unlimited
  recommended?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para pequenas frotas e operações iniciais',
    priceId: 'price_1Slf3xAOyLwx0ssAF3W8S0JH',
    productId: 'prod_Tj7IL3o2MMqFUv',
    priceMonthly: 29900, // R$ 299,00
    vesselLimit: 5,
    features: [
      'Até 5 embarcações',
      'Gestão de tripulação básica',
      'Documentação digital',
      'Compliance MLC 2006',
      'Relatórios padrão',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para frotas médias com necessidades avançadas',
    priceId: 'price_1Slf5DAOyLwx0ssAgsD1Bjoa',
    productId: 'prod_Tj7J2F7AKu9anZ',
    priceMonthly: 79900, // R$ 799,00
    vesselLimit: 25,
    recommended: true,
    features: [
      'Até 25 embarcações',
      'Gestão de tripulação completa',
      'IA para análise de documentos',
      'PEOTRAM & PEO-DP',
      'Compliance STCW avançado',
      'Mapas marítimos em tempo real',
      'Relatórios personalizados',
      'Suporte prioritário',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solução completa para grandes operações',
    priceId: 'price_1Slf6UAOyLwx0ssAu7trbecd',
    productId: 'prod_Tj7LaAvHIWE95C',
    priceMonthly: 199900, // R$ 1.999,00
    vesselLimit: null,
    features: [
      'Embarcações ilimitadas',
      'IA completa com voice assistant',
      'API para integrações',
      'SLA dedicado 99.9%',
      'Multi-tenant completo',
      'Auditoria e blockchain',
      'White-label disponível',
      'Gerente de conta dedicado',
    ],
  },
];

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function getTierByProductId(productId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.productId === productId);
}

export function getTierById(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === tierId);
}
