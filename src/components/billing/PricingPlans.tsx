/**
 * Pricing Plans Component - PROMPT 17
 * Exibição de planos de assinatura
 */

import React, { useState } from 'react';
import { Check, X, Zap, Building2, Rocket, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  subscriptionService, 
  SUBSCRIPTION_PLANS, 
  type SubscriptionPlan 
} from '@/lib/billing/subscription-service';

interface PricingPlansProps {
  currentPlanId?: string;
  onSelectPlan?: (plan: SubscriptionPlan, yearly: boolean) => void;
}

export function PricingPlans({ currentPlanId, onSelectPlan }: PricingPlansProps) {
  const [yearly, setYearly] = useState(true);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Zap className="h-6 w-6" />;
      case 'professional': return <Rocket className="h-6 w-6" />;
      case 'enterprise': return <Building2 className="h-6 w-6" />;
      case 'custom': return <Phone className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (plan.price_monthly === -1) return 'Custom';
    if (plan.price_monthly === 0) return 'Free';
    
    const price = yearly ? plan.price_yearly / 12 : plan.price_monthly;
    return subscriptionService.formatPrice(Math.round(price), plan.currency);
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (plan.price_monthly <= 0) return null;
    const savings = subscriptionService.calculateYearlySavings(plan.id);
    if (savings.savingsPercent > 0) {
      return `Save ${savings.savingsPercent}%`;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Toggle Yearly/Monthly */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className={cn(!yearly && 'font-semibold')}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={yearly}
          onCheckedChange={setYearly}
        />
        <Label htmlFor="billing-toggle" className={cn(yearly && 'font-semibold')}>
          Yearly
          <Badge variant="secondary" className="ml-2">Save up to 17%</Badge>
        </Label>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const isProfessional = plan.id === 'professional';
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                isProfessional && 'border-primary shadow-lg',
                isCurrentPlan && 'ring-2 ring-primary'
              )}
            >
              {isProfessional && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isProfessional ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    {isCurrentPlan && (
                      <Badge variant="outline" className="mt-1">Current Plan</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{getPrice(plan)}</span>
                    {plan.price_monthly > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  {yearly && getSavings(plan) && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {getSavings(plan)}
                    </p>
                  )}
                  {yearly && plan.price_yearly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Billed {subscriptionService.formatPrice(plan.price_yearly, plan.currency)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                {plan.limits.users !== -1 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Limits: {plan.limits.users} users • {plan.limits.vessels} vessels • {plan.limits.storage_gb} GB
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isProfessional ? 'default' : 'outline'}
                  disabled={isCurrentPlan}
                  onClick={() => onSelectPlan?.(plan, yearly)}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : plan.price_monthly === -1 
                      ? 'Contact Sales' 
                      : plan.price_monthly === 0 
                        ? 'Get Started' 
                        : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ or Trust Badges */}
      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include: 14-day free trial • No credit card required • Cancel anytime</p>
        <p className="mt-2">Questions? <a href="mailto:sales@nautione.com" className="text-primary hover:underline">Contact our sales team</a></p>
      </div>
    </div>
  );
}

export default PricingPlans;
