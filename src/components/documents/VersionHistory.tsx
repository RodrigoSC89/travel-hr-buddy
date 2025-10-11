import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, RotateCcw, Loader2 } from "lucide-react";

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
}

interface VersionHistoryProps {
  versions: DocumentVersion[];
  onRestore: (versionId: string, content: string) => Promise<void>;
  restoringVersionId: string | null;
}

export function VersionHistory({
  versions,
  onRestore,
  restoringVersionId,
}: VersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma versão anterior encontrada. O histórico é criado quando o documento é editado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Histórico de Versões
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.map((version, index) => (
          <Card key={version.id} className="border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Versão {versions.length - index}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore(version.id, version.content)}
                  disabled={restoringVersionId !== null}
                >
                  {restoringVersionId === version.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurar
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                <p className="whitespace-pre-wrap line-clamp-3">
                  {version.content}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
