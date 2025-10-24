/**
 * PATCH 91.0 - Document Viewer Component
 * Side panel for viewing document details
 */

import React from 'react';
import { FileText, Calendar, User, ExternalLink, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DocumentMetadata } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentViewerProps {
  document: DocumentMetadata | null;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  if (!document) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Selecione um documento para visualizar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Detalhes do Documento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Name */}
        <div>
          <h3 className="font-semibold text-lg mb-2">{document.filename}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(document.storage_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Documento
          </Button>
        </div>

        <Separator />

        {/* AI Summary */}
        {document.ai_summary && (
          <div>
            <h4 className="font-medium mb-2">Resumo (IA)</h4>
            <p className="text-sm text-muted-foreground">{document.ai_summary}</p>
          </div>
        )}

        {/* Topics */}
        {document.ai_topics && document.ai_topics.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tópicos Identificados
            </h4>
            <div className="flex flex-wrap gap-2">
              {document.ai_topics.map((topic, idx) => (
                <Badge key={idx} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Validity Status */}
        {document.validity_status && (
          <div>
            <h4 className="font-medium mb-2">Status de Validade</h4>
            <Badge
              variant={
                document.validity_status === 'valid'
                  ? 'default'
                  : document.validity_status === 'expired'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {document.validity_status === 'valid' && 'Válido'}
              {document.validity_status === 'expired' && 'Expirado'}
              {document.validity_status === 'expiring_soon' && 'Expira em breve'}
              {document.validity_status === 'invalid' && 'Inválido'}
            </Badge>
          </div>
        )}

        {/* Key Information */}
        {document.validation_details && Object.keys(document.validation_details).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Informações Importantes</h4>
            <div className="space-y-2 text-sm">
              {document.validation_details.cnpj && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span className="font-mono">{document.validation_details.cnpj}</span>
                </div>
              )}
              {document.validation_details.expiry_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span>{document.validation_details.expiry_date}</span>
                </div>
              )}
              {document.validation_details.document_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span>{document.validation_details.document_type}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Criado em {format(new Date(document.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {(document.file_size / 1024).toFixed(2)} KB • {document.file_type}
            </span>
          </div>
          {document.owner_id && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-mono text-xs">{document.owner_id.slice(0, 8)}...</span>
            </div>
          )}
        </div>

        {/* Preview iframe for PDFs */}
        {document.file_type === 'application/pdf' && (
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={document.storage_url}
              className="w-full h-[400px]"
              title={document.filename}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
