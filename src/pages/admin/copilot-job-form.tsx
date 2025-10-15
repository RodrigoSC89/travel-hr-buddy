import { useState } from "react";
import { JobFormWithExamples } from "@/components/copilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CopilotJobFormPage() {
  const { toast } = useToast();
  const [submittedJobs, setSubmittedJobs] = useState<Array<{ component: string; description: string }>>([]);

  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job submitted:", data);
    setSubmittedJobs([...submittedJobs, data]);
    
    toast({
      title: "Job Criado com Sucesso",
      description: `Job para componente ${data.component} foi criado.`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Copilot Job Form com Exemplos
          </h1>
          <p className="text-muted-foreground">
            Crie jobs de manutenção com sugestões inteligentes baseadas em casos históricos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <JobFormWithExamples onSubmit={handleJobSubmit} />
          </div>

          {/* Documentation Sidebar - Takes 1/3 of the space */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como Funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Digite o código do componente</li>
                  <li>Descreva o problema de manutenção</li>
                  <li>Clique em &quot;Ver exemplos semelhantes&quot;</li>
                  <li>Use sugestões históricas como base</li>
                  <li>Crie o job com um clique</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✨ Sugestões baseadas em IA</li>
                  <li>🔍 Busca por similaridade vetorial</li>
                  <li>📋 Auto-preenchimento inteligente</li>
                  <li>⚡ Pesquisa em tempo real</li>
                  <li>🎯 Scores de similaridade</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tecnologias</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p><strong>Framework:</strong> React 18.3.1</p>
                <p><strong>UI:</strong> Shadcn/UI + TailwindCSS</p>
                <p><strong>AI:</strong> OpenAI Embeddings</p>
                <p><strong>Database:</strong> Supabase + pgvector</p>
                <p><strong>Search:</strong> Vector Similarity (cosine)</p>
              </CardContent>
            </Card>

            {submittedJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Jobs Criados</CardTitle>
                  <CardDescription>
                    {submittedJobs.length} job(s) criado(s) nesta sessão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submittedJobs.map((job, index) => (
                      <div key={index} className="text-xs border-l-2 border-primary pl-2">
                        <p className="font-semibold">{job.component}</p>
                        <p className="text-muted-foreground truncate">
                          {job.description.substring(0, 50)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Example Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Cenários de Exemplo</CardTitle>
            <CardDescription>
              Experimente estes exemplos para ver o sistema em ação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-sm">Problema no Gerador</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Componente: 603.0004.02
                </p>
                <p className="text-xs text-muted-foreground">
                  Descrição: &quot;Gerador com ruído anormal&quot;
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-sm">Bomba Hidráulica</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Componente: 701.2003.01
                </p>
                <p className="text-xs text-muted-foreground">
                  Descrição: &quot;Bomba com vibração excessiva&quot;
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-sm">Válvula de Segurança</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Componente: 502.1005.03
                </p>
                <p className="text-xs text-muted-foreground">
                  Descrição: &quot;Válvula não fecha completamente&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Information */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Informações de Integração</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Este componente está pronto para integração com APIs reais. Atualmente usa dados mock
              para demonstração.
            </p>
            <div className="text-xs space-y-1 mt-2">
              <p><strong>API de Busca:</strong> Conectar ao Supabase text search</p>
              <p><strong>Criação de Jobs:</strong> Integrar com API de criação de jobs</p>
              <p><strong>Notificações:</strong> Toast notifications já implementados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
