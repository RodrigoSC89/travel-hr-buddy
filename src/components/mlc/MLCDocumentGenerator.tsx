import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileText, Download, Package, Clock, CheckCircle, Loader2 } from "lucide-react";

interface DocTemplate {
  id: string;
  title: string;
  icon: string;
  format: string;
  description: string;
  category: string;
  estimatedTime: string;
  timeSaved: string;
}

const MLC_DOCUMENTS: DocTemplate[] = [
  { id: "dcm_draft", title: "Rascunho DCM Parte II", icon: "📋", format: "PDF", category: "Certificação", description: "Gera DCM Parte II automaticamente com dados do sistema — pronto para revisão do DPA", estimatedTime: "~15s", timeSaved: "4-6h" },
  { id: "work_rest_monthly", title: "Relatório Mensal Horas (Todos Tripulantes)", icon: "⏰", format: "PDF", category: "Reg. 2.3", description: "Consolidado no formato exigido pelo PSC com assinaturas digitais", estimatedTime: "~10s", timeSaved: "3-4h" },
  { id: "wage_register", title: "Registro de Salários MLC", icon: "💰", format: "Excel", category: "Reg. 2.2", description: "Extrato de pagamentos vs. mínimo ITF ($673/mês) para todos os marítimos", estimatedTime: "~8s", timeSaved: "2-3h" },
  { id: "crew_contracts_status", title: "Status de Contratos CEMs", icon: "📝", format: "PDF", category: "Reg. 2.1", description: "Lista de todos os CEMs com alertas de vencimento e checklist de conteúdo obrigatório", estimatedTime: "~12s", timeSaved: "2-3h" },
  { id: "medical_certificates_report", title: "Relatório Certificados Médicos", icon: "🏥", format: "PDF", category: "Reg. 1.2", description: "Validade de todos os certificados médicos STCW/ILO com alertas de expiração", estimatedTime: "~8s", timeSaved: "1-2h" },
  { id: "repatriation_guarantee", title: "Relatório Garantias de Repatriação", icon: "✈️", format: "PDF", category: "Reg. 2.5", description: "Status do seguro P&I e garantias financeiras para repatriação", estimatedTime: "~10s", timeSaved: "2-3h" },
  { id: "accommodation_inspection", title: "Relatório Inspeção de Alojamento", icon: "🛏️", format: "PDF", category: "Reg. 3.1", description: "Resultado da última inspeção de alojamento com fotos e medições", estimatedTime: "~15s", timeSaved: "3-4h" },
  { id: "complaint_log", title: "Registro de Reclamações", icon: "📢", format: "PDF", category: "Reg. 5.1.5", description: "Log de todas as reclamações com status de resolução e timeline", estimatedTime: "~8s", timeSaved: "1-2h" },
  { id: "manning_certificate", title: "Análise de Manning vs. Certificado", icon: "👥", format: "PDF", category: "Reg. 2.7", description: "Comparação tripulação atual vs. Safe Manning Document", estimatedTime: "~10s", timeSaved: "2-3h" },
  { id: "psc_evidence_pack", title: "📦 Pacote Completo PSC MLC", icon: "🎯", format: "ZIP", category: "COMPLETO", description: "TODOS os 47 documentos exigidos pelo PSC em um ZIP — economize 6-10h por inspeção", estimatedTime: "~45s", timeSaved: "6-10h" },
];

export function MLCDocumentGenerator() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const handleGenerate = async (docId: string) => {
    setGenerating(docId);
    // Simulate generation
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
    setGenerated(prev => new Set([...prev, docId]));
    setGenerating(null);
    toast.success(`Documento gerado com sucesso!`);
  };

  const handleGenerateAll = async () => {
    setGenerating("all");
    for (const doc of MLC_DOCUMENTS) {
      if (!generated.has(doc.id)) {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        setGenerated(prev => new Set([...prev, doc.id]));
      }
    }
    setGenerating(null);
    toast.success("Todos os documentos gerados! Pacote PSC pronto.");
  };

  const totalTimeSaved = "6-10h";
  const generatedCount = generated.size;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-primary">{MLC_DOCUMENTS.length}</p>
            <p className="text-xs text-muted-foreground">Documentos Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-600">{generatedCount}</p>
            <p className="text-xs text-muted-foreground">Gerados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{totalTimeSaved}</p>
            <p className="text-xs text-muted-foreground">Tempo Economizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <Button className="w-full gap-1" onClick={handleGenerateAll} disabled={generating !== null}>
              {generating === "all" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />}
              Gerar Todos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {MLC_DOCUMENTS.map(doc => {
          const isGenerating = generating === doc.id || generating === "all";
          const isGenerated = generated.has(doc.id);
          const isPackage = doc.id === "psc_evidence_pack";

          return (
            <Card key={doc.id} className={`transition-all ${isPackage ? "md:col-span-2 border-primary/30 bg-primary/5" : ""} ${isGenerated ? "border-green-500/30" : ""}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      <Badge variant="secondary" className="text-xs">{doc.format}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {doc.estimatedTime}
                      </span>
                      <span className="text-xs text-green-600 font-medium">⏱️ Economiza {doc.timeSaved}</span>
                    </div>
                    <div className="flex gap-2">
                      {isGenerated ? (
                        <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-500" onClick={() => toast.success("Download iniciado!")}>
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      ) : (
                        <Button size="sm" className="gap-1" onClick={() => handleGenerate(doc.id)} disabled={isGenerating}>
                          {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                          {isGenerating ? "Gerando..." : "Gerar"}
                        </Button>
                      )}
                      {isGenerated && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
