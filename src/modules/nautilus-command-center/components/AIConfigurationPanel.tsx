/**
 * AI Configuration Panel - PATCH 852
 * Panel to configure AI thresholds and learning parameters
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Brain, 
  Shield, 
  Zap, 
  Bell,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useAIDecisionsSupabase } from '@/hooks/useAIDecisionsSupabase';
import { useToast } from '@/hooks/use-toast';

interface ConfidenceThresholds {
  high: number;
  medium: number;
  auto_approve: number;
}

interface LearningParameters {
  learning_rate: number;
  decay_factor: number;
  min_samples: number;
}

interface DecisionLimits {
  max_pending: number;
  max_auto_per_hour: number;
  cooldown_minutes: number;
}

interface AutonomyLevel {
  level: 'manual' | 'supervised' | 'autonomous';
  allowed_types: string[];
}

export function AIConfigurationPanel() {
  const { configurations, updateConfiguration, loading } = useAIDecisionsSupabase();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local state for configurations
  const [confidenceThresholds, setConfidenceThresholds] = useState<ConfidenceThresholds>({
    high: 85,
    medium: 60,
    auto_approve: 90
  });

  const [learningParams, setLearningParams] = useState<LearningParameters>({
    learning_rate: 0.1,
    decay_factor: 0.95,
    min_samples: 10
  });

  const [decisionLimits, setDecisionLimits] = useState<DecisionLimits>({
    max_pending: 50,
    max_auto_per_hour: 10,
    cooldown_minutes: 5
  });

  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>({
    level: 'supervised',
    allowed_types: ['optimization', 'prevention']
  });

  const [notifications, setNotifications] = useState({
    sound_enabled: true,
    browser_notifications: true,
    critical_only: false
  });

  // Load configurations from Supabase
  useEffect(() => {
    if (configurations.length > 0) {
      const confidenceConfig = configurations.find(c => c.config_key === 'confidence_thresholds');
      if (confidenceConfig) {
        setConfidenceThresholds(confidenceConfig.config_value as unknown as ConfidenceThresholds);
      }

      const learningConfig = configurations.find(c => c.config_key === 'learning_parameters');
      if (learningConfig) {
        setLearningParams(learningConfig.config_value as unknown as LearningParameters);
      }

      const limitsConfig = configurations.find(c => c.config_key === 'decision_limits');
      if (limitsConfig) {
        setDecisionLimits(limitsConfig.config_value as unknown as DecisionLimits);
      }

      const autonomyConfig = configurations.find(c => c.config_key === 'autonomy_level');
      if (autonomyConfig) {
        setAutonomyLevel(autonomyConfig.config_value as unknown as AutonomyLevel);
      }

      const notifConfig = configurations.find(c => c.config_key === 'notification_settings');
      if (notifConfig) {
        setNotifications(notifConfig.config_value as unknown as typeof notifications);
      }
    }
  }, [configurations]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateConfiguration('confidence_thresholds', confidenceThresholds as unknown as Record<string, unknown>),
        updateConfiguration('learning_parameters', learningParams as unknown as Record<string, unknown>),
        updateConfiguration('decision_limits', decisionLimits as unknown as Record<string, unknown>),
        updateConfiguration('autonomy_level', autonomyLevel as unknown as Record<string, unknown>),
        updateConfiguration('notification_settings', notifications as unknown as Record<string, unknown>)
      ]);
      setHasChanges(false);
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações da IA foram atualizadas"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfidenceThresholds({ high: 85, medium: 60, auto_approve: 90 });
    setLearningParams({ learning_rate: 0.1, decay_factor: 0.95, min_samples: 10 });
    setDecisionLimits({ max_pending: 50, max_auto_per_hour: 10, cooldown_minutes: 5 });
    setAutonomyLevel({ level: 'supervised', allowed_types: ['optimization', 'prevention'] });
    setNotifications({ sound_enabled: true, browser_notifications: true, critical_only: false });
    setHasChanges(true);
  };

  const toggleAllowedType = (type: string) => {
    setAutonomyLevel(prev => ({
      ...prev,
      allowed_types: prev.allowed_types.includes(type)
        ? prev.allowed_types.filter(t => t !== type)
        : [...prev.allowed_types, type]
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Configurações da IA</h2>
            <p className="text-sm text-muted-foreground">Ajuste os parâmetros de decisão e aprendizado</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSaveAll} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Tudo'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Thresholds */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-purple-400" />
              Thresholds de Confiança
            </CardTitle>
            <CardDescription>
              Defina os limites de confiança para classificação de decisões
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Confiança Alta</Label>
                <Badge variant="outline" className="bg-green-500/10 text-green-400">
                  {confidenceThresholds.high}%
                </Badge>
              </div>
              <Slider
                value={[confidenceThresholds.high]}
                onValueChange={([value]) => {
                  setConfidenceThresholds(prev => ({ ...prev, high: value }));
                  setHasChanges(true);
                }}
                min={50}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Confiança Média</Label>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">
                  {confidenceThresholds.medium}%
                </Badge>
              </div>
              <Slider
                value={[confidenceThresholds.medium]}
                onValueChange={([value]) => {
                  setConfidenceThresholds(prev => ({ ...prev, medium: value }));
                  setHasChanges(true);
                }}
                min={30}
                max={80}
                step={5}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Auto-Aprovação
                </Label>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                  {confidenceThresholds.auto_approve}%
                </Badge>
              </div>
              <Slider
                value={[confidenceThresholds.auto_approve]}
                onValueChange={([value]) => {
                  setConfidenceThresholds(prev => ({ ...prev, auto_approve: value }));
                  setHasChanges(true);
                }}
                min={80}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Decisões com confiança acima deste valor serão aprovadas automaticamente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Autonomy Level */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-blue-400" />
              Nível de Autonomia
            </CardTitle>
            <CardDescription>
              Configure o grau de independência da IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {(['manual', 'supervised', 'autonomous'] as const).map((level) => (
                <Button
                  key={level}
                  variant={autonomyLevel.level === level ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    setAutonomyLevel(prev => ({ ...prev, level }));
                    setHasChanges(true);
                  }}
                >
                  {level === 'manual' ? 'Manual' : level === 'supervised' ? 'Supervisionado' : 'Autônomo'}
                </Button>
              ))}
            </div>

            {autonomyLevel.level === 'autonomous' && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <p className="text-xs text-yellow-400">
                  Modo autônomo: a IA executará decisões sem aprovação humana
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <Label>Tipos de Decisão Permitidos</Label>
              <div className="flex flex-wrap gap-2">
                {['optimization', 'correction', 'prevention', 'automation'].map((type) => (
                  <Badge
                    key={type}
                    variant={autonomyLevel.allowed_types.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAllowedType(type)}
                  >
                    {type === 'optimization' ? 'Otimização' :
                     type === 'correction' ? 'Correção' :
                     type === 'prevention' ? 'Prevenção' : 'Automação'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Parameters */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-green-400" />
              Parâmetros de Aprendizado
            </CardTitle>
            <CardDescription>
              Ajuste como a IA aprende com o feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Taxa de Aprendizado</Label>
                <Badge variant="outline">{learningParams.learning_rate.toFixed(2)}</Badge>
              </div>
              <Slider
                value={[learningParams.learning_rate * 100]}
                onValueChange={([value]) => {
                  setLearningParams(prev => ({ ...prev, learning_rate: value / 100 }));
                  setHasChanges(true);
                }}
                min={1}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Fator de Decaimento</Label>
                <Badge variant="outline">{learningParams.decay_factor.toFixed(2)}</Badge>
              </div>
              <Slider
                value={[learningParams.decay_factor * 100]}
                onValueChange={([value]) => {
                  setLearningParams(prev => ({ ...prev, decay_factor: value / 100 }));
                  setHasChanges(true);
                }}
                min={80}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Amostras Mínimas</Label>
                <Badge variant="outline">{learningParams.min_samples}</Badge>
              </div>
              <Slider
                value={[learningParams.min_samples]}
                onValueChange={([value]) => {
                  setLearningParams(prev => ({ ...prev, min_samples: value }));
                  setHasChanges(true);
                }}
                min={5}
                max={50}
                step={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-orange-400" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure alertas para decisões da IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Som de Alerta</Label>
                <p className="text-xs text-muted-foreground">Tocar som para novas decisões</p>
              </div>
              <Switch
                checked={notifications.sound_enabled}
                onCheckedChange={(checked) => {
                  setNotifications(prev => ({ ...prev, sound_enabled: checked }));
                  setHasChanges(true);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações do Browser</Label>
                <p className="text-xs text-muted-foreground">Mostrar notificações push</p>
              </div>
              <Switch
                checked={notifications.browser_notifications}
                onCheckedChange={(checked) => {
                  setNotifications(prev => ({ ...prev, browser_notifications: checked }));
                  setHasChanges(true);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Apenas Críticos</Label>
                <p className="text-xs text-muted-foreground">Notificar só decisões de alto impacto</p>
              </div>
              <Switch
                checked={notifications.critical_only}
                onCheckedChange={(checked) => {
                  setNotifications(prev => ({ ...prev, critical_only: checked }));
                  setHasChanges(true);
                }}
              />
            </div>

            {/* Decision Limits */}
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Máx. Pendentes</Label>
                <Badge variant="outline">{decisionLimits.max_pending}</Badge>
              </div>
              <Slider
                value={[decisionLimits.max_pending]}
                onValueChange={([value]) => {
                  setDecisionLimits(prev => ({ ...prev, max_pending: value }));
                  setHasChanges(true);
                }}
                min={10}
                max={100}
                step={10}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Auto/Hora</Label>
                <Badge variant="outline">{decisionLimits.max_auto_per_hour}</Badge>
              </div>
              <Slider
                value={[decisionLimits.max_auto_per_hour]}
                onValueChange={([value]) => {
                  setDecisionLimits(prev => ({ ...prev, max_auto_per_hour: value }));
                  setHasChanges(true);
                }}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
