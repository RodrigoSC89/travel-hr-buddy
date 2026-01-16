/**
 * PeotramAIEvidenceGenerator - Gerador de Evidências com IA
 * Gera templates e sugestões contextuais para cada requisito PEOTRAM 2024
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PEOTRAM_2024_ELEMENTOS_OFICIAIS,
  type PeotramRequisito,
  type PeotramElementoCompleto
} from "@/data/peotram-2024-integrated";
import {
  Brain,
  Sparkles,
  FileText,
  Download,
  Copy,
  Check,
  Loader2,
  Camera,
  Mic,
  ClipboardList,
  RefreshCw,
  Star,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedEvidence {
  type: "document" | "photo" | "record" | "interview";
  title: string;
  description: string;
  template?: string;
  examples?: string[];
}

interface AIEvidenceResponse {
  success: boolean;
  requirementCode: string;
  suggestions: {
    evidences: Array<{
      originalEvidence: string;
      suggestions: string[];
      template: string | null;
      examples: string[];
    }>;
    fullAnalysis: string;
    templates: string[];
    recommendations: string[];
  };
}

interface PeotramAIEvidenceGeneratorProps {
  vesselName?: string;
  dpClass?: string;
}

export const PeotramAIEvidenceGenerator: React.FC<PeotramAIEvidenceGeneratorProps> = ({
  vesselName = "Embarcação",
  dpClass = "DP2"
}) => {
  const [selectedElement, setSelectedElement] = useState<number>(1);
  const [selectedRequisito, setSelectedRequisito] = useState<PeotramRequisito | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIEvidenceResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const currentElement = PEOTRAM_2024_ELEMENTOS_OFICIAIS.find(e => e.numero === selectedElement);

  const generateEvidence = useCallback(async (requisito: PeotramRequisito) => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke("peotram-ai-evidence", {
        body: {
          requirementCode: requisito.codigo,
          requirementDescription: requisito.descricao,
          requiredEvidence: requisito.evidencias,
          elementName: currentElement?.nome || "",
          vesselName,
          dpClass
        }
      });

      if (error) throw error;

      setGeneratedContent(data as AIEvidenceResponse);
      toast.success("Evidências geradas com sucesso!");
    } catch (error) {
      console.error("Error generating evidence:", error);
      toast.error("Erro ao gerar evidências. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }, [currentElement, vesselName, dpClass]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-4 h-4" />;
      case "photo": return <Camera className="w-4 h-4" />;
      case "record": return <ClipboardList className="w-4 h-4" />;
      case "interview": return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Gerador de Evidências com IA
          </CardTitle>
          <CardDescription>
            Gere templates e sugestões contextuais para cada requisito PEOTRAM 2024
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Element Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selecione o Elemento</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedElement.toString()} 
              onValueChange={(v) => {
                setSelectedElement(parseInt(v));
                setSelectedRequisito(null);
                setGeneratedContent(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um elemento" />
              </SelectTrigger>
              <SelectContent>
                {PEOTRAM_2024_ELEMENTOS_OFICIAIS.map(el => (
                  <SelectItem key={el.numero} value={el.numero.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{el.numero}</Badge>
                      <span className="truncate">{el.nome}</span>
                      {el.isCritico && <Star className="w-3 h-3 text-destructive fill-destructive" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentElement && (
              <ScrollArea className="h-[400px] mt-4">
                <div className="space-y-2">
                  {currentElement.secoes.map(secao => (
                    <div key={secao.id} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground px-2">
                        {secao.id} - {secao.nome}
                      </p>
                      {secao.requisitos.map(req => (
                        <Button
                          key={req.codigo}
                          variant={selectedRequisito?.codigo === req.codigo ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => {
                            setSelectedRequisito(req);
                            setGeneratedContent(null);
                          }}
                        >
                          <Badge variant="outline" className="mr-2 shrink-0">{req.codigo}</Badge>
                          <span className="text-xs truncate">{req.descricao.slice(0, 50)}...</span>
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Requisito Details & Generation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">
              {selectedRequisito ? (
                <div className="flex items-center gap-2">
                  <Badge>{selectedRequisito.codigo}</Badge>
                  Detalhes do Requisito
                </div>
              ) : (
                "Selecione um requisito"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequisito ? (
              <div className="space-y-4">
                {/* Requirement description */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm">{selectedRequisito.descricao}</p>
                </div>

                {/* Required evidences */}
                <div>
                  <p className="text-sm font-medium mb-2">Evidências Requeridas:</p>
                  <div className="space-y-2">
                    {selectedRequisito.evidencias.map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <Button
                  className="w-full"
                  onClick={() => generateEvidence(selectedRequisito)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando evidências...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Sugestões com IA
                    </>
                  )}
                </Button>

                {/* Generated content */}
                {generatedContent && (
                  <Tabs defaultValue="analysis" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="analysis">Análise</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="mt-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Sugestões de Evidências</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(generatedContent.suggestions.fullAnalysis)}
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <ScrollArea className="h-[300px]">
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                                {generatedContent.suggestions.fullAnalysis}
                              </pre>
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="templates" className="mt-4">
                      <Card>
                        <CardContent className="pt-4">
                          {generatedContent.suggestions.templates.length > 0 ? (
                            <div className="space-y-2">
                              {generatedContent.suggestions.templates.map((template, idx) => (
                                <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{template}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(template)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              Nenhum template identificado nesta análise.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="recommendations" className="mt-4">
                      <Card>
                        <CardContent className="pt-4">
                          {generatedContent.suggestions.recommendations.length > 0 ? (
                            <div className="space-y-2">
                              {generatedContent.suggestions.recommendations.map((rec, idx) => (
                                <div key={idx} className="p-3 bg-muted/30 rounded-lg flex items-start gap-2">
                                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                  <span className="text-sm">{rec}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              Nenhuma recomendação identificada.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Selecione um requisito para gerar sugestões de evidências</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick templates section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates Rápidos
          </CardTitle>
          <CardDescription>
            Templates pré-definidos para evidências comuns do PEOTRAM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Registro de Treinamento",
                type: "document",
                description: "Template para registrar treinamentos realizados"
              },
              {
                title: "Checklist de Inspeção",
                type: "record",
                description: "Lista de verificação para inspeções periódicas"
              },
              {
                title: "Ata de Reunião SMS",
                type: "document",
                description: "Modelo de ata para reuniões de SMS"
              },
              {
                title: "Relatório de Auditoria",
                type: "document",
                description: "Template para relatório de auditoria interna"
              },
              {
                title: "Registro Fotográfico",
                type: "photo",
                description: "Orientações para registro fotográfico de evidências"
              },
              {
                title: "Entrevista de Verificação",
                type: "interview",
                description: "Roteiro para entrevistas de verificação"
              }
            ].map((template, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTypeIcon(template.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{template.title}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Download className="w-3 h-3 mr-2" />
                    Baixar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeotramAIEvidenceGenerator;
