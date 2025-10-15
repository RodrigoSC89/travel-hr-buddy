/**
 * Copilot Job Form Demo Page
 * 
 * This page demonstrates the complete JobFormWithExamples feature
 * with AI-powered similar examples integration
 */

import { JobFormWithExamples } from "@/components/copilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CheckCircle2, Search, Copy, Save, BookOpen, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CopilotJobFormPage() {
  const { toast } = useToast();

  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job created:", data);
    toast({
      title: "✅ Job criado com sucesso!",
      description: `Componente: ${data.component}`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Sparkles className="h-10 w-10 text-primary" />
              Copilot Job Form com IA
            </h1>
            <p className="text-lg text-muted-foreground">
              Crie jobs de manutenção com sugestões inteligentes baseadas em casos históricos
            </p>
          </div>

          {/* Main Component */}
          <JobFormWithExamples onSubmit={handleJobSubmit} />
        </div>

        {/* Documentation Sidebar - Right Column */}
        <div className="space-y-6">
          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-primary">1.</span>
                <p>Digite o código do componente (ex: 603.0004.02)</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-primary">2.</span>
                <p>Descreva o problema de manutenção</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-primary">3.</span>
                <p>Clique em "Ver exemplos semelhantes"</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-primary">4.</span>
                <p>Escolha um exemplo e clique em "Usar como base"</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-primary">5.</span>
                <p>Revise e ajuste a descrição se necessário</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-primary">6.</span>
                <p>Clique em "Criar Job" para finalizar</p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-start">
                <Search className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Busca Inteligente</h4>
                  <p className="text-xs text-muted-foreground">
                    IA encontra casos similares usando embeddings vetoriais
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Copy className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Auto-preenchimento</h4>
                  <p className="text-xs text-muted-foreground">
                    Um clique para aplicar sugestões históricas
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Validação</h4>
                  <p className="text-xs text-muted-foreground">
                    Campos obrigatórios validados automaticamente
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Save className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Integração</h4>
                  <p className="text-xs text-muted-foreground">
                    Pronto para conectar com APIs de jobs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Exemplos de Teste</CardTitle>
              <CardDescription>Experimente com estes casos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold">Gerador Diesel</p>
                <p className="text-xs text-muted-foreground">
                  "Ruído anormal no gerador STBD"
                </p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold">Bomba Hidráulica</p>
                <p className="text-xs text-muted-foreground">
                  "Vibração excessiva na bomba"
                </p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold">Sistema Elétrico</p>
                <p className="text-xs text-muted-foreground">
                  "Falha no circuito de iluminação"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technology Info */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Tecnologia</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-muted-foreground">
              <p>• React 18.3.1 + TypeScript</p>
              <p>• Shadcn/UI Components</p>
              <p>• OpenAI Embeddings</p>
              <p>• Vector Similarity Search</p>
              <p>• Supabase Integration</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
