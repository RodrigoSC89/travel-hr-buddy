/**
 * ContractAlertsCard - Sistema de Alertas Automatizados
 * Notificações via WhatsApp, Email e Telegram para SLA, vencimentos e não-conformidades
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Bell, MessageCircle, Mail, Send, Settings, Plus,
  AlertTriangle, CheckCircle, Clock, Trash2, Edit,
  Phone, Zap, Filter, RefreshCw, History
} from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  type: 'sla_breach' | 'contract_expiry' | 'downtime_critical' | 'maintenance_due' | 'custom';
  condition: string;
  channels: ('whatsapp' | 'email' | 'telegram' | 'sms')[];
  recipients: string[];
  enabled: boolean;
  threshold?: number;
  advance_days?: number;
}

interface AlertLog {
  id: string;
  rule_name: string;
  channel: string;
  recipient: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
}

export function ContractAlertsCard() {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'SLA Crítico',
      type: 'sla_breach',
      condition: 'SLA abaixo de 95%',
      channels: ['whatsapp', 'email'],
      recipients: ['ops@company.com', '+5511999999999'],
      enabled: true,
      threshold: 95
    },
    {
      id: '2',
      name: 'Vencimento de Contrato',
      type: 'contract_expiry',
      condition: '30 dias antes do vencimento',
      channels: ['email'],
      recipients: ['contracts@company.com'],
      enabled: true,
      advance_days: 30
    },
    {
      id: '3',
      name: 'Downtime Crítico',
      type: 'downtime_critical',
      condition: 'Qualquer downtime crítico',
      channels: ['whatsapp', 'telegram', 'sms'],
      recipients: ['+5511999999999'],
      enabled: true
    }
  ]);

  const [logs, setLogs] = useState<AlertLog[]>([
    {
      id: '1',
      rule_name: 'SLA Crítico',
      channel: 'whatsapp',
      recipient: '+5511999999999',
      message: '⚠️ ALERTA: SLA do contrato CNT-2024-001 atingiu 93.5%',
      sent_at: new Date().toISOString(),
      status: 'sent'
    }
  ]);

  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    type: 'sla_breach',
    channels: [],
    recipients: [],
    enabled: true
  });

  const toggleChannel = (channel: 'whatsapp' | 'email' | 'telegram' | 'sms') => {
    setNewRule(prev => ({
      ...prev,
      channels: prev.channels?.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...(prev.channels || []), channel]
    }));
  };

  const createRule = () => {
    if (!newRule.name) {
      toast.error('Preencha o nome da regra');
      return;
    }

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name,
      type: newRule.type as AlertRule['type'],
      condition: getConditionText(newRule.type as AlertRule['type'], newRule.threshold, newRule.advance_days),
      channels: newRule.channels as AlertRule['channels'],
      recipients: newRule.recipients || [],
      enabled: true,
      threshold: newRule.threshold,
      advance_days: newRule.advance_days
    };

    setRules(prev => [...prev, rule]);
    setShowNewRule(false);
    setNewRule({ name: '', type: 'sla_breach', channels: [], recipients: [], enabled: true });
    toast.success('Regra de alerta criada!');
  };

  const getConditionText = (type: string, threshold?: number, days?: number) => {
    switch (type) {
      case 'sla_breach': return `SLA abaixo de ${threshold || 95}%`;
      case 'contract_expiry': return `${days || 30} dias antes do vencimento`;
      case 'downtime_critical': return 'Qualquer downtime crítico';
      case 'maintenance_due': return `Manutenção pendente há ${days || 7} dias`;
      default: return 'Condição personalizada';
    }
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    toast.success('Regra atualizada');
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success('Regra removida');
  };

  const testAlert = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    toast.loading('Enviando alerta de teste...');
    
    try {
      const { error } = await supabase.functions.invoke('contract-send-alert', {
        body: { 
          ruleId,
          test: true,
          channels: rule.channels,
          recipients: rule.recipients,
          message: `🔔 TESTE: ${rule.name}`
        }
      });

      if (error) throw error;

      setLogs(prev => [{
        id: Date.now().toString(),
        rule_name: rule.name + ' (TESTE)',
        channel: rule.channels[0],
        recipient: rule.recipients[0],
        message: `🔔 TESTE: ${rule.name}`,
        sent_at: new Date().toISOString(),
        status: 'sent'
      }, ...prev]);

      toast.dismiss();
      toast.success('Alerta de teste enviado!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao enviar alerta');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'telegram': return <Send className="h-4 w-4 text-sky-500" />;
      case 'sms': return <Phone className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Automação de Alertas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Notificações automáticas via WhatsApp, Email, Telegram e SMS
              </p>
            </div>
          </div>
          <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Regra de Alerta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Regra</Label>
                  <Input 
                    placeholder="Ex: Alerta SLA Crítico"
                    value={newRule.name}
                    onChange={e => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Alerta</Label>
                  <Select 
                    value={newRule.type} 
                    onValueChange={v => setNewRule(prev => ({ ...prev, type: v as AlertRule['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sla_breach">Violação de SLA</SelectItem>
                      <SelectItem value="contract_expiry">Vencimento de Contrato</SelectItem>
                      <SelectItem value="downtime_critical">Downtime Crítico</SelectItem>
                      <SelectItem value="maintenance_due">Manutenção Pendente</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newRule.type === 'sla_breach') && (
                  <div className="space-y-2">
                    <Label>Threshold SLA (%)</Label>
                    <Input 
                      type="number"
                      placeholder="95"
                      value={newRule.threshold || ''}
                      onChange={e => setNewRule(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                    />
                  </div>
                )}

                {(newRule.type === 'contract_expiry' || newRule.type === 'maintenance_due') && (
                  <div className="space-y-2">
                    <Label>Dias de Antecedência</Label>
                    <Input 
                      type="number"
                      placeholder="30"
                      value={newRule.advance_days || ''}
                      onChange={e => setNewRule(prev => ({ ...prev, advance_days: parseInt(e.target.value) }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Canais de Notificação</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['whatsapp', 'email', 'telegram', 'sms'] as const).map(channel => (
                      <Button
                        key={channel}
                        type="button"
                        variant={newRule.channels?.includes(channel) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleChannel(channel)}
                      >
                        {getChannelIcon(channel)}
                        <span className="ml-1 capitalize">{channel}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destinatários (separados por vírgula)</Label>
                  <Input 
                    placeholder="email@empresa.com, +5511999999999"
                    onChange={e => setNewRule(prev => ({ 
                      ...prev, 
                      recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <Button className="w-full" onClick={createRule}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Criar Regra
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="mb-4">
            <TabsTrigger value="rules" className="gap-1">
              <Settings className="h-4 w-4" />
              Regras ({rules.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1">
              <History className="h-4 w-4" />
              Histórico ({logs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {rules.map(rule => (
                  <div 
                    key={rule.id}
                    className={`p-4 rounded-lg border ${rule.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bell className={`h-4 w-4 ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{rule.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {rule.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{rule.condition}</p>

                    <div className="flex items-center gap-2 mb-3">
                      {rule.channels.map(ch => (
                        <div key={ch} className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs">
                          {getChannelIcon(ch)}
                          <span className="capitalize">{ch}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {rule.recipients.length} destinatário(s)
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => testAlert(rule.id)}>
                          <Zap className="h-4 w-4 mr-1" />
                          Testar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    {getChannelIcon(log.channel)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.rule_name}</span>
                        <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
                          {log.status === 'sent' ? 'Enviado' : 'Falhou'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{log.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.sent_at).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
