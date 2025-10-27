import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Play, Pause, Trash2, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AutomationRule {
  id: string;
  rule_name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  actions: any;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
}

export const AutomationRulesBuilder = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    description: "",
    trigger_type: "event",
    trigger_config: {},
    actions: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
    fetchLogs();
  }, []);

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from("automation_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar regras", variant: "destructive" });
      return;
    }

    setRules(data || []);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("automation_logs")
      .select("*")
      .order("executed_at", { ascending: false })
      .limit(10);

    setLogs(data || []);
  };

  const createRule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const { error } = await supabase
      .from("automation_rules")
      .insert({
        ...newRule,
        organization_id: orgData.organization_id,
        created_by: user.id
      });

    if (error) {
      toast({ title: "Erro ao criar regra", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Regra criada com sucesso!" });
    setIsCreating(false);
    fetchRules();
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("automation_rules")
      .update({ is_active: !isActive })
      .eq("id", ruleId);

    if (error) {
      toast({ title: "Erro ao atualizar regra", variant: "destructive" });
      return;
    }

    toast({ title: isActive ? "Regra desativada" : "Regra ativada" });
    fetchRules();
  };

  const executeRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    // Simulate execution
    const startTime = Date.now();
    
    // Log the execution
    const actionsArray = Array.isArray(rule.actions) ? rule.actions : [];
    const { error } = await supabase
      .from("automation_logs")
      .insert({
        rule_id: ruleId,
        status: "success",
        trigger_data: { manual: true },
        actions_executed: actionsArray,
        execution_time_ms: Date.now() - startTime
      });

    // Update execution count
    await supabase
      .from("automation_rules")
      .update({
        execution_count: rule.execution_count + 1,
        last_executed_at: new Date().toISOString()
      })
      .eq("id", ruleId);

    if (error) {
      toast({ title: "Erro ao executar regra", variant: "destructive" });
      return;
    }

    toast({ title: "Regra executada com sucesso!" });
    fetchRules();
    fetchLogs();
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;

    const { error } = await supabase
      .from("automation_rules")
      .delete()
      .eq("id", ruleId);

    if (error) {
      toast({ title: "Erro ao excluir regra", variant: "destructive" });
      return;
    }

    toast({ title: "Regra excluída" });
    fetchRules();
  };

  const getTriggerIcon = (type: string) => {
    const icons: Record<string, any> = {
      event: Zap,
      schedule: Clock,
      webhook: Calendar
    };
    const Icon = icons[type] || Zap;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Regras de Automação</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Zap className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(rule.trigger_type)}
                    <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Trigger</p>
                  <p className="font-medium capitalize">{rule.trigger_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Execuções</p>
                  <p className="font-medium">{rule.execution_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Execução</p>
                  <p className="font-medium">
                    {rule.last_executed_at 
                      ? format(new Date(rule.last_executed_at), "dd/MM/yyyy HH:mm")
                      : "Nunca"
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => executeRule(rule.id)}>
                  <Play className="mr-2 h-3 w-3" />
                  Executar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteRule(rule.id)}>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>
                    {log.status}
                  </Badge>
                  <span className="text-sm">
                    Executado em {format(new Date(log.executed_at), "dd/MM/yyyy HH:mm:ss")}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {log.execution_time_ms}ms
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Regra de Automação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Regra</Label>
              <Input
                value={newRule.rule_name}
                onChange={(e) => setNewRule({...newRule, rule_name: e.target.value})}
                placeholder="Ex: Notificar quando estoque baixo"
              />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea
                value={newRule.description}
                onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                placeholder="Descreva o que esta automação faz"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de Trigger</Label>
              <Select 
                value={newRule.trigger_type} 
                onValueChange={(v) => setNewRule({...newRule, trigger_type: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="schedule">Agendado</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createRule} className="w-full">Criar Regra</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
