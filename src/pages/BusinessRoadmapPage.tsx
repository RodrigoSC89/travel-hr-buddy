/**
 * Business Roadmap & Gap Closure Checklist
 * Internal strategic page for certification, client acquisition, SLA & Flag State
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target, Shield, Users, Server, Headphones, Anchor,
  FileCheck, Rocket, TrendingUp, AlertTriangle, CheckCircle2,
  Globe, Building2, Ship, Award
} from "lucide-react";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium";
  status: "not_started" | "in_progress" | "done";
  effort: string;
  timeline: string;
  dependencies?: string[];
}

const GAP_CATEGORIES = [
  {
    id: "certification",
    icon: Shield,
    title: "Certificação de Classe",
    subtitle: "DNV, Lloyd's, Bureau Veritas",
    color: "text-destructive",
    score: 0,
    items: [
      { id: "c1", title: "Contatar DNV GL para programa de certificação de software marítimo", description: "Iniciar processo formal com DNV Type Approval Programme para software de gestão naval", priority: "critical" as const, status: "not_started" as const, effort: "6-12 meses", timeline: "Q3 2026" },
      { id: "c2", title: "Obter certificação DNV Type Approval (TAP)", description: "Submeter documentação técnica e realizar auditorias de conformidade para Type Approval Certificate", priority: "critical" as const, status: "not_started" as const, effort: "12-18 meses", timeline: "Q1 2027" },
      { id: "c3", title: "Iniciar processo Lloyd's Register Software Conformity", description: "Certificação LR para sistemas de gestão de embarcações", priority: "high" as const, status: "not_started" as const, effort: "8-14 meses", timeline: "Q2 2027" },
      { id: "c4", title: "Bureau Veritas Marine Software Approval", description: "Processo paralelo com BV para aprovação de software marítimo", priority: "high" as const, status: "not_started" as const, effort: "8-12 meses", timeline: "Q3 2027" },
      { id: "c5", title: "ISO 27001 Information Security Certification", description: "Certificação obrigatória para clientes enterprise - proteção de dados", priority: "critical" as const, status: "not_started" as const, effort: "6-9 meses", timeline: "Q2 2026" },
      { id: "c6", title: "SOC 2 Type II Audit", description: "Auditoria de controles de segurança, disponibilidade e confidencialidade", priority: "high" as const, status: "not_started" as const, effort: "6-12 meses", timeline: "Q4 2026" },
    ],
  },
  {
    id: "clients",
    icon: Users,
    title: "Clientes & Case Studies",
    subtitle: "Primeiras frotas em produção",
    color: "text-destructive",
    score: 0,
    items: [
      { id: "cl1", title: "Programa piloto com 3-5 embarcações offshore (Brasil)", description: "Focar em OSVs e AHTS operando na Bacia de Santos - mercado local e acessível", priority: "critical" as const, status: "not_started" as const, effort: "3-6 meses", timeline: "Q2 2026" },
      { id: "cl2", title: "Parcerias com operadoras brasileiras (CBO, Bram, Starnav)", description: "Oferecer licença gratuita por 6 meses em troca de feedback e case study", priority: "critical" as const, status: "not_started" as const, effort: "2-4 meses", timeline: "Q2 2026" },
      { id: "cl3", title: "Primeiro case study publicado com métricas reais", description: "Documentar redução de tempo, custos e melhoria de compliance com dados verificáveis", priority: "critical" as const, status: "not_started" as const, effort: "6-9 meses", timeline: "Q4 2026" },
      { id: "cl4", title: "Apresentação em feiras marítimas (Nor-Shipping, SMM Hamburg)", description: "Exposição em feiras internacionais para visibilidade global", priority: "high" as const, status: "not_started" as const, effort: "3-6 meses", timeline: "Q3 2026" },
      { id: "cl5", title: "10 clientes ativos com contrato SaaS", description: "Meta de 10 contratos pagos para validação de mercado", priority: "high" as const, status: "not_started" as const, effort: "12-18 meses", timeline: "Q2 2027" },
      { id: "cl6", title: "Parceria estratégica com Manning Agency", description: "Integrar com agências de manning para atrair operadoras via network", priority: "medium" as const, status: "not_started" as const, effort: "3-6 meses", timeline: "Q3 2026" },
    ],
  },
  {
    id: "infrastructure",
    icon: Server,
    title: "Infraestrutura & Escalabilidade",
    subtitle: "Multi-cloud, HA, 10K+ navios",
    color: "text-warning",
    score: 30,
    items: [
      { id: "i1", title: "Migrar para Supabase Pro/Enterprise com replicação", description: "Upgrade do plano Supabase para suportar Read Replicas e backup point-in-time", priority: "critical" as const, status: "not_started" as const, effort: "1-2 meses", timeline: "Q2 2026" },
      { id: "i2", title: "Implementar CDN global (Cloudflare/AWS CloudFront)", description: "Distribuir assets estáticos globalmente para latência <200ms em qualquer porto", priority: "high" as const, status: "not_started" as const, effort: "2-4 semanas", timeline: "Q2 2026" },
      { id: "i3", title: "Stress test com 1M+ registros e 500+ usuários simultâneos", description: "Validar performance com volume real de dados marítimos", priority: "critical" as const, status: "in_progress" as const, effort: "2-4 semanas", timeline: "Q2 2026" },
      { id: "i4", title: "Arquitetura multi-tenant com isolamento completo por organização", description: "Garantir que dados de cada armador estejam completamente isolados", priority: "critical" as const, status: "in_progress" as const, effort: "Já implementado via RLS", timeline: "✅ Concluído" },
      { id: "i5", title: "Monitoramento 24/7 com alertas (Sentry, UptimeRobot)", description: "Dashboards de health e alertas automáticos para downtime", priority: "high" as const, status: "in_progress" as const, effort: "1-2 semanas", timeline: "Q2 2026" },
      { id: "i6", title: "Disaster Recovery Plan documentado e testado", description: "RTO <4h, RPO <1h com procedimentos documentados", priority: "high" as const, status: "not_started" as const, effort: "2-4 semanas", timeline: "Q3 2026" },
    ],
  },
  {
    id: "sla",
    icon: Headphones,
    title: "Suporte & SLA",
    subtitle: "24/7, SLA enterprise, onboarding",
    color: "text-destructive",
    score: 20,
    items: [
      { id: "s1", title: "Definir tiers de SLA (Standard/Premium/Enterprise)", description: "Standard: 8x5, Premium: 12x7, Enterprise: 24/7 com TAM dedicado", priority: "critical" as const, status: "not_started" as const, effort: "2-4 semanas", timeline: "Q2 2026" },
      { id: "s2", title: "Implementar sistema de tickets e knowledge base", description: "Zendesk/Freshdesk com KB em 3 idiomas (PT/EN/ES)", priority: "high" as const, status: "not_started" as const, effort: "1-2 meses", timeline: "Q2 2026" },
      { id: "s3", title: "Contratar equipe de suporte (mínimo 3 pessoas)", description: "1 L1 (triagem), 1 L2 (técnico), 1 L3 (engenheiro)", priority: "critical" as const, status: "not_started" as const, effort: "2-3 meses", timeline: "Q3 2026" },
      { id: "s4", title: "Programa de onboarding estruturado para novos clientes", description: "Guia de implantação de 30/60/90 dias com marcos definidos", priority: "high" as const, status: "in_progress" as const, effort: "1-2 meses", timeline: "Q2 2026" },
      { id: "s5", title: "Uptime SLA: 99.9% garantido em contrato", description: "Penalidades contratuais e créditos automáticos por downtime", priority: "high" as const, status: "not_started" as const, effort: "1 mês", timeline: "Q3 2026" },
    ],
  },
  {
    id: "flagstate",
    icon: Anchor,
    title: "Flag State & Regulatório",
    subtitle: "Aprovação oficial como logbook digital",
    color: "text-destructive",
    score: 15,
    items: [
      { id: "f1", title: "Mapeamento de Flag States que aceitam logbooks digitais", description: "Priorizar Bahamas, Marshall Islands, Liberia, Panama - mais progressivos", priority: "critical" as const, status: "not_started" as const, effort: "1-2 meses", timeline: "Q2 2026" },
      { id: "f2", title: "Submissão para aprovação em 2+ Flag States", description: "Iniciar processo formal com Marshall Islands e Bahamas", priority: "critical" as const, status: "not_started" as const, effort: "6-12 meses", timeline: "Q4 2026" },
      { id: "f3", title: "Adequação ao formato IMO FAL Convention (digital)", description: "Garantir que documentos gerados atendem formato FAL para inspeções PSC", priority: "high" as const, status: "not_started" as const, effort: "2-3 meses", timeline: "Q3 2026" },
      { id: "f4", title: "Validação com inspetores PSC (Port State Control)", description: "Testes práticos com inspetores reais para validar aceitação", priority: "high" as const, status: "not_started" as const, effort: "3-6 meses", timeline: "Q1 2027" },
      { id: "f5", title: "Certificação IACS (International Association of Classification Societies)", description: "Reconhecimento pela IACS como sistema aprovado", priority: "medium" as const, status: "not_started" as const, effort: "12-18 meses", timeline: "Q2 2027" },
    ],
  },
  {
    id: "integrations",
    icon: Building2,
    title: "Integrações Enterprise",
    subtitle: "SAP, Oracle, MS Dynamics, AIS real",
    color: "text-warning",
    score: 40,
    items: [
      { id: "e1", title: "Conector SAP S/4HANA via OData/RFC", description: "Integração com SAP HR (PA), PM (manutenção) e FI (financeiro)", priority: "critical" as const, status: "in_progress" as const, effort: "3-6 meses", timeline: "Q3 2026" },
      { id: "e2", title: "Conector Oracle Cloud HCM/EAM", description: "Integração REST com Oracle Human Capital Management e Enterprise Asset Management", priority: "high" as const, status: "in_progress" as const, effort: "3-6 meses", timeline: "Q3 2026" },
      { id: "e3", title: "Conector Microsoft Dynamics 365", description: "Integração com D365 Finance, Supply Chain e Human Resources", priority: "high" as const, status: "not_started" as const, effort: "3-6 meses", timeline: "Q4 2026" },
      { id: "e4", title: "MarineTraffic AIS API em produção", description: "Feed AIS real-time com posição, velocidade e ETA de embarcações", priority: "critical" as const, status: "in_progress" as const, effort: "Já implementado via Edge Function", timeline: "✅ Implementado" },
      { id: "e5", title: "Open-Meteo / StormGlass Weather em produção", description: "Dados meteorológicos reais para route optimization", priority: "high" as const, status: "done" as const, effort: "Já implementado via Edge Function", timeline: "✅ Produção" },
      { id: "e6", title: "API Marketplace com 50+ integrações documentadas", description: "Hub público de integrações com documentação OpenAPI", priority: "medium" as const, status: "in_progress" as const, effort: "6-12 meses", timeline: "Q1 2027" },
    ],
  },
];

export default function BusinessRoadmapPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(
    GAP_CATEGORIES.flatMap(c => c.items.filter(i => i.status === "done").map(i => i.id))
  ));

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalItems = GAP_CATEGORIES.reduce((s, c) => s + c.items.length, 0);
  const doneItems = checkedItems.size;
  const overallProgress = Math.round((doneItems / totalItems) * 100);

  const priorityColor = (p: string) => {
    switch (p) {
      case "critical": return "destructive";
      case "high": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              Roadmap Estratégico — Gap Closure
            </h1>
            <p className="text-muted-foreground mt-1">
              Checklist interno para atingir liderança mundial vs DNV ShipManager, Veson, AMOS e BASS
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground">{doneItems}/{totalItems} concluídos</p>
            </div>
            <Progress value={overallProgress} className="w-40" />
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {GAP_CATEGORIES.map(cat => {
            const catDone = cat.items.filter(i => checkedItems.has(i.id)).length;
            const catPct = Math.round((catDone / cat.items.length) * 100);
            return (
              <Card key={cat.id} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <cat.icon className={`h-6 w-6 mx-auto mb-2 ${cat.color}`} />
                  <p className="text-xs font-medium text-foreground truncate">{cat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{catPct}%</p>
                  <p className="text-xs text-muted-foreground">{catDone}/{cat.items.length}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories */}
        <Tabs defaultValue="certification" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            {GAP_CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1 text-xs">
                <cat.icon className="h-3 w-3" />
                {cat.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {GAP_CATEGORIES.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                    {cat.title}
                  </CardTitle>
                  <CardDescription>{cat.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-3">
                      {cat.items.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                            checkedItems.has(item.id)
                              ? "bg-success/5 border-success/30"
                              : "bg-muted/30 border-border/50"
                          }`}
                        >
                          <Checkbox
                            checked={checkedItems.has(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-medium ${checkedItems.has(item.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {item.title}
                              </p>
                              <Badge variant={priorityColor(item.priority)} className="text-xs">
                                {item.priority === "critical" ? "🔴 Crítico" : item.priority === "high" ? "🟡 Alto" : "🟢 Médio"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>⏱ {item.effort}</span>
                              <span>📅 {item.timeline}</span>
                            </div>
                          </div>
                          {checkedItems.has(item.id) && (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Strategic Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <Rocket className="h-5 w-5 text-primary" />
              Resumo Executivo — Caminho para #1 Mundial
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">🎯 Fase 1 (Q2-Q3 2026)</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• ISO 27001 + SOC 2</li>
                  <li>• 3-5 pilotos offshore Brasil</li>
                  <li>• SLA tiers definidos</li>
                  <li>• Stress test 500+ users</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">🚀 Fase 2 (Q4 2026 - Q1 2027)</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• DNV Type Approval em andamento</li>
                  <li>• 10 clientes pagantes</li>
                  <li>• SAP + Oracle conectores</li>
                  <li>• Flag State submission</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">🏆 Fase 3 (Q2-Q4 2027)</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Certificação DNV obtida</li>
                  <li>• 50+ integrações marketplace</li>
                  <li>• Multi-cloud HA</li>
                  <li>• Presença em feiras globais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
