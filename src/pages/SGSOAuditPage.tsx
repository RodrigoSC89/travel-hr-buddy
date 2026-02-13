import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { logger } from "@/lib/logger";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { submitSGSOAudit } from "@/lib/sgso/submit";
import { loadSGSOAudit } from "@/services/sgso-audit-service";
import { toast } from "sonner";
import { explainRequirementSGSO } from "@/lib/ai/sgso";

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

export default function SGSOAuditPage() {
  const { user } = useAuth();
  const [vessels, setVessels] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState<number | null>(null);
  const [auditData, setAuditData] = useState(() =>
    requisitosSGSO.map(req => ({
      ...req,
      compliance: "compliant",
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

  useEffect(() => {
    const fetchAudit = async () => {
      if (!selectedVessel) return;

      try {
        const audits = await loadSGSOAudit(selectedVessel);
        if (audits && audits.length > 0) {
          const latest = audits[0];
          
          // Map audit items to form fields by requirement_number
          const updatedData = requisitosSGSO.map(req => {
            const match = latest.sgso_audit_items.find(
              (item: { requirement_number: number }) => item.requirement_number === req.num
            );

            return {
              ...req,
              compliance: match?.compliance_status || "compliant",
              evidence: match?.evidence || "",
              comment: match?.comment || ""
            };
          });

          setAuditData(updatedData);
          toast.success("✅ Última auditoria carregada.");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Erro ao carregar auditoria: ${error.message}`);
      }
    };

    fetchAudit();
  }, [selectedVessel]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...auditData];
    const item = updated[index] as Record<string, unknown>;
    item[field] = value;
    setAuditData(updated);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    if (!selectedVessel) {
      toast.error("Selecione uma embarcação");
      return;
    }

    try {
      setLoading(true);

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

      toast.success("✅ Auditoria SGSO enviada com sucesso!");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Erro ao enviar auditoria: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById("sgso-audit-pdf");
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `auditoria-sgso-${new Date().toISOString()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(element)
      .save();
  };

  const handleExplainWithAI = async (index: number) => {
    const item = auditData[index];
    
    try {
      setExplainLoading(index);
      const explanation = await explainRequirementSGSO(item.titulo, item.compliance);
      
      if (explanation) {
        toast.info(explanation, { duration: 12000 });
      } else {
        toast.error("Não foi possível gerar explicação. Verifique a configuração da API.");
      }
    } catch (error) {
      logger.error("Error explaining requirement", { error });
      toast.error("Erro ao explicar requisito com IA");
    } finally {
      setExplainLoading(null);
    }
  };

  return (
    <div className="container max-w-5xl py-8 mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🛡️ Auditoria SGSO - IBAMA</h1>

      <div className="flex gap-4 items-center mb-6">
        <div className="flex-1">
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
      </div>

      {/* Hidden PDF container - only used for PDF generation */}
      <div id="sgso-audit-pdf" className="hidden">
        <div className="bg-white p-4">
          <h2 className="text-xl font-semibold mb-4">Auditoria SGSO</h2>
          <p className="text-sm text-gray-600 mb-4">
            Embarcação: {vessels.find(v => v.id === selectedVessel)?.name || "---"}
          </p>

          {auditData.map((item) => (
            <div key={item.num} className="mb-6 border-b pb-4">
              <p className="font-medium">{item.num}. {item.titulo}</p>
              <p><strong>Status:</strong> {item.compliance}</p>
              <p><strong>Evidência:</strong> {item.evidence}</p>
              <p><strong>Comentário:</strong> {item.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {auditData.map((item, idx) => (
        <Card key={item.num}>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              {item.num}. {item.titulo}
            </h3>
            <p className="text-muted-foreground text-sm">{item.desc}</p>

            <RadioGroup
              defaultValue="compliant"
              className="flex gap-4 mt-2"
              onValueChange={val => handleChange(idx, "compliance", val)}
            >
              <div className="flex items-center gap-1">
                <RadioGroupItem value="compliant" id={`c-${idx}`} />
                <Label htmlFor={`c-${idx}`}>✅ Conforme</Label>
              </div>
              <div className="flex items-center gap-1">
                <RadioGroupItem value="partial" id={`p-${idx}`} />
                <Label htmlFor={`p-${idx}`}>⚠️ Parcial</Label>
              </div>
              <div className="flex items-center gap-1">
                <RadioGroupItem value="non-compliant" id={`n-${idx}`} />
                <Label htmlFor={`n-${idx}`}>❌ Não conforme</Label>
              </div>
            </RadioGroup>

            <Textarea
              placeholder="📄 Descreva a evidência observada"
              value={item.evidence}
              onChange={e => handleChange(idx, "evidence", e.target.value)}
            />
            <Textarea
              placeholder="💬 Comentário adicional ou observação"
              value={item.comment}
              onChange={e => handleChange(idx, "comment", e.target.value)}
            />
            
            <Button
              variant="outline"
              onClick={() => handleExplainWithAI(idx)}
              disabled={explainLoading === idx}
            >
              🤖 {explainLoading === idx ? "Carregando..." : "Explicar com IA"}
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4 mt-6">
        <Button onClick={handleExportPDF} variant="outline">
          <FileDown className="w-4 h-4 mr-2" />
          📄 Exportar PDF
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          📤 Enviar Auditoria SGSO
        </Button>
      </div>
    </div>
  );
}
