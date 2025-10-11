"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, History, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentVersion {
  id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
}

interface DocumentVersionHistoryProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionRestored?: () => void;
}

export function DocumentVersionHistory({
  documentId,
  open,
  onOpenChange,
  onVersionRestored,
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  useEffect(() => {
    if (open && documentId) {
      loadVersions();
    }
  }, [open, documentId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVersions(data || []);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (version: DocumentVersion) => {
    setSelectedVersion(version);
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedVersion) return;

    setRestoring(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Update the document with the version content
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: selectedVersion.content })
        .eq("id", documentId);

      if (updateError) throw updateError;

      // Log the restore action
      const { error: logError } = await supabase
        .from("document_restore_logs")
        .insert({
          document_id: documentId,
          version_id: selectedVersion.id,
          restored_by: user.id,
        });

      if (logError) {
        console.error("Error logging restore:", logError);
        // Don't throw, as the restore was successful
      }

      toast({
        title: "Versão restaurada",
        description: "A versão do documento foi restaurada com sucesso.",
      });

      setShowRestoreConfirm(false);
      onOpenChange(false);
      if (onVersionRestored) {
        onVersionRestored();
      }
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar a versão do documento.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Versões
            </DialogTitle>
            <DialogDescription>
              Visualize e restaure versões anteriores do documento
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma versão anterior encontrada.</p>
              <p className="text-sm mt-2">
                As versões são criadas automaticamente quando o documento é editado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <Card key={version.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Versão #{versions.length - index}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Mais recente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Salvo em{" "}
                          {format(
                            new Date(version.created_at),
                            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                        <div className="text-sm text-muted-foreground border-t pt-2 mt-2">
                          <p className="line-clamp-3">{version.content}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreClick(version)}
                        disabled={restoring}
                        className="ml-4"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restaurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar restauração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar esta versão do documento? O conteúdo atual
              será substituído e uma nova versão será criada automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={restoring}
              className="bg-primary"
            >
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                "Confirmar restauração"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
