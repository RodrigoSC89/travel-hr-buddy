/**
 * Landing Page - Features, Differentiators, Pricing, Testimonials, CTA
 */

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  ScrollReveal, StaggerContainer, StaggerItem, GlowPulse, MagneticCard,
} from "@/components/ui/animated-primitives";
import {
  Check, Crown, Zap, Building2, Users, Brain, Shield, MapPin, FileText,
  GraduationCap, Wrench, Stethoscope, Mic, ScanLine, Lock, Star,
  ChevronRight, Sparkles, ArrowRight, Wifi, Database, Cpu, Monitor,
  Globe, Activity, Calculator, X, TrendingDown, Ship, Anchor,
  BarChart3, Package, Play, ShieldCheck, Clock, Award, Minus,
  HeartHandshake, Landmark, RefreshCw
} from "lucide-react";

export function FeaturesSection() {
  const { t } = useTranslation();
  const CORE_FEATURES = [
    { icon: Users, title: t('landing.features.crewTitle'), desc: t('landing.features.crewDesc') },
    { icon: Shield, title: t('landing.features.complianceTitle'), desc: t('landing.features.complianceDesc') },
    { icon: Brain, title: t('landing.features.aiTitle'), desc: t('landing.features.aiDesc') },
    { icon: Calculator, title: t('landing.features.payrollTitle'), desc: t('landing.features.payrollDesc') },
    { icon: Wrench, title: t('landing.features.maintenanceTitle'), desc: t('landing.features.maintenanceDesc') },
    { icon: MapPin, title: t('landing.features.trackingTitle'), desc: t('landing.features.trackingDesc') },
    { icon: FileText, title: t('landing.features.docsTitle'), desc: t('landing.features.docsDesc') },
    { icon: GraduationCap, title: t('landing.features.academyTitle'), desc: t('landing.features.academyDesc') },
    { icon: Stethoscope, title: t('landing.features.healthTitle'), desc: t('landing.features.healthDesc') },
    { icon: Mic, title: t('landing.features.voiceTitle'), desc: t('landing.features.voiceDesc') },
    { icon: ScanLine, title: t('landing.features.visionTitle'), desc: t('landing.features.visionDesc') },
    { icon: Lock, title: t('landing.features.blockchainTitle'), desc: t('landing.features.blockchainDesc') },
  ];
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal className="text-center mb-14">
          <Badge className="mb-3">{t('landing.features.badge')}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('landing.features.heading')}</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">{t('landing.features.subheading')}</p>
        </ScrollReveal>
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" staggerDelay={0.04}>
          {CORE_FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <MagneticCard>
                <Card className="hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                  <CardHeader className="pb-2">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/12 to-primary/4 w-fit mb-2"><f.icon className="h-5 w-5 text-primary" /></div>
                    <CardTitle className="text-sm font-semibold">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p></CardContent>
                </Card>
              </MagneticCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function DifferentiatorsSection() {
  const { t } = useTranslation();
  const DIFFERENTIATORS = [
    { icon: Wifi, stat: '2 Mbps', label: t('landing.diff.lowBandwidth') },
    { icon: Database, stat: '821+', label: t('landing.diff.tables') },
    { icon: Cpu, stat: '10+', label: t('landing.diff.aiAgents') },
    { icon: Monitor, stat: 'PWA', label: t('landing.diff.offlineFirst') },
    { icon: Globe, stat: '40+', label: t('landing.diff.modules') },
    { icon: Activity, stat: '< 3s', label: t('landing.diff.tti') },
  ];
  return (
    <section id="differentiators" className="py-20 px-4 bg-muted/20 border-y border-border/20">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal className="text-center mb-14">
          <Badge className="mb-3" variant="secondary">{t('landing.nav.whyNautiOne')}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('landing.diff.heading')}</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">{t('landing.diff.subheading')}</p>
        </ScrollReveal>
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.07}>
          {DIFFERENTIATORS.map((d) => (
            <StaggerItem key={d.label}>
              <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/30 hover:border-primary/20 transition-colors">
                <div className="p-2.5 rounded-lg bg-primary/10 shrink-0"><d.icon className="h-5 w-5 text-primary" /></div>
                <div><div className="text-2xl font-bold text-primary mb-0.5">{d.stat}</div><p className="text-sm text-muted-foreground">{d.label}</p></div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Feature comparison matrix ──
const FEATURE_MATRIX = [
  { category: 'Core', features: [
    { name: 'Dashboard Command Center', trial: true, starter: true, pro: true, enterprise: true },
    { name: 'Crew Management', trial: 'basic', starter: true, pro: true, enterprise: true },
    { name: 'Document Center', trial: true, starter: true, pro: true, enterprise: true },
    { name: 'Compliance (ISM/MLC)', trial: 'basic', starter: true, pro: true, enterprise: true },
    { name: 'Alerts & Notifications', trial: true, starter: true, pro: true, enterprise: true },
  ]},
  { category: 'Operations', features: [
    { name: 'Fleet Management', trial: false, starter: true, pro: true, enterprise: true },
    { name: 'Voyage Estimation (TCE)', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'Berth Scheduling', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'Noon Reports AI', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'Trading & Risk (FFA)', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'STS / Barging Operations', trial: false, starter: false, pro: false, enterprise: true },
  ]},
  { category: 'Maintenance & Technical', features: [
    { name: 'PMS (Planned Maintenance)', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'IMPA Spare Parts', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'Trim & Propulsion AI', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'CBM (Condition-Based)', trial: false, starter: false, pro: false, enterprise: true },
  ]},
  { category: 'HR & Finance', features: [
    { name: 'Payroll Multi-currency', trial: false, starter: true, pro: true, enterprise: true },
    { name: 'Crew Scheduling (6-mo)', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'STCW Document Vault', trial: false, starter: true, pro: true, enterprise: true },
    { name: 'Invoice Auto-matching AI', trial: false, starter: false, pro: false, enterprise: true },
  ]},
  { category: 'Intelligence & ESG', features: [
    { name: 'AI Insights & Analytics', trial: false, starter: 'basic', pro: true, enterprise: true },
    { name: 'CII/EEXI/EU-ETS Carbon', trial: false, starter: false, pro: true, enterprise: true },
    { name: 'Weather Routing AI', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'Predictive Maintenance AI', trial: false, starter: false, pro: false, enterprise: true },
  ]},
  { category: 'Enterprise', features: [
    { name: 'ERP Connectors (SAP/Oracle)', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'SSO / SAML', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'API Developer Portal', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'Multi-region DR', trial: false, starter: false, pro: false, enterprise: true },
    { name: 'Dedicated Account Manager', trial: false, starter: false, pro: false, enterprise: true },
  ]},
];

// ── Add-ons ──
const ADDONS = [
  { name: 'Trading & Risk Module', price: 19, icon: BarChart3, desc: 'FFA/Hedging, VaR analysis, stress testing' },
  { name: 'AI Weather Routing', price: 15, icon: Globe, desc: 'Optimal routes with fuel savings up to 12%' },
  { name: 'Trim & Propulsion AI', price: 12, icon: Anchor, desc: 'Real-time trim optimization and RPM tuning' },
  { name: 'CBM Suite', price: 18, icon: Activity, desc: 'Vibration, oil analysis, condition monitoring' },
  { name: 'Invoice Auto-matching', price: 9, icon: FileText, desc: 'AI-powered PO-to-invoice reconciliation' },
  { name: 'Supplier Portal', price: 8, icon: Package, desc: 'Self-service portal for vendors & RFQs' },
];

const ANNUAL_DISCOUNT = 0.20;

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />;
  return <span className="text-[10px] font-medium text-warning mx-auto block text-center">{value}</span>;
}

export function PricingSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);
  const [vesselCount, setVesselCount] = useState([5]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const tierIcons = { trial: Activity, starter: Zap, pro: Crown, enterprise: Building2 };

  const getPrice = (base: number) => {
    if (base === 0) return 0;
    return isAnnual ? Math.round(base * (1 - ANNUAL_DISCOUNT)) : base;
  };

  const PRICING_TIERS = [
    { id: 'trial', name: 'Trial', price: 0, isTrial: true, isEnterprise: false, recommended: false, description: 'Teste grátis por 30 dias com 1 navio', limits: { vessels: 1, crew: 20 }, modules: ['Dashboard Command Center', 'Crew Management básico', 'Document Center', 'Compliance básico (ISM)', 'Alertas & Notificações', 'Suporte por email'], extras: ['Sem cartão de crédito', '30 dias grátis'] },
    { id: 'starter', name: 'Starter', price: 29, isEnterprise: false, isTrial: false, recommended: false, description: t('landing.pricing.starterDesc'), limits: { vessels: 10, crew: 100 }, modules: [t('landing.pricing.starterMod1'), t('landing.pricing.starterMod2'), t('landing.pricing.starterMod3'), t('landing.pricing.starterMod4'), t('landing.pricing.starterMod5'), t('landing.pricing.starterMod6')], extras: [t('landing.pricing.emailSupport'), t('landing.pricing.updatesIncluded')] },
    { id: 'pro', name: 'Professional', price: 59, isEnterprise: false, isTrial: false, recommended: true, description: t('landing.pricing.proDesc'), limits: { vessels: 50, crew: 600 }, modules: [t('landing.pricing.allFromStarter'), t('landing.pricing.proMod1'), t('landing.pricing.proMod2'), t('landing.pricing.proMod3'), t('landing.pricing.proMod4'), t('landing.pricing.proMod5'), t('landing.pricing.proMod6'), t('landing.pricing.proMod7'), t('landing.pricing.proMod8')], extras: [t('landing.pricing.prioritySupport'), t('landing.pricing.dedicatedOnboarding'), t('landing.pricing.sla995')] },
    { id: 'enterprise', name: 'Enterprise', price: 149, isEnterprise: true, isTrial: false, recommended: false, description: t('landing.pricing.enterpriseDesc'), limits: { vessels: 0, crew: 0 }, modules: [t('landing.pricing.allFromPro'), t('landing.pricing.entMod1'), t('landing.pricing.entMod2'), t('landing.pricing.entMod3'), t('landing.pricing.entMod4'), t('landing.pricing.entMod5'), t('landing.pricing.entMod6')], extras: [t('landing.pricing.support247'), t('landing.pricing.sla9999'), t('landing.pricing.dedicatedManager'), t('landing.pricing.onsiteTraining')] },
  ];

  const vessels = vesselCount[0];
  const addonsTotal = selectedAddons.reduce((sum, name) => {
    const addon = ADDONS.find(a => a.name === name);
    return sum + (addon?.price || 0);
  }, 0);

  const roiData = useMemo(() => {
    const proPrice = getPrice(59);
    const monthlyPerVessel = proPrice + getPrice(addonsTotal);
    const monthlyCost = monthlyPerVessel * vessels;
    const annualCost = monthlyCost * 12;
    const manualCostPerVessel = 950;
    const manualAnnual = manualCostPerVessel * vessels * 12;
    const savings = manualAnnual - annualCost;
    const savingsPercent = Math.round((savings / manualAnnual) * 100);
    return { monthlyPerVessel, monthlyCost, annualCost, savings, savingsPercent, manualAnnual };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vessels, addonsTotal, isAnnual]);

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <ScrollReveal className="text-center mb-10">
          <Badge className="mb-3">{t('landing.nav.pricing')}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('landing.pricing.heading')}</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">{t('landing.pricing.subheading')}</p>
        </ScrollReveal>

        {/* ── Billing toggle ── */}
        <ScrollReveal className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
          {isAnnual && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">Save 20%</Badge>}
        </ScrollReveal>

        {/* ── Pricing cards ── */}
        <StaggerContainer className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto" staggerDelay={0.1}>
          {PRICING_TIERS.map((tier) => {
            const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
            const displayPrice = getPrice(tier.price);
            return (
              <StaggerItem key={tier.id}>
                <Card className={`relative flex flex-col h-full transition-all ${tier.recommended ? 'border-primary shadow-xl shadow-primary/10 scale-[1.03] z-10' : 'border-border/40 hover:border-primary/20'}`}>
                  {tier.recommended && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary shadow-lg text-xs">{t('landing.pricing.mostPopular')}</Badge>}
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 p-2.5 rounded-full bg-primary/10"><Icon className="h-7 w-7 text-primary" /></div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-xs min-h-[32px]">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center flex-1">
                    <div className="mb-4">
                      {tier.isTrial ? (
                        <span className="text-3xl font-bold text-primary">FREE</span>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold">US$ {displayPrice}</span>
                          <span className="text-muted-foreground text-sm">/vessel/mo</span>
                          {isAnnual && tier.price > 0 && (
                            <div className="text-xs text-muted-foreground mt-0.5 line-through">US$ {tier.price}</div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {tier.isTrial ? '1 navio • 30 dias' : tier.limits.vessels ? t('landing.pricing.upTo', { vessels: tier.limits.vessels, crew: tier.limits.crew }) : t('landing.pricing.unlimited')}
                      </p>
                    </div>
                    <Separator className="mb-3" />
                    <ul className="space-y-1.5 text-left mb-3">
                      {tier.modules.map((mod, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-xs">{mod}</span>
                        </li>
                      ))}
                    </ul>
                    <Separator className="mb-2" />
                    <ul className="space-y-1 text-left">
                      {tier.extras.map((extra, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Star className="h-3 w-3 text-warning shrink-0 mt-0.5" />
                          <span className="text-[11px] text-muted-foreground">{extra}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className={`w-full ${tier.recommended ? 'shadow-lg shadow-primary/20' : ''}`}
                      variant={tier.recommended ? 'default' : 'outline'}
                      onClick={() => {
                        if (tier.isEnterprise) { window.location.href = 'mailto:comercial@nautione.com.br?subject=Nauti Enterprise'; }
                        else { navigate('/auth?mode=signup'); }
                      }}
                    >
                      {tier.isEnterprise ? t('landing.pricing.talkToSales') : tier.isTrial ? 'Começar Grátis' : t('landing.hero.startTrial')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {isAnnual && (
          <ScrollReveal className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">Billing anual. Preços mostrados com desconto de 20%.</p>
          </ScrollReveal>
        )}

        {/* ── Feature Comparison Table ── */}
        <ScrollReveal className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Comparativo Completo de Features</h3>
          <div className="overflow-x-auto rounded-xl border border-border/40 bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground w-[40%]">Feature</th>
                  <th className="text-center p-3 font-medium w-[15%]">Trial</th>
                  <th className="text-center p-3 font-medium w-[15%]">Starter</th>
                  <th className="text-center p-3 font-medium text-primary w-[15%]">Professional</th>
                  <th className="text-center p-3 font-medium w-[15%]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr className="bg-muted/10">
                      <td colSpan={5} className="p-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.category}</td>
                    </tr>
                    {group.features.map((feat) => (
                      <tr key={feat.name} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
                        <td className="p-2.5 px-3 text-xs">{feat.name}</td>
                        <td className="p-2.5"><FeatureCell value={feat.trial} /></td>
                        <td className="p-2.5"><FeatureCell value={feat.starter} /></td>
                        <td className="p-2.5 bg-primary/[0.02]"><FeatureCell value={feat.pro} /></td>
                        <td className="p-2.5"><FeatureCell value={feat.enterprise} /></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* ── Add-ons Section ── */}
        <ScrollReveal className="mt-16">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">Add-ons</Badge>
            <h3 className="text-2xl font-bold mb-2">Módulos Avulsos</h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Disponíveis para qualquer plano. Adicione apenas o que você precisa, por navio/mês.</p>
          </div>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto" staggerDelay={0.05}>
            {ADDONS.map((addon) => {
              const isSelected = selectedAddons.includes(addon.name);
              return (
                <StaggerItem key={addon.name}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border/40 hover:border-primary/20'}`}
                    onClick={() => setSelectedAddons(prev => isSelected ? prev.filter(n => n !== addon.name) : [...prev, addon.name])}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-primary/20' : 'bg-muted/50'}`}>
                        <addon.icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{addon.name}</span>
                          <Badge variant={isSelected ? 'default' : 'outline'} className="text-xs shrink-0">
                            +US$ {getPrice(addon.price)}/v/mo
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{addon.desc}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0 mt-1" />}
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </ScrollReveal>

        {/* ── ROI Calculator ── */}
        <ScrollReveal className="mt-16">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10">
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">ROI Calculator</CardTitle>
              <CardDescription>Veja quanto você economiza com o Nauti One vs. processos manuais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary" /> Número de navios
                  </label>
                  <Badge variant="outline" className="text-lg font-bold px-4">{vessels}</Badge>
                </div>
                <Slider
                  value={vesselCount}
                  onValueChange={setVesselCount}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 navio</span>
                  <span>100 navios</span>
                </div>
              </div>

              {selectedAddons.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground self-center mr-1">Add-ons selecionados:</span>
                  {selectedAddons.map(name => (
                    <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-muted/30 border border-border/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Custo Nauti One (anual)</p>
                  <p className="text-2xl font-bold text-primary">US$ {roiData.annualCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">US$ {roiData.monthlyPerVessel}/vessel/mo × {vessels}</p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Custo Manual (média indústria)</p>
                  <p className="text-2xl font-bold text-muted-foreground">US$ {roiData.manualAnnual.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">~US$ 950/vessel/mo × {vessels}</p>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Economia Anual</p>
                  <p className="text-2xl font-bold text-primary">US$ {roiData.savings.toLocaleString()}</p>
                  <p className="text-xs font-medium text-primary mt-1">↓ {roiData.savingsPercent}% de redução</p>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={() => navigate('/auth?mode=signup')} size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <Sparkles className="h-4 w-4" />
                  Começar a Economizar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal className="mt-10 text-center text-xs text-muted-foreground space-y-0.5">
          <p>{t('landing.pricing.trialNote')}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const { t } = useTranslation();
  const TESTIMONIALS = [
    { name: 'Carlos Silva', role: t('landing.testimonials.role1'), company: 'Navegação ABC', content: t('landing.testimonials.content1'), rating: 5 },
    { name: 'Marina Costa', role: t('landing.testimonials.role2'), company: 'Offshore Brasil', content: t('landing.testimonials.content2'), rating: 5 },
    { name: 'Roberto Santos', role: 'CEO', company: 'Petro Navegação', content: t('landing.testimonials.content3'), rating: 5 },
  ];
  return (
    <section id="testimonials" className="py-20 px-4 bg-muted/20 border-y border-border/20">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal className="text-center mb-14">
          <Badge className="mb-3">{t('landing.nav.testimonials')}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('landing.testimonials.heading')}</h2>
        </ScrollReveal>
        <StaggerContainer className="grid md:grid-cols-3 gap-5" staggerDelay={0.1}>
          {TESTIMONIALS.map((item) => (
            <StaggerItem key={item.name}>
              <MagneticCard>
                <Card className="h-full">
                  <CardContent className="pt-5">
                    <div className="flex gap-0.5 mb-3">{Array.from({ length: item.rating }).map((_, i) => <Star key={`star-${item.rating}-${i}`} className="h-4 w-4 fill-warning text-warning" />)}</div>
                    <p className="text-sm text-muted-foreground mb-5 italic leading-relaxed">"{item.content}"</p>
                    <div><div className="font-semibold text-sm">{item.name}</div><div className="text-xs text-muted-foreground">{item.role} • {item.company}</div></div>
                  </CardContent>
                </Card>
              </MagneticCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Competitor Comparison Section ──
const COMPETITOR_FEATURES = [
  { feature: 'Crew Management & HR', nautiOne: true, amos: true, veson: false, seaLogs: 'basic' },
  { feature: 'PMS (Planned Maintenance)', nautiOne: true, amos: true, veson: false, seaLogs: true },
  { feature: 'Compliance (MLC/ISM/ISPS)', nautiOne: true, amos: 'partial', veson: false, seaLogs: false },
  { feature: 'Voyage Estimation (TCE)', nautiOne: true, amos: false, veson: true, seaLogs: false },
  { feature: 'Trading & Risk (FFA/Hedging)', nautiOne: true, amos: false, veson: true, seaLogs: false },
  { feature: 'AI-Powered Analytics', nautiOne: true, amos: false, veson: 'basic', seaLogs: false },
  { feature: 'Multi-currency Payroll', nautiOne: true, amos: false, veson: false, seaLogs: false },
  { feature: 'CII/EEXI/EU-ETS Carbon', nautiOne: true, amos: false, veson: 'partial', seaLogs: false },
  { feature: 'Predictive Maintenance AI', nautiOne: true, amos: false, veson: false, seaLogs: false },
  { feature: 'Weather Routing AI', nautiOne: true, amos: false, veson: 'add-on', seaLogs: false },
  { feature: 'Offline-First PWA', nautiOne: true, amos: false, veson: false, seaLogs: true },
  { feature: 'Voice Copilot', nautiOne: true, amos: false, veson: false, seaLogs: false },
  { feature: 'Computer Vision (defects)', nautiOne: true, amos: false, veson: false, seaLogs: false },
  { feature: 'Blockchain Audit Trail', nautiOne: true, amos: false, veson: false, seaLogs: false },
  { feature: 'ERP Connectors (SAP/Oracle)', nautiOne: true, amos: true, veson: true, seaLogs: false },
  { feature: 'Self-service Trial', nautiOne: true, amos: false, veson: false, seaLogs: false },
  { feature: 'Starting Price', nautiOne: 'US$ 23/v', amos: '~US$ 500+/v', veson: 'Custom', seaLogs: 'US$ 35/v' },
];

function CompCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-3.5 w-3.5 text-destructive/40 mx-auto" />;
  return <span className="text-[10px] font-medium text-muted-foreground mx-auto block text-center">{value}</span>;
}

export function CompetitorComparisonSection() {
  return (
    <section id="comparison" className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal className="text-center mb-10">
          <Badge className="mb-3" variant="secondary">Benchmark</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Nauti One vs. The Competition</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">See how we stack up against global maritime software leaders</p>
        </ScrollReveal>
        <ScrollReveal>
          <div className="overflow-x-auto rounded-xl border border-border/40 bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground w-[36%]">Capability</th>
                  <th className="text-center p-3 font-bold text-primary w-[16%]">
                    <div className="flex flex-col items-center gap-0.5">
                      <Crown className="h-4 w-4 text-primary" />
                      Nauti One
                    </div>
                  </th>
                  <th className="text-center p-3 font-medium text-muted-foreground w-[16%]">AMOS</th>
                  <th className="text-center p-3 font-medium text-muted-foreground w-[16%]">Veson IMOS</th>
                  <th className="text-center p-3 font-medium text-muted-foreground w-[16%]">SeaLogs</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_FEATURES.map((row) => (
                  <tr key={row.feature} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
                    <td className="p-2.5 px-3 text-xs font-medium">{row.feature}</td>
                    <td className="p-2.5 bg-primary/[0.03]"><CompCell value={row.nautiOne} /></td>
                    <td className="p-2.5"><CompCell value={row.amos} /></td>
                    <td className="p-2.5"><CompCell value={row.veson} /></td>
                    <td className="p-2.5"><CompCell value={row.seaLogs} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Comparison based on publicly available data (Q1 2026). Feature availability may vary by plan.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Live Demo Section ──
export function LiveDemoSection() {
  return (
    <section id="live-demo" className="py-20 px-4 bg-muted/20 border-y border-border/20">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <Card className="border-primary/20 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="mb-4 w-fit" variant="secondary">Interactive Demo</Badge>
                <h2 className="text-3xl font-bold mb-3">Experimente Antes de Assinar</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Acesse o sandbox completo do Nauti One sem cadastro, sem cartão de crédito. 
                  Veja dashboards, gestão de tripulação, compliance e IA funcionando com dados reais simulados.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { icon: Play, text: 'Tour guiado em português' },
                    { icon: Clock, text: 'Acesso instantâneo em < 10 segundos' },
                    { icon: ShieldCheck, text: 'Sem login, sem dados pessoais' },
                    { icon: Ship, text: 'Dados de frota realistas pré-carregados' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/demo">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 group">
                      <Play className="h-4 w-4" />
                      Acessar Demo Grátis
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button size="lg" variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Criar Conta Trial
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 md:p-12 flex items-center justify-center">
                <div className="w-full max-w-sm space-y-4">
                  {[
                    { label: 'Fleet Dashboard', value: '12 navios ativos', icon: Ship },
                    { label: 'Compliance Score', value: '94.7%', icon: ShieldCheck },
                    { label: 'AI Insights', value: '23 ações sugeridas', icon: Brain },
                    { label: 'Crew On Board', value: '847 tripulantes', icon: Users },
                    { label: 'Carbon Tracking', value: 'CII Rating: B', icon: Globe },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-card/80 border border-border/30 backdrop-blur-sm">
                      <item.icon className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Guarantees & SLA Section ──
export function GuaranteesSection() {
  const GUARANTEES = [
    { icon: ShieldCheck, title: '99.95% Uptime SLA', desc: 'Garantia contratual de disponibilidade com créditos automáticos em caso de violação. Enterprise: 99.99%.', highlight: true },
    { icon: RefreshCw, title: '30-Day Money Back', desc: 'Não satisfeito? Devolvemos 100% do valor nos primeiros 30 dias, sem perguntas.', highlight: false },
    { icon: Lock, title: 'SOC 2 Type II Ready', desc: 'Infraestrutura projetada para conformidade SOC 2, com criptografia AES-256 em repouso e TLS 1.3 em trânsito.', highlight: false },
    { icon: HeartHandshake, title: 'No Lock-in', desc: 'Exporte todos os seus dados a qualquer momento em CSV/JSON. Seus dados são seus, sempre.', highlight: false },
    { icon: Landmark, title: 'LGPD & GDPR Compliant', desc: 'Processamento de dados em conformidade total com regulamentações brasileiras e europeias de privacidade.', highlight: false },
    { icon: Award, title: 'ISO 27001 Roadmap', desc: 'Em processo de certificação ISO 27001 para segurança da informação, com auditoria prevista para Q3 2026.', highlight: false },
  ];
  return (
    <section id="guarantees" className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal className="text-center mb-10">
          <Badge className="mb-3">Trust & Security</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Garantias que Empresas Enterprise Exigem</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">Segurança, compliance e garantias contratuais para operações marítimas críticas</p>
        </ScrollReveal>
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.06}>
          {GUARANTEES.map((g) => (
            <StaggerItem key={g.title}>
              <Card className={`h-full transition-all hover:shadow-md ${g.highlight ? 'border-primary/30 bg-primary/[0.02]' : 'border-border/40 hover:border-primary/20'}`}>
                <CardContent className="p-5">
                  <div className={`p-2.5 rounded-lg w-fit mb-3 ${g.highlight ? 'bg-primary/15' : 'bg-muted/50'}`}>
                    <g.icon className={`h-5 w-5 ${g.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{g.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Social Proof / Numbers Section ──
export function SocialProofSection() {
  const STATS = [
    { value: '40+', label: 'Módulos Integrados', icon: Cpu },
    { value: '821+', label: 'Tabelas de Dados', icon: Database },
    { value: '10+', label: 'Agentes AI Especializados', icon: Brain },
    { value: '6', label: 'Frameworks de Compliance', icon: Shield },
    { value: '15min', label: 'Time to First Value', icon: Clock },
    { value: '< 3s', label: 'Tempo de Carregamento', icon: Activity },
  ];
  const COMPLIANCE_BADGES = [
    'MLC 2006', 'STCW', 'ISM Code', 'ISPS Code', 'MARPOL', 'SOLAS',
    'OCIMF/OVID', 'SGSO (ANP)', 'PEO-DP', 'PEOTRAM', 'EU-ETS', 'CII/EEXI',
  ];
  return (
    <section id="social-proof" className="py-20 px-4 bg-muted/20 border-y border-border/20">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal className="text-center mb-10">
          <Badge className="mb-3" variant="secondary">By the Numbers</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Construído para Escala Global</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">A plataforma marítima mais completa do mercado, validada por padrões internacionais</p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12" staggerDelay={0.05}>
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="text-center p-4 rounded-xl bg-card border border-border/30">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal className="text-center">
          <h3 className="text-lg font-semibold mb-4">Frameworks & Regulamentações Suportadas</h3>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {COMPLIANCE_BADGES.map((badge) => (
              <Badge key={badge} variant="outline" className="text-xs px-3 py-1.5 border-primary/20 bg-primary/5 text-foreground">
                <ShieldCheck className="h-3 w-3 mr-1.5 text-primary" />
                {badge}
              </Badge>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <GlowPulse className="w-[500px] h-[500px] top-[-150px] left-[30%]" />
      <div className="container mx-auto max-w-3xl text-center relative">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-5">{t('landing.cta.heading')}</h2>
          <p className="text-lg text-muted-foreground mb-7">{t('landing.cta.subheading')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth?mode=signup"><Button size="lg" className="gap-2 text-base px-8 shadow-xl shadow-primary/25 group"><Sparkles className="h-4 w-4" />{t('landing.hero.startTrial')}<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
            <Link to="/demo"><Button size="lg" variant="outline" className="gap-2 text-base px-8"><Play className="h-4 w-4" />Demo Interativa</Button></Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}