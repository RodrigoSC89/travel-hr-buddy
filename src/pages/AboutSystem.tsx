/**
 * AboutSystem - Página institucional completa do Nauti One
 * Apresenta funcionalidades, valores, diferenciais e CTAs para cadastro
 */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Ship, Users, Shield, FileText, Brain, Wrench,
  Compass, Satellite, BarChart3, Anchor, Globe,
  CheckCircle, ArrowRight, ChevronRight, Zap,
  Lock, Wifi, WifiOff, Clock, HeartPulse, Scale,
  Activity, TrendingUp, AlertTriangle, BookOpen,
  UserPlus, ArrowLeft
} from "lucide-react";
import nautiLogo from "@/assets/nauti-one-logo.png";

const FEATURES = [
  {
    icon: Ship,
    title: "Gestão de Frota",
    description: "Monitore embarcações em tempo real com rastreamento GPS, telemetria IoT, gêmeos digitais e análise preditiva de manutenção.",
    highlights: ["AIS/GPS Live", "Digital Twin 3D", "Manutenção Preditiva"]
  },
  {
    icon: Users,
    title: "RH Marítimo Completo",
    description: "Gestão de tripulação, escalas, certificações STCW, folha de pagamento marítima, controle de ponto e portal do colaborador.",
    highlights: ["STCW/MLC", "Payroll", "Portal Embarcado"]
  },
  {
    icon: Shield,
    title: "Compliance & Auditorias",
    description: "ISM Code, ISPS, PEOTRAM, PSC, SIRE 2.0, TMSA, SOLAS — tudo integrado com IA preditiva e preparação automática.",
    highlights: ["13 Frameworks", "IA Preditiva", "Auto-Evidence"]
  },
  {
    icon: Brain,
    title: "Inteligência Artificial",
    description: "Enxame multi-agente com IA especializada para cada área: operações, manutenção, compliance, finanças e tripulação.",
    highlights: ["10+ Agentes IA", "RAG 5.000+ normas", "OCR Inteligente"]
  },
  {
    icon: Wrench,
    title: "Manutenção & Inspeções",
    description: "Sistema PMS completo com manutenção baseada em condição (CBM), ordens de serviço, spare parts e planejamento de docagem.",
    highlights: ["CBM/PdM", "Spare Parts", "Dock Planning"]
  },
  {
    icon: BarChart3,
    title: "Analytics & Relatórios",
    description: "Dashboards executivos, BI interativo, relatórios PDF premium, KPIs operacionais e financeiros em tempo real.",
    highlights: ["BI Interativo", "PDF Premium", "KPIs Live"]
  },
  {
    icon: Compass,
    title: "Operações de Viagem",
    description: "Planejamento de voyage, P&L, TCE, laytime/demurrage, otimização de rotas e bunker, integrado com dados meteorológicos.",
    highlights: ["Voyage P&L", "Bunker Opt", "Weather Routing"]
  },
  {
    icon: Globe,
    title: "ESG & Sustentabilidade",
    description: "Monitoramento de emissões CII/EEXI, gestão de resíduos MARPOL, carbon footprint tracking e relatórios de sustentabilidade.",
    highlights: ["CII/EEXI", "MARPOL V", "Carbon Track"]
  },
  {
    icon: FileText,
    title: "Gestão Documental",
    description: "Centro de documentos com versionamento, OCR automático, templates inteligentes, checklists digitais e assinatura eletrônica.",
    highlights: ["OCR Auto", "Versionamento", "e-Signature"]
  },
];

const VALUES = [
  {
    icon: Lock,
    title: "Segurança Enterprise",
    description: "RLS multi-tenant, criptografia end-to-end, auditoria blockchain imutável, MFA e monitoramento 24/7 de anomalias."
  },
  {
    icon: WifiOff,
    title: "Offline-First",
    description: "Funciona 100% offline com sincronização automática. Otimizado para conexões marítimas de 2Mbps ou menos."
  },
  {
    icon: Clock,
    title: "Disponibilidade 24/7",
    description: "Infraestrutura cloud redundante com SLA 99.9%. Monitoramento proativo de saúde do sistema em tempo real."
  },
  {
    icon: Scale,
    title: "Conformidade Total",
    description: "Aderência a MLC 2006, STCW, ISM Code, ISPS, SOLAS, MARPOL, PEOTRAM e 13+ frameworks regulatórios."
  },
];

const STATS = [
  { value: "700+", label: "Tabelas no Banco" },
  { value: "300+", label: "Edge Functions" },
  { value: "2.260+", label: "Políticas de Segurança" },
  { value: "13+", label: "Frameworks de Compliance" },
  { value: "10+", label: "Agentes de IA" },
  { value: "5.000+", label: "Normas no RAG" },
];

export default function AboutSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => navigate("/auth")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={nautiLogo} alt="Nauti One" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">NAUTI ONE</span>
          </button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Plataforma de Gestão Marítima Inteligente
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            O Sistema Operacional
            <br />
            <span className="text-primary">da Indústria Marítima</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Gerencie frotas, tripulação, compliance, manutenção e finanças em uma única plataforma 
            com inteligência artificial integrada. Projetado para funcionar em alto-mar, offline e 
            em conexões de baixa velocidade.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25" onClick={() => navigate("/auth")}>
              <UserPlus className="mr-2 h-5 w-5" />
              Começar Agora — Grátis
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12" onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Explorar Funcionalidades
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4">
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Funcionalidades
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tudo que você precisa, em um só lugar
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Mais de 50 módulos integrados cobrindo 100% das operações marítimas — 
            da ponte de comando ao departamento financeiro.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="group border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {feature.highlights.map((h) => (
                        <Badge key={h} variant="secondary" className="text-xs font-normal">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Diferenciais
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Construído para o ambiente marítimo
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Diferente de ERPs genéricos, o Nauti One foi projetado desde o dia 1 
              para as condições extremas de operação em alto-mar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <Card key={value.title} className="border-border/50">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Para quem é o Nauti One?
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Anchor, title: "Armadores", desc: "Gestão completa de frotas com visibilidade operacional e financeira em tempo real." },
            { icon: HeartPulse, title: "Operadores Offshore", desc: "Compliance PEOTRAM/ANP, SGSO, safety management e gestão de PSC." },
            { icon: BookOpen, title: "Gestores de Crew", desc: "RH marítimo, escalas, certificações, folha de pagamento e portal embarcado." },
            { icon: AlertTriangle, title: "Auditores & DPAs", desc: "Preparação automática para inspeções, gap analysis e evidence management." },
          ].map((item) => (
            <div key={item.title} className="text-center p-6">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Pronto para transformar suas operações?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a utilizar a plataforma de gestão marítima 
            mais completa do mercado.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-10 h-12 shadow-lg shadow-primary/25" onClick={() => navigate("/auth")}>
              <UserPlus className="mr-2 h-5 w-5" />
              Criar Conta Gratuitamente
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sem cartão de crédito • Setup em minutos • Suporte especializado
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
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
