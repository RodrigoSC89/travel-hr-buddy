/**
 * EnhancedInfirmaryDashboard - Dashboard Premium da Enfermaria Digital
 * Experiência única com onboarding, KPIs interativos e ações rápidas
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Pill,
  AlertTriangle,
  Brain,
  Sparkles,
  Send,
  FileText,
  Heart,
  Package,
  ShieldCheck,
  Plus,
  Calendar,
  Phone,
  ClipboardList,
  TrendingUp,
  Users,
  Syringe,
  Activity,
} from "lucide-react";
import { useInfirmaryRealData } from "@/hooks/useInfirmaryRealData";
import { ModuleOnboarding, QuickActionsBar, FeatureHighlight } from "@/components/ux/ModuleOnboarding";
import { InteractiveKPICard, KPIGrid } from "@/components/ux/InteractiveKPICard";
import { ActionableAlerts, type ActionableAlert } from "@/components/ux/ActionableAlerts";
import { toast } from "sonner";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Bem-vindo à Enfermaria Digital",
    description: "Centro de saúde da tripulação com IA integrada para triagem, estoque e conformidade MLC 2006.",
    icon: <Stethoscope className="h-6 w-6 text-primary" />,
    tip: "A IA pode ajudar com diagnósticos preliminares e protocolos de primeiros socorros.",
  },
  {
    id: "kpis",
    title: "Monitore a Saúde em Tempo Real",
    description: "Visualize KPIs críticos: atendimentos, tripulação saudável, medicamentos vencendo e conformidade MLC.",
    icon: <Heart className="h-6 w-6 text-primary" />,
    tip: "Clique em qualquer KPI para ver detalhes e histórico.",
  },
  {
    id: "assistant",
    title: "Assistente Médico IA",
    description: "Converse com a IA para triagem rápida, protocolos de tratamento e verificação de interações medicamentosas.",
    icon: <Brain className="h-6 w-6 text-primary" />,
    tip: "Use comandos como 'dor de cabeça', 'verificar estoque' ou 'protocolo para queimadura'.",
  },
  {
    id: "supplies",
    title: "Gestão de Estoque Inteligente",
    description: "Monitore medicamentos com alertas automáticos de validade e estoque mínimo.",
    icon: <Pill className="h-6 w-6 text-primary" />,
    tip: "Configure alertas para 30, 60 ou 90 dias antes do vencimento.",
  },
];

export default function EnhancedInfirmaryDashboard() {
  const navigate = useNavigate();
  const { supplies, records, stats, isLoading } = useInfirmaryRealData();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente médico do Nautilus. Posso ajudar com triagem, medicamentos e protocolos de primeiros socorros. Como posso ajudar?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewFeature, setShowNewFeature] = useState(true);

  const navigateToTab = (tab: string) => {
    navigate(`/medical-infirmary?tab=${tab}`);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    setIsTyping(true);
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        dor: "Para dor de cabeça leve a moderada: Paracetamol 500mg (1-2 comprimidos) ou Dipirona 1g. Máximo 4x ao dia. Se persistir por mais de 48h, considere avaliação médica via telemedicina.",
        corte: "Protocolo para cortes: 1) Lavar com soro fisiológico, 2) Aplicar antisséptico, 3) Curativo oclusivo. Se profundo (>2cm) ou sangramento intenso, considere sutura. Verificar vacina antitetânica.",
        estoque: `📦 Resumo do Estoque:\n• Itens em baixa: ${stats.lowStockItems}\n• Vencendo em 90 dias: ${stats.expiringItems}\n\nRecomendo solicitar reposição imediata via módulo de Compras.`,
        queimadura: "🔥 Protocolo Queimadura:\n1. Afastar da fonte de calor\n2. Resfriar com água corrente por 10-20min\n3. Cobrir com gaze estéril\n4. Avaliar grau e extensão\n\n⚠️ Queimaduras > 20% ou em face/vias aéreas: Evacuação imediata.",
        default: "Entendi. Posso ajudar com:\n• Triagem de sintomas\n• Protocolos de primeiros socorros\n• Verificar interações medicamentosas\n• Gerar relatórios de atendimento\n\nO que precisa?",
      };
      
      const key = chatMessage.toLowerCase().includes("dor") ? "dor" 
        : chatMessage.toLowerCase().includes("corte") || chatMessage.toLowerCase().includes("ferimento") ? "corte"
        : chatMessage.toLowerCase().includes("estoque") || chatMessage.toLowerCase().includes("medicamento") ? "estoque"
        : chatMessage.toLowerCase().includes("queimadura") ? "queimadura"
        : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
      setIsTyping(false);
    }, 1500);
    
    setChatMessage("");
  };

  // Generate actionable alerts from stats
  const generateAlerts = (): ActionableAlert[] => {
    const alerts: ActionableAlert[] = [];

    if (stats.lowStockItems > 0) {
      alerts.push({
        id: "low-stock",
        type: "critical",
        title: `${stats.lowStockItems} medicamentos com estoque baixo`,
        description: "Alguns itens estão abaixo do nível mínimo de segurança",
        timestamp: new Date(),
        source: "Estoque",
        actions: [
          {
            id: "order",
            label: "Solicitar Reposição",
            icon: <Package className="h-3 w-3" />,
            onClick: () => { navigateToTab("supplies"); },
          },
          {
            id: "view",
            label: "Ver Itens",
            variant: "outline",
            onClick: () => { navigateToTab("supplies"); },
          },
        ],
      });
    }

    if (stats.expiringItems > 0) {
      alerts.push({
        id: "expiring",
        type: "warning",
        title: `${stats.expiringItems} medicamentos vencendo`,
        description: "Itens com validade nos próximos 90 dias",
        timestamp: new Date(),
        source: "Validade",
        actions: [
          {
            id: "schedule",
            label: "Agendar Descarte",
            icon: <Calendar className="h-3 w-3" />,
            onClick: () => { navigateToTab("pharmacy"); },
          },
        ],
      });
    }

    if (stats.mlcCompliance < 100) {
      alerts.push({
        id: "mlc",
        type: "warning",
        title: "Conformidade MLC incompleta",
        description: `Atual: ${stats.mlcCompliance}% - Verificar pendências`,
        timestamp: new Date(),
        source: "Compliance",
        actions: [
          {
            id: "checklist",
            label: "Abrir Checklist",
            icon: <ClipboardList className="h-3 w-3" />,
            onClick: () => { navigateToTab("mlc"); },
          },
        ],
      });
    }

    return alerts;
  };

  const quickActions = [
    {
      id: "new-attendance",
      label: "Novo Atendimento",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigateToTab("consultations"),
      variant: "default" as const,
    },
    {
      id: "telemedicine",
      label: "Telemedicina",
      icon: <Phone className="h-4 w-4" />,
      onClick: () => navigateToTab("telemedicine"),
      variant: "success" as const,
    },
    {
      id: "emergency",
      label: "Emergência",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: () => navigateToTab("emergency"),
      variant: "danger" as const,
      badge: "24/7",
    },
    {
      id: "inventory",
      label: "Inventário",
      icon: <ClipboardList className="h-4 w-4" />,
      onClick: () => navigateToTab("supplies"),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onboarding */}
      <div className="flex items-center justify-between">
        <ModuleOnboarding
          moduleKey="infirmary"
          moduleName="Enfermaria Digital"
          steps={ONBOARDING_STEPS}
          onComplete={() => toast.success("Tutorial concluído! Explore todas as funcionalidades.")}
        />
      </div>

      {/* New Feature Highlight */}
      <AnimatePresence>
        {showNewFeature && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FeatureHighlight
              title="Telemedicina Integrada"
              description="Conecte-se com médicos em terra para consultas remotas em tempo real. Disponível 24/7."
              icon={<Phone className="h-5 w-5 text-primary" />}
              isNew
              onDismiss={() => setShowNewFeature(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <QuickActionsBar actions={quickActions} />

      {/* Interactive KPI Grid */}
      <KPIGrid columns={5}>
        <InteractiveKPICard
          title="Atendimentos (Mês)"
          value={stats.attendanceMonth}
          subtitle={`${stats.monitoring} em monitoramento`}
          icon={<Stethoscope className="h-6 w-6 text-primary" />}
          status="good"
          trend={12}
          trendLabel="vs mês anterior"
          tooltip="Total de atendimentos realizados no mês atual"
          details={[
            { label: "Emergências", value: Math.floor(stats.attendanceMonth * 0.15) },
            { label: "Rotina", value: Math.floor(stats.attendanceMonth * 0.85) },
          ]}
          onDrillDown={() => navigateToTab("consultations")}
        />

        <InteractiveKPICard
          title="Tripulação Saudável"
          value={`${stats.healthyPercentage}%`}
          subtitle={`${stats.healthyCrew}/${stats.totalCrew} aptos`}
          icon={<Heart className="h-6 w-6 text-green-500" />}
          status="good"
          progress={stats.healthyPercentage}
          progressLabel="Meta: 95%"
          tooltip="Percentual de tripulantes com exames em dia"
          details={[
            { label: "Aptos", value: stats.healthyCrew },
            { label: "Afastados", value: stats.totalCrew - stats.healthyCrew },
          ]}
        />

        <InteractiveKPICard
          title="Medicamentos Vencendo"
          value={stats.expiringItems}
          subtitle="Próximos 90 dias"
          icon={<Pill className="h-6 w-6 text-amber-500" />}
          status={stats.expiringItems > 5 ? "warning" : "good"}
          trend={stats.expiringItems > 0 ? 8 : 0}
          tooltip="Medicamentos com validade próxima"
          onDrillDown={() => navigateToTab("pharmacy")}
        />

        <InteractiveKPICard
          title="Estoque Baixo"
          value={stats.lowStockItems}
          subtitle="Reposição urgente"
          icon={<Package className="h-6 w-6 text-destructive" />}
          status={stats.lowStockItems > 0 ? "critical" : "good"}
          tooltip="Itens abaixo do nível mínimo de segurança"
          onDrillDown={() => navigateToTab("supplies")}
          drillDownLabel="Solicitar Reposição"
        />

        <InteractiveKPICard
          title="Conformidade MLC"
          value={`${stats.mlcCompliance}%`}
          subtitle="Certificado válido"
          icon={<ShieldCheck className="h-6 w-6 text-blue-500" />}
          status={stats.mlcCompliance >= 95 ? "good" : "warning"}
          progress={stats.mlcCompliance}
          progressLabel="Regulação 4.1"
          tooltip="Conformidade com MLC 2006 - Maritime Labour Convention"
          details={[
            { label: "Exames OK", value: "98%" },
            { label: "Vacinas OK", value: "100%" },
          ]}
        />
      </KPIGrid>

      {/* Alerts and AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actionable Alerts */}
        <ActionableAlerts
          alerts={generateAlerts()}
          title="Pendências & Alertas"
          maxHeight="380px"
          emptyMessage="Tudo em ordem!"
          className="lg:col-span-1"
        />

        {/* AI Medical Assistant */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Assistente Médico IA
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Triagem Inteligente
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 overflow-y-auto space-y-3 mb-4 p-3 bg-background/50 rounded-lg border">
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-line ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Descreva sintomas ou dúvidas médicas..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: "Dor de cabeça", msg: "Protocolo para dor de cabeça" },
                { label: "Ferimentos", msg: "Como tratar corte profundo?" },
                { label: "Queimadura", msg: "Protocolo para queimadura" },
                { label: "Estoque", msg: "Verificar situação do estoque" },
              ].map((suggestion) => (
                <Button
                  key={suggestion.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setChatMessage(suggestion.msg)}
                  className="text-xs"
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records with enhanced display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Atendimentos Recentes
            </CardTitle>
            <Button size="sm" className="gap-2" onClick={() => navigateToTab("consultations")}>
              <Plus className="h-4 w-4" />
              Novo Atendimento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhum atendimento recente</p>
                <p className="text-sm">Os atendimentos aparecerão aqui</p>
              </div>
            ) : (
              records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        record.type === "Emergência" 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {record.type === "Emergência" ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <Stethoscope className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{record.crewMember}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.date} • {record.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      record.status === "resolved" ? "default" 
                        : record.status === "monitoring" ? "secondary" 
                        : "destructive"
                    }>
                      {record.status === "resolved" ? "Resolvido" 
                        : record.status === "monitoring" ? "Monitorando" 
                        : "Encaminhado"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sintomas</p>
                      <p>{record.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tratamento</p>
                      <p>{record.treatment}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
