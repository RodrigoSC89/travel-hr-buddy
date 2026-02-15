import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  GlowPulse,
  MagneticCard,
  FloatingElement,
} from '@/components/ui/animated-primitives';
import { motion } from 'framer-motion';
import { 
  Check, Crown, Zap, Building2, Ship, Users, Brain, Shield, Smartphone,
  Clock, FileText, BarChart3, Sparkles, ArrowRight, Play, Star,
  ChevronRight, Anchor, Globe, Award, Eye, Cpu, Radio,
  Navigation, Waves, Mic, ScanLine, Link2, ShieldCheck,
  TrendingUp, Target, Activity, Wifi, MapPin, Gauge,
  Container, Wrench, Stethoscope, GraduationCap, Calculator,
  Bell, Lock, Database, Headphones, LifeBuoy, Monitor
} from 'lucide-react';
import heroImage from '@/assets/landing-hero.jpg';

/* ─── PRICING ─── */
const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 497,
    isEnterprise: false,
    recommended: false,
    description: 'Para pequenas frotas e operações costeiras',
    limits: { vessels: 5, crew: 50 },
    modules: [
      'Gestão de Tripulação',
      'Controle de Ponto (PWA)',
      'Portal do Colaborador',
      'Dashboard Operacional',
      'Document Hub (básico)',
      'Alertas de Vencimento',
    ],
    extras: ['Suporte por email', 'Atualizações incluídas'],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 1297,
    isEnterprise: false,
    recommended: true,
    description: 'Para frotas médias com necessidades de compliance',
    limits: { vessels: 25, crew: 300 },
    modules: [
      'Tudo do Starter +',
      'Folha de Pagamento Marítima',
      'Compliance MLC 2006 & STCW',
      'IA Preditiva (Turnover & Riscos)',
      'People Analytics',
      'Academy (Treinamento & Certificações)',
      'Relatórios Avançados & BI',
      'OCR de Documentos com IA',
      'Escalas & Rotação Inteligente',
    ],
    extras: ['Suporte prioritário', 'Onboarding dedicado', 'SLA 99.5%'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    isEnterprise: true,
    recommended: false,
    description: 'Para grandes armadores e operadores offshore',
    limits: { vessels: 0, crew: 0 },
    modules: [
      'Tudo do Professional +',
      'Embarcações & Tripulantes ilimitados',
      'Multi-tenant (várias empresas)',
      'SSO / SAML / LDAP',
      'Auditoria Blockchain (imutável)',
      'IA Avançada com RAG personalizado',
      'White-label & Personalização total',
      'Integrações ERP (SAP, Oracle, TOTVS)',
    ],
    extras: ['Suporte 24/7', 'SLA 99.99%', 'Gerente de conta dedicado', 'Treinamento presencial'],
  },
];

/* ─── FEATURES GRID ─── */
const CORE_FEATURES = [
  { icon: Users, title: 'Gestão de Tripulação', desc: 'Cadastro completo, documentação digital, escalas e histórico de embarques' },
  { icon: Shield, title: 'Compliance Marítimo', desc: 'MLC 2006, STCW, MARPOL, SOLAS, ISM, ISPS — 12 auditorias com IA' },
  { icon: Brain, title: 'IA Preditiva', desc: '10+ agentes de IA: turnover, fadiga, manutenção, contratos e mais' },
  { icon: Calculator, title: 'Folha de Pagamento', desc: 'Cálculo automático de salários, férias, 13º e adicionais marítimos' },
  { icon: Wrench, title: 'Manutenção Preditiva', desc: 'IoT, digital twin 3D, CMMS integrado e predição de falhas' },
  { icon: MapPin, title: 'Rastreamento de Frota', desc: 'AIS em tempo real, weather intelligence e voyage P&L' },
  { icon: FileText, title: 'Documentos & OCR', desc: 'OCR com IA, versionamento, assinaturas digitais e templates' },
  { icon: GraduationCap, title: 'Academy & Treinamento', desc: 'LMS marítimo com certificações STCW e trilhas personalizadas' },
  { icon: Stethoscope, title: 'Saúde & Bem-estar', desc: 'Enfermaria digital, wearables IoT e preditor de fadiga STCW' },
  { icon: Mic, title: 'Voice Copilot', desc: 'Assistente por voz para comandos operacionais a bordo' },
  { icon: ScanLine, title: 'Computer Vision', desc: 'Detecção de defeitos em fotos e inspeção visual com IA' },
  { icon: Lock, title: 'Blockchain Audit', desc: 'Certificados imutáveis com SHA-256 e verificação de integridade' },
];

