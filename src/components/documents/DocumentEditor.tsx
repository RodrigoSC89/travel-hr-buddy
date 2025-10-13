"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentEditorProps {
  documentId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSave?: (documentId: string) => void;
}

interface Version {
  content: string;
  saved_at: string;
}

export function DocumentEditor({ 
  documentId, 
  initialTitle = "", 
  initialContent = "",
  onSave 
}: DocumentEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const versionRef = useRef<Version[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save effect - triggers 2 seconds after user stops typing
  useEffect(() => {
    if (!documentId || !content) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveContentToDB(content);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, documentId]);

  async function saveContentToDB(content: string) {
    if (!documentId || !user) return;

    setSaving(true);
    try {
      // Save to main documents table
      const { error: docError } = await supabase
        .from("ai_generated_documents")
        .upsert({
          id: documentId,
          content,
          title,
          updated_by: user.id,
        });

      if (docError) throw docError;

      // Save to version history
      const { error: versionError } = await supabase
        .from("document_versions")
        .insert({
          document_id: documentId,
          content,
          updated_by: user.id,
        });

      if (versionError) throw versionError;

      // Track version locally
      versionRef.current.push({ 
        content, 
        saved_at: new Date().toISOString() 
      });

      setLastSaved(new Date());
      
      toast({
        title: "Auto-salvamento concluído",
        description: "Documento salvo automaticamente",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o documento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleManualSave() {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar documentos",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let currentDocId = documentId;

      if (!currentDocId) {
        // Create new document
        const { data, error } = await supabase
          .from("ai_generated_documents")
          .insert({
            title: title.trim(),
            content,
            generated_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        currentDocId = data.id;
      } else {
        // Update existing document
        const { error: docError } = await supabase
          .from("ai_generated_documents")
          .update({
            title: title.trim(),
            content,
            updated_by: user.id,
          })
          .eq("id", currentDocId);

        if (docError) throw docError;
      }

      // Save to version history
      const { error: versionError } = await supabase
        .from("document_versions")
        .insert({
          document_id: currentDocId,
          content,
          updated_by: user.id,
        });

      if (versionError) throw versionError;

      // Track version locally
      versionRef.current.push({ 
        content, 
        saved_at: new Date().toISOString() 
      });

      setLastSaved(new Date());
      
      toast({
        title: "Documento salvo",
        description: "Documento salvo com sucesso",
      });

      if (onSave && currentDocId) {
        onSave(currentDocId);
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o documento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Editor de Documentos
        </CardTitle>
        {lastSaved && (
          <p className="text-sm text-muted-foreground">
            Último salvamento: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do documento"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conteúdo</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite o conteúdo do documento aqui..."
            rows={15}
            className="font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleManualSave}
            disabled={saving || !title.trim() || !content.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>

          {saving && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-salvando...
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>💡 O documento é salvo automaticamente 2 segundos após você parar de digitar</p>
          <p>📦 Total de versões salvas: {versionRef.current.length}</p>
        </div>
      </CardContent>
    </Card>
  );
}
