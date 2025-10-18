// ETAPA 32.1: AI-Powered External Audit Simulation Component
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, FileText, Download, AlertTriangle, CheckCircle } from "lucide-react";
import html2pdf from "html2pdf.js";

interface AuditResult {
  conformities: string[];
  nonConformities: Array<{
    severity: string;
    description: string;
    clause: string;
  }>;
  scoresByNorm: Record<string, number>;
  technicalReport: string;
  actionPlan: Array<{
    priority: string;
    action: string;
    deadline: string;
  }>;
}

interface AuditSimulation {
  success: boolean;
  auditId: string;
  vesselName: string;
  auditType: string;
  norms: string[];
  result: AuditResult;
  simulatedAt: string;
}

const AUDIT_TYPES = [
  { value: "Petrobras", label: "Petrobras (PEO-DP)", norms: ["PEO-DP", "NR-30"] },
  { value: "IBAMA", label: "IBAMA (SGSO)", norms: ["SGSO", "NR-30", "ISO-14001"] },
  { value: "IMO", label: "IMO (ISM/MODU Code)", norms: ["ISM-Code", "MODU-Code", "SOLAS"] },
  { value: "ISO", label: "ISO (9001/14001/45001)", norms: ["ISO-9001", "ISO-14001", "ISO-45001"] },
  { value: "IMCA", label: "IMCA", norms: ["IMCA-M182", "IMCA-M103", "IMCA-M206"] },
];

export const AuditSimulator: React.FC = () => {
  const [vesselName, setVesselName] = useState("");
  const [auditType, setAuditType] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditSimulation | null>(null);

  const handleSimulate = async () => {
    if (!vesselName || !auditType) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const selectedAudit = AUDIT_TYPES.find((a) => a.value === auditType);
      if (!selectedAudit) {
        throw new Error("Tipo de auditoria inválido");
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      // Call audit-simulate edge function
      const { data, error } = await supabase.functions.invoke("audit-simulate", {
        body: {
          vesselId: vesselName.toLowerCase().replace(/\s+/g, "-"),
          vesselName,
          auditType: selectedAudit.value,
          norms: selectedAudit.norms,
        },
      });

      if (error) throw error;

      setAuditResult(data);
      toast.success("Simulação de auditoria concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao simular auditoria:", error);
      toast.error(error.message || "Erro ao simular auditoria");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!auditResult) return;

    const element = document.getElementById("audit-report");
    const opt = {
      margin: 1,
      filename: `auditoria-${auditResult.vesselName}-${auditResult.auditType}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    toast.success("PDF gerado com sucesso!");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "alta":
        return "destructive";
      case "média":
        return "default";
      case "baixa":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "destructive";
      case "média":
        return "default";
      case "baixa":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulação de Auditoria Externa com IA</CardTitle>
          <CardDescription>
            Simule auditorias técnicas de entidades certificadoras usando inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel">Nome da Embarcação</Label>
              <input
                id="vessel"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Ex: Navio Alpha"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditType">Tipo de Auditoria</Label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger id="auditType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSimulate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulando auditoria...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Simular Auditoria
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {auditResult && (
        <Card id="audit-report">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Relatório de Auditoria - {auditResult.vesselName}</CardTitle>
                <CardDescription>
                  {auditResult.auditType} | {new Date(auditResult.simulatedAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </div>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scores por Norma */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Scores por Norma</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(auditResult.result.scoresByNorm).map(([norm, score]) => (
                  <Card key={norm}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{score}</div>
                        <div className="text-sm text-muted-foreground">{norm}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Conformidades */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Conformidades ({auditResult.result.conformities.length})
              </h3>
              <ul className="space-y-2">
                {auditResult.result.conformities.map((conformity, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{conformity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Não Conformidades */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                Não Conformidades ({auditResult.result.nonConformities.length})
              </h3>
              <div className="space-y-3">
                {auditResult.result.nonConformities.map((nc, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getSeverityColor(nc.severity)}>{nc.severity}</Badge>
                        <span className="text-xs text-muted-foreground">{nc.clause}</span>
                      </div>
                      <p className="text-sm">{nc.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Relatório Técnico */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Relatório Técnico</h3>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{auditResult.result.technicalReport}</p>
              </div>
            </div>

            {/* Plano de Ação */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Plano de Ação Recomendado</h3>
              <div className="space-y-3">
                {auditResult.result.actionPlan.map((action, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getPriorityColor(action.priority)}>
                          Prioridade: {action.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Prazo: {action.deadline}</span>
                      </div>
                      <p className="text-sm font-medium">{action.action}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
