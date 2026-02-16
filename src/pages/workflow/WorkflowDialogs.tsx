import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GitBranch, Play, ArrowRight } from "lucide-react";
import type { VisualWorkflow, WorkflowNode } from "./types";
import { getNodeStatusColor, getNodeIcon } from "./types";

interface NewWorkflowDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: { name: string; description: string; category: string; priority: string };
  onChange: (data: { name: string; description: string; category: string; priority: string }) => void;
  onCreate: () => void;
}

export const NewWorkflowDialog: React.FC<NewWorkflowDialogProps> = ({ open, onOpenChange, data, onChange, onCreate }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo Workflow</DialogTitle>
        <DialogDescription>Crie um novo fluxo de trabalho</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Input placeholder="Nome do workflow" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} />
        <Textarea placeholder="Descrição" value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Select value={data.category} onValueChange={(v) => onChange({ ...data, category: v })}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hr">RH</SelectItem>
              <SelectItem value="finance">Financeiro</SelectItem>
              <SelectItem value="operations">Operações</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={data.priority} onValueChange={(v) => onChange({ ...data, priority: v })}>
            <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={onCreate}>Criar Workflow</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface DetailsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workflow: any | null;
}

export const WorkflowDetailsDialog: React.FC<DetailsDialogProps> = ({ open, onOpenChange, workflow }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{workflow?.name}</DialogTitle>
        <DialogDescription>{workflow?.description}</DialogDescription>
      </DialogHeader>
      {workflow && (
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Badge>{workflow.category}</Badge>
            <Badge variant="outline">{workflow.status}</Badge>
            <Badge variant="outline">{workflow.priority}</Badge>
          </div>
          <Progress value={workflow.progress} className="h-3" />
          <p className="text-sm text-muted-foreground">Progresso: {workflow.progress}%</p>
          <div className="border rounded-lg p-4 max-h-60 overflow-auto space-y-2">
            {workflow.steps?.map((step: { name: string; status: string }) => (
              <div key={step.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>{step.name}</span>
                <Badge variant="outline">{step.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface VisualWorkflowDialogProps {
  workflow: VisualWorkflow | null;
  onClose: () => void;
}

export const VisualWorkflowDialog: React.FC<VisualWorkflowDialogProps> = ({ workflow, onClose }) => (
  <Dialog open={!!workflow} onOpenChange={() => onClose()}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          {workflow?.name}
        </DialogTitle>
        <DialogDescription>Visualização detalhada do fluxo de trabalho</DialogDescription>
      </DialogHeader>
      {workflow && (
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={workflow.status === "running" ? "default" : "secondary"}>
              {workflow.status === "running" ? "Em Execução" : "Concluído"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {workflow.executions} execuções
            </span>
          </div>

          <div className="border rounded-lg p-6 bg-muted/30">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {workflow.nodes.map((node: WorkflowNode, i: number) => (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getNodeStatusColor(node.status)} text-white`}>
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="text-xs text-center max-w-[100px]">{node.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {node.status === "completed" ? "Concluído" :
                       node.status === "running" ? "Executando" : "Pendente"}
                    </Badge>
                  </div>
                  {i < workflow.nodes.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{workflow.nodes.length}</p>
              <p className="text-xs text-muted-foreground">Etapas</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {workflow.nodes.filter((n) => n.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {Math.round((workflow.nodes.filter((n) => n.status === "completed").length / workflow.nodes.length) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Progresso</p>
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Executar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
