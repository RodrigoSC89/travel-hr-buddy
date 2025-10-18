import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditResult {
  auditId: string;
  vesselName: string;
  auditType: string;
  auditEntity: string;
  normasAplicadas: string[];
  conformidades: string[];
  naoConformidades: Array<{
    item: string;
    severidade: string;
    norma: string;
  }>;
  scoresPorNorma: Record<string, number>;
  overallScore: number;
  relatorioTecnico: string;
  planoAcao: Array<{
    prioridade: number;
    acao: string;
    prazo: string;
  }>;
  simulatedDate: string;
}

const AUDIT_TYPES = [
  { value: "petrobras_peo_dp", label: "Petrobras (PEO-DP)" },
  { value: "ibama_sgso", label: "IBAMA (SGSO)" },
  { value: "imo_ism", label: "IMO (ISM Code)" },
  { value: "imo_modu", label: "IMO (MODU Code)" },
  { value: "iso_9001", label: "ISO 9001" },
  { value: "iso_14001", label: "ISO 14001" },
  { value: "iso_45001", label: "ISO 45001" },
  { value: "imca", label: "IMCA" },
];

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
  case "critical":
    return "bg-red-100 text-red-800 border-red-200";
  case "high":
    return "bg-orange-100 text-orange-800 border-orange-200";
  case "medium":
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  case "low":
    return "bg-blue-100 text-blue-800 border-blue-200";
  default:
    return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
};

export default function AuditSimulator() {
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [selectedAuditType, setSelectedAuditType] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch vessels
  const { data: vessels, isLoading: vesselsLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number, vessel_type")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const runSimulation = async () => {
    if (!selectedVesselId || !selectedAuditType) {
      toast.error("Selecione a embarcação e o tipo de auditoria");
      return;
    }

    setIsSimulating(true);
    setAuditResult(null);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/audit-simulate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vesselId: selectedVesselId,
            auditType: selectedAuditType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao simular auditoria");
      }

      const result = await response.json();
      setAuditResult(result);
      toast.success("Auditoria simulada com sucesso!");
    } catch (error) {
      console.error("Erro ao simular auditoria:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao simular auditoria");
    } finally {
      setIsSimulating(false);
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current || !auditResult) return;

    try {
      toast.info("Gerando PDF...");
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 295;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`auditoria-${auditResult.vesselName}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Simulação de Auditoria Externa
          </CardTitle>
          <CardDescription>
            Simule uma auditoria técnica com IA para avaliar conformidade normativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel">Embarcação</Label>
              <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
                <SelectTrigger id="vessel">
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vesselsLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    vessels?.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>
                        {vessel.name} {vessel.imo_number ? `(${vessel.imo_number})` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditType">Tipo de Auditoria</Label>
              <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
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

          <div className="flex gap-4 mt-6">
            <Button
              onClick={runSimulation}
              disabled={isSimulating || !selectedVesselId || !selectedAuditType}
              className="flex-1"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulando Auditoria...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Simular Auditoria
                </>
              )}
            </Button>
            {auditResult && (
              <Button onClick={exportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {auditResult && (
        <div ref={reportRef} className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Score Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <Progress value={auditResult.overallScore} className="h-4" />
                </div>
                <span className={`text-3xl font-bold ml-4 ${getScoreColor(auditResult.overallScore)}`}>
                  {auditResult.overallScore}%
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {Object.entries(auditResult.scoresPorNorma).map(([norma, score]) => (
                  <div key={norma} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{norma}</div>
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conformities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Conformidades Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {auditResult.conformidades.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Non-Conformities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Não Conformidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditResult.naoConformidades.map((nc, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-sm">{nc.item}</span>
                      <Badge className={getSeverityColor(nc.severidade)}>
                        {nc.severidade}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">Norma: {nc.norma}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Report */}
          <Card>
            <CardHeader>
              <CardTitle>Relatório Técnico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {auditResult.relatorioTecnico}
              </p>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Plano de Ação Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditResult.planoAcao.map((acao, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {acao.prioridade}. {acao.acao}
                      </span>
                      <Badge variant="outline">{acao.prazo}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
