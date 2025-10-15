import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb } from "lucide-react";

interface SimilarExample {
  id: string;
  component: string;
  description: string;
  similarity: number;
}

interface SimilarExamplesProps {
  input: string;
  onSelect: (text: string) => void;
}

export default function SimilarExamples({ input, onSelect }: SimilarExamplesProps) {
  const [examples, setExamples] = useState<SimilarExample[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!input || input.trim().length < 3) {
      setExamples([]);
      return;
    }

    const searchSimilarExamples = async () => {
      setIsLoading(true);
      
      try {
        // Simulated search - in a real implementation, this would call an API
        // that searches through historical job descriptions
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockExamples: SimilarExample[] = [
          {
            id: "1",
            component: "603.0004.02",
            description: "Manutenção preventiva do gerador principal - verificação de óleo e filtros",
            similarity: 0.85,
          },
          {
            id: "2",
            component: "603.0004.01",
            description: "Inspeção de bomba hidráulica com vazamento detectado",
            similarity: 0.72,
          },
          {
            id: "3",
            component: "603.0005.03",
            description: "Troca de válvula de segurança com leitura fora do padrão",
            similarity: 0.68,
          },
        ].filter(ex => 
          ex.description.toLowerCase().includes(input.toLowerCase().split(" ")[0]) ||
          input.toLowerCase().includes(ex.description.toLowerCase().split(" ")[0])
        );

        setExamples(mockExamples);
      } catch (error) {
        console.error("Error searching similar examples:", error);
        setExamples([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSimilarExamples, 300);
    return () => clearTimeout(debounceTimer);
  }, [input]);

  if (!input || input.trim().length < 3) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Exemplos Similares
        </CardTitle>
        <CardDescription>
          Baseado em histórico de jobs anteriores
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
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum exemplo similar encontrado
          </div>
        ) : (
          <div className="space-y-3">
            {examples.map((example) => (
              <div
                key={example.id}
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {example.component}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(example.similarity * 100)}% similar
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {example.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelect(example.description)}
                  >
                    Usar
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
