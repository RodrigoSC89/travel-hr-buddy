/**
 * Nauti One Pricing Tiers
 * Multi-currency support (BRL, USD, EUR)
 * Updated: v4.0.0 Roadmap Implementation
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceId: string;
  priceIdUSD?: string;
  priceIdEUR?: string;
  productId: string;
  priceMonthly: number; // in BRL cents (0 = free)
  priceMonthlyUSD?: number; // in USD cents
  priceMonthlyEUR?: number; // in EUR cents
  features: string[];
  employeeLimit: number | null; // null = unlimited
  vesselLimit?: number | null;
  recommended?: boolean;
  isFree?: boolean;
  isEnterprise?: boolean;
  trialDays?: number;
}

export type Currency = 'BRL' | 'USD' | 'EUR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  BRL: 'Real Brasileiro',
  USD: 'US Dollar',
  EUR: 'Euro',
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Para microempresas e teste do sistema',
    priceId: '',
    productId: '',
    priceMonthly: 0,
    priceMonthlyUSD: 0,
    priceMonthlyEUR: 0,
    employeeLimit: 5,
    vesselLimit: 1,
    isFree: true,
    trialDays: 0,
    features: [
      'Até 5 colaboradores',
      '1 embarcação',
      'Cadastro de tripulação',
      'Controle de ponto básico',
      'Portal do colaborador (PWA)',
      'Holerite digital',
      'Suporte por email',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para pequenas empresas em crescimento',
    priceId: 'price_1SngA4AOyLwx0ssAHfYecvhF',
    priceIdUSD: 'price_starter_usd', // Placeholder - create in Stripe
    priceIdEUR: 'price_starter_eur', // Placeholder - create in Stripe
    productId: 'prod_TlCZjXi65mykUJ',
    priceMonthly: 9900, // R$ 99,00
    priceMonthlyUSD: 1900, // $19.00
    priceMonthlyEUR: 1700, // €17.00
    employeeLimit: 30,
    vesselLimit: 3,
    trialDays: 14,
    features: [
      'Até 30 colaboradores',
      'Até 3 embarcações',
      'Gestão de tripulação completa',
      'Folha de pagamento',
      'Férias e 13º automáticos',
      'Compliance MLC 2006',
      'Documentação digital',
      'Relatórios padrão',
      'Suporte prioritário',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Solução completa com IA para PMEs',
    priceId: 'price_1SngAmAOyLwx0ssAFTSUkEJV',
    priceIdUSD: 'price_professional_usd',
    priceIdEUR: 'price_professional_eur',
    productId: 'prod_TlCZGV0R8q7gd4',
    priceMonthly: 29900, // R$ 299,00
    priceMonthlyUSD: 5900, // $59.00
    priceMonthlyEUR: 5400, // €54.00
    employeeLimit: 150,
    vesselLimit: 15,
    recommended: true,
    trialDays: 14,
    features: [
      'Até 150 colaboradores',
      'Até 15 embarcações',
      'Tudo do Starter +',
      '🤖 IA: Predição de Turnover',
      '🤖 IA: Chatbot HR 24/7',
      '🤖 IA: OCR de Documentos',
      'Admissão 100% digital',
      'Avaliação de desempenho',
      'People Analytics avançado',
      'STCW & PEOTRAM',
      'Mapas marítimos',
      'API básica',
      'Gerente de sucesso',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Sob medida para grandes operações',
    priceId: 'price_1Slf6UAOyLwx0ssAu7trbecd',
    priceIdUSD: 'price_enterprise_usd',
    priceIdEUR: 'price_enterprise_eur',
    productId: 'prod_Tj7LaAvHIWE95C',
    priceMonthly: 0, // Sob consulta
    priceMonthlyUSD: 0,
    priceMonthlyEUR: 0,
    employeeLimit: null,
    vesselLimit: null,
    isEnterprise: true,
    trialDays: 30,
    features: [
      'Colaboradores ilimitados',
      'Embarcações ilimitadas',
      'Tudo do Professional +',
      '🤖 IA completa com voice assistant',
      'API full + webhooks',
      'SSO / SAML',
      'SLA dedicado 99.9%',
      'Multi-tenant completo',
      'Auditoria blockchain',
      'White-label disponível',
      'Integração SAP/TOTVS',
      'Gerente de conta dedicado',
      'Onboarding personalizado',
    ],
  },
];

export const getTierById = (id: string): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => tier.id === id);
};

export const getTierByProductId = (productId: string): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => tier.productId === productId);
};

export const formatPrice = (cents: number, currency: Currency = 'BRL'): string => {
  const value = cents / 100;
  const symbol = CURRENCY_SYMBOLS[currency];
  
  if (cents === 0) return 'Grátis';
  
  return `${symbol} ${value.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getPriceForCurrency = (tier: PricingTier, currency: Currency): number => {
  switch (currency) {
    case 'USD':
      return tier.priceMonthlyUSD || tier.priceMonthly;
    case 'EUR':
      return tier.priceMonthlyEUR || tier.priceMonthly;
    default:
      return tier.priceMonthly;
  }
};

export const getPriceIdForCurrency = (tier: PricingTier, currency: Currency): string => {
  switch (currency) {
    case 'USD':
      return tier.priceIdUSD || tier.priceId;
    case 'EUR':
      return tier.priceIdEUR || tier.priceId;
    default:
      return tier.priceId;
  }
};