/* ─── DIFFERENTIATORS ─── */
const DIFFERENTIATORS = [
  { icon: Wifi, stat: '2 Mbps', label: 'Funciona em conexões marítimas de baixa velocidade' },
  { icon: Database, stat: '821+', label: 'Tabelas com RLS 100% — segurança enterprise' },
  { icon: Cpu, stat: '10+', label: 'Agentes de IA especializados em operações marítimas' },
  { icon: Monitor, stat: 'PWA', label: 'Offline-first — funciona sem internet a bordo' },
  { icon: Globe, stat: '40+', label: 'Módulos integrados — o mais completo do mundo' },
  { icon: Activity, stat: '< 3s', label: 'Time-to-Interactive mesmo em redes instáveis' },
];

const TESTIMONIALS = [
  { name: 'Carlos Silva', role: 'Gerente de RH', company: 'Navegação ABC', content: 'Reduzimos 70% do tempo com processos de DP depois do Nauti One. A IA de predição nos alertou sobre 3 desligamentos antes que acontecessem.', rating: 5 },
  { name: 'Marina Costa', role: 'Diretora de Operações', company: 'Offshore Brasil', content: 'O módulo de compliance nos preparou para auditorias PSC sem esforço. Passamos de 72% para 98% de score em 60 dias.', rating: 5 },
  { name: 'Roberto Santos', role: 'CEO', company: 'Petro Navegação', content: 'Economizamos 12 horas por inspeção com a geração automática de evidências. Nunca vi nada igual no mercado marítimo.', rating: 5 },
];

const TRUST_LOGOS = [
  'MLC 2006', 'STCW', 'MARPOL', 'SOLAS', 'ISM Code', 'ISPS', 'OCIMF', 'TMSA', 'LGPD',
];

