import { useState } from "react";
import { ComentariosAuditoria } from "@/components/auditoria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Code, FileText, Lightbulb, AlertCircle } from "lucide-react";

export default function ComentariosAuditoriaDemo() {
  const [auditoriaId, setAuditoriaId] = useState("demo-auditoria-001");
  const [currentAuditoriaId, setCurrentAuditoriaId] = useState("demo-auditoria-001");

  const handleUpdateAuditoria = () => {
    setCurrentAuditoriaId(auditoriaId);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Comentários de Auditoria com IA
        </h1>
        <p className="text-lg text-gray-600">
          Sistema completo de comentários para auditorias com respostas automáticas de IA baseadas nas normas IMCA
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">
            <Lightbulb className="w-4 h-4 mr-2" />
            Demo Interativa
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileText className="w-4 h-4 mr-2" />
            Documentação
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="w-4 h-4 mr-2" />
            Exemplos de Código
          </TabsTrigger>
        </TabsList>

        {/* Tab: Demo Interativa */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Auditoria</CardTitle>
              <CardDescription>
                Insira o ID da auditoria para carregar e gerenciar comentários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="auditoriaId">ID da Auditoria</Label>
                  <Input
                    id="auditoriaId"
                    value={auditoriaId}
                    onChange={(e) => setAuditoriaId(e.target.value)}
                    placeholder="Ex: demo-auditoria-001"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleUpdateAuditoria}>
                    Carregar Auditoria
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Dica: Use IDs diferentes para testar múltiplas auditorias
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema de Comentários</CardTitle>
              <CardDescription>
                Adicione comentários e receba respostas técnicas automáticas da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComentariosAuditoria auditoriaId={currentAuditoriaId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos Principais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">💬 Gestão de Comentários</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Visualização em tempo real</li>
                    <li>Identificação de usuário e timestamp</li>
                    <li>Contador total de comentários</li>
                    <li>Interface responsiva e limpa</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🤖 Integração com IA</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Respostas automáticas via GPT-4</li>
                    <li>Contexto de auditor IMCA</li>
                    <li>Diferenciação visual (👤 usuário / 🤖 IA)</li>
                    <li>Fallback gracioso em caso de erro</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">📄 Exportação PDF</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Um clique para gerar PDF</li>
                    <li>Formatação profissional</li>
                    <li>Paginação automática</li>
                    <li>Metadados da auditoria incluídos</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🔒 Segurança</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Autenticação Supabase requerida</li>
                    <li>Validação de entrada</li>
                    <li>Políticas RLS no banco</li>
                    <li>Proteção contra XSS</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentação */}
        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Fluxo de Funcionamento</h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>
                      <strong>Usuário adiciona comentário:</strong> O comentário é enviado via POST para{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">/api/auditoria/[id]/comentarios</code>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>
                      <strong>Comentário é salvo:</strong> O sistema valida e armazena o comentário do usuário no banco de dados
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>
                      <strong>IA processa:</strong> O comentário é enviado para GPT-4 com contexto de auditor IMCA
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>
                      <strong>Resposta automática:</strong> A IA gera uma resposta técnica e é salva automaticamente com{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">user_id: "ia-auto-responder"</code>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">5.</span>
                    <span>
                      <strong>Atualização visual:</strong> A interface recarrega e mostra ambos os comentários com diferenciação visual
                    </span>
                  </li>
                </ol>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Estrutura do Banco de Dados</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
{`Tabela: auditoria_comentarios
├── id (uuid, primary key)
├── auditoria_id (uuid, foreign key)
├── comentario (text)
├── user_id (uuid | "ia-auto-responder")
├── created_at (timestamp)
└── updated_at (timestamp)`}
                  </pre>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
                <div className="space-y-3">
                  <div>
                    <code className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-sm">
                      GET /api/auditoria/[id]/comentarios
                    </code>
                    <p className="text-sm text-gray-600 mt-1">
                      Busca todos os comentários de uma auditoria específica (ordenados por data descendente)
                    </p>
                  </div>
                  <div>
                    <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      POST /api/auditoria/[id]/comentarios
                    </code>
                    <p className="text-sm text-gray-600 mt-1">
                      Cria novo comentário e gera resposta automática da IA (requer autenticação)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Exemplos de Código */}
        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uso Básico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Importação</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`import { ComentariosAuditoria } from "@/components/auditoria";`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Uso no Componente</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`function MinhaAuditoria() {
  return (
    <div className="container">
      <h1>Auditoria SGSO</h1>
      
      {/* Seção de comentários */}
      <ComentariosAuditoria auditoriaId="audit-123" />
    </div>
  );
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Integração com API (Frontend)</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`// Buscar comentários
const response = await fetch('/api/auditoria/audit-123/comentarios');
const comentarios = await response.json();

// Criar novo comentário
const response = await fetch('/api/auditoria/audit-123/comentarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    comentario: 'Verificar equipamentos de segurança' 
  })
});`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Variáveis de Ambiente Necessárias</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-servico
VITE_OPENAI_API_KEY=sk-proj-...`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Props do Componente</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 border">Prop</th>
                          <th className="text-left p-2 border">Tipo</th>
                          <th className="text-left p-2 border">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border font-mono text-blue-600">auditoriaId</td>
                          <td className="p-2 border font-mono">string</td>
                          <td className="p-2 border">ID único da auditoria (obrigatório)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Interface do Comentário</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`interface Comentario {
  id: string;                 // UUID do comentário
  comentario: string;         // Texto do comentário
  user_id: string;           // UUID do usuário ou "ia-auto-responder"
  created_at: string;        // ISO timestamp
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
