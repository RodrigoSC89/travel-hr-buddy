/**
 * SLA & Support Portal — Gap #5: Enterprise Support 24/7
 * Internal ticketing system with SLA tiers, KB, and escalation tracking
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Headphones, Clock, Shield, Zap, AlertTriangle, CheckCircle2,
  MessageSquare, Search, Plus, TrendingUp, Users, FileText,
  Phone, Mail, BarChart3, Target
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  category: string;
  slaTier: "standard" | "premium" | "enterprise";
  createdAt: string;
  slaDeadline: string;
  assignedTo?: string;
}

const SLA_TIERS = [
  {
    id: "standard",
    name: "Standard",
    icon: Clock,
    color: "text-muted-foreground",
    features: ["Suporte 8x5 (Seg-Sex)", "SLA resposta: 8h", "SLA resolução: 48h", "Email & Chat", "Knowledge Base"],
    responseTime: "8h",
    resolutionTime: "48h",
    uptime: "99.5%",
    price: "Incluído",
  },
  {
    id: "premium",
    name: "Premium",
    icon: Shield,
    color: "text-primary",
    features: ["Suporte 12x7", "SLA resposta: 4h", "SLA resolução: 24h", "Email, Chat & Telefone", "TAM dedicado", "Onboarding guiado"],
    responseTime: "4h",
    resolutionTime: "24h",
    uptime: "99.9%",
    price: "USD 499/mês",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Zap,
    color: "text-warning",
    features: ["Suporte 24/7/365", "SLA resposta: 1h", "SLA resolução: 4h", "Todos os canais + WhatsApp", "TAM senior dedicado", "Onboarding 30/60/90 dias", "Auditoria trimestral", "SLA com penalidades"],
    responseTime: "1h",
    resolutionTime: "4h",
    uptime: "99.99%",
    price: "Sob consulta",
  },
];

const MOCK_TICKETS: Ticket[] = [
  { id: "TK-001", title: "Erro ao gerar relatório de compliance ISM", description: "Relatório não carrega quando filtrado por período > 90 dias", priority: "high", status: "in_progress", category: "Compliance", slaTier: "enterprise", createdAt: "2026-02-19T14:30:00Z", slaDeadline: "2026-02-19T18:30:00Z", assignedTo: "João Silva" },
  { id: "TK-002", title: "Sincronização SAP intermitente", description: "Dados de tripulação não sincronizam a cada 15min conforme configurado", priority: "critical", status: "open", category: "Integração ERP", slaTier: "enterprise", createdAt: "2026-02-20T08:00:00Z", slaDeadline: "2026-02-20T09:00:00Z" },
  { id: "TK-003", title: "Dashboard de KPIs com dados desatualizados", description: "KPIs de frota mostram dados de ontem", priority: "medium", status: "waiting", category: "Dashboard", slaTier: "premium", createdAt: "2026-02-18T10:00:00Z", slaDeadline: "2026-02-19T10:00:00Z", assignedTo: "Maria Santos" },
  { id: "TK-004", title: "Novo usuário sem permissão de acesso", description: "Usuário criado mas não consegue acessar módulo de manutenção", priority: "low", status: "resolved", category: "Acesso", slaTier: "standard", createdAt: "2026-02-17T09:00:00Z", slaDeadline: "2026-02-19T09:00:00Z", assignedTo: "Pedro Costa" },
];

const KB_ARTICLES = [
  { title: "Como configurar integração SAP S/4HANA", category: "Integrações", views: 342 },
  { title: "Guia de compliance ISM — Preparação de evidências", category: "Compliance", views: 521 },
  { title: "Troubleshooting: Noon Reports não sincronizam", category: "Operações", views: 198 },
  { title: "Configurando alertas de certificados expirando", category: "Documentos", views: 287 },
  { title: "Multi-tenant: Isolamento de dados por organização", category: "Admin", views: 156 },
  { title: "API Reference — Endpoints REST disponíveis", category: "Desenvolvimento", views: 412 },
];

export default function SupportPortalPage() {
  const [tickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");

  const handleCreateTicket = () => {
    if (!newTicketTitle) { toast.error("Informe o título do ticket"); return; }
    toast.success(`Ticket criado: ${newTicketTitle}`);
    setNewTicketTitle("");
    setNewTicketDesc("");
  };

  const priorityBadge = (p: string) => {
    const map: Record<string, { variant: "destructive" | "default" | "secondary" | "outline"; label: string }> = {
      critical: { variant: "destructive", label: "🔴 Crítico" },
      high: { variant: "default", label: "🟠 Alto" },
      medium: { variant: "secondary", label: "🟡 Médio" },
      low: { variant: "outline", label: "🟢 Baixo" },
    };
    return map[p] || map.medium;
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { open: "Aberto", in_progress: "Em Andamento", waiting: "Aguardando", resolved: "Resolvido", closed: "Fechado" };
    return map[s] || s;
  };

  const openTickets = tickets.filter(t => t.status !== "resolved" && t.status !== "closed").length;
  const avgResolution = "3.2h";

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Headphones className="h-8 w-8 text-primary" />
              Portal de Suporte & SLA
            </h1>
            <p className="text-muted-foreground mt-1">Suporte enterprise 24/7 com SLA garantido e knowledge base</p>
          </div>
          <div className="flex gap-3">
            <Card className="border-border/50 px-4 py-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{openTickets}</p>
                <p className="text-xs text-muted-foreground">Tickets Abertos</p>
              </div>
            </Card>
            <Card className="border-border/50 px-4 py-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{avgResolution}</p>
                <p className="text-xs text-muted-foreground">Tempo Médio Resolução</p>
              </div>
            </Card>
            <Card className="border-border/50 px-4 py-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">99.97%</p>
                <p className="text-xs text-muted-foreground">Uptime (30d)</p>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tickets"><MessageSquare className="h-4 w-4 mr-2" />Tickets</TabsTrigger>
            <TabsTrigger value="sla"><Target className="h-4 w-4 mr-2" />Planos SLA</TabsTrigger>
            <TabsTrigger value="kb"><FileText className="h-4 w-4 mr-2" />Knowledge Base</TabsTrigger>
            <TabsTrigger value="metrics"><BarChart3 className="h-4 w-4 mr-2" />Métricas</TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Novo Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Título do ticket" value={newTicketTitle} onChange={e => setNewTicketTitle(e.target.value)} className="md:col-span-2" />
                  <Select value={newTicketPriority} onValueChange={setNewTicketPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Crítico</SelectItem>
                      <SelectItem value="high">🟠 Alto</SelectItem>
                      <SelectItem value="medium">🟡 Médio</SelectItem>
                      <SelectItem value="low">🟢 Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Descreva o problema em detalhes..." value={newTicketDesc} onChange={e => setNewTicketDesc(e.target.value)} />
                <Button onClick={handleCreateTicket}><Plus className="h-4 w-4 mr-2" />Criar Ticket</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tickets Ativos</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar tickets..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-3">
                    {tickets.filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(ticket => {
                      const pb = priorityBadge(ticket.priority);
                      return (
                        <div key={ticket.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                              <Badge variant={pb.variant} className="text-xs">{pb.label}</Badge>
                              <Badge variant="outline" className="text-xs">{statusBadge(ticket.status)}</Badge>
                            </div>
                            <p className="font-medium text-foreground mt-1">{ticket.title}</p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                              <span>📂 {ticket.category}</span>
                              <span>⏰ SLA: {ticket.slaTier}</span>
                              {ticket.assignedTo && <span>👤 {ticket.assignedTo}</span>}
                            </div>
                          </div>
                          {ticket.status === "resolved" && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                          {ticket.priority === "critical" && ticket.status === "open" && <AlertTriangle className="h-5 w-5 text-destructive shrink-0 animate-pulse" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA Tiers Tab */}
          <TabsContent value="sla">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SLA_TIERS.map((tier, i) => (
                <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className={`h-full ${tier.id === "enterprise" ? "border-primary ring-1 ring-primary/20" : "border-border/50"}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <tier.icon className={`h-6 w-6 ${tier.color}`} />
                        <CardTitle>{tier.name}</CardTitle>
                      </div>
                      {tier.id === "enterprise" && <Badge className="w-fit">Recomendado</Badge>}
                      <CardDescription className="text-lg font-bold text-foreground">{tier.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-muted/50 rounded p-2">
                            <p className="font-bold text-foreground">{tier.responseTime}</p>
                            <p className="text-muted-foreground">Resposta</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="font-bold text-foreground">{tier.resolutionTime}</p>
                            <p className="text-muted-foreground">Resolução</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="font-bold text-foreground">{tier.uptime}</p>
                            <p className="text-muted-foreground">Uptime</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {tier.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button variant={tier.id === "enterprise" ? "default" : "outline"} className="w-full">
                          {tier.id === "enterprise" ? "Falar com Vendas" : "Selecionar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="kb">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Knowledge Base</CardTitle>
                <CardDescription>Artigos de ajuda e guias de uso — {KB_ARTICLES.length} artigos disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {KB_ARTICLES.map(article => (
                    <div key={article.title} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground">{article.category}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{article.views} views</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Performance de Suporte</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "SLA Cumprido", value: 96, color: "bg-success" },
                    { label: "Primeiro Contato Resolução", value: 72, color: "bg-primary" },
                    { label: "Satisfação do Cliente (CSAT)", value: 94, color: "bg-success" },
                    { label: "Net Promoter Score (NPS)", value: 82, color: "bg-primary" },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-bold text-foreground">{m.value}%</span>
                      </div>
                      <Progress value={m.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Canais de Suporte</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, channel: "Email", volume: "45%", avg: "2.1h" },
                      { icon: MessageSquare, channel: "Chat In-App", volume: "30%", avg: "15min" },
                      { icon: Phone, channel: "Telefone", volume: "15%", avg: "5min" },
                      { icon: Users, channel: "WhatsApp", volume: "10%", avg: "30min" },
                    ].map(ch => (
                      <div key={ch.channel} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ch.icon className="h-5 w-5 text-primary" />
                          <span className="font-medium text-foreground">{ch.channel}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Volume: {ch.volume}</span>
                          <span>Média: {ch.avg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
