import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Zap, Building2, CreditCard, Loader2 } from 'lucide-react';
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
    starter: Zap,
    professional: Crown,
    enterprise: Building2,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
                <p className="text-muted-foreground">
                  Próxima renovação: {new Date(subscriptionEnd!).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button variant="outline" onClick={openCustomerPortal}>
                Gerenciar Assinatura
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => {
            const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
            const isCurrentPlan = currentTier?.id === tier.id;

            return (
              <Card
                key={tier.id}
                className={`relative ${tier.recommended ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {tier.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Recomendado
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="secondary" className="absolute -top-3 right-4">
                    Plano Atual
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{formatPrice(tier.priceMonthly)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>

                  <Separator className="mb-6" />

                  <ul className="space-y-3 text-left">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.recommended ? 'default' : 'outline'}
                    disabled={isLoading || isCurrentPlan}
                    onClick={() => createCheckout(tier.priceId)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      'Plano Ativo'
                    ) : isSubscribed ? (
                      'Fazer Upgrade'
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>Todos os planos incluem 14 dias de teste grátis.</p>
          <p>Cancele a qualquer momento sem compromisso.</p>
        </div>
      </div>
    </div>
  );
}
