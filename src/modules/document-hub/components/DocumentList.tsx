/**
 * PATCH 91.0 - Document List Component
 * Display list of documents with filtering
 */

import React from 'react';
import { FileText, Calendar, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentMetadata } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentListProps {
  documents: DocumentMetadata[];
  selectedDocument: DocumentMetadata | null;
  onSelect: (doc: DocumentMetadata) => void;
  onDelete: (docId: string) => void;
  isLoading: boolean;
}

export function DocumentList({
  documents,
  selectedDocument,
  onSelect,
  onDelete,
  isLoading,
}: DocumentListProps) {
  const getValidityIcon = (status?: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'expiring_soon':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getValidityLabel = (status?: string) => {
    switch (status) {
      case 'valid':
        return 'Válido';
      case 'expired':
        return 'Expirado';
      case 'expiring_soon':
        return 'Expira em breve';
      case 'invalid':
        return 'Inválido';
      default:
        return 'Sem validação';
    }
  };

  const getValidityVariant = (status?: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case 'valid':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'expiring_soon':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum documento carregado</p>
        </div>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {documents.map((doc) => (
          <Card
            key={doc.doc_id}
            className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
              selectedDocument?.doc_id === doc.doc_id ? 'bg-accent border-primary' : ''
            }`}
            onClick={() => onSelect(doc)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getValidityIcon(doc.validity_status)}
                  <h3 className="font-medium truncate">{doc.filename}</h3>
                </div>

                {doc.ai_summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {doc.ai_summary}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getValidityVariant(doc.validity_status)}>
                    {getValidityLabel(doc.validity_status)}
                  </Badge>

                  {doc.ai_topics && doc.ai_topics.slice(0, 2).map((topic, idx) => (
                    <Badge key={idx} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(doc.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                  <div>
                    {(doc.file_size / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(doc.storage_url, '_blank');
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Deseja realmente deletar este documento?')) {
                      onDelete(doc.doc_id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
