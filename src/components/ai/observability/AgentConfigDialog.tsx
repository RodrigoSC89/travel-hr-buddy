/**
 * Agent Configuration Dialog for AI Observability Dashboard
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { AIAgent } from "@/hooks/useAIObservabilityData";

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agent: AIAgent | null;
  onSave: () => void;
}

export const AgentConfigDialog: React.FC<AgentConfigDialogProps> = ({ open, onOpenChange, agent, onSave }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Configurar Agente</DialogTitle>
        <DialogDescription>{agent?.name}</DialogDescription>
      </DialogHeader>
      {agent && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Modelo</Label>
              <Select defaultValue={agent.model}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                  <SelectItem value="Claude-3">Claude-3</SelectItem>
                  <SelectItem value="Gemini-Pro">Gemini-Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select defaultValue="normal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-restart em erro</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Notificações de erro</Label>
            <Switch defaultChecked />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={onSave}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
