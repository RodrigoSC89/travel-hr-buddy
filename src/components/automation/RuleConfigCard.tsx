/**
 * Rule Configuration Card - Interactive automation rule management
 */
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Settings, Play, Pause, Edit, Trash2, Clock, Zap, Calendar } from "lucide-react";

interface AutomationRule {
  id: string;
  rule_name: string;
  description?: string | null;
  trigger_type: string;
  is_active: boolean;
  execution_count?: number;
  last_executed_at?: string | null;
  conditions?: unknown;
  actions?: unknown;
}

interface RuleConfigCardProps {
  rule: AutomationRule;
  onToggle: () => void;
  onSave: (updates: Partial<AutomationRule>) => void;
  onDelete?: () => void;
}

export const RuleConfigCard: React.FC<RuleConfigCardProps> = ({
  rule,
  onToggle,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    rule_name: rule.rule_name,
    description: rule.description || "",
    trigger_type: rule.trigger_type
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500)); // Simulate API call
    onSave(editData);
    setIsEditing(false);
    setIsSaving(false);
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "schedule": return <Clock className="h-4 w-4" />;
      case "event": return <Zap className="h-4 w-4" />;
      case "recurring": return <Calendar className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getTriggerIcon(rule.trigger_type)}
            <h4 className="font-medium">{rule.rule_name}</h4>
            <Badge variant="outline">{rule.trigger_type}</Badge>
            <Badge className={rule.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}>
              {rule.is_active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rule.description || "Sem descrição"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Execuções: {rule.execution_count || 0} | 
            Última: {rule.last_executed_at ? new Date(rule.last_executed_at).toLocaleString() : "Nunca"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={rule.is_active ? "destructive" : "default"} 
            onClick={onToggle}
          >
            {rule.is_active ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {rule.is_active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Regra de Automação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome da Regra</label>
              <Input 
                value={editData.rule_name}
                onChange={(e) => setEditData(prev => ({ ...prev, rule_name: e.target.value }))}
                placeholder="Nome da regra"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea 
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que esta regra faz"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Gatilho</label>
              <Select value={editData.trigger_type} onValueChange={(v) => setEditData(prev => ({ ...prev, trigger_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schedule">Agendamento</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="recurring">Recorrente</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
