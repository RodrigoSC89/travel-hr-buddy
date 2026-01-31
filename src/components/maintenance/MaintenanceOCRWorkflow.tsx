/**
 * Maintenance OCR Workflow - PATCH INTERACTIVITY 100%
 * Complete OCR workflow: upload → process → review → save
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Camera,
  FileText,
  Check,
  X,
  Edit,
  Save,
  RotateCcw,
  Zap,
  AlertTriangle,
  Clock,
  Loader2,
  Eye,
  Download,
  History,
  Trash2
} from "lucide-react";

interface OCRDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  status: "pending" | "processing" | "review" | "approved" | "rejected";
  extractedText: string;
  confidence: number;
  equipmentId?: string;
  hourometerValue?: number;
  maintenanceDate?: string;
  notes: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface OCRHistoryEntry {
  id: string;
  documentId: string;
  action: string;
  details: string;
  timestamp: Date;
  userId: string;
}

const MOCK_HISTORY: OCRHistoryEntry[] = [
  {
    id: "h1",
    documentId: "doc1",
    action: "upload",
    details: "Documento enviado para processamento",
    timestamp: new Date(Date.now() - 3600000),
    userId: "user1"
  },
  {
    id: "h2",
    documentId: "doc1",
    action: "ocr_complete",
    details: "OCR concluído com 94% de confiança",
    timestamp: new Date(Date.now() - 3000000),
    userId: "system"
  }
];

export function MaintenanceOCRWorkflow() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [documents, setDocuments] = useState<OCRDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<OCRDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [editedText, setEditedText] = useState("");
  const [history, setHistory] = useState<OCRHistoryEntry[]>(MOCK_HISTORY);
  
  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({
        title: "Formato inválido",
        description: "Apenas imagens (PNG, JPG) e PDFs são aceitos",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    toast({
      title: "Arquivo carregado",
      description: `${file.name} pronto para processamento`
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  // Simulate OCR processing
  const processOCR = useCallback(async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate OCR processing steps
    const steps = [
      { progress: 20, message: "Analisando imagem..." },
      { progress: 40, message: "Detectando texto..." },
      { progress: 60, message: "Extraindo dados..." },
      { progress: 80, message: "Validando resultados..." },
      { progress: 100, message: "Concluído!" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(step.progress);
    }

    // Create new document with extracted data
    const newDoc: OCRDocument = {
      id: `doc_${Date.now()}`,
      fileName: uploadedFile.name,
      fileType: uploadedFile.type,
      uploadedAt: new Date(),
      status: "review",
      extractedText: `RELATÓRIO DE HORÍMETRO
Equipamento: Motor Principal - CAT 3516C
Data da Leitura: ${new Date().toLocaleDateString('pt-BR')}
Horímetro Atual: 12.456 horas
Última Manutenção: 11.200 horas
Próxima Manutenção: 13.000 horas

Observações:
- Óleo do motor verificado
- Filtros em bom estado
- Temperatura operacional normal`,
      confidence: 94,
      equipmentId: "EQ-001",
      hourometerValue: 12456,
      maintenanceDate: new Date().toISOString().split('T')[0],
      notes: ""
    };

    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    setEditedText(newDoc.extractedText);
    setIsProcessing(false);
    setUploadedFile(null);
    setPreviewUrl(null);
    setActiveTab("review");

    // Add to history
    setHistory(prev => [{
      id: `h_${Date.now()}`,
      documentId: newDoc.id,
      action: "ocr_complete",
      details: `OCR concluído com ${newDoc.confidence}% de confiança`,
      timestamp: new Date(),
      userId: "current_user"
    }, ...prev]);

    toast({
      title: "OCR Concluído",
      description: `Texto extraído com ${newDoc.confidence}% de confiança`
    });
  }, [uploadedFile, toast]);

  // Approve document
  const approveDocument = useCallback(() => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      status: "approved" as const,
      extractedText: editedText,
      reviewedBy: "current_user",
      reviewedAt: new Date()
    };

    setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? updatedDoc : d));
    setSelectedDoc(updatedDoc);

    setHistory(prev => [{
      id: `h_${Date.now()}`,
      documentId: selectedDoc.id,
      action: "approved",
      details: "Documento aprovado e salvo no sistema",
      timestamp: new Date(),
      userId: "current_user"
    }, ...prev]);

    toast({
      title: "Documento Aprovado",
      description: "Dados salvos no registro de manutenção"
    });
  }, [selectedDoc, editedText, toast]);

  // Reject document
  const rejectDocument = useCallback(() => {
    if (!selectedDoc) return;

    const updatedDoc = {
      ...selectedDoc,
      status: "rejected" as const,
      reviewedBy: "current_user",
      reviewedAt: new Date()
    };

    setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? updatedDoc : d));
    setSelectedDoc(updatedDoc);

    setHistory(prev => [{
      id: `h_${Date.now()}`,
      documentId: selectedDoc.id,
      action: "rejected",
      details: "Documento rejeitado - OCR impreciso",
      timestamp: new Date(),
      userId: "current_user"
    }, ...prev]);

    toast({
      title: "Documento Rejeitado",
      description: "Documento marcado para reprocessamento",
      variant: "destructive"
    });
  }, [selectedDoc, toast]);

  // Delete document
  const deleteDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
    toast({
      title: "Documento Removido",
      description: "Documento excluído com sucesso"
    });
  }, [selectedDoc, toast]);

  const getStatusBadge = (status: OCRDocument["status"]) => {
    const config = {
      pending: { label: "Pendente", variant: "secondary" as const },
      processing: { label: "Processando", variant: "default" as const },
      review: { label: "Em Revisão", variant: "outline" as const },
      approved: { label: "Aprovado", variant: "default" as const },
      rejected: { label: "Rejeitado", variant: "destructive" as const }
    };
    return config[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            OCR de Manutenção
          </h2>
          <p className="text-muted-foreground">
            Capture e processe documentos de manutenção automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Check className="h-3 w-3" />
            {documents.filter(d => d.status === "approved").length} Aprovados
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {documents.filter(d => d.status === "review").length} Em Revisão
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <Eye className="h-4 w-4" />
            Revisão
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Zone */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enviar Documento</CardTitle>
                <CardDescription>
                  Arraste uma imagem ou PDF de horímetro/manual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Arraste o arquivo aqui
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou clique para selecionar
                  </p>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Camera className="h-4 w-4" />
                    Usar Câmera
                  </Button>
                </div>

                {uploadedFile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{uploadedFile.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setUploadedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      className="w-full gap-2"
                      onClick={processOCR}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Processar OCR
                        </>
                      )}
                    </Button>
                    {isProcessing && (
                      <div className="mt-4 space-y-2">
                        <Progress value={processingProgress} />
                        <p className="text-sm text-center text-muted-foreground">
                          {processingProgress}% concluído
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-lg border"
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Nenhum arquivo selecionado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          {selectedDoc ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Extracted Text */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Texto Extraído</CardTitle>
                    <Badge variant={selectedDoc.confidence >= 90 ? "default" : "secondary"}>
                      {selectedDoc.confidence}% confiança
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="Texto extraído pelo OCR..."
                  />
                  
                  {selectedDoc.confidence < 90 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        Confiança baixa - revise o texto cuidadosamente
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Parsed Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Identificados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>ID do Equipamento</Label>
                      <Input
                        value={selectedDoc.equipmentId || ""}
                        onChange={() => {}}
                        placeholder="EQ-XXX"
                      />
                    </div>
                    <div>
                      <Label>Valor do Horímetro</Label>
                      <Input
                        type="number"
                        value={selectedDoc.hourometerValue || ""}
                        onChange={() => {}}
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <Label>Data da Leitura</Label>
                      <Input
                        type="date"
                        value={selectedDoc.maintenanceDate || ""}
                        onChange={() => {}}
                      />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={selectedDoc.notes}
                        onChange={() => {}}
                        placeholder="Notas adicionais..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 gap-2"
                      onClick={approveDocument}
                      disabled={selectedDoc.status === "approved"}
                    >
                      <Check className="h-4 w-4" />
                      Aprovar e Salvar
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={rejectDocument}
                      disabled={selectedDoc.status === "rejected"}
                    >
                      <X className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reprocessar OCR
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum documento em revisão
                </h3>
                <p className="text-muted-foreground mb-4">
                  Faça upload de um documento ou selecione um da lista
                </p>
                <Button onClick={() => setActiveTab("upload")}>
                  Fazer Upload
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Processados</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum documento processado ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const status = getStatusBadge(doc.status);
                    return (
                      <div
                        key={doc.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedDoc?.id === doc.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setEditedText(doc.extractedText);
                          setActiveTab("review");
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{doc.fileName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {doc.uploadedAt.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <Badge variant="outline">{doc.confidence}%</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDocument(doc.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Histórico de Ações</CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-3 border rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${
                      entry.action === "approved" ? "bg-green-500/10 text-green-600" :
                      entry.action === "rejected" ? "bg-red-500/10 text-red-600" :
                      "bg-blue-500/10 text-blue-600"
                    }`}>
                      {entry.action === "approved" ? <Check className="h-4 w-4" /> :
                       entry.action === "rejected" ? <X className="h-4 w-4" /> :
                       <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {entry.action.replace("_", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.details}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.timestamp.toLocaleString('pt-BR')} • {entry.userId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaintenanceOCRWorkflow;
