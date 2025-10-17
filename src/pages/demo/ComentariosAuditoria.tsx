import { useState } from "react";
import { ComentariosAuditoria } from "@/components/auditoria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ComentariosAuditoriaDemo() {
  const [auditoriaId, setAuditoriaId] = useState("demo-auditoria-123");

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ComentariosAuditoria - Demo Interativo</h1>
        <p className="text-muted-foreground">
          Demonstração do componente de comentários com integração de IA para auditorias IMCA
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Demo Interativo</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
          <TabsTrigger value="code">Exemplos de Código</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Demo</CardTitle>
              <CardDescription>
                Configure o ID da auditoria para testar o componente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="auditoriaId">ID da Auditoria</Label>
                <Input
                  id="auditoriaId"
                  value={auditoriaId}
                  onChange={(e) => setAuditoriaId(e.target.value)}
                  placeholder="Digite o ID da auditoria"
                />
                <p className="text-sm text-muted-foreground">
                  Use um UUID válido de uma auditoria existente no sistema
                </p>
              </div>
            </CardContent>
          </Card>

          <ComentariosAuditoria auditoriaId={auditoriaId} />
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                O componente <code>ComentariosAuditoria</code> fornece uma interface completa 
                para gerenciar comentários de auditorias com resposta automática de IA baseada 
                em normas IMCA.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Principais Funcionalidades</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>💬 Visualização de Comentários:</strong> Área rolável mostrando todos 
                  os comentários com timestamps e identificação de usuário
                </li>
                <li>
                  <strong>✍️ Submissão de Comentários:</strong> Campo de texto com validação 
                  em tempo real e feedback de submissão
                </li>
                <li>
                  <strong>🤖 Integração com IA:</strong> Respostas automáticas do GPT-4 da 
                  OpenAI em ~2 segundos
                </li>
                <li>
                  <strong>🎨 Distinção Visual:</strong> Comentários de usuário em cards brancos 
                  (👤), respostas da IA em cards azuis (🤖)
                </li>
                <li>
                  <strong>📄 Exportação PDF:</strong> Exportação com um clique via componente 
                  ExportarComentariosPDF integrado
                </li>
                <li>
                  <strong>⚡ Estados de Carregamento:</strong> Spinners e controles desabilitados 
                  durante operações
                </li>
                <li>
                  <strong>🚫 Tratamento de Erros:</strong> Mensagens de erro amigáveis em português
                </li>
                <li>
                  <strong>📱 Design Responsivo:</strong> Funciona em mobile, tablet e desktop
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arquitetura</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                {`┌─────────────────────────────────┐
│   ComentariosAuditoria (UI)    │
└─────────────────────────────────┘
              ↓
    /api/auditoria/[id]/comentarios
              ↓
      ┌──────────────────┐
      │  Supabase DB     │
      │  auditoria_      │
      │  comentarios     │
      └──────────────────┘
              ↓
      ┌──────────────────┐
      │  OpenAI GPT-4    │
      │  (IMCA Auditor)  │
      └──────────────────┘`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc pl-6 space-y-2">
                <li>Herda autenticação da API existente (Supabase)</li>
                <li>Políticas de Row Level Security aplicadas</li>
                <li>Validação de entrada via React</li>
                <li>Proteção XSS através de escape do React</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experiência do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Comentários de Usuário:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Fundo branco com bordas cinzas</li>
                  <li>Ícone de usuário (👤) e exibição de user ID</li>
                  <li>Timestamp formatado em português brasileiro</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Comentários da IA:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Fundo azul claro com bordas azuis</li>
                  <li>Ícone de bot (🤖) com label &quot;Auditor IA (IMCA)&quot;</li>
                  <li>user_id especial: &quot;ia-auto-responder&quot;</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Estados:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Carregando:</strong> Spinner com mensagem &quot;Carregando comentários...&quot;</li>
                  <li><strong>Vazio:</strong> Mensagem motivacional &quot;Seja o primeiro a comentar!&quot;</li>
                  <li><strong>Enviando:</strong> Botão mostra &quot;Enviando...&quot; com spinner</li>
                  <li><strong>Erro:</strong> Mensagem de erro clara exibida abaixo do textarea</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uso Básico</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                {`import { ComentariosAuditoria } from "@/components/auditoria";

function AuditDetailPage({ auditId }: { auditId: string }) {
  return (
    <div>
      <h1>Detalhes da Auditoria</h1>
      <ComentariosAuditoria auditoriaId={auditId} />
    </div>
  );
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Props da API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">ComentariosAuditoria</h4>
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Prop</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Obrigatório</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2"><code>auditoriaId</code></td>
                        <td className="border border-gray-300 px-4 py-2"><code>string</code></td>
                        <td className="border border-gray-300 px-4 py-2">Sim</td>
                        <td className="border border-gray-300 px-4 py-2">UUID da auditoria</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integração com API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">GET - Buscar Comentários</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                    {`GET /api/auditoria/[id]/comentarios

Response:
[
  {
    "id": "uuid-1",
    "comentario": "Verificar equipamentos",
    "created_at": "2025-10-16T12:00:00Z",
    "user_id": "user-uuid-123"
  },
  {
    "id": "uuid-2",
    "comentario": "Conforme norma IMCA...",
    "created_at": "2025-10-16T12:00:05Z",
    "user_id": "ia-auto-responder"
  }
]`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">POST - Criar Comentário</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                    {`POST /api/auditoria/[id]/comentarios
Content-Type: application/json

{
  "comentario": "Verificar equipamentos de segurança"
}

Response:
{
  "sucesso": true,
  "comentario": {
    "id": "uuid-1",
    "auditoria_id": "uuid-123",
    "comentario": "Verificar equipamentos de segurança",
    "user_id": "user-uuid-123",
    "created_at": "2025-10-16T12:00:00Z"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dependências</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li><code>@/components/ui/button</code> - Radix UI Button</li>
                <li><code>@/components/ui/textarea</code> - Radix UI Textarea</li>
                <li><code>@/components/ui/scroll-area</code> - Radix UI ScrollArea</li>
                <li><code>@/components/ui/card</code> - Radix UI Card</li>
                <li><code>lucide-react</code> - Ícones (Loader2, User, Bot)</li>
                <li><code>@/components/sgso/ExportarComentariosPDF</code> - Componente de exportação PDF</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
