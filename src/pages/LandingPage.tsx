import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Crown, 
  Zap, 
  Building2, 
  Ship, 
  Users, 
  Brain, 
  Shield, 
  Smartphone,
  Clock,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  Anchor,
  Globe,
  Award,
  Gift
} from 'lucide-react';
import { PRICING_TIERS, formatPrice } from '@/lib/billing/pricing-tiers';

const LandingPage = () => {
  const navigate = useNavigate();

  const tierIcons = {
    free: Gift,
    starter: Zap,
    professional: Crown,
    enterprise: Building2,
  };

  const features = [
    {
      icon: Users,
      title: 'Gestão de Tripulação',
      description: 'Cadastro completo, documentação digital e histórico de embarques'
    },
    {
      icon: Clock,
      title: 'Controle de Ponto',
      description: 'Marcação via PWA com geolocalização e validação automática'
    },
    {
      icon: FileText,
      title: 'Folha de Pagamento',
      description: 'Cálculo automático de salários, férias, 13º e adicionais marítimos'
    },
    {
      icon: Brain,
      title: 'IA Preditiva',
      description: 'Predição de turnover, chatbot HR 24/7 e OCR de documentos'
    },
    {
      icon: Shield,
      title: 'Compliance Total',
      description: 'MLC 2006, STCW, PEOTRAM e normas da Marinha do Brasil'
    },
    {
      icon: Smartphone,
      title: 'PWA Mobile',
      description: 'Portal do colaborador offline-first para qualquer dispositivo'
    }
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Gerente de RH',
      company: 'Navegação ABC',
      content: 'Reduzimos 70% do tempo com processos de DP depois do Nautilus One.',
      rating: 5
    },
    {
      name: 'Marina Costa',
      role: 'Diretora de Operações',
      company: 'Offshore Brasil',
      content: 'A IA de predição de turnover nos ajudou a reter talentos críticos.',
      rating: 5
    },
    {
      name: 'Roberto Santos',
      role: 'CEO',
      company: 'Petro Navegação',
      content: 'Compliance MLC nunca foi tão simples. Recomendo fortemente.',
      rating: 5
    }
  ];

  const stats = [
    { value: '500+', label: 'Embarcações gerenciadas' },
    { value: '15.000+', label: 'Tripulantes ativos' },
    { value: '99.9%', label: 'Uptime garantido' },
    { value: '70%', label: 'Redução de tempo DP' }
  ];

  return (
    <>
      <Helmet>
        <title>Nauti One - Sistema de RH Marítimo com IA | Gestão de Tripulação</title>
        <meta name="description" content="Sistema completo de RH marítimo com IA. Gestão de tripulação, folha de pagamento, compliance MLC 2006 e STCW. Experimente grátis!" />
        <meta name="keywords" content="RH marítimo, gestão tripulação, folha pagamento marítimo, MLC 2006, STCW, software marítimo, offshore" />
        <meta property="og:title" content="Nauti One - Sistema de RH Marítimo com IA" />
        <meta property="og:description" content="Gestão completa de tripulação, folha de pagamento e compliance para empresas marítimas." />
        <link rel="canonical" href="https://nautione.com.br" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                Nauti One
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Depoimentos
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="gap-2">
                  Começar Grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-5xl">
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              ✨ Novo: IA para Predição de Turnover
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              RH Marítimo com{' '}
              <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Gestão completa de tripulação, folha de pagamento, compliance e muito mais.
              Reduza 70% do tempo com processos de DP e mantenha sua frota em conformidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 text-lg px-8">
                  <Sparkles className="h-5 w-5" />
                  Começar Grátis
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <Play className="h-5 w-5" />
                Ver Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-6 rounded-xl bg-card/50 border">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge className="mb-4">Funcionalidades</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tudo que você precisa para gerenciar sua tripulação
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Do cadastro ao compliance, passando pela folha de pagamento e IA preditiva
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge className="mb-4">Preços</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Planos para todos os tamanhos de operação
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comece grátis com até 5 colaboradores. Sem cartão de crédito.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRICING_TIERS.map((tier) => {
                const Icon = tierIcons[tier.id as keyof typeof tierIcons] || Zap;
                
                return (
                  <Card
                    key={tier.id}
                    className={`relative flex flex-col ${tier.recommended ? 'border-primary shadow-lg scale-105 z-10' : ''}`}
                  >
                    {tier.recommended && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Mais Popular
                      </Badge>
                    )}
                    {tier.isFree && (
                      <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Grátis para sempre
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
                        onClick={() => {
                          if (tier.isEnterprise) {
                            window.location.href = 'mailto:comercial@nautione.com.br?subject=Nauti Enterprise';
                          } else {
                            navigate('/auth?mode=signup');
                          }
                        }}
                      >
                        {tier.isFree ? 'Começar Grátis' : tier.isEnterprise ? 'Falar com Vendas' : 'Assinar Agora'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 text-center text-muted-foreground">
              <p>✓ 14 dias de teste grátis em todos os planos pagos</p>
              <p>✓ Cancele a qualquer momento sem compromisso</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge className="mb-4">Depoimentos</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                O que nossos clientes dizem
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para modernizar seu RH marítimo?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Comece grátis hoje mesmo. Sem cartão de crédito necessário.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 text-lg px-8">
                  <Sparkles className="h-5 w-5" />
                  Criar Conta Grátis
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8" asChild>
                <a href="mailto:comercial@nautione.com.br">
                  Falar com Especialista
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Anchor className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Nauti One</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sistema de RH Marítimo com IA.
                  Gestão completa de tripulação e compliance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground">Funcionalidades</a></li>
                  <li><a href="#pricing" className="hover:text-foreground">Preços</a></li>
                  <li><Link to="/auth" className="hover:text-foreground">Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="mailto:contato@nautione.com" className="hover:text-foreground">Sobre</a></li>
                  <li><a href="https://blog.nautione.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Blog</a></li>
                  <li><a href="mailto:suporte@nautione.com" className="hover:text-foreground">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/terms" className="hover:text-foreground">Termos de Uso</Link></li>
                  <li><Link to="/privacy" className="hover:text-foreground">Privacidade (LGPD)</Link></li>
                </ul>
              </div>
            </div>
            <Separator className="mb-8" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 Nauti One. Todos os direitos reservados.</p>
              <div className="flex items-center gap-4">
                <Globe className="h-4 w-4" />
                <span>Brasil</span>
                <Award className="h-4 w-4" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
