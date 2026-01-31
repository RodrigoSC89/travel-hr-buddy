/**
 * OCR Pipeline Manager - Complete OCR workflow
 * PATCH INTERACTIVITY: upload → extract → review → save
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload, FileText, CheckCircle, AlertTriangle, Eye,
  Save, RefreshCw, Trash2, Clock, Loader2, Camera,
  Image, Download, Edit, Search
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

interface OCRDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: "pending" | "processing" | "extracted" | "reviewed" | "saved" | "error";
  extractedText?: string;
  reviewedText?: string;
  confidence?: number;
  documentType?: string;
  metadata?: Record<string, string>;
  errorMessage?: string;
}

const mockDocuments: OCRDocument[] = [
  {
    id: "doc-1",
    fileName: "certificado-stcw-joao.pdf",
    fileSize: 1245000,
    uploadedAt: "2025-01-20T10:30:00Z",
    status: "saved",
    extractedText: "CERTIFICADO STCW\nNome: João Silva\nMatrícula: 12345\nVálido até: 2026-12-31",
    reviewedText: "CERTIFICADO STCW\nNome: João Silva\nMatrícula: 12345\nVálido até: 2026-12-31",
    confidence: 98,
    documentType: "Certificado STCW",
    metadata: { nome: "João Silva", matricula: "12345", validade: "2026-12-31" }
  },
  {
    id: "doc-2",
    fileName: "manual-motor-principal.pdf",
    fileSize: 5678000,
    uploadedAt: "2025-01-19T14:15:00Z",
    status: "reviewed",
    extractedText: "MANUAL DE OPERAÇÃO\nMotor Principal MAN B&W 6S50MC-C\nRevisão: 3.2\nData: 2024-06",
    reviewedText: "MANUAL DE OPERAÇÃO\nMotor Principal MAN B&W 6S50MC-C\nRevisão: 3.2\nData: 2024-06",
    confidence: 95,
    documentType: "Manual Técnico"
  },
  {
    id: "doc-3",
    fileName: "inspecao-casco-jan2025.jpg",
    fileSize: 3450000,
    uploadedAt: "2025-01-18T09:00:00Z",
    status: "processing",
    confidence: 0
  }
];

export function OCRPipelineManager() {
  const [documents, setDocuments] = useState<OCRDocument[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<OCRDocument | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs: OCRDocument[] = acceptedFiles.map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: "pending" as const,
      confidence: 0
    }));

    setDocuments(prev => [...newDocs, ...prev]);
    toast.success(`${acceptedFiles.length} arquivo(s) adicionado(s)`, {
      description: "Clique em 'Processar' para iniciar a extração OCR"
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"],
      "application/pdf": [".pdf"]
    }
  });

  const processDocument = useCallback(async (docId: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === docId ? { ...d, status: "processing" as const } : d
    ));

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const extractedText = `DOCUMENTO EXTRAÍDO VIA OCR
Data de Extração: ${new Date().toLocaleDateString('pt-BR')}
Arquivo: ${documents.find(d => d.id === docId)?.fileName}

[Conteúdo extraído automaticamente]
Exemplo de texto detectado pelo motor OCR.
Linha 1: Informação detectada
Linha 2: Dados extraídos
Número: ${Math.floor(Math.random() * 10000)}
Validade: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`;

    const confidence = 85 + Math.floor(Math.random() * 15);

    setDocuments(prev => prev.map(d => 
      d.id === docId 
        ? { 
            ...d, 
            status: "extracted" as const, 
            extractedText,
            confidence,
            documentType: "Documento Geral"
          } 
        : d
    ));

    toast.success("Extração concluída!", {
      description: `Confiança: ${confidence}%`
    });
  }, [documents]);

  const processAll = useCallback(async () => {
    const pendingDocs = documents.filter(d => d.status === "pending");
    if (pendingDocs.length === 0) {
      toast.info("Nenhum documento pendente para processar");
      return;
    }

    setIsProcessing(true);
    for (const doc of pendingDocs) {
      await processDocument(doc.id);
    }
    setIsProcessing(false);
    toast.success("Todos os documentos processados!");
  }, [documents, processDocument]);

  const openReview = useCallback((doc: OCRDocument) => {
    setSelectedDoc(doc);
    setReviewText(doc.reviewedText || doc.extractedText || "");
    setIsReviewOpen(true);
  }, []);

  const saveReview = useCallback(() => {
    if (!selectedDoc) return;

    setDocuments(prev => prev.map(d => 
      d.id === selectedDoc.id 
        ? { ...d, status: "reviewed" as const, reviewedText: reviewText }
        : d
    ));
    setIsReviewOpen(false);
    toast.success("Revisão salva com sucesso!");
  }, [selectedDoc, reviewText]);

  const saveDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === docId ? { ...d, status: "saved" as const } : d
    ));
    toast.success("Documento salvo no sistema!", {
      description: "O documento está disponível na biblioteca"
    });
  }, []);

  const deleteDocument = useCallback((docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.success("Documento removido", {
      action: doc ? {
        label: "Desfazer",
        onClick: () => setDocuments(prev => [...prev, doc])
      } : undefined
    });
  }, [documents]);

  const exportResults = useCallback(() => {
    const data = documents.map(d => ({
      Arquivo: d.fileName,
      Status: d.status,
      Confiança: d.confidence ? `${d.confidence}%` : "N/A",
      Tipo: d.documentType || "N/A",
      Data: new Date(d.uploadedAt).toLocaleDateString('pt-BR')
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resultados exportados!");
  }, [documents]);

  const getStatusBadge = (status: OCRDocument["status"]) => {
    const config = {
      pending: { label: "Pendente", variant: "outline" as const, icon: Clock },
      processing: { label: "Processando", variant: "secondary" as const, icon: Loader2 },
      extracted: { label: "Extraído", variant: "default" as const, icon: FileText },
      reviewed: { label: "Revisado", variant: "default" as const, icon: Eye },
      saved: { label: "Salvo", variant: "default" as const, icon: CheckCircle },
      error: { label: "Erro", variant: "destructive" as const, icon: AlertTriangle }
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
        {label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === "pending").length,
    processing: documents.filter(d => d.status === "processing").length,
    extracted: documents.filter(d => d.status === "extracted").length,
    reviewed: documents.filter(d => d.status === "reviewed").length,
    saved: documents.filter(d => d.status === "saved").length,
    avgConfidence: documents.filter(d => d.confidence).reduce((acc, d) => acc + (d.confidence || 0), 0) / 
                   documents.filter(d => d.confidence).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Pipeline OCR de Manutenção
          </h2>
          <p className="text-muted-foreground">
            Upload → Extração → Revisão → Salvar | {stats.total} documentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={processAll} disabled={isProcessing || stats.pending === 0}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Processar Todos ({stats.pending})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.extracted}</p>
                <p className="text-xs text-muted-foreground">Extraídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
                <p className="text-xs text-muted-foreground">Revisados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.saved}</p>
                <p className="text-xs text-muted-foreground">Salvos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgConfidence.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Confiança Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
          <CardDescription>
            Arraste arquivos ou clique para selecionar (PDF, JPG, PNG)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/30 hover:border-primary/50"
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                {isDragActive ? (
                  <Image className="h-8 w-8 text-primary animate-pulse" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {isDragActive ? "Solte os arquivos aqui" : "Arraste documentos ou clique para upload"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Suporta PDF, JPG, PNG até 50MB
                </p>
              </div>
              <Button variant="outline" type="button">
                <Camera className="h-4 w-4 mr-2" />
                Capturar Câmera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "extracted", "reviewed", "saved"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Todos" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Faça upload de documentos para iniciar o processo OCR
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredDocs.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                              {doc.confidence && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-500">{doc.confidence}% confiança</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          
                          {doc.status === "pending" && (
                            <Button size="sm" onClick={() => processDocument(doc.id)}>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Processar
                            </Button>
                          )}
                          
                          {doc.status === "extracted" && (
                            <Button size="sm" onClick={() => openReview(doc)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Revisar
                            </Button>
                          )}
                          
                          {doc.status === "reviewed" && (
                            <Button size="sm" onClick={() => saveDocument(doc.id)}>
                              <Save className="h-4 w-4 mr-1" />
                              Salvar
                            </Button>
                          )}
                          
                          {doc.status === "saved" && (
                            <Button size="sm" variant="outline" onClick={() => openReview(doc)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          )}
                          
                          <Button size="sm" variant="ghost" onClick={() => deleteDocument(doc.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      {doc.status === "processing" && (
                        <div className="mt-3">
                          <Progress value={undefined} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Processando OCR...</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Revisar Documento: {selectedDoc?.fileName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Texto Extraído (Original)</Label>
              <Textarea
                value={selectedDoc?.extractedText || ""}
                readOnly
                rows={15}
                className="font-mono text-sm bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Texto Revisado (Editável)</Label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Revise e corrija o texto extraído..."
              />
            </div>
          </div>
          {selectedDoc?.confidence && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Confiança OCR: {selectedDoc.confidence}%
              </Badge>
              <Badge variant="outline">
                Tipo: {selectedDoc.documentType || "Não identificado"}
              </Badge>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveReview}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Revisão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OCRPipelineManager;
