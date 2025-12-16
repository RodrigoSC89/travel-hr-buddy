import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { streamCopilotSuggestions } from "@/services/mmi/copilotApi";
import { Loader2, Sparkles, Send } from "lucide-react";

export default function MMICopilot() {
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, descreva o problema de manutenção.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion("");

    try {
      await streamCopilotSuggestions(prompt, (chunk) => {
        setSuggestion((prev) => prev + chunk);
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível obter sugestões.",
        variant: "destructive",
      });
      console.error("Error getting copilot suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamplePrompt = (example: string) => {
    setPrompt(example);
    setSuggestion("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Copilot MMI - Assistente de Manutenção
        </CardTitle>
        <CardDescription>
          Descreva um problema de manutenção e receba sugestões baseadas em casos históricos similares
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Example prompts */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Exemplos rápidos:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExamplePrompt("Gerador STBD com ruído incomum e aumento de temperatura")}
            >
              Gerador com ruído
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExamplePrompt("Bomba hidráulica apresentando vibração excessiva")}
            >
              Bomba com vibração
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExamplePrompt("Válvula de segurança com leitura fora do padrão")}
            >
              Válvula de segurança
            </Button>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descreva o problema:</label>
          <Textarea
            placeholder="Ex: Gerador STBD com ruído incomum e aumento de temperatura"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Action button */}
        <Button 
          onClick={handleGetSuggestion} 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analisando casos históricos...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Obter Sugestão
            </>
          )}
        </Button>

        {/* Suggestion display */}
        {suggestion && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Sugestão da IA:</p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="whitespace-pre-wrap text-sm text-gray-800">
                {suggestion}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600">
          <p className="font-medium mb-1">💡 Como funciona:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Busca casos semelhantes automaticamente com base no texto</li>
            <li>Gera sugestões baseadas em histórico real de falhas</li>
            <li>Responde com ações técnicas: peça, prazo, OS recomendada</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
