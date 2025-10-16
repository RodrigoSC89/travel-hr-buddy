import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Brain, CheckCircle, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface NonConformity {
  id: string;
  number: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  vessel: string;
  date: string;
}

interface AiAnalysis {
  rootCause: string;
  immediateActions: string[];
  preventiveActions: string[];
  timeline: string;
  resources: string[];
  riskLevel: string;
}

interface NonConformityAnalysisProps {
  vesselId?: string;
}

// Mock data - in production, this would come from the database
const MOCK_NON_CONFORMITIES: NonConformity[] = [
  {
    id: "nc-001",
    number: "NC-2024-001",
    description: "Ausência de matriz de competências atualizada - Prática 4 (Treinamento)",
    severity: "high",
    vessel: "MV Explorer",
    date: "2024-10-15",
  },
  {
    id: "nc-002",
    number: "NC-2024-002",
    description: "Procedimento MOC não implementado - Prática 13 (Gestão de Mudanças)",
    severity: "critical",
    vessel: "MV Explorer",
    date: "2024-10-10",
  },
  {
    id: "nc-003",
    number: "NC-2024-003",
    description: "Plano de integridade mecânica desatualizado - Prática 17",
    severity: "high",
    vessel: "MV Discovery",
    date: "2024-10-12",
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

export default function NonConformityAnalysis({ vesselId }: NonConformityAnalysisProps) {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AiAnalysis>>({});

  const generateAiAnalysis = async (nc: NonConformity) => {
    setAnalyzing(nc.id);
    
    // Simulate AI analysis - in production, this would call OpenAI API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis: AiAnalysis = {
      rootCause: `Análise baseada em dados históricos indica que a não conformidade "${nc.description}" provavelmente originou-se de processo desatualizado e falta de revisão periódica. Identificado padrão similar em 3 auditorias anteriores.`,
      immediateActions: [
        "Revisar e atualizar toda documentação relacionada imediatamente",
        "Convocar reunião de emergência com responsáveis do setor",
        "Implementar checklist temporário para monitoramento diário",
        "Designar responsável exclusivo para acompanhamento",
      ],
      preventiveActions: [
        "Estabelecer processo de revisão trimestral obrigatória",
        "Criar sistema de alertas automáticos 30 dias antes do vencimento",
        "Implementar treinamento periódico para equipe",
        "Integrar verificação no processo de auditoria interna",
      ],
      timeline: "Ação imediata: 7 dias | Implementação completa: 30 dias | Validação: 60 dias",
      resources: [
        "Equipe: 2-3 pessoas (mínimo)",
        "Budget estimado: R$ 15.000 - R$ 25.000",
        "Ferramentas: Software de gestão documental",
        "Consultoria externa (opcional): Especialista em conformidade",
      ],
      riskLevel: nc.severity === "critical" ? "Alto - Requer ação imediata" : "Médio - Atenção prioritária",
    };

    setAnalyses(prev => ({ ...prev, [nc.id]: analysis }));
    setAnalyzing(null);
    toast.success("Análise IA gerada com sucesso!");
  };

  const exportAnalysisPDF = (nc: NonConformity) => {
    toast.success(`PDF exportado: Análise ${nc.number}`);
  };

  const filteredNCs = vesselId 
    ? MOCK_NON_CONFORMITIES.filter(nc => nc.vessel.includes(vesselId))
    : MOCK_NON_CONFORMITIES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          🧠 Análise IA + Plano de Ação - Não Conformidades
        </CardTitle>
        <CardDescription>
          Análise inteligente com recomendações e planos de ação para não conformidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredNCs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>Nenhuma não conformidade encontrada para o filtro selecionado</p>
          </div>
        ) : (
          filteredNCs.map((nc) => (
            <Card key={nc.id} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(nc.severity)}>
                        {nc.severity === "critical" && "🔴 Crítica"}
                        {nc.severity === "high" && "🟠 Alta"}
                        {nc.severity === "medium" && "🟡 Média"}
                        {nc.severity === "low" && "🟢 Baixa"}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">{nc.number}</span>
                    </div>
                    <p className="font-semibold">{nc.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>🚢 {nc.vessel}</span>
                      <span>📅 {new Date(nc.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!analyses[nc.id] ? (
                      <Button
                        onClick={() => generateAiAnalysis(nc)}
                        disabled={analyzing === nc.id}
                        size="sm"
                        variant="outline"
                      >
                        {analyzing === nc.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                            Analisando...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Gerar Análise IA
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => exportAnalysisPDF(nc)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {analyzing === nc.id && (
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              )}

              {analyses[nc.id] && (
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2">Causa Raiz Identificada</h4>
                        <p className="text-sm text-purple-800">{analyses[nc.id].rootCause}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Ações Imediatas
                      </h4>
                      <ul className="space-y-2">
                        {analyses[nc.id].immediateActions.map((action, idx) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Ações Preventivas
                      </h4>
                      <ul className="space-y-2">
                        {analyses[nc.id].preventiveActions.map((action, idx) => (
                          <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">⏱️ Cronograma</h4>
                      <p className="text-sm text-gray-700">{analyses[nc.id].timeline}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Nível de Risco</h4>
                      <p className="text-sm text-gray-700 font-semibold">{analyses[nc.id].riskLevel}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">💼 Recursos Necessários</h4>
                    <ul className="space-y-1">
                      {analyses[nc.id].resources.map((resource, idx) => (
                        <li key={idx} className="text-sm text-amber-800">• {resource}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
