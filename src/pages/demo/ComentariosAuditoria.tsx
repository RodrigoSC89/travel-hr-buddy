import { useState } from "react";
import { ComentariosAuditoria } from "@/components/auditoria";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, Code, BookOpen } from "lucide-react";

/**
 * Demo page para o componente ComentariosAuditoria
 * Demonstra a funcionalidade de comentários com resposta automática de IA
 */
const ComentariosAuditoriaDemo = () => {
  const [auditoriaId, setAuditoriaId] = useState("demo-audit-123");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                ComentariosAuditoria - Demo Interativo
              </h1>
              <p className="text-muted-foreground mt-2">
                Sistema de comentários com resposta automática baseada em IA (IMCA)
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Demo Mode
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">
              <MessageSquare className="h-4 w-4 mr-2" />
              Demo Interativo
            </TabsTrigger>
            <TabsTrigger value="docs">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Exemplos de Código
            </TabsTrigger>
          </TabsList>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Demo</CardTitle>
                <CardDescription>
                  Informe um ID de auditoria para testar o componente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="ID da auditoria"
                    value={auditoriaId}
                    onChange={(e) => setAuditoriaId(e.target.value)}
                    className="max-w-md"
                  />
                  <Badge variant="outline">Atual: {auditoriaId}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Componente ao Vivo</CardTitle>
                <CardDescription>
                  Teste o componente com o ID configurado acima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComentariosAuditoria auditoriaId={auditoriaId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📋 Visão Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  O componente <code className="bg-muted px-1 py-0.5 rounded">ComentariosAuditoria</code> 
                  {" "}fornece uma interface completa para gerenciar comentários de auditorias com resposta
                  automática de IA baseada em normas IMCA.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>✨ Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>
                    <strong>💬 Visualização de Comentários:</strong> Lista todos os comentários com timestamps
                    e identificação de usuários
                  </li>
                  <li>
                    <strong>✍️ Envio de Comentários:</strong> Formulário para adicionar novos comentários com
                    validação em tempo real
                  </li>
                  <li>
                    <strong>🤖 Integração com IA:</strong> Respostas automáticas do OpenAI GPT-4 dentro de ~2
                    segundos
                  </li>
                  <li>
                    <strong>🎨 Distinção Visual:</strong> Comentários de usuários em branco (👤) e respostas
                    de IA em azul (🤖)
                  </li>
                  <li>
                    <strong>📄 Exportação PDF:</strong> Botão para exportar todos os comentários em PDF
                    profissional
                  </li>
                  <li>
                    <strong>⚡ Estados de Loading:</strong> Spinners durante operações de carregamento e envio
                  </li>
                  <li>
                    <strong>🚫 Tratamento de Erros:</strong> Mensagens amigáveis em português
                  </li>
                  <li>
                    <strong>📱 Responsivo:</strong> Funciona em dispositivos móveis, tablets e desktops
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏗️ Arquitetura</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
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
                <CardTitle>🔐 Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>Autenticação via Supabase para requisições POST</li>
                  <li>Row Level Security (RLS) policies no banco de dados</li>
                  <li>Validação de entrada via React</li>
                  <li>Proteção XSS através de escapamento automático do React</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Experiência do Usuário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Comentários de Usuários</h4>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                    <li>Fundo branco com bordas cinzas</li>
                    <li>Ícone de usuário (👤) e ID do usuário</li>
                    <li>Timestamp formatado em português brasileiro</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Comentários de IA</h4>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                    <li>Fundo azul claro com bordas azuis</li>
                    <li>Ícone de bot (🤖) com label "Auditor IA (IMCA)"</li>
                    <li>user_id especial: "ia-auto-responder"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Estados</h4>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                    <li>Loading: Spinner com mensagem "Carregando comentários..."</li>
                    <li>Vazio: Mensagem motivacional "Seja o primeiro a comentar!"</li>
                    <li>Enviando: Botão mostra "Enviando..." com spinner</li>
                    <li>Erro: Mensagem de erro clara abaixo do textarea</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Uso Básico</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
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
                <CardTitle>📦 Props</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-3">Prop</th>
                        <th className="text-left py-2 px-3">Tipo</th>
                        <th className="text-left py-2 px-3">Obrigatório</th>
                        <th className="text-left py-2 px-3">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3">
                          <code className="bg-muted px-1 py-0.5 rounded">auditoriaId</code>
                        </td>
                        <td className="py-2 px-3">string</td>
                        <td className="py-2 px-3">Sim</td>
                        <td className="py-2 px-3">
                          ID único da auditoria para carregar e salvar comentários
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔌 Integração com API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  O componente se integra com o endpoint existente:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// GET - Buscar comentários
GET /api/auditoria/[id]/comentarios

// POST - Criar comentário (com resposta automática de IA)
POST /api/auditoria/[id]/comentarios
Content-Type: application/json

{
  "comentario": "Verificar equipamentos de segurança"
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📄 Interface de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`interface Comentario {
  id: string;
  comentario: string;
  created_at: string;
  user_id: string;
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 Componentes UI Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>
                    <code className="bg-muted px-1 py-0.5 rounded">Button</code> - Botões de ação
                  </li>
                  <li>
                    <code className="bg-muted px-1 py-0.5 rounded">Textarea</code> - Campo de entrada de
                    comentário
                  </li>
                  <li>
                    <code className="bg-muted px-1 py-0.5 rounded">ScrollArea</code> - Área scrollável de
                    comentários
                  </li>
                  <li>
                    <code className="bg-muted px-1 py-0.5 rounded">ExportarComentariosPDF</code> - Exportação
                    para PDF
                  </li>
                  <li>
                    Ícones do <code className="bg-muted px-1 py-0.5 rounded">lucide-react</code>: Loader2,
                    User, Bot
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComentariosAuditoriaDemo;
