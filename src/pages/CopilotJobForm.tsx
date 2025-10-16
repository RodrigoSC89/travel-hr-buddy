/**
 * CopilotJobForm Demo Page
 * 
 * Showcases the JobFormWithExamples component with AI-powered job creation
 * and intelligent similarity search for maintenance cases.
 */

import JobFormWithExamples from "@/components/copilot/JobFormWithExamples";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CheckCircle2, Search, Copy, Save, Zap, Shield, Clock } from "lucide-react";

export default function CopilotJobForm() {
  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job submitted:", data);
    // In a real application, this would call an API to save the job
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className="text-center space-y-3 py-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Copilot Job Form com IA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crie jobs de manutenção com sugestões inteligentes baseadas em casos históricos usando IA e busca vetorial
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Zap className="h-3 w-3" />
              AI Integration
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <Search className="h-3 w-3" />
              Intelligent Search
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <Shield className="h-3 w-3" />
              Maintenance
            </span>
          </div>
        </div>

        {/* Main Component */}
        <div className="max-w-4xl mx-auto">
          <JobFormWithExamples onSubmit={handleJobSubmit} />
        </div>

        {/* Features Grid */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Funcionalidades
            </CardTitle>
            <CardDescription>
              Recursos disponíveis neste componente de criação inteligente de jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                <Search className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Busca Inteligente</h4>
                  <p className="text-sm text-muted-foreground">
                    Encontre casos similares usando IA e embeddings vetoriais OpenAI
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg hover:border-green-300 transition-colors">
                <Copy className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Auto-preenchimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Um clique para copiar sugestões de casos históricos comprovados
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg hover:border-purple-300 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Validação Inteligente</h4>
                  <p className="text-sm text-muted-foreground">
                    Validação de campos obrigatórios com feedback visual instantâneo
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg hover:border-orange-300 transition-colors">
                <Save className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Integração Fácil</h4>
                  <p className="text-sm text-muted-foreground">
                    Pronto para integrar com suas APIs de criação de jobs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Como Usar
            </CardTitle>
            <CardDescription>
              Siga estes passos simples para criar jobs de manutenção com eficiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              <li className="text-sm">
                <strong>Digite o componente:</strong> Informe o código ou nome do componente (ex: 603.0004.02 ou Gerador Diesel)
              </li>
              <li className="text-sm">
                <strong>Descreva o problema:</strong> Escreva uma descrição detalhada do problema ou ação de manutenção necessária
              </li>
              <li className="text-sm">
                <strong>Busque exemplos:</strong> Clique em &quot;🔍 Ver exemplos semelhantes&quot; para encontrar casos históricos similares
              </li>
              <li className="text-sm">
                <strong>Use sugestões:</strong> Clique em &quot;📋 Usar como base&quot; em qualquer exemplo para aplicar a sugestão
              </li>
              <li className="text-sm">
                <strong>Ajuste e envie:</strong> Faça ajustes necessários na descrição e clique em &quot;✅ Criar Job&quot;
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Usage Example Section */}
        <Card className="max-w-4xl mx-auto bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">💻 Exemplo de Integração</CardTitle>
            <CardDescription>
              Use este código para integrar o componente em sua aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-white p-4 rounded-lg overflow-x-auto text-xs border">
              <code>{`import { JobFormWithExamples } from '@/components/copilot';

function MyMaintenancePage() {
  const handleJobSubmit = (data) => {
    // Integrate with your API
    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  return (
    <JobFormWithExamples onSubmit={handleJobSubmit} />
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-base">🔧 Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p><strong>Framework:</strong> React 18 com TypeScript</p>
                <p><strong>UI Components:</strong> Shadcn/ui (Card, Button, Input, Textarea)</p>
                <p><strong>Icons:</strong> Lucide React</p>
                <p><strong>State Management:</strong> React Hooks (useState)</p>
                <p><strong>Notifications:</strong> Toast system (sonner)</p>
              </div>
              <div className="space-y-1">
                <p><strong>IA:</strong> OpenAI Embeddings (text-embedding-3-small)</p>
                <p><strong>Database:</strong> Supabase com pgvector extension</p>
                <p><strong>Search Method:</strong> Cosine Similarity</p>
                <p><strong>Similarity Threshold:</strong> 0.7 (70% mínimo)</p>
                <p><strong>Max Results:</strong> 5 casos mais similares</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
