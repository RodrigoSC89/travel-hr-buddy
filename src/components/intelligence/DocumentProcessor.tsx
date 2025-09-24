import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessedDocument {
  id: string;
  fileName: string;
  summary: string;
  keyPoints: string[];
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  processedAt: Date;
  originalText: string;
}

const DocumentProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Suportamos PDF, DOC, DOCX, TXT e CSV",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert file to base64 for processing
      const fileContent = await fileToBase64(file);
      
      // Process document with AI
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          fileName: file.name,
          fileType: file.type,
          fileContent,
          fileSize: file.size
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      if (data.success) {
        const newDoc: ProcessedDocument = {
          id: Date.now().toString(),
          fileName: file.name,
          summary: data.analysis.summary,
          keyPoints: data.analysis.keyPoints,
          entities: data.analysis.entities,
          sentiment: data.analysis.sentiment,
          category: data.analysis.category,
          processedAt: new Date(),
          originalText: data.analysis.originalText || ''
        };

        setProcessedDocs(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);

        toast({
          title: "Documento Processado",
          description: `${file.name} foi analisado com sucesso`,
        });
      } else {
        throw new Error(data.error || 'Erro no processamento');
      }

    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : 'Falha ao processar documento',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const exportAnalysis = (doc: ProcessedDocument) => {
    const analysis = {
      fileName: doc.fileName,
      processedAt: doc.processedAt.toISOString(),
      summary: doc.summary,
      keyPoints: doc.keyPoints,
      entities: doc.entities,
      sentiment: doc.sentiment,
      category: doc.category
    };

    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-${doc.fileName.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteDocument = (docId: string) => {
    setProcessedDocs(prev => prev.filter(doc => doc.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
    
    toast({
      title: "Documento Removido",
      description: "Análise foi removida da lista",
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="w-4 h-4" />;
      case 'negative': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Processamento Inteligente de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isProcessing ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={(e) => {
                e.preventDefault();
                if (!isProcessing) {
                  handleFileUpload(e.dataTransfer.files);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Processando documento...</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-xs text-muted-foreground">{uploadProgress}% concluído</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Arraste um arquivo ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, TXT, CSV (máx. 10MB)
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.csv"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Processed Documents */}
      {processedDocs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Processados</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {processedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDoc?.id === doc.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`flex items-center gap-1 text-xs ${getSentimentColor(doc.sentiment)}`}>
                              {getSentimentIcon(doc.sentiment)}
                              {doc.sentiment}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {doc.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.processedAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportAnalysis(doc);
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Document Analysis */}
          {selectedDoc && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Análise: {selectedDoc.fileName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Resumo</TabsTrigger>
                    <TabsTrigger value="entities">Entidades</TabsTrigger>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Resumo</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedDoc.summary}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Pontos Principais</h4>
                      <ul className="space-y-1">
                        {selectedDoc.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="entities" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Entidades Identificadas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoc.entities.map((entity, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Categoria:</span>
                        <p className="text-muted-foreground">{selectedDoc.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Sentimento:</span>
                        <p className={`${getSentimentColor(selectedDoc.sentiment)} flex items-center gap-1`}>
                          {getSentimentIcon(selectedDoc.sentiment)}
                          {selectedDoc.sentiment}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Processado em:</span>
                        <p className="text-muted-foreground">
                          {selectedDoc.processedAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;