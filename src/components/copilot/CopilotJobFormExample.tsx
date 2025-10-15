/**
 * CopilotJobFormExample Component
 * 
 * This file demonstrates the JobFormWithExamples component in action.
 * It serves as both a demo page and usage documentation.
 */

import JobFormWithExamples from "@/components/copilot/JobFormWithExamples";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CheckCircle2, Search, Copy, Save } from "lucide-react";

export default function CopilotJobFormExample() {
  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job submitted:", data);
    // In a real application, this would call an API to save the job
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-10 w-10 text-primary" />
            Copilot Job Form com IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Crie jobs de manutenção com sugestões inteligentes baseadas em casos históricos
          </p>
        </div>

        {/* Main Component */}
        <JobFormWithExamples onSubmit={handleJobSubmit} />

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Funcionalidades</CardTitle>
            <CardDescription>
              Conheça os recursos disponíveis neste componente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 border rounded-lg">
                <Search className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Busca Inteligente</h4>
                  <p className="text-sm text-muted-foreground">
                    Encontre casos similares usando IA e embeddings vetoriais
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
                <Copy className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Auto-preenchimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Um clique para copiar sugestões de casos históricos
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Validação</h4>
                  <p className="text-sm text-muted-foreground">
                    Validação de campos obrigatórios com feedback visual
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
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
        <Card>
          <CardHeader>
            <CardTitle>📖 Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              <li className="text-sm">
                <strong>Digite o componente:</strong> Informe o código ou nome do componente (ex: 603.0004.02)
              </li>
              <li className="text-sm">
                <strong>Descreva o problema:</strong> Escreva uma descrição detalhada do problema ou ação necessária
              </li>
              <li className="text-sm">
                <strong>Busque exemplos:</strong> Clique em &quot;🔍 Ver exemplos semelhantes&quot; para ver casos históricos
              </li>
              <li className="text-sm">
                <strong>Use sugestões:</strong> Clique em &quot;📋 Usar como base&quot; para aplicar uma sugestão
              </li>
              <li className="text-sm">
                <strong>Ajuste e envie:</strong> Faça ajustes necessários e clique em &quot;✅ Criar Job&quot;
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Usage Example Section */}
        <Card>
          <CardHeader>
            <CardTitle>💻 Exemplo de Integração</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`import JobFormWithExamples from '@/components/copilot/JobFormWithExamples';

function MyMaintenancePage() {
  const handleJobSubmit = (data) => {
    // Integrate with your API
    fetch('/api/jobs', {
      method: 'POST',
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

        {/* Example Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Cenários de Exemplo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold">Cenário 1: Problema no Gerador</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Componente:</strong> Gerador Diesel STBD
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Descrição:</strong> Gerador apresentando ruído anormal e temperatura elevada
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-semibold">Cenário 2: Manutenção Preventiva</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Componente:</strong> Bomba Hidráulica Principal
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Descrição:</strong> Substituição preventiva de vedações e rolamentos
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4 py-2">
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

        {/* Technical Details */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">🔧 Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Framework:</strong> React 18 com TypeScript</p>
                <p><strong>UI Components:</strong> Shadcn/ui (Card, Button, Input, Textarea)</p>
                <p><strong>Icons:</strong> Lucide React</p>
                <p><strong>State Management:</strong> React Hooks (useState)</p>
              </div>
              <div>
                <p><strong>IA:</strong> OpenAI Embeddings (text-embedding-3-small)</p>
                <p><strong>Database:</strong> Supabase com pgvector</p>
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
