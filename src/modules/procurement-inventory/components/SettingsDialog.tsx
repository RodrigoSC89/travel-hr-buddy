import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Brain,
  Shield,
  Database,
  Mail,
  Zap,
  Clock,
  Building2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    stockAlerts: true,
    orderUpdates: true,
    aiSuggestions: true,
    
    // AI Settings
    autoRequisitions: true,
    aiPredictions: true,
    autoSupplierSelection: false,
    predictionDays: "30",
    
    // General
    defaultCurrency: "BRL",
    stockAlertThreshold: "20",
    autoApprovalLimit: "5000",
    defaultPaymentTerms: "30",
    
    // Integration
    erpIntegration: false,
    webhooksEnabled: false,
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-2" />
              IA
            </TabsTrigger>
            <TabsTrigger value="general">
              <Package className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Database className="h-4 w-4 mr-2" />
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas importantes por email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, emailNotifications: v }))}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Estoque</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando estoque atingir nível mínimo
                  </p>
                </div>
                <Switch
                  checked={settings.stockAlerts}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, stockAlerts: v }))}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atualizações de Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre status de pedidos
                  </p>
                </div>
                <Switch
                  checked={settings.orderUpdates}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, orderUpdates: v }))}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sugestões da IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber recomendações do assistente IA
                  </p>
                </div>
                <Switch
                  checked={settings.aiSuggestions}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, aiSuggestions: v }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    Requisições Automáticas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    IA cria requisições quando estoque atinge nível crítico
                  </p>
                </div>
                <Switch
                  checked={settings.autoRequisitions}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoRequisitions: v }))}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Previsões Preditivas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Análise preditiva de consumo e demanda
                  </p>
                </div>
                <Switch
                  checked={settings.aiPredictions}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, aiPredictions: v }))}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    Seleção Automática de Fornecedor
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    IA seleciona melhor fornecedor baseado em performance
                  </p>
                </div>
                <Switch
                  checked={settings.autoSupplierSelection}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoSupplierSelection: v }))}
                />
              </div>
              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horizonte de Previsão
                </Label>
                <Select 
                  value={settings.predictionDays}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, predictionDays: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moeda Padrão</Label>
                <Select 
                  value={settings.defaultCurrency}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, defaultCurrency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Limite de Alerta de Estoque (%)</Label>
                <Input
                  type="number"
                  value={settings.stockAlertThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, stockAlertThreshold: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Limite de Aprovação Automática (R$)</Label>
                <Input
                  type="number"
                  value={settings.autoApprovalLimit}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoApprovalLimit: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Prazo de Pagamento Padrão (dias)</Label>
                <Select 
                  value={settings.defaultPaymentTerms}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, defaultPaymentTerms: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">À vista</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="45">45 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Integração ERP</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar dados com sistema ERP externo
                  </p>
                </div>
                <Switch
                  checked={settings.erpIntegration}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, erpIntegration: v }))}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Webhooks</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar notificações via webhook
                  </p>
                </div>
                <Switch
                  checked={settings.webhooksEnabled}
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, webhooksEnabled: v }))}
                />
              </div>
              <Separator />

              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Configure integrações adicionais com APIs externas
                </p>
                <Button variant="outline" className="mt-2">
                  Gerenciar APIs
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
