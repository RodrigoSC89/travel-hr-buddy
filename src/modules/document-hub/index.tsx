import { useCallback, useEffect, useState } from "react";;

/**
 * PATCH 91.1 - Document Hub Module
 * Central hub for document management with AI integration
 * 
 * Features:
 * - Upload PDF and DOCX files
 * - Inline preview
 * - AI-powered document analysis
 * - Document history tracking
 * - Supabase integration for storage
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Eye, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { runAIContext } from "@/ai";
import { parsePdf } from "@/lib/pdf";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  aiAnalysis?: string;
}

export default function DocumentHub() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [aiInsight, setAiInsight] = useState<string>("");

  const loadDocuments = useCallback(async () => {
    try {
      logger.info("Loading document history");
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        logger.warn("Failed to load documents from Supabase", { error: error.message });
        // Continue with empty state rather than failing
        return;
      }

      if (data) {
        const mappedDocs = data.map((doc: unknown) => ({
          id: doc.id,
          name: doc.name || "Unnamed Document",
          type: doc.type || "unknown",
          size: doc.size || 0,
          uploadedAt: doc.created_at,
          aiAnalysis: doc.ai_analysis,
        }));
        setDocuments(mappedDocs);
        logger.info("Documents loaded successfully", { count: mappedDocs.length });
      }
    } catch (error) {
      logger.error("Error loading documents", error);
    }
  }, []);

  useEffect(() => {
    logger.info("Document Hub initialized");
    loadDocuments();
  }, [loadDocuments]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Use PDF ou DOCX.");
      logger.warn("Invalid file type selected", { type: file.type });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Limite: 10MB.");
      logger.warn("File too large", { size: file.size });
      return;
    }

    setSelectedFile(file);
    logger.info("File selected", { name: file.name, type: file.type, size: file.size });
    
    // Generate preview
    generatePreview(file);
  };

  const generatePreview = async (file: File) => {
    try {
      if (file.type === "application/pdf") {
        const parsed = await parsePdf(file);
        setPreviewContent(parsed.content);
        logger.info("PDF preview generated", { fileName: file.name });
      } else {
        setPreviewContent("Preview disponível após upload");
        logger.info("DOCX preview placeholder set", { fileName: file.name });
      }
    } catch (error) {
      logger.error("Error generating preview", error);
      setPreviewContent("Erro ao gerar preview");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setUploading(true);
    logger.info("Starting document upload", { fileName: selectedFile.name });

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      logger.info("File uploaded to storage", { fileName });

      // Get AI analysis
      logger.info("Requesting AI analysis");
      const aiResponse = await runAIContext({
        module: "document-ai",
        action: "analyze",
        context: {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        },
      });

      setAiInsight(aiResponse.message);
      logger.info("AI analysis completed", { confidence: aiResponse.confidence });

      // Store document metadata
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          storage_path: uploadData.path,
          ai_analysis: aiResponse.message,
        });

      if (dbError) {
        logger.warn("Failed to store document metadata", { error: dbError.message });
      } else {
        logger.info("Document metadata stored successfully");
      }

      toast.success("Documento enviado com sucesso!");
      
      // Reload documents
      await loadDocuments();
      
      // Reset form
      setSelectedFile(null);
      setPreviewContent("");
    } catch (error) {
      logger.error("Error uploading document", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setUploading(false);
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Document Hub
          </h1>
          <p className="text-muted-foreground">
            PATCH 91.1 - Gerenciamento centralizado de documentos com IA
          </p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          Operacional
        </Badge>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
          <CardDescription>
            Suporte para PDF e DOCX (máximo 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>

          {selectedFile && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedFile.name}</span>
                <Badge>{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
              </div>
              {previewContent && (
                <div className="mt-2 p-3 bg-background rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Preview</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{previewContent}</p>
                </div>
              )}
            </div>
          )}

          {aiInsight && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Análise de IA
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      {aiInsight}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Document History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Documentos</CardTitle>
          <CardDescription>
            Últimos documentos enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum documento enviado ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.type}</Badge>
                    <Badge variant="secondary">{(doc.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
