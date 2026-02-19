/**
 * Subscription & Pricing Page — SaaS Monetization
 * Per-vessel pricing with Stripe integration ready
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { toast } from "sonner";
import {
  Check, Star, Zap, Shield, Crown, Ship, Users,
  BarChart3, Headphones, Globe, Rocket, ArrowRight
} from "lucide-react";

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  vesselLimit: string;
  crewLimit: string;
  icon: React.ElementType;
  popular?: boolean;
  features: string[];
  color: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: 500,
    yearlyPrice: 5000,
    vesselLimit: "Até 10 navios",
    crewLimit: "Até 100 tripulantes",
    icon: Ship,
    color: "border-border",
    features: [
      "Crew Management completo",
      "Document Vault (500 docs)",
      "Compliance básico (ISM/MLC)",
      "Relatórios padrão",
      "Suporte por email",
      "1 usuário admin",
    ],
  },
  {
    name: "Professional",
    price: 1200,
    yearlyPrice: 12000,
    vesselLimit: "Até 50 navios",
    crewLimit: "Até 600 tripulantes",
    icon: Zap,
    popular: true,
    color: "border-primary ring-2 ring-primary/20",
    features: [
      "Tudo do Starter +",
      "10 Agentes IA especializados",
      "PMS com IoT & Running Hours",
      "Voyage P&L & TCE Analytics",
      "SIRE 2.0 / PEO-DP / PEOTRAM",
      "Spare Parts Marketplace",
      "Fleet Benchmarking anônimo",
      "API access",
      "Suporte prioritário 24/7",
      "10 usuários admin",
    ],
  },
  {
    name: "Enterprise",
    price: 0,
    yearlyPrice: 0,
    vesselLimit: "Ilimitado",
    crewLimit: "Ilimitado",
    icon: Crown,
    color: "border-warning/50 bg-gradient-to-b from-warning/5 to-transparent",
    features: [
      "Tudo do Professional +",
      "Digital Twin 3D",
      "Computer Vision (inspeções)",
      "Blockchain Audit Trail",
      "VR Training Platform",
      "Monte Carlo Simulation",
      "White-label & custom branding",
      "SSO / SAML / LDAP",
      "SLA 99.99% garantido",
      "Dedicated Success Manager",
      "On-premise deployment option",
      "Custom integrations",
    ],
  },
];

export default function SubscriptionPage() {
  const [yearly, setYearly] = useState(false);

  const handleSubscribe = (tier: PricingTier) => {
    if (tier.name === "Enterprise") {
      toast.info("Entre em contato: enterprise@nautione.ai");
    } else {
      toast.success(`Redirecionando para checkout — Plano ${tier.name}...`);
      // TODO: supabase.functions.invoke("create-checkout", { body: { tier: tier.name } })
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          Planos <span className="text-primary">Nauti One</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A plataforma marítima mais completa do mundo. Preço por navio, sem surpresas.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Label htmlFor="yearly" className="text-sm text-muted-foreground">Mensal</Label>
          <Switch id="yearly" checked={yearly} onCheckedChange={setYearly} />
          <Label htmlFor="yearly" className="text-sm text-muted-foreground">
            Anual <Badge variant="secondary" className="ml-1 text-[10px]">Economize 17%</Badge>
          </Label>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <Card key={tier.name} className={`relative ${tier.color} transition-shadow hover:shadow-lg`}>
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" /> Mais Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <tier.icon className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <CardDescription>{tier.vesselLimit} • {tier.crewLimit}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {tier.price > 0 ? (
                  <>
                    <span className="text-4xl font-bold">
                      ${yearly ? Math.round(tier.yearlyPrice / 12).toLocaleString() : tier.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">/navio/mês</span>
                    {yearly && (
                      <p className="text-xs text-success mt-1">
                        ${tier.yearlyPrice.toLocaleString()}/navio/ano
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">Sob consulta</span>
                )}
              </div>

              <ul className="space-y-2">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(tier)}
              >
                {tier.name === "Enterprise" ? "Falar com Vendas" : "Começar Agora"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Bottom Features */}
      <motion.div variants={fadeUp}>
        <Card className="border-primary/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-center mb-4">Todos os planos incluem</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "Segurança Enterprise (RLS + SHA-256)" },
                { icon: Globe, label: "PWA Offline-First (2Mbps)" },
                { icon: Headphones, label: "Suporte em Português" },
                { icon: BarChart3, label: "Dashboard em tempo real" },
                { icon: Rocket, label: "Updates automáticos" },
                { icon: Users, label: "Multi-tenant isolado" },
                { icon: Ship, label: "75+ módulos marítimos" },
                { icon: Star, label: "99.9% uptime SLA" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
