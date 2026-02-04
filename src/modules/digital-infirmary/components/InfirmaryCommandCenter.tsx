/**
 * Infirmary Command Center - Premium Medical Dashboard
 * Centro de Comando da Enfermaria Digital
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Stethoscope, Heart, Users, Pill, FileText, AlertTriangle, 
  Activity, Brain, Calendar, Plus, Search, Clock, CheckCircle,
  TrendingUp, Video, Phone, Syringe, Thermometer, Clipboard,
  User, MapPin, Ship, Shield, AlertCircle, ArrowRight, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Mock data for demo - should be replaced with real Supabase queries
const crewHealthData = [
  { id: "1", name: "João Silva", vessel: "MV Atlântico Sul", status: "fit", lastExam: "2026-01-15", nextExam: "2026-07-15", risk: "low" },
  { id: "2", name: "Maria Santos", vessel: "MV Horizonte", status: "fit", lastExam: "2025-12-20", nextExam: "2026-06-20", risk: "low" },
  { id: "3", name: "Pedro Costa", vessel: "MV Oceano", status: "restricted", lastExam: "2026-01-08", nextExam: "2026-04-08", risk: "medium" },
  { id: "4", name: "Ana Lima", vessel: "MV Atlântico Sul", status: "fit", lastExam: "2025-11-30", nextExam: "2026-05-30", risk: "low" },
  { id: "5", name: "Carlos Mendes", vessel: "MV Horizonte", status: "pending", lastExam: "2025-06-15", nextExam: "2025-12-15", risk: "high" },
];

const activeConsultations = [
  { id: "1", patient: "Roberto Alves", type: "Emergência", priority: "high", startTime: "08:30", doctor: "Dr. Costa", status: "in_progress" },
  { id: "2", patient: "Paulo Ferreira", type: "Rotina", priority: "normal", startTime: "09:00", doctor: "Dra. Lima", status: "waiting" },
  { id: "3", patient: "Fernando Dias", type: "Retorno", priority: "normal", startTime: "09:30", doctor: "Dr. Costa", status: "waiting" },
];

const medicationAlerts = [
  { id: "1", medication: "Ciprofloxacino 500mg", issue: "Estoque crítico", quantity: 15, minStock: 30, expiry: "2026-04" },
  { id: "2", medication: "Dramin B6", issue: "Estoque baixo", quantity: 45, minStock: 50, expiry: "2026-06" },
  { id: "3", medication: "Insulina NPH", issue: "Próximo a vencer", quantity: 20, minStock: 10, expiry: "2026-03" },
];

const emergencyProtocols = [
  { id: "1", name: "Parada Cardiorrespiratória", code: "CODE BLUE", lastDrill: "2026-01-15", status: "active" },
  { id: "2", name: "Afogamento", code: "CODE AQUA", lastDrill: "2026-01-20", status: "active" },
  { id: "3", name: "Trauma Grave", code: "CODE RED", lastDrill: "2026-01-25", status: "active" },
  { id: "4", name: "Evacuação Médica", code: "MEDEVAC", lastDrill: "2026-01-10", status: "active" },
];

const aiInsights = [
  { id: "1", type: "prediction", message: "3 tripulantes com exames vencendo nos próximos 15 dias", priority: "warning", action: "Agendar exames" },
  { id: "2", type: "optimization", message: "Padrão de consultas às segundas sugere escala adicional", priority: "info", action: "Ajustar escala" },
  { id: "3", type: "alert", message: "Estoque de medicamentos críticos abaixo do nível seguro", priority: "critical", action: "Solicitar reposição" },
];

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    fit: { label: "Apto", className: "bg-success/10 text-success border-success/20" },
    restricted: { label: "Restrição", className: "bg-warning/10 text-warning border-warning/20" },
    pending: { label: "Pendente", className: "bg-destructive/10 text-destructive border-destructive/20" },
    unfit: { label: "Inapto", className: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const variant = variants[status] || variants.pending;
  return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
}

function RiskIndicator({ risk }: { risk: string }) {
  const colors: Record<string, string> = {
    low: "bg-success",
    medium: "bg-warning",
    high: "bg-destructive",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[risk] || colors.low}`} />
      <span className="text-xs text-muted-foreground capitalize">{risk}</span>
    </div>
  );
}

export default function InfirmaryCommandCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleEmergencyProtocol = (protocol: string) => {
    toast.warning(`Protocolo ${protocol} acionado! Equipe de emergência notificada.`);
  };

  const handleTelemedicine = () => {
    toast.success("Iniciando sessão de telemedicina...");
  };

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Aptos</p>
                  <p className="text-2xl font-bold text-success">239</p>
                  <p className="text-xs">96.8% da tripulação</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Atendimentos Hoje</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs">3 em andamento</p>
                </div>
                <Stethoscope className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Exames Pendentes</p>
                  <p className="text-2xl font-bold text-warning">8</p>
                  <p className="text-xs">5 urgentes</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alertas Estoque</p>
                  <p className="text-2xl font-bold text-destructive">3</p>
                  <p className="text-xs">1 crítico</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Score Saúde</p>
                  <p className="text-2xl font-bold text-purple-600">94%</p>
                  <p className="text-xs">Excelente</p>
                </div>
                <Heart className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Consultations and Crew */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Consultations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Consultas em Andamento
                </CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Consulta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${consultation.priority === "high" ? "bg-destructive/10" : "bg-primary/10"}`}>
                        <User className={`h-4 w-4 ${consultation.priority === "high" ? "text-destructive" : "text-primary"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{consultation.patient}</p>
                        <p className="text-sm text-muted-foreground">{consultation.type} • {consultation.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={consultation.status === "in_progress" ? "default" : "secondary"}>
                        {consultation.status === "in_progress" ? "Em atendimento" : "Aguardando"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{consultation.startTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crew Health Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Status de Saúde da Tripulação
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar tripulante..." 
                      className="pl-8 h-8 w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-2">
                  {crewHealthData
                    .filter(crew => crew.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((crew) => (
                    <div key={crew.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{crew.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Ship className="h-3 w-3" />
                            <span>{crew.vessel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <RiskIndicator risk={crew.risk} />
                        <StatusBadge status={crew.status} />
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Próx. exame</p>
                          <p className="font-medium">{crew.nextExam}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Alerts and Actions */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Insights IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className={`p-3 rounded-lg border ${
                    insight.priority === "critical" ? "border-destructive/50 bg-destructive/5" :
                    insight.priority === "warning" ? "border-warning/50 bg-warning/5" :
                    "border-primary/50 bg-primary/5"
                  }`}>
                    <p className="text-sm font-medium">{insight.message}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1">
                      {insight.action}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medication Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-destructive" />
                Alertas de Medicamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicationAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{alert.medication}</p>
                      <Badge variant="destructive" className="text-xs">{alert.issue}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Qtd: {alert.quantity}/{alert.minStock}</span>
                      <span>Validade: {alert.expiry}</span>
                    </div>
                    <Progress 
                      value={(alert.quantity / alert.minStock) * 100} 
                      className="h-1 mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Protocols */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Protocolos de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emergencyProtocols.map((protocol) => (
                  <Button 
                    key={protocol.id}
                    variant="outline" 
                    className="w-full justify-between h-auto py-2 hover:bg-destructive/10 hover:border-destructive"
                    onClick={() => handleEmergencyProtocol(protocol.code)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{protocol.name}</p>
                      <p className="text-xs text-muted-foreground">Último drill: {protocol.lastDrill}</p>
                    </div>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">
                      {protocol.code}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="outline" onClick={handleTelemedicine}>
                <Video className="h-4 w-4" />
                Iniciar Telemedicina
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Calendar className="h-4 w-4" />
                Agendar Exame
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                Relatório MLC 2006
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Phone className="h-4 w-4" />
                Contato TMAS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
