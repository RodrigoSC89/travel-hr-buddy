"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  FileText, 
  BookOpen, 
  AlertTriangle, 
  Lightbulb, 
  CheckSquare 
} from "lucide-react";

interface IncidentAiModalProps {
  incident: {
    id: string;
    title: string;
    summary: string;
    gpt_analysis?: any;
  };
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: () => void;
}

interface AnalysisResult {
  causa_provavel: string;
  medidas_prevencao: string;
  impacto_operacional: string;
  referencia_normativa: string;
  grau_severidade: string;
}

export default function IncidentAiModal({ 
  incident, 
  isOpen, 
  onClose, 
  onAnalysisComplete 
}: IncidentAiModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    incident.gpt_analysis || null
  );
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!incident) return;
    setLoading(true);
    
    try {
      const response = await fetch("/api/dp-incidents/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: incident.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze incident");
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        toast.success("Análise concluída com sucesso");
        onAnalysisComplete?.();
      } else {
        throw new Error("Analysis did not return results");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro ao analisar incidente", {
        description: err instanceof Error ? err.message : "Tente novamente mais tarde"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análise IA – {incident.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {incident.summary || "Sem descrição"}
          </p>
          
          {!analysis && (
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? "Analisando..." : "Executar análise IA"}
            </Button>
          )}
          
          {analysis && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">📄 Resumo</TabsTrigger>
                <TabsTrigger value="standards">📚 Normas</TabsTrigger>
                <TabsTrigger value="causes">⚠️ Causas</TabsTrigger>
                <TabsTrigger value="prevention">💡 Prevenção</TabsTrigger>
                <TabsTrigger value="actions">📋 Ações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Causa Provável
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.causa_provavel}</p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Grau de Severidade</h4>
                    <p className="text-sm">
                      <span className={`px-2 py-1 rounded ${
                        analysis.grau_severidade === "Alta" ? "bg-red-500 text-white" :
                        analysis.grau_severidade === "Média" ? "bg-yellow-500 text-black" :
                        "bg-green-500 text-white"
                      }`}>
                        {analysis.grau_severidade}
                      </span>
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="standards" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Referências Normativas (IMCA/IMO/PEO-DP)
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.referencia_normativa}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="causes" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Causa Provável Detalhada
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.causa_provavel}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="prevention" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Medidas de Prevenção
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.medidas_prevencao}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Impacto Operacional
                  </h3>
                  <p className="text-sm whitespace-pre-line">{analysis.impacto_operacional}</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {analysis && (
            <Button 
              onClick={handleAnalyze} 
              disabled={loading} 
              variant="outline"
              className="w-full mt-4"
            >
              {loading ? "Analisando..." : "Executar nova análise"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
