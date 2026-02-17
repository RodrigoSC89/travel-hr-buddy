import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  { id: "dcm_draft", title: "Rascunho DCM Parte II", icon: "📋", format: "PDF", category: "Certificação", description: "Gera DCM Parte II automaticamente com dados do sistema", estimatedTime: "~15s", timeSaved: "4-6h" },
  { id: "work_rest_monthly", title: "Relatório Mensal Horas (Todos Tripulantes)", icon: "⏰", format: "PDF", category: "Reg. 2.3", description: "Consolidado no formato exigido pelo PSC com assinaturas digitais", estimatedTime: "~10s", timeSaved: "3-4h" },
  { id: "wage_register", title: "Registro de Salários MLC", icon: "💰", format: "Excel", category: "Reg. 2.2", description: "Extrato de pagamentos vs. mínimo ITF ($673/mês)", estimatedTime: "~8s", timeSaved: "2-3h" },
  { id: "crew_contracts_status", title: "Status de Contratos CEMs", icon: "📝", format: "PDF", category: "Reg. 2.1", description: "CEMs com alertas de vencimento e checklist de conteúdo obrigatório", estimatedTime: "~12s", timeSaved: "2-3h" },
  { id: "medical_certificates_report", title: "Relatório Certificados Médicos", icon: "🏥", format: "PDF", category: "Reg. 1.2", description: "Validade de todos os certificados médicos STCW/ILO", estimatedTime: "~8s", timeSaved: "1-2h" },
  { id: "psc_evidence_pack", title: "📦 Pacote Completo PSC MLC", icon: "🎯", format: "ZIP", category: "COMPLETO", description: "TODOS os documentos exigidos pelo PSC — economize 6-10h por inspeção", estimatedTime: "~45s", timeSaved: "6-10h" },
];

export function MLCDocumentGenerator() {
  const [generated, setGenerated] = useState<Map<string, any>>(new Map());

  const generateMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { data, error } = await supabase.functions.invoke("generate-mlc-document", {
        body: { doc_type: docId },
      });
      if (error) throw error;
      return { docId, data };
    },
    onSuccess: ({ docId, data }) => {
      setGenerated(prev => new Map(prev).set(docId, data));
      toast.success("Documento gerado com sucesso!");
    },
    onError: () => toast.error("Erro ao gerar documento"),
  });

  const generateAllMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      for (const doc of MLC_DOCUMENTS) {
        if (!generated.has(doc.id)) {
          const { data, error } = await supabase.functions.invoke("generate-mlc-document", {
            body: { doc_type: doc.id },
          });
          if (!error) {
            results.push({ docId: doc.id, data });
          }
        }
      }
      return results;
    },
    onSuccess: (results) => {
      setGenerated(prev => {
        const next = new Map(prev);
        results.forEach(r => next.set(r.docId, r.data));
        return next;
      });
      toast.success("Todos os documentos gerados!");
    },
  });

  const handleDownload = (docId: string) => {
    const data = generated.get(docId);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mlc_${docId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Download iniciado!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-primary">{MLC_DOCUMENTS.length}</p>
            <p className="text-xs text-muted-foreground">Documentos Disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-success">{generated.size}</p>
            <p className="text-xs text-muted-foreground">Gerados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">6-10h</p>
            <p className="text-xs text-muted-foreground">Tempo Economizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <Button className="w-full gap-1" onClick={() => generateAllMutation.mutate()}
              disabled={generateMutation.isPending || generateAllMutation.isPending}>
              {generateAllMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />}
              Gerar Todos
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {MLC_DOCUMENTS.map(doc => {
          const isGenerating = generateMutation.isPending && generateMutation.variables === doc.id;
          const isGenerated = generated.has(doc.id);
          const isPackage = doc.id === "psc_evidence_pack";

          return (
            <Card key={doc.id} className={`transition-all ${isPackage ? "md:col-span-2 border-primary/30 bg-primary/5" : ""} ${isGenerated ? "border-success/30" : ""}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm">{doc.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      <Badge variant="secondary" className="text-xs">{doc.format}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {doc.estimatedTime}
                      </span>
                      <span className="text-xs text-success font-medium">⏱️ Economiza {doc.timeSaved}</span>
                    </div>
                    <div className="flex gap-2">
                      {isGenerated ? (
                        <Button size="sm" variant="outline" className="gap-1 text-success border-success"
                          onClick={() => handleDownload(doc.id)}>
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      ) : (
                        <Button size="sm" className="gap-1" onClick={() => generateMutation.mutate(doc.id)}
                          disabled={isGenerating || generateAllMutation.isPending}>
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
