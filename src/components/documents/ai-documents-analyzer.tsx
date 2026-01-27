/**
 * AI Documents Analyzer
 * PATCH 866: Fully refactored to align with actual database schema
 * Uses: ai_documents + ai_document_insights tables
 */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, FileText, Search, Eye, Download, AlertCircle, 
  CheckCircle, Clock, Loader2, FileImage, Brain, Tag, List, Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Tesseract from "tesseract.js";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

// Types aligned with actual database schema
type AIDocument = Database["public"]["Tables"]["ai_documents"]["Row"];
type AIDocumentInsight = Database["public"]["Tables"]["ai_document_insights"]["Row"];

interface ExtractedEntity {
  type: string;
  value: string;
  label?: string;
  confidence: number;
}

interface ProcessedDocumentView {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  ocr_status: string;
  storage_path: string;
  created_at: string;
  // From insights join
  extracted_text?: string | null;
  confidence?: number | null;
  summary?: string | null;
  entities?: ExtractedEntity[] | null;
  keywords?: string[] | null;
}

export function AIDocumentsAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<ProcessedDocumentView[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocumentView | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedDocumentView[]>([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!orgData) return;

      // Fetch documents
      const { data: docs, error } = await supabase
        .from("ai_documents")
        .select("*")
        .eq("organization_id", orgData.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch insights for each document
      const docsWithInsights: ProcessedDocumentView[] = await Promise.all(
        (docs || []).map(async (doc) => {
          const { data: insight } = await supabase
            .from("ai_document_insights")
            .select("*")
            .eq("document_id", doc.id)
            .single();

          return {
            ...doc,
            extracted_text: insight?.extracted_text,
            confidence: insight?.confidence,
            summary: insight?.summary,
            entities: insight?.entities as ExtractedEntity[] | null,
            keywords: insight?.keywords,
          };
        })
      );

      setDocuments(docsWithInsights);
    } catch (error) {
      logger.error("Error fetching documents:", error);
      toast({ title: "Erro ao carregar documentos", variant: "destructive" });
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/tiff"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um PDF ou imagem",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo do arquivo é 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} pronto para upload`,
      });
    }
  };

  const performOCR = async (file: File): Promise<{ text: string; confidence: number }> => {
    setProgress(10);
    
    const result = await Tesseract.recognize(file, "eng+por", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(10 + (m.progress * 70));
        }
      },
    });

    setProgress(80);
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  };

  const extractEntities = (text: string): ExtractedEntity[] => {
    const entities: ExtractedEntity[] = [];
    
    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    (text.match(emailRegex) || []).forEach((email) => {
      entities.push({ type: "email", value: email, label: "Email", confidence: 95 });
    });

    // Extract dates
    const dateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
    (text.match(dateRegex) || []).forEach((date) => {
      entities.push({ type: "date", value: date, label: "Data", confidence: 90 });
    });

    // Extract amounts
    const amountRegex = /(?:R\$|USD|\$|€)\s*[\d.,]+/g;
    (text.match(amountRegex) || []).forEach((amount) => {
      entities.push({ type: "amount", value: amount, label: "Valor", confidence: 85 });
    });

    // Extract phone numbers
    const phoneRegex = /\b\d{2,3}[-.\s]?\d{4,5}[-.\s]?\d{4}\b/g;
    (text.match(phoneRegex) || []).forEach((phone) => {
      entities.push({ type: "phone", value: phone, label: "Telefone", confidence: 88 });
    });

    // Extract IMO numbers
    const imoRegex = /IMO\s*\d{7}/gi;
    (text.match(imoRegex) || []).forEach((imo) => {
      entities.push({ type: "imo", value: imo, label: "IMO Number", confidence: 95 });
    });

    return entities;
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 4) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  };

  const generateSummary = (text: string): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join(". ") + ".";
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProcessing(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: orgData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      // Upload file to storage
      const fileName = `${crypto.randomUUID()}_${selectedFile.name}`;
      const storagePath = `documents/${orgData?.organization_id || "default"}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, selectedFile);

      if (uploadError) throw uploadError;

      setProgress(30);

      // Perform OCR
      const { text, confidence } = await performOCR(selectedFile);
      const extractedEntities = extractEntities(text);
      const keywords = extractKeywords(text);
      const summary = generateSummary(text);

      setProgress(85);

      // Insert document record
      const { data: doc, error: docError } = await supabase
        .from("ai_documents")
        .insert({
          organization_id: orgData?.organization_id,
          file_name: selectedFile.name,
          file_type: selectedFile.type.includes("pdf") ? "pdf" : "image",
          file_size: selectedFile.size,
          storage_path: storagePath,
          ocr_status: "completed",
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Insert insights record using raw query to bypass type mismatch
      const { error: insightError } = await supabase
        .from("ai_document_insights")
        .insert([{
          document_id: doc.id,
          extracted_text: text,
          confidence: confidence,
          summary: summary,
          keywords: keywords,
          entities: extractedEntities as unknown as Record<string, unknown>,
          organization_id: orgData?.organization_id,
          created_by: user.id,
        }] as unknown as Database["public"]["Tables"]["ai_document_insights"]["Insert"][]);

      if (insightError) throw insightError;

      setProgress(100);

      toast({
        title: "Documento processado com sucesso",
        description: `${extractedEntities.length} entidades extraídas`,
      });

      await fetchDocuments();
      setSelectedFile(null);
      setProgress(0);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error processing document:", error);
      toast({
        title: "Erro ao processar documento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = documents.filter(doc => 
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.extracted_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
  };

  const selectDocument = (doc: ProcessedDocumentView) => {
    setSelectedDocument(doc);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Processado</Badge>;
      case "processing":
        return <Badge className="bg-warning text-warning-foreground"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processando</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEntityBadgeColor = (type: string) => {
    switch (type) {
      case "email": return "bg-info/20 text-info border-info/30";
      case "date": return "bg-success/20 text-success border-success/30";
      case "amount": return "bg-warning/20 text-warning border-warning/30";
      case "phone": return "bg-primary/20 text-primary border-primary/30";
      case "imo": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análise de Documentos com IA</h1>
          <p className="text-muted-foreground">OCR e extração inteligente de entidades</p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documentos ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Documento</CardTitle>
              <CardDescription>Faça upload de PDFs ou imagens para análise OCR</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {selectedFile ? (
                      <>
                        <FileImage className="h-12 w-12 text-primary" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <p>Clique para selecionar ou arraste um arquivo</p>
                        <p className="text-sm text-muted-foreground">PDF, JPG, PNG até 10MB</p>
                      </>
                    )}
                  </div>
                </Label>
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button 
                onClick={processDocument} 
                disabled={!selectedFile || processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Processar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentos Processados</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {documents.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum documento processado
                      </p>
                    ) : (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => selectDocument(doc)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedDocument?.id === doc.id 
                              ? "border-primary bg-primary/5" 
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{doc.file_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(doc.ocr_status)}
                          </div>
                          {doc.confidence && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Confiança: {doc.confidence.toFixed(1)}%</span>
                              <span>•</span>
                              <span>{doc.entities?.length || 0} entidades</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes do Documento</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDocument ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Arquivo</Label>
                      <p className="font-medium">{selectedDocument.file_name}</p>
                    </div>

                    {selectedDocument.summary && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Resumo</Label>
                        <p className="text-sm">{selectedDocument.summary}</p>
                      </div>
                    )}

                    {selectedDocument.keywords && selectedDocument.keywords.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Palavras-chave</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.keywords.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDocument.entities && selectedDocument.entities.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Entidades Extraídas</Label>
                        <ScrollArea className="h-[200px] mt-1">
                          <div className="space-y-1">
                            {selectedDocument.entities.map((entity, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded border ${getEntityBadgeColor(entity.type)}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{entity.label || entity.type}</span>
                                  <span className="text-xs opacity-70">{entity.confidence}%</span>
                                </div>
                                <p className="text-sm font-mono">{entity.value}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Selecione um documento para ver detalhes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Busca em Documentos</CardTitle>
              <CardDescription>Pesquise por texto extraído, entidades ou metadados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua busca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {searchResults.length} resultados encontrados
                  </p>
                  {searchResults.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => selectDocument(doc)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{doc.file_name}</span>
                      </div>
                      {doc.summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
