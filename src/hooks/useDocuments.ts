/**
 * Hook for fetching Documents from Supabase
 * Replaces mock document data with real storage queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  size: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  storagePath?: string;
}

export function useDocuments(category?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ['documents', category, searchQuery],
    queryFn: async (): Promise<Document[]> => {
      let query = supabase
        .from('ai_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('file_type', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(doc => ({
        id: doc.id,
        title: doc.file_name,
        description: '',
        type: getFileExtension(doc.file_name),
        category: doc.file_type || 'general',
        size: doc.file_size || 0,
        status: doc.ocr_status === 'completed' ? 'approved' : 'draft' as const,
        version: '1.0',
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        createdBy: doc.uploaded_by || 'Unknown',
        tags: [],
        isPublic: false,
        downloadCount: 0,
        viewCount: 0,
        storagePath: doc.storage_path
      }));
    }
  });
}

export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata?: Record<string, any> }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data, error: insertError } = await supabase
        .from('ai_documents')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          ocr_status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const extensionMap: Record<string, string> = {
    'pdf': 'pdf',
    'doc': 'docx',
    'docx': 'docx',
    'xls': 'xlsx',
    'xlsx': 'xlsx',
    'ppt': 'pptx',
    'pptx': 'pptx',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image'
  };
  return extensionMap[ext] || ext;
}
