/**
 * Hook for Documents CRUD Operations
 * Complete integration with Supabase for document management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type DocumentRow = Database["public"]["Tables"]["ai_documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["ai_documents"]["Insert"];
type DocumentUpdate = Database["public"]["Tables"]["ai_documents"]["Update"];

export type Document = DocumentRow;

interface UseDocumentsOptions {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
}

export function useDocuments(options?: UseDocumentsOptions) {
  return useQuery({
    queryKey: ["documents", options],
    queryFn: async () => {
      let query = supabase
        .from("ai_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.category) {
        query = query.eq("category", options.category);
      }

      if (options?.status) {
        query = query.eq("ocr_status", options.status);
      }

      if (options?.search) {
        query = query.or(`file_name.ilike.%${options.search}%,title.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        logger.error("Error fetching documents:", error);
        throw error;
      }
      
      return data as Document[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_documents")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        logger.error("Error fetching document:", error);
        throw error;
      }
      
      return data as Document;
    },
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata?: Partial<DocumentInsert> }) => {
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file);

      if (uploadError) {
        logger.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(storagePath);

      // Create document record with required fields
      const documentData: DocumentInsert = {
        file_name: file.name,
        file_type: file.type,
        storage_path: storagePath,
        file_url: urlData.publicUrl,
        file_size_bytes: file.size,
        ocr_status: "pending",
        ...metadata,
      };

      const { data, error } = await supabase
        .from("ai_documents")
        .insert([documentData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating document record:", error);
        throw error;
      }
      
      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento enviado!", {
        description: `${data.file_name} foi adicionado com sucesso.`
      });
      logger.info("Document uploaded:", { id: data.id, name: data.file_name });
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar documento", {
        description: error.message
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DocumentUpdate }) => {
      const { data: document, error } = await supabase
        .from("ai_documents")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating document:", error);
        throw error;
      }
      
      return document as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", data.id] });
      toast.success("Documento atualizado!", {
        description: `${data.file_name} foi atualizado.`
      });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar documento", {
        description: error.message
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: Document) => {
      // Delete from storage
      if (document.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([document.storage_path]);

        if (storageError) {
          logger.warn("Error deleting file from storage:", storageError);
        }
      }

      // Delete record
      const { error } = await supabase
        .from("ai_documents")
        .delete()
        .eq("id", document.id);

      if (error) {
        logger.error("Error deleting document:", error);
        throw error;
      }
      
      return document.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento removido", {
        description: "O documento foi excluído permanentemente."
      });
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover documento", {
        description: error.message
      });
    },
  });
}

export function useProcessDocumentOCR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      // Trigger OCR processing via edge function
      const { data, error } = await supabase.functions.invoke("ocr-process", {
        body: { documentId }
      });

      if (error) {
        logger.error("Error processing OCR:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast.success("OCR iniciado!", {
        description: "O processamento do documento foi iniciado."
      });
    },
    onError: (error: Error) => {
      toast.error("Erro ao processar OCR", {
        description: error.message
      });
    },
  });
}
