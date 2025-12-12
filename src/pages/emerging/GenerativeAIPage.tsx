/**
import { useCallback, useState } from "react";;
 * Generative AI Page
 * Geração automática de documentos e conteúdo com IA
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles,
  FileText,
  Image,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle,
  Download,
  Copy,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Loader2,
  Wand2,
  PenTool,
  FileImage
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContent {
  id: string;
  type: "document" | "report" | "email" | "summary";
  title: string;
  content: string;
  createdAt: string;
  tokens: number;
  model: string;
}

const GenerativeAIPage: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("report");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const recentGenerations: GeneratedContent[] = [
    { id: "1", type: "report", title: "Relatório Mensal de Operações", content: "...", createdAt: "Há 2 horas", tokens: 2450, model: "GPT-4" },
    { id: "2", type: "document", title: "Procedimento de Segurança Atualizado", content: "...", createdAt: "Há 5 horas", tokens: 1820, model: "GPT-4" },
    { id: "3", type: "email", title: "Comunicado para Tripulação", content: "...", createdAt: "Ontem", tokens: 456, model: "GPT-4" },
    { id: "4", type: "summary", title: "Resumo de Inspeção", content: "...", createdAt: "Ontem", tokens: 890, model: "GPT-4" },
    { id: "5", type: "report", title: "Análise de Consumo de Combustível", content: "...", createdAt: "3 dias atrás", tokens: 3120, model: "GPT-4" },
  ];

  const templates = [
    { id: "1", name: "Relatório de Viagem", category: "Operações", uses: 234 },
    { id: "2", name: "Checklist de Inspeção", category: "Segurança", uses: 189 },
    { id: "3", name: "Comunicado Oficial", category: "Comunicação", uses: 156 },
    { id: "4", name: "Resumo Executivo", category: "Gestão", uses: 145 },
    { id: "5", name: "Procedimento Técnico", category: "Manutenção", uses: 123 },
    { id: "6", name: "Relatório de Compliance", category: "Regulatório", uses: 98 },
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Por favor, insira uma descrição do que deseja gerar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const systemPrompt = `Você é um assistente especializado em gerar documentos marítimos profissionais. 
      Gere um ${documentType} baseado na solicitação do usuário.
      Use formatação markdown e seja detalhado e profissional.
      Responda em português brasileiro.`;

      const response = await supabase.functions.invoke("ai-assistant", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setGeneratedContent(response.data?.response || "Conteúdo gerado com sucesso.");
      toast({
        title: "Conteúdo Gerado",
        description: "O documento foi gerado com sucesso!",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      // Fallback com conteúdo simulado
      setGeneratedContent(`# ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Gerado

## Introdução

Este documento foi gerado automaticamente pela IA Generativa do Nautilus One com base na sua solicitação:

> "${prompt}"

## Conteúdo Principal

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Seção 1
- Ponto importante 1
- Ponto importante 2
- Ponto importante 3

### Seção 2
Detalhamento adicional com informações relevantes para o contexto marítimo.

## Conclusão

Este documento foi gerado automaticamente e deve ser revisado antes do uso oficial.

---
*Gerado por Nautilus One - IA Generativa*
*Data: ${new Date().toLocaleDateString("pt-BR")}*`);
      
      toast({
        title: "Conteúdo Gerado (Demo)",
        description: "Conteúdo de demonstração gerado.",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, documentType, toast]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  }, [generatedContent, toast]);

  const getTypeBadge = (type: GeneratedContent["type"]) => {
    switch (type) {
    case "document":
      return <Badge variant="outline" className="border-blue-500/30 text-blue-400">Documento</Badge>;
    case "report":
      return <Badge variant="outline" className="border-green-500/30 text-green-400">Relatório</Badge>;
    case "email":
      return <Badge variant="outline" className="border-purple-500/30 text-purple-400">Email</Badge>;
    case "summary":
      return <Badge variant="outline" className="border-orange-500/30 text-orange-400">Resumo</Badge>;
    }
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Sparkles}
        title="IA Generativa"
        description="Geração automática de documentos, relatórios e conteúdo com IA"
        gradient="orange"
        badges={[
          { icon: Wand2, label: "GPT-4" },
          { icon: FileText, label: "156 Docs Gerados" },
          { icon: Zap, label: "Tempo Real" }
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Docs Gerados</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Usados</p>
                <p className="text-2xl font-bold">45.2K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">8.5s</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <PenTool className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Gerar Conteúdo</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Criar Novo Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report">Relatório</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="summary">Resumo</SelectItem>
                      <SelectItem value="procedure">Procedimento</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Descreva o que deseja gerar</Label>
                  <Textarea 
                    placeholder="Ex: Gere um relatório de viagem da embarcação Atlântico Sul de Santos para Rio de Janeiro, incluindo condições climáticas, consumo de combustível e observações da tripulação..."
                    className="min-h-[150px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Conteúdo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resultado
                  </CardTitle>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Exportar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  {generatedContent ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                      <p>O conteúdo gerado aparecerá aqui</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdos Gerados Recentemente</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {recentGenerations.map((gen) => (
                    <div key={gen.id} className="p-4 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">{gen.title}</span>
                          {getTypeBadge(gen.type)}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {gen.createdAt}
                        </span>
                        <span>{gen.tokens} tokens</span>
                        <Badge variant="outline" className="text-xs">{gen.model}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PenTool className="h-5 w-5 text-primary" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{template.uses} usos</span>
                    <Button size="sm">Usar Template</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Geração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Modelo de IA</Label>
                    <Select defaultValue="gpt4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt4">GPT-4 (Recomendado)</SelectItem>
                        <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gemini">Gemini 2.5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Idioma Padrão</Label>
                    <Select defaultValue="pt">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português (Brasil)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Temperatura (Criatividade)</Label>
                    <Input type="number" defaultValue="0.7" step="0.1" min="0" max="1" />
                    <p className="text-xs text-muted-foreground">0 = Mais preciso, 1 = Mais criativo</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Limite de Tokens</Label>
                    <Input type="number" defaultValue="4000" step="500" />
                  </div>
                </div>
              </div>
              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default GenerativeAIPage;
