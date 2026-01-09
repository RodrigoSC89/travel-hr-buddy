import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Zap, Building2, CreditCard, Loader2, Gift, ChevronRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PRICING_TIERS, formatPrice } from '@/lib/billing/pricing-tiers';
import { toast } from 'sonner';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const {
    isLoading,
    isSubscribed,
    currentTier,
    subscriptionEnd,
    createCheckout,
    openCustomerPortal,
    checkSubscription,
  } = useSubscription();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Assinatura realizada com sucesso!');
      checkSubscription();
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado');
    }
  }, [searchParams, checkSubscription]);

  const tierIcons = {
    free: Gift,
    starter: Zap,
    professional: Crown,
    enterprise: Building2,
  };

  const handleSubscribe = (tier: typeof PRICING_TIERS[0]) => {
    if (tier.isFree) {
      toast.success('Você já está no plano Free!');
      return;
    }
    if (tier.isEnterprise) {
      window.location.href = 'mailto:comercial@nautilusone.com.br?subject=Nautilus Enterprise';
      return;
    }
    createCheckout(tier.priceId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos Nautilus One</h1>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para sua operação marítima
          </p>
        </div>

        {isSubscribed && currentTier && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Sua Assinatura Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentTier.name}</p>
                {subscriptionEnd && (
                  <p className="text-muted-foreground">
                    Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={openCustomerPortal}>
                Gerenciar Assinatura
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => {
            const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
            const isCurrentPlan = currentTier?.id === tier.id;

            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col ${tier.recommended ? 'border-primary shadow-lg scale-105 z-10' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {tier.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                {tier.isFree && !isCurrentPlan && (
                  <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Grátis para sempre
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="outline" className="absolute -top-3 right-4 bg-background">
                    Plano Atual
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center flex-1">
                  <div className="mb-6">
                    {tier.isEnterprise ? (
                      <div>
                        <span className="text-3xl font-bold">Sob consulta</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">{formatPrice(tier.priceMonthly)}</span>
                        {!tier.isFree && <span className="text-muted-foreground">/mês</span>}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {tier.employeeLimit ? `Até ${tier.employeeLimit} colaboradores` : 'Colaboradores ilimitados'}
                    </p>
                  </div>

                  <Separator className="mb-6" />

                  <ul className="space-y-3 text-left">
                    {tier.features.slice(0, 7).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 7 && (
                      <li className="text-sm text-muted-foreground text-center">
                        + {tier.features.length - 7} funcionalidades
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    className="w-full"
                    variant={tier.recommended ? 'default' : 'outline'}
                    disabled={isLoading || isCurrentPlan}
                    onClick={() => handleSubscribe(tier)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      'Plano Ativo'
                    ) : tier.isFree ? (
                      'Começar Grátis'
                    ) : tier.isEnterprise ? (
                      'Falar com Vendas'
                    ) : isSubscribed ? (
                      'Fazer Upgrade'
                    ) : (
                      'Assinar Agora'
                    )}
                    {!isCurrentPlan && !isLoading && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>✓ 14 dias de teste grátis em todos os planos pagos</p>
          <p>✓ Cancele a qualquer momento sem compromisso</p>
          <p className="mt-4">
            Dúvidas? Entre em contato: <a href="mailto:comercial@nautilusone.com.br" className="text-primary hover:underline">comercial@nautilusone.com.br</a>
          </p>
        </div>
      </div>
    </div>
  );
}