const LandingPage = () => {
  const navigate = useNavigate();
  const tierIcons = { starter: Zap, pro: Crown, enterprise: Building2 };

  return (
    <>
      <Helmet>
        <title>Nauti One — #1 Maritime HR & Operations Platform with AI</title>
        <meta name="description" content="The world's most complete maritime management platform. 40+ modules, AI-powered compliance, crew management, predictive maintenance. Try free for 7 days." />
        <meta name="keywords" content="maritime HR, crew management, MLC 2006, STCW, maritime software, offshore, fleet management, predictive maintenance" />
        <meta property="og:title" content="Nauti One — #1 Maritime HR & Operations Platform" />
        <meta property="og:description" content="40+ integrated modules. AI-powered compliance. Offline-first PWA for maritime operations." />
        <link rel="canonical" href="https://nautione.com.br" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Nauti One",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Maritime HR & Operations Platform with AI",
          "offers": { "@type": "Offer", "price": "497", "priceCurrency": "BRL" }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* ═══ HEADER ═══ */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nauti One
              </span>
              <Badge variant="secondary" className="text-[10px] ml-1 hidden sm:inline-flex">v4.0</Badge>
            </div>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#differentiators" className="text-muted-foreground hover:text-foreground transition-colors">Why Nauti One</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/auth"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/20">
                  Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.header>

        {/* ═══ HERO ═══ */}
        <section className="relative py-20 md:py-28 px-4 overflow-hidden">
          <GlowPulse className="w-[600px] h-[600px] top-[-200px] right-[-100px]" />
          <GlowPulse className="w-[400px] h-[400px] bottom-[-100px] left-[-50px]" color="hsl(var(--accent))" />
          <FloatingElement className="absolute top-16 right-[8%] opacity-[0.04]" amplitude={20} duration={8}>
            <Ship className="h-40 w-40 text-primary" />
          </FloatingElement>

          <div className="container mx-auto max-w-6xl relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left — Copy */}
              <div>
                <ScrollReveal delay={0.1} direction="none">
                  <Badge className="mb-5 px-3 py-1.5 text-xs bg-primary/10 text-primary border-primary/20 gap-1.5">
                    <Sparkles className="h-3 w-3" /> #1 Maritime Platform — 40+ Modules
                  </Badge>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-[1.08] tracking-tight">
                    The Future of{' '}
                    <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                      Maritime Operations
                    </span>{' '}
                    is Here
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={0.35}>
                  <p className="text-lg text-muted-foreground mb-7 leading-relaxed max-w-xl">
                    Crew management, payroll, compliance, predictive maintenance, and AI — all in one platform. 
                    Built for maritime companies that refuse to compromise.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.45}>
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <Link to="/auth?mode=signup">
                      <Button size="lg" className="gap-2 text-base px-7 shadow-xl shadow-primary/25 group w-full sm:w-auto">
                        <Sparkles className="h-4 w-4" />
                        Start 7-Day Free Trial
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/demo">
                      <Button size="lg" variant="outline" className="gap-2 text-base px-7 w-full sm:w-auto">
                        <Play className="h-4 w-4" />
                        Watch Demo
                      </Button>
                    </Link>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.55}>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> No credit card required</span>
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Setup in 3 minutes</span>
                    <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Cancel anytime</span>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right — Hero Image */}
              <ScrollReveal delay={0.3} direction="none">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30">
                  <img 
                    src={heroImage} 
                    alt="Nauti One maritime command center dashboard" 
                    className="w-full h-auto"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex gap-2">
                      <Badge className="bg-success/90 text-success-foreground text-[10px]">
                        <Activity className="h-3 w-3 mr-1" /> Live Fleet Tracking
                      </Badge>
                      <Badge className="bg-primary/90 text-primary-foreground text-[10px]">
                        <Brain className="h-3 w-3 mr-1" /> AI Copilot Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Stats Bar */}
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16" staggerDelay={0.06}>
              {[
                { value: '500+', label: 'Vessels managed' },
                { value: '15000+', label: 'Active crew members' },
                { value: '99.9%', label: 'Guaranteed uptime' },
                { value: '70%', label: 'Time saved on HR ops' },
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

        {/* ═══ TRUST COMPLIANCE BAR ═══ */}
        <section className="py-6 px-4 border-y border-border/20 bg-muted/10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Compliance:</span>
              {TRUST_LOGOS.map((logo) => (
                <Badge key={logo} variant="outline" className="text-[10px] font-medium text-muted-foreground border-border/40">
                  <ShieldCheck className="h-3 w-3 mr-1 text-primary" /> {logo}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-14">
              <Badge className="mb-3">40+ Integrated Modules</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Everything your fleet needs. One platform.
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                From crew management to predictive maintenance, compliance to AI analytics — 
                the most comprehensive maritime platform ever built.
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" staggerDelay={0.04}>
              {CORE_FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <MagneticCard>
                    <Card className="hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                      <CardHeader className="pb-2">
                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/12 to-primary/4 w-fit mb-2">
                          <f.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-semibold">{f.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                      </CardContent>
                    </Card>
                  </MagneticCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ WHY NAUTI ONE ═══ */}
        <section id="differentiators" className="py-20 px-4 bg-muted/20 border-y border-border/20">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-14">
              <Badge className="mb-3" variant="secondary">Why Nauti One</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Built for the harsh realities of maritime
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                Not another generic SaaS. Engineered specifically for vessels, crew, and offshore operations.
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.07}>
              {DIFFERENTIATORS.map((d) => (
                <StaggerItem key={d.label}>
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/30 hover:border-primary/20 transition-colors">
                    <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                      <d.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary mb-0.5">{d.stat}</div>
                      <p className="text-sm text-muted-foreground">{d.label}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-14">
              <Badge className="mb-3">Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Plans for every fleet size
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                Start with a 7-day free trial. No credit card required. Cancel anytime.
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto" staggerDelay={0.1}>
              {PRICING_TIERS.map((tier) => {
                const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
                return (
                  <StaggerItem key={tier.id}>
                    <Card className={`relative flex flex-col h-full transition-all ${tier.recommended ? 'border-primary shadow-xl shadow-primary/10 scale-[1.03] z-10' : 'border-border/40 hover:border-primary/20'}`}>
                      {tier.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary shadow-lg text-xs">Most Popular</Badge>
                      )}
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-3 p-2.5 rounded-full bg-primary/10">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <CardDescription className="text-xs min-h-[32px]">{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center flex-1">
                        <div className="mb-4">
                          {tier.isEnterprise ? (
                            <span className="text-2xl font-bold">Custom</span>
                          ) : (
                            <div>
                              <span className="text-3xl font-bold">R$ {tier.price}</span>
                              <span className="text-muted-foreground text-sm">/mo</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {tier.limits.vessels ? `Up to ${tier.limits.vessels} vessels • ${tier.limits.crew} crew` : 'Unlimited'}
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
                            if (tier.isEnterprise) {
                              window.location.href = 'mailto:comercial@nautione.com.br?subject=Nauti Enterprise';
                            } else {
                              navigate('/auth?mode=signup');
                            }
                          }}
                        >
                          {tier.isEnterprise ? 'Talk to Sales' : 'Start Free Trial'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <ScrollReveal className="mt-10 text-center text-xs text-muted-foreground space-y-0.5">
              <p>✓ 7-day free trial on all plans  ✓ Cancel anytime  ✓ Secure payment via Stripe</p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section id="testimonials" className="py-20 px-4 bg-muted/20 border-y border-border/20">
          <div className="container mx-auto max-w-5xl">
            <ScrollReveal className="text-center mb-14">
              <Badge className="mb-3">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Trusted by maritime leaders</h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-5" staggerDelay={0.1}>
              {TESTIMONIALS.map((t) => (
                <StaggerItem key={t.name}>
                  <MagneticCard>
                    <Card className="h-full">
                      <CardContent className="pt-5">
                        <div className="flex gap-0.5 mb-3">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mb-5 italic leading-relaxed">"{t.content}"</p>
                        <div>
                          <div className="font-semibold text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.role} • {t.company}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </MagneticCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-20 px-4 relative overflow-hidden">
          <GlowPulse className="w-[500px] h-[500px] top-[-150px] left-[30%]" />
          <div className="container mx-auto max-w-3xl text-center relative">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                Ready to lead your fleet into the future?
              </h2>
              <p className="text-lg text-muted-foreground mb-7">
                Join 500+ vessels already managed on Nauti One. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 text-base px-8 shadow-xl shadow-primary/25 group">
                    <Sparkles className="h-4 w-4" />
                    Start 7-Day Free Trial
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 text-base px-8" asChild>
                  <a href="mailto:comercial@nautione.com.br">Talk to an Expert</a>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-border/20 py-10 px-4 bg-muted/10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Anchor className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold">Nauti One</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The world's most complete maritime HR & operations platform. AI-powered. Offline-first. Enterprise-ready.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Product</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
                  <li><Link to="/auth" className="hover:text-foreground transition-colors">Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Company</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                  <li><a href="mailto:comercial@nautione.com.br" className="hover:text-foreground transition-colors">Contact</a></li>
                  <li><Link to="/client-portal" className="hover:text-foreground transition-colors">Client Portal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Legal</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy (LGPD)</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
            <Separator className="mb-6" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Nauti One. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> EN / PT / ES / FR</span>
                <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> ISO 27001</span>
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> SOC 2</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
