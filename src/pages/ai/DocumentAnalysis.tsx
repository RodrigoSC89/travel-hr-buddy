/**
import { useCallback, useState } from "react";;
 * AI Document Analysis - Análise de Documentos com IA
 * OCR e extração inteligente de dados de documentos
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  Loader2, 
  Sparkles,
  FileSearch,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface AnalysisResult {
  summary: string;
  entities: { type: string; value: string }[];
  keyPoints: string[];
  recommendations: string[];
}

const DocumentAnalysis: React.FC = () => {
  const [documentText, setDocumentText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const analyzeDocument = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Por favor, insira o texto do documento para análise.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);

    try {
      setProgress(30);

      const { data, error } = await supabase.functions.invoke("optimization-ai-copilot", {
        body: {
          messages: [
            {
              role: "user",
              content: `Analise o seguinte documento e forneça:
1. Um resumo executivo (máximo 3 parágrafos)
2. Entidades importantes encontradas (datas, valores, nomes, locais)
3. Pontos-chave do documento (lista com bullets)
4. Recomendações de ação baseadas no conteúdo

Documento:
${documentText}

Responda em formato estruturado usando markdown.`,
            },
          ],
          type: "document_analysis",
          context: "Análise inteligente de documentos marítimos e operacionais",
        },
      });

      setProgress(70);

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setProgress(90);

      // Parse the response into structured format
      const response = data?.response || "";
      
      setAnalysisResult({
        summary: response,
        entities: [],
        keyPoints: [],
        recommendations: [],
      });

      setProgress(100);

      toast({
        title: "Análise concluída!",
        description: "O documento foi analisado com sucesso.",
      });
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  });

  const handleCopy = async () => {
    if (analysisResult) {
      await navigator.clipboard.writeText(analysisResult.summary);
      toast({
        title: "Copiado!",
        description: "Resultado copiado para a área de transferência.",
      });
    }
  });

  const clearAll = () => {
    setDocumentText("");
    setAnalysisResult(null);
    setProgress(0);
  };

  const sampleDocuments = [
    {
      title: "Relatório de Manutenção",
      text: `RELATÓRIO DE MANUTENÇÃO PREVENTIVA
Embarcação: MV Ocean Star
Data: 15/11/2024
Responsável: Eng. Carlos Silva

ITENS VERIFICADOS:
1. Motor Principal - OK
   - Óleo trocado (50h de uso)
   - Filtros substituídos
   - Pressão de óleo: 4.2 bar

2. Sistema de Navegação
   - GPS calibrado
   - Radar funcionando
   - AIS ativo

3. Equipamentos de Segurança
   - Coletes: 25 unidades (OK)
   - Extintores: Vencimento 03/2025
   - Balsas: Última inspeção 01/2024

OBSERVAÇÕES:
- Necessária troca de bomba de porão até próxima viagem
- Pintura do casco com desgaste na linha d'água

PRÓXIMA MANUTENÇÃO: 15/02/2025`,
    },
    {
      title: "Certificado de Tripulante",
      text: `CERTIFICADO DE COMPETÊNCIA MARÍTIMA
Número: BR-2024-78543
Emissão: 10/03/2024
Validade: 10/03/2029

TITULAR:
Nome: João Pedro Santos
CPF: 123.456.789-00
Nacionalidade: Brasileira

HABILITAÇÕES:
- Oficial de Náutica (ON)
- Arqueação Bruta: Ilimitada
- Área de Navegação: Longo Curso

CURSOS OBRIGATÓRIOS:
✓ CFAQ-I (2023)
✓ ECIA (2024)
✓ GMDSS/GOC (2023)
✓ HUET (2024)

RESTRIÇÕES: Nenhuma

Autoridade Marítima do Brasil`,
    },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Análise de Documentos</h1>
            <p className="text-muted-foreground">
              OCR e extração inteligente de dados com IA
            </p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Documento de Entrada
            </CardTitle>
            <CardDescription>
              Cole o texto do documento ou use um exemplo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole aqui o texto do documento para análise..."
              value={documentText}
              onChange={handleChange}
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button
                onClick={analyzeDocument}
                disabled={isAnalyzing || !documentText.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <FileSearch className="h-4 w-4 mr-2" />
                    Analisar Documento
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processando documento...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Sample Documents */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Documentos de exemplo:
              </p>
              <div className="flex gap-2 flex-wrap">
                {sampleDocuments.map((doc, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={handleSetDocumentText}
                  >
                    {doc.title}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Resultado da Análise
              </CardTitle>
              {analysisResult && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <FileSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  O resultado da análise aparecerá aqui
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{analysisResult.summary}</ReactMarkdown>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Extração Inteligente</p>
              <p className="text-xs text-muted-foreground">
                Identifica entidades e dados relevantes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Resumo Automático</p>
              <p className="text-xs text-muted-foreground">
                Gera resumos executivos do conteúdo
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <AlertCircle className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Recomendações</p>
              <p className="text-xs text-muted-foreground">
                Sugere ações baseadas no conteúdo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
