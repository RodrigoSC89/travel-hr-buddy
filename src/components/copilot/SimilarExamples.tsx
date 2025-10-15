import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimilarExample {
  id: string;
  description: string;
  component: string;
  similarity: number;
}

interface SimilarExamplesProps {
  input: string;
  onSelect: (text: string) => void;
}

export default function SimilarExamples({ input, onSelect }: SimilarExamplesProps) {
  const [examples, setExamples] = useState<SimilarExample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only search for similar examples if input has at least 10 characters
    if (input.length < 10) {
      setExamples([]);
      return;
    }

    const searchSimilarExamples = async () => {
      setIsLoading(true);
      try {
        // Simulate API call to find similar examples
        // In production, this would call a real API with vector similarity search
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock similar examples based on input
        const mockExamples: SimilarExample[] = [
          {
            id: "1",
            description: "Manutenção preventiva no gerador principal - substituição de filtros",
            component: "603.0004.02",
            similarity: 0.85,
          },
          {
            id: "2",
            description: "Inspeção e limpeza do sistema de refrigeração do motor",
            component: "603.0004.01",
            similarity: 0.78,
          },
          {
            id: "3",
            description: "Verificação de válvulas de segurança e ajuste de pressão",
            component: "603.0005.03",
            similarity: 0.72,
          },
        ];

        setExamples(mockExamples);
      } catch (error) {
        console.error("Error fetching similar examples:", error);
        toast({
          title: "Erro",
          description: "Não foi possível buscar exemplos similares",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchSimilarExamples();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, toast]);

  if (input.length < 10) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🔍 Exemplos Similares
        </CardTitle>
        <CardDescription>
          Casos históricos semelhantes ao seu problema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Buscando exemplos similares...
            </span>
          </div>
        ) : examples.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Nenhum exemplo similar encontrado
          </div>
        ) : (
          <div className="space-y-3">
            {examples.map((example) => (
              <div
                key={example.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">
                        {example.component}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(example.similarity * 100).toFixed(0)}% similar
                      </span>
                    </div>
                    <p className="text-sm">{example.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onSelect(example.description);
                      toast({
                        title: "Exemplo copiado",
                        description: "O texto foi preenchido no formulário",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
