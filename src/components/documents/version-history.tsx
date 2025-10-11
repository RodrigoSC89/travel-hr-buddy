import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDocumentVersions } from "@/hooks/use-document-versions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
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

interface DocumentVersionHistoryProps {
  documentId: string | undefined;
  onVersionRestored?: () => void;
}

export function DocumentVersionHistory({
  documentId,
  onVersionRestored,
}: DocumentVersionHistoryProps) {
  const { versions, loading, error } = useDocumentVersions(documentId);
  const [restoring, setRestoring] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const handleRestore = async (versionId: string) => {
    if (!documentId) return;

    try {
      setRestoring(true);

      // Get the version content
      const { data: version, error: versionError } = await supabase
        .from("document_versions")
        .select("content")
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      // Update the document (this will automatically create a new version)
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: version.content })
        .eq("id", documentId);

      if (updateError) throw updateError;

      toast({
        title: "Versão restaurada",
        description: "A versão foi restaurada com sucesso.",
      });

      if (onVersionRestored) {
        onVersionRestored();
      }

      setShowRestoreDialog(false);
    } catch (err) {
      console.error("Error restoring version:", err);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar a versão.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const confirmRestore = (versionId: string) => {
    setSelectedVersion(versionId);
    setShowRestoreDialog(true);
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Erro ao carregar versões: {error.message}
          </p>
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
            <Badge variant="secondary" className="ml-auto">
              {versions.length} {versions.length === 1 ? "versão" : "versões"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma versão anterior disponível.
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Versão {versions.length - index}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(version.created_at),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {version.content.substring(0, 100)}...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmRestore(version.id)}
                      disabled={restoring}
                      className="ml-4"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar versão anterior?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá substituir o conteúdo atual do documento pela versão
              selecionada. O conteúdo atual será salvo como uma nova versão no
              histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVersion && handleRestore(selectedVersion)}
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                "Restaurar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
