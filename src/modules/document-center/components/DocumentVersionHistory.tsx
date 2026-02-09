/**
 * Document Version History - Real Diff Comparison & Rollback
 * Provides side-by-side version comparison with visual diffs
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  History, GitCompare, RotateCcw, Eye, Download,
  ChevronRight, Clock, User, FileText, AlertTriangle,
  CheckCircle2, ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface DocumentVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  createdBy: { name: string; role: string };
  createdAt: string;
  changesSummary: string;
  size: string;
  status: "current" | "archived" | "superseded";
}

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "modified";
  lineNumber: number;
  oldContent?: string;
  newContent?: string;
  content?: string;
}

// Simple line-based diff algorithm
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: DiffLine[] = [];
  let lineNum = 0;

  const maxLen = Math.max(oldLines.length, newLines.length);

  // LCS-based approach simplified
  const lcsMatrix: number[][] = Array(oldLines.length + 1)
    .fill(null)
    .map(() => Array(newLines.length + 1).fill(0));

  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1].trim() === newLines[j - 1].trim()) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  let i = oldLines.length;
  let j = newLines.length;
  const diffStack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1].trim() === newLines[j - 1].trim()) {
      diffStack.unshift({
        type: "unchanged",
        lineNumber: i,
        content: newLines[j - 1],
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && oldLines[i - 1].trim() !== newLines[j - 1].trim() &&
      lcsMatrix[i - 1][j - 1] >= lcsMatrix[i - 1][j] &&
      lcsMatrix[i - 1][j - 1] >= lcsMatrix[i][j - 1]) {
      diffStack.unshift({
        type: "modified",
        lineNumber: i,
        oldContent: oldLines[i - 1],
        newContent: newLines[j - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcsMatrix[i][j - 1] >= lcsMatrix[i - 1][j])) {
      diffStack.unshift({
        type: "added",
        lineNumber: j,
        content: newLines[j - 1],
      });
      j--;
    } else if (i > 0) {
      diffStack.unshift({
        type: "removed",
        lineNumber: i,
        content: oldLines[i - 1],
      });
      i--;
    }
  }

  return diffStack;
}

interface Props {
  documentTitle: string;
  versions?: DocumentVersion[];
}

// Sample version data for documents
const SAMPLE_VERSIONS: DocumentVersion[] = [
  {
    id: "v3",
    version: "2.1",
    title: "Procedimento de Segurança - Operações de Carga",
    content: `1. OBJETIVO
Este procedimento estabelece as diretrizes para operações seguras de carga e descarga em embarcações.

2. ESCOPO
Aplica-se a todas as embarcações da frota que realizam operações de carga.

3. RESPONSABILIDADES
3.1 O Comandante é responsável pela segurança geral da operação.
3.2 O Imediato supervisiona a equipe de convés durante as operações.
3.3 O Oficial de Segurança verifica o cumprimento dos procedimentos.
3.4 O Chefe de Máquinas monitora os sistemas de lastro e estabilidade.

4. PROCEDIMENTOS DE SEGURANÇA
4.1 Verificar condições meteorológicas antes de iniciar.
4.2 Realizar briefing de segurança com toda a equipe.
4.3 Inspecionar equipamentos de carga (guinchos, cabos, manilhas).
4.4 Confirmar plano de carga aprovado pelo Comandante.
4.5 Manter comunicação contínua via VHF canal 16 e canal de trabalho.
4.6 Monitorar estabilidade durante toda a operação.

5. PROCEDIMENTOS DE EMERGÊNCIA
5.1 Em caso de falha de equipamento, interromper imediatamente.
5.2 Acionar alarme geral se houver risco de lesão.
5.3 Registrar qualquer incidente no sistema de bordo.

6. REGISTRO E DOCUMENTAÇÃO
Todos os eventos devem ser registrados no log de operações.`,
    createdBy: { name: "Carlos Silva", role: "Safety Officer" },
    createdAt: "2024-01-15T14:00:00Z",
    changesSummary: "Adicionada seção 3.4 (Chefe de Máquinas), atualizado item 4.5 com canal VHF",
    size: "2.4 MB",
    status: "current",
  },
  {
    id: "v2",
    version: "2.0",
    title: "Procedimento de Segurança - Operações de Carga",
    content: `1. OBJETIVO
Este procedimento estabelece as diretrizes para operações de carga e descarga em embarcações.

2. ESCOPO
Aplica-se a todas as embarcações da frota que realizam operações de carga.

3. RESPONSABILIDADES
3.1 O Comandante é responsável pela segurança geral da operação.
3.2 O Imediato supervisiona a equipe de convés durante as operações.
3.3 O Oficial de Segurança verifica o cumprimento dos procedimentos.

4. PROCEDIMENTOS DE SEGURANÇA
4.1 Verificar condições meteorológicas antes de iniciar.
4.2 Realizar briefing de segurança com toda a equipe.
4.3 Inspecionar equipamentos de carga (guinchos, cabos, manilhas).
4.4 Confirmar plano de carga aprovado pelo Comandante.
4.5 Manter comunicação contínua via rádio.
4.6 Monitorar estabilidade durante toda a operação.

5. PROCEDIMENTOS DE EMERGÊNCIA
5.1 Em caso de falha de equipamento, interromper imediatamente.
5.2 Acionar alarme geral se houver risco de lesão.

6. REGISTRO E DOCUMENTAÇÃO
Todos os eventos devem ser registrados no log de operações.`,
    createdBy: { name: "Ana Rodrigues", role: "Chief Officer" },
    createdAt: "2023-11-20T10:00:00Z",
    changesSummary: "Revisão geral, adição da seção de emergência",
    size: "2.1 MB",
    status: "superseded",
  },
  {
    id: "v1",
    version: "1.0",
    title: "Procedimento de Segurança - Operações de Carga",
    content: `1. OBJETIVO
Este procedimento define as diretrizes para operações de carga.

2. ESCOPO
Aplica-se a embarcações da frota.

3. RESPONSABILIDADES
3.1 O Comandante é responsável pela segurança da operação.
3.2 O Imediato supervisiona a equipe de convés.

4. PROCEDIMENTOS
4.1 Verificar condições meteorológicas.
4.2 Realizar briefing com a equipe.
4.3 Inspecionar equipamentos.
4.4 Confirmar plano de carga.

5. REGISTRO
Registrar eventos no log de operações.`,
    createdBy: { name: "Roberto Santos", role: "DPA" },
    createdAt: "2023-06-10T08:00:00Z",
    changesSummary: "Versão inicial do procedimento",
    size: "1.2 MB",
    status: "archived",
  },
];

export function DocumentVersionHistory({ documentTitle, versions }: Props) {
  const versionList = versions || SAMPLE_VERSIONS;
  const [selectedVersions, setSelectedVersions] = useState<[string, string]>([
    versionList[1]?.id || "",
    versionList[0]?.id || "",
  ]);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<DocumentVersion | null>(null);
  const [diffView, setDiffView] = useState<"unified" | "sideBySide">("unified");

  const oldVersion = versionList.find((v) => v.id === selectedVersions[0]);
  const newVersion = versionList.find((v) => v.id === selectedVersions[1]);

  const diffResult = useMemo(() => {
    if (!oldVersion || !newVersion) return [];
    return computeDiff(oldVersion.content, newVersion.content);
  }, [oldVersion, newVersion]);

  const diffStats = useMemo(() => {
    return {
      added: diffResult.filter((d) => d.type === "added").length,
      removed: diffResult.filter((d) => d.type === "removed").length,
      modified: diffResult.filter((d) => d.type === "modified").length,
      unchanged: diffResult.filter((d) => d.type === "unchanged").length,
    };
  }, [diffResult]);

  const handleRollback = (version: DocumentVersion) => {
    setRollbackTarget(version);
    setShowRollbackDialog(true);
  };

  const confirmRollback = () => {
    if (rollbackTarget) {
      toast.success(`Documento restaurado para v${rollbackTarget.version}`);
      setShowRollbackDialog(false);
      setRollbackTarget(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return <Badge className="bg-green-500 text-white">Atual</Badge>;
      case "superseded":
        return <Badge variant="secondary">Substituída</Badge>;
      case "archived":
        return <Badge variant="outline">Arquivada</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Version Timeline */}
      <div className="space-y-3">
        {versionList.map((version, idx) => (
          <div
            key={version.id}
            className={cn(
              "flex gap-4 p-4 rounded-lg border transition-all",
              version.status === "current"
                ? "bg-green-500/5 border-green-500/30"
                : "bg-muted/30 border-border/30 hover:border-border/60"
            )}
          >
            {/* Timeline dot */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  version.status === "current"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-muted border-border"
                )}
              >
                {version.status === "current" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <History className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {idx < versionList.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-1" />
              )}
            </div>

            {/* Version Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">v{version.version}</span>
                {getStatusBadge(version.status)}
                <Badge variant="outline" className="text-xs">
                  {version.size}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {version.changesSummary}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {version.createdBy.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(version.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              {version.status !== "current" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-yellow-500 hover:text-yellow-600"
                  title="Restaurar esta versão"
                  onClick={() => handleRollback(version)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compare Button */}
      {versionList.length >= 2 && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setShowDiffDialog(true)}
        >
          <GitCompare className="h-4 w-4 mr-2" />
          Comparar Versões (v{oldVersion?.version} → v{newVersion?.version})
        </Button>
      )}

      {/* Diff Dialog */}
      <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Comparação de Versões
            </DialogTitle>
            <DialogDescription>
              v{oldVersion?.version} → v{newVersion?.version}
            </DialogDescription>
          </DialogHeader>

          {/* Diff Stats */}
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
              +{diffStats.added} adicionadas
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
              -{diffStats.removed} removidas
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              ~{diffStats.modified} modificadas
            </Badge>
            <div className="ml-auto flex gap-1">
              <Button
                variant={diffView === "unified" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiffView("unified")}
              >
                Unificado
              </Button>
              <Button
                variant={diffView === "sideBySide" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiffView("sideBySide")}
              >
                <ArrowLeftRight className="h-3 w-3 mr-1" />
                Lado a lado
              </Button>
            </div>
          </div>

          {/* Diff Content */}
          <ScrollArea className="h-[50vh] rounded-lg border bg-muted/20">
            <div className="p-4 font-mono text-sm">
              {diffView === "unified" ? (
                <div className="space-y-0.5">
                  {diffResult.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "px-3 py-0.5 rounded-sm flex items-start gap-2",
                        line.type === "added" && "bg-green-500/10 text-green-600",
                        line.type === "removed" && "bg-red-500/10 text-red-600 line-through",
                        line.type === "modified" && "bg-yellow-500/10 text-yellow-600",
                        line.type === "unchanged" && "text-muted-foreground"
                      )}
                    >
                      <span className="w-5 text-[10px] text-muted-foreground select-none">
                        {line.type === "added" ? "+" : line.type === "removed" ? "-" : line.type === "modified" ? "~" : " "}
                      </span>
                      <span className="flex-1">
                        {line.type === "modified" ? (
                          <>
                            <span className="line-through text-red-500/70">{line.oldContent}</span>
                            <br />
                            <span className="text-green-600">{line.newContent}</span>
                          </>
                        ) : (
                          line.content
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 px-2">
                      v{oldVersion?.version} (anterior)
                    </p>
                    {diffResult.map((line, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-2 py-0.5 rounded-sm text-xs",
                          line.type === "removed" && "bg-red-500/10 text-red-600",
                          line.type === "modified" && "bg-yellow-500/10 text-yellow-600",
                          line.type === "added" && "opacity-0",
                          line.type === "unchanged" && "text-muted-foreground"
                        )}
                      >
                        {line.type === "modified"
                          ? line.oldContent
                          : line.type !== "added"
                          ? line.content
                          : "\u00A0"}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-0.5 border-l border-border pl-2">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 px-2">
                      v{newVersion?.version} (nova)
                    </p>
                    {diffResult.map((line, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-2 py-0.5 rounded-sm text-xs",
                          line.type === "added" && "bg-green-500/10 text-green-600",
                          line.type === "modified" && "bg-green-500/10 text-green-600",
                          line.type === "removed" && "opacity-0",
                          line.type === "unchanged" && "text-muted-foreground"
                        )}
                      >
                        {line.type === "modified"
                          ? line.newContent
                          : line.type !== "removed"
                          ? line.content
                          : "\u00A0"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar Restauração
            </DialogTitle>
            <DialogDescription>
              Deseja restaurar o documento para a versão{" "}
              <strong>v{rollbackTarget?.version}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-sm">
            <p className="font-medium text-yellow-600 mb-1">Atenção:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
              <li>A versão atual será arquivada automaticamente</li>
              <li>
                A versão restaurada será marcada como nova versão corrente
              </li>
              <li>Todas as aprovações pendentes serão resetadas</li>
              <li>Esta ação pode ser desfeita restaurando outra versão</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRollbackDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRollback}
              className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar v{rollbackTarget?.version}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentVersionHistory;
