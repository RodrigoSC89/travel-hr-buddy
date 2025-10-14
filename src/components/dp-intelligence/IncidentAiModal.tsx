import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Brain, BookOpen, AlertCircle, Lightbulb, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DPIncident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  root_cause: string;
  class_dp: string;
  source: string;
  link: string;
  summary: string;
  tags: string[];
}

interface AIAnalysis {
  resumo_tecnico: string;
  normas_relacionadas: Array<{
    norma: string;
    secao: string;
    descricao: string;
  }>;
  causas_adicionais: string[];
  recomendacoes_preventivas: string[];
  acoes_corretivas: string[];
}

interface IncidentAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: DPIncident | null;
}

export const IncidentAiModal: React.FC<IncidentAiModalProps> = ({
  isOpen,
  onClose,
  incident,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && incident) {
      analyzeIncident();
    } else {
      setAnalysis(null);
    }
  }, [isOpen, incident]);

  const analyzeIncident = async () => {
    if (!incident) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para usar esta funcionalidade.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident },
      });

      if (response.error) {
        throw response.error;
      }

      setAnalysis(response.data.analysis);
      
      toast({
        title: "✅ Análise Concluída",
        description: "A análise técnica foi gerada com sucesso pela IA.",
      });
    } catch (error) {
      console.error("Error analyzing incident:", error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar o incidente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!incident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            Análise IA - Centro de Inteligência DP
          </DialogTitle>
          <DialogDescription>
            Análise normativa e técnica com GPT-4
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Incident Info */}
            <Card className="border-2 border-indigo-200 bg-indigo-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{incident.title}</CardTitle>
                  <Badge className="bg-indigo-600">{incident.class_dp}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Embarcação:</strong> {incident.vessel}</p>
                  <p><strong>Local:</strong> {incident.location}</p>
                  <p><strong>Data:</strong> {new Date(incident.date).toLocaleDateString("pt-BR")}</p>
                </div>
              </CardHeader>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-gray-600">Analisando incidente com IA...</p>
                <p className="text-sm text-gray-500">
                  Consultando normas IMCA, PEO-DP e IMO
                </p>
              </div>
            )}

            {/* Analysis Results */}
            {!isLoading && analysis && (
              <div className="space-y-4">
                {/* Technical Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="h-5 w-5 text-blue-600" />
                      Resumo Técnico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {analysis.resumo_tecnico}
                    </p>
                  </CardContent>
                </Card>

                {/* Related Standards */}
                {analysis.normas_relacionadas && analysis.normas_relacionadas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        Normas Relacionadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.normas_relacionadas.map((norma, idx) => (
                        <div
                          key={idx}
                          className="bg-green-50 border border-green-200 rounded-md p-3"
                        >
                          <div className="flex items-start gap-2">
                            <Badge className="bg-green-600">{norma.norma}</Badge>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-green-900 mb-1">
                                {norma.secao}
                              </p>
                              <p className="text-xs text-green-800">{norma.descricao}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Causes */}
                {analysis.causas_adicionais && analysis.causas_adicionais.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        Causas Adicionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.causas_adicionais.map((causa, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-600 mt-1">•</span>
                            <span className="text-sm text-gray-700">{causa}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Preventive Recommendations */}
                {analysis.recomendacoes_preventivas && 
                 analysis.recomendacoes_preventivas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        Recomendações Preventivas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recomendacoes_preventivas.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">→</span>
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Corrective Actions */}
                {analysis.acoes_corretivas && analysis.acoes_corretivas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                        Ações Corretivas Sugeridas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.acoes_corretivas.map((acao, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{acao}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Fechar
          </Button>
          {analysis && (
            <Button onClick={analyzeIncident} disabled={isLoading}>
              <Brain className="h-4 w-4 mr-1" />
              Reanalisar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
