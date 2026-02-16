/**
 * Landing Page - Hero, Header, Stats sections
 */

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import {
  ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter,
  GlowPulse, FloatingElement,
} from "@/components/ui/animated-primitives";
import { motion } from "framer-motion";
import {
  Check, Ship, Brain, Sparkles, ArrowRight, Play, Anchor,
  Activity, Shield, ShieldCheck, Globe, Award
} from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";

interface LandingHeroProps {
  navigate: (path: string) => void;
}

const TRUST_LOGOS = ['MLC 2006', 'STCW', 'MARPOL', 'SOLAS', 'ISM Code', 'ISPS', 'OCIMF', 'TMSA', 'LGPD'];

export function LandingHeader({ navigate }: LandingHeroProps) {
  const { t } = useTranslation();
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Anchor className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Nauti One</span>
          <Badge variant="secondary" className="text-[10px] ml-1 hidden sm:inline-flex">v4.0</Badge>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.features')}</a>
          <a href="#differentiators" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.whyNautiOne')}</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.pricing')}</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.testimonials')}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Link to="/demo"><Button variant="outline" size="sm" className="gap-1.5"><Play className="h-3 w-3" /> Demo</Button></Link>
          <Link to="/auth"><Button variant="ghost" size="sm">{t('auth.login')}</Button></Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/20">{t('landing.hero.startTrial')} <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export function LandingHeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      <GlowPulse className="w-[600px] h-[600px] top-[-200px] right-[-100px]" />
      <GlowPulse className="w-[400px] h-[400px] bottom-[-100px] left-[-50px]" color="hsl(var(--accent))" />
      <FloatingElement className="absolute top-16 right-[8%] opacity-[0.04]" amplitude={20} duration={8}>
        <Ship className="h-40 w-40 text-primary" />
      </FloatingElement>
      <div className="container mx-auto max-w-6xl relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <ScrollReveal delay={0.1} direction="none">
              <Badge className="mb-5 px-3 py-1.5 text-xs bg-primary/10 text-primary border-primary/20 gap-1.5"><Sparkles className="h-3 w-3" /> {t('landing.hero.badge')}</Badge>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-[1.08] tracking-tight">
                {t('landing.hero.titlePart1')}{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">{t('landing.hero.titleHighlight')}</span>{' '}
                {t('landing.hero.titlePart2')}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.35}><p className="text-lg text-muted-foreground mb-7 leading-relaxed max-w-xl">{t('landing.hero.subtitle')}</p></ScrollReveal>
            <ScrollReveal delay={0.45}>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/auth?mode=signup"><Button size="lg" className="gap-2 text-base px-7 shadow-xl shadow-primary/25 group w-full sm:w-auto"><Sparkles className="h-4 w-4" />{t('landing.hero.startTrial')}<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
                <Link to="/demo"><Button size="lg" variant="outline" className="gap-2 text-base px-7 w-full sm:w-auto"><Play className="h-4 w-4" />{t('landing.hero.watchDemo')}</Button></Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.55}>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> {t('landing.hero.noCreditCard')}</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> {t('landing.hero.setup3min')}</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> {t('landing.hero.cancelAnytime')}</span>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.3} direction="none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30">
              <img src={heroImage} alt="Nauti One maritime command center dashboard" className="w-full h-auto" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2">
                  <Badge className="bg-success/90 text-success-foreground text-[10px]"><Activity className="h-3 w-3 mr-1" /> {t('landing.hero.liveTracking')}</Badge>
                  <Badge className="bg-primary/90 text-primary-foreground text-[10px]"><Brain className="h-3 w-3 mr-1" /> {t('landing.hero.aiActive')}</Badge>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16" staggerDelay={0.06}>
          {[
            { value: '500+', label: t('landing.stats.vessels') },
            { value: '15000+', label: t('landing.stats.crew') },
            { value: '99.9%', label: t('landing.stats.uptime') },
            { value: '70%', label: t('landing.stats.timeSaved') },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center p-5 rounded-xl bg-card/60 border border-border/30 backdrop-blur-sm">
                <AnimatedCounter value={stat.value} className="text-2xl md:text-3xl font-bold text-primary" duration={2} />
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function TrustBar() {
  const { t } = useTranslation();
  return (
    <section className="py-6 px-4 border-y border-border/20 bg-muted/10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('landing.compliance')}:</span>
          {TRUST_LOGOS.map((logo) => (
            <Badge key={logo} variant="outline" className="text-[10px] font-medium text-muted-foreground border-border/40">
              <ShieldCheck className="h-3 w-3 mr-1 text-primary" /> {logo}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/20 py-10 px-4 bg-muted/10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3"><Anchor className="h-5 w-5 text-primary" /><span className="text-lg font-bold">Nauti One</span></div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t('landing.footer.description')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('landing.footer.product')}</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">{t('landing.nav.features')}</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">{t('landing.nav.pricing')}</a></li>
              <li><Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">{t('auth.login')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('landing.footer.company')}</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t('landing.footer.about')}</Link></li>
              <li><a href="mailto:comercial@nautione.com.br" className="hover:text-foreground transition-colors">{t('landing.footer.contact')}</a></li>
              <li><Link to="/client-portal" className="hover:text-foreground transition-colors">{t('landing.footer.clientPortal')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('landing.footer.legal')}</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.terms')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.security')}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Nauti One. {t('landing.footer.rights')}</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> EN / PT / ES / FR</span>
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> ISO 27001</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> SOC 2</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
