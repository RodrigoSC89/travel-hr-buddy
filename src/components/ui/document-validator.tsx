import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, FileX, AlertTriangle, CheckCircle, Upload, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

interface ValidationIssue {
  type: "error" | "warning" | "info";
  field: string;
  message: string;
  severity: "high" | "medium" | "low";
}

interface DocumentValidatorProps {
  documentType: "certificate" | "license" | "passport" | "visa" | "contract";
  onValidationComplete?: (result: DocumentValidationResult) => void;
}

export const DocumentValidator: React.FC<DocumentValidatorProps> = ({
  documentType,
  onValidationComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [manualData, setManualData] = useState({
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    issuer: "",
    notes: ""
  });
  const { toast } = useToast();

  const documentTypeLabels = {
    certificate: "Certificado",
    license: "Licença",
    passport: "Passaporte",
    visa: "Visto",
    contract: "Contrato"
  };

  const validateDocument = async () => {
    setIsValidating(true);
    
    try {
      // Simular validação (em produção, seria uma chamada à API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const issues: ValidationIssue[] = [];
      let score = 100;

      // Validações básicas
      if (!manualData.documentNumber) {
        issues.push({
          type: "error",
          field: "documentNumber",
          message: "Número do documento é obrigatório",
          severity: "high"
        });
        score -= 25;
      }

      if (!manualData.issueDate) {
        issues.push({
          type: "error",
          field: "issueDate",
          message: "Data de emissão é obrigatória",
          severity: "high"
        });
        score -= 20;
      }

      if (!manualData.expiryDate) {
        issues.push({
          type: "warning",
          field: "expiryDate",
          message: "Data de validade não informada",
          severity: "medium"
        });
        score -= 15;
      } else {
        const expiryDate = new Date(manualData.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          issues.push({
            type: "error",
            field: "expiryDate",
            message: "Documento vencido",
            severity: "high"
          });
          score -= 30;
        } else if (daysUntilExpiry < 30) {
          issues.push({
            type: "warning",
            field: "expiryDate",
            message: "Documento vence em menos de 30 dias",
            severity: "medium"
          });
          score -= 10;
        }
      }

      if (!manualData.issuer) {
        issues.push({
          type: "warning",
          field: "issuer",
          message: "Órgão emissor não informado",
          severity: "medium"
        });
        score -= 10;
      }

      // Validações específicas por tipo de documento
      if (documentType === "certificate" && manualData.documentNumber.length < 5) {
        issues.push({
          type: "warning",
          field: "documentNumber",
          message: "Número do certificado parece muito curto",
          severity: "low"
        });
        score -= 5;
      }

      const suggestions = [
        "Verifique se todos os dados estão corretos",
        "Confirme a autenticidade do documento com o órgão emissor",
        "Mantenha uma cópia digital segura do documento"
      ];

      if (issues.some(i => i.severity === "high")) {
        suggestions.unshift("Corrija os erros críticos antes de prosseguir");
      }

      const result: DocumentValidationResult = {
        isValid: score >= 70 && !issues.some(i => i.type === "error"),
        score: Math.max(0, score),
        issues,
        suggestions
      };

      setValidationResult(result);
      onValidationComplete?.(result);

      toast({
        title: result.isValid ? "Validação concluída" : "Problemas encontrados",
        description: result.isValid 
          ? "Documento validado com sucesso" 
          : `Encontrados ${issues.length} problema(s)`,
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
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: "Arquivo carregado",
        description: `${selectedFile.name} foi carregado com sucesso`
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getIssueIcon = (type: ValidationIssue["type"]) => {
    switch (type) {
    case "error":
      return <FileX className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Validador de {documentTypeLabels[documentType]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de arquivo */}
          <div>
            <Label htmlFor="file-upload">Arquivo do documento</Label>
            <div className="mt-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
              />
              {file && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    <Upload className="h-3 w-3 mr-1" />
                    {file.name}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Dados manuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentNumber">Número do documento</Label>
              <Input
                id="documentNumber"
                value={manualData.documentNumber}
                onChange={(e) => setManualData(prev => ({ ...prev, documentNumber: e.target.value }))}
                placeholder="Ex: ABC123456"
              />
            </div>
            <div>
              <Label htmlFor="issuer">Órgão emissor</Label>
              <Input
                id="issuer"
                value={manualData.issuer}
                onChange={(e) => setManualData(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="Ex: Marinha do Brasil"
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Data de emissão</Label>
              <Input
                id="issueDate"
                type="date"
                value={manualData.issueDate}
                onChange={(e) => setManualData(prev => ({ ...prev, issueDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Data de validade</Label>
              <Input
                id="expiryDate"
                type="date"
                value={manualData.expiryDate}
                onChange={(e) => setManualData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={manualData.notes}
              onChange={(e) => setManualData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informações adicionais sobre o documento..."
              rows={3}
            />
          </div>

          <Button 
            onClick={validateDocument} 
            disabled={isValidating}
            className="w-full"
          >
            {isValidating ? "Validando..." : "Validar Documento"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado da validação */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado da Validação</span>
              <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                Score: <span className={getScoreColor(validationResult.score)}>
                  {validationResult.score}/100
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Issues */}
            {validationResult.issues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Problemas encontrados:</h4>
                <div className="space-y-2">
                  {validationResult.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.field}</p>
                        <p className="text-xs text-muted-foreground">{issue.message}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          issue.severity === "high" ? "border-red-200" :
                            issue.severity === "medium" ? "border-yellow-200" :
                              "border-blue-200"
                        }`}
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sugestões */}
            {validationResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sugestões:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};