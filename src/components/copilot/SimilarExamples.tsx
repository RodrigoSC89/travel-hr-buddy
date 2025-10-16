import { useState } from "react";
import { querySimilarJobs, type SimilarJobResult } from "@/lib/ai/copilot/querySimilarJobs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Copy, Clock, Wrench, TrendingUp, Sparkles } from "lucide-react";

export default function SimilarExamples({ input, onSelect }: { input: string, onSelect?: (text: string) => void }) {
  const [examples, setExamples] = useState<SimilarJobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExamples = async () => {
    if (!input || input.trim() === "") {
      toast({
        title: "⚠️ Campo vazio",
        description: "Por favor, digite uma descrição antes de buscar exemplos similares.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await querySimilarJobs(input);
      setExamples(result || []);
      
      if (result && result.length > 0) {
        toast({
          title: "✅ Exemplos encontrados",
          description: `Encontrados ${result.length} casos similares com sucesso.`,
        });
      } else {
        toast({
          title: "ℹ️ Nenhum resultado",
          description: "Não foram encontrados casos similares para esta descrição.",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar exemplos:", err);
      toast({
        title: "❌ Erro ao buscar",
        description: "Ocorreu um erro ao buscar exemplos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySuggestion = (suggestion: string) => {
    if (onSelect) {
      onSelect(suggestion);
      toast({
        title: "📋 Copiado com sucesso",
        description: "A sugestão foi copiada para o formulário.",
      });
    }
  };

  const getSimilarityPercentage = (similarity: number): string => {
    return `${Math.round(similarity * 100)}%`;
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.85) return "bg-green-500";
    if (similarity >= 0.75) return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={fetchExamples} 
        disabled={loading || !input}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            Buscando exemplos similares...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            🔍 Ver exemplos semelhantes
          </>
        )}
      </Button>

      {examples.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Encontrados <strong>{examples.length}</strong> casos similares
            </p>
          </div>

          <div className="grid gap-4">
            {examples.map((job, i) => (
              <Card key={job.id || i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wrench className="h-5 w-5 text-primary" />
                        {job.metadata.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(job.metadata.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={`${getSimilarityColor(job.similarity)} text-white flex items-center gap-1`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {getSimilarityPercentage(job.similarity)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold text-muted-foreground">Componente:</span>
                      <p className="font-medium">{job.metadata.component_id}</p>
                    </div>
                    {job.metadata.status && (
                      <div>
                        <span className="font-semibold text-muted-foreground">Status:</span>
                        <p className="font-medium capitalize">{job.metadata.status}</p>
                      </div>
                    )}
                  </div>

                  {job.metadata.ai_suggestion && job.metadata.ai_suggestion !== "N/A" && (
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Sugestão de IA
                      </p>
                      <p className="text-sm">{job.metadata.ai_suggestion}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCopySuggestion(job.metadata.ai_suggestion || job.metadata.description || "")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    📋 Usar como base
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
