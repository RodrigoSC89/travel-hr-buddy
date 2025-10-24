/**
 * PATCH 91.0 - Document Hub Main Page
 * Unified document management interface
 */

import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { DocumentViewer } from './components/DocumentViewer';
import { useDocumentHub } from './hooks/useDocumentHub';

export default function DocumentHub() {
  const {
    documents,
    isLoading,
    isUploading,
    selectedDocument,
    handleUpload,
    handleDelete,
    handleSelect,
    refreshDocuments,
  } = useDocumentHub();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Document Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão Inteligente de Documentos com IA
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshDocuments}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Upload Section */}
      <DocumentUpload onUpload={handleUpload} isUploading={isUploading} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({documents.length})</CardTitle>
              <CardDescription>
                Clique em um documento para visualizar detalhes e análise da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList
                documents={documents}
                selectedDocument={selectedDocument}
                onSelect={handleSelect}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Document Viewer */}
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
          <DocumentViewer document={selectedDocument} />
        </div>
      </div>

      {/* Features Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Recursos do Document Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Upload de arquivos PDF e DOCX com visualização</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Análise automática por IA (sumário e tópicos)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Extração de informações importantes (CNPJ, datas)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Verificação de validade de documentos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Armazenamento seguro no Supabase</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Fallback automático para arquivos ilegíveis</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
