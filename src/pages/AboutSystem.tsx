/**
 * AboutSystem - Página institucional cinematográfica do Nauti One
 * Design premium com animações fluidas e micro-interações
 */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  FloatingElement,
  GlowPulse,
  MagneticCard,
  GradientBorder,
} from "@/components/ui/animated-primitives";
import { motion } from "framer-motion";
import {
  Ship, Users, Shield, FileText, Brain, Wrench,
  Compass, Satellite, BarChart3, Anchor, Globe,
  CheckCircle, ArrowRight, ChevronRight, Zap,
  Lock, Wifi, WifiOff, Clock, HeartPulse, Scale,
  Activity, TrendingUp, AlertTriangle, BookOpen,
  UserPlus, ArrowLeft, Sparkles, Waves
} from "lucide-react";
import nautiLogo from "@/assets/nauti-one-logo.png";

const FEATURES = [
  { icon: Ship, title: "Gestão de Frota", description: "Monitore embarcações em tempo real com rastreamento GPS, telemetria IoT, gêmeos digitais e análise preditiva de manutenção.", highlights: ["AIS/GPS Live", "Digital Twin 3D", "Manutenção Preditiva"] },
  { icon: Users, title: "RH Marítimo Completo", description: "Gestão de tripulação, escalas, certificações STCW, folha de pagamento marítima, controle de ponto e portal do colaborador.", highlights: ["STCW/MLC", "Payroll", "Portal Embarcado"] },
  { icon: Shield, title: "Compliance & Auditorias", description: "ISM Code, ISPS, PEOTRAM, PSC, SIRE 2.0, TMSA, SOLAS — tudo integrado com IA preditiva e preparação automática.", highlights: ["13 Frameworks", "IA Preditiva", "Auto-Evidence"] },
  { icon: Brain, title: "Inteligência Artificial", description: "Enxame multi-agente com IA especializada para cada área: operações, manutenção, compliance, finanças e tripulação.", highlights: ["10+ Agentes IA", "RAG 5.000+ normas", "OCR Inteligente"] },
  { icon: Wrench, title: "Manutenção & Inspeções", description: "Sistema PMS completo com manutenção baseada em condição (CBM), ordens de serviço, spare parts e planejamento de docagem.", highlights: ["CBM/PdM", "Spare Parts", "Dock Planning"] },
  { icon: BarChart3, title: "Analytics & Relatórios", description: "Dashboards executivos, BI interativo, relatórios PDF premium, KPIs operacionais e financeiros em tempo real.", highlights: ["BI Interativo", "PDF Premium", "KPIs Live"] },
  { icon: Compass, title: "Operações de Viagem", description: "Planejamento de voyage, P&L, TCE, laytime/demurrage, otimização de rotas e bunker, integrado com dados meteorológicos.", highlights: ["Voyage P&L", "Bunker Opt", "Weather Routing"] },
  { icon: Globe, title: "ESG & Sustentabilidade", description: "Monitoramento de emissões CII/EEXI, gestão de resíduos MARPOL, carbon footprint tracking e relatórios de sustentabilidade.", highlights: ["CII/EEXI", "MARPOL V", "Carbon Track"] },
  { icon: FileText, title: "Gestão Documental", description: "Centro de documentos com versionamento, OCR automático, templates inteligentes, checklists digitais e assinatura eletrônica.", highlights: ["OCR Auto", "Versionamento", "e-Signature"] },
];

const VALUES = [
  { icon: Lock, title: "Segurança Enterprise", description: "RLS multi-tenant, criptografia end-to-end, auditoria blockchain imutável, MFA e monitoramento 24/7 de anomalias." },
  { icon: WifiOff, title: "Offline-First", description: "Funciona 100% offline com sincronização automática. Otimizado para conexões marítimas de 2Mbps ou menos." },
  { icon: Clock, title: "Disponibilidade 24/7", description: "Infraestrutura cloud redundante com SLA 99.9%. Monitoramento proativo de saúde do sistema em tempo real." },
  { icon: Scale, title: "Conformidade Total", description: "Aderência a MLC 2006, STCW, ISM Code, ISPS, SOLAS, MARPOL, PEOTRAM e 13+ frameworks regulatórios." },
];

const STATS = [
  { value: "700+", label: "Tabelas no Banco" },
  { value: "300+", label: "Edge Functions" },
  { value: "2260+", label: "Políticas de Segurança" },
  { value: "13+", label: "Frameworks de Compliance" },
  { value: "10+", label: "Agentes de IA" },
  { value: "5000+", label: "Normas no RAG" },
];

