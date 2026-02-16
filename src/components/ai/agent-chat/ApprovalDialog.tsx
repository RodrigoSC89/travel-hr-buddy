/**
 * Action approval dialog
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Zap, CheckCircle2, XCircle } from "lucide-react";
import type { AgentAction } from "./types";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: AgentAction | null;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open, onOpenChange, action, onApprove, onReject,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Aprovar Ação</DialogTitle>
        <DialogDescription>Revise os detalhes antes de executar</DialogDescription>
      </DialogHeader>
      {action && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`h-5 w-5 ${
                action.impact === "high" ? "text-destructive"
                  : action.impact === "medium" ? "text-warning"
                  : "text-muted-foreground"
              }`} />
              <span className="font-semibold">{action.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{action.description}</p>
            {action.params && (
              <div className="mt-3 p-2 bg-background rounded text-xs font-mono">
                {JSON.stringify(action.params, null, 2)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={
              action.impact === "high" ? "destructive"
                : action.impact === "medium" ? "default"
                : "secondary"
            }>
              Impacto: {action.impact === "high" ? "Alto" : action.impact === "medium" ? "Médio" : "Baixo"}
            </Badge>
            <Badge variant="outline">{action.type}</Badge>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onReject}>
          <XCircle className="h-4 w-4 mr-2" />Rejeitar
        </Button>
        <Button onClick={onApprove}>
          <CheckCircle2 className="h-4 w-4 mr-2" />Aprovar e Executar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
