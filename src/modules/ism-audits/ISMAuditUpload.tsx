/**
 * ISM Audit Upload Component
 * PATCH-609: PDF upload with OCR extraction
 */

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { extractISMChecklistFromPDF, validateExtractedItems } from "@/lib/ocr/pdfToISMChecklist";
import type { ISMAuditItem } from "@/types/ism-audit";

interface ISMAuditUploadProps {
  onItemsExtracted: (items: ISMAuditItem[]) => void;
  onCancel: () => void;
}

type UploadState = "idle" | "uploading" | "processing" | "completed" | "error";

export function ISMAuditUpload({ onItemsExtracted, onCancel }: ISMAuditUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [extractedItems, setExtractedItems] = useState<ISMAuditItem[]>([]);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB");
      return;
    }

    await processFile(file);
  };

  const processFile = async (file: File) => {
    setUploadState("uploading");
    setProgress(10);
    setErrorMessage("");
    setValidationIssues([]);

    try {
      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(30);
      
      setUploadState("processing");
      toast.info("Processando PDF com OCR...");

      // Extract items using OCR
      const items = await extractISMChecklistFromPDF(file);
      setProgress(80);

      // Validate extracted items
      const validation = validateExtractedItems(items);
      setValidationIssues(validation.issues);

      setExtractedItems(items);
      setProgress(100);
      setUploadState("completed");

      if (validation.issues.length > 0) {
        toast.warning("Extração concluída com avisos. Revise os itens.");
      } else {
        toast.success(`${items.length} itens extraídos com sucesso!`);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      setUploadState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao processar PDF"
      );
      toast.error("Erro ao processar o arquivo");
    }
  };

  const handleConfirm = () => {
    if (extractedItems.length > 0) {
      onItemsExtracted(extractedItems);
      toast.success("Itens adicionados à auditoria");
    }
  };

  const handleReset = () => {
    setUploadState("idle");
    setProgress(0);
    setExtractedItems([]);
    setValidationIssues([]);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload de Checklist ISM</h1>
          <p className="text-gray-600 mt-1">
            Extraia dados automaticamente de PDFs escaneados
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Voltar
        </Button>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Arquivo PDF</CardTitle>
          <CardDescription>
            Faça upload de um checklist ISM digitalizado para extração automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadState === "idle" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Arraste um arquivo PDF aqui ou clique para selecionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-4 w-4 mr-2" />
                Selecionar PDF
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Formatos suportados: PDF | Tamanho máximo: 10MB
              </p>
            </div>
          )}

          {(uploadState === "uploading" || uploadState === "processing") && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium">
                  {uploadState === "uploading" ? "Fazendo upload..." : "Processando com OCR..."}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">
                Isso pode levar alguns segundos dependendo do tamanho do arquivo
              </p>
            </div>
          )}

          {uploadState === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadState === "completed" && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {extractedItems.length} itens extraídos com sucesso!
                </AlertDescription>
              </Alert>

              {validationIssues.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Avisos de Validação:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationIssues.map((issue, index) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview of extracted items */}
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold mb-3">Preview dos Itens Extraídos:</h3>
                <div className="space-y-2">
                  {extractedItems.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="text-sm border-b pb-2">
                      <span className="font-medium text-gray-700">{item.category}</span>
                      <p className="text-gray-600">{item.question}</p>
                    </div>
                  ))}
                  {extractedItems.length > 5 && (
                    <p className="text-sm text-gray-500 italic">
                      ... e mais {extractedItems.length - 5} itens
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  Tentar Novamente
                </Button>
                <Button onClick={handleConfirm}>
                  Confirmar e Adicionar à Auditoria
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>✓ O PDF deve conter um checklist ISM digitalizado</p>
          <p>✓ Itens com checkmarks (✓) são marcados como conformes</p>
          <p>✓ Itens com X ou sem marcação são marcados como pendentes</p>
          <p>✓ Categorias são detectadas automaticamente quando possível</p>
          <p>✓ Após a extração, você pode revisar e ajustar os itens no formulário</p>
        </CardContent>
      </Card>
    </div>
  );
}
