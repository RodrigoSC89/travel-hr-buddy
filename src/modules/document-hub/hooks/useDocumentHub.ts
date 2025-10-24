/**
 * PATCH 91.0 - Document Hub Hook
 * React hook for document management
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DocumentMetadata } from '../types';
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  updateDocumentMetadata,
} from '../services/supabase';
import {
  analyzeDocument,
  extractTextFromPDF,
  extractTextFromDOCX,
} from '../services/ai';
import { logger } from '@/lib/logger';

export function useDocumentHub() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const { toast } = useToast();

  /**
   * Load documents from Supabase
   */
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const docs = await listDocuments(user?.id);
      setDocuments(docs);
    } catch (error) {
      logger.error('Error loading documents:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Upload and analyze a document
   */
  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        // Validate file
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error('Arquivo muito grande. Máximo: 10MB');
        }

        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ];
        
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Tipo de arquivo não suportado. Use PDF ou DOCX.');
        }

        // Upload to Supabase
        const uploadResult = await uploadDocument(file, user.id);
        
        if (!uploadResult.success || !uploadResult.metadata) {
          throw new Error(uploadResult.error || 'Falha no upload');
        }

        // Extract text based on file type
        let documentText = '';
        if (file.type === 'application/pdf') {
          documentText = await extractTextFromPDF(file);
        } else if (
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword'
        ) {
          documentText = await extractTextFromDOCX(file);
        }

        // Analyze with AI
        const aiAnalysis = await analyzeDocument(documentText, file.name);

        // Update metadata with AI results
        await updateDocumentMetadata(uploadResult.metadata.doc_id, {
          ai_summary: aiAnalysis.summary,
          ai_topics: aiAnalysis.topics,
          validity_status: aiAnalysis.validity_status,
          validation_details: aiAnalysis.key_info,
        });

        // Reload documents
        await loadDocuments();

        toast({
          title: 'Sucesso',
          description: `Documento "${file.name}" carregado e analisado com sucesso`,
        });

        return uploadResult.metadata;
      } catch (error) {
        logger.error('Upload error:', error);
        toast({
          title: 'Erro no upload',
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [loadDocuments, toast]
  );

  /**
   * Delete a document
   */
  const handleDelete = useCallback(
    async (docId: string) => {
      try {
        const success = await deleteDocument(docId);
        
        if (!success) {
          throw new Error('Falha ao deletar documento');
        }

        await loadDocuments();
        
        if (selectedDocument?.doc_id === docId) {
          setSelectedDocument(null);
        }

        toast({
          title: 'Sucesso',
          description: 'Documento deletado com sucesso',
        });
      } catch (error) {
        logger.error('Delete error:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível deletar o documento',
          variant: 'destructive',
        });
      }
    },
    [loadDocuments, selectedDocument, toast]
  );

  /**
   * Select a document for viewing
   */
  const handleSelect = useCallback((doc: DocumentMetadata | null) => {
    setSelectedDocument(doc);
  }, []);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    isUploading,
    selectedDocument,
    handleUpload,
    handleDelete,
    handleSelect,
    refreshDocuments: loadDocuments,
  };
}
