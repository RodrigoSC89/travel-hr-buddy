
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createWorker } from "tesseract.js";
import { AIDocumentsAnalyzer } from "@/components/documents/ai-documents-analyzer";
import { SemanticDocumentSearch } from "@/components/documents/SemanticDocumentSearch";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Search,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  AlertCircle
} from "lucide-react";

interface AIDocument {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  ocr_text: string;
  ocr_status: string;
  extracted_keywords: any[];
  category: string;
  confidence_score: number;
  created_at: string;
}

export default function AIDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<AIDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<AIDocument[]>({
    queryKey: ["ai-documents", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("ai_documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,ocr_text.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Upload and process document
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setProcessing(true);
      
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);
      
      // Create document record
      const { data: { user } } = await supabase.auth.getUser();
      const { data: docData, error: docError } = await supabase
        .from("ai_documents")
        .insert({
          title: selectedFile.name,
          file_url: publicUrl,
          file_type: selectedFile.type.includes("pdf") ? "pdf" : "image",
          file_size_bytes: selectedFile.size,
          ocr_status: "processing",
          uploaded_by: user?.id
        })
        .select()
        .single();
      
      if (docError) throw docError;
      
      // Process with OCR
      await performOCR(selectedFile, docData.id);
      
      queryClient.invalidateQueries({ queryKey: ["ai-documents"] });
      
      toast({
        title: "Document uploaded",
        description: "OCR processing completed successfully",
      });
      
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProcessing(false);
      setOcrProgress(0);
    }
  };

  // Perform OCR using Tesseract.js
  const performOCR = async (file: File, documentId: string) => {
    try {
      setOcrProgress(0);
      
      // Log analysis start
      await supabase.rpc("log_document_analysis", {
        p_document_id: documentId,
        p_analysis_type: "ocr",
        p_status: "started"
      });

      const worker = await createWorker();
      
      await worker.loadLanguage("eng+por");
      await worker.initialize("eng+por");
      
      setOcrProgress(30);
      
      const { data: { text, confidence } } = await worker.recognize(file, {}, (progress) => {
        setOcrProgress(30 + (progress.progress * 50));
      });
      
      await worker.terminate();
      
      setOcrProgress(85);
      
      // Extract keywords (simple implementation)
      const keywords = extractKeywords(text);
      
      // Update document with OCR results
      await supabase
        .from("ai_documents")
        .update({
          ocr_text: text,
          ocr_status: "completed",
          ocr_completed_at: new Date().toISOString(),
          extracted_keywords: keywords,
          confidence_score: confidence * 100
        })
        .eq("id", documentId);
      
      // Save keywords
      for (const keyword of keywords) {
        await supabase.from("document_keywords").insert({
          document_id: documentId,
          keyword: keyword.text,
          relevance_score: keyword.score
        });
      }
      
      setOcrProgress(100);
      
      // Log analysis completion
      await supabase.rpc("log_document_analysis", {
        p_document_id: documentId,
        p_analysis_type: "ocr",
        p_status: "completed",
        p_results: { confidence, word_count: text.split(/\s+/).length }
      });
      
    } catch (error: any) {
      console.error("OCR Error:", error);
      
      // Log analysis failure
      await supabase.rpc("log_document_analysis", {
        p_document_id: documentId,
        p_analysis_type: "ocr",
        p_status: "failed",
        p_error: error.message
      });
      
      throw error;
    }
  };

  // Simple keyword extraction
  const extractKeywords = (text: string) => {
    const words = text.toLowerCase()
      .replace(/[^a-záàâãéèêíïóôõöúçñ\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 4);
    
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, count]) => ({
        text,
        score: (count / words.length) * 100
      }));
  };

  const highlightKeywords = (text: string, keywords: any[]) => {
    if (!keywords || keywords.length === 0) return text;
    
    let highlighted = text;
    keywords.slice(0, 10).forEach(kw => {
      const regex = new RegExp(`\\b${kw.text || kw}\\b`, "gi");
      highlighted = highlighted.replace(regex, "<mark class=\"bg-yellow-200 dark:bg-yellow-800\">$&</mark>");
    });
    
    return highlighted;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "processing":
      return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Intelligent document analysis with OCR and NLP
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload PDF or image files for AI-powered analysis and text extraction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                />
              </div>
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload & Process"}
              </Button>
            </div>
            
            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>OCR Processing...</span>
                  <span>{ocrProgress.toFixed(0)}%</span>
                </div>
                <Progress value={ocrProgress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <FileText className="w-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Semantic Search
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Sparkles className="w-4 h-4 mr-2" />
            Analysis Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <SemanticDocumentSearch />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">Loading documents...</div>
              </CardContent>
            </Card>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No documents found. Upload your first document to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{doc.title}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getStatusIcon(doc.ocr_status)}
                            {doc.ocr_status}
                          </Badge>
                          {doc.category && (
                            <Badge variant="secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {doc.category}
                            </Badge>
                          )}
                        </div>
                        
                        {doc.extracted_keywords && doc.extracted_keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {doc.extracted_keywords.slice(0, 5).map((kw: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {kw.text || kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {doc.ocr_text && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.ocr_text.substring(0, 200)}...
                          </p>
                        )}
                        
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Type: {doc.file_type}</span>
                          {doc.confidence_score && (
                            <span>Confidence: {doc.confidence_score.toFixed(1)}%</span>
                          )}
                          <span>
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.file_url, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Logs</CardTitle>
              <CardDescription>
                Detailed logs of all document analysis operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analysis logs will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedDocument.title}</CardTitle>
                  <CardDescription>
                    OCR Text Extraction with Keyword Highlighting
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 overflow-auto max-h-[70vh]">
              <div>
                <h4 className="font-semibold mb-2">Original Document</h4>
                <iframe
                  src={selectedDocument.file_url}
                  className="w-full h-96 border rounded"
                  title="Document Preview"
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Extracted Text</h4>
                <div
                  className="text-sm bg-muted p-4 rounded whitespace-pre-wrap h-96 overflow-auto"
                  dangerouslySetInnerHTML={{
                    __html: highlightKeywords(
                      selectedDocument.ocr_text || "No text extracted yet",
                      selectedDocument.extracted_keywords || []
                    )
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
