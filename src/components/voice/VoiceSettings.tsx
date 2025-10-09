import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Volume2, Mic, Settings } from "lucide-react";

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose }) => {
  const [autoListen, setAutoListen] = useState(true);
  const [volume, setVolume] = useState([0.8]);
  const [sensitivity, setSensitivity] = useState([0.5]);
  const [voice, setVoice] = useState("alloy");
  const [language, setLanguage] = useState("pt-BR");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-card border-border shadow-xl">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">Configurações de Voz</h3>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="space-y-6">
            {/* Auto Listen */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Escuta Automática</Label>
                <div className="text-sm text-muted-foreground">
                  Detectar automaticamente quando você fala
                </div>
              </div>
              <Switch 
                checked={autoListen} 
                onCheckedChange={setAutoListen}
              />
            </div>

            <Separator />

            {/* Volume */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <Label className="text-card-foreground">Volume da Resposta</Label>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-right">
                {Math.round(volume[0] * 100)}%
              </div>
            </div>

            <Separator />

            {/* Sensitivity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <Label className="text-card-foreground">Sensibilidade do Microfone</Label>
              </div>
              <Slider
                value={sensitivity}
                onValueChange={setSensitivity}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-right">
                {Math.round(sensitivity[0] * 100)}%
              </div>
            </div>

            <Separator />

            {/* Voice Selection */}
            <div className="space-y-3">
              <Label className="text-card-foreground">Voz do Assistente</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy (Neutro)</SelectItem>
                  <SelectItem value="echo">Echo (Masculino)</SelectItem>
                  <SelectItem value="fable">Fable (Feminino)</SelectItem>
                  <SelectItem value="onyx">Onyx (Profundo)</SelectItem>
                  <SelectItem value="nova">Nova (Jovem)</SelectItem>
                  <SelectItem value="shimmer">Shimmer (Suave)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-card-foreground">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} className="flex-1">
              Salvar Configurações
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VoiceSettings;