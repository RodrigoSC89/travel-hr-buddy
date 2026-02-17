/**
 * Landing Page - Features, Differentiators, Pricing, Testimonials, CTA
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ScrollReveal, StaggerContainer, StaggerItem, GlowPulse, MagneticCard,
} from "@/components/ui/animated-primitives";
import {
  Check, Crown, Zap, Building2, Users, Brain, Shield, MapPin, FileText,
  GraduationCap, Wrench, Stethoscope, Mic, ScanLine, Lock, Star,
  ChevronRight, Sparkles, ArrowRight, Wifi, Database, Cpu, Monitor,
  Globe, Activity, Calculator
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

export function PricingSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tierIcons = { starter: Zap, pro: Crown, enterprise: Building2 };
  const PRICING_TIERS = [
    { id: 'starter', name: 'Starter', price: 500, priceLabel: '/vessel/mo', isEnterprise: false, recommended: false, description: t('landing.pricing.starterDesc'), limits: { vessels: 10, crew: 100 }, modules: [t('landing.pricing.starterMod1'), t('landing.pricing.starterMod2'), t('landing.pricing.starterMod3'), t('landing.pricing.starterMod4'), t('landing.pricing.starterMod5'), t('landing.pricing.starterMod6')], extras: [t('landing.pricing.emailSupport'), t('landing.pricing.updatesIncluded')] },
    { id: 'pro', name: 'Professional', price: 1200, priceLabel: '/vessel/mo', isEnterprise: false, recommended: true, description: t('landing.pricing.proDesc'), limits: { vessels: 50, crew: 600 }, modules: [t('landing.pricing.allFromStarter'), t('landing.pricing.proMod1'), t('landing.pricing.proMod2'), t('landing.pricing.proMod3'), t('landing.pricing.proMod4'), t('landing.pricing.proMod5'), t('landing.pricing.proMod6'), t('landing.pricing.proMod7'), t('landing.pricing.proMod8')], extras: [t('landing.pricing.prioritySupport'), t('landing.pricing.dedicatedOnboarding'), t('landing.pricing.sla995')] },
    { id: 'enterprise', name: 'Enterprise', price: 0, priceLabel: '', isEnterprise: true, recommended: false, description: t('landing.pricing.enterpriseDesc'), limits: { vessels: 0, crew: 0 }, modules: [t('landing.pricing.allFromPro'), t('landing.pricing.entMod1'), t('landing.pricing.entMod2'), t('landing.pricing.entMod3'), t('landing.pricing.entMod4'), t('landing.pricing.entMod5'), t('landing.pricing.entMod6')], extras: [t('landing.pricing.support247'), t('landing.pricing.sla9999'), t('landing.pricing.dedicatedManager'), t('landing.pricing.onsiteTraining')] },
  ];
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal className="text-center mb-14">
          <Badge className="mb-3">{t('landing.nav.pricing')}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('landing.pricing.heading')}</h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">{t('landing.pricing.subheading')}</p>
        </ScrollReveal>
        <StaggerContainer className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto" staggerDelay={0.1}>
          {PRICING_TIERS.map((tier) => {
            const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
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
                      {tier.isEnterprise ? <span className="text-2xl font-bold">{t('landing.pricing.custom')}</span> : <div><span className="text-3xl font-bold">$ {tier.price.toLocaleString()}</span><span className="text-muted-foreground text-sm">{tier.priceLabel}</span></div>}
                      <p className="text-xs text-muted-foreground mt-1">{tier.limits.vessels ? t('landing.pricing.upTo', { vessels: tier.limits.vessels, crew: tier.limits.crew }) : t('landing.pricing.unlimited')}</p>
                    </div>
                    <Separator className="mb-3" />
                    <ul className="space-y-1.5 text-left mb-3">{tier.modules.map((mod, idx) => <li key={idx} className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /><span className="text-xs">{mod}</span></li>)}</ul>
                    <Separator className="mb-2" />
                    <ul className="space-y-1 text-left">{tier.extras.map((extra, idx) => <li key={idx} className="flex items-start gap-2"><Star className="h-3 w-3 text-warning shrink-0 mt-0.5" /><span className="text-[11px] text-muted-foreground">{extra}</span></li>)}</ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className={`w-full ${tier.recommended ? 'shadow-lg shadow-primary/20' : ''}`} variant={tier.recommended ? 'default' : 'outline'} onClick={() => { if (tier.isEnterprise) { window.location.href = 'mailto:comercial@nautione.com.br?subject=Nauti Enterprise'; } else { navigate('/auth?mode=signup'); } }}>
                      {tier.isEnterprise ? t('landing.pricing.talkToSales') : t('landing.hero.startTrial')}<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
        <ScrollReveal className="mt-10 text-center text-xs text-muted-foreground space-y-0.5"><p>{t('landing.pricing.trialNote')}</p></ScrollReveal>
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
            <Button size="lg" variant="outline" className="gap-2 text-base px-8" asChild><a href="mailto:comercial@nautione.com.br">{t('landing.cta.talkExpert')}</a></Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
