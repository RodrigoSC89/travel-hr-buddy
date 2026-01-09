/**
 * Nautilus One Pricing Tiers
 * All prices in BRL (centavos)
 * Updated: MVP Pricing Strategy (Jan 2026)
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceId: string;
  productId: string;
  priceMonthly: number; // in cents (0 = free)
  features: string[];
  employeeLimit: number | null; // null = unlimited
  vesselLimit?: number | null;
  recommended?: boolean;
  isFree?: boolean;
  isEnterprise?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Para microempresas e teste do sistema',
    priceId: '', // No Stripe checkout for free
    productId: '',
    priceMonthly: 0, // Grátis
    employeeLimit: 5,
    vesselLimit: 1,
    isFree: true,
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
    productId: 'prod_TlCZjXi65mykUJ',
    priceMonthly: 9900, // R$ 99,00
    employeeLimit: 30,
    vesselLimit: 3,
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
    productId: 'prod_TlCZGV0R8q7gd4',
    priceMonthly: 29900, // R$ 299,00
    employeeLimit: 150,
    vesselLimit: 15,
    recommended: true,
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
    productId: 'prod_Tj7LaAvHIWE95C',
    priceMonthly: 0, // Sob consulta
    employeeLimit: null,
    vesselLimit: null,
    isEnterprise: true,
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

export function formatPrice(cents: number, showFree = true): string {
  if (cents === 0 && showFree) return 'Grátis';
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

export function getFreeTier(): PricingTier {
  return PRICING_TIERS.find(tier => tier.isFree)!;
}

export function canUpgrade(currentTierId: string, targetTierId: string): boolean {
  const tierOrder = ['free', 'starter', 'professional', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTierId);
  const targetIndex = tierOrder.indexOf(targetTierId);
  return targetIndex > currentIndex;
}
