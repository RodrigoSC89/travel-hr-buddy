/**
 * Copilot Job Form - Admin Demo Page
 * 
 * This page demonstrates the JobFormWithExamples component with comprehensive
 * documentation and example scenarios.
 */

import { JobFormWithExamples } from "@/components/copilot";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, Search, Copy, Save, Lightbulb, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CopilotJobFormPage() {
  const { toast } = useToast();

  const handleJobSubmit = async (data: { component: string; description: string }) => {
    logger.info("Job submitted:", data);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from('action_items').insert({
        title: `Manutenção: ${data.component}`,
        description: data.description,
        source_module: 'copilot-job-form',
        status: 'pending',
        priority: 'media',
      });
      if (error) throw error;
      toast({
        title: "✅ Job criado com sucesso!",
        description: `Job para ${data.component} foi registrado no banco.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao criar job",
        description: "Não foi possível salvar no banco de dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Sparkles className="h-10 w-10 text-primary" />
              Copilot Job Form
            </h1>
            <p className="text-lg text-muted-foreground">
              Crie jobs de manutenção com sugestões inteligentes baseadas em IA
            </p>
          </div>

          {/* Main Component */}
          <JobFormWithExamples onSubmit={handleJobSubmit} />

          {/* Example Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                🎯 Cenários de Exemplo
              </CardTitle>
              <CardDescription>
                Experimente com estes exemplos para ver a IA em ação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-info pl-4 py-2 bg-info/5 rounded-r">
                  <h4 className="font-semibold">Cenário 1: Problema no Gerador</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Componente:</strong> Gerador Diesel STBD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Descrição:</strong> Gerador apresentando ruído anormal e temperatura elevada
                  </p>
                </div>
                
                <div className="border-l-4 border-success pl-4 py-2 bg-success/5 rounded-r">
                  <h4 className="font-semibold">Cenário 2: Manutenção Preventiva</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Componente:</strong> Bomba Hidráulica Principal
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Descrição:</strong> Substituição preventiva de vedações e rolamentos
                  </p>
                </div>
                
                <div className="border-l-4 border-destructive pl-4 py-2 bg-destructive/5 rounded-r">
                  <h4 className="font-semibold">Cenário 3: Falha Crítica</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Componente:</strong> Válvula de Segurança Principal
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Descrição:</strong> Válvula não responde ao comando de abertura
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💻 Exemplo de Integração
              </CardTitle>
              <CardDescription>
                Como usar este componente em sua aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs border">
                <code>{`import { JobFormWithExamples } from '@/components/copilot';
import { supabase } from '@/integrations/supabase/client';

function MyMaintenancePage() {
  const handleJobSubmit = async (data) => {
    // Persist via Supabase
    await supabase.from('action_items').insert({
      title: \`Manutenção: \${data.component}\`,
      description: data.description,
      source_module: 'copilot',
      status: 'pending',
    });
  };

  return (
    <JobFormWithExamples onSubmit={handleJobSubmit} />
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                ⚡ Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>
                  <strong>Digite o componente</strong>
                  <p className="ml-5 text-muted-foreground">
                    Informe o código (ex: 603.0004.02)
                  </p>
                </li>
                <li>
                  <strong>Descreva o problema</strong>
                  <p className="ml-5 text-muted-foreground">
                    Escreva detalhes da situação
                  </p>
                </li>
                <li>
                  <strong>Busque exemplos</strong>
                  <p className="ml-5 text-muted-foreground">
                    A IA encontra casos similares
                  </p>
                </li>
                <li>
                  <strong>Use sugestões</strong>
                  <p className="ml-5 text-muted-foreground">
                    Aplique exemplos com um clique
                  </p>
                </li>
                <li>
                  <strong>Ajuste e envie</strong>
                  <p className="ml-5 text-muted-foreground">
                    Revise e crie o job
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Search className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Busca Inteligente</h4>
                    <p className="text-xs text-muted-foreground">
                      IA com embeddings vetoriais
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Copy className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Auto-preenchimento</h4>
                    <p className="text-xs text-muted-foreground">
                      Copie sugestões com um clique
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Score de Similaridade</h4>
                    <p className="text-xs text-muted-foreground">
                      Veja quão relevante cada exemplo é
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Validação</h4>
                    <p className="text-xs text-muted-foreground">
                      Feedback visual em tempo real
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Save className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Integração Fácil</h4>
                    <p className="text-xs text-muted-foreground">
                      Pronto para suas APIs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Info */}
          <Card className="bg-muted border-dashed">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🔧 Detalhes Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <p className="font-semibold">Framework:</p>
                <p className="text-muted-foreground">React 18 + TypeScript</p>
              </div>
              <div>
                <p className="font-semibold">UI Components:</p>
                <p className="text-muted-foreground">Shadcn/ui (Radix UI)</p>
              </div>
              <div>
                <p className="font-semibold">Icons:</p>
                <p className="text-muted-foreground">Lucide React</p>
              </div>
              <div>
                <p className="font-semibold">IA:</p>
                <p className="text-muted-foreground">OpenAI text-embedding-3-small</p>
              </div>
              <div>
                <p className="font-semibold">Database:</p>
                <p className="text-muted-foreground">Supabase + pgvector</p>
              </div>
              <div>
                <p className="font-semibold">Similarity Threshold:</p>
                <p className="text-muted-foreground">70% mínimo</p>
              </div>
              <div>
                <p className="font-semibold">Max Results:</p>
                <p className="text-muted-foreground">5 casos mais similares</p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🎁 Benefícios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">+</Badge>
                <p className="text-sm">Aumenta produtividade</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">+</Badge>
                <p className="text-sm">Melhora precisão</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">+</Badge>
                <p className="text-sm">Reduz erros</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">+</Badge>
                <p className="text-sm">Facilita treinamento</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">+</Badge>
                <p className="text-sm">Aprende com histórico</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
