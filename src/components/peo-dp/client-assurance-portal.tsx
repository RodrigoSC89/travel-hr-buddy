import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Ship,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  Activity,
  Anchor,
  Users,
  Calendar,
  TrendingUp,
  Lock,
  Globe,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface VesselStatus {
  id: string;
  name: string;
  dpClass: "DP-1" | "DP-2" | "DP-3";
  currentMode: "Auto DP" | "TAM" | "CAM" | "Joystick" | "Manual";
  position: { lat: number; lon: number };
  heading: number;
  operationalStatus: "green" | "yellow" | "red";
  complianceScore: number;
  lastAudit: string;
  nextAudit: string;
  activeCrew: number;
  asogStatus: "within_limits" | "approaching_limits" | "exceeded";
}

interface ComplianceItem {
  id: string;
  category: string;
  item: string;
  status: "compliant" | "pending" | "non_compliant";
  dueDate?: string;
  lastVerified: string;
}

interface OperationalEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

const mockVessel: VesselStatus = {
  id: "VSL-001",
  name: "MV Atlantic Explorer",
  dpClass: "DP-2",
  currentMode: "Auto DP",
  position: { lat: -22.9068, lon: -43.1729 },
  heading: 145,
  operationalStatus: "green",
  complianceScore: 94,
  lastAudit: "2024-11-15",
  nextAudit: "2025-02-15",
  activeCrew: 3,
  asogStatus: "within_limits"
};

const mockComplianceItems: ComplianceItem[] = [
  { id: "C001", category: "Documentação", item: "DPOM Atualizado", status: "compliant", lastVerified: "2024-12-01" },
  { id: "C002", category: "Documentação", item: "ASOG Revisado", status: "compliant", lastVerified: "2024-11-28" },
  { id: "C003", category: "Documentação", item: "FMEA Válido", status: "compliant", lastVerified: "2024-10-15" },
  { id: "C004", category: "Certificações", item: "DP Annual Trial", status: "compliant", lastVerified: "2024-09-20" },
  { id: "C005", category: "Certificações", item: "Class DP Certificate", status: "compliant", lastVerified: "2024-08-10" },
  { id: "C006", category: "Tripulação", item: "DPO Certificates", status: "compliant", lastVerified: "2024-12-01" },
  { id: "C007", category: "Tripulação", item: "CPD em Dia", status: "pending", dueDate: "2024-12-31", lastVerified: "2024-11-15" },
  { id: "C008", category: "Manutenção", item: "PMS DP Equipment", status: "compliant", lastVerified: "2024-11-30" }
];

const mockEvents: OperationalEvent[] = [
  { id: "E001", timestamp: new Date().toISOString(), type: "Status", description: "Sistema DP operando normalmente em Auto DP", severity: "info" },
  { id: "E002", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "Watch", description: "Watch handover concluído - SDPO assumiu", severity: "info" },
  { id: "E003", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "Ambiental", description: "Condições ambientais dentro dos limites ASOG", severity: "info" },
  { id: "E004", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "Operação", description: "Início de operação de posicionamento para ROV", severity: "info" }
];

