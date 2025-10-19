import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ship, FileDown, Save, AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { submitSGSOAudit } from "@/lib/sgso/submit";
import { toast } from "sonner";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

// TypeScript types for better type safety
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

// Helper function to get compliance label in Portuguese
const getComplianceLabel = (status: ComplianceStatus): string => {
  const labels: Record<ComplianceStatus, string> = {
    compliant: "Conforme",
    partial: "Parcialmente Conforme",
    "non-compliant": "Não Conforme",
  };
  return labels[status];
};

// Helper function to calculate statistics
const getComplianceStats = (data: AuditItem[]) => {
  const stats = {
    compliant: 0,
    partial: 0,
    nonCompliant: 0,
  };
  
  data.forEach(item => {
    if (item.compliance === "compliant") stats.compliant++;
    else if (item.compliance === "partial") stats.partial++;
    else if (item.compliance === "non-compliant") stats.nonCompliant++;
  });
  
  return stats;
};

// Helper function to validate audit before submission
const validateAudit = (data: AuditItem[], vesselId: string): { isValid: boolean; message: string } => {
  if (!vesselId) {
    return { isValid: false, message: "Por favor, selecione uma embarcação antes de enviar." };
  }
  
  const itemsWithoutEvidence = data.filter(item => !item.evidence.trim());
  
  if (itemsWithoutEvidence.length > 0) {
    return {
      isValid: false,
      message: `${itemsWithoutEvidence.length} requisito(s) sem evidência. Deseja continuar mesmo assim?`,
    };
  }
  
  return { isValid: true, message: "" };
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

  const handleChange = (index: number, field: keyof AuditItem, value: string) => {
    const updated = [...auditData];
    updated[index] = { ...updated[index], [field]: value };
    setAuditData(updated);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Validate audit data
    const validation = validateAudit(auditData, selectedVessel);
    
    if (!validation.isValid) {
      if (validation.message.includes("Deseja continuar")) {
        // Show warning toast and ask for confirmation
        const confirmed = window.confirm(validation.message);
        if (!confirmed) return;
      } else {
        toast.error(validation.message);
        return;
      }
    }

    try {
      setIsSaving(true);
      toast.info("Salvando auditoria...");

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

      const vesselName = vessels.find(v => v.id === selectedVessel)?.name || "embarcação";
      toast.success(`Auditoria enviada com sucesso para ${vesselName}!`, {
        description: "Todos os dados foram salvos no sistema.",
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error("Erro ao enviar auditoria", {
        description: error.message + ". Por favor, tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedVessel) {
      toast.error("Selecione uma embarcação antes de exportar");
      return;
    }

    try {
      setIsExporting(true);
      toast.info("Gerando PDF...");

      const element = document.getElementById("sgso-audit-pdf");
      if (!element) {
        throw new Error("Elemento PDF não encontrado");
      }

      const vesselName = vessels.find(v => v.id === selectedVessel)?.name || "embarcacao";
      const date = new Date().toISOString().split("T")[0];
      const filename = `auditoria-sgso-${vesselName.toLowerCase().replace(/\s+/g, "-")}-${date}.pdf`;

      await html2pdf()
        .set({
          margin: 10,
          filename: filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .save();

      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error("Erro ao exportar PDF", {
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate real-time statistics
  const stats = getComplianceStats(auditData);

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
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vessel-select" className="text-base font-semibold">
              Selecione a Embarcação
            </Label>
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger id="vessel-select" className="w-full">
                <SelectValue placeholder="Escolha a embarcação para auditoria" />
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

          {/* Real-time Statistics Display */}
          {selectedVessel && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Estatísticas da Auditoria</h3>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm">
                    <strong>{stats.compliant}</strong> Conforme
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">
                    <strong>{stats.partial}</strong> Parcial
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm">
                    <strong>{stats.nonCompliant}</strong> Não Conforme
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditional Rendering: Show info alert when no vessel is selected */}
      {!selectedVessel && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, selecione uma embarcação acima para iniciar a auditoria SGSO.
            Os 17 requisitos do IBAMA serão exibidos após a seleção.
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden PDF container - only used for PDF generation */}
      <div id="sgso-audit-pdf" className="hidden">
        <div className="bg-white p-8">
          <h1 className="text-2xl font-bold mb-2">Auditoria SGSO - IBAMA</h1>
          <h2 className="text-xl font-semibold mb-4">Sistema de Gestão de Segurança Operacional</h2>
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-sm mb-1">
              <strong>Embarcação:</strong> {vessels.find(v => v.id === selectedVessel)?.name || "---"}
            </p>
            <p className="text-sm mb-1">
              <strong>Data da Auditoria:</strong> {new Date().toLocaleDateString("pt-BR")}
            </p>
            <p className="text-sm">
              <strong>Auditor:</strong> {user?.email || "---"}
            </p>
          </div>

          {/* Statistics Summary */}
          <div className="mb-6 p-4 border-2 border-gray-300 rounded">
            <h3 className="font-semibold mb-2">Resumo de Conformidade</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-700">✓ Conforme:</span> <strong>{stats.compliant}</strong>
              </div>
              <div>
                <span className="text-yellow-700">⚠ Parcial:</span> <strong>{stats.partial}</strong>
              </div>
              <div>
                <span className="text-red-700">✗ Não Conforme:</span> <strong>{stats.nonCompliant}</strong>
              </div>
            </div>
          </div>

          {auditData.map((item, idx) => (
            <div key={idx} className="mb-6 border-b pb-4 page-break-inside-avoid">
              <h4 className="font-bold mb-1">{item.num}. {item.titulo}</h4>
              <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
              <p className="mb-1">
                <strong>Status de Conformidade:</strong> {getComplianceLabel(item.compliance)}
              </p>
              <p className="mb-1">
                <strong>Evidência:</strong> {item.evidence || "Não informado"}
              </p>
              <p>
                <strong>Comentário:</strong> {item.comment || "Sem comentários"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements Cards - only shown after vessel selection */}
      {selectedVessel && auditData.map((item, idx) => (
        <Card key={item.num}>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {item.num}. {item.titulo}
              </h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Status de Conformidade</Label>
              <RadioGroup
                value={item.compliance}
                className="flex gap-4"
                onValueChange={val => handleChange(idx, "compliance", val)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="compliant" id={`c-${idx}`} />
                  <Label htmlFor={`c-${idx}`} className="flex items-center gap-1 cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Conforme
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="partial" id={`p-${idx}`} />
                  <Label htmlFor={`p-${idx}`} className="flex items-center gap-1 cursor-pointer">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Parcial
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="non-compliant" id={`n-${idx}`} />
                  <Label htmlFor={`n-${idx}`} className="flex items-center gap-1 cursor-pointer">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Não conforme
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`evidence-${idx}`} className="text-sm font-semibold">
                Evidência Observada
              </Label>
              <Textarea
                id={`evidence-${idx}`}
                placeholder="Descreva as evidências encontradas durante a inspeção..."
                value={item.evidence}
                onChange={e => handleChange(idx, "evidence", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`comment-${idx}`} className="text-sm font-semibold">
                Comentários Adicionais
              </Label>
              <Textarea
                id={`comment-${idx}`}
                placeholder="Observações, recomendações ou notas adicionais..."
                value={item.comment}
                onChange={e => handleChange(idx, "comment", e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons - only shown after vessel selection */}
      {selectedVessel && (
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={handleExportPDF} 
            variant="outline"
            disabled={isExporting || isSaving}
            className="flex-1 sm:flex-none"
          >
            <FileDown className="w-4 h-4 mr-2" />
            {isExporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || isExporting}
            className="flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Auditoria"}
          </Button>
        </div>
      )}
    </ModulePageWrapper>
  );
}
