/**
import { useState } from "react";;
 * Compliance Settings Dialog Component
 * Dialog para configurações do módulo de conformidade
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Shield, 
  Brain, 
  FileText, 
  Loader2,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ComplianceSettings;
  onSaveSettings: (settings: ComplianceSettings) => Promise<void>;
}

export interface ComplianceSettings {
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    certificateExpiryDays: number;
    auditReminderDays: number;
    findingOverdueDays: number;
  };
  ai: {
    autoAnalysis: boolean;
    predictiveAlerts: boolean;
    aiSuggestions: boolean;
    analysisFrequency: "daily" | "weekly" | "monthly";
  };
  audit: {
    autoGenerateChecklist: boolean;
    requireEvidence: boolean;
    autoCloseFindings: boolean;
    findingAutoEscalation: boolean;
  };
  reports: {
    autoGenerateReports: boolean;
    reportFrequency: "weekly" | "monthly" | "quarterly";
    includeAIAnalysis: boolean;
    emailReports: boolean;
  };
}

const defaultSettings: ComplianceSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    certificateExpiryDays: 30,
    auditReminderDays: 14,
    findingOverdueDays: 7,
  },
  ai: {
    autoAnalysis: true,
    predictiveAlerts: true,
    aiSuggestions: true,
    analysisFrequency: "weekly",
  },
  audit: {
    autoGenerateChecklist: true,
    requireEvidence: true,
    autoCloseFindings: false,
    findingAutoEscalation: true,
  },
  reports: {
    autoGenerateReports: true,
    reportFrequency: "monthly",
    includeAIAnalysis: true,
    emailReports: true,
  },
};

export function SettingsDialog({
  open,
  onOpenChange,
  settings = defaultSettings,
  onSaveSettings,
}: SettingsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<ComplianceSettings>(settings);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaveSettings(currentSettings);
      toast.success("Configurações salvas com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = (key: keyof ComplianceSettings["notifications"], value: unknown: unknown: unknown) => {
    setCurrentSettings({
      ...currentSettings,
      notifications: { ...currentSettings.notifications, [key]: value },
    });
  };

  const updateAI = (key: keyof ComplianceSettings["ai"], value: unknown: unknown: unknown) => {
    setCurrentSettings({
      ...currentSettings,
      ai: { ...currentSettings.ai, [key]: value },
    });
  };

  const updateAudit = (key: keyof ComplianceSettings["audit"], value: unknown: unknown: unknown) => {
    setCurrentSettings({
      ...currentSettings,
      audit: { ...currentSettings.audit, [key]: value },
    });
  };

  const updateReports = (key: keyof ComplianceSettings["reports"], value: unknown: unknown: unknown) => {
    setCurrentSettings({
      ...currentSettings,
      reports: { ...currentSettings.reports, [key]: value },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações de Conformidade
          </DialogTitle>
          <DialogDescription>
            Configure as preferências do módulo de conformidade e IA.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="h-4 w-4 mr-1" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-4 w-4 mr-1" />
              IA
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">
              <Shield className="h-4 w-4 mr-1" />
              Auditorias
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas de conformidade por e-mail
                  </p>
                </div>
                <Switch
                  checked={currentSettings.notifications.emailAlerts}
                  onCheckedChange={(checked) => updateNotifications("emailAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={currentSettings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateNotifications("pushNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Alerta Certificados (dias)</Label>
                  <Input
                    type="number"
                    value={currentSettings.notifications.certificateExpiryDays}
                    onChange={(e) => updateNotifications("certificateExpiryDays", parseInt(e.target.value))}
                    min={1}
                    max={90}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lembrete Auditoria (dias)</Label>
                  <Input
                    type="number"
                    value={currentSettings.notifications.auditReminderDays}
                    onChange={(e) => updateNotifications("auditReminderDays", parseInt(e.target.value))}
                    min={1}
                    max={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Finding Atrasado (dias)</Label>
                  <Input
                    type="number"
                    value={currentSettings.notifications.findingOverdueDays}
                    onChange={(e) => updateNotifications("findingOverdueDays", parseInt(e.target.value))}
                    min={1}
                    max={30}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Análise Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Executar análise de IA automaticamente
                  </p>
                </div>
                <Switch
                  checked={currentSettings.ai.autoAnalysis}
                  onCheckedChange={(checked) => updateAI("autoAnalysis", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas Preditivos</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas baseados em previsões de IA
                  </p>
                </div>
                <Switch
                  checked={currentSettings.ai.predictiveAlerts}
                  onCheckedChange={(checked) => updateAI("predictiveAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sugestões de IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir sugestões inteligentes da IA
                  </p>
                </div>
                <Switch
                  checked={currentSettings.ai.aiSuggestions}
                  onCheckedChange={(checked) => updateAI("aiSuggestions", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Frequência de Análise</Label>
                <div className="flex gap-2">
                  {(["daily", "weekly", "monthly"] as const).map((freq) => (
                    <Button
                      key={freq}
                      type="button"
                      variant={currentSettings.ai.analysisFrequency === freq ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAI("analysisFrequency", freq)}
                    >
                      {freq === "daily" ? "Diária" : freq === "weekly" ? "Semanal" : "Mensal"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gerar Checklist Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Gerar checklist via IA ao criar auditoria
                  </p>
                </div>
                <Switch
                  checked={currentSettings.audit.autoGenerateChecklist}
                  onCheckedChange={(checked) => updateAudit("autoGenerateChecklist", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Exigir Evidências</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir evidências para fechar findings
                  </p>
                </div>
                <Switch
                  checked={currentSettings.audit.requireEvidence}
                  onCheckedChange={(checked) => updateAudit("requireEvidence", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Fechamento Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Fechar findings automaticamente após validação
                  </p>
                </div>
                <Switch
                  checked={currentSettings.audit.autoCloseFindings}
                  onCheckedChange={(checked) => updateAudit("autoCloseFindings", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Escalonamento Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Escalonar findings atrasados automaticamente
                  </p>
                </div>
                <Switch
                  checked={currentSettings.audit.findingAutoEscalation}
                  onCheckedChange={(checked) => updateAudit("findingAutoEscalation", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Gerar relatórios automaticamente
                  </p>
                </div>
                <Switch
                  checked={currentSettings.reports.autoGenerateReports}
                  onCheckedChange={(checked) => updateReports("autoGenerateReports", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Incluir Análise de IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Incluir insights de IA nos relatórios
                  </p>
                </div>
                <Switch
                  checked={currentSettings.reports.includeAIAnalysis}
                  onCheckedChange={(checked) => updateReports("includeAIAnalysis", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enviar por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar relatórios por e-mail automaticamente
                  </p>
                </div>
                <Switch
                  checked={currentSettings.reports.emailReports}
                  onCheckedChange={(checked) => updateReports("emailReports", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Frequência de Relatórios</Label>
                <div className="flex gap-2">
                  {(["weekly", "monthly", "quarterly"] as const).map((freq) => (
                    <Button
                      key={freq}
                      type="button"
                      variant={currentSettings.reports.reportFrequency === freq ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateReports("reportFrequency", freq)}
                    >
                      {freq === "weekly" ? "Semanal" : freq === "monthly" ? "Mensal" : "Trimestral"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
