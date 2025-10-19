import { useState } from "react";
import html2pdf from "html2pdf.js";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileDown, Ship, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// SGSO Requirements Data
const requisitosSGSO = [
  { num: 1, titulo: "Política de SMS", desc: "Estabelecimento e divulgação de política de segurança e meio ambiente." },
  { num: 2, titulo: "Planejamento Operacional", desc: "Planejamento com metas e indicadores de SMS." },
  { num: 3, titulo: "Treinamento e Capacitação", desc: "Capacitação adequada e documentada da tripulação." },
  { num: 4, titulo: "Comunicação e Acesso à Informação", desc: "Documentação e procedimentos acessíveis e atualizados." },
  { num: 5, titulo: "Gestão de Riscos", desc: "Identificação e controle de riscos operacionais." },
  { num: 6, titulo: "Equipamentos Críticos", desc: "Manutenção e inspeção de equipamentos essenciais." },
  { num: 7, titulo: "Procedimentos de Emergência", desc: "Procedimentos treinados e simulados regularmente." },
  { num: 8, titulo: "Manutenção Preventiva", desc: "Planos documentados para sistemas críticos." },
  { num: 9, titulo: "Inspeções e Verificações", desc: "Rotinas formais com registros e responsáveis." },
  { num: 10, titulo: "Auditorias Internas", desc: "Verificação periódica da eficácia do SGSO." },
  { num: 11, titulo: "Gestão de Mudanças", desc: "Avaliação de impactos operacionais em mudanças." },
  { num: 12, titulo: "Registro de Incidentes", desc: "Registro e tratamento formal de incidentes." },
  { num: 13, titulo: "Análise de Causa Raiz", desc: "Metodologia apropriada e documentação." },
  { num: 14, titulo: "Ações Corretivas e Preventivas", desc: "Implementação e verificação da eficácia." },
  { num: 15, titulo: "Monitoramento de Indicadores", desc: "Definição e análise de indicadores de SMS." },
  { num: 16, titulo: "Conformidade Legal", desc: "Atendimento à legislação ambiental e de segurança." },
  { num: 17, titulo: "Melhoria Contínua", desc: "Revisões periódicas e aprendizado contínuo." },
];

// Vessels Data
const vessels = [
  { id: "1", name: "PSV Atlântico" },
  { id: "2", name: "AHTS Pacífico" },
  { id: "3", name: "OSV Caribe" },
  { id: "4", name: "PLSV Mediterrâneo" },
  { id: "5", name: "FPSO Nautilus One" },
];

// Type definitions
type ComplianceStatus = "compliant" | "partial" | "non-compliant";

interface AuditItem {
  num: number;
  titulo: string;
  desc: string;
  compliance: ComplianceStatus;
  evidence: string;
  comment: string;
}

