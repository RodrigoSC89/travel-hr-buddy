import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Ship, Save, FileDown, AlertCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { submitSGSOAudit } from "@/lib/sgso/submit";
import { toast } from "sonner";

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

// Helper functions
const getComplianceLabel = (status: ComplianceStatus): string => {
  const labels = {
    compliant: "Conforme",
    partial: "Parcial",
    "non-compliant": "Não Conforme"
  };
  return labels[status];
};

const getComplianceStats = (items: AuditItem[]) => {
  return {
    compliant: items.filter(item => item.compliance === "compliant").length,
    partial: items.filter(item => item.compliance === "partial").length,
    nonCompliant: items.filter(item => item.compliance === "non-compliant").length
  };
};

const validateAudit = (auditData: AuditItem[], selectedVessel: string): { valid: boolean; message: string } => {
  if (!selectedVessel) {
    return { valid: false, message: "Selecione uma embarcação antes de continuar." };
  }

  const incompleteItems = auditData.filter(
    item => !item.evidence || !item.comment
  );

  if (incompleteItems.length > 0) {
    return { 
      valid: false, 
      message: `${incompleteItems.length} requisito(s) sem evidência ou comentário. Deseja continuar?` 
    };
  }

  return { valid: true, message: "Validação concluída com sucesso." };
};

export default function SGSOAuditPage() {
  const { user } = useAuth();
  const [vessels, setVessels] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [auditData, setAuditData] = useState<AuditItem[]>(() =>
    requisitosSGSO.map(req => ({
      ...req,
      compliance: "compliant" as ComplianceStatus,
      evidence: "",
      comment: ""
    }))
  );

  useEffect(() => {
    const fetchVessels = async () => {
      const { data, error } = await supabase.from("vessels").select("id, name");
      if (!error && data) {
        setVessels(data);
      }
    };
    fetchVessels();
  }, []);

  // Calculate statistics in real-time
  const stats = getComplianceStats(auditData);

  const handleChange = (index: number, field: keyof AuditItem, value: string) => {
    const updated = [...auditData];
    updated[index] = { ...updated[index], [field]: value };
    setAuditData(updated);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Usuário não autenticado", { 
        description: "Faça login para enviar a auditoria." 
      });
      return;
    }

    // Validate before submission
    const validation = validateAudit(auditData, selectedVessel);
    if (!validation.valid) {
      const shouldContinue = selectedVessel && validation.message.includes("requisito(s)");
      if (shouldContinue) {
        toast.warning("Atenção", { description: validation.message });
      } else {
        toast.error("Validação falhou", { description: validation.message });
        return;
      }
    }

    try {
      setIsSaving(true);
      toast.info("Salvando auditoria...", { description: "Aguarde enquanto processamos os dados." });

      await submitSGSOAudit(
        selectedVessel,
        user.id,
        auditData.map(item => ({
          requirement_number: item.num,
          requirement_title: item.titulo,
          compliance_status: item.compliance,
          evidence: item.evidence,
          comment: item.comment
        }))
      );

      toast.success("Auditoria enviada com sucesso!", {
        description: "Os dados foram salvos no sistema."
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error("Erro ao enviar auditoria", {
        description: error.message || "Tente novamente mais tarde."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    // Validate before export
    const validation = validateAudit(auditData, selectedVessel);
    if (!validation.valid && !selectedVessel) {
      toast.error("Validação falhou", { description: validation.message });
      return;
    }

    const element = document.getElementById("sgso-audit-pdf");
    if (!element) {
      toast.error("Erro ao exportar", { description: "Conteúdo não encontrado." });
      return;
    }

    try {
      setIsExporting(true);
      toast.info("Gerando PDF...", { description: "Por favor, aguarde." });

      const vesselName = vessels.find(v => v.id === selectedVessel)?.name || "embarcacao";
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `auditoria-sgso-${vesselName.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.pdf`;

      await html2pdf()
        .set({
          margin: 10,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .save();

      toast.success("PDF exportado com sucesso!", {
        description: `Arquivo: ${filename}`
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF", {
        description: "Não foi possível exportar o documento."
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Auditoria SGSO"
        description="Sistema de Gestão de Segurança Operacional - IBAMA"
        gradient="blue"
      />

      {/* Vessel Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5" />
            Seleção de Embarcação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vessel-select" className="mb-2 block">
              Selecione a Embarcação
            </Label>
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger id="vessel-select">
                <SelectValue placeholder="Selecione uma embarcação" />
              </SelectTrigger>
              <SelectContent>
                {vessels.map(vessel => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Real-time Statistics */}
          {selectedVessel && (
            <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Conforme</p>
                  <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Parcial</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.partial}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Não Conforme</p>
                  <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informational Alert when no vessel is selected */}
      {!selectedVessel && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione uma embarcação acima para começar a auditoria dos 17 requisitos SGSO.
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden PDF container - only used for PDF generation */}
      <div id="sgso-audit-pdf" className="hidden">
        <div className="bg-white p-8">
          <h2 className="text-2xl font-bold mb-2">Auditoria SGSO - IBAMA</h2>
          <p className="text-sm text-gray-600 mb-4">
            Embarcação: {vessels.find(v => v.id === selectedVessel)?.name || "---"}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Data: {new Date().toLocaleDateString("pt-BR")}
          </p>

          {/* Statistics Summary */}
          <div className="mb-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Resumo da Auditoria</h3>
            <p>Conforme: {stats.compliant} | Parcial: {stats.partial} | Não Conforme: {stats.nonCompliant}</p>
            <p>Total de Requisitos: {auditData.length}</p>
          </div>

          {auditData.map((item, idx) => (
            <div key={idx} className="mb-6 border-b pb-4">
              <p className="font-medium text-lg">{item.num}. {item.titulo}</p>
              <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
              <p><strong>Status:</strong> {getComplianceLabel(item.compliance)}</p>
              <p><strong>Evidência:</strong> {item.evidence || "Não informada"}</p>
              <p><strong>Comentário:</strong> {item.comment || "Nenhum comentário"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conditional Rendering: Requirements only appear after vessel selection */}
      {selectedVessel && auditData.map((item, idx) => (
        <Card key={item.num}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.num}. {item.titulo}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Status de Conformidade</Label>
              <RadioGroup
                value={item.compliance}
                className="flex gap-4 mt-2"
                onValueChange={val => handleChange(idx, "compliance", val)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="compliant" id={`c-${idx}`} />
                  <Label htmlFor={`c-${idx}`} className="flex items-center gap-1 cursor-pointer">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Conforme
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="partial" id={`p-${idx}`} />
                  <Label htmlFor={`p-${idx}`} className="flex items-center gap-1 cursor-pointer">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Parcial
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="non-compliant" id={`n-${idx}`} />
                  <Label htmlFor={`n-${idx}`} className="flex items-center gap-1 cursor-pointer">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Não Conforme
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor={`evidence-${idx}`}>Evidência Observada</Label>
              <Textarea
                id={`evidence-${idx}`}
                placeholder="Descreva a evidência observada durante a auditoria..."
                value={item.evidence}
                onChange={e => handleChange(idx, "evidence", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor={`comment-${idx}`}>Comentários Adicionais</Label>
              <Textarea
                id={`comment-${idx}`}
                placeholder="Adicione observações, recomendações ou detalhes adicionais..."
                value={item.comment}
                onChange={e => handleChange(idx, "comment", e.target.value)}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons with Loading States */}
      {selectedVessel && (
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={handleExportPDF} 
            variant="outline"
            disabled={isExporting}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Auditoria"}
          </Button>
        </div>
      )}
    </ModulePageWrapper>
  );
}
