/**
 * LandingPage - Public marketing page for Nauti One
 * World-class maritime HR platform landing page
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Ship, Shield, Brain, Users, Globe, Anchor, 
  BarChart3, CheckCircle, ArrowRight, Star, Play,
  Zap, Lock, Cloud, Smartphone, Award, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Hero Section ─────────────────────────────────────
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(214,100%,8%)] via-[hsl(214,100%,14%)] to-[hsl(214,100%,20%)]">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(214,84%,46%) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Badge className="mb-6 bg-[hsl(214,84%,46%)]/20 text-[hsl(214,71%,59%)] border-[hsl(214,84%,46%)]/30 px-4 py-2 text-sm">
            🚀 A Plataforma #1 de Gestão Marítima do Mundo
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Nauti<span className="text-[hsl(214,84%,46%)]"> One</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[hsl(214,87%,85%)] mb-4 max-w-3xl mx-auto font-light">
            Gestão de Tripulação, Compliance & Operações Marítimas
          </p>
          <p className="text-lg text-[hsl(214,78%,73%)] mb-10 max-w-2xl mx-auto">
            720+ módulos • IA Autônoma • 12 Frameworks de Compliance • Offline-First
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/demo")} className="bg-[hsl(214,84%,46%)] hover:bg-[hsl(214,91%,40%)] text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-[hsl(214,84%,46%)]/30">
              <Play className="w-5 h-5 mr-2" /> Ver Demo Interativa
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-[hsl(214,71%,59%)]/30 text-[hsl(214,71%,59%)] hover:bg-[hsl(214,84%,46%)]/10 px-8 py-6 text-lg rounded-xl">
              Começar Grátis <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
        
        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-16 flex flex-wrap justify-center gap-8 text-[hsl(214,78%,73%)] text-sm">
          {["IMO Compliant", "MLC 2006", "SIRE 2.0", "ISM/ISPS", "MARPOL I-VI", "ISO 27001 Ready"].map(badge => (
            <div key={badge} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[hsl(142,76%,36%)]" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-[hsl(214,71%,59%)]/50" />
        </motion.div>
      </div>
    </section>
  );
};

// ─── Features Section ─────────────────────────────────
const features = [
  { icon: Ship, title: "Gestão de Frota", desc: "Rastreamento em tempo real, Digital Twins 3D e otimização de rotas com IA", badge: "CORE" },
  { icon: Users, title: "Tripulação & RH", desc: "Rotações, payroll ITF, certificações STCW e predição de fadiga", badge: "HR" },
  { icon: Shield, title: "Compliance Total", desc: "12 frameworks: ISM, ISPS, MLC, SIRE 2.0, MARPOL, SGSO, TMSA e mais", badge: "12 FW" },
  { icon: Brain, title: "IA Autônoma", desc: "10 agentes especializados, análise de contratos NLP e decisão autônoma", badge: "AI" },
  { icon: BarChart3, title: "Analytics Avançado", desc: "KPIs marítimos (TCE, EEOI, CII), dashboards executivos e BI", badge: "BI" },
  { icon: Lock, title: "Segurança Enterprise", desc: "RLS em 720+ tabelas, blockchain audit trail e multi-tenant isolation", badge: "SEC" },
  { icon: Cloud, title: "Offline-First", desc: "PWA otimizada para redes de 2 Mbps, sync automático em alto-mar", badge: "PWA" },
  { icon: Smartphone, title: "Mobile Nativo", desc: "Capacitor 7, câmera para inspeções, NFC check-in e push notifications", badge: "APP" },
  { icon: Globe, title: "Multi-idioma", desc: "10 idiomas com localização completa de moedas e formatos regionais", badge: "i18n" },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Funcionalidades</Badge>
        <h2 className="text-4xl font-bold text-foreground mb-4">Tudo que sua frota precisa</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Uma plataforma unificada que substitui dezenas de sistemas legados</p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">{f.badge}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Social Proof Section ─────────────────────────────
const stats = [
  { value: "720+", label: "Módulos", icon: Zap },
  { value: "12", label: "Frameworks Compliance", icon: Shield },
  { value: "10", label: "Agentes IA", icon: Brain },
  { value: "99.9%", label: "Uptime SLA", icon: Award },
];

const SocialProofSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-3">
              <s.icon className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Comparison Section ───────────────────────────────
const ComparisonSection = () => {
  const competitors = [
    { name: "Nauti One", modules: "720+", compliance: "12", ai: "✅ Autônoma", offline: "✅", price: "Sob consulta", highlight: true },
    { name: "DNV ShipManager", modules: "~50", compliance: "3", ai: "❌", offline: "❌", price: "$80K+/ano", highlight: false },
    { name: "Veson IMOS", modules: "~30", compliance: "2", ai: "Básica", offline: "❌", price: "$100K+/ano", highlight: false },
    { name: "BASS/AMOS", modules: "~40", compliance: "4", ai: "❌", offline: "Parcial", price: "$60K+/ano", highlight: false },
  ];
  
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Comparativo</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Por que Nauti One?</h2>
          <p className="text-lg text-muted-foreground">Compare com os líderes mundiais do setor marítimo</p>
        </motion.div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 px-4 text-left text-foreground font-semibold">Plataforma</th>
                <th className="py-4 px-4 text-center text-foreground font-semibold">Módulos</th>
                <th className="py-4 px-4 text-center text-foreground font-semibold">Compliance</th>
                <th className="py-4 px-4 text-center text-foreground font-semibold">IA</th>
                <th className="py-4 px-4 text-center text-foreground font-semibold">Offline</th>
                <th className="py-4 px-4 text-center text-foreground font-semibold">Preço</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(c => (
                <tr key={c.name} className={`border-b border-border/50 ${c.highlight ? 'bg-primary/5' : ''}`}>
                  <td className="py-4 px-4 font-semibold text-foreground flex items-center gap-2">
                    {c.highlight && <Star className="w-4 h-4 text-[hsl(45,100%,51%)]" />}
                    {c.name}
                  </td>
                  <td className="py-4 px-4 text-center text-foreground font-bold">{c.modules}</td>
                  <td className="py-4 px-4 text-center text-foreground">{c.compliance}</td>
                  <td className="py-4 px-4 text-center text-foreground">{c.ai}</td>
                  <td className="py-4 px-4 text-center text-foreground">{c.offline}</td>
                  <td className="py-4 px-4 text-center text-foreground">{c.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// ─── Pricing Section ──────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: "$500",
    unit: "/embarcação/mês",
    desc: "Até 10 embarcações • 100 tripulantes",
    features: ["Gestão de tripulação", "Documentos & certificados", "Compliance básico (ISM/MLC)", "Dashboard operacional", "Suporte por email"],
    cta: "Começar",
    popular: false,
  },
  {
    name: "Professional",
    price: "$1,200",
    unit: "/embarcação/mês",
    desc: "Até 50 embarcações • 600 tripulantes",
    features: ["Tudo do Starter +", "12 frameworks compliance", "IA autônoma (10 agentes)", "Analytics avançado & BI", "API & webhooks", "Suporte prioritário 24/7"],
    cta: "Mais Popular",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "contrato anual",
    desc: "Frotas 20+ embarcações",
    features: ["Tudo do Professional +", "Integração SAP/Oracle", "White-label & customização", "SLA 99.99%", "Treinamento dedicado", "Account manager dedicado"],
    cta: "Falar com Vendas",
    popular: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Preços</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Planos por Embarcação</h2>
          <p className="text-lg text-muted-foreground">Escale conforme sua frota cresce — sem surpresas</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <Card className={`h-full relative ${p.popular ? 'border-primary shadow-xl shadow-primary/10 scale-105' : 'border-border/50'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">Mais Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">{p.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-foreground">{p.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">{p.unit}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">{p.desc}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-[hsl(142,76%,36%)] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${p.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                    variant={p.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA Section ──────────────────────────────────────
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-gradient-to-br from-[hsl(214,100%,14%)] to-[hsl(214,100%,8%)]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para revolucionar sua gestão marítima?</h2>
          <p className="text-xl text-[hsl(214,87%,85%)] mb-8">Junte-se às frotas que já operam no futuro</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/demo")} className="bg-[hsl(214,84%,46%)] hover:bg-[hsl(214,91%,40%)] text-white px-8 py-6 text-lg rounded-xl">
              <Play className="w-5 h-5 mr-2" /> Agendar Demo
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
              Criar Conta Grátis
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────
const Footer = () => (
  <footer className="py-12 bg-[hsl(214,100%,6%)] text-[hsl(214,78%,73%)]">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-white font-bold text-xl mb-4">Nauti One</h3>
          <p className="text-sm">A plataforma de gestão marítima mais completa do mundo.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Produto</h4>
          <ul className="space-y-2 text-sm">
            <li>Funcionalidades</li>
            <li>Compliance</li>
            <li>IA & Analytics</li>
            <li>Integrações</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Empresa</h4>
          <ul className="space-y-2 text-sm">
            <li>Sobre</li>
            <li>Blog</li>
            <li>Carreiras</li>
            <li>Contato</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>Privacidade</li>
            <li>Termos de Uso</li>
            <li>SLA</li>
            <li>LGPD</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 text-center text-sm">
        © {new Date().getFullYear()} Nauti One. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

// ─── Main Landing Page ────────────────────────────────
const LandingPage = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[hsl(214,100%,8%)]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/landing" className="text-white font-bold text-xl flex items-center gap-2">
            <Anchor className="w-6 h-6 text-[hsl(214,84%,46%)]" />
            Nauti One
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-[hsl(214,78%,73%)]">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="/demo" className="hover:text-white transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-[hsl(214,78%,73%)] hover:text-white">
              <a href="/auth">Login</a>
            </Button>
            <Button asChild className="bg-[hsl(214,84%,46%)] hover:bg-[hsl(214,91%,40%)] text-white rounded-lg">
              <a href="/auth">Começar Grátis</a>
            </Button>
          </div>
        </div>
      </nav>
      
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <ComparisonSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
