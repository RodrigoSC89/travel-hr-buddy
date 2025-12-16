import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wrench, Calendar, Clock, Package, FileText, 
  MoreVertical, Play, Pause, CheckCircle, AlertTriangle,
  Bot, Link2
} from "lucide-react";

export interface MaintenanceJob {
  id: string;
  nome: string;
  equipamento_codigo: string;
  equipamento_nome: string;
  criticidade: "alta" | "media" | "baixa";
  status: "pendente" | "em_andamento" | "concluido" | "postergado";
  prazo: string;
  prazo_dias: number;
  progresso: number;
  tipo: "corretiva" | "preventiva" | "preditiva";
  pecas?: string[];
  os_vinculada?: string;
  anexos?: number;
  sugestao_ia?: string;
  responsavel?: string;
}

interface SmartJobCardProps {
  job: MaintenanceJob;
  onStatusChange?: (jobId: string, newStatus: string) => void;
  onPostpone?: (jobId: string, justificativa: string) => void;
  onOpenOS?: (jobId: string) => void;
}

export const SmartJobCard: React.FC<SmartJobCardProps> = ({
  job,
  onStatusChange,
  onPostpone,
  onOpenOS,
}) => {
  const [showPostponeDialog, setShowPostponeDialog] = useState(false);
  const [postponeReason, setPostponeReason] = useState("");

  const getCriticalityColor = (criticidade: string) => {
    switch (criticidade) {
      case "alta": return "bg-red-500 text-white";
      case "media": return "bg-yellow-500 text-white";
      case "baixa": return "bg-green-500 text-white";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "border-l-yellow-500";
      case "em_andamento": return "border-l-blue-500";
      case "concluido": return "border-l-green-500";
      case "postergado": return "border-l-orange-500";
      default: return "border-l-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "em_andamento": return "Em Andamento";
      case "concluido": return "Concluído";
      case "postergado": return "Postergado";
      default: return status;
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "corretiva": return "🔴";
      case "preventiva": return "🟡";
      case "preditiva": return "🟢";
      default: return "⚪";
    }
  };

  const handlePostpone = () => {
    if (postponeReason.trim() && onPostpone) {
      onPostpone(job.id, postponeReason);
      setShowPostponeDialog(false);
      setPostponeReason("");
    }
  };

  const isUrgent = job.prazo_dias <= 3 && job.status !== "concluido";
  const isOverdue = job.prazo_dias < 0;

  return (
    <>
      <Card className={`border-l-4 ${getStatusColor(job.status)} ${isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="font-semibold">{job.nome}</span>
              <Badge className={getCriticalityColor(job.criticidade)}>
                {job.criticidade}
              </Badge>
              <span className="text-xs">{getTypeIcon(job.tipo)}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {job.status === "pendente" && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(job.id, "em_andamento")}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </DropdownMenuItem>
                )}
                {job.status === "em_andamento" && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange?.(job.id, "concluido")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Concluir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.(job.id, "pendente")}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowPostponeDialog(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Postergar
                </DropdownMenuItem>
                {!job.os_vinculada && (
                  <DropdownMenuItem onClick={() => onOpenOS?.(job.id)}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Abrir OS
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Equipment Info */}
          <div className="text-sm text-muted-foreground mb-3">
            <span>📍 {job.equipamento_codigo} – {job.equipamento_nome}</span>
          </div>

          {/* Status Row */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isOverdue ? "text-red-500 font-medium" : isUrgent ? "text-yellow-500" : ""}>
                {isOverdue ? "Vencido" : `${job.prazo_dias} dias restantes`}
              </span>
            </div>
            <Badge variant="outline">{getStatusLabel(job.status)}</Badge>
            {job.responsavel && (
              <span className="text-muted-foreground">👤 {job.responsavel}</span>
            )}
          </div>

          {/* Progress */}
          {job.status === "em_andamento" && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progresso</span>
                <span>{job.progresso}%</span>
              </div>
              <Progress value={job.progresso} className="h-2" />
            </div>
          )}

          {/* AI Suggestion */}
          {job.sugestao_ia && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mb-3 flex items-start gap-2">
              <Bot className="h-4 w-4 text-primary mt-0.5" />
              <span className="text-xs">{job.sugestao_ia}</span>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {job.pecas && job.pecas.length > 0 && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>{job.pecas.length} peça(s)</span>
                </div>
              )}
              {job.anexos && job.anexos > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{job.anexos} anexo(s)</span>
                </div>
              )}
            </div>
            {job.os_vinculada && (
              <Badge variant="secondary" className="text-xs">
                <Link2 className="h-3 w-3 mr-1" />
                OS #{job.os_vinculada}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Postpone Dialog */}
      <Dialog open={showPostponeDialog} onOpenChange={setShowPostponeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postergar Job</DialogTitle>
            <DialogDescription>
              Informe a justificativa para postergar "{job.nome}". 
              A IA irá avaliar o risco desta ação.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ex: Aguardando chegada de peças de reposição..."
            value={postponeReason}
            onChange={(e) => setPostponeReason(e.target.value)}
            rows={4}
          />
          {isUrgent && (
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Este job está próximo do vencimento. Considere os riscos.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostponeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePostpone} disabled={!postponeReason.trim()}>
              Confirmar Postergação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
