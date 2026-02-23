/**
 * PitchDeckPage — Apresentação executiva para investidores e clientes
 * Métricas, diferenciadores e CTA para demo/contato
 */
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Anchor, Ship, Users, Shield, Brain, Globe, Zap,
  Database, Lock, Smartphone, BarChart3, ArrowRight,
  CheckCircle, Star, TrendingUp, Layers
} from "lucide-react";

const METRICS = [
  { icon: Layers, value: "200+", label: "Módulos Integrados", desc: "ERP marítimo mais completo do mercado" },
  { icon: Database, value: "700+", label: "Tabelas de Dados", desc: "Cobertura total de operações marítimas" },
  { icon: Zap, value: "313+", label: "Edge Functions", desc: "Backend serverless de alta performance" },
  { icon: Lock, value: "100%", label: "Cobertura RLS", desc: "Segurança enterprise em todas as tabelas" },
  { icon: Brain, value: "10+", label: "Agentes de IA", desc: "GPT-4o para decisões operacionais" },
  { icon: Globe, value: "Multi", label: "Tenant & Idioma", desc: "Isolamento total por empresa" },
];

const DIFFERENTIATORS = [
  { title: "IA Nativa", desc: "10+ agentes especializados com GPT-4o integrado nativamente em todos os módulos.", icon: Brain },
  { title: "Offline-First", desc: "PWA com IndexedDB — opera em redes de 2 Mbps (satélite marítimo).", icon: Smartphone },
  { title: "Compliance Total", desc: "MLC 2006, STCW, SOLAS, ISM, ISPS, MARPOL, EU-ETS — tudo em um lugar.", icon: Shield },
  { title: "Enterprise Security", desc: "RLS 100%, SHA-256 audit chain, multi-tenant, SOC 2 ready.", icon: Lock },
];

const COMPETITORS = [
  { name: "AMOS", gaps: "Sem IA, sem mobile, UX legada" },
  { name: "Sertica", gaps: "Sem compliance, sem ERP, sem IA" },
  { name: "Veson IMOS", gaps: "Sem crew management, pricing enterprise" },
  { name: "Nauti One", gaps: "✅ Solução completa e integrada", highlight: true },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function PitchDeckPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs border-primary/30 text-primary">
              Maritime ERP • SaaS • AI-Powered
            </Badge>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Anchor className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Nauti One</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A plataforma de gestão marítima mais completa do mundo.
              <br />
              <span className="text-primary font-medium">IA nativa • Offline-first • Compliance total</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/demo')} className="gap-2 shadow-lg shadow-primary/20">
                <Star className="h-4 w-4" />
                Ver Demo Interativa
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="gap-2">
                Criar Conta Gratuita
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="text-2xl font-bold text-center mb-10">
            Números que Impressionam
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {METRICS.map((m, i) => (
              <motion.div key={m.label} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                  <CardContent className="p-5 text-center">
                    <m.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-primary mb-1">{m.value}</div>
                    <div className="text-sm font-semibold mb-1">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp} className="text-2xl font-bold text-center mb-10">
            Por que Nauti One?
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((d, i) => (
              <motion.div key={d.title} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-primary/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 flex gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <d.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{d.title}</h3>
                      <p className="text-sm text-muted-foreground">{d.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Landscape */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...fadeUp} className="text-2xl font-bold text-center mb-10">
            Panorama Competitivo
          </motion.h2>
          <div className="space-y-3">
            {COMPETITORS.map((c, i) => (
              <motion.div key={c.name} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className={`border ${c.highlight ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {c.highlight ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Ship className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={`font-semibold ${c.highlight ? 'text-primary' : ''}`}>{c.name}</span>
                    </div>
                    <span className={`text-sm ${c.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {c.gaps}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 {...fadeUp} className="text-2xl font-bold mb-4">
            Suíte Completa de Módulos
          </motion.h2>
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              "Fleet Management", "Crew Management", "Voyage P&L", "PMS/CMMS",
              "STCW Vault", "ISM Code", "SIRE 2.0", "EU-ETS", "Payroll",
              "Procurement", "Chartering", "IoT Sensors", "Noon Reports",
              "Drydock Planning", "Insurance/P&I", "VR Training",
              "AI Document OCR", "Weather Routing", "AIS Tracking",
            ].map((mod) => (
              <Badge key={mod} variant="outline" className="text-xs border-primary/20">
                {mod}
              </Badge>
            ))}
          </motion.div>
          <motion.p {...fadeUp} className="text-muted-foreground mb-8">
            + dezenas de sub-módulos especializados para cada segmento da indústria marítima
          </motion.p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Pronto para Transformar sua Operação?</h2>
            <p className="text-muted-foreground mb-8">
              Agende uma demonstração personalizada ou explore nossa demo interativa agora mesmo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/demo')} className="gap-2 shadow-lg shadow-primary/20">
                <Star className="h-4 w-4" />
                Demo Interativa
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Começar Agora
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/')}>
                Saiba Mais
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
