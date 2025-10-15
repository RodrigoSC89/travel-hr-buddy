import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";

interface SimilarExample {
  id: string;
  description: string;
  component?: string;
  similarity?: number;
}

interface SimilarExamplesProps {
  input: string;
  onSelect: (text: string) => void;
}

export default function SimilarExamples({ input, onSelect }: SimilarExamplesProps) {
  const [examples, setExamples] = useState<SimilarExample[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only search if input has at least 3 characters
    if (!input || input.trim().length < 3) {
      setExamples([]);
      return;
    }

    const searchExamples = async () => {
      setLoading(true);
      try {
        // Simulate API call - in real implementation, this would call your similarity search API
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Mock data for demonstration
        const mockExamples: SimilarExample[] = [
          {
            id: "1",
            description: "Manutenção preventiva no sistema hidráulico do componente 603.0004.02",
            component: "603.0004.02",
            similarity: 0.95,
          },
          {
            id: "2",
            description: "Inspeção e reparo do sistema de refrigeração - componente 603.0004.01",
            component: "603.0004.01",
            similarity: 0.87,
          },
          {
            id: "3",
            description: "Verificação de vazamentos no sistema hidráulico",
            component: "603.0004.03",
            similarity: 0.82,
          },
        ];

        // Filter examples based on input similarity
        const filtered = mockExamples.filter(
          (ex) =>
            ex.description.toLowerCase().includes(input.toLowerCase()) ||
            ex.component?.toLowerCase().includes(input.toLowerCase())
        );

        setExamples(filtered);
      } catch (error) {
        console.error("Error searching examples:", error);
        setExamples([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchExamples();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input]);

  // Don't show anything if there's no input or it's too short
  if (!input || input.trim().length < 3) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Exemplos Similares
        </CardTitle>
        <CardDescription>
          Casos históricos que podem ajudar a preencher o formulário
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Buscando exemplos similares...
            </span>
          </div>
        ) : examples.length > 0 ? (
          <div className="space-y-2">
            {examples.map((example) => (
              <div
                key={example.id}
                onClick={() => onSelect(example.description)}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{example.description}</div>
                    {example.component && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Componente: {example.component}
                      </div>
                    )}
                  </div>
                  {example.similarity && (
                    <Badge variant="secondary">
                      {Math.round(example.similarity * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            Nenhum exemplo similar encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
