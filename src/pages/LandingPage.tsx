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
  ChevronRight, Anchor, Globe, Award, Gift
} from 'lucide-react';

const PRICING_TIERS = [
  { id: 'starter', name: 'Starter', price: 297, priceMonthly: 297, isFree: false, isEnterprise: false, recommended: false, description: 'Para pequenas frotas', employeeLimit: 30, features: ['Até 3 embarcações', 'Até 30 colaboradores', 'Dashboard básico', 'Suporte por email', '7 dias grátis para testar'] },
  { id: 'pro', name: 'Professional', price: 697, priceMonthly: 697, isFree: false, isEnterprise: false, recommended: true, description: 'Para operações em crescimento', employeeLimit: 150, features: ['Até 25 embarcações', 'Até 150 colaboradores', 'IA Completa', 'People Analytics', 'API Access', 'Suporte prioritário', 'Compliance MLC', 'Relatórios avançados', '7 dias grátis para testar'] },
  { id: 'enterprise', name: 'Enterprise', price: 0, priceMonthly: 0, isFree: false, isEnterprise: true, recommended: false, description: 'Para grandes frotas', employeeLimit: 0, features: ['Embarcações ilimitadas', 'Colaboradores ilimitados', 'IA Completa', 'SLA Dedicado', 'API completa', 'Suporte 24/7', 'White-label', 'On-premise disponível', '7 dias grátis para testar'] },
];
const formatPrice = (price: number) => `R$ ${price}`;