export default function AboutSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header fixo */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => navigate("/auth")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={nautiLogo} alt="Nauti One" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NAUTI ONE</span>
          </button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/20" onClick={() => navigate("/auth")}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Criar Conta
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Cinematic */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Animated background */}
        <GlowPulse className="w-[600px] h-[600px] top-[-200px] left-[-100px]" />
        <GlowPulse className="w-[500px] h-[500px] bottom-[-150px] right-[-100px]" color="hsl(var(--accent))" />
        <FloatingElement className="absolute top-32 right-[15%] opacity-10" amplitude={20} duration={6}>
          <Ship className="h-24 w-24 text-primary" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-32 left-[10%] opacity-10" amplitude={15} duration={5}>
          <Anchor className="h-20 w-20 text-primary" />
        </FloatingElement>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <ScrollReveal delay={0.1} direction="none">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm border-primary/20 bg-primary/5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Plataforma de Gestão Marítima Inteligente
            </Badge>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              O Sistema Operacional
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                da Indústria Marítima
              </span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4}>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Gerencie frotas, tripulação, compliance, manutenção e finanças em uma única plataforma 
              com inteligência artificial integrada. Projetado para funcionar em alto-mar, offline e 
              em conexões de baixa velocidade.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 h-12 shadow-xl shadow-primary/25 group" onClick={() => navigate("/auth")}>
                <UserPlus className="mr-2 h-5 w-5" />
                Começar Agora — Grátis
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 h-12 backdrop-blur-sm" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Explorar Funcionalidades
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0,40 C360,80 720,0 1080,40 C1260,60 1440,20 1440,20 L1440,80 L0,80 Z"
              fill="hsl(var(--muted) / 0.3)"
            />
          </svg>
        </div>
      </section>

      {/* Stats Bar - Animated Counters */}
      <section className="border-y border-border/30 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center" staggerDelay={0.08}>
            {STATS.map((stat) => (
              <StaggerItem key={stat.label}>
                <AnimatedCounter
                  value={stat.value}
                  className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent"
                  duration={2.5}
                />
                <div className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Grid - Staggered with Magnetic Cards */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <ScrollReveal className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20">
            <Activity className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Funcionalidades
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tudo que você precisa, em um só lugar
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Mais de 50 módulos integrados cobrindo 100% das operações marítimas — 
            da ponte de comando ao departamento financeiro.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.06}>
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <MagneticCard>
                <Card className="border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                        <feature.icon className="h-5.5 w-5.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {feature.highlights.map((h) => (
                            <Badge key={h} variant="secondary" className="text-xs font-normal bg-primary/5 text-primary/80 border-primary/10">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MagneticCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Values Section */}
      <section className="bg-muted/20 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Diferenciais
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Construído para o ambiente marítimo
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Diferente de ERPs genéricos, o Nauti One foi projetado desde o dia 1 
              para as condições extremas de operação em alto-mar.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto" staggerDelay={0.1}>
            {VALUES.map((value) => (
              <StaggerItem key={value.title}>
                <GradientBorder>
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{value.description}</p>
                    </div>
                  </CardContent>
                </GradientBorder>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Para quem é o Nauti One?
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
          {[
            { icon: Anchor, title: "Armadores", desc: "Gestão completa de frotas com visibilidade operacional e financeira em tempo real." },
            { icon: HeartPulse, title: "Operadores Offshore", desc: "Compliance PEOTRAM/ANP, SGSO, safety management e gestão de PSC." },
            { icon: BookOpen, title: "Gestores de Crew", desc: "RH marítimo, escalas, certificações, folha de pagamento e portal embarcado." },
            { icon: AlertTriangle, title: "Auditores & DPAs", desc: "Preparação automática para inspeções, gap analysis e evidence management." },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <motion.div
                className="text-center p-8 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-5">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA Final */}
      <section className="border-t border-border/30 relative overflow-hidden">
        <GlowPulse className="w-[500px] h-[500px] top-[-200px] left-[30%]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Pronto para transformar suas operações?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Crie sua conta gratuitamente e comece a utilizar a plataforma de gestão marítima 
              mais completa do mercado.
            </p>
            <div className="mt-8">
              <Button size="lg" className="text-base px-10 h-13 shadow-xl shadow-primary/25 group" onClick={() => navigate("/auth")}>
                <Sparkles className="mr-2 h-5 w-5" />
                Criar Conta Gratuitamente
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Sem cartão de crédito • Setup em minutos • Suporte especializado
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={nautiLogo} alt="Nauti One" className="h-6 w-6" />
            <span className="text-sm font-medium">NAUTI ONE</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nauti One. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
