import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
}

interface DocumentVersionHistoryProps {
  documentId: string;
  onRestore?: () => void;
}

export function DocumentVersionHistory({ documentId, onRestore }: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      logger.error("Error loading versions:", error);
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
    setShowRestoreDialog(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedVersion) return;

    try {
      setRestoring(true);

      // Get the version content
      const { data: version, error: versionError } = await supabase
        .from("document_versions")
        .select("content")
        .eq("id", selectedVersion.id)
        .single();

      if (versionError) throw versionError;
      if (!version) throw new Error("Version not found");

      // Update the document (this will automatically create a new version via trigger)
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: version.content })
        .eq("id", documentId);

      if (updateError) throw updateError;

      // Restoration logged via database trigger

      toast({
        title: "Versão restaurada com sucesso",
        description: `A versão de ${format(new Date(selectedVersion.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} foi restaurada.`,
      });

      setShowRestoreDialog(false);
      setSelectedVersion(null);

      // Reload versions to show the new version created by the trigger
      await loadVersions();

      // Call the optional callback
      if (onRestore) {
        onRestore();
      }
    } catch (error) {
      logger.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar esta versão do documento.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Versões
          </CardTitle>
          <CardDescription>
            {versions.length === 0
              ? "Este documento ainda não possui versões anteriores."
              : `${versions.length} versão(ões) anterior(es) disponível(is)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma versão anterior encontrada</p>
              <p className="text-xs mt-1">
                As versões são criadas automaticamente quando você edita o documento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "Mais recente" : `Versão ${versions.length - index}`}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {version.content.substring(0, 150)}
                      {version.content.length > 150 ? "..." : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {version.content.length} caracteres
                    </p>
                  </div>
                  {index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreClick(version)}
                      className="ml-4 shrink-0"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirmar Restauração
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja restaurar esta versão do documento?
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-2 py-4">
              <p className="text-sm">
                <strong>Data da versão:</strong>{" "}
                {format(new Date(selectedVersion.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
              <div className="border rounded-lg p-3 bg-muted/50 max-h-[200px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{selectedVersion.content}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ A versão atual será salva automaticamente no histórico antes da restauração.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreDialog(false)}
              disabled={restoring}
            >
              Cancelar
            </Button>
            <Button onClick={handleRestoreConfirm} disabled={restoring}>
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Confirmar Restauração
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
