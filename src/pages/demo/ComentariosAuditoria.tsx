import { useState } from "react";
import { ComentariosAuditoria } from "@/components/auditoria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ComentariosAuditoriaDemo() {
  const navigate = useNavigate();
  const [auditoriaId, setAuditoriaId] = useState("demo-audit-123");

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold mb-2">
          Demo: Comentários da Auditoria
        </h1>
        <p className="text-muted-foreground">
          Componente completo para gestão de comentários em auditorias com integração de IA e exportação em PDF
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Demo Interativa</TabsTrigger>
          <TabsTrigger value="documentation">Documentação</TabsTrigger>
          <TabsTrigger value="examples">Exemplos de Código</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Demo</CardTitle>
              <CardDescription>
                Configure o ID da auditoria para testar o componente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auditoria-id">ID da Auditoria</Label>
                <Input
                  id="auditoria-id"
                  value={auditoriaId}
                  onChange={(e) => setAuditoriaId(e.target.value)}
                  placeholder="Insira o ID da auditoria"
                />
                <p className="text-xs text-muted-foreground">
                  Use qualquer ID. Para testes, use "demo-audit-123"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Componente em Ação</CardTitle>
              <CardDescription>
                Teste o componente ComentariosAuditoria abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComentariosAuditoria auditoriaId={auditoriaId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h4 className="font-semibold">Sistema de Comentários</h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione e visualize comentários com identificação de usuário e timestamp
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="font-semibold">Resposta Automática da IA</h4>
                    <p className="text-sm text-muted-foreground">
                      A IA auditor IMCA responde automaticamente a cada comentário técnico
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h4 className="font-semibold">Exportação em PDF</h4>
                    <p className="text-sm text-muted-foreground">
                      Exporte todos os comentários como relatório PDF profissional
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h4 className="font-semibold">Atualização em Tempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      Lista de comentários atualizada automaticamente após cada ação
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Instalação</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`import { ComentariosAuditoria } from "@/components/auditoria";`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Props</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3">Prop</th>
                        <th className="text-left p-3">Tipo</th>
                        <th className="text-left p-3">Obrigatório</th>
                        <th className="text-left p-3">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-mono">auditoriaId</td>
                        <td className="p-3">string</td>
                        <td className="p-3">Sim</td>
                        <td className="p-3">ID único da auditoria</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4">
                    <code className="font-mono text-sm">GET /api/auditoria/[id]/comentarios</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Busca todos os comentários de uma auditoria
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="font-mono text-sm">POST /api/auditoria/[id]/comentarios</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cria um novo comentário e aciona resposta automática da IA
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Estrutura de Dados</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`interface Comentario {
  id: string;
  comentario: string;
  user_id: string;
  created_at: string;
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Uso Básico</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`import { ComentariosAuditoria } from "@/components/auditoria";

function AuditPage() {
  return (
    <div>
      <h1>Detalhes da Auditoria</h1>
      <ComentariosAuditoria auditoriaId="audit-123" />
    </div>
  );
}`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Integração com Página de Auditoria
                </h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`import { useParams } from "react-router-dom";
import { ComentariosAuditoria } from "@/components/auditoria";

function AuditoriaDetailPage() {
  const { id } = useParams();

  return (
    <div className="container py-6">
      <div className="grid gap-6">
        {/* Informações da auditoria */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Conteúdo da auditoria */}
          </CardContent>
        </Card>

        {/* Seção de comentários */}
        <Card>
          <CardHeader>
            <CardTitle>Comentários</CardTitle>
          </CardHeader>
          <CardContent>
            <ComentariosAuditoria auditoriaId={id!} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Configuração do Backend
                </h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`// Variáveis de ambiente necessárias (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_OPENAI_API_KEY=sk-proj-...

// Migração SQL já aplicada:
// supabase/migrations/20251016160000_create_auditoria_comentarios.sql`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
