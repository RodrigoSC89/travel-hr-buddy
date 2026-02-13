/**
 * HRDocumentOCRPage - Página de OCR de Documentos para Admissão
 * Extração automática de dados com IA
 */
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ScanLine, Upload, FileText, CheckCircle2, AlertCircle, 
  Clock, Brain, User, CreditCard, FileCheck, Camera,
  Loader2, X, Eye, Download, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ExtractedData {
  cpf?: string;
  rg?: string;
  nome?: string;
  nascimento?: string;
  endereco?: string;
  pis?: string;
  ctps?: string;
  [key: string]: string | undefined;
}

interface DocumentResult {
  id: string;
  type: string;
  status: 'processing' | 'success' | 'error';
  data: ExtractedData | null;
  confidence: number;
  timestamp: Date;
}

const DOCUMENT_TYPES = [
  { id: 'cpf', label: 'CPF', icon: CreditCard, required: true },
  { id: 'rg', label: 'RG / Identidade', icon: User, required: true },
  { id: 'ctps', label: 'CTPS Digital', icon: FileText, required: true },
  { id: 'comprovante_residencia', label: 'Comprovante de Residência', icon: FileCheck, required: true },
  { id: 'certidao_nascimento', label: 'Certidão de Nascimento', icon: FileText, required: false },
  { id: 'titulo_eleitor', label: 'Título de Eleitor', icon: FileText, required: false },
  { id: 'certificado_reservista', label: 'Certificado de Reservista', icon: FileText, required: false },
];

export default function HRDocumentOCRPage() {
  const [selectedType, setSelectedType] = useState('cpf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<DocumentResult[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const processDocument = async (file: File, documentType: string) => {
    const resultId = Date.now().toString();
    
    // Add processing state
    setResults(prev => [...prev, {
      id: resultId,
      type: documentType,
      status: 'processing',
      data: null,
      confidence: 0,
      timestamp: new Date(),
    }]);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      // Call OCR API
      const { data, error } = await supabase.functions.invoke('hr-document-ocr', {
        body: {
          image_base64: base64,
          document_type: documentType,
          employee_id: 'demo-employee',
        },
      });

      if (error) throw error;

      // Update with success
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? {
              ...r,
              status: 'success',
              data: data.extracted_data,
              confidence: data.confidence_score || 95,
            }
          : r
      ));

      toast.success(`Documento ${DOCUMENT_TYPES.find(d => d.id === documentType)?.label} processado com sucesso!`);
    } catch (error) {
      logger.error('OCR Error:', error);
      
      // Update with error
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'error', data: null, confidence: 0 }
          : r
      ));

      toast.error('Erro ao processar documento. Tente novamente.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    for (const file of Array.from(files)) {
      await processDocument(file, selectedType);
    }
    setIsProcessing(false);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    for (const file of Array.from(files)) {
      await processDocument(file, selectedType);
    }
    setIsProcessing(false);
  }, [selectedType]);

  const removeResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const getDocumentLabel = (type: string) => {
    return DOCUMENT_TYPES.find(d => d.id === type)?.label || type;
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-7 w-7 text-primary" />
            OCR de Documentos com IA
          </h1>
          <p className="text-muted-foreground">
            Extração automática de dados para admissão digital
          </p>
        </div>
        <Badge variant="secondary" className="h-fit gap-2">
          <Brain className="h-4 w-4" />
          Powered by Gemini Vision
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Documentos Processados', value: '8.432', icon: FileText },
          { label: 'Precisão Média', value: '97.3%', icon: CheckCircle2 },
          { label: 'Tempo Médio', value: '< 5s', icon: Clock },
          { label: 'Tipos Suportados', value: '7', icon: ScanLine },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload de Documento</CardTitle>
            <CardDescription>
              Selecione o tipo de documento e faça o upload para extração automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DOCUMENT_TYPES.slice(0, 4).map((doc) => (
                  <Button
                    key={doc.id}
                    variant={selectedType === doc.id ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start gap-2"
                    onClick={() => setSelectedType(doc.id)}
                  >
                    <doc.icon className="h-4 w-4" />
                    {doc.label}
                    {doc.required && <span className="text-destructive">*</span>}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DOCUMENT_TYPES.slice(4).map((doc) => (
                  <Button
                    key={doc.id}
                    variant={selectedType === doc.id ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start gap-2 text-xs"
                    onClick={() => setSelectedType(doc.id)}
                  >
                    <doc.icon className="h-3 w-3" />
                    {doc.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processando documento...</p>
                  <Progress value={66} className="max-w-xs mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Arraste e solte aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, PDF • Máximo 10MB por arquivo
                  </p>
                </div>
              )}
            </div>

            {/* Camera Option */}
            <div className="flex justify-center">
              <Button variant="outline" className="gap-2">
                <Camera className="h-4 w-4" />
                Capturar com Câmera
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Types Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documentos para Admissão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DOCUMENT_TYPES.map((doc) => {
              const processed = results.some(r => r.type === doc.id && r.status === 'success');
              return (
                <div 
                  key={doc.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    processed ? 'bg-success/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <doc.icon className="h-4 w-4" />
                    <span className="text-sm">{doc.label}</span>
                  </div>
                  {doc.required && !processed && (
                    <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                  )}
                  {processed && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Resultados da Extração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div 
                  key={result.id}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' ? 'border-success/30 bg-success/5' :
                    result.status === 'error' ? 'border-destructive/30 bg-destructive/5' :
                    'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      {result.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">{getDocumentLabel(result.type)}</span>
                      {result.status === 'success' && (
                        <Badge variant="secondary" className="text-xs">
                          {result.confidence}% confiança
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {result.status === 'error' && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Tentar novamente
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => removeResult(result.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {result.status === 'success' && result.data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(result.data).map(([key, value]) => (
                        value && (
                          <div key={key} className="space-y-1">
                            <p className="text-xs text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm font-medium">{value}</p>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {result.status === 'processing' && (
                    <Progress value={50} className="h-2" />
                  )}
                </div>
              ))}
            </div>

            {results.some(r => r.status === 'success') && (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Revisar Dados
                </Button>
                <Button className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar e Prosseguir
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