export const ClientAssurancePortal: React.FC = () => {
  const [vessel] = useState<VesselStatus>(mockVessel);
  const [complianceItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [events] = useState<OperationalEvent[]>(mockEvents);
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
    case "green": case "compliant": case "within_limits": return "text-green-500";
    case "yellow": case "pending": case "approaching_limits": return "text-yellow-500";
    case "red": case "non_compliant": case "exceeded": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "compliant": return <Badge className="bg-green-500">Conforme</Badge>;
    case "pending": return <Badge className="bg-yellow-500 text-black">Pendente</Badge>;
    case "non_compliant": return <Badge variant="destructive">Não Conforme</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const compliantCount = complianceItems.filter(i => i.status === "compliant").length;
  const pendingCount = complianceItems.filter(i => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Client Assurance Portal</h2>
            <p className="text-muted-foreground">Visibilidade em tempo real para clientes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Acesso Controlado
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />Relatório
          </Button>
        </div>
      </div>

      {/* Vessel Overview Card */}
      <Card className={`border-2 ${vessel.operationalStatus === "green" ? "border-green-500 bg-green-500/5" : vessel.operationalStatus === "yellow" ? "border-yellow-500 bg-yellow-500/5" : "border-red-500 bg-red-500/5"}`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${vessel.operationalStatus === "green" ? "bg-green-500/20" : vessel.operationalStatus === "yellow" ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
                <Ship className={`h-8 w-8 ${getStatusColor(vessel.operationalStatus)}`} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{vessel.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{vessel.dpClass}</Badge>
                  <Badge className={vessel.operationalStatus === "green" ? "bg-green-500" : vessel.operationalStatus === "yellow" ? "bg-yellow-500 text-black" : "bg-red-500"}>
                    {vessel.operationalStatus === "green" ? "Operacional" : vessel.operationalStatus === "yellow" ? "Atenção" : "Crítico"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Modo DP Atual</p>
              <p className="text-2xl font-bold">{vessel.currentMode}</p>
              <Badge variant="outline" className="mt-1">
                <Activity className="h-3 w-3 mr-1" />Ativo
              </Badge>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className={`text-3xl font-bold ${vessel.complianceScore >= 90 ? "text-green-500" : vessel.complianceScore >= 70 ? "text-yellow-500" : "text-red-500"}`}>
                {vessel.complianceScore}%
              </p>
              <Progress value={vessel.complianceScore} className="h-2 mt-2" />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Status ASOG</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {vessel.asogStatus === "within_limits" ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-medium text-green-500">Dentro dos Limites</span>
                  </>
                ) : vessel.asogStatus === "approaching_limits" ? (
                  <>
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <span className="font-medium text-yellow-500">Próximo ao Limite</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <span className="font-medium text-red-500">Limite Excedido</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2"><Shield className="w-4 h-4" />Compliance</TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2"><Activity className="w-4 h-4" />Operações</TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2"><FileText className="w-4 h-4" />Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Última Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-xl font-bold">{new Date(vessel.lastAudit).toLocaleDateString("pt-BR")}</p>
                    <p className="text-sm text-muted-foreground">PEO-DP Completo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Próxima Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-xl font-bold">{new Date(vessel.nextAudit).toLocaleDateString("pt-BR")}</p>
                    <p className="text-sm text-muted-foreground">Em 73 dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Equipe DP Ativa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-xl font-bold">{vessel.activeCrew} DPOs</p>
                    <p className="text-sm text-muted-foreground">Todos certificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Position Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5" />
                Posição Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="text-lg font-mono">{vessel.position.lat.toFixed(4)}°</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="text-lg font-mono">{vessel.position.lon.toFixed(4)}°</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heading</p>
                  <p className="text-lg font-mono">{vessel.heading}°</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-2xl font-bold mt-2">{compliantCount}</p>
                <p className="text-sm text-muted-foreground">Conformes</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardContent className="pt-4 text-center">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto" />
                <p className="text-2xl font-bold mt-2">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4 text-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mx-auto" />
                <p className="text-2xl font-bold mt-2">{Math.round((compliantCount / complianceItems.length) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Itens de Compliance</CardTitle>
              <CardDescription>Status detalhado de conformidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {complianceItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.status === "compliant" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : item.status === "pending" ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{item.item}</p>
                          <p className="text-xs text-muted-foreground">{item.category} • Verificado: {new Date(item.lastVerified).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.dueDate && <span className="text-xs text-muted-foreground">Vence: {new Date(item.dueDate).toLocaleDateString("pt-BR")}</span>}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Eventos Operacionais (Últimas 24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className={`p-3 rounded-lg border-l-4 ${event.severity === "critical" ? "border-l-red-500 bg-red-500/5" : event.severity === "warning" ? "border-l-yellow-500 bg-yellow-500/5" : "border-l-blue-500 bg-blue-500/5"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{event.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="mt-1">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Disponíveis</CardTitle>
              <CardDescription>Documentação de compliance e operacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "DPOM - DP Operations Manual", date: "2024-10-15", type: "PDF" },
                  { name: "ASOG - Activity Specific Operating Guidelines", date: "2024-11-28", type: "PDF" },
                  { name: "FMEA - Failure Mode and Effect Analysis", date: "2024-09-20", type: "PDF" },
                  { name: "CAMO - Critical Activity Mode of Operation", date: "2024-10-01", type: "PDF" },
                  { name: "Último Relatório de Auditoria PEO-DP", date: "2024-11-15", type: "PDF" },
                  { name: "Certificados da Equipe DP", date: "2024-12-01", type: "ZIP" }
                ].map((doc, i) => (
                  <div key={i} className="p-3 rounded-lg border flex items-center justify-between hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">Atualizado: {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{doc.type}</Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-1" />Ver
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientAssurancePortal;
