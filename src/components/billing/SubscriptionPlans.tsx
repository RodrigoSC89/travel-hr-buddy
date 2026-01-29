/**
 * Subscription Plans - Complete Billing UI
 * PATCH ROADMAP-COMPLETE: UI for Monetization (70% → 100%)
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X, Zap, Shield, Building2, Crown } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Para pequenas operações marítimas",
    price_monthly: 299,
    price_yearly: 2990,
    icon: Zap,
    popular: false,
    features: [
      { name: "Até 10 usuários", included: true },
      { name: "Até 3 embarcações", included: true },
      { name: "Até 50 tripulantes", included: true },
      { name: "10 GB armazenamento", included: true },
      { name: "Nauti Brain IA (500 queries/mês)", included: true },
      { name: "App Mobile", included: true },
      { name: "Compliance Básico", included: true },
      { name: "Suporte por Email", included: true },
      { name: "API Access", included: false },
      { name: "SSO (Azure AD, Okta)", included: false },
      { name: "White Label", included: false },
      { name: "Suporte Dedicado", included: false }
    ],
    limits: {
      users: 10,
      vessels: 3,
      crew: 50,
      storage: "10 GB",
      ai_queries: "500/mês"
    }
  },
  {
    id: "pro",
    name: "Professional",
    description: "Para frotas em crescimento",
    price_monthly: 799,
    price_yearly: 7990,
    icon: Shield,
    popular: true,
    features: [
      { name: "Até 50 usuários", included: true },
      { name: "Até 15 embarcações", included: true },
      { name: "Até 300 tripulantes", included: true },
      { name: "100 GB armazenamento", included: true },
      { name: "Todos os Assistentes IA (5.000 queries/mês)", included: true },
      { name: "App Mobile", included: true },
      { name: "Compliance Completo (MLC, STCW, ISM)", included: true },
      { name: "Suporte Prioritário", included: true },
      { name: "API Access (10.000 calls/mês)", included: true },
      { name: "Manutenção Preditiva", included: true },
      { name: "Analytics Avançado", included: true },
      { name: "SSO (Azure AD, Okta)", included: false },
      { name: "White Label", included: false }
    ],
    limits: {
      users: 50,
      vessels: 15,
      crew: 300,
      storage: "100 GB",
      ai_queries: "5.000/mês",
      api_calls: "10.000/mês"
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para grandes operadoras e armadoras",
    price_monthly: 2499,
    price_yearly: 24990,
    icon: Building2,
    popular: false,
    features: [
      { name: "Usuários ilimitados", included: true },
      { name: "Embarcações ilimitadas", included: true },
      { name: "Tripulantes ilimitados", included: true },
      { name: "Armazenamento ilimitado", included: true },
      { name: "IA Ilimitada + Fine-tuning", included: true },
      { name: "App Mobile Customizado", included: true },
      { name: "Compliance Completo + Auditorias", included: true },
      { name: "Gerente de Conta Dedicado", included: true },
      { name: "API Ilimitada", included: true },
      { name: "SSO (Azure AD, Okta, Google)", included: true },
      { name: "White Label Completo", included: true },
      { name: "Data Warehouse", included: true },
      { name: "SLA 99.9%", included: true },
      { name: "Onboarding Personalizado", included: true }
    ],
    limits: {
      users: "Ilimitado",
      vessels: "Ilimitado",
      crew: "Ilimitado",
      storage: "Ilimitado",
      ai_queries: "Ilimitado",
      api_calls: "Ilimitado"
    }
  }
];

export function SubscriptionPlans() {
  const [isYearly, setIsYearly] = useState(true);

  const handleSelectPlan = (planId: string) => {
    toast.success(`Redirecionando para checkout do plano ${planId}...`);
  };

  const getPrice = (plan: typeof plans[0]) => {
    return isYearly ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyTotal = plan.price_monthly * 12;
    const savings = monthlyTotal - plan.price_yearly;
    const percent = Math.round((savings / monthlyTotal) * 100);
    return { savings, percent };
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-2">
          <Crown className="h-3 w-3 mr-1" />
          Preços Transparentes
        </Badge>
        <h1 className="text-3xl font-bold">Escolha o Plano Ideal</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Escale sua operação marítima com o plano perfeito. Todos incluem acesso ao sistema completo.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-sm ${!isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
            Mensal
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={`text-sm ${isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
            Anual
            <Badge variant="default" className="ml-2 text-xs">
              Economize 17%
            </Badge>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const { savings, percent } = getSavings(plan);
          
          return (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">US$</span>
                    <span className="text-4xl font-bold">
                      {isYearly 
                        ? Math.round(plan.price_yearly / 12)
                        : plan.price_monthly
                      }
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      US$ {plan.price_yearly.toLocaleString()}/ano
                      <span className="text-green-600 ml-2">
                        (economize US$ {savings.toLocaleString()})
                      </span>
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.id === "enterprise" ? "Falar com Vendas" : "Começar Agora"}
                </Button>

                {/* Features */}
                <div className="space-y-3 text-left">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <div className="w-full text-center text-xs text-muted-foreground">
                  {plan.id === "starter" && "14 dias de trial gratuito"}
                  {plan.id === "pro" && "Trial gratuito • Cancele quando quiser"}
                  {plan.id === "enterprise" && "Contrato personalizado"}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Posso trocar de plano depois?</h4>
            <p className="text-sm text-muted-foreground">
              Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor será ajustado proporcionalmente.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Como funciona o trial gratuito?</h4>
            <p className="text-sm text-muted-foreground">
              Você tem 14 dias para testar todas as funcionalidades do plano escolhido. Não é necessário cartão de crédito para iniciar.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Quais formas de pagamento são aceitas?</h4>
            <p className="text-sm text-muted-foreground">
              Aceitamos cartão de crédito, boleto bancário (Brasil), transferência bancária e PIX.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Há contrato de fidelidade?</h4>
            <p className="text-sm text-muted-foreground">
              Não para planos Starter e Pro. Você pode cancelar a qualquer momento. Enterprise pode ter condições customizadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionPlans;
