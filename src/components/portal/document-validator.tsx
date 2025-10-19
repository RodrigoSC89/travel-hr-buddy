import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye,
  Download,
  Loader2,
  Camera,
  Scan
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  documentType: string;
  extractedData: unknown;
}

interface DocumentValidatorProps {
  crewMemberId?: string;
  onValidationComplete?: (result: ValidationResult) => void;
}

export const DocumentValidator: React.FC<DocumentValidatorProps> = ({
  crewMemberId,
  onValidationComplete
}) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateDocument(files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateDocument(files[0]);
    }
  };

  // Validate document using AI
  const validateDocument = async (file: File) => {
    if (!file) return;

    setSelectedFile(file);
    setIsValidating(true);
    setValidationProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setValidationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Converter arquivo para base64
      const base64 = await fileToBase64(file);
      
      // Enviar para validação de IA
      const { data, error } = await supabase.functions.invoke("crew-ai-insights", {
        body: {
          type: "document_validation",
          file: base64,
          fileName: file.name,
          fileType: file.type,
          crewMemberId
        }
      });

      clearInterval(progressInterval);
      setValidationProgress(100);

      if (error) throw error;

      const result: ValidationResult = {
        isValid: data.isValid || false,
        confidence: data.confidence || 0,
        issues: data.issues || [],
        suggestions: data.suggestions || [],
        documentType: data.documentType || "unknown",
        extractedData: data.extractedData || {}
      };

      setValidationResults(prev => [...prev, result]);
      onValidationComplete?.(result);

      // Save validation result to database
      if (crewMemberId) {
        await supabase.from("crew_dossier_documents").insert([{
          crew_member_id: crewMemberId,
          document_name: file.name,
          document_category: result.documentType,
          file_url: `temp/${file.name}`, // Temporary URL
          file_type: file.type,
          file_size: file.size,
          verification_status: result.isValid ? "verified" : "needs_review",
          notes: `Validação automática: ${result.confidence}% de confiança. ${result.issues.join(", ")}`
        }]);
      }

      toast({
        title: result.isValid ? "Documento válido" : "Documento precisa de revisão",
        description: `Confiança: ${result.confidence}%`,
        variant: result.isValid ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o documento",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
      setValidationProgress(0);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Get validation status color
  const getStatusColor = (isValid: boolean, confidence: number) => {
    if (isValid && confidence >= 80) return "text-green-600 bg-green-50";
    if (isValid && confidence >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // Clear results
  const clearResults = () => {
    setValidationResults([]);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Validação Inteligente de Documentos
          </CardTitle>
          <CardDescription>
            Valide automaticamente seus documentos com OCR e IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            {isValidating ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <div>
                  <p className="text-lg font-medium">Validando documento...</p>
                  <Progress value={validationProgress} className="mt-2 max-w-xs mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {validationProgress < 30 && "Lendo documento..."}
                    {validationProgress >= 30 && validationProgress < 60 && "Extraindo dados..."}
                    {validationProgress >= 60 && validationProgress < 90 && "Validando informações..."}
                    {validationProgress >= 90 && "Finalizando..."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Enviar Documento para Validação</h3>
                <p className="text-muted-foreground mb-4">
                  Suporta: PDF, JPG, PNG, DOC, DOCX
                </p>
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                />
                <Button 
                  onClick={() => document.getElementById("doc-upload")?.click()}
                  disabled={isValidating}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Selecionar Documento
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resultados da Validação
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearResults}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
            <CardDescription>
              Análise automática dos documentos enviados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.isValid ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {result.documentType === "unknown" ? "Documento" : result.documentType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Confiança: {result.confidence}%
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.isValid, result.confidence)}>
                    {result.isValid ? "Válido" : "Revisar"}
                  </Badge>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Problemas encontrados:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {result.issues.map((issue, i) => (
                          <li key={i} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">Sugestões de melhoria:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-blue-800">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Data */}
                {Object.keys(result.extractedData).length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium mb-2">Dados extraídos:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(result.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};