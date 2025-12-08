/**
 * Settings Panel - Configurações do Safety Guardian
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Brain, 
  Shield, 
  Save,
  Target,
  Clock,
  Mail,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import type { SafetySettings } from '../types';

interface SettingsPanelProps {
  settings: SafetySettings;
  onSave: (settings: SafetySettings) => Promise<void>;
  loading?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings: initialSettings,
  onSave,
  loading
}) => {
  const [settings, setSettings] = useState<SafetySettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const parts = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações
          </h2>
          <p className="text-muted-foreground">
            Personalize o módulo Safety Guardian
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Mail className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Metas de Segurança
              </CardTitle>
              <CardDescription>
                Defina as metas e indicadores de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lti-goal">Meta de Dias sem LTI</Label>
                  <Input
                    id="lti-goal"
                    type="number"
                    min={1}
                    value={settings.ltiGoal}
                    onChange={(e) => updateSettings('ltiGoal', parseInt(e.target.value) || 365)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta de dias consecutivos sem acidentes com afastamento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trir-target">Meta TRIR</Label>
                  <Input
                    id="trir-target"
                    type="number"
                    step={0.01}
                    min={0}
                    value={settings.trirTarget}
                    onChange={(e) => updateSettings('trirTarget', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Taxa de Incidentes Registráveis Total (por 200.000 horas)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>DDS Obrigatório Diário</Label>
                  <p className="text-xs text-muted-foreground">
                    Exigir registro de DDS todos os dias
                  </p>
                </div>
                <Switch
                  checked={settings.ddsRequiredDaily}
                  onCheckedChange={(checked) => updateSettings('ddsRequiredDaily', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Thresholds de Alertas
              </CardTitle>
              <CardDescription>
                Configure quando os alertas automáticos devem ser disparados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cert-expiry">Vencimento de Certificação (dias)</Label>
                  <Input
                    id="cert-expiry"
                    type="number"
                    min={1}
                    value={settings.autoAlertThresholds.certification_expiry_days}
                    onChange={(e) => updateSettings(
                      'autoAlertThresholds.certification_expiry_days', 
                      parseInt(e.target.value) || 30
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alertar X dias antes do vencimento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-overdue">Treinamento Atrasado (dias)</Label>
                  <Input
                    id="training-overdue"
                    type="number"
                    min={1}
                    value={settings.autoAlertThresholds.training_overdue_days}
                    onChange={(e) => updateSettings(
                      'autoAlertThresholds.training_overdue_days',
                      parseInt(e.target.value) || 7
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alertar após X dias de atraso
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident-escalation">Escalação de Incidente (horas)</Label>
                  <Input
                    id="incident-escalation"
                    type="number"
                    min={1}
                    value={settings.autoAlertThresholds.incident_escalation_hours}
                    onChange={(e) => updateSettings(
                      'autoAlertThresholds.incident_escalation_hours',
                      parseInt(e.target.value) || 24
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Escalar incidente após X horas sem ação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Escolha como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber alertas e resumos por e-mail
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notificationPreferences.email}
                  onCheckedChange={(checked) => updateSettings('notificationPreferences.email', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber notificações push no navegador/app
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notificationPreferences.push}
                  onCheckedChange={(checked) => updateSettings('notificationPreferences.push', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label>Notificações SMS</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber alertas críticos por SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notificationPreferences.sms}
                  onCheckedChange={(checked) => updateSettings('notificationPreferences.sms', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Configurações de IA
              </CardTitle>
              <CardDescription>
                Configure as funcionalidades de Inteligência Artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <Label>Análise Preditiva</Label>
                    <p className="text-xs text-muted-foreground">
                      IA analisa padrões para prever riscos
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.aiSettings.predictiveAnalysisEnabled}
                  onCheckedChange={(checked) => updateSettings('aiSettings.predictiveAnalysisEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <Label>Recomendações Automáticas</Label>
                    <p className="text-xs text-muted-foreground">
                      IA sugere ações corretivas automaticamente
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.aiSettings.autoRecommendationsEnabled}
                  onCheckedChange={(checked) => updateSettings('aiSettings.autoRecommendationsEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <Label>Avaliação de Risco por IA</Label>
                    <p className="text-xs text-muted-foreground">
                      IA avalia automaticamente o nível de risco de incidentes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.aiSettings.riskAssessmentEnabled}
                  onCheckedChange={(checked) => updateSettings('aiSettings.riskAssessmentEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h4 className="font-medium text-purple-400 mb-2">Sobre a IA do Safety Guardian</h4>
                <p className="text-sm text-muted-foreground">
                  A IA utiliza modelos avançados de machine learning para analisar padrões de incidentes,
                  prever riscos e sugerir ações preventivas. Os modelos são treinados continuamente com
                  dados do setor marítimo para fornecer insights cada vez mais precisos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
