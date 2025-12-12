
import { useEffect, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, FileText, Search, Eye, Download, AlertCircle, 
  CheckCircle, Clock, Loader2, FileImage, FilePlus, Brain, Tag, List
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Tesseract from "tesseract.js";

interface DocumentEntity {
  id: string;
  entity_type: string;
  entity_value: string;
  entity_label?: string;
  confidence_score: number;
  page_number?: number;
}

interface ProcessedDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  ocr_status: string;
  extracted_text: string;
  confidence_score: number;
  entity_count: number;
  created_at: string;
}

export function AIDocumentsAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [entities, setEntities] = useState<DocumentEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedDocument[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const { data, error } = await supabase
      .from("ai_documents")
      .select("*")
      .eq("organization_id", orgData.organization_id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar documentos", variant: "destructive" });
      return;
    }

    setDocuments(data as any || []);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/tiff"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um PDF ou imagem (JPG, PNG, GIF, BMP, TIFF)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
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
    try {
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
    } catch (error) {
      console.error("OCR Error:", error);
      throw new Error("Falha ao processar OCR");
    }
  };

  const extractEntities = (text: string): DocumentEntity[] => {
    const entities: DocumentEntity[] = [];
    
    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach((email) => {
      entities.push({
        id: crypto.randomUUID(),
        entity_type: "email",
        entity_value: email,
        entity_label: "Email",
        confidence_score: 95,
      });
    });

    // Extract dates (DD/MM/YYYY or DD-MM-YYYY)
    const dateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
    const dates = text.match(dateRegex) || [];
    dates.forEach((date) => {
      entities.push({
        id: crypto.randomUUID(),
        entity_type: "date",
        entity_value: date,
        entity_label: "Data",
        confidence_score: 90,
      });
    });

    // Extract amounts (currency values)
    const amountRegex = /(?:R\$|USD|\$|€)\s*[\d.,]+/g;
    const amounts = text.match(amountRegex) || [];
    amounts.forEach((amount) => {
      entities.push({
        id: crypto.randomUUID(),
        entity_type: "amount",
        entity_value: amount,
        entity_label: "Valor",
        confidence_score: 85,
      });
    });

    // Extract phone numbers
    const phoneRegex = /\b\d{2,3}[-.\s]?\d{4,5}[-.\s]?\d{4}\b/g;
    const phones = text.match(phoneRegex) || [];
    phones.forEach((phone) => {
      entities.push({
        id: crypto.randomUUID(),
        entity_type: "phone",
        entity_value: phone,
        entity_label: "Telefone",
        confidence_score: 88,
      });
    });

    // Extract IMO numbers (vessel identification)
    const imoRegex = /IMO\s*\d{7}/gi;
    const imos = text.match(imoRegex) || [];
    imos.forEach((imo) => {
      entities.push({
        id: crypto.randomUUID(),
        entity_type: "imo_number",
        entity_value: imo,
        entity_label: "IMO Number",
        confidence_score: 98,
      });
    });

    return entities;
  };

  // Generate automatic summary (first 200 chars or extractive summary)
  const generateSummary = (text: string): string => {
    if (!text || text.length === 0) return "";
    
    // Remove excessive whitespace
    const cleaned = text.replace(/\s+/g, " ").trim();
    
    // Split into sentences
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) return cleaned.substring(0, 200);
    
    // Take first 2-3 most important sentences (simple extractive summarization)
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join(". ") + ".";
    
    return summary.substring(0, 500); // Max 500 chars
  };

  // Extract topics using keyword frequency
  const extractTopics = (text: string): string[] => {
    const stopWords = new Set([
      "o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "em", "no", 
      "na", "nos", "nas", "por", "para", "com", "sem", "sob", "sobre", "e", "ou",
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with"
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 4 && !stopWords.has(word));

    // Count frequency
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top 10 most frequent words as topics
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return sorted;
  };

  // Generate tags based on content
  const generateTags = (text: string, entities: DocumentEntity[]): string[] => {
    const tags: string[] = [];

    // Add tags based on entity types present
    const entityTypes = new Set(entities.map(e => e.entity_type));
    if (entityTypes.has("email")) tags.push("contact");
    if (entityTypes.has("phone")) tags.push("contact");
    if (entityTypes.has("amount")) tags.push("financial");
    if (entityTypes.has("date")) tags.push("time-sensitive");
    if (entityTypes.has("imo_number")) tags.push("maritime", "vessel");

    // Add tags based on keywords
    const lowerText = text.toLowerCase();
    if (lowerText.includes("contrato") || lowerText.includes("contract")) tags.push("legal");
    if (lowerText.includes("invoice") || lowerText.includes("fatura")) tags.push("financial");
    if (lowerText.includes("certificado") || lowerText.includes("certificate")) tags.push("certification");
    if (lowerText.includes("segurança") || lowerText.includes("safety")) tags.push("safety");
    if (lowerText.includes("tripulação") || lowerText.includes("crew")) tags.push("crew");
    if (lowerText.includes("navio") || lowerText.includes("vessel") || lowerText.includes("ship")) tags.push("vessel");

    return [...new Set(tags)]; // Remove duplicates
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo primeiro",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProcessing(true);
    setProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Upload file to Supabase Storage
      setProgress(5);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `documents/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Perform OCR
      const startTime = Date.now();
      const { text, confidence } = await performOCR(selectedFile);
      
      // Extract entities
      setProgress(85);
      const extractedEntities = extractEntities(text);

      // Generate AI insights
      const summary = generateSummary(text);
      const topics = extractTopics(text);
      const tags = generateTags(text, extractedEntities);
      const processingTime = Date.now() - startTime;

      // Get organization ID
      const { data: orgData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      // Save document to ai_documents database
      setProgress(90);
      const { data: document, error: dbError } = await supabase
        .from("ai_documents")
        .insert({
          organization_id: orgData?.organization_id,
          document_name: selectedFile.name.replace(/\.[^/.]+$/, ""),
          file_url: publicUrl,
          file_type: selectedFile.type.includes("pdf") ? "pdf" : "image",
          file_size_bytes: selectedFile.size,
          ocr_text: text,
          summary: summary,
          topics: topics,
          tags: tags,
          key_insights: extractedEntities.map(e => ({
            type: e.entity_type,
            value: e.entity_value,
            confidence: e.confidence_score
          })),
          processing_status: "completed",
          processing_time_ms: processingTime,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Save extracted entities
      if (extractedEntities.length > 0) {
        const { error: entitiesError } = await supabase
          .from("document_entities")
          .insert(
            extractedEntities.map((entity) => ({
              document_id: document.id,
              entity_type: entity.entity_type,
              entity_value: entity.entity_value,
              entity_label: entity.entity_label,
              confidence_score: entity.confidence_score,
              extraction_method: "ocr",
            }))
          );

        if (entitiesError) throw entitiesError;
      }

      setProgress(100);

      toast({
        title: "Documento processado com sucesso",
        description: `${extractedEntities.length} entidades extraídas`,
      });

      // Refresh documents list
      await loadDocuments();

      // Reset form
      setSelectedFile(null);
      setProgress(0);
      
    } catch (error: any) {
      console.error("Error processing document:", error);
      toast({
        title: "Erro ao processar documento",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents_with_entities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const loadDocumentDetails = async (documentId: string) => {
    try {
      const { data: doc, error: docError } = await supabase
        .from("ai_documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (docError) throw docError;

      const { data: entitiesData, error: entitiesError } = await supabase
        .from("document_entities")
        .select("*")
        .eq("document_id", documentId);

      if (entitiesError) throw entitiesError;

      setSelectedDocument(doc);
      setEntities(entitiesData || []);
    } catch (error) {
      console.error("Error loading document details:", error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc("search_documents", {
          p_query: searchQuery,
          p_limit: 50,
        });

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching documents:", error);
      toast({
        title: "Erro na busca",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "processing":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEntityBadgeColor = (entityType: string) => {
    const colors: Record<string, string> = {
      email: "bg-blue-100 text-blue-800",
      date: "bg-green-100 text-green-800",
      amount: "bg-yellow-100 text-yellow-800",
      phone: "bg-purple-100 text-purple-800",
      imo_number: "bg-red-100 text-red-800",
      name: "bg-indigo-100 text-indigo-800",
    };
    return colors[entityType] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Documents Analyzer</h1>
          <p className="text-muted-foreground">Análise inteligente de documentos com OCR</p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload & Processar
          </TabsTrigger>
          <TabsTrigger value="documents" onClick={loadDocuments}>
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Busca Textual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Documento</CardTitle>
              <CardDescription>
                Envie um documento PDF ou imagem para análise com OCR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Selecionar Arquivo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                    onChange={handleFileSelect}
                    disabled={processing}
                  />
                  {selectedFile && (
                    <Badge variant="outline">
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Formatos aceitos: PDF, JPG, PNG, GIF, BMP, TIFF (máx. 10MB)
                </p>
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processando documento...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button
                onClick={handleUploadAndProcess}
                disabled={!selectedFile || processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Upload e Processar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Processados</CardTitle>
              <CardDescription>
                {documents.length} documento(s) no total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => loadDocumentDetails(doc.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {doc.file_type === "pdf" ? (
                            <FileText className="h-8 w-8 text-red-500" />
                          ) : (
                            <FileImage className="h-8 w-8 text-blue-500" />
                          )}
                          <div>
                            <h3 className="font-semibold">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusIcon(doc.ocr_status)}
                          <Badge variant="outline">
                            {doc.entity_count} entidades
                          </Badge>
                          <Badge>
                            {Math.round(doc.confidence_score)}% confiança
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedDocument && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Detalhes do Documento
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Título</Label>
                    <p className="text-sm">{selectedDocument.title}</p>
                  </div>
                  <div>
                    <Label>Tipo de Arquivo</Label>
                    <p className="text-sm uppercase">{selectedDocument.file_type}</p>
                  </div>
                  <div>
                    <Label>Status OCR</Label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedDocument.ocr_status)}
                      <p className="text-sm">{selectedDocument.ocr_status}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Confiança</Label>
                    <p className="text-sm">{Math.round(selectedDocument.confidence_score)}%</p>
                  </div>
                </div>

                <div>
                  <Label>Texto Extraído</Label>
                  <div className="mt-2 p-4 border rounded-md max-h-64 overflow-y-auto bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{selectedDocument.extracted_text}</p>
                  </div>
                </div>

                <div>
                  <Label>Entidades Extraídas ({entities.length})</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entities.map((entity) => (
                      <Badge
                        key={entity.id}
                        className={getEntityBadgeColor(entity.entity_type)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {entity.entity_label || entity.entity_type}: {entity.entity_value}
                        <span className="ml-2 text-xs opacity-70">
                          ({Math.round(entity.confidence_score)}%)
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Busca Textual</CardTitle>
              <CardDescription>
                Pesquise no conteúdo de todos os documentos processados
              </CardDescription>
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
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {searchResults.length} resultado(s) encontrado(s)
                  </p>
                  {searchResults.map((result) => (
                    <Card
                      key={result.document_id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => loadDocumentDetails(result.document_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{result.title}</h3>
                            <p className="text-sm text-muted-foreground">{result.file_name}</p>
                          </div>
                          <Badge variant="outline">
                            Relevância: {Math.round((result.relevance || 0) * 100)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
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