export default function SGSOAuditPage() {
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditData, setAuditData] = useState<AuditItem[]>(() =>
    requisitosSGSO.map(req => ({
      ...req,
      compliance: "compliant" as ComplianceStatus,
      evidence: "",
      comment: ""
    }))
  );

  const handleChange = (index: number, field: keyof AuditItem, value: string) => {
    const updated = [...auditData];
    updated[index] = { ...updated[index], [field]: value };
    setAuditData(updated);
  };

  const validateAudit = (): boolean => {
    if (!selectedVessel) {
      toast.error("Embarcação não selecionada", {
        description: "Por favor, selecione uma embarcação antes de enviar a auditoria."
      });
      return false;
    }

    const incompleteItems = auditData.filter(item => 
      !item.evidence.trim() && item.compliance !== "compliant"
    );

    if (incompleteItems.length > 0) {
      toast.warning("Auditoria incompleta", {
        description: `Existem ${incompleteItems.length} item(ns) não conforme(s) sem evidência.`
      });
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateAudit()) return;

    setIsSaving(true);
    toast.info("Salvando auditoria...", { description: "Por favor, aguarde." });

    try {
      // TODO: enviar para Supabase ou API
      console.log("📤 Enviando auditoria SGSO:", {
        vesselId: selectedVessel,
        vesselName: vessels.find(v => v.id === selectedVessel)?.name,
        auditDate: new Date().toISOString(),
        data: auditData
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Auditoria salva com sucesso!", {
        description: "Os dados foram registrados no sistema."
      });
    } catch (error) {
      console.error("Erro ao salvar auditoria:", error);
      toast.error("Erro ao salvar auditoria", {
        description: "Não foi possível salvar os dados. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedVessel) {
      toast.error("Embarcação não selecionada", {
        description: "Por favor, selecione uma embarcação antes de exportar."
      });
      return;
    }

    const element = document.getElementById("sgso-audit-pdf");
    if (!element) {
      toast.error("Erro ao exportar", { 
        description: "Elemento não encontrado." 
      });
      return;
    }

    setIsExporting(true);
    toast.info("Gerando PDF...", { 
      description: "Por favor, aguarde enquanto o relatório é preparado." 
    });

    try {
      const vesselName = vessels.find(v => v.id === selectedVessel)?.name || "auditoria";
      const dateStr = new Date().toISOString().split("T")[0];

      await html2pdf()
        .set({
          margin: 10,
          filename: `auditoria-sgso-${vesselName.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .save();

      toast.success("PDF gerado com sucesso!", {
        description: "O relatório foi baixado para seu dispositivo."
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF", {
        description: "Não foi possível gerar o relatório. Tente novamente."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getComplianceLabel = (status: ComplianceStatus): string => {
    switch (status) {
    case "compliant": return "✅ Conforme";
    case "partial": return "⚠️ Parcial";
    case "non-compliant": return "❌ Não conforme";
    default: return "Conforme";
    }
  };

  const getComplianceStats = () => {
    const stats = {
      compliant: auditData.filter(item => item.compliance === "compliant").length,
      partial: auditData.filter(item => item.compliance === "partial").length,
      nonCompliant: auditData.filter(item => item.compliance === "non-compliant").length
    };
    return stats;
  };

  const stats = getComplianceStats();

  return (
    <ModulePageWrapper>
      <ModuleHeader
        title="🛡️ Auditoria SGSO - IBAMA"
        description="Sistema de Gestão de Segurança Operacional e Meio Ambiente"
        icon={Ship}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Vessel Selection Section */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-600" />
                <Label htmlFor="vessel-select" className="text-lg font-semibold">
                  Selecione a Embarcação
                </Label>
              </div>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="vessel-select" className="w-full">
                  <SelectValue placeholder="Selecione uma embarcação para realizar a auditoria" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map(vessel => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Compliance Stats */}
              {selectedVessel && (
                <div className="flex gap-4 pt-4 border-t">
                  <div className="flex-1 text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{stats.compliant}</div>
                    <div className="text-sm text-green-600">Conforme</div>
                  </div>
                  <div className="flex-1 text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{stats.partial}</div>
                    <div className="text-sm text-yellow-600">Parcial</div>
                  </div>
                  <div className="flex-1 text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">{stats.nonCompliant}</div>
                    <div className="text-sm text-red-600">Não Conforme</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedVessel && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800">
                  Selecione uma embarcação acima para iniciar a auditoria SGSO.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden PDF container - only used for PDF generation */}
        <div id="sgso-audit-pdf" className="hidden">
          <div className="bg-white p-8">
            <div className="mb-8 border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900">Auditoria SGSO - IBAMA</h1>
              <p className="text-lg text-gray-700 mt-2">
                <strong>Embarcação:</strong> {vessels.find(v => v.id === selectedVessel)?.name || "---"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Resumo:</strong> {stats.compliant} Conforme | {stats.partial} Parcial | {stats.nonCompliant} Não Conforme
              </p>
            </div>

            {auditData.map((item, idx) => (
              <div key={idx} className="mb-6 border-b pb-4 page-break-inside-avoid">
                <h3 className="font-semibold text-base mb-2">
                  {item.num}. {item.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                <p className="text-sm mb-1">
                  <strong>Status:</strong> <span className="ml-2">{getComplianceLabel(item.compliance)}</span>
                </p>
                {item.evidence && (
                  <p className="text-sm mb-1">
                    <strong>Evidência:</strong> <span className="ml-2">{item.evidence}</span>
                  </p>
                )}
                {item.comment && (
                  <p className="text-sm">
                    <strong>Comentário:</strong> <span className="ml-2">{item.comment}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Requirements */}
        {selectedVessel && auditData.map((item, idx) => (
          <Card key={item.num} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.num}. {item.titulo}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Status de Conformidade</Label>
                <RadioGroup
                  value={item.compliance}
                  className="flex gap-4 mt-2"
                  onValueChange={val => handleChange(idx, "compliance", val as ComplianceStatus)}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="compliant" id={`c-${idx}`} />
                    <Label htmlFor={`c-${idx}`} className="cursor-pointer">✅ Conforme</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="partial" id={`p-${idx}`} />
                    <Label htmlFor={`p-${idx}`} className="cursor-pointer">⚠️ Parcial</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="non-compliant" id={`n-${idx}`} />
                    <Label htmlFor={`n-${idx}`} className="cursor-pointer">❌ Não conforme</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor={`evidence-${idx}`} className="text-sm font-medium">
                    📄 Evidência Observada
                  </Label>
                  <Textarea
                    id={`evidence-${idx}`}
                    placeholder="Descreva a evidência observada durante a auditoria..."
                    value={item.evidence}
                    onChange={e => handleChange(idx, "evidence", e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor={`comment-${idx}`} className="text-sm font-medium">
                    💬 Comentários Adicionais
                  </Label>
                  <Textarea
                    id={`comment-${idx}`}
                    placeholder="Adicione comentários, observações ou recomendações..."
                    value={item.comment}
                    onChange={e => handleChange(idx, "comment", e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Action Buttons */}
        {selectedVessel && (
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={handleExportPDF} 
                  variant="outline"
                  disabled={isExporting}
                  className="flex-1 sm:flex-none"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {isExporting ? "Gerando PDF..." : "Exportar PDF"}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Salvando..." : "Enviar Auditoria SGSO"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Certifique-se de revisar todos os requisitos antes de enviar a auditoria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModulePageWrapper>
  );
}
