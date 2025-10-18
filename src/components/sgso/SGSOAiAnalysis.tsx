import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";

export function SGSOAiAnalysis() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Análise com IA</CardTitle>
              <CardDescription>
                Análise inteligente de incidentes usando IA
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Em Breve
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Análise de Incidentes com IA</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A funcionalidade de análise com IA permitirá:
          </p>
          <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-2">
            <li>🧠 Identificação automática de padrões em incidentes</li>
            <li>📊 Análise de tendências e causas raiz</li>
            <li>💡 Sugestões de ações corretivas baseadas em histórico</li>
            <li>⚠️ Previsão de riscos potenciais</li>
            <li>📈 Recomendações para melhorias de segurança</li>
          </ul>
          <Button variant="outline" className="mt-4" disabled>
            <Sparkles className="mr-2 h-4 w-4" />
            Analisar com IA
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Esta funcionalidade estará disponível em uma versão futura do sistema.
        </div>
      </CardContent>
    </Card>
  );
}
