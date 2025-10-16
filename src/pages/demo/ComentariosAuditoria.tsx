import React, { useState } from "react";
import { ComentariosAuditoria } from "@/components/auditoria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Code, Play, Info } from "lucide-react";

export default function ComentariosAuditoriaDemo() {
  const [auditoriaId, setAuditoriaId] = useState("demo-audit-001");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ComentariosAuditoria - Demo Interativo
          </h1>
          <p className="text-gray-600">
            Sistema de comentários de auditoria com resposta automática de IA baseada em normas IMCA
          </p>
        </div>

        <Tabs defaultValue="demo" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">
              <Play className="w-4 h-4 mr-2" />
              Demo Interativo
            </TabsTrigger>
            <TabsTrigger value="docs">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="w-4 h-4 mr-2" />
              Exemplos de Código
            </TabsTrigger>
          </TabsList>

          {/* Tab: Demo Interativo */}
          <TabsContent value="demo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração</CardTitle>
                <CardDescription>Configure o ID da auditoria para testar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auditoriaId">ID da Auditoria</Label>
                  <Input
                    id="auditoriaId"
                    value={auditoriaId}
                    onChange={(e) => setAuditoriaId(e.target.value)}
                    placeholder="Digite o ID da auditoria"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use um ID de auditoria válido ou o padrão para testar
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Componente em Ação</CardTitle>
                <CardDescription>
                  Adicione comentários e veja a resposta automática da IA em ~2 segundos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComentariosAuditoria auditoriaId={auditoriaId} />
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Funcionalidades:</strong> Adicione comentários e observe como a IA
                responde automaticamente com análises técnicas baseadas nas normas IMCA. Os
                comentários de IA são destacados em azul e incluem o emoji 🤖.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Tab: Documentação */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">🎯 Recursos Principais</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>💬 Sistema completo de gerenciamento de comentários</li>
                    <li>🤖 Respostas automáticas de IA baseadas em normas IMCA</li>
                    <li>📄 Exportação de comentários para PDF com um clique</li>
                    <li>👤 Distinção visual entre comentários de usuários e IA</li>
                    <li>🔄 Atualização automática após novos comentários</li>
                    <li>⚠️ Detecção e destaque de alertas críticos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🏗️ Arquitetura</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Frontend: React 18.3.1 com TypeScript 5.8.3</li>
                    <li>UI: Radix UI + Tailwind CSS</li>
                    <li>Backend: Next.js API Routes</li>
                    <li>Banco de Dados: Supabase PostgreSQL</li>
                    <li>IA: OpenAI GPT-4 com persona de auditor IMCA</li>
                    <li>PDF: html2pdf.js para exportação</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🔒 Segurança</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Autenticação via Supabase necessária para POST</li>
                    <li>Row Level Security (RLS) no banco de dados</li>
                    <li>Validação de entrada e sanitização</li>
                    <li>Proteção contra XSS via React</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📊 Experiência do Usuário</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Cards brancos para comentários de usuários</li>
                    <li>Cards azuis claros para respostas da IA</li>
                    <li>Feedback em tempo real durante submissão</li>
                    <li>Estado vazio com mensagem motivadora</li>
                    <li>Design responsivo para todos os dispositivos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Exemplos de Código */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uso Básico</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`import { ComentariosAuditoria } from "@/components/auditoria";

function MinhaAuditoria() {
  return (
    <div>
      <h1>Auditoria IMCA #123</h1>
      <ComentariosAuditoria auditoriaId="123" />
    </div>
  );
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integração com Página</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`import { ComentariosAuditoria } from "@/components/auditoria";
import { Card } from "@/components/ui/card";

export default function AuditoriaDetailPage({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Outros detalhes da auditoria */}
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comentários e Análises</CardTitle>
        </CardHeader>
        <CardContent>
          <ComentariosAuditoria auditoriaId={id} />
        </CardContent>
      </Card>
    </div>
  );
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Propriedades do Componente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="font-mono text-sm">auditoriaId: string</code>
                    <p className="text-sm text-gray-600 mt-1">
                      ID único da auditoria para associar os comentários. Obrigatório.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">GET /api/auditoria/[id]/comentarios</h4>
                  <p className="text-sm text-gray-600 mb-2">Busca todos os comentários de uma auditoria</p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{`// Resposta
[
  {
    "id": "uuid",
    "comentario": "Texto do comentário",
    "created_at": "2025-10-16T12:00:00Z",
    "user_id": "user-123"
  }
]`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">POST /api/auditoria/[id]/comentarios</h4>
                  <p className="text-sm text-gray-600 mb-2">Cria um novo comentário (requer autenticação)</p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{`// Request
{
  "comentario": "Texto do comentário"
}

// Resposta
{
  "sucesso": true,
  "comentario": { /* dados do comentário */ }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