const LandingPage = () => {
  const navigate = useNavigate();

  const tierIcons = { starter: Zap, pro: Crown, enterprise: Building2 };

  const features = [
    { icon: Users, title: 'Gestão de Tripulação', description: 'Cadastro completo, documentação digital e histórico de embarques' },
    { icon: Clock, title: 'Controle de Ponto', description: 'Marcação via PWA com geolocalização e validação automática' },
    { icon: FileText, title: 'Folha de Pagamento', description: 'Cálculo automático de salários, férias, 13º e adicionais marítimos' },
    { icon: Brain, title: 'IA Preditiva', description: 'Predição de turnover, chatbot HR 24/7 e OCR de documentos' },
    { icon: Shield, title: 'Compliance Total', description: 'MLC 2006, STCW, PEOTRAM e normas da Marinha do Brasil' },
    { icon: Smartphone, title: 'PWA Mobile', description: 'Portal do colaborador offline-first para qualquer dispositivo' },
  ];

  const testimonials = [
    { name: 'Carlos Silva', role: 'Gerente de RH', company: 'Navegação ABC', content: 'Reduzimos 70% do tempo com processos de DP depois do Nauti One.', rating: 5 },
    { name: 'Marina Costa', role: 'Diretora de Operações', company: 'Offshore Brasil', content: 'A IA de predição de turnover nos ajudou a reter talentos críticos.', rating: 5 },
    { name: 'Roberto Santos', role: 'CEO', company: 'Petro Navegação', content: 'Compliance MLC nunca foi tão simples. Recomendo fortemente.', rating: 5 },
  ];

  const stats = [
    { value: '500+', label: 'Embarcações gerenciadas' },
    { value: '15000+', label: 'Tripulantes ativos' },
    { value: '99.9%', label: 'Uptime garantido' },
    { value: '70%', label: 'Redução de tempo DP' },
  ];

  return (
    <>
      <Helmet>
        <title>Nauti One - Sistema de RH Marítimo com IA | Gestão de Tripulação</title>
        <meta name="description" content="Sistema completo de RH marítimo com IA. Gestão de tripulação, folha de pagamento, compliance MLC 2006 e STCW. Teste grátis por 7 dias!" />
        <meta name="keywords" content="RH marítimo, gestão tripulação, folha pagamento marítimo, MLC 2006, STCW, software marítimo, offshore" />
        <meta property="og:title" content="Nauti One - Sistema de RH Marítimo com IA" />
        <meta property="og:description" content="Gestão completa de tripulação, folha de pagamento e compliance para empresas marítimas." />
        <link rel="canonical" href="https://nautione.com.br" />
      </Helmet>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl"
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nauti One
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Funcionalidades</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Preços</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Depoimentos</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/auth"><Button variant="ghost">Entrar</Button></Link>
              <Link to="/auth?mode=signup">
                <Button className="gap-2 shadow-lg shadow-primary/20">
                   Testar 7 Dias Grátis <ArrowRight className="h-4 w-4" />
                 </Button>
               </Link>
             </div>
           </div>
         </motion.header>

        {/* Hero Section */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <GlowPulse className="w-[600px] h-[600px] top-[-200px] right-[-100px]" />
          <GlowPulse className="w-[400px] h-[400px] bottom-[-100px] left-[-50px]" color="hsl(var(--accent))" />
          <FloatingElement className="absolute top-20 right-[10%] opacity-5" amplitude={18} duration={7}>
            <Ship className="h-32 w-32 text-primary" />
          </FloatingElement>

          <div className="container mx-auto text-center max-w-5xl relative">
            <ScrollReveal delay={0.1} direction="none">
              <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                ✨ Novo: IA para Predição de Turnover
              </Badge>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
                RH Marítimo com{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Inteligência Artificial
                </span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={0.4}>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Gestão completa de tripulação, folha de pagamento, compliance e muito mais.
                Reduza 70% do tempo com processos de DP e mantenha sua frota em conformidade.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.5}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                 <Link to="/auth?mode=signup">
                   <Button size="lg" className="gap-2 text-lg px-8 shadow-xl shadow-primary/25 group">
                     <Sparkles className="h-5 w-5" />
                     Testar 7 Dias Grátis
                     <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </Button>
                 </Link>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 backdrop-blur-sm">
                  <Play className="h-5 w-5" />
                  Ver Demo
                </Button>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.08}>
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center p-6 rounded-xl bg-card/50 border border-border/40 backdrop-blur-sm">
                    <AnimatedCounter value={stat.value} className="text-3xl font-bold text-primary" duration={2} />
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 bg-muted/20 border-y border-border/30">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-16">
              <Badge className="mb-4">Funcionalidades</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tudo que você precisa para gerenciar sua tripulação
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Do cadastro ao compliance, passando pela folha de pagamento e IA preditiva
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <MagneticCard>
                    <Card className="hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full">
                      <CardHeader>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 w-fit mb-3">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </MagneticCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <ScrollReveal className="text-center mb-16">
              <Badge className="mb-4">Preços</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Planos para todos os tamanhos de operação
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Teste grátis por 7 dias. Todos os planos incluem período de avaliação sem compromisso.
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.1}>
              {PRICING_TIERS.map((tier) => {
                const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
                return (
                  <StaggerItem key={tier.id}>
                    <Card className={`relative flex flex-col h-full ${tier.recommended ? 'border-primary shadow-xl shadow-primary/10 scale-105 z-10' : 'border-border/40'}`}>
                      {tier.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary shadow-lg">Mais Popular</Badge>
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
                            <span className="text-3xl font-bold">Sob consulta</span>
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
                            <li key={`feat-${idx}-${feature.slice(0, 15)}`} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                          {tier.features.length > 7 && (
                            <li className="text-sm text-muted-foreground text-center">+ {tier.features.length - 7} funcionalidades</li>
                          )}
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
                          {tier.isEnterprise ? 'Falar com Vendas' : 'Testar 7 Dias Grátis'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <ScrollReveal className="mt-12 text-center text-muted-foreground">
              <p>✓ 7 dias de teste grátis em todos os planos</p>
              <p>✓ Cancele a qualquer momento sem compromisso</p>
              <p>✓ Pagamento seguro via Stripe</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-4 bg-muted/20 border-y border-border/30">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-16">
              <Badge className="mb-4">Depoimentos</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.12}>
              {testimonials.map((testimonial) => (
                <StaggerItem key={testimonial.name}>
                  <MagneticCard>
                    <Card className="bg-card h-full">
                      <CardContent className="pt-6">
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={`star-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </MagneticCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <GlowPulse className="w-[500px] h-[500px] top-[-150px] left-[30%]" />
          <div className="container mx-auto max-w-4xl text-center relative">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para modernizar seu RH marítimo?
              </h2>
               <p className="text-xl text-muted-foreground mb-8">
                 Teste grátis por 7 dias. Sem compromisso, cancele quando quiser.
               </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link to="/auth?mode=signup">
                   <Button size="lg" className="gap-2 text-lg px-8 shadow-xl shadow-primary/25 group">
                     <Sparkles className="h-5 w-5" />
                     Testar 7 Dias Grátis
                     <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </Button>
                 </Link>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8" asChild>
                  <a href="mailto:comercial@nautione.com.br">Falar com Especialista</a>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 py-12 px-4 bg-muted/10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Anchor className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Nauti One</span>
                </div>
                <p className="text-sm text-muted-foreground">Sistema de RH Marítimo com IA. Gestão completa de tripulação e compliance.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition-colors">Preços</a></li>
                  <li><Link to="/auth" className="hover:text-foreground transition-colors">Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/about" className="hover:text-foreground transition-colors">Sobre</Link></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="mailto:comercial@nautione.com.br" className="hover:text-foreground transition-colors">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacidade (LGPD)</a></li>
                </ul>
              </div>
            </div>
            <Separator className="mb-8" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Nauti One. Todos os direitos reservados.</p>
              <div className="flex items-center gap-4">
                <Globe className="h-4 w-4" /> <span>Brasil</span>
                <Award className="h-4 w-4" /> <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
