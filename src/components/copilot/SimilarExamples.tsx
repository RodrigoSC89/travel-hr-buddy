/**
 * SimilarExamples Component
 * 
 * A React component that displays similar historical jobs based on user input
 * using RAG (Retrieval-Augmented Generation) with vector embeddings.
 * 
 * Features:
 * - Search button to trigger similarity search
 * - RAG integration with OpenAI embeddings
 * - Vector search via Supabase
 * - Card display with job details and similarity scores
 * - Graceful degradation with mock data fallback
 * - Loading states
 */

import { useState } from "react";
import { querySimilarJobs } from "@/lib/ai/copilot/querySimilarJobs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobExample {
  id: string;
  title: string;
  description?: string;
  status: string;
  similarity: number;
  metadata?: {
    component_id?: string;
    created_at?: string;
    ai_suggestion?: string;
    vessel?: string;
    category?: string;
  };
}

interface SimilarExamplesProps {
  input: string;
}

export default function SimilarExamples({ input }: SimilarExamplesProps) {
  const [examples, setExamples] = useState<JobExample[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExamples = async () => {
    if (!input || input.trim().length < 10) {
      toast({
        title: "Entrada insuficiente",
        description: "Por favor, forneça mais detalhes sobre o job (mínimo 10 caracteres).",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await querySimilarJobs(input);
      setExamples(result || []);
      
      if (result && result.length > 0) {
        toast({
          title: "Exemplos encontrados",
          description: `Encontrados ${result.length} jobs semelhantes.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Nenhum exemplo encontrado",
          description: "Não foram encontrados jobs similares. Tente uma descrição diferente.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar exemplos:", err);
      
      // Fallback to mock data on error
      const mockData: JobExample[] = [
        {
          id: "mock-1",
          title: "Manutenção de Gerador Principal",
          description: "Manutenção preventiva do gerador principal com troca de óleo e filtros",
          status: "completed",
          similarity: 0.85,
          metadata: {
            component_id: "GEN-001",
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            ai_suggestion: "Realizar inspeção visual, verificar níveis de óleo, trocar filtros e testar sistema de resfriamento.",
            vessel: "MV Atlantic",
            category: "Preventiva",
          },
        },
        {
          id: "mock-2",
          title: "Reparo de Bomba Hidráulica",
          description: "Correção de vazamento em bomba hidráulica do sistema de governo",
          status: "completed",
          similarity: 0.78,
          metadata: {
            component_id: "HYD-042",
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            ai_suggestion: "Substituir vedações, verificar pressão do sistema e testar operação em diferentes condições.",
            vessel: "MV Pacific",
            category: "Corretiva",
          },
        },
      ];
      
      setExamples(mockData);
      toast({
        title: "Usando dados de exemplo",
        description: "API indisponível. Mostrando exemplos fictícios.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseAsBase = (job: JobExample) => {
    if (job.metadata?.ai_suggestion) {
      navigator.clipboard.writeText(job.metadata.ai_suggestion);
      toast({
        title: "Copiado!",
        description: "Sugestão copiada para a área de transferência.",
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exemplos Semelhantes</h3>
        <Button
          onClick={fetchExamples}
          disabled={loading || !input || input.trim().length < 10}
          variant="default"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Buscando exemplos...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              🔍 Ver exemplos semelhantes
            </>
          )}
        </Button>
      </div>

      {examples.length > 0 && (
        <div className="mt-4 grid gap-4">
          {examples.map((job) => (
            <Card key={job.id} className="p-4 shadow hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">🔧 {job.title}</h3>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {Math.round(job.similarity * 100)}% similar
                  </span>
                </div>
                
                {job.description && (
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {job.metadata?.component_id && (
                    <p>
                      <strong>Componente:</strong> {job.metadata.component_id}
                    </p>
                  )}
                  {job.metadata?.created_at && (
                    <p>
                      <strong>Data:</strong>{" "}
                      {new Date(job.metadata.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {job.metadata?.vessel && (
                    <p>
                      <strong>Embarcação:</strong> {job.metadata.vessel}
                    </p>
                  )}
                  {job.metadata?.category && (
                    <p>
                      <strong>Categoria:</strong> {job.metadata.category}
                    </p>
                  )}
                </div>

                {job.metadata?.ai_suggestion && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-xs font-medium text-gray-600 mb-1">🧠 Sugestão IA:</p>
                    <p className="text-sm text-gray-800">{job.metadata.ai_suggestion}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    className="flex-1"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseAsBase(job)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    📋 Usar como base
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {examples.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Preencha a descrição do job e clique no botão para ver exemplos semelhantes.</p>
        </div>
      )}
    </div>
  );
}
