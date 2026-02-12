/**
 * MARPOL Compliance Panel - Gestão de Compliance MARPOL
 * Monitoramento de conformidade com todos os Anexos MARPOL
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, AlertTriangle, CheckCircle2, Clock, FileText, Download,
  Calendar, Ship, Droplets, Fuel, Trash2, Wind, Globe, Eye,
  ArrowRight, ChevronRight, Bell, Settings, RefreshCw
} from "lucide-react";

interface MarpolAnnex {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "compliant" | "pending" | "at_risk" | "non_compliant";
  lastAudit: string;
  nextAudit: string;
  requirements: {
    name: string;
    status: "met" | "pending" | "not_met";
    dueDate?: string;
  }[];
  documents: number;
  actions: number;
}

interface VesselCompliance {
  id: string;
  name: string;
  type: string;
  overallStatus: "compliant" | "pending" | "at_risk";
  annexCompliance: {
    annex: string;
    status: "compliant" | "pending" | "at_risk" | "non_compliant";
  }[];
  certificates: number;
  expiringSoon: number;
}

// Mock data
const marpolAnnexes: MarpolAnnex[] = [
  {
    id: "1", number: "I", title: "Prevenção de Poluição por Óleo",
    description: "Regulamentos sobre descarga de óleo e resíduos oleosos",
    status: "compliant", lastAudit: "2025-11-15", nextAudit: "2026-05-15",
    requirements: [
      { name: "Oil Record Book atualizado", status: "met" },
      { name: "Separador de água oleosa operacional", status: "met" },
      { name: "Certificado IOPP válido", status: "met" },
      { name: "Plano de emergência SOPEP", status: "met" }
    ],
    documents: 12, actions: 0
  },
  {
    id: "2", number: "II", title: "Substâncias Nocivas Líquidas",
    description: "Controle de poluição por substâncias nocivas a granel",
    status: "compliant", lastAudit: "2025-10-20", nextAudit: "2026-04-20",
    requirements: [
      { name: "Cargo Record Book", status: "met" },
      { name: "Procedimentos P&A", status: "met" },
      { name: "Manual de operações", status: "met" }
    ],
    documents: 8, actions: 0
  },
  {
    id: "3", number: "III", title: "Substâncias Nocivas Embaladas",
    description: "Prevenção de poluição por substâncias em embalagens",
    status: "pending", lastAudit: "2025-09-10", nextAudit: "2026-03-10",
    requirements: [
      { name: "Certificado de estiva", status: "met" },
      { name: "Documentação IMDG", status: "pending", dueDate: "2026-02-28" },
      { name: "Treinamento equipe", status: "met" }
    ],
    documents: 6, actions: 1
  },
  {
    id: "4", number: "IV", title: "Prevenção de Poluição por Esgoto",
    description: "Regulamentos sobre descarga de esgoto sanitário",
    status: "compliant", lastAudit: "2025-12-01", nextAudit: "2026-06-01",
    requirements: [
      { name: "Sistema de tratamento certificado", status: "met" },
      { name: "Certificado ISPP", status: "met" },
      { name: "Registros de descarga", status: "met" }
    ],
    documents: 5, actions: 0
  },
  {
    id: "5", number: "V", title: "Prevenção de Poluição por Lixo",
    description: "Gestão e descarte de resíduos sólidos",
    status: "at_risk", lastAudit: "2025-08-15", nextAudit: "2026-02-15",
    requirements: [
      { name: "Garbage Record Book", status: "met" },
      { name: "Plano de gestão de lixo", status: "pending", dueDate: "2026-02-10" },
      { name: "Placards visíveis", status: "not_met", dueDate: "2026-02-05" },
      { name: "Treinamento equipe", status: "pending", dueDate: "2026-02-20" }
    ],
    documents: 7, actions: 3
  },
  {
    id: "6", number: "VI", title: "Prevenção de Poluição Atmosférica",
    description: "Controle de emissões SOx, NOx e substâncias que destroem ozônio",
    status: "compliant", lastAudit: "2025-11-30", nextAudit: "2026-05-30",
    requirements: [
      { name: "Certificado IAPP", status: "met" },
      { name: "Combustível 0.5% S", status: "met" },
      { name: "Bunker Delivery Notes", status: "met" },
      { name: "SEEMP implementado", status: "met" },
      { name: "CII monitorado", status: "met" }
    ],
    documents: 15, actions: 0
  }
];

const vesselCompliance: VesselCompliance[] = [
  {
    id: "1", name: "MV Atlântico Sul", type: "Bulk Carrier",
    overallStatus: "compliant",
    annexCompliance: [
      { annex: "I", status: "compliant" },
      { annex: "II", status: "compliant" },
      { annex: "IV", status: "compliant" },
      { annex: "V", status: "compliant" },
      { annex: "VI", status: "compliant" }
    ],
    certificates: 18, expiringSoon: 0
  },
  {
    id: "2", name: "PSV Oceano Azul", type: "Platform Supply Vessel",
    overallStatus: "pending",
    annexCompliance: [
      { annex: "I", status: "compliant" },
      { annex: "IV", status: "pending" },
      { annex: "V", status: "compliant" },
      { annex: "VI", status: "compliant" }
    ],
    certificates: 14, expiringSoon: 2
  },
  {
    id: "3", name: "AHTS Maré Alta", type: "Anchor Handling Tug",
    overallStatus: "at_risk",
    annexCompliance: [
      { annex: "I", status: "compliant" },
      { annex: "IV", status: "compliant" },
      { annex: "V", status: "at_risk" },
      { annex: "VI", status: "pending" }
    ],
    certificates: 12, expiringSoon: 3
  }
];

export function MARPOLCompliancePanel() {
  const [selectedAnnex, setSelectedAnnex] = useState<MarpolAnnex | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      compliant: { label: "Conforme", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      at_risk: { label: "Em Risco", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
      non_compliant: { label: "Não Conforme", className: "bg-red-500/10 text-red-600 border-red-500/20" }
    };
    const c = config[status] || config.pending;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getAnnexIcon = (number: string) => {
    const icons: Record<string, React.ReactNode> = {
      "I": <Droplets className="h-5 w-5" />,
      "II": <Fuel className="h-5 w-5" />,
      "III": <FileText className="h-5 w-5" />,
      "IV": <Trash2 className="h-5 w-5" />,
      "V": <Trash2 className="h-5 w-5" />,
      "VI": <Wind className="h-5 w-5" />
    };
    return icons[number] || <Shield className="h-5 w-5" />;
  };

  const compliantCount = marpolAnnexes.filter(a => a.status === "compliant").length;
  const pendingCount = marpolAnnexes.filter(a => a.status === "pending").length;
  const atRiskCount = marpolAnnexes.filter(a => a.status === "at_risk" || a.status === "non_compliant").length;
  const totalActions = marpolAnnexes.reduce((sum, a) => sum + a.actions, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Conformes</p>
                <p className="text-2xl font-bold text-green-600">{compliantCount}/{marpolAnnexes.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Em Risco</p>
                <p className="text-2xl font-bold text-orange-600">{atRiskCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Ações Pendentes</p>
                <p className="text-2xl font-bold">{totalActions}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="vessels">Por Embarcação</TabsTrigger>
          <TabsTrigger value="actions">Ações Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Annexes List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Anexos MARPOL
                  </CardTitle>
                  <CardDescription>
                    Status de conformidade com todos os anexos da convenção MARPOL
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marpolAnnexes.map((annex, idx) => (
                      <motion.div
                        key={annex.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedAnnex?.id === annex.id ? "ring-2 ring-primary" : ""
                          } ${annex.status === "at_risk" ? "border-orange-500/50" : ""}`}
                          onClick={() => setSelectedAnnex(annex)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                annex.status === "compliant" ? "bg-green-500/10 text-green-600" :
                                annex.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                                "bg-orange-500/10 text-orange-600"
                              }`}>
                                {getAnnexIcon(annex.number)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold">Anexo {annex.number}</span>
                                  {getStatusBadge(annex.status)}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {annex.title}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {annex.documents} docs
                                  </span>
                                  {annex.actions > 0 && (
                                    <span className="flex items-center gap-1 text-orange-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      {annex.actions} ações
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Annex Details */}
            <div>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-primary" />
                    Detalhes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAnnex ? (
                    <ScrollArea className="h-[450px] pr-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Anexo {selectedAnnex.number}</h3>
                          {getStatusBadge(selectedAnnex.status)}
                        </div>
                        <p className="text-sm">{selectedAnnex.title}</p>
                        <p className="text-xs text-muted-foreground">{selectedAnnex.description}</p>

                        <Separator />

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Última Auditoria</p>
                            <p className="font-medium">{selectedAnnex.lastAudit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Próxima Auditoria</p>
                            <p className="font-medium">{selectedAnnex.nextAudit}</p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-medium mb-3">Requisitos</h4>
                          <div className="space-y-2">
                            {selectedAnnex.requirements.map((req, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">{req.name}</span>
                                <Badge className={
                                  req.status === "met" ? "bg-green-500/10 text-green-600" :
                                  req.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                                  "bg-red-500/10 text-red-600"
                                }>
                                  {req.status === "met" ? "✓" : req.status === "pending" ? "⏳" : "✗"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Docs
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Mais
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                      <Shield className="h-12 w-12 mb-3 opacity-20" />
                      <p>Selecione um anexo</p>
                      <p className="text-sm">para ver os detalhes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vessels" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Compliance por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vesselCompliance.map((vessel, idx) => (
                  <motion.div
                    key={vessel.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Ship className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-semibold">{vessel.name}</p>
                              <p className="text-sm text-muted-foreground">{vessel.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(vessel.overallStatus)}
                            {vessel.expiringSoon > 0 && (
                              <Badge variant="destructive">
                                {vessel.expiringSoon} expirando
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {vessel.annexCompliance.map((ac) => (
                            <div
                              key={ac.annex}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                ac.status === "compliant" ? "bg-green-500/10 text-green-600" :
                                ac.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                                "bg-orange-500/10 text-orange-600"
                              }`}
                            >
                              Anexo {ac.annex}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Ações Pendentes
                <Badge variant="destructive" className="ml-2">{totalActions}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marpolAnnexes
                  .filter(a => a.actions > 0)
                  .flatMap(a => a.requirements.filter(r => r.status !== "met").map(r => ({ ...r, annex: a.number, annexTitle: a.title })))
                  .map((action) => (
                    <Card key={action.name} className="border-orange-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">{action.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Anexo {action.annex} - {action.annexTitle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {action.dueDate && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Prazo</p>
                                <p className="text-sm font-medium">{action.dueDate}</p>
                              </div>
                            )}
                            <Button size="sm">Resolver</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MARPOLCompliancePanel;
