import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Save, 
  RefreshCw, 
  Zap,
  MessageSquare,
  Settings
} from 'lucide-react';

interface PersonalitySettings {
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  responseLength: 'concise' | 'balanced' | 'detailed';
  expertise: string[];
  customInstructions: string;
  contextAwareness: boolean;
  proactiveHelp: boolean;
}

interface VoicePersonalityProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PersonalitySettings) => void;
  currentSettings: PersonalitySettings;
}

const expertiseOptions = [
  'Recursos Humanos',
  'Viagens Corporativas', 
  'Análise de Dados',
  'Gestão de Projetos',
  'Finanças',
  'Tecnologia',
  'Marketing',
  'Operações'
];

const VoicePersonality: React.FC<VoicePersonalityProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<PersonalitySettings>(currentSettings);

  const handleExpertiseToggle = (expertise: string) => {
    setSettings(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const resetToDefaults = () => {
    setSettings({
      tone: 'friendly',
      responseLength: 'balanced',
      expertise: ['Recursos Humanos', 'Viagens Corporativas'],
      customInstructions: '',
      contextAwareness: true,
      proactiveHelp: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Personalidade do Assistente</h3>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="space-y-6">
          {/* Tone Settings */}
          <div className="space-y-3">
            <Label>Tom de Comunicação</Label>
            <Select value={settings.tone} onValueChange={(value) => setSettings(prev => ({ ...prev, tone: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal - Protocolar e respeitoso</SelectItem>
                <SelectItem value="professional">Profissional - Direto e eficiente</SelectItem>
                <SelectItem value="friendly">Amigável - Caloroso e acessível</SelectItem>
                <SelectItem value="casual">Casual - Descontraído e informal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Length */}
          <div className="space-y-3">
            <Label>Estilo de Resposta</Label>
            <Select value={settings.responseLength} onValueChange={(value) => setSettings(prev => ({ ...prev, responseLength: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Conciso - Respostas diretas e objetivas</SelectItem>
                <SelectItem value="balanced">Equilibrado - Informativo mas acessível</SelectItem>
                <SelectItem value="detailed">Detalhado - Explicações completas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expertise Areas */}
          <div className="space-y-3">
            <Label>Áreas de Especialização</Label>
            <div className="grid grid-cols-2 gap-2">
              {expertiseOptions.map((expertise) => (
                <div
                  key={expertise}
                  onClick={() => handleExpertiseToggle(expertise)}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant={settings.expertise.includes(expertise) ? "default" : "outline"}
                    className="w-full justify-center py-2 hover:bg-primary/10"
                  >
                    {expertise}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-3">
            <Label>Instruções Personalizadas</Label>
            <Textarea
              placeholder="Ex: Sempre mencione políticas da empresa ao falar sobre RH, priorize sugestões sustentáveis para viagens..."
              value={settings.customInstructions}
              onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Configurações Avançadas</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Consciência Contextual</Label>
                <div className="text-sm text-muted-foreground">
                  Lembrar do contexto da conversa e histórico
                </div>
              </div>
              <Switch 
                checked={settings.contextAwareness}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, contextAwareness: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ajuda Proativa</Label>
                <div className="text-sm text-muted-foreground">
                  Sugerir ações e oferecer ajuda antecipada
                </div>
              </div>
              <Switch 
                checked={settings.proactiveHelp}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, proactiveHelp: checked }))}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Preview da Personalidade</span>
            </div>
            <div className="text-sm">
              <strong>Tom:</strong> {settings.tone === 'formal' ? 'Formal e respeitoso' : settings.tone === 'professional' ? 'Profissional' : settings.tone === 'friendly' ? 'Amigável' : 'Casual'}
              <br />
              <strong>Especialidades:</strong> {settings.expertise.join(', ') || 'Nenhuma selecionada'}
              <br />
              <strong>Estilo:</strong> Respostas {settings.responseLength === 'concise' ? 'concisas' : settings.responseLength === 'balanced' ? 'equilibradas' : 'detalhadas'}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={resetToDefaults} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Salvar Personalidade
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VoicePersonality;