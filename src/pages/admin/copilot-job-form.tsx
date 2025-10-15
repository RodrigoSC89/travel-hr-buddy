/**
 * Copilot Job Form Demo Page
 * 
 * This page demonstrates the complete Copilot Job Form feature with
 * AI-powered similar examples integration.
 */

import { JobFormWithExamples } from "@/components/copilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Search, 
  MousePointerClick, 
  CheckCircle2,
  Brain,
  Zap,
  Target,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface JobFormData {
  component: string;
  description: string;
  title?: string;
}

export default function CopilotJobFormPage() {
  const handleJobSubmit = (data: JobFormData) => {
    console.log("Job criado:", data);
    toast.success("Job criado com sucesso!", {
      description: `Componente: ${data.component}`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Documentation & Guide */}
        <div className="lg:col-span-1 space-y-4">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Copilot Job Form
              </CardTitle>
              <CardDescription>
                Criação inteligente de jobs com sugestões baseadas em IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Real-time Search
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Target className="h-3 w-3" />
                  Smart Suggestions
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <strong>Digite a descrição</strong>
                    <p className="text-muted-foreground">
                      Descreva o problema ou manutenção necessária
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <Search className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <strong>Busque exemplos</strong>
                    <p className="text-muted-foreground">
                      Clique em &quot;Ver exemplos semelhantes&quot;
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <Brain className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <strong>IA analisa histórico</strong>
                    <p className="text-muted-foreground">
                      Sistema busca casos similares usando embeddings
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <strong>Use como base</strong>
                    <p className="text-muted-foreground">
                      Aplique sugestões com um clique
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <strong>Crie o job</strong>
                    <p className="text-muted-foreground">
                      Ajuste e salve seu novo job
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Features Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Busca com debounce de 300ms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Pontuação de similaridade (0-100%)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Auto-preenchimento com um clique
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Ativa com 3+ caracteres
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Estados de carregamento/vazio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  TypeScript com type safety
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Design responsivo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Acessibilidade (ARIA)
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Integration Example */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Integração Simples</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto">
{`import { JobFormWithExamples } from 
  "@/components/copilot";

export default function MyPage() {
  return <JobFormWithExamples />;
}`}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Demo */}
        <div className="lg:col-span-2">
          <JobFormWithExamples onSubmit={handleJobSubmit} />
        </div>
      </div>
    </div>
  );
}
